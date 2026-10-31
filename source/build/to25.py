import sys
fn = sys.argv[1]
s = open(fn).read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)

PHONE = "W < 560"

# ---------- Colonex hits bosses a bit harder ----------
rep("const allyStats = lv => { const m = 1 - 0.035 * lv; return { dmg: 3 + 0.2 * lv,", "const allyStats = lv => { const m = 1 - 0.035 * lv; return { dmg: 3.6 + 0.25 * lv,")

# ---------- Grandad's comb is 5 kg ----------
rep("  const KG = { jar: 1.2, box: 10, comb: 0.5, shilajit: 1.2, lab: 0 };", "  const KG = { jar: 1.2, box: 10, comb: 5, shilajit: 1.2, lab: 0 };")

# ---------- purity: the comb heals less in boss fights (less still on a computer), bees don't heal in fights ----------
rep("    const h = heal(HEAL[kind] || 0);\n    if (kind === 'comb') floatText(",
    "    const h = heal(kind === 'comb' && phase === 'boss' ? COMB_FIGHT() : HEAL[kind] || 0);\n    if (kind === 'comb') floatText(")
rep("  const HEAL = { drop: 0.5, jar: 1, box: 5, comb: 18, shilajit: 3, lab: 0 }; // purity restored by real honey",
    "  const HEAL = { drop: 0.5, jar: 1, box: 5, comb: 18, shilajit: 3, lab: 0 }; // purity restored by real honey\n"
    "  const COMB_FIGHT = () => (W < 560 ? 12 : 8); // in a boss fight the comb heals less, so the bosses can actually wear you down (a bit more on phones)")
rep("    heal(HEAL[kind] || 0);\n    splat(it.x, it.y, kind === 'drop' ? '#b05a14' : '#c89a5b', kind === 'drop' ? 4 : 10);",
    "    if (phase !== 'boss') heal(HEAL[kind] || 0); // in boss fights they flick it at the boss instead\n    splat(it.x, it.y, kind === 'drop' ? '#b05a14' : '#c89a5b', kind === 'drop' ? 4 : 10);")
rep("    if (r < 0.06 + c) { if (purity < 100) items.push({ kind: 'comb'", "    if (r < 0.045 + c) { if (purity < 100) items.push({ kind: 'comb'")
rep("    else if (r < 0.09 + c) items.push({ kind: 'lab', x, y, vy: 120 * sp, r: 14, rot: 0 });\n    else if (r < 0.12 + c) items.push({ kind: 'shilajit'",
    "    else if (r < 0.075 + c) items.push({ kind: 'lab', x, y, vy: 120 * sp, r: 14, rot: 0 });\n    else if (r < 0.105 + c) items.push({ kind: 'shilajit'")
# wide screens: a bit more of every fixed pattern and aimed spread, the way honey already scales with width
rep("  const cntA = n => Math.max(1, Math.round(n * G * endlessMore())); // aimed at you\n  const moreE = n => Math.max(1, Math.round(n * endlessMore())); // fixed patterns that just get bigger in endless",
    "  const wideMore = () => 1 + 0.25 * clamp((W - 760) / 340, 0, 1); // up to a quarter more on a computer screen, where there's more room to dodge\n"
    "  const cntA = n => Math.max(1, Math.round(n * G * endlessMore() * wideMore())); // aimed at you\n"
    "  const moreE = n => Math.max(1, Math.round(n * endlessMore() * wideMore())); // fixed patterns that just get bigger in endless")

# ---------- phones ----------
# the Factorio belt: shorter and a weaker pull on a narrow screen
rep("      const len = W * rnd(0.45, 0.55), dir = Math.random() < .5 ? 1 : -1, f = rnd(0.25, 0.5);",
    "      const len = W * (W < 560 ? rnd(0.34, 0.42) : rnd(0.45, 0.55)), dir = Math.random() < .5 ? 1 : -1, f = rnd(0.25, 0.5); // shorter on a phone")
rep("      const push = belt.dir * BELT_PUSH * G * G * (smokeT > 0 ? smokeSlow : 1) * waxGrip() * dt;",
    "      const push = belt.dir * BELT_PUSH * G * G * (W < 560 ? 0.7 : 1) * (smokeT > 0 ? smokeSlow : 1) * waxGrip() * dt;")
