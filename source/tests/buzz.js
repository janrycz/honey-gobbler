const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const errs = [];
  const p = await (await b.newContext({ viewport: { width: 1100, height: 760 } })).newPage();
  p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => {
    window.__plays = [];
    const orig = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...a) { window.__plays.push({ len: this.buffer && this.buffer.duration, rate: this.playbackRate.value }); return orig.apply(this, a); };
  });
  await p.goto('file://' + out + '/page.html#debug');
  await p.waitForTimeout(400);
  await p.click('#startBtn');
  await p.evaluate(() => { __hg.inv(true); __hg.setUpg('queen', 3); __hg.jump(2); __hg.step(200); __hg.ready(); });
  const fired = await p.evaluate(() => __hg.power('queen'));
  await p.evaluate(() => __hg.step(120));
  await p.waitForTimeout(300);
  const plays = await p.evaluate(() => window.__plays);
  console.log('queen fired', fired, '| buffer plays', JSON.stringify(plays));
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
