import sys
fn = sys.argv[1]
s = open(fn).read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)

def cut(start, end):  # replace s[start:end) markers (end marker kept)
    global s
    i = s.index(start); j = s.index(end, i)
    assert s.count(start) == 1
    return i, j

# ---------- the Lecturer: his def ----------
RANT = "I'm not interested to be religious but I don't have a choice. If I stay the same bum I am in the clubs of Manhattan, smoking grass all day, walking like a goy everywhere I go, what kind of a girl will I get?"
rep("""      intro: 'WHATSAPP? WHATSAPP??',
      lines: ["I'm not interested to be religious, but I don't have a choice. If I stay the same bum I am, in the clubs of Manhattan, smoking grass all day, walking like a goy everywhere I go, what kind of a girl will I get?",
        'Jew or goy? GOYYYYYYY', 'WHATSAPP? WHATSAPP??', 'Look at this haircut. Look at it!', 'Who cuts hair like this? Who?', 'Next slide. Next slide!',
        'Every day the same story.', 'Stop with the clubs.', "I'm telling you for your own good.", 'You want a good wife? Fix the hair first.',
        '!תתעורר', '?מה זה הדבר הזה', '!די כבר', '!יאללה, הבא'],
      p2line: "Now I'm serious. Next slide!", p2attacks: ['goyBeam2', 'slides'],
      defeat: 'OK. OK. Next question.',""", """      intro: \"""" + RANT + """\", // he opens with it, so everyone gets to read it
      lines: [\"""" + RANT + """\",
        'Jew or goy? GOYYYYYYY', 'WHATSAPP? WHATSAPP??', 'Look at this haircut. Look at it!', 'Who cuts hair like this? Who?', 'Is this a Jewish haircut or a goy haircut?',
        'iPhone? iPhone?? Garbage!', 'Every day the same story.', 'Stop with the clubs.', "I'm telling you for your own good.", 'You want a good wife? Fix the hair first.',
        '?מה קורה', '!אתה גוי', '!תתעורר', '?מה זה הדבר הזה', '!די כבר'],
      p2line: "Now I'm serious. Listen to me!", p2attacks: ['goyBeam2', 'scream'],
      defeat: 'OK. OK. But fix the hair.',""")
rep("hp: 270, pace: 0.95, phonePace: 0.85, dmgMul: 1.1,", "hp: 270, pace: 0.95, phonePace: 0.75, dmgMul: 1.1,") # phones: he was the easiest of the three around him
rep("      attacks: ['goyBeam', 'goyWords', 'susHoney', 'whatsapp', 'slides', 'goyWords'],",
    "      attacks: ['goyBeam', 'goyWords', 'susHoney', 'whatsapp', 'iphones', 'goyWords', 'scream'],")
rep("{ id: 'nextq', name: 'Next question', desc: 'Beat the Lecturer.' },", "{ id: 'nextq', name: 'Lecture over', desc: 'Beat the Lecturer.' },")

# long lines: up to 22 s on screen, and his shouts never cut off a long line people are still reading
rep("  function lineDur(text) { return Math.max(8, 2.4 + text.split(' ').length * 0.7); }",
    "  function lineDur(text) { return Math.max(8, Math.min(22, 2.4 + text.split(' ').length * 0.7)); }\n"
    "  function lsay(b, text) { return say(text, { force: !(b.say && b.say.t > 1 && b.say.text.length > 60) }, b); } // shouts over short lines, never over a long one")

