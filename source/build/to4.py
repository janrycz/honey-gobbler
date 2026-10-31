import sys
src, dst = sys.argv[1], sys.argv[2]
s = open(src).read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:90])
    s = s.replace(old, new)

def between(start, end, new):
    global s
    a = s.index(start); b = s.index(end, a)
    s = s[:a] + new + s[b:]

# ---------- names ----------
rep('<title>Honey Gobbler III</title>', '<title>Honey Gobbler IV</title>')
rep('<div class="brand">Honey Gobbler III<small>', '<div class="brand">Honey Gobbler IV<small>')
rep('<h1>Honey Gobbler III</h1>', '<h1>Honey Gobbler IV</h1>')

# ---------- CSS ----------
CSS = r'''[hidden] { display: none !important; }
.powers { position: absolute; right: max(10px, env(safe-area-inset-right, 0px)); bottom: 30%; display: flex; flex-direction: column; gap: 12px; }
.pbtn {
  --p: 1; position: relative; width: 56px; height: 56px; border-radius: 50%; border: 0; padding: 0; cursor: pointer;
  background: conic-gradient(var(--honey) calc(var(--p) * 1turn), rgba(246, 227, 180, .16) 0);
  touch-action: manipulation; -webkit-tap-highlight-color: transparent;
}
.pbtn i { position: absolute; inset: 4px; border-radius: 50%; background: var(--hive-2); display: grid; place-items: center; opacity: .55; transition: opacity .2s; }
.pbtn svg { width: 32px; height: 32px; }
.pbtn kbd { position: absolute; right: -5px; top: -5px; min-width: 18px; padding: 2px 4px 1px; border-radius: 6px; background: var(--wax); color: var(--ink); font: 700 .7rem var(--body); text-align: center; }
.pbtn.ready i { opacity: 1; }
.pbtn.ready { animation: ready .8s ease-in-out infinite alternate; }
.pbtn.active i { opacity: 1; background: #6b4512; }
.pbtn:focus-visible { outline: 3px solid var(--wax); outline-offset: 3px; }
@keyframes ready { from { box-shadow: 0 0 0 0 rgba(255, 211, 107, 0); } to { box-shadow: 0 0 0 5px rgba(255, 211, 107, .35), 0 0 18px rgba(255, 211, 107, .7); } }
@media (hover: none) { .pbtn kbd { display: none; } }
.overlay.shed { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
.overlay.shed .card { min-height: 0; flex: 0 1 auto; width: min(560px, 100%); }
.gbubble {
  align-self: flex-start; position: relative; margin-left: calc(14px - max(16px, env(safe-area-inset-left, 0px)));
  max-width: min(440px, 88%); background: #fbf8f0; color: var(--ink); border: 2px solid var(--ink); border-radius: 14px;
  padding: 8px 14px 9px; font: 600 1rem/1.35 var(--body);
}
.gbubble b { display: block; font: 700 .68rem var(--body); letter-spacing: .12em; text-transform: uppercase; color: var(--honey-deep); margin-bottom: 2px; }
.gbubble::before, .gbubble::after { content: ""; position: absolute; top: 50%; border-style: solid; transform: translateY(-50%); }
.gbubble::before { left: -17px; border-width: 9px 17px 9px 0; border-color: transparent var(--ink) transparent transparent; }
.gbubble::after { left: -12px; border-width: 7px 13px 7px 0; border-color: transparent #fbf8f0 transparent transparent; }
.gbubble.pop { animation: pop .3s cubic-bezier(.3, 1.6, .5, 1); }
@keyframes pop { from { transform: scale(.85); opacity: .4; } }
.wallet { display: flex; justify-content: center; align-items: baseline; gap: 8px; flex-wrap: wrap; font-size: .86rem; }
.wallet b { font-family: var(--display); font-size: 1.6rem; color: var(--ink); font-variant-numeric: tabular-nums; }
.shop { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.tile {
  font: inherit; text-align: left; cursor: pointer; display: flex; flex-direction: column; gap: 3px;
  background: var(--ink); color: var(--wax); border: 2px solid transparent; border-radius: 12px; padding: 9px 10px 8px;
}
.tile .nm { font: 700 .84rem/1.2 var(--body); }
.tile .pips { font-size: .72rem; color: var(--honey); min-height: 1.1em; }
.tile .pr { font: 700 .8rem var(--body); color: var(--honey); font-variant-numeric: tabular-nums; }
.tile.sel { border-color: var(--honey); box-shadow: 0 0 0 2px rgba(242, 165, 22, .3); }
.tile.cant .pr { color: #e9907f; }
.tile.done .pr { color: #9ad08a; }
.tile.locked { opacity: .5; }
.tile:focus-visible { outline: 3px solid var(--honey-deep); outline-offset: 2px; }
.detail { text-align: left; background: color-mix(in srgb, var(--ink) 7%, transparent); border-radius: 12px; padding: 10px 12px; display: flex; flex-direction: column; gap: 5px; }
.detail h3 { margin: 0; font: 700 1rem var(--body); color: var(--ink); }
.detail p { font-size: .86rem !important; }
.detail .now { color: color-mix(in srgb, var(--ink) 70%, transparent); }
.detail .nxt { color: var(--honey-deep); font-weight: 700; }
.detail .actions { justify-content: flex-start; margin-top: 4px; }
.btn.small { font-size: 1.05rem; padding: 9px 16px 7px; }
.btn:disabled { opacity: .45; cursor: not-allowed; transform: none; }
.confirm { display: flex; flex-direction: column; gap: 6px; }
.confirm p { font-weight: 700; }
.cmsg { text-align: left; background: #313338; color: #dbdee1; border-radius: 10px; padding: 8px 12px; font-size: .88rem; }
.cmsg b { display: block; color: #b48cff; }
@media (max-width: 520px) {
  .shop { grid-template-columns: repeat(2, 1fr); }
  .gbubble { font-size: .9rem; }
  .pbtn { width: 50px; height: 50px; }
  .pbtn svg { width: 28px; height: 28px; }
}
'''
rep('@media (max-width: 520px) {\n  .brand {', CSS + '@media (max-width: 520px) {\n  .brand {')
rep('.mk.live, .stamp { animation: none; }', '.mk.live, .stamp, .pbtn.ready, .gbubble.pop { animation: none; }')

