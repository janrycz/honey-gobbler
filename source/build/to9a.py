import sys
p = sys.argv[1]
s = open(p).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:120]); s = s.replace(old, new)
def between(start, end, new):
    global s
    a = s.index(start); b = s.index(end, a); s = s[:a] + new + s[b:]

# ================= balance =================
# belt: about 15% weaker push, machine hits for 12
rep("const BEE_SPEED = 300, BELT_PUSH = 340;", "const BEE_SPEED = 300, BELT_PUSH = 290;")
rep("proj.push(P({ k: 'belt', harmless: true, dmg: 14, name: 'Assembling machine'", "proj.push(P({ k: 'belt', harmless: true, dmg: 12, name: 'Assembling machine'")
# queen buzz quieter
rep("src.buffer = buzzBuf; src.playbackRate.value = rnd(0.95, 1.05); g.gain.value = 0.3;", "src.buffer = buzzBuf; src.playbackRate.value = rnd(0.95, 1.05); g.gain.value = 0.2;")
# quarks back to the original: they home in for their whole life and honey can't pop them
rep("""          if (p.t < (k === 'quarks' ? 2.5 : p.life)) { // a quark stops homing after 2.5 s, so you can sidestep it""",
    """          if (p.t < p.life) { // quarks and calls home in on you for their whole life""")
rep("""      const qi = proj.findIndex(q => q.k === 'quarks' && !(q.delay > 0) && !q.dead && Math.hypot(q.x - g.x, q.y - g.y) < 20 * G + g.r);
      if (qi >= 0) { // two hits of honey pop a quark
        const q = proj[qi]; globs.splice(i, 1); q.cracked = (q.cracked || 0) + 1; sfx.hit();
        if (q.cracked >= 2) { proj.splice(qi, 1); splat(q.x, q.y, '#ff5a7a', 10); floatText(q.x, q.y - 20, 'POP', '#ffd36b'); }
        else { splat(q.x, q.y, '#ff5a7a', 4); floatText(q.x, q.y - 20, 'CRACK', '#ff9aae'); }
        continue;
      }
""", "")
rep("""            ctx.strokeStyle = p.cracked ? 'rgba(255,154,174,.9)' : 'rgba(255,255,255,.25)'; ctx.lineWidth = p.cracked ? 2 : 1; circle(0, 0, 14); ctx.stroke();""",
    """            ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1; circle(0, 0, 14); ctx.stroke();""")
# magnet: same duration, costs more (same tier as Thicker honey and Worker bee)
rep("{ id: 'magnet', name: 'Honey magnet', cost: costs(0.9),", "{ id: 'magnet', name: 'Honey magnet', cost: costs(1.4),")
# bees: what they catch counts a third towards your combo, but doesn't stop it dropping
rep("""    if (kind === 'shilajit') { startRush(); tally.shilajit++; achStat('shilajit', tally.shilajit); }
    else fillAddict(FILL[kind] || 0);
    if (phase === 'harvest') {
      const mult = combo * (rush > 0 ? RUSH_MULT : 1);""", """    if (kind === 'shilajit') { startRush(); tally.shilajit++; achStat('shilajit', tally.shilajit); }
    else fillAddict(FILL[kind] || 0);
    streak += BEE_COMBO; combo = Math.min(comboCap(), 1 + 0.5 * Math.floor(streak / 5)); // counts a third, and doesn't hold the combo up
    if (phase === 'harvest') {
      const mult = combo * (rush > 0 ? RUSH_MULT : 1);""")
rep("const BEE_SPEED = 300, BELT_PUSH = 290;", "const BEE_SPEED = 300, BELT_PUSH = 290;\n  const BEE_COMBO = 1 / 3; // a bee's catch counts this much towards your combo")

# ================= screen width, and endless getting harder =================
rep("let W = 0, H = 0, DPR = 1, WR = 1, G = 1, GT = 1; // G: halfway between fixed size and full width scaling; GT: gentler, for text",
    "let W = 0, H = 0, DPR = 1, WR = 1, G = 1, GT = 1, WX = 1; // G: halfway between fixed size and full width scaling; GT: gentler, for text\n  // WX: how many times wider than 1100 px the screen is (never below 1). Wider screens get more of everything that's spread across the screen.")
