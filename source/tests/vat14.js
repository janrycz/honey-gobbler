const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  await p.goto('file://' + __dirname + '/page-vat.html#debug'); await p.waitForTimeout(400);
  await p.evaluate(() => document.getElementById('startBtn').click());
  await p.evaluate(() => { __hg.freeze(true); __hg.inv(true); __hg.jump(4); __hg.step(200); });
  // wait until an invoice is in flight, then until one lands
  await p.evaluate(() => { for (let i = 0; i < 400 && !__hg.projKinds().allyFee; i++) { __hg.hold(); __hg.step(1); } for (let i = 0; i < 12; i++) { __hg.hold(); __hg.step(1); } });
  await p.waitForTimeout(80); await p.screenshot({ path: __dirname + '/x14-vat1.png', clip: { x: 0, y: 150, width: 1100, height: 400 } });
  await p.evaluate(() => { for (let i = 0; i < 200 && __hg.projKinds().allyFee; i++) { __hg.hold(); __hg.step(1); } __hg.step(4); });
  await p.evaluate(() => { for (let i = 0; i < 18; i++) { __hg.hold(); __hg.step(1); } }); await p.waitForTimeout(80); await p.screenshot({ path: __dirname + '/x14-vat2.png', clip: { x: 0, y: 150, width: 1100, height: 400 } });
  await b.close();
})();
