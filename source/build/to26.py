import sys
fn = sys.argv[1]
s = open(fn).read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)

# ================= boss 4: the Lecturer (a parody of a viral lecturer) =================
rep("""    {
      key: 'ironfit', name: 'The Shilajit Coach',""", """    {
      key: 'lecturer', name: 'The Lecturer', tag: 'Lecturer', sub: 'Live from the studio. Judging your haircut. Asking about WhatsApp.', hp: 270, pace: 0.95, phonePace: 0.85, dmgMul: 1.1,
      intro: 'WHATSAPP? WHATSAPP??',
      lines: ["I'm not interested to be religious, but I don't have a choice. If I stay the same bum I am, in the clubs of Manhattan, smoking grass all day, walking like a goy everywhere I go, what kind of a girl will I get?",
        'Jew or goy? GOYYYYYYY', 'WHATSAPP? WHATSAPP??', 'Look at this haircut. Look at it!', 'Who cuts hair like this? Who?', 'Next slide. Next slide!',
        'Every day the same story.', 'Stop with the clubs.', "I'm telling you for your own good.", 'You want a good wife? Fix the hair first.',
        '!תתעורר', '?מה זה הדבר הזה', '!די כבר', '!יאללה, הבא'],
      p2line: "Now I'm serious. Next slide!", p2attacks: ['goyBeam2', 'slides'],
      defeat: 'OK. OK. Next question.',
      lose: 'The Lecturer asked what kind of a girl you will get. Nobody answered.',
      attacks: ['goyBeam', 'goyWords', 'susHoney', 'whatsapp', 'slides', 'goyWords'],
    },
    {
      key: 'ironfit', name: 'The Shilajit Coach',""")
rep("""    pills(b) {""", """    goyBeam(b) { // a big laser down your column
      say(pick(['Jew or goy? GOYYYYYYY', 'GOYYYYYYY']), { force: true });
      proj.push(P({ k: 'beam', harmless: true, dmg: 12, name: 'Goy beam', color: '#7cc4ff', x: clamp(spoon.x, 20, W - 20), y: H / 2, tele: 0.95, on: 0.5, half: 26, label: 'GOY BEAM', nolegs: true }));
      return 2.6;
    },
    goyBeam2(b) { // two of them, the second a moment later beside the first
      say('GOYYYYYYY', { force: true });
      const off = W * (W < 560 ? 0.32 : 0.22), x1 = clamp(spoon.x, 20, W - 20), x2 = clamp(x1 + (x1 < W / 2 ? off : -off), 20, W - 20);
      proj.push(P({ k: 'beam', harmless: true, dmg: 12, name: 'Goy beam', color: '#7cc4ff', x: x1, y: H / 2, tele: 0.95, on: 0.5, half: 26, label: 'GOY BEAM', nolegs: true }));
      proj.push(P({ k: 'beam', harmless: true, dmg: 12, name: 'Goy beam', color: '#7cc4ff', x: x2, y: H / 2, tele: 1.6, on: 0.5, half: 26, label: 'GOY BEAM', nolegs: true }));
      return 3.2;
    },
    goyWords(b) { // the words bounce around like the pills and squash when they hit something
      say(pick(['!גוי', '?גוי או יהודי', 'Jew or goy?']));
      const k = bossK(), x0 = b.x, y0 = b.y + 20 * k;
      for (let i = 0, n = b.p2 ? cntA(3) : cntA(2); i < n; i++) proj.push(P(Object.assign({ k: 'goyWord', word: Math.random() < 0.5 ? 'גוי' : 'גויים', name: 'Goy', color: '#7cc4ff', x: x0, y: y0, r: 14, dmg: 7, vr: rnd(-1.2, 1.2), delay: i * 0.25, bounces: 0, sq: 0 }, lob(x0, y0, clamp(spoon.x + rnd(-150, 150) * G, 20, W - 20), 0.95, 700))));
      return 2.7;
    },
    susHoney(b) { // sus honey that leaves the floor sticky, like the Sus Beekeeper's
      say(pick(['Take the honey. Take it!', 'Very good honey. Very sticky.']));
      const k = bossK(), x0 = b.x - 30 * k, y0 = b.y + 20 * k;
      fan(fanN(moreE(2), 80 * G), 1).forEach((sd, i) => proj.push(P(Object.assign({ k: 'susjar', name: 'Sus honey', color: '#ffcc33', x: x0, y: y0, r: 16, dmg: 10, vr: rnd(-2, 2), delay: i * 0.22, sticky: 'syrup' }, lob(x0, y0, clamp(spoon.x + sd * 80 * G, 20, W - 20), 1.1, 320)))));
      return 2.6;
    },
    whatsapp(b) { // message bubbles rain down around you
      say('WHATSAPP? WHATSAPP??', { force: true });
      const n = cntA(5), sp = 62 * Math.max(0.75, G), half = (n - 1) / 2 * sp, cx = clamp(spoon.x, 16 + half, Math.max(16 + half, W - 16 - half)); // kept off the walls, so they don't pile up in a corner
      for (let i = 0; i < n; i++) {
        const x = clamp(cx + (i - (n - 1) / 2) * sp + rnd(-10, 10), 16, W - 16);
        proj.push(P({ k: 'waBubble', name: 'WhatsApp', color: '#25d366', x, y: combBottom() + 8, vy: rnd(210, 250), r: 13, dmg: 7, delay: i * 0.17 }));
      }
      return 2.6;
    },
    slides(b) { // photos of haircuts, thrown like slides
      say(pick(['Look at this haircut. Look at it!', 'Who cuts hair like this? Who?', 'Next slide. Next slide!']));
      const k = bossK(), x0 = b.x + 30 * k, y0 = b.y, n = b.p2 ? cntA(3) : cntA(2);
      for (let i = 0; i < n; i++) proj.push(P(Object.assign({ k: 'slide', name: 'Haircut slide', color: '#e8e2d4', x: x0, y: y0, r: 17, dmg: 9, vr: rnd(-3, 3), delay: i * 0.3, cut: i % 2 }, lob(x0, y0, clamp(spoon.x + rnd(-90, 90) * G, 20, W - 20), rnd(0.95, 1.2), 520))));
      return 2.8;
    },
    pills(b) {""")
