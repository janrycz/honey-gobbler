import sys
fn = sys.argv[1]
s = open(fn).read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:110])
    s = s.replace(old, new)

# =====================================================================================
# Boss 8: Vespa mandarinia, the northern giant hornet. October, after the Disprover.
# =====================================================================================
rep("  const STAGE_KG = 150, BOSS_COUNT = 7, GOAL = STAGE_KG * BOSS_COUNT;",
    "  const STAGE_KG = 150, BOSS_COUNT = 8, GOAL = STAGE_KG * BOSS_COUNT;")
rep("    { m: 'Winter', name: 'Endless mode',",
    "    { m: 'October', name: 'The hornets come', col: '#e0913a', top: '#3a1c08', mid: '#230f06', glow: 'rgba(230,130,50,.15)', part: 'leaf' },\n"
    "    { m: 'Winter', name: 'Endless mode',")
rep("""      attacks: ['barrage', 'hexagons', 'missingLink', 'quarks', 'fishLegs', 'bigbang'],
    },
  ];""", """      attacks: ['barrage', 'hexagons', 'missingLink', 'quarks', 'fishLegs', 'bigbang'],
    },
    {
      key: 'hornet', name: 'Vespa mandarinia', tag: 'Giant hornet', sub: 'The northern giant hornet. It came for the hives.', hp: 640,
      intro: 'I am a talking hornet.',
      lines: ['I am a talking hornet.', "I don't make honey. I take it.", 'Thirty of us. Thirty thousand of you. Do the maths.', "I'm not invasive. I'm expanding.",
        "Murder hornet? It's called meal prep.", 'They misrepresented me in Ant-Man.', 'Your grandad has a tennis racket. I have a stinger.', 'Nice hive. Shame if someone raided it.',
        'Bees dance. Hornets eat.', 'October is my season.', 'Raw honey? I prefer raw bees.'],
      p2line: 'Fine. Bring your whole hive.', p2attacks: ['stingerFan'],
      p3line: 'Slaughter phase.', p3attacks: ['swarm', 'diveBite', 'diveBite'],
      defeat: 'Tell Ant-Man... he was right.',
      lose: 'Vespa mandarinia raided the hive. Thirty of them. One of you.',
      attacks: ['minis', 'stinger', 'hawk', 'nest', 'stinger', 'stingAlly', 'minis', 'hawk'],
    },
  ];""")
rep("    disprover: 'disprover has been disproved by loksd corporation',",
    "    disprover: 'disprover has been disproved by loksd corporation',\n    hornet: 'vespa mandarinia owes loksd corporation 500$ sting fee',")
rep("    { id: 'real', name: 'The real thing', desc: 'Join the waitlist.' },",
    "    { id: 'real', name: 'The real thing', desc: 'Join the waitlist.' },\n"
    "    { id: 'pest', name: 'Pest control', desc: 'Beat Vespa mandarinia.' },\n"
    "    { id: 'longlive', name: 'Long live the queen', desc: 'Beat Vespa mandarinia with the queen bee, without her ever going down.' },\n"
    "    { id: 'swatter', name: 'Swatter', desc: 'Swat 50 mini hornets with the spoon.', stat: 'swats', goal: 50 },")
rep("    { id: 'fast', name: 'Sold out fast', desc: 'Finish a run in under 12 minutes.' },",
    "    { id: 'fast', name: 'Sold out fast', desc: 'Finish a run in under 14 minutes.' },")
rep("    if (elapsed < 12 * 60) achUnlock('fast');", "    if (elapsed < 14 * 60) achUnlock('fast');")
rep("    { id: 'spoon', name: 'A spoon and nothing else', desc: 'Beat all seven bosses without buying anything in the shed.' },",
    "    { id: 'spoon', name: 'A spoon and nothing else', desc: 'Beat all eight bosses without buying anything in the shed.' },")
rep("The season runs March to September. Every 150 kg you harvest, someone turns up to ruin it. Beat all seven and you sell out.",
    "The season runs March to October. Every 150 kg you harvest, someone turns up to ruin it. Beat all eight and you sell out.")
