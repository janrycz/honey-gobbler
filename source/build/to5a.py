import sys
p = sys.argv[1]
s = open(p).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:100]); s = s.replace(old, new)
def between(start, end, new):
    global s
    a = s.index(start); b = s.index(end, a); s = s[:a] + new + s[b:]

# ================= HTML / CSS =================
rep('Honey Gobbler IV', 'Honey Gobbler V', 3)
rep('<span id="next">April · boss at 150 kg</span>', '<span id="next">March · boss at 150 kg</span>')
rep('.roster { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; }', '.roster { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }')
rep('  .roster span { font-size: .58rem; }', '  .roster span { font-size: .56rem; } .roster span b { font-size: .8rem; }')
rep('.mk.live, .stamp, .pbtn.ready, .gbubble.pop { animation: none; }', '.mk.live, .stamp, .pbtn.ready, .gbubble.pop, .btn.cta { animation: none; }')
rep('@media (max-width: 520px) {\n  .shop {', r'''.btn.cta { font-size: 1.45rem; padding: 15px 28px 12px; animation: cta 1.4s ease-in-out infinite alternate; }
@keyframes cta { to { box-shadow: inset 0 -4px 0 var(--honey-deep), 0 0 0 6px rgba(242, 165, 22, .25), 0 0 26px rgba(242, 165, 22, .55); } }
.achlist { display: flex; flex-direction: column; gap: 8px; text-align: left; }
.ach { display: grid; grid-template-columns: 34px 1fr; gap: 10px; align-items: center; background: color-mix(in srgb, var(--ink) 6%, transparent); border-radius: 12px; padding: 9px 12px; }
.ach .ico { width: 34px; height: 36px; display: grid; place-items: center; clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%); background: #cdbb92; color: var(--wax); font: 900 .95rem var(--display); }
.ach.done .ico { background: var(--honey); color: var(--ink); }
.ach h4 { margin: 0; font: 700 .9rem var(--body); color: var(--ink); }
.ach p { font-size: .8rem !important; color: color-mix(in srgb, var(--ink) 70%, transparent); }
.ach .bar, .achtotal .bar { height: 6px; border-radius: 999px; background: color-mix(in srgb, var(--ink) 12%, transparent); overflow: hidden; margin-top: 5px; }
.ach .bar i, .achtotal .bar i { display: block; height: 100%; background: linear-gradient(90deg, var(--honey-deep), var(--honey)); border-radius: inherit; }
.ach .num { float: right; font: 700 .72rem var(--body); color: var(--honey-deep); margin-left: 8px; }
.achtotal { text-align: left; font: 700 .86rem var(--body); }
.achtotal .bar { height: 10px; }
.toast { position: absolute; left: 50%; top: 12px; transform: translateX(-50%); max-width: calc(100% - 32px); background: var(--ink); color: var(--wax); border: 2px solid var(--honey); border-radius: 999px; padding: 8px 16px 7px; font: 600 .85rem var(--body); pointer-events: none; transition: opacity .35s, transform .35s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.toast b { color: var(--honey); }
.toast.hide { opacity: 0; transform: translate(-50%, -10px); }
@media (max-width: 520px) {
  .shop {''')

# power buttons: smoker 1, honey magnet 2, extractor 3, queen bee 4
between('    <div class="powers" id="powers">', '    <div class="overlay" id="startScreen">', '''    <div class="powers" id="powers">
      <button class="pbtn" id="pw-smoker" type="button" hidden aria-label="Smoker"><i><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="8" y="14" width="13" height="15" rx="2" fill="#c9ced6"/><path d="M8 14 L14.5 8 L21 14 Z" fill="#9aa0a8"/><rect x="13" y="5" width="3" height="4" fill="#9aa0a8"/><rect x="21" y="17" width="7" height="9" rx="1.5" fill="#8a5a2b"/><circle cx="11" cy="4.5" r="3" fill="#e8e2d4" opacity=".85"/><circle cx="6.5" cy="3" r="2.2" fill="#e8e2d4" opacity=".6"/></svg></i><kbd>1</kbd></button>
      <button class="pbtn" id="pw-magnet" type="button" hidden aria-label="Honey magnet"><i><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 5v11a9 9 0 0 0 18 0V5h-6v11a3 3 0 0 1-6 0V5z" fill="#e2492f"/><rect x="7" y="5" width="6" height="4" fill="#d9d9de"/><rect x="19" y="5" width="6" height="4" fill="#d9d9de"/><path d="M16 24c-2 3-2.4 5 0 5s2-2 0-5z" fill="#f2a516"/></svg></i><kbd>2</kbd></button>
      <button class="pbtn" id="pw-extractor" type="button" hidden aria-label="Extractor"><i><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="18" r="10" fill="#c9ced6" stroke="#6a6e76" stroke-width="2"/><path d="M16 11v14M9 18h14M11 13l10 10M21 13 11 23" stroke="#6a6e76" stroke-width="1.6"/><circle cx="16" cy="18" r="2.6" fill="#f2a516"/><path d="M16 8V4h8" stroke="#8a5a2b" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg></i><kbd>3</kbd></button>
      <button class="pbtn" id="pw-queen" type="button" hidden aria-label="Queen bee"><i><svg viewBox="0 0 32 32" aria-hidden="true"><ellipse cx="15" cy="11" rx="7" ry="3.2" fill="rgba(255,255,255,.75)" transform="rotate(-20 15 11)"/><ellipse cx="20" cy="11" rx="6" ry="2.8" fill="rgba(255,255,255,.6)" transform="rotate(15 20 11)"/><ellipse cx="11" cy="19" rx="9" ry="4.2" fill="#f2b81a"/><path d="M7 15.4v7.2M11 15v8M15 15.4v7.2" stroke="#7a4a0c" stroke-width="1.8"/><ellipse cx="22" cy="18" rx="4" ry="3.6" fill="#c8901a"/><circle cx="27" cy="17" r="2.6" fill="#a8700f"/><path d="M24.6 13.6 25.2 11l1.2 1.6.8-2 .8 2 1.2-1.6.4 2.6z" fill="#ffd36b"/></svg></i><kbd>4</kbd></button>
    </div>
    <div class="toast hide" id="toast" hidden></div>

''')

