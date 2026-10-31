import sys
fn = sys.argv[1]
s = open(fn).read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)

# ---------- Fight every boss at once ("Everyone at once") ----------
rep("    { id: 'crazier', name: 'Crazier', desc: 'Win 10 crazy mode fights.', stat: 'crazyWins', goal: 10 },",
    "    { id: 'crazier', name: 'Crazier', desc: 'Win 10 crazy mode fights.', stat: 'crazyWins', goal: 10 },\n"
    "    { id: 'brawl', name: 'Everyone at once', desc: 'Beat every boss at the same time.' },")
rep("  let best = { kg: 0, time: 0, endless: 0 };\n  try { const s = JSON.parse(localStorage.getItem('honey-gobbler-3') || '{}'); best.kg = +s.kg || 0; best.time = +s.time || 0; best.endless = +s.endless || 0; } catch (e) {}",
    "  let best = { kg: 0, time: 0, endless: 0, brawl: 0 };\n  try { const s = JSON.parse(localStorage.getItem('honey-gobbler-3') || '{}'); best.kg = +s.kg || 0; best.time = +s.time || 0; best.endless = +s.endless || 0; best.brawl = +s.brawl || 0; } catch (e) {}")
rep("  function bossK() { return Math.min(1.3 * (0.3 + 0.7 * WR), Math.max(0.6, H / 520)); }",
    "  function bossK() { const k = Math.min(1.3 * (0.3 + 0.7 * WR), Math.max(0.6, H / 520)); return brawl ? Math.min(k * 0.8, Math.max(0.36, W / brawl.S / 200)) : k; } // smaller when everyone is on screen\n"
    "  const brawlSlots = () => W >= 1000 ? 8 : W >= 760 ? 5 : W >= 520 ? 4 : 3; // how many fit side by side; the rest wait their turn\n"
    "  const laneX = (slot, f) => W * (slot + f) / brawl.S;")
rep("  let gore = [], beeDown = [];",
    "  let brawl = null; // fight every boss at once: just for fun, nothing lost either way\n"
    "  let runStats = { endlessFights: 0, crazyFights: 0 }; // for the leaderboard\n"
    "  let gore = [], beeDown = [];")
rep("    qd = null; savings = 0; fightSaved = 0; crazyOn = false; chat = null; fightHits = 0; knightHint = false;\n    updateHud();",
    "    qd = null; savings = 0; fightSaved = 0; crazyOn = false; chat = null; fightHits = 0; knightHint = false; brawl = null; runStats = { endlessFights: 0, crazyFights: 0 };\n    updateHud();")

# makeBoss: a brawl level, lanes, less health each
rep("""  function makeBoss(i, isEndless, slot, n) {
    const def = BOSSES[i], k = bossK();
    // endless: how hard this boss is depends on how many times you've met him this run (first time 0, then 4, 8, 12...);
    // in crazy mode they count as met once more
    const elv = isEndless ? ENDLESS_STEP * ((endlessSeen[i] = (endlessSeen[i] || 0) + 1) - 1 + (n > 1 ? 1 : 0)) : 0;
    const hp = isEndless ? Math.round((def.ehp || def.hp) * (0.8 + 0.25 * elv)) : def.hp;
    const x = n > 1 ? W * (slot ? 0.75 : 0.25) : W / 2;""",
    """  function makeBoss(i, isEndless, slot, n, bl) {
    const def = BOSSES[i], k = bossK(), inBrawl = bl !== undefined;
    // endless: how hard this boss is depends on how many times you've met him this run (first time 0, then 4, 8, 12...);
    // in crazy mode they count as met once more. Fighting everyone at once doesn't count as meeting them.
    const elv = inBrawl ? bl : isEndless ? ENDLESS_STEP * ((endlessSeen[i] = (endlessSeen[i] || 0) + 1) - 1 + (n > 1 ? 1 : 0)) : 0;
    const hp = isEndless ? Math.round((def.ehp || def.hp) * (0.8 + 0.25 * elv) * (inBrawl ? BRAWL_HP : 1)) : def.hp;
    const x = inBrawl ? laneX(slot, 0.5) : n > 1 ? W * (slot ? 0.75 : 0.25) : W / 2;""")
rep("""      speed: (isEndless ? Math.max(0.45, 0.9 - 0.06 * elv) : 1) * (n > 1 ? 1.25 : 1) * (def.pace || 1), elv,
    };""",
    """      speed: (isEndless ? Math.max(0.45, 0.9 - 0.06 * elv) : 1) * (inBrawl ? BRAWL_PACE : n > 1 ? 1.25 : 1) * (def.pace || 1), elv, brawl: inBrawl,
    };""")
