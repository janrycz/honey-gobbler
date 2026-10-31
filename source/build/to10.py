import sys
p = sys.argv[1]
s = open(p).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:120]); s = s.replace(old, new)

# ---- Big Bang: about half the width of a phone screen; laptops and wide screens unchanged
rep("R: clamp(Math.min(W, H) * 0.42, 150, 300), dmg: 22, harmless: true }",
    "R: clamp(Math.min(W * 0.26, H * 0.42), 80, 300), dmg: 22, harmless: true }")

# ---- chess notation: files a-h across the screen, rank 1 is your spoon's row
rep("""  const fan = (n, step) => Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * step);""",
"""  const fan = (n, step) => Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * step);
  // chess notation for the chess attacks: files a-h run across the screen and rank 1 is your spoon's row
  const fileOf = x => 'abcdefgh'[clamp(Math.floor(x / W * 8), 0, 7)];
  const square = (x, rank) => fileOf(x) + clamp(rank, 1, 8);
  const knightRank = (p, y) => 1 + Math.round((p.floor - y) / p.c);""")
# the knight's landing square shows its move while it lights up
rep("""      ctx.strokeStyle = `rgba(255,120,100,${.6 + pulse * .3})`; ctx.lineWidth = 2; ctx.strokeRect(p.tx - c / 2, p.ty - c / 2, c, c);
    }""", """      ctx.strokeStyle = `rgba(255,120,100,${.6 + pulse * .3})`; ctx.lineWidth = 2; ctx.strokeRect(p.tx - c / 2, p.ty - c / 2, c, c);
      txt('N' + square(p.tx, knightRank(p, p.ty)), p.tx, p.ty, Math.round(clamp(c * 0.3, 11, 18)), '#ffe9e4', 800); // its move, e.g. Nf3
    }""")
# the knight landing on you
rep("""            if (Math.abs(p.ty - p.floor) < c * 0.5 && Math.abs(spoon.x - p.x) < c * 0.5 + S * 0.25) { hurtSpoon(p.dmg, p.color, p.name, { boss: p.owner || boss }); if (state !== 'play') return; }""",
    """            if (Math.abs(p.ty - p.floor) < c * 0.5 && Math.abs(spoon.x - p.x) < c * 0.5 + S * 0.25) { hurtSpoon(p.dmg, p.color, p.name, { boss: p.owner || boss, notation: 'Nx' + square(spoon.x, 1) }); if (state !== 'play') return; }""")
# you taking the knight
rep("""            proj.splice(i, 1); splat(p.x, p.y, '#f4f1ea', 12); floatText(p.x, p.y - c * 0.7, 'Knight captured', '#ffd36b'); achAdd('knights', 1);""",
    """            proj.splice(i, 1); splat(p.x, p.y, '#f4f1ea', 12); floatText(p.x, p.y - c * 0.7, 'Sx' + square(p.x, knightRank(p, p.y)) + '!', '#ffd36b', false, 'Spoon takes knight'); achAdd('knights', 1);""")
# bishops and pawns hitting you
rep("""  function projHit(p) {
    const o = p.owner || boss;
    if (!hurtSpoon(p.dmg, p.color, p.name, { boss: o })) return;""", """  function projHit(p) {
    const o = p.owner || boss;
    const notation = p.k === 'bishop' ? 'Bx' + square(spoon.x, 1) : p.k === 'pawn' ? square(spoon.x, 1) + '=Q' : null; // a pawn that reaches you promotes
    if (!hurtSpoon(p.dmg, p.color, p.name, { boss: o, notation })) return;""")
rep("""    floatText(spoon.x, spoon.y - 58, name + '!', color);""",
    """    floatText(spoon.x, spoon.y - 58, opts.notation ? opts.notation + (purity <= 0 ? '#' : '+') : name + '!', color); // chess pieces: check, or mate if it ends your run""")

# ---- "Spoon takes"
rep("""    { id: 'knight', name: 'Knight takes', desc: 'Capture 25 knights by swiping the spoon across them.', stat: 'knights', goal: 25 },""",
    """    { id: 'knight', name: 'Spoon takes', desc: 'Take 25 knights by swiping the spoon through them.', stat: 'knights', goal: 25 },""")
open(p, 'w').write(s)
print('ok')
