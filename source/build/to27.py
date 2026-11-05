import sys
fn = sys.argv[1]
s = open(fn).read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)

# nine bosses take about a minute longer, so "Sold out fast" is under 16 minutes
rep("desc: 'Finish a run in under 15 minutes.'", "desc: 'Finish a run in under 16 minutes.'")
rep("    if (elapsed < 15 * 60) achUnlock('fast');", "    if (elapsed < 16 * 60) achUnlock('fast');")
# the App Founder's inside joke (his old co-founder is fine with it)
rep("""      lines: ['Download my app.', 'Track your honey.',""", """      lines: ['Download my app.', 'Track your honey.', 'I only marry white women.',""")

open(fn, 'w').write(s)
print('ok')
