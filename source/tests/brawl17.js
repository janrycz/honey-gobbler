const { chromium } = require('playwright'); const fs = require('fs');
// args: width height file tag [inv]
const [w, h, file, tag, inv] = [+process.argv[2] || 1100, +process.argv[3] || 760, process.argv[4] || 'page.html', process.argv[5] || 'd', process.argv[6] === 'inv'];
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await p.goto('file://' + __dirname + '/' + file + '#debug'); await p.waitForTimeout(400);
  await p.addScriptTag({ content: fs.readFileSync(__dirname + '/dodgebot.js', 'utf8') });
  await p.evaluate(() => document.getElementById('startBtn').click());
  const shot = async name => { await p.waitForTimeout(60); await p.screenshot({ path: __dirname + '/x17-' + tag + '-' + name + '.png' }); };
  const r = {};
  r.before = await p.evaluate(() => { __hg.freeze(true); for (const k of ['bee', 'queen', 'thick', 'colonex', 'wax', 'magnet', 'smoker', 'shield']) __hg.setUpg(k, 6); __hg.brawl(); return __hg.get().purity; });
  await p.evaluate(() => __hg.step(60)); await shot('intro');
  r.start = await p.evaluate(() => __hg.brawlInfo());
  await p.evaluate(inv => { __hg.inv(inv); let f = 0; while (f < 60 * 12) { dodge(6, { speed: 3, replan: 6, margin: 1.4 }); f += 6; } }, inv);
  await shot('12s');
  r.at12 = await p.evaluate(() => ({ i: __hg.brawlInfo(), g: __hg.get().purity, hud: document.getElementById('next').textContent }));
  r.fight = await p.evaluate(() => { let f = 0, log = []; while (__hg.get().phase === 'boss' && __hg.get().state === 'play' && f < 60 * 600) { dodge(6, { speed: 3, replan: 6, margin: 1.4 }); f += 6; if (f % 1200 === 0) { __hg.power('queen'); __hg.power('shield'); const bi = __hg.brawlInfo(); log.push(bi && (Math.round(bi.t) + 's beaten ' + bi.beaten + ' pur ' + Math.round(__hg.get().purity))); } } return { secs: (f / 60).toFixed(0), state: __hg.get().state, phase: __hg.get().phase, purity: __hg.get().purity, log }; });
  await shot('end');
  r.after = await p.evaluate(() => ({ g: __hg.get(), btn: document.getElementById('brawlBtn').textContent, hidden: document.getElementById('brawlBtn').hidden, line: document.getElementById('gLine').textContent, ach: __hg.ach().done.brawl ? 'brawl' : '-', rs: __hg.runStats() }));
  r.after.g = { state: r.after.g.state, phase: r.after.g.phase, purity: r.after.g.purity, savings: r.after.g.savings, bosses: r.after.g.bosses.length };
  console.log(JSON.stringify(r, null, 1)); console.log('errors', errs);
  await b.close();
})();