rep("<span><b>900</b>Aug</span><span><b>1050</b>Sep</span>", "<span><b>900</b>Aug</span><span><b>1050</b>Sep</span><span><b>1200</b>Oct</span>")
rep(".roster { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }", ".roster { display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; }")
rep("""        <div class="big">1,050 kg</div>
        <p>That's 875 of our 1.2 kg jars.""", """        <div class="big">1,200 kg</div>
        <p>That's 1,000 of our 1.2 kg jars.""")
rep("inf.locked ? 'Locked: beat all seven bosses first.'", "inf.locked ? 'Locked: beat all eight bosses first.'")
rep("grandadSay(\"Beat all seven first. Then we'll talk.\");", "grandadSay(\"Beat all eight first. Then we'll talk.\");")
rep("        const avoid = endlessRound === 0 ? [BOSSES.findIndex(b => b.key === 'disprover')] : []; // you've just beaten him",
    "        const avoid = endlessRound === 0 ? [BOSS_COUNT - 1] : []; // you've just beaten the last story boss")
rep("    else grandadSay(pick(GRANDAD_HI));",
    "    else if (!endless && bossIdx === BOSS_COUNT - 1 && !fromPause) grandadSay('Hornets. In my day we used a tennis racket.');\n    else grandadSay(pick(GRANDAD_HI));")

# ---------- state ----------
rep("  let shieldT = 0, shieldHits = 0, shieldMax = 0; // Honeycomb shield",
    "  let shieldT = 0, shieldHits = 0, shieldMax = 0; // Honeycomb shield\n"
    "  let gore = [], beeDown = []; // body parts flying off (Terraria-style deaths); worker bees waiting to come back")
rep("    items = []; proj = []; globs = []; particles = []; floaters = []; puddles = []; sticky = []; ambient = [];\n",
    "    items = []; proj = []; globs = []; particles = []; floaters = []; puddles = []; sticky = []; ambient = []; gore = []; beeDown = [];\n", 1)
rep("tint: '#7cff6b', frozen: 0, slow: 0, drift: 0 };", "tint: '#7cff6b', frozen: 0, slow: 0, drift: 0, venom: 0, venomDps: 0, sting: 0, vx: 0, px: W / 2 };")
rep("    purity = 50; spoon.hurt = 2.2; spoon.frozen = 0; spoon.slow = 0;", "    purity = 50; spoon.hurt = 2.2; spoon.frozen = 0; spoon.slow = 0; spoon.venom = 0; spoon.sting = 0;")

