import sys
p = sys.argv[1]
s = open(p).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:100]); s = s.replace(old, new)

# two bosses: each keeps to its own half, and so does its speech bubble
rep("    const x = n > 1 ? W * (slot ? 0.72 : 0.28) : W / 2;", "    const x = n > 1 ? W * (slot ? 0.75 : 0.25) : W / 2;")
rep("    if (b.wanderT <= 0) { b.tx = b.n > 1 ? W * (b.slot ? rnd(0.56, 0.86) : rnd(0.14, 0.44)) : W * rnd(0.2, 0.8); b.wanderT = rnd(1.4, 2.8); }",
    "    if (b.wanderT <= 0) { b.tx = b.n > 1 ? W * (b.slot ? rnd(0.62, 0.88) : rnd(0.12, 0.38)) : W * rnd(0.2, 0.8); b.wanderT = rnd(1.4, 2.8); }")
rep("    bx = clamp(bx, 8, W - 8 - bw); by = clamp(by, o.minY || 6, H - bh - 6);", "    bx = clamp(bx, o.lo ?? 8, (o.hi ?? W - 8) - bw); by = clamp(by, o.minY || 6, H - bh - 6);")
rep("    const o = { maxW: two ? (narrow ? W * 0.48 : Math.min(300, W * 0.4)) : narrow ? W * 0.82 : Math.min(360, W * 0.5), discord: b.def.key === 'colonex', minY: combBottom() + 34 };",
    "    const o = { maxW: two ? Math.min(300, W * 0.46) : narrow ? W * 0.82 : Math.min(360, W * 0.5), discord: b.def.key === 'colonex', minY: combBottom() + 34 };\n    if (two) { o.lo = b.slot ? W / 2 + 4 : 8; o.hi = b.slot ? W - 8 : W / 2 - 4; }")
# strip labels go on top of the hammer and axe
rep("""    outlined(label, p.x, top + 52, 13, '#ff9a8a');
  }""", """  }""")
rep("  function warnStrip(p, t, half, label) {", "  function warnStrip(p, t, half) {")
rep("warnStrip(p, t, 30 * G, 'BONESMASH'); drawHammerHead(p.x + Math.sin(t * 40) * 2.5 * (p.t / p.tele), yUp - p.t / p.tele * lift, sc); return; }",
    "warnStrip(p, t, 30 * G); drawHammerHead(p.x + Math.sin(t * 40) * 2.5 * (p.t / p.tele), yUp - p.t / p.tele * lift, sc); outlined('BONESMASH', p.x, combBottom() + 52, 13, '#ff9a8a'); return; }")
rep("warnStrip(p, t, 24 * G, 'AXE'); drawBigAxe(p.x + Math.sin(t * 40) * 2.5 * (p.t / p.tele), yUp - p.t / p.tele * lift, sc); return; }",
    "warnStrip(p, t, 24 * G); drawBigAxe(p.x + Math.sin(t * 40) * 2.5 * (p.t / p.tele), yUp - p.t / p.tele * lift, sc); outlined('AXE', p.x, combBottom() + 52, 14, '#ff9a8a'); return; }")
# the queen launches from far enough in that her whole body is on screen
rep("      if (phase === 'boss' && bosses.some(b => b.mode === 'intro') && qd.t < 5) { qd.x += ((qd.x < W / 2 ? W * 0.08 : W * 0.92) - qd.x) * Math.min(1, dt * 5); return; } // wait for the boss to land",
    "      if (phase === 'boss' && bosses.some(b => b.mode === 'intro') && qd.t < 5) { qd.x += ((qd.x < W / 2 ? queenEdge() : W - queenEdge()) - qd.x) * Math.min(1, dt * 5); return; } // wait for the boss to land")
rep("      const lx = qd.x < W / 2 ? W * 0.08 : W * 0.92, ly = clamp(tg.y + 20 * bossK(), combBottom() + 60, H * 0.6);",
    "      const lx = qd.x < W / 2 ? queenEdge() : W - queenEdge(), ly = clamp(tg.y + 20 * bossK(), combBottom() + 60, H * 0.6);")
rep("  function queenTarget() {", "  const queenScale = () => 1.45 * Math.max(0.7, G);\n  const queenEdge = () => Math.max(W * 0.08, 80 * queenScale());\n  function queenTarget() {")
rep("    drawQueen(qd.x, qd.y, qd.ang, t, 1.45 * Math.max(0.7, G));", "    drawQueen(qd.x, qd.y, qd.ang, t, queenScale());")
open(p, 'w').write(s)
print('to5f ok')
