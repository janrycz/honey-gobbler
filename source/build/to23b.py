import sys
fn=sys.argv[1]
s=open(fn).read()
assert s.count('hp: 370, pace: 0.8, dmgMul: 1.15,')==1
s=s.replace('hp: 370, pace: 0.8, dmgMul: 1.15,','hp: 370, pace: 0.8, dmgMul: 1.25,')
open(fn,'w').write(s)
