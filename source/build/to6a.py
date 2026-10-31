import sys
p = sys.argv[1]
s = open(p).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:100]); s = s.replace(old, new)
def between(start, end, new):
    global s
    a = s.index(start); b = s.index(end, a); s = s[:a] + new + s[b:]

# ---------- 1. shed: no per-visit limit; prices weighted by power and rising every level ----------
rep("  let qd = null, savings = 0, fightSaved = 0, crazyOn = false, chat = null, fightHits = 0, shedBought = {};",
    "  let qd = null, savings = 0, fightSaved = 0, crazyOn = false, chat = null, fightHits = 0, comboT = 0;")
rep("    const lv = upg[s.id], maxed = lv >= s.max, locked = !!(s.unlock && !s.unlock()), sold = !!shedBought[s.id];", "    const lv = upg[s.id], maxed = lv >= s.max, locked = !!(s.unlock && !s.unlock());")
rep("    return { lv, maxed, locked, sold, base, cost: base * priceMult() };", "    return { lv, maxed, locked, base, cost: base * priceMult() };")
rep("  const canBuy = inf => !inf.locked && !inf.maxed && !inf.sold && wallet() >= inf.cost;", "  const canBuy = inf => !inf.locked && !inf.maxed && wallet() >= inf.cost;")
rep("inf.maxed ? (s.max === 1 ? 'Owned' : 'Max') : inf.sold ? 'Next visit' : (inf.cost > inf.base", "inf.maxed ? (s.max === 1 ? 'Owned' : 'Max') : (inf.cost > inf.base")
rep("(!inf.locked && !inf.maxed && (inf.sold || wallet() < inf.cost) ? ' cant' : '')", "(!inf.locked && !inf.maxed && wallet() < inf.cost ? ' cant' : '')")
rep("    else if (inf.sold) { btn.textContent = 'Back in stock after the next boss'; btn.disabled = true; }\n", "")
rep("    tally.spent += inf.cost; upg[id]++; shedBought[id] = true;", "    tally.spent += inf.cost; upg[id]++;")
rep("evT = rnd(12, 16); qd = null; shedBought = {};", "evT = rnd(12, 16); qd = null;")
rep("      if (!inf.locked && !inf.maxed) { if (inf.sold) grandadSay(GRANDAD_STOCK); else if (wallet() < inf.cost) grandadSay(GRANDAD_BROKE); }",
    "      if (!inf.locked && !inf.maxed && wallet() < inf.cost) grandadSay(GRANDAD_BROKE);")
rep("  const GRANDAD_STOCK = 'One at a time. Come back after the next boss and I will have another.';\n", "")
rep(" Grandad has one level of each upgrade per visit.</p>", "</p>")
rep("locked: inf.locked, maxed: inf.maxed, sold: inf.sold }; }),", "locked: inf.locked, maxed: inf.maxed }; }),")
rep("  // Priced so that most players are still buying a few rounds into endless mode before everything is maxed.\n  const COST = [3, 4, 5, 6, 7, 8, 10, 12, 14, 17]; // levels 1-10, scaled by each item's weight below",
    "  // Each level costs more than the last, and stronger upgrades cost more. Even a player who spends every kilo\n  // they have on upgrades is still buying a little way into endless mode.\n  const COST = [18, 22, 27, 33, 40, 49, 59, 72, 88, 108]; // levels 1-10, scaled by each item's weight below")
rep("cost: costs(1.2), desc: 'The honey you flick at bosses does more damage.',", "cost: costs(1.4), desc: 'The honey you flick at bosses does more damage.',")
rep("{ id: 'bee', name: 'Worker bee', cost: costs(1.3),", "{ id: 'bee', name: 'Worker bee', cost: costs(1.4),")
rep("{ id: 'colonex', name: 'Pay Colonex', cost: costs(1.0),", "{ id: 'colonex', name: 'Pay Colonex', cost: costs(1.2),")
rep("{ id: 'smoker', name: 'Smoker', cost: costs(0.9),", "{ id: 'smoker', name: 'Smoker', cost: costs(0.8),")
rep("{ id: 'extractor', name: 'Extractor', cost: costs(1.1),", "{ id: 'extractor', name: 'Extractor', cost: costs(1.0),")
# magnet stays 0.9, queen stays 1.3

