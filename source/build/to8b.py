import sys
p = sys.argv[1]
s = open(p).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:100]); s = s.replace(old, new)

# ---- prices: start about the same, climb more slowly (about half the total), shown rounded to 10 kg
rep("""  // Each level costs more than the last, and stronger upgrades cost more. Even a player who spends every kilo
  // they have on upgrades is still buying a little way into endless mode.
  const COST = [18, 22, 27, 33, 40, 49, 59, 72, 88, 108]; // levels 1-10, scaled by each item's weight below
  const costs = w => COST.map(c => Math.round(c * w));""",
"""  // Each level costs a little more than the last, and stronger upgrades cost more. Prices are shown rounded to 10 kg.
  const geo = (a, r, n) => Array.from({ length: n }, (_, i) => a * r ** i);
  const COST = geo(18, 1.078, 10); // levels 1-10, scaled by each item's weight below
  const costs = w => COST.map(c => c * w);
  const r10 = n => Math.max(10, Math.round(n / 10) * 10);""")
rep("cost: [70, 100, 140, 190, 250]", "cost: geo(60, 1.115, 5)")
rep("cost: [60, 90, 130, 180, 240]", "cost: geo(50, 1.16, 5)")
rep("""    const base = maxed ? 0 : s.cost[lv];
    return { lv, maxed, locked, base, cost: base * priceMult() };""",
"""    const raw = maxed ? 0 : s.cost[lv];
    return { lv, maxed, locked, base: maxed ? 0 : r10(raw), cost: maxed ? 0 : r10(raw * priceMult()) };""")

# ---- crazy mode: unlocked by beating all seven bosses; still 500 kg; warn that it's hard
rep("unlock: () => endless && SHOP.every(x => x.id === 'crazy' || upg[x.id] >= x.max),", "unlock: () => endless,")
rep("desc: 'Endless mode with two bosses at once. Colonex fights with you, unless he is one of the two.',",
    "desc: 'Endless mode with two bosses at once. Colonex fights with you, unless he is one of the two. Warning: it is hard.',")
rep("inf.locked ? 'Locked: beat all seven bosses and max out everything else in the shed.' : 'Every endless boss fight becomes two bosses at once.'",
    "inf.locked ? 'Locked: beat all seven bosses first.' : 'Every endless boss fight becomes two bosses at once. Warning: it is hard.'")
rep("""      if (inf.locked && s.id === 'crazy') grandadSay("Beat them all and max out everything else first. Then we'll talk.");""",
"""      if (inf.locked && s.id === 'crazy') grandadSay("Beat all seven first. Then we'll talk.");
      else if (s.id === 'crazy' && !inf.lv) grandadSay("Two at once is hard, boy. Properly hard. Don't say I didn't warn you.");""")

# ---- endless: the first boss is never the Disprover you just beat
rep("""  function nextEndless() { // shuffled like a deck: all seven before any repeats, and never the same one twice running
    if (!endlessBag.length) { endlessBag = [...Array(BOSS_COUNT).keys()].sort(() => Math.random() - .5); if (endlessBag[endlessBag.length - 1] === lastEndless) endlessBag.unshift(endlessBag.pop()); }
    return (lastEndless = endlessBag.pop());
  }""",
"""  function nextEndless(avoid = []) { // shuffled like a deck: all seven before repeats, never the same one twice running, never one in avoid
    const no = k => k === lastEndless || avoid.includes(k);
    if (!endlessBag.some(k => !no(k))) endlessBag = [...Array(BOSS_COUNT).keys()].sort(() => Math.random() - .5).concat(endlessBag);
    let i = endlessBag.length - 1; while (no(endlessBag[i])) i--;
    return (lastEndless = endlessBag.splice(i, 1)[0]);
  }""")
