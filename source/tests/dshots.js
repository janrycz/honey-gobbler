const { chromium } = require('playwright');
const fs = require('fs');
const out = process.argv[2];
const botSrc = fs.readFileSync(out + '/dodgebot.js', 'utf8');
(async () => {
  const b = await chromium.launch();
  const errs = [];
  for (const [w, h] of [[1100, 760], [1909, 900]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + out + '/page.html#debug'); await p.waitForTimeout(300);
    await p.addScriptTag({ content: botSrc });
    await p.evaluate(() => document.getElementById('startBtn').click());
    await p.evaluate(() => { __hg.inv(true); __hg.freeze(true); });
    // crazy mode fight with Colonex and the Looksmaxxer
    await p.evaluate(() => { __hg.crazy(1, 5); __hg.setRound(6); dodge(400); __hg.attack('hypergamy', 1); dodge(70); });
    await p.screenshot({ path: `${out}/d-${w}-crazy.png` });
    await p.evaluate(() => { __hg.endlessBoss(0); __hg.setRound(8); dodge(250); __hg.attack('smoke'); dodge(150); });
    await p.screenshot({ path: `${out}/d-${w}-smoke8.png` });
  }
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
