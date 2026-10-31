import sys
fn = sys.argv[1]
s = open(fn).read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)
rep("return brawl ? Math.min(k * 0.8, Math.max(0.36, W / brawl.S / 200)) : k; } // smaller when everyone is on screen",
    "return brawl ? Math.min(k * 0.8, Math.max(0.36, laneW() / 200)) : k; } // smaller when everyone is on screen")
rep("  const laneX = (slot, f) => W * (slot + f) / brawl.S;",
    "  const laneR = () => W - (W < 560 ? 64 : 76); // clear of the power buttons on the right\n"
    "  const laneW = () => (laneR() - 6) / brawl.S;\n"
    "  const laneX = (slot, f) => 6 + laneW() * (slot + f);")
rep("const bw = b.brawl && brawl, w = bw ? W / brawl.S * 0.86 :", "const bw = b.brawl && brawl, w = bw ? laneW() * 0.88 :")
rep("""      const sub = b.brawl ? (brawl && brawl.queue.length ? 'The rest are waiting their turn. ' : '') + "Nothing is lost if you drop. Colonex is with them." : two ? """,
    """      const sub = b.brawl ? (brawl && brawl.queue.length ? 'The rest wait their turn. Nothing lost if you drop.' : 'Nothing is lost if you drop. Colonex is with them.') : two ? """)
rep("    if (b.pushup > 0) outlined('DAY 1 OF 500 PUSHUPS  ' + b.reps + '/500', cx, y + 44, two ? 12 : 16, '#ffd36b');",
    "    if (b.pushup > 0) outlined((bw ? 'PUSHUPS  ' : 'DAY 1 OF 500 PUSHUPS  ') + b.reps + '/500', cx, y + 44, two ? 12 : 16, '#ffd36b');")
rep("    const hp = isEndless ? Math.round((def.ehp || def.hp) * (0.8 + 0.25 * elv) * (inBrawl ? BRAWL_HP : 1)) : def.hp;",
    "    const hp = isEndless ? Math.round((def.ehp || def.hp) * (0.8 + 0.25 * elv) * (inBrawl ? BRAWL_HP * (brawl.S >= 5 ? 1 : 0.8) : 1)) : def.hp; // fewer fit on a phone, so a bit less each")
open(fn, 'w').write(s)
print('ok')