# ---------- his attacks ----------
i, j = cut("    goyBeam(b) { // a big laser down your column", "    pills(b) {")
s = s[:i] + """    goyBeam(b) { // the goy beam: a big ray gun drops down over your column, charges, and fires
      lsay(b, pick(['Jew or goy? GOYYYYYYY', 'GOYYYYYYY']));
      proj.push(P({ k: 'beam', harmless: true, dmg: 12, name: 'Goy beam', color: '#7cc4ff', x: clamp(spoon.x, 76 * Math.max(0.8, G), W - 76 * Math.max(0.8, G)), y: H / 2, tele: 0.95, on: 0.5, half: 26, label: 'GOY BEAM', nolegs: true, gun: true }));
      return 2.6;
    },
    goyBeam2(b) { // two guns, the second a moment later beside the first
      lsay(b, 'GOYYYYYYY');
      const off = W * (W < 560 ? 0.32 : 0.22), m = 76 * Math.max(0.8, G), x1 = clamp(spoon.x, m, W - m), x2 = clamp(x1 + (x1 < W / 2 ? off : -off), m, W - m);
      proj.push(P({ k: 'beam', harmless: true, dmg: 12, name: 'Goy beam', color: '#7cc4ff', x: x1, y: H / 2, tele: 0.95, on: 0.5, half: 26, label: 'GOY BEAM', nolegs: true, gun: true }));
      proj.push(P({ k: 'beam', harmless: true, dmg: 12, name: 'Goy beam', color: '#7cc4ff', x: x2, y: H / 2, tele: 1.6, on: 0.5, half: 26, label: 'GOY BEAM', nolegs: true, gun: true }));
      return 3.2;
    },
    goyWords(b) { // גּוֹי, גּוֹיִם and גּוֹיָה bounce around like rubber balls and squash on every hit
      lsay(b, pick(['!אתה גוי', '?גוי או יהודי', 'Jew or goy?']));
      const k = bossK(), x0 = b.x, y0 = b.y + 20 * k, words = ['גּוֹי', 'גּוֹיִם', 'גּוֹיָה'];
      for (let i = 0, n = Math.max(W < 560 ? 2 : 1, b.p2 ? cntA(3) : cntA(2)); i < n; i++) proj.push(P(Object.assign({ k: 'goyWord', word: pick(words), name: 'Goy', color: '#7cc4ff', x: x0, y: y0, r: 14, dmg: 6, delay: i * 0.25, bounces: 0, sqT: 9, sqAx: 0 }, lob(x0, y0, clamp(spoon.x + rnd(-150, 150) * G, 20, W - 20), 0.95, 700))));
      return 2.9;
    },
    susHoney(b) { // sus honey that leaves the floor sticky, like the Sus Beekeeper's
      lsay(b, pick(['Take the honey. Take it!', 'Very good honey. Very sticky.']));
      const k = bossK(), x0 = b.x - 30 * k, y0 = b.y + 20 * k;
      fan(fanN(moreE(2), 80 * G), 1).forEach((sd, i) => proj.push(P(Object.assign({ k: 'susjar', name: 'Sus honey', color: '#ffcc33', x: x0, y: y0, r: 16, dmg: 10, vr: rnd(-2, 2), delay: i * 0.22, sticky: 'syrup' }, lob(x0, y0, clamp(spoon.x + sd * 80 * G, 20, W - 20), 1.1, 320)))));
      return 2.6;
    },
    whatsapp(b) { // message bubbles rain down around you
      lsay(b, 'WHATSAPP? WHATSAPP??');
      const n = cntA(5), sp = 62 * Math.max(0.75, G), half = (n - 1) / 2 * sp, cx = clamp(spoon.x, 16 + half, Math.max(16 + half, W - 16 - half)); // kept off the walls, so they don't pile up in a corner
      for (let i = 0; i < n; i++) {
        const x = clamp(cx + (i - (n - 1) / 2) * sp + rnd(-10, 10), 16, W - 16);
        proj.push(P({ k: 'waBubble', name: 'WhatsApp', color: '#25d366', x, y: combBottom() + 8, vy: rnd(210, 250), r: 13, dmg: 7, delay: i * 0.17 }));
      }
      return 2.6;
    },
    iphones(b) { // the smartphone rant: phones go in the bin, or at you
      lsay(b, pick(['iPhone? iPhone?? Garbage!', 'Throw the phone away. Throw it!', 'Smartphone? Stupid phone!']));
      const k = bossK(), x0 = b.x + 34 * k, y0 = b.y, n = b.p2 ? cntA(3) : cntA(2);
      for (let i = 0; i < n; i++) proj.push(P(Object.assign({ k: 'phone', name: 'Smartphone', color: '#9fb4c8', x: x0, y: y0, r: 15, dmg: 9, vr: rnd(-5, 5), delay: i * 0.3 }, lob(x0, y0, clamp(spoon.x + rnd(-90, 90) * G, 20, W - 20), rnd(0.95, 1.2), 520))));
      return 2.8;
    },
    scream(b) { // the screaming: a wall of AAAAA comes down with one gap in it
      lsay(b, 'AAAAAAAAAAAAAA!');
      shake = reduceMotion ? 0 : 6; sfx.boom();
      const waves = b.p2 ? 2 : 1, gapW = Math.max(120 * G, spoonSize() * (W < 560 ? 2.4 : 2.8)), step = 30 * Math.max(0.7, G);
      for (let w = 0; w < waves; w++) {
        const gx = clamp(spoon.x + rnd(-0.35, 0.35) * W, gapW / 2 + 12, W - gapW / 2 - 12);
        for (let x = 14; x < W - 6; x += step) if (Math.abs(x - gx) > gapW / 2) proj.push(P({ k: 'scream', name: 'Scream', color: '#ff6b5a', x, y: combBottom() + 10, vy: 165, r: 12, dmg: 8, delay: w * 1.4, ph: rnd(0, 6) }));
      }
      return 3 + (waves - 1) * 1.4;
    },
""" + s[j:]