# ---------- 2. the queen's roar ----------
between("    // the queen's roar: an original growl that swells, brightens, then drops in pitch, with a wing buzz on top\n", "    pour: n =>", r'''    roar: () => { // the queen's roar (see buildRoar), pitched a little differently each time
      if (!ac || muted) return;
      prepRoar();
      if (lastRoar) { try { lastRoar.g.gain.setTargetAtTime(0, ac.currentTime, 0.04); lastRoar.s.stop(ac.currentTime + 0.2); } catch (e) {} }
      const src = ac.createBufferSource(), g = ac.createGain();
      src.buffer = roarBuf; src.playbackRate.value = rnd(0.93, 1.07); g.gain.value = 0.45;
      src.connect(g).connect(ac.destination); src.start();
      lastRoar = { s: src, g };
    },
''')
rep("  const seq = (notes, gap, type = 'triangle', vol = 0.1, dur = 0.14) =>", r'''  // The queen's roar, rendered once into a buffer: a growling voice whose pitch rises then falls (every other
  // pulse is quieter, which gives the growl), a mouth that opens and closes, breath, grit and a short hall echo.
  let roarBuf = null, lastRoar = null;
  function prepRoar() { if (ac && !roarBuf) { const d = buildRoar(ac.sampleRate); roarBuf = ac.createBuffer(1, d.length, ac.sampleRate); roarBuf.getChannelData(0).set(d); } }
  function buildRoar(sr) {
    const n = Math.floor(sr * 1.9), out = new Float32Array(n);
    let seed = 1234567;
    const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; };
    const sm = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
    const bq = () => ({ b0: 0, b1: 0, b2: 0, a1: 0, a2: 0, x1: 0, x2: 0, y1: 0, y2: 0 });
    const set = (f, type, fc, Q) => {
      const w = TAU * fc / sr, al = Math.sin(w) / (2 * Q), c = Math.cos(w), a0 = 1 + al;
      if (type === 'bp') { f.b0 = al / a0; f.b1 = 0; f.b2 = -al / a0; }
      else if (type === 'lp') { f.b0 = f.b2 = (1 - c) / 2 / a0; f.b1 = (1 - c) / a0; }
      else { f.b0 = f.b2 = (1 + c) / 2 / a0; f.b1 = -(1 + c) / a0; }
      f.a1 = -2 * c / a0; f.a2 = (1 - al) / a0;
    };
    const run = (f, x) => { const y = f.b0 * x + f.b1 * f.x1 + f.b2 * f.x2 - f.a1 * f.y1 - f.a2 * f.y2; f.x2 = f.x1; f.x1 = x; f.y2 = f.y1; f.y1 = y; return y; };
    const FM = [bq(), bq(), bq(), bq()], FG = [1, 0.8, 0.35, 0.12], NB = bq(), LP = bq(), HP = bq();
    set(NB, 'bp', 2600, 0.7); set(HP, 'hp', 110, 0.707);
    let ph = 0, ph2 = 0, alt = false, jf = 1, sh = 1, low = 0;
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const f0 = (105 + 45 * sm(0, 0.22, t) - 10 * sm(0.22, 0.75, t) - 48 * sm(0.75, 1.5, t)) * jf; // a quick rise, a held growl, a long fall
      ph += f0 / sr;
      if (ph >= 1) { ph -= 1; alt = !alt; jf = 1 + 0.035 * rand(); sh = 1 + 0.18 * rand(); }
      ph2 += 2 * f0 / sr; if (ph2 >= 1) ph2 -= 1;
      const src = (2 * ph - 1) * (alt ? 1 : 0.5) * sh + (2 * ph2 - 1) * 0.45 * sm(0.18, 0.45, t) * (1 - sm(0.9, 1.3, t));
      const open = sm(0.08, 0.7, t) * (1 - 0.9 * sm(0.9, 1.45, t));
      if (i % 32 === 0) { set(LP, 'lp', 900 + 3600 * open, 0.9); set(FM[0], 'bp', 400 + 330 * open, 4); set(FM[1], 'bp', 880 + 520 * open, 6); set(FM[2], 'bp', 2000 + 400 * open, 8); set(FM[3], 'bp', 3100 + 200 * open, 8); }
      let v = 0; for (let k = 0; k < 4; k++) v += run(FM[k], src) * FG[k];
      low += 0.05 * (src - low); v += low * 0.45;
      const env = (1 - Math.exp(-t / 0.035)) * (0.8 + 0.2 * sm(0.2, 0.9, t)) * (t < 1.15 ? 1 : Math.exp(-(t - 1.15) / 0.2));
      const breath = run(NB, rand()) * (0.5 * Math.exp(-t / 0.15) + 0.25) * env;
      out[i] = run(HP, run(LP, Math.tanh(1.8 * (v * env * 1.6 + breath * 0.2))) + breath * 0.35 * (0.15 + open));
    }
    const D = [1557, 1617, 1491, 1422].map(d => Math.round(d * sr / 44100)), cb = D.map(d => new Float32Array(d)), ci = D.map(() => 0);
    const A = [225, 556].map(d => Math.round(d * sr / 44100)), ab = A.map(d => new Float32Array(d)), ai = A.map(() => 0);
    let peak = 0;
    for (let i = 0; i < n; i++) {
      const x = out[i]; let c = 0;
      for (let k = 0; k < 4; k++) { const y = cb[k][ci[k]]; cb[k][ci[k]] = x + y * 0.78; ci[k] = (ci[k] + 1) % D[k]; c += y; }
      c *= 0.25;
      for (let k = 0; k < 2; k++) { const wd = ab[k][ai[k]], w = c + 0.5 * wd; ab[k][ai[k]] = w; ai[k] = (ai[k] + 1) % A[k]; c = wd - 0.5 * w; }
      out[i] = x + 0.22 * c; peak = Math.max(peak, Math.abs(out[i]));
    }
    for (let i = 0; i < n; i++) out[i] *= 0.9 / peak;
    return out;
  }
  const seq = (notes, gap, type = 'triangle', vol = 0.1, dur = 0.14) =>''')
