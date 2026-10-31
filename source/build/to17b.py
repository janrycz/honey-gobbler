import sys
fn = sys.argv[1]
s = open(fn).read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)
rep("const BRAWL_HP = 0.5, BRAWL_PACE = 1.35;", "const BRAWL_HP = 0.35, BRAWL_PACE = 1.35;")
rep("    if (!o.force && brawl && bosses.filter(x => x !== b && x.say && x.say.t > 0.5).length >= 2) return false; // everyone at once: two talk at a time",
    "    if (!o.force && brawl) { const talk = bosses.filter(x => x !== b && x.say && x.say.t > 0.5); if (talk.length >= 2 || talk.some(x => Math.abs(x.x - b.x) < Math.min(250, W * 0.44) + 24)) return false; } // everyone at once: two at a time, never side by side")
rep("""    const narrow = W < 640, fs = narrow ? 10.5 : 12, lh = Math.round(fs * 1.4), pad = 8, rows = narrow ? 4 : 8;
    const w = narrow ? Math.min(W * 0.56, 240) : Math.min(290, W * 0.27), x = narrow ? 8 : 12, top = combBottom() + (narrow ? 40 : 46);""",
    """    const narrow = W < 640, fs = narrow ? 10.5 : 12, lh = Math.round(fs * 1.4), pad = 8, rows = narrow || brawl ? 4 : 8;
    const w = narrow ? Math.min(W * 0.56, 240) : Math.min(290, W * 0.27), x = narrow ? 8 : 12, top = brawl ? bossHome() + 84 * bossK() : combBottom() + (narrow ? 40 : 46); // below the row of bosses when everyone's here""")
open(fn, 'w').write(s)
print('ok')
