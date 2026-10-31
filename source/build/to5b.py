import sys
p = sys.argv[1]
s = open(p).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:100]); s = s.replace(old, new)
def between(start, end, new):
    global s
    a = s.index(start); b = s.index(end, a); s = s[:a] + new + s[b:]

# ---------- HTML ----------
rep('    <div class="toast hide" id="toast" hidden></div>\n', '')
rep('''        <button class="btn" id="achClose" type="button">Close</button>
      </div>
    </div>
  </main>''', '''        <button class="btn" id="achClose" type="button">Close</button>
      </div>
    </div>
    <div class="toast hide" id="toast" aria-live="polite"></div>
  </main>''')
rep('.toast { position: absolute; left: 50%; top: 12px;', '.toast { position: absolute; z-index: 6; left: 50%; top: 48px;')
rep("In boss fights, every drop you catch gets flicked back at the boss. After each boss, spend your honey in <b>Grandad's Shed</b>.",
    "In boss fights, every drop you catch gets flicked back at the boss and saved for <b>Grandad's Shed</b>, where you shop after each boss.")

# ---------- achievements data ----------
rep("  const feeText = (t, m) => { const n = parseInt(t, 10); return (n * m) + t.slice(String(n).length); };\n",
r'''  const feeText = (t, m) => { const n = parseInt(t, 10); return (n * m) + t.slice(String(n).length); };
  const GRANDAD_CRAZY = ["Crazy mode is on. Two at once. Don't say I didn't warn you.", 'Crazy mode is off. One at a time, like a normal person.'];

  // ---------- achievements ----------
  const SHOP_LEVELS = SHOP.filter(x => x.id !== 'crazy').reduce((n, x) => n + x.max, 0);
  const ACH = [
    { id: 'trust', name: 'Trust me bro', desc: 'Beat the Sus Beekeeper without getting hit.' },
    { id: 'herp', name: 'U are herp', desc: 'Colonex bills the bosses over 1,000,000$ in total.', stat: 'billed', goal: 1e6, show: n => Math.floor(n).toLocaleString('en-GB') + '$ / 1,000,000$' },
    { id: 'premium', name: 'Premium product', desc: 'Buy something after the price rise.' },
    { id: 'married', name: "Don't eat this if you're married", desc: 'Eat 10 Shilajit jars in one run.', stat: 'shilajit', goal: 10, show: n => n + ' / 10 in one run' },
    { id: 'bigman', name: 'Big man ting', desc: 'Beat the Shilajit Coach.' },
    { id: 'notes', name: 'Check my notes', desc: 'Beat the Honey Apologist.' },
    { id: 'mogger', name: 'Mogger', desc: 'Beat the Looksmaxxer.' },
    { id: 'blocked', name: 'Blocked', desc: 'Beat the Disprover.' },
    { id: 'sold', name: 'Sold out', desc: 'Finish a run.', stat: 'season', goal: BOSS_COUNT, show: n => n + ' / ' + BOSS_COUNT + ' bosses' },
    { id: 'grandad', name: "Grandad's favourite", desc: 'Max out everything in the shed.', stat: 'levels', goal: SHOP_LEVELS, show: n => n + ' / ' + SHOP_LEVELS + ' levels' },
    { id: 'labrat', name: 'Lab rat', desc: 'Run 25 lab tests in total.', stat: 'labs', goal: 25 },
    { id: 'endless', name: 'Endless', desc: 'Reach round 5 of endless mode.', stat: 'round', goal: 5, show: n => 'round ' + n + ' / 5' },
    { id: 'crazy', name: 'Crazy', desc: 'Beat two bosses at once.' },
  ];
  const CHECK_SVG = '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
''')

# ---------- state ----------
rep("  function saveBest() { try { localStorage.setItem('honey-gobbler-3', JSON.stringify(best)); } catch (e) {} }\n",
r'''  function saveBest() { try { localStorage.setItem('honey-gobbler-3', JSON.stringify(best)); } catch (e) {} }
  let achData = { done: {}, stats: {} };
  try { const s = JSON.parse(localStorage.getItem('honey-gobbler-ach') || '{}'); if (s.done) achData.done = s.done; if (s.stats) achData.stats = s.stats; } catch (e) {}
  let achPrev = null, toastQ = [], toastBusy = false;
''')
rep("beeDrops: 0, spent: 0, shilajit: 0, bad: {} };", "beeDrops: 0, spent: 0, shilajit: 0, saved: 0, bad: {} };")
rep("    savings += kg; fightSaved += kg;\n", "    savings += kg; fightSaved += kg; tally.saved += kg;\n")
rep("""    if (chat) chatReact(["IT'S OVER", 'LMAOOO', "it's so over", 'mogged', 'clip it']);""", """    if (chat) chatReact("IT'S OVER");""")

