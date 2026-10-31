const { chromium } = require('playwright');
const fs = require('fs');
const out = process.argv[2], tag = process.argv[3] || 'base', reps = +(process.argv[4] || 2);
const botSrc = fs.readFileSync(out + '/dodgebot.js', 'utf8');
(async () => {
  const b = await chromium.launch();
  const errs = [];
  for (const [w, h, mob] of (process.env.ONLY === 'm' ? [[375, 635, true]] : process.env.ONLY === 'd' ? [[1100, 760, false]] : [[1100, 760, false], [375, 635, true]])) {
    const ctx = await b.newContext(mob ? { viewport: { width: w, height: h }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(w + ' ' + e.message));
    await p.goto('file://' + out + '/' + (process.env.PAGE || 'page.html') + '#debug'); await p.waitForTimeout(300);
    await p.addScriptTag({ content: botSrc });
    await p.evaluate(() => document.getElementById('startBtn').click());
    const r = await p.evaluate(reps => {
      __hg.inv(true); __hg.freeze(true);
      const res = {};
      let fake = 0, kg = 0;
      for (let rep = 0; rep < reps; rep++) {
        __hg.harvest(4); __hg.clearItems(); __hg.setCombo(1);
        const f0 = (__hg.ach().stats.fakeHits || 0), s0 = __hg.get().score;
        for (let k = 0; k < 3600 && __hg.get().phase === 'harvest'; k += 60) dodge(60);
        fake += (__hg.ach().stats.fakeHits || 0) - f0; kg += __hg.get().score - s0;
      }
      res.harvest = { fakeHitsPerMin: +(fake / reps).toFixed(1), kgPerMin: +(kg / reps).toFixed(0) };
      const keys = ['keeper', 'colonex', 'ceo', 'ironfit', 'apologist', 'looks', 'disprover'];
      res.boss = {}; let tot = 0;
      for (let i = 0; i < 7; i++) {
        let hits = 0;
        for (let rep = 0; rep < reps; rep++) {
          __hg.jump(i); __hg.step(200);
          for (let k = 0; k < 3600 && __hg.get().phase === 'boss'; k += 30) { dodge(30); const bb = __hg.get().bosses[0]; if (bb && bb.hp < 60) __hg.hurtBoss(-150); }
          hits += __hg.get().hits;
        }
        res.boss[keys[i]] = +(hits / reps).toFixed(1); tot += hits / reps;
      }
      res.bossAvg = +(tot / 7).toFixed(1);
      return res;
    }, reps);
    console.log(tag, w + 'x' + h, JSON.stringify(r));
  }
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
