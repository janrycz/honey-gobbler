const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1100, height: 760 } })).newPage();
  await p.goto('file://' + out + '/page.html#debug'); await p.waitForTimeout(300);
  await p.click('#startBtn'); await p.waitForTimeout(300);
  const send = dx => p.evaluate(dx => document.getElementById('stage').dispatchEvent(new PointerEvent('pointermove', { movementX: dx, pointerType: 'mouse', bubbles: true })), dx);
  const s0 = await p.evaluate(() => __hg.get().sx);
  for (let i = 0; i < 10; i++) await send(15);
  await p.waitForTimeout(400);
  const s1 = await p.evaluate(() => __hg.get().sx);
  await send(580); await send(-580); await p.waitForTimeout(300);
  const s2 = await p.evaluate(() => __hg.get().sx);
  for (let i = 0; i < 100; i++) await send(-15);
  await p.waitForTimeout(400);
  console.log('locked:', await p.evaluate(() => __hg.lockState().locked), '| spoon', s0, '-> right 150 ->', s1, '-> bogus jumps ignored ->', s2, '-> far left (clamped) ->', await p.evaluate(() => __hg.get().sx));
  await b.close();
})();
