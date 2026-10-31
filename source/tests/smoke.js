const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const errs = [];
  const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await p.goto('file://' + out + '/page.html#debug');
  await p.waitForTimeout(600);
  await p.screenshot({ path: out + '/a0-start.png' });
  await p.click('#startBtn');
  await p.evaluate(() => { __hg.inv(true); });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: out + '/a1-march.png' });
  const ATK = {
    0: ['toss', 'susRain', 'smoke', 'feeder', 'syrupStorm'],
    1: ['fees', 'vc', 'factorio', 'jobs', 'crow', 'ski', 'gifs', 'cnc', 'roblox', 'doubleFees'],
    2: ['notify', 'sheets', 'bars', 'chess', 'deenbuddy', 'fired', 'errors', 'checkmate'],
    3: ['rope', 'prices', 'pushups', 'resin', 'drinks', 'ropeDouble'],
    4: ['blend', 'volley', 'dilemma', 'dilemma2', 'axes', 'axeChop'],
    5: ['hypergamy', 'needles', 'ratings', 'pills', 'liver', 'courseAd', 'chatFlood', 'bonesmash', 'subathon'],
    6: ['barrage', 'hexagons', 'missingLink', 'quarks', 'fishLegs', 'bigbang', 'quarkStorm'],
  };
  for (let i = 0; i <= 6; i++) {
    await p.evaluate(i => { __hg.jump(i); __hg.step(200); }, i);
    for (const a of ATK[i]) {
      await p.evaluate(a => { __hg.attack(a); __hg.step(40); }, a);
    }
    await p.evaluate(() => __hg.step(30));
    await p.screenshot({ path: out + `/b${i}.png` });
    await p.evaluate(() => __hg.step(400));
    const g = await p.evaluate(() => __hg.get());
    console.log('boss', i, g.boss && g.boss.key, g.boss && g.boss.hp, 'state', g.state, 'proj', g.proj, 'ally', g.ally, 'lines', JSON.stringify(await p.evaluate(() => __hg.lines())));
  }
  // Looksmaxxer details
  await p.evaluate(() => { __hg.jump(5); __hg.step(200); __hg.attack('hypergamy'); __hg.step(30); });
  await p.screenshot({ path: out + '/c1-hypergamy-tele.png' });
  await p.evaluate(() => __hg.step(85));
  await p.screenshot({ path: out + '/c2-hypergamy-fire.png' });
  await p.evaluate(() => { __hg.step(200); __hg.hurtBoss(240); __hg.step(90); });
  await p.screenshot({ path: out + '/c3-looks-p2.png' });
  await p.evaluate(() => { __hg.attack('hypergamy'); __hg.step(50); });
  await p.screenshot({ path: out + '/c4-hypergamy-p2.png' });
  await p.evaluate(() => { __hg.step(150); __hg.attack('bonesmash'); __hg.step(30); });
  await p.screenshot({ path: out + '/c5-bonesmash.png' });
  console.log('chat', JSON.stringify(await p.evaluate(() => __hg.chatState())).slice(0, 900));
  // queen bee in a fight
  await p.evaluate(() => { __hg.jump(4); __hg.step(200); __hg.setUpg('queen', 10); __hg.power('queen'); __hg.step(50); });
  await p.screenshot({ path: out + '/d1-queen-enter.png' });
  await p.evaluate(() => __hg.step(40));
  await p.screenshot({ path: out + '/d2-queen-tele.png' });
  await p.evaluate(() => __hg.step(25));
  await p.screenshot({ path: out + '/d3-queen-go.png' });
  await p.evaluate(() => __hg.step(200));
  console.log('after queen', JSON.stringify(await p.evaluate(() => { const g = __hg.get(); return { qd: g.qd, hp: g.boss && g.boss.hp }; })));
  // crazy mode
  await p.evaluate(() => { __hg.crazy(1, 5); __hg.step(120); });
  await p.screenshot({ path: out + '/e1-crazy-intro.png' });
  await p.evaluate(() => __hg.step(500));
  await p.screenshot({ path: out + '/e2-crazy-colonex-looks.png' });
  console.log('crazy1', JSON.stringify(await p.evaluate(() => { const g = __hg.get(); return { bosses: g.bosses, ally: g.ally, state: g.state }; })));
  await p.evaluate(() => { __hg.crazy(3, 6); __hg.step(600); });
  await p.screenshot({ path: out + '/e3-crazy-coach-disprover.png' });
  console.log('crazy2', JSON.stringify(await p.evaluate(() => { const g = __hg.get(); return { bosses: g.bosses, ally: g.ally, state: g.state }; })));
  await p.evaluate(() => { __hg.hurtBoss(9999, 0); __hg.step(100); });
  await p.screenshot({ path: out + '/e4-crazy-one-down.png' });
  console.log('crazy one down', JSON.stringify(await p.evaluate(() => { const g = __hg.get(); return { bosses: g.bosses, ally: g.ally, state: g.state, proj: g.proj }; })));
  await p.evaluate(() => { __hg.hurtBoss(9999, 1); __hg.step(400); });
  const g2 = await p.evaluate(() => __hg.get());
  console.log('crazy done', g2.state, g2.phase, 'round', g2.endlessRound, 'ach', g2.ach.join(','));
  await p.waitForTimeout(400);
  await p.screenshot({ path: out + '/f1-shed.png' });
  // endless: colonex single, no ally against himself
  await p.evaluate(() => { __hg.closeShed(); __hg.endlessBoss(1); __hg.step(600); });
  console.log('endless colonex ally?', (await p.evaluate(() => __hg.get())).ally);
  // achievements screen
  await p.evaluate(() => __hg.kill());
  await p.waitForTimeout(300);
  await p.click('#overScreen [data-ach]');
  await p.waitForTimeout(300);
  await p.screenshot({ path: out + '/g1-ach.png' });
  console.log('ERRORS', JSON.stringify(errs, null, 1));
  await b.close();
})();