# ---------- HTML ----------
POWERS_HTML = '''
    <div class="powers" id="powers">
      <button class="pbtn" id="pw-smoker" type="button" hidden aria-label="Smoker"><i><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="8" y="14" width="13" height="15" rx="2" fill="#c9ced6"/><path d="M8 14 L14.5 8 L21 14 Z" fill="#9aa0a8"/><rect x="13" y="5" width="3" height="4" fill="#9aa0a8"/><rect x="21" y="17" width="7" height="9" rx="1.5" fill="#8a5a2b"/><circle cx="11" cy="4.5" r="3" fill="#e8e2d4" opacity=".85"/><circle cx="6.5" cy="3" r="2.2" fill="#e8e2d4" opacity=".6"/></svg></i><kbd>1</kbd></button>
      <button class="pbtn" id="pw-queen" type="button" hidden aria-label="Queen bee"><i><svg viewBox="0 0 32 32" aria-hidden="true"><ellipse cx="11" cy="15" rx="6" ry="3.6" fill="rgba(255,255,255,.75)" transform="rotate(-25 11 15)"/><ellipse cx="21" cy="15" rx="6" ry="3.6" fill="rgba(255,255,255,.75)" transform="rotate(25 21 15)"/><ellipse cx="16" cy="21.5" rx="8" ry="6" fill="#f2b81a"/><path d="M12.5 16.3v10.4M19.5 16.3v10.4" stroke="#1a1206" stroke-width="2.4"/><path d="M10 10 L11.5 4 L14 8 L16 3 L18 8 L20.5 4 L22 10 Z" fill="#ffd36b"/></svg></i><kbd>2</kbd></button>
      <button class="pbtn" id="pw-extractor" type="button" hidden aria-label="Extractor"><i><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="18" r="10" fill="#c9ced6" stroke="#6a6e76" stroke-width="2"/><path d="M16 11v14M9 18h14M11 13l10 10M21 13 11 23" stroke="#6a6e76" stroke-width="1.6"/><circle cx="16" cy="18" r="2.6" fill="#f2a516"/><path d="M16 8V4h8" stroke="#8a5a2b" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg></i><kbd>3</kbd></button>
    </div>
'''
rep('<button class="mute" id="mute" type="button">Sound on</button>\n', '<button class="mute" id="mute" type="button">Sound on</button>\n' + POWERS_HTML)

rep('''<p><b>Purity</b> is your health. Hit 0% and your honey is officially sus. Anything with a red ring is fake. Fill the <b>Addictive</b> meter for a rush. In boss fights, every drop you catch gets flicked back at the boss.</p>''',
    '''<p><b>Purity</b> is your health. Hit 0% and your honey is officially sus. Anything with a red ring is fake. Real honey tops your purity up a little, Grandad's comb a lot. Fill the <b>Addictive</b> meter for a rush. In boss fights, every drop you catch gets flicked back at the boss. After each boss, spend your honey in <b>Grandad's Shed</b>.</p>''')

SHED_HTML = '''
    <div class="overlay shed" id="shedScreen" hidden>
      <div class="gbubble" id="gBubble"><b>Grandad</b><span id="gLine"></span></div>
      <div class="card">
        <h2>Grandad's Shed</h2>
        <div class="wallet"><span>You have</span><b id="shedKg">0 kg</b><span id="shedNext"></span></div>
        <p class="hint">Pay with honey. Every kilo you spend pushes the next boss further away.</p>
        <div class="shop" id="shop"></div>
        <div class="detail" id="detail">
          <h3 id="dName"></h3>
          <p id="dDesc"></p>
          <p class="now" id="dNow"></p>
          <p class="nxt" id="dNext"></p>
          <div class="actions"><button class="btn small" id="buyBtn" type="button">Buy</button></div>
          <div class="confirm" id="confirm" hidden>
            <p id="confirmText"></p>
            <div class="actions"><button class="btn small" id="confirmYes" type="button">Buy</button><button class="btn small ghost" id="confirmNo" type="button">Cancel</button></div>
          </div>
        </div>
        <div class="cmsg" id="colonexMsg" hidden><b>Colonex</b><span id="cmsgText"></span></div>
        <button class="btn" id="shedDone" type="button">Back to the hives</button>
      </div>
    </div>
'''
rep('''        <button class="btn" id="resumeBtn" type="button">Back to the hives</button>
      </div>
    </div>
''', '''        <button class="btn" id="resumeBtn" type="button">Back to the hives</button>
      </div>
    </div>
''' + SHED_HTML)

# ---------- JS constants ----------
rep('  const RUSH_TIME = 9, RUSH_MULT = 1.5;\n', '''  const RUSH_TIME = 9, RUSH_MULT = 1.5;
  const HEAL = { drop: 0.5, jar: 1, box: 5, comb: 18, shilajit: 3, lab: 0 }; // purity restored by real honey
  const THICK = [1, 1.25, 1.5, 2];
  const GLOB_COL = ['#e08e0b', '#c9760a', '#a95c08', '#8a4406'];
  const ALLY_LV = [{ dmg: 3, lo: 2.8, hi: 3.8, fee: 1 }, { dmg: 4, lo: 2.8, hi: 3.8, fee: 2 }, { dmg: 5, lo: 2.3, hi: 3.0, fee: 5 }];
  const POWERS = { smoker: { key: '1', cd: 20, dur: 5 }, queen: { key: '2', cd: 25, dur: 8 }, extractor: { key: '3', cd: 40, dur: 0.7 } };
  const PKEYS = ['smoker', 'queen', 'extractor'];
  const SMOKE_SLOW = 0.4, BEE_SPEED = 300, BEE_REST = 1;
''')

