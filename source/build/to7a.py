import sys
p = sys.argv[1]
s = open(p).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:100]); s = s.replace(old, new)
def between(start, end, new):
    global s
    a = s.index(start); b = s.index(end, a); s = s[:a] + new + s[b:]

# ---------- spending never pushes the next boss back: harvested honey you spend is tracked separately ----------
rep("fightHits = 0, comboT = 0;", "fightHits = 0, comboT = 0, kgSpent = 0, endlessBag = [], lastEndless = -1;")
rep("    score = 0; purity = 100; combo = 1; streak = 0; comboT = 0;", "    score = 0; purity = 100; combo = 1; streak = 0; comboT = 0; kgSpent = 0; endlessBag = []; lastEndless = -1;")
rep("  // Purchases come out of your shed savings first, then out of your harvest (which pushes the next boss further away).\n  const wallet = () => savings + score;",
    "  // Purchases come out of your shed savings first, then out of the honey you've harvested. Bosses still come every 150 kg harvested.\n  const honeyLeft = () => Math.max(0, score - kgSpent);\n  const wallet = () => savings + honeyLeft();")
rep("    savings -= fromSav; score -= inf.cost - fromSav;", "    savings -= fromSav; kgSpent += inf.cost - fromSav;")
rep("    $('shedKg').textContent = '+ ' + fmtKg(score) + ' harvested';", "    $('shedKg').textContent = '+ ' + fmtKg(honeyLeft()) + ' of honey';")
rep("from savings, ' + fmtKg(fromKg) + ' from your harvest.' : 'It comes out of your harvest.';", "from savings, ' + fmtKg(fromKg) + ' from your honey.' : 'It comes out of your honey.';")
rep("Honey from boss fights goes into your savings and gets spent first. After that you spend your harvest, which pushes the next boss further away.</p>",
    "Honey from boss fights goes into your savings and gets spent first, then the honey you've harvested. Spending never pushes the next boss back.</p>")
rep("'Every kilo you spend, you have to catch again.'", "'Spend it how you like. The bosses come either way.'")
rep("score: +score.toFixed(1), savings: +savings.toFixed(1),", "score: +score.toFixed(1), wallet: +wallet().toFixed(1), savings: +savings.toFixed(1),")

# ---------- endless: shuffled order, and difficulty from rounds survived, ramping faster ----------
rep("""        const a = Math.floor(Math.random() * BOSS_COUNT);
        if (crazyOn) { let c = Math.floor(Math.random() * (BOSS_COUNT - 1)); if (c >= a) c++; startFight([a, c], true); }""",
    """        const a = nextEndless();
        if (crazyOn) { let c = nextEndless(); if (c === a) c = nextEndless(); startFight([a, c], true); }""")
rep("  function endlessLevel() { return endless ? Math.max(0, (score - GOAL) / STAGE_KG) : 0; }",
    """  function endlessLevel() { return endless ? endlessRound + clamp((score - endlessNext + STAGE_KG) / STAGE_KG, 0, 1) : 0; }
  function nextEndless() { // shuffled like a deck: all seven before any repeats, and never the same one twice running
    if (!endlessBag.length) { endlessBag = [...Array(BOSS_COUNT).keys()].sort(() => Math.random() - .5); if (endlessBag[endlessBag.length - 1] === lastEndless) endlessBag.unshift(endlessBag.pop()); }
    return (lastEndless = endlessBag.pop());
  }""")
rep("Math.min(6, 3 + 0.3 * endlessLevel())", "Math.min(8, 3 + 0.45 * endlessLevel())")
rep("const badChance = endless ? Math.min(0.6, 0.32 + 0.03 * lvl)", "const badChance = endless ? Math.min(0.62, 0.32 + 0.04 * lvl)")
rep("      if (spawnT <= 0) { spawnHarvest(); spawnT = 0.6 * rnd(0.7, 1.3) / G; }", "      if (spawnT <= 0) { spawnHarvest(); spawnT = 0.6 * rnd(0.7, 1.3) / G / (endless ? 1 + 0.05 * endlessRound : 1); }")
rep("speed: (isEndless ? Math.max(0.55, 0.9 - 0.05 * endlessRound) : 1)", "speed: (isEndless ? Math.max(0.45, 0.9 - 0.06 * endlessRound) : 1)")
rep("(endless ? 0.05 * endlessRound : 0));\n    for (let i = proj.length", "(endless ? Math.min(0.9, 0.08 * endlessRound) : 0));\n    for (let i = proj.length")

