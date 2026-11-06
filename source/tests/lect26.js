const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const mob = process.env.MOB === '1';
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); const p = await b.newPage({ viewport: mob ? { width: 390, height: 760 } : { width: 1100, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await p.goto('file://' + __dirname + '/' + (mob ? 'page-m.html' : 'page.html') + '#debug'); await p.waitForTimeout(400);
  await p.evaluate(() => document.getElementById('startBtn').click());
  const tag = mob ? 'm' : 'd';
  const shot = async name => { await p.waitForTimeout(60); await p.screenshot({ path: __dirname + '/x26-' + tag + '-' + name + '.png' }); };
  const r = {};
  await p.evaluate(() => { __hg.freeze(true); __hg.inv(true); __hg.jump(3); __hg.step(200); });
  r.boss = await p.evaluate(() => { const g = __hg.get(); return JSON.stringify({ key: g.bosses[0].key || g.bosses[0].name, hp: g.bosses[0].max, idx: g.bossIdx, season: document.querySelector('#season, .season') && document.querySelector('#season, .season').textContent }); });
  await shot('intro');
  const step = n => p.evaluate(n => { for (let i = 0; i < n; i++) { __hg.hold(); __hg.step(1); } }, n);
  for (const [atk, wait] of [['goyBeam', 50], ['goyBeam', 72], ['goyBeam2', 50], ['goyBeam2', 105], ['goyWords', 45], ['goyWords', 70], ['goyWords', 100], ['goyWords', 160], ['susHoney', 75], ['whatsapp', 60], ['tower5g', 40], ['tower5g', 75], ['tower5g', 110], ['scream', 40], ['goyBeam', 20], ['goyBeam', 66]]) {
    await p.evaluate(a => { __hg.clearProj && __hg.clearProj(); __hg.hold(); __hg.attack(a); }, atk);
    await step(wait); await shot(atk + wait);
    r[atk + wait] = await p.evaluate(() => JSON.stringify(__hg.projKinds()) + ' sticky ' + JSON.stringify(__hg.get().sticky || ''));
  }
  r.p2 = await p.evaluate(() => { const g = __hg.get().bosses[0]; __hg.hurtBoss(g.hp - g.max * 0.4); for (let i = 0; i < 60; i++) __hg.step(1); return JSON.stringify(__hg.get().bosses[0]); });
  await shot('p2');
  console.log(JSON.stringify(r, null, 1)); console.log('errors', errs);
  await b.close();
})();
