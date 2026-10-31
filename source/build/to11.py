import sys
fn = sys.argv[1]
s = open(fn).read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:90])
    s = s.replace(old, new)

# 1. honey flow gives twice as much
rep("const add = 1.6 * dt * (rush > 0 ? RUSH_MULT : 1);", "const add = 3.2 * dt * (rush > 0 ? RUSH_MULT : 1);")

# 2. Supermarket regular: hurt by anything
rep("{ id: 'regular', name: 'Supermarket regular', desc: 'Get hit by 100 fakes in total.', stat: 'fakeHits', goal: 100 },",
    "{ id: 'regular', name: 'Supermarket regular', desc: 'Get hurt 100 times in total, by anything.', stat: 'hurts', goal: 100 },")
rep("    spoon.hurt = 0.9; spoon.tint = color; shake = reduceMotion ? 0 : 10; hurtFlash = 0.45; sfx.bad();\n",
    "    spoon.hurt = 0.9; spoon.tint = color; shake = reduceMotion ? 0 : 10; hurtFlash = 0.45; sfx.bad();\n    achAdd('hurts', 1, true);\n")
rep("  function achMigrate() { if (achData.done.herp && (achData.stats.billed || 0) < 1e7) { delete achData.done.herp; achSave(); } } // its goal went from 1 to 10 million (run at boot)",
    "  function achMigrate() {\n"
    "    if (achData.done.herp && (achData.stats.billed || 0) < 1e7) { delete achData.done.herp; achSave(); } // its goal went from 1 to 10 million (run at boot)\n"
    "    const fh = achData.stats.fakeHits || 0; // Supermarket regular used to count fake hits only; those hits count towards the new total\n"
    "    if (fh > (achData.stats.hurts || 0)) { achData.stats.hurts = fh; achSave(); achCheck('hurts'); }\n"
    "  }")

# 3. Sus Beekeeper, story mode only: less syrup, lighter smoke, less HP. Endless keeps the old numbers and keeps ramping.
rep("key: 'keeper', name: 'The Sus Beekeeper', tag: 'Sus Beekeeper', sub: 'Feeds his bees syrup during the flow. Calls it raw.', hp: 130,",
    "key: 'keeper', name: 'The Sus Beekeeper', tag: 'Sus Beekeeper', sub: 'Feeds his bees syrup during the flow. Calls it raw.', hp: 115, ehp: 130,")
rep("    const hp = isEndless ? Math.round(def.hp * (0.8 + 0.25 * endlessRound)) : def.hp;",
    "    const hp = isEndless ? Math.round((def.ehp || def.hp) * (0.8 + 0.25 * endlessRound)) : def.hp;")
rep("      fan(moreE(3), 70 * G).forEach((off, i) => {\n        const f = pick(syrups);",
    "      fan(b.endless ? moreE(3) : 2, 70 * G).forEach((off, i) => { // the first boss throws a bit less in the story\n        const f = pick(syrups);")
rep("      for (let i = 0, n = cntW(5); i < n; i++) {\n        const x = i === 0 ? clamp(spoon.x, 20, W - 20) : W * rnd(0.08, 0.92);\n        proj.push(P({ k: 'susjar'",
    "      for (let i = 0, n = cntW(b.endless ? 5 : 3); i < n; i++) {\n        const x = i === 0 ? clamp(spoon.x, 20, W - 20) : W * rnd(0.08, 0.92);\n        proj.push(P({ k: 'susjar'")
rep("      const n = Math.min(9, Math.round((3 + Math.min(3, Math.floor(er / 2))) * WX));\n      for (let i = 0; i < n; i++) {\n        const max = 91 * k * (1 + Math.min(0.3, 0.03 * er)),",
    "      const light = !b.endless; // a lighter puff in the story\n"
    "      const n = Math.min(9, Math.round(((light ? 2 : 3) + Math.min(3, Math.floor(er / 2))) * WX));\n      for (let i = 0; i < n; i++) {\n        const max = 91 * k * (light ? 0.85 : 1) * (1 + Math.min(0.3, 0.03 * er)),")
rep("      Array.from({ length: moreE(2) }, (_, i) => (i % 2 ? 1 : -1) * (1 + Math.floor(i / 2))).forEach((s, i) => {",
    "      Array.from({ length: b.endless ? moreE(2) : 1 }, (_, i) => (i % 2 ? 1 : -1) * (1 + Math.floor(i / 2))).forEach((s, i) => {")
rep("      fallers(8, () => { const f = pick(syrups); return { k: 'bottle', f, name: f.name, color: f.color, vy: rnd(170, 220), r: 18, dmg: 12, vr: rnd(-2, 2) }; }, 0.16);",
    "      fallers(b.endless ? 8 : 5, () => { const f = pick(syrups); return { k: 'bottle', f, name: f.name, color: f.color, vy: rnd(170, 220), r: 18, dmg: 12, vr: rnd(-2, 2) }; }, b.endless ? 0.16 : 0.24);")

