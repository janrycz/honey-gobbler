import sys, re
p = sys.argv[1]
s = open(p).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:90]); s = s.replace(old, new)
def between(start, end, new):
    global s
    a = s.index(start); b = s.index(end, a); s = s[:a] + new + s[b:]

# ---------- bosses every 150 kg ----------
rep("  const STAGE_KG = 100, BOSS_COUNT = 6,", "  const STAGE_KG = 150, BOSS_COUNT = 6,")
rep('<span id="next">April · boss at 100 kg</span>', '<span id="next">April · boss at 150 kg</span>')
rep("Every 100 kg you harvest, someone turns up to ruin it.", "Every 150 kg you harvest, someone turns up to ruin it.")
rep('<span><b>100</b>Apr</span><span><b>200</b>May</span><span><b>300</b>Jun</span><span><b>400</b>Jul</span><span><b>500</b>Aug</span><span><b>600</b>Sep</span>',
    '<span><b>150</b>Apr</span><span><b>300</b>May</span><span><b>450</b>Jun</span><span><b>600</b>Jul</span><span><b>750</b>Aug</span><span><b>900</b>Sep</span>')
rep('<div class="big">600 kg</div>', '<div class="big">900 kg</div>')
rep("That's 500 of our 1.2 kg jars.", "That's 750 of our 1.2 kg jars.")

# ---------- level system ----------
between("  const THICK = [1, 1.25, 1.5, 2];\n", "  const SMOKE_SLOW = 0.4, BEE_SPEED = 300, BEE_REST = 1;\n", '''  const MAX_LV = 10;
  const thickMul = lv => 1 + 0.1 * lv;
  const GLOB_COL = ['#e08e0b', '#c9760a', '#a95c08', '#8a4406'];
  const FEE_MULT = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 10000];
  const allyStats = lv => { const m = 1 - 0.035 * lv; return { dmg: 3 + 0.2 * lv, lo: 2.8 * m, hi: 3.8 * m, fee: FEE_MULT[lv] }; };
  const BEE_COUNT = [0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4];
  const beeStats = lv => ({ n: BEE_COUNT[lv], speed: 1 + 0.06 * Math.max(0, lv - 1), rest: 1 - 0.05 * Math.max(0, lv - 1) });
  const EXTRACT_GRAB = [0, 4, 5, 6, 7, 8, 10, 12, 15, 20, Infinity];
  // powers start weak at level 1 and recharge faster and hit harder each level
  const PW = {
    smoker: lv => ({ cd: 30 - (lv - 1) * 15 / 9, dur: 3 + (lv - 1) / 3, slow: 0.6 - (lv - 1) * 0.3 / 9 }),
    queen: lv => ({ cd: 35 - (lv - 1) * 17 / 9, dur: 5 + (lv - 1) * 5 / 9, reach: 0.15 + (lv - 1) * 0.15 / 9 }),
    extractor: lv => ({ cd: 60 - (lv - 1) * 30 / 9, grab: EXTRACT_GRAB[lv] }),
  };
  const PKEY = { smoker: '1', queen: '2', extractor: '3' };
  const PKEYS = ['smoker', 'queen', 'extractor'];
''')
rep("  const SMOKE_SLOW = 0.4, BEE_SPEED = 300, BEE_REST = 1;\n", "  const BEE_SPEED = 300;\n")
rep("allyQueue = null, shedSel = null, shedPending = null, hikeSaid = false;",
    "allyQueue = null, shedSel = null, shedPending = null, shedPinned = false, hikeSaid = false, smokeSlow = 0.6, smokeDur = 3, queenReach = 0.15;")
rep("SMOKE_SLOW", "smokeSlow", 4)

