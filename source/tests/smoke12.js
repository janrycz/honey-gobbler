const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/page.html#debug'); await p.waitForTimeout(400);
  await p.evaluate(() => document.getElementById('startBtn').click());
  const r = await p.evaluate(() => {
    __hg.freeze(true); __hg.inv(false);
    const out = {};
    // wax: damage taken from a 10-damage hit at levels 0, 5, 10
    out.wax = [0, 5, 10].map(l => { __hg.setUpg('wax', l); __hg.jump(2); __hg.step(200); __hg.setPurity(100); __hg.unhurt(); __hg.hitWith('pawn'); return l + ':' + (100 - __hg.get().purity); });
    __hg.setUpg('wax', 0);
    // endless levels: same boss met 1st, 2nd, 3rd time
    out.endless = [0, 1, 2, 4].map(n => { __hg.setSeen(0, n); __hg.endlessBoss(0); const g = __hg.get(); return 'meet#' + (n + 1) + ' hp ' + g.bosses[0].max; });
    out.shop = __hg.shop().map(s => s.id + ' ' + s.cost[0]).join(', ');
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  // shed screenshot with the new item and achievements button
  await p.evaluate(() => { __hg.give(5000); __hg.shed(false); });
  await p.waitForTimeout(300);
  await p.screenshot({ path: __dirname + '/x12-shed.png' });
  await p.evaluate(() => document.querySelector('#shedScreen [data-ach]').click()); await p.waitForTimeout(200);
  const achVisible = await p.evaluate(() => !document.getElementById('achScreen').hidden && document.getElementById('shedScreen').hidden);
  await p.evaluate(() => document.getElementById('achClose').click()); await p.waitForTimeout(200);
  const back = await p.evaluate(() => !document.getElementById('shedScreen').hidden);
  console.log('ach from shed:', achVisible, 'back to shed:', back);
  console.log('errors', errs);
  await b.close();
})();