rep("""        const a = nextEndless();
        if (crazyOn) { let c = nextEndless(); if (c === a) c = nextEndless(); startFight([a, c], true); }
        else startFight([a], true);""",
"""        const avoid = endlessRound === 0 ? [BOSSES.findIndex(b => b.key === 'disprover')] : []; // you've just beaten him
        const a = nextEndless(avoid);
        if (crazyOn) startFight([a, nextEndless(avoid.concat(a))], true);
        else startFight([a], true);""")

# ---- second chances: endless gets its own two
rep("""    endless = true; endlessRound = 0; endlessNext = GOAL + STAGE_KG;
    bossIdx = BOSS_COUNT;""", """    endless = true; endlessRound = 0; endlessNext = GOAL + STAGE_KG; revivesLeft = REVIVES; // two fresh second chances for endless
    bossIdx = BOSS_COUNT;""")
rep("""    $('reviveRow').hidden = !canRevive; $('reviveNote').hidden = !canRevive;
    $('reviveNote').textContent = (revivesLeft === 1 ? 'Last second chance this run.' : revivesLeft + ' second chances left this run.') + ' You come back at 50% purity.';""",
"""    $('reviveRow').hidden = !canRevive; $('reviveNote').hidden = false;
    $('reviveNote').textContent = canRevive ? (revivesLeft === 1 ? 'Last second chance this run.' : revivesLeft + ' second chances left this run.') + ' You come back at 50% purity.'
      : endless ? 'No second chances left: you used both of your endless ones.' : 'No second chances left: you used both of them this run.';""")
rep("""const REVIVES = 2; // second chances per run, usable anywhere""", """const REVIVES = 2; // second chances per run, usable anywhere, and two more for endless mode""")

# ---- the queen's buzz: quieter
rep("src.buffer = buzzBuf; src.playbackRate.value = rnd(0.95, 1.05); g.gain.value = 0.8;", "src.buffer = buzzBuf; src.playbackRate.value = rnd(0.95, 1.05); g.gain.value = 0.3;")

# ---- bees: honey they catch heals you like honey you catch
rep("""    tally.beeDrops++;
    splat(it.x, it.y, kind === 'drop' ? '#b05a14' : '#c89a5b', kind === 'drop' ? 4 : 10);""",
"""    tally.beeDrops++;
    heal(HEAL[kind] || 0);
    splat(it.x, it.y, kind === 'drop' ? '#b05a14' : '#c89a5b', kind === 'drop' ? 4 : 10);""")

# ---- honey magnet: also pushes fakes away
rep("""      if (!bad && magnetT > 0) {
        const mx2 = spoon.x - it.x, my2 = spoon.y - 10 - it.y, md = Math.hypot(mx2, my2);
        if (md < qR && md > 1) { const st = Math.min(md, 700 * G * dt); it.x += mx2 / md * st; it.y += my2 / md * st; }
      }""",
"""      if (magnetT > 0) {
        const mx2 = spoon.x - it.x, my2 = spoon.y - 10 - it.y, md = Math.hypot(mx2, my2);
        if (!bad) { if (md < qR && md > 1) { const st = Math.min(md, 700 * G * dt); it.x += mx2 / md * st; it.y += my2 / md * st; } }
        else if (md < qR * 1.15 && !it.carried) { // fakes get pushed sideways, away from the spoon, and held up
          const f = 1 - md / (qR * 1.15);
          it.base = clamp(it.base + (it.x >= spoon.x ? 1 : -1) * 560 * G * (0.35 + f) * dt, 14, W - 14);
          it.y -= it.vy * dt * sm * Math.min(1, 1.3 * f);
        }
      }""")
rep("desc: 'Pulls nearby honey into your spoon for a few seconds.',", "desc: 'Pulls nearby honey into your spoon and pushes fakes away, for a few seconds.',")

# ---- quarks: home for longer, and take two hits of honey to pop
rep("""          if (p.t < (k === 'quarks' ? 1.5 : p.life)) { // a quark stops homing after 1.5 s, so you can sidestep it""",
    """          if (p.t < (k === 'quarks' ? 2.5 : p.life)) { // a quark stops homing after 2.5 s, so you can sidestep it""")
