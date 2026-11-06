import sys
fn = sys.argv[1]
s = open(fn).read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)

def span(start, end):
    i = s.index(start); j = s.index(end, i)
    assert s.count(start) == 1
    return i, j

# ---------- his lines (Jan, 6 Nov) ----------
rep("""      intro: "I'm not interested to be religious but I don't have a choice. If I stay the same bum I am in the clubs of Manhattan, smoking grass all day, walking like a goy everywhere I go, what kind of a girl will I get?", // he opens with it, so everyone gets to read it""",
    """      intro: 'WHATSAPP? WHATSAPP??',""")
rep("""        'iPhone? iPhone?? Garbage!', 'Every day the same story.', 'Stop with the clubs.', "I'm telling you for your own good.", 'You want a good wife? Fix the hair first.',""",
    """        'Every day the same story.', 'Stop with the clubs.', "I'm telling you for your own good.",""")
rep("      defeat: 'OK. OK. But fix the hair.',", "      defeat: 'Every day the same story.',")
rep("      attacks: ['goyBeam', 'goyWords', 'susHoney', 'whatsapp', 'iphones', 'goyWords', 'scream'],",
    "      attacks: ['goyBeam', 'goyWords', 'susHoney', 'tower5g', 'whatsapp', 'goyWords', 'scream'],")
# computer: he'd become the easiest of the three around him, so he attacks more often and hits harder (no extra health); phones: he was the hardest, so a bit slower there
rep("hp: 270, pace: 0.95, phonePace: 0.75, dmgMul: 1.1,", "hp: 270, pace: 0.85, phonePace: 1.1, dmgMul: 1.2,")
# long lines: up to 13 s on screen, and smaller writing on phones
rep("  function lineDur(text) { return Math.max(8, Math.min(22, 2.4 + text.split(' ').length * 0.7)); }",
    "  function lineDur(text) { return Math.max(8, Math.min(13, 2.4 + text.split(' ').length * 0.7)); }")
rep("    const o = { maxW: b.brawl ? Math.min(250, W * 0.44) : two ? Math.min(300, W * 0.46) : narrow ? W * 0.82 : Math.min(360, W * 0.5), discord: b.def.key === 'colonex', minY: combBottom() + 34, avoid: allyBox };",
    "    const o = { maxW: b.brawl ? Math.min(250, W * 0.44) : two ? Math.min(300, W * 0.46) : narrow ? W * 0.82 : Math.min(360, W * 0.5), discord: b.def.key === 'colonex', minY: combBottom() + 34, avoid: allyBox, small: narrow && b.say.text.length > 90 }; // long lines get smaller writing on phones")
# Colonex's messages: smaller on phones, where the screen is busy
rep("    const fs = o.small ? Math.round(clamp(15 * G, 12, 15)) : Math.round(clamp(19 * G, 14, 19)), lh = fs + 5, discord = !!o.discord;",
    "    const fs = o.fs || (o.small ? Math.round(clamp(15 * G, 12, 15)) : Math.round(clamp(19 * G, 14, 19))), lh = fs + 5, discord = !!o.discord;")
rep("    allyBox = speechBox(ally.say.text, ally.x + 14 * k, ally.y - 34 * k, 'right', { small: true, maxW: Math.min(240, W * 0.6), discord: true });",
    "    allyBox = speechBox(ally.say.text, ally.x + 14 * k, ally.y - 34 * k, 'right', W < 560 ? { small: true, fs: 10, maxW: Math.min(190, W * 0.5), discord: true } : { small: true, maxW: Math.min(240, W * 0.6), discord: true });")