# ---------- hornet helpers, attacks ----------
rep("  const ATTACKS = {\n", """  // ---------- the hornet ----------
  const hornetOf = () => bosses.find(b => b.def.key === 'hornet' && fighting(b));
  const hornetAim = () => (qd && qd.mode === 'boss' && qd.st !== 'exit' ? { x: qd.x, y: qd.y, queen: true } : { x: spoon.x, y: spoon.y }); // while the queen is out, he goes after her
  function nearestBee(x, y) { let best = null, bd = 1e9; for (const b of bees) { const d = Math.hypot(b.x - x, b.y - y); if (d < bd) { bd = d; best = b; } } return best; }
  function killBee(bee) {
    const i = bees.indexOf(bee); if (i < 0) return;
    bees.splice(i, 1); beeDown.push(4); // she's back in 4 s
    if (bee.tgt && bee.tgt.bee === bee) bee.tgt.bee = null;
    if (bee.carry) { bee.carry.held = null; bee.carry = null; }
    splat(bee.x, bee.y, '#f2c94c', 6); floatText(bee.x, bee.y - 14, 'Bee down', '#ff9a8a');
  }
  function spawnMini(b, x, y) {
    if (proj.filter(q => q.k === 'mini' && !q.dead).length >= 8) return;
    proj.push(P({ k: 'mini', name: 'Mini hornet', color: '#e89a2c', x, y, r: 10, dmg: 8, life: 9, owner: b, ph: rnd(0, 6) }));
  }
  function shootStinger(b, da) {
    const k = bossK(), x0 = b.x + 24 * k * (spoon.x < b.x ? -1 : 1), y0 = b.y + 22 * k, aim = hornetAim(), a = Math.atan2(aim.y - y0, aim.x - x0) + da;
    proj.push(P({ k: 'stinger', name: 'Stinger', color: '#2a1606', x: x0, y: y0, vx: Math.cos(a) * 360, vy: Math.sin(a) * 360, r: 7, dmg: 6, ang: a }));
  }
  // mini hornets hunt your worker bees (or you, if you have none); swipe the spoon through one to swat it
  function updateMini(p, dt, S) {
    p.ph += dt * 40;
    if (Math.abs(spoon.vx) > 650 * G && Math.abs(p.x - spoon.x) < S * 0.65 && Math.abs(p.y - (spoon.y - 10)) < S * 0.6) {
      p.dead = true; splat(p.x, p.y, '#e89a2c', 8); floatText(p.x, p.y - 16, 'Swatted!', '#ffd36b'); achAdd('swats', 1, true); sfx.hit();
      return true;
    }
    if (p.t > p.life || p.leave) { p.vx *= 0.96; p.vy = -320; if (p.y < combBottom() - 40) p.dead = true; return false; }
    if (!p.bee || !bees.includes(p.bee)) p.bee = nearestBee(p.x, p.y);
    const tg = p.bee || { x: spoon.x, y: spoon.y - 10 }, sp = (p.bee ? 230 : 170) * Math.max(0.7, G);
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
    const parts = kind === 'hornet' ? ['hwing', 'hwing', 'habdomen', 'hthorax', 'hhead'] : ['qwing', 'qwing', 'qabdomen', 'qthorax', 'qhead'];
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
""")
rep("""    bigbang(b) {""", """    // 8. Vespa mandarinia
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
    stingerFan(b) {
      say('One sting for each of your excuses.');
      for (const da of [-0.24, 0, 0.24]) shootStinger(b, da);
      return 2.8;
    },
    stingAlly(b) {
      if (!ally || !allyActive()) return ATTACKS.stinger(b);
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
      b.dash = { st: 'tele', t: 0, fx: b.x, fy: b.y, tx: clamp(aim.x, 40, W - 40), ty: aim.queen ? aim.y : spoon.y - 30, dmg: 18, name: 'Mandible bite', color: '#ff9a3c' };
      sfx.warn();
      return 3.0;
    },
    bigbang(b) {""")

# ---------- boss update: phase 3, hawking, bee ball, stun ----------
rep("""    if (!b.p2 && b.hp / b.max <= 0.5) {""", """    if (b.stun > 0) { b.stun -= dt; b.y = home + (b.yOff || 0) + Math.sin(b.t * 30) * 3 * k; return; } // knocked out of the sky: no moving, no attacks
    if (b.def.p3attacks && !b.p3 && b.hp / b.max <= 0.25) { // the hornet's slaughter phase
      b.p3 = true;
      floatText(W / 2, H * 0.42, 'SLAUGHTER PHASE', '#ff5a3c', true);
      say(b.def.p3line, { force: true }); b.sayT = b.say.t + 1.5;
      b.forceNext = b.def.p3attacks[0]; b.atkT = Math.min(b.atkT, 1.2);
      sfx.phase2(); shake = reduceMotion ? 0 : 12;
    }
    if (b.def.key === 'hornet') {
      if (b.p2 && !b.ball) { // bee ball: three or more worker bees mob him and cook him with body heat
        b.ballT = (b.ballT ?? 2) - dt;
        if (b.ballT <= 0 && bees.length >= 3 && !b.hawk) { b.ball = { t: 0, dur: 3.5, acc: 0 }; floatText(W / 2, H * 0.42, 'BEE BALL', '#ffd36b', true); say("Why is it so hot in here?", { force: true }); }
      }
      if (b.ball) {
        const r = b.ball;
        r.t += dt; r.acc += dt * (3 + 1.6 * bees.length); b.atkT += dt; // he can't attack while he's cooking
        if (r.acc >= 4) { damageBoss(Math.round(r.acc), b); r.acc = 0; if (!fighting(b) || state !== 'play') return; }
        if (r.t > r.dur || bees.length < 2) { b.ball = null; b.ballT = 22; }
      }
      if (b.hawk) { // hovering by the hive entrance, snatching honey
        const hk = b.hawk; hk.t += dt; // (returning early below also pauses his attacks)
        let tx = clamp(spoon.x + hk.side * 110 * Math.max(0.7, G), 50, W - 50);
        if (magnetT > 0 && Math.abs(b.x - spoon.x) < magR() * 1.3) { tx = clamp(b.x + Math.sign(b.x - spoon.x || hk.side) * 260, 50, W - 50); if (!hk.pushed) { hk.pushed = true; floatText(b.x, b.y - 40 * k, 'Pushed off', '#ffd36b'); } }
        const ty = Math.max(home, spoon.y - 170 * k);
        b.x += (tx - b.x) * Math.min(1, dt * 3); b.y += (ty - b.y) * Math.min(1, dt * 3); b.yOff = b.y - home;
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
    if (!b.p2 && b.hp / b.max <= 0.5) {""")
