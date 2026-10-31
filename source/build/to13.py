import sys
fn = sys.argv[1]; s = open(fn).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:100]); s = s.replace(old, new)
# stronger honey magnet: wider reach, faster pull, harder push; in endless the reach grows as things fall faster
rep("    magnet: lv => ({ cd: 35 - (lv - 1) * 17 / 9, dur: 5 + (lv - 1) * 5 / 9, reach: 0.15 + (lv - 1) * 0.15 / 9 }),",
    "    magnet: lv => ({ cd: 35 - (lv - 1) * 17 / 9, dur: 5 + (lv - 1) * 5 / 9, reach: 0.18 + (lv - 1) * 0.17 / 9 }),")
rep("  const lvOf = b => (endless && b && b.endless ? b.elv || 0 : 0);",
    "  const lvOf = b => (endless && b && b.endless ? b.elv || 0 : 0);\n"
    "  const magR = () => W * magnetReach * (endless ? 1 + Math.min(0.4, 0.08 * Math.max(0, fallMul() - 3)) : 1); // reaches further in endless as things fall faster")
rep("if (magnetT > 0) { const R = W * magnetReach, out = c.filter(", "if (magnetT > 0) { const R = magR(), out = c.filter(")
rep("        const R = W * magnetReach * 1.15, ddx = p.x - spoon.x, dd = Math.hypot(ddx, p.y - (spoon.y - 10));",
    "        const R = magR() * 1.15, ddx = p.x - spoon.x, dd = Math.hypot(ddx, p.y - (spoon.y - 10));")
rep("""          const f = 1 - dd / R, push = (ddx >= 0 ? 1 : -1) * 560 * G * (0.35 + f) * dt;
          if (SWAY[k]) p.bx += push; else p.x += push;
          if (p.vy > 0) p.y -= p.vy * pdt * Math.min(1, 1.3 * f);""", """          const f = 1 - dd / R, push = (ddx >= 0 ? 1 : -1) * 1000 * G * (0.35 + f) * dt;
          if (SWAY[k]) p.bx += push; else p.x += push;
          if (p.vy > 0) p.y -= p.vy * pdt * Math.min(1, 2 * f);""")
rep("    const sm = smokeT > 0 ? smokeSlow : 1, qR = W * magnetReach;", "    const sm = smokeT > 0 ? smokeSlow : 1, qR = magR();")
rep("          const st = Math.min(md, (900 * G + 1.5 * it.vy * HS) * dt); it.x += mx2 / md * st; it.y += my2 / md * st;",
    "          const st = Math.min(md, (1500 * G + 2.5 * it.vy * HS) * dt); it.x += mx2 / md * st; it.y += my2 / md * st;")
rep("""          it.base = clamp(it.base + (it.x >= spoon.x ? 1 : -1) * 560 * G * (0.35 + f) * dt, 14, W - 14);
          it.y -= it.vy * dt * sm * Math.min(1, 1.3 * f);""", """          it.base = clamp(it.base + (it.x >= spoon.x ? 1 : -1) * 1000 * G * (0.35 + f) * dt, 14, W - 14);
          it.y -= it.vy * dt * sm * Math.min(1, 2 * f);""")
rep("      const R = W * magnetReach, a = Math.min(1, magnetT * 2);", "      const R = magR(), a = Math.min(1, magnetT * 2);")
rep("desc: 'Pulls nearby honey into your spoon and pushes fakes and boss attacks away, for a few seconds.',",
    "desc: 'Pulls nearby honey into your spoon and pushes fakes and boss attacks away, for a few seconds. In endless it reaches further as things fall faster.',")
open(fn, 'w').write(s); print('ok')