rep("  const EQUATIONS = ['√(1/300)', 'f(x)=x/3+5', '(x+½)²', 'IQ > 9000', 'y=−√x'];\n", '''  const EQUATIONS = ['√(1/300)', 'f(x)=x/3+5', '(x+½)²', 'IQ > 9000', 'y=−√x'];

  // ---------- Grandad's Shed ----------
  const SHOP = [
    { id: 'thick', name: 'Thicker honey', max: 3, cost: [15, 25, 40], desc: 'The honey you flick at bosses does more damage.',
      levels: ['Drop 1, jar 2, box 4 damage', '×1.25: drop 1.25, jar 2.5, box 5 damage', '×1.5: drop 1.5, jar 3, box 6 damage', '×2: drop 2, jar 4, box 8 damage'] },
    { id: 'bee', name: 'Worker bee', max: 3, cost: [20, 30, 45], desc: "A bee that flies around catching drops for you. Too small to lift jars. In boss fights she flicks each drop at the boss.",
      levels: ['No bees', '1 bee', '2 bees', '3 bees'] },
    { id: 'colonex', name: 'Pay Colonex', max: 2, cost: [25, 40], lockText: 'Unlocks after May', unlock: () => endless || bossIdx >= 2,
      desc: 'Raise his fees. His invoices hit bosses harder and more often.',
      levels: ['3 damage per invoice, every 2.8–3.8 s', '4 damage per invoice, fees doubled', '5 damage per invoice, every 2.3–3 s, fees ×5'] },
    { id: 'smoker', name: 'Smoker', max: 1, cost: [15], key: '1', desc: 'Slows every fake and boss attack to 40% speed for 5 seconds. Recharges in 20 seconds.',
      levels: ['Not owned', 'Owned'] },
    { id: 'queen', name: 'Queen bee', max: 1, cost: [20], key: '2', desc: 'For 8 seconds, any honey within a quarter of the screen of your spoon gets pulled into it. Recharges in 25 seconds.',
      levels: ['Not owned', 'Owned'] },
    { id: 'extractor', name: 'Extractor', max: 1, cost: [30], key: '3', desc: 'Sucks every bit of honey on screen into your spoon. Recharges in 40 seconds.',
      levels: ['Not owned', 'Owned'] },
  ];
  const GRANDAD_HI = ["Honey doesn't grow on trees. Spend it wisely.", "The bees worked hard for that. Don't waste it.", 'Every kilo you spend, you have to catch again.', 'In my day we had a spoon and nothing else.'];
  const GRANDAD_BUY = { thick: 'Leave it in the frame longer. Thicker honey.', bee: "Take one of mine. She's a hard worker.", colonex: 'Who is this boy and why does he keep sending me invoices?', smoker: "Don't point it at your own face.", queen: 'Be gentle with her.', extractor: 'Mind your fingers.' };
  const GRANDAD_BROKE = "You can't afford that. Go catch more honey.";
  const feeText = (t, m) => { const n = parseInt(t, 10); return (n * m) + t.slice(String(n).length); };
''')

# ---------- scaling ----------
rep('  let W = 0, H = 0, DPR = 1;\n', '  let W = 0, H = 0, DPR = 1, WR = 1, G = 1, GT = 1; // G: halfway between fixed size and full width scaling; GT: gentler, for text\n')
rep('    W = r.width; H = r.height;\n', '    W = r.width; H = r.height;\n    WR = Math.min(1, W / 1100); G = 0.5 + 0.5 * WR; GT = 0.5 + 0.5 * G;\n')
rep('  function spoonSize() { return Math.max(46, Math.min(70, W / 9)); }', '  function spoonSize() { return Math.max(44, 70 * G); }')
rep('  function bossK() { return clamp(Math.min(W, H) / 470, 0.62, 1.3); }', '  function bossK() { return Math.min(1.3 * (0.3 + 0.7 * WR), Math.max(0.6, H / 520)); }')

# ---------- state ----------
rep('  let invincible = false, bot = false; // test switches, only reachable with #debug\n',
    '  let invincible = false, bot = false; // test switches, only reachable with #debug\n  let upg, pcd, readyAt, bees = [], smokeT = 0, queenT = 0, extractT = 0, storageWarned = false, allyQueue = null, shedSel = null, shedPending = null;\n')
rep("    tally = { drops: 0, jars: 0, boxes: 0, comb: 0, labs: 0, bosses: 0, billed: 0, bad: {} };",
    "    tally = { drops: 0, jars: 0, boxes: 0, comb: 0, labs: 0, bosses: 0, billed: 0, beeDrops: 0, spent: 0, bad: {} };")
rep("    endless = false; endlessNext = 0; endlessRound = 0; usedRevive = false;\n",
    "    endless = false; endlessNext = 0; endlessRound = 0; usedRevive = false;\n    upg = { thick: 0, bee: 0, colonex: 0, smoker: 0, queen: 0, extractor: 0 }; pcd = { smoker: 0, queen: 0, extractor: 0 }; readyAt = { smoker: 0, queen: 0, extractor: 0 };\n    bees = []; smokeT = 0; queenT = 0; extractT = 0; allyQueue = null;\n")

# ---------- HUD power buttons ----------
rep('\n  }\n\n  // ---------- spawning ----------', '''
    updatePowerUi();
  }
  const touchUI = matchMedia('(hover: none)').matches;
  function updatePowerUi() {
    if (!upg) return;
    for (const k of PKEYS) {
      const id = 'pw-' + k, el = $(id), own = upg[k] > 0;
      if (el.hidden === own) el.hidden = !own;
      if (!own) continue;
      const p = (1 - pcd[k] / POWERS[k].cd).toFixed(2);
      if (hudCache[id] !== p) { hudCache[id] = p; el.style.setProperty('--p', p); }
      const active = (k === 'smoker' && smokeT > 0) || (k === 'queen' && queenT > 0) || (k === 'extractor' && extractT > 0);
      const cls = 'pbtn' + (pcd[k] <= 0 ? ' ready' : '') + (active ? ' active' : '');
      if (el.className !== cls) el.className = cls;
    }
  }

  // ---------- spawning ----------''')

# ---------- input ----------
rep("    if (e.pointerType === 'mouse') { spoon.tx = clamp(x, 20, W - 20); return; }",
    "    if (e.pointerType === 'mouse') { spoon.tx = clamp(x, 20, W - 20); if (e.type === 'pointerdown' && e.button === 0 && e.target === cv && state === 'play') fireReady(); return; }")
rep("    if (e.key.startsWith('Arrow')) e.preventDefault();\n  });",
    """    if (e.key.startsWith('Arrow')) e.preventDefault();
    if (state === 'play') {
      const pk = { 1: 'smoker', 2: 'queen', 3: 'extractor' }[e.key];
      if (pk) firePower(pk);
      if (e.key === ' ' && !(e.target instanceof HTMLButtonElement)) { e.preventDefault(); fireReady(); }
    }
  });""")

# ---------- sound ----------
rep("    hum: () => tone(118, 121, 0.5, 'sine', 0.012),\n",
    "    hum: () => tone(118, 121, 0.5, 'sine', 0.012),\n    ready: () => tone(880, 1320, 0.12, 'sine', 0.05),\n    buy: () => seq([659, 784, 988], 60, 'triangle', 0.09, 0.12),\n    smoke: () => tone(300, 120, 0.6, 'sawtooth', 0.03),\n")

