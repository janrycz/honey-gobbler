import sys
fn = sys.argv[1]
s = open(fn).read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)

# ============ the hornet: a final boss ============
rep("""      p2line: 'Fine. Bring your whole hive.', p2attacks: ['stingerFan'],
      p3line: 'Slaughter phase.', p3attacks: ['swarm', 'diveBite', 'diveBite'],""",
    """      p2line: 'Fine. Bring your whole hive.', p2attacks: ['scouts', 'stingerFan', 'massacre', 'curtain2', 'spray'],
      p3line: 'Slaughter phase.', p3attacks: ['diveChain', 'spray', 'curtain2', 'bigStinger', 'swarm', 'diveChain', 'massacre', 'stingerFan'],
      p3at: 0.1, p3only: true, p3pace: 0.6, pace: 0.8, // faster than anyone, faster again in phase 2, nearly nonstop in the last 10%""")
rep("      attacks: ['minis', 'stinger', 'hawk', 'nest', 'stinger', 'stingAlly', 'minis', 'hawk'],",
    "      attacks: ['bigStinger', 'minis', 'spray', 'hawk', 'curtain', 'nest', 'bigStinger', 'mark', 'stingAlly'],")
rep("    if (b.def.p3attacks && !b.p3 && b.hp / b.max <= 0.25) { // the hornet's slaughter phase",
    "    if (b.def.p3attacks && !b.p3 && b.hp / b.max <= (b.def.p3at || 0.25)) { // the hornet's slaughter phase")
rep("""      const list = b.p3 ? b.def.attacks.concat(b.def.p2attacks, b.def.p3attacks) : b.p2 ? b.def.attacks.concat(b.def.p2attacks) : b.def.attacks;""",
    """      const list = b.p3 && b.def.p3only ? b.def.p3attacks : b.p3 ? b.def.attacks.concat(b.def.p2attacks, b.def.p3attacks) : b.p2 ? b.def.attacks.concat(b.def.p2attacks) : b.def.attacks;""")
rep("      b.atkT = cd * (b.p2 ? 0.8 : 1) * (b.p3 ? 0.85 : 1) * b.speed;",
    "      b.atkT = cd * (b.p2 ? 0.8 : 1) * (b.p3 ? b.def.p3pace || 0.85 : 1) * b.speed;")
# the 10% line on his health bar
rep("    ctx.fillStyle = 'rgba(246,227,180,.4)'; ctx.fillRect(cx - 1, y + 14, 2, 14);\n    if (bw && !brawlWaiting(b))",
    "    ctx.fillStyle = 'rgba(246,227,180,.4)'; ctx.fillRect(cx - 1, y + 14, 2, 14);\n    if (b.def.p3at) { ctx.fillStyle = 'rgba(255,90,60,.85)'; ctx.fillRect(x + w * b.def.p3at - 1, y + 14, 2, 14); } // where the slaughter phase starts\n    if (bw && !brawlWaiting(b))")

# while his scouts are out he hangs back; spraying, hawking with teeth
rep("""    if (b.def.key === 'hornet') {
      if (b.p2 && !b.ball) {""", """    if (b.def.key === 'hornet') {
      if (proj.some(q => q.k === 'scout' && !q.dead && q.owner === b && q.t < q.life)) b.atkT = Math.max(b.atkT, 0.8); // his scouts fight first
      if (b.spray) { // hovering over you, emptying his stingers where you're heading
        const sp = b.spray; b.tx = clamp(spoon.x, 60, W - 60); b.wanderT = 1; sp.next -= dt;
        if (sp.next <= 0 && sp.left > 0) { sp.left--; sp.next = sp.every; shootStinger(b, rnd(-0.05, 0.05), { lead: true }); }
        if (sp.left <= 0) b.spray = null;
      }
      if (b.p2 && !b.ball) {""")
