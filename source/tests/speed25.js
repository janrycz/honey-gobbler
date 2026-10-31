const { chromium } = require('playwright'); const fs = require('fs');
// Fastest-possible story run: the bot never gets hurt (so it never has to dodge instead of catching honey),
// buys damage first, fires every power on cooldown. A rough floor for what a very good player could do.
(async () => {
  const mob = process.env.MOB === '1';
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
  const ctx = await b.newContext(mob ? { viewport: { width: 375, height: 635 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1100, height: 760 } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/' + (mob ? 'page-m.html' : 'page.html') + '#debug'); await p.waitForTimeout(300);
  await p.addScriptTag({ content: fs.readFileSync(__dirname + '/dodgebot.js', 'utf8') });
  await p.evaluate(() => document.getElementById('startBtn').click());
  await p.evaluate(() => { __hg.freeze(true); __hg.inv(true); });
  const PRI = ['thick', 'queen', 'bee', 'colonex', 'lab', 'sweet', 'hives', 'magnet', 'extractor', 'smoker'];
  const log = []; let lastPhase = 'harvest', t0 = 0, harvestT = 0, fightT = 0;
  for (let guard = 0; guard < 5000; guard++) {
    const g = await p.evaluate(() => { for (let i = 0; i < 10; i++) { dodge(6, { speed: 3, replan: 6 }); const u = __hg.get().upg; for (const k of ['queen', 'lab', 'magnet', 'extractor', 'smoker']) if (u[k]) __hg.power(k); if (__hg.get().state !== 'play') break; } return __hg.get(); });
    if (g.phase !== lastPhase && g.state === 'play') { const dt = g.t - t0; if (lastPhase === 'boss') fightT += dt; else harvestT += dt; t0 = g.t; lastPhase = g.phase; }
    if (g.state === 'shed') {
      const dt = g.t - t0; fightT += dt; t0 = g.t; lastPhase = 'harvest';
      const bought = await p.evaluate(PRI => { const out = []; for (let n = 0; n < 40; n++) { const w = __hg.get().wallet; const o = __hg.shop().filter(s => !s.locked && !s.maxed && PRI.includes(s.id) && s.cost <= w).sort((a, c) => PRI.indexOf(a.id) - PRI.indexOf(c.id)); if (!o.length) break; __hg.buy(o[0].id); out.push(o[0].id); } document.getElementById('shedDone').click(); return out.join(','); }, PRI);
      log.push('boss ' + g.bossIdx + ' done at ' + (g.t / 60).toFixed(1) + ' min; bought ' + bought);
    }
    if (g.state === 'won') { fightT += g.t - t0; log.push('WON at ' + (g.t / 60).toFixed(2) + ' min (harvesting ' + (harvestT / 60).toFixed(1) + ', boss fights ' + (fightT / 60).toFixed(1) + ')'); break; }
  }
  console.log(log.join('\n')); console.log('errors', errs); await b.close();
})();
