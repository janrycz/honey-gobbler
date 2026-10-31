const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const errs = [];
  const p = await (await b.newContext({ viewport: { width: 1100, height: 760 } })).newPage();
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + out + '/page.html#debug'); await p.waitForTimeout(300);
  await p.click('#startBtn');
  const box = await p.evaluate(() => { const r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.left, y: r.top, h: r.height }; });
  const ceo = await p.evaluate(() => __hg.bossKeys().indexOf('ceo'));
  // KNIGHT, real mouse, game running in real time: let it hop down naturally, then swipe across it
  await p.evaluate(i => { __hg.inv(true); __hg.jump(i); __hg.step(300); __hg.clearItems(); }, ceo);
  await p.mouse.move(box.x + 100, box.y + box.h - 40);
  await p.evaluate(() => __hg.attack('knight'));
  let info = null;
  for (let i = 0; i < 80; i++) { await p.waitForTimeout(50); info = await p.evaluate(() => __hg.knightInfo()[0]); if (!info || (Math.abs(info.y - info.floor) < 5 && info.st !== 'jump')) break; }
  const before = await p.evaluate(() => __hg.knightInfo());
  const kx = before[0] && before[0].x;
  const sx = await p.evaluate(() => __hg.get().sx);
  const dir = kx > sx ? 1 : -1;
  for (let x = sx; dir > 0 ? x <= kx + 120 : x >= kx - 120; x += dir * 40) { await p.mouse.move(box.x + x, box.y + box.h - 40); await p.waitForTimeout(16); }
  await p.waitForTimeout(150);
  const after = await p.evaluate(() => __hg.knightInfo());
  console.log('knight on your row before swipe:', JSON.stringify(before), '| spoon at', sx, '| after swipe:', JSON.stringify(after));
  // MAGNET, real key press, real time
  await p.evaluate(() => { __hg.harvest(3); __hg.clearItems(); __hg.setUpg('magnet', 1); __hg.ready(); });
  await p.mouse.move(box.x + 550, box.y + box.h - 40); await p.waitForTimeout(400);
  const sp = await p.evaluate(() => __hg.get().sx);
  await p.evaluate(s => { __hg.fake(s + 40, 470); __hg.fake(s - 50, 430); }, sp);
  const f0 = await p.evaluate(() => __hg.fakes());
  await p.keyboard.press('2'); await p.waitForTimeout(500);
  const f1 = await p.evaluate(() => __hg.fakes());
  console.log('magnet level 1, spoon at', sp, '| fakes before', JSON.stringify(f0), '| 0.5 s later', JSON.stringify(f1));
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