# ---------- boss flow: one boss, or two in crazy mode ----------
between('  // ---------- boss flow ----------', '  // ---------- Colonex as an ally ----------', r'''  // ---------- boss flow ----------
  // `bosses` holds the boss you're fighting, or two of them in crazy mode. While one of them acts, the global
  // `boss` points at it, so say(), the attacks and the projectiles they throw all know who they belong to.
  function makeBoss(i, isEndless, slot, n) {
    const def = BOSSES[i], k = bossK();
    const hp = isEndless ? Math.round(def.hp * (0.8 + 0.25 * endlessRound)) : def.hp;
    const x = n > 1 ? W * (slot ? 0.72 : 0.28) : W / 2;
    return {
      def, i, slot, n, x, tx: x, y: -160 * k, hp, max: hp, t: 0, mode: 'intro', endless: isEndless, done: false,
      atkT: 1.2 + slot * 1.5, atkI: 0, sayT: 4.5 + slot * 3, say: null, recent: [], hurt: 0, pose: 0, wanderT: 1, rot: 0, vy: 0, alpha: 1, scale: 1,
      forceNext: null, p2: false, pushup: 0, repT: 0, reps: 0,
      // two at once each attack a little less often
      speed: (isEndless ? Math.max(0.55, 0.9 - 0.05 * endlessRound) : 1) * (n > 1 ? 1.25 : 1),
    };
  }
  function startFight(ids, isEndless = false) {
    phase = 'boss'; ev = null;
    items.forEach(it => { if (it.kind === 'bad') splat(it.x, it.y, it.f.color, 6); });
    items = []; proj = []; globs = [];
    bosses = ids.map((i, sl) => makeBoss(i, isEndless, sl, ids.length));
    boss = bosses[0];
    ally = null; fightSaved = 0; fightHits = 0;
    chat = bosses.some(b => b.def.key === 'looks') ? { msgs: [], nextT: 2.4, viewers: 38000 + Math.floor(rnd(0, 3000)), flood: 0, recent: [], reactT: 0 } : null;
    spawnT = 1.4;
    sfx.bossIn();
  }
  function startBoss(i) { startFight([i]); }
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
      if (b.t > 2.9) { b.mode = 'fight'; b.t = 0; say(b.def.intro, { force: true }); b.sayT = b.say.t + 1.5 + b.slot * 2; }
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
        b.vy += 520 * dt; b.y += b.vy * dt; b.rot += dt * 2.2 * (b.i % 2 ? -1 : 1); b.alpha = Math.max(0, 1 - b.t / 2.2);
        if (Math.random() < 0.3) splat(b.x + rnd(-30, 30), b.y + rnd(-30, 30), '#f2a516', 3);
        if (b.t > 3.2) b.done = true;
      }
      return;
    }
    if (b.mode === 'dash') { updateDash(dt * (smokeT > 0 ? smokeSlow : 1), b); return; }
    if (!b.p2 && b.hp / b.max <= 0.5) {
      b.p2 = true;
      floatText(W / 2, H * 0.42, 'PHASE 2', '#ff5a3c', true);
      say(b.def.p2line, { force: true }); b.sayT = b.say.t + 1.5;
      b.forceNext = b.def.p2attacks[0]; b.atkT = Math.min(b.atkT, 1.2);
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
    if (b.wanderT <= 0) { b.tx = b.n > 1 ? W * (b.slot ? rnd(0.56, 0.86) : rnd(0.14, 0.44)) : W * rnd(0.2, 0.8); b.wanderT = rnd(1.4, 2.8); }
    if (b.pushup <= 0) b.x += (b.tx - b.x) * Math.min(1, dt * 1.8);
    b.y = home + Math.sin(b.t * 2.2 + b.slot * 1.7) * 6 * k;
    b.sayT -= dt;
    if (b.sayT <= 0) { b.sayT = say(nextLine(b)) ? b.say.t + rnd(1.5, 3) + (b.n > 1 ? 2.5 : 0) : 1; }
    b.atkT -= dt;
    if (b.atkT <= 0) {
      const list = b.p2 ? b.def.attacks.concat(b.def.p2attacks) : b.def.attacks;
      const a = b.forceNext || list[b.atkI++ % list.length];
      b.forceNext = null;
      const cd = ATTACKS[a](b) || 2.5;
      b.atkT = cd * (b.p2 ? 0.8 : 1) * b.speed;
      b.pose = 0.8;
    }
  }
  function updateDash(dt, b) {
    const d = b.dash, k = bossK();
    d.t += dt;
    if (d.st === 'tele') { if (d.t > 0.85) { d.st = 'go'; d.t = 0; d.hit = false; sfx.whoosh(); } return; }
    if (d.st === 'go') {
      const u = Math.min(1, d.t / 0.45);
      b.x = d.fx + (d.tx - d.fx) * u; b.y = d.fy + (d.ty - d.fy) * u;
      if (!reduceMotion) for (let i = 0; i < 3; i++) particles.push({ x: b.x + rnd(-70, 70) * k, y: b.y + 70 * k, vx: rnd(-90, 90), vy: rnd(-200, -60), r: rnd(1.5, 3.5), life: .5, color: '#f4f8ff' });
      if (!d.hit && Math.hypot(b.x - spoon.x, b.y - spoon.y) < 58 * k + spoonSize() * 0.35) {
        d.hit = true; hurtSpoon(d.dmg, d.color, d.name, { boss: b });
        if (state !== 'play') return;
      }
      if (u >= 1) { d.st = 'back'; d.t = 0; d.bx = b.x; d.by = b.y; shake = reduceMotion ? 0 : 6; }
      return;
    }
    const u = ease(Math.min(1, d.t / 0.9));
    b.x = d.bx + (d.fx - d.bx) * u; b.y = d.by + (bossHome() - d.by) * u;
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
    b.hp = 0; b.mode = 'down'; b.t = 0; b.vy = -220; b.dash = null; b.say = null; b.pushup = 0;
    say(b.def.defeat, { force: true, dur: b.def.joins && !b.endless ? 3.2 : 3 }, b);
    if (bosses.some(o => o !== b && fighting(o))) {
      // the other boss fights on, so only this one's attacks disappear
      for (const p of proj) if (p.owner === b && !p.dead) { p.dead = true; if (!(p.delay > 0)) splat(p.x || W / 2, p.y || H / 2, '#f6e3b4', 4); }
    } else {
      proj.forEach(p => splat(p.x || W / 2, p.y || H / 2, '#f6e3b4', 4));
      proj = []; globs = []; ally = null;
    }
    for (let i = 0; i < 4; i++) splat(b.x + rnd(-40, 40), b.y + rnd(-40, 40), '#f2a516', 14);
    tally.bosses++;
    const h = heal(25);
    floatText(W / 2, H * 0.47, 'DEFEATED!', '#ffd36b', true);
    if (h > 0) floatText(spoon.x, spoon.y - 60, '+' + Math.round(h) + '% purity', '#ffe9a8');
    sfx.bossDown(); shake = reduceMotion ? 0 : 12;
    if (b.def.key === 'looks') chatReact('Clipping this', 3);
    const a = { keeper: fightHits === 0 ? 'trust' : null, ironfit: 'bigman', apologist: 'notes', looks: 'mogger', disprover: 'blocked' }[b.def.key];
    if (a) achUnlock(a);
  }
  function finishFight() {
    const wasEndless = bosses[0].endless, two = bosses.length > 1;
    boss = null; bosses = []; chat = null; qd = null; ally = null;
    if (two) achUnlock('crazy');
    if (wasEndless) { endlessRound++; endlessNext += STAGE_KG; achStat('round', endlessRound + 1); openShed(); return; }
    bossIdx++;
    achStat('season', bossIdx);
    if (bossIdx >= BOSS_COUNT) { phase = 'done'; win(); return; }
    openShed();
  }

''')

