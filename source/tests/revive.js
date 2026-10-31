const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await p.goto('file://' + out + '/page.html#debug');
  await p.waitForTimeout(400);
  await p.click('#startBtn');
  await p.evaluate(() => __hg.freeze(true));
  const cases = [['harvest', "__hg.step(60)"], ['boss fight', "__hg.jump(2); __hg.step(250)"], ['final boss', "__hg.jump(6); __hg.step(250)"], ['endless', "__hg.endless(); __hg.step(60)"]];
  for (const [name, setup] of cases) {
    await p.evaluate(s => { if (__hg.get().state !== 'play') document.getElementById('startBtn').click(); eval(s); __hg.kill(); }, setup);
    await p.waitForTimeout(100);
    const shown = await p.evaluate(() => !document.getElementById('reviveRow').hidden);
    let after = null;
    if (shown) { await p.click('#reviveBtn'); after = await p.evaluate(() => { __hg.step(300); const g = __hg.get(); return g.state + ' purity ' + g.purity; }); }
    console.log(name, '| revive offered:', shown, '| after clicking + 5 s:', after);
    await p.evaluate(() => { document.getElementById('againBtn').click(); });
  }
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