# ---------- combo: slower decay, and Sweet tooth raises the cap and slows it further ----------
rep("  const COMBO_GRACE = 2.5, COMBO_STEP = 1.5; // catch nothing for 2.5 s and the combo drops a step, then another every 1.5 s",
    "  const COMBO_GRACE = 4, COMBO_STEP = 3; // catch nothing for 4 s and the combo drops a step, then another every 3 s\n  const comboCap = () => 3 + 0.4 * (upg ? upg.sweet || 0 : 0), comboGrace = () => COMBO_GRACE + 0.6 * (upg ? upg.sweet || 0 : 0), comboStep = () => COMBO_STEP + 0.4 * (upg ? upg.sweet || 0 : 0);")
rep("    combo = 1 + 0.5 * Math.min(4, Math.floor(streak / 5));", "    combo = Math.min(comboCap(), 1 + 0.5 * Math.floor(streak / 5));")
rep("    if (combo > 1 && comboT >= COMBO_GRACE) { combo -= 0.5; streak = (combo - 1) * 10; comboT = COMBO_GRACE - COMBO_STEP; }",
    "    if (combo > 1 && comboT >= comboGrace()) { combo = Math.max(1, combo - 0.5); streak = (combo - 1) * 10; comboT = comboGrace() - comboStep(); }")
rep("    if (combo > 1) { combo -= 0.5; streak = (combo - 1) * 10; } else streak = 0;", "    if (combo > 1) { combo = Math.max(1, combo - 0.5); streak = (combo - 1) * 10; } else streak = 0;")
rep("Math.round(clamp(1 - comboT / COMBO_GRACE, 0, 1) * 50)", "Math.round(clamp(1 - comboT / comboGrace(), 0, 1) * 50)")

# ---------- Richer hives: more jars and boxes ----------
rep("    if (r < 0.02) { spawnBox(sp, x); return; }\n    r -= 0.02;\n    if (r < 0.28) { spawnJar(sp, x); return; }",
    "    const hv = upg.hives || 0;\n    if (r < 0.02 + 0.012 * hv) { spawnBox(sp, x); return; }\n    r -= 0.02 + 0.012 * hv;\n    if (r < 0.28 + 0.04 * hv) { spawnJar(sp, x); return; }")
rep("    else if (r < 0.135) spawnBox(sp, x);\n    else if (r < 0.37) spawnJar(sp, x);", "    else if (r < 0.135 + 0.01 * (upg.hives || 0)) spawnBox(sp, x);\n    else if (r < 0.37 + 0.04 * (upg.hives || 0)) spawnJar(sp, x);")

# ---------- shed items ----------
rep("upg = { thick: 0, bee: 0, colonex: 0, smoker: 0, magnet: 0, extractor: 0, queen: 0, crazy: 0 };", "upg = { thick: 0, bee: 0, colonex: 0, smoker: 0, magnet: 0, extractor: 0, queen: 0, sweet: 0, hives: 0, crazy: 0 };")
rep("""    { id: 'queen', name: 'Queen bee', cost: costs(1.3), desc: 'A huge queen bee. In boss fights she charges at the boss. Between bosses she sweeps across the screen, catching honey and smashing fakes in her path.',
      lvText: lv => { if (!lv) return 'Not owned'; const q = PW.queen(lv); return `${q.charges} charge${q.charges > 1 ? 's' : ''} of ${Math.round(q.dmg)} damage. Sweeps a path ${pct(q.band)} of the screen tall. Recharges in ${Math.round(q.cd)} s.`; } },""",
"""    { id: 'queen', name: 'Queen bee', cost: costs(1.3), desc: 'A huge queen bee who roars and charges at the boss. She only comes out in boss fights.',
      lvText: lv => { if (!lv) return 'Not owned'; const q = PW.queen(lv); return `${q.charges} charge${q.charges > 1 ? 's' : ''} of ${Math.round(q.dmg)} damage. Recharges in ${Math.round(q.cd)} s.`; } },
    { id: 'sweet', name: 'Sweet tooth', max: 5, cost: [70, 100, 140, 190, 250], desc: 'Raises the highest combo you can reach, and makes it drop more slowly when you stop catching.',
      lvText: lv => `Combo up to ×${f2(3 + 0.4 * lv)}. Holds ${f2(COMBO_GRACE + 0.6 * lv)} s before dropping.` },
    { id: 'hives', name: 'Richer hives', max: 5, cost: [60, 90, 130, 180, 240], desc: 'More of the honey that falls comes as jars and 10 kg boxes.',
      lvText: lv => `Jars ${Math.round((0.28 + 0.04 * lv) * 100)}% of honey, boxes ${f2(2 + 1.2 * lv)}%` },""")