rep("        if (b.ballT <= 0 && bees.length >= 3 && !b.hawk) {", "        if (b.ballT <= 0 && bees.length >= 6 && !b.hawk) {")
rep("        r.t += dt; r.acc += dt * (3 + 1.6 * bees.length); b.atkT += dt; // he can't attack while he's cooking",
    "        r.t += dt; r.acc += dt * (3 + 0.8 * bees.length); b.atkT += dt; // he can't attack while he's cooking")
rep("        if (r.t > r.dur || bees.length < 2) { b.ball = null; b.ballT = 22; }",
    "        if (r.t > r.dur || bees.length < 4) { b.ball = null; b.ballT = 22; }")
rep("""        const ty = Math.max(home, spoon.y - 170 * k);
        b.x += (tx - b.x) * Math.min(1, dt * 3); b.y += (ty - b.y) * Math.min(1, dt * 3); b.yOff = b.y - home;""",
    """        const ty = Math.max(home, spoon.y - 100 * k + Math.sin(hk.t * 3) * 38 * k); // bobbing low by your spoon: don't go under him
        b.x += (tx - b.x) * Math.min(1, dt * 3); b.y += (ty - b.y) * Math.min(1, dt * 3); b.yOff = b.y - home;
        hk.shootT = (hk.shootT ?? 0.5) - dt;
        if (hk.shootT <= 0) { hk.shootT = b.p2 ? 0.55 : 0.75; shootStinger(b, 0); } // point-blank stings
        if (Math.hypot(b.x - spoon.x, b.y - spoon.y) < 58 * k + spoonSize() * 0.4) { hurtSpoon(10, '#e89a2c', 'Hornet', { boss: b }); if (state !== 'play') return; }""")

# dives: shorter warnings, chains of three in the slaughter phase, the massacre sweep
rep("    if (d.st === 'tele') { if (d.t > 0.85 * teleMul()) { d.st = 'go'; d.t = 0; d.hit = false; sfx.whoosh(); } return; }",
    """    if (d.st === 'rise') { // between chained dives he pulls up first, so the next one comes from above
      const u = ease(Math.min(1, d.t / 0.32));
      b.x = d.bx + (d.rx - d.bx) * u; b.y = d.by + (d.ry - d.by) * u;
      if (d.t > 0.32) { const aim = hornetAim(); d.st = 'tele'; d.t = 0; d.fx = b.x; d.fy = b.y; d.tx = clamp(aim.x, 40, W - 40); d.ty = aim.queen ? aim.y : spoon.y - 30; sfx.warn(); }
      return;
    }
    if (d.st === 'tele') {
      if (d.massacre) { b.x += (d.fx - b.x) * Math.min(1, dt * 5); b.y += (d.fy - b.y) * Math.min(1, dt * 5); } // off to the side first
      if (d.t > (d.tele || 0.85) * teleMul()) { d.st = 'go'; d.t = 0; d.hit = false; sfx.whoosh(); }
      return;
    }""")
rep("      const u = Math.min(1, d.t / 0.45);", "      const u = Math.min(1, d.t / (d.dur || 0.45));")
rep("      if (!d.hit && Math.hypot(b.x - spoon.x, b.y - spoon.y) < 58 * k + spoonSize() * 0.35) {",
    """      if (d.massacre) for (const bee of bees.slice()) if (Math.abs(bee.x - b.x) < 46 * Math.max(0.7, G)) killBee(bee, 8); // every worker he passes
      if (!d.hit && d.dmg > 0 && Math.hypot(b.x - spoon.x, b.y - spoon.y) < 58 * k + spoonSize() * 0.35) {""")
rep("      if (u >= 1) { d.st = 'back'; d.t = 0; d.bx = b.x; d.by = b.y; shake = reduceMotion ? 0 : 6; }",
    """      if (u >= 1) {
        if (d.chain > 0) { d.chain--; d.st = 'rise'; d.t = 0; d.bx = b.x; d.by = b.y; d.rx = clamp(b.x + rnd(-170, 170) * Math.max(0.7, G), 60, W - 60); d.ry = bossHome() + 40 * k; }
        else { d.st = 'back'; d.t = 0; d.bx = b.x; d.by = b.y; }
        shake = reduceMotion ? 0 : 6;
      }""")