# the words: much bouncier, and a jelly squash (flat on the floor, thin on the walls) that wobbles back
rep("""      if (k === 'goyWord') {
        p.sq = Math.max(0, (p.sq || 0) - dt * 5);
        if (p.y > H - 14 && p.vy > 0 && p.bounces < 3) { p.y = H - 14; p.vy = -Math.abs(p.vy) * 0.72; p.vx *= 0.6; p.bounces++; p.sq = 1; }
        if ((p.x < p.r + 8 && p.vx < 0) || (p.x > W - p.r - 8 && p.vx > 0)) { p.vx *= -1; p.sq = 1; }
        if (p.bounces > 0 && p.y < combBottom() + 10 && p.vy < 0) { p.vy = Math.abs(p.vy) * 0.6; p.sq = 1; }
      }""", """      if (k === 'goyWord') {
        p.sqT += dt;
        if (p.y > H - 14 && p.vy > 420 && p.bounces < (W < 560 ? 3 : 4)) { p.y = H - 14; p.vy = -Math.abs(p.vy) * 0.84; p.vx *= 0.85; p.bounces++; p.sqT = 0; p.sqAx = 0; } // once the bounces get low it drops out, so it can't pin you in a corner
        if ((p.x < p.r + 8 && p.vx < 0) || (p.x > W - p.r - 8 && p.vx > 0)) { p.vx *= -0.8; p.sqT = 0; p.sqAx = 1; }
        if (p.bounces > 0 && p.y < combBottom() + 10 && p.vy < 0) { p.vy = Math.abs(p.vy) * 0.7; p.sqT = 0; p.sqAx = 0; }
      }""")
rep("""          case 'goyWord': { const q = p.sq || 0; ctx.scale(1 + 0.45 * q, 1 - 0.4 * q); outlined(p.word, 0, 0, W < 560 ? 46 : 32, '#9fd4ff'); break; }
          case 'waBubble': drawWaBubble(); break;
          case 'slide': drawSlide(p); break;""", """          case 'goyWord': drawGoyWord(p); break;
          case 'waBubble': drawWaBubble(); break;
          case 'phone': drawPhone(); break;
          case 'scream': ctx.translate(Math.sin(p.t * 47 + p.ph) * 1.8, Math.cos(p.t * 39 + p.ph) * 1.2); outlined('A', 0, 0, 30, '#ff6b5a'); break;""")
i, j = cut("  function drawSlide(p) { // a photo of a haircut", "  function drawPill(p) {")
s = s[:i] + """  function drawGoyWord(p) {
    const fs = W < 560 ? 52 : 40, e = p.sqT < 1.4 ? Math.exp(-4.5 * p.sqT) * Math.cos(15 * p.sqT) : 0; // squash, then wobble back like jelly
    const st = Math.min(0.22, Math.abs(p.vy) / 2600); // stretched a little when it's moving fast
    let sx, sy;
    if (p.sqAx) { sx = (1 - 0.65 * e) / (1 + st * 0.6); sy = (1 + 0.85 * e) * (1 + st * 0.3); } // hit a wall: squashed thin
    else { sx = (1 + 0.85 * e) / (1 + st * 0.6); sy = (1 - 0.65 * e) * (1 + st); } // hit the floor: squashed flat
    sx = Math.max(0.3, sx); sy = Math.max(0.3, sy);
    if (!p.sqAx) ctx.translate(0, fs * 0.42 * (1 - sy)); // flattens onto the floor rather than shrinking in mid-air
    ctx.scale(sx, sy);
    outlined(p.word, 0, 0, fs, '#9fd4ff');
  }
  function drawPhone() { // a plain smartphone, no logo
    ctx.fillStyle = '#16171b'; roundRect(-10, -18, 20, 36, 4); ctx.fill();
    ctx.strokeStyle = '#5c6470'; ctx.lineWidth = 1.5; ctx.stroke();
    const g = ctx.createLinearGradient(0, -15, 0, 15); g.addColorStop(0, '#3a6fd8'); g.addColorStop(1, '#8a4fd0');
    ctx.fillStyle = g; roundRect(-8, -15, 16, 30, 2.5); ctx.fill();
    ctx.fillStyle = '#16171b'; roundRect(-3.5, -14.5, 7, 2.6, 1.3); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-6, -11, 5, 1.5); ctx.fillRect(-6, -8, 9, 1.5);
  }
""" + s[j:]