rep("    bosses = ids.map((i, sl) => makeBoss(i, isEndless, sl, ids.length));\n    boss = bosses[0];\n    ally = null; fightSaved = 0; fightHits = 0;\n    chat = bosses.some(b => b.def.key === 'looks') ? { msgs: [], nextT: 2.4, viewers: 38000 + Math.floor(rnd(0, 3000)), flood: 0, recent: [], reactT: 0 } : null;",
    "    bosses = ids.map((i, sl) => makeBoss(i, isEndless, sl, ids.length, brawl ? brawl.lv : undefined));\n    boss = bosses[0];\n    ally = null; fightSaved = 0; fightHits = 0;\n    chat = bosses.some(b => b.def.key === 'looks') ? newChat() : null;")
rep("  function startBoss(i) { startFight([i]); }",
    """  function startBoss(i) { startFight([i]); }
  function newChat() { return { msgs: [], nextT: 2.4, viewers: 38000 + Math.floor(rnd(0, 3000)), flood: 0, recent: [], reactT: 0 }; }
  const BRAWL_HP = 0.5, BRAWL_PACE = 1.35;
  // Fight every boss at once. Bought with crazy mode. Everything about your run is put back afterwards, win or lose.
  function startBrawl() {
    if (state !== 'shed' || shedFromPause || !upg.crazy || brawl) return;
    const order = [...Array(BOSS_COUNT).keys()].sort(() => Math.random() - .5), S = Math.min(BOSS_COUNT, brawlSlots());
    brawl = {
      snap: { purity, combo, streak, comboT, addict, savings, revivesLeft, tally: JSON.parse(JSON.stringify(tally)) },
      t: 0, S, queue: order.slice(S), beaten: 0, active: [], rotT: 0, rotI: 0,
      lv: ENDLESS_STEP * (1 + Math.floor(runStats.crazyFights / 4)), // harder the further you've got in crazy mode
      atkN: S >= 5 ? 3 : 2, // how many attack at a time; the rest only talk
    };
    $('shedScreen').hidden = true; state = 'play'; last = performance.now(); $('toast').classList.remove('low');
    purity = 100; combo = 1; streak = 0; addict = 0; rush = 0; items = []; sticky = [];
    Object.assign(spoon, { hurt: 0, frozen: 0, slow: 0, venom: 0, sting: 0 });
    startFight(order.slice(0, S), true);
    updateHud(); lockMouse();
  }
  function brawlTurns(dt) { // a few attack at a time, taking turns from left to right
    brawl.active = brawl.active.filter(fighting);
    brawl.rotT -= dt;
    if (brawl.rotT <= 0) { brawl.rotT = 8; brawl.active = []; }
    const want = Math.min(4, brawl.atkN + (brawl.lv >= 16 ? 1 : 0));
    const free = bosses.filter(b => fighting(b) && !brawl.active.includes(b)).sort((a, c) => a.slot - c.slot);
    while (brawl.active.length < want && free.length) {
      const j = free.findIndex(b => b.slot >= brawl.rotI), b = free.splice(j >= 0 ? j : 0, 1)[0];
      brawl.rotI = b.slot + 1; brawl.active.push(b); b.atkT = Math.min(b.atkT, rnd(0.5, 1.5));
    }
  }
  const brawlWaiting = b => !!(brawl && b.brawl && fighting(b) && !brawl.active.includes(b));
  function brawlEnd(won) {
    const s = brawl.snap, time = brawl.t, beaten = brawl.beaten;
    brawl = null; boss = null; bosses = []; chat = null; qd = null; ally = null; proj = []; globs = []; sticky = [];
    purity = s.purity; combo = s.combo; streak = s.streak; comboT = s.comboT; addict = s.addict; rush = 0; savings = s.savings; revivesLeft = s.revivesLeft; tally = s.tally;
    Object.assign(spoon, { hurt: 0, frozen: 0, slow: 0, venom: 0, sting: 0 }); shieldT = 0; shieldHits = 0; hurtFlash = 0; shake = 0;
    let line;
    if (won) {
      const rec = !best.brawl || time < best.brawl;
      if (rec) { best.brawl = time; saveBest(); }
      achUnlock('brawl');
      line = 'All eight at once, in ' + fmtTime(time) + '.' + (rec ? " That's your best." : ' Your best is ' + fmtTime(best.brawl) + '.') + ' Nothing lost, boy.';
    } else line = 'You beat ' + beaten + ' of ' + BOSS_COUNT + ' in ' + fmtTime(time) + '. Nothing lost. Your run carries on.';
    openShed();
    grandadSay(line);
  }""")

# taking turns, lanes, talking
rep("      if (b.t > 2.9) { b.mode = 'fight'; b.t = 0; say(b.def.intro, { force: true }); b.sayT = b.say.t + 1.5 + b.slot * 2; }",
    "      if (b.t > 2.9) { b.mode = 'fight'; b.t = 0; b.sayT = say(b.def.intro, { force: !b.brawl }) ? b.say.t + 1.5 + b.slot * 2 : rnd(1, 5); }")
