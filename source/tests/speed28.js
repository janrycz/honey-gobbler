const { chromium } = require('playwright');
(async () => {
  const mob = process.env.MOB === '1';
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
  const ctx = await b.newContext(mob ? { viewport: { width: 375, height: 700 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1100, height: 760 } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/' + (mob ? 'page-m.html' : 'page.html') + '#debug'); await p.waitForTimeout(400);
  const tag = mob ? 'm' : 'd', r = {};
  await p.$eval('#startScreen .speedrow', el => el.scrollIntoView({ block: 'center' }));
  await p.screenshot({ path: __dirname + '/x28-' + tag + '-start.png' });
  const setSpeed = (sel, i) => p.evaluate(([sel, i]) => { const el = document.querySelector(sel + ' .speedIn'); el.value = i; el.dispatchEvent(new Event('input', { bubbles: true })); return document.querySelector(sel + ' .speedVal').textContent; }, [sel, i]);
  r.startLabel = await setSpeed('#startScreen', 3);
  r.stored = await p.evaluate(() => localStorage.getItem('honey-gobbler-speed'));
  await p.evaluate(() => document.getElementById('startBtn').click());
  await p.evaluate(() => __hg.inv(true));
  const meas = async ms => { const a = await p.evaluate(() => [__hg.get().t, performance.now()]); await p.waitForTimeout(ms); const z = await p.evaluate(() => [__hg.get().t, performance.now()]); return +((z[0] - a[0]) / ((z[1] - a[1]) / 1000)).toFixed(2); };
  r.ratio2x = await meas(3000);
  r.hud = await p.evaluate(() => document.getElementById('next').textContent);
  r.duringPlay = await setSpeed('#startScreen', 0); // ignored while playing
  r.speedAfterPlayInput = await p.evaluate(() => __hg.speed());
  await p.keyboard.press('p'); await p.waitForTimeout(200);
  r.pauseLabel = await p.evaluate(() => document.querySelector('#pauseScreen .speedVal').textContent);
  await p.screenshot({ path: __dirname + '/x28-' + tag + '-pause.png' });
  r.pauseSet = await setSpeed('#pauseScreen', 4);
  await p.click('#resumeBtn'); await p.waitForTimeout(300);
  r.ratio25x = await meas(3000);
  await p.keyboard.press('p'); await p.waitForTimeout(200);
  await setSpeed('#pauseScreen', 0);
  await p.click('#resumeBtn'); await p.waitForTimeout(300);
  r.ratio1x = await meas(3000);
  r.hud1 = await p.evaluate(() => document.getElementById('next').textContent);
  // cost of one game step in a heavy fight (the hornet), to see what 2.5x costs per frame
  r.stepMs = await p.evaluate(() => { __hg.freeze(true); __hg.jump(8); __hg.step(400); const t0 = performance.now(); for (let i = 0; i < 300; i++) { __hg.hold(); __hg.step(1); } return +((performance.now() - t0) / 300).toFixed(2); });
  await p.reload(); await p.waitForTimeout(400);
  r.afterReload = await p.evaluate(() => document.querySelector('#startScreen .speedVal').textContent);
  console.log(JSON.stringify(r, null, 1)); console.log('errors', errs);
  await b.close();
})();