rep("""      const list = b.p2 ? b.def.attacks.concat(b.def.p2attacks) : b.def.attacks;""",
    """      const list = b.p3 ? b.def.attacks.concat(b.def.p2attacks, b.def.p3attacks) : b.p2 ? b.def.attacks.concat(b.def.p2attacks) : b.def.attacks;""")
rep("""      b.atkT = cd * (b.p2 ? 0.8 : 1) * b.speed;""", """      b.atkT = cd * (b.p2 ? 0.8 : 1) * (b.p3 ? 0.85 : 1) * b.speed;""")
rep("""    b.y = home + Math.sin(b.t * 2.2 + b.slot * 1.7) * 6 * k;""",
    """    b.yOff = (b.yOff || 0) * Math.max(0, 1 - dt * 3); // easing back after hawking low
    b.y = home + Math.sin(b.t * 2.2 + b.slot * 1.7) * 6 * k + b.yOff;""")

# the dive bite: a strong queen can knock him out of the air mid-dive
rep("""      if (!d.hit && Math.hypot(b.x - spoon.x, b.y - spoon.y) < 58 * k + spoonSize() * 0.35) {""",
    """      if (b.def.key === 'hornet' && qd && qd.mode === 'boss' && qd.st === 'go' && Math.hypot(b.x - qd.x, b.y - qd.y) < 70 * k) { // queen duel
        if ((upg.queen || 0) >= 6) { b.stun = 2; b.mode = 'fight'; b.dash = null; b.tx = b.x; damageBoss(qd.dmg * 2, b); floatText(b.x, b.y - 46 * k, 'KNOCKED OUT', '#ffd36b'); say('Yo cuh stop doin dat', { force: true }, b); return; }
        killQueen('The hornet got her');
      }
      if (!d.hit && Math.hypot(b.x - spoon.x, b.y - spoon.y) < 58 * k + spoonSize() * 0.35) {""")

# ---------- queen vs hornet ----------
rep("""        qd.hitList.push(ob); shake = reduceMotion ? 0 : 8;""",
    """        qd.hitList.push(ob); shake = reduceMotion ? 0 : 8;
        if (ob.def.key === 'hornet') { ob.queenUsed = true; say('Yo cuh stop doin dat', { force: true }, ob); }""")
