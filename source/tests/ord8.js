const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1100, height: 760 } })).newPage();
  await p.goto('file://' + out + '/page.html#debug'); await p.waitForTimeout(300);
  await p.click('#startBtn');
  const r = await p.evaluate(() => {
    __hg.inv(true); __hg.freeze(true); __hg.endless(); const seq = [];
    for (let r = 0; r < 21; r++) {
      const g = __hg.get(); __hg.addKg(g.endlessNext - g.score + 1);
      const g2 = __hg.get(); const s = g2.bosses.map(x => x.key + ':' + x.mode).join('+') + ' st=' + g2.state + ' ph=' + g2.phase + ' rd=' + g2.endlessRound;
      __hg.step(400); __hg.hurtBoss(1e6); __hg.step(400); const g3 = __hg.get();
      seq.push(s + ' -> ' + g3.state + ' ' + g3.bosses.map(x => x.key + ':' + x.mode + ':' + x.hp).join('+'));
      if (g3.state === 'shed') __hg.closeShed();
    }
    return seq;
  });
  console.log(r.join('\n'));
  await b.close();
})();
