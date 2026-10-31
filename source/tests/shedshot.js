const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  await p.goto('file://' + __dirname + '/page.html#debug'); await p.waitForTimeout(300);
  await p.evaluate(() => document.getElementById('startBtn').click());
  await p.evaluate(() => { __hg.freeze(true); __hg.jump(2); __hg.step(200); __hg.hurtBoss(99999); for (let i = 0; i < 400; i++) __hg.step(1); });
  await p.waitForTimeout(300); await p.screenshot({ path: __dirname + '/x24-shed.png' });
  console.log(await p.evaluate(() => document.querySelector('#shedScreen .wallet').textContent + ' | ' + document.getElementById('shedNext').textContent + ' | HUD: ' + document.getElementById('next').textContent));
  await b.close();
})();
