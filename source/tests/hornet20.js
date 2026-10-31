const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const mob = process.env.MOB === '1';
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); const p = await b.newPage({ viewport: mob ? { width: 390, height: 760 } : { width: 1100, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await p.goto('file://' + __dirname + '/' + (mob ? 'page-m.html' : 'page.html') + '#debug'); await p.waitForTimeout(400);
  await p.addScriptTag({ content: fs.readFileSync(__dirname + '/dodgebot.js', 'utf8') });
  await p.evaluate(() => document.getElementById('startBtn').click());
  const tag = mob ? 'm' : 'd';
  const shot = async name => { await p.waitForTimeout(60); await p.screenshot({ path: __dirname + '/x20-' + tag + '-' + name + '.png' }); };
  const r = {};
  await p.evaluate(() => { __hg.freeze(true); __hg.inv(true); for (const k of ['bee', 'queen', 'thick', 'colonex']) __hg.setUpg(k, 6); __hg.jump(7); __hg.step(200); });
  const step = n => p.evaluate(n => { for (let i = 0; i < n; i++) { __hg.hold(); __hg.step(1); } }, n);
  for (const [atk, wait] of [['bigStinger', 30], ['spray', 70], ['curtain', 45], ['mark', 40], ['hawk', 80], ['nest', 150], ['massacre', 60], ['scouts', 120], ['curtain2', 80], ['diveChain', 75], ['minis', 90]]) {
    r[atk] = await p.evaluate(a => { __hg.clearProj && __hg.clearProj(); __hg.hold(); __hg.attack(a); return 'ok'; }, atk);
    await step(wait); await shot(atk);
    r[atk] = await p.evaluate(() => JSON.stringify(__hg.projKinds()) + ' bees ' + __hg.get().bees + ' fx ' + JSON.stringify(__hg.spoonFx()));
    await p.evaluate(() => { for (let i = 0; i < 240; i++) { __hg.hold(); dodge(1, { speed: 4, replan: 6 }); } });
  }
  r.p3 = await p.evaluate(() => { const g = __hg.get().bosses[0]; __hg.hurtBoss(g.hp - g.max * 0.08); for (let i = 0; i < 90; i++) __hg.step(1); return JSON.stringify(__hg.get().bosses[0]) + ' ' + JSON.stringify(__hg.projKinds()); });
  await shot('p3');
  console.log(JSON.stringify(r, null, 1)); console.log('errors', errs);
  await b.close();
})();