between("  const SHOP = [\n", "  const GRANDAD_HI = ", r'''  const COST = [5, 7, 9, 12, 15, 19, 24, 29, 35, 42]; // levels 1-10, scaled by each item's weight below
  const costs = w => COST.map(c => Math.round(c * w));
  const f2 = n => String(Math.round(n * 100) / 100);
  const SHOP = [
    { id: 'thick', name: 'Thicker honey', cost: costs(1.2), desc: 'The honey you flick at bosses does more damage.',
      lvText: lv => `×${thickMul(lv).toFixed(1)}: drop ${f2(thickMul(lv))}, jar ${f2(2 * thickMul(lv))}, box ${f2(4 * thickMul(lv))} damage` },
    { id: 'bee', name: 'Worker bee', cost: costs(1.3), desc: 'Bees that fly around catching drops for you. Too small to lift jars. In boss fights they flick each drop at the boss.',
      lvText: lv => { if (!lv) return 'No bees'; const b = beeStats(lv), f = Math.round((b.speed - 1) * 100); return `${b.n} bee${b.n > 1 ? 's' : ''}, ${f ? f + '% faster' : 'normal speed'}`; } },
    { id: 'colonex', name: 'Pay Colonex', cost: costs(1.0), unlock: () => endless || bossIdx >= 2, desc: 'Raise his fees. His invoices hit bosses harder and more often.',
      lvText: lv => { const a = allyStats(lv); return `${f2(a.dmg)} damage per invoice, every ${a.lo.toFixed(1)}–${a.hi.toFixed(1)} s, fees ×${a.fee.toLocaleString('en-GB')}`; } },
    { id: 'smoker', name: 'Smoker', cost: costs(0.9), desc: 'Slows every fake and boss attack for a few seconds.',
      lvText: lv => { if (!lv) return 'Not owned'; const q = PW.smoker(lv); return `Slows them to ${Math.round(q.slow * 100)}% speed for ${q.dur.toFixed(1)} s. Recharges in ${Math.round(q.cd)} s.`; } },
    { id: 'queen', name: 'Queen bee', cost: costs(1.0), desc: 'Pulls nearby honey into your spoon for a few seconds.',
      lvText: lv => { if (!lv) return 'Not owned'; const q = PW.queen(lv); return `Reaches ${Math.round(q.reach * 100)}% of the screen's width for ${q.dur.toFixed(1)} s. Recharges in ${Math.round(q.cd)} s.`; } },
    { id: 'extractor', name: 'Extractor', cost: costs(1.2), desc: 'Sucks honey on screen into your spoon.',
      lvText: lv => { if (!lv) return 'Not owned'; const q = PW.extractor(lv); return `${q.grab === Infinity ? 'Grabs all the honey on screen' : 'Grabs the ' + q.grab + ' nearest bits of honey'}. Recharges in ${Math.round(q.cd)} s.`; } },
  ];
  SHOP.forEach(x => { x.max = MAX_LV; x.key = PKEY[x.id]; });
  const COLONEX_RAISE = ['loksd corporation has issued a fee increase fee', 'loksd corporation board of directors has approved this', 'loksd corporation can afford', 'premium fees for premium bosses'];
''')

# ---------- powers ----------
rep("      const p = (1 - pcd[k] / POWERS[k].cd).toFixed(2);", "      const p = Math.max(0, 1 - pcd[k] / PW[k](upg[k]).cd).toFixed(2);")
rep("""    pcd[k] = POWERS[k].cd;
    if (k === 'smoker') { smokeT = POWERS.smoker.dur; floatText(W / 2, H * 0.42, 'SMOKER', '#e8e2d4', true); sfx.smoke(); }
    else if (k === 'queen') { queenT = POWERS.queen.dur; floatText(W / 2, H * 0.42, 'QUEEN BEE', '#ffd36b', true); sfx.comb(); }
    else extract();""", """    const st = PW[k](upg[k]);
    pcd[k] = st.cd;
    if (k === 'smoker') { smokeT = smokeDur = st.dur; smokeSlow = st.slow; floatText(W / 2, H * 0.42, 'SMOKER', '#e8e2d4', true); sfx.smoke(); }
    else if (k === 'queen') { queenT = st.dur; queenReach = st.reach; floatText(W / 2, H * 0.42, 'QUEEN BEE', '#ffd36b', true); sfx.comb(); }
    else extract(st.grab);""")
rep("""  function extract() {
    extractT = POWERS.extractor.dur; sfx.whoosh(); setTimeout(() => sfx.comb(), 250);
    let n = 0;
    for (const it of items) if (it.kind !== 'bad' && !it.suck) { it.suck = { t: 0, x0: it.x, y0: it.y }; if (it.bee) it.bee.tgt = null; n++; }""",
"""  function extract(grab) {
    extractT = 0.7; sfx.whoosh(); setTimeout(() => sfx.comb(), 250);
    const d = it => Math.hypot(it.x - spoon.x, it.y - spoon.y);
    const pickd = items.filter(it => it.kind !== 'bad' && !it.suck).sort((a, b) => d(a) - d(b)).slice(0, grab);
    for (const it of pickd) { it.suck = { t: 0, x0: it.x, y0: it.y }; if (it.bee) it.bee.tgt = null; }
    const n = pickd.length;""")
rep("    const sm = smokeT > 0 ? smokeSlow : 1, qR = W * 0.25;", "    const sm = smokeT > 0 ? smokeSlow : 1, qR = W * queenReach;")
rep("      const R = W * 0.25, a = Math.min(1, queenT * 2);", "      const R = W * queenReach, a = Math.min(1, queenT * 2);")
rep("(POWERS.smoker.dur - smokeT) * 4 + 0.2", "(smokeDur - smokeT) * 4 + 0.2")

# ---------- thicker honey, bees, colonex ----------
rep("dmg: DMG[kind] * THICK[upg.thick] * (rush > 0 ? RUSH_MULT : 1), r: (kind === 'drop' ? 7 : 11) * G * (1 + 0.12 * upg.thick)",
    "dmg: DMG[kind] * thickMul(upg.thick) * (rush > 0 ? RUSH_MULT : 1), r: (kind === 'drop' ? 7 : 11) * G * (1 + 0.04 * upg.thick)")