# the goy words bounce (floor, walls, ceiling) and squash on every hit
rep("""      if (k === 'pill') {""", """      if (k === 'goyWord') {
        p.sq = Math.max(0, (p.sq || 0) - dt * 5);
        if (p.y > H - 14 && p.vy > 0 && p.bounces < 3) { p.y = H - 14; p.vy = -Math.abs(p.vy) * 0.72; p.vx *= 0.6; p.bounces++; p.sq = 1; }
        if ((p.x < p.r + 8 && p.vx < 0) || (p.x > W - p.r - 8 && p.vx > 0)) { p.vx *= -1; p.sq = 1; }
        if (p.bounces > 0 && p.y < combBottom() + 10 && p.vy < 0) { p.vy = Math.abs(p.vy) * 0.6; p.sq = 1; }
      }
      if (k === 'pill') {""")
rep("""          case 'pill': drawPill(p); break;""", """          case 'pill': drawPill(p); break;
          case 'goyWord': { const q = p.sq || 0; ctx.scale(1 + 0.45 * q, 1 - 0.4 * q); outlined(p.word, 0, 0, W < 560 ? 46 : 32, '#9fd4ff'); break; }
          case 'waBubble': drawWaBubble(); break;
          case 'slide': drawSlide(p); break;""")
rep("""  function drawPill(p) {""", """  function drawWaBubble() { // a green chat bubble with a question mark
    ctx.fillStyle = '#25d366'; circle(0, 0, 13); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-9, 7); ctx.lineTo(-14, 15); ctx.lineTo(-2, 11); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; circle(0, 0, 13); ctx.stroke();
    txt('?', 0, 1, 15, '#ffffff', 900);
  }
  function drawSlide(p) { // a photo of a haircut: a dark head shape in profile with the hair standing up (no face)
    ctx.fillStyle = '#fbfaf6'; roundRect(-17, -17, 34, 34, 3); ctx.fill(); ctx.strokeStyle = '#8c8577'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#d8d3c8'; ctx.fillRect(-14, -14, 28, 28);
    ctx.fillStyle = '#5b5550'; ctx.beginPath(); ctx.ellipse(1, 3, 8.5, 10, 0, 0, TAU); ctx.fill(); ctx.fillRect(-2, 10, 7, 6);
    ctx.fillStyle = '#1d1a18'; ctx.beginPath();
    if (p.cut) { ctx.moveTo(-7, -2); for (let i = 0; i < 6; i++) { ctx.lineTo(-6 + i * 3, -14 - (i % 2) * 3); ctx.lineTo(-4.5 + i * 3, -6); } ctx.lineTo(9, -1); ctx.closePath(); } // spiky mohawk
    else { ctx.moveTo(-8, -1); ctx.quadraticCurveTo(-6, -15, 6, -12); ctx.quadraticCurveTo(14, -9, 12, -16); ctx.quadraticCurveTo(10, -4, 9, 0); ctx.closePath(); } // the swoop
    ctx.fill();
  }
  function drawPill(p) {""")
