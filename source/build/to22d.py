import sys
fn = sys.argv[1]
s = open(fn).read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)
# story curve: the Shilajit Coach was still a dip after the App Founder, the Apologist level with him
rep("hp: 300, pace: 0.8, dmgMul: 1.12,", "hp: 300, pace: 0.7, dmgMul: 1.3,")
rep("      attacks: ['rope', 'prices', 'pushups', 'resin', 'drinks'],", "      attacks: ['rope', 'prices', 'pushups', 'resin', 'drinks', 'rope'],")
rep("hp: 370, pace: 0.88, dmgMul: 1.08,", "hp: 370, pace: 0.8, dmgMul: 1.15,")
rep("hp: 430, pace: 0.8, dmgMul: 1.2,", "hp: 430, pace: 0.75, dmgMul: 1.2,")
# endless: level 5 from round 1 doubled how hard round 1 hit; start at 2 and keep creeping up each round
rep("  const ENDLESS_BASE = 5;", "  const ENDLESS_BASE = 2;")
open(fn, 'w').write(s)
print('ok')
