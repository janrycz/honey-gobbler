const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + out + '/page.html#debug');
  await p.waitForTimeout(400);
  await p.evaluate(() => document.getElementById('startBtn').click());
  await p.evaluate(() => { __hg.inv(true); __hg.bot(true); __hg.freeze(true); __hg.endless(); __hg.setUpg('crazy', 1); __hg.setCrazy(true); });
  const seen = {}; let colonexEnemy = 0, colonexAllyWrong = 0, fights = 0;
  for (let i = 0; i < 400 && fights < 12; i++) {
    const g = await p.evaluate(() => { __hg.step(120); return __hg.get(); });
    if (g.state === 'shed') { await p.evaluate(() => { const s = __hg.get(); if (!s.crazyOn) document.getElementById('buyBtn'); __hg.closeShed(); }); continue; }
    if (g.phase === 'boss' && g.bosses.length && g.bosses.every(b => b.mode === 'fight')) {
      const keys = g.bosses.map(b => b.key).join('+');
      if (!seen[keys + g.endlessRound]) {
        seen[keys + g.endlessRound] = 1; fights++;
        const hasCol = g.bosses.some(b => b.key === 'colonex');
        if (hasCol) colonexEnemy++;
        if (hasCol && g.ally) colonexAllyWrong++;
        console.log('round', g.endlessRound, 'bosses', keys, 'ally', g.ally, 'crazyOn', g.crazyOn);
        await p.evaluate(() => { __hg.hurtBoss(99999, 0); __hg.hurtBoss(99999, 1); });
      }
    }
  }
  console.log('fights', fights, 'colonex as enemy', colonexEnemy, 'ally wrongly present', colonexAllyWrong, 'errors', errs.length ? errs : 'none');
  await b.close();
})();
