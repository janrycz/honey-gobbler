const { chromium } = require('playwright');
const fs = require('fs');
const out = process.argv[2], W0 = +process.argv[3], H0 = +process.argv[4];
const botSrc = fs.readFileSync(out + '/dodgebot.js', 'utf8');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W0, height: H0 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('crash', () => errs.push('CRASH'));
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Performance.enable');
  await p.goto('file://' + out + '/page.html#debug'); await p.waitForTimeout(300);
  await p.addScriptTag({ content: botSrc });
  await p.evaluate(() => document.getElementById('startBtn').click());
  await p.evaluate(() => { __hg.inv(true); __hg.freeze(true); __hg.achReset(); });
  const heap = async () => { const m = await cdp.send('Performance.getMetrics'); const f = n => (m.metrics.find(x => x.name === n) || {}).value; return { heapMB: +(f('JSHeapUsedSize') / 1048576).toFixed(1), nodes: f('Nodes'), listeners: f('JSEventListeners') }; };
  const t0 = Date.now();
  for (let it = 0; it < 400; it++) {
    const g = await p.evaluate(() => {
      for (let k = 0; k < 10; k++) { dodge(30); const u = __hg.get().upg || {}; for (const pk of ['smoker', 'magnet', 'extractor', 'queen']) if (u[pk]) __hg.power(pk); }
      return __hg.get();
    });
    if (g.state === 'shed') await p.evaluate(() => { for (let n = 0; n < 40; n++) { const g = __hg.get(); const o = __hg.shop().filter(s => !s.locked && !s.maxed && s.id !== 'crazy' && s.cost <= g.wallet).sort((a, b) => a.cost - b.cost); if (!o.length) break; __hg.buy(o[0].id); } __hg.closeShed(); });
    if (g.state === 'won') await p.evaluate(() => __hg.endless());
    if (it % 40 === 0) console.log('iter', it, 'sim', (g.t / 60).toFixed(1), 'min', g.state, g.phase, 'proj', g.proj, 'items', g.items, JSON.stringify(await heap()), ((Date.now() - t0) / 1000).toFixed(0) + 's real');
  }
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
