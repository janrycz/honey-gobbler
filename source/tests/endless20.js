const { chromium } = require('playwright'); const fs = require('fs');
// Endless difficulty: the same bosses at different rounds and meetings, upgrades all at one level, purity loss per minute
const page = process.env.PAGE || 'page.html', LV = +(process.env.LV || 6);
const cases = (process.env.CASES || '0:0:0,4:0:0,6:0:0,0:2:0,4:4:0,6:6:0,0:8:1,4:12:1,6:16:2').split(',').map(c => c.split(':').map(Number)); // boss:round:previous meetings
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
  const p = await b.newPage({ viewport: { width: 1100, height: 760 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/' + page + '#debug'); await p.waitForTimeout(300);
  await p.addScriptTag({ content: fs.readFileSync(__dirname + '/dodgebot.js', 'utf8') });
  await p.evaluate(() => document.getElementById('startBtn').click());
  for (const [i, round, seen] of cases) {
    const r = await p.evaluate(({ i, round, seen, LV }) => {
      if (__hg.get().state !== 'play') __hg.endless();
      __hg.freeze(true); __hg.inv(false);
      for (const k of ['thick', 'bee', 'colonex', 'wax', 'magnet', 'smoker', 'queen', 'shield']) __hg.setUpg(k, LV);
      __hg.setRound(round); __hg.setSeen(i, seen); __hg.endlessBoss(i); __hg.setPurity(100); __hg.step(200);
      const lv = __hg.lvls()[0];
      let f = 0, lost = 0;
      while (__hg.get().phase === 'boss' && f < 60 * 400) { const a = __hg.combo().purity; dodge(6, { speed: 3, replan: 6 }); f += 6; const c = __hg.combo().purity; if (c < a) lost += a - c; if (c < 40) __hg.setPurity(c + 40); if (__hg.get().state !== 'play') break; if (f % 900 === 0) __hg.power('smoker'); }
      const out = { boss: lv.key, round: round + 1, meeting: seen + 1, alv: lv.alv, hp: lv.hp, secs: Math.round(f / 60), hits: __hg.get().hits, lost: Math.round(lost) };
      return out;
    }, { i, round, seen, LV });
    r.perMin = +(r.lost / (r.secs / 60)).toFixed(1);
    console.log(JSON.stringify(r));
  }
  console.log('errors', errs);
  await b.close();
})();