rep("<p>Grandad's hives are dripping with raw honeydew from the Subcarpathian hills. The season runs April to September. Every 150 kg you harvest, someone turns up to ruin it. Beat all six and you sell out.</p>",
    "<p>Grandad's hives are dripping with raw honeydew from the Subcarpathian hills. The season runs March to September. Every 150 kg you harvest, someone turns up to ruin it. Beat all seven and you sell out.</p>")
rep('<span><b>150</b>Apr</span><span><b>300</b>May</span><span><b>450</b>Jun</span><span><b>600</b>Jul</span><span><b>750</b>Aug</span><span><b>900</b>Sep</span>',
    '<span><b>150</b>Mar</span><span><b>300</b>Apr</span><span><b>450</b>May</span><span><b>600</b>Jun</span><span><b>750</b>Jul</span><span><b>900</b>Aug</span><span><b>1050</b>Sep</span>')
rep('''        <button class="btn" id="startBtn" type="button">Start the harvest</button>
''', '''        <button class="btn" id="startBtn" type="button">Start the harvest</button>
        <div class="actions"><button class="btn ghost small" data-ach type="button">Achievements <span class="achcount"></span></button></div>
''')
rep('''        <button class="btn" id="resumeBtn" type="button">Back to the hives</button>
      </div>''', '''        <button class="btn" id="resumeBtn" type="button">Back to the hives</button>
        <div class="actions"><button class="btn ghost small" data-ach type="button">Achievements <span class="achcount"></span></button></div>
      </div>''')
rep('''        <div class="wallet"><span>You have</span><b id="shedKg">0 kg</b><span id="shedNext"></span></div>
        <p class="hint">Pay with honey. Every kilo you spend pushes the next boss further away.</p>''',
    '''        <div class="wallet"><span>Savings</span><b id="shedSav">0 kg</b><span id="shedKg"></span><span id="shedNext"></span></div>
        <p class="hint">Honey you catch in boss fights goes into your savings, and purchases use it first. After that they take from your harvest, which pushes the next boss further away.</p>''')
rep('''        <div class="actions"><button class="btn" id="againBtn" type="button">Try again</button></div>''',
    '''        <div class="actions"><button class="btn" id="againBtn" type="button">Try again</button><button class="btn ghost small" data-ach type="button">Achievements <span class="achcount"></span></button></div>''')
rep('''        <div class="big">900 kg</div>
        <p>That's 750 of our 1.2 kg jars.''', '''        <div class="big">1,050 kg</div>
        <p>That's 875 of our 1.2 kg jars.''')
rep('''        <div class="actions">
          <a class="btn" id="waitBtn" href="https://www.janhoney.com/pages/contact" target="_blank" rel="noopener">Join the waitlist</a>
          <button class="btn ghost" id="endlessBtn" type="button">Keep eating (endless)</button>
        </div>
        <div class="actions"><button class="btn ghost" id="againBtn2" type="button">Harvest again</button></div>''',
    '''        <div class="actions"><button class="btn cta" id="endlessBtn" type="button">Keep eating: endless mode</button></div>
        <p class="hint">The bosses keep coming back, stronger every round. Your upgrades and shed savings carry on.</p>
        <div class="actions">
          <a class="btn" id="waitBtn" href="https://www.janhoney.com/pages/contact" target="_blank" rel="noopener">Join the waitlist</a>
          <button class="btn ghost" id="againBtn2" type="button">Harvest again</button>
        </div>
        <div class="actions"><button class="btn ghost small" data-ach type="button">Achievements <span class="achcount"></span></button></div>''')
rep('''  </main>
</div>''', '''    <div class="overlay" id="achScreen" hidden>
      <div class="card">
        <h2>Achievements</h2>
        <div class="achtotal"><span id="achCount"></span> unlocked<div class="bar"><i id="achTotal"></i></div></div>
        <div class="achlist" id="achList"></div>
        <p class="hint">Saved in this browser.</p>
        <button class="btn" id="achClose" type="button">Close</button>
      </div>
    </div>
  </main>
</div>''')

