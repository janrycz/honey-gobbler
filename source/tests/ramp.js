const { chromium } = require('playwright'); const fs = require('fs');
// Endless: how hard each boss is the 1st, 2nd, 3rd and 5th time you meet him in a run (hits a minute for the dodge bot, boss kept alive).
const mob = process.env.MOB === '1';
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
  const ctx = await b.newContext(mob ? { viewport: { width: 375, height: 635 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: 1100, height: 760 } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/' + (mob ? 'page-m.html' : 'page.html') + '#debug'); await p.waitForTimeout(300);
  await p.addScriptTag({ content: fs.readFileSync(__dirname + '/dodgebot.js', 'utf8') });
  await p.evaluate(() => { document.getElementById('startBtn').click(); __hg.freeze(true); __hg.inv(true); });
  const keys = ['keeper', 'colonex', 'ceo', 'ironfit', 'apologist', 'looks', 'disprover'], rows = [];
  for (let i = 0; i < 7; i++) {
    const row = { boss: keys[i] };
    for (const m of [1, 2, 3, 5]) {
      const r = await p.evaluate(([i, m]) => {
        let hits = 0, hp = 0;
        for (let rep = 0; rep < 2; rep++) {
          __hg.setSeen(i, m - 1); __hg.endlessBoss(i); hp = __hg.get().bosses[0].max; __hg.step(200);
          const h0 = __hg.get().hits;
          for (let k = 0; k < 3600; k += 30) { dodge(30); const bb = __hg.get().bosses[0]; if (bb && bb.hp < bb.max * 0.3) __hg.hurtBoss(-bb.max * 0.4); if (__hg.get().phase !== 'boss') break; }
          hits += __hg.get().hits - h0;
        }
        return { hits: hits / 2, hp };
      }, [i, m]);
      row['meet' + m] = r.hits + ' (hp ' + r.hp + ')';
    }
    rows.push(row);
  }
  console.log((mob ? 'PHONE' : 'DESKTOP') + ' endless: hits per minute by meeting number'); console.table(rows); console.log('errors', errs.length ? errs.slice(0, 3) : 'none');
  await b.close();
})();