rep("""        if (state !== 'play' || !qd) return;
      }
      if (qd.x < -110 || qd.x > W + 110 || qd.y < combBottom() - 60 || qd.y > H + 60 || qd.t > (fl.length > 1 ? 1.8 : 1.3)) {""",
    """        if (state !== 'play' || !qd) return;
        if (ob.def.key === 'hornet' && fighting(ob)) { // below the top level the hornet gets her partway through her attack
          qd.hornetHits = (qd.hornetHits || 0) + 1;
          const lv = upg.queen || 0, charges = PW.queen(lv).charges;
          if (lv < MAX_LV && qd.hornetHits >= charges - 1) { killQueen(); return; }
        }
      }
      for (const n of proj) if (n.k === 'nest' && !n.dead && Math.hypot(n.x - qd.x, n.y - qd.y) < 70 * queenScale() + n.r) { n.dead = true; nestDown(n); } // she smashes the nest
      if (qd.x < -110 || qd.x > W + 110 || qd.y < combBottom() - 60 || qd.y > H + 60 || qd.t > (fl.length > 1 ? 1.8 : 1.3)) {""")

# ---------- defeat: Terraria-style, achievements ----------
rep("""    b.hp = 0; b.mode = 'down'; b.t = 0; b.vy = -220; b.dash = null; b.say = null; b.pushup = 0;""",
    """    b.hp = 0; b.mode = 'down'; b.t = 0; b.vy = -220; b.dash = null; b.say = null; b.pushup = 0; b.hawk = null; b.ball = null; b.stun = 0;
    if (b.def.key === 'hornet') { // he breaks into pieces, Terraria-style
      shatter('hornet', b.x, b.y, bossK() * 0.9, spoon.x < b.x); b.alpha = 0; b.gone = true;
      for (const q of proj) if (q.owner === b && (q.k === 'mini' || q.k === 'nest')) q.dead = true;
      if (b.queenUsed && !b.queenDied) achUnlock('longlive');
    }""")
rep("""ironfit: 'bigman', apologist: 'notes', looks: 'mogger', disprover: 'blocked' }[b.def.key];""",
    """ironfit: 'bigman', apologist: 'notes', looks: 'mogger', disprover: 'blocked', hornet: 'pest' }[b.def.key];""")
rep("""        b.vy += 520 * dt; b.y += b.vy * dt; b.rot += dt * 2.2 * (b.i % 2 ? -1 : 1); b.alpha = Math.max(0, 1 - b.t / 2.2);""",
    """        b.vy += 520 * dt; b.y += b.vy * dt; b.rot += dt * 2.2 * (b.i % 2 ? -1 : 1); b.alpha = b.gone ? 0 : Math.max(0, 1 - b.t / 2.2);""")

# ---------- stingers, venom ----------
rep("""    else if (p.k === 'job') { spoon.slow = 2.5;""",
    """    else if (p.k === 'stinger') { // venom: purity drains for a few seconds and you're slowed; Beeswax coating weakens both
      spoon.venom = 3.5; spoon.venomDps = 2.2 * (1 - 0.05 * (upg.wax || 0)); spoon.sting = 2.2;
      floatText(spoon.x, spoon.y - 82, 'venom', '#9be36b');
    }
    else if (p.k === 'job') { spoon.slow = 2.5;""")
rep("""    spoon.slow = Math.max(0, spoon.slow - dt);
    updatePowers(dt);""", """    spoon.slow = Math.max(0, spoon.slow - dt);
    spoon.sting = Math.max(0, spoon.sting - dt);
    if (spoon.venom > 0) {
      spoon.venom -= dt;
      if (!invincible) {
        purity = Math.max(0, purity - spoon.venomDps * dt); tally.minPurity = Math.min(tally.minPurity, purity);
        if (purity <= 0) { lastHit = { name: 'Venom', boss: hornetOf() || boss, toxin: false }; gameOver(); return; }
      }
    }
    updatePowers(dt);""")
rep("""    if (spoon.slow > 0) slow = Math.min(slow, 0.35);""",
    """    if (spoon.slow > 0) slow = Math.min(slow, 0.35);
    if (spoon.sting > 0) slow = Math.min(slow, 1 - 0.5 * waxGrip()); // stung: slower, less so with Beeswax coating""")
rep("""    spoon.x += (spoon.tx - spoon.x) * Math.min(1, dt * 14 * slow);""",
    """    spoon.x += (spoon.tx - spoon.x) * Math.min(1, dt * 14 * slow);
    spoon.vx = (spoon.x - spoon.px) / Math.max(dt, 1e-3); spoon.px = spoon.x; // how fast it's moving, for swatting""")
