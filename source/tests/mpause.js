const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 375, height: 635 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + out + '/page-m.html#debug'); await p.waitForTimeout(400);
  const vis = () => p.evaluate(() => ({ state: __hg.get().state, pauseBtn: !document.getElementById('pauseBtn').hidden, lockBtn: !document.getElementById('lockBtn').hidden }));
  console.log('start screen', JSON.stringify(await vis()));
  await p.tap('#startBtn'); await p.waitForTimeout(200);
  console.log('playing', JSON.stringify(await vis()));
  await p.screenshot({ path: out + '/mp-play.png' });
  await p.tap('#pauseBtn'); await p.waitForTimeout(200);
  console.log('after tapping Pause', JSON.stringify(await vis()));
  await p.tap('#pauseShed'); await p.waitForTimeout(150);
  console.log('shed', JSON.stringify(await vis()));
  await p.tap('#shedDone'); await p.waitForTimeout(150);
  await p.tap('#resumeBtn'); await p.waitForTimeout(150);
  console.log('resumed', JSON.stringify(await vis()));
  // the knight hint
  await p.evaluate(() => { __hg.inv(true); __hg.freeze(true); __hg.achReset(); __hg.jump(2); __hg.step(200); __hg.clearItems(); __hg.spoonTo(60); __hg.attack('knight'); for (let i = 0; i < 300; i++) { __hg.step(1); if (__hg.floats().some(f => /Swipe/.test(f.text))) break; } });
  console.log('knight hint', JSON.stringify(await p.evaluate(() => __hg.floats().filter(f => /Swipe/.test(f.text)))));
  await p.screenshot({ path: out + '/mp-knight.png' });
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