rep("      sfx.roar(1.2);\n", "      sfx.roar();\n")
rep("      sfx.roar(0.9);\n", "      sfx.roar();\n")
# render the roar while the game is paused in the shed, so the first one never stutters
rep("    cancelBuy(); shedPinned = false; $('colonexMsg').hidden = true; $('toast').classList.add('low');",
    "    cancelBuy(); shedPinned = false; $('colonexMsg').hidden = true; $('toast').classList.add('low');\n    setTimeout(prepRoar, 200);")

# ---------- 3. the Factorio belt: longer, under you, pulling you into an assembling machine ----------
rep("""      const len = W * rnd(0.42, 0.55), x0 = clamp(spoon.x - len * rnd(0.3, 0.7), 0, W - len), dir = Math.random() < .5 ? 1 : -1;
      proj.push(P({ k: 'belt', harmless: true, dmg: 0, x0, x1: x0 + len, x: x0 + len / 2, y: H - 16, dir, life: 6 }));""",
"""      // a long belt right under you that drags you into an assembling machine at its far end
      const len = W * rnd(0.7, 0.82), dir = Math.random() < .5 ? 1 : -1, f = rnd(0.25, 0.5);
      const x0 = clamp(dir > 0 ? spoon.x - len * f : spoon.x + len * f - len, 0, W - len), x1 = x0 + len;
      const mx = dir > 0 ? Math.min(x1, W - 34 * G) : Math.max(x0, 34 * G);
      proj.push(P({ k: 'belt', harmless: true, dmg: 14, name: 'Assembling machine', color: '#9aa0a8', x0, x1, x: (x0 + x1) / 2, y: H - 16, dir, mx, life: 6.5 }));""")
rep("      return 3.0;\n    },\n    jobs(b) {", "      return 3.4;\n    },\n    jobs(b) {")
rep("    for (const p of proj) if (p.k === 'belt' && !(p.delay > 0) && spoon.x > p.x0 && spoon.x < p.x1) spoon.tx = clamp(spoon.tx + p.dir * 230 * dt, 20, W - 20);",
"""    let belt = null;
    for (const p of proj) if (p.k === 'belt' && !(p.delay > 0) && p.t < p.life && spoon.x > p.x0 && spoon.x < p.x1) belt = p;
    if (belt) { // works against the mouse and touch too: the belt shifts where your pointer puts the spoon
      const push = belt.dir * BELT_PUSH * G * (smokeT > 0 ? smokeSlow : 1) * dt;
      spoon.tx = clamp(spoon.tx + push, 20, W - 20); spoon.drift += push; if (drag) drag.s0 += push;
    } else spoon.drift *= Math.max(0, 1 - dt * 3);""")
