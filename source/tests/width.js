const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const errs = [];
  for (const [w, h] of [[1100, 760], [1909, 900], [2560, 1100]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
    p.on('pageerror', e => errs.push(w + ' ' + e.message));
    await p.goto('file://' + out + '/page.html#debug'); await p.waitForTimeout(300);
    await p.click('#startBtn');
    const r = await p.evaluate(() => {
      __hg.inv(true); __hg.freeze(true);
      // harvest: everything the bot catches, and what fell, over 4 x 60 s at boss 4's stage (stays in harvest by topping the threshold down)
      let kg = 0, spawns = { drop: 0, jar: 0, box: 0, comb: 0, lab: 0, shilajit: 0, bad: 0 };
      for (let rep = 0; rep < 4; rep++) {
        __hg.harvest(4); __hg.clearItems(); __hg.bot(true); __hg.setCombo(1);
        const seen = new Set();
        const s0 = __hg.get().score;
        for (let k = 0; k < 3600; k++) {
          __hg.step(1);
          for (const it of __hg.itemsInfo()) { const id = it.kind + ':' + it.x + ':' + Math.floor(it.y / 400); }
          if (__hg.get().phase !== 'harvest') break;
        }
        kg += __hg.get().score - s0;
      }
      return { sizes: __hg.sizes(), kgPerMinBot: +(kg / 4).toFixed(1) };
    });
    // attack counts
    const a = await p.evaluate(() => {
      const keys = ['keeper', 'colonex', 'ceo', 'ironfit', 'apologist', 'looks', 'disprover'];
      const count = (boss, atk) => { __hg.jump(keys.indexOf(boss)); __hg.step(300); __hg.clearItems(); const k0 = __hg.projKinds(); __hg.attack(atk); const k1 = __hg.projKinds(); let n = 0; for (const k in k1) n += k1[k] - (k0[k] || 0); return n; };
      return { syrupStorm: count('keeper', 'syrupStorm'), susRain: count('keeper', 'susRain'), toss: count('keeper', 'toss'), smoke: count('keeper', 'smoke'), fees: count('colonex', 'fees'), bars: count('ceo', 'bars'), hexagons: count('disprover', 'hexagons'), barrage: count('disprover', 'barrage') };
    });
    console.log(w + 'x' + h, JSON.stringify(r), JSON.stringify(a));
  }
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
