const { chromium } = require('playwright'); const fs = require('fs');
const mob = process.env.MOB === '1', boss = +(process.env.BOSS || 7), LV = +(process.env.LV || 4);
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
  const ctx = await b.newContext(mob ? { viewport: { width: 375, height: 635 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1100, height: 760 } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/' + (mob ? 'page-m.html' : 'page.html') + '#debug'); await p.waitForTimeout(300);
  await p.addScriptTag({ content: fs.readFileSync(__dirname + '/dodgebot.js', 'utf8') });
  await p.evaluate(() => document.getElementById('startBtn').click());
  const r = await p.evaluate(({ boss, LV }) => {
    __hg.freeze(true); __hg.inv(false);
    for (const k of ['thick', 'bee', 'colonex', 'wax', 'magnet', 'smoker', 'queen', 'shield']) __hg.setUpg(k, LV);
    __hg.jump(boss); __hg.step(200);
    const b0 = __hg.bad(); let f = 0, lost = 0, p2 = null, p3 = null;
    while (__hg.get().phase === 'boss' && f < 60 * 400) { const a = __hg.combo().purity; dodge(6, { speed: 3, replan: 6 }); f += 6; const c = __hg.combo().purity; if (c < a) lost += a - c; if (c < 40) __hg.setPurity(c + 40); if (__hg.get().state !== 'play') break;
      const bb = __hg.get().bosses[0]; if (bb && !p2 && bb.hp < bb.max * 0.5) p2 = Math.round(f / 60); if (bb && !p3 && bb.hp < bb.max * 0.1) p3 = Math.round(f / 60); }
    const b1 = __hg.bad(), d = {};
    for (const k in b1) if (b1[k] - (b0[k] || 0)) d[k] = b1[k] - (b0[k] || 0);
    return { secs: Math.round(f / 60), p2at: p2, p3at: p3, lost: Math.round(lost), perMin: +(lost / (f / 3600)).toFixed(1), hits: __hg.get().hits, byName: d };
  }, { boss, LV });
  console.log(JSON.stringify(r)); console.log('errors', errs);
  await b.close();
})();
