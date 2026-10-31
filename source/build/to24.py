import sys
fn = sys.argv[1]
s = open(fn).read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)
# the shed: one number you can spend, where it comes from, and that spending doesn't push the boss back
rep("""        <div class="wallet"><span>Savings</span><b id="shedSav">0 kg</b><span id="shedKg"></span><span id="shedNext"></span></div>
        <p class="hint">Honey from boss fights goes into your savings, plus 50 kg for every boss you beat. Savings get spent first, then the honey you've harvested. Spending never pushes the next boss back.</p>""",
    """        <div class="wallet"><span>You can spend</span><b id="shedSav">0 kg</b><span id="shedKg"></span></div>
        <p class="hint" id="shedNext"></p>""")
rep("""    $('shedSav').textContent = fmtKg(savings);
    $('shedKg').textContent = '+ ' + fmtKg(honeyLeft()) + ' of honey';
    $('shedNext').textContent = '· next boss at ' + (endless ? endlessNext : thresholdFor(bossIdx)) + ' kg';""",
    """    $('shedSav').textContent = fmtKg(wallet());
    $('shedKg').textContent = savings >= 0.1 ? '(' + fmtKg(honeyLeft()) + ' harvested + ' + fmtKg(savings) + ' from boss fights)' : '';
    $('shedNext').textContent = 'All of it is yours to spend: every kg you harvest, honey caught in boss fights and ' + BOSS_BONUS + ' kg for every boss you beat. Spending never brings the next boss closer or pushes it back: he turns up after ' + toNextBoss() + ' kg more harvesting either way.';""")
rep("  const wallet = () => savings + honeyLeft();",
    "  const wallet = () => savings + honeyLeft();\n  const toNextBoss = () => Math.max(0, Math.ceil((endless ? endlessNext : thresholdFor(Math.min(bossIdx, BOSS_COUNT - 1))) - score)); // kg still to harvest")
rep("    const src = fromKg <= 0 ? 'It all comes out of your savings.' : fromSav >= 0.1 ? fmtKg(fromSav) + ' from savings, ' + fmtKg(fromKg) + ' from your honey.' : 'It comes out of your honey.';",
    "    const src = 'You\\'ll have ' + fmtKg(wallet() - inf.cost) + ' left to spend.';")
# the bar at the top: how much is left to harvest, not the total the boss sits at
rep("    else if (endless) next = (crazyOn ? 'Crazy' : 'Endless') + ' · boss at ' + endlessNext + ' kg';",
    "    else if (endless) next = (crazyOn ? 'Crazy' : 'Endless') + ' · next boss in ' + toNextBoss() + ' kg';")
rep("    else next = SEASONS[seasonIdx()].m + ' · boss at ' + thresholdFor(bossIdx) + ' kg';",
    "    else next = SEASONS[seasonIdx()].m + ' · next boss in ' + toNextBoss() + ' kg';")
rep("<p class=\"hint\">The bosses keep coming back, stronger every round. Your upgrades and shed savings carry on.</p>",
    "<p class=\"hint\">The bosses keep coming back, stronger every round. Your upgrades and all your honey carry on.</p>")
open(fn, 'w').write(s)
print('ok')