# ================= tuning and data =================
between('  // ---------- tuning ----------', '  const SEASONS = [', r'''  // ---------- tuning ----------
  const STAGE_KG = 150, BOSS_COUNT = 7, GOAL = STAGE_KG * BOSS_COUNT;
  const thresholdFor = i => STAGE_KG * (i + 1); // 150 ... 1050
  const KG = { jar: 1.2, box: 10, comb: 0.5, shilajit: 1.2, lab: 0 }; // drops carry their own 50-200 g
  const FILL = { drop: .035, jar: .07, box: .12, comb: .05, shilajit: 0, lab: 0 };
  const DMG = { drop: 1, jar: 2, box: 4, comb: 1, shilajit: 2, lab: 0 };
  const RUSH_TIME = 9, RUSH_MULT = 1.5;
  const HEAL = { drop: 0.5, jar: 1, box: 5, comb: 18, shilajit: 3, lab: 0 }; // purity restored by real honey
  const MAX_LV = 10;
  const thickMul = lv => 1 + 0.1 * lv;
  const GLOB_COL = ['#e08e0b', '#c9760a', '#a95c08', '#8a4406'];
  const FEE_MULT = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 10000];
  const allyStats = lv => { const m = 1 - 0.035 * lv; return { dmg: 3 + 0.2 * lv, lo: 2.8 * m, hi: 3.8 * m, fee: FEE_MULT[lv] }; };
  const BEE_COUNT = [0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5];
  const BEE_JAR = [0, 0, 0, 0.10, 0.15, 0.20, 0.25, 0.29, 0.32, 0.36, 0.40]; // chance a bee goes for a nearby jar
  const BEE_BIG = [0, 0, 0, 0, 0, 0, 0.05, 0.075, 0.10, 0.125, 0.15];      // ...or a box or Shilajit jar
  const beeStats = lv => ({ n: BEE_COUNT[lv], speed: 1 + 0.06 * Math.max(0, lv - 1), rest: 1 - 0.05 * Math.max(0, lv - 1), jar: BEE_JAR[lv], big: BEE_BIG[lv] });
  const EXTRACT_GRAB = [0, 4, 5, 6, 7, 8, 10, 12, 15, 20, Infinity];
  // powers start weak at level 1 and recharge faster and hit harder each level
  const PW = {
    smoker: lv => ({ cd: 30 - (lv - 1) * 15 / 9, dur: 3 + (lv - 1) / 3, slow: 0.6 - (lv - 1) * 0.3 / 9 }),
    magnet: lv => ({ cd: 35 - (lv - 1) * 17 / 9, dur: 5 + (lv - 1) * 5 / 9, reach: 0.15 + (lv - 1) * 0.15 / 9 }),
    extractor: lv => ({ cd: 60 - (lv - 1) * 30 / 9, grab: EXTRACT_GRAB[lv] }),
    queen: lv => ({ cd: 45 - (lv - 1) * 20 / 9, charges: lv < 4 ? 1 : lv < 8 ? 2 : 3, dmg: 8 + (lv - 1) * 12 / 9, band: 0.10 + (lv - 1) * 0.08 / 9 }),
  };
  const PKEY = { smoker: '1', magnet: '2', extractor: '3', queen: '4' };
  const PKEYS = ['smoker', 'magnet', 'extractor', 'queen'];
  const BEE_SPEED = 300;
  const G_PER_BEE = 0.6; // a worker bee makes about 1/12 teaspoon of honey in her life
  const CRAZY_PRICE = 300;

''')
rep("  const SEASONS = [\n    { m: 'April',", "  const SEASONS = [\n    { m: 'March', name: 'First flight', col: '#f3e27a', top: '#33280f', mid: '#22170a', glow: 'rgba(240,220,120,.12)', part: 'catkin' },\n    { m: 'April',")

rep("  const EQUATIONS = ['√(1/300)', 'f(x)=x/3+5', '(x+½)²', 'IQ > 9000', 'y=−√x'];\n", r'''  const EQUATIONS = ['√(1/300)', 'f(x)=x/3+5', '(x+½)²', 'IQ > 9000', 'y=−√x'];
  // the Looksmaxxer's stream
  const CHAT_USERS = [['mewking_04', '#7cc4ff'], ['jawline_jeff', '#ff9a8a'], ['tren_twin', '#b6f08a'], ['clipfarmer99', '#ffd36b'], ['monkmode_mo', '#d9a7ff'], ['ascend_or_rot', '#8ae6d6'], ['chadlite_kev', '#ffb36b'], ['rawliver_rob', '#ff7a8a'], ['seedoil_sam', '#c7d36b'], ['canthal_carl', '#9fb4ff'], ['hunter_eyes_h', '#f08ad2'], ['sub5_stan', '#a6e3a1']];
  const CHAT_HATE = ['Worst honey in the universe', 'W ragebait', 'Clipping this', "it's over for spoon guy", 'bro got mogged by a jar', 'sub 5 honey', 'link to the course??', 'just bought the course W', 'raw meat > raw honey', 'seed oils in the honey?', '40k viewers LETS GO', 'first', 'L spoon', 'honey is just bee vomit', 'frame mogged'];
  const CHAT_PRO = ['No the honey is good', 'Best honey in the universe!', 'Shut up', 'Subscribe to jan ryczkowski']; // each one gets the sender banned
  const RATINGS = ['3/10', 'SUB 5', "IT'S OVER", 'MOGGED', '2/10', 'NORMIE'];
  const DONOS = ['$5 DONO: rate my jaw', '$10 DONO: mog him', '$2 DONO: is the honey raw?', '$20 DONO: course link?'];
  const NEEDLES = ['PEPTIDE', 'TRT', 'FIN'];
  // Colonex, on your side
  const ALLY_BOSS_LINES = {
    keeper: 'sus beekeeper pls send lab results to loksd corporation',
    ceo: 'app founder owes loksd corporation 400$ download fee',
    ironfit: 'shilajit coach charges 1k for story post. loksd corporation charges 2k to read it',
    apologist: 'honey apologist pls check ur notes, there is a fee',
    looks: 'looksmaxxer pls stop mewing in vc',
    disprover: 'disprover has been disproved by loksd corporation',
  };
  const ALLY_LINES = ['boss fee', 'honey fee', 'damage fee', 'herp owes loksd corporation 500$', 'loksd corporation has issued a damage fee', 'U are herp', '500$ herp fee', 'this boss owes loksd corporation 4000$', 'stop playing roblox'];
''')