# ---------- Colonex as an ally ----------
between('  // ---------- Colonex as an ally ----------', '  // ---------- boss attacks ----------', r'''  // ---------- Colonex as an ally ----------
  // He fights with you once you've beaten him, but never against himself: if he's one of the bosses, he isn't on your side.
  function allyPos() { return W < 560 ? { x: 36, y: H * 0.64 } : { x: 60, y: H * 0.5 }; }
  function allyActive() { return (endless || bossIdx >= 2) && anyFighting() && !bosses.some(b => b.def.key === 'colonex'); }
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
    ally.shootT -= dt;
    if (ally.shootT <= 0) {
      const L = allyStats(upg.colonex);
      ally.shootT = rnd(L.lo, L.hi);
      proj.push(P({ k: 'allyFee', harmless: true, dmg: L.dmg, x: ally.x + 16, y: ally.y - 20, text: feeText(pick(ALLY_FEES), L.fee), r: 12, tgt: pick(bosses.filter(fighting)), owner: null }));
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

''')

# ---------- projectiles know their owner ----------
rep("  const CARD = { notify: 1, fee: 1, call: 1, job: 1, gif: 1, cell: 1, eq: 1, tag: 1, allyFee: 1, deen: 1 };",
    "  const CARD = { notify: 1, fee: 1, call: 1, job: 1, gif: 1, cell: 1, eq: 1, tag: 1, allyFee: 1, deen: 1, rate: 1, chatMsg: 1, dono: 1, ad: 1 };")
rep("  const P = o => Object.assign({ vx: 0, vy: 0, g: 0, r: 14, dmg: 10, rot: 0, vr: 0, t: 0, delay: 0, color: '#ffffff', name: 'Ouch' }, o);",
    "  const P = o => Object.assign({ vx: 0, vy: 0, g: 0, r: 14, dmg: 10, rot: 0, vr: 0, t: 0, delay: 0, color: '#ffffff', name: 'Ouch', owner: boss }, o);")
between('  function projHit(p) {', '  function updateProj(rdt) {', r'''  function projHit(p) {
    const o = p.owner || boss;
    if (!hurtSpoon(p.dmg, p.color, p.name, { boss: o })) return;
    if (p.k === 'call') { spoon.frozen = 1.5; floatText(spoon.x, spoon.y - 82, 'joined vc', '#9aa4ff'); }
    else if (p.k === 'job') { spoon.slow = 2.5; floatText(spoon.x, spoon.y - 82, 'welcome to loksd corporation', '#ffd36b'); }
    else if (p.k === 'deen' && o && fighting(o)) {
      floatText(spoon.x, spoon.y - 82, 'Downloaded DeenBuddy', '#1f9d8f');
      say('YOU DOWNLOADED DEENBUDDY?!', { force: true }, o);
      o.forceNext = 'fired'; o.atkT = Math.min(o.atkT, 0.5);
    }
  }
''')
rep("""      const p = proj[i];
      if (p.delay > 0) {""", """      const p = proj[i];
      if (p.dead) { proj.splice(i, 1); continue; }
      if (p.delay > 0) {""")