rep("    if (b.wanderT <= 0) { b.tx = b.n > 1 ? W * (b.slot ? rnd(0.62, 0.88) : rnd(0.12, 0.38)) : W * rnd(0.2, 0.8); b.wanderT = rnd(1.4, 2.8); }",
    "    if (b.wanderT <= 0) { b.tx = b.brawl ? laneX(b.slot, rnd(0.3, 0.7)) : b.n > 1 ? W * (b.slot ? rnd(0.62, 0.88) : rnd(0.12, 0.38)) : W * rnd(0.2, 0.8); b.wanderT = rnd(1.4, 2.8); }")
rep("""    b.atkT -= dt;
    if (b.atkT <= 0) {
      const list = b.p3""", """    if (brawlWaiting(b)) b.atkT = Math.max(b.atkT, 0.6); // waiting for his turn: talking only
    else b.atkT -= dt;
    if (b.atkT <= 0) {
      const list = b.p3""")
rep("""    if (!o.force && b.recent.includes(text)) return false; // a line can't come back until two other lines have been said""",
    """    if (!o.force && b.recent.includes(text)) return false; // a line can't come back until two other lines have been said
    if (!o.force && brawl && bosses.filter(x => x !== b && x.say && x.say.t > 0.5).length >= 2) return false; // everyone at once: two talk at a time""")
rep("""    if (bosses.every(b => b.done)) { finishFight(); return; }
    boss = bosses.find(fighting) || bosses.find(b => !b.done);""",
    """    if (brawl) {
      brawl.t += dt;
      for (let j = 0; j < bosses.length; j++) {
        if (!bosses[j].done || !brawl.queue.length) continue;
        const nb = bosses[j] = makeBoss(brawl.queue.shift(), true, bosses[j].slot, BOSS_COUNT, brawl.lv); // the next one drops into the gap
        nb.quiet = true; sfx.bossIn();
        if (nb.def.key === 'looks' && !chat) chat = newChat();
      }
      brawlTurns(dt);
    }
    if (bosses.every(b => b.done)) { finishFight(); return; }
    boss = bosses.find(fighting) || bosses.find(b => !b.done);""")
rep("    tally.bosses++;\n    const h = heal(25);",
    "    tally.bosses++; if (b.brawl && brawl) brawl.beaten++;\n    const h = heal(25);")
rep("""  function finishFight() {
    const wasEndless = bosses[0].endless, two = bosses.length > 1;""",
    """  function finishFight() {
    if (brawl) { brawlEnd(true); return; }
    const wasEndless = bosses[0].endless, two = bosses.length > 1;
    if (wasEndless) { runStats.endlessFights++; if (two) runStats.crazyFights++; }""")
rep("""  function gameOver() {
    state = 'over';""", """  function gameOver() {
    if (brawl) { brawlEnd(false); return; } // just for fun: nothing lost
    state = 'over';""")
rep("  function fightKg(kg, x, y) {\n", "  function fightKg(kg, x, y) {\n    if (brawl) return; // no honey from fighting everyone at once\n")
rep("  function allyActive() { return (endless || bossIdx >= 2) && anyFighting() && !bosses.some(b => b.def.key === 'colonex'); }",
    "  function allyActive() { return (endless || bossIdx >= 2) && anyFighting() && !brawl && !bosses.some(b => b.def.key === 'colonex'); } // when everyone's against you, so is he")
rep("    if (phase === 'boss') next = 'boss fight · shed +' + fmtAdd(fightSaved);",
    "    if (phase === 'boss') next = brawl ? 'everyone at once · ' + fmtTime(brawl.t) + ' · ' + (BOSS_COUNT - brawl.beaten) + ' left' : 'boss fight · shed +' + fmtAdd(fightSaved);")

# drawing
rep("    ctx.rotate(b.rot);\n    ctx.globalAlpha = b.alpha;\n    ctx.scale(k * b.scale, k * b.scale);",
    "    ctx.rotate(b.rot);\n    ctx.globalAlpha = b.alpha * (brawlWaiting(b) ? 0.62 : 1); // the ones waiting their turn are faded\n    ctx.scale(k * b.scale, k * b.scale);")
rep("""    const o = { maxW: two ? Math.min(300, W * 0.46) : narrow ? W * 0.82 : Math.min(360, W * 0.5), discord: b.def.key === 'colonex', minY: combBottom() + 34 };
    if (two) { o.lo""", """    const o = { maxW: b.brawl ? Math.min(250, W * 0.44) : two ? Math.min(300, W * 0.46) : narrow ? W * 0.82 : Math.min(360, W * 0.5), discord: b.def.key === 'colonex', minY: combBottom() + 34 };
    if (two && !b.brawl) { o.lo""")