rep("""    else if (spoon.slow > 0) txt('working at loksd corp...', x, y - S * .7, 10, '#ffd36b', 700);""",
    """    else if (spoon.slow > 0) txt('working at loksd corp...', x, y - S * .7, 10, '#ffd36b', 700);
    else if (spoon.venom > 0) txt('venom...', x, y - S * .7, 10, '#9be36b', 700);""")

# ---------- projectiles: minis, stingers at Colonex, the nest ----------
rep("""        if (k === 'quarks' || k === 'call') {""", """        if (k === 'mini' && updateMini(p, dt, S)) continue;
        if (k === 'quarks' || k === 'call') {""")
rep("""      if (k === 'knightBack') {""", """      if (k === 'stingerAlly') { // flies at Colonex and stuns him
        p.x += p.vx * rdt; p.y += p.vy * rdt;
        if (ally && Math.hypot(ally.x - p.x, ally.y - p.y) < 34) { proj.splice(i, 1); stunAlly(); continue; }
        if (p.x < -40 || p.x > W + 40 || p.y > H + 40 || p.y < -40) proj.splice(i, 1);
        continue;
      }
      if (k === 'nest') {
        p.spawnT -= dt;
        if (p.spawnT <= 0 && p.owner && fighting(p.owner)) { spawnMini(p.owner, p.x, p.y + p.r); p.spawnT = 3.4; }
        continue;
      }
      if (k === 'knightBack') {""")
rep("""  function updateGlobs(dt) {
    const k = bossK();
    for (let i = globs.length - 1; i >= 0; i--) {
      const g = globs[i];""", """  function nestDown(n) {
    for (let i = 0; i < 6; i++) splat(n.x + rnd(-20, 20), n.y + rnd(-20, 20), '#cfc3a8', 8);
    floatText(n.x, n.y + 30, 'Nest destroyed', '#ffd36b'); sfx.bossDown();
  }
  function updateGlobs(dt) {
    const k = bossK();
    for (let i = globs.length - 1; i >= 0; i--) {
      const g = globs[i];
      const nest = proj.find(n => n.k === 'nest' && !n.dead && Math.abs(n.x - g.x) < 90 * k && (!g.tgt || Math.abs(n.x - g.x) < Math.abs(g.tgt.x - g.x)));
      if (nest) { // honey flicked under the paper nest goes into it instead
        g.vx = clamp((nest.x - g.x) * 5, -700, 700); g.x += g.vx * dt; g.y += g.vy * dt;
        if (Math.hypot(g.x - nest.x, g.y - nest.y) < nest.r + g.r + 6) { globs.splice(i, 1); splat(g.x, g.y, '#f2a516', 5); nest.hp -= g.dmg; if (nest.hp <= 0) { nest.dead = true; nestDown(nest); } }
        else if (g.y < -30) globs.splice(i, 1);
        continue;
      }""")

# ---------- bees: respawn, bee ball ----------
rep("""    const bs = beeStats(upg.bee);
    while (bees.length < bs.n) bees.push(""", """    const bs = beeStats(upg.bee);
    for (let i = beeDown.length - 1; i >= 0; i--) { beeDown[i] -= dt; if (beeDown[i] <= 0) beeDown.splice(i, 1); }
    const ballOf = bosses.find(b => b.ball && fighting(b));
    while (bees.length + beeDown.length < bs.n) bees.push(""")
rep("""    bees.forEach((b, bi) => {
      b.ph += dt; b.rest = Math.max(0, b.rest - dt);""", """    bees.forEach((b, bi) => {
      b.ph += dt; b.rest = Math.max(0, b.rest - dt);
      if (ballOf) { // bee ball: every bee piles onto the hornet
        const a = b.ph * 5 + bi * 1.3, rr = 30 * bossK();
        const tx = ballOf.x + Math.cos(a) * rr, ty = ballOf.y + Math.sin(a * 1.3) * rr * 0.8;
        b.x += (tx - b.x) * Math.min(1, dt * 8); b.y += (ty - b.y) * Math.min(1, dt * 8); b.dir = Math.cos(a) < 0 ? 1 : -1;
        if (b.tgt) { b.tgt.bee = null; b.tgt = null; }
        return;
      }""")

