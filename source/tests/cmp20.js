const { chromium } = require('playwright'); const fs = require('fs');
const mob = process.env.MOB === '1', page = mob ? 'page-m.html' : 'page.html', bosses = (process.env.B || '5,6,7').split(',').map(Number), reps = +(process.env.R || 2);
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
  const ctx = await b.newContext(mob ? { viewport: { width: 375, height: 635 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1100, height: 760 } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/' + page + '#debug'); await p.waitForTimeout(300);
  await p.addScriptTag({ content: fs.readFileSync(__dirname + '/dodgebot.js', 'utf8') });
  for (const i of bosses) for (let r = 0; r < reps; r++) {
    const res = await p.evaluate(i => {
      if (__hg.get().state !== 'play') document.getElementById('startBtn').click();
      __hg.freeze(true); __hg.inv(false);
      for (const k of ['thick', 'bee', 'colonex', 'wax', 'magnet', 'smoker', 'queen', 'shield']) __hg.setUpg(k, 4);
      __hg.jump(i); __hg.step(200);
      let f = 0, lost = 0;
      while (__hg.get().phase === 'boss' && f < 60 * 400) { const a = __hg.combo().purity; dodge(6, { speed: 3, replan: 6 }); f += 6; const c = __hg.combo().purity; if (c < a) lost += a - c; if (c < 40) __hg.setPurity(c + 40); if (__hg.get().state !== 'play') break; if (f % 900 === 0) { __hg.power('smoker'); } }
      return { boss: __hg.get().bosses[0] ? __hg.get().bosses[0].key : i, secs: Math.round(f / 60), hits: __hg.get().hits, lost: Math.round(lost) };
    }, i);
    res.perMin = +(res.lost / (res.secs / 60)).toFixed(1);
    console.log(JSON.stringify(res));
    await p.evaluate(() => { __hg.harvest(0); });
  }
  console.log('errors', errs);
  await b.close();
})();
