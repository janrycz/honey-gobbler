import { Miniflare } from 'miniflare';
import { readFileSync } from 'fs';
import { createHmac } from 'crypto';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const SECRET = 'test-secret-123', T5 = '/home/claude/work/t5/';
const mf = new Miniflare({ modules: true, scriptPath: 'src/index.js', d1Databases: { DB: 'lb' }, compatibilityDate: '2025-06-01' });
const db = await mf.getD1Database('DB');
for (const stmt of readFileSync('/home/claude/honey-gobbler/leaderboard/schema.sql', 'utf8').replace(/--.*$/gm, '').split(';').map(s => s.trim()).filter(Boolean)) await db.prepare(stmt).run();
await db.prepare('INSERT INTO config (k, v) VALUES (?, ?)').bind('shopify_secret', SECRET).run();
const tok = (cid, ts = Math.floor(Date.now() / 1000)) => cid + '.' + ts + '.' + createHmac('sha256', SECRET).update(cid + '.' + ts).digest('hex');
const html = readFileSync(T5 + (process.env.PAGE || 'page.html'), 'utf8');
const out = []; const ok = (n, c, x) => out.push((c ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? '  ' + JSON.stringify(x) : ''));
const posted = [], visits = [];
const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
async function open(lb, pending) {
  const ctx = await b.newContext({ viewport: { width: 1100, height: 760 } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const page = html.replace('<script>\n(() => {', '<script>window.HG_LB = ' + JSON.stringify(lb) + ';</script>\n<script>\n(() => {');
  if (page === html) throw new Error('inject point not found');
  await ctx.route('https://lb.test/**', async route => {
    const q = route.request();
    const r = await mf.dispatchFetch(q.url().replace('https://lb.test', 'http://x'), { method: q.method(), headers: { 'Content-Type': 'application/json', Origin: 'https://www.janhoney.com' }, body: q.method() === 'POST' ? q.postData() : undefined });
    const h = {}; r.headers.forEach((v, k) => { h[k] = v; });
    await route.fulfill({ status: r.status, headers: h, body: await r.text() });
  });
  await ctx.route('https://www.janhoney.com/**', async route => {
    const q = route.request(), u = new URL(q.url());
    if (u.pathname === '/pages/game') return route.fulfill({ status: 200, contentType: 'text/html', body: page });
    if (u.pathname === '/contact') { posted.push(q.postData()); return route.fulfill({ status: 200, contentType: 'text/html', body: 'ok' }); }
    visits.push(u.pathname + u.search); return route.fulfill({ status: 200, contentType: 'text/html', body: 'login page' });
  });
  await ctx.route('https://fonts.**', r => r.abort());
  if (pending) await ctx.addInitScript(p => { try { localStorage.setItem('honey-gobbler-lb-pending', p); } catch (e) {} }, JSON.stringify(pending));
  await p.goto('https://www.janhoney.com/pages/game#debug'); await p.waitForTimeout(700);
  return { p, ctx, errs };
}
const wait = ms => new Promise(r => setTimeout(r, ms));
const txt = (p, id) => p.evaluate(id => { const e = document.getElementById(id); return e.hidden ? '(hidden)' : e.textContent; }, id);

// 1. logged out
{
  const { p, ctx, errs } = await open({ api: 'https://lb.test', token: null });
  ok('logged out: start line asks to log in', /Log in/.test(await txt(p, 'lbStartLine')), await txt(p, 'lbStartLine'));
  ok('leaderboard buttons shown', await p.evaluate(() => [...document.querySelectorAll('[data-lb]')].every(e => !e.hidden)));
  await p.evaluate(() => document.querySelector('#startScreen [data-lb]').click()); await wait(400);
  ok('board opens, empty', /No one yet/.test(await txt(p, 'lbList')), await txt(p, 'lbList'));
  ok('login button in board', !(await p.evaluate(() => document.getElementById('lbLogin').hidden)));
  await p.evaluate(() => document.getElementById('lbClose').click());
  ok('back to start', await p.evaluate(() => !document.getElementById('startScreen').hidden));
  // a finished story run while logged out: the sold screen offers to log in and keeps the score
  await p.evaluate(() => document.getElementById('startBtn').click()); await wait(400);
  await p.waitForFunction(() => __hg.lb().run && __hg.lb().run.ticket); const tk = await p.evaluate(() => __hg.lb().run.ticket);
  await db.prepare('UPDATE runs SET created = created - 4000 WHERE id = ?').bind(tk).run();
  await p.evaluate(() => { __hg.freeze(true); __hg.jump(8); __hg.setElapsed(912.3); __hg.step(200); __hg.hurtBoss(99999); __hg.step(400); });
  ok('won', (await p.evaluate(() => __hg.get().state)) === 'won');
  ok('sold line asks to log in', /Log in to put your/.test(await txt(p, 'lbSold')), await txt(p, 'lbSold'));
  await p.evaluate(() => document.querySelector('#lbSold [data-lblogin]').click()); await wait(500);
  ok('went to login with return_to', visits.some(v => v === '/customer_authentication/login?return_to=%2Fpages%2Fgame'), visits);
  ok('no errors (logged out)', errs.length === 0, errs);
  await ctx.close();
}
// 2. after logging in: the pending score waits for a name, then goes up
const A = tok('111');
{
  const pend = { entry: { board: 'speed', value: 912.3, tie: 0, stats: { played: 912, bosses: 8, endlessFights: 0, crazyFights: 0 }, ticket: (await db.prepare('SELECT id FROM runs').first()).id }, at: Date.now() };
  const { p, ctx, errs } = await open({ api: 'https://lb.test', token: A, email: 'jan@example.com', first: 'Jan', last: 'R' }, pend);
  await wait(500);
  ok('start line asks for a name, mentions pending', /Pick a name to put your/.test(await txt(p, 'lbStartLine')), await txt(p, 'lbStartLine'));
  await p.evaluate(() => document.querySelector('#lbStartLine [data-lbname]').click()); await wait(300);
  ok('name form shown', await p.evaluate(() => !document.getElementById('lbNameForm').hidden));
  await p.fill('#lbName', 'Sh1t head'); await p.click('#lbSave'); await wait(400);
  ok('rude name refused', /different name/.test(await txt(p, 'lbErr')), await txt(p, 'lbErr'));
  await p.fill('#lbName', 'Jan'); await p.check('#lbWait'); await p.click('#lbSave'); await wait(800);
  console.log('TOAST', await p.evaluate(() => document.getElementById('toast').innerHTML));
  ok('name saved, form gone', await p.evaluate(() => document.getElementById('lbNameForm').hidden));
  ok('waitlist posted', posted.length === 1 && /waitlist/.test(posted[0]) && /jan%40example.com|jan@example.com/.test(posted[0]), posted);
  ok('pending score submitted', !!(await db.prepare("SELECT value FROM scores WHERE board = 'speed' AND cid = '111'").first()));
  ok('pending cleared', await p.evaluate(() => localStorage.getItem('honey-gobbler-lb-pending') === null));
  ok('board shows me', /Jan/.test(await txt(p, 'lbList')) && /You are Jan/.test(await txt(p, 'lbMe')), [await txt(p, 'lbList'), await txt(p, 'lbMe')]);
  await p.evaluate(() => document.querySelector('.lbtabs [data-board=speed]').click()); await wait(400);
  ok('speed tab lists 15:12', /15:12/.test(await txt(p, 'lbList')), await txt(p, 'lbList'));
  await p.evaluate(() => document.getElementById('lbClose').click());
  // 3. a logged-in run: speed at the sold screen, endless saved each round, crazy by the half rule, game over line
  await p.evaluate(() => document.getElementById('startBtn').click()); await wait(400);
  await p.waitForFunction(() => __hg.lb().run && __hg.lb().run.ticket); const tk = await p.evaluate(() => __hg.lb().run.ticket);
  await db.prepare('UPDATE runs SET created = created - 6000 WHERE id = ?').bind(tk).run();
  await p.evaluate(() => { __hg.freeze(true); __hg.jump(8); __hg.setElapsed(850); __hg.step(200); __hg.hurtBoss(99999); __hg.step(400); }); await wait(1200);
  console.log('DBG', await p.evaluate(() => JSON.stringify({ st: __hg.get().state, lb: __hg.lb(), sold: document.getElementById('lbSold').outerHTML, scr: document.getElementById('soldScreen').hidden })));
  ok('sold line: new best', /Speedrun: #1 with 14:1\d\. Your best yet/.test(await txt(p, 'lbSold')), await txt(p, 'lbSold'));
  await p.evaluate(() => document.getElementById('endlessBtn').click()); await wait(200);
  await p.evaluate(() => { __hg.freeze(true); __hg.endlessBoss(2); __hg.step(200); __hg.hurtBoss(99999); __hg.step(400); }); await wait(600);
  const e1 = await db.prepare("SELECT value, tie FROM scores WHERE board = 'endless' AND cid = '111'").first();
  ok('endless saved after the round', e1 && e1.value === 2, e1);
  await p.evaluate(() => { document.getElementById('shedDone').click(); __hg.lbSetFights(2, 2); __hg.endlessBoss(4); __hg.step(200); __hg.hurtBoss(99999); __hg.step(400); }); await wait(600);
  const c1 = await db.prepare("SELECT value FROM scores WHERE board = 'crazy' AND cid = '111'").first();
  ok('crazy board when more than half were crazy', c1 && c1.value === 3, [c1, await p.evaluate(() => __hg.runStats())]);
  await p.evaluate(() => { document.getElementById('shedDone').click(); __hg.step(30); __hg.kill(); }); await wait(600);
  ok('game over line', /Crazy mode: your best is still round 3, #1|Crazy mode: #1 with round 3/.test(await txt(p, 'lbOver')), await txt(p, 'lbOver'));
  await p.evaluate(() => document.querySelector('#overScreen [data-lb]').click()); await wait(300);
  await p.evaluate(() => document.querySelector('.lbtabs [data-board=crazy]').click()); await wait(400);
  ok('crazy tab', /Round 3/.test(await txt(p, 'lbList')), await txt(p, 'lbList'));
  await p.keyboard.press('Escape'); await wait(100);
  ok('Escape closes back to the over screen', await p.evaluate(() => document.getElementById('lbScreen').hidden && !document.getElementById('overScreen').hidden));
  await p.screenshot({ path: T5 + 'x18-over.png' });
  await p.evaluate(() => document.querySelector('#overScreen [data-lb]').click()); await wait(500);
  await p.screenshot({ path: T5 + 'x18-board.png' });
  ok('no errors (logged in)', errs.length === 0, errs);
  await wait(4000); // the save to the account goes out a few seconds after the last change
  await ctx.close();
}
// 5. achievements follow the account to a fresh browser
{
  const row = await db.prepare("SELECT data FROM saves WHERE cid = '111'").first();
  const saved = row ? JSON.parse(row.data) : null;
  ok('achievements saved to the account', saved && saved.done && saved.done.real && saved.done.sold, saved && Object.keys(saved.done));
  const { p, ctx, errs } = await open({ api: 'https://lb.test', token: tok('111'), email: 'jan@example.com' });
  await wait(1200);
  const a = await p.evaluate(() => __hg.ach().done);
  ok('fresh browser gets them back', a.real && a.sold, Object.keys(a));
  ok('achievements screen says account', /account/.test(await p.evaluate(() => document.getElementById('achWhere').textContent)));
  ok('no errors (sync)', errs.length === 0, errs);
  await ctx.close();
}
// 6. no name yet: a story win and an endless round both wait, and both go up once a name is picked
{
  const { p, ctx, errs } = await open({ api: 'https://lb.test', token: tok('333'), email: 'd@example.com' });
  await wait(600);
  await p.evaluate(() => document.getElementById('startBtn').click());
  await p.waitForFunction(() => __hg.lb().run && __hg.lb().run.ticket); const tk = await p.evaluate(() => __hg.lb().run.ticket);
  await db.prepare('UPDATE runs SET created = created - 6000 WHERE id = ?').bind(tk).run();
  await p.evaluate(() => { __hg.freeze(true); __hg.jump(8); __hg.setElapsed(900); __hg.step(200); __hg.hurtBoss(99999); __hg.step(400); }); await wait(800);
  await p.evaluate(() => { document.getElementById('endlessBtn').click(); __hg.endlessBoss(2); __hg.step(200); __hg.hurtBoss(99999); __hg.step(400); }); await wait(800);
  const held = await p.evaluate(() => Object.keys((JSON.parse(localStorage.getItem('honey-gobbler-lb-pending') || '{}').entries) || {}));
  ok('both scores held while there is no name', held.includes('speed') && held.includes('endless'), held);
  await p.evaluate(() => { document.getElementById('shedDone').click(); __hg.pause(); document.querySelector('#pauseScreen [data-lb]').click(); }); await wait(500);
  await p.fill('#lbName', 'Daddy2'); await p.click('#lbSave'); await wait(1500);
  const rows = await db.prepare("SELECT board FROM scores WHERE cid = '333' ORDER BY board").all();
  ok('both went up after the name', rows.results.map(r => r.board).join(',') === 'endless,speed', rows.results);
  ok('no errors (held scores)', errs.length === 0, errs);
  await ctx.close();
}
// 4. the artifact: no HG_LB, nothing shows
{
  const ctx = await b.newContext(); const p = await ctx.newPage();
  await p.goto('file://' + T5 + (process.env.PAGE || 'page.html') + '#debug'); await p.waitForTimeout(400);
  ok('artifact: no leaderboard buttons', await p.evaluate(() => [...document.querySelectorAll('[data-lb]')].every(e => e.hidden) && document.getElementById('lbStartLine').hidden));
  await ctx.close();
}
console.log(out.join('\n'));
await b.close(); await mf.dispose();