rep("hurtSpoon(p.dmg, p.color, p.name, { boss: true });", "hurtSpoon(p.dmg, p.color, p.name, { boss: p.owner || boss });", 3)
rep("    const pdt = dt * (1 + 0.1 * Math.min(bossIdx, BOSS_COUNT - 1) + (endless ? 0.05 * endlessRound : 0));",
    "    const pdt = dt * (1 + 0.5 * Math.min(bossIdx, BOSS_COUNT - 1) / (BOSS_COUNT - 1) + (endless ? 0.05 * endlessRound : 0));")
between("      if (k === 'allyFee') {", '      // moving hazards', r'''      if (k === 'allyFee') {
        let b = p.tgt;
        if (!b || !fighting(b)) b = p.tgt = nearestFighting(p.x);
        if (!b) { proj.splice(i, 1); continue; }
        const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy) || 1;
        p.x += dx / d * 420 * rdt; p.y += dy / d * 420 * rdt; p.rot += 8 * rdt;
        if (d < 40 * bossK()) {
          proj.splice(i, 1);
          floatText(b.x, b.y - 80 * bossK(), p.text, '#b48cff');
          const billed = parseInt(p.text, 10) || 0;
          tally.billed += billed; achAdd('billed', billed);
          damageBoss(p.dmg, b);
          if (!anyFighting() || state !== 'play') return;
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
''')
rep("        if (k === 'deen' && boss && boss.mode === 'fight') say('Good.');", "        if (k === 'deen' && p.owner && p.owner.mode === 'fight') say('Good.', {}, p.owner);")
rep("      if (k === 'bishop' && ((p.x < p.r && p.vx < 0) || (p.x > W - p.r && p.vx > 0))) p.vx *= -1;\n",
r'''      if (k === 'bishop' && ((p.x < p.r && p.vx < 0) || (p.x > W - p.r && p.vx > 0))) p.vx *= -1;
      if (k === 'syringe') p.rot = Math.atan2(p.vy, p.vx);
      if (k === 'pill') {
        if (p.y > H - 12 && p.vy > 0 && p.bounces < 3) { p.y = H - 12; p.vy = -Math.abs(p.vy) * 0.7; p.bounces++; }
        if ((p.x < p.r && p.vx < 0) || (p.x > W - p.r && p.vx > 0)) p.vx *= -1;
      }
      if (k === 'hyperArrow' && p.y >= p.ty) { proj.splice(i, 1); splat(p.x, p.y, '#ff6fae', 6); continue; }
''')
rep("      if (!p.harmless && p.dmg > 0) {\n", "      if (!p.harmless && p.dmg > 0 && !p.safe) {\n")

between('  function updateGlobs(dt) {', '  // ---------- main update ----------', r'''  function updateGlobs(dt) {
    const k = bossK();
    for (let i = globs.length - 1; i >= 0; i--) {
      const g = globs[i];
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

''')

# ---------- main update ----------
rep("    const sm = smokeT > 0 ? smokeSlow : 1, qR = W * queenReach;", "    const sm = smokeT > 0 ? smokeSlow : 1, qR = W * magnetReach;")
rep("""      if (!bad && queenT > 0) {
        const qx = spoon.x - it.x, qy = spoon.y - 10 - it.y, qd = Math.hypot(qx, qy);
        if (qd < qR && qd > 1) { const st = Math.min(qd, 700 * G * dt); it.x += qx / qd * st; it.y += qy / qd * st; }
      }""", """      if (!bad && magnetT > 0) {
        const mx2 = spoon.x - it.x, my2 = spoon.y - 10 - it.y, md = Math.hypot(mx2, my2);
        if (md < qR && md > 1) { const st = Math.min(md, 700 * G * dt); it.x += mx2 / md * st; it.y += my2 / md * st; }
      }""")
rep("""        if (!it.carried) it.x = clamp(it.x, 14, W - 14);
        else if (it.x < -40 || it.x > W + 40) { arr.splice(i, 1); continue; }""", """        if (!it.carried) it.x = clamp(it.x, 14, W - 14);
        else { if (it.x < -40 || it.x > W + 40) arr.splice(i, 1); continue; } // carried off by the swarm""")
rep("    } else if (boss && (boss.mode === 'fight' || boss.mode === 'dash')) {", "    } else if (anyFighting()) {")
rep("    if (boss) { updateBoss(dt); if (state !== 'play') return; }", "    if (bosses.length) { updateBosses(dt); if (state !== 'play') return; }\n    updateQueen(dt); if (state !== 'play') return;\n    updateChat(dt);")

