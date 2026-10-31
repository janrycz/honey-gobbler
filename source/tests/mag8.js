const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const errs = [];
  const p = await (await b.newContext({ viewport: { width: 1100, height: 760 } })).newPage();
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + out + '/page.html#debug'); await p.waitForTimeout(300);
  await p.click('#startBtn');
  const r = await p.evaluate(() => {
    __hg.freeze(true); __hg.inv(false);
    const i = __hg.bossKeys().indexOf('keeper'); __hg.jump(i); __hg.step(400);
    __hg.setUpg('magnet', 1); __hg.clearItems(); __hg.spoonTo(550); __hg.setPurity(100); __hg.ready();
    console.log(__hg.power('magnet'));
    const m = __hg.mag(); const log = [];
    __hg.dropProj(560, 380);
    for (let k = 0; k < 20; k++) { __hg.step(4); log.push(JSON.stringify(__hg.projAt()) + ' p=' + __hg.get().purity + ' mT=' + __hg.mag().magnetT.toFixed(1)); }
    return { m, log };
  });
  console.log(JSON.stringify(r.m)); console.log(r.log.join('\n'));
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
