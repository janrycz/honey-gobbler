// A long auto-played game: the whole main run, then endless (crazy mode from round 3). Watches for errors, NaN,
// things that pile up, and stuck states.
const { chromium } = require('playwright');
const fs = require('fs');
const out = process.argv[2], W0 = +process.argv[3], H0 = +process.argv[4], mob = process.argv[5] === 'm', rounds = +(process.argv[6] || 6);
const botSrc = fs.readFileSync(out + '/dodgebot.js', 'utf8');
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
  const ctx = await b.newContext(mob ? { viewport: { width: W0, height: H0 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: W0, height: H0 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await p.goto('file://' + out + '/' + (mob ? 'page-m.html' : 'page.html') + '#debug'); await p.waitForTimeout(300);
  await p.addScriptTag({ content: botSrc });
  await p.evaluate(() => document.getElementById('startBtn').click());
  await p.evaluate(() => { __hg.inv(true); __hg.freeze(true); __hg.achReset(); window.__mx = { proj: 0, items: 0, floats: 0, particles: 0 }; });
  const log = []; let fights = 0, lastState = '', stuck = 0, lastT = -1;
  for (let it = 0; it < 6000; it++) {
    const g = await p.evaluate(() => {
      for (let k = 0; k < 10; k++) { dodge(30); const u = __hg.get().upg || {}; for (const pk of ['smoker', 'magnet', 'extractor', 'queen']) if (u[pk]) __hg.power(pk); }
      const g = __hg.get(), th = __hg.threats();
      __mx.proj = Math.max(__mx.proj, g.proj); __mx.items = Math.max(__mx.items, g.items); __mx.floats = Math.max(__mx.floats, __hg.floats().length);
      const bad = [g.score, g.purity, g.savings, th && th.sx].some(v => typeof v === 'number' && !isFinite(v));
      return Object.assign(g, { bad });
    });
    if (g.bad) { log.push('NaN at ' + g.t); break; }
    if (g.t === lastT && g.state === 'play') { if (++stuck > 3) { log.push('time stuck at ' + g.t); break; } } else stuck = 0;
    lastT = g.t;
    if (g.state === 'shed' || g.state === 'won') {
      fights++;
      if (g.state === 'won') { await p.evaluate(() => __hg.endless()); continue; }
      const r = await p.evaluate(() => {
        const got = [];
        for (let n = 0; n < 60; n++) {
          const g = __hg.get();
          const opts = __hg.shop().filter(s => !s.locked && !s.maxed && (s.id !== 'crazy' || g.endlessRound >= 3) && s.cost <= g.wallet).sort((a, b) => a.cost - b.cost);
          if (!opts.length) break;
          __hg.buy(opts[0].id); got.push(opts[0].id);
        }
        __hg.closeShed();
        return { got: got.length, g: __hg.get() };
      });
      if (r.g.endless && r.g.endlessRound >= rounds) { log.push('done: round ' + r.g.endlessRound + ' at ' + (r.g.t / 60).toFixed(1) + ' min'); break; }
    }
    if (g.state === 'over') { log.push('died?'); break; }
  }
  const fin = await p.evaluate(() => ({ g: __hg.get(), mx: __mx, ach: Object.keys(__hg.ach().done).length }));
  console.log(W0 + 'x' + H0 + (mob ? ' phone' : ''), 'fights', fights, log.join(' | '), 'max', JSON.stringify(fin.mx), 'crazy', fin.g.crazyOn, 'ach', fin.ach, 'levels', JSON.stringify(fin.g.upg));
  console.log('ERRORS', JSON.stringify(errs.slice(0, 5)));
  await b.close();
})();
