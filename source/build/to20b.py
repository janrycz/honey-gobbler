import sys
fn = sys.argv[1]
s = open(fn).read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)
rep("      b.forceNext = b.def.p2attacks[0]; b.atkT = Math.min(b.atkT, 1.2);",
    "      if (!b.p3) b.forceNext = b.def.p2attacks[0]; b.atkT = Math.min(b.atkT, 1.2); // (a big hit straight into phase 3 keeps the phase 3 opener)")
rep("      b.forceNext = b.def.p3attacks[0]; b.atkT = Math.min(b.atkT, 1.2);",
    "      b.forceNext = b.def.p3attacks[0]; b.atkT = Math.min(b.atkT, 1.2);\n      for (const q of proj) if (q.k === 'scout' && q.owner === b) q.life = 0; // his scouts clear off for the slaughter")
open(fn, 'w').write(s)
print('ok')
