const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await p.goto('file://' + __dirname + '/page.html#debug'); await p.waitForTimeout(400);
  await p.evaluate(() => document.getElementById('startBtn').click());
  const r = await p.evaluate(() => {
    __hg.freeze(true); __hg.inv(true); __hg.bot(true);
    const out = {};
    out.q = [1, 3, 4, 7, 8, 10].map(l => { const q = __hg.queenStat(l); return l + ': ' + q.charges + 'x' + q.dmg.toFixed(1) + ' cd ' + q.cd; });
    out.shopHives = __hg.shop().find(s => s.id === 'hives');
    // flow
    __hg.harvest(1); __hg.clearItems(); __hg.event('flow'); const s0 = __hg.get().score; __hg.bot(true); __hg.step(60 * 7); out.flowKg = +(__hg.get().score - s0).toFixed(1);
    // each boss quickly
    for (let i = 0; i < 7; i++) { __hg.jump(i); __hg.step(60 * 25); out['b' + i] = __hg.get().bosses.map(x => x.key + ' ' + x.hp + '/' + x.max).join(); }
    __hg.jump(2); __hg.step(200); __hg.attack('checkmate'); __hg.step(60 * 6);
    out.ach = __hg.ach().stats.hurts;
    return out;
  });
  console.log(JSON.stringify(r, null, 1)); console.log('errors', errs);
  await b.close();
})();
