// Honey Gobbler leaderboard: a Cloudflare Worker with a D1 database.
//
// Who you are comes from Shopify: when a customer is logged in, the game page (Liquid) signs "customerId.unixTime"
// with a secret that only Shopify and this Worker know. So nobody can post a score under someone else's account.
//
// Boards: endless (highest round, kg breaks ties), speed (fastest win against every boss), crazy (highest round, for runs
// where at least half of the rounds were crazy mode, or the last quarter of them were and that's 3 or more; the round you
// end in counts. Older games sent only fight counts: for them it's more than half of the endless fights). One entry per customer per board; only the best counts.
//
// Every run asks for a ticket when it starts. A score has to come with a ticket, and the time since the ticket was issued
// has to be long enough for the score. That stops casual cheating; anything that slips through can be hidden by hand.

const BOARDS = {
  endless: { desc: true },
  crazy: { desc: true },
  speed: { desc: false },
};
const ORIGINS = ['https://www.janhoney.com', 'https://janhoney.com'];
const STORY_BOSSES = 8; // the fewest bosses a finished story can have (older games had 8)
const MAX_STORY = 9; // the most (the honey bound uses this)
const TOKEN_DAYS = 7;
const TICKET_DAYS = 4;
const BANNED = ['fuck', 'shit', 'cunt', 'nigg', 'nigr', 'faggot', 'bitch', 'whore', 'slut', 'rapist', 'nazi', 'hitler', 'porn', 'penis',
  'vagina', 'pussy', 'kurwa', 'chuj', 'pizd', 'jeba', 'dziwk', 'pedo', 'retard']; // checked inside names, so no short words that hide in real ones

class Bad extends Error {
  constructor(code, message, status = 400) { super(message); this.code = code; this.status = status; }
}
const bad = (code, message, status) => new Bad(code, message, status);
const enc = s => new TextEncoder().encode(s);
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const now = () => Math.floor(Date.now() / 1000);

export default {
  async fetch(req, env) {
    const url = new URL(req.url), origin = req.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ORIGINS.includes(origin) ? origin : ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
    const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    try {
      if (req.method === 'GET' && url.pathname === '/api/top') return json(await top(env, url.searchParams.get('board'), url.searchParams.get('limit')));
      if (req.method === 'GET' && url.pathname === '/') return json({ ok: true, name: 'Honey Gobbler leaderboard' });
      if (req.method !== 'POST') return json({ error: 'not_found' }, 404);
      const body = await req.json().catch(() => ({}));
      if (url.pathname === '/api/start') return json(await start(env, req));
      if (url.pathname === '/api/me') return json(await me(env, body));
      if (url.pathname === '/api/name') return json(await setName(env, body));
      if (url.pathname === '/api/submit') return json(await submit(env, body));
      if (url.pathname === '/api/sync') return json(await sync(env, body));
      return json({ error: 'not_found' }, 404);
    } catch (e) {
      if (e instanceof Bad) return json({ error: e.code, message: e.message }, e.status);
      console.log('error', e && e.stack || e);
      return json({ error: 'server', message: 'Something went wrong. Try again in a minute.' }, 500);
    }
  },
};

async function cfg(env, k) {
  const row = await env.DB.prepare('SELECT v FROM config WHERE k = ?').bind(k).first();
  if (!row) throw new Error('missing config ' + k);
  return row.v;
}

async function hmacHex(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, enc(msg)));
}