# the honey magnet: reaches further and pulls harder on a phone
rep("  const magR = () => W * magnetReach * magSize() *", "  const magR = () => Math.max(W, 560) * magnetReach * magSize() *")
rep("          const st = Math.min(md, (1500 * G + 2.5 * it.vy * HS) * dt);", "          const st = Math.min(md, (1500 * Math.max(G, 0.95) + 2.5 * it.vy * HS) * dt);")
rep("          it.base = clamp(it.base + (it.x >= spoon.x ? 1 : -1) * 1000 * G * (0.35 + f) * dt, 14, W - 14);",
    "          it.base = clamp(it.base + (it.x >= spoon.x ? 1 : -1) * 1000 * Math.max(G, 0.95) * (0.35 + f) * dt, 14, W - 14);")
rep("          const f = 1 - dd / R, push = (ddx >= 0 ? 1 : -1) * 1000 * G * (0.35 + f) * dt;",
    "          const f = 1 - dd / R, push = (ddx >= 0 ? 1 : -1) * 1000 * Math.max(G, 0.95) * (0.35 + f) * dt;")
# the Honey Apologist attacks more often on a phone
rep("hp: 370, pace: 0.8, dmgMul: 1.25,", "hp: 370, pace: 0.8, phonePace: 0.8, dmgMul: 1.25,")
rep("* (inBrawl ? BRAWL_PACE : n > 1 ? 1.25 : 1) * (def.pace || 1), elv, alv, brawl: inBrawl,",
    "* (inBrawl ? BRAWL_PACE : n > 1 ? 1.25 : 1) * (def.pace || 1) * (W < 560 && def.phonePace ? def.phonePace : 1), elv, alv, brawl: inBrawl,")
# the Sus Beekeeper's smoke: fewer, smaller, shorter clouds on a phone (two bosses on a narrow screen left no air)
rep("      const n = Math.min(9, Math.round(((light ? 2 : 3) + Math.min(3, Math.floor(er / 2))) * WX));",
    "      const n = Math.min(W < 560 ? 3 : 9, Math.round(((light ? 2 : 3) + Math.min(3, Math.floor(er / 2))) * WX));")
rep("        const max = 91 * k * (light ? 0.85 : 1) * (1 + Math.min(0.3, 0.03 * er)), lo =",
    "        const max = 91 * k * (light ? 0.85 : 1) * (1 + Math.min(0.3, 0.03 * er)) * (W < 560 ? 0.8 : 1), lo =")
rep("          life: 7 + Math.min(3, 0.3 * er), max,", "          life: (7 + Math.min(3, 0.3 * er)) * (W < 560 ? 0.75 : 1), max,")
# the spoon sits lower on phones, and the hypergamy chart aims at the spoon's own line, so there's room to get between the arrows
rep("THUMB = touchUI && H > 420 ? clamp(H * 0.1, 40, 70) : 0;", "THUMB = touchUI && H > 420 ? clamp(H * 0.05, 20, 36) : 0;")
rep("""  function fireHyper(p) {
    const by = H - 26, m = p.targets.length;""", """  function fireHyper(p) {
    const by = hyperY(), m = p.targets.length;""")
rep("      proj.push(P({ k: 'hyperArrow', name: 'Hypergamy chart', color: '#ff6fae', x, y: y0, vx: dx / T, vy: dy / T, rot: Math.atan2(dy, dx), r: 9, dmg: 10, ty: by, owner: p.owner }));",
    "      proj.push(P({ k: 'hyperArrow', name: 'Hypergamy chart', color: '#ff6fae', x, y: y0, vx: dx / T, vy: dy / T, rot: Math.atan2(dy, dx), r: 9, dmg: 12, ty: by, owner: p.owner }));")
rep("  function fireHyper(p) {", "  const hyperY = () => Math.min(H - 26, spoon.y + 6); // the blue men stand on your spoon's line\n  function fireHyper(p) {")
rep("    const pulse = .5 + .5 * Math.sin(t * 14), by = H - 26, sc = Math.max(0.75, G), m = p.targets.length;",
    "    const pulse = .5 + .5 * Math.sin(t * 14), by = hyperY(), sc = Math.max(0.75, G), m = p.targets.length;")
rep("targets: xs.map((x, j) => ({ x, x0: x, ph: rnd(0, 6), track: j === 0 })), tele: 1.3,", "targets: xs.map((x, j) => ({ x, x0: x, ph: rnd(0, 6), track: j === 0 })), tele: 1.2,")
rep("  .pbtn { width: 46px; height: 46px; }", "  .pbtn { width: 46px; height: 46px; }\n  .powers { gap: 8px; }")

# ---------- endless starts in the shed ----------
rep("""    achStat('round', 1);
    seasonBanner();
    last = performance.now(); lockMouse();
  }""", """    achStat('round', 1);
    openShed(); // shop first, then the harvest
    grandadSay("They'll keep coming now. Spend it while you can.");
  }""")

