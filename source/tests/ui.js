const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const errs = [];
  for (const [vw, vh, tag] of [[1100, 760, 'w'], [390, 780, 'm']]) {
    const ctx = await b.newContext(vw < 600 ? { viewport: { width: vw, height: vh }, deviceScaleFactor: 2, hasTouch: true, isMobile: true } : { viewport: { width: vw, height: vh } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(tag + ' PAGEERR ' + e.message));
    await p.goto('file://' + out + '/page.html#debug');
    await p.waitForTimeout(500);
    await p.evaluate(() => __hg.achReset());
    await p.screenshot({ path: `${out}/u-${tag}-start.png` });
    // achievements from the start screen, then close back to it
    await p.evaluate(() => document.querySelector('#startScreen [data-ach]').click());
    await p.waitForTimeout(150);
    const achOpen = await p.evaluate(() => !document.getElementById('achScreen').hidden && document.getElementById('startScreen').hidden);
    await p.evaluate(() => document.getElementById('achClose').click());
    const backToStart = await p.evaluate(() => document.getElementById('achScreen').hidden && !document.getElementById('startScreen').hidden);
    console.log(tag, 'ach from start opens', achOpen, 'closes back', backToStart);
    await p.evaluate(() => document.getElementById('startBtn').click());
    await p.evaluate(() => { __hg.inv(true); __hg.freeze(true); });
    // trust me bro: beat the keeper without being hit
    await p.evaluate(() => { __hg.jump(0); __hg.step(200); __hg.hurtBoss(999); __hg.step(220); });
    let g = await p.evaluate(() => __hg.get());
    console.log(tag, 'after keeper: state', g.state, 'ach', g.ach.join(','), 'savings', g.savings);
    await p.evaluate(() => { __hg.setSav(30); __hg.shed(); });
    await p.evaluate(() => { __hg.buy('thick'); __hg.buy('bee'); });
    await p.evaluate(() => document.querySelector('.tile[data-id="thick"]').click());
    await p.waitForTimeout(100);
    const thickBtn = await p.evaluate(() => [document.querySelector('.tile[data-id="thick"] .pr').textContent, document.getElementById('buyBtn').textContent, document.getElementById('gLine').textContent]);
    console.log(tag, 'thick after buying once:', JSON.stringify(thickBtn));
    await p.evaluate(() => document.querySelector('.tile[data-id="smoker"]').click());
    await p.evaluate(() => document.getElementById('buyBtn').click());
    await p.waitForTimeout(100);
    console.log(tag, 'confirm:', await p.evaluate(() => document.getElementById('confirmText').textContent));
    await p.screenshot({ path: `${out}/u-${tag}-shed-confirm.png` });
    await p.evaluate(() => document.getElementById('confirmYes').click());
    // premium product: buy after the price rise, toast should sit low in the shed
    await p.evaluate(() => { __hg.closeShed(); __hg.jump(4); __hg.step(200); __hg.hurtBoss(999); __hg.step(220); __hg.setSav(200); });
    await p.evaluate(() => document.querySelector('.tile[data-id="magnet"]').click());
    await p.evaluate(() => document.getElementById('buyBtn').click());
    await p.evaluate(() => document.getElementById('confirmYes').click());
    await p.waitForTimeout(300);
    console.log(tag, 'toast:', await p.evaluate(() => { const t = document.getElementById('toast'); return t.className + ' | ' + t.textContent; }));
    await p.screenshot({ path: `${out}/u-${tag}-shed-premium.png` });
    // crazy mode tile: max everything in endless
    await p.evaluate(() => { __hg.closeShed(); for (const k of ['thick', 'bee', 'colonex', 'smoker', 'magnet', 'extractor', 'queen']) __hg.setUpg(k, 10); __hg.endlessBoss(2); __hg.step(200); __hg.hurtBoss(9999); __hg.step(220); __hg.setSav(600); });
    await p.evaluate(() => document.querySelector('.tile[data-id="crazy"]').click());
    await p.waitForTimeout(100);
    console.log(tag, 'crazy tile visible', await p.evaluate(() => !document.querySelector('.tile[data-id="crazy"]').hidden), await p.evaluate(() => document.getElementById('buyBtn').textContent));
    await p.evaluate(() => document.getElementById('buyBtn').click());
    await p.evaluate(() => document.getElementById('confirmYes').click());
    await p.waitForTimeout(100);
    console.log(tag, 'after buying crazy', await p.evaluate(() => [document.getElementById('buyBtn').textContent, __hg.get().crazyOn, document.getElementById('next').textContent]));
    await p.screenshot({ path: `${out}/u-${tag}-shed-crazy.png` });
    await p.evaluate(() => document.getElementById('buyBtn').click());
    console.log(tag, 'toggle off', await p.evaluate(() => [document.getElementById('buyBtn').textContent, __hg.get().crazyOn, document.getElementById('gLine').textContent]));
    await p.evaluate(() => document.getElementById('buyBtn').click());
    // next endless boss should be two at once
    await p.evaluate(() => { __hg.closeShed(); __hg.give(400); __hg.step(5); });
    g = await p.evaluate(() => __hg.get());
    console.log(tag, 'next endless fight', JSON.stringify(g.bosses.map(x => x.key)), 'ally', g.ally);
    // pause -> achievements -> back to pause
    await p.evaluate(() => { __hg.freeze(false); });
    await p.keyboard.press('p');
    await p.waitForTimeout(100);
    await p.evaluate(() => document.querySelector('#pauseScreen [data-ach]').click());
    await p.waitForTimeout(200);
    await p.screenshot({ path: `${out}/u-${tag}-ach.png` });
    await p.keyboard.press('Escape');
    console.log(tag, 'esc returns to pause', await p.evaluate(() => !document.getElementById('pauseScreen').hidden && document.getElementById('achScreen').hidden));
    console.log(tag, 'ach now', JSON.stringify(await p.evaluate(() => __hg.get().ach)));
    await ctx.close();
  }
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