# ---------- speech, ally and HP bars for one or two bosses ----------
between('  function drawSpeech(b) {', '  function drawWorkerBees(t) {', r'''  function drawSpeech(b) {
    if (!b.say || b.done) return;
    const k = bossK() * b.scale;
    ctx.globalAlpha = Math.min(1, b.say.t * 4) * Math.max(b.alpha, b.def.joins ? 1 : 0);
    const narrow = W < 560, two = b.n > 1;
    const o = { maxW: two ? (narrow ? W * 0.48 : Math.min(300, W * 0.4)) : narrow ? W * 0.82 : Math.min(360, W * 0.5), discord: b.def.key === 'colonex', minY: combBottom() + 34 };
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
    ctx.save(); ctx.translate(14, -84); drawCrow(t, 0.75, false); ctx.restore();
    ctx.restore();
  }
  function drawAllySpeech() {
    if (!ally || !ally.say || !anyFighting()) return;
    const k = Math.max(0.42, bossK() * 0.55);
    ctx.globalAlpha = Math.min(1, ally.say.t * 4);
    speechBox(ally.say.text, ally.x + 14 * k, ally.y - 34 * k, 'right', { small: true, maxW: Math.min(240, W * 0.6), discord: true });
    ctx.globalAlpha = 1;
  }
  function drawBossUI(b) {
    if (b.done) return;
    const two = b.n > 1;
    if (b.mode === 'intro') {
      if (b.slot) return; // one banner for both
      const t = b.t, a = Math.min(1, t / 0.3) * Math.min(1, Math.max(0, (2.9 - t) / 0.4));
      if (a <= 0) return;
      ctx.globalAlpha = a;
      const bh = 108, y = Math.min(H * 0.5, H - bh - 90) + 10;
      ctx.fillStyle = 'rgba(20,10,4,.88)'; ctx.fillRect(0, y, W, bh);
      ctx.fillStyle = '#c8102e'; ctx.fillRect(0, y, W, 3); ctx.fillRect(0, y + bh - 3, W, 3);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#f2a516'; ctx.font = '700 12px "Instrument Sans", sans-serif';
      const label = two ? 'CRAZY MODE  ·  ROUND ' + (endlessRound + 1)
        : b.endless ? 'ENDLESS  ·  ROUND ' + (endlessRound + 1)
        : b.i === BOSS_COUNT - 1 ? 'FINAL BOSS  ·  ' + SEASONS[b.i].m.toUpperCase()
        : 'BOSS ' + (b.i + 1) + ' OF ' + BOSS_COUNT + '  ·  ' + SEASONS[b.i].m.toUpperCase();
      ctx.fillText(label, W / 2, y + 22);
      const name = two ? bosses.map(x => x.def.tag).join(' & ') : b.def.name;
      const sub = two ? (bosses.some(x => x.def.key === 'colonex') ? 'Two at once. Colonex has switched sides.' : 'Two at once. Colonex is still on your side.') : b.def.sub;
      fitFont(name, 38, 900, 'Gluten, cursive', W - 32);
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.strokeText(name, W / 2, y + 55);
      ctx.fillStyle = '#f6e3b4'; ctx.fillText(name, W / 2, y + 55);
      ctx.fillStyle = 'rgba(246,227,180,.75)'; ctx.font = '600 13px "Instrument Sans", sans-serif';
      ctx.fillText(sub, W / 2, y + 86, W - 32);
      ctx.globalAlpha = 1;
      return;
    }
    if (b.mode === 'down') return;
    const w = two ? Math.min(220, W * 0.42) : Math.min(300, W * 0.64), cx = two ? (b.slot ? W * 0.74 : W * 0.26) : W / 2, x = cx - w / 2, y = combBottom() + 10;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const name = (two ? b.def.tag : b.def.name) + (b.p2 ? '  ·  PHASE 2' : '');
    fitFont(name, two ? 13 : 15, 700, 'Gluten, cursive', w);
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(29,17,8,.85)'; ctx.strokeText(name, cx, y + 6);
    ctx.fillStyle = '#f6e3b4'; ctx.fillText(name, cx, y + 6);
    ctx.fillStyle = 'rgba(0,0,0,.45)'; roundRect(x, y + 16, w, 10, 5); ctx.fill();
    ctx.fillStyle = b.p2 ? '#ff5a3c' : '#c8102e'; roundRect(x, y + 16, Math.max(6, w * b.hp / b.max), 10, 5); ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(246,227,180,.5)'; roundRect(x, y + 16, w, 10, 5); ctx.stroke();
    ctx.fillStyle = 'rgba(246,227,180,.4)'; ctx.fillRect(cx - 1, y + 14, 2, 14);
    if (b.pushup > 0) outlined('DAY 1 OF 500 PUSHUPS  ' + b.reps + '/500', cx, y + 44, two ? 12 : 16, '#ffd36b');
  }

''')

# ---------- flow ----------
rep("    bossIdx = BOSS_COUNT; phase = 'harvest'; boss = null; ev = null; evT = rnd(10, 14);",
    "    bossIdx = BOSS_COUNT; phase = 'harvest'; boss = null; bosses = []; chat = null; qd = null; ev = null; evT = rnd(10, 14);")
