const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const errs = [];
  const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + out + '/page6.html#debug');
  await p.waitForTimeout(400);
  await p.evaluate(() => document.getElementById('startBtn').click());
  await p.evaluate(() => { __hg.inv(true); __hg.freeze(true); });
  // combo decay: x3 combo, then catch nothing (spoon parked at the edge, items cleared)
  await p.mouse.move(30, 600);
  const trace = await p.evaluate(() => {
    __hg.setCombo(3); const r = [];
    for (let i = 0; i <= 10; i++) { r.push((i * 0.5).toFixed(1) + 's x' + __hg.combo().combo); __hg.step(30); }
    return r;
  });
  console.log('combo over time with no catches:', trace.join('  '));
  // belt vs mouse: park the mouse, spawn the belt, watch the spoon get dragged
  await p.evaluate(() => { __hg.jump(1); __hg.step(200); });
  await p.mouse.move(550, 600); await p.evaluate(() => __hg.step(30));
  const before = await p.evaluate(() => __hg.combo());
  await p.evaluate(() => { __hg.attack('factorio'); });
  const dir = await p.evaluate(() => 0);
  const path = [];
  for (let i = 0; i < 8; i++) { await p.mouse.move(550, 600); const c = await p.evaluate(() => { __hg.step(30); return __hg.combo(); }); path.push(Math.round(c.sx) + (c.purity < 100 ? '(hit)' : '')); }
  console.log('mouse held at x=550, spoon x before belt', Math.round(before.sx), 'then every 0.5 s:', path.join(' '));
  await p.evaluate(() => __hg.step(500));
  await p.mouse.move(550, 600); await p.evaluate(() => __hg.step(90));
  console.log('after the belt ends, spoon back near the mouse:', Math.round((await p.evaluate(() => __hg.combo())).sx));
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
