const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + out + '/page.html#debug');
  await p.waitForTimeout(400);
  await p.click('#startBtn');
  await p.evaluate(() => { __hg.freeze(true); __hg.jump(6); __hg.step(250); });
  for (let i = 1; i <= 3; i++) {
    await p.evaluate(() => __hg.kill());
    const r = await p.evaluate(() => [!document.getElementById('reviveRow').hidden, document.getElementById('reviveNote').textContent]);
    console.log('death', i, 'in the final boss fight | offered:', r[0], '|', r[0] ? r[1] : '');
    if (r[0]) { await p.click('#reviveBtn'); await p.evaluate(() => __hg.step(200)); }
  }
  await p.click('#againBtn');
  await p.evaluate(() => { __hg.endless(); __hg.step(60); __hg.kill(); });
  console.log('endless death, fresh run | offered:', await p.evaluate(() => !document.getElementById('reviveRow').hidden));
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