# ---------- eating ----------
between('  function eat(it) {', '  function addKg(n) {', r'''  function eat(it) {
    const mult = combo * (rush > 0 ? RUSH_MULT : 1);
    const kind = it.kind;
    spoon.chew = 0.25; spoon.fill = Math.min(1, spoon.fill + (kind === 'drop' ? .12 : .45));
    const kg = kind === 'drop' ? it.kg : (KG[kind] || 0);
    if (kind === 'drop') { tally.drops++; sfx.drop(); splat(it.x, it.y, '#b05a14', 6); }
    else if (kind === 'jar') { tally.jars++; sfx.jar(); splat(it.x, it.y, '#8a3a0e', 16); }
    else if (kind === 'box') { tally.boxes++; sfx.box(); splat(it.x, it.y, '#c89a5b', 18); floatText(it.x, it.y - 40, 'Box of honey!', '#ffd36b'); }
    else if (kind === 'comb') { tally.comb++; sfx.comb(); splat(it.x, it.y, '#f2a516', 16); }
    else if (kind === 'shilajit') { startRush(); floatText(it.x, it.y - 34, "Don't eat this if you're married", '#ffd36b'); splat(it.x, it.y, '#2b1406', 16); }
    else if (kind === 'lab') labTest();
    const h = heal(HEAL[kind] || 0);
    if (kind === 'comb') floatText(it.x, it.y - 34, "Grandad's comb +" + Math.round(h) + '%', '#ffe9a8');
    else if (kind === 'box' && h >= 1) floatText(it.x, it.y - 62, '+' + Math.round(h) + '% purity', '#ffe9a8');
    fillAddict(FILL[kind]);
    streak++;
    const oldCombo = combo;
    combo = 1 + 0.5 * Math.min(4, Math.floor(streak / 5));
    if (combo > oldCombo && praiseT <= 0) { floatText(spoon.x, spoon.y - 70, pick(PRAISE), '#ffd36b'); praiseT = 2.5; }
    if (phase === 'harvest' && kg) {
      const add = kg * mult;
      floatText(it.x, it.y - 10, '+' + fmtAdd(kg) + (mult > 1 ? ' ×' + fmtMult(mult) : ''), kind === 'drop' ? '#f6e3b4' : '#ffd36b');
      addKg(add);
    } else if (phase === 'boss') {
      if (kg) fightKg(kg, it.x, it.y);
      if (boss && (boss.mode === 'fight' || boss.mode === 'dash') && kind !== 'lab') {
        globs.push({ x: spoon.x, y: spoon.y - 20, vx: 0, vy: -760, dmg: DMG[kind] * THICK[upg.thick] * (rush > 0 ? RUSH_MULT : 1), r: (kind === 'drop' ? 7 : 11) * G * (1 + 0.12 * upg.thick), lv: upg.thick });
        sfx.fling();
      }
    }
  }
  // Honey eaten during a boss fight counts at its plain weight (no combo, no Addictive bonus)
  // and stops 10 kg short of the next boss, so a fight can never lead straight into another.
  function fightCap() { return endless ? endlessNext + STAGE_KG - 10 : thresholdFor(bossIdx + 1) - 10; }
  function fightKg(kg, x, y) {
    const room = fightCap() - score;
    if (room <= 0) {
      if (!storageWarned) { storageWarned = true; floatText(x, y - 10, 'Storage full until the next harvest', '#f6e3b4'); }
      return;
    }
    const add = Math.min(kg, room);
    score += add;
    floatText(x, y - 10, '+' + fmtAdd(add), '#f6e3b4');
  }
''')

# ---------- powers and worker bees ----------
rep('  // ---------- events between bosses: honey flow and bee swarm ----------', r'''  // ---------- powers bought in Grandad's Shed ----------
  function firePower(k) {
    if (state !== 'play' || !k || !upg[k] || pcd[k] > 0) return false;
    pcd[k] = POWERS[k].cd;
    if (k === 'smoker') { smokeT = POWERS.smoker.dur; floatText(W / 2, H * 0.42, 'SMOKER', '#e8e2d4', true); sfx.smoke(); }
    else if (k === 'queen') { queenT = POWERS.queen.dur; floatText(W / 2, H * 0.42, 'QUEEN BEE', '#ffd36b', true); sfx.comb(); }
    else extract();
    updatePowerUi();
    return true;
  }
  function fireReady() { // a click fires whichever power has been ready the longest
    let best = null;
    for (const k of PKEYS) if (upg[k] && pcd[k] <= 0 && (!best || readyAt[k] < readyAt[best])) best = k;
    return firePower(best);
  }
  function extract() {
    extractT = POWERS.extractor.dur; sfx.whoosh(); setTimeout(() => sfx.comb(), 250);
    let n = 0;
    for (const it of items) if (it.kind !== 'bad' && !it.suck) { it.suck = { t: 0, x0: it.x, y0: it.y }; if (it.bee) it.bee.tgt = null; n++; }
    floatText(W / 2, H * 0.42, 'EXTRACTOR', '#ffd36b', true);
    if (!n) floatText(W / 2, H * 0.42 + 34, 'Nothing to catch', '#f6e3b4');
  }
  function updatePowers(dt) {
    smokeT = Math.max(0, smokeT - dt); queenT = Math.max(0, queenT - dt); extractT = Math.max(0, extractT - dt);
    for (const k of PKEYS) if (upg[k] && pcd[k] > 0) { pcd[k] -= dt; if (pcd[k] <= 0) { pcd[k] = 0; readyAt[k] = elapsed; sfx.ready(); } }
  }
  function updateBees(dt) {
    while (bees.length < upg.bee) bees.push({ x: spoon.x + rnd(-40, 40), y: spoon.y - 90, tgt: null, rest: 0.4, ph: rnd(0, 6), dir: 1 });
    const sp = BEE_SPEED * G * (0.6 + 0.4 * fallMul());
    bees.forEach((b, bi) => {
      b.ph += dt; b.rest = Math.max(0, b.rest - dt);
      if (b.tgt && !items.includes(b.tgt)) b.tgt = null;
      if (!b.tgt && b.rest <= 0) {
        let best = null, bd = 1e9;
        for (const it of items) {
          if (it.kind !== 'drop' || it.bee || it.suck || it.y < combBottom() || it.y > spoon.y - 50) continue;
          const d = Math.hypot(it.x - b.x, it.y - b.y);
          if (d < bd) { bd = d; best = it; }
        }
        if (best) { b.tgt = best; best.bee = b; }
      }
      let tx, ty, v = sp;
      if (b.tgt) { tx = b.tgt.x; ty = b.tgt.y + b.tgt.vy * 0.12; }
      else { tx = clamp(spoon.x + Math.sin(b.ph * 0.7 + bi * 2.1) * W * 0.25, 20, W - 20); ty = H * 0.45 + Math.sin(b.ph * 1.3 + bi) * 30; v = sp * 0.5; }
      const dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy) || 1, step = Math.min(d, v * dt);
      b.x += dx / d * step; b.y += dy / d * step;
      if (Math.abs(dx) > 2) b.dir = dx < 0 ? -1 : 1;
      if (b.tgt && Math.hypot(b.tgt.x - b.x, b.tgt.y - b.y) < 14 * G + 6) beeCatch(b, b.tgt);
    });
  }
  function beeCatch(b, it) {
    const i = items.indexOf(it);
    if (i >= 0) items.splice(i, 1);
    b.tgt = null; b.rest = BEE_REST;
    tally.beeDrops++;
    splat(it.x, it.y, '#b05a14', 4);
    if (phase === 'harvest') {
      const mult = combo * (rush > 0 ? RUSH_MULT : 1);
      floatText(it.x, it.y - 10, '+' + fmtAdd(it.kg) + (mult > 1 ? ' ×' + fmtMult(mult) : ''), '#ffe27a');
      addKg(it.kg * mult);
    } else if (phase === 'boss') {
      fightKg(it.kg, it.x, it.y);
      if (boss && (boss.mode === 'fight' || boss.mode === 'dash')) globs.push({ x: b.x, y: b.y, vx: 0, vy: -760, dmg: THICK[upg.thick], r: 6 * G * (1 + 0.12 * upg.thick), lv: upg.thick });
    }
  }

  // ---------- events between bosses: honey flow and bee swarm ----------''')

