const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); const ctx = await b.newContext({ viewport: { width: 1100, height: 760 } });
  const errs = [];
  const g = await ctx.newPage(); g.on('pageerror', e => errs.push(e.message));
  await g.goto('file://' + __dirname + '/page.html#debug'); await g.waitForTimeout(300);
  await g.evaluate(() => { localStorage.removeItem('honey-gobbler-waitlist'); __hg.achReset(); });
  await g.evaluate(() => document.getElementById('startBtn').click());
  const before = await g.evaluate(() => !!__hg.ach().done.real);
  // the waitlist page, in another tab, after a successful signup
  const w = await ctx.newPage(); await w.goto('file://' + __dirname + '/blank.html');
  await w.evaluate(() => { try { localStorage.setItem('honey-gobbler-waitlist', '1'); } catch (e) {} });
  await g.waitForTimeout(400);
  const live = await g.evaluate(() => !!__hg.ach().done.real);
  // a fresh load picks it up too
  await g.evaluate(() => __hg.achReset()); await g.reload(); await g.waitForTimeout(400);
  const boot = await g.evaluate(() => !!__hg.ach().done.real);
  const desc = await g.evaluate(() => { document.querySelector('[data-ach]').click(); return [...document.querySelectorAll('#achList .ach')].map(e => e.textContent).filter(t => /real thing|Supermarket/.test(t)); });
  console.log({ before, live, boot, desc, errs });
  await b.close();
})();
