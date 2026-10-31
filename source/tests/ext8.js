const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const errs = [];
  const p = await (await b.newContext({ viewport: { width: 1100, height: 760 } })).newPage();
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await p.goto('file://' + out + '/page.html#debug'); await p.waitForTimeout(300);
  await p.click('#startBtn');
  const R = {};
  // 1. harvest: only 2 pieces on screen, level 1 (4 pieces): takes those 2 straight away, one by one, then waits for 2 more
  R.harvest = await p.evaluate(() => {
    __hg.inv(true); __hg.freeze(true); __hg.harvest(2); __hg.setUpg('bee', 0); __hg.setUpg('extractor', 1); __hg.ready(); __hg.clearItems(); __hg.spoonTo(40);
    __hg.drops(2, 250);
    const tl = [];
    __hg.power('extractor');
    for (let i = 0; i < 12; i++) { __hg.step(3); const r = __hg.extractRun(); tl.push(r ? r.got : 'done'); }
    let t = 0; while (__hg.extractRun() && t < 1200) { __hg.step(10); t += 10; }
    return { gotEvery50ms: tl.join(','), finishedAfter_s: +(t / 60 + 0.6).toFixed(1), pcdAfter: +__hg.get().pcd.extractor.toFixed(1) };
  });
  // 2. honey you or your bees catch doesn't count
  R.notCounted = await p.evaluate(() => {
    __hg.harvest(2); __hg.setUpg('bee', 10); __hg.setUpg('extractor', 9); __hg.ready(); __hg.clearItems();
    const g0 = __hg.get(); __hg.power('extractor'); let t = 0;
    while (__hg.extractRun() && t < 3000) { __hg.step(5); t += 5; }
    const g1 = __hg.get();
    return { grab: 20, beeCatches: g1.beeDrops - g0.beeDrops, secs: +(t / 60).toFixed(1) };
  });
  await p.evaluate(() => { __hg.setUpg('bee', 0); __hg.harvest(2); __hg.setUpg('extractor', 5); __hg.ready(); __hg.drops(6, 220); __hg.power('extractor'); __hg.step(8); });
  await p.screenshot({ path: out + '/x8-extractor.png' });
  // 3. boss fight: extracted honey gets flicked at the boss
  const ceo = await p.evaluate(() => __hg.bossKeys().indexOf('ceo'));
  R.boss = await p.evaluate(i => {
    __hg.jump(i); __hg.step(400); __hg.setUpg('thick', 0); __hg.setUpg('extractor', 1); __hg.ready(); __hg.clearItems(); __hg.spoonTo(60);
    __hg.drops(4, 200);
    const hp0 = __hg.get().bosses[0].hp; let maxGlobs = 0;
    __hg.power('extractor');
    for (let k = 0; k < 40; k++) { __hg.step(2); maxGlobs = Math.max(maxGlobs, __hg.globsN()); }
    return { hp0, hp1: __hg.get().bosses[0].hp, maxGlobs, run: __hg.extractRun() };
  }, ceo);
  // 4. magnet deflects boss attacks
  R.magnet = await p.evaluate(() => {
    __hg.inv(false); __hg.setUpg('magnet', 1); __hg.clearItems(); __hg.spoonTo(550); __hg.setPurity(100);
    __hg.dropProj(560, 380); __hg.step(90); const noMag = __hg.get().purity;
    __hg.setPurity(100); __hg.ready(); __hg.power('magnet'); __hg.step(5);
    __hg.dropProj(560, 380); __hg.dropProj(520, 300); __hg.step(5); const mid = __hg.projAt(); __hg.step(85);
    const withMag = __hg.get().purity; __hg.inv(true);
    return { purityWithoutMagnet: noMag, purityWithMagnet: withMag, jarsWhilePushed: mid };
  });
  console.log(JSON.stringify(R, null, 1));
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
