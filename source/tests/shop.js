const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const errs = [];
  for (const [vw, vh, tag] of [[1100, 760, 'w'], [390, 780, 'm']]) {
    const ctx = await b.newContext(vw < 600 ? { viewport: { width: vw, height: vh }, deviceScaleFactor: 2, hasTouch: true, isMobile: true } : { viewport: { width: vw, height: vh } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(tag + ' ' + e.message));
    await p.goto('file://' + out + '/shop/index.html');
    await p.waitForTimeout(400);
    await p.evaluate(() => document.getElementById('startBtn').click());
    if (vw < 600) { await p.touchscreen.tap(195, 500); } else { await p.mouse.move(300, 500); await p.mouse.move(800, 500, { steps: 10 }); }
    await p.waitForTimeout(4000);
    const info = await p.evaluate(() => ({ dbg: typeof window.__hg, kg: document.getElementById('kg').textContent, next: document.getElementById('next').textContent, links: [...document.querySelectorAll('a')].map(a => a.getAttribute('href') + (a.target ? ' target=' + a.target : '')) }));
    console.log(tag, JSON.stringify(info));
    await p.screenshot({ path: `${out}/shop-${tag}.png` });
    await ctx.close();
  }
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