rep("""      if (qi >= 0) { const q = proj[qi]; proj.splice(qi, 1); globs.splice(i, 1); splat(q.x, q.y, '#ff5a7a', 10); floatText(q.x, q.y - 20, 'POP', '#ffd36b'); sfx.hit(); continue; }""",
"""      if (qi >= 0) { // two hits of honey pop a quark
        const q = proj[qi]; globs.splice(i, 1); q.cracked = (q.cracked || 0) + 1; sfx.hit();
        if (q.cracked >= 2) { proj.splice(qi, 1); splat(q.x, q.y, '#ff5a7a', 10); floatText(q.x, q.y - 20, 'POP', '#ffd36b'); }
        else { splat(q.x, q.y, '#ff5a7a', 4); floatText(q.x, q.y - 20, 'CRACK', '#ff9aae'); }
        continue;
      }""")
rep("""            ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1; circle(0, 0, 14); ctx.stroke();
            const cx = Math.cos(p.a) * 14""", """            ctx.strokeStyle = p.cracked ? 'rgba(255,154,174,.9)' : 'rgba(255,255,255,.25)'; ctx.lineWidth = p.cracked ? 2 : 1; circle(0, 0, 14); ctx.stroke();
            const cx = Math.cos(p.a) * 14""")

# ---- knight: swipe the spoon across it on your row to capture it
rep("""      if (k === 'knight') {
        const c = p.c;""", """      if (k === 'knight') {
        const c = p.c;
        if (p.st !== 'jump' && p.psx !== undefined && Math.abs(p.y - p.floor) < c * 0.5) { // sitting on your row: swipe across it to take it
          const a = p.psx - p.x, b2 = spoon.x - p.x;
          if ((a < 0 && b2 >= 0) || (a > 0 && b2 <= 0)) {
            proj.splice(i, 1); splat(p.x, p.y, '#f4f1ea', 12); floatText(p.x, p.y - c * 0.7, 'Knight captured', '#ffd36b');
            seq([523, 784], 70, 'triangle', 0.1, 0.12);
            continue;
          }
        }
        p.psx = spoon.x;""")
rep("""        } else if (p.st === 'tele') { if (p.t > 0.5) { p.st = 'jump'; p.t = 0; } }
        else {""", """        } else if (p.st === 'tele') { if (p.t > 0.5) { p.st = 'jump'; p.t = 0; } }
        else { // 'jump'""")

# ---- extractor: waits for a screenful of honey before it fires (press it again to fire straight away)
rep("""  function extract(grab) {""", """  const EXTRACT_FULL = 8, EXTRACT_WAIT = 6; // honey on screen that counts as a screenful, and the longest it waits
  const extractable = () => items.filter(it => it.kind !== 'bad' && !it.suck && !it.held);
  function fireExtract() { const g = extractArm ? extractArm.grab : PW.extractor(upg.extractor).grab; extractArm = null; pcd.extractor = PW.extractor(upg.extractor).cd; extract(g); updatePowerUi(); }
  function extract(grab) {""")
rep("""    const st = PW[k](upg[k]);
    pcd[k] = st.cd;""", """    const st = PW[k](upg[k]);
    if (k === 'extractor') { // waits until there's enough honey on screen to be worth it
      if (extractArm) { if (!extractable().length) return false; fireExtract(); return true; } // pressed again: go now
      extractArm = { t: 0, grab: st.grab };
      if (extractable().length >= Math.min(st.grab, EXTRACT_FULL)) fireExtract();
      else { floatText(W / 2, H * 0.42, 'EXTRACTOR READY', '#ffd36b', true); floatText(W / 2, H * 0.42 + 34, 'Waiting for more honey', '#f6e3b4'); sfx.ready(); updatePowerUi(); }
      return true;
    }
    pcd[k] = st.cd;""")