rep("    b.x = d.bx + (d.fx - d.bx) * u; b.y = d.by + (bossHome() - d.by) * u;",
    "    b.x = d.bx + ((d.hx ?? d.fx) - d.bx) * u; b.y = d.by + (bossHome() - d.by) * u;")

# helpers: speed by phase, aimed and leading stingers, the curtain, killing bees properly
rep("""  function shootStinger(b, da) {
    const k = bossK(), x0 = b.x + 24 * k * (spoon.x < b.x ? -1 : 1), y0 = b.y + 22 * k, aim = hornetAim(), a = Math.atan2(aim.y - y0, aim.x - x0) + da;
    proj.push(P({ k: 'stinger', name: 'Stinger', color: '#2a1606', x: x0, y: y0, vx: Math.cos(a) * 360, vy: Math.sin(a) * 360, r: 7, dmg: 6, ang: a }));
  }""", """  const hornetSpd = b => (b && b.p3 ? 1.22 : b && b.p2 ? 1.1 : 1); // his stingers fly faster in each phase
  function shootStinger(b, da, o = {}) {
    const k = bossK(), x0 = b.x + 24 * k * (spoon.x < b.x ? -1 : 1), y0 = b.y + 22 * k, aim = hornetAim(), v = 360 * hornetSpd(b);
    let ax = aim.x;
    if (o.lead && !aim.queen) ax += clamp(spoon.vx || 0, -900, 900) * (Math.hypot(aim.x - x0, aim.y - y0) / (v * 1.5)) * 0.8; // aims where you're going
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
    spoon.venom = Math.max(spoon.venom, full ? 3.5 : 2); spoon.venomDps = 2.2 * w; spoon.sting = Math.max(spoon.sting, full ? 2.2 : 1.2);
    spoon.vstack = (spoon.vstackT > 0 ? spoon.vstack : 0) + n; spoon.vstackT = 4;
    if (spoon.vstack < 3) { floatText(spoon.x, spoon.y - 82, 'venom ' + spoon.vstack + '/3', '#9be36b'); return; }
    spoon.vstack = 0; spoon.vstackT = 0; spoon.anaph = 2.4;
    const d = Math.max(1, Math.round(12 * w));
    if (!invincible) { purity = Math.max(0, purity - d); tally.minPurity = Math.min(tally.minPurity, purity); }
    floatText(spoon.x, spoon.y - 82, 'ANAPHYLAXIS', '#9be36b'); floatText(spoon.x, spoon.y - 104, '−' + d + '% purity', '#ff9a8a');
    shake = reduceMotion ? 0 : 8; hurtFlash = 0.4; sfx.bad();
    if (purity <= 0) { lastHit = { name: 'Anaphylaxis', boss: hornetOf() || boss, toxin: false }; gameOver(); }
  }""")
rep("""  function killBee(bee) {
    const i = bees.indexOf(bee); if (i < 0) return;
    bees.splice(i, 1); beeDown.push(4); // she's back in 4 s
    if (bee.tgt && bee.tgt.bee === bee) bee.tgt.bee = null;
    if (bee.carry) { bee.carry.held = null; bee.carry = null; }
    splat(bee.x, bee.y, '#f2c94c', 6); floatText(bee.x, bee.y - 14, 'Bee down', '#ff9a8a');
  }""", """  function killBee(bee, down = 4) {
    const i = bees.indexOf(bee); if (i < 0) return;
    bees.splice(i, 1); beeDown.push(down); // she's back in a few seconds
    if (bee.tgt && bee.tgt.bee === bee) bee.tgt.bee = null;
    if (bee.carry) { bee.carry.held = null; bee.carry = null; }
    shatter('bee', bee.x, bee.y, 0.75 * Math.max(0.7, G), bee.dir < 0); // she falls apart, like the queen
    splat(bee.x, bee.y, '#f2c94c', 8); floatText(bee.x, bee.y - 14, 'Bee down', '#ff5a3c'); sfx.crunch();
  }""")
