const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); const p = await b.newPage({ viewport: { width: 1100, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await p.goto('file://' + __dirname + '/page.html#debug'); await p.waitForTimeout(400);
  await p.addScriptTag({ content: fs.readFileSync(__dirname + '/dodgebot.js', 'utf8') });
  await p.evaluate(() => document.getElementById('startBtn').click());
  const shot = async name => { await p.waitForTimeout(60); await p.screenshot({ path: __dirname + '/x16-' + name + '.png' }); };
  const r = {};
  r.setup = await p.evaluate(() => { __hg.freeze(true); __hg.inv(true); for (const k of ['bee', 'queen', 'thick', 'colonex']) __hg.setUpg(k, 5); __hg.jump(7); __hg.step(200); return __hg.get().bosses.map(x => x.key + ' ' + x.hp); });
  await shot('intro');
  for (const atk of ['minis', 'stinger', 'nest', 'hawk', 'stingAlly', 'stingerFan', 'swarm', 'diveBite']) {
    r[atk] = await p.evaluate(a => { __hg.hold(); __hg.attack(a); for (let i = 0; i < 50; i++) { __hg.hold(); __hg.step(1); } return JSON.stringify(__hg.projKinds()) + ' bees ' + __hg.get().bees; }, atk);
    await shot('atk-' + atk);
    await p.evaluate(() => { for (let i = 0; i < 200; i++) { __hg.hold(); dodge(1, { speed: 4, replan: 6 }); } });
  }
  // phase 2 bee ball, phase 3
  r.p2 = await p.evaluate(() => { const g = __hg.get().bosses[0]; __hg.hurtBoss(g.hp - g.max * 0.45); for (let i = 0; i < 200; i++) __hg.step(1); return __hg.get().bosses[0].hp; });
  await shot('p2-ball');
  r.p3 = await p.evaluate(() => { const g = __hg.get().bosses[0]; __hg.hurtBoss(g.hp - g.max * 0.2); for (let i = 0; i < 120; i++) __hg.step(1); return __hg.get().bosses[0].hp; });
  await shot('p3');
  // queen vs hornet at level 5: she should die partway
  r.queen = await p.evaluate(() => { __hg.ready(); __hg.power('queen'); const log = []; for (let i = 0; i < 300; i++) { __hg.hold(); __hg.step(1); if (i % 20 === 0) log.push(__hg.get().qd); } return log.join(','); });
  await shot('queen');
  // full fight with the bot to the end
  r.fight = await p.evaluate(() => { let f = 0; while (__hg.get().phase === 'boss' && f < 60 * 240) { dodge(6, { speed: 3, replan: 6 }); f += 6; if (f % 600 === 0) __hg.power('queen'); } return { secs: (f / 60).toFixed(0), state: __hg.get().state, phase: __hg.get().phase, ach: __hg.ach().done.pest ? 'pest' : '-' }; });
  await p.evaluate(() => { for (let i = 0; i < 4; i++) __hg.step(1); });
  console.log(JSON.stringify(r, null, 1)); console.log('errors', errs);
  await b.close();
})();