# ---------- boss flow ----------
rep('    ally = null;\n    spawnT = 1.4;\n    sfx.bossIn();', '    ally = null; storageWarned = false;\n    spawnT = 1.4;\n    sfx.bossIn();')
rep("    if (b.mode === 'dash') { updateDash(dt); return; }", "    if (b.mode === 'dash') { updateDash(dt * (smokeT > 0 ? SMOKE_SLOW : 1)); return; }")
rep("      b.pushup -= dt; b.repT -= dt;", "      const psm = smokeT > 0 ? SMOKE_SLOW : 1;\n      b.pushup -= dt * psm; b.repT -= dt * psm;")
between('  function finishBoss() {', '  // ---------- Colonex as an ally ----------', r'''  function finishBoss() {
    const wasEndless = boss && boss.endless;
    boss = null;
    if (wasEndless) { endlessRound++; endlessNext += STAGE_KG; openShed(); return; }
    bossIdx++;
    if (bossIdx >= BOSS_COUNT) { phase = 'done'; win(); return; }
    openShed();
  }

''')

# ---------- Colonex upgrades ----------
rep("    if (!ally) ally = { t: 0, shootT: 2.2, sayT: 1.2, say: null };", "    if (!ally) ally = { t: 0, shootT: 2.2, sayT: allyQueue ? 0.5 : 1.2, say: null };")
rep("""      ally.shootT = rnd(2.8, 3.8);
      proj.push(P({ k: 'allyFee', harmless: true, dmg: 0, x: ally.x + 16, y: ally.y - 20, text: pick(ALLY_FEES), r: 12 }));""",
    """      const L = ALLY_LV[upg.colonex];
      ally.shootT = rnd(L.lo, L.hi);
      proj.push(P({ k: 'allyFee', harmless: true, dmg: L.dmg, x: ally.x + 16, y: ally.y - 20, text: feeText(pick(ALLY_FEES), L.fee), r: 12 }));""")
rep("      const line = r < 0.22 ? '@' + boss.def.tag + ' vc?'", "      const line = allyQueue ? allyQueue : r < 0.22 ? '@' + boss.def.tag + ' vc?'")
rep("      ally.say = { text: line, t: Math.max(5, lineDur(line) * 0.75) };", "      allyQueue = null;\n      ally.say = { text: line, t: Math.max(5, lineDur(line) * 0.75) };")

# ---------- attack density and sizes ----------
rep("  const fallers = (n, make, gap) => { for (let i = 0; i < n; i++) {", "  const cnt = n => Math.max(1, Math.round(n * GT));\n  const fallers = (n, make, gap) => { n = cnt(n); for (let i = 0; i < n; i++) {")
rep("    for (let x = 22; x < W - 10; x += 42) {", "    for (let x = 22; x < W - 10; x += 42 * G) {")
rep("      for (let i = 0; i < 5; i++) {\n        const x = i === 0 ? clamp(spoon.x, 20, W - 20) : W * rnd(0.08, 0.92);", "      for (let i = 0, n = cnt(5); i < n; i++) {\n        const x = i === 0 ? clamp(spoon.x, 20, W - 20) : W * rnd(0.08, 0.92);")
rep("      for (let i = 0; i < 6; i++) {\n        const kind = pick(Object.keys(SNACKS));", "      for (let i = 0, n = cnt(6); i < n; i++) {\n        const kind = pick(Object.keys(SNACKS));")
rep("      for (let i = 0; i < 4; i++) {\n        proj.push(P(Object.assign({ k: 'block'", "      for (let i = 0, n = cnt(4); i < n; i++) {\n        proj.push(P(Object.assign({ k: 'block'")
rep("  const P = o => Object.assign(", "  const CARD = { notify: 1, fee: 1, call: 1, job: 1, gif: 1, cell: 1, eq: 1, tag: 1, allyFee: 1, deen: 1 };\n  const ps = p => CARD[p.k] ? GT : G; // jokes on cards shrink less, so they stay readable\n  const P = o => Object.assign(")

# ---------- projectiles ----------
rep("  function updateProj(dt) {\n", "  function updateProj(rdt) {\n    const sm = smokeT > 0 ? SMOKE_SLOW : 1, dt = rdt * sm;\n")
rep("        p.x += dx / d * 420 * dt; p.y += dy / d * 420 * dt; p.rot += 8 * dt;", "        p.x += dx / d * 420 * rdt; p.y += dy / d * 420 * rdt; p.rot += 8 * rdt;")
rep("          damageBoss(3);", "          damageBoss(p.dmg);")
rep("half = k === 'rope' ? 24 : 14;", "half = (k === 'rope' ? 24 : 14) * G;")
rep("w: 150, life: 8", "w: 150 * G, life: 8", 2)
rep("w: 130, life: 6", "w: 130 * G, life: 6")
rep("        const hit = Math.hypot((p.x - spoon.x) * .8, p.y - spoon.y) < S * 0.45 + p.r * 0.6;", "        const hit = Math.hypot((p.x - spoon.x) * .8, p.y - spoon.y) < S * 0.45 + p.r * ps(p) * 0.6;")