# the beam: wider, labelled, no chair legs for the goy beam
rep("        const t0 = p.t - p.tele, on = k === 'rope' ? 0.45 : p.on, half = (k === 'rope' ? 24 : 14) * G;",
    "        const t0 = p.t - p.tele, on = k === 'rope' ? 0.45 : p.on, half = (k === 'rope' ? 24 : p.half || 14) * G;")
rep("          if (k === 'beam') {\n            sfx.whoosh();", "          if (k === 'beam' && !p.nolegs) {\n            sfx.whoosh();")
rep("""          } else {
            sfx.thud();
            sticky.push({ x: p.x, w: 130 * G, life: 6, kind: 'resin' });""", """          } else if (k === 'beam') sfx.boom();
          else {
            sfx.thud();
            sticky.push({ x: p.x, w: 130 * G, life: 6, kind: 'resin' });""")
rep("""      txt('CNC', p.x, top + 14, 11, '#9be7ff', 900);
      return;
    }
    const a = 1 - clamp((p.t - p.tele - p.on) / 0.2, 0, 1);
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(155,231,255,.35)'; ctx.fillRect(p.x - 12 * G, top, 24 * G, H - top);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(p.x - 3 * G, top, 6 * G, H - top);
    ctx.globalAlpha = 1;""", """      txt(p.label || 'CNC', p.x, p.half ? H * 0.6 : top + 14, p.half ? 13 : 11, '#9be7ff', 900);
      if (p.half) { ctx.strokeStyle = `rgba(124,196,255,${.25 + pulse * .3})`; ctx.strokeRect(p.x - p.half * G, top, p.half * 2 * G, H - top); }
      return;
    }
    const a = 1 - clamp((p.t - p.tele - p.on) / 0.2, 0, 1), hw = (p.half ? p.half - 2 : 12) * G;
    ctx.globalAlpha = a;
    ctx.fillStyle = p.half ? 'rgba(124,196,255,.45)' : 'rgba(155,231,255,.35)'; ctx.fillRect(p.x - hw, top, hw * 2, H - top);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(p.x - (p.half ? 7 : 3) * G, top, (p.half ? 14 : 6) * G, H - top);
    if (p.label && p.half) { ctx.save(); ctx.translate(p.x, (top + H) / 2); ctx.rotate(-Math.PI / 2); outlined(p.label, 0, 0, 20, '#1f4fd1'); ctx.restore(); }
    ctx.globalAlpha = 1;""")
