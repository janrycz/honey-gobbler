const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const vw = +(process.argv[3] || 1100), vh = +(process.argv[4] || 760), tag = process.argv[5] || 'w';
  const b = await chromium.launch();
  const errs = [];
  const ctx = await b.newContext(vw < 600 ? { viewport: { width: vw, height: vh }, deviceScaleFactor: 2, hasTouch: true, isMobile: true } : { viewport: { width: vw, height: vh } });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  await p.goto('file://' + out + '/page.html#debug');
  await p.waitForTimeout(500);
  await p.evaluate(() => document.getElementById('startBtn').click());
  await p.evaluate(() => { __hg.inv(true); __hg.freeze(true); });
  const shot = async (name, fn, steps) => {
    await p.evaluate(([fn, steps]) => { if (fn) eval(fn); __hg.step(steps); }, [fn, steps]);
    await p.waitForTimeout(60);
    await p.screenshot({ path: `${out}/${tag}6-${name}.png` });
  };
  await shot('belt', "__hg.jump(1); __hg.step(200); __hg.attack('factorio')", 50);
  await shot('belt-late', '', 120);
  await shot('chop-tele', "__hg.jump(4); __hg.step(200); __hg.hurtBoss(200); __hg.step(5); __hg.attack('axeChop')", 40);
  await shot('chop-hit', '', 30);
  await shot('axes', "__hg.step(150); __hg.attack('axes')", 32);
  await shot('looks', "__hg.jump(5); __hg.step(260)", 10);
  await shot('looks-p2', "__hg.hurtBoss(230); __hg.step(80)", 10);
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