rep("    purity = Math.max(purity, 60);\n    seasonBanner();", "    purity = Math.max(purity, 60);\n    achStat('round', 1);\n    seasonBanner();")
rep("""    if (boss) {
      if (boss.mode === 'dash') { boss.mode = 'fight'; boss.dash = null; boss.y = bossHome(); }
      boss.pushup = 0; boss.atkT = Math.max(boss.atkT, 2);
    }""", """    for (const b of bosses) {
      if (b.mode === 'dash') { b.mode = 'fight'; b.dash = null; b.y = bossHome(); }
      b.pushup = 0; b.atkT = Math.max(b.atkT, 2);
    }""")

between('  function itemInfo(s) {', '  function cancelBuy() {', r'''  // ---------- achievements ----------
  function achSave() { try { localStorage.setItem('honey-gobbler-ach', JSON.stringify(achData)); } catch (e) {} }
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
  function achAdd(key, n) { if (!n) return; achData.stats[key] = (achData.stats[key] || 0) + n; achSave(); achCheck(key); } // running total
  function achProgress(a) { return achData.done[a.id] ? 1 : a.stat ? clamp((achData.stats[a.stat] || 0) / a.goal, 0, 1) : 0; }
  function updateAchCount() { const n = ACH.filter(a => achData.done[a.id]).length; document.querySelectorAll('.achcount').forEach(el => { el.textContent = n + '/' + ACH.length; }); }
  function renderAch() {
    const n = ACH.filter(a => achData.done[a.id]).length;
    $('achCount').textContent = n + ' of ' + ACH.length;
    $('achTotal').style.width = (n / ACH.length * 100).toFixed(1) + '%';
    $('achList').innerHTML = ACH.map(a => {
      const done = !!achData.done[a.id], p = achProgress(a), cur = Math.floor(achData.stats[a.stat] || 0);
      const num = done ? 'Unlocked' : a.stat ? (a.show ? a.show(cur) : cur + ' / ' + a.goal) : 'Locked';
      return `<div class="ach${done ? ' done' : ''}"><span class="ico" aria-hidden="true">${done ? CHECK_SVG : '?'}</span><div><h4><span class="num">${esc(num)}</span>${esc(a.name)}</h4><p>${esc(a.desc)}</p><div class="bar"><i style="width:${(p * 100).toFixed(1)}%"></i></div></div></div>`;
    }).join('');
  }
  function openAch() {
    achPrev = ['startScreen', 'pauseScreen', 'overScreen', 'soldScreen'].find(id => !$(id).hidden) || null;
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
    toastBusy = true; el.innerHTML = h; el.classList.remove('hide');
    setTimeout(() => { el.classList.add('hide'); setTimeout(nextToast, 450); }, 2800);
  }

  // ---------- Grandad's Shed ----------
  // Purchases come out of your shed savings first, then out of your harvest (which pushes the next boss further away).
  const wallet = () => savings + score;
  function itemInfo(s) {
    const lv = upg[s.id], maxed = lv >= s.max, locked = !!(s.unlock && !s.unlock());
    const base = maxed ? 0 : s.cost[lv];
    return { lv, maxed, locked, base, cost: base * priceMult() };
  }
  function priceMult() { return endless || bossIdx > 3 ? PRICE_HIKE : 1; } // bosses 1-4 beaten means the coach is done
  function anythingToBuy() { return SHOP.some(s => { const inf = itemInfo(s); return !inf.locked && !inf.maxed; }); }
  function grandadSay(text) {
    $('gLine').textContent = text;
    const g = $('gBubble'); g.classList.remove('pop'); void g.offsetWidth; g.classList.add('pop');
  }
  function renderShed() {
    $('shedSav').textContent = fmtKg(savings);
    $('shedKg').textContent = '+ ' + fmtKg(score) + ' harvested';
    $('shedNext').textContent = '· next boss at ' + (endless ? endlessNext : thresholdFor(bossIdx)) + ' kg';
    for (const el of $('shop').children) {
      const s = SHOP.find(x => x.id === el.dataset.id), inf = itemInfo(s);
      el.hidden = inf.locked; // Pay Colonex appears once he has joined you, Crazy mode once everything else is maxed
      el.querySelector('.pips').textContent = s.id === 'crazy' ? (inf.lv ? (crazyOn ? 'On' : 'Off') : 'Two bosses at once')
        : 'Level ' + inf.lv + '/' + s.max + (s.key ? (touchUI ? ' · power' : ' · key ' + s.key) : '');
      el.querySelector('.pr').innerHTML = inf.maxed ? (s.max === 1 ? 'Owned' : 'Max') : (inf.cost > inf.base ? '<s>' + inf.base + '</s> ' : '') + inf.cost + ' kg';
      el.className = 'tile' + (s.id === shedSel ? ' sel' : '') + (inf.locked ? ' locked' : '') + (inf.maxed ? ' done' : '') + (!inf.locked && !inf.maxed && wallet() < inf.cost ? ' cant' : '');
    }
  }
  function selectItem(id) {
    shedSel = id;
    const s = SHOP.find(x => x.id === id), inf = itemInfo(s);
    $('dName').textContent = s.name + (s.max > 1 ? '  ·  level ' + inf.lv + ' of ' + s.max : '');
    $('dDesc').textContent = s.desc + (s.key ? (touchUI ? ' Tap its button on the right to use it.' : ' Click anywhere or press ' + s.key + ' to use it.') : '');
    $('dNow').textContent = 'Now: ' + s.lvText(inf.lv);
    $('dNext').textContent = s.max === 1 ? (inf.lv ? 'Switch it on or off here whenever you like.' : 'Every endless boss fight becomes two bosses at once.') : inf.maxed ? 'Fully upgraded.' : 'Next: ' + s.lvText(inf.lv + 1);
    const btn = $('buyBtn');
    if (s.id === 'crazy' && inf.lv) { btn.textContent = crazyOn ? 'Turn crazy mode off' : 'Turn crazy mode on'; btn.disabled = false; }
    else if (inf.maxed) { btn.textContent = 'Max level'; btn.disabled = true; }
    else if (wallet() < inf.cost) { btn.textContent = 'Need ' + inf.cost + ' kg'; btn.disabled = true; }
    else { btn.textContent = 'Buy for ' + inf.cost + ' kg'; btn.disabled = false; }
    renderShed();
  }
''')
between('  function purchase(id) {', '  function openShed() {', r'''  function purchase(id) {
    const s = SHOP.find(x => x.id === id), inf = itemInfo(s);
    if (inf.locked || inf.maxed || wallet() < inf.cost) return;
    const fromSav = Math.min(savings, inf.cost);
    savings -= fromSav; score -= inf.cost - fromSav;
    tally.spent += inf.cost; upg[id]++;
    if (PW[id]) { if (upg[id] === 1) { pcd[id] = 0; readyAt[id] = elapsed; } else pcd[id] = Math.min(pcd[id], PW[id](upg[id]).cd); }
    if (id === 'crazy') crazyOn = true;
    grandadSay(GRANDAD_BUY[id]);
    if (id === 'colonex') {
      const line = upg.colonex === 1
        ? (endless || bossIdx > 3 ? 'I spoke with the Shilajit Coach and I think I should start charging more' : 'loksd corporation has raised its rates')
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
''')
rep("    state = 'shed'; phase = 'harvest'; spawnT = 0.5; ev = null; evT = rnd(12, 16);", "    state = 'shed'; phase = 'harvest'; spawnT = 0.5; ev = null; evT = rnd(12, 16); qd = null;")
rep("    if (lastHit && lastHit.boss && boss) text = boss.def.lose;", "    if (lastHit && lastHit.boss && lastHit.boss.def) text = lastHit.boss.def.lose;")
rep("""    const rows = [['Honeydew drops', tally.drops], ['Caught by your bees', tally.beeDrops], ['Ryczkowski jars', tally.jars], ['Boxes of honey', tally.boxes], ["Grandad's comb", tally.comb], ['Lab tests run', tally.labs], ['Bosses beaten', tally.bosses]]""",
    """    const rows = [['Honeydew drops', tally.drops], ['Caught by your bees', tally.beeDrops], ['Ryczkowski jars', tally.jars], ['Boxes of honey', tally.boxes], ["Grandad's comb", tally.comb], ['Shilajit of honey', tally.shilajit], ['Lab tests run', tally.labs], ['Bosses beaten', tally.bosses]]""")
