const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const errs = [];
  for (const mob of [false, true]) {
    const ctx = await b.newContext(mob ? { viewport: { width: 375, height: 635 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1100, height: 760 } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + out + '/' + (mob ? 'page-m.html' : 'page.html') + '#debug'); await p.waitForTimeout(300);
    await p.evaluate(() => document.getElementById('startBtn').click());
    const tag = mob ? 'phone' : 'desk';
    const R = {};
    // Big Bang size
    R.bigBang = await p.evaluate(() => { __hg.inv(true); __hg.freeze(true); __hg.jump(6); __hg.step(200); __hg.clearItems(); __hg.attack('bigbang'); const pj = __hg.threats().proj.find(q => q.k === 'ring'); return { R: Math.round(pj.R), W: __hg.sizes().W, widthShare: +(2 * pj.R / __hg.sizes().W).toFixed(2) }; });
    await p.evaluate(() => __hg.step(90));
    await p.screenshot({ path: `${out}/c-${tag}-bigbang.png` });
    // knight: the move label, a hit on you, then you taking one
    await p.evaluate(() => { __hg.jump(2); __hg.step(200); __hg.clearItems(); __hg.spoonTo(__hg.sizes().W * 0.3); __hg.attack('knight'); for (let i = 0; i < 400; i++) { __hg.step(1); const k = __hg.threats().proj.find(q => q.k === 'knight'); if (k && k.st === 'tele' && Math.abs(k.ty - k.floor) < 5) break; } });
    await p.screenshot({ path: `${out}/c-${tag}-knight-tele.png` });
    R.knightHit = await p.evaluate(() => { __hg.inv(false); __hg.setPurity(100); const k = __hg.threats().proj.find(q => q.k === 'knight'); if (k) __hg.spoonTo(k.tx); for (let i = 0; i < 60; i++) __hg.step(1); __hg.inv(true); return __hg.floats().map(f => f.text).filter(t => /x|=Q/.test(t)); });
    R.capture = await p.evaluate(() => { __hg.step(60); __hg.spoonTo(60); const k = __hg.knightNow(__hg.sizes().W * 0.5); __hg.step(1); __hg.spoonTo(__hg.sizes().W * 0.8); __hg.step(2); return __hg.floats().map(f => f.text).filter(t => /^Sx/.test(t)); });
    await p.evaluate(() => __hg.step(4));
    await p.screenshot({ path: `${out}/c-${tag}-capture.png` });
    // a bishop and a pawn reaching you, and a lethal one
    R.pieces = await p.evaluate(() => {
      const res = [];
      __hg.jump(2); __hg.step(200); __hg.clearItems(); __hg.inv(false); __hg.setPurity(100); __hg.spoonTo(__hg.sizes().W * 0.6);
      __hg.attack('chess'); for (let i = 0; i < 600 && __hg.get().purity === 100; i++) __hg.step(1);
      res.push(...__hg.floats().map(f => f.text).filter(t => /Bx|=Q/.test(t)));
      __hg.setPurity(5); __hg.setRevives(0); __hg.attack('checkmate'); for (let i = 0; i < 600 && __hg.get().state === 'play'; i++) __hg.step(1);
      res.push('state ' + __hg.get().state, ...__hg.floats().map(f => f.text).filter(t => /#/.test(t)));
      return res;
    });
    R.achName = await p.evaluate(() => { const el = document.createElement('div'); return [...document.querySelectorAll('#achList h4')].length; });
    console.log(tag, JSON.stringify(R));
  }
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