# 4. Colonex: VC once per cycle, shorter freeze
rep("attacks: ['fees', 'vc', 'factorio', 'jobs', 'crow', 'ski', 'gifs', 'cnc', 'roblox', 'vc'],",
    "attacks: ['fees', 'vc', 'factorio', 'jobs', 'crow', 'ski', 'gifs', 'cnc', 'roblox'],")
rep("if (p.k === 'call') { spoon.frozen = 1.5;", "if (p.k === 'call') { spoon.frozen = 1.0;")

# 5. App Founder: more HP, attacks 15% faster, a second pawn wave in his checkmate
rep("key: 'ceo', name: 'The App Founder', tag: 'App Founder', sub: 'Download his app. Track your honey. Never say the other app.', hp: 230,",
    "key: 'ceo', name: 'The App Founder', tag: 'App Founder', sub: 'Download his app. Track your honey. Never say the other app.', hp: 250, pace: 0.87,")
rep("      speed: (isEndless ? Math.max(0.45, 0.9 - 0.06 * endlessRound) : 1) * (n > 1 ? 1.25 : 1),",
    "      speed: (isEndless ? Math.max(0.45, 0.9 - 0.06 * endlessRound) : 1) * (n > 1 ? 1.25 : 1) * (def.pace || 1),")
rep("""  const wall = (make, delay, gapMul = 2.9) => {
    const gapW = spoonSize() * gapMul, gx = W * rnd(0.18, 0.82);
    for (let x = 22; x < W - 10; x += 42 * G) { if (Math.abs(x - gx) < gapW / 2) continue; proj.push(P(Object.assign({ x, y: combBottom() + 6, delay }, make(x)))); }
  };""", """  const wall = (make, delay, gapMul = 2.9, gx = W * rnd(0.18, 0.82)) => { // a row across the screen with one gap; returns where the gap is
    const gapW = spoonSize() * gapMul;
    for (let x = 22; x < W - 10; x += 42 * G) { if (Math.abs(x - gx) < gapW / 2) continue; proj.push(P(Object.assign({ x, y: combBottom() + 6, delay }, make(x)))); }
    return gx;
  };""")
rep("""      let n = 0;
      wall(() => { const y = combBottom() + 10; return { k: 'pawn', name: 'Pawn', color: '#f6e3b4', ty: y, stepT: 0.3, r: 12, dmg: 12, dark: n++ % 2 === 0 }; }, 0.5, 3.2);
      return 3.6;""", """      let n = 0;
      const pawn = () => { const y = combBottom() + 10; return { k: 'pawn', name: 'Pawn', color: '#f6e3b4', ty: y, stepT: 0.3, r: 12, dmg: 12, dark: n++ % 2 === 0 }; };
      const g1 = wall(pawn, 0.5, 3.2);
      // a second wave with its gap well away from the first, so you have to cross over
      const g2 = clamp(g1 + (g1 < W / 2 ? 1 : -1) * W * rnd(0.25, 0.4), W * 0.15, W * 0.85);
      wall(pawn, 2.1, 3.2, g2);
      return 4.4;""")

# 6. Queen bee: stronger, more charges, faster recharge, smashes attacks in her way and knocks the boss off his next attack
rep("    queen: lv => ({ cd: 45 - (lv - 1) * 20 / 9, charges: lv < 4 ? 1 : lv < 8 ? 2 : 3, dmg: 8 + (lv - 1) * 12 / 9, band: 0.10 + (lv - 1) * 0.08 / 9 }),",
    "    queen: lv => ({ cd: 35 - (lv - 1), charges: lv < 4 ? 2 : lv < 8 ? 3 : 4, dmg: 14 + (lv - 1) * 10 / 9 }),")
rep("desc: 'A huge queen bee who buzzes in and charges at the boss. She only comes out in boss fights.',",
    "desc: 'A huge queen bee who buzzes in and charges at the boss, smashing any attacks in her way. Each hit knocks the boss off his next attack for a second. She only comes out in boss fights.',")
rep("""      qd.x += qd.vx * sp * dt; qd.y += qd.vy * sp * dt; queenTrail(2);
""", """      qd.x += qd.vx * sp * dt; qd.y += qd.vy * sp * dt; queenTrail(2);
      const qr = 70 * queenScale(); // she smashes boss attacks she flies through (not the warning lines or the ground)
      for (const p of proj) if (p.owner && !p.dead && (!p.harmless || p.k === 'knight') && !(p.delay > p.t) && Math.hypot(p.x - qd.x, p.y - qd.y) < qr + (p.r || 14)) { p.dead = true; splat(p.x, p.y, '#f2a516', 5); }
""")
rep("""          damageBoss(qd.dmg, ob);
          if (ob.mode === 'down') achUnlock('royal');""", """          damageBoss(qd.dmg, ob);
          if (ob.mode === 'down') achUnlock('royal');
          else if (fighting(ob)) ob.atkT = Math.max(ob.atkT, 0) + 1; // knocked off his next attack for a second""")