rep("    if (e.pointerType === 'mouse') { spoon.tx = clamp(x, 20, W - 20);", "    if (e.pointerType === 'mouse') { spoon.tx = clamp(x + spoon.drift, 20, W - 20);")
rep("    spoon = { x: W / 2, y: H - spoonSize() * 0.9, tx: W / 2, glow: 0, chew: 0, hurt: 0, fill: 0, tint: '#7cff6b', frozen: 0, slow: 0 };",
    "    spoon = { x: W / 2, y: H - spoonSize() * 0.9, tx: W / 2, glow: 0, chew: 0, hurt: 0, fill: 0, tint: '#7cff6b', frozen: 0, slow: 0, drift: 0 };")
rep("  const BEE_SPEED = 300;", "  const BEE_SPEED = 300, BELT_PUSH = 340;")
rep("      if (k === 'belt') { if (p.t > p.life) proj.splice(i, 1); continue; }", """      if (k === 'belt') {
        if (p.t > p.life) { proj.splice(i, 1); continue; }
        if (p.t > 0.5 && Math.abs(spoon.x - p.mx) < 30 * G + S * 0.3) { // dragged into the assembling machine
          if (hurtSpoon(p.dmg, p.color, p.name, { boss: p.owner || boss })) {
            const kb = -p.dir * 160 * G;
            spoon.tx = clamp(spoon.x + kb, 20, W - 20); spoon.drift += kb; if (drag) drag.s0 += kb;
            sfx.thud(); splat(spoon.x, spoon.y, '#9aa0a8', 10);
          }
          if (state !== 'play') return;
        }
        continue;
      }""")
between('  function drawBelt(p, t) {', '  function drawRing(p, t) {', r'''  function drawBelt(p, t) {
    const y = H - 26, h = 16;
    ctx.fillStyle = '#2f3033'; ctx.fillRect(p.x0, y, p.x1 - p.x0, h);
    ctx.save(); ctx.beginPath(); ctx.rect(p.x0, y, p.x1 - p.x0, h); ctx.clip();
    ctx.strokeStyle = '#f2c200'; ctx.lineWidth = 2.5;
    const off = ((t * 150 * p.dir) % 18 + 18) % 18;
    for (let x = p.x0 - 18 + off; x < p.x1 + 18; x += 18) {
      ctx.beginPath(); ctx.moveTo(x - 4 * p.dir, y + 3); ctx.lineTo(x + 3 * p.dir, y + h / 2); ctx.lineTo(x - 4 * p.dir, y + h - 3); ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = '#4a4b50'; ctx.fillRect(p.x0, y - 2, p.x1 - p.x0, 2); ctx.fillRect(p.x0, y + h, p.x1 - p.x0, 2);
    txt('THE FACTORY MUST GROW', (p.x0 + p.x1) / 2, y - 9, 9, 'rgba(242,194,0,.8)', 900);
    drawAssembler(p.mx, H - 4, G, t, p.dir);
  }
  function drawAssembler(x, yb, sc, t, dir) { // the machine at the end of the belt
    ctx.save(); ctx.translate(x, yb); ctx.scale(sc, sc);
    ctx.shadowColor = 'rgba(226,32,48,.55)'; ctx.shadowBlur = 14;
    roundRect(-32, -64, 64, 64, 5); ctx.fillStyle = '#5b5f66'; ctx.fill(); ctx.shadowBlur = 0;
    ctx.lineWidth = 2; ctx.strokeStyle = '#2b2d31'; ctx.stroke();
    ctx.fillStyle = '#4a4e55'; ctx.fillRect(-32, -16, 64, 16);
    ctx.save(); ctx.beginPath(); ctx.rect(-32, -16, 64, 5); ctx.clip(); ctx.fillStyle = '#f2c200'; ctx.fillRect(-32, -16, 64, 5);
    ctx.fillStyle = '#16161a'; for (let i = -40; i < 40; i += 10) { ctx.beginPath(); ctx.moveTo(i, -11); ctx.lineTo(i + 5, -16); ctx.lineTo(i + 10, -16); ctx.lineTo(i + 5, -11); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    roundRect(-21, -56, 42, 36, 4); ctx.fillStyle = '#1d1f23'; ctx.fill();
    ctx.save(); ctx.translate(0, -38); ctx.rotate(t * 5 * dir); drawGear(13); ctx.restore();
    ctx.save(); ctx.translate(-12, -46); ctx.rotate(-t * 7 * dir); drawGear(6); ctx.restore();
    txt('ASSEMBLER', 0, -6, 7.5, '#f2c200', 900);
    ctx.fillStyle = '#e2203a'; circle(26, -58, 2.5 + Math.sin(t * 12)); ctx.fill();
    ctx.restore();
  }
''')