between("  // ---------- Grandad's Shed ----------", "  const COLONEX_RAISE", r'''  // ---------- Grandad's Shed ----------
  // Priced so that most players are still buying a few rounds into endless mode before everything is maxed.
  const COST = [3, 4, 5, 6, 8, 9, 12, 14, 18, 21]; // levels 1-10, scaled by each item's weight below
  const costs = w => COST.map(c => Math.round(c * w));
  const f2 = n => String(Math.round(n * 100) / 100);
  const pct = n => Math.round(n * 100) + '%';
  const SHOP = [
    { id: 'thick', name: 'Thicker honey', cost: costs(1.2), desc: 'The honey you flick at bosses does more damage.',
      lvText: lv => `×${thickMul(lv).toFixed(1)}: drop ${f2(thickMul(lv))}, jar ${f2(2 * thickMul(lv))}, box ${f2(4 * thickMul(lv))} damage` },
    { id: 'bee', name: 'Worker bee', cost: costs(1.3), desc: 'Bees that fly around catching honey for you, mostly drops. From level 3 they start lifting jars, and from level 6 boxes and Shilajit jars too. In boss fights they flick what they catch at the boss.',
      lvText: lv => { if (!lv) return 'No bees'; const b = beeStats(lv), f = Math.round((b.speed - 1) * 100); return `${b.n} bee${b.n > 1 ? 's' : ''}, ${f ? f + '% faster' : 'normal speed'}` + (b.jar ? `, go for jars ${pct(b.jar)} of the time` : '') + (b.big ? `, boxes and Shilajit ${pct(b.big)}` : ''); } },
    { id: 'colonex', name: 'Pay Colonex', cost: costs(1.0), unlock: () => endless || bossIdx >= 2, desc: 'Raise his fees. His invoices hit bosses harder and more often.',
      lvText: lv => { const a = allyStats(lv); return `${f2(a.dmg)} damage per invoice, every ${a.lo.toFixed(1)}–${a.hi.toFixed(1)} s, fees ×${a.fee.toLocaleString('en-GB')}`; } },
    { id: 'smoker', name: 'Smoker', cost: costs(0.9), desc: 'Slows every fake and boss attack for a few seconds.',
      lvText: lv => { if (!lv) return 'Not owned'; const q = PW.smoker(lv); return `Slows them to ${Math.round(q.slow * 100)}% speed for ${q.dur.toFixed(1)} s. Recharges in ${Math.round(q.cd)} s.`; } },
    { id: 'magnet', name: 'Honey magnet', cost: costs(0.9), desc: 'Pulls nearby honey into your spoon for a few seconds.',
      lvText: lv => { if (!lv) return 'Not owned'; const q = PW.magnet(lv); return `Reaches ${Math.round(q.reach * 100)}% of the screen's width for ${q.dur.toFixed(1)} s. Recharges in ${Math.round(q.cd)} s.`; } },
    { id: 'extractor', name: 'Extractor', cost: costs(1.1), desc: 'Sucks honey on screen into your spoon.',
      lvText: lv => { if (!lv) return 'Not owned'; const q = PW.extractor(lv); return `${q.grab === Infinity ? 'Grabs all the honey on screen' : 'Grabs the ' + q.grab + ' nearest bits of honey'}. Recharges in ${Math.round(q.cd)} s.`; } },
    { id: 'queen', name: 'Queen bee', cost: costs(1.3), desc: 'A huge queen bee. In boss fights she charges at the boss. Between bosses she sweeps across the screen, catching honey and smashing fakes in her path.',
      lvText: lv => { if (!lv) return 'Not owned'; const q = PW.queen(lv); return `${q.charges} charge${q.charges > 1 ? 's' : ''} of ${Math.round(q.dmg)} damage. Sweeps a path ${pct(q.band)} of the screen tall. Recharges in ${Math.round(q.cd)} s.`; } },
    { id: 'crazy', name: 'Crazy mode', max: 1, cost: [CRAZY_PRICE], unlock: () => endless && SHOP.every(x => x.id === 'crazy' || upg[x.id] >= x.max),
      desc: 'Endless mode with two bosses at once. Colonex fights with you, unless he is one of the two.',
      lvText: lv => lv ? (crazyOn ? 'On' : 'Off') : 'Not owned' },
  ];
  SHOP.forEach(x => { x.max = x.max || MAX_LV; x.key = PKEY[x.id]; });
''')
rep("""  const GRANDAD_BUY = { thick: 'Leave it in the frame longer. Thicker honey.', bee: "Take one of mine. She's a hard worker.", colonex: 'Who is this boy and why does he keep sending me invoices?', smoker: "Don't point it at your own face.", queen: 'Be gentle with her.', extractor: 'Mind your fingers.' };""",
    """  const GRANDAD_BUY = { thick: 'Leave it in the frame longer. Thicker honey.', bee: "Take one of mine. She's a hard worker.", colonex: 'Who is this boy and why does he keep sending me invoices?', smoker: "Don't point it at your own face.", magnet: 'It pulls honey. And my spare keys.', extractor: 'Mind your fingers.', queen: 'Be gentle with her.', crazy: "Two at once? You're crazier than the bees." };""")

