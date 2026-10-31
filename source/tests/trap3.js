const { chromium } = require('playwright');
const fs = require('fs');
// Focused escape test for attacks a simple "pick a spot and stay" plan can't beat. Same seeded attack, many plans:
//  - two-stage: slide to spot A, then at 1.0-3.0 s slide to spot B
//  - juke: run away from homing things; when cornered, dash past them while they're still above you
//  - the expert dodge bot
// A start counts as a trap only if every plan gets hit.
const out = __dirname, page = process.env.PAGE || 'page.html', mob = process.env.MOB === '1', round = +(process.env.ROUND || 0), seeds = +(process.env.SEEDS || 6);
const ALL = { 0: ['toss', 'susRain', 'feeder', 'syrupStorm'], 1: ['fees', 'vc', 'factorio', 'jobs', 'crow', 'ski', 'gifs', 'cnc', 'roblox', 'doubleFees'], 2: ['notify', 'sheets', 'bars', 'chess', 'knight', 'deenbuddy', 'fired', 'errors', 'checkmate'], 3: ['rope', 'prices', 'pushups', 'resin', 'drinks', 'ropeDouble'], 4: ['blend', 'volley', 'dilemma', 'dilemma2', 'axes', 'axeChop'], 5: ['hypergamy', 'needles', 'ratings', 'pills', 'liver', 'courseAd', 'chatFlood', 'bonesmash', 'subathon'], 6: ['barrage', 'hexagons', 'missingLink', 'quarks', 'fishLegs', 'bigbang', 'quarkStorm'] };
const ATKS = process.env.ATKS === 'all' ? Object.entries(ALL).flatMap(([i, l]) => l.map(a => [+i, a])) : (process.env.ATKS || '2:checkmate,4:dilemma2,6:quarks,6:quarkStorm').split(',').map(s => { const [i, a] = s.split(':'); return [+i, a]; });
const botSrc = fs.readFileSync(out + '/dodgebot.js', 'utf8');
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
  const ctx = await b.newContext(mob ? { viewport: { width: 375, height: 635 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: 1100, height: 760 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + out + '/' + page + '#debug'); await p.waitForTimeout(300);
  await p.addScriptTag({ content: botSrc });
  await p.evaluate(() => { document.getElementById('startBtn').click(); __hg.freeze(true); __hg.inv(true); });
  const rows = [];
  for (const [i, atk] of ATKS) {
    const r = await p.evaluate(({ i, atk, round, seeds }) => {
      const mul = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
      const realRandom = Math.random;
      if (round) { __hg.setSeen(i, round - 1); __hg.endlessBoss(i); } else __hg.jump(i);
      __hg.step(200);
      const W = __hg.sizes().W, speed = 2 * W / 60, spots = Array.from({ length: 11 }, (_, k) => 20 + (W - 40) * k / 10), spots2 = Array.from({ length: 7 }, (_, k) => 20 + (W - 40) * k / 6);
      const run = (seed, x0, bx, policy) => {
        __hg.clearProj(); __hg.clearItems(); __hg.unhurt(); __hg.bossAt(bx); __hg.hold(); __hg.spoonTo(x0);
        const g = __hg.get(); if (g.bosses[0].hp < g.bosses[0].max * 0.6) __hg.hurtBoss(-1000);
        const h0 = __hg.get().hits;
        Math.random = mul(seed);
        __hg.attack(atk); __hg.hold();
        let hit = false;
        for (let f = 0; f < 60 * 8; f++) {
          __hg.hold(); __hg.clearItems();
          if (policy === 'bot') { dodge(1, { speed: 5, replan: 1, margin: 1.4 }); }
          else if (policy.hybrid) { const tx = policy.hybrid(f / 60); if (tx === null) dodge(1, { speed: 5, replan: 1, margin: 1.4 }); else { const c = __hg.combo().sx; __hg.spoonTo(c + Math.max(-speed, Math.min(speed, tx - c))); __hg.step(1); } }
          else {
            const tx = policy(f / 60);
            if (tx !== null) { const c = __hg.combo().sx; __hg.spoonTo(c + Math.max(-speed, Math.min(speed, tx - c))); }
            __hg.step(1);
          }
          if (__hg.get().hits > h0) { hit = true; break; }
          if (f > 90 && __hg.get().proj === 0) break;
        }
        Math.random = realRandom;
        return hit;
      };
      // run from homing things; dash past them when there's no room left
      const juke = () => {
        let dash = 0;
        return t => {
          const T = __hg.threats(), sx = T.sx, sy = T.sy;
          const hs = T.proj.filter(q => (q.k === 'quarks' || q.k === 'call') && !q.harmless && q.delay <= 0);
          if (!hs.length) return null;
          const q = hs.reduce((a, c) => (Math.hypot(a.x - sx, a.y - sy) < Math.hypot(c.x - sx, c.y - sy) ? a : c));
          if (dash) return dash > 0 ? W - 20 : 20;
          const away = sx >= q.x ? 1 : -1, room = away > 0 ? W - sx : sx;
          const above = sy - q.y, hd = Math.abs(sx - q.x);
          if (room < 60 && hd < 220 && above > 40) { dash = -away; return dash > 0 ? W - 20 : 20; }
          return away > 0 ? W - 20 : 20;
        };
      };
      // walls: stand in the widest gap of the next row coming down at you
      const gapPol = () => t => {
        const T = __hg.threats(), sy = T.sy;
        const vis = T.proj.filter(q => !q.harmless && q.t >= q.delay && q.y < sy - 4);
        if (!vis.length) return null;
        const yMax = Math.max(...vis.map(q => q.y));
        const row = vis.filter(q => q.y > yMax - 24).map(q => q.x).sort((a, c) => a - c);
        if (row.length < 4) return null;
        const xs = [0].concat(row, [W]); let best = 0, bx = null;
        for (let k = 1; k < xs.length; k++) if (xs[k] - xs[k - 1] > best) { best = xs[k] - xs[k - 1]; bx = (xs[k] + xs[k - 1]) / 2; }
        return bx;
      };
      // walls: head for the widest gap in the next row coming down
      const gapper = () => t => {
        if (t < 0.25) return null;
        const T = __hg.threats(), sy = T.sy;
        const ws = T.proj.filter(q => (q.k === 'pawn' || q.k === 'flagjar') && q.delay <= 0 && q.y < sy + 50);
        if (!ws.length) return null;
        const yMax = Math.max(...ws.map(q => q.y));
        const xs = [0, ...ws.filter(q => Math.abs(q.y - yMax) < 24).map(q => q.x).sort((a, c) => a - c), W];
        let best = null, bw = -1;
        for (let j = 0; j < xs.length - 1; j++) { const w = xs[j + 1] - xs[j]; if (w > bw) { bw = w; best = (xs[j] + xs[j + 1]) / 2; } }
        return best;
      };
      // bullfighter: when a quark gets close, step across under it, against the way it's moving (or towards the open side)
      const sidestep = trig => { let tx = null, until = -1; return t => {
        const T = __hg.threats(), sx = T.sx, sy = T.sy;
        if (t < until) return tx;
        const hs = T.proj.filter(q => (q.k === 'quarks' || q.k === 'call') && q.delay <= 0 && q.y < sy + 30);
        if (!hs.length) return null;
        const q = hs.reduce((a, c) => (Math.hypot(a.x - sx, a.y - sy) < Math.hypot(c.x - sx, c.y - sy) ? a : c));
        if (Math.hypot(q.x - sx, q.y - sy) > trig) return null;
        let dir = Math.abs(q.vx) > 40 ? (q.vx > 0 ? -1 : 1) : (sx < W / 2 ? 1 : -1);
        if ((dir < 0 && sx < 90) || (dir > 0 && sx > W - 90)) dir = -dir;
        tx = clamp(sx + dir * 150, 20, W - 20); until = t + 0.3; return tx;
      }; };
      const clamp = (v, a, c) => Math.max(a, Math.min(c, v));
      const res = {};
      for (const [pos, x0] of [['L', 24], ['C', W / 2], ['R', W - 24]]) {
        let traps = 0;
        const how = {};
        for (let s = 0; s < seeds; s++) {
          const seed = 1000 * i + 37 * s + 7, bx = W * (0.25 + 0.5 * ((s * 0.37) % 1));
          let ok = null;
          if (!run(seed, x0, bx, 'bot')) ok = 'bot';
          if (!ok) { const jk = juke(); if (!run(seed, x0, bx, t => jk(t))) ok = 'juke'; }
          if (!ok) { const gp = gapper(); if (!run(seed, x0, bx, t => gp(t))) ok = 'gap'; }
          for (const trig of [110, 150, 200]) { if (ok) break; const sd = sidestep(trig); if (!run(seed, x0, bx, t => sd(t))) ok = 'sidestep'; }
          for (const trig of [90, 130, 180]) { if (ok) break; const sd = sidestep(trig); if (!run(seed, x0, bx, { hybrid: sd })) ok = 'bot+sidestep'; }
          if (!ok) { const gp = gapPol(); if (!run(seed, x0, bx, t => (t < 0.25 ? null : gp(t)))) ok = 'gap'; }
          for (const tx of spots) { if (ok) break; if (!run(seed, x0, bx, t => (t < 0.25 ? null : tx))) ok = 'static'; }
          for (const t2 of [1.2, 2.2]) {
            if (ok) break;
            for (const a of spots2) { if (ok) break; for (const c of spots2) { if (!run(seed, x0, bx, t => (t < 0.25 ? null : t < t2 ? a : c))) { ok = 'two-stage'; break; } } }
          }
          if (ok) how[ok] = (how[ok] || 0) + 1; else traps++;
        }
        res['trap' + pos] = traps + '/' + seeds;
        res['escapes' + pos] = Object.entries(how).map(([k, v]) => k + ' ' + v).join(', ');
      }
      return res;
    }, { i, atk, round, seeds });
    rows.push(Object.assign({ boss: i, atk }, r));
    console.log(i, atk, JSON.stringify(r));
  }
  console.log((mob ? 'PHONE' : 'DESKTOP') + (round ? ' endless, meeting #' + round : ' story') + ', seeds: ' + seeds);
  console.log('errors', errs.length ? errs.slice(0, 5) : 'none');
  await b.close();
})();
