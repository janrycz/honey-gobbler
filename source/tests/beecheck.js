const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + out + '/page.html#debug');
  await p.waitForTimeout(400);
  await p.evaluate(() => document.getElementById('startBtn').click());
  const r = await p.evaluate(() => {
    __hg.inv(true); __hg.freeze(true); __hg.setUpg('bee', 10); __hg.harvest(4);
    const rows = [];
    for (let i = 0; i < 12; i++) { const before = __hg.get().items; __hg.step(60); const g = __hg.get(); rows.push(`t${i + 1}s beeCatches=${g.beeDrops} addict=${g.addict} rush=${g.rush}`); }
    return rows;
  });
  console.log(r.join('\n'));
  // count fakes carried off: watch held items
  const held = await p.evaluate(() => { let n = 0; for (let i = 0; i < 300; i++) { __hg.step(2); } return 'ok'; });
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