rep("    WR = Math.min(1, W / 1100); G = 0.5 + 0.5 * WR; GT = 0.5 + 0.5 * G;", "    WR = Math.min(1, W / 1100); G = 0.5 + 0.5 * WR; GT = 0.5 + 0.5 * G; WX = Math.max(1, W / 1100);")
rep("""  const cnt = n => Math.max(1, Math.round(n * GT));
  const fallers = (n, make, gap) => { n = cnt(n);""",
"""  // Endless bosses throw 10% more each round (up to double), hit 4% harder each round (up to +60%) and give 3.75% less warning
  // each round (down to 70%). Attacks spread across the screen also scale with its width; attacks aimed at you don't.
  const endlessMore = () => endless ? Math.min(2, 1 + 0.1 * endlessRound) : 1;
  const teleMul = () => endless ? Math.max(0.7, 1 - 0.0375 * endlessRound) : 1;
  const cntW = n => Math.max(1, Math.round(n * GT * WX * endlessMore())); // spread across the screen
  const cntA = n => Math.max(1, Math.round(n * GT * endlessMore())); // aimed at you
  const moreE = n => Math.max(1, Math.round(n * endlessMore())); // fixed patterns that just get bigger in endless
  const fan = (n, step) => Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * step);
  const fallers = (n, make, gap) => { n = cntW(n);""")
rep("""  const P = o => Object.assign({ vx: 0, vy: 0, g: 0, r: 14, dmg: 10, rot: 0, vr: 0, t: 0, delay: 0, color: '#ffffff', name: 'Ouch', owner: boss }, o);""",
"""  const P = o => {
    const p = Object.assign({ vx: 0, vy: 0, g: 0, r: 14, dmg: 10, rot: 0, vr: 0, t: 0, delay: 0, color: '#ffffff', name: 'Ouch', owner: boss }, o);
    if (endless && p.owner) { const m = teleMul(); if (p.delay) p.delay *= m; if (p.tele) p.tele *= m; } // less warning in endless
    return p;
  };""")
# damage
rep("""  function hurtSpoon(dmg, color, name, opts = {}) {
    if (spoon.hurt > 0 || state !== 'play') return false;""", """  function hurtSpoon(dmg, color, name, opts = {}) {
    if (spoon.hurt > 0 || state !== 'play') return false;
    if (opts.boss && endless) dmg = Math.round(dmg * (1 + Math.min(0.6, 0.04 * endlessRound))); // endless bosses hit harder each round""")
# dash warning
rep("    if (d.st === 'tele') { if (d.t > 0.85) {", "    if (d.st === 'tele') { if (d.t > 0.85 * teleMul()) {")
# knight: its landing square warning
rep("        } else if (p.st === 'tele') { if (p.t > 0.5) { p.st = 'jump'; p.t = 0; } }", "        } else if (p.st === 'tele') { if (p.t > 0.5 * teleMul()) { p.st = 'jump'; p.t = 0; } }")

# ---- attacks: counts
rep("      for (let i = 0, n = cnt(5); i < n; i++) {\n        const x = i === 0 ? clamp(spoon.x, 20, W - 20) : W * rnd(0.08, 0.92);",
    "      for (let i = 0, n = cntW(5); i < n; i++) {\n        const x = i === 0 ? clamp(spoon.x, 20, W - 20) : W * rnd(0.08, 0.92);")
