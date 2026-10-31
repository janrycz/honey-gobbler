import sys
fn = sys.argv[1]
s = open(fn).read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)

# ---------- endless: each boss gets harder each time you meet HIM again, not with the round number ----------
rep("let endless = false, endlessNext = 0, endlessRound = 0, revivesLeft = REVIVES;",
    "let endless = false, endlessNext = 0, endlessRound = 0, revivesLeft = REVIVES, endlessSeen = {};")
rep("    endless = false; endlessNext = 0; endlessRound = 0; revivesLeft = REVIVES;",
    "    endless = false; endlessNext = 0; endlessRound = 0; revivesLeft = REVIVES; endlessSeen = {};")
rep("    endless = true; endlessRound = 0; endlessNext = GOAL + STAGE_KG; revivesLeft = REVIVES;",
    "    endless = true; endlessRound = 0; endlessNext = GOAL + STAGE_KG; revivesLeft = REVIVES; endlessSeen = {};")
rep("""    const def = BOSSES[i], k = bossK();
    const hp = isEndless ? Math.round((def.ehp || def.hp) * (0.8 + 0.25 * endlessRound)) : def.hp;""",
    """    const def = BOSSES[i], k = bossK();
    // endless: how hard this boss is depends on how many times you've met him this run (first time 0, then 3, 6, 9...)
    const elv = isEndless ? ENDLESS_STEP * ((endlessSeen[i] = (endlessSeen[i] || 0) + 1) - 1) : 0;
    const hp = isEndless ? Math.round((def.ehp || def.hp) * (0.8 + 0.25 * elv)) : def.hp;""")
rep("      speed: (isEndless ? Math.max(0.45, 0.9 - 0.06 * endlessRound) : 1) * (n > 1 ? 1.25 : 1) * (def.pace || 1),",
    "      speed: (isEndless ? Math.max(0.45, 0.9 - 0.06 * elv) : 1) * (n > 1 ? 1.25 : 1) * (def.pace || 1), elv,")
rep("    if (opts.boss && endless) dmg = Math.round(dmg * (1 + Math.min(0.6, 0.04 * endlessRound))); // endless bosses hit harder each round",
    "    if (opts.boss && endless) dmg = Math.round(dmg * (1 + Math.min(0.6, 0.04 * lvOf(opts.boss)))); // endless bosses hit harder each time you meet them\n"
    "    if (upg.wax) dmg = Math.max(1, Math.round(dmg * (1 - 0.05 * upg.wax))); // Beeswax coating")
rep("""  // Endless bosses throw 10% more each round (up to double), hit 4% harder each round (up to +60%) and give 3.75% less warning
  // each round (down to 70%). Attacks spread across the screen also scale with its width; attacks aimed at you don't.
  const endlessMore = () => endless ? Math.min(2, 1 + 0.1 * endlessRound) : 1;
  const teleMul = () => endless ? Math.max(0.7, 1 - 0.0375 * endlessRound) : 1;""",
    """  // Endless bosses get a level each time you meet the same one again (0, 3, 6, 9...). Per level they throw 10% more (up to
  // double), hit 4% harder (up to +60%) and give 3.75% less warning (down to 70%). Attacks spread across the screen also
  // scale with its width; attacks aimed at you don't.
  const endlessMore = (b = boss) => endless ? Math.min(2, 1 + 0.1 * lvOf(b)) : 1;
  const teleMul = (b = boss) => endless ? Math.max(0.7, 1 - 0.0375 * lvOf(b)) : 1;""")
rep("    if (endless && p.owner) { const m = teleMul(); if (p.delay) p.delay *= m; if (p.tele) p.tele *= m; } // less warning in endless",
    "    if (endless && p.owner) { const m = teleMul(p.owner); if (p.delay) p.delay *= m; if (p.tele) p.tele *= m; } // less warning in endless")