rep("    const parts = kind === 'hornet' ? ['hwing', 'hwing', 'habdomen', 'hthorax', 'hhead'] : ['qwing', 'qwing', 'qabdomen', 'qthorax', 'qhead'];",
    "    const parts = kind === 'hornet' ? ['hwing', 'hwing', 'habdomen', 'hthorax', 'hhead'] : kind === 'bee' ? ['qwing', 'qwing', 'babdomen', 'bhead'] : ['qwing', 'qwing', 'qabdomen', 'qthorax', 'qhead'];")
rep("""    else if (part === 'qthorax') {""", """    else if (part === 'babdomen') {
      ctx.fillStyle = '#f2c94c'; ctx.beginPath(); ctx.ellipse(0, 0, 13, 9, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#2a1606'; for (let i = 0; i < 3; i++) ctx.fillRect(-8 + i * 6, -8, 3, 16);
    }
    else if (part === 'bhead') { ctx.fillStyle = '#2a1606'; ctx.beginPath(); ctx.ellipse(0, 0, 6.5, 6, 0, 0, TAU); ctx.fill(); }
    else if (part === 'qthorax') {""")
rep("    hit: () => tone(240, 110, 0.07, 'square', 0.05),",
    "    hit: () => tone(240, 110, 0.07, 'square', 0.05),\n"
    "    crunch: () => { tone(900, 140, 0.07, 'square', 0.07); setTimeout(() => tone(160, 60, 0.12, 'sawtooth', 0.09), 40); }, // a worker bee gets got\n"
    "    zip: () => tone(420, 1500, 0.12, 'sawtooth', 0.035), // a mini hornet lunges")

# mini hornets: little stingers, lunging at bees, coming for you when you're marked
rep("""    if (p.t > p.life || p.leave) { p.vx *= 0.96; p.vy = -320; if (p.y < combBottom() - 40) p.dead = true; return false; }
    if (!p.bee || !bees.includes(p.bee)) p.bee = nearestBee(p.x, p.y);
    const tg = p.bee || { x: spoon.x, y: spoon.y - 10 }, sp = (p.bee ? 230 : 170) * Math.max(0.7, G);""",
    """    if (p.t > p.life || p.leave) { p.vx *= 0.96; p.vy = -320; if (p.y < combBottom() - 40) p.dead = true; return false; }
    const own = p.owner, ph = hornetSpd(own);
    if (p.y > combBottom() + 20) { // little stingers at you
      p.shootT = (p.shootT ?? rnd(0.9, 2)) - dt;
      if (p.shootT <= 0) {
        p.shootT = rnd(1.8, 2.8) / ph / (spoon.mark > 0 ? 1.5 : 1);
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
    const tg = p.bee || { x: spoon.x, y: spoon.y - 10 }, sp = (p.bee ? 230 : spoon.mark > 0 ? 230 : 170) * Math.max(0.7, G);""")

# the new attacks
rep("""    stinger(b) {
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
      if (!ally || !allyActive()) return ATTACKS.stinger(b);""",
    """    stinger(b) {
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
      const n = b.p3 ? 14 : b.p2 ? 12 : 10;
      b.spray = { left: n, next: 0.35, every: b.p3 ? 0.13 : 0.17 };
      return 1.6 + n * 0.17;
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
      for (const sd of [-1, 1]) proj.push(P({ k: 'scout', harmless: true, dmg: 0, name: 'Scout hornet', color: '#e89a2c', x: sd < 0 ? -40 : W + 40, y: bossHome() + 50 * k, hx: sd < 0 ? 0.22 : 0.78, hp, max: hp, shootT: 1.2 + (sd > 0 ? 0.7 : 0), diveT: 3 + (sd > 0 ? 1.8 : 0), life: 16, r: 24 * k, owner: b, ph: rnd(0, 6) }));
      return 2;
    },
    diveChain(b) { // three bites in a row
      ATTACKS.diveBite(b);
      b.dash.chain = 2; b.dash.tele = 0.5;
      say(pick(['Bite. Bite. Bite.', 'Mandibles.']), { force: true });
      return 4.2;
    },
    stingAlly(b) {
      if (!ally || !allyActive()) return ATTACKS.bigStinger(b);""")