# drawing him: faceless, dark suit, white shirt, black kippah, long white beard, finger up
rep("""  function drawApologist(b, t) {""", """  function drawLecturer(b, t) {
    const skin = '#d9a77f', suit = '#17171c', up = b.pose > 0, wag = Math.sin(t * (up ? 16 : 2.5)) * (up ? 5 : 1.5);
    ctx.fillStyle = suit; roundRect(-20, 36, 17, 32, 4); ctx.fill(); roundRect(3, 36, 17, 32, 4); ctx.fill();
    ctx.fillStyle = '#050505'; ctx.beginPath(); ctx.ellipse(-12, 69, 12, 5, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(12, 69, 12, 5, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-32, -14); ctx.quadraticCurveTo(-31, -23, -20, -24); ctx.lineTo(20, -24); ctx.quadraticCurveTo(31, -23, 32, -14); ctx.lineTo(28, 38); ctx.lineTo(-28, 38); ctx.closePath();
    ctx.fillStyle = suit; ctx.fill();
    ctx.fillStyle = '#f4f1ea'; ctx.beginPath(); ctx.moveTo(-10, -24); ctx.lineTo(0, 10); ctx.lineTo(10, -24); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-10, -24); ctx.lineTo(-4, 12); ctx.moveTo(10, -24); ctx.lineTo(4, 12); ctx.stroke(); // lapels
    // left arm down with his notes, right arm up with one finger raised
    limb(-30, -14, -38, 12, 13, suit); limb(-38, 12, -28, 28, 11, suit);
    ctx.fillStyle = '#f4f1ea'; ctx.save(); ctx.translate(-26, 30); ctx.rotate(-0.25); ctx.fillRect(-9, -6, 18, 13); ctx.strokeStyle = '#b8b2a5'; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-7, -3 + i * 4); ctx.lineTo(7, -3 + i * 4); ctx.stroke(); } ctx.restore();
    ctx.fillStyle = skin; circle(-28, 28, 5.5); ctx.fill();
    limb(30, -14, 44, -22, 13, suit); limb(44, -22, 40 + wag, -52, 11, suit);
    ctx.fillStyle = '#f4f1ea'; circle(40 + wag, -53, 5.8); ctx.fill();
    ctx.fillStyle = skin; circle(40 + wag, -58, 6); ctx.fill(); roundRect(38 + wag, -74, 4.5, 15, 2); ctx.fill();
    // head (no face): neck, ears, black kippah, grey sides, and the long white beard
    ctx.fillStyle = skin; roundRect(-7, -32, 14, 10, 3); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-15.5, -46, 3.5, 5, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(15.5, -46, 3.5, 5, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -47, 15, 18, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#c9c6bf'; ctx.beginPath(); ctx.ellipse(-13, -52, 3.5, 8, 0.2, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(13, -52, 3.5, 8, -0.2, 0, TAU); ctx.fill();
    ctx.fillStyle = '#0b0b0d'; ctx.beginPath(); ctx.ellipse(0, -63, 12.5, 5.5, 0, Math.PI, TAU); ctx.fill(); ctx.fillRect(-12.5, -63.5, 25, 2);
    ctx.fillStyle = '#f2f1ec';
    ctx.beginPath(); ctx.moveTo(-15, -50); ctx.quadraticCurveTo(-23, -18, -13, 12); ctx.quadraticCurveTo(-6, 26, 0, 28); ctx.quadraticCurveTo(6, 26, 13, 12); ctx.quadraticCurveTo(23, -18, 15, -50); ctx.quadraticCurveTo(11, -36, 0, -36); ctx.quadraticCurveTo(-11, -36, -15, -50); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(150,145,135,.55)'; ctx.lineWidth = 1.2;
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 5, -34); ctx.quadraticCurveTo(i * 6 + Math.sin(t * 2 + i) * 1.5, -6, i * 3.5, 20); ctx.stroke(); }
  }
  function drawApologist(b, t) {""")
rep("  const BOSS_DRAW = { keeper: drawKeeper, colonex: drawColonex, ceo: drawCEO, ironfit: drawIronfit,",
    "  const BOSS_DRAW = { keeper: drawKeeper, colonex: drawColonex, ceo: drawCEO, lecturer: drawLecturer, ironfit: drawIronfit,")
rep("    ceo: 'app founder owes loksd corporation 400$ download fee',",
    "    ceo: 'app founder owes loksd corporation 400$ download fee',\n    lecturer: 'lecturer pls stop asking about whatsapp. loksd corporation uses discord',")