# ================= bosses =================
between('  // ---------- bosses ----------', '  let W = 0, H = 0,', r'''  // ---------- bosses ----------
  const BOSSES = [
    {
      key: 'keeper', name: 'The Sus Beekeeper', tag: 'Sus Beekeeper', sub: 'Feeds his bees syrup during the flow. Calls it raw.', hp: 130,
      intro: "It's raw. Trust me bro.",
      lines: ["It's raw. Trust me bro.", 'Syrup during the flow? Never heard of it.', 'Filtered? Define filtered.', 'Heated? Only a bit. Like 90 degrees.', "Lab test? I don't know her.", '46% of my jars are sus. The other 54% are also sus.', "It's honey. Technically.", "Mixed with imports? It's called fusion."],
      p2line: 'Fine. Full syrup. No more pretending.', p2attacks: ['syrupStorm'],
      defeat: "Fine. It's 46% honey.",
      lose: 'The Sus Beekeeper sold you syrup and called it raw.',
      attacks: ['toss', 'susRain', 'smoke', 'feeder'],
    },
    {
      key: 'colonex', name: 'Colonex', tag: 'Colonex', sub: 'Founder of Loksd Corporation. Loksd Corporation does not exist.', hp: 170, mono: true, joins: true,
      intro: 'come work for loksd corporation',
      lines: ['come work for loksd corporation', 'loksd corporation can afford', 'loksd corporation board of directors will consider your request', 'loksd corporation does not require your financial assistance', 'you have been put on the blacklist of loksd corporation', '@Ja Ja Binka vc?', '@Ja Ja Binka vc?', 'vc anyone', 'i have j*b at my dads company', 'roblox is stupid game', 'stop playing roblox', 'you wanna play the stupid game for idiots in 20 minutes', '100$ fee for jan', '50$ unnecessary question fee'],
      p2line: 'loksd corporation has doubled all fees', p2attacks: ['doubleFees'],
      defeat: 'loksd corporation will remember this',
      defeat2: 'loksd corporation would like to sponsor you',
      lose: 'You have been put on the blacklist of Loksd Corporation.',
      attacks: ['fees', 'vc', 'factorio', 'jobs', 'crow', 'ski', 'gifs', 'cnc', 'roblox', 'vc'],
    },
    {
      key: 'ceo', name: 'The App Founder', tag: 'App Founder', sub: 'Download his app. Track your honey. Never say the other app.', hp: 230,
      intro: 'Download my app.',
      lines: ['Download my app.', 'Track your honey.', "Why aren't we getting views?", "You're fired!", 'You used to be my head of marketing!', "We don't say that name in this office.", 'Chess after this?', 'Who made this spreadsheet?', 'Did you track your honey today?', 'Rate us five stars.', "What's our MRR?", 'Churn is up. Who did this?', 'Downloads are flat. Why are downloads flat?', "We're pre-revenue. It's a strategy.", 'Our daily active users is three. One of them is me.', 'Can we A/B test the honey?', 'Push notifications fix churn.', 'Our CAC is higher than our LTV. Is that bad?', 'ARR is MRR times twelve. Put it on the slide.', 'We need to pivot. To honey.'],
      p2line: 'Checkmate in three.', p2attacks: ['checkmate'],
      defeat: "Fine. You're rehired. Chess tomorrow?",
      lose: 'The App Founder fired you. Nobody downloaded the app.',
      attacks: ['notify', 'sheets', 'bars', 'chess', 'deenbuddy', 'fired', 'errors'],
    },
    {
      key: 'ironfit', name: 'The Shilajit Coach', tag: 'Shilajit Coach', sub: 'No gym. Just pushups, pullups and a lot of shilajit.', hp: 300,
      intro: "Don't eat this if you're not married.",
      lines: ["Don't eat this if you're not married.", 'Is water wet?', 'Big man ting yeah', 'If you really have a premium product, raise your prices.', '1k for a story post.', 'No gym. Pushups and pullups.', '20 grams of creatine a day.', 'Watermelon juice and saffron water.', 'Day 1 of 500 pushups.', 'Lock in.', "Discipline is free. My shilajit isn't.", "Creatine, shilajit, saffron. That's the stack.", 'Premium product. Premium price. Simple.', 'Pushups in the morning. Pushups at night.', 'Raw honey? Respect. Still not shilajit.', 'No excuses. Only pushups.'],
      p2line: 'Day two. Lesgo.', p2attacks: ['ropeDouble'],
      defeat: 'Respect. Big man ting yeah.',
      lose: 'The Shilajit Coach charged you 1k for a story post.',
      attacks: ['rope', 'prices', 'pushups', 'resin', 'drinks'],
    },
    {
      key: 'apologist', name: 'The Honey Apologist', tag: 'Honey Apologist', sub: 'Blends three countries in one jar and sticks a new flag on it.', hp: 380,
      intro: 'Let me just check my notes.',
      lines: ['Let me just check my notes.', 'Blended, imported, relabelled. Perfection.', 'Ackshually that jar is from Uzbekistan.', "I'm just asking questions.", 'Why most honey you buy is a lie? Mine is the lie.', 'Single origin? Pick an origin. Any origin.', 'Interesting. Very interesting.', 'Answer the question. Yes or no.', 'Cross-examination time.', 'So you admit the honey is raw?', "Let's go to the label.", "The honey dilemma: either it's raw, or I'm right."],
      p2line: 'You managed to flip my annoy me switch.', p2attacks: ['dilemma2', 'axes', 'axeChop'],
      defeat: 'I need to... check my notes.',
      lose: 'The Honey Apologist blended you with three other countries.',
      attacks: ['blend', 'volley', 'dilemma', 'volley'],
    },
    {
      key: 'looks', name: 'The Looksmaxxer', tag: 'Looksmaxxer', sub: 'Live on stream. Rating your face. Selling the course.', hp: 460,
      intro: "Chat, we're live. Rating this honey seller.",
      lines: ["Women won't buy your honey. You're sub 5.", "Your canthal tilt is why the honey isn't selling.", "At least you sell raw honey. But why don't you eat raw meat?", 'Mew harder.', 'Ur a Jeffrey.', 'Endocrine warfare is killing your T, bro.', "Trust me bro, I'm natty.", 'I hate Greg Doucette.', "Seed oils. That's why you're losing.", 'Barefoot on the earth, chat. Grounding.', 'Link in bio. $199 jawline course.', 'Monk mode. No sugar. Honey is sugar.', 'Banned on every platform. Watch me on my own site.', 'Forty thousand watching. Biggest stream ever.', "It's fine to take meth if it keeps you lean. Chat agrees."],
      p2line: "Chat, I'm ascending.", p2attacks: ['subathon'],
      defeat: "Chat... don't clip that.",
      lose: 'The Looksmaxxer rated you a 2 and sold you the course.',
      attacks: ['hypergamy', 'needles', 'ratings', 'pills', 'hypergamy', 'liver', 'courseAd', 'chatFlood', 'hypergamy', 'bonesmash'],
    },
    {
      key: 'disprover', name: 'The Disprover', tag: 'Disprover', sub: "Here to disprove atheism. You're in the way.", hp: 600,
      intro: 'Atheists should stop eating honey.',
      lines: ['Atheists should stop eating honey.', 'Honey disproves atheism.', 'There is no manager bee.', 'Who taught the bee the dance?', 'The atheists did not know. The bee already knew.', "The bee made the... what's it called... the hexagon, guys.", 'Zero IQ. Zero IQ.', 'You are eating the mathematics.', 'Remind me again, atheist.', 'An explosion makes a mess. It does not make a hexagon.', 'Evolution is ended today. By the bee.', 'Why did the bee need to evolve honey? The ant was fine. The mosquito was fine.', 'Show me the half bee. Show me one half bee.', 'Which monkey taught the bee the hexagon? Remind me again.', 'Random mutation made the dance? Random mutation has no legs.', 'Your grandfather was a fish? Speak for yourself.'],
      p2line: 'Think. Think. Think.', p2attacks: ['quarkStorm'],
      defeat: '...Think.',
      lose: 'The Disprover proved his point. Zero IQ.',
      attacks: ['barrage', 'hexagons', 'missingLink', 'quarks', 'fishLegs', 'bigbang'],
    },
  ];

''')