# ---------- 4. the combo ticks down when you stop catching ----------
rep("  const RUSH_TIME = 9, RUSH_MULT = 1.5;", "  const RUSH_TIME = 9, RUSH_MULT = 1.5;\n  const COMBO_GRACE = 2.5, COMBO_STEP = 1.5; // catch nothing for 2.5 s and the combo drops a step, then another every 1.5 s")
rep("    score = 0; purity = 100; combo = 1; streak = 0;", "    score = 0; purity = 100; combo = 1; streak = 0; comboT = 0;")
rep("    streak++;\n    const oldCombo = combo;", "    streak++; comboT = 0;\n    const oldCombo = combo;")
rep("      if (ev.caught) {\n        const add = 1.6 * dt * (rush > 0 ? RUSH_MULT : 1);", "      if (ev.caught) {\n        comboT = 0;\n        const add = 1.6 * dt * (rush > 0 ? RUSH_MULT : 1);")
rep("    praiseT = Math.max(0, praiseT - dt);\n    spoon.hurt", "    praiseT = Math.max(0, praiseT - dt);\n    comboT += dt;\n    if (combo > 1 && comboT >= COMBO_GRACE) { combo -= 0.5; streak = (combo - 1) * 10; comboT = COMBO_GRACE - COMBO_STEP; }\n    spoon.hurt")
rep('      <div class="stat"><b id="combo">×1</b><span>combo</span></div>', '      <div class="stat"><b id="combo">×1</b><div class="cbar" aria-hidden="true"><i id="cfill"></i></div><span>combo</span></div>')
rep(".pbar.low i { background: linear-gradient(90deg, #6e0b18, var(--sus)); }", ".pbar.low i { background: linear-gradient(90deg, #6e0b18, var(--sus)); }\n.cbar { width: 100%; min-width: 36px; height: 3px; margin-top: 3px; border-radius: 2px; background: color-mix(in srgb, var(--wax) 14%, transparent); overflow: hidden; }\n.cbar i { display: block; height: 100%; width: 0; border-radius: inherit; background: var(--honey); }")
rep("    setStyle('combo', 'color', rush > 0 ? 'var(--honey)' : '');", "    setStyle('combo', 'color', rush > 0 ? 'var(--honey)' : '');\n    setStyle('cfill', 'width', (combo > 1 ? Math.round(clamp(1 - comboT / COMBO_GRACE, 0, 1) * 50) * 2 : 0) + '%'); // time left before it drops")