rep("""      [-70, 0, 70].forEach((off, i) => {
        const f = pick(syrups);
        proj.push(P(Object.assign({ k: 'bottle', f, name: f.name, color: f.color, x: x0, y: y0, r: 20, dmg: 12, vr: rnd(-3, 3), delay: i * 0.12 }, lob(x0, y0, clamp(spoon.x + off, 20, W - 20), 1.25, 380))));
      });""", """      fan(moreE(3), 70).forEach((off, i) => {
        const f = pick(syrups);
        proj.push(P(Object.assign({ k: 'bottle', f, name: f.name, color: f.color, x: x0, y: y0, r: 20, dmg: 12, vr: rnd(-3, 3), delay: i * 0.12 }, lob(x0, y0, clamp(spoon.x + off, 20, W - 20), 1.25, 380))));
      });""")
rep("""      [-1, 1].forEach((s, i) => {
        const tx = clamp(spoon.x + s * rnd(30, 80), 30, W - 30);""", """      Array.from({ length: moreE(2) }, (_, i) => (i % 2 ? 1 : -1) * (1 + Math.floor(i / 2))).forEach((s, i) => {
        const tx = clamp(spoon.x + s * rnd(30, 80), 30, W - 30);""")
rep("""      for (let i = 0; i < 3; i++) {
        proj.push(P(Object.assign({ k: 'gear', name: 'Gear', color: '#9aa0a8', x: b.x, y: b.y, r: 14, dmg: 10, vr: (i % 2 ? 1 : -1) * rnd(4, 7), delay: i * 0.15 }, lob(b.x, b.y, clamp(spoon.x + (i - 1) * 80, 20, W - 20), 1.2, 400))));
      }""", """      fan(moreE(3), 80).forEach((off, i) => {
        proj.push(P(Object.assign({ k: 'gear', name: 'Gear', color: '#9aa0a8', x: b.x, y: b.y, r: 14, dmg: 10, vr: (i % 2 ? 1 : -1) * rnd(4, 7), delay: i * 0.15 }, lob(b.x, b.y, clamp(spoon.x + off, 20, W - 20), 1.2, 400))));
      });""")
rep("      for (let i = 0, n = cnt(4); i < n; i++) {\n        proj.push(P(Object.assign({ k: 'block',", "      for (let i = 0, n = cntA(4); i < n; i++) {\n        proj.push(P(Object.assign({ k: 'block',")
rep("""      [-0.25, 0, 0.25].forEach((da, i) => proj.push(P({ k: 'cell', name: pick(['#REF!', '#DIV/0!', '#N/A']),""",
    """      fan(moreE(3), 0.25).forEach((da, i) => proj.push(P({ k: 'cell', name: pick(['#REF!', '#DIV/0!', '#N/A']),""")
# bars: more of them on wider screens and in endless
rep("""      const xs = [clamp(spoon.x, w / 2 + 6, W - w / 2 - 6)];
      for (let tries = 0; xs.length < 3 && tries < 40; tries++) { const x = rnd(w / 2 + 6, W - w / 2 - 6); if (xs.every(o => Math.abs(o - x) > w * 1.6)) xs.push(x); }
      // churn is always the tallest bar
      const others = [['MRR', '#34a853'], ['Downloads', '#4285f4'], ['DAU', '#fbbc05']].sort(() => Math.random() - .5), ci = Math.floor(Math.random() * xs.length);
      xs.forEach((x, i) => {
        const [label, color] = i === ci ? ['Churn', '#ea4335'] : others.pop();""", """      const xs = [clamp(spoon.x, w / 2 + 6, W - w / 2 - 6)], want = cntW(3);
      for (let tries = 0; xs.length < want && tries < 60; tries++) { const x = rnd(w / 2 + 6, W - w / 2 - 6); if (xs.every(o => Math.abs(o - x) > w * 1.6)) xs.push(x); }
      // churn is always the tallest bar
      const others = [['MRR', '#34a853'], ['Downloads', '#4285f4'], ['DAU', '#fbbc05']].sort(() => Math.random() - .5), ci = Math.floor(Math.random() * xs.length);
      let oi = 0;
      xs.forEach((x, i) => {
        const [label, color] = i === ci ? ['Churn', '#ea4335'] : others[oi++ % others.length];""")