rep("""    if (tally.spent) out += `<div><span>Spent in Grandad's Shed</span><b>${tally.spent} kg</b></div>`;""",
    """    if (tally.saved >= 0.1) out += `<div><span>Saved in boss fights</span><b>${fmtKg(tally.saved)}</b></div>`;
    if (tally.spent) out += `<div><span>Spent in Grandad's Shed</span><b>${tally.spent} kg</b></div>`;""")
rep("""    sfx.win();
    $('soldScreen').hidden = false; $('waitBtn').focus();""", """    sfx.win(); achUnlock('sold');
    $('soldScreen').hidden = false; $('endlessBtn').focus();""")

# ---------- listeners ----------
rep("""      if (!inf.locked && !inf.maxed && score < inf.cost) grandadSay(GRANDAD_BROKE);""", """      if (!inf.locked && !inf.maxed && wallet() < inf.cost) grandadSay(GRANDAD_BROKE);""")
rep("""  $('buyBtn').addEventListener('click', () => {
    const s = SHOP.find(x => x.id === shedSel), inf = itemInfo(s);
    if (inf.locked || inf.maxed || score < inf.cost) return;
    shedPending = s.id;
    $('confirmText').textContent = 'Buy ' + s.name + (s.max > 1 ? ' (level ' + (inf.lv + 1) + ')' : '') + ' for ' + inf.cost + ' kg?';""",
"""  $('buyBtn').addEventListener('click', () => {
    const s = SHOP.find(x => x.id === shedSel), inf = itemInfo(s);
    if (s.id === 'crazy' && inf.lv) { crazyOn = !crazyOn; grandadSay(GRANDAD_CRAZY[crazyOn ? 0 : 1]); selectItem(s.id); updateHud(); return; }
    if (inf.locked || inf.maxed || wallet() < inf.cost) return;
    shedPending = s.id;
    const fromSav = Math.min(savings, inf.cost), fromKg = inf.cost - fromSav;
    const src = fromKg <= 0 ? 'It all comes out of your savings.' : fromSav >= 0.1 ? fmtKg(fromSav) + ' from savings, ' + fmtKg(fromKg) + ' from your harvest.' : 'It comes out of your harvest.';
    $('confirmText').textContent = 'Buy ' + s.name + (s.max > 1 ? ' (level ' + (inf.lv + 1) + ')' : '') + ' for ' + inf.cost + ' kg? ' + src;""")
