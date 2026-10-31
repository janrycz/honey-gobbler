const { chromium } = require('playwright');
const fs = require('fs');
// Trap finder: fires each boss attack on its own, with the spoon starting at the left edge, the middle and the right edge,
// and lets two bots try to dodge it: an "expert" (re-plans every frame, moves up to 5 screen widths a second) and a
// "player" (0.2 s reactions, 2.5 widths a second). No honey or fakes are falling. Reports hits per attack.
// If even the expert gets hit a lot from one spot, the attack can corner you.
const out = __dirname, page = process.env.PAGE || 'page.html', mob = process.env.MOB === '1', round = +(process.env.ROUND || 0), trials = +(process.env.TRIALS || 4);
const botSrc = fs.readFileSync(out + '/dodgebot.js', 'utf8');
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
  await p.addScriptTag({ content: botSrc });
  await p.evaluate(() => { document.getElementById('startBtn').click(); __hg.freeze(true); __hg.inv(true); });
  const rows = [];
  for (const i of only) {
    for (const atk of LIST[i]) {
      const r = await p.evaluate(({ i, atk, round, trials, process_names }) => {
        if (round) { __hg.setSeen(i, round - 1); __hg.endlessBoss(i); } else __hg.jump(i);
        __hg.step(200); __hg.hold();
        const W = __hg.sizes().W, res = {};
        for (const [mode, opt] of [['expert', { speed: 5, every: 1 }], ['player', { speed: 2.5, every: 12 }]]) {
          for (const [pos, x0] of [['L', 24], ['C', W / 2], ['R', W - 24]]) {
            let hits = 0; const b0 = __hg.bad();
            for (let t = 0; t < trials; t++) {
              __hg.clearProj(); __hg.clearItems(); __hg.spoonTo(x0); __hg.unhurt(); __hg.hold();
              const g0 = __hg.get(); if (!g0.bosses[0] || g0.bosses[0].hp < g0.bosses[0].max * 0.6) __hg.hurtBoss(-1000);
              const h0 = g0.hits;
              __hg.attack(atk); __hg.hold();
              for (let f = 0; f < 60 * 8; f += opt.every) {
                __hg.hold(); __hg.clearItems();
                dodge(opt.every, { speed: opt.speed, replan: opt.every });
                if (f > 60 && __hg.get().proj === 0) break;
              }
              hits += __hg.get().hits - h0;
              __hg.step(60); // let the hurt flash wear off
            }
            res[mode + pos] = +(hits / trials).toFixed(2);
            if (process_names) { const b1 = __hg.bad(), d = []; for (const k in b1) if (b1[k] !== (b0[k] || 0)) d.push(k + ' ' + (b1[k] - (b0[k] || 0))); if (d.length) (res.why = res.why || []).push(mode + pos + ': ' + d.join(', ')); }
          }
        }
        return res;
      }, { i, atk, round, trials, process_names: !!process.env.WHY });
      if (r.why) { console.log(i, atk, r.why.join(' | ')); delete r.why; }
      rows.push(Object.assign({ boss: i, atk }, r));
    }
  }
  console.log((mob ? 'PHONE' : 'DESKTOP') + (round ? ' endless, meeting #' + round : ' story') + ', trials per spot: ' + trials);
  console.table(rows);
  console.log('errors', errs.length ? errs.slice(0, 5) : 'none');
  await b.close();
})();