rep("    else if (!endless && bossIdx === BOSS_COUNT - 1 && !fromPause) grandadSay('Hornets. In my day we used a tennis racket.');",
    "    else if (!endless && bossIdx === BOSS_COUNT - 1 && !fromPause) grandadSay('Hornets. In my day we used a tennis racket.');\n"
    "    else if (!endless && bossIdx === 3 && !fromPause) grandadSay(\"Some fella's coming to lecture you about your haircut. Just nod.\");")

# nine bosses: the season gets a Midsummer, the goal is 1,350 kg
rep("const STAGE_KG = 150, BOSS_COUNT = 8, GOAL = STAGE_KG * BOSS_COUNT;", "const STAGE_KG = 150, BOSS_COUNT = 9, GOAL = STAGE_KG * BOSS_COUNT;")
rep("    { m: 'June', name: 'Early summer', col: '#ffe27a', top: '#3e260c', mid: '#26150a', glow: 'rgba(255,200,90,.17)', part: 'pollen' },",
    "    { m: 'June', name: 'Early summer', col: '#ffe27a', top: '#3e260c', mid: '#26150a', glow: 'rgba(255,200,90,.17)', part: 'pollen' },\n"
    "    { m: 'Midsummer', name: 'Longest days', col: '#ffd060', top: '#40250b', mid: '#27150a', glow: 'rgba(255,185,70,.18)', part: 'pollen' },")
rep("<span><b>150</b>Mar</span><span><b>300</b>Apr</span><span><b>450</b>May</span><span><b>600</b>Jun</span><span><b>750</b>Jul</span><span><b>900</b>Aug</span><span><b>1050</b>Sep</span><span><b>1200</b>Oct</span>",
    "<span><b>150</b>Mar</span><span><b>300</b>Apr</span><span><b>450</b>May</span><span><b>600</b>Jun</span><span><b>750</b>Mid</span><span><b>900</b>Jul</span><span><b>1050</b>Aug</span><span><b>1200</b>Sep</span><span><b>1350</b>Oct</span>")
rep(".roster { display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; }", ".roster { display: grid; grid-template-columns: repeat(9, 1fr); gap: 3px; }")
rep("Every 150 kg you harvest, someone turns up to ruin it. Beat all eight and you sell out.", "Every 150 kg you harvest, someone turns up to ruin it. Beat all nine and you sell out.")
rep('<div class="big">1,200 kg</div>', '<div class="big">1,350 kg</div>')
rep("<p>That's 1,000 of our 1.2 kg jars.", "<p>That's 1,125 of our 1.2 kg jars.")
rep("desc: 'Beat all eight bosses without buying anything in the shed.'", "desc: 'Beat all nine bosses without buying anything in the shed.'")
rep("inf.locked ? 'Locked: beat all eight bosses first.'", "inf.locked ? 'Locked: beat all nine bosses first.'")
rep("grandadSay(\"Beat all eight first. Then we'll talk.\");", "grandadSay(\"Beat all nine first. Then we'll talk.\");")
rep("line = 'All eight at once, in '", "line = 'All nine at once, in '")

# ================= queued changes =================
# "Sold out fast" is under 15 minutes
rep("desc: 'Finish a run in under 14 minutes.'", "desc: 'Finish a run in under 15 minutes.'")
rep("    if (elapsed < 14 * 60) achUnlock('fast');", "    if (elapsed < 15 * 60) achUnlock('fast');")
# the Shilajit Coach no longer asks "Is water wet?"
rep("""lines: ["Don't eat this if you're not married.", 'Is water wet?', 'Big man ting yeah',""", """lines: ["Don't eat this if you're not married.", 'Big man ting yeah',""")
rep("""      say(pick(["Don't eat this if you're not married.", 'Is water wet?']));""", """      say("Don't eat this if you're not married.");""")
# mouse lock: when the browser has refused it, a click tries again instead of it switching off for the session
rep("""    el.disabled = lockErrors >= 3;
    el.textContent = lockErrors >= 3 ? 'Mouse lock: not available here' : 'Mouse lock: ' + (lockPref ? 'on' : 'off');""",
    """    el.disabled = false;
    el.textContent = lockErrors >= 3 ? 'Mouse lock: blocked, click to retry' : 'Mouse lock: ' + (lockPref ? 'on' : 'off');""")
