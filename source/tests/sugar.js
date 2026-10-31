const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1100, height: 760 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + out + '/page.html#debug'); await p.waitForTimeout(300);
  await p.click('#startBtn');
  const r = await p.evaluate(() => {
    __hg.inv(true); __hg.freeze(true); __hg.achReset(); __hg.harvest(1); __hg.setUpg('sweet', 5); __hg.setCombo(4.5);
    const log = [];
    for (let k = 0; k < 6; k++) {
      __hg.clearItems(); __hg.drops(1, 450); const d = __hg.itemsInfo()[0]; __hg.spoonTo(d.x);
      for (let j = 0; j < 120 && __hg.itemsInfo().length; j++) __hg.step(1);
      log.push(__hg.get().combo);
    }
    return { combo: log.join(','), sugar: !!__hg.ach().done.sugar };
  });
  console.log(JSON.stringify(r), 'ERRORS', JSON.stringify(errs));
  await b.close();
})();
