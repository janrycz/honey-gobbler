import sys
fn = sys.argv[1]
s = open(fn).read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)
# a boss's speech bubble never sits on top of Colonex's (the hornet hawking low on the left could put it there)
rep("""    bx = clamp(bx, o.lo ?? 8, (o.hi ?? W - 8) - bw); by = clamp(by, o.minY || 6, H - bh - 6);""",
    """    bx = clamp(bx, o.lo ?? 8, (o.hi ?? W - 8) - bw); by = clamp(by, o.minY || 6, H - bh - 6);
    const av = o.avoid;
    if (av && bx < av.x + av.w && bx + bw > av.x && by < av.y + av.h && by + bh > av.y) by = av.y + av.h + 8 + bh < H - 6 ? av.y + av.h + 8 : Math.max(o.minY || 6, av.y - bh - 8);""")
rep("""    lines.forEach((l, i) => ctx.fillText(l, bx + 13, y + i * lh));
  }""", """    lines.forEach((l, i) => ctx.fillText(l, bx + 13, y + i * lh));
    return { x: bx, y: by, w: bw, h: bh };
  }""")
rep("""  function drawAllySpeech() {
    if (!ally || !ally.say || !anyFighting()) return;""", """  let allyBox = null;
  function drawAllySpeech() {
    allyBox = null;
    if (!ally || !ally.say || !anyFighting()) return;""")
rep("""    speechBox(ally.say.text, ally.x + 14 * k, ally.y - 34 * k, 'right', { small: true, maxW: Math.min(240, W * 0.6), discord: true });""",
    """    allyBox = speechBox(ally.say.text, ally.x + 14 * k, ally.y - 34 * k, 'right', { small: true, maxW: Math.min(240, W * 0.6), discord: true });""")
rep("""discord: b.def.key === 'colonex', minY: combBottom() + 34 };""", """discord: b.def.key === 'colonex', minY: combBottom() + 34, avoid: allyBox };""")
open(fn, 'w').write(s)
print('ok')