rep("""      for (let i = 0; i < 3; i++) {
        const y = combBottom() + 10;
        proj.push(P({ k: 'pawn', name: 'Pawn', color: '#f6e3b4', x: clamp(spoon.x + (i - 1) * 70, 20, W - 20), y, ty: y, stepT: 0.3 + i * 0.1, r: 12, dmg: 10, dark: i % 2 === 0 }));
      }""", """      fan(moreE(3), 70).forEach((off, i) => {
        const y = combBottom() + 10;
        proj.push(P({ k: 'pawn', name: 'Pawn', color: '#f6e3b4', x: clamp(spoon.x + off, 20, W - 20), y, ty: y, stepT: 0.3 + i * 0.1, r: 12, dmg: 10, dark: i % 2 === 0 }));
      });""")
rep("      for (let i = 0; i < 2; i++) proj.push(P({ k: 'deen', name: 'DeenBuddy',", "      for (let i = 0, n = cntW(2); i < n; i++) proj.push(P({ k: 'deen', name: 'DeenBuddy',")
rep("""      [-1, 0, 1].forEach((s, i) => proj.push(P(Object.assign({ k: 'resinBlob',""", """      fan(moreE(3), 1).forEach((s, i) => proj.push(P(Object.assign({ k: 'resinBlob',""")
rep("""      [-0.22, 0, 0.22].forEach((da, i) => proj.push(P({ k: 'flagjar', name: 'Relabelled honey',""", """      fan(moreE(3), 0.22).forEach((da, i) => proj.push(P({ k: 'flagjar', name: 'Relabelled honey',""")
rep("""      [-1, 0, 1].forEach((sd, i) => proj.push(P(Object.assign({ k: 'axe', name: 'Spinning axe',""", """      fan(moreE(3), 1).forEach((sd, i) => proj.push(P(Object.assign({ k: 'axe', name: 'Spinning axe',""")
rep("""      NEEDLES.forEach((label, i) => proj.push(P(Object.assign({ k: 'syringe', name: label === 'FIN' ? 'Finasteride' : label === 'TRT' ? 'TRT' : 'Peptides', color: '#9be7ff', label, x: x0, y: y0, r: 13, dmg: 10, delay: i * 0.18 }, lob(x0, y0, clamp(spoon.x + (i - 1) * 75, 20, W - 20), 1.0, 360)))));""",
"""      fan(moreE(3), 75).forEach((off, i) => { const label = NEEDLES[i % NEEDLES.length]; proj.push(P(Object.assign({ k: 'syringe', name: label === 'FIN' ? 'Finasteride' : label === 'TRT' ? 'TRT' : 'Peptides', color: '#9be7ff', label, x: x0, y: y0, r: 13, dmg: 10, delay: i * 0.18 }, lob(x0, y0, clamp(spoon.x + off, 20, W - 20), 1.0, 360)))); });""")
rep("      for (let i = 0, n = cnt(4); i < n; i++) proj.push(P(Object.assign({ k: 'pill',", "      for (let i = 0, n = cntA(4); i < n; i++) proj.push(P(Object.assign({ k: 'pill',")
rep("""      [-1, 1].forEach((sd, i) => proj.push(P(Object.assign({ k: 'liver', name: 'Raw liver', color: '#8e1b2a', x: x0, y: y0, r: 16, dmg: 12, vr: rnd(-2, 2), delay: i * 0.25 }, lob(x0, y0, clamp(spoon.x + sd * rnd(20, 70), 20, W - 20), 1.2, 400)))));""",
"""      fan(moreE(2), 1).forEach((sd, i) => proj.push(P(Object.assign({ k: 'liver', name: 'Raw liver', color: '#8e1b2a', x: x0, y: y0, r: 16, dmg: 12, vr: rnd(-2, 2), delay: i * 0.25 }, lob(x0, y0, clamp(spoon.x + Math.sign(sd) * (Math.abs(sd) + 0.5) * rnd(20, 70), 20, W - 20), 1.2, 400)))));""")
rep("      floodChat(cnt(5));", "      floodChat(cntA(5));")
rep("      floodChat(cnt(9));", "      floodChat(cntA(9));")
rep("      for (let i = 0, n = cnt(6); i < n; i++) {\n        const kind = pick(Object.keys(SNACKS));", "      for (let i = 0, n = cntA(6); i < n; i++) {\n        const kind = pick(Object.keys(SNACKS));")
rep("""      [0.3, 0.7].forEach((fx, i) => proj.push(P({ k: 'hexBig', name: 'The hexagon equation', color: '#f2a516', x: W * fx + rnd(-30, 30), y: combBottom() + 10, vy: 115, r: 28, dmg: 14, vr: 1.4, delay: i * 0.4 })));""",
"""      for (let i = 0, n = cntW(2); i < n; i++) proj.push(P({ k: 'hexBig', name: 'The hexagon equation', color: '#f2a516', x: W * (0.1 + 0.8 * (i + 0.5) / n) + rnd(-30, 30), y: combBottom() + 10, vy: 115, r: 28, dmg: 14, vr: 1.4, delay: i * 0.4 }));""")
rep("""      proj.push(P({ k: 'quarks', name: 'The first two quarks', color: '#ff5a7a', x: b.x, y: b.y + 30, r: 16, dmg: 14, a: 0, life: 3.4 }));""",
"""      for (let i = 0, n = moreE(1); i < n; i++) proj.push(P({ k: 'quarks', name: 'The first two quarks', color: '#ff5a7a', x: b.x + (i ? rnd(-80, 80) : 0), y: b.y + 30, r: 16, dmg: 14, a: i * 2, life: 3.4, delay: i * 0.5 }));""")
rep("""      [0.2, 0.8].forEach((fx, i) => proj.push(P({ k: 'quarks', name: 'The first two quarks', color: '#ff5a7a', x: W * fx, y: b.y + 30, r: 16, dmg: 14, a: i * 2, life: 3.6, delay: i * 0.4 })));""",
"""      for (let i = 0, n = moreE(2); i < n; i++) proj.push(P({ k: 'quarks', name: 'The first two quarks', color: '#ff5a7a', x: W * (0.2 + 0.6 * i / Math.max(1, n - 1)), y: b.y + 30, r: 16, dmg: 14, a: i * 2, life: 3.6, delay: i * 0.4 }));""")
rep("      for (let i = 0, n = cnt(2); i < n; i++) {\n        const dir = i % 2 ? -1 : 1;", "      for (let i = 0, n = cntA(2); i < n; i++) {\n        const dir = i % 2 ? -1 : 1;")
# hypergamy: more women and more men as endless goes on, and across the whole width of the screen
rep("""      const n = cnt(9), tops = [], top = combBottom() + 78;
      for (let i = 0; i < n; i++) tops.push(W * (i + 0.5) / n);
      const m = Math.random() < 0.5 ? 2 : 3, xs = [clamp(spoon.x, 30, W - 30)];
      for (let tries = 0; xs.length < m && tries < 40; tries++) { const x = rnd(40, W - 40); if (xs.every(o => Math.abs(o - x) > W * 0.22)) xs.push(x); }""",
"""      const n = Math.min(40, cntW(9)), tops = [], top = combBottom() + 78;
      for (let i = 0; i < n; i++) tops.push(W * (i + 0.5) / n);
      const m = Math.min(8, Math.round((Math.random() < 0.5 ? 2 : 3) * WX) + (endless ? Math.min(3, Math.floor(endlessRound / 2)) : 0)), xs = [clamp(spoon.x, 30, W - 30)];
      const gap = Math.min(W * 0.22, W * 0.62 / m);
      for (let tries = 0; xs.length < m && tries < 80; tries++) { const x = rnd(40, W - 40); if (xs.every(o => Math.abs(o - x) > gap)) xs.push(x); }""")