rep("crazy: \"Two at once? You're crazier than the bees.\" };", "crazy: \"Two at once? You're crazier than the bees.\", sweet: 'Eat faster, boy.', hives: 'I moved the hives to the lime trees. Richer flow.' };")
rep(".shop { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }", ".shop { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }")
rep(".overlay.shed .card { min-height: 0; flex: 0 1 auto; width: min(560px, 100%);", ".overlay.shed .card { min-height: 0; flex: 0 1 auto; width: min(640px, 100%);")
# crazy mode shows with a lock until earned
rep("      el.hidden = inf.locked; // Pay Colonex appears once he has joined you, Crazy mode once everything else is maxed",
    "      el.hidden = inf.locked && s.id !== 'crazy'; // Pay Colonex appears once he has joined you; Crazy mode shows locked until earned")
rep("s.id === 'crazy' ? (inf.lv ? (crazyOn ? 'On' : 'Off') : 'Two bosses at once')", "s.id === 'crazy' ? (inf.lv ? (crazyOn ? 'On' : 'Off') : inf.locked ? 'Two bosses at once' : 'Unlocked')")
rep("      el.querySelector('.pr').innerHTML = inf.maxed ? (s.max === 1 ? 'Owned' : 'Max') :", "      el.querySelector('.pr').innerHTML = inf.locked ? LOCK_SVG + ' Locked' : inf.maxed ? (s.max === 1 ? 'Owned' : 'Max') :")
rep("    $('dNext').textContent = s.max === 1 ? (inf.lv ? 'Switch it on or off here whenever you like.' : 'Every endless boss fight becomes two bosses at once.')",
    "    $('dNext').textContent = s.max === 1 ? (inf.lv ? 'Switch it on or off here whenever you like.' : inf.locked ? 'Locked: beat all seven bosses and max out everything else in the shed.' : 'Every endless boss fight becomes two bosses at once.')")
rep("    else if (inf.maxed) { btn.textContent = 'Max level'; btn.disabled = true; }", "    else if (inf.locked) { btn.textContent = 'Locked'; btn.disabled = true; }\n    else if (inf.maxed) { btn.textContent = 'Max level'; btn.disabled = true; }")
rep("      if (!inf.locked && !inf.maxed && wallet() < inf.cost) grandadSay(GRANDAD_BROKE);",
    "      if (inf.locked && s.id === 'crazy') grandadSay(\"Beat them all and max out everything else first. Then we'll talk.\");\n      else if (!inf.locked && !inf.maxed && wallet() < inf.cost) grandadSay(GRANDAD_BROKE);")
rep("  const CHECK_SVG =", "  const LOCK_SVG = '<svg viewBox=\"0 0 16 16\" width=\"11\" height=\"11\" aria-hidden=\"true\" style=\"vertical-align:-1px\"><rect x=\"3\" y=\"7\" width=\"10\" height=\"8\" rx=\"1.5\" fill=\"currentColor\"/><path d=\"M5 7V5a3 3 0 0 1 6 0v2\" stroke=\"currentColor\" stroke-width=\"2\" fill=\"none\"/></svg>';\n  const CHECK_SVG =")

