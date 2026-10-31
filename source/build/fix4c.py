import sys
p = sys.argv[1]
s = open(p).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:80]); s = s.replace(old, new)
rep("  const GRANDAD_BROKE = ", "  const PRICE_HIKE = 2; // after the Shilajit Coach: \"If you really have a premium product, raise your prices.\"\n  const GRANDAD_HIKE = 'The Shilajit Coach told me: if you really have a premium product, raise your prices. So I doubled them.';\n  const GRANDAD_BROKE = ")
rep("allyQueue = null, shedSel = null, shedPending = null;", "allyQueue = null, shedSel = null, shedPending = null, hikeSaid = false;")
rep("    bees = []; smokeT = 0; queenT = 0; extractT = 0; allyQueue = null;\n", "    bees = []; smokeT = 0; queenT = 0; extractT = 0; allyQueue = null; hikeSaid = false;\n")
rep("""    const lv = upg[s.id], maxed = lv >= s.max, locked = !!(s.unlock && !s.unlock());
    return { lv, maxed, locked, cost: maxed ? 0 : s.cost[lv] };""", """    const lv = upg[s.id], maxed = lv >= s.max, locked = !!(s.unlock && !s.unlock());
    const base = maxed ? 0 : s.cost[lv];
    return { lv, maxed, locked, base, cost: base * priceMult() };""")
rep("  function grandadSay(text) {", """  function priceMult() { return endless || bossIdx > 3 ? PRICE_HIKE : 1; } // bosses 1-4 beaten means the coach is done
  function anythingToBuy() { return SHOP.some(s => { const inf = itemInfo(s); return !inf.locked && !inf.maxed; }); }
  function grandadSay(text) {""")
rep("      el.querySelector('.pr').textContent = inf.locked ? 'Locked' : inf.maxed ? (s.max > 1 ? 'Max' : 'Owned') : inf.cost + ' kg';",
    "      el.querySelector('.pr').innerHTML = inf.locked ? 'Locked' : inf.maxed ? (s.max > 1 ? 'Max' : 'Owned') : (inf.cost > inf.base ? '<s>' + inf.base + '</s> ' : '') + inf.cost + ' kg';")
rep("    grandadSay(pick(GRANDAD_HI));\n    selectItem(shedSel || SHOP[0].id);",
    "    if (!hikeSaid && priceMult() > 1 && anythingToBuy()) { hikeSaid = true; grandadSay(GRANDAD_HIKE); }\n    else grandadSay(pick(GRANDAD_HI));\n    selectItem(shedSel || SHOP[0].id);")
rep(".tile .pr { font: 700 .8rem var(--body); color: var(--honey); font-variant-numeric: tabular-nums; }",
    ".tile .pr { font: 700 .8rem var(--body); color: var(--honey); font-variant-numeric: tabular-nums; }\n.tile .pr s { color: color-mix(in srgb, var(--wax) 50%, transparent); font-weight: 600; margin-right: 2px; }")
open(p, 'w').write(s)
print('ok')
