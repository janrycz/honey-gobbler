const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const mob = process.env.MOB === '1';
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
  const ctx = await b.newContext(mob ? { viewport: { width: 375, height: 635 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1100, height: 760 } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/' + (mob ? 'page-m.html' : 'page.html') + '#debug'); await p.waitForTimeout(300);
  await p.addScriptTag({ content: fs.readFileSync(__dirname + '/dodgebot.js', 'utf8') });
  await p.evaluate(() => document.getElementById('startBtn').click());
  for (const atk of ['scouts', 'mark']) {
    const res = [];
    for (let r = 0; r < 4; r++) res.push(await p.evaluate(atk => {
      __hg.freeze(true); __hg.inv(false); __hg.jump(7); __hg.step(200); __hg.clearProj(); __hg.setPurity(100);
      const h0 = __hg.bad(); const before = Object.values(h0).reduce((a, c) => a + c, 0);
      __hg.hold(); __hg.attack(atk); let lost = 0;
      for (let f = 0; f < 60 * 12; f += 3) { __hg.hold(); const a = __hg.combo().purity; dodge(3, { speed: 3, replan: 6 }); const c = __hg.combo().purity; if (c < a) lost += a - c; if (c < 40) __hg.setPurity(c + 40); }
      const after = Object.values(__hg.bad()).reduce((a, c) => a + c, 0);
      return { hits: after - before, lost: Math.round(lost) };
    }, atk));
    console.log(atk, JSON.stringify(res));
  }
  console.log('errors', errs); await b.close();
})();