# ---------- queen bee: boss fights only ----------
rep("  function queenTarget() {", "  const queenOk = () => phase === 'boss' && bosses.some(b => b.mode === 'intro' || fighting(b));\n  function queenTarget() {")
between("  function launchQueen(st) {", "  const queenScale", r'''  function launchQueen(st) { // she only comes out for bosses
    floatText(W / 2, H * 0.42, 'QUEEN BEE', '#ffd36b', true);
    const fromL = spoon.x > W / 2;
    qd = { mode: 'boss', st: 'enter', t: 0, left: st.charges, dmg: st.dmg, x: fromL ? -90 : W + 90, y: H * 0.45, ang: fromL ? 0 : Math.PI, tgt: null };
  }
''')
between("    if (qd.mode === 'sweep') {", "    if (qd.st === 'exit') {", "")
rep("    if (k === 'queen' && qd) return false;", "    if (k === 'queen' && (qd || !queenOk())) { if (!qd) floatText(spoon.x, spoon.y - 74, 'The queen only fights bosses', '#ffd36b'); return false; }")
rep("    for (const k of PKEYS) if (upg[k] && pcd[k] <= 0 && (!best || readyAt[k] < readyAt[best])) best = k;", "    for (const k of PKEYS) if (upg[k] && pcd[k] <= 0 && !(k === 'queen' && (qd || !queenOk())) && (!best || readyAt[k] < readyAt[best])) best = k;")
rep("      const cls = 'pbtn' + (pcd[k] <= 0 ? ' ready' : '') + (active ? ' active' : '');", "      const lockQ = k === 'queen' && !queenOk();\n      const cls = 'pbtn' + (pcd[k] <= 0 && !lockQ ? ' ready' : '') + (active ? ' active' : '') + (lockQ ? ' locked' : '');")
rep("<kbd>4</kbd></button>", "<svg class=\"lk\" viewBox=\"0 0 16 16\" aria-hidden=\"true\"><rect x=\"3\" y=\"7\" width=\"10\" height=\"8\" rx=\"1.5\" fill=\"#f6e3b4\"/><path d=\"M5 7V5a3 3 0 0 1 6 0v2\" stroke=\"#f6e3b4\" stroke-width=\"2\" fill=\"none\"/></svg><kbd>4</kbd></button>")
rep(".pbtn.active i { opacity: 1; background: #6b4512; }", ".pbtn.active i { opacity: 1; background: #6b4512; }\n.pbtn .lk { display: none; position: absolute; left: 50%; top: 50%; width: 22px; height: 22px; transform: translate(-50%, -50%); }\n.pbtn.locked .lk { display: block; }\n.pbtn.locked i { opacity: .2; }")

# ---------- worker bees: as likely to carry a fake away as to grab honey; their catches fill Addictive ----------
rep("""      if (b.tgt && !items.includes(b.tgt)) b.tgt = null;
      if (!b.tgt && b.rest <= 0) {""", """      if (b.tgt && !items.includes(b.tgt)) b.tgt = null;
      if (b.carry && !items.includes(b.carry)) b.carry = null;
      if (b.carry) { // flying a fake off the nearest side of the screen
        b.x += Math.sign(b.carry.exitX - b.x) * sp * 0.8 * dt; b.y += (Math.max(combBottom() + 40, b.y - 30) - b.y) * Math.min(1, dt * 2);
        b.dir = b.carry.exitX < b.x ? -1 : 1;
        if (b.x < -30 || b.x > W + 30) { const i = items.indexOf(b.carry); if (i >= 0) items.splice(i, 1); b.carry = null; b.rest = bs.rest * 1.5; }
        return;
      }
      if (!b.tgt && b.rest <= 0 && Math.random() < 0.5) {
        let best = null, bd = 1e9;
        for (const it of items) { if (it.kind !== 'bad' || it.bee || it.held || it.carried || it.y < combBottom() || it.y > spoon.y - 40) continue; const d = Math.hypot(it.x - b.x, it.y - b.y); if (d < bd) { bd = d; best = it; } }
        if (best) { b.tgt = best; best.bee = b; }
      }
      if (!b.tgt && b.rest <= 0) {""")