rep("dmg: THICK[upg.thick], r: 6 * G * (1 + 0.12 * upg.thick)", "dmg: thickMul(upg.thick), r: 6 * G * (1 + 0.04 * upg.thick)")
rep("      ctx.fillStyle = GLOB_COL[g.lv || 0]; ctx.fill();", "      ctx.fillStyle = GLOB_COL[Math.min(3, Math.floor((g.lv || 0) / 3))]; ctx.fill();")
rep("    while (bees.length < upg.bee) bees.push(", "    const bs = beeStats(upg.bee);\n    while (bees.length < bs.n) bees.push(")
rep("    const sp = BEE_SPEED * G * (0.6 + 0.4 * fallMul());", "    const sp = BEE_SPEED * G * bs.speed * (0.6 + 0.4 * fallMul());")
rep("    b.tgt = null; b.rest = BEE_REST;", "    b.tgt = null; b.rest = beeStats(upg.bee).rest;")
rep("      const L = ALLY_LV[upg.colonex];", "      const L = allyStats(upg.colonex);")

# ---------- shed: hidden Colonex, levels, hover vs pinned ----------
rep("""      el.querySelector('.pips').textContent = s.max > 1
        ? Array.from({ length: s.max }, (_, i) => i < inf.lv ? '●' : '○').join(' ')
        : touchUI ? 'power' : 'power · key ' + s.key;
      el.querySelector('.pr').innerHTML = inf.locked ? 'Locked' : inf.maxed ? (s.max > 1 ? 'Max' : 'Owned') : (inf.cost > inf.base ? '<s>' + inf.base + '</s> ' : '') + inf.cost + ' kg';""",
"""      el.hidden = inf.locked; // Pay Colonex only appears once he has joined you
      el.querySelector('.pips').textContent = 'Level ' + inf.lv + '/' + s.max + (s.key ? (touchUI ? ' · power' : ' · key ' + s.key) : '');
      el.querySelector('.pr').innerHTML = inf.maxed ? 'Max' : (inf.cost > inf.base ? '<s>' + inf.base + '</s> ' : '') + inf.cost + ' kg';""")
between("  function selectItem(id) {", "  function cancelBuy() {", r'''  function selectItem(id) {
    shedSel = id;
    const s = SHOP.find(x => x.id === id), inf = itemInfo(s);
    $('dName').textContent = s.name + '  ·  level ' + inf.lv + ' of ' + s.max;
    $('dDesc').textContent = s.desc + (s.key ? (touchUI ? ' Tap its button on the right to use it.' : ' Click anywhere or press ' + s.key + ' to use it.') : '');
    $('dNow').textContent = 'Now: ' + s.lvText(inf.lv);
    $('dNext').textContent = inf.maxed ? 'Fully upgraded.' : 'Next: ' + s.lvText(inf.lv + 1);
    const btn = $('buyBtn');
    if (inf.maxed) { btn.textContent = 'Max level'; btn.disabled = true; }
    else if (score < inf.cost) { btn.textContent = 'Need ' + inf.cost + ' kg'; btn.disabled = true; }
    else { btn.textContent = 'Buy for ' + inf.cost + ' kg'; btn.disabled = false; }
    renderShed();
  }
''')
rep("    if (POWERS[id]) { pcd[id] = 0; readyAt[id] = elapsed; }",
    "    if (PW[id]) { if (upg[id] === 1) { pcd[id] = 0; readyAt[id] = elapsed; } else pcd[id] = Math.min(pcd[id], PW[id](upg[id]).cd); }")
rep("        : 'loksd corporation is a premium product';", "        : upg.colonex === 2 ? 'loksd corporation is a premium product' : pick(COLONEX_RAISE);")
rep("    cancelBuy(); $('colonexMsg').hidden = true;", "    cancelBuy(); shedPinned = false; $('colonexMsg').hidden = true;")
rep("    selectItem(shedSel || SHOP[0].id);", "    selectItem(shedSel && itemInfo(SHOP.find(x => x.id === shedSel)).locked === false ? shedSel : SHOP[0].id);")
rep("    b.addEventListener('mouseenter', () => { if (!shedPending) selectItem(s.id); });\n    b.addEventListener('focus', () => { if (!shedPending) selectItem(s.id); });",
    "    // hovering previews an item until you press one; then it stays on that item until you press another\n    b.addEventListener('mouseenter', () => { if (!shedPending && !shedPinned) selectItem(s.id); });\n    b.addEventListener('focus', () => { if (!shedPending && !shedPinned) selectItem(s.id); });")
rep("      cancelBuy(); selectItem(s.id);\n", "      shedPinned = true; cancelBuy(); selectItem(s.id);\n")

assert 'POWERS' not in s and 'THICK[' not in s and 'ALLY_LV' not in s and 'BEE_REST' not in s and 'lockText' not in s, 'leftover'
open(p, 'w').write(s)
print('ok')
