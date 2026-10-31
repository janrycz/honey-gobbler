const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 375, height: 635 }, isMobile: true, hasTouch: true })).newPage();
  await p.goto('file://' + process.argv[2] + '/page-m.html'); await p.waitForTimeout(300);
  console.log(await p.evaluate(() => [innerWidth, getComputedStyle(document.getElementById('startBtn')).order, getComputedStyle(document.querySelector('#startScreen .card')).display, [...document.styleSheets].length, matchMedia('(max-width: 520px)').matches]));
  await b.close();
})();
