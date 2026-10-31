const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/page.html#debug'); await p.waitForTimeout(400);
  await p.evaluate(() => document.getElementById('startBtn').click());
  const r = await p.evaluate(() => {
    __hg.freeze(true); __hg.inv(true); __hg.jump(2); __hg.step(200); __hg.hold();
    const life = smoke => { __hg.clearProj(); __hg.setUpg('smoker', 10); __hg.ready(); if (smoke) __hg.power('smoker'); __hg.attack('bars'); let f = 0; while (__hg.projKinds().bar && f < 600) { __hg.hold(); __hg.step(1); f++; } return (f / 60).toFixed(2) + ' s'; };
    return { noSmoke: life(false), withSmoke: life(true) };
  });
  console.log(r, errs); await b.close();
})();
