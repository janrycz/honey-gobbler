const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  await p.goto('file://' + __dirname + '/page.html#debug'); await p.waitForTimeout(400);
  await p.evaluate(() => document.getElementById('startBtn').click());
  await p.evaluate(() => { __hg.freeze(true); __hg.inv(true); __hg.setUpg('queen', 5); __hg.crazy(1, 5); __hg.step(240); __hg.hold(); __hg.ready(); __hg.power('queen'); });
  for (const [n, name] of [[45, 'q1-tele'], [22, 'q2-go'], [10, 'q3-go']]) { await p.evaluate(n => { for (let i = 0; i < n; i++) { __hg.hold(); __hg.step(1); } }, n); await p.waitForTimeout(80); await p.screenshot({ path: __dirname + '/x14-' + name + '.png' }); }
  // VAT invoices: Colonex as ally against one boss
  await p.evaluate(() => { __hg.jump(4); __hg.step(200); for (let i = 0; i < 900; i++) { __hg.hold(); __hg.step(1); } });
  let found = false;
  for (let k = 0; k < 40 && !found; k++) {
    found = await p.evaluate(() => { for (let i = 0; i < 6; i++) { __hg.hold(); __hg.step(1); } return __hg.floats().some(f => /VAT/.test(f.text)) || false; });
  }
  await p.waitForTimeout(80); await p.screenshot({ path: __dirname + '/x14-vat.png' });
  console.log('vat float seen', found);
  await b.close();
})();
