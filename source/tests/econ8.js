const { chromium } = require('playwright');
// Fast simulation: the auto-player catches honey and uses its powers; the shed buys the cheapest upgrade it can afford.
// strategy 'sav' = spend shed savings only; 'all' = spend savings and harvest.
(async () => {
  const out = process.argv[2], strat = process.argv[3] || 'sav', maxRounds = +(process.argv[4] || 10);
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
  const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + out + '/page.html#debug');
  await p.waitForTimeout(400);
  await p.evaluate(() => document.getElementById('startBtn').click());
  await p.evaluate(() => { __hg.inv(true); __hg.bot(true); __hg.freeze(true); __hg.achReset(); });
  const log = []; let fightStart = null, lastBoss = null, maxedAt = null;
  for (let iter = 0; iter < 4000; iter++) {
    const g = await p.evaluate(() => {
      for (let i = 0; i < 6; i++) { __hg.step(20); const u = __hg.get().upg; for (const k of ['magnet', 'extractor', 'queen']) if (u[k]) __hg.power(k); }
      return __hg.get();
    });
    if (g.phase === 'boss' && !fightStart) { fightStart = { t: g.t, key: g.bosses.map(x => x.key).join('+'), hp: g.bosses.map(x => x.max).join('+'), sav: g.savings }; }
    if (g.state === 'shed' || g.state === 'won') {
      if (fightStart) { log.push({ boss: fightStart.key, hp: fightStart.hp, round: g.endless ? g.endlessRound : '-', fight_s: +(g.t - fightStart.t).toFixed(0), saved: +(g.savings - fightStart.sav).toFixed(1), t: g.t }); fightStart = null; }
      if (g.state === 'won') { await p.evaluate(() => __hg.endless()); continue; }
      const bought = await p.evaluate(strat => {
        const got = [];
        for (let n = 0; n < 60; n++) {
          const g = __hg.get(), budget = strat === 'all' ? g.wallet : g.savings;
          const opts = __hg.shop().filter(s => !s.locked && !s.maxed && !s.sold && s.id !== 'crazy' && s.cost <= budget).sort((a, b) => a.cost - b.cost);
          if (!opts.length) break;
          __hg.buy(opts[0].id); got.push(opts[0].id);
        }
        __hg.closeShed();
        return got;
      }, strat);
      const g2 = await p.evaluate(() => __hg.get());
      const lv = Object.entries(g2.upg).filter(([k]) => k !== 'crazy').reduce((s, [, v]) => s + v, 0);
      log[log.length - 1].bought = bought.length; log[log.length - 1].levels = lv; log[log.length - 1].spent = g2.spent; log[log.length - 1].savLeft = g2.savings;
      if (lv >= 80 && maxedAt === null) maxedAt = log.length;
      if (g2.endless && g2.endlessRound >= maxRounds) break;
    }
    if (g.state === 'over') { console.log('died?'); break; }
  }
  console.table(log.map(r => ({ boss: r.boss, hp: r.hp, round: r.round, fight_s: r.fight_s, saved: r.saved, bought: r.bought, levels: r.levels, spent: r.spent, t_min: +(r.t / 60).toFixed(1) })));
  console.log('maxed after fight #', maxedAt, 'errors', errs.length ? errs : 'none');
  await b.close();
})();