# ---------- the goy beam: a ray gun on a tripod beside him that aims at you ----------
i, j = span("    goyBeam(b) { // the goy beam: a big ray gun drops down over your column, charges, and fires", "    goyWords(b) {")
s = s[:i] + """    goyBeam(b) { // the goy beam: a ray gun on a tripod next to him aims at you. "Jew or goy?" ... "GOYYYYYYY"
      say('Jew or goy?', { force: true }, b);
      proj.push(P({ k: 'goyGun', harmless: true, dmg: 14, name: 'Goy beam', color: '#7cc4ff', side: spoon.x < b.x ? -1 : 1, x: b.x, y: b.y, tele: 1.2, on: 0.5, half: 24 }));
      return 2.8;
    },
    goyBeam2(b) { // one on each side; the second fires a moment after the first
      say('Jew or goy?', { force: true }, b);
      const first = spoon.x < b.x ? -1 : 1;
      proj.push(P({ k: 'goyGun', harmless: true, dmg: 14, name: 'Goy beam', color: '#7cc4ff', side: first, x: b.x, y: b.y, tele: 1.2, on: 0.5, half: 24 }));
      proj.push(P({ k: 'goyGun', harmless: true, dmg: 14, name: 'Goy beam', color: '#7cc4ff', side: -first, x: b.x, y: b.y, tele: W < 560 ? 2.15 : 1.9, on: 0.5, half: 24 })); // phones: it locks only after the first beam is gone, so there's always a way out
      return 3.4;
    },
""" + s[j:]
rep("""      if (k === 'bigSting' && !p.fired) {""", """      if (k === 'goyGun') {
        const o = p.owner, kk = bossK();
        const gk = Math.max(0.8, G) * 1.15;
        if (p.px === undefined) { // set down on the floor next to him, and it stays there even if he moves
          if (o && fighting(o)) { p.x = clamp(o.x + p.side * 118 * kk, 70 * gk, W - 70 * gk); p.y = o.y + 70 * kk; }
          p.px = p.x; p.py = p.y - 92 * gk; // the pivot, on top of the tripod
        }
        const lockAt = p.tele - Math.min(0.4, p.tele * 0.35);
        if (p.t < lockAt) p.ang = Math.atan2(spoon.y - p.py, spoon.x - p.px); // it follows you...
        else if (!p.locked) { p.locked = true; sfx.hit(); if (o && fighting(o)) say('GOYYYYYYY', { force: true }, o); } // ...then locks: "Jew or goy?" ... "GOYYYYYYY", then it fires
        if (p.t >= p.tele && !p.fired) { p.fired = true; sfx.boom(); shake = reduceMotion ? 0 : 5; }
        if (p.fired && p.t < p.tele + p.on && !p.hit) {
          const c = Math.cos(p.ang), sn = Math.sin(p.ang), nx = p.px + c * 62 * gk, ny = p.py + sn * 62 * gk, dx = spoon.x - nx, dy = spoon.y - ny;
          if (dx * c + dy * sn > -10 && Math.abs(-dx * sn + dy * c) < p.half * G + spoonSize() * 0.3) { p.hit = true; hurtSpoon(p.dmg, p.color, p.name, { boss: o || boss }); if (state !== 'play') return; }
        }
        if (p.t > p.tele + p.on + 0.35) proj.splice(i, 1);
        continue;
      }
      if (k === 'tower5g') {
        const kk = Math.max(0.75, G), th = 150 * kk, end = p.tele + (p.waves - 1) * p.gap + p.dur;
        const up = ease(clamp(p.t / 0.45, 0, 1)) * (1 - ease(clamp((p.t - end) / 0.4, 0, 1)));
        p.ax = p.x; p.ay = H - 6 - th * up; // the antennas at the top of the mast
        for (let w = 0; w < p.waves; w++) {
          const u = (p.t - p.tele - w * p.gap) / p.dur;
          if (u < 0 || u > 1) continue;
          if (!p.sent[w]) { p.sent[w] = true; sfx.whoosh(); }
          if (p.hitW[w]) continue;
          if (Math.abs(Math.hypot(spoon.x - p.ax, spoon.y - p.ay) - ease(u) * p.R) < 12 * kk + spoonSize() * 0.3) { p.hitW[w] = true; hurtSpoon(p.dmg, p.color, p.name, { boss: p.owner || boss }); if (state !== 'play') return; }
        }
        if (p.t > end + 0.45) proj.splice(i, 1);
        continue;
      }
      if (k === 'bigSting' && !p.fired) {""")
# 5G mast attack (replaces the phones)
i, j = span("    iphones(b) { // the smartphone rant", "    scream(b) {")
s = s[:i] + """    tower5g(b) { // a 5G mast shoots up out of the floor near you and sends out signal waves: get out of its range
      const k = Math.max(0.75, G), R = (W < 560 ? 190 : 250) * k;
      const tx = clamp(spoon.x + rnd(-70, 70) * G, 40 * k, W - 40 * k);
      proj.push(P({ k: 'tower5g', harmless: true, name: '5G mast', color: '#b48cff', x: tx, y: H, cy: H - 6 - 150 * k, tele: 0.95, R, waves: b.p2 ? 4 : 3, gap: 0.42, dur: 0.75, dmg: 7, hitW: [], sent: [] }));
      return 3.6;
    },
""" + s[j:]
i, j = span("  function drawPhone() { // a plain smartphone, no logo", "  function drawPill(p) {")
s = s[:i] + s[j:]
rep("          case 'phone': drawPhone(); break;\n", "")

