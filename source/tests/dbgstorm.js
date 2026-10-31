const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
  const ctx = await b.newContext({ viewport: { width: 375, height: 635 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto('file://' + __dirname + '/page-m.html#debug'); await p.waitForTimeout(300);
  await p.addScriptTag({ content: fs.readFileSync(__dirname + '/dodgebot.js', 'utf8') });
  await p.evaluate(() => { document.getElementById('startBtn').click(); __hg.freeze(true); __hg.inv(true); });
  const r = await p.evaluate(() => {
    __hg.jump(6); __hg.step(200);
    const out = [];
    for (let s = 0; s < 3; s++) {
      __hg.clearProj(); __hg.clearItems(); __hg.unhurt(); __hg.bossAt(187); __hg.hold(); __hg.spoonTo(40 + s * 140);
      const b0 = __hg.bad(), h0 = __hg.get().hits; __hg.attack('quarkStorm'); const log = [];
      for (let f = 0; f < 420; f++) {
        __hg.hold(); __hg.clearItems(); dodge(1, { speed: 5, replan: 1, margin: 1.4 });
        const g = __hg.get(), T = __hg.threats();
        if (f % 20 === 0) log.push('t' + (f / 60).toFixed(1) + ' s' + g.sx + (g.hits > h0 ? '*' : '') + ' ' + T.proj.filter(q => !q.harmless).map(q => q.k[0] + Math.round(q.x) + ',' + Math.round(q.y) + (q.delay > 0 ? 'd' : '')).join(' '));
        if (g.hits > h0) { log.push('HIT t' + (f / 60).toFixed(2)); break; }
      }
      const b1 = __hg.bad(), d = {}; for (const k in b1) if (b1[k] !== (b0[k] || 0)) d[k] = b1[k] - (b0[k] || 0);
      out.push(JSON.stringify(d) + '\n  ' + log.join('\n  '));
    }
    return { out, sy: __hg.threats().sy, S: __hg.threats().S, W: __hg.sizes() };
  });
  console.log(r.out.join('\n')); console.log(r.sy, r.S, JSON.stringify(r.W)); await b.close();
})();
