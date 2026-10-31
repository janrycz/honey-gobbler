const { chromium } = require('playwright');
// Can a reasonable player get out of this? For every attack, from the left edge, the middle and the right edge, the same
// attack (same random seed) is replayed against simple escape plans: wait a reaction time (0.25 s or 0.7 s), then slide to
// one of 13 spots across the screen at 2 screen widths a second and stay there. If no plan avoids every hit, that start is
// a trap. Reports the share of attacks that trapped you from each spot.
const out = __dirname, page = process.env.PAGE || 'page.html', mob = process.env.MOB === '1', round = +(process.env.ROUND || 0), seeds = +(process.env.SEEDS || 4);
const LIST = {
  0: ['toss', 'susRain', 'feeder', 'syrupStorm'],
  1: ['fees', 'vc', 'factorio', 'jobs', 'crow', 'ski', 'gifs', 'cnc', 'roblox', 'doubleFees'],
  2: ['notify', 'sheets', 'bars', 'chess', 'knight', 'deenbuddy', 'fired', 'errors', 'checkmate'],
  3: ['rope', 'prices', 'pushups', 'resin', 'drinks', 'ropeDouble'],
  4: ['blend', 'volley', 'dilemma', 'dilemma2', 'axes', 'axeChop'],
  5: ['hypergamy', 'needles', 'ratings', 'pills', 'liver', 'courseAd', 'chatFlood', 'bonesmash', 'subathon'],
  6: ['barrage', 'hexagons', 'missingLink', 'quarks', 'fishLegs', 'bigbang', 'quarkStorm'],
};
const only = process.env.BOSS ? process.env.BOSS.split(',').map(Number) : Object.keys(LIST).map(Number);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext(mob ? { viewport: { width: 375, height: 635 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: 1100, height: 760 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + out + '/' + page + '#debug'); await p.waitForTimeout(300);
  await p.evaluate(() => { document.getElementById('startBtn').click(); __hg.freeze(true); __hg.inv(true); });
  const rows = [];
  for (const i of only) for (const atk of LIST[i]) {
    const r = await p.evaluate(({ i, atk, round, seeds }) => {
      const mul = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
      const realRandom = Math.random;
      if (round) { __hg.setSeen(i, round - 1); __hg.endlessBoss(i); } else __hg.jump(i);
      __hg.step(200);
      const W = __hg.sizes().W, speed = 2 * W / 60, res = {}, spots = Array.from({ length: 13 }, (_, k) => 20 + (W - 40) * k / 12);
      const run = (seed, x0, bx, react, tx) => {
        __hg.clearProj(); __hg.clearItems(); __hg.unhurt(); __hg.bossAt(bx); __hg.hold(); __hg.spoonTo(x0);
        const g = __hg.get(); if (g.bosses[0].hp < g.bosses[0].max * 0.6) __hg.hurtBoss(-1000);
        const h0 = __hg.get().hits;
        Math.random = mul(seed);
        __hg.attack(atk); __hg.hold();
        let x = x0, hit = false;
        for (let f = 0; f < 60 * 7; f++) {
          __hg.hold(); __hg.clearItems();
          if (f >= react * 60) { const c = __hg.combo().sx; x = c + Math.max(-speed, Math.min(speed, tx - c)); __hg.spoonTo(x); }
          __hg.step(1);
          if (__hg.get().hits > h0) { hit = true; break; }
          if (f > 90 && __hg.get().proj === 0) break;
        }
        Math.random = realRandom;
        return hit;
      };
      for (const [pos, x0] of [['L', 24], ['C', W / 2], ['R', W - 24]]) {
        let traps = 0, stayHits = 0;
        for (let s = 0; s < seeds; s++) {
          const seed = 1000 * i + 37 * s + 7, bx = W * (0.25 + 0.5 * ((s * 0.37) % 1));
          if (run(seed, x0, bx, 99, x0)) stayHits++;
          let ok = false;
          const order = spots.slice().sort((a, c) => Math.abs(a - x0) - Math.abs(c - x0));
          for (const react of [0.25, 0.7]) { for (const tx of order) if (!run(seed, x0, bx, react, tx)) { ok = true; break; } if (ok) break; }
          if (!ok) traps++;
        }
        res['trap' + pos] = traps + '/' + seeds; res['stayHit' + pos] = stayHits + '/' + seeds;
      }
      return res;
    }, { i, atk, round, seeds });
    rows.push(Object.assign({ boss: i, atk }, r));
  }
  console.log((mob ? 'PHONE' : 'DESKTOP') + (round ? ' endless, meeting #' + round : ' story') + ', seeds: ' + seeds);
  console.table(rows.map(r => ({ boss: r.boss, atk: r.atk, trapL: r.trapL, trapC: r.trapC, trapR: r.trapR, standStillHitL: r.stayHitL, standStillHitC: r.stayHitC, standStillHitR: r.stayHitR })));
  console.log('errors', errs.length ? errs.slice(0, 5) : 'none');
  await b.close();
})();