# ---- the Sus Beekeeper's smoke: more, bigger, thicker, longer, and it creeps after your spoon
rep("""      const k = bossK(), x0 = b.x + 50 * k, y0 = b.y - 10 * k;
      for (let i = 0; i < 2; i++) {
        const tx = W * rnd(0.15, 0.85), ty = H * rnd(0.38, 0.62);
        proj.push(P({ k: 'smoke', harmless: true, dmg: 0, x: x0, y: y0, vx: (tx - x0) / 1.6, vy: (ty - y0) / 1.6, r: 20 * k, life: 5.5, seed: Math.random() * 10 }));
      }""", """      const k = bossK(), x0 = b.x + 50 * k, y0 = b.y - 10 * k, er = endless ? endlessRound : 0;
      const n = Math.min(9, Math.round((3 + Math.min(3, Math.floor(er / 2))) * WX));
      for (let i = 0; i < n; i++) {
        const tx = W * rnd(0.12, 0.88), ty = H * rnd(0.36, 0.64);
        proj.push(P({ k: 'smoke', harmless: true, dmg: 0, x: x0, y: y0, vx: (tx - x0) / 1.6, vy: (ty - y0) / 1.6, r: 20 * k, seed: Math.random() * 10,
          life: 7 + Math.min(3, 0.3 * er), max: 91 * k * (1 + Math.min(0.5, 0.05 * er)), drift: 40 + Math.min(60, 6 * er), off: (i - (n - 1) / 2) * W * 0.36 / n }));
      }""")
