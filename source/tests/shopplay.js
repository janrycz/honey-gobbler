const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + out + '/shop/index.html');
  await p.waitForTimeout(400);
  await p.click('#startBtn');
  for (let i = 0; i < 12; i++) { await p.keyboard.down(i % 2 ? 'ArrowLeft' : 'ArrowRight'); await p.waitForTimeout(500); await p.keyboard.up(i % 2 ? 'ArrowLeft' : 'ArrowRight'); }
  console.log('kg after 6 s', await p.textContent('#kg'), 'purity', await p.textContent('#plabel'));
  await p.click('#startScreen [data-ach]').catch(() => {});
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