# ---------- update ----------
rep("    spoon.slow = Math.max(0, spoon.slow - dt);\n", "    spoon.slow = Math.max(0, spoon.slow - dt);\n    updatePowers(dt);\n", 1)
rep("if (spawnT <= 0) { spawnHarvest(); spawnT = 0.6 * rnd(0.7, 1.3); }", "if (spawnT <= 0) { spawnHarvest(); spawnT = 0.6 * rnd(0.7, 1.3) / G; }")
rep("if (spawnT <= 0) { spawnBossHoney(); spawnT = rnd(0.42, 0.62); }", "if (spawnT <= 0) { spawnBossHoney(); spawnT = rnd(0.42, 0.62) / G; }")
rep("""    for (let i = arr.length - 1; i >= 0; i--) {
      const it = arr[i];
      it.y += it.vy * dt;
      if (it.kind === 'bad') {
        it.phase += dt * (it.f.type === 'toxin' ? 5 : 3);""", """    const sm = smokeT > 0 ? SMOKE_SLOW : 1, qR = W * 0.25;
    for (let i = arr.length - 1; i >= 0; i--) {
      const it = arr[i];
      if (it.suck) {
        it.suck.t += dt;
        const e = ease(Math.min(1, it.suck.t / 0.5));
        it.x = it.suck.x0 + (spoon.x - it.suck.x0) * e; it.y = it.suck.y0 + (spoon.y - 8 - it.suck.y0) * e;
        if (it.suck.t >= 0.5) { arr.splice(i, 1); eat(it); if (state !== 'play' || items !== arr) break; }
        continue;
      }
      const bad = it.kind === 'bad';
      it.y += it.vy * dt * (bad ? sm : 1);
      if (!bad && queenT > 0) {
        const qx = spoon.x - it.x, qy = spoon.y - 10 - it.y, qd = Math.hypot(qx, qy);
        if (qd < qR && qd > 1) { const st = Math.min(qd, 700 * G * dt); it.x += qx / qd * st; it.y += qy / qd * st; }
      }
      if (bad) {
        it.phase += dt * sm * (it.f.type === 'toxin' ? 5 : 3);""")
rep("""      const hit = it.kind === 'bad'
        ? Math.hypot((it.x - spoon.x) * .8, it.y - spoon.y) < S * 0.45 + it.r * 0.6
        : dx < catchW * 0.5 + it.r * 0.6 && dy > -catchH * 0.6 - it.r && dy < catchH * 0.4;""", """      const ir = it.r * G;
      const hit = it.kind === 'bad'
        ? Math.hypot((it.x - spoon.x) * .8, it.y - spoon.y) < S * 0.45 + ir * 0.6
        : dx < catchW * 0.5 + ir * 0.6 && dy > -catchH * 0.6 - ir && dy < catchH * 0.4;""")
rep("    updateEvents(dt); if (state !== 'play') return;\n", "    updateEvents(dt); if (state !== 'play') return;\n    updateBees(dt); if (state !== 'play') return;\n")

# ---------- drawing ----------
rep("    const fs = o.small ? 15 : 19, lh = fs + 5, discord = !!o.discord;", "    const fs = o.small ? Math.round(clamp(15 * G, 12, 15)) : Math.round(clamp(19 * G, 14, 19)), lh = fs + 5, discord = !!o.discord;")
rep("maxW: narrow ? W * 0.86 : Math.min(360, W * 0.5)", "maxW: narrow ? W * 0.82 : Math.min(360, W * 0.5)")
rep("ctx.fillRect(p.x - 24, top, 48, H - top);", "ctx.fillRect(p.x - 24 * G, top, 48 * G, H - top);")
rep("ctx.strokeRect(p.x - 24, top, 48, H - top);", "ctx.strokeRect(p.x - 24 * G, top, 48 * G, H - top);")
rep("path(); ctx.lineWidth = 30; ctx.strokeStyle = '#120c08'; ctx.stroke();", "path(); ctx.lineWidth = 30 * G; ctx.strokeStyle = '#120c08'; ctx.stroke();")
rep("path(); ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.stroke();", "path(); ctx.lineWidth = 8 * G; ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.stroke();")
rep("ctx.fillStyle = 'rgba(155,231,255,.35)'; ctx.fillRect(p.x - 12, top, 24, H - top);", "ctx.fillStyle = 'rgba(155,231,255,.35)'; ctx.fillRect(p.x - 12 * G, top, 24 * G, H - top);")
rep("ctx.fillStyle = '#ffffff'; ctx.fillRect(p.x - 3, top, 6, H - top);", "ctx.fillStyle = '#ffffff'; ctx.fillRect(p.x - 3 * G, top, 6 * G, H - top);")
rep("circle(p.x, spoon.y, 36); ctx.stroke(); ctx.setLineDash([]);", "circle(p.x, spoon.y, 36 * G); ctx.stroke(); ctx.setLineDash([]);")
between("    if (label) {\n      ctx.font = '900 8px", "  function drawGear(r) {", r'''    if (label) {
      const lb = clamp(0.95 / bossK(), 1, 1.4), fz = 8 * lb; // keep the meme readable when the boss is drawn small
      ctx.font = `900 ${fz}px "Instrument Sans", sans-serif`;
      const bw = Math.max(ctx.measureText('AN IQ').width, ctx.measureText('TOO HIGH?').width) + 10 * lb, bh = 22 * lb, top = -30 * s - bh;
      roundRect(-bw / 2, top, bw, bh, 4); ctx.fillStyle = 'rgba(10,10,14,.85)'; ctx.fill();
      txt('AN IQ', 0, top + 7 * lb, fz, '#ffffff', 900); txt('TOO HIGH?', 0, top + 16 * lb, fz, '#f9c623', 900);
    }
  }
''')
rep("drawCrow(t, 1.3, false); ctx.restore(); return;", "drawCrow(t, 1.3 * G, false); ctx.restore(); return;")
rep("""      const g = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.r * 2.2);
      g.addColorStop(0, 'rgba(226,32,48,.28)'); g.addColorStop(1, 'rgba(226,32,48,0)');
      ctx.fillStyle = g; circle(p.x, p.y, p.r * 2.2); ctx.fill();""", """      const hr = p.r * 2.2 * ps(p);
      const g = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, hr);
      g.addColorStop(0, 'rgba(226,32,48,.28)'); g.addColorStop(1, 'rgba(226,32,48,0)');
      ctx.fillStyle = g; circle(p.x, p.y, hr); ctx.fill();""")
