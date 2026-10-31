const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/page.html#debug'); await p.waitForTimeout(400);
  await p.evaluate(() => document.getElementById('startBtn').click());
  const r = await p.evaluate(() => {
    __hg.freeze(true); __hg.inv(true);
    const out = {};
    // knight taken -> flies back and hurts the App Founder
    __hg.jump(2); __hg.step(200); __hg.hold(); __hg.setUpg('thick', 5);
    const hp0 = __hg.get().bosses[0].hp; const k = __hg.knightNow(300); __hg.spoonTo(300 - k.c); __hg.step(1); __hg.spoonTo(300 + k.c); __hg.step(1);
    out.knightsLeft = __hg.knights(); out.kinds = __hg.projKinds(); __hg.step(90); __hg.hold();
    out.kbossDmg = +(hp0 - __hg.get().bosses[0].hp).toFixed(2);
    // queen through both bosses in crazy mode
    __hg.setUpg('queen', 1); __hg.crazy(4, 5); __hg.step(240); __hg.hold(); __hg.ready();
    const c0 = __hg.get().bosses.map(x => x.hp); __hg.power('queen');
    const shots = [];
    for (let f = 0; f < 600; f++) { __hg.hold(); __hg.step(1); if (f % 30 === 0) shots.push(__hg.get().qd); }
    const c1 = __hg.get().bosses.map(x => x.hp);
    out.queenCrazy = { before: c0, after: c1, dmgEach: c0.map((h, i) => +(h - c1[i]).toFixed(1)), charges: 2 };
    // VAT invoices: count over a Colonex-ally fight
    __hg.jump(3); __hg.step(60 * 60);
    out.billed = __hg.get().billed;
    out.magnet = [1, 10].map(l => { __hg.setUpg('magnet', l); return __hg.shop().find(s => s.id === 'magnet'); });
    return out;
  });
  console.log(JSON.stringify(r, null, 1)); console.log('errors', errs);
  await b.close();
})();
