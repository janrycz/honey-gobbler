import sys
fn = sys.argv[1]
s = open(fn).read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)
# on a narrow phone the leading spray boxed you in from the middle: lead less and fire fewer there
rep("    if (o.lead && !aim.queen) ax += clamp(spoon.vx || 0, -900, 900) * (Math.hypot(aim.x - x0, aim.y - y0) / (v * 1.5)) * 0.8; // aims where you're going",
    "    if (o.lead && !aim.queen) ax += clamp(spoon.vx || 0, -900, 900) * (Math.hypot(aim.x - x0, aim.y - y0) / (v * 1.5)) * (W < 560 ? 0.45 : 0.8); // aims where you're going")
rep("      const n = b.p3 ? 11 : b.p2 ? 9 : 7;\n", "      const n = (b.p3 ? 11 : b.p2 ? 9 : 7) - (W < 560 ? 2 : 0);\n")
open(fn, 'w').write(s)
print('ok')
