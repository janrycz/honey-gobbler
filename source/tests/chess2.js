const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1100, height: 760 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + out + '/page.html#debug'); await p.waitForTimeout(300);
  await p.evaluate(() => document.getElementById('startBtn').click());
  const r = await p.evaluate(() => {
    __hg.freeze(true); __hg.jump(2); __hg.step(200); __hg.clearItems(); __hg.spoonTo(600);
    const out = [];
    for (const k of ['pawn', 'bishop', 'sus']) { __hg.setPurity(100); __hg.step(70); __hg.hitWith(k); out.push(__hg.floats().slice(-2).map(f => f.text).join(' / ')); }
    __hg.step(70); __hg.setPurity(5); __hg.setRevives(0); __hg.hitWith('pawn');
    out.push(__hg.get().state + ': ' + __hg.floats().slice(-2).map(f => f.text).join(' / '));
    return out;
  });
  console.log(JSON.stringify(r, null, 1), 'ERRORS', JSON.stringify(errs));
  await b.close();
})();
