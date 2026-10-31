import sys
fn = sys.argv[1]
s = open(fn).read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)
# his stingers fly a little slower on small screens, where there's less room to get out of the way
rep("  const hornetSpd = b => (b && b.p3 ? 1.22 : b && b.p2 ? 1.1 : 1); // his stingers fly faster in each phase",
    "  const hornetSpd = b => (b && b.p3 ? 1.22 : b && b.p2 ? 1.1 : 1) * Math.max(0.8, Math.min(1, G)); // faster in each phase, a bit slower on small screens")
# the Shilajit Coach was now harder than the Looksmaxxer; even them out
rep("hp: 300, pace: 0.72, dmgMul: 1.3,", "hp: 300, pace: 0.8, dmgMul: 1.12,")
rep("hp: 430, pace: 0.85, dmgMul: 1.12,", "hp: 430, pace: 0.8, dmgMul: 1.2,")
open(fn, 'w').write(s)
print('ok')