rep("      if (b.tgt && Math.hypot(b.tgt.x - b.x, b.tgt.y - b.y) < 18 * G + 8) beeCatch(b, b.tgt);",
    "      if (b.tgt && Math.hypot(b.tgt.x - b.x, b.tgt.y - b.y) < 18 * G + 8) {\n        if (b.tgt.kind === 'bad') { const it = b.tgt; b.carry = it; b.tgt = null; it.held = b; it.exitX = it.x < W / 2 ? -60 : W + 60; }\n        else beeCatch(b, b.tgt);\n      }")
rep("    if (kind === 'shilajit') { startRush(); tally.shilajit++; achStat('shilajit', tally.shilajit); }\n    if (phase === 'harvest') {\n      const mult = combo",
    "    if (kind === 'shilajit') { startRush(); tally.shilajit++; achStat('shilajit', tally.shilajit); }\n    else fillAddict(FILL[kind] || 0);\n    if (phase === 'harvest') {\n      const mult = combo")
rep("      const bad = it.kind === 'bad';\n      it.y += it.vy * dt * (bad ? sm : 1);", "      if (it.held) { it.x = it.held.x; it.y = it.held.y + 14 * G; continue; } // a worker bee is carrying it away\n      const bad = it.kind === 'bad';\n      it.y += it.vy * dt * (bad ? sm : 1);")
rep("for (const it of items) if (it.kind === 'bad' && !it.carried && it.x >= ev.x0 && it.x <= ev.x1)", "for (const it of items) if (it.kind === 'bad' && !it.carried && !it.held && it.x >= ev.x0 && it.x <= ev.x1)")
rep("    if (!it.carried) badMark(it.x, it.y, r * G, t, it.isNew);", "    if (!it.carried && !it.held) badMark(it.x, it.y, r * G, t, it.isNew);")

# ---------- belt: about half the floor ----------
rep("const len = W * rnd(0.7, 0.82), dir", "const len = W * rnd(0.45, 0.55), dir")

# ---------- quark: homes for 1.5 s then flies straight; flicked honey pops it ----------
rep("""          if (p.t < p.life) {
            const dx = spoon.x - p.x, dy = spoon.y - p.y, d = Math.hypot(dx, dy) || 1;""", """          if (p.t < (k === 'quarks' ? 1.5 : p.life)) { // a quark stops homing after 1.5 s, so you can sidestep it
            const dx = spoon.x - p.x, dy = spoon.y - p.y, d = Math.hypot(dx, dy) || 1;""")
rep("          } else p.g = 450;", "          } else if (p.t >= p.life) p.g = 450;")
rep("""      if (b) g.vx = clamp((b.x - g.x) * 5, -700, 700); // strong aim assist, at whichever boss is nearest
      g.x += g.vx * dt; g.y += g.vy * dt;""", """      if (b) g.vx = clamp((b.x - g.x) * 5, -700, 700); // strong aim assist, at whichever boss is nearest
      g.x += g.vx * dt; g.y += g.vy * dt;
      const qi = proj.findIndex(q => q.k === 'quarks' && !(q.delay > 0) && !q.dead && Math.hypot(q.x - g.x, q.y - g.y) < 20 * G + g.r);
      if (qi >= 0) { const q = proj[qi]; proj.splice(qi, 1); globs.splice(i, 1); splat(q.x, q.y, '#ff5a7a', 10); floatText(q.x, q.y - 20, 'POP', '#ffd36b'); sfx.hit(); continue; }""")

# ---------- App Founder: a chess knight that hops towards you in L-shapes ----------
rep("      attacks: ['notify', 'sheets', 'bars', 'chess', 'deenbuddy', 'fired', 'errors'],", "      attacks: ['notify', 'sheets', 'bars', 'chess', 'knight', 'deenbuddy', 'fired', 'errors', 'knight'],")
rep("    checkmate(b) {", r'''    knight(b) { // hops towards you in L-shapes; each landing square lights up first
      say(pick(['Check.', 'Chess after this?']));
      const c = clamp(70 * G, 46, 76), floor = spoon.y, rows = Math.max(3, Math.floor((floor - combBottom() - 40) / c));
      proj.push(P({ k: 'knight', harmless: true, dmg: 14, name: 'Knight', color: '#f4f1ea', x: clamp(b.x, c, W - c), y: floor - rows * c, c, floor, hops: 0, maxHops: rows + 4, st: 'pick' }));
      return 3.6;
    },
    checkmate(b) {''')
