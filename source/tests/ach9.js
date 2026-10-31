const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const errs = [];
  const R = {};
  // migration: herp unlocked below 10 million gets locked again; above stays
  for (const billed of [2e6, 2e7]) {
    const ctx = await b.newContext({ viewport: { width: 1100, height: 760 } });
    await ctx.addInitScript(v => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', 1); localStorage.setItem('honey-gobbler-ach', JSON.stringify({ done: { herp: 1, sold: 1 }, stats: { billed: v, season: 7 } })); } }, billed);
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push('mig ' + e.message));
    await p.goto('file://' + out + '/page.html#debug'); await p.waitForTimeout(300);
    R['herp_' + billed] = await p.evaluate(() => ({ done: Object.keys(__hg.ach().done), count: document.querySelector('.achcount').textContent }));
  }
  const ctx = await b.newContext({ viewport: { width: 1100, height: 760 } });
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await p.goto('file://' + out + '/page.html#debug'); await p.waitForTimeout(300);
  await p.click('#startBtn');
  await p.evaluate(() => { __hg.inv(true); __hg.freeze(true); __hg.achReset(); });
  const keys = ['keeper', 'colonex', 'ceo', 'ironfit', 'apologist', 'looks', 'disprover'], idx = k => keys.indexOf(k);
  // quick "run": beat the last boss straight away (nothing bought, no second chance, full purity, a few seconds in)
  R.win = await p.evaluate(i => { __hg.jump(i); __hg.step(200); __hg.hurtBoss(1e6); __hg.step(300); return { state: __hg.get().state, done: Object.keys(__hg.ach().done) }; }, idx('disprover'));
  await p.click('#againBtn2'); await p.waitForTimeout(100);
  await p.evaluate(() => { __hg.inv(true); __hg.freeze(true); });
  R.bosses = await p.evaluate(([a, c]) => { __hg.jump(a); __hg.step(200); __hg.hurtBoss(1e6); __hg.step(600); if (__hg.get().state === 'shed') __hg.closeShed(); __hg.jump(c); __hg.step(200); __hg.hurtBoss(1e6); __hg.step(300); return Object.keys(__hg.ach().done); }, [idx('colonex'), idx('ceo')]);
  // the queen finishing a boss off
  R.royal = await p.evaluate(i => {
    if (__hg.get().state === 'shed') __hg.closeShed();
    __hg.jump(i); __hg.step(200); __hg.setUpg('queen', 10); __hg.ready(); __hg.hurtBoss(__hg.get().bosses[0].hp - 2);
    __hg.power('queen'); let t = 0; while (__hg.get().qd && t < 400) { __hg.step(5); t += 5; }
    return Object.keys(__hg.ach().done).includes('royal');
  }, idx('ironfit'));
  // knights, sugar, tonnes, hive, regular
  R.counts = await p.evaluate(i => {
    if (__hg.get().state === 'shed') __hg.closeShed();
    __hg.jump(i); __hg.step(200);
    for (let k = 0; k < 3; k++) { __hg.spoonTo(200); __hg.knightNow(500); __hg.step(1); __hg.spoonTo(800); __hg.step(1); }
    __hg.harvest(3); __hg.setUpg('sweet', 5); __hg.setUpg('bee', 10); __hg.setCombo(4.5); __hg.bot(true); __hg.step(600); __hg.bot(false);
    __hg.inv(false); __hg.setPurity(100); __hg.clearItems(); __hg.spoonTo(500); __hg.fake(500, 600); __hg.step(30); __hg.inv(true);
    const a = __hg.ach();
    return { stats: a.stats, sugar: !!a.done.sugar };
  }, idx('ceo'));
  // crazy win counts
  R.crazy = await p.evaluate(() => { __hg.crazy(3, 4); __hg.step(300); __hg.hurtBoss(1e6, 0); __hg.hurtBoss(1e6, 1); __hg.step(400); const a = __hg.ach(); return { crazyWins: a.stats.crazyWins, crazy: !!a.done.crazy }; });
  // waitlist link
  const [popup] = await Promise.all([ctx.waitForEvent('page', { timeout: 3000 }).catch(() => null), p.evaluate(() => document.querySelector('.nav a[href*="pages/contact"]').click())]);
  R.real = await p.evaluate(() => !!__hg.ach().done.real);
  // the achievements screen renders all of them
  await p.evaluate(() => { if (__hg.get().state === 'shed') __hg.closeShed(); if (__hg.get().state === 'play') __hg.pause(); });
  await p.click('#pauseScreen [data-ach]'); await p.waitForTimeout(200);
  R.screen = await p.evaluate(() => ({ items: document.querySelectorAll('#achList .ach').length, count: document.getElementById('achCount').textContent }));
  await p.screenshot({ path: out + '/v7-ach.png' });
  console.log(JSON.stringify(R, null, 1));
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
