const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/' + (process.argv[2] || 'page.html') + '#debug'); await p.waitForTimeout(400);
  await p.evaluate(() => document.getElementById('startBtn').click());
  console.log(await p.evaluate(() => { __hg.freeze(true); __hg.brawl(); return JSON.stringify(__hg.brawlInfo()); }));
  const t0 = Date.now();
  console.log(await p.evaluate(() => { const t = performance.now(); __hg.step(60); return performance.now() - t; }), 'ms step');
  console.log(await p.evaluate(() => new Promise(r => { const t = performance.now(); requestAnimationFrame(() => requestAnimationFrame(() => r(performance.now() - t))); })), 'ms 2 frames');
  console.log(errs);
  await b.close();
})();