# ---------- Colonex stunned ----------
rep("""    ally.shootT -= dt;
    if (ally.shootT <= 0) {""", """    if (ally.stun > 0) ally.stun -= dt;
    ally.shootT -= dt;
    if (ally.shootT <= 0 && !(ally.stun > 0)) {""")
rep("""    drawColonexFigure({ pose: ally.shootT > 2.4 ? 1 : 0 }, t, false);""",
    """    drawColonexFigure({ pose: ally.shootT > 2.4 ? 1 : 0 }, t, false);
    if (ally.stun > 0) for (let i = 0; i < 3; i++) { const a = t * 4 + i * 2.1; txt('*', Math.cos(a) * 26, -96 + Math.sin(a) * 6, 22, '#ffd36b', 900); } // stung""")

# ---------- update loop: gore ----------
rep("""    updateGlobs(dt); if (state !== 'play') return;
    updateAmbient(dt);""", """    updateGlobs(dt); if (state !== 'play') return;
    updateGore(dt);
    updateAmbient(dt);""")

# ---------- drawing ----------
rep("""  const BOSS_DRAW = { keeper: drawKeeper, colonex: drawColonex, ceo: drawCEO, ironfit: drawIronfit, apologist: drawApologist, looks: drawLooks, disprover: drawDisprover };""",
    """  // the giant hornet, side on, faceless: orange head, dark thorax, banded abdomen, a big stinger
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
  const BOSS_DRAW = { keeper: drawKeeper, colonex: drawColonex, ceo: drawCEO, ironfit: drawIronfit, apologist: drawApologist, looks: drawLooks, disprover: drawDisprover, hornet: drawHornet };""")
rep("""      case 'knight': drawKnight(p, t); return;""", """      case 'knight': drawKnight(p, t); return;
      case 'nest': drawNest(p, t); return;""")
rep("""          case 'knightBack': ctx.scale(p.c / 34 * 0.8, p.c / 34 * 0.8); knightShape(); break;""",
    """          case 'knightBack': ctx.scale(p.c / 34 * 0.8, p.c / 34 * 0.8); knightShape(); break;
          case 'mini': ctx.scale((p.vx < 0 ? -1 : 1) * 0.24, 0.24); drawHornetBody(t, Math.sin(p.ph) * 0.4); break;
          case 'stinger': case 'stingerAlly':
            ctx.rotate(p.ang); ctx.fillStyle = '#2a1606'; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-8, -3.5); ctx.lineTo(-8, 3.5); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#f2a516'; ctx.fillRect(-12, -3, 5, 6); break;""")
rep("""    for (const b of bosses) drawBoss(b, t);""", """    if (bosses.some(b => b.p3 && fighting(b))) { ctx.fillStyle = `rgba(200,16,46,${0.07 + 0.04 * Math.sin(t * 3)})`; ctx.fillRect(0, combBottom(), W, H - combBottom()); } // slaughter phase
    for (const b of bosses) drawBoss(b, t);""")
rep("""    drawQueenFx(t);""", """    drawQueenFx(t);
    drawGore();""")
rep("    ctx.globalAlpha = Math.min(1, b.say.t * 4) * Math.max(b.alpha, b.def.joins ? 1 : 0);", "    ctx.globalAlpha = Math.min(1, b.say.t * 4) * Math.max(b.alpha, b.def.joins || b.gone ? 1 : 0);")
rep("""    const name = (two ? b.def.tag : b.def.name) + (b.p2 ? '  ·  PHASE 2' : '');""",
    """    const name = (two ? b.def.tag : b.def.name) + (b.p3 ? '  ·  PHASE 3' : b.p2 ? '  ·  PHASE 2' : '');""")

open(fn, 'w').write(s)
print('ok')