rep("    ctx.save(); ctx.translate(p.x, p.y);\n    switch (p.k) {\n      case 'notify':", "    ctx.save(); ctx.translate(p.x, p.y);\n    const sc = ps(p); ctx.scale(sc, sc);\n    switch (p.k) {\n      case 'notify':")
rep("    ctx.save(); ctx.translate(it.x, it.y);\n    if (f.type === 'bottle')", "    ctx.save(); ctx.translate(it.x, it.y); ctx.scale(G, G);\n    if (f.type === 'bottle')")
rep("    if (!it.carried) badMark(it.x, it.y, r, t, it.isNew);", "    if (!it.carried) badMark(it.x, it.y, r * G, t, it.isNew);")
rep("""    for (const it of items) {
      if (it.kind === 'bad') continue;
      if (it.kind !== 'lab') goodGlow(it.x, it.y, it.r);""", """    for (const it of items) {
      if (it.kind === 'bad') continue;
      ctx.save(); ctx.translate(it.x, it.y); ctx.scale(G, G); ctx.translate(-it.x, -it.y);
      if (it.kind !== 'lab') goodGlow(it.x, it.y, it.r);""")
rep("      else if (it.kind === 'shilajit') drawShilajit(it, t);\n    }", "      else if (it.kind === 'shilajit') drawShilajit(it, t);\n      ctx.restore();\n    }")
rep("    if (spoon) drawSpoon(t);\n", "    if (spoon) drawSpoon(t);\n    drawWorkerBees(t);\n    drawPowerFx(t);\n")
rep("    for (const p of proj) if (p.k === 'smoke') drawSmoke(p);\n", "    for (const p of proj) if (p.k === 'smoke') drawSmoke(p);\n    drawSmokeFx(t);\n")
rep("      else ctx.font = '700 16px Gluten, cursive';", "      else ctx.font = `700 ${Math.round(clamp(16 * GT, 13, 16))}px Gluten, cursive`;")
rep("      ctx.fillStyle = '#e08e0b'; ctx.fill();\n      ctx.restore();", "      ctx.fillStyle = GLOB_COL[g.lv || 0]; ctx.fill();\n      ctx.restore();")
rep("    const k = bossK() * 0.55;", "    const k = Math.max(0.42, bossK() * 0.55);", 2)
rep("  function drawSpoon(t) {", r'''  function drawWorkerBees(t) {
    for (const b of bees) {
      ctx.save(); ctx.translate(b.x, b.y); ctx.scale(1.5 * G, 1.5 * G);
      drawBee(0, 0, t, b.ph, b.dir);
      ctx.restore();
    }
  }
  function drawPowerFx(t) {
    if (!spoon) return;
    if (queenT > 0) {
      const R = W * 0.25, a = Math.min(1, queenT * 2);
      ctx.globalAlpha = a;
      ctx.setLineDash([6, 8]); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,211,107,.5)'; circle(spoon.x, spoon.y - 10, R); ctx.stroke(); ctx.setLineDash([]);
      const qa = t * 3, qx = spoon.x + Math.cos(qa) * spoonSize() * 0.9, qy = spoon.y - 34 + Math.sin(qa) * 14;
      ctx.save(); ctx.translate(qx, qy); ctx.scale(1.8 * G, 1.8 * G);
      drawBee(0, 0, t, 0, -Math.sin(qa) < 0 ? -1 : 1);
      ctx.fillStyle = '#ffd36b'; ctx.beginPath(); ctx.moveTo(-5, -7); ctx.lineTo(-4.5, -12); ctx.lineTo(-2, -9); ctx.lineTo(0, -13); ctx.lineTo(2, -9); ctx.lineTo(4.5, -12); ctx.lineTo(5, -7); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    if (extractT > 0) {
      const a = Math.min(1, extractT * 3), x = spoon.x, y = spoon.y - spoonSize() * 1.3;
      ctx.globalAlpha = a;
      for (const it of items) if (it.suck) { ctx.strokeStyle = 'rgba(255,211,107,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(it.suck.x0, it.suck.y0); ctx.lineTo(it.x, it.y); ctx.stroke(); }
      ctx.save(); ctx.translate(x, y); ctx.scale(G, G);
      circle(0, 0, 22); ctx.fillStyle = '#c9ced6'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#6a6e76'; ctx.stroke();
      ctx.rotate(t * 20); ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 4); ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(18, 0); ctx.stroke(); }
      ctx.fillStyle = '#f2a516'; circle(0, 0, 5); ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }
  function drawSmokeFx(t) {
    if (smokeT <= 0) return;
    const a = Math.min(1, smokeT * 2, (POWERS.smoker.dur - smokeT) * 4 + 0.2), top = combBottom();
    ctx.fillStyle = `rgba(214,208,196,${0.10 * a})`; ctx.fillRect(0, top, W, H - top);
    ctx.fillStyle = `rgba(232,226,214,${0.16 * a})`;
    for (let i = 0; i < 7; i++) {
      const x = ((i * 173 + t * 25) % (W + 240)) - 120, y = top + 40 + (i * 97) % Math.max(1, (H - top) * 0.8);
      circle(x, y, (60 + (i % 3) * 25) * G); ctx.fill();
    }
  }
  function drawSpoon(t) {''')

# ---------- shed flow ----------
rep("  function hideOverlays() { ['startScreen', 'overScreen', 'pauseScreen', 'soldScreen'].forEach(id => $(id).hidden = true); }",
    "  function hideOverlays() { ['startScreen', 'overScreen', 'pauseScreen', 'soldScreen', 'shedScreen'].forEach(id => $(id).hidden = true); }")
