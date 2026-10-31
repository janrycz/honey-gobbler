const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const errs = [];
  for (const [vw, vh, tag] of [[1100, 760, 'w'], [390, 780, 'm']]) {
    const ctx = await b.newContext(vw < 600 ? { viewport: { width: vw, height: vh }, deviceScaleFactor: 2, hasTouch: true, isMobile: true } : { viewport: { width: vw, height: vh } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(tag + ' ' + e.message + ' ' + (e.stack || '').split('\n')[1]));
    await p.goto('file://' + out + '/page.html#debug');
    await p.waitForTimeout(400);
    await p.evaluate(() => document.getElementById('startBtn').click());
    await p.evaluate(() => { __hg.inv(true); __hg.freeze(true); });
    const shot = async (name, fn, steps) => { await p.evaluate(([fn, steps]) => { if (fn) eval(fn); __hg.step(steps); }, [fn, steps]); await p.waitForTimeout(50); await p.screenshot({ path: `${out}/${tag}7-${name}.png` }); };
    // queen locked outside fights
    await p.evaluate(() => { __hg.setUpg('queen', 3); __hg.ready(); __hg.step(5); });
    const q = await p.evaluate(() => [document.getElementById('pw-queen').className, __hg.power('queen')]);
    // bees carrying fakes
    await shot('bees', "__hg.setUpg('bee', 10); __hg.harvest(4)", 600);
    const g = await p.evaluate(() => __hg.get());
    // knight
    await shot('knight', "__hg.jump(2); __hg.step(200); __hg.attack('knight')", 45);
    await shot('knight2', '', 60);
    const qf = await p.evaluate(() => { __hg.ready(); return [__hg.power('queen'), document.getElementById('pw-queen').className]; });
    // shed: spend harvest, boss threshold unchanged; crazy tile visible and locked
    const shed = await p.evaluate(() => { __hg.hurtBoss(9999); __hg.step(300); const before = __hg.get(); __hg.setSav(0); __hg.buy('thick'); __hg.buy('bee'); const after = __hg.get(); const t = document.querySelector('.tile[data-id="crazy"]'); return { state: before.state, scoreBefore: before.score, scoreAfter: after.score, walletBefore: before.wallet, walletAfter: after.wallet, next: document.getElementById('shedNext').textContent, crazyHidden: t.hidden, crazyPrice: t.querySelector('.pr').textContent, tiles: [...document.querySelectorAll('.tile')].filter(e => !e.hidden).length }; });
    await p.evaluate(() => document.querySelector('.tile[data-id="crazy"]').click());
    await p.waitForTimeout(80);
    await p.screenshot({ path: `${out}/${tag}7-shed.png` });
    const btn = await p.evaluate(() => [document.getElementById('buyBtn').textContent, document.getElementById('gLine').textContent]);
    // endless order: 14 draws
    const order = await p.evaluate(() => { __hg.closeShed(); __hg.endless(); const r = []; for (let i = 0; i < 14; i++) { __hg.give(9999); __hg.bot(true); __hg.step(60); const s = __hg.get(); if (s.bosses.length) { r.push(s.bosses[0].key); __hg.hurtBoss(99999); __hg.step(300); if (__hg.get().state === 'shed') __hg.closeShed(); } } return r; });
    if (tag === 'w') {
      console.log('queen outside fight: class', q[0], 'fired', q[1], '| in fight fired', qf[0], qf[1]);
      console.log('bees after 10 s harvest: beeDrops', g.beeDrops, 'addict', g.addict);
      console.log('shed', JSON.stringify(shed), 'crazy btn', JSON.stringify(btn));
      console.log('endless order', order.join(' '));
    }
    await ctx.close();
  }
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