rep("""    for (const k of PKEYS) if (upg[k] && pcd[k] <= 0 && !(k === 'queen' && (qd || !queenOk())) && (!best || readyAt[k] < readyAt[best])) best = k;""",
    """    for (const k of PKEYS) if (upg[k] && pcd[k] <= 0 && !(k === 'queen' && (qd || !queenOk())) && !(k === 'extractor' && extractArm) && (!best || readyAt[k] < readyAt[best])) best = k;""")
rep("""    smokeT = Math.max(0, smokeT - dt); magnetT = Math.max(0, magnetT - dt); extractT = Math.max(0, extractT - dt);
    for (const k of PKEYS)""", """    smokeT = Math.max(0, smokeT - dt); magnetT = Math.max(0, magnetT - dt); extractT = Math.max(0, extractT - dt);
    if (extractArm && upg.extractor) {
      extractArm.t += dt;
      const n = extractable().length;
      if (n >= Math.min(extractArm.grab, EXTRACT_FULL) || (extractArm.t > EXTRACT_WAIT && n > 0)) fireExtract();
    }
    for (const k of PKEYS)""")
rep("""(k === 'extractor' && extractT > 0)""", """(k === 'extractor' && (extractT > 0 || !!extractArm))""")
rep("""      const cls = 'pbtn' + (pcd[k] <= 0 && !lockQ ? ' ready' : '')""", """      const cls = 'pbtn' + (pcd[k] <= 0 && !lockQ && !(k === 'extractor' && extractArm) ? ' ready' : '')""")
rep("""    if (extractT > 0) {
      const a = Math.min(1, extractT * 3), x = spoon.x, y = spoon.y - spoonSize() * 1.3;""", """    if (extractT > 0 || extractArm) { // spinning while it sucks; idling while it waits for more honey
      const a = extractT > 0 ? Math.min(1, extractT * 3) : 0.55, x = spoon.x, y = spoon.y - spoonSize() * 1.3;""")
rep("""      ctx.rotate(t * 20); ctx.lineWidth = 2;""", """      ctx.rotate(t * (extractT > 0 ? 20 : 3)); ctx.lineWidth = 2;""")
rep("desc: 'Sucks honey on screen into your spoon.',", "desc: 'Sucks honey on screen into your spoon. If there is not much about, it waits for more first (press it again to use it straight away).',")
rep("""let upg, pcd, readyAt, bees = [], smokeT = 0, magnetT = 0, extractT = 0,""", """let upg, pcd, readyAt, bees = [], smokeT = 0, magnetT = 0, extractT = 0, extractArm = null, shedFromPause = false,""")
rep("""    bees = []; smokeT = 0; magnetT = 0; extractT = 0; allyQueue = null; hikeSaid = false;""", """    bees = []; smokeT = 0; magnetT = 0; extractT = 0; extractArm = null; allyQueue = null; hikeSaid = false;""")

# ---- pause: open Grandad's Shed from the pause menu; see your second chances
rep("""        <button class="btn" id="resumeBtn" type="button">Back to the hives</button>
        <div class="actions"><button class="btn ghost small" data-ach type="button">Achievements <span class="achcount"></span></button></div>""",
"""        <button class="btn" id="resumeBtn" type="button">Back to the hives</button>
        <div class="actions"><button class="btn ghost small" id="pauseShed" type="button">Grandad's Shed</button><button class="btn ghost small" data-ach type="button">Achievements <span class="achcount"></span></button></div>
        <p class="hint" id="pauseRevive"></p>""")
rep("""  function openShed() {
    state = 'shed'; phase = 'harvest'; spawnT = 0.5; ev = null; evT = rnd(12, 16); qd = null;
    proj = []; globs = []; sticky = [];""", """  function openShed(fromPause) { // between bosses, or from the pause menu (then the game carries on exactly where it was)
    shedFromPause = fromPause === true;
    state = 'shed';
    if (!shedFromPause) { phase = 'harvest'; spawnT = 0.5; ev = null; evT = rnd(12, 16); qd = null; proj = []; globs = []; sticky = []; extractArm = null; }
    $('shedDone').textContent = shedFromPause ? 'Back' : 'Back to the hives';""")