rep("  $('shedDone').addEventListener('click', closeShed);\n", """  $('shedDone').addEventListener('click', closeShed);
  document.querySelectorAll('[data-ach]').forEach(el => el.addEventListener('click', openAch));
  $('achClose').addEventListener('click', closeAch);
""")

between("  if (location.hash === '#debug') {", "  window.claude?.hot?.snapshot", r'''  if (location.hash === '#debug') {
    window.__hg = {
      jump(i) { if (state !== 'play') start(); bossIdx = i; score = thresholdFor(i); startFight([i]); },
      crazy(a, c) { if (state !== 'play') start(); endless = true; bossIdx = BOSS_COUNT; score = endlessNext = GOAL + STAGE_KG; upg.crazy = 1; crazyOn = true; startFight([a, c], true); },
      endlessBoss(i) { if (state !== 'play') start(); endless = true; bossIdx = BOSS_COUNT; score = endlessNext = GOAL + STAGE_KG; startFight([i], true); },
      harvest(i) { if (state !== 'play') start(); bossIdx = i; score = thresholdFor(i) - STAGE_KG + 1; phase = 'harvest'; boss = null; bosses = []; },
      hurtBoss(n, sl = 0) { if (bosses[sl]) damageBoss(n, bosses[sl]); },
      inv(on) { invincible = on; },
      bot(on) { bot = on; },
      kill() { purity = 1; invincible = false; spoon.hurt = 0; hurtSpoon(99, '#fff', 'Test'); },
      endless() { startEndless(); },
      event(k) { lastEv = k === 'flow' ? 'swarm' : 'flow'; startEvent(); },
      step(n, dt = 1 / 60) { let j = 0; for (; j < n && state === 'play'; j++) update(dt); return j; },
      get: () => ({ t: +elapsed.toFixed(1), sx: spoon && Math.round(spoon.x), state, phase, score: +score.toFixed(1), savings: +savings.toFixed(1), fightSaved: +fightSaved.toFixed(1), purity, bossIdx, addict: +addict.toFixed(2), rush: +rush.toFixed(1), combo, endless, endlessNext, endlessRound, crazyOn,
        boss: boss && { key: boss.def.key, mode: boss.mode, hp: +boss.hp.toFixed(1), p2: boss.p2 }, bosses: bosses.map(b => ({ key: b.def.key, mode: b.mode, hp: +b.hp.toFixed(1), max: b.max, p2: b.p2 })),
        proj: proj.length, items: items.length, ev: ev && ev.k, ally: !!ally, billed: tally.billed, upg: upg && { ...upg }, pcd: pcd && { ...pcd }, bees: bees.length, beeDrops: tally.beeDrops,
        smokeT: +smokeT.toFixed(1), magnetT: +magnetT.toFixed(1), qd: qd && qd.mode + ':' + qd.st, chat: chat && chat.msgs.length, spent: tally.spent, hits: fightHits, shilajit: tally.shilajit, ach: Object.keys(achData.done) }),
      attack(name, sl = 0) { const b = bosses[sl]; if (b) { boss = b; ATTACKS[name](b); } },
      shed() { openShed(); },
      closeShed() { closeShed(); },
      give(n) { score += n; },
      setSav(n) { savings = n; },
      setUpg(id, n) { upg[id] = n; },
      power(k) { return firePower(k); },
      shop: () => SHOP.map(s => { const inf = itemInfo(s); return { id: s.id, lv: inf.lv, cost: inf.cost, locked: inf.locked, maxed: inf.maxed }; }),
      buy(id) { purchase(id); },
      achReset() { achData = { done: {}, stats: {} }; achSave(); updateAchCount(); },
      ach: () => JSON.parse(JSON.stringify(achData)),
      chatState: () => chat && chat.msgs.map(m => (m.banned ? '[x] ' : '') + m.user + ': ' + m.text),
      lines: () => bosses.map(b => b.recent.slice()),
    };
  }

''')
rep("  window.claude?.hot?.snapshot?.(() => ({ best }));", "  window.claude?.hot?.snapshot?.(() => ({ best, ach: achData }));")
rep("""    resize(); reset(); requestAnimationFrame(frame);
  };""", """    if (data && data.ach && data.ach.done) {
      Object.assign(achData.done, data.ach.done);
      for (const [key, v] of Object.entries(data.ach.stats || {})) achData.stats[key] = Math.max(achData.stats[key] || 0, +v || 0);
    }
    updateAchCount();
    resize(); reset(); requestAnimationFrame(frame);
  };""")

open(p, 'w').write(s)
print('to5b ok')