rep("""      b.dash = { st: 'tele', t: 0, fx: b.x, fy: b.y, tx: clamp(aim.x, 40, W - 40), ty: aim.queen ? aim.y : spoon.y - 30, dmg: 18, name: 'Mandible bite', color: '#ff9a3c' };""",
    """      b.dash = { st: 'tele', t: 0, tele: b.p3 ? 0.55 : 0.8, fx: b.x, fy: b.y, hx: b.x, tx: clamp(aim.x, 40, W - 40), ty: aim.queen ? aim.y : spoon.y - 30, dmg: 18, name: 'Mandible bite', color: '#ff9a3c' };""")

# projectiles: the big stinger, the gap marker, scouts, a turret nest
rep("""      if (k === 'nest') {
        p.spawnT -= dt;
        if (p.spawnT <= 0 && p.owner && fighting(p.owner)) { spawnMini(p.owner, p.x, p.y + p.r); p.spawnT = 3.4; }
        continue;
      }""", """      if (k === 'nest') {
        p.spawnT -= dt;
        if (p.spawnT <= 0 && p.owner && fighting(p.owner)) { spawnMini(p.owner, p.x, p.y + p.r); p.spawnT = 3.4; }
        p.shootT = (p.shootT ?? 1.6) - dt; // it shoots too, so knock it down
        if (p.shootT <= 0 && p.owner && fighting(p.owner)) {
          p.shootT = p.owner.p2 ? 2.0 : 2.6;
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
        if (p.shootT <= 0) { p.shootT = 1.6; const a = Math.atan2(spoon.y - 10 - p.y, spoon.x - p.x), v = 330 * hornetSpd(o); proj.push(P({ k: 'stinger', name: 'Stinger', color: '#2a1606', x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 6, dmg: 6, ang: a, owner: o })); }
        p.diveT -= dt;
        if (p.diveT <= 0) { p.diveT = 4.5; p.dive = { st: 'tele', t: 0, fx: p.x, fy: p.y, tx: clamp(spoon.x, 40, W - 40), ty: spoon.y - 30 }; sfx.warn(); }
        continue;
      }""")
rep("""  function nestDown(n) {""", """  function scoutDown(n) {
    shatter('hornet', n.x, n.y, bossK() * 0.4, spoon.x < n.x);
    floatText(n.x, n.y - 20, 'Scout down', '#ffd36b'); sfx.bossDown();
  }
  function nestDown(n) {""")
rep("""      const nest = proj.find(n => n.k === 'nest' && !n.dead && Math.abs(n.x - g.x) < 90 * k && (!g.tgt || Math.abs(n.x - g.x) < Math.abs(g.tgt.x - g.x)));""",
    """      const nest = proj.find(n => (n.k === 'nest' || (n.k === 'scout' && n.t < n.life)) && !n.dead && Math.abs(n.x - g.x) < 90 * k && (!g.tgt || Math.abs(n.x - g.x) < Math.abs(g.tgt.x - g.x)));""")
rep("""nest.hp -= g.dmg; if (nest.hp <= 0) { nest.dead = true; nestDown(nest); } }""",
    """nest.hp -= g.dmg; if (nest.hp <= 0) { nest.dead = true; if (nest.k === 'scout') scoutDown(nest); else nestDown(nest); } }""")
