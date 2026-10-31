const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const errs = [];
  const ctx = await b.newContext({ viewport: { width: 1100, height: 760 } });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await p.goto('file://' + out + '/page.html#debug');
  await p.waitForTimeout(400);
  await p.click('#startBtn');
  await p.evaluate(() => { __hg.inv(true); __hg.freeze(true); });
  const R = {};
  // 1. endless: first boss never the Disprover (single and crazy)
  R.firstEndless = await p.evaluate(() => {
    const seen = {}; let dis = 0;
    for (let n = 0; n < 60; n++) {
      __hg.endless(); __hg.setCrazy(n % 2 === 1); const g0 = __hg.get(); __hg.addKg(g0.endlessNext - g0.score + 1);
      const ks = __hg.get().bosses.map(x => x.key); ks.forEach(k => { seen[k] = (seen[k] || 0) + 1; }); if (ks.includes('disprover')) dis++;
    }
    return { dis, seen };
  });
  // later rounds still include him, no back-to-back repeats
  R.order = await p.evaluate(() => {
    __hg.setCrazy(false); __hg.endless(); const seq = [];
    for (let r = 0; r < 21; r++) { const g = __hg.get(); __hg.addKg(g.endlessNext - g.score + 1); seq.push(__hg.get().bosses[0].key); __hg.step(400); __hg.hurtBoss(1e6); __hg.step(400); if (__hg.get().state === 'shed') __hg.closeShed(); }
    let rep = 0; for (let i = 1; i < seq.length; i++) if (seq[i] === seq[i - 1]) rep++;
    return { first: seq[0], rep, counts: seq.reduce((m, k) => (m[k] = (m[k] || 0) + 1, m), {}) };
  });
  // 2. revives: endless gives two fresh ones
  R.revives = await p.evaluate(() => { __hg.setRevives(0); __hg.endless(); return __hg.revives(); });
  // 3. prices
  R.prices = await p.evaluate(() => { __hg.harvest(0); const a = __hg.shop().map(s => s.id + ':' + s.cost + (s.locked ? 'L' : '')); __hg.endless(); const b = __hg.shop().map(s => s.id + ':' + s.cost + (s.locked ? 'L' : '')); return { start: a.join(' '), endless: b.join(' ') }; });
  // 4. pause -> shed -> back to pause, game state kept
  await p.evaluate(() => { __hg.harvest(3); __hg.setUpg('bee', 2); __hg.step(200); });
  const before = await p.evaluate(() => { __hg.pause(); return __hg.get(); });
  await p.screenshot({ path: out + '/p8-pause.png' });
  await p.click('#pauseShed'); await p.waitForTimeout(100);
  const inShed = await p.evaluate(() => __hg.get());
  await p.evaluate(() => __hg.setSav(500));
  await p.click('.tile[data-id="thick"]'); await p.click('#buyBtn'); await p.click('#confirmYes'); await p.waitForTimeout(80);
  await p.screenshot({ path: out + '/p8-pause-shed.png' });
  await p.click('#shedDone'); await p.waitForTimeout(80);
  const after = await p.evaluate(() => [__hg.get(), document.getElementById('pauseScreen').hidden, document.getElementById('shedScreen').hidden, document.getElementById('pauseRevive').textContent]);
  await p.click('#resumeBtn');
  const resumed = await p.evaluate(() => __hg.get().state);
  R.pauseShed = { pausedState: before.state, shedState: inShed.state, items: [before.items, after[0].items], phase: [before.phase, after[0].phase], thick: after[0].upg.thick, backTo: after[0].state, pauseShown: !after[1], shedHidden: after[2], reviveLine: after[3], resumed };
  // 5. extractor waits for honey
  R.extract = await p.evaluate(() => {
    __hg.harvest(2); __hg.setUpg('bee', 0); __hg.setUpg('extractor', 1); __hg.ready(); __hg.clearItems(); __hg.spoonTo(40);
    const fired = __hg.power('extractor'); const arm0 = __hg.extractArm(); const log = [];
    for (let i = 0; i < 100 && __hg.extractArm(); i++) { __hg.step(6); log.push(__hg.goodOnScreen()); }
    log.push('t=' + (log.length * 0.1).toFixed(1));
    return { fired, arm0, armedAfter: __hg.extractArm(), pcd: +__hg.get().pcd.extractor.toFixed(1), countsUntilFire: log.slice(-3) };
  });
  // typical honey on screen, harvest and boss
  R.onScreen = await p.evaluate(() => {
    const m = []; __hg.setUpg('extractor', 0); __hg.harvest(4); for (let i = 0; i < 40; i++) { __hg.step(15); m.push(__hg.goodOnScreen()); }
    const f = []; __hg.jump(4); __hg.step(300); for (let i = 0; i < 40; i++) { __hg.step(15); f.push(__hg.goodOnScreen()); }
    const e = []; __hg.endless(); for (let r = 0; r < 4; r++) { __hg.addKg(__hg.get().endlessNext - __hg.get().score - 60); } for (let i = 0; i < 40; i++) { __hg.step(15); e.push(__hg.goodOnScreen()); }
    const avg = a => +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
    return { harvest: avg(m), harvestMax: Math.max(...m), boss: avg(f), endless: avg(e) };
  });
  // 6. knight capture
  R.knight = await p.evaluate(() => {
    __hg.jump(1); __hg.step(300); __hg.clearItems();
    __hg.spoonTo(200); const k = __hg.knightNow(500); __hg.step(1); const n0 = __hg.knights();
    __hg.spoonTo(800); __hg.step(1); const n1 = __hg.knights();
    // slow drift past also counts; a knight up a row does not
    return { n0, n1, x: k.x };
  });
  await p.evaluate(() => { __hg.spoonTo(300); __hg.knightNow(600); __hg.step(2); });
  await p.evaluate(() => { __hg.spoonTo(640); __hg.step(3); });
  await p.screenshot({ path: out + '/p8-knight-captured.png' });
  // 7. quark takes two hits
  R.quark = await p.evaluate(() => {
    __hg.jump(6); __hg.step(300); __hg.spoonTo(100);
    const q0 = __hg.get().proj; __hg.quark(700, 400); const res = [];
    __hg.step(1); let q = __hg.quarks().find(q => Math.abs(q.x - 700) < 120); __hg.glob(q.x, q.y); __hg.step(1); res.push(JSON.stringify(__hg.quarks().filter(q => Math.abs(q.x - 700) < 120)));
    q = __hg.quarks().find(q => Math.abs(q.x - 700) < 120); if (q) { __hg.glob(q.x, q.y); __hg.step(1); }
    res.push(JSON.stringify(__hg.quarks().filter(q => Math.abs(q.x - 700) < 120)));
    return res;
  });
  // 8. magnet pushes fakes away
  R.magnet = await p.evaluate(() => {
    __hg.harvest(3); __hg.clearItems(); __hg.setUpg('magnet', 5); __hg.ready(); __hg.spoonTo(550);
    const H0 = __hg.get(); __hg.fake(580, 520); __hg.fake(520, 470); const a = __hg.fakes();
    __hg.power('magnet'); __hg.step(30); const b = __hg.fakes();
    return { before: a, after: b };
  });
  await p.screenshot({ path: out + '/p8-magnet.png' });
  // 9. crazy unlocked in endless without maxing, 500 kg
  R.crazy = await p.evaluate(() => { __hg.endless(); const c = __hg.shop().find(s => s.id === 'crazy'); return c; });
  await p.evaluate(() => { __hg.hurtBoss(1e6); __hg.shed(); });
  await p.click('.tile[data-id="crazy"]'); await p.waitForTimeout(80);
  R.crazyText = await p.evaluate(() => [document.getElementById('dNext').textContent, document.getElementById('gLine').textContent]);
  await p.screenshot({ path: out + '/p8-crazy.png' });
  await p.evaluate(() => __hg.closeShed());
  // 10. game over with no second chances left
  await p.evaluate(() => { __hg.setRevives(0); __hg.kill(); });
  await p.waitForTimeout(100);
  R.over = await p.evaluate(() => [document.getElementById('reviveRow').hidden, document.getElementById('reviveNote').hidden, document.getElementById('reviveNote').textContent]);
  await p.screenshot({ path: out + '/p8-over.png' });
  console.log(JSON.stringify(R, null, 1));
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
