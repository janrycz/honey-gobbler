import sys
fn = sys.argv[1]
s = open(fn).read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)
# his name bar in crazy mode and the all-at-once fight shows the species, not "Giant hornet"
rep("key: 'hornet', name: 'Vespa mandarinia', tag: 'Giant hornet',", "key: 'hornet', name: 'Vespa mandarinia', tag: 'Vespa mandarinia',")
# balance: he was hurting about 180 purity a minute against the bot; aim for a bit above the Disprover
rep("sub: 'The northern giant hornet. It came for the hives.', hp: 640,", "sub: 'The northern giant hornet. It came for the hives.', hp: 580,")
rep("      const n = b.p3 ? 14 : b.p2 ? 12 : 10;\n      b.spray = { left: n, next: 0.35, every: b.p3 ? 0.13 : 0.17 };\n      return 1.6 + n * 0.17;",
    "      const n = b.p3 ? 11 : b.p2 ? 9 : 7;\n      b.spray = { left: n, next: 0.35, every: b.p3 ? 0.15 : 0.2 };\n      return 1.6 + n * 0.2;")
rep("        if (hk.shootT <= 0) { hk.shootT = b.p2 ? 0.55 : 0.75; shootStinger(b, 0); } // point-blank stings",
    "        if (hk.shootT <= 0) { hk.shootT = b.p2 ? 0.75 : 1.0; shootStinger(b, 0); } // point-blank stings")
rep("          p.shootT = p.owner.p2 ? 2.0 : 2.6;", "          p.shootT = p.owner.p2 ? 2.6 : 3.2;")
rep("        p.shootT = rnd(1.8, 2.8) / ph / (spoon.mark > 0 ? 1.5 : 1);", "        p.shootT = rnd(2.4, 3.4) / ph / (spoon.mark > 0 ? 1.5 : 1);")
rep("diveT: 3 + (sd > 0 ? 1.8 : 0), life: 16,", "diveT: 3 + (sd > 0 ? 1.8 : 0), life: 12,")
rep("        if (p.shootT <= 0) { p.shootT = 1.6; const a = Math.atan2(spoon.y - 10 - p.y, spoon.x - p.x), v = 330 * hornetSpd(o);",
    "        if (p.shootT <= 0) { p.shootT = 2.0; const a = Math.atan2(spoon.y - 10 - p.y, spoon.x - p.x), v = 330 * hornetSpd(o);")
open(fn, 'w').write(s)
print('ok')
