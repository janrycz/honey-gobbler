import sys
fn = sys.argv[1]
s = open(fn).read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)
# endless: a bit more health from the start, more each meeting and a little more every round
rep("    const hp = isEndless ? Math.round((def.ehp || def.hp) * (0.8 + 0.25 * elv) *",
    "    const hp = isEndless ? Math.round((def.ehp || def.hp) * (1 + 0.25 * elv + 0.05 * endlessRound) *")
rep("    // how hard he attacks: endless bosses start a few levels up and creep up half a level a round (health still goes by meetings)",
    "    // how hard he attacks: endless bosses start a few levels up and creep up half a level a round")
rep("  const ENDLESS_BASE = 4; // ...and the level his attacks start at the first time", "  const ENDLESS_BASE = 5; // ...and the level his attacks start at the first time")
# every boss you beat puts 50 kg in Grandad's Shed
rep("    tally.bosses++; if (b.brawl && brawl) brawl.beaten++;",
    "    tally.bosses++; if (b.brawl && brawl) brawl.beaten++;\n"
    "    if (!b.brawl) { savings += BOSS_BONUS; fightSaved += BOSS_BONUS; tally.saved += BOSS_BONUS; floatText(W / 2, H * 0.53, '+' + BOSS_BONUS + ' kg for the shed', '#e9d7ff'); } // a reward for every boss")
rep("  const ENDLESS_STEP = 4;", "  const BOSS_BONUS = 50; // kg into your savings for every boss you beat\n  const ENDLESS_STEP = 4;")
open(fn, 'w').write(s)
print('ok')
