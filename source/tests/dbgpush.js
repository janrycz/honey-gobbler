const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
  const ctx = await b.newContext({ viewport: { width: 375, height: 635 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto('file://' + __dirname + '/page-m.html#debug'); await p.waitForTimeout(300);
  await p.addScriptTag({ content: fs.readFileSync(__dirname + '/dodgebot.js', 'utf8') });
  await p.evaluate(() => { document.getElementById('startBtn').click(); __hg.freeze(true); __hg.inv(true); });
  const r = await p.evaluate(() => {
    __hg.jump(3); __hg.step(200);
    const out = [];
    for (let s = 0; s < 3; s++) {
      __hg.clearProj(); __hg.clearItems(); __hg.unhurt(); __hg.bossAt(187); __hg.hold(); __hg.spoonTo(40);
      const b0 = __hg.bad(), h0 = __hg.get().hits; __hg.attack('pushups'); const log = [];
      for (let f = 0; f < 400; f++) { __hg.hold(); __hg.clearItems(); dodge(1, { speed: 5, replan: 1 }); const g = __hg.get(); if (f % 15 === 0) log.push(g.sx + (g.hits > h0 ? '*' : '') + '/' + __hg.projKinds().plate); }
      const b1 = __hg.bad(), d = {}; for (const k in b1) if (b1[k] !== (b0[k] || 0)) d[k] = b1[k] - (b0[k] || 0);
      out.push(JSON.stringify(d) + ' ' + log.join(' '));
    }
    return out;
  });
  console.log(r.join('\n')); await b.close();
})();