# ================= state =================
rep("  let score, purity, combo, streak, addict, elapsed, spawnT, rush, shake, flash, hurtFlash, tally, lastHit, bossIdx, boss, praiseT;",
    "  let score, purity, combo, streak, addict, elapsed, spawnT, rush, shake, flash, hurtFlash, tally, lastHit, bossIdx, boss, praiseT;\n  let bosses = []; // one boss, or two in crazy mode; `boss` is whichever one is acting right now")
rep("  let upg, pcd, readyAt, bees = [], smokeT = 0, queenT = 0, extractT = 0, storageWarned = false, allyQueue = null, shedSel = null, shedPending = null, shedPinned = false, hikeSaid = false, smokeSlow = 0.6, smokeDur = 3, queenReach = 0.15;",
    "  let upg, pcd, readyAt, bees = [], smokeT = 0, magnetT = 0, extractT = 0, allyQueue = null, shedSel = null, shedPending = null, shedPinned = false, hikeSaid = false, smokeSlow = 0.6, smokeDur = 3, magnetReach = 0.15;\n  let qd = null, savings = 0, fightSaved = 0, crazyOn = false, chat = null, fightHits = 0;")
rep("  function seasonIdx() { return endless ? 6 : Math.min(bossIdx, BOSS_COUNT - 1); }", "  function seasonIdx() { return endless ? SEASONS.length - 1 : Math.min(bossIdx, BOSS_COUNT - 1); }")
rep("  function swarmZone() { return ev && ev.k === 'swarm' && ev.t > 0.4 && ev.t < ev.dur - 0.5 ? ev : null; }",
    "  function swarmZone() { return ev && ev.k === 'swarm' && ev.t > 1.2 && ev.t < 5.5 ? ev : null; } // while the swarm hovers over its half\n  const fighting = b => b.mode === 'fight' || b.mode === 'dash';\n  const anyFighting = () => bosses.some(fighting);\n  function nearestFighting(x) { let best = null; for (const b of bosses) if (fighting(b) && (!best || Math.abs(b.x - x) < Math.abs(best.x - x))) best = b; return best; }")
rep("    tally = { drops: 0, jars: 0, boxes: 0, comb: 0, labs: 0, bosses: 0, billed: 0, beeDrops: 0, spent: 0, bad: {} };\n    lastHit = null; bossIdx = 0; boss = null; phase = 'harvest'; ally = null;",
    "    tally = { drops: 0, jars: 0, boxes: 0, comb: 0, labs: 0, bosses: 0, billed: 0, beeDrops: 0, spent: 0, shilajit: 0, bad: {} };\n    lastHit = null; bossIdx = 0; boss = null; bosses = []; phase = 'harvest'; ally = null;")
rep("""    upg = { thick: 0, bee: 0, colonex: 0, smoker: 0, queen: 0, extractor: 0 }; pcd = { smoker: 0, queen: 0, extractor: 0 }; readyAt = { smoker: 0, queen: 0, extractor: 0 };
    bees = []; smokeT = 0; queenT = 0; extractT = 0; allyQueue = null; hikeSaid = false;""",
    """    upg = { thick: 0, bee: 0, colonex: 0, smoker: 0, magnet: 0, extractor: 0, queen: 0, crazy: 0 }; pcd = { smoker: 0, magnet: 0, extractor: 0, queen: 0 }; readyAt = { smoker: 0, magnet: 0, extractor: 0, queen: 0 };
    bees = []; smokeT = 0; magnetT = 0; extractT = 0; allyQueue = null; hikeSaid = false;
    qd = null; savings = 0; fightSaved = 0; crazyOn = false; chat = null; fightHits = 0;""")

# ================= HUD =================
rep("""    if (phase === 'boss') next = 'boss fight!';
    else if (endless) next = 'Endless · boss at ' + endlessNext + ' kg';""",
    """    if (phase === 'boss') next = 'boss fight · shed +' + fmtAdd(fightSaved);
    else if (endless) next = (crazyOn ? 'Crazy' : 'Endless') + ' · boss at ' + endlessNext + ' kg';""")
rep("      const active = (k === 'smoker' && smokeT > 0) || (k === 'queen' && queenT > 0) || (k === 'extractor' && extractT > 0);",
    "      const active = (k === 'smoker' && smokeT > 0) || (k === 'magnet' && magnetT > 0) || (k === 'extractor' && extractT > 0) || (k === 'queen' && !!qd);")

# ================= input and sound =================
rep("      const pk = { 1: 'smoker', 2: 'queen', 3: 'extractor' }[e.key];", "      const pk = { 1: 'smoker', 2: 'magnet', 3: 'extractor', 4: 'queen' }[e.key];")
rep("  addEventListener('keydown', e => {\n    keys[e.key] = true;\n", "  addEventListener('keydown', e => {\n    keys[e.key] = true;\n    if (!$('achScreen').hidden) { if (e.key === 'Escape') { e.preventDefault(); closeAch(); } return; }\n")
rep("    smoke: () => tone(300, 120, 0.6, 'sawtooth', 0.03),\n", r'''    smoke: () => tone(300, 120, 0.6, 'sawtooth', 0.03),
    ach: () => seq([784, 988, 1175, 1568], 70, 'triangle', 0.08, 0.14),
    // the queen's roar: an original growl that swells, brightens, then drops in pitch, with a wing buzz on top
    roar: (dur = 1.3) => {
      if (!ac || muted) return;
      const t = ac.currentTime, out = ac.createGain(), lp = ac.createBiquadFilter();
      out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(0.14, t + 0.12); out.gain.setValueAtTime(0.14, t + dur * 0.7); out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      lp.type = 'lowpass'; lp.Q.value = 5; lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(2300, t + dur * 0.55); lp.frequency.linearRampToValueAtTime(450, t + dur);
      [0, 6].forEach(d => {
        const o = ac.createOscillator(); o.type = 'sawtooth';
        o.frequency.setValueAtTime(290 + d, t); o.frequency.linearRampToValueAtTime(330 + d, t + dur * 0.6); o.frequency.exponentialRampToValueAtTime(130 + d, t + dur);
        o.connect(lp); o.start(t); o.stop(t + dur);
      });
      const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate), ch = buf.getChannelData(0);
      for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * 0.5;
      const ns = ac.createBufferSource(), bp = ac.createBiquadFilter(); ns.buffer = buf; bp.type = 'bandpass'; bp.frequency.value = 1300; bp.Q.value = 0.9;
      ns.connect(bp).connect(lp); ns.start(t); ns.stop(t + dur);
      const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 36; lg.gain.value = 0.05; lfo.connect(lg).connect(out.gain); lfo.start(t); lfo.stop(t + dur);
      lp.connect(out).connect(ac.destination);
    },
''')