# ---------- lab test: a sixth power ----------
rep("    shield: lv => ({ cd: 40 - (lv - 1) * 15 / 9,", "    lab: lv => ({ cd: 60 - (lv - 1) * 30 / 9, dmg: 5 + (lv - 1) * 15 / 9 }),\n    shield: lv => ({ cd: 40 - (lv - 1) * 15 / 9,")
rep("  const PKEY = { smoker: '1', magnet: '2', extractor: '3', queen: '4', shield: '5' };\n  const PKEYS = ['smoker', 'magnet', 'extractor', 'queen', 'shield'];",
    "  const PKEY = { smoker: '1', magnet: '2', extractor: '3', queen: '4', shield: '5', lab: '6' };\n  const PKEYS = ['smoker', 'magnet', 'extractor', 'queen', 'shield', 'lab'];")
rep("    { id: 'shield', name: 'Honeycomb shield',",
    "    { id: 'lab', name: 'Lab test kit', cost: costs(1.2), desc: 'Run a lab test whenever you want: every fake and every boss attack on screen is gone, and the bosses take a hit for selling sus honey.',\n"
    "      lvText: lv => { if (!lv) return 'Not owned'; const q = PW.lab(lv); return `Clears the screen and hits bosses for ${Math.round(q.dmg)}. Recharges in ${Math.round(q.cd)} s.`; } },\n"
    "    { id: 'shield', name: 'Honeycomb shield',")
rep("queen: 0, shield: 0, wax: 0, sweet: 0, hives: 0, crazy: 0 }; pcd = { smoker: 0, magnet: 0, extractor: 0, queen: 0, shield: 0 }; readyAt = { smoker: 0, magnet: 0, extractor: 0, queen: 0, shield: 0 };",
    "queen: 0, shield: 0, lab: 0, wax: 0, sweet: 0, hives: 0, crazy: 0 }; pcd = { smoker: 0, magnet: 0, extractor: 0, queen: 0, shield: 0, lab: 0 }; readyAt = { smoker: 0, magnet: 0, extractor: 0, queen: 0, shield: 0, lab: 0 };")
rep("      const pk = { 1: 'smoker', 2: 'magnet', 3: 'extractor', 4: 'queen', 5: 'shield' }[e.key];",
    "      const pk = { 1: 'smoker', 2: 'magnet', 3: 'extractor', 4: 'queen', 5: 'shield', 6: 'lab' }[e.key];")
rep("""<kbd>5</kbd></button>
    </div>""", """<kbd>5</kbd></button>
      <button class="pbtn" id="pw-lab" type="button" hidden aria-label="Lab test"><i><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M12 4h8M13 4v9L6.5 25a3 3 0 0 0 2.6 4.5h13.8a3 3 0 0 0 2.6-4.5L19 13V4" fill="none" stroke="#e9f9ff" stroke-width="2" stroke-linejoin="round"/><path d="M9.2 21h13.6l2 3.8a1.7 1.7 0 0 1-1.5 2.5H8.7a1.7 1.7 0 0 1-1.5-2.5z" fill="#7cf3ff"/><rect x="11.5" y="2.5" width="9" height="3" rx="1" fill="#c8102e"/></svg></i><kbd>6</kbd></button>
    </div>""")
rep("    else if (k === 'shield') { shieldT = st.dur;", "    else if (k === 'lab') labTest(Math.round(st.dmg));\n    else if (k === 'shield') { shieldT = st.dur;")
rep("""  function labTest() {
    tally.labs++;
    items.forEach(i => { if (i.kind === 'bad') splat(i.x, i.y, i.f.color, 8); });
    items = items.filter(i => i.kind !== 'bad');
    proj.forEach(p => { if (!(p.delay > 0)) splat(p.x || W / 2, p.y || H / 2, '#9be7ff', 5); });
    proj = [];""", """  function labTest(dmg = 5) {
    tally.labs++;
    items.forEach(i => { if (i.kind === 'bad') splat(i.x, i.y, i.f.color, 8); });
    items = items.filter(i => i.kind !== 'bad');
    const body = p => p.k === 'nest' || p.k === 'scout' || p.k === 'mini'; // hornets aren't fakes: they stay
    proj.forEach(p => { if (!body(p) && !(p.delay > 0)) splat(p.x || W / 2, p.y || H / 2, '#9be7ff', 5); });
    proj = proj.filter(body);""")
rep("    bosses.filter(fighting).forEach(b => damageBoss(5, b));\n    achAdd('labs', 1);", "    bosses.filter(fighting).forEach(b => damageBoss(dmg, b));\n    achAdd('labs', 1);")
rep("  const GRANDAD_BUY = { shield:", "  const GRANDAD_BUY = { lab: 'Send it to the lab. Trust, but test.', shield:")

