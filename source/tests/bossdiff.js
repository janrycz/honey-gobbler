const { chromium } = require('playwright');
const fs = require('fs');
// Plays whole story runs the way a person might: the dodge bot (0.2 s reactions, limited speed) harvests and fights,
// fires every power as soon as it's ready, and the shed buys the cheapest thing it can afford from savings.
// For each boss: fight length, purity lost (gross), hits, and loss per minute. Every fight starts at 100% purity;
// if purity would run out, it's topped back up and counted as a death.
const out = process.argv[2], reps = +(process.argv[3] || 3), page = process.env.PAGE || 'page.html', mob = process.env.MOB === '1';
const botSrc = fs.readFileSync(out + '/dodgebot.js', 'utf8');
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
  const all = [];
  const errs = [];
  for (let rep = 0; rep < reps; rep++) {
    const ctx = await b.newContext(mob ? { viewport: { width: 375, height: 635 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: 1100, height: 760 } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + out + '/' + page + '#debug'); await p.waitForTimeout(300);
    await p.addScriptTag({ content: botSrc });
    await p.evaluate(() => { document.getElementById('startBtn').click(); __hg.freeze(true); __hg.achReset(); });
    const log = [];
    let cur = null, guard = 0;
    while (guard++ < 4000) {
      const r = await p.evaluate(() => {
        const res = { dmg: 0, heal: 0, deaths: 0 };
        if (window.__vp === undefined) window.__vp = 100;
        for (let c = 0; c < 25; c++) {
          const before = __hg.combo().purity;
          dodge(12);
          const g = __hg.get();
          if (g.state !== 'play') { res.g = g; return res; }
          const u = g.upg;
          for (const k of ['smoker', 'magnet', 'extractor', 'queen']) if (u[k] && (k !== 'smoker' && k !== 'queen' || g.phase === 'boss')) __hg.power(k);
          const after = __hg.combo().purity;
          if (after < before) { res.dmg += before - after; window.__vp -= before - after; } else { res.heal += after - before; window.__vp = Math.min(100, window.__vp + after - before); }
          if (window.__vp <= 0) { res.deaths++; window.__vp = 50; } // a second chance brings you back at 50%
          if (after < 40) __hg.setPurity(Math.min(100, after + 40)); // keep the real game alive; the virtual purity above is what counts
        }
        res.g = __hg.get();
        return res;
      });
      const g = r.g;
      if (g.phase === 'boss' && g.state === 'play') {
        if (!cur) { cur = { boss: g.bosses.map(x => x.key).join('+'), hp: g.bosses.map(x => x.max).join('+'), t0: g.t, dmg: 0, heal: 0, deaths: 0, upg: g.upg, bad0: await p.evaluate(() => { __hg.setPurity(100); window.__vp = 100; return __hg.bad(); }) }; continue; }
        cur.dmg += r.dmg; cur.heal += r.heal; cur.deaths += r.deaths;
      } else if (cur && g.phase !== 'boss') { cur.dmg += r.dmg; cur.heal += r.heal; cur.deaths += r.deaths; }
      if (g.state === 'shed' || g.state === 'won') {
        if (cur) {
          const secs = g.t - cur.t0;
          const bad1 = await p.evaluate(() => __hg.bad()), by = {};
          for (const [k, v] of Object.entries(bad1)) { const d = v - (cur.bad0[k] || 0); if (d) by[k] = d; }
          (global.byAttack = global.byAttack || {})[cur.boss] = Object.entries(by).reduce((m, [k, v]) => (m[k] = (m[k] || 0) + v, m), global.byAttack[cur.boss] || {});
          log.push({ boss: cur.boss, hp: cur.hp, secs: +secs.toFixed(0), lost: +cur.dmg.toFixed(0), healed: +cur.heal.toFixed(0), hits: g.hits, net: +(cur.dmg - cur.heal).toFixed(0), lostPerMin: +(cur.dmg / secs * 60).toFixed(1), deaths: cur.deaths, levels: Object.entries(cur.upg).filter(([k]) => k !== 'crazy').map(([k, v]) => v ? k[0] + v : '').join('') });
          cur = null;
        }
        if (g.state === 'won') break;
        await p.evaluate(() => {
          for (let n = 0; n < 60; n++) {
            const g = __hg.get();
            const opts = __hg.shop().filter(s => !s.locked && !s.maxed && s.id !== 'crazy' && s.cost <= g.savings).sort((a, b) => a.lv - b.lv || a.cost - b.cost);
            if (!opts.length) break;
            __hg.buy(opts[0].id);
          }
          __hg.closeShed();
        });
      }
      if (g.state === 'over') { log.push({ boss: 'GAME OVER' }); break; }
    }
    all.push(log);
    await ctx.close();
  }
  // average per boss
  const keys = all[0].map(r => r.boss);
  const rows = keys.map((k, i) => {
    const rs = all.map(l => l[i]).filter(Boolean);
    const avg = f => +(rs.reduce((s, r) => s + (r[f] || 0), 0) / rs.length).toFixed(1);
    return { boss: k, hp: rs[0].hp, secs: avg('secs'), lost: avg('lost'), healed: avg('healed'), hits: avg('hits'), net: avg('net'), lostPerMin: avg('lostPerMin'), deaths: avg('deaths'), upgrades: rs[0].levels };
  });
  console.log(mob ? 'PHONE 375x635' : 'DESKTOP 1100x760', 'runs:', reps);
  console.table(rows);
  for (const [k, v] of Object.entries(global.byAttack || {})) console.log(k.padEnd(10), Object.entries(v).sort((a, b) => b[1] - a[1]).map(([n, c]) => n + ' ' + (c / reps).toFixed(1)).join(', '));
  console.log('errors', errs.length ? errs.slice(0, 5) : 'none');
  await b.close();
})();