function same(a, b) { // compare without leaking how much matched
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

async function customer(env, token) {
  const m = /^(\d{1,20})\.(\d{9,11})\.([0-9a-f]{64})$/.exec(String(token || ''));
  if (!m) throw bad('login', 'Log in to use the leaderboard.', 401);
  const [, cid, ts, sig] = m, t = now();
  if (+ts > t + 300 || t - +ts > TOKEN_DAYS * 86400) throw bad('login', 'Your login has expired. Reload the page.', 401);
  const want = await hmacHex(await cfg(env, 'shopify_secret'), cid + '.' + ts);
  if (!same(want, sig)) throw bad('login', 'Log in to use the leaderboard.', 401);
  return cid;
}

async function start(env, req) {
  const t = now();
  const ip = await hmacHex(await cfg(env, 'shopify_secret'), 'ip:' + (req.headers.get('CF-Connecting-IP') || '')); // only a scrambled IP is kept, to slow down spam
  const recent = await env.DB.prepare('SELECT COUNT(*) AS n FROM runs WHERE ip = ? AND created > ?').bind(ip.slice(0, 32), t - 3600).first();
  if (recent && recent.n >= 60) throw bad('busy', 'Too many runs started from here. Try again later.', 429);
  const id = crypto.randomUUID();
  await env.DB.prepare('INSERT INTO runs (id, created, ip) VALUES (?, ?, ?)').bind(id, t, ip.slice(0, 32)).run();
  if (Math.random() < 0.02) await env.DB.prepare('DELETE FROM runs WHERE created < ?').bind(t - TICKET_DAYS * 86400).run();
  return { ticket: id, at: t };
}

// Achievements and records follow the account: each device sends what it has, the server keeps the union
// (an achievement unlocked anywhere stays unlocked, counters keep their highest value) and sends the result back.
const KEY = /^[A-Za-z0-9_]{1,32}$/;
function cleanSave(d) {
  const out = { done: {}, stats: {}, best: {} };
  if (!d || typeof d !== 'object') return out;
  for (const [k, v] of Object.entries(d.done || {}).slice(0, 200)) if (KEY.test(k) && Number.isFinite(+v) && +v > 0) out.done[k] = Math.floor(+v);
  for (const [k, v] of Object.entries(d.stats || {}).slice(0, 200)) if (KEY.test(k) && Number.isFinite(+v) && +v >= 0) out.stats[k] = Math.min(+v, 1e12);
  for (const k of ['kg', 'time', 'endless', 'brawl']) { const v = +((d.best || {})[k]); if (Number.isFinite(v) && v > 0) out.best[k] = Math.min(v, 1e9); }
  return out;
}
function mergeSave(a, b) {
  const m = { done: { ...a.done }, stats: { ...a.stats }, best: { ...a.best } };
  for (const [k, v] of Object.entries(b.done)) m.done[k] = m.done[k] ? Math.min(m.done[k], v) : v; // keeps the first time it was unlocked
  for (const [k, v] of Object.entries(b.stats)) m.stats[k] = Math.max(m.stats[k] || 0, v);
  for (const [k, v] of Object.entries(b.best)) m.best[k] = k === 'time' || k === 'brawl' ? (m.best[k] ? Math.min(m.best[k], v) : v) : Math.max(m.best[k] || 0, v); // fastest times, biggest kg
  return m;
}
async function sync(env, b) {
  const cid = await customer(env, b.token);
  const row = await env.DB.prepare('SELECT data FROM saves WHERE cid = ?').bind(cid).first();
  let have = cleanSave(null);
  if (row) try { have = cleanSave(JSON.parse(row.data)); } catch (e) {}
  const merged = mergeSave(have, cleanSave(b.data));
  const text = JSON.stringify(merged);
  if (text.length > 32000) throw bad('size', 'That save is too big.');
  if (!row || row.data !== text) await env.DB.prepare('INSERT INTO saves (cid, data, updated) VALUES (?, ?, ?) ON CONFLICT(cid) DO UPDATE SET data = excluded.data, updated = excluded.updated').bind(cid, text, now()).run();
  return merged;
}

const better = (board, a, b) => BOARDS[board].desc ? (a.value > b.value || (a.value === b.value && a.tie > b.tie)) : a.value < b.value;

async function rankOf(env, board, row) {
  const q = BOARDS[board].desc
    ? 'SELECT COUNT(*) AS n FROM scores s JOIN players p ON p.cid = s.cid WHERE s.board = ? AND p.hidden = 0 AND (s.value > ? OR (s.value = ? AND s.tie > ?))'
    : 'SELECT COUNT(*) AS n FROM scores s JOIN players p ON p.cid = s.cid WHERE s.board = ? AND p.hidden = 0 AND s.value < ?';
  const r = BOARDS[board].desc ? await env.DB.prepare(q).bind(board, row.value, row.value, row.tie).first() : await env.DB.prepare(q).bind(board, row.value).first();
  return (r ? r.n : 0) + 1;
}

async function top(env, board, limit) {
  if (!BOARDS[board]) throw bad('board', 'Unknown board.');
  const n = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
  const order = BOARDS[board].desc ? 's.value DESC, s.tie DESC, s.at ASC' : 's.value ASC, s.at ASC';
  const { results } = await env.DB.prepare(`SELECT p.name, s.value, s.tie FROM scores s JOIN players p ON p.cid = s.cid WHERE s.board = ? AND p.hidden = 0 ORDER BY ${order} LIMIT ?`).bind(board, n).all();
  return { board, rows: results.map((r, i) => ({ rank: i + 1, name: r.name, value: r.value, tie: r.tie })) };
}

async function me(env, b) {
  const cid = await customer(env, b.token);
  const p = await env.DB.prepare('SELECT name, hidden FROM players WHERE cid = ?').bind(cid).first();
  const bests = {};
  const { results } = await env.DB.prepare('SELECT board, value, tie FROM scores WHERE cid = ?').bind(cid).all();
  for (const r of results) bests[r.board] = { value: r.value, tie: r.tie, rank: p && !p.hidden ? await rankOf(env, r.board, r) : null };
  return { name: p ? p.name : null, bests };
}

function cleanName(raw) {
  const name = String(raw || '').normalize('NFC').replace(/\s+/g, ' ').trim();
  if (name.length < 2 || name.length > 16) throw bad('name', 'Names are 2 to 16 characters.');
  if (!/^[\p{L}\p{N} _.'-]+$/u.test(name)) throw bad('name', 'Use letters, numbers, spaces and . _ - only.');
  const flat = name.toLowerCase().normalize('NFD').replace(/[0134578@$]/g, c => ({ 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', 8: 'b', '@': 'a', $: 's' }[c])).replace(/[^a-z]/g, '');
  if (BANNED.some(w => flat.includes(w))) throw bad('name', 'Pick a different name.');
  return name;
}

async function setName(env, b) {
  const cid = await customer(env, b.token), name = cleanName(b.name), lc = name.toLowerCase(), t = now();
  const taken = await env.DB.prepare('SELECT cid FROM players WHERE name_lc = ? AND cid != ?').bind(lc, cid).first();
  if (taken) throw bad('name', 'Someone already has that name.');
  await env.DB.prepare('INSERT INTO players (cid, name, name_lc, hidden, created, updated) VALUES (?, ?, ?, 0, ?, ?) ON CONFLICT(cid) DO UPDATE SET name = excluded.name, name_lc = excluded.name_lc, updated = excluded.updated')
    .bind(cid, name, lc, t, t).run();
  return { name };
}

async function submit(env, b) {
  const cid = await customer(env, b.token), board = String(b.board || '');
  if (!BOARDS[board]) throw bad('board', 'Unknown board.');
  const player = await env.DB.prepare('SELECT name FROM players WHERE cid = ?').bind(cid).first();
  if (!player) throw bad('name', 'Pick a name first.');
  const run = await env.DB.prepare('SELECT created FROM runs WHERE id = ?').bind(String(b.ticket || '')).first();
  if (!run) throw bad('ticket', "This run can't go on the leaderboard: it wasn't registered when it started (were you offline?).");
  const t = now(), real = t - run.created;
  if (real > TICKET_DAYS * 86400) throw bad('ticket', 'This run is too old to submit.');
  const s = b.stats || {}, value = Number(b.value), tie = Number(b.tie) || 0, played = Number(s.played) || 0;
  const bosses = s.bosses | 0, ef = s.endlessFights | 0, cf = s.crazyFights | 0;
  const no = msg => { throw bad('check', msg); };
  if (![value, tie, played].every(Number.isFinite) || value <= 0) no("That score doesn't add up.");
  if (played > real + 20) no("That run took less real time than the game says it did.");
  if (board === 'speed') {
    if (bosses < STORY_BOSSES) no('Beat every boss first.');
    if (value < 300) no('That time is too fast to be real.');
    if (value > played + 5 || value > real + 20) no("That time doesn't match the run.");
  } else {
    const round = Math.floor(value);
    if (round !== value || round < 1 || round > 2000) no("That round doesn't add up.");
    if (bosses < STORY_BOSSES) no('Finish the story first.');
    if (ef < round - 1) no("That round doesn't match the fights in the run.");
    if (played < 300 + 20 * round) no('That round came too fast to be real.');
    if (tie > 150 * (MAX_STORY + round + 2) + 200) no('Too much honey for that round.');
    let crazy;
    if (s.crazyRounds !== undefined) {
      const cr = s.crazyRounds | 0, ct = s.crazyTail | 0;
      if (cr < 0 || ct < 0 || cr > round || ct > cr || cr > cf + 1) no("The crazy mode rounds don't add up.");
      crazy = cr >= Math.ceil(round / 2) || (ct >= 3 && ct >= Math.ceil(round / 4));
    } else crazy = cf * 2 > ef;
    if ((board === 'crazy') !== crazy) no(board === 'crazy' ? 'Not enough of the rounds were crazy mode, so this goes on Endless.' : 'Enough of the rounds were crazy mode, so this goes on Crazy mode.');
  }
  const row = { value, tie: board === 'speed' ? 0 : tie };
  const cur = await env.DB.prepare('SELECT value, tie FROM scores WHERE board = ? AND cid = ?').bind(board, cid).first();
  const improved = !cur || better(board, row, cur);
  if (improved) {
    await env.DB.prepare('INSERT INTO scores (board, cid, value, tie, run, at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(board, cid) DO UPDATE SET value = excluded.value, tie = excluded.tie, run = excluded.run, at = excluded.at')
      .bind(board, cid, row.value, row.tie, String(b.ticket), t).run();
  }
  const best = improved ? row : cur;
  return { board, improved, best, rank: await rankOf(env, board, best) };
}