# ---------- the Honey Apologist swings a ball-peen hammer, not an axe ----------
rep("""  function drawAxe(r) { // a thrown hatchet, spinning around its middle
    const sc = r / 42;
    ctx.save(); ctx.scale(sc, sc); ctx.translate(-19, -2); axeShape(70); ctx.restore();
  }""", """  // A ball-peen hammer in the same frame as the axe: wooden handle down from the head, the flat striking face on the
  // right with its middle at (50, -40), the round peen on the left.
  function hammerShape(haft) {
    ctx.beginPath(); ctx.moveTo(-4.5, -44); ctx.lineTo(-4, haft - 10); ctx.quadraticCurveTo(-6.5, haft - 4, -6.5, haft); ctx.lineTo(6.5, haft); ctx.quadraticCurveTo(6.5, haft - 4, 4, haft - 10); ctx.lineTo(4.5, -44); ctx.closePath();
    const wg = ctx.createLinearGradient(-5, 0, 5, 0); wg.addColorStop(0, '#6e4320'); wg.addColorStop(.5, '#b07a42'); wg.addColorStop(1, '#6e4320');
    ctx.fillStyle = wg; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = '#3e250f'; ctx.stroke();
    const sg = ctx.createLinearGradient(0, -54, 0, -26); sg.addColorStop(0, '#eef1f4'); sg.addColorStop(.5, '#9aa1aa'); sg.addColorStop(1, '#4f555d');
    ctx.beginPath(); // the head: the peen's ball, a narrow neck, the body, and a slightly wider flat face
    ctx.arc(-24, -40, 11, Math.PI * 0.32, Math.PI * 1.68);
    ctx.lineTo(-12, -45); ctx.lineTo(-6, -50); ctx.lineTo(40, -50); ctx.lineTo(42, -53); ctx.lineTo(50, -53); ctx.lineTo(50, -27); ctx.lineTo(42, -27); ctx.lineTo(40, -30); ctx.lineTo(-6, -30); ctx.lineTo(-12, -35); ctx.closePath();
    ctx.fillStyle = sg; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = '#2f343a'; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(49, -51); ctx.lineTo(49, -29); ctx.stroke(); // the face catches the light
    ctx.fillStyle = 'rgba(255,255,255,.5)'; circle(-27, -44, 3.2); ctx.fill();
  }
  function drawAxe(r) { // a thrown ball-peen hammer, spinning around its middle (the attack kept its old name)
    const sc = r / 42;
    ctx.save(); ctx.scale(sc, sc); ctx.translate(-13, -2); hammerShape(70); ctx.restore();
  }""")
rep("    ctx.save(); ctx.translate(x, y); ctx.scale(side * sc, sc); ctx.rotate(ang); ctx.translate(-50, 40); axeShape(165); ctx.restore();",
    "    ctx.save(); ctx.translate(x, y); ctx.scale(side * sc, sc); ctx.rotate(ang); ctx.translate(-50, 40); hammerShape(165); ctx.restore();")
rep("      outlined('AXE', p.x, combBottom() + 52, 14, '#ff9a8a');", "      outlined('HAMMER', p.x, combBottom() + 52, 14, '#ff9a8a');")
rep("k: 'axe', name: 'Spinning axe',", "k: 'axe', name: 'Ball-peen hammer',")
rep("name: 'Axe chop',", "name: 'Hammer blow',")

# ---------- leaderboard: hold one waiting score per board (a win waiting for a name was being replaced by the next endless round) ----------
rep("  let lbRun = null, lbMe = null, lbBoard = 'endless', lbFrom = null, lbWaiting = null;", "  let lbRun = null, lbMe = null, lbBoard = 'endless', lbFrom = null;")
rep("""  function lbGoLogin(entry) {
    if (entry) try { localStorage.setItem(LB_PEND, JSON.stringify({ entry, at: Date.now() })); } catch (e) {}
    location.href = lbLoginUrl();
  }""", """  function lbGoLogin(entry) { lbHold(entry); location.href = lbLoginUrl(); }
  const lbBetter = (a, b) => (a.board === 'speed' ? a.value < b.value : a.value > b.value || (a.value === b.value && a.tie > b.tie));
  function lbHeld() { // scores waiting for a login or a name: the best one per board, kept for a few days
    let p = null; try { p = JSON.parse(localStorage.getItem(LB_PEND) || 'null'); } catch (e) {}
    if (p && p.entry) p = { entries: { [p.entry.board]: p.entry }, at: p.at }; // the older single-score format
    if (!p || !p.entries || Date.now() - p.at > 3.5 * 86400e3) return {};
    return p.entries;
  }
  function lbSetHeld(entries) { try { if (Object.keys(entries).length) localStorage.setItem(LB_PEND, JSON.stringify({ entries, at: Date.now() })); else localStorage.removeItem(LB_PEND); } catch (e) {} }
  function lbHold(entry) { if (!entry) return; const h = lbHeld(), cur = h[entry.board]; if (!cur || cur.ticket === entry.ticket || lbBetter(entry, cur)) { h[entry.board] = entry; lbSetHeld(h); } }""")
