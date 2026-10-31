import sys
p = sys.argv[1]
s = open(p).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:120]); s = s.replace(old, new)

rep("""  function floatText(x, y, text, color = '#f6e3b4', big = false) { floaters.push({ x, y, text, color, big, life: big ? 1.5 : 1 }); }""",
"""  // Floating text never sits on top of other floating text: the newest keeps its spot and anything older that it would
  // cover slides up out of the way. Only two big banners show at once, and a message that's already up is refreshed, not doubled.
  function floatText(x, y, text, color = '#f6e3b4', big = false, sub = '') {
    const same = floaters.find(f => f.text === text && f.big === big && Math.abs(f.x - x) < 80 && Math.abs(f.y0 - y) < 80);
    if (same) { floaters.splice(floaters.indexOf(same), 1); Object.assign(same, { x, y, y0: y, color, sub, life: big ? 1.5 : 1 }); floaters.push(same); return; }
    if (big) { const bigs = floaters.filter(f => f.big && f.life > 0.35); if (bigs.length >= 2) bigs[0].life = 0.35; }
    floaters.push({ x, y, y0: y, oy: 0, text, sub, color, big, life: big ? 1.5 : 1 });
  }
  function measureFloater(f) {
    if (f.big) f.fs = fitFont(f.text, 38, 900, 'Gluten, cursive', W - 32);
    else { f.fs = Math.round(clamp(16 * GT, 13, 16)); ctx.font = `700 ${f.fs}px Gluten, cursive`; }
    f.w = ctx.measureText(f.text).width; f.h = f.fs * 1.05;
    if (f.sub) { f.sfs = Math.round(clamp(16 * GT, 13, 16)); ctx.font = `700 ${f.sfs}px Gluten, cursive`; f.w = Math.max(f.w, ctx.measureText(f.sub).width); f.h += f.sfs * 1.35; }
    f.dx = clamp(f.x, f.w / 2 + 6, Math.max(f.w / 2 + 6, W - f.w / 2 - 6)); // never hangs off the side of the screen
  }
  function layoutFloaters(dt) {
    const placed = [], pad = 3;
    for (let i = floaters.length - 1; i >= 0; i--) { // newest first
      const f = floaters[i];
      measureFloater(f);
      const l = f.dx - f.w / 2 - pad, r = f.dx + f.w / 2 + pad, top = f.y - f.fs * 0.55;
      let want = 0;
      for (let k = 0; k < 24; k++) {
        const t0 = top + want, b0 = t0 + f.h + pad;
        const hit = placed.find(q => l < q.r && r > q.l && t0 < q.b && b0 > q.t);
        if (!hit) break;
        want = hit.t - f.h - pad - top; // sit just above whatever is in the way
      }
      f.oy += (want - f.oy) * Math.min(1, dt * 12);
      placed.push({ l, r, t: top + f.oy, b: top + f.oy + f.h + pad });
    }
  }""")
rep("""    floatText(W / 2, H * 0.44, s.m, s.col, true);
    floatText(W / 2, H * 0.44 + 34, s.name, '#f6e3b4');""", """    floatText(W / 2, H * 0.44, s.m, s.col, true, s.name);""")
rep("""      floatText(W / 2, H * 0.42, 'BEE SWARM!', '#ffe27a', true);
      floatText(W / 2, H * 0.42 + 34, 'The bees are clearing the fakes', '#f6e3b4');""", """      floatText(W / 2, H * 0.42, 'BEE SWARM!', '#ffe27a', true, 'The bees are clearing the fakes');""")
rep("""    for (let i = floaters.length - 1; i >= 0; i--) { const f = floaters[i]; f.y -= (f.big ? 16 : 40) * dt; f.life -= dt * 0.9; if (f.life <= 0) floaters.splice(i, 1); }""",
    """    for (let i = floaters.length - 1; i >= 0; i--) { const f = floaters[i]; f.y -= (f.big ? 16 : 40) * dt; f.life -= dt * 0.9; if (f.life <= 0) floaters.splice(i, 1); }
    layoutFloaters(dt);""")
rep("""    for (const f of floaters) {
      ctx.globalAlpha = Math.max(0, Math.min(1, f.life * 1.5));
      if (f.big) fitFont(f.text, 38, 900, 'Gluten, cursive', W - 32);
      else ctx.font = `700 ${Math.round(clamp(16 * GT, 13, 16))}px Gluten, cursive`;
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(29,17,8,.85)'; ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
    }""", """    for (const f of floaters) {
      if (f.fs === undefined) measureFloater(f);
      ctx.globalAlpha = Math.max(0, Math.min(1, f.life * 1.5));
      const y = f.y + f.oy;
      if (f.big) ctx.font = `900 ${f.fs}px Gluten, cursive`;
      else ctx.font = `700 ${f.fs}px Gluten, cursive`;
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(29,17,8,.85)'; ctx.strokeText(f.text, f.dx, y);
      ctx.fillStyle = f.color; ctx.fillText(f.text, f.dx, y);
      if (f.sub) {
        const sy = y + f.fs * 0.5 + f.sfs * 0.85;
        ctx.font = `700 ${f.sfs}px Gluten, cursive`;
        ctx.strokeText(f.sub, f.dx, sy); ctx.fillStyle = '#f6e3b4'; ctx.fillText(f.sub, f.dx, sy);
      }
    }""")
open(p, 'w').write(s)
print('ok')