# ---------- 5. axes that look like axes ----------
rep("  function drawAxe(r) {\n    roundRect(-2.5, -r * 1.2, 5, r * 2.4, 2); ctx.fillStyle = '#8a5a2b'; ctx.fill();\n    ctx.beginPath(); ctx.moveTo(2, -r * 1.1); ctx.quadraticCurveTo(r * 1.5, -r * 1.2, r * 1.3, -r * 0.1); ctx.quadraticCurveTo(r * 0.9, -r * 0.35, 2, -r * 0.35); ctx.closePath();\n    ctx.fillStyle = '#c9ced6'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = '#6a6e76'; ctx.stroke();\n    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(r * 1.0, -r * 0.95); ctx.quadraticCurveTo(r * 1.35, -r * 0.6, r * 1.22, -r * 0.2); ctx.stroke();\n  }",
r'''  // An axe: a wooden haft running down from a steel head. The poll is on the left, and the bit flares out to the
  // right into a curved, sharpened edge. The middle of the edge is at (50, -40).
  function axeShape(haft) {
    ctx.beginPath(); ctx.moveTo(-4.5, -44); ctx.lineTo(-4, haft - 10); ctx.quadraticCurveTo(-6.5, haft - 4, -6.5, haft); ctx.lineTo(6.5, haft); ctx.quadraticCurveTo(6.5, haft - 4, 4, haft - 10); ctx.lineTo(4.5, -44); ctx.closePath();
    const wg = ctx.createLinearGradient(-5, 0, 5, 0); wg.addColorStop(0, '#6e4320'); wg.addColorStop(.5, '#b07a42'); wg.addColorStop(1, '#6e4320');
    ctx.fillStyle = wg; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = '#3e250f'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-15, -50); ctx.lineTo(8, -50); ctx.quadraticCurveTo(22, -50, 44, -66); ctx.quadraticCurveTo(57, -40, 44, -14); ctx.quadraticCurveTo(22, -30, 8, -30); ctx.lineTo(-15, -30); ctx.quadraticCurveTo(-19, -40, -15, -50); ctx.closePath();
    const sg = ctx.createLinearGradient(-15, 0, 52, 0); sg.addColorStop(0, '#4f555d'); sg.addColorStop(.45, '#8f969f'); sg.addColorStop(1, '#eef1f4');
    ctx.fillStyle = sg; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = '#2f343a'; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(42.5, -62); ctx.quadraticCurveTo(53.5, -40, 42.5, -18); ctx.stroke();
    ctx.fillStyle = '#5a3a1a'; ctx.fillRect(-4.5, -50, 9, 4);
    ctx.fillStyle = '#c9ced6'; circle(0, -40, 2); ctx.fill();
  }
  function drawAxe(r) { // a thrown hatchet, spinning around its middle
    const sc = r / 42;
    ctx.save(); ctx.scale(sc, sc); ctx.translate(-19, -2); axeShape(70); ctx.restore();
  }''')
between('  function drawBigAxe(x, y, sc) {', '  const SPECIAL = {', r'''  function drawBigAxe(x, y, sc, side, ang) { // blade down, haft rising off to one side, the edge's middle at (x, y)
    ctx.save(); ctx.translate(x, y); ctx.scale(side * sc, sc); ctx.rotate(ang); ctx.translate(-50, 40); axeShape(165); ctx.restore();
  }
  function drawChop(p, t) {
    const sc = 1.15 * G, yUp = H * 0.42, yDown = H - 6, lift = 30 * G, side = p.x < W / 2 ? -1 : 1, A = 1.92; // 110 degrees: the bit points down
    if (p.t < p.tele) {
      const k = p.t / p.tele;
      warnStrip(p, t, 24 * G);
      drawBigAxe(p.x + Math.sin(t * 40) * 2.5 * k, yUp - k * lift, sc, side, A - 0.35 * k + Math.sin(t * 9) * 0.04);
      outlined('AXE', p.x, combBottom() + 52, 14, '#ff9a8a');
      return;
    }
    const t0 = p.t - p.tele, u = ease(Math.min(1, t0 / 0.08));
    ctx.globalAlpha = 1 - clamp((t0 - 0.55) / 0.3, 0, 1);
    drawBigAxe(p.x, yUp - lift + (yDown - yUp + lift) * u, sc, side, A - 0.35 + 0.35 * u);
    ctx.globalAlpha = 1;
  }
''')

# ---------- 6. the Looksmaxxer is fair-skinned ----------
rep("    const skin = p2 ? '#cf5640' : '#c98a5c', skinD = p2 ? '#9e3324' : '#a5693f', skinL = p2 ? '#f39a82' : '#e6b088', tee = '#141416', vein = '#701810';",
    "    const skin = p2 ? '#e2705c' : '#f2d0b4', skinD = p2 ? '#b0473a' : '#d6a689', skinL = p2 ? '#f7a593' : '#fde8d8', tee = '#141416', vein = '#701810';")

open(p, 'w').write(s)
print('to6a ok')
