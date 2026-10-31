const { chromium } = require('playwright'); const fs = require('fs');
// Where does purity come back from during a boss fight? Same bot, upgrades at one level, healing split by source.
const mob = process.env.MOB === '1', LV = +(process.env.LV || 4), BOSSES = (process.env.B || '1,4,6,7').split(',').map(Number);
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
  const ctx = await b.newContext(mob ? { viewport: { width: 375, height: 635 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1100, height: 760 } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/' + (mob ? 'page-m.html' : 'page.html') + '#debug'); await p.waitForTimeout(300);
  await p.addScriptTag({ content: fs.readFileSync(__dirname + '/dodgebot.js', 'utf8') });
  await p.evaluate(() => document.getElementById('startBtn').click());
  for (const i of BOSSES) {
    const r = await p.evaluate(({ i, LV }) => {
      if (__hg.get().state !== 'play') document.getElementById('startBtn').click();
      __hg.freeze(true); __hg.inv(false);
      for (const k of ['thick', 'bee', 'colonex', 'wax', 'magnet', 'smoker', 'queen', 'shield']) __hg.setUpg(k, LV);
      __hg.jump(i); __hg.setPurity(100); __hg.step(200);
      const t0 = __hg.tallyAll();
      let f = 0, lost = 0, healed = 0, topped = 0;
      while (__hg.get().phase === 'boss' && f < 60 * 400) {
        const a = __hg.combo().purity; dodge(6, { speed: 3, replan: 6 }); f += 6; const c = __hg.combo().purity;
        if (c < a) lost += a - c; else healed += c - a;
        if (c < 40) { __hg.setPurity(c + 40); topped++; }
        if (__hg.get().state !== 'play') break;
      }
      const t1 = __hg.tallyAll(), d = k => (t1[k] || 0) - (t0[k] || 0);
      const beeH = d('beeDrops') * 0.5; // bees mostly catch drops (0.5 each)
      return { boss: i, secs: Math.round(f / 60), lost: Math.round(lost), healed: Math.round(healed), toppedUp: topped,
        fromDrops: +((d('drops') - d('beeDrops')) * 0.5).toFixed(0), fromBees: +beeH.toFixed(0), fromJars: d('jars'), fromBoxes: d('boxes') * 5, fromComb: d('comb') * 18 };
    }, { i, LV });
    console.log(JSON.stringify(r));
  }
  console.log('errors', errs); await b.close();
})();
