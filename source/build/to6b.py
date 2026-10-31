import sys
p = sys.argv[1]
s = open(p).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:100]); s = s.replace(old, new)
def between(start, end, new):
    global s
    a = s.index(start); b = s.index(end, a); s = s[:a] + new + s[b:]

# the missing link: a real interlocking chain with one link gone, broken links either side and a "?" in the gap
rep("""      let n = 0;
      wall(() => ({ k: 'link', name: 'Missing link', color: '#b8c0cc', vy: 150, r: 13, dmg: 12, flip: n++ % 2 }), 0.7, 3.0);
      return 3.2;""", """      const step = 38 * G, gapW = spoonSize() * 3.0, gx = W * rnd(0.18, 0.82), y = combBottom() + 6;
      let i = 0;
      for (let x = 10; x < W + 30; x += step, i++) {
        if (Math.abs(x - gx) < gapW / 2) continue;
        const nearGap = Math.abs(x - gx) < gapW / 2 + step;
        proj.push(P({ k: 'link', name: 'Missing link', color: '#b8c0cc', x, y, vy: 150, r: 13, dmg: 12, delay: 0.7, flip: nearGap ? 0 : i % 2, broken: nearGap ? (x < gx ? 1 : -1) : 0 }));
      }
      proj.push(P({ k: 'linkGap', harmless: true, dmg: 0, x: gx, y, vy: 150, delay: 0.7 }));
      return 3.2;""")
between('  function drawLink(p) {', '  function drawFish(p) {', r'''  function drawLink(p) { // one link of the chain: lying flat (an oval) or standing on its edge (a bar through its neighbours)
    const L = 25, R = 9;
    ctx.lineCap = 'round';
    if (p.flip) {
      ctx.lineWidth = 7; ctx.strokeStyle = '#4f5660'; ctx.beginPath(); ctx.moveTo(-L + 4, 0); ctx.lineTo(L - 4, 0); ctx.stroke();
      ctx.lineWidth = 2.5; ctx.strokeStyle = '#d4dae2'; ctx.beginPath(); ctx.moveTo(-L + 6, -1.2); ctx.lineTo(L - 6, -1.2); ctx.stroke();
      return;
    }
    const open = p.broken ? 0.6 : 0, a0 = p.broken < 0 ? Math.PI + open : open, a1 = a0 + TAU - 2 * open; // broken open towards the gap
    ctx.lineWidth = 7; ctx.strokeStyle = '#4f5660'; ctx.beginPath(); ctx.ellipse(0, 0, L, R, 0, a0, a1); ctx.stroke();
    ctx.lineWidth = 2.5; ctx.strokeStyle = '#d4dae2'; ctx.beginPath(); ctx.ellipse(0, -1, L, R, 0, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  }
''')
rep("          case 'link': drawLink(p); break;\n", "          case 'link': drawLink(p); break;\n          case 'linkGap': outlined('?', 0, -2, 30, '#cfe8ff'); txt('MISSING LINK', 0, 20, 8, '#cfe8ff', 900); break;\n")
# test switch for a clean combo check
rep("      setCombo(c) { combo = c; streak = (c - 1) * 10; comboT = 0; },\n", "      setCombo(c) { combo = c; streak = (c - 1) * 10; comboT = 0; },\n      clearItems() { items = []; },\n")
open(p, 'w').write(s)
print('to6b ok')
