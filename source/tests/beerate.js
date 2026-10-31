const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/' + (process.argv[2] || 'page.html') + '#debug'); await p.waitForTimeout(300);
  await p.evaluate(() => document.getElementById('startBtn').click());
  const out = {};
  for (const L of [1, 4, 8, 10]) {
    out[L] = await p.evaluate(L => {
      __hg.freeze(true); __hg.inv(true); __hg.harvest(2); __hg.setUpg('bee', L); __hg.step(120);
      const d0 = __hg.get().beeDrops; let s0 = __hg.get().score;
      for (let i = 0; i < 60 * 90; i++) { if (i % 30 === 0) __hg.spoonTo(30); __hg.step(1); if (__hg.get().phase !== 'harvest') __hg.harvest(2); }
      return { catches: __hg.get().beeDrops - d0, bees: __hg.get().bees };
    }, L);
  }
  console.log(JSON.stringify(out), errs);
  await b.close();
})();