rep("""    if (!LB.token) {
      if (el) { lbLine(el, 'Log in to put your ' + lbValText(entry.board, entry.value) + ' on the leaderboard. <button type="button" data-lblogin>Log in</button>'); el.querySelector('[data-lblogin]').onclick = () => lbGoLogin(entry); }
      return;
    }""", """    if (!LB.token) {
      lbHold(entry); // kept for when you log in
      if (el) { lbLine(el, 'Log in to put your ' + lbValText(entry.board, entry.value) + ' on the leaderboard. <button type="button" data-lblogin>Log in</button>'); el.querySelector('[data-lblogin]').onclick = () => lbGoLogin(entry); }
      return;
    }""")
rep("""      if (!lbMe.name) {
        lbWaiting = { entry, el };""", """      if (!lbMe.name) {
        lbHold(entry);""")
rep("""      const w = lbWaiting; lbWaiting = null;
      if (w) await lbSubmit(w.entry, w.el);
      await lbSendPending();""", """      await lbSendPending();""")
rep("""  async function lbSendPending() { // a score saved before going off to log in
    let p = null;
    try { p = JSON.parse(localStorage.getItem(LB_PEND) || 'null'); } catch (e) {}
    if (!p || !p.entry) return;
    if (Date.now() - p.at > 3.5 * 86400e3) { try { localStorage.removeItem(LB_PEND); } catch (e) {} return; }
    if (!lbMe || !lbMe.name) return;
    try {
      const j = await lbCall('/api/submit', { token: LB.token, ...p.entry });
      try { localStorage.removeItem(LB_PEND); } catch (e) {}
      lbMe.bests[j.board] = { value: j.best.value, tie: j.best.tie, rank: j.rank };
      toast('Your ' + lbValText(j.board, p.entry.value) + ' is on the ' + LB_NAMES[j.board] + ' board: <b>#' + j.rank + '</b>');
    } catch (e) { if (e.code !== 'net' && e.code !== 'server') try { localStorage.removeItem(LB_PEND); } catch (e2) {} toast(esc(e.message)); }
  }""", """  async function lbSendPending() { // scores held while you logged in or picked a name, one per board
    const held = lbHeld();
    if (!Object.keys(held).length || !lbMe || !lbMe.name) { lbSetHeld(held); return; }
    for (const [board, entry] of Object.entries(held)) {
      try {
        const j = await lbCall('/api/submit', { token: LB.token, ...entry });
        delete held[board];
        lbMe.bests[j.board] = { value: j.best.value, tie: j.best.tie, rank: j.rank };
        toast('Your ' + lbValText(j.board, entry.value) + ' is on the ' + LB_NAMES[j.board] + ' board: <b>#' + j.rank + '</b>');
      } catch (e) { if (e.code !== 'net' && e.code !== 'server') delete held[board]; toast(esc(e.message)); }
    }
    lbSetHeld(held);
  }""")
rep("""    let pend = null; try { pend = JSON.parse(localStorage.getItem(LB_PEND) || 'null'); } catch (e) {}
    if (!lbMe.name) { lbLine(el, (pend ? 'Pick a name to put your ' + lbValText(pend.entry.board, pend.entry.value) + ' on the leaderboard.' : 'Pick a name for the leaderboard.') + ' <button type="button" data-lbname>Pick a name</button>'); el.querySelector('[data-lbname]').onclick = () => lbOpen(pend ? pend.entry.board : 'endless', true); return; }""",
    """    const held = Object.values(lbHeld()), pend = held[0];
    if (!lbMe.name) { lbLine(el, (pend ? 'Pick a name to put your ' + held.map(e => lbValText(e.board, e.value)).join(' and ') + ' on the leaderboard.' : 'Pick a name for the leaderboard.') + ' <button type="button" data-lbname>Pick a name</button>'); el.querySelector('[data-lbname]').onclick = () => lbOpen(pend ? pend.board : 'endless', true); return; }""")

open(fn, 'w').write(s)
print('ok')