# the ray gun the goy beam comes out of (an original design): drops down over the column, charges, fires, goes back up
rep("""  function drawBeam(p, t) {
    const top = combBottom();
    if (p.t < p.tele) {""", """  function gunGeo(p) { // where the ray gun hangs: it drops down out of the comb, and goes back up after firing
    const k = Math.max(0.8, G) * 1.5, life = p.tele + p.on + 0.2, u = p.t, top = combBottom();
    const drop = u < 0.3 ? ease(u / 0.3) : u > life - 0.2 ? 1 - ease(clamp((u - (life - 0.2)) / 0.2, 0, 1)) : 1;
    const gy = top - 46 * k + drop * 82 * k;
    return { k, gy, noz: gy + 44 * k, x: clamp(p.x, 52 * k, W - 52 * k) };
  }
  function drawGoyGun(p, t) { // an original big ray gun the goy beam comes out of: drops down, charges, fires, goes back up
    const { k, gy } = gunGeo(p), u = p.t, charge = clamp(u / p.tele, 0, 1), firing = u >= p.tele, blink = Math.sin(t * 20) > 0;
    ctx.save(); ctx.translate(p.x, gy);
    ctx.strokeStyle = '#1d1530'; ctx.lineWidth = 4 * k; ctx.beginPath(); ctx.moveTo(30 * k, -16 * k); ctx.bezierCurveTo(44 * k, -40 * k, 20 * k, -60 * k, 36 * k, -90 * k); ctx.stroke(); // power cable
    ctx.fillStyle = '#3a2c63'; // fins
    ctx.beginPath(); ctx.moveTo(-40 * k, -14 * k); ctx.lineTo(-52 * k, -30 * k); ctx.lineTo(-26 * k, -16 * k); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(40 * k, -14 * k); ctx.lineTo(52 * k, -30 * k); ctx.lineTo(26 * k, -16 * k); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#a7b0be'; ctx.strokeStyle = '#3d4350'; ctx.lineWidth = 2 * k; // the emitter cone, pointing down
    ctx.beginPath(); ctx.moveTo(-15 * k, 14 * k); ctx.lineTo(15 * k, 14 * k); ctx.lineTo(27 * k, 40 * k); ctx.lineTo(-27 * k, 40 * k); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#d7b65a'; ctx.lineWidth = 2.5 * k; // coils
    for (let i = 0; i < 3; i++) { const yy = (20 + i * 7) * k, w = (18 + i * 3.5) * k; ctx.beginPath(); ctx.ellipse(0, yy, w, 2.6 * k, 0, 0, TAU); ctx.stroke(); }
    ctx.fillStyle = '#4b3a78'; ctx.strokeStyle = '#1d1530'; ctx.lineWidth = 3 * k; roundRect(-48 * k, -18 * k, 96 * k, 36 * k, 16 * k); ctx.fill(); ctx.stroke(); // body
    ctx.fillStyle = '#ffd36b'; ctx.fillRect(-46 * k, 6 * k, 92 * k, 4 * k);
    ctx.fillStyle = '#ece8f7'; roundRect(-31 * k, -10 * k, 62 * k, 14 * k, 3 * k); ctx.fill();
    ctx.fillStyle = '#2a1d52'; ctx.font = `900 ${Math.round(9.5 * k)}px "Instrument Sans", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('GOY BEAM', 0, -3 * k);
    ctx.fillStyle = blink ? '#ff4d4d' : '#5a1a1a'; circle(-40 * k, -4 * k, 3.5 * k); ctx.fill();
    ctx.fillStyle = blink ? '#2b5a2b' : '#5cff7a'; circle(40 * k, -4 * k, 3.5 * k); ctx.fill();
    const glow = firing ? 1 : charge; // the dish lights up as it charges
    ctx.fillStyle = `rgba(124,196,255,${0.35 + 0.65 * glow})`; ctx.beginPath(); ctx.ellipse(0, 40 * k, 28 * k, 6 * k, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${0.3 * glow + (firing ? 0.5 : 0)})`; circle(0, 44 * k, (6 + 14 * glow) * k); ctx.fill();
    if (!firing && charge > 0.3) { ctx.strokeStyle = `rgba(160,220,255,${charge})`; ctx.lineWidth = 1.5 * k; for (let i = 0; i < 3; i++) { const a = t * 9 + i * 2.1, rr = (16 + 10 * Math.sin(t * 13 + i)) * k; ctx.beginPath(); ctx.moveTo(0, 44 * k); ctx.lineTo(Math.cos(a) * rr, 44 * k + Math.abs(Math.sin(a)) * rr); ctx.stroke(); } } // sparks
    ctx.restore();
  }
  function drawBeam(p, t) {
    if (p.gun) { // the beam and its warning start at the gun's dish; the gun itself is drawn later, over the bosses' name bars
      if (p.t >= 0.3 && p.t <= p.tele + p.on) drawBeamBody(p, t, gunGeo(p).noz);
      return;
    }
    drawBeamBody(p, t, combBottom());
  }
  function drawBeamBody(p, t, top) {
    if (p.t < p.tele) {""")

rep("    for (const b of bosses) drawBossUI(b);", "    for (const b of bosses) drawBossUI(b);\n    for (const p of proj) if (p.gun) drawGoyGun(p, t); // the goy beam's ray gun hangs over everything up there")
open(fn, 'w').write(s)
print('ok')
