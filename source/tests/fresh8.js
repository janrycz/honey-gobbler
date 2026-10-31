const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const errs = [];
  const p = await (await b.newContext({ viewport: { width: 1100, height: 760 } })).newPage();
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + out + '/page.html#debug'); await p.waitForTimeout(300);
  await p.click('#startBtn');
  const r = await p.evaluate(() => {
    __hg.inv(true); __hg.freeze(true);
    const ids = ['thick', 'bee', 'colonex', 'smoker', 'magnet', 'extractor', 'queen', 'sweet', 'hives'];
    const ladder = (hike) => { const o = {}; for (const id of ids) { const l = []; const mx = id === 'sweet' || id === 'hives' ? 5 : 10; for (let i = 0; i < mx; i++) { __hg.setUpg(id, i); l.push(__hg.shop().find(s => s.id === id).cost); } __hg.setUpg(id, 0); o[id] = l.join(' ') + '  = ' + l.reduce((a, c) => a + c, 0); } return o; };
    const pre = ladder(); __hg.endless(); const post = ladder();
    return { pre, post };
  });
  console.log('Before the Shilajit Coach:'); for (const [k, v] of Object.entries(r.pre)) console.log('  ' + k.padEnd(10) + v);
  console.log('After (x2):'); for (const [k, v] of Object.entries(r.post)) console.log('  ' + k.padEnd(10) + v);
  // the first endless fight right after a real win: never the Disprover
  let dis = 0;
  for (let n = 0; n < 30; n++) { const k = await p.evaluate(() => { __hg.endless(); const g = __hg.get(); __hg.addKg(g.endlessNext - g.score + 1); return __hg.get().bosses[0].key; }); if (k === 'disprover') dis++; }
  console.log('first endless boss was the Disprover', dis, 'of 30');
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
