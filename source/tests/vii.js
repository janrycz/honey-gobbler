const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const open = async (w, h, extra = {}) => {
    const ctx = await b.newContext(Object.assign({ viewport: { width: w, height: h } }, extra));
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(w + ' ' + e.message + ' ' + (e.stack || '').split('\n')[1]));
    p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(w + ' console ' + m.text()); });
    await p.goto('file://' + out + '/page.html#debug'); await p.waitForTimeout(300);
    await p.click('#startBtn');
    await p.evaluate(() => { __hg.inv(true); __hg.freeze(true); __hg.achReset(); });
    return p;
  };
  const R = {};
  const p = await open(1100, 760);
  const keys = await p.evaluate(() => ['keeper', 'colonex', 'ceo', 'ironfit', 'apologist', 'looks', 'disprover']);
  const idx = k => keys.indexOf(k);
  // 1. quarks home in for their whole life; honey can't pop them
  R.quark = await p.evaluate(i => {
    __hg.jump(i); __hg.step(300); __hg.spoonTo(100); __hg.clearItems();
    __hg.quark(800, 300); const xs = [];
    for (let k = 0; k < 6; k++) { __hg.step(30); const q = __hg.quarks()[0]; xs.push(q ? q.x : 'gone'); }
    __hg.quark(600, 400); __hg.step(1); const q = __hg.quarks().slice(-1)[0]; __hg.glob(q.x, q.y); __hg.step(1); __hg.glob(q.x, q.y); __hg.step(1);
    return { homingXs: xs.join(','), afterTwoHits: __hg.quarks().length };
  }, idx('disprover'));
  // 2. belt and machine
  R.belt = await p.evaluate(i => { __hg.jump(i); __hg.step(300); __hg.clearItems(); return true; }, idx('colonex'));
  // 3. endless: more, harder, less warning
  R.endless = await p.evaluate(i => {
    const count = (round, atk) => { __hg.endlessBoss(i); __hg.setRound(round); __hg.step(200); __hg.clearItems(); const before = __hg.get().proj; __hg.attack(atk); return __hg.get().proj - before; };
    const r = {};
    for (const rd of [0, 5, 10, 20]) r['round' + rd] = { syrupStorm: count(rd, 'syrupStorm'), toss: count(rd, 'toss'), susRain: count(rd, 'susRain') };
    return r;
  }, idx('keeper'));
  R.endlessDamage = await p.evaluate(i => {
    const hit = round => { __hg.endlessBoss(i); __hg.setRound(round); __hg.step(200); __hg.clearItems(); __hg.inv(false); __hg.setPurity(100); __hg.spoonTo(500); __hg.dropProj(500, 560); __hg.step(40); const pu = __hg.get().purity; __hg.inv(true); return 100 - pu; };
    return { round0: hit(0), round5: hit(5), round15: hit(15), round30: hit(30) };
  }, idx('keeper'));
  // 4. hypergamy at different endless rounds
  R.hyper = await p.evaluate(i => {
    const r = {};
    for (const rd of [0, 4, 10]) { __hg.endlessBoss(i); __hg.setRound(rd); __hg.step(200); __hg.clearItems(); __hg.attack('hypergamy'); __hg.step(100); r['round' + rd] = __hg.projKinds().hyperArrow || 0; }
    return r;
  }, idx('looks'));
  // 5. smoke
  R.smoke = await p.evaluate(i => {
    const r = {};
    __hg.jump(i); __hg.step(300); __hg.clearItems(); __hg.spoonTo(900); __hg.attack('smoke'); __hg.step(100); r.main = __hg.smokes(); __hg.step(240); r.mainLater = __hg.smokes();
    __hg.endlessBoss(i); __hg.setRound(8); __hg.step(200); __hg.clearItems(); __hg.attack('smoke'); __hg.step(100); r.endless8 = __hg.smokes().length;
    return r;
  }, idx('keeper'));
  await p.evaluate(i => { __hg.jump(i); __hg.step(300); __hg.clearItems(); __hg.spoonTo(700); __hg.attack('smoke'); __hg.step(200); }, idx('keeper'));
  await p.screenshot({ path: out + '/v7-smoke.png' });
  // 6. crazy: the queen hits both bosses at once
  R.crazyQueen = await p.evaluate(([a, c]) => {
    __hg.crazy(a, c); __hg.step(300); __hg.setUpg('queen', 1); __hg.ready();
    const hp0 = __hg.get().bosses.map(x => x.hp); __hg.power('queen');
    let t = 0; while (__hg.get().qd && t < 400) { __hg.step(5); t += 5; }
    return { before: hp0, after: __hg.get().bosses.map(x => x.hp) };
  }, [idx('ironfit'), idx('apologist')]);
  // 7. bees and combo: spoon parked, bees catching
  R.beeCombo = await p.evaluate(() => {
    __hg.harvest(3); __hg.setUpg('bee', 10); __hg.setUpg('sweet', 0); __hg.setCombo(1); __hg.clearItems(); __hg.spoonTo(10);
    const log = []; for (let k = 0; k < 10; k++) { __hg.step(120); log.push(__hg.get().combo); }
    return log.join(',');
  });
  // 8. magnet + extractor together
  R.magEx = await p.evaluate(() => {
    __hg.harvest(3); __hg.setUpg('bee', 0); __hg.setUpg('magnet', 1); __hg.setUpg('extractor', 1); __hg.ready(); __hg.clearItems(); __hg.spoonTo(550);
    __hg.drops(1, 600); // a drop close to the spoon (inside magnet reach)
    __hg.power('magnet'); __hg.step(1);
    __hg.power('extractor'); __hg.step(2);
    return __hg.extractRun();
  });
  await p.evaluate(() => { __hg.drops(6, 250); __hg.step(10); });
  await p.screenshot({ path: out + '/v7-magnet-extractor.png' });
  // 9. floating text doesn't overlap
  R.floats = await p.evaluate(() => {
    __hg.harvest(2); __hg.clearItems();
    __hg.float(550, 300, 'EXTRACTOR', true); __hg.float(550, 300, 'HONEY MAGNET', true); __hg.float(550, 300, 'SMOKER', true);
    __hg.float(500, 500, 'Knight captured'); __hg.float(510, 500, '+120 g'); __hg.float(505, 505, 'Knight captured');
    __hg.step(30);
    const f = __hg.floats(); let overlaps = 0;
    for (let i = 0; i < f.length; i++) for (let j = i + 1; j < f.length; j++) {
      const a = f[i], c = f[j];
      if (Math.abs(a.x - c.x) * 2 < a.w + c.w && Math.abs(a.y - c.y) * 2 < (a.h + c.h) * 0.9) overlaps++;
    }
    return { n: f.length, overlaps, f };
  });
  await p.screenshot({ path: out + '/v7-floats.png' });
  // 10. achievements
  R.ach = await p.evaluate(() => {
    const a = __hg.ach();
    return Object.keys(a.done);
  });
  console.log(JSON.stringify(R, null, 1));
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