# ================= say: no line repeats within two lines =================
between('  function say(text, o = {}) {', '  function seasonBanner() {', r'''  function say(text, o = {}, b = boss) {
    if (!b) return false;
    if (!o.force && b.say && b.say.t > 1) return false;
    if (!o.force && b.recent.includes(text)) return false; // a line can't come back until two other lines have been said
    b.say = { text, t: o.dur || lineDur(text) };
    b.recent.push(text); if (b.recent.length > 2) b.recent.shift();
    hear(b.def.name, text);
    sfx.blip(b.def.mono);
    return true;
  }
''')

# ================= eating, savings =================
rep("""    else if (kind === 'shilajit') { startRush(); floatText(it.x, it.y - 34, "Don't eat this if you're married", '#ffd36b'); splat(it.x, it.y, '#2b1406', 16); }""",
    """    else if (kind === 'shilajit') { startRush(); floatText(it.x, it.y - 34, "Don't eat this if you're married", '#ffd36b'); splat(it.x, it.y, '#2b1406', 16); tally.shilajit++; achStat('shilajit', tally.shilajit); }""")
rep("      if (boss && (boss.mode === 'fight' || boss.mode === 'dash') && kind !== 'lab') {\n        globs.push(", "      if (anyFighting() && kind !== 'lab') {\n        globs.push(")
between('  // Honey eaten during a boss fight counts at its plain weight', '  function addKg(n) {', r'''  // Honey eaten during a boss fight goes into Grandad's Shed savings at its plain weight (no combo, no Addictive bonus).
  // It never counts towards the next boss, so a long fight can't skip a harvest.
  function fightKg(kg, x, y) {
    savings += kg; fightSaved += kg;
    floatText(x, y - 10, '+' + fmtAdd(kg), '#e9d7ff');
  }
''')
rep("""    if (endless) {
      if (score >= endlessNext) { score = endlessNext; startBoss(Math.floor(Math.random() * BOSS_COUNT), true); }
    }""", """    if (endless) {
      if (score >= endlessNext) {
        score = endlessNext;
        const a = Math.floor(Math.random() * BOSS_COUNT);
        if (crazyOn) { let c = Math.floor(Math.random() * (BOSS_COUNT - 1)); if (c >= a) c++; startFight([a, c], true); }
        else startFight([a], true);
      }
    }""")
rep("    if (boss && (boss.mode === 'fight' || boss.mode === 'dash')) damageBoss(5);\n  }", "    bosses.filter(fighting).forEach(b => damageBoss(5, b));\n    achAdd('labs', 1);\n  }")
rep("""    lastHit = { name, boss: !!opts.boss, toxin: !!opts.toxin };""", """    lastHit = { name, boss: opts.boss || null, toxin: !!opts.toxin };
    if (phase === 'boss') fightHits++;
    if (chat) chatReact(["IT'S OVER", 'LMAOOO', "it's so over", 'mogged', 'clip it']);""")

# ================= powers =================
rep("""    if (state !== 'play' || !k || !upg[k] || pcd[k] > 0) return false;
    const st = PW[k](upg[k]);""", """    if (state !== 'play' || !k || !upg[k] || pcd[k] > 0) return false;
    if (k === 'queen' && qd) return false;
    const st = PW[k](upg[k]);""")
rep("""    else if (k === 'queen') { queenT = st.dur; queenReach = st.reach; floatText(W / 2, H * 0.42, 'QUEEN BEE', '#ffd36b', true); sfx.comb(); }
    else extract(st.grab);""", """    else if (k === 'magnet') { magnetT = st.dur; magnetReach = st.reach; floatText(W / 2, H * 0.42, 'HONEY MAGNET', '#ffd36b', true); sfx.comb(); }
    else if (k === 'extractor') extract(st.grab);
    else launchQueen(st);""")
rep("    smokeT = Math.max(0, smokeT - dt); queenT = Math.max(0, queenT - dt); extractT = Math.max(0, extractT - dt);",
    "    smokeT = Math.max(0, smokeT - dt); magnetT = Math.max(0, magnetT - dt); extractT = Math.max(0, extractT - dt);")

# ================= worker bees =================
rep("""      if (!b.tgt && b.rest <= 0) {
        let best = null, bd = 1e9;
        for (const it of items) {
          if (it.kind !== 'drop' || it.bee || it.suck || it.y < combBottom() || it.y > spoon.y - 50) continue;
          const d = Math.hypot(it.x - b.x, it.y - b.y);
          if (d < bd) { bd = d; best = it; }
        }
        if (best) { b.tgt = best; best.bee = b; }
      }""", """      if (!b.tgt && b.rest <= 0) {
        // mostly drops; upgraded bees sometimes go for a jar, a box or a Shilajit jar instead
        const r = Math.random(), want = r < bs.big ? 'big' : r < bs.big + bs.jar ? 'jar' : 'drop';
        let best = null, bd = 1e9;
        const scan = ok => { for (const it of items) { if (!ok(it) || it.bee || it.suck || it.y < combBottom() || it.y > spoon.y - 50) continue; const d = Math.hypot(it.x - b.x, it.y - b.y); if (d < bd) { bd = d; best = it; } } };
        scan(want === 'big' ? it => it.kind === 'box' || it.kind === 'shilajit' : it => it.kind === want);
        if (!best && want !== 'drop') scan(it => it.kind === 'drop');
        if (best) { b.tgt = best; best.bee = b; }
      }""")