rep("const k = bossK(), x0 = b.x + 50 * k, y0 = b.y - 10 * k, er = endless ? endlessRound : 0;",
    "const k = bossK(), x0 = b.x + 50 * k, y0 = b.y - 10 * k, er = lvOf(b);")
rep("+ (endless ? Math.min(3, Math.floor(endlessRound / 2)) : 0)), xs = [clamp(spoon.x, 30, W - 30)];",
    "+ Math.min(3, Math.floor(lvOf(b) / 2))), xs = [clamp(spoon.x, 30, W - 30)];")
rep("""    const pdt = dt * HS * (1 + 0.5 * Math.min(bossIdx, BOSS_COUNT - 1) / (BOSS_COUNT - 1) + (endless ? Math.min(0.9, 0.08 * endlessRound) : 0));
    for (let i = proj.length - 1; i >= 0; i--) {
      const p = proj[i];""", """    const pdt0 = dt * HS * (1 + 0.5 * Math.min(bossIdx, BOSS_COUNT - 1) / (BOSS_COUNT - 1));
    for (let i = proj.length - 1; i >= 0; i--) {
      const p = proj[i];
      const pdt = p.owner && endless ? pdt0 + dt * HS * Math.min(0.9, 0.08 * lvOf(p.owner)) : pdt0; // endless: faster each time you meet him""")
rep("  const BEE_SPEED = 300, BELT_PUSH = 290;",
    "  const BEE_SPEED = 300, BELT_PUSH = 290;\n"
    "  const ENDLESS_STEP = 3; // endless: levels a boss gains each time you meet him again\n"
    "  const lvOf = b => (endless && b && b.endless ? b.elv || 0 : 0);\n"
    "  const waxGrip = () => 1 / (1 + 0.1 * (upg.wax || 0)); // Beeswax coating: sticky stuff and belts grip half as hard when maxed")

# ---------- Beeswax coating: less damage, sticky stuff and the belt grip less ----------
rep("""    { id: 'sweet', name: 'Sweet tooth', max: 5,""",
    """    { id: 'wax', name: 'Beeswax coating', cost: costs(1.2), desc: 'Coats your spoon in beeswax. Everything that hits you does less damage, and sticky syrup, resin and the factory belt get less grip on it.',
      lvText: lv => { if (!lv) return 'Not owned'; return `${lv * 5}% less damage. Sticky stuff and belts grip ${Math.round(100 * (1 - 1 / (1 + 0.1 * lv)))}% less.`; } },
    { id: 'sweet', name: 'Sweet tooth', max: 5,""")
rep("upg = { thick: 0, bee: 0, colonex: 0, smoker: 0, magnet: 0, extractor: 0, queen: 0, sweet: 0, hives: 0, crazy: 0 };",
    "upg = { thick: 0, bee: 0, colonex: 0, smoker: 0, magnet: 0, extractor: 0, queen: 0, wax: 0, sweet: 0, hives: 0, crazy: 0 };")
rep("    let slow = spoon.sticky ? 0.1 : 1;", "    let slow = spoon.sticky ? 1 - 0.9 * waxGrip() : 1;")
rep("      const push = belt.dir * BELT_PUSH * G * G * (smokeT > 0 ? smokeSlow : 1) * dt;",
    "      const push = belt.dir * BELT_PUSH * G * G * (smokeT > 0 ? smokeSlow : 1) * waxGrip() * dt;")
rep("  const GRANDAD_BUY = { thick: 'Leave it in the frame longer. Thicker honey.',",
    "  const GRANDAD_BUY = { wax: 'Beeswax. Keeps the rain off the hives and the syrup off your spoon.', thick: 'Leave it in the frame longer. Thicker honey.',")

# debug: set how many times a boss has been met this endless run
rep("      setRound(n) { endlessRound = n; },", "      setRound(n) { endlessRound = n; },\n      setSeen(i, n) { endlessSeen[i] = n; },")

open(fn, 'w').write(s)
print('ok')