# ---------- drawing ----------
i, j = span("  function gunGeo(p) {", "  function drawBeamBody(p, t, top) {")
s = s[:i] + """  function drawBeam(p, t) { drawBeamBody(p, t, combBottom()); }
  function drawGoyGun(p, t) { // an original ray gun on a tripod beside him: it pops up, follows you, locks (red line), and fires
    const gk = Math.max(0.8, G) * 1.15, end = p.tele + p.on;
    const pop = p.t < 0.25 ? ease(p.t / 0.25) : p.t > end ? 1 - clamp((p.t - end) / 0.35, 0, 1) : 1;
    if (pop <= 0 || p.px === undefined) return;
    const c = Math.cos(p.ang), sn = Math.sin(p.ang), mx = p.px + c * 62 * gk, my = p.py + sn * 62 * gk, L = W + H;
    if (!p.fired) { // the aim line
      ctx.save(); ctx.setLineDash([12, 9]); ctx.lineWidth = p.locked ? 4 : 2.5;
      ctx.strokeStyle = p.locked ? `rgba(226,32,48,${0.6 + 0.4 * Math.sin(t * 30)})` : 'rgba(124,196,255,.55)';
      ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + c * L, my + sn * L); ctx.stroke(); ctx.restore();
    } else if (p.t < end + 0.2) { // the beam
      const a = 1 - clamp((p.t - end) / 0.2, 0, 1), hw = (p.half - 2) * G;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(mx, my); ctx.rotate(p.ang);
      ctx.fillStyle = 'rgba(124,196,255,.45)'; ctx.fillRect(0, -hw, L, hw * 2);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, -7 * G, L, 14 * G);
      ctx.save(); ctx.translate(Math.min(L, 260 * G), 0); if (c < 0) ctx.rotate(Math.PI); outlined('GOY BEAM', 0, 0, 20, '#1f4fd1'); ctx.restore();
      ctx.restore();
    }
    ctx.save(); ctx.translate(p.px, p.py); ctx.scale(pop, pop);
    ctx.strokeStyle = '#2b2f36'; ctx.lineWidth = 5 * gk; ctx.lineCap = 'round'; // tripod
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-30 * gk, 92 * gk); ctx.moveTo(0, 0); ctx.lineTo(30 * gk, 92 * gk); ctx.moveTo(0, 0); ctx.lineTo(4 * gk, 94 * gk); ctx.stroke();
    ctx.fillStyle = '#2b2f36'; circle(0, 0, 8 * gk); ctx.fill();
    ctx.rotate(p.ang); if (c < 0) ctx.scale(1, -1); // keeps its label the right way up
    const charge = clamp(p.t / p.tele, 0, 1), glow = p.fired ? 1 : charge, blink = Math.sin(t * 20) > 0;
    ctx.fillStyle = '#a7b0be'; ctx.strokeStyle = '#3d4350'; ctx.lineWidth = 2 * gk; // emitter cone
    ctx.beginPath(); ctx.moveTo(34 * gk, -14 * gk); ctx.lineTo(34 * gk, 14 * gk); ctx.lineTo(60 * gk, 26 * gk); ctx.lineTo(60 * gk, -26 * gk); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#d7b65a'; ctx.lineWidth = 2.5 * gk; // coils
    for (let i = 0; i < 3; i++) { const xx = (40 + i * 7) * gk, h = (17 + i * 3.5) * gk; ctx.beginPath(); ctx.ellipse(xx, 0, 2.6 * gk, h, 0, 0, TAU); ctx.stroke(); }
    ctx.fillStyle = '#4b3a78'; ctx.strokeStyle = '#1d1530'; ctx.lineWidth = 3 * gk; roundRect(-44 * gk, -18 * gk, 80 * gk, 36 * gk, 15 * gk); ctx.fill(); ctx.stroke(); // body
    ctx.fillStyle = '#3a2c63'; ctx.beginPath(); ctx.moveTo(-40 * gk, -16 * gk); ctx.lineTo(-58 * gk, -30 * gk); ctx.lineTo(-24 * gk, -18 * gk); ctx.closePath(); ctx.fill(); // fin
    ctx.fillStyle = '#ffd36b'; ctx.fillRect(-42 * gk, 7 * gk, 76 * gk, 4 * gk);
    ctx.fillStyle = '#ece8f7'; roundRect(-32 * gk, -11 * gk, 60 * gk, 14 * gk, 3 * gk); ctx.fill();
    ctx.fillStyle = '#2a1d52'; ctx.font = `900 ${Math.round(9.5 * gk)}px "Instrument Sans", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.save(); if (c < 0) ctx.scale(-1, 1); ctx.fillText('GOY BEAM', (c < 0 ? 2 : -2) * gk, -4 * gk); ctx.restore(); // never mirrored
    ctx.fillStyle = blink ? '#ff4d4d' : '#5a1a1a'; circle(-38 * gk, 0, 3.2 * gk); ctx.fill();
    ctx.fillStyle = `rgba(124,196,255,${0.35 + 0.65 * glow})`; ctx.beginPath(); ctx.ellipse(60 * gk, 0, 6 * gk, 26 * gk, 0, 0, TAU); ctx.fill(); // the dish lights up as it charges
    ctx.fillStyle = `rgba(255,255,255,${0.3 * glow + (p.fired ? 0.5 : 0)})`; circle(64 * gk, 0, (6 + 13 * glow) * gk); ctx.fill();
    if (!p.fired && charge > 0.3) { ctx.strokeStyle = `rgba(160,220,255,${charge})`; ctx.lineWidth = 1.5 * gk; for (let i = 0; i < 3; i++) { const a = t * 9 + i * 2.1, rr = (14 + 9 * Math.sin(t * 13 + i)) * gk; ctx.beginPath(); ctx.moveTo(64 * gk, 0); ctx.lineTo(64 * gk + Math.abs(Math.cos(a)) * rr, Math.sin(a) * rr); ctx.stroke(); } } // sparks
    ctx.restore();
  }
  function drawTower5g(p, t) { // an original lattice mast with three antenna panels and a blinking light
    const kk = Math.max(0.75, G), base = H - 6, end = p.tele + (p.waves - 1) * p.gap + p.dur;
    if (p.t < p.tele) { // its range
      ctx.save(); ctx.setLineDash([10, 8]); ctx.lineWidth = 2.5; ctx.strokeStyle = `rgba(180,140,255,${0.35 + 0.3 * Math.sin(t * 14)})`;
      ctx.beginPath(); ctx.arc(p.x, p.cy, p.R, 0, TAU); ctx.stroke(); ctx.restore();
    }
    for (let w = 0; w < p.waves; w++) { // the signal waves
      const u = (p.t - p.tele - w * p.gap) / p.dur;
      if (u < 0 || u > 1) continue;
      ctx.strokeStyle = `rgba(190,150,255,${1 - u * 0.8})`; ctx.lineWidth = (7 * (1 - u) + 2) * kk;
      ctx.beginPath(); ctx.arc(p.ax, p.ay, ease(u) * p.R, 0, TAU); ctx.stroke();
    }
    const top = p.ay; if (top >= base - 2) return;
    ctx.save();
    ctx.strokeStyle = '#9aa3ad'; ctx.lineWidth = 3 * kk; ctx.lineCap = 'round'; // the mast
    ctx.beginPath(); ctx.moveTo(p.x - 18 * kk, base); ctx.lineTo(p.x - 5 * kk, top + 14 * kk); ctx.moveTo(p.x + 18 * kk, base); ctx.lineTo(p.x + 5 * kk, top + 14 * kk); ctx.stroke();
    ctx.lineWidth = 1.5 * kk; ctx.beginPath(); // bracing
    for (let y = base, n = 0; y > top + 22 * kk; y -= 18 * kk, n++) {
      const f1 = (base - y) / (base - top), f2 = (base - y + 18 * kk) / (base - top), w1 = 18 * kk - 13 * kk * f1, w2 = 18 * kk - 13 * kk * Math.min(1, f2);
      ctx.moveTo(p.x + (n % 2 ? w1 : -w1), y); ctx.lineTo(p.x + (n % 2 ? -w2 : w2), y - 18 * kk);
    }
    ctx.stroke();
    ctx.fillStyle = '#e9ecef'; ctx.strokeStyle = '#6b7380'; ctx.lineWidth = 1.5 * kk; // antenna panels
    for (const dx of [-11, 0, 11]) { roundRect(p.x + dx * kk - 4 * kk, top + (dx ? 4 : 0) * kk, 8 * kk, 22 * kk, 2 * kk); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = '#4b3a78'; roundRect(p.x - 13 * kk, top + 28 * kk, 26 * kk, 14 * kk, 3 * kk); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = `900 ${Math.round(10 * kk)}px "Instrument Sans", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('5G', p.x, top + 35.5 * kk);
    ctx.fillStyle = Math.sin(t * 9) > 0 ? '#ff4d4d' : '#5a1a1a'; circle(p.x, top - 4 * kk, 3.5 * kk); ctx.fill();
    ctx.restore();
  }
""" + s[j:]
rep("    for (const p of proj) if (p.gun) drawGoyGun(p, t); // the goy beam's ray gun hangs over everything up there\n", "")
rep("      case 'beam': drawBeam(p, t); return;", "      case 'beam': drawBeam(p, t); return;\n      case 'goyGun': drawGoyGun(p, t); return;\n      case 'tower5g': drawTower5g(p, t); return;")
rep("  const SPECIAL = { gapMark: 1, knight: 1, ring: 1,", "  const SPECIAL = { goyGun: 1, tower5g: 1, gapMark: 1, knight: 1, ring: 1,")
# the bot's threat feed (debug only) gets the aim and the mast
rep("safe: !!p.safe, half: p.half, G })),", "safe: !!p.safe, half: p.half, ang: p.ang, px: p.px, py: p.py, fired: !!p.fired, on: p.on, cy: p.cy, G })),")

open(fn, 'w').write(s)
print('ok')