between('  function beeCatch(b, it) {', '  // ---------- events between bosses', r'''  function beeCatch(b, it) {
    const i = items.indexOf(it);
    if (i >= 0) items.splice(i, 1);
    const kind = it.kind, kg = kind === 'drop' ? it.kg : KG[kind] || 0;
    b.tgt = null; b.rest = beeStats(upg.bee).rest * (kind === 'drop' ? 1 : 1.6);
    tally.beeDrops++;
    splat(it.x, it.y, kind === 'drop' ? '#b05a14' : '#c89a5b', kind === 'drop' ? 4 : 10);
    if (kind === 'shilajit') { startRush(); tally.shilajit++; achStat('shilajit', tally.shilajit); }
    if (phase === 'harvest') {
      const mult = combo * (rush > 0 ? RUSH_MULT : 1);
      floatText(it.x, it.y - 10, '+' + fmtAdd(kg) + (mult > 1 ? ' ×' + fmtMult(mult) : ''), '#ffe27a');
      addKg(kg * mult);
    } else if (phase === 'boss') {
      fightKg(kg, it.x, it.y);
      if (anyFighting()) globs.push({ x: b.x, y: b.y, vx: 0, vy: -760, dmg: (DMG[kind] || 1) * thickMul(upg.thick), r: (kind === 'drop' ? 6 : 9) * G * (1 + 0.04 * upg.thick), lv: upg.thick });
    }
  }

''')

# ================= bee swarm: in from one side, hover, out the other side =================
rep("""      ev = { k, t: 0, dur: 7.5, side, x0: side === 'L' ? 0 : W / 2, x1: side === 'L' ? W / 2 : W, cx: 0, cy: H * 0.5, acc: 0, honeyT: 0,""",
    """      ev = { k, t: 0, dur: 7, side, x0: side === 'L' ? 0 : W / 2, x1: side === 'L' ? W / 2 : W, cx: side === 'L' ? -200 : W + 200, cy: H * 0.5, acc: 0, honeyT: 0,""")
rep("""      const enter = Math.min(1, ev.t / 0.8), leave = Math.min(1, Math.max(0, (ev.dur - ev.t) / 0.8));
      const zc = (ev.x0 + ev.x1) / 2, outX = ev.side === 'L' ? -200 : W + 200;
      ev.cx = ev.t < 0.8 ? outX + (zc - outX) * ease(enter) : ev.t > ev.dur - 0.8 ? outX + (zc - outX) * leave : zc;
      ev.cy = H * 0.5 + Math.sin(ev.t * 1.3) * 20;
      if (swarmZone()) {
        const out = ev.side === 'L' ? -1 : 1;
        for (const it of items) {
          if (it.kind === 'bad' && (it.carried || (it.x >= ev.x0 && it.x <= ev.x1))) {
            it.carried = true;
            it.base += out * 300 * dt; it.vy = Math.min(it.vy, 30); it.y -= 20 * dt; it.amp *= 0.95;
          }
        }""", """      // fly in from one side, hover over that half grabbing fakes, then cross the screen and leave from the other side
      const zc = (ev.x0 + ev.x1) / 2, inX = ev.side === 'L' ? -200 : W + 200, outX = ev.side === 'L' ? W + 220 : -220;
      if (ev.t < 1.5) ev.cx = inX + (zc - inX) * ease(ev.t / 1.5);
      else if (ev.t < 5.5) ev.cx = zc + Math.sin((ev.t - 1.5) * 1.6) * (ev.x1 - ev.x0) * 0.1;
      else ev.cx = zc + (outX - zc) * Math.pow(Math.min(1, (ev.t - 5.5) / 1.5), 1.6);
      ev.cy = H * 0.5 + Math.sin(ev.t * 1.3) * 20;
      for (const it of items) if (it.carried) { it.base = ev.cx + it.cOff; it.amp = 0; it.vy = 0; it.y += (H * 0.4 + it.cOff * 0.2 - it.y) * Math.min(1, dt * 2); }
      if (swarmZone()) {
        for (const it of items) if (it.kind === 'bad' && !it.carried && it.x >= ev.x0 && it.x <= ev.x1) { it.carried = true; it.cOff = clamp(it.x - ev.cx, -120, 120); }""")
rep("""    if (ev.t >= ev.dur) {
      if (ev.k === 'flow' && ev.got > 0) floatText(spoon.x, spoon.y - 80, 'Honey flow +' + fmtAdd(ev.got), '#ffd36b');""",
    """    if (ev.t >= ev.dur) {
      if (ev.k === 'flow' && ev.got > 0) floatText(spoon.x, spoon.y - 80, 'Honey flow +' + fmtAdd(ev.got), '#ffd36b');
      if (ev.k === 'swarm') items = items.filter(it => !it.carried);""")

# ================= catkins for March =================
rep("vy: heat ? -rnd(15, 30) : s.part === 'pollen' || s.part === 'fluff' ? rnd(8, 18) : rnd(22, 42),", "vy: heat ? -rnd(15, 30) : s.part === 'pollen' || s.part === 'fluff' || s.part === 'catkin' ? rnd(8, 18) : rnd(22, 42),")
rep("c: s.part === 'petal' ?", "c: s.part === 'catkin' ? pick(['#f1d65a', '#e6c844', '#fff0a0']) : s.part === 'petal' ?")

open(p, 'w').write(s)
print('to5a ok')
