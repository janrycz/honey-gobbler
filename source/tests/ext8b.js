const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const errs = [];
  const p = await (await b.newContext({ viewport: { width: 1100, height: 760 } })).newPage();
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + out + '/page.html#debug'); await p.waitForTimeout(300);
  await p.click('#startBtn');
  for (const useExt of [true, false]) {
    const r = await p.evaluate(([useExt]) => {
      __hg.inv(true); __hg.freeze(true);
      const i = __hg.bossKeys().indexOf('keeper');
      __hg.jump(i); __hg.step(400); __hg.setUpg('extractor', 1); __hg.ready(); __hg.clearItems(); __hg.spoonTo(500);
      const b0 = __hg.get().bosses[0];
      const log = [];
      if (useExt) { __hg.drops(4, 200); __hg.power('extractor'); }
      else { __hg.drops(4, 200); }
      for (let k = 0; k < 30; k++) { __hg.step(4); const g = __hg.get(); log.push(g.bosses[0].hp + '/' + __hg.globsN() + '/' + g.bosses[0].mode); }
      return { useExt, b0, log: log.join(' ') };
    }, [useExt]);
    console.log(JSON.stringify(r));
  }
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