rep("""    if (state !== 'shed') return;
    $('shedScreen').hidden = true; state = 'play';""", """    if (state !== 'shed') return;
    if (shedFromPause) { shedFromPause = false; $('shedScreen').hidden = true; state = 'pause'; pauseInfo(); $('pauseScreen').hidden = false; $('resumeBtn').focus(); updateHud(); return; }
    $('shedScreen').hidden = true; state = 'play';""")
rep("""  function togglePause() {
    if (state === 'play') { state = 'pause'; $('pauseScreen').hidden = false; $('resumeBtn').focus(); }
    else if (state === 'pause') { state = 'play'; $('pauseScreen').hidden = true; last = performance.now(); }
  }""", """  function pauseInfo() { $('pauseRevive').textContent = revivesLeft ? revivesLeft + (revivesLeft === 1 ? ' second chance' : ' second chances') + ' left' + (endless ? ' in endless.' : ' this run.') : 'No second chances left.'; }
  function togglePause() {
    if (state === 'play') { state = 'pause'; pauseInfo(); $('pauseScreen').hidden = false; $('resumeBtn').focus(); }
    else if (state === 'pause') { state = 'play'; $('pauseScreen').hidden = true; $('toast').classList.remove('low'); last = performance.now(); }
  }""")
rep("""  $('shedDone').addEventListener('click', closeShed);""", """  $('shedDone').addEventListener('click', closeShed);
  $('pauseShed').addEventListener('click', () => { if (state === 'pause') openShed(true); });""")
rep("""    if (!$('achScreen').hidden) { if (e.key === 'Escape') { e.preventDefault(); closeAch(); } return; }""",
"""    if (!$('achScreen').hidden) { if (e.key === 'Escape') { e.preventDefault(); closeAch(); } return; }
    if (state === 'shed' && shedFromPause && e.key === 'Escape') { e.preventDefault(); if ($('confirm').hidden) closeShed(); else cancelBuy(); return; }""")

# ---- debug
rep("""      shed() { openShed(); },""", """      shed(fromPause) { openShed(fromPause); },
      pause() { togglePause(); },
      extractArm: () => extractArm && { t: +extractArm.t.toFixed(2), grab: extractArm.grab, n: extractable().length },
      goodOnScreen: () => extractable().length,
      revives: () => revivesLeft,
      setRevives(n) { revivesLeft = n; },
      knightNow(x) { const b = bosses[0]; boss = b; ATTACKS.knight(b); const k = proj[proj.length - 1]; k.x = x; k.y = k.floor; k.st = 'tele'; k.t = 0; k.tx = x; k.ty = k.floor; return { x: k.x, c: k.c }; },
      knights: () => proj.filter(q => q.k === 'knight').length,
      quark(x, y) { proj.push(P({ k: 'quarks', name: 'The first two quarks', color: '#ff5a7a', x, y, r: 16, dmg: 14, a: 0, life: 3.4 })); },
      quarks: () => proj.filter(q => q.k === 'quarks').map(q => ({ x: Math.round(q.x), y: Math.round(q.y), cracked: q.cracked || 0 })),
      glob(x, y) { globs.push({ x, y, vx: 0, vy: -760, dmg: 1, r: 7 * G, lv: 0 }); },
      fake(x, y) { spawnBad(1); const it = items[items.length - 1]; if (it && it.kind === 'bad') { it.x = it.base = x; it.y = y; it.amp = 0; } return !!it; },
      fakes: () => items.filter(i => i.kind === 'bad').map(i => ({ x: Math.round(i.x), y: Math.round(i.y) })),""")
open(p, 'w').write(s)
print('ok')
