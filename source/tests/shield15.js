const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/page.html#debug'); await p.waitForTimeout(400);
  await p.evaluate(() => document.getElementById('startBtn').click());
  const r = await p.evaluate(() => {
    __hg.freeze(true); __hg.jump(2); __hg.step(200); __hg.hold(); __hg.setUpg('shield', 1); __hg.setPurity(100);
    const out = { fired: __hg.power('shield') };
    const hits = [];
    for (let i = 0; i < 4; i++) { __hg.unhurt(); __hg.hitWith('pawn'); hits.push(__hg.get().purity); __hg.step(30); }
    out.purityAfterHits = hits;
    out.btn = !document.getElementById('pw-shield').hidden;
    return out;
  });
  await p.evaluate(() => { __hg.setUpg('shield', 10); __hg.ready(); __hg.power('shield'); __hg.unhurt(); __hg.step(70); });
  await p.waitForTimeout(100); await p.screenshot({ path: __dirname + '/x15-shield.png', fullPage: false });
  console.log(JSON.stringify(r), errs);
  await b.close();
})();
