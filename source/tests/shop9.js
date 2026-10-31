// The exact Shopify files: they match, the game plays, the pause menu's shed works, on a computer and on a phone.
const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
  const errs = [];
  for (const mob of [false, true]) {
    const ctx = await b.newContext(mob ? { viewport: { width: 375, height: 635 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1340, height: 815 } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push((mob ? 'phone ' : 'desk ') + e.message));
    await p.goto('file://' + out + '/shop/index.html'); await p.waitForTimeout(600);
    const r = {};
    r.build = await p.evaluate(() => [window.HG_BUILD, [...document.body.children].some(d => d.textContent.startsWith('Wrong game script')), document.querySelector('h1').textContent, document.querySelector('.achcount').textContent]);
    if (mob) await p.tap('#startBtn'); else await p.click('#startBtn');
    await p.waitForTimeout(2500);
    r.playing = await p.evaluate(() => [document.getElementById('kg').textContent, !document.getElementById('pauseBtn').hidden, !!document.pointerLockElement]);
    if (mob) await p.tap('#pauseBtn'); else { await p.keyboard.press('Escape'); await p.waitForTimeout(200);}
    await p.waitForTimeout(300);
    r.paused = await p.evaluate(() => [!document.getElementById('pauseScreen').hidden, document.getElementById('pauseRevive').textContent, document.getElementById('lockBtn').hidden ? 'no lock button' : document.getElementById('lockBtn').textContent]);
    if (mob) await p.tap('#pauseShed'); else await p.click('#pauseShed');
    await p.waitForTimeout(300);
    r.shed = await p.evaluate(() => [...document.querySelectorAll('.tile')].filter(t => !t.hidden).map(t => t.querySelector('.nm').textContent + ' ' + t.querySelector('.pr').textContent).join(' | '));
    await p.screenshot({ path: out + '/s9-' + (mob ? 'phone' : 'desk') + '.png' });
    if (mob) await p.tap('#shedDone'); else await p.click('#shedDone');
    await p.waitForTimeout(200);
    if (mob) await p.tap('#resumeBtn'); else await p.click('#resumeBtn');
    await p.waitForTimeout(1500);
    r.resumed = await p.evaluate(() => [document.getElementById('pauseScreen').hidden, document.getElementById('kg').textContent, !!document.pointerLockElement]);
    console.log(mob ? 'PHONE' : 'DESKTOP', JSON.stringify(r, null, 1));
  }
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