rep("""      if (k === 'smoke') {
        if (p.t < 1.6) { p.x += p.vx * dt; p.y += p.vy * dt; }
        p.r = Math.min(70 * bossK(), p.r + dt * 40);""", """      if (k === 'smoke') {
        if (p.t < 1.6) { p.x += p.vx * dt; p.y += p.vy * dt; }
        else { const tx = clamp(spoon.x + p.off, 40, W - 40); p.x += clamp(tx - p.x, -p.drift * dt, p.drift * dt); } // then it creeps after your spoon
        p.r = Math.min(p.max, p.r + dt * 50);""")
rep("""  function drawSmoke(p) {
    const a = Math.min(1, p.t * 2) * Math.min(1, (p.life - p.t) / 1.2) * .9;
    ctx.fillStyle = `rgba(214,208,196,${a})`;
    for (let i = 0; i < 6; i++) {
      const ang = p.seed + i * 1.05 + p.t * .3;
      circle(p.x + Math.cos(ang) * p.r * .55, p.y + Math.sin(ang) * p.r * .4, p.r * (.55 + (i % 3) * .12)); ctx.fill();
    }
  }""", """  function drawSmoke(p) { // a thick cloud: solid in the middle, puffy round the edge
    const a = Math.min(1, p.t * 2) * Math.min(1, (p.life - p.t) / 1.2);
    ctx.fillStyle = `rgba(214,208,196,${a * .95})`;
    for (let i = 0; i < 7; i++) {
      const ang = p.seed + i * 0.9 + p.t * .3;
      circle(p.x + Math.cos(ang) * p.r * .55, p.y + Math.sin(ang) * p.r * .4, p.r * (.55 + (i % 3) * .12)); ctx.fill();
    }
    ctx.fillStyle = `rgba(200,194,182,${a})`; circle(p.x, p.y, p.r * .62); ctx.fill();
  }""")

# ---- honey: wider screens get more pieces so the screen looks as full, but only the extra pieces are drops, each a little
# lighter, so the kilos per minute are the same on any screen
rep("""    let r = Math.random();
    const x = 30 + Math.random() * (W - 60), y = combBottom();
    if (r < 0.045) { purity < 100 ? items.push({ kind: 'comb', x, y, vy: 110 * sp, r: 16, rot: Math.random() * 6 }) : spawnDrop(sp); return; }""",
"""    let r = Math.random() * WX; // jars, boxes and the rest fall at the same rate on any screen; wider screens just get more drops
    const x = 30 + Math.random() * (W - 60), y = combBottom();
    const hv = upg.hives || 0, dropKg = (0.6 - 0.052 * hv) / (WX - 0.4 - 0.052 * hv); // keeps the drops' kilos per minute the same too
    if (r < 0.045) { purity < 100 ? items.push({ kind: 'comb', x, y, vy: 110 * sp, r: 16, rot: Math.random() * 6 }) : spawnDrop(sp, undefined, undefined, undefined, dropKg); return; }""")
