import sys
p = sys.argv[1]
s = open(p).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:100]); s = s.replace(old, new)

# one level of each upgrade per shed visit, so nobody maxes out before a few rounds of endless
rep("  let qd = null, savings = 0, fightSaved = 0, crazyOn = false, chat = null, fightHits = 0;",
    "  let qd = null, savings = 0, fightSaved = 0, crazyOn = false, chat = null, fightHits = 0, shedBought = {};")
rep("""    const lv = upg[s.id], maxed = lv >= s.max, locked = !!(s.unlock && !s.unlock());
    const base = maxed ? 0 : s.cost[lv];
    return { lv, maxed, locked, base, cost: base * priceMult() };""", """    const lv = upg[s.id], maxed = lv >= s.max, locked = !!(s.unlock && !s.unlock()), sold = !!shedBought[s.id];
    const base = maxed ? 0 : s.cost[lv];
    return { lv, maxed, locked, sold, base, cost: base * priceMult() };""")
rep("  function anythingToBuy() { return SHOP.some(s => { const inf = itemInfo(s); return !inf.locked && !inf.maxed; }); }",
    "  function anythingToBuy() { return SHOP.some(s => { const inf = itemInfo(s); return !inf.locked && !inf.maxed; }); }\n  const canBuy = inf => !inf.locked && !inf.maxed && !inf.sold && wallet() >= inf.cost;")
rep("""      el.querySelector('.pr').innerHTML = inf.maxed ? (s.max === 1 ? 'Owned' : 'Max') : (inf.cost > inf.base ? '<s>' + inf.base + '</s> ' : '') + inf.cost + ' kg';
      el.className = 'tile' + (s.id === shedSel ? ' sel' : '') + (inf.locked ? ' locked' : '') + (inf.maxed ? ' done' : '') + (!inf.locked && !inf.maxed && wallet() < inf.cost ? ' cant' : '');""",
"""      el.querySelector('.pr').innerHTML = inf.maxed ? (s.max === 1 ? 'Owned' : 'Max') : inf.sold ? 'Next visit' : (inf.cost > inf.base ? '<s>' + inf.base + '</s> ' : '') + inf.cost + ' kg';
      el.className = 'tile' + (s.id === shedSel ? ' sel' : '') + (inf.locked ? ' locked' : '') + (inf.maxed ? ' done' : '') + (!inf.locked && !inf.maxed && (inf.sold || wallet() < inf.cost) ? ' cant' : '');""")
rep("""    else if (inf.maxed) { btn.textContent = 'Max level'; btn.disabled = true; }
    else if (wallet() < inf.cost) {""", """    else if (inf.maxed) { btn.textContent = 'Max level'; btn.disabled = true; }
    else if (inf.sold) { btn.textContent = 'Back in stock after the next boss'; btn.disabled = true; }
    else if (wallet() < inf.cost) {""")
rep("""    if (inf.locked || inf.maxed || wallet() < inf.cost) return;
    const fromSav = Math.min(savings, inf.cost);
    savings -= fromSav; score -= inf.cost - fromSav;
    tally.spent += inf.cost; upg[id]++;""", """    if (!canBuy(inf)) return;
    const fromSav = Math.min(savings, inf.cost);
    savings -= fromSav; score -= inf.cost - fromSav;
    tally.spent += inf.cost; upg[id]++; shedBought[id] = true;""")
rep("    state = 'shed'; phase = 'harvest'; spawnT = 0.5; ev = null; evT = rnd(12, 16); qd = null;", "    state = 'shed'; phase = 'harvest'; spawnT = 0.5; ev = null; evT = rnd(12, 16); qd = null; shedBought = {};")
rep("""      if (!inf.locked && !inf.maxed && wallet() < inf.cost) grandadSay(GRANDAD_BROKE);""",
    """      if (!inf.locked && !inf.maxed) { if (inf.sold) grandadSay(GRANDAD_STOCK); else if (wallet() < inf.cost) grandadSay(GRANDAD_BROKE); }""")
rep("""    if (inf.locked || inf.maxed || wallet() < inf.cost) return;
    shedPending = s.id;""", """    if (!canBuy(inf)) return;
    shedPending = s.id;""")
rep('''  const GRANDAD_BROKE = "You can't afford that. Go catch more honey.";''',
    '''  const GRANDAD_BROKE = "You can't afford that. Go catch more honey.";\n  const GRANDAD_STOCK = 'One at a time. Come back after the next boss and I will have another.';''')
rep("""        <p class="hint">Honey you catch in boss fights goes into your savings, and purchases use it first. After that they take from your harvest, which pushes the next boss further away.</p>""",
    """        <p class="hint">Honey you catch in boss fights goes into your savings, and purchases use it first. After that they take from your harvest, which pushes the next boss further away. Grandad has one level of each upgrade per visit.</p>""")
rep("      shop: () => SHOP.map(s => { const inf = itemInfo(s); return { id: s.id, lv: inf.lv, cost: inf.cost, locked: inf.locked, maxed: inf.maxed }; }),",
    "      shop: () => SHOP.map(s => { const inf = itemInfo(s); return { id: s.id, lv: inf.lv, cost: inf.cost, locked: inf.locked, maxed: inf.maxed, sold: inf.sold }; }),")
# fight lengths: trim the last three bosses a little
rep("sub: 'Blends three countries in one jar and sticks a new flag on it.', hp: 380,", "sub: 'Blends three countries in one jar and sticks a new flag on it.', hp: 370,")
rep("sub: 'Live on stream. Rating your face. Selling the course.', hp: 460,", "sub: 'Live on stream. Rating your face. Selling the course.', hp: 430,")
rep("""sub: "Here to disprove atheism. You're in the way.", hp: 600,""", """sub: "Here to disprove atheism. You're in the way.", hp: 540,""")
open(p, 'w').write(s)
print('to5g ok')