rep("      for (const n of proj) if (n.k === 'nest' && !n.dead && Math.hypot(n.x - qd.x, n.y - qd.y) < 70 * queenScale() + n.r) { n.dead = true; nestDown(n); } // she smashes the nest",
    "      for (const n of proj) if ((n.k === 'nest' || n.k === 'scout') && !n.dead && Math.hypot(n.x - qd.x, n.y - qd.y) < 70 * queenScale() + n.r) { n.dead = true; if (n.k === 'scout') scoutDown(n); else nestDown(n); } // she smashes nests and scouts")
rep("      for (const q of proj) if (q.owner === b && (q.k === 'mini' || q.k === 'nest')) q.dead = true;",
    "      for (const q of proj) if (q.owner === b && (q.k === 'mini' || q.k === 'nest' || q.k === 'scout')) q.dead = true;")

# hits: venom stacks, the mark, the big stinger breaks a shield
rep("""    if (!hurtSpoon(p.dmg, p.color, p.name, { boss: o, notation })) return;""",
    """    if (!hurtSpoon(p.dmg, p.color, p.name, { boss: o, notation, pierce: p.k === 'bigSting' })) return;""")
rep("""    else if (p.k === 'stinger') { // venom: purity drains for a few seconds and you're slowed; Beeswax coating weakens both
      spoon.venom = 3.5; spoon.venomDps = 2.2 * (1 - 0.05 * (upg.wax || 0)); spoon.sting = 2.2;
      floatText(spoon.x, spoon.y - 82, 'venom', '#9be36b');
    }""", """    else if (p.k === 'stinger' || p.k === 'bigSting' || p.k === 'miniSting') venomHit(p.k === 'bigSting' ? 2 : 1, p.k !== 'miniSting'); // venom: drains purity and slows you; Beeswax coating weakens it
    else if (p.k === 'markDart') { spoon.mark = 5; floatText(spoon.x, spoon.y - 82, 'MARKED', '#ff5a3c'); for (const q of proj) if (q.k === 'mini') q.bee = null; }""")
rep("""    if (shieldHits > 0) { // the Honeycomb shield takes it
      shieldHits--;""", """    if (shieldHits > 0) { // the Honeycomb shield takes it (the giant stinger goes straight through the wax)
      if (opts.pierce) shieldHits = 1;
      shieldHits--;""")
# spoon state for venom stacks, anaphylaxis, the mark
rep("venom: 0, venomDps: 0, sting: 0, vx: 0, px: W / 2 };", "venom: 0, venomDps: 0, sting: 0, vstack: 0, vstackT: 0, anaph: 0, mark: 0, vx: 0, px: W / 2 };")
rep("    spoon.sting = Math.max(0, spoon.sting - dt);",
    "    spoon.sting = Math.max(0, spoon.sting - dt); spoon.anaph = Math.max(0, spoon.anaph - dt); spoon.vstackT = Math.max(0, spoon.vstackT - dt); spoon.mark = Math.max(0, spoon.mark - dt);")
rep("    if (spoon.sting > 0) slow = Math.min(slow, 1 - 0.5 * waxGrip()); // stung: slower, less so with Beeswax coating",
    "    if (spoon.sting > 0) slow = Math.min(slow, 1 - 0.5 * waxGrip()); // stung: slower, less so with Beeswax coating\n    if (spoon.anaph > 0) slow = Math.min(slow, 1 - 0.75 * waxGrip());")
rep("Object.assign(spoon, { hurt: 0, frozen: 0, slow: 0, venom: 0, sting: 0 });", "Object.assign(spoon, { hurt: 0, frozen: 0, slow: 0, venom: 0, sting: 0, vstack: 0, anaph: 0, mark: 0 });", 2)
rep("purity = 50; spoon.hurt = 2.2; spoon.frozen = 0; spoon.slow = 0; spoon.venom = 0; spoon.sting = 0;",
    "purity = 50; spoon.hurt = 2.2; spoon.frozen = 0; spoon.slow = 0; spoon.venom = 0; spoon.sting = 0; spoon.vstack = 0; spoon.anaph = 0; spoon.mark = 0;")

