const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const errs = [];
  for (const [vw, vh, tag] of [[1100, 760, 'w'], [390, 780, 'm']]) {
    const ctx = await b.newContext(vw < 600 ? { viewport: { width: vw, height: vh }, deviceScaleFactor: 2, hasTouch: true, isMobile: true } : { viewport: { width: vw, height: vh } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(tag + ' ' + e.message));
    await p.goto('file://' + out + '/page.html#debug');
    await p.waitForTimeout(400);
    await p.evaluate(() => document.getElementById('startBtn').click());
    await p.evaluate(() => { __hg.freeze(true); __hg.step(240); });
    await p.screenshot({ path: `${out}/s-${tag}-march.png` });
    await p.evaluate(() => { __hg.inv(true); __hg.jump(6); __hg.step(200); __hg.hurtBoss(9999); __hg.step(260); });
    await p.waitForTimeout(200);
    await p.screenshot({ path: `${out}/s-${tag}-sold.png`, fullPage: false });
    console.log(tag, await p.evaluate(() => [__hg.get().state, document.activeElement && document.activeElement.id, document.querySelector('#soldScreen .big').textContent]));
    await ctx.close();
  }
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
