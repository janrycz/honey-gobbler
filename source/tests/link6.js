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
    await p.evaluate(() => { __hg.inv(true); __hg.freeze(true); });
    // clean combo check: x3 with nothing to catch
    const trace = await p.evaluate(() => { __hg.setCombo(3); const r = []; for (let i = 0; i <= 18; i++) { r.push((i * 0.5).toFixed(1) + ':' + __hg.combo().combo); __hg.clearItems(); __hg.step(30); } return r; });
    if (tag === 'w') console.log('combo with nothing caught:', trace.join(' '));
    await p.evaluate(() => { __hg.jump(6); __hg.step(200); __hg.attack('missingLink'); __hg.step(110); });
    await p.waitForTimeout(80);
    await p.screenshot({ path: `${out}/${tag}6-chain.png` });
    await ctx.close();
  }
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