rep("""    r -= 0.04;
    const hv = upg.hives || 0;
    if (r < 0.02 + 0.012 * hv) { spawnBox(sp, x); return; }
    r -= 0.02 + 0.012 * hv;
    if (r < 0.28 + 0.04 * hv) { spawnJar(sp, x); return; }
    spawnDrop(sp);
  }""", """    r -= 0.04;
    if (r < 0.02 + 0.012 * hv) { spawnBox(sp, x); return; }
    r -= 0.02 + 0.012 * hv;
    if (r < 0.28 + 0.04 * hv) { spawnJar(sp, x); return; }
    spawnDrop(sp, undefined, undefined, undefined, dropKg);
  }""")
rep("""  function spawnDrop(sp, y, xMin, xMax) {""", """  function spawnDrop(sp, y, xMin, xMax, kgMul = 1) {""")
rep("""    const kg = rnd(0.05, 0.2);
    items.push({ kind: 'drop', kg, x, y: y ?? combBottom() - 6, vy: (90 + Math.random() * 60) * sp, r: 6 + (kg - 0.05) / 0.15 * 5, stretch: 1 });""",
"""    const kg = rnd(0.05, 0.2);
    items.push({ kind: 'drop', kg: kg * kgMul, x, y: y ?? combBottom() - 6, vy: (90 + Math.random() * 60) * sp, r: 6 + (kg - 0.05) / 0.15 * 5, stretch: 1 });""")
rep("""  function spawnBossHoney() {
    const sp = fallMul();
    const r = Math.random(), x = 30 + Math.random() * (W - 60), y = combBottom();
    if (r < 0.06 && purity < 100) items.push({ kind: 'comb', x, y, vy: 110 * sp, r: 16, rot: Math.random() * 6 });
    else if (r < 0.09) items.push({ kind: 'lab', x, y, vy: 120 * sp, r: 14, rot: 0 });
    else if (r < 0.12) items.push({ kind: 'shilajit', x, y, vy: 140 * sp, r: 19, rot: 0, vr: (Math.random() - .5) * 2 });
    else if (r < 0.135 + 0.01 * (upg.hives || 0)) spawnBox(sp, x);
    else if (r < 0.37 + 0.04 * (upg.hives || 0)) spawnJar(sp, x);
    else spawnDrop(sp);
  }""", """  function spawnBossHoney() { // same idea as spawnHarvest: wider screens get more drops, each a little lighter
    const sp = fallMul(), hv = upg.hives || 0;
    const r = Math.random() * WX, x = 30 + Math.random() * (W - 60), y = combBottom(), dropKg = (0.63 - 0.04 * hv) / (WX - 0.37 - 0.04 * hv);
    if (r < 0.06) { if (purity < 100) items.push({ kind: 'comb', x, y, vy: 110 * sp, r: 16, rot: Math.random() * 6 }); else spawnDrop(sp, undefined, undefined, undefined, dropKg); }
    else if (r < 0.09) items.push({ kind: 'lab', x, y, vy: 120 * sp, r: 14, rot: 0 });
    else if (r < 0.12) items.push({ kind: 'shilajit', x, y, vy: 140 * sp, r: 19, rot: 0, vr: (Math.random() - .5) * 2 });
    else if (r < 0.135 + 0.01 * hv) spawnBox(sp, x);
    else if (r < 0.37 + 0.04 * hv) spawnJar(sp, x);
    else spawnDrop(sp, undefined, undefined, undefined, dropKg);
  }""")
rep("      if (spawnT <= 0) { spawnHarvest(); spawnT = 0.6 * rnd(0.7, 1.3) / G / (endless ? 1 + 0.05 * endlessRound : 1); }",
    "      if (spawnT <= 0) { spawnHarvest(); spawnT = 0.6 * rnd(0.7, 1.3) / G / WX / (endless ? 1 + 0.05 * endlessRound : 1); }")
