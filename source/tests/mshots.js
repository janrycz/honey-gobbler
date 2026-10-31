const { chromium } = require('playwright');
const fs = require('fs');
const out = process.argv[2], tag = process.argv[3] || 'm';
const botSrc = fs.readFileSync(out + '/dodgebot.js', 'utf8');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 375, height: 635 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + out + '/' + (process.env.PAGE || 'page.html') + '#debug'); await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/${tag}-start.png` });
  await p.addScriptTag({ content: botSrc });
  await p.evaluate(() => document.getElementById('startBtn').click());
  await p.evaluate(() => { __hg.inv(true); __hg.freeze(true); __hg.harvest(4); dodge(600); });
  await p.screenshot({ path: `${out}/${tag}-harvest.png` });
  const keys = ['keeper', 'colonex', 'ceo', 'ironfit', 'apologist', 'looks', 'disprover'];
  for (let i = 0; i < 7; i++) {
    for (const [n, wait] of [[1, 420], [2, 700]]) {
      await p.evaluate(([i, wait, n]) => { if (n === 1) __hg.jump(i); dodge(wait); const bb = __hg.get().bosses[0]; if (bb && bb.hp < 80) __hg.hurtBoss(-150); }, [i, wait, n]);
      await p.screenshot({ path: `${out}/${tag}-${keys[i]}-${n}.png` });
    }
  }
  console.log('sizes', JSON.stringify(await p.evaluate(() => __hg.sizes())), 'ERRORS', JSON.stringify(errs));
  await b.close();
})();
