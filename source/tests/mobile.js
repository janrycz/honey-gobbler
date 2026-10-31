// How hard is it at phone width? The bot chases honey (it doesn't dodge), so hits per minute measure how crowded it is.
const { chromium } = require('playwright');
const out = process.argv[2], tag = process.argv[3] || 'base';
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const sizes = [[1100, 760, false], [375, 635, true]];
  for (const [w, h, mob] of sizes) {
    const ctx = await b.newContext(mob ? { viewport: { width: w, height: h }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(w + ' ' + e.message));
    await p.goto('file://' + out + '/page.html#debug'); await p.waitForTimeout(300);
    await p.evaluate(() => document.getElementById('startBtn').click());
    const r = await p.evaluate(() => {
      __hg.inv(true); __hg.freeze(true);
      const hitsOf = () => { const t = __hg.get(); return t.hits; };
      const res = {};
      // harvest at stage 4: fakes hit per minute and kg per minute
      let fake = 0, kg = 0;
      for (let rep = 0; rep < 3; rep++) {
        __hg.harvest(4); __hg.clearItems(); __hg.bot(true); __hg.setCombo(1);
        const f0 = (__hg.ach().stats.fakeHits || 0), s0 = __hg.get().score;
        for (let k = 0; k < 3600 && __hg.get().phase === 'harvest'; k++) __hg.step(1);
        fake += (__hg.ach().stats.fakeHits || 0) - f0; kg += __hg.get().score - s0;
      }
      res.harvest = { fakeHitsPerMin: +(fake / 3).toFixed(1), kgPerMin: +(kg / 3).toFixed(0) };
      // each boss: hits per minute while the bot plays
      const keys = ['keeper', 'colonex', 'ceo', 'ironfit', 'apologist', 'looks', 'disprover'];
      res.boss = {};
      for (let i = 0; i < 7; i++) {
        let hits = 0;
        for (let rep = 0; rep < 2; rep++) {
          __hg.jump(i); __hg.step(200); __hg.bot(true);
          let k = 0; for (; k < 3600 && __hg.get().phase === 'boss'; k++) { __hg.step(1); if (__hg.get().bosses[0] && __hg.get().bosses[0].hp < 50) __hg.hurtBoss(-100); }
          hits += __hg.get().hits;
        }
        res.boss[keys[i]] = +(hits / 2).toFixed(1);
      }
      return res;
    });
    console.log(tag, w + 'x' + h, JSON.stringify(r));
  }
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