# 7. Richer hives: more honeycombs too
rep("    const hv = upg.hives || 0, dropKg = (0.6 - 0.052 * hv) / (WX - 0.4 - 0.052 * hv); // keeps the drops' kilos per minute the same too\n"
    "    if (r < 0.045) {",
    "    const hv = upg.hives || 0, combP = 0.045 + 0.006 * hv, dropKg = (0.6 - 0.058 * hv) / (WX - 0.4 - 0.058 * hv); // keeps the drops' kilos per minute the same too\n"
    "    if (r < combP) {")
rep("    r -= 0.045;\n    if (r < 0.015) { items.push({ kind: 'lab'", "    r -= combP;\n    if (r < 0.015) { items.push({ kind: 'lab'")
rep("""    const r = Math.random() * WX, x = 30 + Math.random() * (W - 60), y = combBottom(), dropKg = (0.63 - 0.04 * hv) / (WX - 0.37 - 0.04 * hv);
    if (r < 0.06) { if (purity < 100) items.push({ kind: 'comb', x, y, vy: 110 * sp, r: 16, rot: Math.random() * 6 }); else spawnDrop(sp, undefined, undefined, undefined, dropKg); }
    else if (r < 0.09) items.push({ kind: 'lab', x, y, vy: 120 * sp, r: 14, rot: 0 });
    else if (r < 0.12) items.push({ kind: 'shilajit', x, y, vy: 140 * sp, r: 19, rot: 0, vr: (Math.random() - .5) * 2 });
    else if (r < 0.135 + 0.01 * hv) spawnBox(sp, x);
    else if (r < 0.37 + 0.04 * hv) spawnJar(sp, x);""", """    const c = 0.008 * hv; // Richer hives: more honeycombs as well
    const r = Math.random() * WX, x = 30 + Math.random() * (W - 60), y = combBottom(), dropKg = (0.63 - 0.048 * hv) / (WX - 0.37 - 0.048 * hv);
    if (r < 0.06 + c) { if (purity < 100) items.push({ kind: 'comb', x, y, vy: 110 * sp, r: 16, rot: Math.random() * 6 }); else spawnDrop(sp, undefined, undefined, undefined, dropKg); }
    else if (r < 0.09 + c) items.push({ kind: 'lab', x, y, vy: 120 * sp, r: 14, rot: 0 });
    else if (r < 0.12 + c) items.push({ kind: 'shilajit', x, y, vy: 140 * sp, r: 19, rot: 0, vr: (Math.random() - .5) * 2 });
    else if (r < 0.135 + 0.01 * hv + c) spawnBox(sp, x);
    else if (r < 0.37 + 0.048 * hv) spawnJar(sp, x);""")
rep("desc: 'More of the honey that falls comes as jars and 10 kg boxes.',\n      lvText: lv => `Jars ${Math.round((0.28 + 0.04 * lv) * 100)}% of honey, boxes ${f2(2 + 1.2 * lv)}%` },",
    "desc: 'More of the honey that falls comes as jars, 10 kg boxes and honeycombs.',\n      lvText: lv => `Jars ${Math.round((0.28 + 0.04 * lv) * 100)}% of honey, boxes ${f2(2 + 1.2 * lv)}%, combs ${f2(4.5 + 0.6 * lv)}%` },")

# 8. Achievements from the shed
rep("""        <button class="btn" id="shedDone" type="button">Back to the hives</button>
      </div>""", """        <div class="actions shedacts"><button class="btn" id="shedDone" type="button">Back to the hives</button><button class="btn ghost small" data-ach type="button">Achievements <span class="achcount"></span></button></div>
      </div>""")
rep("    achPrev = ['startScreen', 'pauseScreen', 'overScreen', 'soldScreen'].find(id => !$(id).hidden) || null;",
    "    achPrev = ['shedScreen', 'startScreen', 'pauseScreen', 'overScreen', 'soldScreen'].find(id => !$(id).hidden) || null;")

# 9. The real thing: unlocks when the waitlist form is actually sent. The waitlist page leaves a note in this browser.
rep("{ id: 'real', name: 'The real thing', desc: 'Open the waitlist from the game.' },",
    "{ id: 'real', name: 'The real thing', desc: 'Join the waitlist.' },")
rep("  document.querySelectorAll('a[href*=\"pages/contact\"]').forEach(el => el.addEventListener('click', () => achUnlock('real'))); // the waitlist links\n",
    "  // The waitlist page (same site) sets this after a successful signup; works even with the game open in another tab\n"
    "  const WAIT_KEY = 'honey-gobbler-waitlist';\n"
    "  const checkWaitlist = () => { try { if (localStorage.getItem(WAIT_KEY)) achUnlock('real'); } catch (e) {} };\n"
    "  addEventListener('storage', e => { if (e.key === WAIT_KEY && e.newValue) achUnlock('real'); });\n"
    "  addEventListener('focus', checkWaitlist);\n"
    "  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkWaitlist(); });\n")
rep("    achMigrate(); updateAchCount();\n", "    achMigrate(); updateAchCount(); checkWaitlist();\n")

open(fn, 'w').write(s)
print('ok')