rep("      if (spawnT <= 0) { spawnBossHoney(); spawnT = rnd(0.42, 0.62) / G; }", "      if (spawnT <= 0) { spawnBossHoney(); spawnT = rnd(0.42, 0.62) / G / WX; }")

# ================= crazy mode: the queen hits both bosses at once =================
rep("""      if (!qd.hit && tg && fighting(tg) && Math.hypot(tg.x - qd.x, tg.y - qd.y) < 62 * bossK()) {
        qd.hit = true; shake = reduceMotion ? 0 : 8;
        for (let i = 0; i < 3; i++) splat(tg.x + rnd(-30, 30), tg.y + rnd(-30, 30), '#f2a516', 10);
        floatText(tg.x, tg.y - 95 * bossK(), 'ROYAL CHARGE', '#ffd36b');
        damageBoss(qd.dmg, tg);
        if (state !== 'play' || !qd) return;
      }""", """      if (!qd.hit && tg && fighting(tg) && Math.hypot(tg.x - qd.x, tg.y - qd.y) < 62 * bossK()) {
        qd.hit = true; shake = reduceMotion ? 0 : 8;
        for (const ob of bosses.filter(fighting)) { // in crazy mode one charge hits both bosses at the same time
          for (let i = 0; i < 3; i++) splat(ob.x + rnd(-30, 30), ob.y + rnd(-30, 30), '#f2a516', 10);
          floatText(ob.x, ob.y - 95 * bossK(), 'ROYAL CHARGE', '#ffd36b');
          damageBoss(qd.dmg, ob);
          if (ob.mode === 'down') achUnlock('royal');
          if (state !== 'play' || !qd) return;
        }
      }""")

# ================= magnet and extractor used together =================
rep("""    const c = extractable();
    if (!c.length) return;
    const d = it => Math.hypot(it.x - spoon.x, it.y - spoon.y);
    const it = c.reduce((a, b) => (d(a) <= d(b) ? a : b)); // the nearest piece first""",
"""    let c = extractable();
    if (!c.length) return;
    const d = it => Math.hypot(it.x - spoon.x, it.y - spoon.y);
    if (magnetT > 0) { const R = W * magnetReach, out = c.filter(it => Math.hypot(it.x - spoon.x, it.y - spoon.y + 10) > R); if (out.length) c = out; } // the magnet already has the near ones
    const it = c.reduce((a, b) => (d(a) <= d(b) ? a : b)); // the nearest piece first""")
rep("""      ctx.save(); ctx.translate(spoon.x, spoon.y - spoonSize() * 1.2 + Math.sin(t * 6) * 3); ctx.scale(G, G);
      ctx.lineCap = 'butt'; ctx.lineWidth = 9; ctx.strokeStyle = '#e2492f';""", """      const side = extractT > 0 || extractRun ? 30 * G : 0; // side by side with the extractor when both are on
      ctx.save(); ctx.translate(spoon.x - side, spoon.y - spoonSize() * 1.2 + Math.sin(t * 6) * 3); ctx.scale(G, G);
      ctx.lineCap = 'butt'; ctx.lineWidth = 9; ctx.strokeStyle = '#e2492f';""")
rep("""      const a = extractRun ? 1 : Math.min(1, extractT * 3), x = spoon.x, y = spoon.y - spoonSize() * 1.3;""",
    """      const a = extractRun ? 1 : Math.min(1, extractT * 3), x = spoon.x + (magnetT > 0 ? 30 * G : 0), y = spoon.y - spoonSize() * 1.3;""")

assert 'cnt(' not in s.replace('cntW(', '').replace('cntA(', '').replace('const cnt ', ''), [l for l in s.split('\n') if 'cnt(' in l.replace('cntW(', '').replace('cntA(', '')][:5]
open(p, 'w').write(s)
print('ok')
