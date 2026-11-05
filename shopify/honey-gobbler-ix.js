(() => {
  const $ = id => document.getElementById(id);
  const cv = $('cv');
  const ctx = cv.getContext('2d');
  const stage = $('stage');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = u => 1 - Math.pow(1 - u, 3);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const TAU = Math.PI * 2;

  // ---------- tuning ----------
  const STAGE_KG = 150, BOSS_COUNT = 9, GOAL = STAGE_KG * BOSS_COUNT;
  const thresholdFor = i => STAGE_KG * (i + 1); // 150 ... 1050
  const KG = { jar: 1.2, box: 10, comb: 5, shilajit: 1.2, lab: 0 }; // drops carry their own 50-200 g
  const FILL = { drop: .035, jar: .07, box: .12, comb: .05, shilajit: 0, lab: 0 };
  const DMG = { drop: 1, jar: 2, box: 4, comb: 1, shilajit: 2, lab: 0 };
  const RUSH_TIME = 9, RUSH_MULT = 1.5;
  const COMBO_GRACE = 4, COMBO_STEP = 3; // catch nothing for 4 s and the combo drops a step, then another every 3 s
  const comboCap = () => 3 + 0.4 * (upg ? upg.sweet || 0 : 0), comboGrace = () => COMBO_GRACE + 0.6 * (upg ? upg.sweet || 0 : 0), comboStep = () => COMBO_STEP + 0.4 * (upg ? upg.sweet || 0 : 0);
  const HEAL = { drop: 0.5, jar: 1, box: 5, comb: 18, shilajit: 3, lab: 0 }; // purity restored by real honey
  const COMB_FIGHT = () => (W < 560 ? 15 : !endless && bossIdx < 3 ? 12 : 8); // in a boss fight the comb heals less, so the bosses can wear you down (phones and the first bosses less so)
  const MAX_LV = 10;
  const thickMul = lv => 1 + 0.1 * lv;
  const GLOB_COL = ['#e08e0b', '#c9760a', '#a95c08', '#8a4406'];
  const FEE_MULT = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 10000];
  const allyStats = lv => { const m = 1 - 0.035 * lv; return { dmg: 3.6 + 0.25 * lv, lo: 2.8 * m, hi: 3.8 * m, fee: FEE_MULT[lv] }; };
  const BEE_COUNT = [0, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10]; // twice as many as before, each doing half the work (BEE_WORK)
  const BEE_JAR = [0, 0, 0, 0.10, 0.15, 0.20, 0.25, 0.29, 0.32, 0.36, 0.40]; // chance a bee goes for a nearby jar
  const BEE_BIG = [0, 0, 0, 0, 0, 0, 0.05, 0.075, 0.10, 0.125, 0.15];      // ...or a box or Shilajit jar
  const BEE_WORK = { rest: 3, speed: 0.8 }; // each bee rests longer and flies a bit slower, so the swarm does what the old one did
  const beeStats = lv => ({ n: BEE_COUNT[lv], speed: 1 + 0.06 * Math.max(0, lv - 1), rest: BEE_WORK.rest * (1 - 0.05 * Math.max(0, lv - 1)), jar: BEE_JAR[lv], big: BEE_BIG[lv] });
  const EXTRACT_GRAB = [0, 4, 5, 6, 7, 8, 10, 12, 15, 20, Infinity];
  // powers start weak at level 1 and recharge faster and hit harder each level
  const PW = {
    smoker: lv => ({ cd: 30 - (lv - 1) * 15 / 9, dur: 3 + (lv - 1) / 3, slow: 0.6 - (lv - 1) * 0.3 / 9 }),
    magnet: lv => ({ cd: 35 - (lv - 1) * 17 / 9, dur: 4.5 + (lv - 1) * 4 / 9, reach: 0.15 + (lv - 1) * 0.15 / 9 }),
    extractor: lv => ({ cd: 60 - (lv - 1) * 30 / 9, grab: EXTRACT_GRAB[lv] }),
    queen: lv => ({ cd: 35 - (lv - 1), charges: lv < 4 ? 2 : lv < 8 ? 3 : 4, dmg: 14 + (lv - 1) * 10 / 9 }),
    lab: lv => ({ cd: 60 - (lv - 1) * 30 / 9, dmg: 5 + (lv - 1) * 15 / 9 }),
    shield: lv => ({ cd: 40 - (lv - 1) * 15 / 9, hits: [2, 2, 2, 3, 3, 3, 4, 4, 4, 5][lv - 1], dur: 6 + (lv - 1) * 0.5 }),
  };
  const PKEY = { smoker: '1', magnet: '2', extractor: '3', queen: '4', shield: '5', lab: '6' };
  const PKEYS = ['smoker', 'magnet', 'extractor', 'queen', 'shield', 'lab'];
  const BEE_SPEED = 300, BELT_PUSH = 290;
  const BOSS_BONUS = 50; // kg into your savings for every boss you beat
  const ENDLESS_STEP = 4; // endless: levels a boss gains each time you meet him again
  const ENDLESS_BASE = 2; // ...and the level his attacks start at the first time
  const QUARK_TURN = 2.4; // how fast quarks can turn towards you, radians a second (the faster they fly, the wider they turn)
  const lvOf = b => (endless && b && b.endless ? b.alv ?? b.elv ?? 0 : 0);
  const magSize = () => 0.75 + 0.25 * clamp((1100 - W) / 725, 0, 1); // 75% on a computer screen, full size on a phone
  const magR = () => Math.max(W, 560) * magnetReach * magSize() * (endless ? 1 + Math.min(0.4, 0.08 * Math.max(0, fallMul() - 3)) : 1); // reaches further in endless as things fall faster
  const waxGrip = () => 1 / (1 + 0.1 * (upg.wax || 0)); // Beeswax coating: sticky stuff and belts grip half as hard when maxed
  const BEE_COMBO = 1 / 3, BEE_HOLD = 1; // a bee's catch counts a third towards your combo, and holds off its drop by a second
  const G_PER_BEE = 0.6; // a worker bee makes about 1/12 teaspoon of honey in her life
  const CRAZY_PRICE = 250; // 500 kg with the price rise

  const SEASONS = [
    { m: 'March', name: 'First flight', col: '#f3e27a', top: '#33280f', mid: '#22170a', glow: 'rgba(240,220,120,.12)', part: 'catkin' },
    { m: 'April', name: 'First blossom', col: '#ffc4d8', top: '#3c2a10', mid: '#25170a', glow: 'rgba(255,214,140,.14)', part: 'petal' },
    { m: 'May', name: 'Spring flow', col: '#fff3b0', top: '#3d2b0f', mid: '#25170a', glow: 'rgba(255,225,140,.15)', part: 'fluff' },
    { m: 'June', name: 'Early summer', col: '#ffe27a', top: '#3e260c', mid: '#26150a', glow: 'rgba(255,200,90,.17)', part: 'pollen' },
    { m: 'Midsummer', name: 'Longest days', col: '#ffd060', top: '#40250b', mid: '#27150a', glow: 'rgba(255,185,70,.18)', part: 'pollen' },
    { m: 'July', name: 'High summer', col: '#ffb347', top: '#47230a', mid: '#2a1509', glow: 'rgba(255,150,40,.2)', part: 'heat' },
    { m: 'August', name: 'Honeydew season', col: '#b9d98a', top: '#2f220e', mid: '#1f160a', glow: 'rgba(170,200,100,.12)', part: 'needle' },
    { m: 'September', name: 'Last of the season', col: '#ff8a3c', top: '#3b1b0b', mid: '#241008', glow: 'rgba(220,90,30,.16)', part: 'leaf' },
    { m: 'October', name: 'The hornets come', col: '#e0913a', top: '#3a1c08', mid: '#230f06', glow: 'rgba(230,130,50,.15)', part: 'leaf' },
    { m: 'Winter', name: 'Endless mode', col: '#cfe8ff', top: '#1f1b26', mid: '#140f15', glow: 'rgba(150,190,255,.12)', part: 'snow' },
  ];

  // Fakes. The poisons come from the shop's promise: "poison free, radium free, arsenic free, uranium free".
  const FAKES = [
    { type: 'bottle', name: 'Corn syrup', label: 'CORN SYRUP', color: '#ffe600', dmg: 12, stage: 0 },
    { type: 'bottle', name: 'Sugar syrup', label: 'SUGAR SYRUP', color: '#ffb000', dmg: 12, stage: 0 },
    { type: 'bottle', name: 'Rice syrup', label: 'RICE SYRUP', color: '#f4ff7a', dmg: 12, stage: 0 },
    { type: 'toxin', name: 'Radium', symbol: 'Ra', color: '#7cff6b', dmg: 20, stage: 0 },
    { type: 'toxin', name: 'Uranium', symbol: 'U', color: '#d4ff3a', dmg: 20, stage: 0 },
    { type: 'toxin', name: 'Arsenic', symbol: 'As', color: '#c58bff', dmg: 20, stage: 0 },
    { type: 'bottle', name: 'Orange honey', label: 'I LIKE ORANGE', color: '#ff7a1a', dmg: 12, stage: 1 },
    { type: 'bottle', name: 'EU & non-EU blend', label: 'EU+NON-EU BLEND', color: '#ffd27a', dmg: 14, stage: 1 },
    { type: 'susjar', name: 'Supermarket honey', color: '#ffcc33', dmg: 14, stage: 2 },
    { type: 'bag', name: 'Feeder syrup', color: '#fff3a0', dmg: 10, stage: 2 },
  ];
  const PRAISE = ['Way different taste!', 'This stuff is banging!', 'Tastes more authentic!', 'Malty. Dark. Deep.', 'The Shilajit of honey!', 'Better than the supermarket!', 'Best honey in the universe!', 'Put it in your tea!'];
  const NOTIFS = ['Download my app', 'Track your honey', 'Your honey streak is at risk!', "Why aren't we getting views?", 'Rate us 5 stars?'];
  const FEES = ['400$ ping fee', '250$ vc fee', '500$ emoji licence fee', '1000$ permission fee', '50$ error fee', '500$ mute fee', '4000$ approval fee', '400$ insult fee', '100$ per 1 kb storage fee', '400000 aed false report fee', '10000$ color change fee', '50$ unnecessary question fee'];
  const ALLY_FEES = ['500$ boss fee', '300$ honey fee', '1000$ damage fee', '200$ hit fee', '50$ inconvenience fee', '250$ herp fee'];
  const VC_TARGETS = [['@Ja Ja Binka', 'JB'], ['@Ja Ja Binka', 'JB'], ['@Ja Ja Binka', 'JB'], ['@RD8', 'RD'], ['@Janusz', 'JA']]; // 3:1:1
  const CELLS = ['0', '0', '0', '#REF!', '#N/A', '0 views', '#DIV/0!'];
  const SNACKS = { pizza: ['Pizza', '#ffcf4a'], popsicle: ['Popsicle', '#ffb347'], melon: ['Watermelon', '#ff4d5e'], cola: ['Cola', '#d41f26'] };
  const DRINKS = { watermelon: ['Watermelon juice', '#ff4d6d'], saffron: ['Saffron water', '#f4a300'], creatine: ['20 g of creatine', '#e8e8ee'] };
  const PRICES = ['£35', '£40', '£50', '£99', '$1000 STORY POST'];
  const EQUATIONS = ['√(1/300)', 'f(x)=x/3+5', '(x+½)²', 'IQ > 9000', 'y=−√x'];
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
    lecturer: 'lecturer pls stop asking about whatsapp. loksd corporation uses discord',
    ironfit: 'shilajit coach charges 1k for story post. loksd corporation charges 2k to read it',
    apologist: 'honey apologist pls check ur notes, there is a fee',
    looks: 'looksmaxxer pls stop mewing in vc',
    disprover: 'disprover has been disproved by loksd corporation',
    hornet: 'vespa mandarinia owes loksd corporation 500$ sting fee',
  };
  const ALLY_LINES = ['boss fee', 'honey fee', 'damage fee', 'herp owes loksd corporation 500$', 'loksd corporation has issued a damage fee', 'U are herp', '500$ herp fee', 'this boss owes loksd corporation 4000$', 'stop playing roblox'];

  // ---------- Grandad's Shed ----------
  // Each level costs a little more than the last, and stronger upgrades cost more. Prices are shown rounded to 10 kg.
  const geo = (a, r, n) => Array.from({ length: n }, (_, i) => a * r ** i);
  const COST = geo(18, 1.078, 10); // levels 1-10, scaled by each item's weight below
  const costs = w => COST.map(c => c * w);
  const r10 = n => Math.max(10, Math.round(n / 10) * 10);
  const f2 = n => String(Math.round(n * 100) / 100);
  const pct = n => Math.round(n * 100) + '%';
  const SHOP = [
    { id: 'thick', name: 'Thicker honey', cost: costs(1.4), desc: 'The honey you flick at bosses does more damage.',
      lvText: lv => `×${thickMul(lv).toFixed(1)}: drop ${f2(thickMul(lv))}, jar ${f2(2 * thickMul(lv))}, box ${f2(4 * thickMul(lv))} damage` },
    { id: 'bee', name: 'Worker bee', cost: costs(1.4), desc: 'Bees that fly around catching honey for you, mostly drops. From level 3 they start lifting jars, and from level 6 boxes and Shilajit jars too. In boss fights they flick what they catch at the boss.',
      lvText: lv => { if (!lv) return 'No bees'; const b = beeStats(lv), f = Math.round((b.speed - 1) * 100); return `${b.n} bee${b.n > 1 ? 's' : ''}, ${f ? f + '% faster' : 'normal speed'}` + (b.jar ? `, go for jars ${pct(b.jar)} of the time` : '') + (b.big ? `, boxes and Shilajit ${pct(b.big)}` : ''); } },
    { id: 'colonex', name: 'Pay Colonex', cost: costs(1.2), unlock: () => endless || bossIdx >= 2, desc: 'Raise his fees. His invoices hit bosses harder and more often.',
      lvText: lv => { const a = allyStats(lv); return `${f2(a.dmg)} damage per invoice, every ${a.lo.toFixed(1)}–${a.hi.toFixed(1)} s, fees ×${a.fee.toLocaleString('en-GB')}`; } },
    { id: 'smoker', name: 'Smoker', cost: costs(0.8), desc: 'Slows every fake and boss attack for a few seconds.',
      lvText: lv => { if (!lv) return 'Not owned'; const q = PW.smoker(lv); return `Slows them to ${Math.round(q.slow * 100)}% speed for ${q.dur.toFixed(1)} s. Recharges in ${Math.round(q.cd)} s.`; } },
    { id: 'magnet', name: 'Honey magnet', cost: costs(1.4), desc: 'Pulls nearby honey into your spoon and pushes fakes and boss attacks away, for a few seconds. In endless it reaches further as things fall faster.',
      lvText: lv => { if (!lv) return 'Not owned'; const q = PW.magnet(lv); return `Reaches ${Math.round(q.reach * magSize() * 100)}% of the screen's width for ${q.dur.toFixed(1)} s. Recharges in ${Math.round(q.cd)} s.`; } },
    { id: 'extractor', name: 'Extractor', cost: costs(1.0), desc: 'Pulls honey into your spoon one piece at a time, as it falls, until it has pulled in its full amount. In boss fights that honey gets flicked at the boss too.',
      lvText: lv => { if (!lv) return 'Not owned'; const q = PW.extractor(lv); return `${q.grab === Infinity ? 'Pulls in all the honey for ' + EXTRACT_ALL_TIME + ' s' : 'Pulls in ' + q.grab + ' pieces of honey'}. Recharges in ${Math.round(q.cd)} s once it's done.`; } },
    { id: 'queen', name: 'Queen bee', cost: costs(1.3), desc: 'A huge queen bee who buzzes in and charges at the boss, smashing any attacks in her way. Each hit knocks the boss off his next attack for a second. She only comes out in boss fights.',
      lvText: lv => { if (!lv) return 'Not owned'; const q = PW.queen(lv); return `${q.charges} charge${q.charges > 1 ? 's' : ''} of ${Math.round(q.dmg)} damage. Recharges in ${Math.round(q.cd)} s.`; } },
    { id: 'lab', name: 'Lab test kit', cost: costs(1.2), desc: 'Run a lab test whenever you want: every fake and every boss attack on screen is gone, and the bosses take a hit for selling sus honey.',
      lvText: lv => { if (!lv) return 'Not owned'; const q = PW.lab(lv); return `Clears the screen and hits bosses for ${Math.round(q.dmg)}. Recharges in ${Math.round(q.cd)} s.`; } },
    { id: 'shield', name: 'Honeycomb shield', cost: costs(1.2), desc: 'A wax hexagon over your spoon that soaks up the next few hits, then cracks. It wears off after a few seconds if nothing hits it.',
      lvText: lv => { if (!lv) return 'Not owned'; const q = PW.shield(lv); return `Soaks up ${q.hits} hits, lasts ${q.dur.toFixed(1)} s. Recharges in ${Math.round(q.cd)} s.`; } },
    { id: 'wax', name: 'Beeswax coating', cost: costs(1.2), desc: 'Coats your spoon in beeswax. Everything that hits you does less damage, and sticky syrup, resin and the factory belt get less grip on it.',
      lvText: lv => { if (!lv) return 'Not owned'; return `${lv * 5}% less damage. Sticky stuff and belts grip ${Math.round(100 * (1 - 1 / (1 + 0.1 * lv)))}% less.`; } },
    { id: 'sweet', name: 'Sweet tooth', max: 5, cost: geo(60, 1.115, 5), desc: 'Raises the highest combo you can reach, and makes it drop more slowly when you stop catching.',
      lvText: lv => `Combo up to ×${f2(3 + 0.4 * lv)}. Holds ${f2(COMBO_GRACE + 0.6 * lv)} s before dropping.` },
    { id: 'hives', name: 'Richer hives', max: 5, cost: geo(50, 1.16, 5), desc: 'More of the honey that falls comes as jars, 10 kg boxes and honeycombs.',
      lvText: lv => `Jars ${Math.round((0.28 + 0.04 * lv) * 100)}% of honey, boxes ${f2(2 + 1.2 * lv)}%, combs ${f2(4.5 + 0.6 * lv)}%` },
    { id: 'crazy', name: 'Crazy mode', max: 1, cost: [CRAZY_PRICE], unlock: () => endless,
      desc: 'Endless mode with two bosses at once. Colonex fights with you, unless he is one of the two. Warning: it is hard.',
      lvText: lv => lv ? (crazyOn ? 'On' : 'Off') : 'Not owned' },
  ];
  SHOP.forEach(x => { x.max = x.max || MAX_LV; x.key = PKEY[x.id]; });
  const COLONEX_RAISE = ['loksd corporation has issued a fee increase fee', 'loksd corporation board of directors has approved this', 'loksd corporation can afford', 'premium fees for premium bosses'];
  const GRANDAD_HI = ["Honey doesn't grow on trees. Spend it wisely.", "The bees worked hard for that. Don't waste it.", 'Spend it how you like. The bosses come either way.', 'In my day we had a spoon and nothing else.'];
  const GRANDAD_BUY = { lab: 'Send it to the lab. Trust, but test.', shield: "Wax from the old frames. It'll hold. For a bit.", wax: 'Beeswax. Keeps the rain off the hives and the syrup off your spoon.', thick: 'Leave it in the frame longer. Thicker honey.', bee: "Take one of mine. She's a hard worker.", colonex: 'Who is this boy and why does he keep sending me invoices?', smoker: "Don't point it at your own face.", magnet: 'It pulls honey. And my spare keys.', extractor: 'Mind your fingers.', queen: 'Be gentle with her.', crazy: "Two at once? You're crazier than the bees.", sweet: 'Eat faster, boy.', hives: 'I moved the hives to the lime trees. Richer flow.' };
  const PRICE_HIKE = 2; // after the Shilajit Coach: "If you really have a premium product, raise your prices."
  const GRANDAD_HIKE = 'The Shilajit Coach told me: if you really have a premium product, raise your prices. So I doubled them.';
  const GRANDAD_BROKE = "You can't afford that. Go catch more honey.";
  const feeText = (t, m) => { const n = parseInt(t, 10); return (n * m) + t.slice(String(n).length); };
  const GRANDAD_CRAZY = ["Crazy mode is on. Two at once. Don't say I didn't warn you.", 'Crazy mode is off. One at a time, like a normal person.'];

  // ---------- achievements ----------
  const SHOP_LEVELS = SHOP.filter(x => x.id !== 'crazy').reduce((n, x) => n + x.max, 0);
  const ACH = [
    { id: 'trust', name: 'Trust me bro', desc: 'Beat the Sus Beekeeper without getting hit.' },
    { id: 'blacklist', name: 'Off the blacklist', desc: 'Beat Colonex.' },
    { id: 'fired', name: "You're fired", desc: 'Beat the App Founder.' },
    { id: 'nextq', name: 'Lecture over', desc: 'Beat the Lecturer.' },
    { id: 'bigman', name: 'Big man ting', desc: 'Beat the Shilajit Coach.' },
    { id: 'notes', name: 'Check my notes', desc: 'Beat the Honey Apologist.' },
    { id: 'mogger', name: 'Mogger', desc: 'Beat the Looksmaxxer.' },
    { id: 'blocked', name: 'Blocked', desc: 'Beat the Disprover.' },
    { id: 'sold', name: 'Sold out', desc: 'Finish a run.', stat: 'season', goal: BOSS_COUNT, show: n => n + ' / ' + BOSS_COUNT + ' bosses' },
    { id: 'fast', name: 'Sold out fast', desc: 'Finish a run in under 16 minutes.' },
    { id: 'spoon', name: 'A spoon and nothing else', desc: 'Beat all nine bosses without buying anything in the shed.' },
    { id: 'nospare', name: 'No spare frames', desc: 'Finish a run without using a second chance.' },
    { id: 'raw', name: 'Raw and unfiltered', desc: 'Finish a run without your purity ever dropping below 50%.' },
    { id: 'endless', name: 'Endless', desc: 'Reach round 5 of endless mode.', stat: 'round', goal: 5, show: n => 'round ' + n + ' / 5' },
    { id: 'going', name: 'Still going', desc: 'Reach round 15 of endless mode.', stat: 'round', goal: 15, show: n => 'round ' + n + ' / 15' },
    { id: 'crazy', name: 'Crazy', desc: 'Beat two bosses at once.' },
    { id: 'crazier', name: 'Crazier', desc: 'Win 10 crazy mode fights.', stat: 'crazyWins', goal: 10 },
    { id: 'brawl', name: 'Everyone at once', desc: 'Beat every boss at the same time.' },
    { id: 'herp', name: 'U are herp', desc: 'Colonex bills the bosses over 10,000,000$ in total.', stat: 'billed', goal: 1e7, show: n => Math.floor(n).toLocaleString('en-GB') + '$ / 10,000,000$' },
    { id: 'premium', name: 'Premium product', desc: 'Buy something after the price rise.' },
    { id: 'married', name: "Don't eat this if you're married", desc: 'Eat 10 Shilajit jars in one run.', stat: 'shilajit', goal: 10, show: n => n + ' / 10 in one run' },
    { id: 'grandad', name: "Grandad's favourite", desc: 'Max out everything in the shed.', stat: 'levels', goal: SHOP_LEVELS, show: n => n + ' / ' + SHOP_LEVELS + ' levels' },
    { id: 'labrat', name: 'Lab rat', desc: 'Run 25 lab tests in total.', stat: 'labs', goal: 25 },
    { id: 'knight', name: 'Spoon takes', desc: 'Take 25 knights by swiping the spoon through them.', stat: 'knights', goal: 25 },
    { id: 'royal', name: 'Royal charge', desc: 'Finish a boss off with the queen bee.' },
    { id: 'sugar', name: 'Sugar high', desc: 'Reach a ×5 combo.' },
    { id: 'tonnes', name: 'Ten tonnes', desc: 'Harvest 10,000 kg in total.', stat: 'harvested', goal: 1e4, show: n => Math.floor(n).toLocaleString('en-GB') + ' / 10,000 kg' },
    { id: 'hive', name: 'Hive mind', desc: 'Your bees catch 5,000 things in total.', stat: 'beeCatches', goal: 5000, show: n => Math.floor(n).toLocaleString('en-GB') + ' / 5,000' },
    { id: 'regular', name: 'Supermarket regular', desc: 'Get hurt 100 times in total, by anything.', stat: 'hurts', goal: 100 },
    { id: 'real', name: 'The real thing', desc: 'Join the waitlist.' },
    { id: 'pest', name: 'Pest control', desc: 'Beat Vespa mandarinia.' },
    { id: 'longlive', name: 'Long live the queen', desc: 'Beat Vespa mandarinia with the queen bee, without her ever going down.' },
    { id: 'swatter', name: 'Swatter', desc: 'Swat 50 mini hornets with the spoon.', stat: 'swats', goal: 50 },
  ];
  const LOCK_SVG = '<svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true" style="vertical-align:-1px"><rect x="3" y="7" width="10" height="8" rx="1.5" fill="currentColor"/><path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="2" fill="none"/></svg>';
  const CHECK_SVG = '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // ---------- bosses ----------
  const BOSSES = [
    {
      key: 'keeper', name: 'The Sus Beekeeper', tag: 'Sus Beekeeper', sub: 'Feeds his bees syrup during the flow. Calls it raw.', hp: 115, ehp: 130,
      intro: "It's raw. Trust me bro.",
      lines: ["It's raw. Trust me bro.", 'Syrup during the flow? Never heard of it.', 'Filtered? Define filtered.', 'Heated? Only a bit. Like 90 degrees.', "Lab test? I don't know her.", '46% of my jars are sus. The other 54% are also sus.', "It's honey. Technically.", "Mixed with imports? It's called fusion."],
      p2line: 'Fine. Full syrup. No more pretending.', p2attacks: ['syrupStorm'],
      defeat: "Fine. It's 46% honey.",
      lose: 'The Sus Beekeeper sold you syrup and called it raw.',
      attacks: ['toss', 'susRain', 'smoke', 'feeder'],
    },
    {
      key: 'colonex', name: 'Colonex', tag: 'Colonex', sub: 'Founder of Loksd Corporation. Loksd Corporation does not exist.', hp: 170, mono: true, joins: true, pace: 0.85, dmgMul: 1.1,
      intro: 'come work for loksd corporation',
      lines: ['come work for loksd corporation', 'loksd corporation can afford', 'loksd corporation board of directors will consider your request', 'loksd corporation does not require your financial assistance', 'you have been put on the blacklist of loksd corporation', '@Ja Ja Binka vc?', '@Ja Ja Binka vc?', 'vc anyone', 'i have j*b at my dads company', 'roblox is stupid game', 'stop playing roblox', 'you wanna play the stupid game for idiots in 20 minutes', '100$ fee for jan', '50$ unnecessary question fee'],
      p2line: 'loksd corporation has doubled all fees', p2attacks: ['doubleFees'],
      defeat: 'loksd corporation will remember this',
      defeat2: 'loksd corporation would like to sponsor you',
      lose: 'You have been put on the blacklist of Loksd Corporation.',
      attacks: ['fees', 'vc', 'factorio', 'jobs', 'crow', 'ski', 'gifs', 'cnc', 'roblox'],
    },
    {
      key: 'ceo', name: 'The App Founder', tag: 'App Founder', sub: 'Download his app. Track your honey. Never say the other app.', hp: 250, pace: 0.8, dmgMul: 1.08,
      intro: 'Download my app.',
      lines: ['Download my app.', 'Track your honey.', 'I only marry white women.', "Why aren't we getting views?", "You're fired!", 'You used to be my head of marketing!', "We don't say that name in this office.", 'Chess after this?', 'Who made this spreadsheet?', 'Did you track your honey today?', 'Rate us five stars.', "What's our MRR?", 'Churn is up. Who did this?', 'Downloads are flat. Why are downloads flat?', "We're pre-revenue. It's a strategy.", 'Our daily active users is three. One of them is me.', 'Can we A/B test the honey?', 'Push notifications fix churn.', 'Our CAC is higher than our LTV. Is that bad?', 'ARR is MRR times twelve. Put it on the slide.', 'We need to pivot. To honey.'],
      p2line: 'Checkmate in three.', p2attacks: ['checkmate'],
      defeat: "Fine. You're rehired. Chess tomorrow?",
      lose: 'The App Founder fired you. Nobody downloaded the app.',
      attacks: ['notify', 'sheets', 'bars', 'chess', 'knight', 'deenbuddy', 'fired', 'errors', 'knight'],
    },
    {
      key: 'lecturer', name: 'The Lecturer', tag: 'Lecturer', sub: 'Live from the studio. Judging your haircut. Asking about WhatsApp.', hp: 270, pace: 0.95, phonePace: 0.75, dmgMul: 1.1,
      intro: "I'm not interested to be religious but I don't have a choice. If I stay the same bum I am in the clubs of Manhattan, smoking grass all day, walking like a goy everywhere I go, what kind of a girl will I get?", // he opens with it, so everyone gets to read it
      lines: ["I'm not interested to be religious but I don't have a choice. If I stay the same bum I am in the clubs of Manhattan, smoking grass all day, walking like a goy everywhere I go, what kind of a girl will I get?",
        'Jew or goy? GOYYYYYYY', 'WHATSAPP? WHATSAPP??', 'Look at this haircut. Look at it!', 'Who cuts hair like this? Who?', 'Is this a Jewish haircut or a goy haircut?',
        'iPhone? iPhone?? Garbage!', 'Every day the same story.', 'Stop with the clubs.', "I'm telling you for your own good.", 'You want a good wife? Fix the hair first.',
        '?מה קורה', '!אתה גוי', '!תתעורר', '?מה זה הדבר הזה', '!די כבר'],
      p2line: "Now I'm serious. Listen to me!", p2attacks: ['goyBeam2', 'scream'],
      defeat: 'OK. OK. But fix the hair.',
      lose: 'The Lecturer asked what kind of a girl you will get. Nobody answered.',
      attacks: ['goyBeam', 'goyWords', 'susHoney', 'whatsapp', 'iphones', 'goyWords', 'scream'],
    },
    {
      key: 'ironfit', name: 'The Shilajit Coach', tag: 'Shilajit Coach', sub: 'No gym. Just pushups, pullups and a lot of shilajit.', hp: 300, pace: 0.7, dmgMul: 1.3,
      intro: "Don't eat this if you're not married.",
      lines: ["Don't eat this if you're not married.", 'Big man ting yeah', 'If you really have a premium product, raise your prices.', '1k for a story post.', 'No gym. Pushups and pullups.', '20 grams of creatine a day.', 'Watermelon juice and saffron water.', 'Day 1 of 500 pushups.', 'Lock in.', "Discipline is free. My shilajit isn't.", "Creatine, shilajit, saffron. That's the stack.", 'Premium product. Premium price. Simple.', 'Pushups in the morning. Pushups at night.', 'Raw honey? Respect. Still not shilajit.', 'No excuses. Only pushups.'],
      p2line: 'Day two. Lesgo.', p2attacks: ['ropeDouble'],
      defeat: 'Respect. Big man ting yeah.',
      lose: 'The Shilajit Coach charged you 1k for a story post.',
      attacks: ['rope', 'prices', 'pushups', 'resin', 'drinks', 'rope'],
    },
    {
      key: 'apologist', name: 'The Honey Apologist', tag: 'Honey Apologist', sub: 'Blends three countries in one jar and sticks a new flag on it.', hp: 370, pace: 0.8, phonePace: 0.8, dmgMul: 1.25,
      intro: 'Let me just check my notes.',
      lines: ['Let me just check my notes.', 'Blended, imported, relabelled. Perfection.', 'Ackshually that jar is from Uzbekistan.', "I'm just asking questions.", 'Why most honey you buy is a lie? Mine is the lie.', 'Single origin? Pick an origin. Any origin.', 'Interesting. Very interesting.', 'Answer the question. Yes or no.', 'Cross-examination time.', 'So you admit the honey is raw?', "Let's go to the label.", "The honey dilemma: either it's raw, or I'm right."],
      p2line: 'You managed to flip my annoy me switch.', p2attacks: ['dilemma2', 'axes', 'axeChop'],
      defeat: 'I need to... check my notes.',
      lose: 'The Honey Apologist blended you with three other countries.',
      attacks: ['blend', 'volley', 'dilemma', 'volley'],
    },
    {
      key: 'looks', name: 'The Looksmaxxer', tag: 'Looksmaxxer', sub: 'Live on stream. Rating your face. Selling the course.', hp: 430, pace: 0.75, dmgMul: 1.2,
      intro: "Chat, we're live. Rating this honey seller.",
      lines: ["Women won't buy your honey. You're sub 5.", "Your canthal tilt is why the honey isn't selling.", "At least you sell raw honey. But why don't you eat raw meat?", 'Mew harder.', 'Ur a Jeffrey.', 'Endocrine warfare is killing your T, bro.', "Trust me bro, I'm natty.", 'I hate Greg Doucette.', "Seed oils. That's why you're losing.", 'Barefoot on the earth, chat. Grounding.', 'Link in bio. $199 jawline course.', 'Monk mode. No sugar. Honey is sugar.', 'Banned on every platform. Watch me on my own site.', 'Forty thousand watching. Biggest stream ever.', "It's fine to take meth if it keeps you lean. Chat agrees."],
      p2line: "Chat, I'm ascending.", p2attacks: ['subathon'],
      defeat: "Chat... don't clip that.",
      lose: 'The Looksmaxxer rated you a 2 and sold you the course.',
      attacks: ['hypergamy', 'needles', 'ratings', 'pills', 'hypergamy', 'liver', 'courseAd', 'chatFlood', 'hypergamy', 'bonesmash'],
    },
    {
      key: 'disprover', name: 'The Disprover', tag: 'Disprover', sub: "Here to disprove atheism. You're in the way.", hp: 540, dmgMul: 1.05,
      intro: 'Atheists should stop eating honey.',
      lines: ['Atheists should stop eating honey.', 'Honey disproves atheism.', 'There is no manager bee.', 'Who taught the bee the dance?', 'The atheists did not know. The bee already knew.', "The bee made the... what's it called... the hexagon, guys.", 'Zero IQ. Zero IQ.', 'You are eating the mathematics.', 'Remind me again, atheist.', 'An explosion makes a mess. It does not make a hexagon.', 'Evolution is ended today. By the bee.', 'Why did the bee need to evolve honey? The ant was fine. The mosquito was fine.', 'Show me the half bee. Show me one half bee.', 'Which monkey taught the bee the hexagon? Remind me again.', 'Random mutation made the dance? Random mutation has no legs.', 'Your grandfather was a fish? Speak for yourself.'],
      p2line: 'Think. Think. Think.', p2attacks: ['quarkStorm'],
      defeat: '...Think.',
      lose: 'The Disprover proved his point. Zero IQ.',
      attacks: ['barrage', 'hexagons', 'missingLink', 'quarks', 'fishLegs', 'bigbang'],
    },
    {
      key: 'hornet', name: 'Vespa mandarinia', tag: 'Vespa mandarinia', sub: 'The northern giant hornet. It came for the hives.', hp: 580,
      intro: 'I am a talking hornet.',
      lines: ['I am a talking hornet.', "I don't make honey. I take it.", 'Thirty of us. Thirty thousand of you. Do the maths.', "I'm not invasive. I'm expanding.",
        "Murder hornet? It's called meal prep.", 'They misrepresented me in Ant-Man.', 'Your grandad has a tennis racket. I have a stinger.', 'Nice hive. Shame if someone raided it.',
        'Bees dance. Hornets eat.', 'October is my season.', 'Raw honey? I prefer raw bees.'],
      p2line: 'Fine. Bring your whole hive.', p2attacks: ['scouts', 'stingerFan', 'massacre', 'curtain2', 'spray'],
      p3line: 'Slaughter phase.', p3attacks: ['diveChain', 'spray', 'curtain2', 'bigStinger', 'swarm', 'diveChain', 'massacre', 'stingerFan'],
      p3at: 0.1, p3only: true, p3pace: 0.6, pace: 0.8, // faster than anyone, faster again in phase 2, nearly nonstop in the last 10%
      defeat: 'Tell Ant-Man... he was right.',
      lose: 'Vespa mandarinia raided the hive. Thirty of them. One of you.',
      attacks: ['bigStinger', 'minis', 'spray', 'hawk', 'curtain', 'nest', 'bigStinger', 'mark', 'stingAlly'],
    },
  ];

  let W = 0, H = 0, DPR = 1, WR = 1, G = 1, GT = 1, WX = 1, HS = 1, NF = 1, THUMB = 0; // G: halfway between fixed size and full width scaling; GT: gentler, for text
  // WX: how many times wider than 1100 px the screen is (never below 1). Wider screens get more of everything that's spread across the screen.
  function resize() {
    const r = stage.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    WR = Math.min(1, W / 1100); G = 0.5 + 0.5 * WR; GT = 0.5 + 0.5 * G; WX = Math.max(1, W / 1100);
    // Phones: on a shorter screen things fall more slowly, so they take as long to reach you as on a laptop; hits are a
    // little more forgiving on narrow screens; and on touch screens the spoon sits higher so your thumb can rest under it.
    HS = clamp(H / 640, 0.7, 1); NF = 0.85 + 0.15 * WR; THUMB = touchUI && H > 420 ? clamp(H * 0.05, 20, 36) : 0; // not on a phone held sideways
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildComb();
    if (spoon) spoon.y = H - spoonSize() * 0.9 - THUMB;
  }

  // ---------- comb ceiling ----------
  let comb = [];
  function hexR() { return Math.max(16, Math.min(26, W / 26)); }
  function buildComb() {
    comb = [];
    const r = hexR(), w = Math.sqrt(3) * r;
    for (let row = 0; row < 3; row++) {
      for (let x = (row % 2 ? w / 2 : 0) - w; x < W + w; x += w) {
        comb.push({ x, y: row * r * 1.5 - r * 0.6, r, fill: Math.random() < 0.8 ? 0.6 + Math.random() * 0.4 : 0, drip: 0 });
      }
    }
  }
  function hexPath(x, y, r, rot = Math.PI / 6) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 3 * i + rot;
      ctx[i ? 'lineTo' : 'moveTo'](x + r * Math.cos(a), y + r * Math.sin(a));
    }
    ctx.closePath();
  }
  function combBottom() { return hexR() * 3.4; }

  // ---------- state ----------
  let state = 'start', phase = 'harvest';
  let spoon, items, proj, globs, particles, floaters, puddles, sticky, ambient;
  let score, purity, combo, streak, addict, elapsed, spawnT, rush, shake, flash, hurtFlash, tally, lastHit, bossIdx, boss, praiseT;
  let bosses = []; // one boss, or two in crazy mode; `boss` is whichever one is acting right now
  let ev = null, evT = 0, lastEv = '', ally = null, heard = new Map(), seenFakes = new Set();
  const REVIVES = 2; // second chances per run, usable anywhere, and two more for endless mode
  let endless = false, endlessNext = 0, endlessRound = 0, revivesLeft = REVIVES, endlessSeen = {};
  let invincible = false, bot = false, frozen = false; // test switches, only reachable with #debug
  let shieldT = 0, shieldHits = 0, shieldMax = 0; // Honeycomb shield
  let brawl = null; // fight every boss at once: just for fun, nothing lost either way
  let runStats = { endlessFights: 0, crazyFights: 0, crazyTail: 0 }; // for the leaderboard
  let gore = [], beeDown = []; // body parts flying off (Terraria-style deaths); worker bees waiting to come back
  let upg, pcd, readyAt, bees = [], smokeT = 0, magnetT = 0, extractT = 0, extractRun = null, shedFromPause = false, allyQueue = null, shedSel = null, shedPending = null, shedPinned = false, hikeSaid = false, smokeSlow = 0.6, smokeDur = 3, magnetReach = 0.15;
  let knightHint = false, qd = null, savings = 0, fightSaved = 0, crazyOn = false, chat = null, fightHits = 0, comboT = 0, kgSpent = 0, endlessBag = [], lastEndless = -1;
  let best = { kg: 0, time: 0, endless: 0, brawl: 0 };
  try { const s = JSON.parse(localStorage.getItem('honey-gobbler-3') || '{}'); best.kg = +s.kg || 0; best.time = +s.time || 0; best.endless = +s.endless || 0; best.brawl = +s.brawl || 0; } catch (e) {}
  function saveBest() { try { localStorage.setItem('honey-gobbler-3', JSON.stringify(best)); } catch (e) {} lbSyncSoon(); }
  let achData = { done: {}, stats: {} };
  try { const s = JSON.parse(localStorage.getItem('honey-gobbler-ach') || '{}'); if (s.done) achData.done = s.done; if (s.stats) achData.stats = s.stats; } catch (e) {}
  function achMigrate() {
    if (achData.done.herp && (achData.stats.billed || 0) < 1e7) { delete achData.done.herp; achSave(); } // its goal went from 1 to 10 million (run at boot)
    const fh = achData.stats.fakeHits || 0; // Supermarket regular used to count fake hits only; those hits count towards the new total
    if (fh > (achData.stats.hurts || 0)) { achData.stats.hurts = fh; achSave(); achCheck('hurts'); }
  }
  let achPrev = null, toastQ = [], toastBusy = false;

  function spoonSize() { return Math.max(44, 70 * G); }
  function bossK() { const k = Math.min(1.3 * (0.3 + 0.7 * WR), Math.max(0.6, H / 520)); return brawl ? Math.min(k * 0.8, Math.max(0.36, laneW() / 200)) : k; } // smaller when everyone is on screen
  const brawlSlots = () => W >= 1000 ? 8 : W >= 760 ? 5 : W >= 520 ? 4 : 3; // how many fit side by side; the rest wait their turn
  const laneR = () => W - (W < 560 ? 64 : 76); // clear of the power buttons on the right
  const laneW = () => (laneR() - 6) / brawl.S;
  const laneX = (slot, f) => 6 + laneW() * (slot + f);
  function bossHome() { return combBottom() + 50 + 74 * bossK(); }
  function seasonIdx() { return endless ? SEASONS.length - 1 : Math.min(bossIdx, BOSS_COUNT - 1); }
  function endlessLevel() { return endless ? endlessRound + clamp((score - endlessNext + STAGE_KG) / STAGE_KG, 0, 1) : 0; }
  function nextEndless(avoid = []) { // shuffled like a deck: all seven before repeats, never the same one twice running, never one in avoid
    const no = k => k === lastEndless || avoid.includes(k);
    if (!endlessBag.some(k => !no(k))) endlessBag = [...Array(BOSS_COUNT).keys()].sort(() => Math.random() - .5).concat(endlessBag);
    let i = endlessBag.length - 1; while (no(endlessBag[i])) i--;
    return (lastEndless = endlessBag.splice(i, 1)[0]);
  }
  function fallMul() { return endless ? Math.min(8, 3 + 0.45 * endlessLevel()) : 1 + 2 * clamp(score / thresholdFor(BOSS_COUNT - 1), 0, 1); } // 1x at the start, 3x at the final boss
  function swarmZone() { return ev && ev.k === 'swarm' && ev.t > 1.2 && ev.t < 5.5 ? ev : null; } // while the swarm hovers over its half
  const fighting = b => b.mode === 'fight' || b.mode === 'dash';
  const anyFighting = () => bosses.some(fighting);
  function nearestFighting(x) { let best = null; for (const b of bosses) if (fighting(b) && (!best || Math.abs(b.x - x) < Math.abs(best.x - x))) best = b; return best; }

  function reset() {
    spoon = { x: W / 2, y: H - spoonSize() * 0.9 - THUMB, tx: W / 2, glow: 0, chew: 0, hurt: 0, fill: 0, tint: '#7cff6b', frozen: 0, slow: 0, drift: 0, venom: 0, venomDps: 0, sting: 0, vstack: 0, vstackT: 0, anaph: 0, mark: 0, vx: 0, px: W / 2 };
    items = []; proj = []; globs = []; particles = []; floaters = []; puddles = []; sticky = []; ambient = []; gore = []; beeDown = [];
    score = 0; purity = 100; combo = 1; streak = 0; comboT = 0; kgSpent = 0; endlessBag = []; lastEndless = -1; addict = 0; elapsed = 0; spawnT = 0.2; rush = 0; shake = 0; flash = 0; hurtFlash = 0; praiseT = 0;
    tally = { drops: 0, jars: 0, boxes: 0, comb: 0, labs: 0, bosses: 0, billed: 0, beeDrops: 0, spent: 0, shilajit: 0, saved: 0, bad: {}, minPurity: 100 };
    lastHit = null; bossIdx = 0; boss = null; bosses = []; phase = 'harvest'; ally = null;
    ev = null; evT = rnd(13, 17); lastEv = ''; heard = new Map(); seenFakes = new Set();
    endless = false; endlessNext = 0; endlessRound = 0; revivesLeft = REVIVES; endlessSeen = {};
    upg = { thick: 0, bee: 0, colonex: 0, smoker: 0, magnet: 0, extractor: 0, queen: 0, shield: 0, lab: 0, wax: 0, sweet: 0, hives: 0, crazy: 0 }; pcd = { smoker: 0, magnet: 0, extractor: 0, queen: 0, shield: 0, lab: 0 }; readyAt = { smoker: 0, magnet: 0, extractor: 0, queen: 0, shield: 0, lab: 0 };
    bees = []; smokeT = 0; magnetT = 0; extractT = 0; extractRun = null; shieldT = 0; shieldHits = 0; allyQueue = null; hikeSaid = false;
    qd = null; savings = 0; fightSaved = 0; crazyOn = false; chat = null; fightHits = 0; knightHint = false; brawl = null; runStats = { endlessFights: 0, crazyFights: 0, crazyTail: 0 };
    updateHud();
  }

  const fmtKg = kg => (Math.floor(kg * 10) / 10).toFixed(1) + ' kg';
  const fmtAdd = kg => kg < 1 ? Math.round(kg * 1000) + ' g' : (Math.round(kg * 10) / 10) + ' kg';
  const fmtMult = m => String(Math.round(m * 100) / 100);
  const fmtTime = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

  // ---------- HUD ----------
  const markers = [];
  for (let i = 0; i < BOSS_COUNT; i++) {
    const m = document.createElement('span');
    m.className = 'mk'; m.style.left = (thresholdFor(i) / GOAL * 100) + '%'; m.textContent = i + 1;
    $('track').appendChild(m); markers.push(m);
  }
  const SPEEDS = [1, 1.25, 1.5, 2, 2.5];
  let gameSpeed = 1;
  try { const v = +localStorage.getItem('honey-gobbler-speed'); if (SPEEDS.includes(v)) gameSpeed = v; } catch (e) {}
  const fmtSpeed = v => v + '×';
  function speedUi() {
    document.querySelectorAll('.speedIn').forEach(el => { el.value = SPEEDS.indexOf(gameSpeed); });
    document.querySelectorAll('.speedVal').forEach(el => { el.textContent = fmtSpeed(gameSpeed); });
  }
  document.querySelectorAll('.speedIn').forEach(el => el.addEventListener('input', () => {
    if (state === 'play') { speedUi(); return; } // only from the start and pause screens
    gameSpeed = SPEEDS[+el.value] || 1;
    try { localStorage.setItem('honey-gobbler-speed', String(gameSpeed)); } catch (e) {}
    speedUi(); if (spoon) updateHud();
  }));
  speedUi();
  const hudCache = {};
  function setText(id, v) { if (hudCache[id] !== v) { hudCache[id] = v; $(id).textContent = v; } }
  function setStyle(id, prop, v) { const key = id + prop; if (hudCache[key] !== v) { hudCache[key] = v; $(id).style[prop] = v; } }
  function updateHud() {
    setText('kg', fmtKg(score));
    let next;
    if (phase === 'boss') next = brawl ? 'everyone at once · ' + fmtTime(brawl.t) + ' · ' + (BOSS_COUNT - brawl.beaten) + ' left' : 'boss fight · shed +' + fmtAdd(fightSaved);
    else if (endless) next = (crazyOn ? 'Crazy' : 'Endless') + ' · next boss in ' + toNextBoss() + ' kg';
    else if (bossIdx >= BOSS_COUNT) next = 'sold out';
    else next = SEASONS[seasonIdx()].m + ' · next boss in ' + toNextBoss() + ' kg';
    if (gameSpeed !== 1 && W >= 560) next += ' · ' + fmtSpeed(gameSpeed); // no room for it on a phone
    setText('next', next);
    setText('combo', '×' + fmtMult(combo * (rush > 0 ? RUSH_MULT : 1)));
    setStyle('combo', 'color', rush > 0 ? 'var(--honey)' : '');
    setStyle('cfill', 'width', (combo > 1 ? Math.round(clamp(1 - comboT / comboGrace(), 0, 1) * 50) * 2 : 0) + '%'); // time left before it drops
    const p = Math.max(0, purity);
    setStyle('pfill', 'width', p + '%');
    setText('plabel', 'purity ' + Math.ceil(p) + '%');
    const low = p < 35 ? 'pbar low' : 'pbar';
    if (hudCache.pbar !== low) { hudCache.pbar = low; $('pbar').className = low; }
    setStyle('tfill', 'width', Math.min(100, score / GOAL * 100) + '%');
    markers.forEach((m, i) => {
      const c = 'mk' + (i < bossIdx ? ' done' : i === bossIdx && phase === 'boss' && !endless ? ' live' : '');
      if (m.className !== c) m.className = c;
    });
    updatePowerUi();
  }
  const touchUI = matchMedia('(hover: none)').matches;
  function updatePowerUi() {
    if (!upg) return;
    for (const k of PKEYS) {
      const id = 'pw-' + k, el = $(id), own = upg[k] > 0;
      if (el.hidden === own) el.hidden = !own;
      if (!own) continue;
      const p = Math.max(0, 1 - pcd[k] / PW[k](upg[k]).cd).toFixed(2);
      if (hudCache[id] !== p) { hudCache[id] = p; el.style.setProperty('--p', p); }
      const active = (k === 'smoker' && smokeT > 0) || (k === 'magnet' && magnetT > 0) || (k === 'extractor' && !!extractRun) || (k === 'queen' && !!qd) || (k === 'shield' && shieldHits > 0);
      const lockQ = k === 'queen' && !queenOk();
      const cls = 'pbtn' + (pcd[k] <= 0 && !lockQ && !(k === 'extractor' && extractRun) ? ' ready' : '') + (active ? ' active' : '') + (lockQ ? ' locked' : '');
      if (el.className !== cls) el.className = cls;
    }
  }

  // ---------- spawning ----------
  function spawnHarvest() {
    const sp = fallMul();
    const lvl = endlessLevel();
    const badChance = (endless ? Math.min(0.62, 0.32 + 0.04 * lvl) : 0.12 + bossIdx * 0.035) * (0.7 + 0.3 * WR);
    if (Math.random() < badChance) { spawnBad(sp); return; }
    let r = Math.random() * WX; // jars, boxes and the rest fall at the same rate on any screen; wider screens just get more drops
    const x = 30 + Math.random() * (W - 60), y = combBottom();
    const hv = upg.hives || 0, combP = 0.045 + 0.006 * hv, dropKg = (0.6 - 0.058 * hv) / (WX - 0.4 - 0.058 * hv); // keeps the drops' kilos per minute the same too
    if (r < combP) { purity < 100 ? items.push({ kind: 'comb', x, y, vy: 110 * sp, r: 16, rot: Math.random() * 6 }) : spawnDrop(sp, undefined, undefined, undefined, dropKg); return; }
    r -= combP;
    if (r < 0.015) { items.push({ kind: 'lab', x, y, vy: 120 * sp, r: 14, rot: 0 }); return; }
    r -= 0.015;
    if (r < 0.04) { items.push({ kind: 'shilajit', x, y, vy: 140 * sp, r: 19, rot: (Math.random() - .5) * .6, vr: (Math.random() - .5) * 2 }); return; }
    r -= 0.04;
    if (r < 0.02 + 0.012 * hv) { spawnBox(sp, x); return; }
    r -= 0.02 + 0.012 * hv;
    if (r < 0.28 + 0.04 * hv) { spawnJar(sp, x); return; }
    spawnDrop(sp, undefined, undefined, undefined, dropKg);
  }
  function spawnJar(sp, x) { items.push({ kind: 'jar', x, y: combBottom(), vy: (130 + Math.random() * 40) * sp, r: 19, rot: (Math.random() - .5) * .6, vr: (Math.random() - .5) * 2 }); }
  function spawnBox(sp, x) { items.push({ kind: 'box', x: clamp(x, 40, W - 40), y: combBottom(), vy: 150 * sp, r: 22, rot: (Math.random() - .5) * .3, vr: (Math.random() - .5) * .8 }); }
  function spawnDrop(sp, y, xMin, xMax, kgMul = 1) {
    let x;
    if (xMin !== undefined) x = rnd(xMin, xMax);
    else {
      const cells = comb.filter(c => c.y > 0 && c.fill > 0);
      const cell = cells.length ? pick(cells) : null;
      x = cell ? clamp(cell.x, 14, W - 14) : 30 + Math.random() * (W - 60);
      if (cell) cell.drip = 1;
    }
    const kg = rnd(0.05, 0.2);
    items.push({ kind: 'drop', kg: kg * kgMul, x, y: y ?? combBottom() - 6, vy: (90 + Math.random() * 60) * sp, r: 6 + (kg - 0.05) / 0.15 * 5, stretch: 1 });
  }
  function spawnBad(sp) {
    const pool = endless ? FAKES : FAKES.filter(f => f.stage <= bossIdx);
    const f = pick(pool);
    const toxin = f.type === 'toxin';
    const z = swarmZone();
    const base = z ? (z.side === 'L' ? rnd(W / 2 + 30, W - 30) : rnd(30, W / 2 - 30)) : 30 + Math.random() * (W - 60);
    const isNew = !seenFakes.has(f.name);
    seenFakes.add(f.name);
    items.push({
      kind: 'bad', f, x: base, y: combBottom(), isNew,
      vy: (toxin ? 110 : 85) * (1 + Math.random() * .5) * sp,
      phase: Math.random() * 6, amp: (toxin ? 12 + Math.random() * 20 : f.type === 'bag' ? 10 : 30 + Math.random() * 50) * G,
      base, r: toxin ? 14 : f.type === 'susjar' ? 18 : 21, seed: Math.random() * 100,
    });
  }
  function spawnBossHoney() { // same idea as spawnHarvest: wider screens get more drops, each a little lighter
    const sp = fallMul(), hv = upg.hives || 0;
    const c = 0.008 * hv; // Richer hives: more honeycombs as well
    const r = Math.random() * WX, x = 30 + Math.random() * (W - 60), y = combBottom(), dropKg = (0.63 - 0.048 * hv) / (WX - 0.37 - 0.048 * hv);
    if (r < 0.045 + c) { if (purity < 100) items.push({ kind: 'comb', x, y, vy: 110 * sp, r: 16, rot: Math.random() * 6 }); else spawnDrop(sp, undefined, undefined, undefined, dropKg); }
    else if (r < 0.075 + c) items.push({ kind: 'lab', x, y, vy: 120 * sp, r: 14, rot: 0 });
    else if (r < 0.105 + c) items.push({ kind: 'shilajit', x, y, vy: 140 * sp, r: 19, rot: 0, vr: (Math.random() - .5) * 2 });
    else if (r < 0.135 + 0.01 * hv + c) spawnBox(sp, x);
    else if (r < 0.37 + 0.048 * hv) spawnJar(sp, x);
    else spawnDrop(sp, undefined, undefined, undefined, dropKg);
  }

  // ---------- input ----------
  const keys = {};
  // Mouse: the spoon follows the pointer. Touch: drag anywhere, like a trackpad, so your thumb never covers the spoon.
  const TOUCH_GAIN = 1.4;
  let drag = null;
  function pointer(e) {
    if (!spoon) return;
    if (locked) { // the mouse is locked to the game: the spoon moves by however far the mouse moves
      if (e.type === 'pointermove' && Math.abs(e.movementX || 0) < 250) spoon.tx = clamp(spoon.tx + (e.movementX || 0), 20, W - 20); // ignores the odd bogus jump some browsers send
      else if (e.type === 'pointerdown' && e.button === 0 && state === 'play') fireReady();
      return;
    }
    const r = stage.getBoundingClientRect(), x = e.clientX - r.left;
    if (e.pointerType === 'mouse') { spoon.tx = clamp(x + spoon.drift, 20, W - 20); if (e.type === 'pointerdown' && e.button === 0 && e.target === cv && state === 'play') { lockMouse(); fireReady(); } return; }
    if (e.type === 'pointerdown' || !drag) { drag = { x0: x, s0: spoon.tx }; return; }
    const want = drag.s0 + (x - drag.x0) * TOUCH_GAIN, tx = clamp(want, 20, W - 20);
    spoon.tx = tx;
    if (tx !== want) drag = { x0: x, s0: tx };
  }
  // ---------- mouse lock ----------
  // On a computer the mouse locks to the game while you play, so it can't wander onto a second monitor. Escape frees it
  // and pauses; resuming or clicking back in locks it again. Phones and tablets never lock, and it can be switched off when paused.
  const canLock = !touchUI && typeof stage.requestPointerLock === 'function';
  let locked = false, lockPref = true, lockLostAt = -1e4, lockErrors = 0, lockAskT = -1e4, unlocking = false;
  try { lockPref = localStorage.getItem('honey-gobbler-lock') !== '0'; } catch (e) {}
  function lockMouse() {
    if (!canLock || !lockPref || lockErrors >= 3 || state !== 'play') return;
    if (locked) { if (!unlocking) return; } // a lock we're in the middle of releasing gets asked for again below
    const now = performance.now();
    if (now - lockLostAt < 1300 || now - lockAskT < 300) return; // browsers refuse to lock again straight after Escape
    lockAskT = now;
    try { const r = stage.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (e) { lockErrors++; }
  }
  function unlockMouse() { if (document.pointerLockElement) { unlocking = true; document.exitPointerLock(); } } // our own unlock never pauses
  document.addEventListener('pointerlockchange', () => {
    const was = locked;
    locked = document.pointerLockElement === stage;
    if (locked) lockErrors = 0;
    if (was && !locked) { lockLostAt = performance.now(); if (state === 'play' && !unlocking) togglePause(); } // Escape, or the browser taking it back
    if (!locked) unlocking = false;
  });
  document.addEventListener('pointerlockerror', () => { if (performance.now() - lockLostAt > 1500) lockErrors++; lockLabel(); }); // e.g. a page that isn't allowed to lock
  function lockLabel() {
    const el = $('lockBtn'); el.hidden = !canLock;
    el.disabled = false;
    el.textContent = lockErrors >= 3 ? 'Mouse lock: blocked, click to retry' : 'Mouse lock: ' + (lockPref ? 'on' : 'off');
  }
  $('lockBtn').addEventListener('click', () => { if (lockErrors >= 3) { lockErrors = 0; lockPref = true; } else lockPref = !lockPref; try { localStorage.setItem('honey-gobbler-lock', lockPref ? '1' : '0'); } catch (e) {} lockLabel(); });
  stage.addEventListener('pointermove', pointer);
  stage.addEventListener('pointerdown', pointer);
  ['pointerup', 'pointercancel'].forEach(t => stage.addEventListener(t, () => { drag = null; }));
  addEventListener('keydown', e => {
    keys[e.key] = true;
    if (!$('achScreen').hidden) { if (e.key === 'Escape') { e.preventDefault(); closeAch(); } return; }
    if (!$('lbScreen').hidden) { if (e.key === 'Escape') { e.preventDefault(); lbClose(); } else if (e.key === 'Enter' && document.activeElement === $('lbName')) { e.preventDefault(); lbSaveName(); } return; }
    if (state === 'shed' && shedFromPause && e.key === 'Escape') { e.preventDefault(); if ($('confirm').hidden) closeShed(); else cancelBuy(); return; }
    if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && (state === 'play' || state === 'pause')) {
      if (e.key === 'Escape' && state === 'pause' && performance.now() - lockLostAt < 500) return; // that Escape just freed the mouse and paused
      togglePause();
    }
    if (e.key.startsWith('Arrow') && !(state !== 'play' && e.target && e.target.classList && e.target.classList.contains('speedIn'))) e.preventDefault();
    if (state === 'play') {
      const pk = { 1: 'smoker', 2: 'magnet', 3: 'extractor', 4: 'queen', 5: 'shield', 6: 'lab' }[e.key];
      if (pk) firePower(pk);
      if (e.key === ' ' && !(e.target instanceof HTMLButtonElement)) { e.preventDefault(); fireReady(); }
    }
  });
  addEventListener('keyup', e => keys[e.key] = false);

  // ---------- sound ----------
  let ac = null, muted = false, audioUnlocked = false;
  // Phones only allow sound after a tap, mute web sound on an iPhone's silent switch, and pause it when you switch apps
  // or take a call. So: sound plays like a video (through the silent switch), and every tap wakes it up again if needed.
  function audio() {
    try { if (navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; } catch (e) {}
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    if (!ac) return;
    if (ac.state !== 'running') { try { const r = ac.resume(); if (r && r.catch) r.catch(() => {}); } catch (e) {} }
    if (!audioUnlocked) { // one silent sample inside the tap unlocks sound on older phones
      try { const b = ac.createBuffer(1, 1, 22050), src = ac.createBufferSource(); src.buffer = b; src.connect(ac.destination); src.start(0); audioUnlocked = true; } catch (e) {}
    }
  }
  ['pointerup', 'touchend', 'click', 'keydown'].forEach(t => addEventListener(t, () => { if (ac && ac.state !== 'running') audio(); }, { capture: true, passive: true }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden && ac && ac.state !== 'running') { try { ac.resume().catch(() => {}); } catch (e) {} } });
  function tone(f1, f2, dur, type = 'sine', vol = 0.15) {
    if (!ac || muted) return;
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur);
  }
  // The queen's buzz, rendered once into a buffer: a loud, deep wing buzz (two slightly detuned voices, a sub-octave,
  // a click on every wing stroke and some fuzz) that climbs as she charges in and drops as she flies past.
  let buzzBuf = null, lastBuzz = null;
  function prepBuzz() { if (ac && !buzzBuf) { const d = buildBuzz(ac.sampleRate); buzzBuf = ac.createBuffer(1, d.length, ac.sampleRate); buzzBuf.getChannelData(0).set(d); } }
  function buildBuzz(sr) {
    const n = Math.floor(sr * 1.45), out = new Float32Array(n);
    let seed = 7654321;
    const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; };
    const sm = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
    const bq = () => ({ b0: 0, b1: 0, b2: 0, a1: 0, a2: 0, x1: 0, x2: 0, y1: 0, y2: 0 });
    const set = (f, type, fc, Q) => {
      const w = TAU * fc / sr, al = Math.sin(w) / (2 * Q), c = Math.cos(w), a0 = 1 + al;
      if (type === 'bp') { f.b0 = al / a0; f.b1 = 0; f.b2 = -al / a0; }
      else if (type === 'lp') { f.b0 = f.b2 = (1 - c) / 2 / a0; f.b1 = (1 - c) / a0; }
      else { f.b0 = f.b2 = (1 + c) / 2 / a0; f.b1 = -(1 + c) / a0; }
      f.a1 = -2 * c / a0; f.a2 = (1 - al) / a0;
    };
    const run = (f, x) => { const y = f.b0 * x + f.b1 * f.x1 + f.b2 * f.x2 - f.a1 * f.y1 - f.a2 * f.y2; f.x2 = f.x1; f.x1 = x; f.y2 = f.y1; f.y1 = y; return y; };
    const B1 = bq(), B2 = bq(), HP = bq(), LP = bq();
    set(B1, 'bp', 850, 1.3); set(B2, 'bp', 2100, 2.2); set(HP, 'hp', 75, 0.707); set(LP, 'lp', 4800, 0.707);
    let p1 = 0, p2 = 0, p3 = 0;
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      // the wings: a low drone that climbs as she charges in, then drops as she flies past
      const f0 = (140 + 75 * sm(0, 0.6, t) - 100 * sm(0.62, 1.15, t)) * (1 + 0.018 * Math.sin(TAU * 7 * t) + 0.01 * Math.sin(TAU * 12.7 * t));
      p1 += f0 / sr; p1 -= Math.floor(p1);
      p2 += f0 * 1.013 / sr; p2 -= Math.floor(p2);
      p3 += f0 * 0.5 / sr; p3 -= Math.floor(p3);
      const click = p1 < 0.1 ? 1 : -0.11; // each wing stroke
      const fuzz = rand() * (p1 < 0.35 ? 1 : 0.35);
      const src = 0.55 * (2 * p1 - 1) + 0.45 * (2 * p2 - 1) + 0.3 * (2 * p3 - 1) + 0.45 * click + 0.3 * fuzz;
      let v = src * 0.6 + run(B1, src) * 1.5 + run(B2, src) * 0.5;
      v = run(HP, run(LP, v));
      const env = (1 - Math.exp(-t / 0.03)) * (0.7 + 0.3 * sm(0, 0.55, t)) * (t < 1.05 ? 1 : Math.exp(-(t - 1.05) / 0.12));
      out[i] = Math.tanh(2.4 * v * env * (1 + 0.15 * Math.sin(TAU * 29 * t)));
    }
    let peak = 0; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(out[i]));
    for (let i = 0; i < n; i++) out[i] *= 0.95 / peak;
    return out;
  }
  const seq = (notes, gap, type = 'triangle', vol = 0.1, dur = 0.14) => notes.forEach((f, i) => setTimeout(() => tone(f, f * 1.01, dur, type, vol), i * gap));
  const sfx = {
    drop: () => tone(520 + combo * 60, 260, 0.09, 'sine', 0.12),
    jar: () => { tone(300, 160, 0.14, 'triangle', 0.16); setTimeout(() => tone(420, 220, 0.12, 'triangle', 0.12), 70); },
    box: () => { tone(160, 90, 0.2, 'triangle', 0.2); setTimeout(() => seq([523, 659, 784, 1046], 50, 'triangle', 0.1, 0.12), 90); },
    comb: () => seq([523, 659, 784], 70, 'triangle', 0.12, 0.18),
    bad: () => { tone(180, 60, 0.35, 'sawtooth', 0.14); tone(95, 70, 0.3, 'square', 0.08); },
    rush: () => seq([392, 523, 659, 784, 1046], 60, 'square', 0.06, 0.12),
    fling: () => tone(380, 900, 0.08, 'sine', 0.05),
    hit: () => tone(240, 110, 0.07, 'square', 0.05),
    crunch: () => { tone(900, 140, 0.07, 'square', 0.07); setTimeout(() => tone(160, 60, 0.12, 'sawtooth', 0.09), 40); }, // a worker bee gets got
    zip: () => tone(420, 1500, 0.12, 'sawtooth', 0.035), // a mini hornet lunges
    blip: mono => mono ? [0, 90, 180].forEach(d => setTimeout(() => tone(250, 250, 0.06, 'square', 0.025), d)) : tone(640 + Math.random() * 180, 560, 0.04, 'square', 0.02),
    warn: () => { tone(880, 880, 0.09, 'square', 0.05); setTimeout(() => tone(880, 880, 0.09, 'square', 0.05), 150); },
    boom: () => tone(120, 30, 0.6, 'sawtooth', 0.16),
    thud: () => tone(90, 40, 0.3, 'triangle', 0.2),
    whoosh: () => tone(200, 900, 0.25, 'sawtooth', 0.05),
    caw: () => { tone(900, 500, 0.12, 'sawtooth', 0.04); setTimeout(() => tone(850, 480, 0.14, 'sawtooth', 0.04), 160); },
    ring: () => seq([660, 880, 660, 880], 130, 'sine', 0.05, 0.11),
    lab: () => seq([1200, 900, 1500], 70, 'sine', 0.08, 0.12),
    hum: () => tone(118, 121, 0.5, 'sine', 0.012),
    ready: () => tone(880, 1320, 0.12, 'sine', 0.05),
    buy: () => seq([659, 784, 988], 60, 'triangle', 0.09, 0.12),
    smoke: () => tone(300, 120, 0.6, 'sawtooth', 0.03),
    ach: () => seq([784, 988, 1175, 1568], 70, 'triangle', 0.08, 0.14),
    buzz: () => { // the queen's buzz (see buildBuzz), pitched a little differently each time
      if (!ac || muted) return;
      prepBuzz();
      if (lastBuzz) { try { lastBuzz.g.gain.setTargetAtTime(0, ac.currentTime, 0.04); lastBuzz.s.stop(ac.currentTime + 0.2); } catch (e) {} }
      const src = ac.createBufferSource(), g = ac.createGain();
      src.buffer = buzzBuf; src.playbackRate.value = rnd(0.95, 1.05); g.gain.value = 0.2;
      src.connect(g).connect(ac.destination); src.start();
      lastBuzz = { s: src, g };
    },
    pour: n => tone(360 + n, 380 + n, 0.12, 'triangle', 0.035),
    bossIn: () => { tone(98, 49, 0.8, 'sawtooth', 0.1); setTimeout(() => tone(147, 73, 0.8, 'sawtooth', 0.08), 140); },
    phase2: () => seq([196, 185, 175, 165], 90, 'sawtooth', 0.07, 0.2),
    bossDown: () => seq([784, 659, 523, 392, 523, 784, 1046], 80, 'triangle', 0.1),
    win: () => seq([523, 659, 784, 1046, 784, 1046, 1318], 110, 'square', 0.06, 0.16),
  };
  $('pauseBtn').addEventListener('click', () => { if (state === 'play') togglePause(); }); // phones have no P or Esc key
  $('mute').addEventListener('click', () => { muted = !muted; $('mute').textContent = muted ? 'Sound off' : 'Sound on'; audio(); });

  // ---------- effects ----------
  function splat(x, y, color, n = 10) {
    if (reduceMotion) n = Math.ceil(n / 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, s = 60 + Math.random() * 180;
      particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120, r: 2 + Math.random() * 4, life: 0.6 + Math.random() * 0.4, color });
    }
  }
  // Floating text never sits on top of other floating text: the newest keeps its spot and anything older that it would
  // cover slides up out of the way. Only two big banners show at once, and a message that's already up is refreshed, not doubled.
  function floatText(x, y, text, color = '#f6e3b4', big = false, sub = '') {
    const same = floaters.find(f => f.text === text && f.big === big && Math.abs(f.x - x) < 80 && Math.abs(f.y0 - y) < 80);
    if (same) { floaters.splice(floaters.indexOf(same), 1); Object.assign(same, { x, y, y0: y, color, sub, life: big ? 1.5 : 1 }); floaters.push(same); return; }
    if (big) { const bigs = floaters.filter(f => f.big && f.life > 0.35); if (bigs.length >= 2) bigs[0].life = 0.35; }
    floaters.push({ x, y, y0: y, oy: 0, text, sub, color, big, life: big ? 1.5 : 1 });
  }
  function measureFloater(f) {
    if (f.big) f.fs = fitFont(f.text, Math.round(clamp(38 * GT, 28, 38)), 900, 'Gluten, cursive', W - 32);
    else { f.fs = Math.round(clamp(16 * GT, 13, 16)); ctx.font = `700 ${f.fs}px Gluten, cursive`; }
    f.w = ctx.measureText(f.text).width; f.h = f.fs * 1.05;
    if (f.sub) { f.sfs = Math.round(clamp(16 * GT, 13, 16)); ctx.font = `700 ${f.sfs}px Gluten, cursive`; f.w = Math.max(f.w, ctx.measureText(f.sub).width); f.h += f.sfs * 1.35; }
    f.dx = clamp(f.x, f.w / 2 + 6, Math.max(f.w / 2 + 6, W - f.w / 2 - 6)); // never hangs off the side of the screen
  }
  function layoutFloaters(dt) {
    const placed = [], pad = 3;
    for (let i = floaters.length - 1; i >= 0; i--) { // newest first
      const f = floaters[i];
      measureFloater(f);
      const l = f.dx - f.w / 2 - pad, r = f.dx + f.w / 2 + pad, top = f.y - f.fs * 0.55;
      let want = 0;
      for (let k = 0; k < 24; k++) {
        const t0 = top + want, b0 = t0 + f.h + pad;
        const hit = placed.find(q => l < q.r && r > q.l && t0 < q.b && b0 > q.t);
        if (!hit) break;
        want = hit.t - f.h - pad - top; // sit just above whatever is in the way
      }
      f.oy += (want - f.oy) * Math.min(1, dt * 12);
      placed.push({ l, r, t: top + f.oy, b: top + f.oy + f.h + pad });
    }
  }
  function hear(who, text) { if (!heard.has(who)) heard.set(who, new Set()); heard.get(who).add(text); }
  function lineDur(text) { return Math.max(8, Math.min(22, 2.4 + text.split(' ').length * 0.7)); }
  function lsay(b, text) { return say(text, { force: !(b.say && b.say.t > 1 && b.say.text.length > 60) }, b); } // shouts over short lines, never over a long one
  function say(text, o = {}, b = boss) {
    if (!b) return false;
    if (!o.force && b.say && b.say.t > 1) return false;
    if (!o.force && b.recent.includes(text)) return false; // a line can't come back until two other lines have been said
    if (!o.force && brawl) { const talk = bosses.filter(x => x !== b && x.say && x.say.t > 0.5); if (talk.length >= 2 || talk.some(x => Math.abs(x.x - b.x) < Math.min(250, W * 0.44) + 24)) return false; } // everyone at once: two at a time, never side by side
    b.say = { text, t: o.dur || lineDur(text) };
    b.recent.push(text); if (b.recent.length > 2) b.recent.shift();
    hear(b.def.name, text);
    sfx.blip(b.def.mono);
    return true;
  }
  function seasonBanner() {
    const s = SEASONS[seasonIdx()];
    floatText(W / 2, H * 0.44, s.m, s.col, true, s.name);
  }

  // ---------- eating ----------
  function startRush() { rush = RUSH_TIME; addict = 0; sfx.rush(); floatText(W / 2, H * 0.5, 'THIS STUFF IS BANGING!', '#ffd36b', true); }
  function heal(n) { const before = purity; purity = Math.min(100, purity + n); return purity - before; }
  function fillAddict(n) {
    if (rush > 0 || !n) return;
    addict = Math.min(1, addict + n);
    if (addict >= 1) startRush();
  }
  function eat(it) {
    const mult = combo * (rush > 0 ? RUSH_MULT : 1);
    const kind = it.kind;
    spoon.chew = 0.25; spoon.fill = Math.min(1, spoon.fill + (kind === 'drop' ? .12 : .45));
    const kg = kind === 'drop' ? it.kg : (KG[kind] || 0);
    if (kind === 'drop') { tally.drops++; sfx.drop(); splat(it.x, it.y, '#b05a14', 6); }
    else if (kind === 'jar') { tally.jars++; sfx.jar(); splat(it.x, it.y, '#8a3a0e', 16); }
    else if (kind === 'box') { tally.boxes++; sfx.box(); splat(it.x, it.y, '#c89a5b', 18); floatText(it.x, it.y - 40, 'Box of honey!', '#ffd36b'); }
    else if (kind === 'comb') { tally.comb++; sfx.comb(); splat(it.x, it.y, '#f2a516', 16); }
    else if (kind === 'shilajit') { startRush(); floatText(it.x, it.y - 34, "Don't eat this if you're married", '#ffd36b'); splat(it.x, it.y, '#2b1406', 16); tally.shilajit++; achStat('shilajit', tally.shilajit); }
    else if (kind === 'lab') labTest();
    const h = heal(kind === 'comb' && phase === 'boss' ? COMB_FIGHT() : HEAL[kind] || 0);
    if (kind === 'comb') floatText(it.x, it.y - 34, "Grandad's comb +" + Math.round(h) + '%', '#ffe9a8');
    else if (kind === 'box' && h >= 1) floatText(it.x, it.y - 62, '+' + Math.round(h) + '% purity', '#ffe9a8');
    fillAddict(FILL[kind]);
    streak++; comboT = 0;
    const oldCombo = combo;
    combo = Math.min(comboCap(), 1 + 0.5 * Math.floor(streak / 5));
    if (combo > oldCombo && praiseT <= 0) { floatText(spoon.x, spoon.y - 70, pick(PRAISE), '#ffd36b'); praiseT = 2.5; }
    if (combo >= 5) achUnlock('sugar');
    if (phase === 'harvest' && kg) {
      const add = kg * mult;
      floatText(it.x, it.y - 10, '+' + fmtAdd(kg) + (mult > 1 ? ' ×' + fmtMult(mult) : ''), kind === 'drop' ? '#f6e3b4' : '#ffd36b');
      addKg(add);
    } else if (phase === 'boss') {
      if (kg) fightKg(kg, it.x, it.y);
      if (anyFighting() && kind !== 'lab') {
        globs.push({ x: spoon.x, y: spoon.y - 20, vx: 0, vy: -760, dmg: DMG[kind] * thickMul(upg.thick) * (rush > 0 ? RUSH_MULT : 1), r: (kind === 'drop' ? 7 : 11) * G * (1 + 0.04 * upg.thick), lv: upg.thick });
        sfx.fling();
      }
    }
  }
  // Honey eaten during a boss fight goes into Grandad's Shed savings at its plain weight (no combo, no Addictive bonus).
  // It never counts towards the next boss, so a long fight can't skip a harvest.
  function fightKg(kg, x, y) {
    if (brawl) return; // no honey from fighting everyone at once
    savings += kg; fightSaved += kg; tally.saved += kg;
    floatText(x, y - 10, '+' + fmtAdd(kg), '#e9d7ff');
  }
  function addKg(n) {
    score += n; achAdd('harvested', n, true);
    if (phase !== 'harvest') return;
    if (endless) {
      if (score >= endlessNext) {
        score = endlessNext;
        const avoid = endlessRound === 0 ? [BOSS_COUNT - 1] : []; // you've just beaten the last story boss
        const a = nextEndless(avoid);
        if (crazyOn) startFight([a, nextEndless(avoid.concat(a))], true);
        else startFight([a], true);
      }
    } else if (bossIdx < BOSS_COUNT && score >= thresholdFor(bossIdx)) { score = thresholdFor(bossIdx); startBoss(bossIdx); }
  }
  function labTest(dmg = 5) {
    tally.labs++;
    items.forEach(i => { if (i.kind === 'bad') splat(i.x, i.y, i.f.color, 8); });
    items = items.filter(i => i.kind !== 'bad');
    const body = p => p.k === 'nest' || p.k === 'scout' || p.k === 'mini'; // hornets aren't fakes: they stay
    proj.forEach(p => { if (!body(p) && !(p.delay > 0)) splat(p.x || W / 2, p.y || H / 2, '#9be7ff', 5); });
    proj = proj.filter(body);
    sticky.forEach(s => splat(s.x, H - 10, '#9be7ff', 6));
    sticky = [];
    flash = 0.5; sfx.lab();
    floatText(W / 2, H * 0.42, 'LAB RESULTS: SUS', '#9be7ff', true);
    bosses.filter(fighting).forEach(b => damageBoss(dmg, b));
    achAdd('labs', 1);
  }
  function hurtSpoon(dmg, color, name, opts = {}) {
    if (spoon.hurt > 0 || state !== 'play') return false;
    if (opts.boss && opts.boss.def && opts.boss.def.dmgMul) dmg = Math.round(dmg * opts.boss.def.dmgMul); // some bosses hit harder
    if (shieldHits > 0) { // the Honeycomb shield takes it (the giant stinger goes straight through the wax)
      if (opts.pierce) shieldHits = 1;
      shieldHits--; spoon.hurt = 0.35; spoon.tint = '#ffd36b'; shake = reduceMotion ? 0 : 4; sfx.hit();
      floatText(spoon.x, spoon.y - 58, shieldHits ? 'Blocked' : 'Shield cracked', '#ffd36b');
      for (let i = 0; i < 5; i++) splat(spoon.x + rnd(-24, 24), spoon.y - 24 + rnd(-12, 12), '#f2a516', 5);
      if (!shieldHits) shieldT = 0;
      return false;
    }
    if (opts.boss && endless) dmg = Math.round(dmg * (1 + Math.min(1.5, 0.04 * lvOf(opts.boss)))); // endless bosses hit 4% harder per level, slowly up to +150%
    if (upg.wax) dmg = Math.max(1, Math.round(dmg * (1 - 0.05 * upg.wax))); // Beeswax coating
    if (!invincible) { purity = Math.max(0, purity - dmg); tally.minPurity = Math.min(tally.minPurity, purity); }
    if (combo > 1) { combo = Math.max(1, combo - 0.5); streak = (combo - 1) * 10; } else streak = 0;
    addict = Math.max(0, addict - 0.25);
    spoon.hurt = 0.9; spoon.tint = color; shake = reduceMotion ? 0 : 10; hurtFlash = 0.45; sfx.bad();
    achAdd('hurts', 1, true);
    tally.bad[name] = (tally.bad[name] || 0) + 1;
    lastHit = { name, boss: opts.boss || null, toxin: !!opts.toxin };
    if (phase === 'boss') fightHits++;
    if (chat) chatReact("IT'S OVER");
    floatText(spoon.x, spoon.y - 58, opts.notation ? opts.notation + (purity <= 0 ? '#' : '+') : name + '!', color); // chess pieces: check, or mate if it ends your run
    floatText(spoon.x, spoon.y - 36, '−' + dmg + '% purity', '#ff9a8a');
    if (purity <= 0) gameOver();
    return true;
  }

  // ---------- powers bought in Grandad's Shed ----------
  function firePower(k) {
    if (state !== 'play' || !k || !upg[k] || pcd[k] > 0) return false;
    if (k === 'queen' && (qd || !queenOk())) { if (!qd) floatText(spoon.x, spoon.y - 74, 'The queen only fights bosses', '#ffd36b'); return false; }
    const st = PW[k](upg[k]);
    if (k === 'extractor') { // runs until it has pulled in its full amount; the cooldown starts when it's done
      if (extractRun) return false;
      extractRun = { left: st.grab, got: 0, t: 0, next: 0 };
      floatText(W / 2, H * 0.42, 'EXTRACTOR', '#ffd36b', true); sfx.whoosh();
      updatePowerUi();
      return true;
    }
    pcd[k] = st.cd;
    if (k === 'smoker') { smokeT = smokeDur = st.dur; smokeSlow = st.slow; floatText(W / 2, H * 0.42, 'SMOKER', '#e8e2d4', true); sfx.smoke(); }
    else if (k === 'magnet') { magnetT = st.dur; magnetReach = st.reach; floatText(W / 2, H * 0.42, 'HONEY MAGNET', '#ffd36b', true); sfx.comb(); }
    else if (k === 'lab') labTest(Math.round(st.dmg));
    else if (k === 'shield') { shieldT = st.dur; shieldHits = shieldMax = st.hits; floatText(W / 2, H * 0.42, 'HONEYCOMB SHIELD', '#ffd36b', true); sfx.comb(); }
    else launchQueen(st);
    updatePowerUi();
    return true;
  }
  function fireReady() { // a click fires whichever power has been ready the longest
    let best = null;
    for (const k of PKEYS) if (upg[k] && pcd[k] <= 0 && !(k === 'queen' && (qd || !queenOk())) && !(k === 'extractor' && extractRun) && (!best || readyAt[k] < readyAt[best])) best = k;
    return firePower(best);
  }
  const EXTRACT_ALL_TIME = 6, EXTRACT_GAP = 0.12; // the top level pulls in everything for 6 s; one piece every 0.12 s
  const extractable = () => items.filter(it => it.kind !== 'bad' && !it.suck && !it.held);
  // Only honey the extractor itself pulls in counts towards its amount: honey you or your bees catch doesn't.
  function updateExtract(dt) {
    const r = extractRun;
    if (!r) return;
    r.t += dt; r.next -= dt;
    if (r.left <= 0 || (r.left === Infinity && r.t > EXTRACT_ALL_TIME)) { endExtract(); return; }
    if (r.next > 0) return;
    let c = extractable();
    if (!c.length) return;
    const d = it => Math.hypot(it.x - spoon.x, it.y - spoon.y);
    if (magnetT > 0) { const R = magR(), out = c.filter(it => Math.hypot(it.x - spoon.x, it.y - spoon.y + 10) > R); if (out.length) c = out; } // the magnet already has the near ones
    const it = c.reduce((a, b) => (d(a) <= d(b) ? a : b)); // the nearest piece first
    it.suck = { t: 0, x0: it.x, y0: it.y }; if (it.bee) it.bee.tgt = null;
    r.left--; r.got++; r.next = EXTRACT_GAP; extractT = 0.7;
    tone(500 + Math.min(r.got, 20) * 25, 700 + Math.min(r.got, 20) * 25, 0.06, 'sine', 0.04);
  }
  function endExtract() {
    const r = extractRun; if (!r) return;
    extractRun = null;
    if (upg.extractor) pcd.extractor = PW.extractor(upg.extractor).cd;
    if (spoon && state === 'play') floatText(spoon.x, spoon.y - 84, 'Extracted ' + r.got, '#ffd36b');
    sfx.comb(); updatePowerUi();
  }
  function updatePowers(dt) {
    smokeT = Math.max(0, smokeT - dt); magnetT = Math.max(0, magnetT - dt); extractT = Math.max(0, extractT - dt);
    if (shieldT > 0) { shieldT -= dt; if (shieldT <= 0) { shieldT = 0; if (shieldHits) floatText(spoon.x, spoon.y - 58, 'Shield wore off', '#e8e2d4'); shieldHits = 0; } }
    updateExtract(dt);
    for (const k of PKEYS) if (upg[k] && pcd[k] > 0) { pcd[k] -= dt; if (pcd[k] <= 0) { pcd[k] = 0; readyAt[k] = elapsed; sfx.ready(); } }
  }
  // ---------- the queen bee ----------
  // A warning line, a loud buzz, then a charge through the boss, once per charge.
  function launchQueen(st) { // she only comes out for bosses
    floatText(W / 2, H * 0.42, 'QUEEN BEE', '#ffd36b', true);
    const fromL = spoon.x > W / 2;
    qd = { mode: 'boss', st: 'enter', t: 0, left: st.charges, dmg: st.dmg, x: fromL ? -90 : W + 90, y: H * 0.45, ang: fromL ? 0 : Math.PI, tgt: null };
  }
  const queenScale = () => 1.45 * Math.max(0.7, G);
  const queenEdge = () => Math.max(W * 0.08, 80 * queenScale());
  const queenOk = () => phase === 'boss' && bosses.some(b => b.mode === 'intro' || fighting(b));
  function queenTarget() {
    const f = bosses.filter(fighting);
    if (!f.length) return null;
    if (f.length > 1 && qd) return f.reduce((a, c) => (Math.abs(a.x - qd.x) >= Math.abs(c.x - qd.x) ? a : c)); // two at once: aim at the far one, through the near one
    return f.reduce((a, c) => (a.hp <= c.hp ? a : c));
  }
  function queenTrail(n = 1) {
    if (reduceMotion) return;
    for (let i = 0; i < n; i++) particles.push({ x: qd.x - Math.cos(qd.ang) * 55 * G, y: qd.y - Math.sin(qd.ang) * 55 * G + rnd(-4, 4), vx: rnd(-30, 30), vy: rnd(-10, 50), r: rnd(2, 4.5), life: .8, color: pick(['#f2a516', '#ffd36b', '#e08e0b']) });
  }
  function updateQueen(dt) {
    if (!qd) return;
    qd.t += dt;
    if (qd.st === 'exit') {
      qd.x += Math.cos(qd.ang) * 900 * dt; qd.y += Math.sin(qd.ang) * 900 * dt; queenTrail();
      if (qd.x < -200 || qd.x > W + 200 || qd.y < -200 || qd.y > H + 200) qd = null;
      return;
    }
    if (qd.st === 'go') { // straight through the boss and out the other side
      const sp = 1500 * Math.max(0.7, G), tg = qd.tgt;
      qd.x += qd.vx * sp * dt; qd.y += qd.vy * sp * dt; queenTrail(2);
      const qr = 70 * queenScale(); // she smashes boss attacks she flies through (not the warning lines or the ground)
      for (const p of proj) if (p.owner && !p.dead && (!p.harmless || p.k === 'knight') && !(p.delay > p.t) && Math.hypot(p.x - qd.x, p.y - qd.y) < qr + (p.r || 14)) { p.dead = true; splat(p.x, p.y, '#f2a516', 5); }
      const fl = bosses.filter(fighting);
      if (fl.length > 1) { // two at once: she bends a little towards the next one ahead of her, so one charge goes through both
        const ahead = fl.filter(ob => !qd.hitList.includes(ob) && (ob.x - qd.x) * qd.vx + (ob.y - qd.y) * qd.vy > 0);
        const next = ahead.sort((a, c) => Math.hypot(a.x - qd.x, a.y - qd.y) - Math.hypot(c.x - qd.x, c.y - qd.y))[0];
        if (next) {
          const cur = Math.atan2(qd.vy, qd.vx), want = Math.atan2(next.y - qd.y, next.x - qd.x);
          const a = cur + clamp(Math.atan2(Math.sin(want - cur), Math.cos(want - cur)), -3 * dt, 3 * dt);
          qd.vx = Math.cos(a); qd.vy = Math.sin(a); qd.ang = a;
        }
      }
      for (const ob of fl) { // each boss she flies through takes the hit
        if (qd.hitList.includes(ob) || Math.hypot(ob.x - qd.x, ob.y - qd.y) >= 62 * bossK()) continue;
        qd.hitList.push(ob); shake = reduceMotion ? 0 : 8;
        if (ob.def.key === 'hornet') { ob.queenUsed = true; say('Yo cuh stop doin dat', { force: true }, ob); }
        for (let i = 0; i < 3; i++) splat(ob.x + rnd(-30, 30), ob.y + rnd(-30, 30), '#f2a516', 10);
        floatText(ob.x, ob.y - 30 * bossK(), 'ROYAL CHARGE', '#ffd36b');
        damageBoss(qd.dmg, ob);
        if (ob.mode === 'down') achUnlock('royal');
        else if (fighting(ob)) ob.atkT = Math.max(ob.atkT, 0) + 1; // knocked off his next attack for a second
        if (state !== 'play' || !qd) return;
        if (ob.def.key === 'hornet' && fighting(ob)) { // below the top level the hornet gets her partway through her attack
          qd.hornetHits = (qd.hornetHits || 0) + 1;
          const lv = upg.queen || 0, charges = PW.queen(lv).charges;
          if (lv < MAX_LV && qd.hornetHits >= charges - 1) { killQueen(); return; }
        }
      }
      for (const n of proj) if ((n.k === 'nest' || n.k === 'scout') && !n.dead && Math.hypot(n.x - qd.x, n.y - qd.y) < 70 * queenScale() + n.r) { n.dead = true; if (n.k === 'scout') scoutDown(n); else nestDown(n); } // she smashes nests and scouts
      if (qd.x < -110 || qd.x > W + 110 || qd.y < combBottom() - 60 || qd.y > H + 60 || qd.t > (fl.length > 1 ? 1.8 : 1.3)) {
        qd.left--;
        if (qd.left > 0 && phase === 'boss' && anyFighting()) { qd.st = 'enter'; qd.t = 0; qd.tgt = null; qd.x = clamp(qd.x, -90, W + 90); qd.y = clamp(qd.y, combBottom() + 40, H * 0.7); }
        else { qd.st = 'exit'; qd.ang = qd.x < W / 2 ? -2.2 : -0.9; }
      }
      return;
    }
    const tg = qd.tgt && fighting(qd.tgt) ? qd.tgt : (qd.tgt = queenTarget());
    if (!tg) {
      if (phase === 'boss' && bosses.some(b => b.mode === 'intro') && qd.t < 5) { qd.x += ((qd.x < W / 2 ? queenEdge() : W - queenEdge()) - qd.x) * Math.min(1, dt * 5); return; } // wait for the boss to land
      qd.st = 'exit'; qd.ang = qd.x < W / 2 ? -2.2 : -0.9; return;
    }
    if (qd.st === 'enter') { // glide to her side of the screen, level with the boss
      const lx = qd.x < W / 2 ? queenEdge() : W - queenEdge(), f2b = bosses.filter(fighting);
      let ly = tg.y + 20 * bossK();
      if (f2b.length > 1) { const [a, c] = f2b; ly = a.y + (c.y - a.y) * (lx - a.x) / ((c.x - a.x) || 1) + 20 * bossK(); } // on the line through both
      ly = clamp(ly, combBottom() + 60, H * 0.6);
      qd.x += (lx - qd.x) * Math.min(1, dt * 6); qd.y += (ly - qd.y) * Math.min(1, dt * 6);
      qd.ang = Math.atan2(tg.y - qd.y, tg.x - qd.x); queenTrail();
      if (qd.t > 0.55) { qd.st = 'tele'; qd.t = 0; }
      return;
    }
    qd.ang = Math.atan2(tg.y - qd.y, tg.x - qd.x); // 'tele': the warning line, then the buzz
    if (qd.t > 0.5) {
      const d = Math.hypot(tg.x - qd.x, tg.y - qd.y) || 1;
      qd.st = 'go'; qd.t = 0; qd.hitList = []; qd.vx = (tg.x - qd.x) / d; qd.vy = (tg.y - qd.y) / d;
      sfx.buzz();
    }
  }
  function updateBees(dt) {
    const bs = beeStats(upg.bee);
    for (let i = beeDown.length - 1; i >= 0; i--) { beeDown[i] -= dt; if (beeDown[i] <= 0) beeDown.splice(i, 1); }
    const ballOf = bosses.find(b => b.ball && fighting(b));
    while (bees.length + beeDown.length < bs.n) bees.push({ x: spoon.x + rnd(-40, 40), y: spoon.y - 90, tgt: null, rest: 0.4, ph: rnd(0, 6), dir: 1 });
    const sp = BEE_SPEED * BEE_WORK.speed * G * bs.speed * (0.6 + 0.4 * fallMul());
    bees.forEach((b, bi) => {
      b.ph += dt; b.rest = Math.max(0, b.rest - dt);
      if (ballOf) { // bee ball: every bee piles onto the hornet
        const a = b.ph * 5 + bi * 1.3, rr = 30 * bossK();
        const tx = ballOf.x + Math.cos(a) * rr, ty = ballOf.y + Math.sin(a * 1.3) * rr * 0.8;
        b.x += (tx - b.x) * Math.min(1, dt * 8); b.y += (ty - b.y) * Math.min(1, dt * 8); b.dir = Math.cos(a) < 0 ? 1 : -1;
        if (b.tgt) { b.tgt.bee = null; b.tgt = null; }
        return;
      }
      if (b.tgt && !items.includes(b.tgt)) b.tgt = null;
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
      if (!b.tgt && b.rest <= 0) {
        // mostly drops; upgraded bees sometimes go for a jar, a box or a Shilajit jar instead
        const r = Math.random(), want = r < bs.big ? 'big' : r < bs.big + bs.jar ? 'jar' : 'drop';
        let best = null, bd = 1e9;
        const scan = ok => { for (const it of items) { if (!ok(it) || it.bee || it.suck || it.y < combBottom() || it.y > spoon.y - 50) continue; const d = Math.hypot(it.x - b.x, it.y - b.y); if (d < bd) { bd = d; best = it; } } };
        scan(want === 'big' ? it => it.kind === 'box' || it.kind === 'shilajit' : it => it.kind === want);
        if (!best && want !== 'drop') scan(it => it.kind === 'drop');
        if (best) { b.tgt = best; best.bee = b; }
      }
      let tx, ty, v = sp;
      if (b.tgt) { const dd = Math.hypot(b.tgt.x - b.x, b.tgt.y - b.y); tx = b.tgt.x; ty = b.tgt.y + b.tgt.vy * Math.min(0.25, dd / v); }
      else { tx = clamp(spoon.x + Math.sin(b.ph * 0.7 + bi * 2.1) * W * 0.25, 20, W - 20); ty = H * 0.45 + Math.sin(b.ph * 1.3 + bi) * 30; v = sp * 0.5; }
      const dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy) || 1, step = Math.min(d, v * dt);
      b.x += dx / d * step; b.y += dy / d * step;
      if (Math.abs(dx) > 2) b.dir = dx < 0 ? -1 : 1;
      if (b.tgt && Math.hypot(b.tgt.x - b.x, b.tgt.y - b.y) < 18 * G + 8) {
        if (b.tgt.kind === 'bad') { const it = b.tgt; b.carry = it; b.tgt = null; it.held = b; it.exitX = it.x < W / 2 ? -60 : W + 60; }
        else beeCatch(b, b.tgt);
      }
    });
  }
  function beeCatch(b, it) {
    const i = items.indexOf(it);
    if (i >= 0) items.splice(i, 1);
    const kind = it.kind, kg = kind === 'drop' ? it.kg : KG[kind] || 0;
    b.tgt = null; b.rest = beeStats(upg.bee).rest * (kind === 'drop' ? 1 : 1.6);
    tally.beeDrops++;
    if (phase !== 'boss' || W < 560) heal(HEAL[kind] || 0); // on a computer they don't heal you in boss fights: they flick it at the boss instead
    splat(it.x, it.y, kind === 'drop' ? '#b05a14' : '#c89a5b', kind === 'drop' ? 4 : 10);
    if (kind === 'shilajit') { startRush(); tally.shilajit++; achStat('shilajit', tally.shilajit); }
    else fillAddict(FILL[kind] || 0);
    streak += BEE_COMBO; combo = Math.min(comboCap(), 1 + 0.5 * Math.floor(streak / 5)); comboT = Math.max(0, comboT - BEE_HOLD); // a big swarm keeps your combo going
    if (combo >= 5) achUnlock('sugar');
    achAdd('beeCatches', 1, true);
    if (phase === 'harvest') {
      const mult = combo * (rush > 0 ? RUSH_MULT : 1);
      floatText(it.x, it.y - 10, '+' + fmtAdd(kg) + (mult > 1 ? ' ×' + fmtMult(mult) : ''), '#ffe27a');
      addKg(kg * mult);
    } else if (phase === 'boss') {
      fightKg(kg, it.x, it.y);
      if (anyFighting()) globs.push({ x: b.x, y: b.y, vx: 0, vy: -760, dmg: (DMG[kind] || 1) * thickMul(upg.thick), r: (kind === 'drop' ? 6 : 9) * G * (1 + 0.04 * upg.thick), lv: upg.thick });
    }
  }

  // ---------- events between bosses: honey flow and bee swarm ----------
  function startEvent() {
    const k = lastEv === 'flow' ? 'swarm' : lastEv === 'swarm' ? 'flow' : pick(['flow', 'swarm']);
    lastEv = k;
    if (k === 'flow') {
      const x0 = W * rnd(0.3, 0.7);
      ev = { k, t: 0, dur: 6.4, tele: 1.0, x0, x: x0, got: 0, acc: 0, caught: false };
      floatText(W / 2, H * 0.42, 'HONEY FLOW!', '#ffd36b', true);
      sfx.comb();
    } else {
      const side = Math.random() < .5 ? 'L' : 'R';
      ev = { k, t: 0, dur: 7, side, x0: side === 'L' ? 0 : W / 2, x1: side === 'L' ? W / 2 : W, cx: side === 'L' ? -200 : W + 200, cy: H * 0.5, acc: 0, honeyT: 0,
        bees: Array.from({ length: reduceMotion ? 14 : 30 }, () => ({ ox: rnd(-1, 1), oy: rnd(-1, 1), ph: rnd(0, 6) })) };
      floatText(W / 2, H * 0.42, 'BEE SWARM!', '#ffe27a', true, 'The bees are clearing the fakes');
    }
  }
  function updateEvents(dt) {
    if (phase !== 'harvest') { ev = null; return; }
    if (!ev) { evT -= dt; if (evT <= 0) startEvent(); return; }
    ev.t += dt;
    if (ev.k === 'flow') {
      ev.x = clamp(ev.x0 + Math.sin(ev.t * 0.9) * W * 0.2, 30, W - 30);
      const S = spoonSize() * (rush > 0 ? 1.25 : 1);
      const live = ev.t > ev.tele && ev.t < ev.dur - 0.3;
      ev.caught = live && Math.abs(spoon.x - ev.x) < S * 0.6;
      if (ev.caught) {
        comboT = 0;
        const add = 3.2 * dt * (rush > 0 ? RUSH_MULT : 1);
        ev.got += add;
        spoon.fill = 1; spoon.chew = Math.max(spoon.chew, 0.05); spoon.glow = 1;
        fillAddict(0.1 * dt);
        ev.acc += dt;
        if (ev.acc > 0.14) {
          ev.acc = 0; sfx.pour(Math.min(400, ev.got * 45));
          if (!reduceMotion) particles.push({ x: spoon.x + rnd(-10, 10), y: spoon.y - 10, vx: rnd(-90, 90), vy: rnd(-180, -60), r: rnd(2, 4), life: .5, color: pick(['#ffd36b', '#fff1b8', '#f2a516']) });
        }
        addKg(add);
        if (phase !== 'harvest') return;
      }
    } else {
      // fly in from one side, hover over that half grabbing fakes, then cross the screen and leave from the other side
      const zc = (ev.x0 + ev.x1) / 2, inX = ev.side === 'L' ? -200 : W + 200, outX = ev.side === 'L' ? W + 220 : -220;
      if (ev.t < 1.5) ev.cx = inX + (zc - inX) * ease(ev.t / 1.5);
      else if (ev.t < 5.5) ev.cx = zc + Math.sin((ev.t - 1.5) * 1.6) * (ev.x1 - ev.x0) * 0.1;
      else ev.cx = zc + (outX - zc) * Math.pow(Math.min(1, (ev.t - 5.5) / 1.5), 1.6);
      ev.cy = H * 0.5 + Math.sin(ev.t * 1.3) * 20;
      for (const it of items) if (it.carried) { it.base = ev.cx + it.cOff; it.amp = 0; it.vy = 0; it.y += (H * 0.4 + it.cOff * 0.2 - it.y) * Math.min(1, dt * 2); }
      if (swarmZone()) {
        for (const it of items) if (it.kind === 'bad' && !it.carried && !it.held && it.x >= ev.x0 && it.x <= ev.x1) { it.carried = true; it.cOff = clamp(it.x - ev.cx, -120, 120); }
        ev.honeyT -= dt;
        if (ev.honeyT <= 0) {
          ev.honeyT = 0.32;
          const sp = fallMul(), lo = ev.x0 + 30, hi = ev.x1 - 30;
          if (Math.random() < 0.3) spawnJar(sp, rnd(lo, hi)); else spawnDrop(sp, undefined, lo, hi);
        }
      }
      ev.acc += dt;
      if (ev.acc > 0.5) { ev.acc = 0; sfx.hum(); }
    }
    if (ev.t >= ev.dur) {
      if (ev.k === 'flow' && ev.got > 0) floatText(spoon.x, spoon.y - 80, 'Honey flow +' + fmtAdd(ev.got), '#ffd36b');
      if (ev.k === 'swarm') items = items.filter(it => !it.carried);
      ev = null; evT = rnd(15, 21);
    }
  }

  // ---------- seasonal ambience ----------
  function updateAmbient(dt) {
    const s = SEASONS[seasonIdx()], want = reduceMotion ? 6 : 18;
    while (ambient.length < want) {
      const heat = s.part === 'heat';
      ambient.push({
        part: s.part, x: Math.random() * W, y: heat ? H + rnd(0, 40) : combBottom() - rnd(0, H * 0.9) * (ambient.length < want / 2 ? -1 : 0),
        vy: heat ? -rnd(15, 30) : s.part === 'pollen' || s.part === 'fluff' || s.part === 'catkin' ? rnd(8, 18) : rnd(22, 42), vx: rnd(-10, 10), rot: rnd(0, 6), vr: rnd(-2, 2), ph: rnd(0, 6),
        c: s.part === 'catkin' ? pick(['#f1d65a', '#e6c844', '#fff0a0']) : s.part === 'petal' ? pick(['#ffd1e1', '#ffffff', '#ffe9f0']) : s.part === 'leaf' ? pick(['#c8601a', '#e08e0b', '#a8401a', '#d9a03a']) : s.part === 'needle' ? pick(['#3f6b2a', '#55803a']) : s.part === 'pollen' ? '#ffe27a' : s.part === 'fluff' || s.part === 'snow' ? '#ffffff' : '#ffb347',
      });
    }
    for (let i = ambient.length - 1; i >= 0; i--) {
      const a = ambient[i];
      a.ph += dt; a.rot += a.vr * dt;
      a.x += (a.vx + Math.sin(a.ph * 1.3) * 18) * dt; a.y += a.vy * dt;
      if (a.part !== s.part || a.y > H + 20 || a.y < -30 || a.x < -30 || a.x > W + 30) ambient.splice(i, 1);
    }
  }

  // ---------- boss flow ----------
  // `bosses` holds the boss you're fighting, or two of them in crazy mode. While one of them acts, the global
  // `boss` points at it, so say(), the attacks and the projectiles they throw all know who they belong to.
  function makeBoss(i, isEndless, slot, n, bl) {
    const def = BOSSES[i], k = bossK(), inBrawl = bl !== undefined;
    // endless: how hard this boss is depends on how many times you've met him this run (first time 0, then 4, 8, 12...);
    // in crazy mode they count as met once more. Fighting everyone at once doesn't count as meeting them.
    const elv = inBrawl ? bl : isEndless ? ENDLESS_STEP * ((endlessSeen[i] = (endlessSeen[i] || 0) + 1) - 1 + (n > 1 ? 1 : 0)) : 0;
    const hp = isEndless ? Math.round((def.ehp || def.hp) * (1 + 0.25 * (inBrawl ? 0 : elv) + 0.05 * endlessRound)) : def.hp;
    // how hard he attacks: endless bosses start a few levels up and creep up half a level a round
    const alv = inBrawl ? bl : isEndless ? elv + ENDLESS_BASE + Math.floor(endlessRound / 2) : 0;
    const x = inBrawl ? laneX(slot, 0.5) : n > 1 ? W * (slot ? 0.75 : 0.25) : W / 2;
    return {
      def, i, slot, n, x, tx: x, y: -160 * k, hp, max: hp, t: 0, mode: 'intro', endless: isEndless, done: false,
      atkT: 1.2 + slot * 1.5, atkI: 0, sayT: 4.5 + slot * 3, say: null, recent: [], hurt: 0, pose: 0, wanderT: 1, rot: 0, vy: 0, alpha: 1, scale: 1,
      forceNext: null, p2: false, pushup: 0, repT: 0, reps: 0,
      // two at once each attack a little less often
      speed: (isEndless ? Math.max(0.45, 0.9 - 0.06 * alv) : 1) * (inBrawl ? BRAWL_PACE : n > 1 ? 1.25 : 1) * (def.pace || 1) * (W < 560 && def.phonePace ? def.phonePace : 1), elv, alv, brawl: inBrawl,
    };
  }
  function startFight(ids, isEndless = false) {
    phase = 'boss'; ev = null;
    items.forEach(it => { if (it.kind === 'bad') splat(it.x, it.y, it.f.color, 6); });
    items = []; proj = []; globs = [];
    bosses = ids.map((i, sl) => makeBoss(i, isEndless, sl, ids.length, brawl ? brawl.lv : undefined));
    boss = bosses[0];
    ally = null; fightSaved = 0; fightHits = 0;
    chat = bosses.some(b => b.def.key === 'looks') ? newChat() : null;
    spawnT = 1.4;
    sfx.bossIn();
  }
  function startBoss(i) { startFight([i]); }
  function newChat() { return { msgs: [], nextT: 2.4, viewers: 38000 + Math.floor(rnd(0, 3000)), flood: 0, recent: [], reactT: 0 }; }
  const BRAWL_PACE = 1; // each boss attacks as often as in a normal fight, they just take turns
  // Fight every boss at once. Bought with crazy mode. Everything about your run is put back afterwards, win or lose.
  function startBrawl() {
    if (state !== 'shed' || shedFromPause || !upg.crazy || brawl) return;
    const order = [...Array(BOSS_COUNT).keys()].sort(() => Math.random() - .5), S = Math.min(BOSS_COUNT, brawlSlots());
    brawl = {
      snap: { purity, combo, streak, comboT, addict, savings, revivesLeft, tally: JSON.parse(JSON.stringify(tally)) },
      t: 0, S, queue: order.slice(S), beaten: 0, active: [], rotT: 0, rotI: 0,
      lv: ENDLESS_BASE + ENDLESS_STEP * Math.floor(runStats.crazyFights / 4), // as strong as in endless, and harder the further you've got in crazy mode
      atkN: S >= 5 ? 3 : 2, // how many attack at a time; the rest only talk
    };
    $('shedScreen').hidden = true; state = 'play'; last = performance.now(); $('toast').classList.remove('low');
    purity = 100; combo = 1; streak = 0; addict = 0; rush = 0; items = []; sticky = [];
    Object.assign(spoon, { hurt: 0, frozen: 0, slow: 0, venom: 0, sting: 0, vstack: 0, anaph: 0, mark: 0 });
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
    Object.assign(spoon, { hurt: 0, frozen: 0, slow: 0, venom: 0, sting: 0, vstack: 0, anaph: 0, mark: 0 }); shieldT = 0; shieldHits = 0; hurtFlash = 0; shake = 0;
    let line;
    if (won) {
      const rec = !best.brawl || time < best.brawl;
      if (rec) { best.brawl = time; saveBest(); }
      achUnlock('brawl');
      line = 'All nine at once, in ' + fmtTime(time) + '.' + (rec ? " That's your best." : ' Your best is ' + fmtTime(best.brawl) + '.') + ' Nothing lost, boy.';
    } else line = 'You beat ' + beaten + ' of ' + BOSS_COUNT + ' in ' + fmtTime(time) + '. Nothing lost. Your run carries on.';
    openShed();
    grandadSay(line);
  }
  // a boss can't repeat a line until two other lines have been said
  function nextLine(b) {
    const fresh = b.def.lines.filter(l => !b.recent.includes(l));
    return pick(fresh.length ? fresh : b.def.lines);
  }
  function updateBosses(dt) {
    for (const b of bosses) {
      if (b.done) continue;
      boss = b;
      updateBoss(dt, b);
      if (state !== 'play' || phase !== 'boss') return;
    }
    if (brawl) {
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
    boss = bosses.find(fighting) || bosses.find(b => !b.done);
  }
  function updateBoss(dt, b) {
    const k = bossK();
    b.t += dt; b.hurt = Math.max(0, b.hurt - dt); b.pose = Math.max(0, b.pose - dt);
    if (b.say) { b.say.t -= dt; if (b.say.t <= 0) b.say = null; }
    const home = bossHome();
    if (b.mode === 'intro') {
      b.y = -160 * k + (home + 160 * k) * ease(Math.min(1, b.t / 1.5));
      if (b.t > 2.9) { b.mode = 'fight'; b.t = 0; b.sayT = say(b.def.intro, { force: !b.brawl }) ? b.say.t + 1.5 + b.slot * 2 : rnd(1, 5); }
      return;
    }
    if (b.mode === 'down') {
      if (b.def.joins && !b.endless) {
        // Colonex walks off to the side to join you
        b.x += (allyPos().x - b.x) * Math.min(1, dt * 1.2);
        b.y += (allyPos().y - b.y) * Math.min(1, dt * 1.2);
        b.scale += (0.55 - b.scale) * Math.min(1, dt * 1.2);
        if (b.def.defeat2 && !b.said2 && b.t > 3.2) { b.said2 = true; say(b.def.defeat2, { force: true, dur: 4.5 }); }
        b.alpha = b.t > 7.2 ? Math.max(0, 1 - (b.t - 7.2) / 0.4) : 1;
        if (b.t > 7.6) b.done = true;
      } else {
        b.vy += 520 * dt; b.y += b.vy * dt; b.rot += dt * 2.2 * (b.i % 2 ? -1 : 1); b.alpha = b.gone ? 0 : Math.max(0, 1 - b.t / 2.2);
        if (Math.random() < 0.3) splat(b.x + rnd(-30, 30), b.y + rnd(-30, 30), '#f2a516', 3);
        if (b.t > 3.2) b.done = true;
      }
      return;
    }
    if (b.mode === 'dash') { updateDash(dt * (smokeT > 0 ? smokeSlow : 1), b); return; }
    if (b.stun > 0) { b.stun -= dt; b.y = home + (b.yOff || 0) + Math.sin(b.t * 30) * 3 * k; return; } // knocked out of the sky: no moving, no attacks
    if (b.def.p3attacks && !b.p3 && b.hp / b.max <= (b.def.p3at || 0.25)) { // the hornet's slaughter phase
      b.p3 = true;
      floatText(W / 2, H * 0.42, 'SLAUGHTER PHASE', '#ff5a3c', true);
      say(b.def.p3line, { force: true }); b.sayT = b.say.t + 1.5;
      b.forceNext = b.def.p3attacks[0]; b.atkT = Math.min(b.atkT, 1.2);
      for (const q of proj) if (q.k === 'scout' && q.owner === b) q.life = 0; // his scouts clear off for the slaughter
      sfx.phase2(); shake = reduceMotion ? 0 : 12;
    }
    if (b.def.key === 'hornet') {
      if (proj.some(q => q.k === 'scout' && !q.dead && q.owner === b && q.t < q.life)) b.atkT = Math.max(b.atkT, 0.8); // his scouts fight first
      if (b.spray) { // hovering over you, emptying his stingers where you're heading
        const sp = b.spray; b.tx = clamp(spoon.x, 60, W - 60); b.wanderT = 1; sp.next -= dt;
        if (sp.next <= 0 && sp.left > 0) { sp.left--; sp.next = sp.every; shootStinger(b, rnd(-0.05, 0.05), { lead: true }); }
        if (sp.left <= 0) b.spray = null;
      }
      if (b.p2 && !b.ball) { // bee ball: three or more worker bees mob him and cook him with body heat
        b.ballT = (b.ballT ?? 2) - dt;
        if (b.ballT <= 0 && bees.length >= 6 && !b.hawk) { b.ball = { t: 0, dur: 3.5, acc: 0 }; floatText(W / 2, H * 0.42, 'BEE BALL', '#ffd36b', true); say("Why is it so hot in here?", { force: true }); }
      }
      if (b.ball) {
        const r = b.ball;
        r.t += dt; r.acc += dt * (3 + 0.8 * bees.length); b.atkT += dt; // he can't attack while he's cooking
        if (r.acc >= 4) { damageBoss(Math.round(r.acc), b); r.acc = 0; if (!fighting(b) || state !== 'play') return; }
        if (r.t > r.dur || bees.length < 4) { b.ball = null; b.ballT = 22; }
      }
      if (b.hawk) { // hovering by the hive entrance, snatching honey
        const hk = b.hawk; hk.t += dt; // (returning early below also pauses his attacks)
        let tx = clamp(spoon.x + hk.side * 110 * Math.max(0.7, G), 50, W - 50);
        if (magnetT > 0 && Math.abs(b.x - spoon.x) < magR() * 1.3) { tx = clamp(b.x + Math.sign(b.x - spoon.x || hk.side) * 260, 50, W - 50); if (!hk.pushed) { hk.pushed = true; floatText(b.x, b.y - 40 * k, 'Pushed off', '#ffd36b'); } }
        const ty = Math.max(home, spoon.y - 100 * k + Math.sin(hk.t * 3) * 38 * k); // bobbing low by your spoon: don't go under him
        b.x += (tx - b.x) * Math.min(1, dt * 3); b.y += (ty - b.y) * Math.min(1, dt * 3); b.yOff = b.y - home;
        hk.shootT = (hk.shootT ?? 0.5) - dt;
        if (hk.shootT <= 0) { hk.shootT = b.p2 ? 0.75 : 1.0; shootStinger(b, 0); } // point-blank stings
        if (Math.hypot(b.x - spoon.x, b.y - spoon.y) < 58 * k + spoonSize() * 0.4) { hurtSpoon(10, '#e89a2c', 'Hornet', { boss: b }); if (state !== 'play') return; }
        for (let i = items.length - 1; i >= 0; i--) {
          const it = items[i];
          if (it.kind === 'bad' || it.held || it.suck || Math.hypot(it.x - b.x, it.y - b.y) > 70 * k) continue;
          items.splice(i, 1); splat(it.x, it.y, '#b05a14', 5);
          if (hk.said <= 0) { floatText(b.x, b.y - 46 * k, 'Snatched!', '#ff9a8a'); hk.said = 0.8; }
        }
        hk.said -= dt;
        if (hk.t > hk.dur) b.hawk = null;
        return;
      }
    }
    if (!b.p2 && b.hp / b.max <= 0.5) {
      b.p2 = true;
      floatText(W / 2, H * 0.42, 'PHASE 2', '#ff5a3c', true);
      say(b.def.p2line, { force: true }); b.sayT = b.say.t + 1.5;
      if (!b.p3) b.forceNext = b.def.p2attacks[0]; b.atkT = Math.min(b.atkT, 1.2); // (a big hit straight into phase 3 keeps the phase 3 opener)
      sfx.phase2(); shake = reduceMotion ? 0 : 10;
      if (b.def.key === 'looks') { chatReact("HE'S ASCENDING", 3); for (let j = 0; j < 5; j++) splat(b.x + rnd(-40, 40) * k, b.y + rnd(-30, 30) * k, '#141416', 8); }
    }
    if (b.pushup > 0) {
      const psm = smokeT > 0 ? smokeSlow : 1;
      b.pushup -= dt * psm; b.repT -= dt * psm;
      if (b.repT <= 0 && b.reps < 500) {
        b.repT = 0.36; b.reps += 50;
        if (b.reps % 100 === 0) {
          const x = (b.reps / 100) % 2 ? clamp(spoon.x, 20, W - 20) : W * rnd(0.08, 0.92);
          proj.push(P({ k: 'plate', name: '20 kg plate', color: '#3a3a40', x, y: combBottom() + 8, vy: 260, r: 16, dmg: 12, vr: rnd(-2, 2) }));
        }
      }
    }
    b.wanderT -= dt;
    if (b.wanderT <= 0) { b.tx = b.brawl ? laneX(b.slot, rnd(0.3, 0.7)) : b.n > 1 ? W * (b.slot ? rnd(0.62, 0.88) : rnd(0.12, 0.38)) : W * rnd(0.2, 0.8); b.wanderT = rnd(1.4, 2.8); }
    if (b.pushup <= 0) b.x += (b.tx - b.x) * Math.min(1, dt * 1.8);
    b.yOff = (b.yOff || 0) * Math.max(0, 1 - dt * 3); // easing back after hawking low
    b.y = home + Math.sin(b.t * 2.2 + b.slot * 1.7) * 6 * k + b.yOff;
    b.sayT -= dt;
    if (b.sayT <= 0) { b.sayT = say(nextLine(b)) ? b.say.t + rnd(1.5, 3) + (b.n > 1 ? 2.5 : 0) : 1; }
    if (brawlWaiting(b)) b.atkT = Math.max(b.atkT, 0.6); // waiting for his turn: talking only
    else b.atkT -= dt;
    if (b.atkT <= 0) {
      const list = b.p3 && b.def.p3only ? b.def.p3attacks : b.p3 ? b.def.attacks.concat(b.def.p2attacks, b.def.p3attacks) : b.p2 ? b.def.attacks.concat(b.def.p2attacks) : b.def.attacks;
      const a = b.forceNext || list[b.atkI++ % list.length];
      b.forceNext = null;
      const cd = ATTACKS[a](b) || 2.5;
      b.atkT = cd * (b.p2 ? 0.8 : 1) * (b.p3 ? b.def.p3pace || 0.85 : 1) * b.speed;
      b.pose = 0.8;
    }
  }
  function updateDash(dt, b) {
    const d = b.dash, k = bossK();
    d.t += dt;
    if (d.st === 'rise') { // between chained dives he pulls up first, so the next one comes from above
      const u = ease(Math.min(1, d.t / 0.32));
      b.x = d.bx + (d.rx - d.bx) * u; b.y = d.by + (d.ry - d.by) * u;
      if (d.t > 0.32) { const aim = hornetAim(); d.st = 'tele'; d.t = 0; d.fx = b.x; d.fy = b.y; d.tx = clamp(aim.x, 40, W - 40); d.ty = aim.queen ? aim.y : spoon.y - 30; sfx.warn(); }
      return;
    }
    if (d.st === 'tele') {
      if (d.massacre) { b.x += (d.fx - b.x) * Math.min(1, dt * 5); b.y += (d.fy - b.y) * Math.min(1, dt * 5); } // off to the side first
      if (d.t > (d.tele || 0.85) * teleMul()) { d.st = 'go'; d.t = 0; d.hit = false; sfx.whoosh(); }
      return;
    }
    if (d.st === 'go') {
      const u = Math.min(1, d.t / (d.dur || 0.45));
      b.x = d.fx + (d.tx - d.fx) * u; b.y = d.fy + (d.ty - d.fy) * u;
      if (!reduceMotion) for (let i = 0; i < 3; i++) particles.push({ x: b.x + rnd(-70, 70) * k, y: b.y + 70 * k, vx: rnd(-90, 90), vy: rnd(-200, -60), r: rnd(1.5, 3.5), life: .5, color: '#f4f8ff' });
      if (b.def.key === 'hornet' && qd && qd.mode === 'boss' && qd.st === 'go' && Math.hypot(b.x - qd.x, b.y - qd.y) < 70 * k) { // queen duel
        if ((upg.queen || 0) >= 6) { b.stun = 2; b.mode = 'fight'; b.dash = null; b.tx = b.x; damageBoss(qd.dmg * 2, b); floatText(b.x, b.y - 46 * k, 'KNOCKED OUT', '#ffd36b'); say('Yo cuh stop doin dat', { force: true }, b); return; }
        killQueen('The hornet got her');
      }
      if (d.massacre) for (const bee of bees.slice()) if (Math.abs(bee.x - b.x) < 46 * Math.max(0.7, G)) killBee(bee, 8); // every worker he passes
      if (!d.hit && d.dmg > 0 && Math.hypot(b.x - spoon.x, b.y - spoon.y) < 58 * k + spoonSize() * 0.35) {
        d.hit = true; hurtSpoon(d.dmg, d.color, d.name, { boss: b });
        if (state !== 'play') return;
      }
      if (u >= 1) {
        if (d.chain > 0) { d.chain--; d.st = 'rise'; d.t = 0; d.bx = b.x; d.by = b.y; d.rx = clamp(b.x + rnd(-170, 170) * Math.max(0.7, G), 60, W - 60); d.ry = bossHome() + 40 * k; }
        else { d.st = 'back'; d.t = 0; d.bx = b.x; d.by = b.y; }
        shake = reduceMotion ? 0 : 6;
      }
      return;
    }
    const u = ease(Math.min(1, d.t / 0.9));
    b.x = d.bx + ((d.hx ?? d.fx) - d.bx) * u; b.y = d.by + (bossHome() - d.by) * u;
    if (d.t > 0.9) { b.mode = 'fight'; b.tx = b.x; b.dash = null; }
  }
  function damageBoss(d, b = boss) {
    if (!b || !fighting(b)) return;
    b.hp -= d; b.hurt = 0.15; sfx.hit();
    floatText(b.x + rnd(-30, 30), b.y - 50 * bossK(), '−' + (Math.round(d * 10) / 10), '#ff9a8a');
    if (chat && b.def.key === 'looks' && d >= 7.5) chatReact("he's cooked");
    if (b.hp <= 0) defeatBoss(b);
  }
  function defeatBoss(b) {
    b.hp = 0; b.mode = 'down'; b.t = 0; b.vy = -220; b.dash = null; b.say = null; b.pushup = 0; b.hawk = null; b.ball = null; b.stun = 0;
    if (b.def.key === 'hornet') { // he breaks into pieces, Terraria-style
      shatter('hornet', b.x, b.y, bossK() * 0.9, spoon.x < b.x); b.alpha = 0; b.gone = true;
      for (const q of proj) if (q.owner === b && (q.k === 'mini' || q.k === 'nest' || q.k === 'scout')) q.dead = true;
      if (b.queenUsed && !b.queenDied) achUnlock('longlive');
    }
    say(b.def.defeat, { force: true, dur: b.def.joins && !b.endless ? 3.2 : 3 }, b);
    if (bosses.some(o => o !== b && fighting(o))) {
      // the other boss fights on, so only this one's attacks disappear
      for (const p of proj) if (p.owner === b && !p.dead) { p.dead = true; if (!(p.delay > 0)) splat(p.x || W / 2, p.y || H / 2, '#f6e3b4', 4); }
    } else {
      proj.forEach(p => splat(p.x || W / 2, p.y || H / 2, '#f6e3b4', 4));
      proj = []; globs = []; ally = null;
    }
    for (let i = 0; i < 4; i++) splat(b.x + rnd(-40, 40), b.y + rnd(-40, 40), '#f2a516', 14);
    tally.bosses++; if (b.brawl && brawl) brawl.beaten++;
    if (!b.brawl) { savings += BOSS_BONUS; fightSaved += BOSS_BONUS; tally.saved += BOSS_BONUS; floatText(W / 2, H * 0.53, '+' + BOSS_BONUS + ' kg for the shed', '#e9d7ff'); } // a reward for every boss
    const h = heal(25);
    floatText(W / 2, H * 0.47, 'DEFEATED!', '#ffd36b', true);
    if (h > 0) floatText(spoon.x, spoon.y - 60, '+' + Math.round(h) + '% purity', '#ffe9a8');
    sfx.bossDown(); shake = reduceMotion ? 0 : 12;
    if (b.def.key === 'looks') chatReact('Clipping this', 3);
    const a = { keeper: fightHits === 0 ? 'trust' : null, colonex: 'blacklist', ceo: 'fired', lecturer: 'nextq', ironfit: 'bigman', apologist: 'notes', looks: 'mogger', disprover: 'blocked', hornet: 'pest' }[b.def.key];
    if (a) achUnlock(a);
  }
  function finishFight() {
    if (brawl) { brawlEnd(true); return; }
    const wasEndless = bosses[0].endless, two = bosses.length > 1;
    if (wasEndless) { runStats.endlessFights++; if (two) runStats.crazyFights++; runStats.crazyTail = two ? runStats.crazyTail + 1 : 0; }
    boss = null; bosses = []; chat = null; qd = null; ally = null;
    if (two) { achUnlock('crazy'); achAdd('crazyWins', 1); }
    if (wasEndless) { endlessRound++; endlessNext += STAGE_KG; achStat('round', endlessRound + 1); lbSubmit(lbEntry(), null); openShed(); return; } // saved after every round, quietly
    bossIdx++;
    achStat('season', bossIdx);
    if (bossIdx >= BOSS_COUNT) { phase = 'done'; win(); return; }
    openShed();
  }

  // ---------- Colonex as an ally ----------
  // He fights with you once you've beaten him, but never against himself: if he's one of the bosses, he isn't on your side.
  function allyPos() { return W < 560 ? { x: 36, y: H * 0.64 } : { x: 60, y: H * (chat ? 0.66 : 0.5) }; }
  function allyActive() { return (endless || bossIdx >= 2) && anyFighting() && !brawl && !bosses.some(b => b.def.key === 'colonex'); } // when everyone's against you, so is he
  function allyLine() {
    const tb = pick(bosses.filter(fighting));
    for (let tries = 0; tries < 10; tries++) {
      const r = Math.random();
      const line = r < 0.2 ? '@' + tb.def.tag + ' vc?'
        : r < 0.42 && ALLY_BOSS_LINES[tb.def.key] ? ALLY_BOSS_LINES[tb.def.key]
        : r < 0.5 ? '@herp vc?'
        : r < 0.58 ? '@Ja Ja Binka vc?'
        : pick(ALLY_LINES);
      if (!ally.recent.includes(line)) return line;
    }
    return pick(ALLY_LINES.filter(l => !ally.recent.includes(l)));
  }
  function updateAlly(dt) {
    if (!allyActive()) return;
    if (!ally) ally = { t: 0, shootT: 2.2, sayT: allyQueue ? 0.5 : 1.2, say: null, recent: [] };
    const p = allyPos();
    ally.t += dt; ally.x = p.x; ally.y = p.y + Math.sin(ally.t * 1.6) * 10;
    if (ally.stun > 0) ally.stun -= dt;
    ally.shootT -= dt;
    if (ally.shootT <= 0 && !(ally.stun > 0)) {
      const L = allyStats(upg.colonex);
      ally.shootT = rnd(L.lo, L.hi);
      const text = feeText(pick(ALLY_FEES), L.fee), vat = Math.random() < 0.35 ? Math.max(1, Math.round((parseInt(text, 10) || 0) * 0.05)) : 0; // some invoices come with 5% VAT
      proj.push(P({ k: 'allyFee', harmless: true, dmg: L.dmg * (vat ? 1.05 : 1), x: ally.x + 16, y: ally.y - 20, text, vat, r: 12, tgt: pick(bosses.filter(fighting)), owner: null }));
    }
    if (ally.say) { ally.say.t -= dt; if (ally.say.t <= 0) ally.say = null; }
    ally.sayT -= dt;
    if (ally.sayT <= 0) {
      const line = allyQueue || allyLine();
      allyQueue = null;
      ally.recent.push(line); if (ally.recent.length > 2) ally.recent.shift();
      ally.say = { text: line, t: Math.max(5, lineDur(line) * 0.75) };
      ally.sayT = ally.say.t + rnd(2, 4);
      hear('Colonex', line);
      sfx.blip(true);
    }
  }

  // ---------- boss attacks ----------
  const CARD = { notify: 1, fee: 1, call: 1, job: 1, gif: 1, cell: 1, eq: 1, tag: 1, allyFee: 1, deen: 1, rate: 1, chatMsg: 1, dono: 1, ad: 1 };
  const ps = p => CARD[p.k] ? GT : G; // jokes on cards shrink less, so they stay readable
  const P = o => {
    const p = Object.assign({ vx: 0, vy: 0, g: 0, r: 14, dmg: 10, rot: 0, vr: 0, t: 0, delay: 0, color: '#ffffff', name: 'Ouch', owner: boss }, o);
    if (endless && p.owner) { const m = teleMul(p.owner); if (p.delay) p.delay *= m; if (p.tele) p.tele *= m; } // less warning in endless
    return p;
  };
  function lob(x0, y0, tx, Tf, g) { return { vx: (tx - x0) / Tf, vy: (spoon.y - y0 - 0.5 * g * Tf * Tf) / Tf, g }; }
  // Endless bosses gain levels each time you meet the same one again (0, 4, 8, 12...). Per level they throw 10% more (up to
  // double), hit 4% harder (slowly, up to +150%) and give 3.75% less warning (down to 70%). Attacks spread across the screen also
  // scale with its width; attacks aimed at you don't.
  const endlessMore = (b = boss) => endless ? Math.min(2, 1 + 0.1 * lvOf(b)) : 1;
  const teleMul = (b = boss) => endless ? Math.max(0.7, 1 - 0.0375 * lvOf(b)) : 1;
  const cntW = n => Math.max(1, Math.round(n * G * WX * endlessMore())); // spread across the screen
  const wideMore = () => 1 + 0.25 * clamp((W - 760) / 340, 0, 1); // up to a quarter more on a computer screen, where there's more room to dodge
  const cntA = n => Math.max(1, Math.round(n * G * endlessMore() * wideMore())); // aimed at you
  const moreE = n => Math.max(1, Math.round(n * endlessMore() * wideMore())); // fixed patterns that just get bigger in endless
  const fan = (n, step) => Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * step);
  const fanN = (n, step) => Math.max(1, Math.min(n, 1 + Math.floor(W * 0.55 / step))); // a spread aimed at you never covers more than about half the screen, so there's always a way round
  // chess notation for the chess attacks: files a-h run across the screen and rank 1 is your spoon's row
  const fileOf = x => 'abcdefgh'[clamp(Math.floor(x / W * 8), 0, 7)];
  const square = (x, rank) => fileOf(x) + clamp(rank, 1, 8);
  const knightRank = (p, y) => 1 + Math.round((p.floor - y) / p.c);
  const fallers = (n, make, gap) => { n = cntW(n); for (let i = 0; i < n; i++) { const bx = i === 0 ? clamp(spoon.x, 40, W - 40) : W * rnd(0.1, 0.9); proj.push(P(Object.assign({ bx, x: bx, y: combBottom() + 8, delay: i * gap, ph: rnd(0, 6) }, make(i)))); } };
  const wall = (make, delay, gapMul = 2.9, gx = W * rnd(0.18, 0.82)) => { // a row across the screen with one gap; returns where the gap is
    const gapW = spoonSize() * gapMul;
    for (let x = 22; x < W - 10; x += 42 * G) { if (Math.abs(x - gx) < gapW / 2) continue; proj.push(P(Object.assign({ x, y: combBottom() + 6, delay }, make(x)))); }
    return gx;
  };
  // the Looksmaxxer's stream chat
  function chatPush(user, col, text, o = {}) {
    if (!chat) return;
    chat.msgs.push(Object.assign({ user, col, text }, o));
    if (chat.msgs.length > 30) chat.msgs.shift();
  }
  function chatReact(text, n = 0) { // the same message from a few people at once, like a real chat
    if (!chat || (!n && chat.reactT > 0)) return;
    if (!n) { chat.reactT = 0.7; n = 1 + Math.floor(Math.random() * 2); }
    const who = CHAT_USERS.slice().sort(() => Math.random() - .5);
    for (let i = 0; i < n; i++) chatPush(who[i][0], who[i][1], text);
  }
  function updateChat(dt) {
    if (!chat) return;
    chat.viewers += dt * rnd(20, 140) * (chat.flood > 0 ? 3 : 1);
    chat.flood = Math.max(0, chat.flood - dt); chat.reactT = Math.max(0, chat.reactT - dt);
    for (const m of chat.msgs) if (m.banT > 0) { m.banT -= dt; if (m.banT <= 0) { m.banned = true; chatPush('ModBot', '#3ddc84', m.user + ' has been banned.', { mod: true }); } }
    chat.nextT -= dt;
    if (chat.nextT > 0) return;
    chat.nextT = chat.flood > 0 ? rnd(0.22, 0.45) : rnd(0.8, 1.6);
    const [u, c] = pick(CHAT_USERS);
    if (Math.random() < 0.16) { chatPush(u, c, pick(CHAT_PRO), { banT: rnd(0.8, 1.4) }); return; } // anyone who defends the honey gets banned
    let text = pick(CHAT_HATE);
    for (let k = 0; k < 6 && chat.recent.includes(text); k++) text = pick(CHAT_HATE);
    chat.recent.push(text); if (chat.recent.length > 5) chat.recent.shift();
    chatPush(u, c, text);
  }
  function floodChat(n) {
    for (let i = 0; i < n; i++) {
      const dir = Math.random() < 0.5 ? 1 : -1, [user, col] = pick(CHAT_USERS), text = pick(CHAT_HATE);
      proj.push(P({ k: 'chatMsg', name: 'Chat', color: col, user, text, x: dir > 0 ? -90 : W + 90, y: combBottom() + rnd(40, H * 0.32), vx: dir * rnd(220, 300), vy: rnd(70, 130), r: 14, dmg: 8, delay: i * 0.24 }));
      chatPush(user, col, text);
    }
  }
  const hyperY = () => Math.min(H - 26, spoon.y + 6); // the blue men stand on your spoon's line
  function fireHyper(p) {
    const by = hyperY(), m = p.targets.length;
    p.tops.forEach((x, j) => {
      const tg = p.targets[j % m], y0 = p.top + 6, T = 0.85, dx = tg.x - x, dy = by - y0;
      proj.push(P({ k: 'hyperArrow', name: 'Hypergamy chart', color: '#ff6fae', x, y: y0, vx: dx / T, vy: dy / T, rot: Math.atan2(dy, dx), r: 9, dmg: 12, ty: by, owner: p.owner }));
    });
    sfx.whoosh();
  }
  // ---------- the hornet ----------
  const hornetOf = () => bosses.find(b => b.def.key === 'hornet' && fighting(b));
  const hornetAim = () => (qd && qd.mode === 'boss' && qd.st !== 'exit' ? { x: qd.x, y: qd.y, queen: true } : { x: spoon.x, y: spoon.y }); // while the queen is out, he goes after her
  function nearestBee(x, y) { let best = null, bd = 1e9; for (const b of bees) { const d = Math.hypot(b.x - x, b.y - y); if (d < bd) { bd = d; best = b; } } return best; }
  function killBee(bee, down = 4) {
    const i = bees.indexOf(bee); if (i < 0) return;
    bees.splice(i, 1); beeDown.push(down); // she's back in a few seconds
    if (bee.tgt && bee.tgt.bee === bee) bee.tgt.bee = null;
    if (bee.carry) { bee.carry.held = null; bee.carry = null; }
    shatter('bee', bee.x, bee.y, 0.75 * Math.max(0.7, G), bee.dir < 0); // she falls apart, like the queen
    splat(bee.x, bee.y, '#f2c94c', 8); floatText(bee.x, bee.y - 14, 'Bee down', '#ff5a3c'); sfx.crunch();
  }
  function spawnMini(b, x, y) {
    if (proj.filter(q => q.k === 'mini' && !q.dead).length >= 8) return;
    proj.push(P({ k: 'mini', name: 'Mini hornet', color: '#e89a2c', x, y, r: 10, dmg: 8, life: 9, owner: b, ph: rnd(0, 6) }));
  }
  const hornetSpd = b => (b && b.p3 ? 1.22 : b && b.p2 ? 1.1 : 1) * Math.max(0.8, Math.min(1, G)); // faster in each phase, a bit slower on small screens
  function shootStinger(b, da, o = {}) {
    const k = bossK(), x0 = b.x + 24 * k * (spoon.x < b.x ? -1 : 1), y0 = b.y + 22 * k, aim = hornetAim(), v = 360 * hornetSpd(b);
    let ax = aim.x;
    if (o.lead && !aim.queen) ax += clamp(spoon.vx || 0, -900, 900) * (Math.hypot(aim.x - x0, aim.y - y0) / (v * 1.5)) * (W < 560 ? 0.45 : 0.8); // aims where you're going
    const a = Math.atan2(aim.y - y0, ax - x0) + da;
    proj.push(P({ k: 'stinger', name: 'Stinger', color: '#2a1606', x: x0, y: y0, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 7, dmg: 6, ang: a, owner: b }));
  }
  function stingCurtain(b, gx, delay) { // a row of stingers across the whole screen with one gap
    const S = spoonSize(), gap = Math.max(S * 2.6, 150 * Math.max(0.7, G)), cx = clamp(W * gx, gap / 2 + 10, W - gap / 2 - 10), step = Math.max(34, 46 * G), y0 = combBottom() + 6, v = 200 * hornetSpd(b);
    proj.push(P({ k: 'gapMark', harmless: true, dmg: 0, x: cx, y: y0, w: gap, delay, life: 2.4, owner: b }));
    for (let x = step / 2; x < W; x += step) if (Math.abs(x - cx) > gap / 2) proj.push(P({ k: 'curtainSting', name: 'Stinger', color: '#2a1606', x, y: y0, vy: v, r: 6, dmg: 7, ang: Math.PI / 2, delay: delay + 0.6, owner: b }));
  }
  function venomHit(n, full) { // stings stack up: three close together and you go into anaphylaxis
    const w = 1 - 0.05 * (upg.wax || 0);
    if (full) { spoon.venom = Math.max(spoon.venom, n > 1 ? 3 : 2); spoon.venomDps = (n > 1 ? 2 : 1) * w; }
    spoon.sting = Math.max(spoon.sting, full ? 1.8 : 1);
    spoon.vstack = (spoon.vstackT > 0 ? spoon.vstack : 0) + n; spoon.vstackT = 4;
    if (spoon.vstack < 3) { floatText(spoon.x, spoon.y - 82, 'venom ' + spoon.vstack + '/3', '#9be36b'); return; }
    spoon.vstack = 0; spoon.vstackT = 0; spoon.anaph = 2.4;
    const d = Math.max(1, Math.round(12 * w));
    if (!invincible) { purity = Math.max(0, purity - d); tally.minPurity = Math.min(tally.minPurity, purity); }
    floatText(spoon.x, spoon.y - 82, 'ANAPHYLAXIS', '#9be36b'); floatText(spoon.x, spoon.y - 104, '−' + d + '% purity', '#ff9a8a');
    shake = reduceMotion ? 0 : 8; hurtFlash = 0.4; sfx.bad();
    if (purity <= 0) { lastHit = { name: 'Anaphylaxis', boss: hornetOf() || boss, toxin: false }; gameOver(); }
  }
  // mini hornets hunt your worker bees (or you, if you have none); swipe the spoon through one to swat it
  function updateMini(p, dt, S) {
    p.ph += dt * 40;
    if (Math.abs(spoon.vx) > 650 * G && Math.abs(p.x - spoon.x) < S * 0.65 && Math.abs(p.y - (spoon.y - 10)) < S * 0.6) {
      p.dead = true; splat(p.x, p.y, '#e89a2c', 8); floatText(p.x, p.y - 16, 'Swatted!', '#ffd36b'); achAdd('swats', 1, true); sfx.hit();
      return true;
    }
    if (p.t > p.life || p.leave) { p.vx *= 0.96; p.vy = -320; if (p.y < combBottom() - 40) p.dead = true; return false; }
    const own = p.owner, ph = hornetSpd(own);
    if (p.y > combBottom() + 20) { // little stingers at you
      p.shootT = (p.shootT ?? rnd(0.9, 2)) - dt;
      if (p.shootT <= 0) {
        p.shootT = rnd(2.4, 3.4) / ph / (spoon.mark > 0 ? 1.5 : 1);
        const a = Math.atan2(spoon.y - 10 - p.y, spoon.x - p.x), v = 230 * ph;
        proj.push(P({ k: 'miniSting', name: 'Little stinger', color: '#2a1606', x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 5, dmg: 3, ang: a, owner: own }));
      }
    }
    if (spoon.mark > 0) p.bee = null; // marked: they all come for you
    else if (!p.bee || !bees.includes(p.bee)) p.bee = nearestBee(p.x, p.y);
    if (p.lunge) { // a quick hover, then a dash through the bee
      const L = p.lunge; L.t += dt;
      if (!p.bee || L.t > 0.5) p.lunge = null;
      else if (L.t < 0.16) { p.vx *= 0.7; p.vy *= 0.7; return false; }
      else {
        const a = Math.atan2(p.bee.y - p.y, p.bee.x - p.x); p.vx = Math.cos(a) * 640 * Math.max(0.7, G); p.vy = Math.sin(a) * 640 * Math.max(0.7, G);
        if (!reduceMotion) particles.push({ x: p.x, y: p.y, vx: 0, vy: 0, r: 2.5, life: .3, color: '#ff9a3c' });
        if (Math.hypot(p.bee.x - p.x, p.bee.y - p.y) < 16 * G + 8) { killBee(p.bee); p.bee = null; p.lunge = null; p.kills = (p.kills || 0) + 1; if (p.kills >= 2) p.leave = true; }
        return false;
      }
    }
    if (p.bee && !p.lunge && (p.lungeCd || 0) <= 0 && Math.hypot(p.bee.x - p.x, p.bee.y - p.y) < 95 * Math.max(0.7, G)) { p.lunge = { t: 0 }; p.lungeCd = 1.2; sfx.zip(); }
    p.lungeCd = (p.lungeCd || 0) - dt;
    const tg = p.bee || { x: spoon.x, y: spoon.y - 10 }, sp = (p.bee ? 230 : spoon.mark > 0 ? 230 : 170) * Math.max(0.7, G);
    const want = Math.atan2(tg.y - p.y, tg.x - p.x), cur = p.vx || p.vy ? Math.atan2(p.vy, p.vx) : want;
    const a = cur + clamp(Math.atan2(Math.sin(want - cur), Math.cos(want - cur)), -4 * dt, 4 * dt);
    p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp;
    if (p.bee && Math.hypot(p.bee.x - p.x, p.bee.y - p.y) < 16 * G + 6) { killBee(p.bee); p.bee = null; p.kills = (p.kills || 0) + 1; if (p.kills >= 2) p.leave = true; }
    return false;
  }
  function stunAlly() {
    if (!ally) return;
    ally.stun = Math.max(1.2, 4 - 0.25 * (upg.colonex || 0)); // a better-paid Colonex shakes it off faster
    ally.shootT = Math.max(ally.shootT, ally.stun);
    ally.say = { text: '500$ sting fee', t: 3 }; ally.sayT = 4;
    floatText(ally.x, ally.y - 50, 'STUNG', '#ff9a8a');
  }
  // Terraria-style deaths: the body breaks into parts that tumble off the screen
  function shatter(kind, x, y, sc, flip) {
    const parts = kind === 'hornet' ? ['hwing', 'hwing', 'habdomen', 'hthorax', 'hhead'] : kind === 'bee' ? ['qwing', 'qwing', 'babdomen', 'bhead'] : ['qwing', 'qwing', 'qabdomen', 'qthorax', 'qhead'];
    for (const part of parts) gore.push({ part, x: x + rnd(-14, 14) * sc, y: y + rnd(-10, 10) * sc, vx: rnd(-280, 280), vy: rnd(-460, -160), rot: rnd(0, 6), vr: rnd(-9, 9), sc, flip, life: 3.2 });
  }
  function updateGore(dt) {
    for (let i = gore.length - 1; i >= 0; i--) { const g = gore[i]; g.vy += 950 * dt; g.x += g.vx * dt; g.y += g.vy * dt; g.rot += g.vr * dt; g.life -= dt; if (g.y > H + 90 || g.life <= 0) gore.splice(i, 1); }
  }
  function killQueen(why) { // the hornet gets her; she's back next time you call her
    if (!qd) return;
    const h = hornetOf();
    if (h) h.queenDied = true;
    shatter('queen', qd.x, qd.y, queenScale(), Math.cos(qd.ang) < 0);
    floatText(qd.x, qd.y - 40, why || 'Queen down', '#ff9a8a');
    sfx.bossDown(); qd = null;
  }

  const ATTACKS = {
    // 1. The Sus Beekeeper
    toss(b) {
      say('Free syrup for the bees!');
      const k = bossK(), x0 = b.x - 46 * k, y0 = b.y + 30 * k;
      const syrups = FAKES.filter(f => f.type === 'bottle' && f.stage === 0);
      fan(fanN(b.endless ? moreE(3) : 2, 70 * G), 70 * G).forEach((off, i) => { // the first boss throws a bit less in the story
        const f = pick(syrups);
        proj.push(P(Object.assign({ k: 'bottle', f, name: f.name, color: f.color, x: x0, y: y0, r: 20, dmg: 12, vr: rnd(-3, 3), delay: i * 0.12 }, lob(x0, y0, clamp(spoon.x + off, 20, W - 20), 1.25, 380))));
      });
      return 2.6;
    },
    susRain(b) {
      say(pick(['Certified not sus.', 'Stamp of approval!']));
      for (let i = 0, n = cntW(b.endless ? 5 : 3); i < n; i++) {
        const x = i === 0 ? clamp(spoon.x, 20, W - 20) : W * rnd(0.08, 0.92);
        proj.push(P({ k: 'susjar', name: 'Sus jar', color: '#ffcc33', x, y: combBottom() + 8, vy: rnd(150, 200), r: 18, dmg: 12, vr: rnd(-1, 1), delay: i * 0.28 }));
      }
      return 2.5;
    },
    smoke(b) {
      say("Calm down. It's just smoke.");
      const k = bossK(), x0 = b.x + 50 * k, y0 = b.y - 10 * k, er = lvOf(b);
      const light = !b.endless; // a lighter puff in the story
      const n = Math.min(W < 560 ? 3 : 9, Math.round(((light ? 2 : 3) + Math.min(3, Math.floor(er / 2))) * WX));
      for (let i = 0; i < n; i++) {
        const max = 91 * k * (light ? 0.85 : 1) * (1 + Math.min(0.3, 0.03 * er)) * (W < 560 ? 0.8 : 1), lo = Math.max(H * 0.4, bossHome() + 80 * k + max * 0.4); // under the boss, so he stays visible
        const tx = W * rnd(0.12, 0.88), ty = rnd(lo, Math.max(lo, spoon.y - max * 0.6 - 40));
        proj.push(P({ k: 'smoke', harmless: true, dmg: 0, x: x0, y: y0, vx: (tx - x0) / 1.6, vy: (ty - y0) / 1.6, r: 20 * k, seed: Math.random() * 10,
          life: (7 + Math.min(3, 0.3 * er)) * (W < 560 ? 0.75 : 1), max, drift: 40 + Math.min(60, 6 * er), off: (i - (n - 1) / 2) * W * 0.36 / n }));
      }
      return 2.2;
    },
    feeder(b) {
      say('Feeding time. During the flow.');
      const k = bossK(), x0 = b.x - 46 * k, y0 = b.y + 30 * k;
      Array.from({ length: b.endless ? moreE(2) : 1 }, (_, i) => (i % 2 ? 1 : -1) * (1 + Math.floor(i / 2))).forEach((s, i) => {
        const tx = clamp(spoon.x + s * rnd(30, 80) * G, 30, W - 30);
        proj.push(P(Object.assign({ k: 'bag', name: 'Feeder syrup', color: '#fff3a0', x: x0, y: y0, r: 16, dmg: 10, vr: rnd(-2, 2), delay: i * 0.2, sticky: 'syrup' }, lob(x0, y0, tx, 1.1, 300))));
      });
      return 2.6;
    },
    syrupStorm(b) {
      say('Syrup for everyone!');
      const syrups = FAKES.filter(f => f.type === 'bottle');
      fallers(b.endless ? 8 : 5, () => { const f = pick(syrups); return { k: 'bottle', f, name: f.name, color: f.color, vy: rnd(170, 220), r: 18, dmg: 12, vr: rnd(-2, 2) }; }, b.endless ? 0.16 : 0.24);
      return 3.0;
    },
    // 2. Colonex
    fees(b) {
      say('fees have been issued');
      fallers(4, () => { const text = pick(FEES); return { k: 'fee', name: text, color: '#f6e3b4', text, vy: rnd(125, 165), r: 18, dmg: 10 }; }, 0.3);
      return 2.6;
    },
    doubleFees(b) {
      say('all fees are now double');
      fallers(7, () => { const t = pick(FEES), n = parseInt(t, 10) * 2; const text = n + t.slice(String(parseInt(t, 10)).length); return { k: 'fee', name: text, color: '#f6e3b4', text, vy: rnd(140, 180), r: 18, dmg: 10 }; }, 0.2);
      return 3.0;
    },
    vc(b) {
      const [handle, init] = pick(VC_TARGETS);
      say(handle + ' vc?');
      sfx.ring();
      proj.push(P({ k: 'call', name: 'VC', color: '#5865f2', handle, init, x: b.x, y: b.y + 50 * bossK(), r: 18, dmg: 6, life: 3.6 }));
      return 2.8;
    },
    factorio(b) {
      say('the factory must grow');
      // a long belt right under you that drags you into an assembling machine at its far end
      const len = W * (W < 560 ? rnd(0.34, 0.42) : rnd(0.45, 0.55)), dir = Math.random() < .5 ? 1 : -1, f = rnd(0.25, 0.5); // shorter on a phone
      const x0 = clamp(dir > 0 ? spoon.x - len * f : spoon.x + len * f - len, 0, W - len), x1 = x0 + len;
      const mx = dir > 0 ? Math.min(x1, W - 34 * G) : Math.max(x0, 34 * G);
      proj.push(P({ k: 'belt', harmless: true, dmg: 12, name: 'Assembling machine', color: '#9aa0a8', x0, x1, x: (x0 + x1) / 2, y: H - 16, dir, mx, life: 6.5 }));
      fan(fanN(moreE(3), 80 * G), 80 * G).forEach((off, i) => {
        proj.push(P(Object.assign({ k: 'gear', name: 'Gear', color: '#9aa0a8', x: b.x, y: b.y, r: 14, dmg: 10, vr: (i % 2 ? 1 : -1) * rnd(4, 7), delay: i * 0.15 }, lob(b.x, b.y, clamp(spoon.x + off, 20, W - 20), 1.2, 400))));
      });
      return 3.4;
    },
    jobs(b) {
      say('come work for loksd corporation');
      fallers(3, () => ({ k: 'job', name: 'J*b offer', color: '#ffd36b', vy: rnd(130, 160), r: 16, dmg: 8 }), 0.3);
      return 2.6;
    },
    crow(b) {
      say('an iq too high');
      sfx.caw();
      const dir = Math.random() < .5 ? 1 : -1;
      proj.push(P({ k: 'crowFly', harmless: true, dmg: 0, x: dir > 0 ? -60 : W + 60, y: combBottom() + 60, vx: dir * (W + 120) / 2.2, life: 2.4, dropT: 0.35, dir }));
      return 2.8;
    },
    ski(b) {
      say('going skiing');
      b.mode = 'dash';
      b.dash = { st: 'tele', t: 0, fx: b.x, fy: b.y, tx: clamp(spoon.x, 40, W - 40), ty: spoon.y - 30, dmg: 16, name: 'Ski run', color: '#e8f4ff' };
      sfx.warn();
      return 3.0;
    },
    gifs(b) {
      say('gorilla');
      fallers(3, () => ({ k: 'gif', name: 'Gorilla GIF', color: '#c9c9c9', vy: rnd(140, 180), r: 18, dmg: 10 }), 0.25);
      return 2.4;
    },
    cnc(b) {
      say('back to j*b');
      sfx.warn();
      proj.push(P({ k: 'beam', harmless: true, dmg: 14, name: 'CNC router', color: '#9be7ff', x: clamp(spoon.x, 20, W - 20), y: H / 2, tele: 0.9, on: 0.45 }));
      return 2.6;
    },
    roblox(b) {
      say(pick(['roblox is stupid game', 'stop playing roblox']));
      for (let i = 0, n = cntA(4); i < n; i++) {
        proj.push(P(Object.assign({ k: 'block', name: 'Stupid game', color: '#e2231a', x: b.x, y: b.y, r: 14, dmg: 10, vr: rnd(-4, 4), delay: i * 0.14 }, lob(b.x, b.y, clamp(spoon.x + rnd(-120, 120) * G, 20, W - 20), 1.25, 420))));
      }
      return 2.6;
    },
    // 3. The App Founder
    notify(b) {
      say(pick(['Download my app.', 'Track your honey.']));
      fallers(3, () => ({ k: 'notify', name: 'Push notification', color: '#ffffff', vy: rnd(125, 165), r: 20, dmg: 10, text: pick(NOTIFS) }), 0.35);
      return 2.5;
    },
    sheets(b) {
      say('Who made this spreadsheet?');
      floatText(W / 2, H * 0.4, 'HONEY TRACKER.GSHEET', '#34a853', true);
      sfx.warn();
      wall(() => ({ k: 'cell', name: 'Spreadsheet', color: '#34a853', text: pick(CELLS), vy: 150, r: 14, dmg: 12 }), 0.7);
      return 3.2;
    },
    errors(b) {
      say(pick(['Why is everything #REF!?', 'Who broke the formula?']));
      const k = bossK(), x0 = b.x + 30 * k, y0 = b.y;
      const a = Math.atan2(spoon.y - y0, spoon.x - x0);
      fan(moreE(3), 0.25).forEach((da, i) => proj.push(P({ k: 'cell', name: pick(['#REF!', '#DIV/0!', '#N/A']), color: '#ea4335', text: pick(['#REF!', '#DIV/0!', '#N/A', '#VALUE!']), x: x0, y: y0, vx: Math.cos(a + da) * 290, vy: Math.sin(a + da) * 290, r: 13, dmg: 10, vr: rnd(-3, 3), delay: i * 0.1 })));
      return 2.2;
    },
    bars(b) {
      say(pick(["What's our MRR?", 'Churn is up. Who did this?', 'Downloads are flat. Why are downloads flat?']));
      sfx.warn();
      const w = clamp(spoonSize() * 1.2, 56, 90);
      const xs = [clamp(spoon.x, w / 2 + 6, W - w / 2 - 6)], want = cntW(3);
      for (let tries = 0; xs.length < want && tries < 60; tries++) { const x = rnd(w / 2 + 6, W - w / 2 - 6); if (xs.every(o => Math.abs(o - x) > w * 1.6)) xs.push(x); }
      // churn is always the tallest bar
      const others = [['MRR', '#34a853'], ['Downloads', '#4285f4'], ['DAU', '#fbbc05']].sort(() => Math.random() - .5), ci = Math.floor(Math.random() * xs.length);
      let oi = 0;
      xs.forEach((x, i) => {
        const [label, color] = i === ci ? ['Churn', '#ea4335'] : others[oi++ % others.length];
        proj.push(P({ k: 'bar', harmless: true, dmg: 14, x, y: H, w, label, color, H0: i === ci ? H * 0.56 : H * rnd(0.28, 0.42), tele: 0.95 + i * 0.12, name: label + ' chart' }));
      });
      return 3.2;
    },
    chess(b) {
      say(pick(['Check.', 'Chess after this?']));
      [-1, 1].forEach(s => proj.push(P({ k: 'bishop', name: 'Bishop', color: '#f6e3b4', x: b.x, y: b.y + 20, vx: s * rnd(140, 190), vy: rnd(120, 150), r: 14, dmg: 12, dark: s > 0 })));
      fan(fanN(moreE(3), 70 * G), 70 * G).forEach((off, i) => {
        const y = combBottom() + 10;
        proj.push(P({ k: 'pawn', name: 'Pawn', color: '#f6e3b4', x: clamp(spoon.x + off, 20, W - 20), y, ty: y, stepT: 0.3 + i * 0.1, r: 12, dmg: 10, dark: i % 2 === 0 }));
      });
      return 3.0;
    },
    knight(b) { // hops towards you in L-shapes; each landing square lights up first
      say(pick(['Check.', 'Chess after this?']));
      const c = clamp(70 * G, 46, 76), floor = spoon.y, rows = Math.max(3, Math.floor((floor - combBottom() - 40) / c));
      proj.push(P({ k: 'knight', harmless: true, dmg: 14, name: 'Knight', color: '#f4f1ea', x: clamp(b.x, c, W - c), y: floor - rows * c, c, floor, hops: 0, maxHops: rows + 4, st: 'pick' }));
      return 3.6;
    },
    checkmate(b) {
      say('Checkmate.');
      floatText(W / 2, H * 0.4, 'CHECKMATE', '#f6e3b4', true);
      sfx.warn();
      let n = 0;
      const pawn = () => { const y = combBottom() + 10; return { k: 'pawn', name: 'Pawn', color: '#f6e3b4', ty: y, stepT: 0.3, r: 12, dmg: 12, dark: n++ % 2 === 0 }; };
      const g1 = wall(pawn, 0.5, 3.2);
      // a second wave with its gap well away from the first, so you have to cross over
      const g2 = clamp(g1 + (g1 < W / 2 ? 1 : -1) * W * rnd(0.25, 0.4), W * 0.15, W * 0.85);
      wall(pawn, 2.1, 3.2, g2);
      return 4.4;
    },
    deenbuddy(b) {
      say(pick(["Don't you dare download that.", "We don't say that name in this office."]));
      for (let i = 0, n = cntW(2); i < n; i++) proj.push(P({ k: 'deen', name: 'DeenBuddy', color: '#1f9d8f', x: i === 0 ? clamp(spoon.x + rnd(-40, 40), 20, W - 20) : W * rnd(0.1, 0.9), y: combBottom() + 10, vy: rnd(140, 180), r: 16, dmg: 15, delay: i * 0.4, vr: rnd(-1, 1) }));
      return 2.6;
    },
    fired(b) {
      say("You're fired!");
      sfx.warn();
      proj.push(P({ k: 'stamp', name: 'Fired', color: '#c8102e', x: clamp(spoon.x, 40, W - 40), y: combBottom() + 10, vy: 1300, r: 30, dmg: 18, delay: 1.0 }));
      return 2.8;
    },
    // 4. The Shilajit Coach
    rope(b) {
      say("Don't eat this if you're not married.");
      sfx.warn();
      proj.push(P({ k: 'rope', harmless: true, dmg: 16, name: 'Shilajit rope', color: '#1a1410', x: clamp(spoon.x, 30, W - 30), y: H / 2, tele: 1.0 }));
      return 2.8;
    },
    ropeDouble(b) {
      say('Day two. Lesgo.');
      sfx.warn();
      proj.push(P({ k: 'rope', harmless: true, dmg: 16, name: 'Shilajit rope', color: '#1a1410', x: clamp(spoon.x, 30, W - 30), y: H / 2, tele: 1.0 }));
      proj.push(P({ k: 'rope', harmless: true, dmg: 16, name: 'Shilajit rope', color: '#1a1410', x: W / 2, y: H / 2, tele: 1.0, delay: 1.1, track: true }));
      return 3.6;
    },
    prices(b) {
      say('If you really have a premium product, raise your prices.');
      const k = bossK(), x0 = b.x + 30 * k, y0 = b.y;
      PRICES.forEach((text, i) => {
        const big = i === PRICES.length - 1;
        proj.push(P(Object.assign({ k: 'tag', name: big ? '1k story post' : 'Price hike', color: '#ffe9a8', text, big, x: x0, y: y0, r: big ? 22 : 13 + i, dmg: big ? 14 : 10, vr: rnd(-3, 3), delay: i * 0.32 }, lob(x0, y0, clamp(spoon.x + rnd(-90, 90) * G, 20, W - 20), 1.2, 420))));
      });
      return 3.2;
    },
    pushups(b) {
      say('Day 1 of 500 pushups.');
      b.pushup = 4; b.repT = 0.3; b.reps = 0;
      return 4.6;
    },
    resin(b) {
      say("Don't eat this if you're not married.");
      const k = bossK(), x0 = b.x, y0 = b.y + 20 * k;
      fan(fanN(moreE(4), 70 * G), 1).forEach((s, i) => proj.push(P(Object.assign({ k: 'resinBlob', name: 'Shilajit resin', color: '#1a1410', x: x0, y: y0, r: 13, dmg: 10, vr: rnd(-3, 3), delay: i * 0.18, sticky: 'resin' }, lob(x0, y0, clamp(spoon.x + s * 70 * G, 30, W - 30), 1.15, 380)))));
      return 2.6;
    },
    drinks(b) {
      say(pick(['Watermelon juice and saffron water.', '20 grams of creatine a day.', 'Big man ting yeah']));
      fallers(6, () => { const kind = pick(Object.keys(DRINKS)); return { k: kind, name: DRINKS[kind][0], color: DRINKS[kind][1], vy: rnd(150, 190), r: 15, dmg: 10, vr: rnd(-2, 2) }; }, 0.25);
      return 2.6;
    },
    // 5. The Honey Apologist
    blend(b) {
      say('China plus Turkey plus Uzbekistan...');
      const k = bossK(), tx = clamp(spoon.x, 60, W - 60), ty = b.y + 125 * k, fy = b.y + 20 * k;
      ['cn', 'tr', 'uz', '?'].forEach((c, i) => {
        const fx = W * (0.14 + i * 0.24);
        proj.push(P({ k: 'blendSrc', harmless: true, dmg: 0, flags: [c], x: fx, y: fy, fx, fy, tx, ty, dur: 1.2, r: 13, lead: i === 0 }));
      });
      return 3.4;
    },
    volley(b) {
      say(pick(['Imported fresh!', 'Relabelled with love.', 'Let me just check my notes.']));
      const k = bossK(), x0 = b.x + 36 * k, y0 = b.y - 50 * k;
      const a = Math.atan2(spoon.y - y0, spoon.x - x0);
      fan(moreE(3), 0.22).forEach((da, i) => proj.push(P({ k: 'flagjar', name: 'Relabelled honey', color: '#5aa0ff', flags: [i % 2 ? 'pride' : 'il'], x: x0, y: y0, vx: Math.cos(a + da) * 300, vy: Math.sin(a + da) * 300, r: 15, dmg: 12, vr: rnd(-4, 4), delay: i * 0.1 })));
      return 2.0;
    },
    dilemma(b) {
      say("Either your honey is preserved or it's corrupted. Either way, buy mine.");
      floatText(W / 2, H * 0.4, 'THE HONEY DILEMMA', '#f2a7bd', true);
      sfx.warn();
      wall(() => ({ k: 'flagjar', name: 'The Honey Dilemma', color: '#f2a7bd', flags: [Math.random() < .5 ? 'il' : 'pride'], vy: 150, r: 15, dmg: 14, vr: rnd(-1, 1) }), 0.7);
      return 3.4;
    },
    dilemma2(b) {
      floatText(W / 2, H * 0.4, 'DOUBLE DILEMMA', '#f2a7bd', true);
      sfx.warn();
      wall(() => ({ k: 'flagjar', name: 'The Honey Dilemma', color: '#f2a7bd', flags: [Math.random() < .5 ? 'il' : 'pride'], vy: 150, r: 15, dmg: 14, vr: rnd(-1, 1) }), 0.7);
      wall(() => ({ k: 'flagjar', name: 'The Honey Dilemma', color: '#f2a7bd', flags: [Math.random() < .5 ? 'il' : 'pride'], vy: 150, r: 15, dmg: 14, vr: rnd(-1, 1) }), 2.1);
      return 4.4;
    },
    axes(b) {
      say(pick(['Answer the question. Yes or no.', 'Interesting. Very interesting.']));
      const k = bossK(), x0 = b.x + 30 * k, y0 = b.y - 10 * k;
      fan(fanN(moreE(3), 90 * G), 1).forEach((sd, i) => proj.push(P(Object.assign({ k: 'axe', name: 'Ball-peen hammer', color: '#c9ced6', x: x0, y: y0, r: 15, dmg: 12, vr: (sd < 0 ? -1 : 1) * 11, delay: i * 0.22 }, lob(x0, y0, clamp(spoon.x + sd * 90 * G, 20, W - 20), 1.15, 520)))));
      return 2.6;
    },
    axeChop(b) {
      say('Cross-examination time.');
      sfx.warn();
      proj.push(P({ k: 'chop', harmless: true, dmg: 18, name: 'Hammer blow', color: '#c9ced6', x: clamp(spoon.x, 30, W - 30), y: H / 2, tele: 1.05 }));
      return 3.0;
    },
    // 6. The Looksmaxxer
    hypergamy(b) { // his signature attack: pink figures along the top fire along dashed arrows at a few blue men, one under you
      say("Women won't buy your honey. You're sub 5.");
      sfx.warn();
      const n = Math.min(40, cntW(9)), tops = [], top = combBottom() + 78;
      for (let i = 0; i < n; i++) tops.push(W * (i + 0.5) / n);
      const m = Math.min(8, Math.round((Math.random() < 0.5 ? 2 : 3) * WX) + Math.min(3, Math.floor(lvOf(b) / 2))), xs = [clamp(spoon.x, 30, W - 30)];
      const gap = Math.min(W * 0.22, W * 0.62 / m);
      for (let tries = 0; xs.length < m && tries < 80; tries++) { const x = rnd(40, W - 40); if (xs.every(o => Math.abs(o - x) > gap)) xs.push(x); }
      proj.push(P({ k: 'hyper', harmless: true, dmg: 0, x: W / 2, y: H / 2, tops, top, targets: xs.map((x, j) => ({ x, x0: x, ph: rnd(0, 6), track: j === 0 })), tele: 1.2, waves: b.p2 ? 2 : 1, moving: b.p2, fired: 0 }));
      return b.p2 ? 3.9 : 3.4;
    },
    needles(b) {
      say("Trust me bro, I'm natty.");
      const k = bossK(), x0 = b.x + 40 * k, y0 = b.y - 20 * k;
      fan(fanN(moreE(3), 75 * G), 75 * G).forEach((off, i) => { const label = NEEDLES[i % NEEDLES.length]; proj.push(P(Object.assign({ k: 'syringe', name: label === 'FIN' ? 'Finasteride' : label === 'TRT' ? 'TRT' : 'Peptides', color: '#9be7ff', label, x: x0, y: y0, r: 13, dmg: 10, delay: i * 0.18 }, lob(x0, y0, clamp(spoon.x + off, 20, W - 20), 1.0, 360)))); });
      return 2.4;
    },
    ratings(b) {
      say(pick(["Your canthal tilt is why the honey isn't selling.", 'Ur a Jeffrey.']));
      fallers(4, () => { const text = pick(RATINGS); return { k: 'rate', name: 'Rated ' + text, color: '#ff5a6e', text, vy: rnd(130, 170), r: 18, dmg: 10 }; }, 0.3);
      return 2.6;
    },
    goyBeam(b) { // the goy beam: a big ray gun drops down over your column, charges, and fires
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
    pills(b) {
      say('Endocrine warfare is killing your T, bro.');
      const k = bossK(), x0 = b.x, y0 = b.y + 20 * k;
      for (let i = 0, n = cntA(4); i < n; i++) proj.push(P(Object.assign({ k: 'pill', name: 'Pills', color: pick(['#e2492f', '#4a7dff', '#f2c200']), x: x0, y: y0, r: 10, dmg: 8, vr: rnd(-6, 6), delay: i * 0.15, bounces: 0 }, lob(x0, y0, clamp(spoon.x + rnd(-160, 160) * G, 20, W - 20), 0.9, 700))));
      return 2.6;
    },
    liver(b) {
      say("At least you sell raw honey. But why don't you eat raw meat?");
      const k = bossK(), x0 = b.x - 30 * k, y0 = b.y + 10 * k;
      fan(moreE(2), 1).forEach((sd, i) => proj.push(P(Object.assign({ k: 'liver', name: 'Raw liver', color: '#8e1b2a', x: x0, y: y0, r: 16, dmg: 12, vr: rnd(-2, 2), delay: i * 0.25 }, lob(x0, y0, clamp(spoon.x + Math.sign(sd) * (Math.abs(sd) + 0.5) * rnd(20, 70) * G, 20, W - 20), 1.2, 400)))));
      return 2.6;
    },
    courseAd(b) {
      say('Link in bio. $199 jawline course.');
      floatText(W / 2, H * 0.4, '$199 JAWLINE COURSE · LINK IN BIO', '#ffd36b', true);
      sfx.warn();
      wall(() => ({ k: 'ad', name: 'Jawline course', color: '#ffd400', vy: 150, r: 14, dmg: 12 }), 0.7);
      return 3.2;
    },
    chatFlood(b) {
      say('Forty thousand watching. Biggest stream ever.');
      floodChat(cntA(5));
      return 2.8;
    },
    bonesmash(b) {
      say('Mew harder.');
      sfx.warn();
      proj.push(P({ k: 'hammer', harmless: true, dmg: 16, name: 'Bonesmash', color: '#c9ced6', x: clamp(spoon.x, 30, W - 30), y: H / 2, tele: 0.95 }));
      return 2.8;
    },
    subathon(b) {
      floatText(W / 2, H * 0.4, 'SUBATHON', '#ff5a6e', true);
      sfx.warn();
      floodChat(cntA(9));
      fallers(3, () => { const text = pick(DONOS); return { k: 'dono', name: 'Donation alert', color: '#3ddc84', text, vy: rnd(120, 150), r: 18, dmg: 10 }; }, 0.45);
      if (chat) chat.flood = 6;
      return 3.8;
    },
    // 7. The Disprover
    barrage(b) {
      say(pick(['Popsicles disprove atheism.', 'Pizza disproves atheism.', 'Watermelon disproves atheism.', 'Every time you drink cola...']));
      const k = bossK(), x0 = b.x, y0 = b.y - 10 * k;
      for (let i = 0, n = cntA(6); i < n; i++) {
        const kind = pick(Object.keys(SNACKS));
        proj.push(P(Object.assign({ k: kind, name: SNACKS[kind][0], color: SNACKS[kind][1], x: x0, y: y0, r: 15, dmg: 12, vr: rnd(-5, 5), delay: i * 0.16 }, lob(x0, y0, clamp(spoon.x + rnd(-130, 130) * G, 20, W - 20), 1.35, 420))));
      }
      return 2.6;
    },
    hexagons(b) {
      say('Which university did the bee go to?');
      for (let i = 0, n = cntW(2); i < n; i++) proj.push(P({ k: 'hexBig', name: 'The hexagon equation', color: '#f2a516', x: W * (0.1 + 0.8 * (i + 0.5) / n) + rnd(-30, 30), y: combBottom() + 10, vy: 115, r: 28, dmg: 14, vr: 1.4, delay: i * 0.4 }));
      return 2.8;
    },
    quarks(b) {
      say('Show me the first two quarks!');
      for (let i = 0, n = moreE(1); i < n; i++) proj.push(P({ k: 'quarks', name: 'The first two quarks', color: '#ff5a7a', x: b.x + (i ? rnd(-80, 80) : 0), y: b.y + 30, r: 16, dmg: 14, a: i * 2, life: 3.4, delay: i * 0.5 }));
      return 3.0;
    },
    quarkStorm(b) {
      say('Show me the quarks. All of them.');
      for (let i = 0, n = moreE(2); i < n; i++) proj.push(P({ k: 'quarks', name: 'The first two quarks', color: '#ff5a7a', x: b.x + (i ? rnd(-60, 60) * G : 0), y: b.y + 30, r: 16, dmg: 14, a: i * 2, life: 3.0, delay: i * (1.1 + 1.6 * (1 - WR)) })); // from him, one after the other (further apart on small screens), so they can't pin you from both sides
      [0.5].forEach(fx => proj.push(P({ k: 'hexBig', name: 'The hexagon equation', color: '#f2a516', x: W * fx, y: combBottom() + 10, vy: 125, r: 28, dmg: 14, vr: 1.4, delay: 0.8 + 3.5 * (1 - WR) }))); // on small screens it waits until the quarks are done
      return 3.6;
    },
    missingLink(b) {
      say(pick(['Show me the half bee. Show me one half bee.', 'Which monkey taught the bee the hexagon? Remind me again.']));
      floatText(W / 2, H * 0.4, 'THE MISSING LINK', '#cfe8ff', true);
      sfx.warn();
      const step = 38 * G, gapW = spoonSize() * 3.0, gx = W * rnd(0.18, 0.82), y = combBottom() + 6;
      let i = 0;
      for (let x = 10; x < W + 30; x += step, i++) {
        if (Math.abs(x - gx) < gapW / 2) continue;
        const nearGap = Math.abs(x - gx) < gapW / 2 + step;
        proj.push(P({ k: 'link', name: 'Missing link', color: '#b8c0cc', x, y, vy: 150, r: 13, dmg: 12, delay: 0.7, flip: nearGap ? 0 : i % 2, broken: nearGap ? (x < gx ? 1 : -1) : 0 }));
      }
      proj.push(P({ k: 'linkGap', harmless: true, dmg: 0, x: gx, y, vy: 150, delay: 0.7 }));
      return 3.2;
    },
    fishLegs(b) {
      say('Your grandfather was a fish? Speak for yourself.');
      for (let i = 0, n = cntA(2); i < n; i++) {
        const dir = i % 2 ? -1 : 1;
        proj.push(P({ k: 'fish', name: 'Fish with legs', color: '#7fa7c9', x: dir > 0 ? -40 : W + 40, y: H - 22, vx: dir * 120, r: 15, dmg: 12, dir, face: dir, walk: rnd(0, 6), delay: i * 0.7, safe: true }));
      }
      return 3.0;
    },
    // 8. Vespa mandarinia
    minis(b) {
      say(pick(['Lads. The bees.', 'Go get the workers.', 'Thirty of us. Thirty thousand of you. Do the maths.']));
      const n = Math.min(5, 2 + (b.p2 ? 1 : 0) + Math.floor(lvOf(b) / 6)), k = bossK();
      for (let i = 0; i < n; i++) spawnMini(b, b.x + rnd(-40, 40) * k, b.y + 20 * k);
      sfx.whoosh();
      return 3.0;
    },
    stinger(b) {
      say(pick(['Sting.', 'Hold still.', 'This will sting.']));
      shootStinger(b, 0);
      return 2.2;
    },
    bigStinger(b) { // a warning line that follows you, turns red and locks, then the big one
      say(pick(['Hold still.', 'This will sting.', 'Big one.']));
      const n = b.p3 ? 3 : b.p2 ? 2 : 1;
      for (let i = 0; i < n; i++) proj.push(P({ k: 'bigSting', name: 'Giant stinger', color: '#2a1606', x: b.x, y: b.y, r: 13, dmg: 14, ang: Math.PI / 2, tele: 0.85 + i * 0.5, owner: b, safe: true }));
      sfx.warn();
      return 2.2 + n * 0.5;
    },
    stingerFan(b) {
      say('One sting for each of your excuses.');
      for (const da of [-0.36, -0.18, 0, 0.18, 0.36]) shootStinger(b, da);
      return 2.6;
    },
    spray(b) { // like the Queen Bee in Terraria: a stream of stingers aimed where you're heading
      say(pick(['Keep running.', 'Dance, little bee.', 'Sting sting sting sting.']));
      const n = (b.p3 ? 11 : b.p2 ? 9 : 7) - (W < 560 ? 2 : 0);
      b.spray = { left: n, next: 0.35, every: b.p3 ? 0.15 : 0.2 };
      return 1.6 + n * 0.2;
    },
    curtain(b) {
      say(pick(['Find the gap.', 'Rain.']));
      stingCurtain(b, rnd(0.15, 0.85), 0);
      return 2.8;
    },
    curtain2(b) {
      say('And again.');
      const g1 = rnd(0.15, 0.85); let g2 = g1 + (Math.random() < 0.5 ? -1 : 1) * rnd(0.25, 0.4);
      if (g2 < 0.1 || g2 > 0.9) g2 = g1 + (g1 < 0.5 ? 1 : -1) * rnd(0.25, 0.4);
      stingCurtain(b, g1, 0); stingCurtain(b, g2, 1.0);
      return 3.6;
    },
    mark(b) { // real giant hornets mark a hive for the others
      say(pick(['Marked.', 'You smell like dinner.', 'Lads. This one.']));
      const k = bossK(), x0 = b.x, y0 = b.y + 20 * k, a = Math.atan2(spoon.y - 10 - y0, spoon.x - x0), v = 300 * hornetSpd(b);
      proj.push(P({ k: 'markDart', name: 'Pheromone', color: '#c8102e', x: x0, y: y0, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 8, dmg: 2, ang: a, owner: b }));
      for (let i = 0; i < 2; i++) spawnMini(b, b.x + rnd(-40, 40) * k, b.y + 20 * k);
      return 2.6;
    },
    massacre(b) { // a sweep through the hive: every worker bee he passes goes down, and stays down longer
      if (bees.length < 2) return ATTACKS.bigStinger(b);
      say(pick(['Thirty of us. Thirty thousand of you.', 'Your workers. My dinner.', 'Decapitation time.']));
      floatText(W / 2, H * 0.4, 'MASSACRE', '#ff5a3c', true); sfx.warn();
      const fromLeft = b.x < W / 2, y = clamp(bees.reduce((m, x) => m + x.y, 0) / bees.length, bossHome() + 20, H * 0.62); // through the middle of the swarm
      b.mode = 'dash';
      b.dash = { st: 'tele', t: 0, tele: 0.75, fx: fromLeft ? -90 : W + 90, fy: y, tx: fromLeft ? W + 90 : -90, ty: y, hx: b.x, dmg: 0, massacre: true, dur: 1.0, name: 'Massacre', color: '#ff5a3c' };
      return 3.2;
    },
    scouts(b) { // two scout hornets; he hangs back until they're down
      say('Scouts. Find the hive.');
      floatText(W / 2, H * 0.4, 'SCOUTS', '#ff5a3c', true);
      const k = bossK(), hp = Math.round(30 * (1 + 0.1 * lvOf(b)));
      for (const sd of [-1, 1]) proj.push(P({ k: 'scout', harmless: true, dmg: 0, name: 'Scout hornet', color: '#e89a2c', x: sd < 0 ? -40 : W + 40, y: bossHome() + 50 * k, hx: sd < 0 ? 0.22 : 0.78, hp, max: hp, shootT: 1.2 + (sd > 0 ? 0.7 : 0), diveT: 3 + (sd > 0 ? 1.8 : 0), life: 12, r: 24 * k, owner: b, ph: rnd(0, 6) }));
      return 2;
    },
    diveChain(b) { // three bites in a row
      ATTACKS.diveBite(b);
      b.dash.chain = 2; b.dash.tele = 0.5;
      say(pick(['Bite. Bite. Bite.', 'Mandibles.']), { force: true });
      return 4.2;
    },
    stingAlly(b) {
      if (!ally || !allyActive()) return ATTACKS.bigStinger(b);
      say('And you, with the invoices.');
      const k = bossK(), x0 = b.x, y0 = b.y + 10 * k, a = Math.atan2(ally.y - y0, ally.x - x0);
      proj.push(P({ k: 'stingerAlly', harmless: true, dmg: 0, name: 'Stinger', color: '#2a1606', x: x0, y: y0, vx: Math.cos(a) * 440, vy: Math.sin(a) * 440, r: 7, ang: a }));
      return 2.4;
    },
    hawk(b) { // hovers by your spoon and snatches honey; the magnet pushes him off
      say(pick(["I'll just wait by the entrance.", 'Hawking. Look it up.', "Is that honey? That's mine now."]));
      b.hawk = { t: 0, dur: 4.5, side: Math.random() < 0.5 ? -1 : 1, said: 0 };
      return 5.4;
    },
    nest(b) { // a paper nest on the ceiling keeps sending mini hornets until you knock it down with honey
      if (proj.some(q => q.k === 'nest' && !q.dead)) return ATTACKS.minis(b);
      say(pick(['Paper nest. Very sustainable.', 'I made this out of your fence.']));
      const k = bossK(), hp = Math.round(18 * (1 + 0.1 * lvOf(b)));
      proj.push(P({ k: 'nest', harmless: true, dmg: 0, name: 'Paper nest', color: '#cfc3a8', x: W * rnd(0.15, 0.85), y: combBottom() + 40 * k, r: 26 * k, hp, max: hp, spawnT: 1.4 }));
      return 2.4;
    },
    swarm(b) {
      say('All of you. Now.');
      floatText(W / 2, H * 0.4, 'THE SWARM', '#ff5a3c', true);
      const side = Math.random() < 0.5 ? -1 : 1;
      for (let i = 0; i < 5; i++) spawnMini(b, side < 0 ? -30 - i * 40 : W + 30 + i * 40, H * 0.3 + (i % 2) * 40);
      return 3.4;
    },
    diveBite(b) {
      const aim = hornetAim();
      say(pick(['Bite.', 'Mandibles.', "You're the snack."]));
      b.mode = 'dash';
      b.dash = { st: 'tele', t: 0, tele: b.p3 ? 0.55 : 0.8, fx: b.x, fy: b.y, hx: b.x, tx: clamp(aim.x, 40, W - 40), ty: aim.queen ? aim.y : spoon.y - 30, dmg: 18, name: 'Mandible bite', color: '#ff9a3c' };
      sfx.warn();
      return 3.0;
    },
    bigbang(b) {
      say('The Big Bang has no legs!');
      sfx.warn();
      proj.push(P({ k: 'ring', name: 'Big Bang', color: '#ff9a3c', x: clamp(spoon.x, 40, W - 40), y: spoon.y - 60, tele: 1.1, R: clamp(Math.min(W * 0.26, H * 0.42), 80, 300), dmg: 22, harmless: true }));
      return 3.2;
    },
  };

  const SWAY = { notify: 1, fee: 1, gif: 1, job: 1, rate: 1, dono: 1 };
  function projHit(p) {
    const o = p.owner || boss;
    const notation = p.k === 'bishop' ? 'Bx' + square(spoon.x, 1) : p.k === 'pawn' ? square(spoon.x, 1) + '=Q' : null; // a pawn that reaches you promotes
    if (!hurtSpoon(p.dmg, p.color, p.name, { boss: o, notation, pierce: p.k === 'bigSting' })) return;
    if (p.k === 'call') { spoon.frozen = 1.0; floatText(spoon.x, spoon.y - 82, 'joined vc', '#9aa4ff'); }
    else if (p.k === 'stinger' || p.k === 'bigSting' || p.k === 'miniSting') venomHit(p.k === 'bigSting' ? 2 : 1, p.k !== 'miniSting'); // venom: drains purity and slows you; Beeswax coating weakens it
    else if (p.k === 'markDart') { spoon.mark = 5; floatText(spoon.x, spoon.y - 82, 'MARKED', '#ff5a3c'); for (const q of proj) if (q.k === 'mini') q.bee = null; }
    else if (p.k === 'job') { spoon.slow = 2.5; floatText(spoon.x, spoon.y - 82, 'welcome to loksd corporation', '#ffd36b'); }
    else if (p.k === 'deen' && o && fighting(o)) {
      floatText(spoon.x, spoon.y - 82, 'Downloaded DeenBuddy', '#1f9d8f');
      say('YOU DOWNLOADED DEENBUDDY?!', { force: true }, o);
      o.forceNext = 'fired'; o.atkT = Math.min(o.atkT, 0.5);
    }
  }
  function updateProj(rdt) {
    const sm = smokeT > 0 ? smokeSlow : 1, dt = rdt * sm;
    const S = spoonSize() * (rush > 0 ? 1.25 : 1);
    const pdt0 = dt * HS * (1 + 0.5 * Math.min(bossIdx, BOSS_COUNT - 1) / (BOSS_COUNT - 1));
    for (let i = proj.length - 1; i >= 0; i--) {
      const p = proj[i];
      const pdt = p.owner && endless ? pdt0 + dt * HS * Math.min(0.9, 0.08 * lvOf(p.owner)) : pdt0; // endless: faster each time you meet him
      if (p.dead) { proj.splice(i, 1); continue; }
      if (p.delay > 0) { p.delay -= dt; if (p.delay <= 0 && p.track) p.x = clamp(spoon.x, 30, W - 30); continue; }
      p.t += dt;
      const k = p.k;
      if (k === 'blendSrc') {
        const e = ease(Math.min(1, p.t / p.dur));
        p.x = p.fx + (p.tx - p.fx) * e; p.y = p.fy + (p.ty - p.fy) * e;
        if (p.t >= p.dur) {
          proj.splice(i, 1);
          if (p.lead) {
            splat(p.tx, p.ty, '#f2a516', 14);
            proj.push(P({ k: 'blend', name: 'Blended honey', color: '#f2a7bd', flags: ['il', 'pride'], x: p.tx, y: p.ty, vy: 40, g: 240, r: 28, dmg: 20, vr: 0.6 }));
            floatText(p.tx, p.ty - 46, '= PREMIUM', '#ffd36b');
            sfx.boom();
          }
        }
        continue;
      }
      if (k === 'smoke') {
        if (p.t < 1.6) { p.x += p.vx * dt; p.y += p.vy * dt; }
        else { const tx = clamp(spoon.x + p.off, 40, W - 40); p.x += clamp(tx - p.x, -p.drift * dt, p.drift * dt); } // then it creeps after your spoon
        p.r = Math.min(p.max, p.r + dt * 50);
        if (p.t > p.life) proj.splice(i, 1);
        continue;
      }
      if (k === 'belt') {
        if (p.t > p.life) { proj.splice(i, 1); continue; }
        if (p.t > 0.5 && Math.abs(spoon.x - p.mx) < 30 * G + S * 0.3) { // dragged into the assembling machine
          if (hurtSpoon(p.dmg, p.color, p.name, { boss: p.owner || boss })) {
            const kb = -p.dir * 160 * G;
            spoon.tx = clamp(spoon.x + kb, 20, W - 20); spoon.drift += kb; if (drag) drag.s0 += kb;
            sfx.thud(); splat(spoon.x, spoon.y, '#9aa0a8', 10);
          }
          if (state !== 'play') return;
        }
        continue;
      }
      if (k === 'crowFly') {
        p.x += p.vx * dt; p.y = combBottom() + 60 + Math.sin(p.t * 5) * 14;
        p.dropT -= dt;
        if (p.dropT <= 0 && p.x > 20 && p.x < W - 20) {
          p.dropT = 0.45;
          proj.push(P({ k: 'eq', name: 'An IQ too high', color: '#cfe8ff', text: pick(EQUATIONS), x: p.x, y: p.y + 10, vy: 120, g: 160, r: 15, dmg: 10, vr: rnd(-1.5, 1.5) }));
        }
        if (p.t > p.life) proj.splice(i, 1);
        continue;
      }
      if (k === 'ring') {
        if (p.t >= p.tele) {
          if (!p.boomed) { p.boomed = true; sfx.boom(); shake = reduceMotion ? 0 : 10; }
          const u = Math.min(1, (p.t - p.tele) / 0.6);
          p.rr = ease(u) * p.R;
          if (!p.hit && Math.abs(Math.hypot(spoon.x - p.x, spoon.y - p.y) - p.rr) < 14 + S * 0.3) {
            p.hit = true; hurtSpoon(p.dmg, p.color, p.name, { boss: p.owner || boss });
            if (state !== 'play') return;
          }
          if (p.t - p.tele > 0.75) proj.splice(i, 1);
        }
        continue;
      }
      if (k === 'bar') {
        p.t += rdt - dt; // bar charts ignore the smoker, or they'd just block you for longer
        const t0 = p.t - p.tele;
        p.cur = t0 < 0 ? 0 : t0 < 0.25 ? ease(t0 / 0.25) * p.H0 : t0 < 1.15 ? p.H0 : t0 < 1.45 ? p.H0 * (1 - (t0 - 1.15) / 0.3) : 0;
        if (t0 >= 0 && !p.thud) { p.thud = true; sfx.hit(); }
        if (!p.hit && p.cur > H - spoon.y + 6 && Math.abs(spoon.x - p.x) < p.w / 2 + S * 0.3) {
          p.hit = true; hurtSpoon(p.dmg, p.color, p.name, { boss: p.owner || boss });
          if (state !== 'play') return;
        }
        if (t0 > 1.45) proj.splice(i, 1);
        continue;
      }
      if (k === 'beam' || k === 'rope') {
        const t0 = p.t - p.tele, on = k === 'rope' ? 0.45 : p.on, half = (k === 'rope' ? 24 : p.half || 14) * G;
        if (t0 >= 0 && !p.fired) {
          p.fired = true; shake = reduceMotion ? 0 : (k === 'rope' ? 9 : 5);
          if (k === 'beam' && !p.nolegs) {
            sfx.whoosh();
            for (let j = 0; j < 4; j++) proj.push(P({ k: 'leg', name: 'Chair leg', color: '#b07a45', x: p.x, y: H * rnd(0.4, 0.6), vx: (j % 2 ? 1 : -1) * rnd(120, 220), vy: rnd(-220, -80), g: 600, r: 10, dmg: 8, vr: rnd(-8, 8) }));
          } else if (k === 'beam') sfx.boom();
          else {
            sfx.thud();
            sticky.push({ x: p.x, w: 130 * G, life: 6, kind: 'resin' });
            splat(p.x, H - 12, '#1a1410', 10);
          }
        }
        if (t0 >= 0 && t0 < on && !p.hit && Math.abs(spoon.x - p.x) < half + S * 0.3) {
          p.hit = true; hurtSpoon(p.dmg, p.color, p.name, { boss: p.owner || boss });
          if (state !== 'play') return;
        }
        if (t0 > on + (k === 'rope' ? 0.5 : 0.2)) proj.splice(i, 1);
        continue;
      }
      if (k === 'allyFee') {
        let b = p.tgt;
        if (!b || !fighting(b)) b = p.tgt = nearestFighting(p.x);
        if (!b) { proj.splice(i, 1); continue; }
        const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy) || 1;
        p.x += dx / d * 420 * rdt; p.y += dy / d * 420 * rdt; p.rot += 8 * rdt;
        if (d < 40 * bossK()) {
          proj.splice(i, 1);
          floatText(b.x, b.y - (p.vat ? 16 : 40) * bossK(), p.text, '#b48cff', false, p.vat ? '+' + p.vat + '$ VAT' : ''); // on the boss, clear of his name bar (VAT adds a line, so a bit lower)
          const billed = (parseInt(p.text, 10) || 0) + (p.vat || 0);
          tally.billed += billed; achAdd('billed', billed, true);
          damageBoss(p.dmg, b);
          if (!anyFighting() || state !== 'play') return;
        }
        continue;
      }
      if (k === 'stingerAlly') { // flies at Colonex and stuns him
        p.x += p.vx * rdt; p.y += p.vy * rdt;
        if (ally && Math.hypot(ally.x - p.x, ally.y - p.y) < 34) { proj.splice(i, 1); stunAlly(); continue; }
        if (p.x < -40 || p.x > W + 40 || p.y > H + 40 || p.y < -40) proj.splice(i, 1);
        continue;
      }
      if (k === 'nest') {
        p.spawnT -= dt;
        if (p.spawnT <= 0 && p.owner && fighting(p.owner)) { spawnMini(p.owner, p.x, p.y + p.r); p.spawnT = 3.4; }
        p.shootT = (p.shootT ?? 1.6) - dt; // it shoots too, so knock it down
        if (p.shootT <= 0 && p.owner && fighting(p.owner)) {
          p.shootT = p.owner.p2 ? 2.6 : 3.2;
          const a = Math.atan2(spoon.y - 10 - p.y, spoon.x - p.x), v = 300 * hornetSpd(p.owner);
          proj.push(P({ k: 'stinger', name: 'Stinger', color: '#2a1606', x: p.x, y: p.y + p.r * 0.8, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 6, dmg: 5, ang: a, owner: p.owner }));
        }
        continue;
      }
      if (k === 'gapMark') { if (p.t > p.life) proj.splice(i, 1); continue; }
      if (k === 'bigSting' && !p.fired) {
        const o = p.owner, lockAt = p.tele - Math.min(0.34, p.tele * 0.4);
        if (p.t < lockAt) { // the line follows you...
          if (o && fighting(o)) { const kk = bossK(); p.x = o.x + 24 * kk * (spoon.x < o.x ? -1 : 1); p.y = o.y + 22 * kk; }
          const aim = hornetAim(); p.ang = Math.atan2(aim.y - p.y, aim.x - p.x);
        } else if (!p.locked) { p.locked = true; sfx.hit(); } // ...then turns red and locks
        if (p.t >= p.tele) { const v = 640 * hornetSpd(o); p.fired = true; p.safe = false; p.vx = Math.cos(p.ang) * v; p.vy = Math.sin(p.ang) * v; sfx.whoosh(); }
        else continue;
      }
      if (k === 'scout') {
        const o = p.owner, kk = bossK(); p.ph += dt * 30;
        if (!o || !fighting(o) || p.t > p.life) { p.y -= 320 * dt; if (p.y < -60) proj.splice(i, 1); continue; } // they fly off
        const dv = p.dive;
        if (dv) {
          dv.t += dt;
          if (dv.st === 'tele') { if (dv.t > 0.6 * teleMul(o)) { dv.st = 'go'; dv.t = 0; sfx.whoosh(); } }
          else if (dv.st === 'go') {
            const u = Math.min(1, dv.t / 0.42); p.x = dv.fx + (dv.tx - dv.fx) * u; p.y = dv.fy + (dv.ty - dv.fy) * u;
            if (!dv.hit && Math.hypot(p.x - spoon.x, p.y - spoon.y) < 30 * kk + spoonSize() * 0.35) { dv.hit = true; hurtSpoon(12, '#ff9a3c', 'Scout hornet', { boss: o }); if (state !== 'play') return; }
            if (u >= 1) { dv.st = 'back'; dv.t = 0; dv.bx = p.x; dv.by = p.y; }
          } else { const u = ease(Math.min(1, dv.t / 0.6)); p.x = dv.bx + (dv.fx - dv.bx) * u; p.y = dv.by + (dv.fy - dv.by) * u; if (dv.t > 0.6) p.dive = null; }
          continue;
        }
        p.x += (W * p.hx + Math.sin(p.t * 1.3 + p.ph) * 60 * G - p.x) * Math.min(1, dt * 2); p.y += (bossHome() + 50 * kk + Math.sin(p.t * 2) * 15 - p.y) * Math.min(1, dt * 2);
        p.shootT -= dt;
        if (p.shootT <= 0) { p.shootT = 2.0; const a = Math.atan2(spoon.y - 10 - p.y, spoon.x - p.x), v = 330 * hornetSpd(o); proj.push(P({ k: 'stinger', name: 'Stinger', color: '#2a1606', x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 6, dmg: 6, ang: a, owner: o })); }
        p.diveT -= dt;
        if (p.diveT <= 0) { p.diveT = 4.5; p.dive = { st: 'tele', t: 0, fx: p.x, fy: p.y, tx: clamp(spoon.x, 40, W - 40), ty: spoon.y - 30 }; sfx.warn(); }
        continue;
      }
      if (k === 'knightBack') {
        let b = p.tgt;
        if (!b || !fighting(b)) b = p.tgt = nearestFighting(p.x);
        if (!b) { proj.splice(i, 1); continue; }
        const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy) || 1;
        p.x += dx / d * 760 * rdt; p.y += dy / d * 760 * rdt; p.rot += p.vr * rdt;
        if (d < 40 * bossK()) {
          proj.splice(i, 1); splat(b.x, b.y, '#f4f1ea', 10);
          damageBoss(p.dmg, b);
          if (!anyFighting() || state !== 'play') return;
        }
        continue;
      }
      if (k === 'knight') {
        const c = p.c;
        if (p.st !== 'jump' && p.psx !== undefined && Math.abs(p.y - p.floor) < c * 0.5) { // sitting on your row: swipe across it to take it
          const a = p.psx - p.x, b2 = spoon.x - p.x;
          if ((a < 0 && b2 >= 0) || (a > 0 && b2 <= 0)) {
            proj.splice(i, 1); splat(p.x, p.y, '#f4f1ea', 12); floatText(p.x, p.y - c * 0.7, 'Sx' + square(p.x, knightRank(p, p.y)) + '!', '#ffd36b', false, 'Spoon takes knight'); achAdd('knights', 1);
            const kb = p.owner && fighting(p.owner) ? p.owner : nearestFighting(p.x); // and it flies back at the boss who sent it
            if (kb) proj.push(P({ k: 'knightBack', harmless: true, dmg: 6 * thickMul(upg.thick || 0), x: p.x, y: p.y, c, tgt: kb, owner: null, vr: 9 }));
            seq([523, 784], 70, 'triangle', 0.1, 0.12);
            continue;
          }
        }
        p.psx = spoon.x;
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
        } else if (p.st === 'tele') { if (p.t > 0.5 * teleMul()) { p.st = 'jump'; p.t = 0; } }
        else { // 'jump'
          const u = Math.min(1, p.t / 0.28);
          p.x = p.fx + (p.tx - p.fx) * u; p.y = p.fy + (p.ty - p.fy) * u - Math.sin(u * Math.PI) * c * 0.6;
          if (u >= 1) {
            p.hops++; p.st = 'pick'; p.t = 0; sfx.hit();
            if (!knightHint && Math.abs(p.ty - p.floor) < c * 0.5 && !(achData.stats.knights > 0)) { knightHint = true; floatText(p.x, p.y - c * 0.9, 'Swipe through it to take it', '#f6e3b4'); } // until you've taken one
            if (Math.abs(p.ty - p.floor) < c * 0.5 && Math.abs(spoon.x - p.x) < c * 0.5 + S * 0.25) { hurtSpoon(p.dmg, p.color, p.name, { boss: p.owner || boss, notation: 'Nx' + square(spoon.x, 1) }); if (state !== 'play') return; }
          }
        }
        continue;
      }
      if (k === 'hyper') {
        if (p.moving) for (const tg of p.targets) {
          if (tg.track) tg.x += (clamp(spoon.x, 30, W - 30) - tg.x) * Math.min(1, dt * 1.6);
          else tg.x = clamp(tg.x0 + Math.sin(p.t * 1.7 + tg.ph) * W * 0.12, 30, W - 30);
        }
        while (p.fired < p.waves && p.t >= p.tele + p.fired * 0.5) { fireHyper(p); p.fired++; }
        if (p.t > p.tele + (p.waves - 1) * 0.5 + 1.2) proj.splice(i, 1);
        continue;
      }
      if (k === 'hammer' || k === 'chop') {
        const t0 = p.t - p.tele, half = (k === 'hammer' ? 30 : 24) * G;
        if (t0 >= 0.06 && !p.fired) { p.fired = true; shake = reduceMotion ? 0 : 9; sfx.thud(); splat(p.x, H - 14, k === 'hammer' ? '#c9ced6' : '#b07a45', 12); }
        if (t0 >= 0.06 && t0 < 0.4 && !p.hit && Math.abs(spoon.x - p.x) < half + S * 0.3) {
          p.hit = true; hurtSpoon(p.dmg, p.color, p.name, { boss: p.owner || boss });
          if (state !== 'play') return;
        }
        if (t0 > 0.9) proj.splice(i, 1);
        continue;
      }
      if (k === 'fish') {
        // fish with legs waddle along the floor, then leap at the spoon
        p.walk += pdt * 9;
        if (!p.leapt && Math.abs(p.x - spoon.x) < 170 * Math.max(0.7, G)) { p.leapt = p.air = true; p.vy = -620; p.g = 1050; p.vx = clamp((spoon.x - p.x) / 1.1, -420, 420); p.face = Math.sign(p.vx) || p.dir; }
        if (p.air && p.y > H - 22 && p.vy > 0) { p.air = false; p.y = H - 22; p.vy = 0; p.g = 0; p.vx = p.dir * 120; p.face = p.dir; splat(p.x, H - 8, '#7fa7c9', 6); }
        p.safe = !p.air;
      }
      // moving hazards
      if (k === 'pawn') {
        p.stepT -= pdt;
        if (p.stepT <= 0) { p.ty += 38; p.stepT = 0.34; }
        p.y += (p.ty - p.y) * Math.min(1, pdt * 18);
      } else {
        if (k === 'mini' && updateMini(p, dt, S)) continue;
        if (k === 'quarks' || k === 'call') {
          if (k === 'quarks') p.a += dt * 8;
          if (p.t < p.life) { // quarks and calls home in on you for their whole life
            const dx = spoon.x - p.x, dy = spoon.y - p.y, d = Math.hypot(dx, dy) || 1;
            const sp = (k === 'call' ? 125 : 145 + Math.min(bossIdx, 5) * 5) * Math.max(0.7, G);
            if (p.vx || p.vy) { // they steer towards you but can't turn on the spot, so a late sidestep makes them miss
              const cur = Math.atan2(p.vy, p.vx), da = Math.atan2(Math.sin(Math.atan2(dy, dx) - cur), Math.cos(Math.atan2(dy, dx) - cur));
              const a = cur + clamp(da, -QUARK_TURN * dt, QUARK_TURN * dt);
              p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp;
            } else { p.vx = dx / d * sp; p.vy = dy / d * sp; }
          } else if (p.t >= p.life) p.g = 450;
        }
        const sway = SWAY[k];
        if (sway) { p.bx += p.vx * pdt; p.x = p.bx + Math.sin(p.t * 2 + p.ph) * 18; }
        p.vy += p.g * pdt;
        if (!sway) p.x += p.vx * pdt;
        p.y += p.vy * pdt;
        p.rot += p.vr * pdt;
      }
      if (magnetT > 0 && !p.harmless && p.dmg > 0) { // the honey magnet pushes boss attacks sideways, away from the spoon, and holds them up
        const R = magR() * 1.15, ddx = p.x - spoon.x, dd = Math.hypot(ddx, p.y - (spoon.y - 10));
        if (dd < R) {
          const f = 1 - dd / R, push = (ddx >= 0 ? 1 : -1) * 1000 * Math.max(G, 0.95) * (0.35 + f) * dt;
          if (SWAY[k]) p.bx += push; else p.x += push;
          if (p.vy > 0) p.y -= p.vy * pdt * Math.min(1, 2 * f);
          if (!p.deflected) { p.deflected = true; splat(p.x, p.y, '#ffd36b', 4); }
        }
      }
      if (k === 'bishop' && ((p.x < p.r && p.vx < 0) || (p.x > W - p.r && p.vx > 0))) p.vx *= -1;
      if (k === 'syringe') p.rot = Math.atan2(p.vy, p.vx);
      if (k === 'goyWord') {
        p.sqT += dt;
        if (p.y > H - 14 && p.vy > 420 && p.bounces < (W < 560 ? 3 : 4)) { p.y = H - 14; p.vy = -Math.abs(p.vy) * 0.84; p.vx *= 0.85; p.bounces++; p.sqT = 0; p.sqAx = 0; } // once the bounces get low it drops out, so it can't pin you in a corner
        if ((p.x < p.r + 8 && p.vx < 0) || (p.x > W - p.r - 8 && p.vx > 0)) { p.vx *= -0.8; p.sqT = 0; p.sqAx = 1; }
        if (p.bounces > 0 && p.y < combBottom() + 10 && p.vy < 0) { p.vy = Math.abs(p.vy) * 0.7; p.sqT = 0; p.sqAx = 0; }
      }
      if (k === 'pill') {
        if (p.y > H - 12 && p.vy > 0 && p.bounces < 3) { p.y = H - 12; p.vy = -Math.abs(p.vy) * 0.7; p.vx *= 0.45; p.bounces++; } // they bounce more in place, so they can't skid you into a corner
        if ((p.x < p.r && p.vx < 0) || (p.x > W - p.r && p.vx > 0)) p.vx *= -1;
      }
      if (k === 'hyperArrow' && p.y >= p.ty) { proj.splice(i, 1); splat(p.x, p.y, '#ff6fae', 6); continue; }
      if (k === 'blend' && p.y > H * 0.58) {
        proj.splice(i, 1);
        splat(p.x, p.y, '#f2a7bd', 12); sfx.boom();
        for (let j = -2; j <= 2; j++) proj.push(P({ k: 'flagjar', name: 'Blended honey', color: '#5aa0ff', flags: [Math.random() < .5 ? 'il' : 'pride'], x: p.x, y: p.y, vx: j * 95, vy: -140, g: 520, r: 12, dmg: 10, vr: rnd(-6, 6) }));
        continue;
      }
      if (k === 'hexBig' && p.y > H * 0.45) {
        proj.splice(i, 1);
        for (let j = 0; j < 6; j++) { const a = j * TAU / 6 + p.rot; const v = 210 * Math.max(0.65, G); proj.push(P({ k: 'hexShard', name: 'Hexagon', color: '#f2a516', x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 160, r: 8, dmg: 8, vr: 4 })); /* slower on small screens */ }
        floatText(p.x, p.y - 30, 'Hexagon!', '#ffd36b');
        continue;
      }
      if (p.sticky && p.y > H - 14) {
        proj.splice(i, 1);
        sticky.push({ x: p.x, w: 150 * G, life: 8, kind: p.sticky }); splat(p.x, H - 10, p.sticky === 'resin' ? '#1a1410' : '#fff3a0', 8);
        continue;
      }
      if (!p.harmless && p.dmg > 0 && !p.safe) {
        const hit = Math.hypot((p.x - spoon.x) * .8, p.y - spoon.y) < (S * 0.45 + p.r * ps(p) * 0.6) * NF;
        if (hit) {
          proj.splice(i, 1);
          splat(p.x, p.y, p.color, 10);
          projHit(p);
          if (state !== 'play') return;
          continue;
        }
      }
      if (p.y > H + 60 || p.x < -120 || p.x > W + 120 || p.y < -260) {
        proj.splice(i, 1);
        if (k === 'deen' && p.owner && p.owner.mode === 'fight') say('Good.', {}, p.owner);
      }
    }
  }

  function scoutDown(n) {
    shatter('hornet', n.x, n.y, bossK() * 0.4, spoon.x < n.x);
    floatText(n.x, n.y - 20, 'Scout down', '#ffd36b'); sfx.bossDown();
  }
  function nestDown(n) {
    for (let i = 0; i < 6; i++) splat(n.x + rnd(-20, 20), n.y + rnd(-20, 20), '#cfc3a8', 8);
    floatText(n.x, n.y + 30, 'Nest destroyed', '#ffd36b'); sfx.bossDown();
  }
  function updateGlobs(dt) {
    const k = bossK();
    for (let i = globs.length - 1; i >= 0; i--) {
      const g = globs[i];
      const nest = proj.find(n => (n.k === 'nest' || (n.k === 'scout' && n.t < n.life)) && !n.dead && Math.abs(n.x - g.x) < 90 * k && (!g.tgt || Math.abs(n.x - g.x) < Math.abs(g.tgt.x - g.x)));
      if (nest) { // honey flicked under the paper nest goes into it instead
        g.vx = clamp((nest.x - g.x) * 5, -700, 700); g.x += g.vx * dt; g.y += g.vy * dt;
        if (Math.hypot(g.x - nest.x, g.y - nest.y) < nest.r + g.r + 6) { globs.splice(i, 1); splat(g.x, g.y, '#f2a516', 5); nest.hp -= g.dmg; if (nest.hp <= 0) { nest.dead = true; if (nest.k === 'scout') scoutDown(nest); else nestDown(nest); } }
        else if (g.y < -30) globs.splice(i, 1);
        continue;
      }
      if (!g.tgt || !fighting(g.tgt)) g.tgt = nearestFighting(g.x);
      const b = g.tgt;
      if (b) g.vx = clamp((b.x - g.x) * 5, -700, 700); // strong aim assist, at whichever boss is nearest
      g.x += g.vx * dt; g.y += g.vy * dt;
      if (b && Math.abs(g.x - b.x) < 58 * k + g.r && g.y < b.y + 70 * k && g.y > b.y - 80 * k) {
        globs.splice(i, 1);
        splat(g.x, g.y, '#f2a516', 6);
        damageBoss(g.dmg, b);
        if (!anyFighting() || state !== 'play') return;
        continue;
      }
      if (g.y < -30) globs.splice(i, 1);
    }
  }

  // ---------- main update ----------
  function update(dt) {
    elapsed += dt;
    rush = Math.max(0, rush - dt);
    shake = Math.max(0, shake - dt * 30);
    flash = Math.max(0, flash - dt);
    hurtFlash = Math.max(0, hurtFlash - dt);
    praiseT = Math.max(0, praiseT - dt);
    comboT += dt;
    if (combo > 1 && comboT >= comboGrace()) { combo = Math.max(1, combo - 0.5); streak = (combo - 1) * 10; comboT = comboGrace() - comboStep(); }
    spoon.hurt = Math.max(0, spoon.hurt - dt);
    spoon.chew = Math.max(0, spoon.chew - dt);
    spoon.fill = Math.max(0, spoon.fill - dt * .35);
    spoon.frozen = Math.max(0, spoon.frozen - dt);
    spoon.slow = Math.max(0, spoon.slow - dt);
    spoon.sting = Math.max(0, spoon.sting - dt); spoon.anaph = Math.max(0, spoon.anaph - dt); spoon.vstackT = Math.max(0, spoon.vstackT - dt); spoon.mark = Math.max(0, spoon.mark - dt);
    if (spoon.venom > 0) {
      spoon.venom -= dt;
      if (!invincible) {
        purity = Math.max(0, purity - spoon.venomDps * dt); tally.minPurity = Math.min(tally.minPurity, purity);
        if (purity <= 0) { lastHit = { name: 'Venom', boss: hornetOf() || boss, toxin: false }; gameOver(); return; }
      }
    }
    updatePowers(dt);

    if (bot) { let tgt = null; for (const it of items) if (it.kind !== 'bad' && it.y < spoon.y && (!tgt || it.y > tgt.y)) tgt = it; if (ev && ev.k === 'flow' && ev.t > ev.tele) spoon.tx = ev.x; else if (tgt) spoon.tx = tgt.x; }
    spoon.sticky = sticky.some(s => Math.abs(s.x - spoon.x) < s.w / 2);
    let slow = spoon.sticky ? 1 - 0.9 * waxGrip() : 1;
    if (spoon.slow > 0) slow = Math.min(slow, 0.35);
    if (spoon.sting > 0) slow = Math.min(slow, 1 - 0.5 * waxGrip()); // stung: slower, less so with Beeswax coating
    if (spoon.anaph > 0) slow = Math.min(slow, 1 - 0.75 * waxGrip());
    if (spoon.frozen > 0) slow = 0;
    let belt = null;
    for (const p of proj) if (p.k === 'belt' && !(p.delay > 0) && p.t < p.life && spoon.x > p.x0 && spoon.x < p.x1) belt = p;
    if (belt) { // works against the mouse and touch too: the belt shifts where your pointer puts the spoon
      const push = belt.dir * BELT_PUSH * G * G * (W < 560 ? 0.7 : 1) * (smokeT > 0 ? smokeSlow : 1) * waxGrip() * dt;
      spoon.tx = clamp(spoon.tx + push, 20, W - 20); spoon.drift += push; if (drag) drag.s0 += push;
    } else spoon.drift *= Math.max(0, 1 - dt * 3);
    const kSpeed = W * 1.4 * slow;
    if (keys.ArrowLeft || keys.a || keys.A) spoon.tx = Math.max(20, spoon.tx - kSpeed * dt);
    if (keys.ArrowRight || keys.d || keys.D) spoon.tx = Math.min(W - 20, spoon.tx + kSpeed * dt);
    spoon.x += (spoon.tx - spoon.x) * Math.min(1, dt * 14 * slow);
    spoon.vx = (spoon.x - spoon.px) / Math.max(dt, 1e-3); spoon.px = spoon.x; // how fast it's moving, for swatting

    if (phase === 'harvest') {
      spawnT -= dt;
      if (spawnT <= 0) { spawnHarvest(); spawnT = 0.6 * rnd(0.7, 1.3) / G / WX / (endless ? 1 + 0.05 * endlessRound : 1); }
    } else if (anyFighting()) {
      spawnT -= dt;
      if (spawnT <= 0) { spawnBossHoney(); spawnT = rnd(0.42, 0.62) / G / WX; }
    }

    const S = spoonSize() * (rush > 0 ? 1.25 : 1);
    const mx = spoon.x, my = spoon.y;
    const catchW = S * 1.1, catchH = S * 0.55;
    let near = false;
    const arr = items;
    const sm = smokeT > 0 ? smokeSlow : 1, qR = magR();
    for (let i = arr.length - 1; i >= 0; i--) {
      const it = arr[i];
      if (it.suck) {
        it.suck.t += dt;
        const e = ease(Math.min(1, it.suck.t / 0.5));
        it.x = it.suck.x0 + (spoon.x - it.suck.x0) * e; it.y = it.suck.y0 + (spoon.y - 8 - it.suck.y0) * e;
        if (it.suck.t >= 0.5) { arr.splice(i, 1); eat(it); if (state !== 'play' || items !== arr) break; }
        continue;
      }
      if (it.held) { it.x = it.held.x; it.y = it.held.y + 14 * G; continue; } // a worker bee is carrying it away
      const bad = it.kind === 'bad';
      it.y += it.vy * dt * HS * (bad ? sm : 1);
      if (magnetT > 0) {
        const mx2 = spoon.x - it.x, my2 = spoon.y - 10 - it.y, md = Math.hypot(mx2, my2);
        if (!bad) { if (md < qR && md > 1) { // inside the magnet's reach honey stops falling and gets reeled in, faster when things fall faster (endless)
          it.y -= it.vy * dt * HS;
          const st = Math.min(md, (1500 * Math.max(G, 0.95) + 2.5 * it.vy * HS) * dt); it.x += mx2 / md * st; it.y += my2 / md * st;
        } }
        else if (md < qR * 1.15 && !it.carried) { // fakes get pushed sideways, away from the spoon, and held up
          const f = 1 - md / (qR * 1.15);
          it.base = clamp(it.base + (it.x >= spoon.x ? 1 : -1) * 1000 * Math.max(G, 0.95) * (0.35 + f) * dt, 14, W - 14);
          it.y -= it.vy * dt * sm * Math.min(1, 2 * f);
        }
      }
      if (bad) {
        it.phase += dt * sm * (it.f.type === 'toxin' ? 5 : 3);
        it.x = it.base + Math.sin(it.phase) * it.amp;
        if (!it.carried) it.x = clamp(it.x, 14, W - 14);
        else { if (it.x < -40 || it.x > W + 40) arr.splice(i, 1); continue; } // carried off by the swarm
      }
      if (it.kind === 'jar' || it.kind === 'shilajit' || it.kind === 'box') it.rot += it.vr * dt;
      if (it.kind === 'comb') it.rot += dt;
      if (it.kind === 'drop') it.stretch = 1 + Math.min(0.6, it.vy / 400);

      const dx = Math.abs(it.x - mx), dy = it.y - my;
      if (it.kind !== 'bad' && dx < catchW + 40 && dy > -S * 1.4 && dy < 0) near = true;
      const ir = it.r * G;
      const hit = it.kind === 'bad'
        ? Math.hypot((it.x - spoon.x) * .8, it.y - spoon.y) < (S * 0.45 + ir * 0.6) * NF
        : dx < catchW * 0.5 + ir * 0.6 && dy > -catchH * 0.6 - ir && dy < catchH * 0.4;
      if (hit) {
        arr.splice(i, 1);
        if (it.kind === 'bad') { splat(it.x, it.y, it.f.color, 12); if (hurtSpoon(it.f.dmg, it.f.color, it.f.name, { toxin: it.f.type === 'toxin' })) achAdd('fakeHits', 1, true); }
        else eat(it);
        if (state !== 'play' || items !== arr) break;
        continue;
      }
      if (it.kind === 'bad' && it.f.type === 'bag' && !it.carried && it.y > H - 14) {
        arr.splice(i, 1); sticky.push({ x: it.x, w: 150 * G, life: 8, kind: 'syrup' }); splat(it.x, H - 10, '#fff3a0', 8);
        continue;
      }
      if (it.y > H + 30) {
        arr.splice(i, 1);
        if (it.kind === 'drop' || it.kind === 'jar' || it.kind === 'box') puddles.push({ x: it.x, w: it.kind === 'drop' ? 14 : 34, life: 4 });
      }
    }
    if (state !== 'play') return;
    spoon.glow += ((near || spoon.chew > 0 ? 1 : 0) - spoon.glow) * Math.min(1, dt * 10);

    updateEvents(dt); if (state !== 'play') return;
    updateBees(dt); if (state !== 'play') return;
    if (bosses.length) { updateBosses(dt); if (state !== 'play') return; }
    updateQueen(dt); if (state !== 'play') return;
    updateChat(dt);
    updateAlly(dt);
    updateProj(dt); if (state !== 'play') return;
    updateGlobs(dt); if (state !== 'play') return;
    updateGore(dt);
    updateAmbient(dt);

    for (const c of comb) c.drip = Math.max(0, c.drip - dt * 2);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]; p.vy += 600 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = floaters.length - 1; i >= 0; i--) { const f = floaters[i]; f.y -= (f.big ? 16 : 40) * dt; f.life -= dt * 0.9; if (f.life <= 0) floaters.splice(i, 1); }
    layoutFloaters(dt);
    for (let i = puddles.length - 1; i >= 0; i--) { puddles[i].life -= dt; if (puddles[i].life <= 0) puddles.splice(i, 1); }
    for (let i = sticky.length - 1; i >= 0; i--) { sticky[i].life -= dt; if (sticky[i].life <= 0) sticky.splice(i, 1); }
    updateHud();
  }

  // ---------- drawing helpers ----------
  function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }
  function circle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); }
  function starPath(x, y, r, n = 5, inner = 0.45) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * inner : r;
      ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
  }
  function txt(s, x, y, size, color, weight = 700, family = '"Instrument Sans", sans-serif', maxW) {
    ctx.fillStyle = color; ctx.font = `${weight} ${size}px ${family}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    maxW ? ctx.fillText(s, x, y, maxW) : ctx.fillText(s, x, y);
  }
  function outlined(s, x, y, size, color, family = 'Gluten, cursive') {
    ctx.font = `900 ${size}px ${family}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(29,17,8,.85)'; ctx.strokeText(s, x, y);
    ctx.fillStyle = color; ctx.fillText(s, x, y);
  }
  function limb(x1, y1, x2, y2, w, color) { ctx.lineCap = 'round'; ctx.lineWidth = w; ctx.strokeStyle = color; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  function wrap(text, maxW) {
    const words = text.split(' '), lines = []; let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }
  function fitFont(text, size, weight, family, maxW) {
    ctx.font = `${weight} ${size}px ${family}`;
    const w = ctx.measureText(text).width;
    if (w > maxW) { size = Math.max(12, size * maxW / w); ctx.font = `${weight} ${size}px ${family}`; }
    return size;
  }
  function goodGlow(x, y, r) {
    const g = ctx.createRadialGradient(x, y, 1, x, y, r * 2);
    g.addColorStop(0, 'rgba(255,214,107,.35)'); g.addColorStop(1, 'rgba(255,214,107,0)');
    ctx.fillStyle = g; circle(x, y, r * 2); ctx.fill();
  }
  function badMark(x, y, r, t, isNew) {
    const pulse = .5 + .5 * Math.sin(t * 9);
    ctx.lineWidth = 2.5; ctx.strokeStyle = `rgba(226,32,48,${.55 + pulse * .4})`;
    circle(x, y, r * 1.55 + pulse * 2); ctx.stroke();
    const bx = x + r * 1.15, by = y - r * 1.2;
    ctx.fillStyle = '#e2203a'; circle(bx, by, 7); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(bx - 3, by - 3); ctx.lineTo(bx + 3, by + 3); ctx.moveTo(bx + 3, by - 3); ctx.lineTo(bx - 3, by + 3); ctx.stroke();
    if (isNew) {
      ctx.font = '900 10px "Instrument Sans", sans-serif';
      const w = ctx.measureText('NEW · AVOID').width + 12;
      roundRect(x - w / 2, y - r * 2 - 22, w, 16, 8); ctx.fillStyle = '#e2203a'; ctx.fill();
      txt('NEW · AVOID', x, y - r * 2 - 14, 10, '#ffffff', 900);
    }
  }
  function flag(c, x, y, w, h) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    if (c === 'il') {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#0038b8'; ctx.fillRect(x, y + h * .1, w, h * .15); ctx.fillRect(x, y + h * .75, w, h * .15);
      const cx = x + w / 2, cy = y + h / 2, s = h * .2;
      ctx.strokeStyle = '#0038b8'; ctx.lineWidth = Math.max(1, h * .06);
      for (const d of [1, -1]) { ctx.beginPath(); ctx.moveTo(cx, cy - s * d); ctx.lineTo(cx + s * .87, cy + s * .5 * d); ctx.lineTo(cx - s * .87, cy + s * .5 * d); ctx.closePath(); ctx.stroke(); }
    } else if (c === 'pride') {
      ['#e40303', '#ff8c00', '#ffed00', '#008026', '#004dff', '#750787'].forEach((col, i) => { ctx.fillStyle = col; ctx.fillRect(x, y + i * h / 6, w, h / 6 + .5); });
      [['#000000', .62], ['#613915', .52], ['#74d7ee', .42], ['#ffafc8', .32], ['#ffffff', .22]].forEach(([col, d]) => {
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * d, y + h / 2); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
      });
    } else if (c === 'cn') {
      ctx.fillStyle = '#de2910'; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#ffde00'; starPath(x + w * .2, y + h * .32, h * .2); ctx.fill();
      [[.36, .12], [.42, .25], [.42, .42], [.36, .55]].forEach(([a, b]) => { starPath(x + w * a, y + h * b, h * .07); ctx.fill(); });
    } else if (c === 'tr') {
      ctx.fillStyle = '#e30a17'; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#ffffff'; circle(x + w * .38, y + h / 2, h * .26); ctx.fill();
      ctx.fillStyle = '#e30a17'; circle(x + w * .44, y + h / 2, h * .21); ctx.fill();
      ctx.fillStyle = '#ffffff'; starPath(x + w * .62, y + h / 2, h * .12); ctx.fill();
    } else if (c === 'uz') {
      ctx.fillStyle = '#0099b5'; ctx.fillRect(x, y, w, h * .34);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y + h * .34, w, h * .32);
      ctx.fillStyle = '#1eb53a'; ctx.fillRect(x, y + h * .66, w, h * .34);
      ctx.fillStyle = '#ce1126'; ctx.fillRect(x, y + h * .32, w, h * .03); ctx.fillRect(x, y + h * .65, w, h * .03);
      ctx.fillStyle = '#ffffff'; circle(x + w * .14, y + h * .17, h * .11); ctx.fill();
      ctx.fillStyle = '#0099b5'; circle(x + w * .18, y + h * .17, h * .09); ctx.fill();
    } else {
      ctx.fillStyle = '#efe6cf'; ctx.fillRect(x, y, w, h);
      txt('?', x + w / 2, y + h / 2 + 1, h * .8, '#2a1606', 900);
    }
    ctx.restore();
  }
  function bubble(x, y, w, h, tailX, tailY, fill, stroke) {
    roundRect(x, y, w, h, 12); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = stroke; ctx.stroke();
    if (tailY < y || tailY > y + h) {
      const bx = clamp(tailX, x + 16, x + w - 16), by = tailY < y ? y : y + h;
      ctx.beginPath(); ctx.moveTo(bx - 8, by); ctx.lineTo(tailX, tailY); ctx.lineTo(bx + 8, by); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill(); ctx.stroke();
      ctx.fillStyle = fill; ctx.fillRect(bx - 7, by - 1.5, 14, 3);
    } else {
      const ex = tailX < x ? x : x + w, ey = clamp(tailY, y + 14, y + h - 14);
      ctx.beginPath(); ctx.moveTo(ex, ey - 8); ctx.lineTo(tailX, tailY); ctx.lineTo(ex, ey + 8); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill(); ctx.stroke();
      ctx.fillStyle = fill; ctx.fillRect(ex - 1.5, ey - 7, 3, 14);
    }
  }
  function speechBox(text, ax, ay, side, o = {}) {
    const fs = o.small ? Math.round(clamp(15 * G, 12, 15)) : Math.round(clamp(19 * G, 14, 19)), lh = fs + 5, discord = !!o.discord;
    ctx.font = `600 ${fs}px "Instrument Sans", sans-serif`;
    const lines = wrap(text, o.maxW - 26);
    let tw = Math.max(...lines.map(l => ctx.measureText(l).width));
    if (discord) { ctx.font = `700 ${fs}px "Instrument Sans", sans-serif`; tw = Math.max(tw, ctx.measureText('Colonex').width); }
    const head = discord ? lh + 1 : 0;
    const bw = Math.min(o.maxW, tw + 26), bh = lines.length * lh + 16 + head;
    let bx, by;
    if (side === 'below') { bx = ax - bw / 2; by = ay + 14; }
    else if (side === 'right') { bx = ax + 16; by = ay - bh / 2; }
    else { bx = ax - 16 - bw; by = ay - bh / 2; }
    bx = clamp(bx, o.lo ?? 8, (o.hi ?? W - 8) - bw); by = clamp(by, o.minY || 6, H - bh - 6);
    const av = o.avoid;
    if (av && bx < av.x + av.w && bx + bw > av.x && by < av.y + av.h && by + bh > av.y) by = av.y + av.h + 8 + bh < H - 6 ? av.y + av.h + 8 : Math.max(o.minY || 6, av.y - bh - 8);
    bubble(bx, by, bw, bh, ax, ay, discord ? '#313338' : '#fbf8f0', discord ? '#1e1f22' : '#2a1606');
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    let y = by + 8;
    if (discord) { ctx.font = `700 ${fs}px "Instrument Sans", sans-serif`; ctx.fillStyle = '#b48cff'; ctx.fillText('Colonex', bx + 13, y); y += head; }
    ctx.font = `600 ${fs}px "Instrument Sans", sans-serif`; ctx.fillStyle = discord ? '#dbdee1' : '#2a1606';
    lines.forEach((l, i) => ctx.fillText(l, bx + 13, y + i * lh));
    return { x: bx, y: by, w: bw, h: bh };
  }

  // ---------- background, seasons, comb ----------
  function drawBg(t) {
    const s = SEASONS[seasonIdx()];
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, s.top); g.addColorStop(0.55, s.mid); g.addColorStop(1, '#170d06');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const rg = ctx.createRadialGradient(W / 2, H * 0.2, 10, W / 2, H * 0.2, Math.max(W, H) * 0.8);
    rg.addColorStop(0, phase === 'boss' ? 'rgba(200,16,46,.10)' : rush > 0 ? 'rgba(255,190,60,.28)' : s.glow); rg.addColorStop(1, 'rgba(242,165,22,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(246,227,180,.04)'; ctx.lineWidth = 1;
    const r = 34, w = Math.sqrt(3) * r;
    for (let row = 0, y = combBottom() + 20; y < H + r; row++, y += r * 1.5)
      for (let x = (row % 2 ? w / 2 : 0); x < W + w; x += w) { hexPath(x, y, r); ctx.stroke(); }
    const z = swarmZone();
    if (z) {
      const a = .06 + .03 * Math.sin(t * 4);
      ctx.fillStyle = `rgba(255,214,107,${a})`; ctx.fillRect(z.x0, combBottom(), z.x1 - z.x0, H - combBottom());
      outlined('SAFE', (z.x0 + z.x1) / 2, combBottom() + 30, 22, '#ffd36b');
    }
    for (const a of ambient) drawAmbient(a);
    for (const p of puddles) {
      ctx.fillStyle = `rgba(242,165,22,${Math.min(0.5, p.life / 4 * 0.5)})`;
      ctx.beginPath(); ctx.ellipse(p.x, H - 4, p.w, 5, 0, 0, TAU); ctx.fill();
    }
    for (const s2 of sticky) {
      const resin = s2.kind === 'resin';
      ctx.globalAlpha = Math.min(1, s2.life);
      ctx.fillStyle = resin ? 'rgba(20,14,10,.92)' : 'rgba(255,236,120,.65)'; ctx.beginPath(); ctx.ellipse(s2.x, H - 6, s2.w / 2, 11, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = resin ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(s2.x - s2.w * .18, H - 10, s2.w * .12, 2.5, 0, 0, TAU); ctx.fill();
      txt(resin ? 'STICKY RESIN' : 'STICKY SYRUP', s2.x, H - 24, 9, resin ? 'rgba(255,200,180,.9)' : 'rgba(255,240,160,.9)', 700);
      ctx.globalAlpha = 1;
    }
  }
  function drawAmbient(a) {
    ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.rot);
    ctx.globalAlpha = a.part === 'heat' ? .35 : .75;
    ctx.fillStyle = a.c; ctx.strokeStyle = a.c;
    if (a.part === 'petal') { ctx.beginPath(); ctx.ellipse(0, 0, 4, 2.3, 0, 0, TAU); ctx.fill(); }
    else if (a.part === 'catkin') { ctx.beginPath(); ctx.ellipse(0, 0, 5.5, 2.3, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.55)'; for (let i = -1; i <= 1; i++) { circle(i * 2.6, -0.5, 0.9); ctx.fill(); } }
    else if (a.part === 'pollen') { ctx.shadowColor = a.c; ctx.shadowBlur = 6; circle(0, 0, 1.8); ctx.fill(); }
    else if (a.part === 'heat') { circle(0, 0, 2.5); ctx.fill(); }
    else if (a.part === 'fluff') { ctx.lineWidth = .8; for (let i = 0; i < 6; i++) { const ang = i * TAU / 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang) * 4, Math.sin(ang) * 4); ctx.stroke(); } }
    else if (a.part === 'snow') { circle(0, 0, 2.2); ctx.fill(); }
    else if (a.part === 'needle') { ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(4, 0); ctx.stroke(); }
    else {
      ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(0, -5, 6, 0); ctx.quadraticCurveTo(0, 5, -6, 0); ctx.fill();
      ctx.strokeStyle = 'rgba(60,20,5,.5)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.stroke();
    }
    ctx.restore();
  }
  function drawComb(t) {
    for (const c of comb) {
      hexPath(c.x, c.y, c.r - 1.5);
      ctx.fillStyle = '#c98a2a'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = '#7a4a14'; ctx.stroke();
      if (c.fill > 0) {
        hexPath(c.x, c.y, (c.r - 5) * c.fill);
        const g = ctx.createRadialGradient(c.x - c.r * .3, c.y - c.r * .3, 1, c.x, c.y, c.r);
        g.addColorStop(0, '#ffe08a'); g.addColorStop(1, '#e08e0b');
        ctx.fillStyle = g; ctx.fill();
      }
    }
    ctx.fillStyle = '#f2a516';
    for (const c of comb) {
      if (c.y <= hexR()) continue;
      const len = 6 + Math.sin(t * 1.5 + c.x) * 4 + c.drip * 14;
      ctx.beginPath();
      ctx.moveTo(c.x - 6, c.y + c.r * 0.8);
      ctx.quadraticCurveTo(c.x - 5, c.y + c.r * 0.8 + len, c.x, c.y + c.r * 0.8 + len + 4);
      ctx.quadraticCurveTo(c.x + 5, c.y + c.r * 0.8 + len, c.x + 6, c.y + c.r * 0.8);
      ctx.fill();
    }
  }
  function drawFlow(t) {
    if (!ev || ev.k !== 'flow') return;
    const top = combBottom() - 6;
    // the overflowing cell
    ctx.save(); ctx.shadowColor = 'rgba(255,214,100,.95)'; ctx.shadowBlur = 26;
    hexPath(ev.x, top - 2, 17); ctx.fillStyle = '#ffd36b'; ctx.fill(); ctx.restore();
    hexPath(ev.x, top - 2, 10); ctx.fillStyle = '#fff4c2'; ctx.fill();
    const bob = Math.sin(t * 8) * 4;
    if (ev.t < ev.tele) {
      const len = 20 + ev.t / ev.tele * 30;
      ctx.fillStyle = '#ffd36b'; roundRect(ev.x - 4, top, 8, len, 4); ctx.fill();
      outlined('CATCH IT', ev.x, top + 70 + bob, 18, '#ffd36b');
      drawArrow(ev.x, top + 92 + bob);
      return;
    }
    const end = ev.caught ? spoon.y - 8 : H;
    const grow = clamp((ev.t - ev.tele) / 0.3, 0, 1), fade = clamp((ev.dur - ev.t) / 0.4, 0, 1);
    const w = 2 + 13 * Math.min(grow, fade);
    const pts = [];
    for (let y = top; y <= end; y += 8) pts.push([ev.x + Math.sin(y * 0.03 + t * 5) * 2.5, y]);
    pts.push([ev.x, end]);
    ctx.save();
    ctx.shadowColor = 'rgba(255,205,90,.95)'; ctx.shadowBlur = 24;
    const g = ctx.createLinearGradient(ev.x - w, 0, ev.x + w, 0);
    g.addColorStop(0, '#e89a12'); g.addColorStop(.3, '#ffd36b'); g.addColorStop(.5, '#fff4c2'); g.addColorStop(.7, '#ffd36b'); g.addColorStop(1, '#e89a12');
    ctx.fillStyle = g;
    ctx.beginPath();
    pts.forEach(([x, y], i) => i ? ctx.lineTo(x - w, y) : ctx.moveTo(x - w, y));
    for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i][0] + w, pts[i][1]);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    const span = Math.max(1, end - top);
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    for (let k = 0; k < 6; k++) { const y = top + ((t * 240 + k * 70) % span); ctx.beginPath(); ctx.ellipse(ev.x - w * .35, y, w * .16 + .5, 9, 0, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#fff3c4';
    for (let k = 0; k < 10; k++) {
      const y = top + ((t * 110 + k * 53) % span), x = ev.x + Math.sin(k * 2.3 + t * 3) * (w + 12);
      ctx.globalAlpha = .4 + .6 * Math.abs(Math.sin(t * 6 + k)); starPath(x, y, 3.4, 4, .35); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffd36b'; circle(ev.x, end, w * 1.2); ctx.fill();
    if (!ev.caught) { outlined('CATCH IT', ev.x, top + 70 + bob, 18, '#ffd36b'); drawArrow(ev.x, top + 92 + bob); }
    if (ev.got > 0) outlined('+' + fmtAdd(ev.got), spoon.x, spoon.y - 78, 24, '#ffd36b');
  }
  function drawArrow(x, y) {
    ctx.fillStyle = '#ffd36b'; ctx.strokeStyle = 'rgba(29,17,8,.85)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.lineTo(x + 10, y); ctx.lineTo(x, y + 13); ctx.closePath(); ctx.stroke(); ctx.fill();
  }
  function drawBee(x, y, t, ph, dir) {
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
    const flap = .5 + .5 * Math.sin(t * 40 + ph);
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.beginPath(); ctx.ellipse(-1, -5, 4, 2.5 + flap * 2, -.4, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(3, -5, 4, 2.5 + flap * 2, .4, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, 7, 4.5, 0, 0, TAU); ctx.fillStyle = '#f2b81a'; ctx.fill();
    ctx.save(); ctx.clip(); ctx.fillStyle = '#1a1206'; ctx.fillRect(-3, -5, 2.2, 10); ctx.fillRect(1.5, -5, 2.2, 10); ctx.restore();
    ctx.fillStyle = '#1a1206'; ctx.beginPath(); ctx.moveTo(-7, -1); ctx.lineTo(-10, 0); ctx.lineTo(-7, 1); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function drawSwarm(t) {
    if (!ev || ev.k !== 'swarm') return;
    const dir = ev.side === 'L' ? 1 : -1, spreadX = (ev.x1 - ev.x0) * 0.42, spreadY = H * 0.25;
    for (const b of ev.bees) drawBee(ev.cx + b.ox * spreadX + Math.sin(t * 9 + b.ph) * 6, ev.cy + b.oy * spreadY + Math.cos(t * 7 + b.ph) * 5, t, b.ph, dir);
    for (const it of items) if (it.carried) { drawBee(it.x - 8, it.y - it.r - 6, t, 1, dir); drawBee(it.x + 8, it.y - it.r - 4, t, 2, dir); }
  }

  // ---------- items ----------
  function dropShape(r, tip = 1.6) {
    ctx.beginPath(); ctx.moveTo(0, -r * tip);
    ctx.bezierCurveTo(r * .9, -r * .4, r, r * .2, r, r * .3);
    ctx.arc(0, r * .3, r, 0, Math.PI);
    ctx.bezierCurveTo(-r, r * .2, -r * .9, -r * .4, 0, -r * tip);
  }
  function drawDrop(it) {
    ctx.save(); ctx.translate(it.x, it.y); ctx.scale(1 / Math.sqrt(it.stretch), it.stretch);
    const r = it.r;
    dropShape(r);
    const g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, '#e08f34'); g.addColorStop(1, '#6e2f08');
    ctx.fillStyle = g; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-r * .35, 0, r * .18, r * .35, -.3, 0, TAU); ctx.fill();
    ctx.restore();
  }
  function jarBody(s, honeyA, honeyB, lidA, lidB) {
    roundRect(-s * .95, -s * 1.1, s * 1.9, s * 2.5, s * .4);
    const hg = ctx.createLinearGradient(-s, 0, s, 0);
    hg.addColorStop(0, honeyB); hg.addColorStop(.45, honeyA); hg.addColorStop(1, honeyB);
    ctx.fillStyle = hg; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,230,190,.35)'; ctx.stroke();
    roundRect(-s * .85, -s * 1.55, s * 1.7, s * .55, 4); ctx.fillStyle = lidA; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = lidB;
    const q = s * .17;
    for (let gx = -s; gx < s; gx += q) for (let gy = -s * 1.55, k = 0; gy < -s; gy += q, k++) if ((Math.round((gx + s) / q) + k) % 2) ctx.fillRect(gx, gy, q, q);
    ctx.restore();
  }
  function drawJar(it) {
    // the 1.2 kg Ryczkowski jar: gold chequered lid, dark honeydew, white label with a gold hexagon
    const s = it.r;
    ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot);
    jarBody(s, '#a8461a', '#4a1c05', '#e2b23a', '#b8861c');
    roundRect(-s * .95, -s * .45, s * 1.9, s * 1.15, 3); ctx.fillStyle = '#fbf8f0'; ctx.fill();
    hexPath(-s * .2, s * .12, s * .42); ctx.fillStyle = '#efb73e'; ctx.fill();
    txt('MIÓD', -s * .2, s * .1, Math.round(s * .36), '#7a3c0c');
    ctx.fillStyle = '#d6452b'; circle(s * .5, s * .3, s * .14); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.28)'; roundRect(-s * .8, -s * .95, s * .22, s * .45, 3); ctx.fill();
    ctx.restore();
  }
  function drawBox(it, t) {
    const s = it.r;
    ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot);
    ctx.shadowColor = 'rgba(255,211,107,.7)'; ctx.shadowBlur = 12 + Math.sin(t * 5) * 4;
    ctx.fillStyle = '#b8874a';
    ctx.beginPath(); ctx.moveTo(-s * 1.1, -s * .55); ctx.lineTo(-s * 1.45, -s * 1.05); ctx.lineTo(-s * .5, -s * 1.05); ctx.lineTo(-s * .2, -s * .55); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(s * 1.1, -s * .55); ctx.lineTo(s * 1.45, -s * 1.05); ctx.lineTo(s * .5, -s * 1.05); ctx.lineTo(s * .2, -s * .55); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    for (const x of [-.65, 0, .65]) { ctx.fillStyle = '#e2b23a'; roundRect(s * x - s * .28, -s * .78, s * .56, s * .26, 3); ctx.fill(); }
    roundRect(-s * 1.1, -s * .55, s * 2.2, s * 1.5, 3); ctx.fillStyle = '#c89a5b'; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = '#8a6430'; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(-s * 1.1, -s * .55, s * 2.2, s * .2);
    txt('RYCZKOWSKI', 0, s * .05, s * .3, '#4a2e10', 900, '"Instrument Sans", sans-serif', s * 2);
    txt('HONEY 10 kg', 0, s * .45, s * .3, '#4a2e10', 700, '"Instrument Sans", sans-serif', s * 2);
    ctx.restore();
  }
  function drawShilajit(it, t) {
    const s = it.r;
    ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot);
    ctx.shadowColor = 'rgba(255,211,107,.9)'; ctx.shadowBlur = 16 + Math.sin(t * 6) * 6;
    jarBody(s, '#3a1a08', '#120602', '#1a1a1a', '#c9a23a');
    ctx.shadowBlur = 0;
    roundRect(-s * .95, -s * .4, s * 1.9, s * .9, 3); ctx.fillStyle = '#111'; ctx.fill();
    txt('SHILAJIT', 0, -s * .12, s * .34, '#ffd36b', 900, '"Instrument Sans", sans-serif', s * 1.7);
    txt('OF HONEY', 0, s * .25, s * .26, '#f6e3b4', 700, '"Instrument Sans", sans-serif', s * 1.7);
    ctx.restore();
    ctx.fillStyle = '#ffd36b';
    for (let i = 0; i < 4; i++) {
      const a = t * 2 + i * 1.6;
      ctx.globalAlpha = .5 + .5 * Math.sin(a * 3);
      starPath(it.x + Math.cos(a) * s * 1.7, it.y + Math.sin(a) * s * 1.5, 3.5, 4, .35); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function drawCombChunk(it) {
    ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot * .3);
    const r = it.r * .55, w = Math.sqrt(3) * r;
    const cells = [[0, 0], [w, 0], [-w, 0], [w / 2, -r * 1.5], [-w / 2, -r * 1.5], [w / 2, r * 1.5], [-w / 2, r * 1.5]];
    ctx.shadowColor = 'rgba(255,200,80,.8)'; ctx.shadowBlur = 14;
    for (const [x, y] of cells) { hexPath(x, y, r); ctx.fillStyle = '#f2a516'; ctx.fill(); }
    ctx.shadowBlur = 0;
    for (const [x, y] of cells) { hexPath(x, y, r); ctx.lineWidth = 2; ctx.strokeStyle = '#8a5212'; ctx.stroke(); hexPath(x, y, r * .5); ctx.fillStyle = '#ffd36b'; ctx.fill(); }
    ctx.restore();
  }
  function drawLab(it, t) {
    ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(Math.sin(t * 3) * .25);
    ctx.shadowColor = '#7cf3ff'; ctx.shadowBlur = 18;
    roundRect(-6, -16, 12, 32, 6); ctx.fillStyle = 'rgba(233,249,255,.85)'; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.save(); ctx.clip(); ctx.fillStyle = '#7cf3ff'; ctx.fillRect(-6, Math.sin(t * 5) * 1.5, 12, 18); ctx.restore();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.stroke();
    roundRect(-7.5, -20, 15, 6, 2); ctx.fillStyle = '#c8102e'; ctx.fill();
    txt('LAB', 0, 26, 9, '#9be7ff', 900);
    ctx.restore();
  }
  function drawBottle(r, label, color) {
    ctx.shadowColor = color; ctx.shadowBlur = 10;
    roundRect(-r * .75, -r * .7, r * 1.5, r * 1.9, r * .35); ctx.fillStyle = color; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.stroke();
    ctx.fillStyle = '#e8e8ec'; ctx.beginPath(); ctx.moveTo(-r * .45, -r * .7); ctx.lineTo(r * .45, -r * .7); ctx.lineTo(r * .12, -r * 1.3); ctx.lineTo(-r * .12, -r * 1.3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e2492f'; ctx.fillRect(-r * .1, -r * 1.55, r * .2, r * .28);
    ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.fillRect(-r * .75, -r * .15, r * 1.5, r * .7);
    txt(label, 0, r * .2, Math.max(6, Math.round(r * .3)), '#2a1606', 700, '"Instrument Sans", sans-serif', r * 1.4);
    ctx.strokeStyle = '#e2492f'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-r * .95, -r * .95); ctx.lineTo(r * .95, r * 1.3); ctx.moveTo(r * .95, -r * .95); ctx.lineTo(-r * .95, r * 1.3); ctx.stroke();
  }
  function drawToxin(r, f, t, seed) {
    const pulse = .6 + Math.sin(t * 8 + seed) * .4;
    ctx.shadowColor = f.color; ctx.shadowBlur = 16 + pulse * 12;
    dropShape(r, 1.7); ctx.fillStyle = f.color; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(20,20,10,.6)'; ctx.stroke();
    txt(f.symbol, 0, r * .3, Math.round(r * .9), '#1a1a10', 900);
  }
  function drawSusJar(s) {
    roundRect(-s * .9, -s * .9, s * 1.8, s * 2, s * .35);
    const g = ctx.createLinearGradient(-s, 0, s, 0); g.addColorStop(0, '#f0b52a'); g.addColorStop(.5, '#ffe27a'); g.addColorStop(1, '#e9a91f');
    ctx.fillStyle = g; ctx.fill();
    roundRect(-s * .8, -s * 1.25, s * 1.6, s * .4, 3); ctx.fillStyle = '#ececec'; ctx.fill();
    roundRect(-s * .9, -s * .3, s * 1.8, s * .7, 2); ctx.fillStyle = '#ffffff'; ctx.fill();
    txt('£5/kg', 0, s * .05, s * .38, '#2a1606', 700, '"Instrument Sans", sans-serif', s * 1.6);
    ctx.save(); ctx.rotate(-.35);
    ctx.strokeStyle = '#c8102e'; ctx.lineWidth = 2.5; roundRect(-s * 1.05, -s * .38, s * 2.1, s * .76, 4); ctx.stroke();
    txt('SUS', 0, s * .04, s * .62, '#c8102e', 900, 'Gluten, cursive');
    ctx.restore();
  }
  function drawBag(r) {
    ctx.beginPath();
    ctx.moveTo(-r * .2, -r * .9);
    ctx.quadraticCurveTo(-r * 1.1, -r * .3, -r * .8, r * .7);
    ctx.quadraticCurveTo(0, r * 1.1, r * .8, r * .7);
    ctx.quadraticCurveTo(r * 1.1, -r * .3, r * .2, -r * .9);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,243,160,.85)'; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.stroke();
    ctx.fillStyle = '#e2492f'; ctx.fillRect(-r * .25, -r * 1.05, r * .5, r * .22);
    txt('FEEDER', 0, r * .15, r * .34, '#7a5a00', 900, '"Instrument Sans", sans-serif', r * 1.5);
    txt('SYRUP', 0, r * .5, r * .3, '#7a5a00', 700, '"Instrument Sans", sans-serif', r * 1.5);
  }
  function drawFlagJar(s, flags) {
    roundRect(-s * .9, -s * .95, s * 1.8, s * 2.15, s * .38);
    const g = ctx.createLinearGradient(-s, 0, s, 0); g.addColorStop(0, '#b0560f'); g.addColorStop(.5, '#f2a516'); g.addColorStop(1, '#a24c0c');
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.stroke();
    roundRect(-s * .8, -s * 1.3, s * 1.6, s * .42, 3); ctx.fillStyle = '#d9d2c2'; ctx.fill();
    const lw = s * 1.8, lh = s * .95, lx = -s * .9, ly = -s * .45;
    if (flags.length === 2) { flag(flags[0], lx, ly, lw / 2, lh); flag(flags[1], lx + lw / 2, ly, lw / 2, lh); }
    else flag(flags[0], lx, ly, lw, lh);
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.strokeRect(lx, ly, lw, lh);
  }
  function card(w, h, fill, rot) {
    ctx.rotate(rot);
    ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 8;
    roundRect(-w / 2, -h / 2, w, h, 7); ctx.fillStyle = fill; ctx.fill();
    ctx.shadowBlur = 0;
  }
  function drawNotify(p) {
    const w = 108, h = 32;
    card(w, h, '#fbfbfd', Math.sin(p.t * 2 + p.ph) * .12);
    hexPath(-w / 2 + 13, 0, 8); ctx.fillStyle = '#f2a516'; ctx.fill();
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#8a8a96'; ctx.font = '700 7px "Instrument Sans", sans-serif'; ctx.fillText('HONEY APP · now', -w / 2 + 25, -7);
    ctx.fillStyle = '#16161c'; ctx.font = '700 8.5px "Instrument Sans", sans-serif'; ctx.fillText(p.text, -w / 2 + 25, 6, w - 30);
  }
  function drawFee(p) {
    const w = 74, h = 34;
    card(w, h, '#fbf8f0', Math.sin(p.t * 2 + p.ph) * .14);
    ctx.fillStyle = '#d8cfb6'; ctx.fillRect(-w / 2, -h / 2, w, 9);
    txt('LOKSD CORP · INVOICE', 0, -h / 2 + 4.5, 5.5, '#4a3a20', 900, '"Instrument Sans", sans-serif', w - 6);
    txt(p.text.toUpperCase(), 0, 5, 7.5, '#c8102e', 900, '"Instrument Sans", sans-serif', w - 8);
  }
  function drawCall(p, t) {
    const w = 124, h = 38;
    const pulse = .5 + .5 * Math.sin(t * 8);
    ctx.strokeStyle = `rgba(88,101,242,${.3 + pulse * .5})`; ctx.lineWidth = 3; roundRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 11); ctx.stroke();
    card(w, h, '#2b2d31', 0);
    ctx.fillStyle = '#5865f2'; circle(-w / 2 + 17, 0, 11); ctx.fill();
    txt(p.init, -w / 2 + 17, 1, 9, '#ffffff', 900);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff'; ctx.font = '700 9px "Instrument Sans", sans-serif'; ctx.fillText(p.handle, -w / 2 + 33, -6, w - 62);
    ctx.fillStyle = '#b5bac1'; ctx.font = '600 8px "Instrument Sans", sans-serif'; ctx.fillText('incoming call · vc?', -w / 2 + 33, 7, w - 62);
    ctx.fillStyle = '#23a55a'; circle(w / 2 - 13, 0, 8); ctx.fill();
  }
  function drawJob(p) {
    const w = 56, h = 36;
    card(w, h, '#f6efda', Math.sin(p.t * 2 + p.ph) * .14);
    ctx.strokeStyle = '#cdbf98'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(0, 2); ctx.lineTo(w / 2, -h / 2); ctx.stroke();
    ctx.fillStyle = '#c8102e'; circle(0, 2, 6); ctx.fill();
    txt('J*B OFFER', 0, 11, 7, '#2a1606', 900);
    txt('LOKSD CORP', 0, -h / 2 + 7, 5.5, '#6b5a40', 900);
  }
  function drawGif(p) {
    const w = 64, h = 44;
    card(w, h, '#121214', Math.sin(p.t * 2 + p.ph) * .12);
    roundRect(-w / 2 + 4, -h / 2 + 4, 20, 11, 2); ctx.fillStyle = '#ffffff'; ctx.fill();
    txt('GIF', -w / 2 + 14, -h / 2 + 10, 7.5, '#121214', 900);
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.moveTo(-5, -6); ctx.lineTo(7, 1); ctx.lineTo(-5, 8); ctx.closePath(); ctx.fill();
    txt('gorilla.gif', 0, h / 2 - 7, 7.5, '#dbdee1', 700);
  }
  function drawEq(p) {
    ctx.fillStyle = 'rgba(20,24,34,.92)'; roundRect(-30, -12, 60, 24, 5); ctx.fill();
    ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(207,232,255,.6)'; ctx.stroke();
    txt(p.text, 0, 1, 9.5, '#e8f2ff', 700, '"Instrument Sans", sans-serif', 54);
  }
  function drawCrow(t, s = 1, label = true) {
    // a crow in silhouette with no eye, after the "AN IQ TOO HIGH?" meme
    ctx.save(); ctx.scale(s, s);
    const flap = Math.sin(t * 14) * .5;
    ctx.fillStyle = '#16181f';
    ctx.beginPath(); ctx.ellipse(0, 0, 14, 8, -.15, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(12, -6, 7, 6, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#3a3f4a'; ctx.beginPath(); ctx.moveTo(17, -7); ctx.lineTo(27, -4); ctx.lineTo(17, -3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#16181f'; ctx.beginPath(); ctx.moveTo(-12, -2); ctx.lineTo(-24, -6); ctx.lineTo(-22, 4); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.translate(-2, -4); ctx.rotate(-.6 + flap);
    ctx.beginPath(); ctx.ellipse(-6, -4, 12, 5, 0, 0, TAU); ctx.fillStyle = '#20232c'; ctx.fill(); ctx.restore();
    ctx.restore();
    if (label) {
      const lb = clamp(0.95 / bossK(), 1, 1.4), fz = 8 * lb; // keep the meme readable when the boss is drawn small
      ctx.font = `900 ${fz}px "Instrument Sans", sans-serif`;
      const bw = Math.max(ctx.measureText('AN IQ').width, ctx.measureText('TOO HIGH?').width) + 10 * lb, bh = 22 * lb, top = -30 * s - bh;
      roundRect(-bw / 2, top, bw, bh, 4); ctx.fillStyle = 'rgba(10,10,14,.85)'; ctx.fill();
      txt('AN IQ', 0, top + 7 * lb, fz, '#ffffff', 900); txt('TOO HIGH?', 0, top + 16 * lb, fz, '#f9c623', 900);
    }
  }
  function drawGear(r) {
    ctx.beginPath();
    for (let i = 0; i < 16; i++) { const a = i * TAU / 16, rr = i % 2 ? r : r * .74; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fillStyle = '#9aa0a8'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#5a5f66'; ctx.stroke();
    ctx.fillStyle = '#3a3d44'; circle(0, 0, r * .3); ctx.fill();
  }
  function drawBlock(r) {
    roundRect(-r, -r, r * 2, r * 2, 3); ctx.fillStyle = '#e2231a'; ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-r, r * .45, r * 2, r * .55);
    ctx.fillStyle = 'rgba(255,255,255,.25)'; roundRect(-r * .5, -r * 1.25, r * .4, r * .3, 1); ctx.fill(); roundRect(r * .1, -r * 1.25, r * .4, r * .3, 1); ctx.fill();
    txt('STUPID', 0, -r * .2, r * .38, '#ffffff', 900); txt('GAME', 0, r * .25, r * .38, '#ffffff', 900);
  }
  function drawCell(p) {
    const w = 40, h = 20;
    ctx.fillStyle = '#ffffff'; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.lineWidth = 1.2; ctx.strokeStyle = '#34a853'; ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = '#e6f4ea'; ctx.fillRect(-w / 2, -h / 2, 6, h);
    txt(p.text, 3, 1, 8, p.text[0] === '#' ? '#ea4335' : '#202124', 700, '"Instrument Sans", sans-serif', w - 10);
  }
  function drawChess(p) {
    const fill = p.dark ? '#1a1a1a' : '#f4f1ea', line = p.dark ? '#f4f1ea' : '#1a1a1a';
    ctx.fillStyle = fill; ctx.strokeStyle = line; ctx.lineWidth = 1.6;
    roundRect(-10, 9, 20, 6, 2); ctx.fill(); ctx.stroke();
    if (p.k === 'pawn') {
      ctx.beginPath(); ctx.moveTo(-6, 9); ctx.lineTo(-3, -2); ctx.lineTo(3, -2); ctx.lineTo(6, 9); ctx.closePath(); ctx.fill(); ctx.stroke();
      circle(0, -7, 6); ctx.fill(); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(-7, 9); ctx.quadraticCurveTo(-9, -6, 0, -14); ctx.quadraticCurveTo(9, -6, 7, 9); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-1, -8); ctx.lineTo(4, -3); ctx.stroke();
      circle(0, -17, 2.5); ctx.fill(); ctx.stroke();
    }
  }
  function drawDeen() {
    roundRect(-16, -16, 32, 32, 8); ctx.fillStyle = '#1f9d8f'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#ffffff'; ctx.stroke();
    txt('DB', 0, 1, 13, '#ffffff', 900);
    txt('DeenBuddy', 0, 25, 8, '#c7f2ec', 700);
  }
  function drawStampTele(p, t) {
    const pulse = .5 + .5 * Math.sin(t * 16);
    ctx.setLineDash([6, 6]); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(200,16,46,${.5 + pulse * .4})`;
    circle(p.x, spoon.y, 36 * G); ctx.stroke(); ctx.setLineDash([]);
    outlined("YOU'RE FIRED!", p.x, spoon.y - 58, 16, '#ff5a6e');
  }
  function drawStamp() {
    roundRect(-8, -40, 16, 18, 4); ctx.fillStyle = '#4a2e10'; ctx.fill();
    circle(0, -42, 9); ctx.fill();
    roundRect(-34, -22, 68, 32, 5); ctx.fillStyle = '#c8102e'; ctx.fill();
    txt('FIRED', 0, -5, 17, '#ffffff', 900, 'Gluten, cursive');
  }
  function drawTag(p) {
    ctx.font = `900 ${p.big ? 10 : 11}px "Instrument Sans", sans-serif`;
    const w = ctx.measureText(p.text).width + 22, h = p.big ? 26 : 20;
    ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2 - 9, -h / 2); ctx.lineTo(w / 2, 0); ctx.lineTo(w / 2 - 9, h / 2); ctx.lineTo(-w / 2, h / 2); ctx.closePath();
    ctx.fillStyle = '#ffe9a8'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#8a5a10'; ctx.stroke();
    ctx.fillStyle = '#2a1606'; circle(w / 2 - 9, 0, 2.5); ctx.fill();
    txt(p.text, -5, 1, p.big ? 10 : 11, '#c8102e', 900);
  }
  function drawPlate(r) {
    circle(0, 0, r); ctx.fillStyle = '#26262a'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = '#3d3d44'; circle(0, 0, r * .72); ctx.stroke();
    ctx.fillStyle = '#0b0b0c'; circle(0, 0, r * .22); ctx.fill();
    txt('20', 0, -r * .5, r * .36, '#d9d9de', 900);
  }
  function drawResinBlob(r) {
    ctx.fillStyle = '#16100c';
    circle(0, 0, r); ctx.fill(); circle(r * .6, -r * .3, r * .65); ctx.fill(); circle(-r * .5, r * .35, r * .6); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.55)'; circle(-r * .3, -r * .35, r * .22); ctx.fill();
    ctx.fillStyle = 'rgba(200,40,40,.5)'; circle(r * .4, r * .2, r * .12); ctx.fill();
  }
  function drawDrink(k, r) {
    if (k === 'creatine') {
      ctx.fillStyle = '#d9d9de'; roundRect(r * .3, -r * .15, r * 1.1, r * .3, 3); ctx.fill();
      ctx.beginPath(); ctx.arc(-r * .2, 0, r * .7, 0, Math.PI); ctx.closePath(); ctx.fillStyle = '#e8e8ee'; ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(-r * .2, 0, r * .7, r * .35, 0, Math.PI, TAU); ctx.fill();
      txt('20g', -r * .2, r * .35, r * .4, '#2a1606', 900);
      return;
    }
    const watermelon = k === 'watermelon';
    roundRect(-r * .55, -r * .7, r * 1.1, r * 1.8, r * .3); ctx.fillStyle = watermelon ? '#ff4d6d' : 'rgba(255,190,60,.9)'; ctx.fill();
    ctx.fillStyle = watermelon ? '#2f8f3a' : '#c8102e'; roundRect(-r * .3, -r * 1.05, r * .6, r * .38, 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillRect(-r * .55, -r * .1, r * 1.1, r * .5);
    txt(watermelon ? 'MELON' : 'SAFFRON', 0, r * .15, r * .3, '#2a1606', 900, '"Instrument Sans", sans-serif', r);
  }
  function drawBar(p, t) {
    if (p.cur <= 0) {
      const pulse = .5 + .5 * Math.sin(t * 16);
      ctx.setLineDash([6, 6]); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(234,67,53,${.4 + pulse * .4})`;
      ctx.strokeRect(p.x - p.w / 2, H - p.H0, p.w, p.H0); ctx.setLineDash([]);
      ctx.fillStyle = `rgba(234,67,53,${.12 + pulse * .1})`; ctx.fillRect(p.x - p.w / 2, H - 10, p.w, 10);
      txt(p.label, p.x, H - p.H0 - 10, 11, '#ffb3aa', 700);
      return;
    }
    ctx.fillStyle = p.color; ctx.fillRect(p.x - p.w / 2, H - p.cur, p.w, p.cur);
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(p.x - p.w / 2, H - p.cur, p.w * .25, p.cur);
    txt(p.label, p.x, H - p.cur + 12, 10, '#ffffff', 900, '"Instrument Sans", sans-serif', p.w - 6);
  }
  function gunGeo(p) { // where the ray gun hangs: it drops down out of the comb, and goes back up after firing
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
    if (p.t < p.tele) {
      const pulse = .5 + .5 * Math.sin(t * 18);
      ctx.setLineDash([8, 8]); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(155,231,255,${.4 + pulse * .5})`;
      ctx.beginPath(); ctx.moveTo(p.x, top); ctx.lineTo(p.x, H); ctx.stroke(); ctx.setLineDash([]);
      txt(p.label || 'CNC', p.x, p.half ? H * 0.6 : top + 14, p.half ? 13 : 11, '#9be7ff', 900);
      if (p.half) { ctx.strokeStyle = `rgba(124,196,255,${.25 + pulse * .3})`; ctx.strokeRect(p.x - p.half * G, top, p.half * 2 * G, H - top); }
      return;
    }
    const a = 1 - clamp((p.t - p.tele - p.on) / 0.2, 0, 1), hw = (p.half ? p.half - 2 : 12) * G;
    ctx.globalAlpha = a;
    ctx.fillStyle = p.half ? 'rgba(124,196,255,.45)' : 'rgba(155,231,255,.35)'; ctx.fillRect(p.x - hw, top, hw * 2, H - top);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(p.x - (p.half ? 7 : 3) * G, top, (p.half ? 14 : 6) * G, H - top);
    if (p.label && p.half) { ctx.save(); ctx.translate(p.x, (top + H) / 2); ctx.rotate(-Math.PI / 2); outlined(p.label, 0, 0, 20, '#1f4fd1'); ctx.restore(); }
    ctx.globalAlpha = 1;
  }
  function drawRope(p, t) {
    const top = combBottom();
    if (p.t < p.tele) {
      const pulse = .5 + .5 * Math.sin(t * 14);
      ctx.fillStyle = `rgba(20,14,10,${.25 + pulse * .2})`; ctx.fillRect(p.x - 24 * G, top, 48 * G, H - top);
      ctx.setLineDash([8, 8]); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(255,120,100,${.5 + pulse * .4})`;
      ctx.strokeRect(p.x - 24 * G, top, 48 * G, H - top); ctx.setLineDash([]);
      outlined('SHILAJIT', p.x, top + 18, 13, '#ff9a8a');
      return;
    }
    const t0 = p.t - p.tele, drop = ease(Math.min(1, t0 / 0.18)), a = 1 - clamp((t0 - 0.6) / 0.35, 0, 1);
    const end = top + (H - top) * drop;
    ctx.globalAlpha = a;
    ctx.lineCap = 'round';
    const path = () => { ctx.beginPath(); ctx.moveTo(p.x, top); for (let y = top; y <= end; y += 10) ctx.lineTo(p.x + Math.sin(y * 0.03 + t * 7) * 7 * (1 - Math.min(1, t0)), y); };
    path(); ctx.lineWidth = 30 * G; ctx.strokeStyle = '#120c08'; ctx.stroke();
    path(); ctx.lineWidth = 8 * G; ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.stroke();
    for (let y = top + 14; y < end; y += 26) { ctx.fillStyle = 'rgba(255,255,255,.8)'; circle(p.x - 6, y, 2.2); ctx.fill(); ctx.fillStyle = 'rgba(220,40,40,.8)'; circle(p.x + 7, y + 11, 1.8); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  function drawBelt(p, t) {
    const y = H - 26, h = 16;
    ctx.fillStyle = '#2f3033'; ctx.fillRect(p.x0, y, p.x1 - p.x0, h);
    ctx.save(); ctx.beginPath(); ctx.rect(p.x0, y, p.x1 - p.x0, h); ctx.clip();
    ctx.strokeStyle = '#f2c200'; ctx.lineWidth = 2.5;
    const off = ((t * 150 * p.dir) % 18 + 18) % 18;
    for (let x = p.x0 - 18 + off; x < p.x1 + 18; x += 18) {
      ctx.beginPath(); ctx.moveTo(x - 4 * p.dir, y + 3); ctx.lineTo(x + 3 * p.dir, y + h / 2); ctx.lineTo(x - 4 * p.dir, y + h - 3); ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = '#4a4b50'; ctx.fillRect(p.x0, y - 2, p.x1 - p.x0, 2); ctx.fillRect(p.x0, y + h, p.x1 - p.x0, 2);
    txt('THE FACTORY MUST GROW', (p.x0 + p.x1) / 2, y - 9, 9, 'rgba(242,194,0,.8)', 900);
    drawAssembler(p.mx, H - 4, G, t, p.dir);
  }
  function drawAssembler(x, yb, sc, t, dir) { // the machine at the end of the belt
    ctx.save(); ctx.translate(x, yb); ctx.scale(sc, sc);
    ctx.shadowColor = 'rgba(226,32,48,.55)'; ctx.shadowBlur = 14;
    roundRect(-32, -64, 64, 64, 5); ctx.fillStyle = '#5b5f66'; ctx.fill(); ctx.shadowBlur = 0;
    ctx.lineWidth = 2; ctx.strokeStyle = '#2b2d31'; ctx.stroke();
    ctx.fillStyle = '#4a4e55'; ctx.fillRect(-32, -16, 64, 16);
    ctx.save(); ctx.beginPath(); ctx.rect(-32, -16, 64, 5); ctx.clip(); ctx.fillStyle = '#f2c200'; ctx.fillRect(-32, -16, 64, 5);
    ctx.fillStyle = '#16161a'; for (let i = -40; i < 40; i += 10) { ctx.beginPath(); ctx.moveTo(i, -11); ctx.lineTo(i + 5, -16); ctx.lineTo(i + 10, -16); ctx.lineTo(i + 5, -11); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    roundRect(-21, -56, 42, 36, 4); ctx.fillStyle = '#1d1f23'; ctx.fill();
    ctx.save(); ctx.translate(0, -38); ctx.rotate(t * 5 * dir); drawGear(13); ctx.restore();
    ctx.save(); ctx.translate(-12, -46); ctx.rotate(-t * 7 * dir); drawGear(6); ctx.restore();
    txt('ASSEMBLER', 0, -6, 7.5, '#f2c200', 900);
    ctx.fillStyle = '#e2203a'; circle(26, -58, 2.5 + Math.sin(t * 12)); ctx.fill();
    ctx.restore();
  }
  function drawRing(p, t) {
    if (p.t < p.tele) {
      const pulse = .5 + .5 * Math.sin(t * 18);
      ctx.setLineDash([8, 8]); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(255,154,60,${.35 + pulse * .35})`;
      circle(p.x, p.y, p.R); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = `rgba(255,220,120,${.6 + pulse * .4})`; circle(p.x, p.y, 6 + pulse * 6); ctx.fill();
      txt('BIG BANG', p.x, p.y - 26, 18, '#ffb347', 900, 'Gluten, cursive');
      return;
    }
    const a = 1 - Math.min(1, (p.t - p.tele) / 0.75);
    ctx.globalAlpha = a;
    ctx.lineWidth = 16; ctx.strokeStyle = '#ff9a3c'; circle(p.x, p.y, p.rr || 1); ctx.stroke();
    ctx.lineWidth = 4; ctx.strokeStyle = '#fff3c4'; ctx.stroke();
    ctx.globalAlpha = 1;
  }
  function drawSmoke(p) { // a thick cloud: solid in the middle, puffy round the edge
    const a = Math.min(1, p.t * 2) * Math.min(1, (p.life - p.t) / 1.2);
    ctx.fillStyle = `rgba(214,208,196,${a * .95})`;
    for (let i = 0; i < 7; i++) {
      const ang = p.seed + i * 0.9 + p.t * .3;
      circle(p.x + Math.cos(ang) * p.r * .55, p.y + Math.sin(ang) * p.r * .4, p.r * (.55 + (i % 3) * .12)); ctx.fill();
    }
    ctx.fillStyle = `rgba(200,194,182,${a})`; circle(p.x, p.y, p.r * .62); ctx.fill();
  }
  function drawSnack(k, r) {
    if (k === 'pizza') {
      ctx.beginPath(); ctx.moveTo(0, r * 1.1); ctx.lineTo(-r * .9, -r * .6); ctx.quadraticCurveTo(0, -r * 1.05, r * .9, -r * .6); ctx.closePath();
      ctx.fillStyle = '#ffcf4a'; ctx.fill();
      ctx.lineWidth = r * .28; ctx.strokeStyle = '#c8822e'; ctx.beginPath(); ctx.moveTo(-r * .9, -r * .6); ctx.quadraticCurveTo(0, -r * 1.05, r * .9, -r * .6); ctx.stroke();
      ctx.fillStyle = '#c0392b'; [[-.3, -.25], [.25, -.2], [0, .3]].forEach(([a, b]) => { circle(a * r, b * r, r * .17); ctx.fill(); });
    } else if (k === 'popsicle') {
      roundRect(-r * .14, r * .4, r * .28, r * .8, 3); ctx.fillStyle = '#d8b07a'; ctx.fill();
      roundRect(-r * .55, -r * 1, r * 1.1, r * 1.55, r * .5); ctx.fillStyle = '#ffb347'; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.4)'; roundRect(-r * .38, -r * .8, r * .2, r * .9, 4); ctx.fill();
    } else if (k === 'melon') {
      ctx.beginPath(); ctx.arc(0, -r * .3, r * 1.05, 0, Math.PI); ctx.closePath(); ctx.fillStyle = '#2f8f3a'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, -r * .3, r * .85, 0, Math.PI); ctx.closePath(); ctx.fillStyle = '#ff4d5e'; ctx.fill();
      ctx.fillStyle = '#1a1a1a'; [[-.4, 0], [0, .25], [.4, 0], [-.15, -.05], [.2, .05]].forEach(([a, b]) => { ctx.beginPath(); ctx.ellipse(a * r, b * r, r * .05, r * .1, 0, 0, TAU); ctx.fill(); });
    } else {
      roundRect(-r * .55, -r * .95, r * 1.1, r * 1.9, r * .2); ctx.fillStyle = '#d41f26'; ctx.fill();
      ctx.fillStyle = '#d9d9de'; ctx.fillRect(-r * .5, -r * .95, r * 1, r * .18);
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-r * .55, r * .2); ctx.bezierCurveTo(-r * .2, -r * .1, r * .2, r * .5, r * .55, r * .1); ctx.stroke();
      txt('COLA', 0, -r * .3, r * .38, '#ffffff', 900, '"Instrument Sans", sans-serif', r);
    }
  }
  // ---------- the new attacks ----------
  function drawSyringe(p) {
    ctx.rotate(-p.rot); // the syringe points where it's flying, its label stays level
    ctx.save(); ctx.rotate(p.rot);
    const liq = p.label === 'TRT' ? '#ffd36b' : p.label === 'FIN' ? '#7cc4ff' : '#ff8ad0';
    ctx.strokeStyle = '#d9d9de'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(25, 0); ctx.stroke();
    roundRect(-15, -5.5, 27, 11, 3); ctx.fillStyle = 'rgba(232,244,255,.92)'; ctx.fill();
    ctx.fillStyle = liq; ctx.fillRect(-3, -4, 14, 8);
    ctx.lineWidth = 1.2; ctx.strokeStyle = '#6a6e76'; roundRect(-15, -5.5, 27, 11, 3); ctx.stroke();
    ctx.fillStyle = '#6a6e76'; ctx.fillRect(-22, -1.6, 7, 3.2); ctx.fillRect(-25, -6, 3, 12);
    ctx.restore();
    ctx.font = '900 8px "Instrument Sans", sans-serif';
    const w = ctx.measureText(p.label).width + 8;
    roundRect(-w / 2, -22, w, 12, 3); ctx.fillStyle = '#16161c'; ctx.fill();
    txt(p.label, 0, -15.6, 8, '#ffffff', 900);
  }
  function drawWaBubble() { // a green chat bubble with a question mark
    ctx.fillStyle = '#25d366'; circle(0, 0, 13); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-9, 7); ctx.lineTo(-14, 15); ctx.lineTo(-2, 11); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; circle(0, 0, 13); ctx.stroke();
    txt('?', 0, 1, 15, '#ffffff', 900);
  }
  function drawGoyWord(p) {
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
  function drawPill(p) {
    const r = p.r, body = () => roundRect(-r * 1.15, -r * 0.5, r * 2.3, r, r * 0.5);
    body(); ctx.fillStyle = '#f4f1ea'; ctx.fill();
    ctx.save(); body(); ctx.clip(); ctx.fillStyle = p.color; ctx.fillRect(0, -r, r * 1.3, r * 2); ctx.restore();
    ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(0,0,0,.35)'; body(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.55)'; roundRect(-r * 0.9, -r * 0.32, r * 1.6, r * 0.18, 2); ctx.fill();
  }
  function drawLiver(r) {
    ctx.beginPath(); ctx.moveTo(-r * 1.2, -r * 0.1); ctx.bezierCurveTo(-r * 1.2, -r * 0.95, r * 0.2, -r * 1.05, r * 1.25, -r * 0.45); ctx.bezierCurveTo(r * 1.0, r * 0.25, r * 0.2, r * 0.9, -r * 0.3, r * 0.75); ctx.bezierCurveTo(-r * 0.9, r * 0.6, -r * 1.2, r * 0.3, -r * 1.2, -r * 0.1); ctx.closePath();
    const g = ctx.createLinearGradient(0, -r, 0, r); g.addColorStop(0, '#a3243a'); g.addColorStop(1, '#5e0f1a'); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(40,0,6,.6)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-r * 0.1, -r * 0.82); ctx.quadraticCurveTo(0, 0, -r * 0.35, r * 0.7); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(-r * 0.55, -r * 0.4, r * 0.35, r * 0.12, -0.4, 0, TAU); ctx.fill();
    txt('RAW', r * 0.4, r * 0.05, r * 0.42, 'rgba(255,220,225,.9)', 900);
  }
  function drawRate(p) {
    const w = 66, h = 32;
    card(w, h, '#fbfbfd', Math.sin(p.t * 2 + p.ph) * .14);
    ctx.fillStyle = '#16161c'; ctx.fillRect(-w / 2, -h / 2, w, 9);
    txt('RATING', 0, -h / 2 + 4.6, 6, '#ffffff', 900);
    txt(p.text, 0, 5, 12, '#e2203a', 900, 'Gluten, cursive', w - 8);
  }
  function drawChatMsg(p) {
    ctx.font = '700 9px "Instrument Sans", sans-serif';
    const uw = ctx.measureText(p.user + ': ').width;
    ctx.font = '600 9px "Instrument Sans", sans-serif';
    const w = Math.min(200, uw + ctx.measureText(p.text).width + 14), h = 20;
    card(w, h, 'rgba(24,24,28,.95)', 0);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.font = '700 9px "Instrument Sans", sans-serif'; ctx.fillStyle = p.color; ctx.fillText(p.user + ':', -w / 2 + 7, 0.5);
    ctx.font = '600 9px "Instrument Sans", sans-serif'; ctx.fillStyle = '#efeff1'; ctx.fillText(p.text, -w / 2 + 7 + uw, 0.5, w - uw - 12);
  }
  function drawDono(p) {
    ctx.font = '800 9px "Instrument Sans", sans-serif';
    const w = Math.min(190, ctx.measureText(p.text).width + 18), h = 24;
    card(w, h, '#101a14', Math.sin(p.t * 2 + p.ph) * .1);
    ctx.lineWidth = 2; ctx.strokeStyle = '#3ddc84'; roundRect(-w / 2, -h / 2, w, h, 7); ctx.stroke();
    txt(p.text, 0, 0.5, 9, '#3ddc84', 800, '"Instrument Sans", sans-serif', w - 10);
  }
  function drawAd() {
    roundRect(-18, -10, 36, 20, 4); ctx.fillStyle = '#ffd400'; ctx.fill();
    ctx.lineWidth = 1.4; ctx.strokeStyle = '#16161c'; ctx.stroke();
    txt('$199', 0, -2.5, 9, '#c8102e', 900);
    txt('COURSE', 0, 5.5, 5.5, '#16161c', 900);
  }
  // An axe: a wooden haft running down from a steel head. The poll is on the left, and the bit flares out to the
  // right into a curved, sharpened edge. The middle of the edge is at (50, -40).
  function axeShape(haft) {
    ctx.beginPath(); ctx.moveTo(-4.5, -44); ctx.lineTo(-4, haft - 10); ctx.quadraticCurveTo(-6.5, haft - 4, -6.5, haft); ctx.lineTo(6.5, haft); ctx.quadraticCurveTo(6.5, haft - 4, 4, haft - 10); ctx.lineTo(4.5, -44); ctx.closePath();
    const wg = ctx.createLinearGradient(-5, 0, 5, 0); wg.addColorStop(0, '#6e4320'); wg.addColorStop(.5, '#b07a42'); wg.addColorStop(1, '#6e4320');
    ctx.fillStyle = wg; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = '#3e250f'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-15, -50); ctx.lineTo(8, -50); ctx.quadraticCurveTo(22, -50, 44, -66); ctx.quadraticCurveTo(57, -40, 44, -14); ctx.quadraticCurveTo(22, -30, 8, -30); ctx.lineTo(-15, -30); ctx.quadraticCurveTo(-19, -40, -15, -50); ctx.closePath();
    const sg = ctx.createLinearGradient(-15, 0, 52, 0); sg.addColorStop(0, '#4f555d'); sg.addColorStop(.45, '#8f969f'); sg.addColorStop(1, '#eef1f4');
    ctx.fillStyle = sg; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = '#2f343a'; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(42.5, -62); ctx.quadraticCurveTo(53.5, -40, 42.5, -18); ctx.stroke();
    ctx.fillStyle = '#5a3a1a'; ctx.fillRect(-4.5, -50, 9, 4);
    ctx.fillStyle = '#c9ced6'; circle(0, -40, 2); ctx.fill();
  }
  // A ball-peen hammer in the same frame as the axe: wooden handle down from the head, the flat striking face on the
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
  }
  function drawLink(p) { // one link of the chain: lying flat (an oval) or standing on its edge (a bar through its neighbours)
    const L = 25, R = 9;
    ctx.lineCap = 'round';
    if (p.flip) {
      ctx.lineWidth = 7; ctx.strokeStyle = '#4f5660'; ctx.beginPath(); ctx.moveTo(-L + 4, 0); ctx.lineTo(L - 4, 0); ctx.stroke();
      ctx.lineWidth = 2.5; ctx.strokeStyle = '#d4dae2'; ctx.beginPath(); ctx.moveTo(-L + 6, -1.2); ctx.lineTo(L - 6, -1.2); ctx.stroke();
      return;
    }
    const open = p.broken ? 0.6 : 0, a0 = p.broken < 0 ? Math.PI + open : open, a1 = a0 + TAU - 2 * open; // broken open towards the gap
    ctx.lineWidth = 7; ctx.strokeStyle = '#4f5660'; ctx.beginPath(); ctx.ellipse(0, 0, L, R, 0, a0, a1); ctx.stroke();
    ctx.lineWidth = 2.5; ctx.strokeStyle = '#d4dae2'; ctx.beginPath(); ctx.ellipse(0, -1, L, R, 0, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  }
  function drawFish(p) {
    ctx.scale(p.face || p.dir, 1);
    const step = p.air ? 3 : Math.sin(p.walk || 0) * 5;
    ctx.strokeStyle = '#3a4a5a'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-4, 6); ctx.lineTo(-4 + step, 16); ctx.lineTo(-1 + step, 16); ctx.moveTo(5, 6); ctx.lineTo(5 - step, 16); ctx.lineTo(8 - step, 16); ctx.stroke();
    ctx.fillStyle = '#5f87ad'; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-25, -8); ctx.lineTo(-22, 0); ctx.lineTo(-25, 8); ctx.closePath(); ctx.fill();
    const g = ctx.createLinearGradient(0, -9, 0, 9); g.addColorStop(0, '#8fb6d8'); g.addColorStop(1, '#5a7fa3');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 16, 9, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#5f87ad'; ctx.beginPath(); ctx.moveTo(-5, -8); ctx.lineTo(2, -14); ctx.lineTo(6, -8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; for (const x of [-7, -2, 3]) { ctx.beginPath(); ctx.arc(x, 0, 5, -0.8, 0.8); ctx.stroke(); }
    ctx.strokeStyle = '#3a5a7a'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(9, 0, 5, -1.2, 1.2); ctx.stroke();
  }
  function drawHyperArrow() {
    ctx.strokeStyle = 'rgba(255,111,174,.55)'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(-22, 0); ctx.stroke();
    ctx.fillStyle = '#ff6fae'; ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(-6, -7.5); ctx.lineTo(-2, 0); ctx.lineTo(-6, 7.5); ctx.closePath(); ctx.fill();
  }
  function drawPicto(x, y, pink, sc) { // toilet-sign figures, no faces
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    const c = pink ? '#ff6fae' : '#4a90ff';
    ctx.fillStyle = c; ctx.strokeStyle = c;
    circle(0, -16, 4.6); ctx.fill();
    if (pink) { ctx.beginPath(); ctx.moveTo(-3.5, -10); ctx.lineTo(3.5, -10); ctx.lineTo(8, 5); ctx.lineTo(-8, 5); ctx.closePath(); ctx.fill(); }
    else { roundRect(-5, -10, 10, 15, 2.5); ctx.fill(); }
    ctx.fillRect(-4, 5, 3, 8); ctx.fillRect(1, 5, 3, 8);
    ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(pink ? -4 : -5.5, -8.5); ctx.lineTo(pink ? -8 : -8.5, 1); ctx.moveTo(pink ? 4 : 5.5, -8.5); ctx.lineTo(pink ? 8 : 8.5, 1); ctx.stroke();
    ctx.restore();
  }
  function drawHyper(p, t) {
    const end = p.tele + (p.waves - 1) * 0.5;
    const a = p.t < end + 0.25 ? Math.min(1, p.t * 5) : Math.max(0, 1 - (p.t - end - 0.25) / 0.7);
    if (a <= 0) return;
    const pulse = .5 + .5 * Math.sin(t * 14), by = hyperY(), sc = Math.max(0.75, G), m = p.targets.length;
    ctx.globalAlpha = a;
    const cap = 'HYPERGAMY CHART · SOURCE: TRUST ME BRO';
    fitFont(cap, 15, 900, 'Gluten, cursive', W - 24);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(29,17,8,.85)'; ctx.strokeText(cap, W / 2, p.top - 34);
    ctx.fillStyle = '#ffb3d1'; ctx.fillText(cap, W / 2, p.top - 34);
    if (p.fired < p.waves) { // the dashed arrows it's about to fire along
      ctx.setLineDash([7, 7]); ctx.lineDashOffset = -t * 40; ctx.lineWidth = 2; ctx.strokeStyle = `rgba(255,111,174,${.45 + pulse * .4})`;
      p.tops.forEach((x, j) => { const tg = p.targets[j % m]; ctx.beginPath(); ctx.moveTo(x, p.top + 8); ctx.lineTo(tg.x, by - 20); ctx.stroke(); });
      ctx.setLineDash([]); ctx.lineDashOffset = 0;
    }
    const nb = Math.max(6, Math.round(W / 70));
    for (let j = 0; j < nb; j++) { const x = W * (j + .5) / nb; if (p.targets.every(tg => Math.abs(tg.x - x) > 26 * sc)) drawPicto(x, by, false, sc * 0.85); }
    for (const tg of p.targets) {
      ctx.strokeStyle = `rgba(74,144,255,${.5 + pulse * .5})`; ctx.lineWidth = 3; circle(tg.x, by - 4, 22 * sc); ctx.stroke();
      drawPicto(tg.x, by, false, sc * 1.1);
    }
    p.tops.forEach(x => drawPicto(x, p.top, true, sc));
    ctx.globalAlpha = 1;
  }
  function drawHammerHead(x, y, sc) {
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    roundRect(-4, -76, 8, 64, 3); ctx.fillStyle = '#7a4a1e'; ctx.fill();
    roundRect(-31, -15, 62, 30, 5);
    const g = ctx.createLinearGradient(0, -15, 0, 15); g.addColorStop(0, '#dde1e7'); g.addColorStop(1, '#7d838c'); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#4a4f57'; ctx.stroke();
    txt('BONESMASH', 0, 1, 8.5, '#2a2d33', 900, '"Instrument Sans", sans-serif', 56);
    ctx.restore();
  }
  function warnStrip(p, t, half) {
    const top = combBottom(), pulse = .5 + .5 * Math.sin(t * 16);
    ctx.fillStyle = `rgba(200,16,46,${.1 + pulse * .1})`; ctx.fillRect(p.x - half, top, half * 2, H - top);
    ctx.setLineDash([8, 8]); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(255,120,100,${.5 + pulse * .4})`; ctx.strokeRect(p.x - half, top, half * 2, H - top); ctx.setLineDash([]);
  }
  function drawHammer(p, t) { // hangs over the strip, shaking, then slams down
    const sc = 1.35 * G, yUp = H * 0.42, yDown = H - 20 * sc, lift = 30 * G;
    if (p.t < p.tele) { warnStrip(p, t, 30 * G); drawHammerHead(p.x + Math.sin(t * 40) * 2.5 * (p.t / p.tele), yUp - p.t / p.tele * lift, sc); outlined('BONESMASH', p.x, combBottom() + 52, 13, '#ff9a8a'); return; }
    const t0 = p.t - p.tele, u = ease(Math.min(1, t0 / 0.08));
    ctx.globalAlpha = 1 - clamp((t0 - 0.55) / 0.3, 0, 1);
    drawHammerHead(p.x, yUp - lift + (yDown - yUp + lift) * u, sc);
    ctx.globalAlpha = 1;
  }
  function drawBigAxe(x, y, sc, side, ang) { // blade down, haft rising off to one side, the edge's middle at (x, y)
    ctx.save(); ctx.translate(x, y); ctx.scale(side * sc, sc); ctx.rotate(ang); ctx.translate(-50, 40); hammerShape(165); ctx.restore();
  }
  function drawChop(p, t) {
    const sc = 1.15 * G, yUp = H * 0.42, yDown = H - 6, lift = 30 * G, side = p.x < W / 2 ? -1 : 1, A = 1.92; // 110 degrees: the bit points down
    if (p.t < p.tele) {
      const k = p.t / p.tele;
      warnStrip(p, t, 24 * G);
      drawBigAxe(p.x + Math.sin(t * 40) * 2.5 * k, yUp - k * lift, sc, side, A - 0.35 * k + Math.sin(t * 9) * 0.04);
      outlined('HAMMER', p.x, combBottom() + 52, 14, '#ff9a8a');
      return;
    }
    const t0 = p.t - p.tele, u = ease(Math.min(1, t0 / 0.08));
    ctx.globalAlpha = 1 - clamp((t0 - 0.55) / 0.3, 0, 1);
    drawBigAxe(p.x, yUp - lift + (yDown - yUp + lift) * u, sc, side, A - 0.35 + 0.35 * u);
    ctx.globalAlpha = 1;
  }
  function drawKnight(p, t) {
    const c = p.c, gx = p.x - Math.floor(2.5) * c, gy = p.y - 2 * c;
    ctx.fillStyle = 'rgba(244,241,234,.05)'; // a faint chessboard around it
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) if ((i + j) % 2 === 0) ctx.fillRect(gx + (i - 0.5) * c, gy + (j - 0.5) * c, c, c);
    if (p.st === 'tele') {
      const pulse = .5 + .5 * Math.sin(t * 18);
      ctx.fillStyle = `rgba(226,32,48,${.18 + pulse * .2})`; ctx.fillRect(p.tx - c / 2, p.ty - c / 2, c, c);
      ctx.strokeStyle = `rgba(255,120,100,${.6 + pulse * .3})`; ctx.lineWidth = 2; ctx.strokeRect(p.tx - c / 2, p.ty - c / 2, c, c);
      txt('N' + square(p.tx, knightRank(p, p.ty)), p.tx, p.ty, Math.round(clamp(c * 0.3, 11, 18)), '#ffe9e4', 800); // its move, e.g. Nf3
    }
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(c / 34, c / 34); if (spoon.x < p.x) ctx.scale(-1, 1);
    knightShape();
    ctx.restore();
  }
  function knightShape() { // the white knight piece, 34 units tall, centred on 0,0
    ctx.fillStyle = '#f4f1ea'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 1.8;
    roundRect(-12, 10, 24, 7, 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-9, 10); ctx.lineTo(-7, 0); ctx.quadraticCurveTo(-12, -6, -6, -14); ctx.quadraticCurveTo(-2, -20, 4, -19); ctx.lineTo(7, -23); ctx.lineTo(8, -16);
    ctx.quadraticCurveTo(13, -10, 12, -4); ctx.lineTo(4, -6); ctx.quadraticCurveTo(2, 2, 9, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-5, -13); ctx.quadraticCurveTo(-10, -5, -7, 2); ctx.stroke();
  }
  const SPECIAL = { gapMark: 1, knight: 1, ring: 1, smoke: 1, bar: 1, beam: 1, belt: 1, rope: 1, crowFly: 1, blendSrc: 1, allyFee: 1, hyper: 1, hammer: 1, chop: 1 };
  function drawProj(p, t) {
    if (p.dead) return;
    if (p.k === 'stamp' && p.delay > 0) { drawStampTele(p, t); return; }
    if (p.delay > 0) return;
    switch (p.k) {
      case 'ring': drawRing(p, t); return;
      case 'smoke': return;
      case 'bar': drawBar(p, t); return;
      case 'beam': drawBeam(p, t); return;
      case 'rope': drawRope(p, t); return;
      case 'belt': drawBelt(p, t); return;
      case 'hyper': drawHyper(p, t); return;
      case 'knight': drawKnight(p, t); return;
      case 'nest': drawNest(p, t); return;
      case 'bigSting': drawBigSting(p, t); return;
      case 'gapMark': drawGapMark(p, t); return;
      case 'scout': drawScout(p, t); return;
      case 'hammer': drawHammer(p, t); return;
      case 'chop': drawChop(p, t); return;
      case 'crowFly': ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.dir, 1); drawCrow(t, 1.3 * G, false); ctx.restore(); return;
    }
    if (p.k === 'blendSrc') {
      ctx.strokeStyle = 'rgba(226,40,40,.85)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
      if (d > 24) {
        const ux = dx / d, uy = dy / d, ex = p.x + ux * (d - 16), ey = p.y + uy * (d - 16);
        ctx.beginPath(); ctx.moveTo(p.x + ux * 18, p.y + uy * 18); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.fillStyle = 'rgba(226,40,40,.85)'; ctx.beginPath(); ctx.moveTo(ex + ux * 10, ey + uy * 10); ctx.lineTo(ex - uy * 8, ey + ux * 8); ctx.lineTo(ex + uy * 8, ey - ux * 8); ctx.closePath(); ctx.fill();
      }
    }
    if (!SPECIAL[p.k] && !p.harmless && !p.safe && p.dmg > 0) {
      const hr = p.r * 2.2 * ps(p);
      const g = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, hr);
      g.addColorStop(0, 'rgba(226,32,48,.28)'); g.addColorStop(1, 'rgba(226,32,48,0)');
      ctx.fillStyle = g; circle(p.x, p.y, hr); ctx.fill();
    }
    ctx.save(); ctx.translate(p.x, p.y);
    const sc = ps(p); ctx.scale(sc, sc);
    switch (p.k) {
      case 'notify': drawNotify(p); break;
      case 'fee': drawFee(p); break;
      case 'call': drawCall(p, t); break;
      case 'job': drawJob(p); break;
      case 'gif': drawGif(p); break;
      case 'rate': drawRate(p); break;
      case 'chatMsg': drawChatMsg(p); break;
      case 'dono': drawDono(p); break;
      default:
        ctx.rotate(p.rot);
        switch (p.k) {
          case 'bottle': drawBottle(p.r, p.f.label, p.f.color); break;
          case 'susjar': drawSusJar(p.r); break;
          case 'bag': drawBag(p.r); break;
          case 'flagjar': case 'blend': case 'blendSrc': drawFlagJar(p.r, p.flags); break;
          case 'pizza': case 'popsicle': case 'melon': case 'cola': drawSnack(p.k, p.r); break;
          case 'watermelon': case 'saffron': case 'creatine': drawDrink(p.k, p.r); break;
          case 'gear': drawGear(p.r); break;
          case 'block': drawBlock(p.r); break;
          case 'eq': drawEq(p); break;
          case 'tag': drawTag(p); break;
          case 'plate': drawPlate(p.r); break;
          case 'resinBlob': drawResinBlob(p.r); break;
          case 'leg': roundRect(-3, -12, 6, 24, 2); ctx.fillStyle = '#b07a45'; ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(-1, -11, 1.5, 22); break;
          case 'cell': drawCell(p); break;
          case 'pawn': case 'bishop': ctx.rotate(-p.rot); drawChess(p); break;
          case 'deen': drawDeen(); break;
          case 'stamp': ctx.rotate(-p.rot); drawStamp(); break;
          case 'allyFee': roundRect(-13, -8, 26, 16, 2); ctx.fillStyle = '#fbf8f0'; ctx.fill(); txt('$', 0, 1, 11, '#c8102e', 900);
            if (p.vat) { roundRect(-13, 8, 26, 9, 2); ctx.fillStyle = '#ffd36b'; ctx.fill(); txt('+VAT', 0, 12.5, 6.5, '#2a1606', 900); }
            break;
          case 'knightBack': ctx.scale(p.c / 34 * 0.8, p.c / 34 * 0.8); knightShape(); break;
          case 'mini': ctx.scale((p.vx < 0 ? -1 : 1) * 0.24, 0.24); drawHornetBody(t, Math.sin(p.ph) * 0.4); break;
          case 'miniSting': ctx.rotate(p.ang); ctx.scale(0.6, 0.6); ctx.fillStyle = '#2a1606'; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-8, -3.5); ctx.lineTo(-8, 3.5); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#ff9a3c'; ctx.fillRect(-12, -3, 5, 6); break;
          case 'curtainSting': case 'markDart':
          case 'stinger': case 'stingerAlly':
            if (p.k === 'markDart') { ctx.fillStyle = 'rgba(200,16,46,.35)'; circle(0, 0, 11); ctx.fill(); }
            ctx.rotate(p.ang); ctx.fillStyle = '#2a1606'; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-8, -3.5); ctx.lineTo(-8, 3.5); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#f2a516'; ctx.fillRect(-12, -3, 5, 6); break;
          case 'hexBig':
            hexPath(0, 0, p.r); ctx.fillStyle = 'rgba(242,165,22,.18)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#f2a516'; ctx.stroke();
            ctx.rotate(-p.rot); txt('cos(kπ/3)', 0, 0, 9, '#ffd36b', 700);
            break;
          case 'hexShard': hexPath(0, 0, p.r); ctx.fillStyle = '#f2a516'; ctx.fill(); break;
          case 'syringe': drawSyringe(p); break;
          case 'pill': drawPill(p); break;
          case 'goyWord': drawGoyWord(p); break;
          case 'waBubble': drawWaBubble(); break;
          case 'phone': drawPhone(); break;
          case 'scream': ctx.translate(Math.sin(p.t * 47 + p.ph) * 1.8, Math.cos(p.t * 39 + p.ph) * 1.2); outlined('A', 0, 0, 30, '#ff6b5a'); break;
          case 'liver': drawLiver(p.r); break;
          case 'ad': drawAd(); break;
          case 'axe': drawAxe(p.r); break;
          case 'link': drawLink(p); break;
          case 'linkGap': outlined('?', 0, -2, 30, '#cfe8ff'); txt('MISSING LINK', 0, 20, 8, '#cfe8ff', 900); break;
          case 'fish': drawFish(p); break;
          case 'hyperArrow': drawHyperArrow(); break;
          case 'quarks': {
            ctx.rotate(-p.rot);
            ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1; circle(0, 0, 14); ctx.stroke();
            const cx = Math.cos(p.a) * 14, cy = Math.sin(p.a) * 14;
            ctx.shadowColor = '#ff5a7a'; ctx.shadowBlur = 12;
            ctx.fillStyle = '#ff5a7a'; circle(cx, cy, 8); ctx.fill();
            ctx.fillStyle = '#5aa0ff'; circle(-cx, -cy, 8); ctx.fill();
            ctx.shadowBlur = 0;
            txt('u', cx, cy, 10, '#fff', 900); txt('d', -cx, -cy, 10, '#fff', 900);
            break;
          }
        }
    }
    ctx.restore();
  }
  function drawBad(it, t) {
    const f = it.f, r = it.r;
    ctx.save(); ctx.translate(it.x, it.y); ctx.scale(G, G);
    if (f.type === 'bottle') { ctx.rotate(Math.sin(it.phase) * .25); drawBottle(r, f.label, f.color); }
    else if (f.type === 'susjar') { ctx.rotate(Math.sin(it.phase) * .2); drawSusJar(r); }
    else if (f.type === 'bag') { ctx.rotate(Math.sin(it.phase) * .2); drawBag(r * .8); }
    else drawToxin(r, f, t, it.seed);
    ctx.restore();
    if (!it.carried && !it.held) badMark(it.x, it.y, r * G, t, it.isNew);
  }

  // ---------- bosses (no faces, by design) ----------
  function drawKeeper(b, t) {
    const up = b.pose > 0;
    ctx.fillStyle = '#e9e4d6'; roundRect(-26, 40, 20, 26, 6); ctx.fill(); roundRect(6, 40, 20, 26, 6); ctx.fill();
    ctx.fillStyle = '#3b3b3b'; roundRect(-28, 62, 24, 9, 4); ctx.fill(); roundRect(4, 62, 24, 9, 4); ctx.fill();
    const g = ctx.createLinearGradient(-34, 0, 34, 0); g.addColorStop(0, '#fbf9f2'); g.addColorStop(1, '#d6cfbb');
    roundRect(-34, -16, 68, 62, 18); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.stroke();
    if (b.p2) { ctx.fillStyle = 'rgba(255,214,40,.75)'; [[-18, 2, 9], [10, 30, 11], [-10, 34, 7], [22, -6, 6]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.ellipse(x, y, r, r * .8, .4, 0, TAU); ctx.fill(); }); }
    limb(0, -12, 0, 44, 1.5, '#b9b2a0');
    hexPath(15, 8, 12); ctx.fillStyle = '#f2a516'; ctx.fill();
    txt('100%', 15, 4, 6, '#2a1606', 900); txt('RAW*', 15, 11, 6, '#2a1606', 900);
    txt('*trust me bro', 15, 27, 5, '#6b5a40', 700);
    limb(-30, -6, -46, 20, 13, '#f1ede2');
    ctx.fillStyle = '#e8c547'; circle(-47, 24, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-62, 28); ctx.lineTo(-36, 28); ctx.lineTo(-39, 54); ctx.lineTo(-59, 54); ctx.closePath();
    ctx.fillStyle = '#f7f7f4'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#9a9a92'; ctx.stroke();
    txt('SYRUP', -49, 40, 7, '#c8102e', 900);
    ctx.fillStyle = '#ffe600'; ctx.beginPath(); ctx.ellipse(-40, 56 + (t * 30 % 10), 2, 3.5, 0, 0, TAU); ctx.fill();
    const hy = up ? -26 : 12;
    limb(30, -6, 46, hy, 13, '#f1ede2');
    ctx.fillStyle = '#e8c547'; circle(47, hy + 2, 7); ctx.fill();
    const sg = ctx.createLinearGradient(40, 0, 58, 0); sg.addColorStop(0, '#9aa0a8'); sg.addColorStop(.5, '#e4e7ec'); sg.addColorStop(1, '#8a9098');
    roundRect(40, hy - 24, 17, 24, 3); ctx.fillStyle = sg; ctx.fill();
    ctx.fillStyle = '#c9ced6'; ctx.beginPath(); ctx.moveTo(41, hy - 24); ctx.lineTo(56, hy - 24); ctx.lineTo(51, hy - 33); ctx.lineTo(46, hy - 33); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8a5a2b'; ctx.fillRect(57, hy - 20, 5, 16);
    for (let i = 0; i < 3; i++) {
      const ph = (t * .8 + i / 3) % 1;
      ctx.fillStyle = `rgba(220,215,205,${.6 * (1 - ph)})`; circle(49 + Math.sin(ph * 6 + i) * 4, hy - 36 - ph * 26, 4 + ph * 7); ctx.fill();
    }
    roundRect(-23, -46, 46, 36, 14); ctx.fillStyle = 'rgba(28,28,26,.92)'; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,.13)'; ctx.lineWidth = 1;
    for (let x = -24; x < 24; x += 4) { ctx.beginPath(); ctx.moveTo(x, -46); ctx.lineTo(x, -10); ctx.stroke(); }
    for (let y = -46; y < -10; y += 4) { ctx.beginPath(); ctx.moveTo(-24, y); ctx.lineTo(24, y); ctx.stroke(); }
    ctx.restore();
    ctx.fillStyle = '#efe7cf'; ctx.beginPath(); ctx.ellipse(0, -46, 40, 9, 0, 0, TAU); ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.stroke();
    roundRect(-19, -64, 38, 20, 10); ctx.fillStyle = '#f6efda'; ctx.fill(); ctx.stroke();
  }
  function drawColonexFigure(b, t, mad) {
    const act = b && b.pose > 0;
    const raise = act ? -10 : 0;
    ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-32, 8); ctx.bezierCurveTo(-40, -6, -30, -20, -40, -34 + raise); ctx.stroke();
    ctx.save(); ctx.translate(-42, -48 + raise); ctx.rotate(-0.08 + (act ? Math.sin(t * 14) * .1 : 0));
    roundRect(-15, -14, 30, 27, 2); ctx.fillStyle = '#e3201b'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#111'; ctx.stroke();
    txt('No', 0, 0, 13, '#ffffff', 700, 'Gluten, cursive');
    ctx.restore();
    limb(-12, -6, -32, 8, 3.5, '#111');
    limb(12, -6, 30, act ? -22 : 8, 3.5, '#111');
    ctx.beginPath(); ctx.moveTo(-12, -12); ctx.lineTo(12, -12); ctx.lineTo(15, 24); ctx.lineTo(-15, 24); ctx.closePath();
    ctx.fillStyle = '#ff8f1f'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#111'; ctx.stroke();
    txt('AN IQ', 0, 3, 5.2, '#2a1606', 900); txt('TOO HIGH', 0, 9, 4.6, '#2a1606', 900);
    circle(0, -28, 17); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#111'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-23, -35); ctx.lineTo(-22, -64); ctx.quadraticCurveTo(0, -68, 23, -63); ctx.lineTo(24, -36); ctx.quadraticCurveTo(0, -32, -23, -35); ctx.closePath();
    ctx.fillStyle = '#3d3d40'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#111'; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.09)'; ctx.lineWidth = 1;
    for (let x = -18; x < 20; x += 5) { ctx.beginPath(); ctx.moveTo(x, -60); ctx.lineTo(x + 2, -54); ctx.moveTo(x + 2, -48); ctx.lineTo(x, -42); ctx.stroke(); }
    if (mad) {
      ctx.strokeStyle = '#e3201b'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(8, -57, 5, 0, Math.PI / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(18, -57, 5, Math.PI / 2, Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.arc(8, -46, 5, -Math.PI / 2, 0); ctx.stroke();
      ctx.beginPath(); ctx.arc(18, -46, 5, Math.PI, Math.PI * 1.5); ctx.stroke();
    }
  }
  function drawLambo(t, skis, p2) {
    if (skis) {
      ctx.strokeStyle = '#7ec8ff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      for (const [x1, x2] of [[-96, -8], [8, 96]]) { ctx.beginPath(); ctx.moveTo(x1, 72); ctx.lineTo(x2, 72); ctx.quadraticCurveTo(x2 + 8, 72, x2 + 9, 64); ctx.stroke(); }
    }
    if (p2) {
      for (let i = 0; i < 3; i++) { const f = .6 + .4 * Math.sin(t * 30 + i); ctx.fillStyle = i % 2 ? '#ffd36b' : '#ff7a1a'; ctx.beginPath(); ctx.moveTo(-86, 44 + i * 4); ctx.lineTo(-86 - 18 * f, 46 + i * 4); ctx.lineTo(-86, 49 + i * 4); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = '#16181c'; ctx.fillRect(-84, 22, 26, 4); ctx.fillRect(-78, 25, 3, 10); ctx.fillRect(-66, 25, 3, 10);
    }
    const g = ctx.createLinearGradient(0, 14, 0, 60); g.addColorStop(0, '#f0303a'); g.addColorStop(1, '#8e0b14');
    ctx.beginPath();
    ctx.moveTo(-86, 52); ctx.lineTo(-82, 41); ctx.lineTo(-36, 31); ctx.lineTo(-6, 16); ctx.lineTo(30, 15); ctx.lineTo(64, 28); ctx.lineTo(86, 33); ctx.lineTo(88, 48); ctx.lineTo(82, 57); ctx.lineTo(-82, 58); ctx.closePath();
    ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#3a0508'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-26, 31); ctx.lineTo(-2, 19); ctx.lineTo(28, 18); ctx.lineTo(54, 30); ctx.closePath(); ctx.fillStyle = '#16181c'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(30, 39); ctx.lineTo(52, 37); ctx.lineTo(42, 49); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-72, 43); ctx.lineTo(-30, 35); ctx.stroke();
    for (const x of [-52, 54]) {
      ctx.fillStyle = '#16181c'; circle(x, 55, 16); ctx.fill();
      ctx.fillStyle = '#0b0b0d'; circle(x, 58, 13); ctx.fill();
      ctx.fillStyle = '#3a3d44'; circle(x, 58, 7.5); ctx.fill();
      ctx.strokeStyle = '#6a6e76'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) { const a = i * TAU / 5; ctx.beginPath(); ctx.moveTo(x, 58); ctx.lineTo(x + Math.cos(a) * 7, 58 + Math.sin(a) * 7); ctx.stroke(); }
      ctx.fillStyle = '#c8102e'; circle(x, 58, 2); ctx.fill();
    }
    // the crow, perched on the roof
    ctx.save(); ctx.translate(54, 17); drawCrow(t, 0.85, true); ctx.restore();
  }
  function drawColonex(b, t) {
    ctx.save(); ctx.translate(-8, -12);
    drawColonexFigure(b, t, b.hurt > 0 || b.pose > 0 || b.mode === 'dash');
    ctx.restore();
    if (b.mode !== 'down' || b.endless) drawLambo(t, b.mode === 'dash', b.p2);
  }
  function drawCEO(b, t) {
    const point = b.pose > 0;
    roundRect(-76, -66, 40, 32, 3); ctx.fillStyle = '#fbfbfd'; ctx.fill();
    ctx.fillStyle = '#0f9d58'; ctx.fillRect(-76, -66, 40, 5);
    ctx.fillStyle = '#4285f4'; [[0, 16], [1, 11], [2, 7], [3, 3]].forEach(([i, h]) => ctx.fillRect(-71 + i * 8, -37 - h, 5, h));
    txt('VIEWS', -56, -56, 4.5, '#16161c', 900);
    ctx.strokeStyle = '#ea4335'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-70, -54); ctx.lineTo(-44, -40); ctx.lineTo(-47, -43); ctx.moveTo(-44, -40); ctx.lineTo(-48, -40); ctx.stroke();
    ctx.fillStyle = '#5a5a60'; ctx.fillRect(-57, -34, 2, 22);
    ctx.fillStyle = '#14161c'; roundRect(-20, 38, 17, 30, 4); ctx.fill(); roundRect(3, 38, 17, 30, 4); ctx.fill();
    ctx.fillStyle = '#050505'; ctx.beginPath(); ctx.ellipse(-13, 69, 12, 5, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(13, 69, 12, 5, 0, 0, TAU); ctx.fill();
    const g = ctx.createLinearGradient(-32, 0, 32, 0); g.addColorStop(0, '#15171d'); g.addColorStop(.5, '#272a33'); g.addColorStop(1, '#15171d');
    ctx.beginPath(); ctx.moveTo(-32, -10); ctx.quadraticCurveTo(-34, -18, -22, -20); ctx.lineTo(22, -20); ctx.quadraticCurveTo(34, -18, 32, -10); ctx.lineTo(27, 44); ctx.lineTo(-27, 44); ctx.closePath();
    ctx.fillStyle = g; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-11, -20); ctx.lineTo(11, -20); ctx.lineTo(0, 12); ctx.closePath(); ctx.fill();
    const tie = b.p2 ? '#d93025' : '#2f6fd6', tx = b.p2 ? 3 : 0;
    ctx.fillStyle = tie; ctx.beginPath(); ctx.moveTo(-4 + tx, -16); ctx.lineTo(4 + tx, -16); ctx.lineTo(2.5 + tx, -10); ctx.lineTo(-2.5 + tx, -10); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-2.5 + tx, -10); ctx.lineTo(2.5 + tx, -10); ctx.lineTo(5 + tx * 2, 8); ctx.lineTo(tx * 2, 14); ctx.lineTo(-5 + tx * 2, 8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#0c0d11'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-20, -19); ctx.lineTo(-3, 16); ctx.moveTo(20, -19); ctx.lineTo(3, 16); ctx.stroke();
    ctx.fillStyle = '#0c0d11'; circle(0, 28, 2); ctx.fill();
    const skin = '#d8a77f';
    if (point) {
      limb(-28, -12, -32, 30, 13, '#1d2028'); ctx.fillStyle = skin; circle(-32, 34, 6); ctx.fill();
      const ang = Math.atan2(spoon.y - b.y, spoon.x - b.x), ex = 30 + Math.cos(ang) * 34, ey = -10 + Math.sin(ang) * 34;
      limb(28, -12, ex, ey, 13, '#1d2028');
      ctx.fillStyle = skin; circle(ex, ey, 6); ctx.fill();
      limb(ex, ey, ex + Math.cos(ang) * 10, ey + Math.sin(ang) * 10, 3.5, skin);
      ctx.fillStyle = '#cfd3da'; circle(ex - Math.cos(ang) * 8, ey - Math.sin(ang) * 8, 4); ctx.fill();
    } else {
      roundRect(-31, 4, 62, 15, 7.5); ctx.fillStyle = '#20232c'; ctx.fill();
      ctx.strokeStyle = '#0c0d11'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-6, 4); ctx.lineTo(4, 19); ctx.stroke();
      ctx.fillStyle = skin; circle(-30, 11, 6); ctx.fill(); circle(30, 11, 6); ctx.fill();
      ctx.fillStyle = '#cfd3da'; circle(21, 11, 4.5); ctx.fill();
      ctx.fillStyle = '#3a3f4a'; circle(21, 11, 2.5); ctx.fill();
    }
    ctx.fillStyle = skin; roundRect(-6, -27, 12, 9, 3); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-17, -38, 3.5, 5, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(17, -38, 3.5, 5, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -39, 16, 19, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#1f1814';
    ctx.beginPath(); ctx.moveTo(-16, -42); ctx.quadraticCurveTo(-18, -18, 0, -19); ctx.quadraticCurveTo(18, -18, 16, -42); ctx.quadraticCurveTo(12, -29, 0, -29); ctx.quadraticCurveTo(-12, -29, -16, -42); ctx.fill();
    roundRect(-7, -33, 14, 3.5, 1.75); ctx.fill();
    ctx.fillStyle = '#1a1411';
    ctx.beginPath(); ctx.ellipse(0, -51, 17, 9, 0, 0, TAU); ctx.fill();
    [[-16, -47, 6], [-11, -55, 7], [-3, -59, 7], [6, -58, 7], [13, -53, 6.5], [17, -45, 5], [-18, -40, 4.5], [18, -39, 4.5], [0, -53, 6]].forEach(([x, y, r]) => { circle(x, y, r); ctx.fill(); });
  }
  function drawIronfit(b, t) {
    const skin = '#d6a47c', glove = '#8fb0e8', top = b.p2 ? '#151517' : '#a3a3a8';
    const bob = b.pushup > 0 ? Math.abs(Math.sin(b.t * 8.7)) * 12 : 0;
    ctx.save(); ctx.translate(0, bob);
    ctx.fillStyle = '#16161a'; roundRect(-22, 36, 19, 32, 4); ctx.fill(); roundRect(3, 36, 19, 32, 4); ctx.fill();
    ctx.fillStyle = '#0a0a0a'; ctx.beginPath(); ctx.ellipse(-12, 69, 12, 5, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(12, 69, 12, 5, 0, 0, TAU); ctx.fill();
    // torso: grey sleeveless tee, or the black compression top in phase 2
    ctx.beginPath(); ctx.moveTo(-31, -14); ctx.quadraticCurveTo(-30, -21, -20, -22); ctx.lineTo(20, -22); ctx.quadraticCurveTo(30, -21, 31, -14); ctx.lineTo(25, 36); ctx.lineTo(-25, 36); ctx.closePath();
    ctx.fillStyle = top; ctx.fill();
    if (!b.p2) { ctx.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 30; i++) { circle(-22 + (i * 13) % 44, -16 + (i * 7) % 50, 1); ctx.fill(); } }
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-9, -22); ctx.quadraticCurveTo(0, -14, 9, -22); ctx.stroke();
    ctx.fillStyle = '#111'; ctx.fillRect(-26, 32, 52, 6); ctx.fillStyle = '#9aa0a8'; ctx.fillRect(-4, 32, 8, 6);
    // arms: big shoulders, blue gloves, holding the shilajit rope
    const raise = b.pose > 0 && b.pushup <= 0;
    const sleeve = b.p2 ? '#151517' : skin;
    const lh = raise ? [-24, -62] : [-20, 18], rh = raise ? [24, -62] : [20, 18];
    const le = raise ? [-40, -30] : [-40, 4], re = raise ? [40, -30] : [40, 4];
    limb(-30, -14, le[0], le[1], 15, sleeve); limb(le[0], le[1], lh[0], lh[1], 12, sleeve);
    limb(30, -14, re[0], re[1], 15, sleeve); limb(re[0], re[1], rh[0], rh[1], 12, sleeve);
    if (!b.p2) { ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(-35, -6, 9, 7, .9, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(35, -6, 9, 7, -.9, 0, TAU); ctx.fill(); }
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (raise) { ctx.moveTo(lh[0], lh[1]); ctx.quadraticCurveTo(0, -96, rh[0], rh[1]); }
    else { ctx.moveTo(lh[0], lh[1]); ctx.quadraticCurveTo(0, 50, rh[0], rh[1]); }
    ctx.lineWidth = 10; ctx.strokeStyle = '#120c08'; ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.stroke();
    ctx.fillStyle = glove; circle(lh[0], lh[1], 7.5); ctx.fill(); circle(rh[0], rh[1], 7.5); ctx.fill();
    // head: buzz cut and a big full beard, no face drawn
    ctx.fillStyle = skin; roundRect(-7, -30, 14, 10, 3); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-16, -44, 3.5, 5, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(16, -44, 3.5, 5, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -44, 15.5, 18.5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(42,32,26,.88)'; ctx.beginPath(); ctx.ellipse(0, -55, 15.5, 9, 0, Math.PI, TAU); ctx.fill(); ctx.fillRect(-15.5, -56, 31, 3);
    ctx.fillStyle = '#2b1e16';
    ctx.beginPath(); ctx.moveTo(-15.5, -46); ctx.quadraticCurveTo(-20, -18, -8, -4); ctx.quadraticCurveTo(0, 2, 8, -4); ctx.quadraticCurveTo(20, -18, 15.5, -46); ctx.quadraticCurveTo(12, -35, 0, -35); ctx.quadraticCurveTo(-12, -35, -15.5, -46); ctx.fill();
    roundRect(-8, -39, 16, 4, 2); ctx.fill();
    ctx.restore();
  }
  function drawLecturer(b, t) {
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
  function drawApologist(b, t) {
    const skin = '#ebc4a5';
    const wave = b.pose > 0 ? Math.sin(t * 14) * 3 : 0;
    limb(28, -16, 42, -4, 11, skin);
    limb(42, -4, 38 + wave, -38, 10, skin);
    ctx.save(); ctx.translate(38 + wave, -46); ctx.rotate(0.12);
    roundRect(-3.2, -4, 6.4, 10, 1.2); ctx.fillStyle = '#d4a63a'; ctx.fill();
    ctx.fillStyle = '#b8892a'; ctx.fillRect(-3.2, -1, 6.4, 1.4);
    ctx.beginPath(); ctx.moveTo(-2.5, -4); ctx.lineTo(-2.5, -11); ctx.lineTo(2.5, -14); ctx.lineTo(2.5, -4); ctx.closePath(); ctx.fillStyle = '#d1123f'; ctx.fill();
    ctx.restore();
    ctx.fillStyle = skin; circle(38 + wave, -40, 6); ctx.fill();
    roundRect(-30, -24, 60, 24, 11); ctx.fillStyle = skin; ctx.fill();
    roundRect(-7, -32, 14, 10, 3); ctx.fill();
    limb(-28, -16, -40, 18, 12, skin);
    ctx.strokeStyle = '#3c4a52'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-33, -6); ctx.lineTo(-36, 2); ctx.moveTo(-31, 0); ctx.quadraticCurveTo(-36, 6, -38, 4); ctx.moveTo(-35, 8); ctx.lineTo(-38, 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-24, -8); ctx.quadraticCurveTo(0, -2, 24, -8); ctx.lineTo(27, 30); ctx.lineTo(-27, 30); ctx.closePath();
    ctx.fillStyle = '#f2a7bd'; ctx.fill();
    ctx.save(); ctx.clip(); ctx.fillStyle = '#3a1f28';
    for (let y = -6; y < 30; y += 7) for (let x = -26 + ((y / 7) % 2) * 3.5; x < 28; x += 7) { circle(x, y, 1.3); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle = '#151515';
    for (let x = -22; x <= 22; x += 5.5) { circle(x, -8 + 3 * (1 - (x / 24) ** 2), 2.6); ctx.fill(); }
    limb(-15, -6, -14, -22, 1.6, '#151515'); limb(15, -6, 14, -22, 1.6, '#151515');
    ctx.strokeStyle = '#c9c9c9'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-8, -24); ctx.quadraticCurveTo(0, -12, 8, -24); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-42, 22); ctx.lineTo(42, 22); ctx.lineTo(36, 70); ctx.lineTo(-36, 70); ctx.closePath();
    const pg = ctx.createLinearGradient(0, 22, 0, 70); pg.addColorStop(0, '#4a3324'); pg.addColorStop(1, '#2b1d14'); ctx.fillStyle = pg; ctx.fill();
    ctx.fillStyle = '#5a4030'; ctx.fillRect(-46, 18, 92, 7);
    roundRect(-30, 32, 60, 26, 3); ctx.fillStyle = '#f6e3b4'; ctx.fill();
    txt('THE HONEY', 0, 40, 8, '#2a1606', 900); txt('DILEMMA', 0, 50, 9, '#c8102e', 900, 'Gluten, cursive');
    ctx.fillStyle = skin; circle(-40, 21, 5.5); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-15, -46, 3, 4.5, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(15, -46, 3, 4.5, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -47, 14.5, 17.5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(107,74,46,.45)';
    ctx.beginPath(); ctx.moveTo(-14, -45); ctx.quadraticCurveTo(-14, -28, 0, -29.5); ctx.quadraticCurveTo(14, -28, 14, -45); ctx.quadraticCurveTo(10, -37, 0, -37); ctx.quadraticCurveTo(-10, -37, -14, -45); ctx.fill();
    ctx.fillStyle = 'rgba(92,62,38,.85)'; roundRect(-4, -36, 8, 6, 3); ctx.fill(); roundRect(-6, -39.5, 12, 2.5, 1.2); ctx.fill();
    ctx.fillStyle = '#6b4a2e';
    ctx.beginPath(); ctx.moveTo(-14, -52); ctx.quadraticCurveTo(-15, -66, 0, -66); ctx.quadraticCurveTo(15, -66, 14, -52); ctx.quadraticCurveTo(9, -60, 0, -60); ctx.quadraticCurveTo(-9, -60, -14, -52); ctx.fill();
    for (const x of [-12.5, 1.5]) {
      roundRect(x, -52, 11, 8, 2.5);
      const lg = ctx.createLinearGradient(x, -52, x + 11, -44);
      if (b.p2) { lg.addColorStop(0, '#ffd0d0'); lg.addColorStop(.5, '#ffffff'); lg.addColorStop(1, '#ff8a8a'); }
      else { lg.addColorStop(0, '#e9f3ff'); lg.addColorStop(.5, '#ffffff'); lg.addColorStop(1, '#bcd3ee'); }
      ctx.fillStyle = lg; ctx.fill(); ctx.lineWidth = 1.3; ctx.strokeStyle = '#4a4f57'; ctx.stroke();
    }
    limb(-1.5, -49, 1.5, -49, 1.3, '#4a4f57');
  }
  function drawDisprover(b, t) {
    const skin = '#b98a63';
    if (b.p2) {
      const g = ctx.createRadialGradient(0, 78, 4, 0, 78, 70); g.addColorStop(0, 'rgba(255,154,60,.55)'); g.addColorStop(1, 'rgba(255,154,60,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 80, 70, 16, 0, 0, TAU); ctx.fill();
      ctx.translate(0, Math.sin(t * 3) * 5 - 6);
    }
    roundRect(-34, -20, 68, 50, 14); ctx.fillStyle = '#121214'; ctx.fill();
    ctx.fillStyle = '#26262b'; ctx.beginPath(); ctx.moveTo(-9, -20); ctx.lineTo(0, -10); ctx.lineTo(-2, -20); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(9, -20); ctx.lineTo(0, -10); ctx.lineTo(2, -20); ctx.closePath(); ctx.fill();
    roundRect(-40, 2, 20, 22, 8); ctx.fillStyle = '#18181c'; ctx.fill(); roundRect(20, 2, 20, 22, 8); ctx.fill();
    ctx.fillStyle = skin; roundRect(-6, -28, 12, 10, 3); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-17, -44, 3.5, 5, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(17, -44, 3.5, 5, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -44, 16.5, 19, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#141010';
    ctx.beginPath(); ctx.moveTo(-16.5, -47); ctx.quadraticCurveTo(-21, -20, -10, -8); ctx.quadraticCurveTo(0, -1, 10, -8); ctx.quadraticCurveTo(21, -20, 16.5, -47); ctx.quadraticCurveTo(13, -36, 0, -36); ctx.quadraticCurveTo(-13, -36, -16.5, -47); ctx.fill();
    roundRect(-8, -40, 16, 4, 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -58, 16.5, 8, 0, Math.PI, TAU); ctx.fill();
    ctx.fillRect(-16.5, -59, 3, 10); ctx.fillRect(13.5, -59, 3, 10);
    const dg = ctx.createLinearGradient(0, 20, 0, 70); dg.addColorStop(0, '#6b4329'); dg.addColorStop(1, '#3f2615');
    roundRect(-62, 24, 124, 46, 4); ctx.fillStyle = dg; ctx.fill();
    roundRect(-67, 18, 134, 9, 3); ctx.fillStyle = '#7a4d2f'; ctx.fill();
    ctx.strokeStyle = '#2e1a0e'; ctx.lineWidth = 2; roundRect(-54, 33, 108, 30, 4); ctx.stroke();
    for (const x of [-34, 0, 34]) {
      ctx.beginPath(); ctx.arc(x, 48, 8, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(x - 8, 48, 5, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + 8, 48, 5, Math.PI / 2, Math.PI * 1.5); ctx.stroke();
    }
    roundRect(-56, 4, 26, 15, 2); ctx.fillStyle = '#d9542b'; ctx.fill();
    ctx.fillStyle = '#f6e3b4'; ctx.fillRect(-56, 4, 3, 15);
    txt('READ MY', -42, 9, 4.6, '#fff', 900); txt('BOOK', -42, 14.5, 5.5, '#fff', 900);
    roundRect(36, 2, 13, 16, 3); ctx.fillStyle = '#3d6fb6'; ctx.fill();
    ctx.strokeStyle = '#3d6fb6'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(50, 10, 4, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(38, 4, 2, 11);
    const wob = b.pose > 0 ? Math.sin(t * 20) * 2 : 0;
    roundRect(-8 + wob, 10, 16, 9, 2); ctx.fillStyle = '#d4352b'; ctx.fill();
    ctx.fillStyle = skin; circle(-12 + wob, 17, 6); ctx.fill(); circle(12 + wob, 17, 6); ctx.fill();
  }
  function drawLooks(b, t) {
    const p2 = b.p2, act = b.pose > 0;
    const skin = p2 ? '#e2705c' : '#f2d0b4', skinD = p2 ? '#b0473a' : '#d6a689', skinL = p2 ? '#f7a593' : '#fde8d8', tee = '#141416', vein = '#701810';
    if (p2) {
      const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 105); g.addColorStop(0, 'rgba(255,70,40,.32)'); g.addColorStop(1, 'rgba(255,70,40,0)');
      ctx.fillStyle = g; circle(0, 0, 105); ctx.fill();
      ctx.translate(0, -4); ctx.scale(1.12, 1.12); // he swells
    }
    // joggers and white trainers
    ctx.fillStyle = '#25252a'; roundRect(-21, 34, 18, 32, 5); ctx.fill(); roundRect(3, 34, 18, 32, 5); ctx.fill();
    ctx.fillStyle = '#f2f2ee'; roundRect(-24, 63, 23, 8, 4); ctx.fill(); roundRect(1, 63, 23, 8, 4); ctx.fill();
    // traps and a neck far too big for his head
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.moveTo(-11, -42); ctx.quadraticCurveTo(-24, -31, -46, -20); ctx.lineTo(46, -20); ctx.quadraticCurveTo(24, -31, 11, -42); ctx.closePath(); ctx.fill();
    roundRect(-12, -46, 24, 28, 7); ctx.fill();
    ctx.strokeStyle = p2 ? vein : skinD; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-8, -38); ctx.quadraticCurveTo(-5, -29, -2, -22); ctx.moveTo(8, -38); ctx.quadraticCurveTo(5, -29, 2, -22); ctx.stroke();
    ctx.strokeStyle = skinL; ctx.lineWidth = 1.6; // collarbones
    ctx.beginPath(); ctx.moveTo(-6, -21); ctx.quadraticCurveTo(-20, -25, -34, -21); ctx.moveTo(6, -21); ctx.quadraticCurveTo(20, -25, 34, -21); ctx.stroke();
    // torso: a V-taper in a black tee two sizes too small
    const torso = () => { ctx.beginPath(); ctx.moveTo(-47, -18); ctx.quadraticCurveTo(-49, 8, -25, 36); ctx.lineTo(25, 36); ctx.quadraticCurveTo(49, 8, 47, -18); ctx.quadraticCurveTo(24, -21, 9, -20); ctx.quadraticCurveTo(0, -12, -9, -20); ctx.quadraticCurveTo(-24, -21, -47, -18); ctx.closePath(); };
    torso(); ctx.fillStyle = tee; ctx.fill();
    ctx.save(); torso(); ctx.clip();
    if (p2) { // the shirt rips
      ctx.fillStyle = skin;
      ctx.beginPath(); ctx.moveTo(-7, -22); ctx.lineTo(-13, -8); ctx.lineTo(-7, 0); ctx.lineTo(-15, 12); ctx.lineTo(-8, 22); ctx.lineTo(-14, 40); ctx.lineTo(14, 40); ctx.lineTo(9, 24); ctx.lineTo(16, 12); ctx.lineTo(8, 2); ctx.lineTo(14, -9); ctx.lineTo(7, -22); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-50, -4); ctx.lineTo(-38, 3); ctx.lineTo(-44, 12); ctx.lineTo(-50, 10); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(50, 6); ctx.lineTo(37, 12); ctx.lineTo(43, 21); ctx.lineTo(50, 19); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = skinD; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(-10, -5); ctx.quadraticCurveTo(0, 1, 10, -5); ctx.moveTo(0, 2); ctx.lineTo(0, 36); for (const y of [12, 20, 28]) { ctx.moveTo(-7, y); ctx.lineTo(7, y); } ctx.stroke();
    } else { // so tight you can see every muscle through it
      ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(-34, -6); ctx.quadraticCurveTo(-17, 6, -1, -4); ctx.moveTo(34, -6); ctx.quadraticCurveTo(17, 6, 1, -4); ctx.moveTo(0, 2); ctx.lineTo(0, 34); for (const y of [13, 21, 29]) { ctx.moveTo(-8, y); ctx.lineTo(8, y); } ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = '#e8c547'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-11, -30); ctx.quadraticCurveTo(0, -12, 11, -30); ctx.stroke(); // gold chain
    const arm = (sx, ex, ey, hx, hy, bx, by, br) => {
      const ang = Math.atan2(ey + 15, ex - sx);
      limb(sx, -15, ex, ey, 19, skin); limb(ex, ey, hx, hy, 15, skin);
      ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(bx, by, 12 * br, 9 * br, ang, 0, TAU); ctx.fill();
      ctx.fillStyle = skinL; ctx.globalAlpha = .5; ctx.beginPath(); ctx.ellipse(bx - 2, by - 3, 5 * br, 2.5 * br, ang, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      if (p2) { ctx.strokeStyle = vein; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(sx * 1.02, -10); ctx.quadraticCurveTo(bx + 4, by + 4, ex, ey); ctx.quadraticCurveTo((ex + hx) / 2 + 3, (ey + hy) / 2, hx, hy); ctx.stroke(); }
      else limb(sx, -16, sx + (ex - sx) * 0.35, -16 + (ey + 16) * 0.35, 23, tee); // tight sleeve
      ctx.fillStyle = skin; circle(hx, hy, 6.5); ctx.fill();
    };
    // left arm holds the selfie stick: he's live
    arm(-44, -60, 6, -66, -20, -53, -6, 1);
    ctx.strokeStyle = '#2a2a30'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-66, -22); ctx.lineTo(-78, -56); ctx.stroke();
    ctx.save(); ctx.translate(-80, -66); ctx.rotate(-0.3);
    roundRect(-10, -16, 20, 32, 4); ctx.fillStyle = '#0d0d10'; ctx.fill();
    roundRect(-8, -13, 16, 26, 2); ctx.fillStyle = '#1d2230'; ctx.fill();
    roundRect(-7, -11, 14, 7, 2); ctx.fillStyle = '#e8142c'; ctx.fill();
    txt('LIVE', 0, -7.4, 5, '#ffffff', 900);
    txt(fmtViewers(chat ? chat.viewers : 40000), 0, 3, 4.6, '#ffffff', 800, '"Instrument Sans", sans-serif', 14);
    ctx.restore();
    // right arm flexes, or throws
    if (act) arm(44, 62, 8, 76, 22, 54, -3, 0.9);
    else arm(44, 62, -2, 58, -30, 54, -12, 1.12 * (1 + 0.07 * Math.sin(t * 3)));
    // head: a razor-sharp diamond jaw, hollow cheeks from mewing, and no face at all
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.ellipse(-16.5, -55, 3, 5, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(16.5, -55, 3, 5, 0, 0, TAU); ctx.fill();
    const head = () => { ctx.beginPath(); ctx.moveTo(-15, -61); ctx.quadraticCurveTo(-15, -77, 0, -77); ctx.quadraticCurveTo(15, -77, 15, -61); ctx.lineTo(17.5, -53); ctx.lineTo(15.5, -43); ctx.lineTo(0, -30); ctx.lineTo(-15.5, -43); ctx.lineTo(-17.5, -53); ctx.closePath(); };
    head(); ctx.fill();
    ctx.save(); head(); ctx.clip();
    ctx.fillStyle = skinD; ctx.globalAlpha = .6;
    ctx.beginPath(); ctx.moveTo(-16, -51); ctx.quadraticCurveTo(-8, -47, -10.5, -38); ctx.lineTo(-16, -43); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(16, -51); ctx.quadraticCurveTo(8, -47, 10.5, -38); ctx.lineTo(16, -43); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = skinL; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-15.5, -53); ctx.lineTo(-9, -51); ctx.moveTo(15.5, -53); ctx.lineTo(9, -51); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = skinD; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(-17.5, -53); ctx.lineTo(-15.5, -43); ctx.lineTo(0, -30); ctx.lineTo(15.5, -43); ctx.lineTo(17.5, -53); ctx.stroke();
    ctx.fillStyle = '#24170e'; // slicked-back quiff
    ctx.beginPath(); ctx.moveTo(-15.5, -59); ctx.quadraticCurveTo(-17, -75, -6, -80); ctx.quadraticCurveTo(10, -85, 17, -73); ctx.quadraticCurveTo(17, -65, 15.5, -59); ctx.quadraticCurveTo(8, -67, 0, -66); ctx.quadraticCurveTo(-9, -66, -15.5, -59); ctx.closePath(); ctx.fill();
  }
  // the giant hornet, side on, faceless: orange head, dark thorax, banded abdomen, a big stinger
  function hornetWing(flap) {
    ctx.fillStyle = 'rgba(235,225,200,.38)'; ctx.strokeStyle = 'rgba(255,240,210,.6)'; ctx.lineWidth = 1.2;
    ctx.save(); ctx.rotate(-0.5 + flap); ctx.beginPath(); ctx.ellipse(-26, -6, 38, 12, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  function hornetAbdomen() {
    const ab = () => { ctx.beginPath(); ctx.moveTo(-6, -16); ctx.bezierCurveTo(-34, -26, -70, -20, -82, 2); ctx.bezierCurveTo(-70, 22, -34, 26, -6, 16); ctx.closePath(); };
    ab(); ctx.fillStyle = '#f2a516'; ctx.fill();
    ctx.save(); ab(); ctx.clip(); ctx.fillStyle = '#3a2410'; for (let i = 0; i < 4; i++) ctx.fillRect(-20 - i * 16, -30, 7, 60); ctx.restore();
    ctx.fillStyle = '#2a1606'; ctx.beginPath(); ctx.moveTo(-80, -3); ctx.lineTo(-98, 1); ctx.lineTo(-80, 5); ctx.closePath(); ctx.fill(); // stinger
  }
  function hornetThorax() { ctx.fillStyle = '#3a2410'; ctx.beginPath(); ctx.ellipse(8, -2, 18, 15, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,190,120,.18)'; ctx.beginPath(); ctx.ellipse(5, -8, 9, 4, 0, 0, TAU); ctx.fill(); }
  function hornetHead() { // plain, no face
    ctx.fillStyle = '#f08a1c'; ctx.beginPath(); ctx.ellipse(36, -2, 15, 14, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(44, -12); ctx.quadraticCurveTo(52, -26, 62, -26); ctx.moveTo(40, -14); ctx.quadraticCurveTo(44, -30, 54, -34); ctx.stroke();
  }
  function hornetLegs(t) {
    ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) { const sw = Math.sin(t * 6 + i) * 3; ctx.beginPath(); ctx.moveTo(i * 9, 10); ctx.lineTo(i * 9 - 8 + sw, 26); ctx.lineTo(i * 9 - 2 + sw, 36); ctx.stroke(); }
    ctx.strokeStyle = '#e0913a'; ctx.lineWidth = 2.4;
    for (let i = 0; i < 3; i++) { const sw = Math.sin(t * 6 + i) * 3; ctx.beginPath(); ctx.moveTo(i * 9 - 2 + sw, 36); ctx.lineTo(i * 9 + 2 + sw, 40); ctx.stroke(); }
  }
  function drawHornetBody(t, flap) {
    ctx.save(); ctx.translate(6, -10); hornetWing(flap); ctx.restore();
    hornetLegs(t); hornetAbdomen(); hornetThorax(); hornetHead();
    ctx.save(); ctx.translate(12, -12); hornetWing(-flap * 0.8 - 0.2); ctx.restore();
  }
  function drawHornet(b, t) {
    ctx.save(); if (spoon.x < b.x) ctx.scale(-1, 1); // faces your spoon
    ctx.translate(0, Math.sin(t * 9) * 3);
    drawHornetBody(t, Math.sin(t * 52) * 0.4);
    if (b.stun > 0) { ctx.scale(spoon.x < b.x ? -1 : 1, 1); for (let i = 0; i < 3; i++) { const a = t * 4 + i * 2.1; txt('*', Math.cos(a) * 34, -52 + Math.sin(a) * 8, 26, '#ffd36b', 900); } }
    ctx.restore();
  }
  function drawPart(part) { // one tumbling piece of a dead hornet or queen
    if (part === 'hwing') hornetWing(0);
    else if (part === 'habdomen') { ctx.translate(40, 0); hornetAbdomen(); }
    else if (part === 'hthorax') { ctx.translate(-8, 0); hornetThorax(); }
    else if (part === 'hhead') { ctx.translate(-36, 0); hornetHead(); }
    else if (part === 'qwing') { ctx.fillStyle = 'rgba(235,245,255,.42)'; ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, 0, 24, 8.5, 0, 0, TAU); ctx.fill(); ctx.stroke(); }
    else if (part === 'qabdomen') {
      const abd = () => { ctx.beginPath(); ctx.moveTo(30, -8); ctx.bezierCurveTo(8, -10, -14, -6, -28, 0); ctx.bezierCurveTo(-14, 6, 8, 10, 30, 8); ctx.closePath(); };
      abd(); ctx.fillStyle = '#e8b040'; ctx.fill(); ctx.save(); abd(); ctx.clip(); ctx.fillStyle = '#9a560e'; for (let i = 0; i < 5; i++) ctx.fillRect(20 - i * 10, -11, 4.5, 22); ctx.restore();
    }
    else if (part === 'babdomen') {
      ctx.fillStyle = '#f2c94c'; ctx.beginPath(); ctx.ellipse(0, 0, 13, 9, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#2a1606'; for (let i = 0; i < 3; i++) ctx.fillRect(-8 + i * 6, -8, 3, 16);
    }
    else if (part === 'bhead') { ctx.fillStyle = '#2a1606'; ctx.beginPath(); ctx.ellipse(0, 0, 6.5, 6, 0, 0, TAU); ctx.fill(); }
    else if (part === 'qthorax') { ctx.fillStyle = '#b8761a'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 9, 0, 0, TAU); ctx.fill(); }
    else if (part === 'qhead') {
      ctx.fillStyle = '#d99a22'; ctx.beginPath(); ctx.ellipse(0, 0, 7, 6.5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffd700'; ctx.strokeStyle = '#a8700f'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-6, -5); ctx.lineTo(-6, -14); ctx.lineTo(-3, -10); ctx.lineTo(0, -16); ctx.lineTo(3, -10); ctx.lineTo(6, -14); ctx.lineTo(6, -5); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }
  function drawGore() {
    for (const g of gore) { ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(g.rot); ctx.scale(g.flip ? -g.sc : g.sc, g.sc); ctx.globalAlpha = Math.min(1, g.life * 1.5); drawPart(g.part); ctx.restore(); }
    ctx.globalAlpha = 1;
  }
  function drawBigSting(p, t) {
    if (!p.fired) { // the warning line: amber while it follows you, red once it's locked
      const L = Math.hypot(W, H), ex = p.x + Math.cos(p.ang) * L, ey = p.y + Math.sin(p.ang) * L;
      ctx.setLineDash([12, 9]); ctx.lineWidth = p.locked ? 4 : 2.5; ctx.strokeStyle = p.locked ? `rgba(226,32,48,${0.6 + 0.4 * Math.sin(t * 30)})` : 'rgba(255,170,60,.55)';
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(ex, ey); ctx.stroke(); ctx.setLineDash([]);
    } else {
      const g = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 34 * G); g.addColorStop(0, 'rgba(226,32,48,.35)'); g.addColorStop(1, 'rgba(226,32,48,0)');
      ctx.fillStyle = g; circle(p.x, p.y, 34 * G); ctx.fill();
    }
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.ang); ctx.scale(2.3 * G, 2.3 * G);
    ctx.fillStyle = '#2a1606'; ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(-8, -4); ctx.lineTo(-8, 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f2a516'; ctx.fillRect(-13, -3.5, 6, 7); ctx.fillStyle = '#9be36b'; circle(13, 0, 1.6); ctx.fill(); // a drop of venom on the tip
    ctx.restore();
  }
  function drawGapMark(p, t) { // shows where the gap in the stinger curtain will be
    const a = Math.min(1, p.t * 4) * Math.max(0, Math.min(1, (p.life - p.t) * 2)) * (0.55 + 0.25 * Math.sin(t * 10));
    ctx.globalAlpha = a; ctx.fillStyle = 'rgba(255,214,107,.16)'; ctx.fillRect(p.x - p.w / 2, p.y, p.w, H - p.y);
    ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = 2; ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.moveTo(p.x - p.w / 2, p.y); ctx.lineTo(p.x - p.w / 2, H); ctx.moveTo(p.x + p.w / 2, p.y); ctx.lineTo(p.x + p.w / 2, H); ctx.stroke(); ctx.setLineDash([]);
    outlined('GAP', p.x, p.y + 26, 18, '#ffd36b'); ctx.globalAlpha = 1;
  }
  function drawScout(p, t) {
    const k = bossK(), dv = p.dive;
    if (dv && dv.st === 'tele') { ctx.setLineDash([10, 8]); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,154,60,.8)'; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(dv.tx, dv.ty); ctx.stroke(); ctx.setLineDash([]); circle(dv.tx, dv.ty, 20); ctx.stroke(); }
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale((spoon.x < p.x ? -1 : 1) * 0.5 * k, 0.5 * k);
    drawHornetBody(t, Math.sin(p.ph) * 0.4); ctx.restore();
    const w = 46 * k; ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(p.x - w / 2, p.y - 34 * k, w, 5); ctx.fillStyle = '#c8102e'; ctx.fillRect(p.x - w / 2, p.y - 34 * k, w * Math.max(0, p.hp / p.max), 5);
  }
  function drawNest(p, t) {
    const k = p.r / 26;
    ctx.save(); ctx.translate(p.x, p.y);
    ctx.strokeStyle = '#8a7a5a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -p.r); ctx.lineTo(0, combBottom() - p.y); ctx.stroke(); // hanging from the comb
    ctx.fillStyle = '#cfc3a8'; ctx.beginPath(); ctx.ellipse(0, 0, 24 * k, 30 * k, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#a89878'; ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.ellipse(0, i * 9 * k, 22 * k * Math.cos(i * 0.35), 4 * k, 0, 0, Math.PI); ctx.stroke(); }
    ctx.fillStyle = '#2a1606'; ctx.beginPath(); ctx.ellipse(0, 24 * k, 6 * k, 4 * k, 0, 0, TAU); ctx.fill(); // the entrance
    const w = 44 * k; ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(-w / 2, -p.r - 12, w, 5); ctx.fillStyle = '#c8102e'; ctx.fillRect(-w / 2, -p.r - 12, w * Math.max(0, p.hp / p.max), 5);
    ctx.restore();
  }
  const BOSS_DRAW = { keeper: drawKeeper, colonex: drawColonex, ceo: drawCEO, lecturer: drawLecturer, ironfit: drawIronfit, apologist: drawApologist, looks: drawLooks, disprover: drawDisprover, hornet: drawHornet };

  function drawBoss(b, t) {
    if (b.done) return;
    const k = bossK();
    if (b.mode === 'dash' && b.dash && b.dash.st === 'tele') {
      const d = b.dash, pulse = .5 + .5 * Math.sin(t * 20);
      ctx.setLineDash([10, 8]); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(126,200,255,${.5 + pulse * .4})`;
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(d.tx, d.ty); ctx.stroke(); ctx.setLineDash([]);
      circle(d.tx, d.ty, 26); ctx.stroke();
    }
    ctx.save();
    ctx.translate(b.x + (b.hurt > 0 ? rnd(-3, 3) : 0), b.y);
    ctx.rotate(b.rot);
    ctx.globalAlpha = b.alpha * (brawlWaiting(b) ? 0.62 : 1); // the ones waiting their turn are faded
    ctx.scale(k * b.scale, k * b.scale);
    const glow = ctx.createRadialGradient(0, 0, 10, 0, 0, 95);
    glow.addColorStop(0, b.hurt > 0 ? 'rgba(255,120,90,.35)' : b.p2 ? 'rgba(255,90,60,.22)' : 'rgba(255,200,90,.16)'); glow.addColorStop(1, 'rgba(255,200,90,0)');
    ctx.fillStyle = glow; circle(0, 0, 95); ctx.fill();
    BOSS_DRAW[b.def.key](b, t);
    ctx.restore();
    ctx.globalAlpha = 1;
  }
  function drawSpeech(b) {
    if (!b.say || b.done) return;
    const k = bossK() * b.scale;
    ctx.globalAlpha = Math.min(1, b.say.t * 4) * Math.max(b.alpha, b.def.joins || b.gone ? 1 : 0);
    const narrow = W < 560, two = b.n > 1;
    const o = { maxW: b.brawl ? Math.min(250, W * 0.44) : two ? Math.min(300, W * 0.46) : narrow ? W * 0.82 : Math.min(360, W * 0.5), discord: b.def.key === 'colonex', minY: combBottom() + 34, avoid: allyBox };
    if (two && !b.brawl) { o.lo = b.slot ? W / 2 + 4 : 8; o.hi = b.slot ? W - 8 : W / 2 - 4; }
    if ((narrow || two) && b.mode !== 'down') speechBox(b.say.text, b.x, b.y + 74 * k, 'below', o);
    else if (b.x < W / 2) speechBox(b.say.text, b.x + 52 * k, b.y - 38 * k, 'right', o);
    else speechBox(b.say.text, b.x - 52 * k, b.y - 38 * k, 'left', o);
    ctx.globalAlpha = 1;
  }
  function drawAlly(t) {
    if (!ally || !anyFighting()) return;
    const k = Math.max(0.42, bossK() * 0.55);
    ctx.save(); ctx.translate(ally.x, ally.y); ctx.scale(k, k);
    drawColonexFigure({ pose: ally.shootT > 2.4 ? 1 : 0 }, t, false);
    if (ally.stun > 0) for (let i = 0; i < 3; i++) { const a = t * 4 + i * 2.1; txt('*', Math.cos(a) * 26, -96 + Math.sin(a) * 6, 22, '#ffd36b', 900); } // stung
    ctx.save(); ctx.translate(14, -84); drawCrow(t, 0.75, false); ctx.restore();
    ctx.restore();
  }
  let allyBox = null;
  function drawAllySpeech() {
    allyBox = null;
    if (!ally || !ally.say || !anyFighting()) return;
    const k = Math.max(0.42, bossK() * 0.55);
    ctx.globalAlpha = Math.min(1, ally.say.t * 4);
    allyBox = speechBox(ally.say.text, ally.x + 14 * k, ally.y - 34 * k, 'right', { small: true, maxW: Math.min(240, W * 0.6), discord: true });
    ctx.globalAlpha = 1;
  }
  function drawBossUI(b) {
    if (b.done) return;
    const two = b.n > 1;
    if (b.mode === 'intro') {
      if (b.slot || b.quiet) return; // one banner for both (and none for the ones that join later)
      const t = b.t, a = Math.min(1, t / 0.3) * Math.min(1, Math.max(0, (2.9 - t) / 0.4));
      if (a <= 0) return;
      ctx.globalAlpha = a;
      const bh = 108, y = Math.min(H * 0.5, H - bh - 90) + 10;
      ctx.fillStyle = 'rgba(20,10,4,.88)'; ctx.fillRect(0, y, W, bh);
      ctx.fillStyle = '#c8102e'; ctx.fillRect(0, y, W, 3); ctx.fillRect(0, y + bh - 3, W, 3);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#f2a516'; ctx.font = '700 12px "Instrument Sans", sans-serif';
      const label = b.brawl ? 'EVERYONE AT ONCE  ·  JUST FOR FUN'
        : two ? 'CRAZY MODE  ·  ROUND ' + (endlessRound + 1)
        : b.endless ? 'ENDLESS  ·  ROUND ' + (endlessRound + 1)
        : b.i === BOSS_COUNT - 1 ? 'FINAL BOSS  ·  ' + SEASONS[b.i].m.toUpperCase()
        : 'BOSS ' + (b.i + 1) + ' OF ' + BOSS_COUNT + '  ·  ' + SEASONS[b.i].m.toUpperCase();
      ctx.fillText(label, W / 2, y + 22);
      const name = b.brawl ? 'All ' + BOSS_COUNT + ' bosses' : two ? bosses.map(x => x.def.tag).join(' & ') : b.def.name;
      const sub = b.brawl ? (brawl && brawl.queue.length ? 'The rest wait their turn. Nothing lost if you drop.' : 'Nothing is lost if you drop. Colonex is with them.') : two ? (bosses.some(x => x.def.key === 'colonex') ? 'Two at once. Colonex has switched sides.' : 'Two at once. Colonex is still on your side.') : b.def.sub;
      fitFont(name, 38, 900, 'Gluten, cursive', W - 32);
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.strokeText(name, W / 2, y + 55);
      ctx.fillStyle = '#f6e3b4'; ctx.fillText(name, W / 2, y + 55);
      ctx.fillStyle = 'rgba(246,227,180,.75)'; ctx.font = '600 13px "Instrument Sans", sans-serif';
      ctx.fillText(sub, W / 2, y + 86, W - 32);
      ctx.globalAlpha = 1;
      return;
    }
    if (b.mode === 'down') return;
    const bw = b.brawl && brawl, w = bw ? laneW() * 0.88 : two ? Math.min(220, W * 0.42) : Math.min(300, W * 0.64), cx = bw ? laneX(b.slot, 0.5) : two ? (b.slot ? W * 0.74 : W * 0.26) : W / 2, x = cx - w / 2, y = combBottom() + 10;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const name = (two ? b.def.tag : b.def.name) + (bw ? (b.p3 ? ' · P3' : b.p2 ? ' · P2' : '') : b.p3 ? '  ·  PHASE 3' : b.p2 ? '  ·  PHASE 2' : '');
    if (brawlWaiting(b)) ctx.globalAlpha = 0.6;
    fitFont(name, bw ? 12 : two ? 13 : 15, 700, 'Gluten, cursive', w);
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(29,17,8,.85)'; ctx.strokeText(name, cx, y + 6);
    ctx.fillStyle = '#f6e3b4'; ctx.fillText(name, cx, y + 6);
    ctx.fillStyle = 'rgba(0,0,0,.45)'; roundRect(x, y + 16, w, 10, 5); ctx.fill();
    ctx.fillStyle = b.p2 ? '#ff5a3c' : '#c8102e'; roundRect(x, y + 16, Math.max(6, w * b.hp / b.max), 10, 5); ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(246,227,180,.5)'; roundRect(x, y + 16, w, 10, 5); ctx.stroke();
    ctx.fillStyle = 'rgba(246,227,180,.4)'; ctx.fillRect(cx - 1, y + 14, 2, 14);
    if (b.def.p3at) { ctx.fillStyle = 'rgba(255,90,60,.85)'; ctx.fillRect(x + w * b.def.p3at - 1, y + 14, 2, 14); } // where the slaughter phase starts
    if (bw && !brawlWaiting(b)) { ctx.lineWidth = 2; ctx.strokeStyle = '#ffd36b'; roundRect(x - 2, y + 14, w + 4, 14, 7); ctx.stroke(); } // his turn to attack
    ctx.globalAlpha = 1;
    if (b.pushup > 0) outlined((bw ? 'PUSHUPS  ' : 'DAY 1 OF 500 PUSHUPS  ') + b.reps + '/500', cx, y + 44, two ? 12 : 16, '#ffd36b');
  }

  const fmtViewers = v => (v / 1000).toFixed(1) + 'K';
  function drawChat() { // drawn under everything else, so it never hides an attack
    if (!chat) return;
    const narrow = W < 640, fs = narrow ? 10.5 : 12, lh = Math.round(fs * 1.4), pad = 8, rows = narrow || brawl ? 4 : 8;
    const w = narrow ? Math.min(W * 0.56, 240) : Math.min(290, W * 0.27), x = narrow ? 8 : 12, top = brawl ? bossHome() + 84 * bossK() : combBottom() + (narrow ? 40 : 46); // below the row of bosses when everyone's here
    const lines = [];
    for (const m of chat.msgs) {
      ctx.font = `800 ${fs}px "Instrument Sans", sans-serif`; const hw = ctx.measureText(m.user + ': ').width;
      ctx.font = `600 ${fs}px "Instrument Sans", sans-serif`;
      wrap(m.text, Math.max(40, w - pad * 2 - hw)).forEach((l, j) => lines.push({ m, l, first: j === 0, hw }));
    }
    const shown = lines.slice(-rows), hh = lh + 8, h = hh + rows * lh + pad;
    ctx.fillStyle = 'rgba(14,12,18,.6)'; roundRect(x, top, w, h, 10); ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.stroke();
    roundRect(x + pad, top + 6, 34, lh - 2, 4); ctx.fillStyle = '#e8142c'; ctx.fill();
    txt('LIVE', x + pad + 17, top + 6 + (lh - 2) / 2 + 0.5, fs - 2, '#ffffff', 900);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = `700 ${fs - 1}px "Instrument Sans", sans-serif`; ctx.fillStyle = 'rgba(239,239,241,.85)';
    ctx.fillText(fmtViewers(chat.viewers) + ' watching', x + pad + 42, top + 6 + (lh - 2) / 2 + 0.5);
    let y = top + hh + pad / 2 + (rows - shown.length) * lh + lh / 2;
    for (const L of shown) {
      const m = L.m, tx = x + pad + L.hw;
      ctx.globalAlpha = m.banned ? 0.45 : 1;
      if (L.first) { ctx.font = `800 ${fs}px "Instrument Sans", sans-serif`; ctx.fillStyle = m.col; ctx.fillText(m.user + ':', x + pad, y); }
      ctx.font = `${m.mod ? 'italic 600' : '600'} ${fs}px "Instrument Sans", sans-serif`; ctx.fillStyle = m.mod ? '#9aa0a8' : '#efeff1';
      ctx.fillText(L.l, tx, y);
      if (m.banned) { ctx.strokeStyle = '#efeff1'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx, y); ctx.lineTo(tx + ctx.measureText(L.l).width, y); ctx.stroke(); }
      y += lh;
    }
    ctx.globalAlpha = 1;
  }
  function drawWorkerBees(t) {
    for (const b of bees) {
      ctx.save(); ctx.translate(b.x, b.y); ctx.scale(1.5 * G, 1.5 * G);
      drawBee(0, 0, t, b.ph, b.dir);
      ctx.restore();
    }
  }
  function drawPowerFx(t) {
    if (!spoon) return;
    if (spoon.mark > 0) { ctx.strokeStyle = `rgba(226,32,48,${0.5 + 0.4 * Math.sin(t * 12)})`; ctx.lineWidth = 3; circle(spoon.x, spoon.y - 10, spoonSize() * 0.75); ctx.stroke(); txt('MARKED', spoon.x, spoon.y - spoonSize() * 0.75 - 18, 11, '#ff5a3c', 900); }
    if (spoon.vstack > 0 && spoon.vstackT > 0) for (let i = 0; i < 3; i++) { ctx.fillStyle = i < spoon.vstack ? '#9be36b' : 'rgba(155,227,107,.25)'; circle(spoon.x - 14 + i * 14, spoon.y + 18, 5); ctx.fill(); }
    if (shieldHits > 0) { // a wax hexagon over the spoon, cracking as it soaks up hits
      const R = spoonSize() * 0.95, a = Math.min(1, shieldT * 2) * (0.75 + 0.25 * Math.sin(t * 5)), lost = shieldMax - shieldHits;
      ctx.save(); ctx.translate(spoon.x, spoon.y - spoonSize() * 0.32); ctx.globalAlpha = a;
      hexPath(0, 0, R); ctx.fillStyle = 'rgba(242,165,22,.16)'; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = '#ffd36b'; ctx.stroke();
      ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,211,107,.55)';
      for (let i = 0; i < 6; i++) { const an = Math.PI / 6 + i * Math.PI / 3; hexPath(Math.cos(an) * R * 0.52, Math.sin(an) * R * 0.52, R * 0.26); ctx.stroke(); }
      ctx.strokeStyle = '#7a4a0c'; ctx.lineWidth = 2;
      for (let i = 0; i < lost; i++) { const an = i * 2.1 + 0.4; ctx.beginPath(); ctx.moveTo(Math.cos(an) * R * 0.2, Math.sin(an) * R * 0.2); ctx.lineTo(Math.cos(an + 0.3) * R * 0.6, Math.sin(an + 0.3) * R * 0.6); ctx.lineTo(Math.cos(an - 0.1) * R * 0.98, Math.sin(an - 0.1) * R * 0.98); ctx.stroke(); }
      ctx.restore();
    }
    if (magnetT > 0) {
      const R = magR(), a = Math.min(1, magnetT * 2);
      ctx.globalAlpha = a;
      ctx.setLineDash([6, 8]); ctx.lineDashOffset = -t * 24; ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,211,107,.5)'; circle(spoon.x, spoon.y - 10, R); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
      const side = extractT > 0 || extractRun ? 30 * G : 0; // side by side with the extractor when both are on
      ctx.save(); ctx.translate(spoon.x - side, spoon.y - spoonSize() * 1.2 + Math.sin(t * 6) * 3); ctx.scale(G, G);
      ctx.lineCap = 'butt'; ctx.lineWidth = 9; ctx.strokeStyle = '#e2492f';
      ctx.beginPath(); ctx.moveTo(-12, -10); ctx.lineTo(-12, 0); ctx.arc(0, 0, 12, Math.PI, 0, true); ctx.lineTo(12, -10); ctx.stroke();
      ctx.strokeStyle = '#d9d9de'; ctx.beginPath(); ctx.moveTo(-12, -10); ctx.lineTo(-12, -17); ctx.moveTo(12, -10); ctx.lineTo(12, -17); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,211,107,.8)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) { const ph = (t * 1.5 + i / 3) % 1; ctx.globalAlpha = a * (1 - ph); ctx.beginPath(); ctx.arc(0, -14, 22 + ph * 18, -Math.PI * 0.8, -Math.PI * 0.2); ctx.stroke(); }
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    if (extractT > 0 || extractRun) { // spins while it runs; the number is how many pieces it still has to pull in
      const a = extractRun ? 1 : Math.min(1, extractT * 3), x = spoon.x + (magnetT > 0 ? 30 * G : 0), y = spoon.y - spoonSize() * 1.3;
      ctx.globalAlpha = a;
      for (const it of items) if (it.suck) { ctx.strokeStyle = 'rgba(255,211,107,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(it.suck.x0, it.suck.y0); ctx.lineTo(it.x, it.y); ctx.stroke(); }
      ctx.save(); ctx.translate(x, y); ctx.scale(G, G);
      circle(0, 0, 22); ctx.fillStyle = '#c9ced6'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#6a6e76'; ctx.stroke();
      ctx.save(); ctx.rotate(t * 20); ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 4); ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(18, 0); ctx.stroke(); }
      ctx.fillStyle = '#f2a516'; circle(0, 0, 5); ctx.fill();
      ctx.restore();
      if (extractRun) txt(extractRun.left === Infinity ? Math.max(0, Math.ceil(EXTRACT_ALL_TIME - extractRun.t)) + 's' : String(extractRun.left), 0, -36, 15, '#ffd36b', 800);
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }
  function drawQueen(x, y, ang, t, sc) {
    const flip = Math.cos(ang) < 0;
    ctx.save(); ctx.translate(x, y); ctx.rotate(flip ? ang + Math.PI : ang); ctx.scale(flip ? -sc : sc, sc);
    const flap = Math.sin(t * 46) * 0.35;
    ctx.fillStyle = 'rgba(235,245,255,.42)'; ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1; // see-through wings
    ctx.save(); ctx.translate(4, -7); ctx.rotate(-0.55 + flap); ctx.beginPath(); ctx.ellipse(-15, -6, 24, 8.5, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.translate(9, -6); ctx.rotate(-0.15 - flap); ctx.beginPath(); ctx.ellipse(-9, -8, 17, 6.5, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
    const abd = () => { ctx.beginPath(); ctx.moveTo(-5, -8); ctx.bezierCurveTo(-28, -10, -50, -6, -64, 0); ctx.bezierCurveTo(-50, 6, -28, 10, -5, 8); ctx.closePath(); };
    abd(); const ag = ctx.createLinearGradient(0, -10, 0, 10); ag.addColorStop(0, '#ffd86b'); ag.addColorStop(1, '#c8861a'); ctx.fillStyle = ag; ctx.fill(); // long, slim, gold and amber
    ctx.save(); abd(); ctx.clip(); ctx.fillStyle = '#9a560e'; for (let i = 0; i < 5; i++) ctx.fillRect(-15 - i * 10, -11, 4.5, 22); ctx.restore();
    ctx.fillStyle = '#6a3a0a'; ctx.beginPath(); ctx.moveTo(-63, -1.6); ctx.lineTo(-72, 0); ctx.lineTo(-63, 1.6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#6a3a0a'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-1, 7); ctx.lineTo(-8, 16); ctx.moveTo(4, 8); ctx.lineTo(2, 18); ctx.moveTo(9, 7); ctx.lineTo(13, 16); ctx.stroke();
    ctx.fillStyle = '#b8761a'; ctx.beginPath(); ctx.ellipse(4, 0, 11, 9, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,230,160,.4)'; ctx.beginPath(); ctx.ellipse(2, -3.5, 6, 3, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#d99a22'; ctx.beginPath(); ctx.ellipse(19, 0, 7, 6.5, 0, 0, TAU); ctx.fill(); // plain head, no face
    ctx.strokeStyle = '#6a3a0a'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(25, -2); ctx.quadraticCurveTo(31, -8, 36, -8); ctx.moveTo(24, -3); ctx.quadraticCurveTo(28, -11, 32, -14); ctx.stroke();
    ctx.fillStyle = '#ffd700'; ctx.strokeStyle = '#a8700f'; ctx.lineWidth = 1; // crown
    ctx.beginPath(); ctx.moveTo(13, -5); ctx.lineTo(13, -14); ctx.lineTo(16, -10); ctx.lineTo(19, -16); ctx.lineTo(22, -10); ctx.lineTo(25, -14); ctx.lineTo(25, -5); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e2203a'; circle(19, -8.5, 1.5); ctx.fill();
    ctx.restore();
  }
  function drawQueenFx(t) {
    if (!qd) return;
    if (qd.mode === 'boss' && qd.st === 'tele' && qd.tgt) { // her warning line
      const pulse = .5 + .5 * Math.sin(t * 22), tg = qd.tgt;
      ctx.setLineDash([12, 9]); ctx.lineDashOffset = -t * 60; ctx.lineWidth = 3; ctx.strokeStyle = `rgba(255,211,107,${.5 + pulse * .45})`;
      ctx.beginPath(); ctx.moveTo(qd.x, qd.y); ctx.lineTo(tg.x, tg.y); ctx.stroke();
      for (const ob of bosses.filter(fighting)) { circle(ob.x, ob.y, 44 * bossK()); ctx.stroke(); } // with two bosses the line runs through both
      ctx.setLineDash([]); ctx.lineDashOffset = 0;
    }
    drawQueen(qd.x, qd.y, qd.ang, t, queenScale());
  }
  function drawSmokeFx(t) {
    if (smokeT <= 0) return;
    const a = Math.min(1, smokeT * 2, (smokeDur - smokeT) * 4 + 0.2), top = combBottom();
    ctx.fillStyle = `rgba(214,208,196,${0.10 * a})`; ctx.fillRect(0, top, W, H - top);
    for (let i = 0; i < 7; i++) {
      const x = ((i * 173 + t * 25) % (W + 240)) - 120, y = top + 40 + (i * 97) % Math.max(1, (H - top) * 0.8), r = (70 + (i % 3) * 30) * G;
      const g = ctx.createRadialGradient(x, y, 1, x, y, r);
      g.addColorStop(0, `rgba(236,230,218,${0.2 * a})`); g.addColorStop(1, 'rgba(236,230,218,0)');
      ctx.fillStyle = g; circle(x, y, r); ctx.fill();
    }
  }
  function drawSpoon(t) {
    const S = spoonSize() * (rush > 0 ? 1.25 : 1);
    const x = spoon.x, y = spoon.y - (spoon.chew > 0 ? Math.sin(spoon.chew / .25 * Math.PI) * 6 : 0);
    if (spoon.sticky) {
      ctx.strokeStyle = 'rgba(255,236,120,.7)'; ctx.lineWidth = 2;
      for (const dx of [-.3, .05, .35]) { ctx.beginPath(); ctx.moveTo(x + dx * S * .6, y + S * .2); ctx.quadraticCurveTo(x + dx * S * .9, (y + H) / 2, x + dx * S * .5, H - 6); ctx.stroke(); }
    }
    if (spoon.hurt > 0 && Math.floor(spoon.hurt * 12) % 2 === 0) return;
    ctx.save(); ctx.translate(x, y);
    const bw = S * .58, bh = S * .3;
    const hg = ctx.createLinearGradient(-S * .12, 0, S * .12, 0);
    hg.addColorStop(0, '#7a4a1e'); hg.addColorStop(.5, '#c48a4e'); hg.addColorStop(1, '#7a4a1e');
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.moveTo(-S * .07, bh * .6); ctx.lineTo(-S * .13, H); ctx.lineTo(S * .13, H); ctx.lineTo(S * .07, bh * .6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(60,30,10,.35)'; ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-S * .06 + i * S * .03, bh); ctx.lineTo(-S * .1 + i * S * .05, H); ctx.stroke(); }
    if (spoon.glow > .05) {
      const g = ctx.createRadialGradient(0, 0, 4, 0, 0, S * 1.1);
      g.addColorStop(0, `rgba(255,200,80,${.35 * spoon.glow})`); g.addColorStop(1, 'rgba(255,200,80,0)');
      ctx.fillStyle = g; circle(0, 0, S * 1.1); ctx.fill();
    }
    const wg = ctx.createRadialGradient(-bw * .3, -bh * .4, 2, 0, 0, bw * 1.1);
    wg.addColorStop(0, '#e0a868'); wg.addColorStop(1, '#8a5424');
    ctx.fillStyle = wg; ctx.beginPath(); ctx.ellipse(0, 0, bw, bh * 1.35, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#5e3413'; ctx.beginPath(); ctx.ellipse(0, -bh * .15, bw * .86, bh * .95, 0, 0, TAU); ctx.fill();
    const f = Math.max(.15, spoon.fill);
    const hgr = ctx.createLinearGradient(0, -bh, 0, bh);
    hgr.addColorStop(0, '#c97424'); hgr.addColorStop(1, '#6e2f08');
    ctx.fillStyle = hgr; ctx.beginPath(); ctx.ellipse(0, -bh * .1, bw * .8 * (.55 + f * .45), bh * .85 * (.55 + f * .45), 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(-bw * .3, -bh * .4, bw * .16, bh * .14, -.3, 0, TAU); ctx.fill();
    if (spoon.hurt > 0 && spoon.hurt < 1) { ctx.globalAlpha = spoon.hurt * .8; ctx.fillStyle = spoon.tint; ctx.beginPath(); ctx.ellipse(0, -bh * .1, bw * .8, bh * .85, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
    const smear = Math.min(1, score / 250);
    if (smear > .05) {
      ctx.fillStyle = '#f2a516';
      ctx.beginPath(); ctx.ellipse(bw * .55, bh * .9 + smear * S * .12, 3, 5 + smear * 8, 0, 0, TAU); ctx.fill();
      if (smear > .5) { ctx.beginPath(); ctx.ellipse(-bw * .45, bh * 1.1 + smear * S * .08, 2.5, 4 + smear * 5, 0, 0, TAU); ctx.fill(); }
    }
    ctx.restore();
    if (spoon.frozen > 0) txt('in vc...', x, y - S * .7, 11, '#9aa4ff', 700);
    else if (spoon.slow > 0) txt('working at loksd corp...', x, y - S * .7, 10, '#ffd36b', 700);
    else if (spoon.venom > 0) txt('venom...', x, y - S * .7, 10, '#9be36b', 700);
  }
  function drawGlobs() {
    for (const g of globs) {
      ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(Math.PI);
      dropShape(g.r, 1.8);
      ctx.shadowColor = 'rgba(255,200,80,.8)'; ctx.shadowBlur = 10;
      ctx.fillStyle = GLOB_COL[Math.min(3, Math.floor((g.lv || 0) / 3))]; ctx.fill();
      ctx.restore();
    }
  }
  function drawRushBar() {
    if (state !== 'play') return;
    const prog = rush > 0 ? rush / RUSH_TIME : addict;
    const w = Math.min(150, W * .36), x = 12, y = H - 22;
    ctx.fillStyle = 'rgba(246,227,180,.12)'; roundRect(x, y, w, 8, 4); ctx.fill();
    ctx.fillStyle = rush > 0 ? '#ffd36b' : '#f2a516'; roundRect(x, y, Math.max(8, w * prog), 8, 4); ctx.fill();
    ctx.fillStyle = 'rgba(246,227,180,.7)'; ctx.font = '700 10px "Instrument Sans", sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText(rush > 0 ? 'ADDICTIVE MODE  ×1.5' : 'ADDICTIVE  ' + Math.floor(addict * 100) + '%', x, y - 4);
  }

  function draw(t) {
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake);
    drawBg(t);
    drawChat();
    drawAllySpeech(); // speech sits under everything that can hit you, so words never hide an attack
    for (const b of bosses) drawSpeech(b);
    for (const it of items) {
      if (it.kind === 'bad') continue;
      ctx.save(); ctx.translate(it.x, it.y); ctx.scale(G, G); ctx.translate(-it.x, -it.y);
      if (it.kind !== 'lab') goodGlow(it.x, it.y, it.r);
      if (it.kind === 'drop') drawDrop(it);
      else if (it.kind === 'jar') drawJar(it);
      else if (it.kind === 'box') drawBox(it, t);
      else if (it.kind === 'comb') drawCombChunk(it);
      else if (it.kind === 'lab') drawLab(it, t);
      else if (it.kind === 'shilajit') drawShilajit(it, t);
      ctx.restore();
    }
    drawComb(t);
    drawFlow(t);
    if (bosses.some(b => b.p3 && fighting(b))) { ctx.fillStyle = `rgba(200,16,46,${0.07 + 0.04 * Math.sin(t * 3)})`; ctx.fillRect(0, combBottom(), W, H - combBottom()); } // slaughter phase
    for (const b of bosses) drawBoss(b, t);
    drawAlly(t);
    drawGlobs();
    if (spoon) drawSpoon(t);
    drawWorkerBees(t);
    drawPowerFx(t);
    for (const it of items) if (it.kind === 'bad') drawBad(it, t);
    for (const p of proj) drawProj(p, t);
    for (const p of proj) if (p.k === 'smoke') drawSmoke(p);
    drawSmokeFx(t);
    drawSwarm(t);
    drawQueenFx(t);
    drawGore();
    for (const p of particles) { ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color; circle(p.x, p.y, p.r); ctx.fill(); }
    ctx.globalAlpha = 1;
    for (const b of bosses) drawBossUI(b);
    for (const p of proj) if (p.gun) drawGoyGun(p, t); // the goy beam's ray gun hangs over everything up there
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const f of floaters) {
      if (f.fs === undefined) measureFloater(f);
      ctx.globalAlpha = Math.max(0, Math.min(1, f.life * 1.5));
      const y = f.y + f.oy;
      if (f.big) ctx.font = `900 ${f.fs}px Gluten, cursive`;
      else ctx.font = `700 ${f.fs}px Gluten, cursive`;
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(29,17,8,.85)'; ctx.strokeText(f.text, f.dx, y);
      ctx.fillStyle = f.color; ctx.fillText(f.text, f.dx, y);
      if (f.sub) {
        const sy = y + f.fs * 0.5 + f.sfs * 0.85;
        ctx.font = `700 ${f.sfs}px Gluten, cursive`;
        ctx.strokeText(f.sub, f.dx, sy); ctx.fillStyle = '#f6e3b4'; ctx.fillText(f.sub, f.dx, sy);
      }
    }
    ctx.globalAlpha = 1;
    drawRushBar();
    if (flash > 0) { ctx.fillStyle = `rgba(210,248,255,${flash * .7})`; ctx.fillRect(0, 0, W, H); }
    if (hurtFlash > 0) {
      const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
      g.addColorStop(0, 'rgba(200,16,46,0)'); g.addColorStop(1, `rgba(200,16,46,${hurtFlash * 1.2})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  }

  // ---------- flow ----------
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = now / 1000;
    if (locked && state !== 'play') unlockMouse(); // every menu frees the mouse
    if ($('pauseBtn').hidden === (state === 'play')) $('pauseBtn').hidden = state !== 'play';
    if (state === 'play' && !frozen) {
      if (gameSpeed === 1) update(dt);
      else {
        const g = dt * gameSpeed, n = Math.max(1, Math.ceil(g / Math.max(dt, 1 / 60) - 1e-6));
        for (let i = 0; i < n && state === 'play' && !frozen; i++) update(g / n);
      }
    }
    else if (state === 'start' && spoon) { spoon.x = W / 2 + Math.sin(t) * W * .2; spoon.fill = .5 + Math.sin(t * 1.3) * .3; }
    draw(t);
    requestAnimationFrame(frame);
  }

  function hideOverlays() { ['startScreen', 'overScreen', 'pauseScreen', 'soldScreen', 'shedScreen'].forEach(id => $(id).hidden = true); }
  function start() {
    audio(); reset(); state = 'play'; $('toast').classList.remove('low');
    hideOverlays();
    for (let i = 0; i < 5; i++) spawnDrop(1, combBottom() + rnd(0, H * 0.45));
    items.push({ kind: 'jar', x: W * rnd(0.3, 0.7), y: combBottom() + H * 0.2, vy: 140, r: 19, rot: 0, vr: 0.6 });
    seasonBanner(); lbStartRun();
    last = performance.now(); lockMouse();
  }
  function startEndless() {
    audio(); state = 'play'; hideOverlays(); $('toast').classList.remove('low');
    endless = true; endlessRound = 0; endlessNext = GOAL + STAGE_KG; revivesLeft = REVIVES; endlessSeen = {}; // two fresh second chances for endless
    endlessBag = []; lastEndless = -1;
    bossIdx = BOSS_COUNT; phase = 'harvest'; boss = null; bosses = []; chat = null; qd = null; ev = null; evT = rnd(10, 14);
    items = []; proj = []; sticky = []; ambient = [];
    purity = Math.max(purity, 60);
    achStat('round', 1);
    openShed(); // shop first, then the harvest
    grandadSay("They'll keep coming now. Spend it while you can.");
  }
  function revive() {
    if (revivesLeft <= 0) return;
    revivesLeft--;
    purity = 50; spoon.hurt = 2.2; spoon.frozen = 0; spoon.slow = 0; spoon.venom = 0; spoon.sting = 0; spoon.vstack = 0; spoon.anaph = 0; spoon.mark = 0;
    items = items.filter(i => i.kind !== 'bad'); proj = []; sticky = []; globs = [];
    for (const b of bosses) {
      if (b.mode === 'dash') { b.mode = 'fight'; b.dash = null; b.y = bossHome(); }
      b.pushup = 0; b.atkT = Math.max(b.atkT, 2);
    }
    state = 'play'; hideOverlays(); last = performance.now();
    floatText(W / 2, H * 0.45, 'SECOND CHANCE', '#ffd36b', true);
    floatText(spoon.x, spoon.y - 60, "Grandad's spare frame +50%", '#ffe9a8');
    sfx.comb();
    updateHud(); lockMouse();
  }
  // ---------- achievements ----------
  let achDirty = false, achTimer = 0;
  function achSave() { achDirty = false; try { localStorage.setItem('honey-gobbler-ach', JSON.stringify(achData)); } catch (e) {} lbSyncSoon(); }
  function achSaveSoon() { achDirty = true; if (!achTimer) achTimer = setTimeout(() => { achTimer = 0; if (achDirty) achSave(); }, 2000); }
  addEventListener('pagehide', () => { if (achDirty) achSave(); });
  function achUnlock(id) {
    if (achData.done[id]) return;
    const a = ACH.find(x => x.id === id); if (!a) return;
    achData.done[id] = Date.now(); achSave();
    toast('Achievement unlocked: <b>' + esc(a.name) + '</b>');
    sfx.ach();
    updateAchCount();
  }
  function achCheck(key) { for (const a of ACH) if (a.stat === key && (achData.stats[key] || 0) >= a.goal) achUnlock(a.id); }
  function achStat(key, v) { if (v > (achData.stats[key] || 0)) { achData.stats[key] = v; achSave(); achCheck(key); } } // best ever
  function achAdd(key, n, lazy) { if (!n) return; achData.stats[key] = (achData.stats[key] || 0) + n; lazy ? achSaveSoon() : achSave(); achCheck(key); } // running total
  function achProgress(a) { return achData.done[a.id] ? 1 : a.stat ? clamp((achData.stats[a.stat] || 0) / a.goal, 0, 1) : 0; }
  function updateAchCount() { const n = ACH.filter(a => achData.done[a.id]).length; document.querySelectorAll('.achcount').forEach(el => { el.textContent = n + '/' + ACH.length; }); }
  function renderAch() {
    const n = ACH.filter(a => achData.done[a.id]).length;
    $('achCount').textContent = n + ' of ' + ACH.length;
    $('achTotal').style.width = (n / ACH.length * 100).toFixed(1) + '%';
    $('achList').innerHTML = ACH.map(a => {
      const done = !!achData.done[a.id], p = achProgress(a), cur = Math.floor(achData.stats[a.stat] || 0);
      const num = done ? 'Unlocked' : a.stat ? (a.show ? a.show(cur) : cur + ' / ' + a.goal) : 'Locked';
      return `<div class="ach${done ? ' done' : ''}"><span class="ico" aria-hidden="true">${done ? CHECK_SVG : '?'}</span><div><h4><span class="num">${esc(num)}</span>${esc(a.name)}</h4><p>${esc(a.desc)}</p><div class="prog"><i style="width:${(p * 100).toFixed(1)}%"></i></div></div></div>`;
    }).join('');
  }
  function openAch() {
    achPrev = ['shedScreen', 'startScreen', 'pauseScreen', 'overScreen', 'soldScreen'].find(id => !$(id).hidden) || null;
    if (achPrev) $(achPrev).hidden = true;
    renderAch(); $('achScreen').hidden = false;
    $('achScreen').querySelector('.card').scrollTop = 0;
    $('achClose').focus({ preventScroll: true });
  }
  function closeAch() {
    $('achScreen').hidden = true;
    if (achPrev) { $(achPrev).hidden = false; const f = $(achPrev).querySelector('[data-ach]'); if (f) f.focus({ preventScroll: true }); }
    achPrev = null;
  }
  function toast(html) { toastQ.push(html); if (!toastBusy) nextToast(); }
  function nextToast() {
    const el = $('toast'), h = toastQ.shift();
    if (!h) { toastBusy = false; return; }
    toastBusy = true; el.innerHTML = h; el.classList.toggle('low', state !== 'play'); el.classList.remove('hide');
    setTimeout(() => { el.classList.add('hide'); setTimeout(nextToast, 450); }, 2800);
  }

  // ---------- Grandad's Shed ----------
  // Purchases come out of your shed savings first, then out of the honey you've harvested. Bosses still come every 150 kg harvested.
  const honeyLeft = () => Math.max(0, score - kgSpent);
  const wallet = () => savings + honeyLeft();
  const toNextBoss = () => Math.max(0, Math.ceil((endless ? endlessNext : thresholdFor(Math.min(bossIdx, BOSS_COUNT - 1))) - score)); // kg still to harvest
  function itemInfo(s) {
    const lv = upg[s.id], maxed = lv >= s.max, locked = !!(s.unlock && !s.unlock());
    const raw = maxed ? 0 : s.cost[lv];
    return { lv, maxed, locked, base: maxed ? 0 : r10(raw), cost: maxed ? 0 : r10(raw * priceMult()) };
  }
  function priceMult() { return endless || bossIdx > 4 ? PRICE_HIKE : 1; } // bosses 1-5 beaten means the coach is done
  function anythingToBuy() { return SHOP.some(s => { const inf = itemInfo(s); return !inf.locked && !inf.maxed; }); }
  const canBuy = inf => !inf.locked && !inf.maxed && wallet() >= inf.cost;
  function grandadSay(text) {
    $('gLine').textContent = text;
    const g = $('gBubble'); g.classList.remove('pop'); void g.offsetWidth; g.classList.add('pop');
  }
  function renderShed() {
    $('shedSav').textContent = fmtKg(wallet());
    $('shedKg').textContent = savings >= 0.1 ? '(' + fmtKg(honeyLeft()) + ' harvested + ' + fmtKg(savings) + ' from boss fights)' : '';
    $('shedNext').textContent = 'All of it is yours to spend: every kg you harvest, honey caught in boss fights and ' + BOSS_BONUS + ' kg for every boss you beat. Spending never brings the next boss closer or pushes it back: he turns up after ' + toNextBoss() + ' kg more harvesting either way.';
    for (const el of $('shop').children) {
      const s = SHOP.find(x => x.id === el.dataset.id), inf = itemInfo(s);
      el.hidden = inf.locked && s.id !== 'crazy'; // Pay Colonex appears once he has joined you; Crazy mode shows locked until earned
      el.querySelector('.pips').textContent = s.id === 'crazy' ? (inf.lv ? (crazyOn ? 'On' : 'Off') : inf.locked ? 'Two bosses at once' : 'Unlocked')
        : 'Level ' + inf.lv + '/' + s.max + (s.key && !touchUI ? ' · key ' + s.key : '');
      el.querySelector('.pr').innerHTML = inf.locked ? LOCK_SVG + ' Locked' : inf.maxed ? (s.max === 1 ? 'Owned' : 'Max') : (inf.cost > inf.base ? '<s>' + inf.base + '</s> ' : '') + inf.cost + ' kg';
      el.className = 'tile' + (s.id === shedSel ? ' sel' : '') + (inf.locked ? ' locked' : '') + (inf.maxed ? ' done' : '') + (!inf.locked && !inf.maxed && wallet() < inf.cost ? ' cant' : '');
    }
  }
  function selectItem(id) {
    shedSel = id;
    const s = SHOP.find(x => x.id === id), inf = itemInfo(s);
    $('dName').textContent = s.name + (s.max > 1 ? '  ·  level ' + inf.lv + ' of ' + s.max : '');
    $('dDesc').textContent = s.desc + (s.key ? (touchUI ? ' Tap its button on the right to use it.' : ' Click anywhere or press ' + s.key + ' to use it.') : '');
    $('dNow').textContent = 'Now: ' + s.lvText(inf.lv);
    $('dNext').textContent = s.max === 1 ? (inf.lv ? 'Switch it on or off here whenever you like.' : inf.locked ? 'Locked: beat all nine bosses first.' : 'Every endless boss fight becomes two bosses at once. Warning: it is hard.') : inf.maxed ? 'Fully upgraded.' : 'Next: ' + s.lvText(inf.lv + 1);
    const btn = $('buyBtn');
    if (s.id === 'crazy' && inf.lv) { btn.textContent = crazyOn ? 'Turn crazy mode off' : 'Turn crazy mode on'; btn.disabled = false; }
    else if (inf.locked) { btn.textContent = 'Locked'; btn.disabled = true; }
    else if (inf.maxed) { btn.textContent = 'Max level'; btn.disabled = true; }
    else if (wallet() < inf.cost) { btn.textContent = 'Need ' + inf.cost + ' kg'; btn.disabled = true; }
    else { btn.textContent = 'Buy for ' + inf.cost + ' kg'; btn.disabled = false; }
    renderShed();
  }
  function cancelBuy() { shedPending = null; $('confirm').hidden = true; $('buyBtn').hidden = false; }
  function purchase(id) {
    const s = SHOP.find(x => x.id === id), inf = itemInfo(s);
    if (!canBuy(inf)) return;
    const fromSav = Math.min(savings, inf.cost);
    savings -= fromSav; kgSpent += inf.cost - fromSav;
    tally.spent += inf.cost; upg[id]++;
    if (PW[id]) { if (upg[id] === 1) { pcd[id] = 0; readyAt[id] = elapsed; } else pcd[id] = Math.min(pcd[id], PW[id](upg[id]).cd); }
    if (id === 'crazy') crazyOn = true;
    grandadSay(GRANDAD_BUY[id]);
    if (id === 'colonex') {
      const line = upg.colonex === 1
        ? (endless || bossIdx > 4 ? 'I spoke with the Shilajit Coach and I think I should start charging more' : 'loksd corporation has raised its rates')
        : upg.colonex === 2 ? 'loksd corporation is a premium product' : pick(COLONEX_RAISE);
      allyQueue = line; hear('Colonex', line);
      $('cmsgText').textContent = line; $('colonexMsg').hidden = false;
    }
    if (priceMult() > 1) achUnlock('premium');
    achStat('levels', SHOP.reduce((n, x) => n + (x.id === 'crazy' ? 0 : upg[x.id]), 0));
    sfx.buy();
    selectItem(id);
    updateHud();
  }
  function openShed(fromPause) { // between bosses, or from the pause menu (then the game carries on exactly where it was)
    shedFromPause = fromPause === true;
    state = 'shed';
    if (!shedFromPause) { phase = 'harvest'; spawnT = 0.5; ev = null; evT = rnd(12, 16); qd = null; proj = []; globs = []; sticky = []; if (extractRun) endExtract(); }
    $('shedDone').textContent = shedFromPause ? 'Back' : 'Back to the hives';
    $('brawlBtn').hidden = !(upg.crazy && endless && !shedFromPause);
    $('brawlBtn').textContent = 'Fight every boss at once' + (best.brawl ? ' (best ' + fmtTime(best.brawl) + ')' : '');
    cancelBuy(); shedPinned = false; $('colonexMsg').hidden = true; $('toast').classList.add('low');
    setTimeout(prepBuzz, 200);
    if (!hikeSaid && priceMult() > 1 && anythingToBuy()) { hikeSaid = true; grandadSay(GRANDAD_HIKE); }
    else if (!endless && bossIdx === BOSS_COUNT - 1 && !fromPause) grandadSay('Hornets. In my day we used a tennis racket.');
    else if (!endless && bossIdx === 3 && !fromPause) grandadSay("Some fella's coming to lecture you about your haircut. Just nod.");
    else grandadSay(pick(GRANDAD_HI));
    selectItem(shedSel && itemInfo(SHOP.find(x => x.id === shedSel)).locked === false ? shedSel : SHOP[0].id);
    hideOverlays(); $('shedScreen').hidden = false;
    updateHud();
    $('shedDone').focus({ preventScroll: true });
    $('shedScreen').querySelector('.card').scrollTop = 0;
  }
  function closeShed() {
    if (state !== 'shed') return;
    if (shedFromPause) { shedFromPause = false; $('shedScreen').hidden = true; state = 'pause'; pauseInfo(); $('pauseScreen').hidden = false; $('resumeBtn').focus(); updateHud(); return; }
    $('shedScreen').hidden = true; state = 'play'; last = performance.now(); $('toast').classList.remove('low');
    if (endless) floatText(W / 2, H * 0.44, 'Round ' + (endlessRound + 1), '#cfe8ff', true); else seasonBanner();
    updateHud(); lockMouse();
  }
  function pauseInfo() { lockLabel(); $('pauseRevive').textContent = revivesLeft ? revivesLeft + (revivesLeft === 1 ? ' second chance' : ' second chances') + ' left' + (endless ? ' in endless.' : ' this run.') : 'No second chances left.'; }
  function togglePause() {
    if (state === 'play') { state = 'pause'; pauseInfo(); $('pauseScreen').hidden = false; $('resumeBtn').focus(); }
    else if (state === 'pause') { state = 'play'; $('pauseScreen').hidden = true; $('toast').classList.remove('low'); last = performance.now(); lockMouse(); }
  }
  function tallyRows() {
    const rows = [['Honeydew drops', tally.drops], ['Caught by your bees', tally.beeDrops], ['Ryczkowski jars', tally.jars], ['Boxes of honey', tally.boxes], ["Grandad's comb", tally.comb], ['Shilajit of honey', tally.shilajit], ['Lab tests run', tally.labs], ['Bosses beaten', tally.bosses]]
      .filter(r => r[1]);
    let out = rows.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
    if (tally.saved >= 0.1) out += `<div><span>Saved in boss fights</span><b>${fmtKg(tally.saved)}</b></div>`;
    if (tally.spent) out += `<div><span>Spent in Grandad's Shed</span><b>${tally.spent} kg</b></div>`;
    if (tally.billed) out += `<div class="loksd"><span>Colonex billed the bosses</span><b>${tally.billed.toLocaleString('en-GB')}$</b></div>`;
    out += Object.entries(tally.bad).sort((a, b) => b[1] - a[1]).slice(0, 4)
      .map(([k, v]) => `<div class="yuck"><span>${esc(k)} (yuck)</span><b>${v}</b></div>`).join('');
    return out;
  }
  function fillHeard(id) {
    let n = 0, body = '';
    for (const [who, set] of heard) { n += set.size; body += `<h4>${esc(who)}</h4>` + [...set].map(l => `<q>${esc(l)}</q>`).join(''); }
    const el = $(id);
    el.innerHTML = n ? `<summary>Overheard (${n} line${n > 1 ? 's' : ''})</summary>${body}` : '';
    el.open = false;
    el.hidden = !n;
  }
  function gameOver() {
    if (brawl) { brawlEnd(false); return; } // just for fun: nothing lost
    state = 'over'; $('toast').classList.add('low'); if (achDirty) achSave();
    const canRevive = revivesLeft > 0;
    if (endless) {
      const isBest = score > best.endless;
      if (isBest) { best.endless = score; saveBest(); }
      $('overTitle').textContent = isBest ? 'New endless record' : 'Endless run over';
    } else {
      const isBest = score > best.kg;
      if (isBest) { best.kg = score; saveBest(); }
      $('overTitle').textContent = isBest && score > 0 ? 'New record. Still sus.' : 'Purity hit 0%';
    }
    $('finalKg').textContent = fmtKg(score);
    let text = 'Your honey is officially sus.';
    if (lastHit && lastHit.boss && lastHit.boss.def) text = lastHit.boss.def.lose;
    else if (lastHit && lastHit.toxin) text = `${lastHit.name} poisoning. Next time stick to honey that is poison free, radium free, arsenic free and uranium free.`;
    else if (lastHit) text = `${lastHit.name} got you. Real honey has nothing in it except honey.`;
    $('overText').textContent = text;
    $('reviveRow').hidden = !canRevive; $('reviveNote').hidden = false;
    $('reviveNote').textContent = canRevive ? (revivesLeft === 1 ? 'Last second chance this run.' : revivesLeft + ' second chances left this run.') + ' You come back at 50% purity.'
      : endless ? 'No second chances left: you used both of your endless ones.' : 'No second chances left: you used both of them this run.';
    const bees = Math.round(score * 1000 / G_PER_BEE);
    $('beeFact').textContent = score > 0
      ? `A worker bee makes about a twelfth of a teaspoon of honey in her whole life. You harvested the life's work of ${bees.toLocaleString('en-GB')} bees.`
      : 'Not a single drop. The hive is relieved.';
    $('tally').innerHTML = tallyRows();
    fillHeard('heardOver');
    $('bestLine').textContent = endless
      ? 'Best endless: ' + fmtKg(best.endless) + '  ·  ' + fmtTime(elapsed)
      : 'Best: ' + fmtKg(best.kg) + '  ·  lasted ' + fmtTime(elapsed);
    $('lbOver').hidden = true; lbSubmit(lbEntry(), $('lbOver'));
    $('overScreen').hidden = false;
    (canRevive ? $('reviveBtn') : $('againBtn')).focus();
  }
  function win() {
    state = 'won'; score = GOAL; updateHud(); if (achDirty) achSave();
    if (lbRun) lbRun.wonAt = elapsed;
    const isBest = !best.time || elapsed < best.time;
    if (isBest) best.time = elapsed;
    best.kg = Math.max(best.kg, GOAL); saveBest();
    $('soldTally').innerHTML = tallyRows() + `<div><span>Purity left</span><b>${Math.ceil(purity)}%</b></div>`;
    fillHeard('heardSold');
    $('soldBest').textContent = 'Sold out in ' + fmtTime(elapsed) + (isBest ? '  ·  new record' : '  ·  best ' + fmtTime(best.time)) + (best.endless ? '  ·  best endless ' + fmtKg(best.endless) : '');
    sfx.win(); $('toast').classList.add('low'); achUnlock('sold');
    if (tally.spent === 0) achUnlock('spoon');
    if (revivesLeft === REVIVES) achUnlock('nospare');
    if (tally.minPurity >= 50) achUnlock('raw');
    if (elapsed < 16 * 60) achUnlock('fast');
    $('soldScreen').hidden = false; $('endlessBtn').focus();
    $('lbSold').hidden = true; lbSubmit(lbEntry(), $('lbSold'));
  }

  $('startBtn').addEventListener('click', start);
  $('againBtn').addEventListener('click', start);
  $('againBtn2').addEventListener('click', start);
  $('endlessBtn').addEventListener('click', startEndless);
  $('reviveBtn').addEventListener('click', revive);
  $('resumeBtn').addEventListener('click', togglePause);
  SHOP.forEach(s => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'tile'; b.dataset.id = s.id;
    b.innerHTML = `<span class="nm">${esc(s.name)}</span><span class="pips"></span><span class="pr"></span>`;
    // hovering previews an item until you press one; then it stays on that item until you press another
    b.addEventListener('mouseenter', () => { if (!shedPending && !shedPinned) selectItem(s.id); });
    b.addEventListener('focus', () => { if (!shedPending && !shedPinned) selectItem(s.id); });
    b.addEventListener('click', () => {
      shedPinned = true; cancelBuy(); selectItem(s.id);
      const inf = itemInfo(s);
      if (inf.locked && s.id === 'crazy') grandadSay("Beat all nine first. Then we'll talk.");
      else if (s.id === 'crazy' && !inf.lv) grandadSay("Two at once is hard, boy. Properly hard. Don't say I didn't warn you.");
      else if (!inf.locked && !inf.maxed && wallet() < inf.cost) grandadSay(GRANDAD_BROKE);
    });
    $('shop').appendChild(b);
  });
  $('buyBtn').addEventListener('click', () => {
    const s = SHOP.find(x => x.id === shedSel), inf = itemInfo(s);
    if (s.id === 'crazy' && inf.lv) { crazyOn = !crazyOn; grandadSay(GRANDAD_CRAZY[crazyOn ? 0 : 1]); selectItem(s.id); updateHud(); return; }
    if (!canBuy(inf)) return;
    shedPending = s.id;
    const fromSav = Math.min(savings, inf.cost), fromKg = inf.cost - fromSav;
    const src = 'You\'ll have ' + fmtKg(wallet() - inf.cost) + ' left to spend.';
    $('confirmText').textContent = 'Buy ' + s.name + (s.max > 1 ? ' (level ' + (inf.lv + 1) + ')' : '') + ' for ' + inf.cost + ' kg? ' + src;
    $('buyBtn').hidden = true; $('confirm').hidden = false; $('confirmYes').focus({ preventScroll: true });
  });
  $('confirmYes').addEventListener('click', () => { const id = shedPending; cancelBuy(); if (id) purchase(id); });
  $('confirmNo').addEventListener('click', cancelBuy);
  $('shedDone').addEventListener('click', closeShed);
  $('brawlBtn').addEventListener('click', startBrawl);
  $('pauseShed').addEventListener('click', () => { if (state === 'pause') openShed(true); });
  document.querySelectorAll('[data-ach]').forEach(el => el.addEventListener('click', openAch));
  // The waitlist page (same site) sets this after a successful signup; works even with the game open in another tab
  const WAIT_KEY = 'honey-gobbler-waitlist';
  const checkWaitlist = () => { try { if (localStorage.getItem(WAIT_KEY)) achUnlock('real'); } catch (e) {} };
  addEventListener('storage', e => { if (e.key === WAIT_KEY && e.newValue) achUnlock('real'); });
  addEventListener('focus', checkWaitlist);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkWaitlist(); });
  $('achClose').addEventListener('click', closeAch);

  // ---------- leaderboard ----------
  // Only on janhoney.com: the page says who's logged in (a token signed by Shopify) and where the leaderboard lives.
  // Each run gets a ticket when it starts; scores are sent with it. Nothing here runs in the artifact.
  const LB = window.HG_LB && window.HG_LB.api ? window.HG_LB : null;
  const LB_PEND = 'honey-gobbler-lb-pending', LB_NAMES = { endless: 'Endless', speed: 'Speedrun', crazy: 'Crazy mode' };
  const LB_DESC = { endless: 'Highest round in endless mode. Honey harvested breaks ties.', speed: 'Fastest win against all nine bosses, from the first drop.', crazy: 'Highest round in endless runs where at least half the rounds were crazy mode, or the last quarter of them (3 or more) were.' };
  let lbRun = null, lbMe = null, lbBoard = 'endless', lbFrom = null;
  async function lbCall(path, body) {
    let r;
    try { r = await fetch(LB.api + path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}); }
    catch (e) { throw Object.assign(new Error("Can't reach the leaderboard. Check your connection."), { code: 'net' }); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.message || 'The leaderboard is having a moment. Try again in a minute.'), { code: j.error || 'server' });
    return j;
  }
  function lbStartRun() {
    if (!LB) return;
    const run = lbRun = { ticket: null };
    lbCall('/api/start', {}).then(j => { run.ticket = j.ticket; }).catch(() => {});
  }
  function lbEntry() { // what this run would put on a board right now
    if (!LB || !lbRun || !lbRun.ticket) return null;
    const N = endlessRound + 1, crazyRounds = runStats.crazyFights + (crazyOn ? 1 : 0), crazyTail = crazyOn ? runStats.crazyTail + 1 : 0;
    const stats = { played: Math.floor(elapsed), bosses: Math.min(bossIdx, BOSS_COUNT), endlessFights: runStats.endlessFights, crazyFights: runStats.crazyFights, crazyRounds, crazyTail };
    const isCrazy = crazyRounds >= Math.ceil(N / 2) || (crazyTail >= 3 && crazyTail >= Math.ceil(N / 4));
    if (endless) return { board: isCrazy ? 'crazy' : 'endless', value: N, tie: Math.floor(score * 10) / 10, stats, ticket: lbRun.ticket };
    if (state === 'won' && lbRun.wonAt) return { board: 'speed', value: Math.round(lbRun.wonAt * 10) / 10, tie: 0, stats, ticket: lbRun.ticket };
    return null;
  }
  const lbVal = (board, v, tie) => board === 'speed' ? fmtTime(v) : 'Round ' + v + (tie ? '<small>' + esc(fmtKg(tie)) + '</small>' : '');
  const lbValText = (board, v) => board === 'speed' ? fmtTime(v) : 'round ' + v;
  function lbLine(el, html) { if (!el) return; el.innerHTML = html; el.hidden = !html; }
  function lbLoginUrl() { return LB.login || '/customer_authentication/login?return_to=' + encodeURIComponent(location.pathname); }
  function lbGoLogin(entry) { lbHold(entry); location.href = lbLoginUrl(); }
  const lbBetter = (a, b) => (a.board === 'speed' ? a.value < b.value : a.value > b.value || (a.value === b.value && a.tie > b.tie));
  function lbHeld() { // scores waiting for a login or a name: the best one per board, kept for a few days
    let p = null; try { p = JSON.parse(localStorage.getItem(LB_PEND) || 'null'); } catch (e) {}
    if (p && p.entry) p = { entries: { [p.entry.board]: p.entry }, at: p.at }; // the older single-score format
    if (!p || !p.entries || Date.now() - p.at > 3.5 * 86400e3) return {};
    return p.entries;
  }
  function lbSetHeld(entries) { try { if (Object.keys(entries).length) localStorage.setItem(LB_PEND, JSON.stringify({ entries, at: Date.now() })); else localStorage.removeItem(LB_PEND); } catch (e) {} }
  function lbHold(entry) { if (!entry) return; const h = lbHeld(), cur = h[entry.board]; if (!cur || cur.ticket === entry.ticket || lbBetter(entry, cur)) { h[entry.board] = entry; lbSetHeld(h); } }
  async function lbEnsureMe() { if (!lbMe) lbMe = await lbCall('/api/me', { token: LB.token }); return lbMe; }
  async function lbSubmit(entry, el) { // el: a line on the screen to report back on, or null to save quietly
    if (!entry) return;
    if (!LB.token) {
      lbHold(entry); // kept for when you log in
      if (el) { lbLine(el, 'Log in to put your ' + lbValText(entry.board, entry.value) + ' on the leaderboard. <button type="button" data-lblogin>Log in</button>'); el.querySelector('[data-lblogin]').onclick = () => lbGoLogin(entry); }
      return;
    }
    try {
      await lbEnsureMe();
      if (!lbMe.name) {
        lbHold(entry);
        if (el) { lbLine(el, 'Pick a name to put your ' + lbValText(entry.board, entry.value) + ' on the leaderboard. <button type="button" data-lbname>Pick a name</button>'); el.querySelector('[data-lbname]').onclick = () => lbOpen(entry.board, true); }
        return;
      }
      const j = await lbCall('/api/submit', { token: LB.token, ...entry });
      lbMe.bests[j.board] = { value: j.best.value, tie: j.best.tie, rank: j.rank };
      lbLine(el, j.improved ? LB_NAMES[j.board] + ': #' + j.rank + ' with ' + lbValText(j.board, j.best.value) + '. Your best yet.' : LB_NAMES[j.board] + ': your best is still ' + lbValText(j.board, j.best.value) + ', #' + j.rank + '.');
      return j;
    } catch (e) { lbLine(el, esc(e.message)); if (!el && e.code === 'login') LB.token = null; }
  }
  function lbOpen(board, naming) {
    if (!LB) return;
    lbFrom = ['startScreen', 'pauseScreen', 'overScreen', 'soldScreen', 'shedScreen'].find(id => !$(id).hidden) || null;
    if (lbFrom) $(lbFrom).hidden = true;
    $('lbScreen').hidden = false; $('lbScreen').querySelector('.card').scrollTop = 0;
    lbTab(typeof board === 'string' ? board : lbBoard);
    lbRenderMe(naming === true);
    $('lbClose').focus({ preventScroll: true });
  }
  function lbClose() {
    $('lbScreen').hidden = true;
    if (lbFrom) { $(lbFrom).hidden = false; const f = $(lbFrom).querySelector('[data-lb]'); if (f) f.focus({ preventScroll: true }); }
    lbFrom = null;
  }
  async function lbTab(board) {
    lbBoard = board;
    document.querySelectorAll('.lbtabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.board === board ? 'true' : 'false'));
    $('lbDesc').textContent = LB_DESC[board];
    $('lbList').innerHTML = '<li class="empty">Loading...</li>';
    try {
      const j = await lbCall('/api/top?board=' + board + '&limit=50');
      if (lbBoard !== board) return;
      const mine = lbMe && lbMe.name;
      $('lbList').innerHTML = j.rows.length ? j.rows.map(r => `<li${r.name === mine ? ' class="me"' : ''}><span class="rk">#${r.rank}</span><span class="nm">${esc(r.name)}</span><span class="v">${lbVal(board, r.value, r.tie)}</span></li>`).join('')
        : '<li class="empty">No one yet. Be the first.</li>';
    } catch (e) { if (lbBoard === board) $('lbList').innerHTML = '<li class="empty">' + esc(e.message) + '</li>'; }
    lbRenderMe();
  }
  function lbRenderMe(naming) {
    const me = $('lbMe'), form = $('lbNameForm');
    $('lbLogin').hidden = !!LB.token; $('lbRename').hidden = true;
    if (!LB.token) { form.hidden = true; lbLine(me, 'Log in to your janhoney.com account to get on the leaderboard.'); return; }
    if (!lbMe) { lbLine(me, ''); lbEnsureMe().then(() => lbRenderMe(naming)).catch(e => lbLine(me, esc(e.message))); return; }
    if (!lbMe.name || naming === true) {
      lbLine(me, ''); if (form.hidden) { form.hidden = false; $('lbName').value = lbMe.name || ''; $('lbErr').hidden = true; $('lbWait').checked = false; $('lbWait').parentNode.hidden = !LB.email; }
      $('lbCancel').hidden = !lbMe.name; return;
    }
    form.hidden = true; $('lbRename').hidden = false;
    const b = lbMe.bests[lbBoard];
    lbLine(me, 'You are <b>' + esc(lbMe.name) + '</b>. ' + (b ? 'Your best here: ' + lbValText(lbBoard, b.value) + (b.rank ? ', #' + b.rank : '') + '.' : 'Nothing on this board yet.'));
  }
  async function lbSaveName() {
    const name = $('lbName').value.trim(), err = $('lbErr'), btn = $('lbSave');
    err.hidden = true; btn.disabled = true;
    try {
      const j = await lbCall('/api/name', { token: LB.token, name });
      await lbEnsureMe(); lbMe.name = j.name;
      if ($('lbWait').checked) lbJoinWaitlist(j.name);
      $('lbNameForm').hidden = true;
      await lbSendPending();
      lbTab(lbBoard);
      lbStartLine();
    } catch (e) { err.textContent = e.message; err.hidden = false; }
    btn.disabled = false;
  }
  function lbJoinWaitlist(name) { // the same signup as the waitlist page: an email subscriber tagged "waitlist"
    const fd = new FormData();
    fd.append('form_type', 'customer'); fd.append('utf8', '✓');
    fd.append('contact[email]', LB.email); fd.append('contact[tags]', 'waitlist,leaderboard');
    if (LB.first || name) fd.append('contact[first_name]', LB.first || name);
    if (LB.last) fd.append('contact[last_name]', LB.last);
    fetch('/contact', { method: 'POST', body: fd, credentials: 'same-origin' })
      .then(r => { if (!r.ok || /challenge/.test(r.url)) throw 0; try { localStorage.setItem(WAIT_KEY, '1'); } catch (e) {} achUnlock('real'); toast("You're on the waitlist"); })
      .catch(() => { window.open('/pages/contact', '_blank'); }); // if Shopify wants a captcha, the waitlist page handles it
  }
  async function lbSendPending() { // scores held while you logged in or picked a name, one per board
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
  }
  // achievements, counters and records follow the account
  let lbSyncT = 0, lbSyncing = false;
  const lbSaveData = () => ({ done: achData.done, stats: achData.stats, best: { kg: best.kg, time: best.time, endless: best.endless, brawl: best.brawl } });
  function lbSyncSoon() { if (!LB || !LB.token) return; clearTimeout(lbSyncT); lbSyncT = setTimeout(lbSync, 3000); }
  async function lbSync() {
    lbSyncT = 0;
    if (!LB || !LB.token || lbSyncing) return;
    lbSyncing = true;
    try {
      const m = await lbCall('/api/sync', { token: LB.token, data: lbSaveData() });
      let changed = false;
      for (const [k, v] of Object.entries(m.done || {})) if (!achData.done[k] && ACH.some(a => a.id === k)) { achData.done[k] = v; changed = true; }
      for (const [k, v] of Object.entries(m.stats || {})) if (v > (achData.stats[k] || 0)) { achData.stats[k] = v; changed = true; }
      const bb = m.best || {}, b0 = JSON.stringify(best);
      if (bb.kg > best.kg) best.kg = Math.min(GOAL, bb.kg);
      if (bb.endless > best.endless) best.endless = bb.endless;
      if (bb.time && (!best.time || bb.time < best.time)) best.time = bb.time;
      if (bb.brawl && (!best.brawl || bb.brawl < best.brawl)) best.brawl = bb.brawl;
      if (changed) { try { localStorage.setItem('honey-gobbler-ach', JSON.stringify(achData)); } catch (e) {} updateAchCount(); }
      if (JSON.stringify(best) !== b0) try { localStorage.setItem('honey-gobbler-3', JSON.stringify(best)); } catch (e) {}
    } catch (e) {}
    lbSyncing = false;
  }
  function lbStartLine() {
    const el = $('lbStartLine');
    if (!LB.token) { lbLine(el, 'Log in to get on the leaderboard. Do it before you play: logging in reloads the page. <button type="button" data-lblogin>Log in</button>'); el.querySelector('[data-lblogin]').onclick = () => lbGoLogin(null); return; }
    if (!lbMe) return;
    const held = Object.values(lbHeld()), pend = held[0];
    if (!lbMe.name) { lbLine(el, (pend ? 'Pick a name to put your ' + held.map(e => lbValText(e.board, e.value)).join(' and ') + ' on the leaderboard.' : 'Pick a name for the leaderboard.') + ' <button type="button" data-lbname>Pick a name</button>'); el.querySelector('[data-lbname]').onclick = () => lbOpen(pend ? pend.board : 'endless', true); return; }
    lbLine(el, 'On the leaderboard as ' + esc(lbMe.name) + '. Your achievements save to your account.');
  }
  function lbBoot() {
    if (!LB) return;
    document.querySelectorAll('[data-lb]').forEach(el => { el.hidden = false; el.addEventListener('click', () => lbOpen()); });
    document.querySelectorAll('.lbtabs button').forEach(b => b.addEventListener('click', () => lbTab(b.dataset.board)));
    $('lbClose').addEventListener('click', lbClose);
    $('lbSave').addEventListener('click', lbSaveName);
    $('lbCancel').addEventListener('click', () => { $('lbNameForm').hidden = true; lbRenderMe(); });
    $('lbRename').addEventListener('click', () => lbRenderMe(true));
    $('lbLogin').addEventListener('click', () => lbGoLogin(null));
    lbStartLine();
    if (LB.token) lbEnsureMe().then(() => { lbStartLine(); return lbSendPending(); }).then(lbStartLine).catch(() => {});
    $('achWhere').textContent = LB.token ? 'Saved to your account, so they follow you to any device.' : 'Saved in this browser. Log in to keep them on your account.';
    if (LB.token) {
      lbSync();
      addEventListener('pagehide', () => { // anything not sent yet goes out as the page closes
        if (!lbSyncT) return;
        try { navigator.sendBeacon(LB.api + '/api/sync', new Blob([JSON.stringify({ token: LB.token, data: lbSaveData() })], { type: 'text/plain' })); } catch (e) {}
      });
    }
  }
  PKEYS.forEach(k => {
    const el = $('pw-' + k);
    el.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); firePower(k); });
    el.addEventListener('click', e => e.preventDefault());
  });
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; if (state === 'play') togglePause(); });
  addEventListener('resize', resize);

  window.claude?.hot?.snapshot?.(() => ({ best, ach: achData }));
  const boot = data => {
    if (data && data.best) { best.kg = Math.max(best.kg, Math.min(GOAL, +data.best.kg || 0)); best.endless = Math.max(best.endless, +data.best.endless || 0); if (+data.best.time && (!best.time || +data.best.time < best.time)) best.time = +data.best.time; }
    if (data && data.ach && data.ach.done) {
      Object.assign(achData.done, data.ach.done);
      for (const [key, v] of Object.entries(data.ach.stats || {})) achData.stats[key] = Math.max(achData.stats[key] || 0, +v || 0);
    }
    achMigrate(); updateAchCount(); checkWaitlist();
    resize(); reset(); requestAnimationFrame(frame); lbBoot();
  };
  window.claude?.hot?.ready ? window.claude.hot.ready(boot) : boot(window.claude?.hot?.data ?? {});
})();
window.HG_BUILD = 'Honey Gobbler IX (9fe17f)';
