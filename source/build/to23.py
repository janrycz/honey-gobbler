import sys
fn = sys.argv[1]
s = open(fn).read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)
# everyone at once: full-strength bosses (their endless health and attacks), only the turn-taking keeps it possible
rep("(1 + 0.25 * elv + 0.05 * endlessRound) * (inBrawl ? BRAWL_HP * (brawl.S >= 5 ? 1 : 0.8) : 1)) : def.hp; // fewer fit on a phone, so a bit less each",
    "(1 + 0.25 * (inBrawl ? 0 : elv) + 0.05 * endlessRound)) : def.hp;")
rep("  const BRAWL_HP = 0.35, BRAWL_PACE = 1.35;", "  const BRAWL_PACE = 1; // each boss attacks as often as in a normal fight, they just take turns")
rep("      lv: ENDLESS_STEP * (1 + Math.floor(runStats.crazyFights / 4)), // harder the further you've got in crazy mode",
    "      lv: ENDLESS_BASE + ENDLESS_STEP * Math.floor(runStats.crazyFights / 4), // as strong as in endless, and harder the further you've got in crazy mode")
open(fn, 'w').write(s)
print('ok')
