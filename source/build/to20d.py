import sys
fn=sys.argv[1]
s=open(fn).read()
old="Honey from boss fights goes into your savings and gets spent first, then the honey you've harvested. Spending never pushes the next boss back."
new="Honey from boss fights goes into your savings, plus 50 kg for every boss you beat. Savings get spent first, then the honey you've harvested. Spending never pushes the next boss back."
assert s.count(old)==1
s=s.replace(old,new)
open(fn,'w').write(s)