rep("      if (b.slot) return; // one banner for both",
    "      if (b.slot || b.quiet) return; // one banner for both (and none for the ones that join later)")
rep("""      const label = two ? 'CRAZY MODE  ·  ROUND ' + (endlessRound + 1)""",
    """      const label = b.brawl ? 'EVERYONE AT ONCE  ·  JUST FOR FUN'
        : two ? 'CRAZY MODE  ·  ROUND ' + (endlessRound + 1)""")
rep("""      const name = two ? bosses.map(x => x.def.tag).join(' & ') : b.def.name;
      const sub = two ? """, """      const name = b.brawl ? 'All ' + BOSS_COUNT + ' bosses' : two ? bosses.map(x => x.def.tag).join(' & ') : b.def.name;
      const sub = b.brawl ? (brawl && brawl.queue.length ? 'The rest are waiting their turn. ' : '') + "Nothing is lost if you drop. Colonex is with them." : two ? """)
rep("""    const w = two ? Math.min(220, W * 0.42) : Math.min(300, W * 0.64), cx = two ? (b.slot ? W * 0.74 : W * 0.26) : W / 2, x = cx - w / 2, y = combBottom() + 10;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const name = (two ? b.def.tag : b.def.name) + (b.p3 ? '  ·  PHASE 3' : b.p2 ? '  ·  PHASE 2' : '');
    fitFont(name, two ? 13 : 15, 700, 'Gluten, cursive', w);""",
    """    const bw = b.brawl && brawl, w = bw ? W / brawl.S * 0.86 : two ? Math.min(220, W * 0.42) : Math.min(300, W * 0.64), cx = bw ? laneX(b.slot, 0.5) : two ? (b.slot ? W * 0.74 : W * 0.26) : W / 2, x = cx - w / 2, y = combBottom() + 10;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const name = (two ? b.def.tag : b.def.name) + (bw ? (b.p3 ? ' · P3' : b.p2 ? ' · P2' : '') : b.p3 ? '  ·  PHASE 3' : b.p2 ? '  ·  PHASE 2' : '');
    if (brawlWaiting(b)) ctx.globalAlpha = 0.6;
    fitFont(name, bw ? 12 : two ? 13 : 15, 700, 'Gluten, cursive', w);""")
rep("""    ctx.fillStyle = 'rgba(246,227,180,.4)'; ctx.fillRect(cx - 1, y + 14, 2, 14);
    if (b.pushup > 0)""", """    ctx.fillStyle = 'rgba(246,227,180,.4)'; ctx.fillRect(cx - 1, y + 14, 2, 14);
    if (bw && !brawlWaiting(b)) { ctx.lineWidth = 2; ctx.strokeStyle = '#ffd36b'; roundRect(x - 2, y + 14, w + 4, 14, 7); ctx.stroke(); } // his turn to attack
    ctx.globalAlpha = 1;
    if (b.pushup > 0)""")

# the button in the shed
rep("""<div class="actions shedacts"><button class="btn" id="shedDone" type="button">Back to the hives</button>""",
    """<div class="actions shedacts"><button class="btn" id="shedDone" type="button">Back to the hives</button><button class="btn ghost small" id="brawlBtn" type="button" hidden>Fight every boss at once</button>""")
rep("""    $('shedDone').textContent = shedFromPause ? 'Back' : 'Back to the hives';""",
    """    $('shedDone').textContent = shedFromPause ? 'Back' : 'Back to the hives';
    $('brawlBtn').hidden = !(upg.crazy && endless && !shedFromPause);
    $('brawlBtn').textContent = 'Fight every boss at once' + (best.brawl ? ' (best ' + fmtTime(best.brawl) + ')' : '');""")
rep("  $('shedDone').addEventListener('click', closeShed);",
    "  $('shedDone').addEventListener('click', closeShed);\n  $('brawlBtn').addEventListener('click', startBrawl);")

# test hooks
rep("      bossAt(x) {",
    "      brawl() { if (state !== 'play') start(); endless = true; bossIdx = BOSS_COUNT; score = endlessNext = GOAL + STAGE_KG; upg.crazy = 1; openShed(); startBrawl(); },\n"
    "      brawlInfo() { return brawl ? { t: brawl.t, beaten: brawl.beaten, S: brawl.S, queue: brawl.queue.length, active: brawl.active.map(b => b.def.key), on: bosses.filter(b => !b.done).map(b => b.def.key + ':' + b.mode + ':' + Math.round(b.hp)), k: bossK() } : null; },\n"
    "      runStats() { return runStats; },\n"
    "      bossAt(x) {")

open(fn, 'w').write(s)
print('ok')
