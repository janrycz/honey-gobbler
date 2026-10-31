import sys
p = sys.argv[1]
s = open(p).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:80]); s = s.replace(old, new)
# bees: lead shrinks as the bee closes in, so it actually reaches the drop
rep("      if (b.tgt) { tx = b.tgt.x; ty = b.tgt.y + b.tgt.vy * 0.12; }",
    "      if (b.tgt) { const dd = Math.hypot(b.tgt.x - b.x, b.tgt.y - b.y); tx = b.tgt.x; ty = b.tgt.y + b.tgt.vy * Math.min(0.25, dd / v); }")
rep("      if (b.tgt && Math.hypot(b.tgt.x - b.x, b.tgt.y - b.y) < 14 * G + 6) beeCatch(b, b.tgt);",
    "      if (b.tgt && Math.hypot(b.tgt.x - b.x, b.tgt.y - b.y) < 18 * G + 8) beeCatch(b, b.tgt);")
# softer smoke
rep("""    ctx.fillStyle = `rgba(232,226,214,${0.16 * a})`;
    for (let i = 0; i < 7; i++) {
      const x = ((i * 173 + t * 25) % (W + 240)) - 120, y = top + 40 + (i * 97) % Math.max(1, (H - top) * 0.8);
      circle(x, y, (60 + (i % 3) * 25) * G); ctx.fill();
    }""", """    for (let i = 0; i < 7; i++) {
      const x = ((i * 173 + t * 25) % (W + 240)) - 120, y = top + 40 + (i * 97) % Math.max(1, (H - top) * 0.8), r = (70 + (i % 3) * 30) * G;
      const g = ctx.createRadialGradient(x, y, 1, x, y, r);
      g.addColorStop(0, `rgba(236,230,218,${0.2 * a})`); g.addColorStop(1, 'rgba(236,230,218,0)');
      ctx.fillStyle = g; circle(x, y, r); ctx.fill();
    }""")
# owned powers: say how to use them, not "owned" twice
rep("        : inf.lv ? 'owned' : touchUI ? 'power' : 'power · key ' + s.key;", "        : touchUI ? 'power' : 'power · key ' + s.key;")
# tighter shed so it fits a laptop screen without scrolling
rep(".overlay.shed .card { min-height: 0; flex: 0 1 auto; width: min(560px, 100%); }",
    ".overlay.shed .card { min-height: 0; flex: 0 1 auto; width: min(560px, 100%); gap: 9px; padding: 16px 18px 14px; }\n.overlay.shed h2 { font-size: 1.75rem; }")
rep("  background: var(--ink); color: var(--wax); border: 2px solid transparent; border-radius: 12px; padding: 9px 10px 8px;",
    "  background: var(--ink); color: var(--wax); border: 2px solid transparent; border-radius: 12px; padding: 7px 10px 6px;")
rep(".detail { text-align: left; background: color-mix(in srgb, var(--ink) 7%, transparent); border-radius: 12px; padding: 10px 12px; display: flex; flex-direction: column; gap: 5px; }",
    ".detail { text-align: left; background: color-mix(in srgb, var(--ink) 7%, transparent); border-radius: 12px; padding: 8px 12px 10px; display: flex; flex-direction: column; gap: 3px; }")
rep(".wallet b { font-family: var(--display); font-size: 1.6rem;", ".wallet b { font-family: var(--display); font-size: 1.4rem;")
open(p, 'w').write(s)
print('ok')