rep("  $('lockBtn').addEventListener('click', () => { lockPref = !lockPref;",
    "  $('lockBtn').addEventListener('click', () => { if (lockErrors >= 3) { lockErrors = 0; lockPref = true; } else lockPref = !lockPref;")

# the Crazy mode board: at least half the rounds were crazy, or the last quarter of them (3 or more) were.
# The round you're in counts, as crazy if crazy mode is on.
rep("  let runStats = { endlessFights: 0, crazyFights: 0 }; // for the leaderboard", "  let runStats = { endlessFights: 0, crazyFights: 0, crazyTail: 0 }; // for the leaderboard")
rep("brawl = null; runStats = { endlessFights: 0, crazyFights: 0 };", "brawl = null; runStats = { endlessFights: 0, crazyFights: 0, crazyTail: 0 };")
rep("    if (wasEndless) { runStats.endlessFights++; if (two) runStats.crazyFights++; }",
    "    if (wasEndless) { runStats.endlessFights++; if (two) runStats.crazyFights++; runStats.crazyTail = two ? runStats.crazyTail + 1 : 0; }")
rep("""    const stats = { played: Math.floor(elapsed), bosses: Math.min(bossIdx, BOSS_COUNT), endlessFights: runStats.endlessFights, crazyFights: runStats.crazyFights };
    if (endless) return { board: runStats.crazyFights * 2 > runStats.endlessFights ? 'crazy' : 'endless', value: endlessRound + 1, tie: Math.floor(score * 10) / 10, stats, ticket: lbRun.ticket };""",
    """    const N = endlessRound + 1, crazyRounds = runStats.crazyFights + (crazyOn ? 1 : 0), crazyTail = crazyOn ? runStats.crazyTail + 1 : 0;
    const stats = { played: Math.floor(elapsed), bosses: Math.min(bossIdx, BOSS_COUNT), endlessFights: runStats.endlessFights, crazyFights: runStats.crazyFights, crazyRounds, crazyTail };
    const isCrazy = crazyRounds >= Math.ceil(N / 2) || (crazyTail >= 3 && crazyTail >= Math.ceil(N / 4));
    if (endless) return { board: isCrazy ? 'crazy' : 'endless', value: N, tie: Math.floor(score * 10) / 10, stats, ticket: lbRun.ticket };""")
rep("speed: 'Fastest win against all eight bosses, from the first drop.'", "speed: 'Fastest win against all nine bosses, from the first drop.'")
rep("crazy: 'Highest round in endless runs where more than half of the fights were crazy mode.'",
    "crazy: 'Highest round in endless runs where at least half the rounds were crazy mode, or the last quarter of them (3 or more) were.'")
rep("      runStats() { return runStats; },", "      runStats() { return runStats; },\n      setCrazyOn(v) { crazyOn = v; },")

# the Shilajit Coach is now boss 5, so the price rise comes after bosses 1-5
rep("function priceMult() { return endless || bossIdx > 3 ? PRICE_HIKE : 1; } // bosses 1-4 beaten means the coach is done",
    "function priceMult() { return endless || bossIdx > 4 ? PRICE_HIKE : 1; } // bosses 1-5 beaten means the coach is done")
rep("(endless || bossIdx > 3 ? 'I spoke with the Shilajit Coach", "(endless || bossIdx > 4 ? 'I spoke with the Shilajit Coach")
# an achievement for beating him, like the others
rep("""    { id: 'fired', name: "You're fired", desc: 'Beat the App Founder.' },""", """    { id: 'fired', name: "You're fired", desc: 'Beat the App Founder.' },
    { id: 'nextq', name: 'Next question', desc: 'Beat the Lecturer.' },""")
rep("ceo: 'fired', ironfit: 'bigman',", "ceo: 'fired', lecturer: 'nextq', ironfit: 'bigman',")

rep("safe: !!p.safe, G })),", "safe: !!p.safe, half: p.half, G })),")
open(fn, 'w').write(s)
print('ok')
