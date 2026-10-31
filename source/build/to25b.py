import sys
fn = sys.argv[1]
s = open(fn).read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)
# phones stay close to how they were (Jan was happy with them); on a computer the first three bosses stay gentler
rep("  const COMB_FIGHT = () => (W < 560 ? 12 : 8); // in a boss fight the comb heals less, so the bosses can actually wear you down (a bit more on phones)",
    "  const COMB_FIGHT = () => (W < 560 ? 15 : !endless && bossIdx < 3 ? 12 : 8); // in a boss fight the comb heals less, so the bosses can wear you down (phones and the first bosses less so)")
rep("    if (phase !== 'boss') heal(HEAL[kind] || 0); // in boss fights they flick it at the boss instead",
    "    if (phase !== 'boss' || W < 560) heal(HEAL[kind] || 0); // on a computer they don't heal you in boss fights: they flick it at the boss instead")
open(fn, 'w').write(s)
print('ok')