# drawing
rep("""          case 'stinger': case 'stingerAlly':""", """          case 'miniSting': ctx.rotate(p.ang); ctx.scale(0.6, 0.6); ctx.fillStyle = '#2a1606'; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-8, -3.5); ctx.lineTo(-8, 3.5); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#ff9a3c'; ctx.fillRect(-12, -3, 5, 6); break;
          case 'curtainSting': case 'markDart':
          case 'stinger': case 'stingerAlly':
            if (p.k === 'markDart') { ctx.fillStyle = 'rgba(200,16,46,.35)'; circle(0, 0, 11); ctx.fill(); }""")
rep("      case 'nest': drawNest(p, t); return;",
    """      case 'nest': drawNest(p, t); return;
      case 'bigSting': drawBigSting(p, t); return;
      case 'gapMark': drawGapMark(p, t); return;
      case 'scout': drawScout(p, t); return;""")
rep("""  function drawNest(p, t) {""", """  function drawBigSting(p, t) {
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
  function drawNest(p, t) {""")
rep("  const SPECIAL = { knight: 1,", "  const SPECIAL = { gapMark: 1, knight: 1,")
# venom pips and the mark on the spoon
rep("""  function drawPowerFx(t) {
    if (!spoon) return;""", """  function drawPowerFx(t) {
    if (!spoon) return;
    if (spoon.mark > 0) { ctx.strokeStyle = `rgba(226,32,48,${0.5 + 0.4 * Math.sin(t * 12)})`; ctx.lineWidth = 3; circle(spoon.x, spoon.y - 10, spoonSize() * 0.75); ctx.stroke(); txt('MARKED', spoon.x, spoon.y - spoonSize() * 0.75 - 18, 11, '#ff5a3c', 900); }
    if (spoon.vstack > 0 && spoon.vstackT > 0) for (let i = 0; i < 3; i++) { ctx.fillStyle = i < spoon.vstack ? '#9be36b' : 'rgba(155,227,107,.25)'; circle(spoon.x - 14 + i * 14, spoon.y + 18, 5); ctx.fill(); }""")

# ============ worker bees: twice as many, each doing half as much ============
rep("  const BEE_COUNT = [0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5];", "  const BEE_COUNT = [0, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10]; // twice as many as before, each doing half the work (BEE_WORK)")
rep("  const beeStats = lv => ({ n: BEE_COUNT[lv], speed: 1 + 0.06 * Math.max(0, lv - 1), rest: 1 - 0.05 * Math.max(0, lv - 1), jar: BEE_JAR[lv], big: BEE_BIG[lv] });",
    "  const BEE_WORK = { rest: 3, speed: 0.8 }; // each bee rests longer and flies a bit slower, so the swarm does what the old one did\n"
    "  const beeStats = lv => ({ n: BEE_COUNT[lv], speed: 1 + 0.06 * Math.max(0, lv - 1), rest: BEE_WORK.rest * (1 - 0.05 * Math.max(0, lv - 1)), jar: BEE_JAR[lv], big: BEE_BIG[lv] });")
rep("    const sp = BEE_SPEED * G * bs.speed * (0.6 + 0.4 * fallMul());", "    const sp = BEE_SPEED * BEE_WORK.speed * G * bs.speed * (0.6 + 0.4 * fallMul());")

# ============ the other bosses: faster, harder-hitting attacks (no extra health) ============
rep("  function hurtSpoon(dmg, color, name, opts = {}) {\n    if (spoon.hurt > 0 || state !== 'play') return false;",
    "  function hurtSpoon(dmg, color, name, opts = {}) {\n    if (spoon.hurt > 0 || state !== 'play') return false;\n    if (opts.boss && opts.boss.def && opts.boss.def.dmgMul) dmg = Math.round(dmg * opts.boss.def.dmgMul); // some bosses hit harder")