rep("      if (k === 'hyper') {", r'''      if (k === 'knight') {
        const c = p.c;
        if (p.st === 'pick') { // the legal knight move that lands closest to you, heading for the floor
          let best = null, bs = 1e9;
          for (const [mx, my] of [[1, 2], [-1, 2], [2, 1], [-2, 1], [1, -2], [-1, -2], [2, -1], [-2, -1]]) {
            const nx = p.x + mx * c, ny = p.y + my * c;
            if (nx < c * 0.5 || nx > W - c * 0.5 || ny > p.floor + 1 || ny < combBottom() + 20) continue;
            const sc = Math.abs(nx - spoon.x) + Math.abs(ny - p.floor) * 1.3 + rnd(0, c * 0.3);
            if (sc < bs) { bs = sc; best = [nx, ny]; }
          }
          if (!best || p.hops >= p.maxHops) { proj.splice(i, 1); splat(p.x, p.y, '#f4f1ea', 8); continue; }
          p.fx = p.x; p.fy = p.y; p.tx = best[0]; p.ty = best[1]; p.st = 'tele'; p.t = 0;
        } else if (p.st === 'tele') { if (p.t > 0.5) { p.st = 'jump'; p.t = 0; } }
        else {
          const u = Math.min(1, p.t / 0.28);
          p.x = p.fx + (p.tx - p.fx) * u; p.y = p.fy + (p.ty - p.fy) * u - Math.sin(u * Math.PI) * c * 0.6;
          if (u >= 1) {
            p.hops++; p.st = 'pick'; p.t = 0; sfx.hit();
            if (Math.abs(p.ty - p.floor) < c * 0.5 && Math.abs(spoon.x - p.x) < c * 0.5 + S * 0.25) { hurtSpoon(p.dmg, p.color, p.name, { boss: p.owner || boss }); if (state !== 'play') return; }
          }
        }
        continue;
      }
      if (k === 'hyper') {''')
rep("  const SPECIAL = { ring: 1,", r'''  function drawKnight(p, t) {
    const c = p.c, gx = p.x - Math.floor(2.5) * c, gy = p.y - 2 * c;
    ctx.fillStyle = 'rgba(244,241,234,.05)'; // a faint chessboard around it
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) if ((i + j) % 2 === 0) ctx.fillRect(gx + (i - 0.5) * c, gy + (j - 0.5) * c, c, c);
    if (p.st === 'tele') {
      const pulse = .5 + .5 * Math.sin(t * 18);
      ctx.fillStyle = `rgba(226,32,48,${.18 + pulse * .2})`; ctx.fillRect(p.tx - c / 2, p.ty - c / 2, c, c);
      ctx.strokeStyle = `rgba(255,120,100,${.6 + pulse * .3})`; ctx.lineWidth = 2; ctx.strokeRect(p.tx - c / 2, p.ty - c / 2, c, c);
    }
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(c / 34, c / 34); if (spoon.x < p.x) ctx.scale(-1, 1);
    ctx.fillStyle = '#f4f1ea'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 1.8;
    roundRect(-12, 10, 24, 7, 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-9, 10); ctx.lineTo(-7, 0); ctx.quadraticCurveTo(-12, -6, -6, -14); ctx.quadraticCurveTo(-2, -20, 4, -19); ctx.lineTo(7, -23); ctx.lineTo(8, -16);
    ctx.quadraticCurveTo(13, -10, 12, -4); ctx.lineTo(4, -6); ctx.quadraticCurveTo(2, 2, 9, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-5, -13); ctx.quadraticCurveTo(-10, -5, -7, 2); ctx.stroke();
    ctx.restore();
  }
  const SPECIAL = { knight: 1, ring: 1,''')
rep("      case 'hyper': drawHyper(p, t); return;\n", "      case 'hyper': drawHyper(p, t); return;\n      case 'knight': drawKnight(p, t); return;\n")

open(p, 'w').write(s)
print('to7a ok')
