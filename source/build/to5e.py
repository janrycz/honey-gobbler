import sys
p = sys.argv[1]
s = open(p).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:100]); s = s.replace(old, new)
def between(start, end, new):
    global s
    a = s.index(start); b = s.index(end, a); s = s[:a] + new + s[b:]

rep("    outlined(label, p.x, top + 18, 13, '#ff9a8a');\n  }", "    outlined(label, p.x, top + 52, 13, '#ff9a8a');\n  }")
between('  function drawHammer(p, t) {', '  function drawBigAxe(x, y, sc) {', r'''  function drawHammer(p, t) { // hangs over the strip, shaking, then slams down
    const sc = 1.35 * G, yUp = H * 0.42, yDown = H - 20 * sc, lift = 30 * G;
    if (p.t < p.tele) { warnStrip(p, t, 30 * G, 'BONESMASH'); drawHammerHead(p.x + Math.sin(t * 40) * 2.5 * (p.t / p.tele), yUp - p.t / p.tele * lift, sc); return; }
    const t0 = p.t - p.tele, u = ease(Math.min(1, t0 / 0.08));
    ctx.globalAlpha = 1 - clamp((t0 - 0.55) / 0.3, 0, 1);
    drawHammerHead(p.x, yUp - lift + (yDown - yUp + lift) * u, sc);
    ctx.globalAlpha = 1;
  }
''')
between('  function drawChop(p, t) {', '  const SPECIAL = {', r'''  function drawChop(p, t) {
    const sc = 1.3 * G, yUp = H * 0.4, yDown = H - 10 * sc, lift = 30 * G;
    if (p.t < p.tele) { warnStrip(p, t, 24 * G, 'AXE'); drawBigAxe(p.x + Math.sin(t * 40) * 2.5 * (p.t / p.tele), yUp - p.t / p.tele * lift, sc); return; }
    const t0 = p.t - p.tele, u = ease(Math.min(1, t0 / 0.08));
    ctx.globalAlpha = 1 - clamp((t0 - 0.55) / 0.3, 0, 1);
    drawBigAxe(p.x, yUp - lift + (yDown - yUp + lift) * u, sc);
    ctx.globalAlpha = 1;
  }
''')
rep("      power(k) { return firePower(k); },\n", "      power(k) { return firePower(k); },\n      ready() { for (const k of PKEYS) pcd[k] = 0; qd = null; },\n")
open(p, 'w').write(s)
print('to5e ok')
