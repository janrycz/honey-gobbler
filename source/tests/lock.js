const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const p = await (await b.newContext({ viewport: { width: 1100, height: 760 } })).newPage();
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + out + '/page.html#debug'); await p.waitForTimeout(300);
  const st = () => p.evaluate(() => Object.assign(__hg.lockState(), { state: __hg.get().state, ple: document.pointerLockElement ? document.pointerLockElement.id : null }));
  console.log('before start', JSON.stringify(await st()));
  await p.click('#startBtn'); await p.waitForTimeout(300);
  console.log('after start click', JSON.stringify(await st()));
  // relative movement while locked
  const sx0 = await p.evaluate(() => __hg.get().sx);
  await p.mouse.move(600, 500); await p.mouse.move(700, 500); await p.waitForTimeout(200);
  console.log('spoon moved from', sx0, 'to', await p.evaluate(() => __hg.get().sx));
  // Escape frees the mouse and pauses
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  console.log('after Escape', JSON.stringify(await st()), 'pause shown', await p.evaluate(() => !document.getElementById('pauseScreen').hidden), 'button', await p.evaluate(() => [document.getElementById('lockBtn').hidden, document.getElementById('lockBtn').textContent]));
  await p.waitForTimeout(1500);
  await p.click('#resumeBtn'); await p.waitForTimeout(300);
  console.log('after resume click', JSON.stringify(await st()));
  // the shed between bosses frees it; leaving the shed locks it again
  await p.evaluate(() => __hg.shed()); await p.waitForTimeout(200);
  console.log('in shed', JSON.stringify(await st()));
  await p.waitForTimeout(1400);
  await p.click('#shedDone'); await p.waitForTimeout(300);
  console.log('after shed', JSON.stringify(await st()));
  // game over frees it
  await p.evaluate(() => { __hg.setRevives(0); __hg.kill(); }); await p.waitForTimeout(200);
  console.log('game over', JSON.stringify(await st()));
  // switching it off
  await p.click('#againBtn'); await p.waitForTimeout(300);
  await p.keyboard.press('p'); await p.waitForTimeout(200);
  await p.click('#lockBtn'); await p.waitForTimeout(100);
  console.log('toggle', await p.evaluate(() => document.getElementById('lockBtn').textContent), JSON.stringify(await st()));
  await p.waitForTimeout(1400);
  await p.click('#resumeBtn'); await p.waitForTimeout(300);
  console.log('resume with lock off', JSON.stringify(await st()));
  console.log('ERRORS', JSON.stringify(errs));
  // a page that isn't allowed to lock
  const q = await (await b.newContext({ viewport: { width: 1100, height: 760 } })).newPage();
  q.on('pageerror', e => errs.push('noLock ' + e.message));
  await q.addInitScript(() => { Element.prototype.requestPointerLock = function () { setTimeout(() => document.dispatchEvent(new Event('pointerlockerror')), 10); return Promise.reject(new Error('blocked')); }; });
  await q.goto('file://' + out + '/page.html#debug'); await q.waitForTimeout(300);
  await q.click('#startBtn'); await q.waitForTimeout(200);
  for (let i = 0; i < 4; i++) { await q.mouse.click(500, 400); await q.waitForTimeout(400); }
  await q.keyboard.press('p'); await q.waitForTimeout(200);
  console.log('blocked page', JSON.stringify(await q.evaluate(() => Object.assign(__hg.lockState(), { state: __hg.get().state }))), await q.evaluate(() => document.getElementById('lockBtn').textContent));
  await q.click('#lockBtn'); await q.waitForTimeout(100);
  console.log('after retry click', JSON.stringify(await q.evaluate(() => __hg.lockState())), await q.evaluate(() => [document.getElementById('lockBtn').textContent, document.getElementById('lockBtn').disabled]));
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
