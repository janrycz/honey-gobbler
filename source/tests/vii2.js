const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const open = async (w, h) => {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(w + ' ' + e.message + ' ' + (e.stack || '').split('\n')[1]));
    await p.goto('file://' + out + '/page.html#debug'); await p.waitForTimeout(300);
    await p.click('#startBtn');
    await p.evaluate(() => { __hg.inv(true); __hg.freeze(true); });
    return p;
  };
  const keys = ['keeper', 'colonex', 'ceo', 'ironfit', 'apologist', 'looks', 'disprover'], idx = k => keys.indexOf(k);
  const R = {};
  const p = await open(1100, 760);
  // hypergamy: count arrows fired (most in flight at once) at different endless rounds
  R.hyper = await p.evaluate(i => {
    const r = {};
    for (const rd of [0, 4, 10]) {
      __hg.endlessBoss(i); __hg.setRound(rd); __hg.step(200); __hg.clearItems(); __hg.attack('hypergamy');
      let mx = 0; for (let k = 0; k < 120; k++) { __hg.step(1); mx = Math.max(mx, __hg.projKinds().hyperArrow || 0); }
      r['round' + rd] = mx;
    }
    return r;
  }, idx('looks'));
  // smoke in the main run
  const p2 = await open(1100, 760);
  R.smokeMain = await p2.evaluate(i => {
    __hg.jump(i); __hg.step(300); __hg.clearItems(); __hg.spoonTo(900); __hg.attack('smoke'); __hg.step(100);
    const a = __hg.smokes(); __hg.step(240); const c = __hg.smokes();
    return { n: a.length, life: a[0].life, r: [a[0].r, c[0].r], xs: [a.map(s => s.x).join(','), c.map(s => s.x).join(',')] };
  }, idx('keeper'));
  await p2.screenshot({ path: out + '/v7-smoke-main.png' });
  // magnet + extractor: the extractor goes for the far honey first
  R.magEx = await p2.evaluate(() => {
    __hg.harvest(3); __hg.setUpg('bee', 0); __hg.setUpg('magnet', 1); __hg.setUpg('extractor', 1); __hg.ready(); __hg.clearItems(); __hg.spoonTo(550);
    __hg.drops(1, 640); __hg.drops(1, 200);
    const before = __hg.itemsInfo();
    __hg.power('magnet'); __hg.power('extractor'); __hg.step(1);
    return { before, after: __hg.itemsInfo() };
  });
  // bees and combo, with the player catching too (bot), with and without bees
  R.beeCombo = {};
  for (const bees of [0, 10]) {
    const q = await open(1100, 760);
    R.beeCombo['bees' + bees] = await q.evaluate(n => {
      __hg.harvest(4); __hg.setUpg('bee', n); __hg.bot(true); const log = [];
      for (let k = 0; k < 12; k++) { __hg.step(150); log.push(__hg.get().combo); }
      return log.join(',');
    }, bees);
  }
  console.log(JSON.stringify(R, null, 1));
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
