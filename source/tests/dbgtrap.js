const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  await p.goto('file://' + __dirname + '/page.html#debug'); await p.waitForTimeout(300);
  await p.addScriptTag({ content: fs.readFileSync(__dirname + '/dodgebot.js', 'utf8') });
  await p.evaluate(() => { document.getElementById('startBtn').click(); __hg.freeze(true); __hg.inv(true); });
  const r = await p.evaluate(([i, atk, x0, every]) => {
    __hg.jump(i); __hg.step(200); __hg.hold();
    __hg.clearProj(); __hg.clearItems(); __hg.spoonTo(x0); __hg.unhurt();
    const bad0 = __hg.bad(), h0 = __hg.get().hits, log = [];
    __hg.attack(atk);
    for (let f = 0; f < 300; f += every) { __hg.hold(); __hg.clearItems(); dodge(every, { speed: 5, replan: every }); const g = __hg.get(); if (f % 6 === 0) log.push(f + ':' + g.sx + (g.hits > h0 ? '*' : '') + ' p' + g.proj); }
    const bad1 = __hg.bad(), d = {}; for (const k in bad1) if (bad1[k] !== (bad0[k] || 0)) d[k] = bad1[k] - (bad0[k] || 0);
    return { d, log: log.join(' ') };
  }, [+process.argv[2], process.argv[3], +process.argv[4], +(process.argv[5] || 1)]);
  console.log(JSON.stringify(r.d)); console.log(r.log.slice(0, 1500));
  await b.close();
})();