rep("hp: 170, mono: true, joins: true,", "hp: 170, mono: true, joins: true, pace: 0.85, dmgMul: 1.1,")
rep("hp: 250, pace: 0.87,", "hp: 250, pace: 0.8, dmgMul: 1.08,")
rep("sub: 'No gym. Just pushups, pullups and a lot of shilajit.', hp: 300,", "sub: 'No gym. Just pushups, pullups and a lot of shilajit.', hp: 300, pace: 0.72, dmgMul: 1.3,")
rep("sub: 'Blends three countries in one jar and sticks a new flag on it.', hp: 370,", "sub: 'Blends three countries in one jar and sticks a new flag on it.', hp: 370, pace: 0.88, dmgMul: 1.08,")
rep("sub: 'Live on stream. Rating your face. Selling the course.', hp: 430,", "sub: 'Live on stream. Rating your face. Selling the course.', hp: 430, pace: 0.85, dmgMul: 1.12,")
rep("""sub: "Here to disprove atheism. You're in the way.", hp: 540,""", """sub: "Here to disprove atheism. You're in the way.", hp: 540, dmgMul: 1.05,""")
# the Shilajit Coach throws more
rep("      fallers(4, () => { const kind = pick(Object.keys(DRINKS));", "      fallers(6, () => { const kind = pick(Object.keys(DRINKS));")
rep("      fan(fanN(moreE(3), 70 * G), 1).forEach((s, i) => proj.push(P(Object.assign({ k: 'resinBlob',", "      fan(fanN(moreE(4), 70 * G), 1).forEach((s, i) => proj.push(P(Object.assign({ k: 'resinBlob',")

# ============ endless: an attack level from the first round, without more health ============
rep("""    const hp = isEndless ? Math.round((def.ehp || def.hp) * (0.8 + 0.25 * elv) * (inBrawl ? BRAWL_HP * (brawl.S >= 5 ? 1 : 0.8) : 1)) : def.hp; // fewer fit on a phone, so a bit less each""",
    """    const hp = isEndless ? Math.round((def.ehp || def.hp) * (0.8 + 0.25 * elv) * (inBrawl ? BRAWL_HP * (brawl.S >= 5 ? 1 : 0.8) : 1)) : def.hp; // fewer fit on a phone, so a bit less each
    // how hard he attacks: endless bosses start a few levels up and creep up half a level a round (health still goes by meetings)
    const alv = inBrawl ? bl : isEndless ? elv + ENDLESS_BASE + Math.floor(endlessRound / 2) : 0;""")
rep("      speed: (isEndless ? Math.max(0.45, 0.9 - 0.06 * elv) : 1) * (inBrawl ? BRAWL_PACE : n > 1 ? 1.25 : 1) * (def.pace || 1), elv, brawl: inBrawl,",
    "      speed: (isEndless ? Math.max(0.45, 0.9 - 0.06 * alv) : 1) * (inBrawl ? BRAWL_PACE : n > 1 ? 1.25 : 1) * (def.pace || 1), elv, alv, brawl: inBrawl,")
rep("  const lvOf = b => (endless && b && b.endless ? b.elv || 0 : 0);", "  const lvOf = b => (endless && b && b.endless ? b.alv ?? b.elv ?? 0 : 0);")
rep("  const ENDLESS_STEP = 4; // endless: levels a boss gains each time you meet him again",
    "  const ENDLESS_STEP = 4; // endless: levels a boss gains each time you meet him again\n  const ENDLESS_BASE = 4; // ...and the level his attacks start at the first time")

# test hooks
rep("      runStats() { return runStats; },",
    "      runStats() { return runStats; },\n"
    "      spoonFx: () => ({ vstack: spoon.vstack, mark: +spoon.mark.toFixed(1), anaph: +spoon.anaph.toFixed(1), venom: +spoon.venom.toFixed(1) }),\n"
    "      lvls: () => bosses.map(b => ({ key: b.def.key, elv: b.elv, alv: b.alv, hp: b.max })),")

open(fn, 'w').write(s)
print('ok')
