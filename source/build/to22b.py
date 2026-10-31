import sys
fn = sys.argv[1]
s = open(fn).read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)
# venom: the drain was doing most of the damage once stings came thick and fast. Now the drain is short and mild,
# strongest from the giant stinger; little stingers only slow you and add to the stack.
rep("    spoon.venom = Math.max(spoon.venom, full ? 3.5 : 2); spoon.venomDps = 2.2 * w; spoon.sting = Math.max(spoon.sting, full ? 2.2 : 1.2);",
    "    if (full) { spoon.venom = Math.max(spoon.venom, n > 1 ? 3 : 2); spoon.venomDps = (n > 1 ? 2 : 1) * w; }\n    spoon.sting = Math.max(spoon.sting, full ? 1.8 : 1);")
open(fn, 'w').write(s)
print('ok')
