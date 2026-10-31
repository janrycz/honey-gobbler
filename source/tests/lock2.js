const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1100, height: 760 } })).newPage();
  await p.goto('file://' + out + '/page.html#debug'); await p.waitForTimeout(300);
  await p.evaluate(() => { window.__mv = []; document.addEventListener('pointermove', e => window.__mv.push([e.type, e.movementX, e.clientX, !!document.pointerLockElement]), true); });
  const box = await p.evaluate(() => { const r = document.getElementById('startBtn').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await p.click('#startBtn'); await p.waitForTimeout(300);
  await p.evaluate(() => { window.__mv = []; });
  const s0 = await p.evaluate(() => __hg.get().sx);
  for (let i = 1; i <= 5; i++) { await p.mouse.move(box[0] + i * 30, box[1]); await p.waitForTimeout(50); }
  await p.waitForTimeout(300);
  console.log('start button at', box, 'spoon', s0, '->', await p.evaluate(() => __hg.get().sx));
  console.log(JSON.stringify(await p.evaluate(() => window.__mv)));
  await b.close();
})();