rep("  function togglePause() {", r'''  function itemInfo(s) {
    const lv = upg[s.id], maxed = lv >= s.max, locked = !!(s.unlock && !s.unlock());
    return { lv, maxed, locked, cost: maxed ? 0 : s.cost[lv] };
  }
  function grandadSay(text) {
    $('gLine').textContent = text;
    const g = $('gBubble'); g.classList.remove('pop'); void g.offsetWidth; g.classList.add('pop');
  }
  function renderShed() {
    $('shedKg').textContent = fmtKg(score);
    $('shedNext').textContent = '· next boss at ' + (endless ? endlessNext : thresholdFor(bossIdx)) + ' kg';
    for (const el of $('shop').children) {
      const s = SHOP.find(x => x.id === el.dataset.id), inf = itemInfo(s);
      el.querySelector('.pips').textContent = s.max > 1
        ? Array.from({ length: s.max }, (_, i) => i < inf.lv ? '●' : '○').join(' ')
        : inf.lv ? 'owned' : touchUI ? 'power' : 'power · key ' + s.key;
      el.querySelector('.pr').textContent = inf.locked ? 'Locked' : inf.maxed ? (s.max > 1 ? 'Max' : 'Owned') : inf.cost + ' kg';
      el.className = 'tile' + (s.id === shedSel ? ' sel' : '') + (inf.locked ? ' locked' : '') + (inf.maxed ? ' done' : '') + (!inf.locked && !inf.maxed && score < inf.cost ? ' cant' : '');
    }
  }
  function selectItem(id) {
    shedSel = id;
    const s = SHOP.find(x => x.id === id), inf = itemInfo(s);
    $('dName').textContent = s.name + (s.max > 1 ? '  ·  level ' + inf.lv + ' of ' + s.max : '');
    $('dDesc').textContent = s.desc + (s.key ? (touchUI ? ' Tap its button on the right to use it.' : ' Click anywhere or press ' + s.key + ' to use it.') : '');
    $('dNow').textContent = s.max > 1 ? 'Now: ' + s.levels[inf.lv] : inf.lv ? 'You own this.' : '';
    $('dNext').textContent = inf.locked ? '' : s.max > 1 ? (inf.maxed ? 'Fully upgraded.' : 'Next: ' + s.levels[inf.lv + 1]) : '';
    const btn = $('buyBtn');
    if (inf.locked) { btn.textContent = s.lockText; btn.disabled = true; }
    else if (inf.maxed) { btn.textContent = s.max > 1 ? 'Max level' : 'Owned'; btn.disabled = true; }
    else if (score < inf.cost) { btn.textContent = 'Need ' + inf.cost + ' kg'; btn.disabled = true; }
    else { btn.textContent = 'Buy for ' + inf.cost + ' kg'; btn.disabled = false; }
    renderShed();
  }
  function cancelBuy() { shedPending = null; $('confirm').hidden = true; $('buyBtn').hidden = false; }
  function purchase(id) {
    const s = SHOP.find(x => x.id === id), inf = itemInfo(s);
    if (inf.locked || inf.maxed || score < inf.cost) return;
    score -= inf.cost; tally.spent += inf.cost; upg[id]++;
    if (POWERS[id]) { pcd[id] = 0; readyAt[id] = elapsed; }
    grandadSay(GRANDAD_BUY[id]);
    if (id === 'colonex') {
      const line = upg.colonex === 1
        ? (endless || bossIdx > 3 ? 'I spoke with the Shilajit Coach and I think I should start charging more' : 'loksd corporation has raised its rates')
        : 'loksd corporation is a premium product';
      allyQueue = line; hear('Colonex', line);
      $('cmsgText').textContent = line; $('colonexMsg').hidden = false;
    }
    sfx.buy();
    selectItem(id);
    updateHud();
  }
  function openShed() {
    state = 'shed'; phase = 'harvest'; spawnT = 0.5; ev = null; evT = rnd(12, 16);
    proj = []; globs = []; sticky = [];
    cancelBuy(); $('colonexMsg').hidden = true;
    grandadSay(pick(GRANDAD_HI));
    selectItem(shedSel || SHOP[0].id);
    hideOverlays(); $('shedScreen').hidden = false;
    updateHud();
    $('shedDone').focus({ preventScroll: true });
    $('shedScreen').querySelector('.card').scrollTop = 0;
  }
  function closeShed() {
    if (state !== 'shed') return;
    $('shedScreen').hidden = true; state = 'play'; last = performance.now();
    if (endless) floatText(W / 2, H * 0.44, 'Round ' + (endlessRound + 1), '#cfe8ff', true); else seasonBanner();
    updateHud();
  }
  function togglePause() {''')

# tally
rep("""    const rows = [['Honeydew drops', tally.drops], ['Ryczkowski jars', tally.jars], ['Boxes of honey', tally.boxes], ["Grandad's comb", tally.comb], ['Lab tests run', tally.labs], ['Bosses beaten', tally.bosses]]""",
    """    const rows = [['Honeydew drops', tally.drops], ['Caught by your bees', tally.beeDrops], ['Ryczkowski jars', tally.jars], ['Boxes of honey', tally.boxes], ["Grandad's comb", tally.comb], ['Lab tests run', tally.labs], ['Bosses beaten', tally.bosses]]""")
rep("""    if (tally.billed) out +=""", """    if (tally.spent) out += `<div><span>Spent in Grandad's Shed</span><b>${tally.spent} kg</b></div>`;
    if (tally.billed) out +=""")

# listeners
rep("  $('resumeBtn').addEventListener('click', togglePause);\n", r'''  $('resumeBtn').addEventListener('click', togglePause);
  SHOP.forEach(s => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'tile'; b.dataset.id = s.id;
    b.innerHTML = `<span class="nm">${esc(s.name)}</span><span class="pips"></span><span class="pr"></span>`;
    b.addEventListener('mouseenter', () => { if (!shedPending) selectItem(s.id); });
    b.addEventListener('focus', () => { if (!shedPending) selectItem(s.id); });
    b.addEventListener('click', () => {
      cancelBuy(); selectItem(s.id);
      const inf = itemInfo(s);
      if (!inf.locked && !inf.maxed && score < inf.cost) grandadSay(GRANDAD_BROKE);
    });
    $('shop').appendChild(b);
  });
  $('buyBtn').addEventListener('click', () => {
    const s = SHOP.find(x => x.id === shedSel), inf = itemInfo(s);
    if (inf.locked || inf.maxed || score < inf.cost) return;
    shedPending = s.id;
    $('confirmText').textContent = 'Buy ' + s.name + (s.max > 1 ? ' (level ' + (inf.lv + 1) + ')' : '') + ' for ' + inf.cost + ' kg?';
    $('buyBtn').hidden = true; $('confirm').hidden = false; $('confirmYes').focus({ preventScroll: true });
  });
  $('confirmYes').addEventListener('click', () => { const id = shedPending; cancelBuy(); if (id) purchase(id); });
  $('confirmNo').addEventListener('click', cancelBuy);
  $('shedDone').addEventListener('click', closeShed);
  PKEYS.forEach(k => {
    const el = $('pw-' + k);
    el.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); firePower(k); });
    el.addEventListener('click', e => e.preventDefault());
  });
''')

# debug
rep("      attack(name) { if (boss) ATTACKS[name](boss); },\n", """      attack(name) { if (boss) ATTACKS[name](boss); },
      shed() { openShed(); },
      give(n) { score += n; },
      setUpg(id, n) { upg[id] = n; },
      power(k) { return firePower(k); },
""")
rep("billed: tally.billed }),", "billed: tally.billed, upg: upg && { ...upg }, pcd: pcd && { ...pcd }, bees: bees.length, beeDrops: tally.beeDrops, smokeT: +smokeT.toFixed(1), queenT: +queenT.toFixed(1), spent: tally.spent }),")

open(dst, 'w').write(s)
print('ok', len(s))
