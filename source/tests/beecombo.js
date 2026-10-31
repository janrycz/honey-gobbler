const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  for (const [lv, bot] of [[0, true], [3, true], [10, true], [10, false], [2, false]]) {
    const p = await (await b.newContext({ viewport: { width: 1100, height: 760 } })).newPage();
    await p.goto('file://' + out + '/page.html#debug'); await p.waitForTimeout(300);
    await p.click('#startBtn');
    const r = await p.evaluate(([lv, bot]) => {
      __hg.inv(true); __hg.freeze(true); __hg.harvest(4); __hg.setUpg('bee', lv); __hg.bot(bot); if (!bot) __hg.spoonTo(10);
      const log = []; const g0 = __hg.get();
      for (let k = 0; k < 12; k++) { __hg.step(150); log.push(__hg.get().combo); }
      const g1 = __hg.get();
      return { combo: log.join(','), beePerSec: +((g1.beeDrops - g0.beeDrops) / 30).toFixed(2), kgPerMin: +((g1.score - g0.score) * 2).toFixed(1) };
    }, [lv, bot]);
    console.log('bees', lv, bot ? 'player catching' : 'player idle', JSON.stringify(r));
  }
  await b.close();
})();
