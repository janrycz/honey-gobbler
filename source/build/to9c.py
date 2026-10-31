import sys
p = sys.argv[1]
s = open(p).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:120]); s = s.replace(old, new)
def between(start, end, new):
    global s
    a = s.index(start); b = s.index(end, a); s = s[:a] + new + s[b:]

between("  const ACH = [", "  const LOCK_SVG", """  const ACH = [
    { id: 'trust', name: 'Trust me bro', desc: 'Beat the Sus Beekeeper without getting hit.' },
    { id: 'blacklist', name: 'Off the blacklist', desc: 'Beat Colonex.' },
    { id: 'fired', name: "You're fired", desc: 'Beat the App Founder.' },
    { id: 'bigman', name: 'Big man ting', desc: 'Beat the Shilajit Coach.' },
    { id: 'notes', name: 'Check my notes', desc: 'Beat the Honey Apologist.' },
    { id: 'mogger', name: 'Mogger', desc: 'Beat the Looksmaxxer.' },
    { id: 'blocked', name: 'Blocked', desc: 'Beat the Disprover.' },
    { id: 'sold', name: 'Sold out', desc: 'Finish a run.', stat: 'season', goal: BOSS_COUNT, show: n => n + ' / ' + BOSS_COUNT + ' bosses' },
    { id: 'fast', name: 'Sold out fast', desc: 'Finish a run in under 12 minutes.' },
    { id: 'spoon', name: 'A spoon and nothing else', desc: 'Beat all seven bosses without buying anything in the shed.' },
    { id: 'nospare', name: 'No spare frames', desc: 'Finish a run without using a second chance.' },
    { id: 'raw', name: 'Raw and unfiltered', desc: 'Finish a run without your purity ever dropping below 50%.' },
    { id: 'endless', name: 'Endless', desc: 'Reach round 5 of endless mode.', stat: 'round', goal: 5, show: n => 'round ' + n + ' / 5' },
    { id: 'going', name: 'Still going', desc: 'Reach round 15 of endless mode.', stat: 'round', goal: 15, show: n => 'round ' + n + ' / 15' },
    { id: 'crazy', name: 'Crazy', desc: 'Beat two bosses at once.' },
    { id: 'crazier', name: 'Crazier', desc: 'Win 10 crazy mode fights.', stat: 'crazyWins', goal: 10 },
    { id: 'herp', name: 'U are herp', desc: 'Colonex bills the bosses over 10,000,000$ in total.', stat: 'billed', goal: 1e7, show: n => Math.floor(n).toLocaleString('en-GB') + '$ / 10,000,000$' },
    { id: 'premium', name: 'Premium product', desc: 'Buy something after the price rise.' },
    { id: 'married', name: "Don't eat this if you're married", desc: 'Eat 10 Shilajit jars in one run.', stat: 'shilajit', goal: 10, show: n => n + ' / 10 in one run' },
    { id: 'grandad', name: "Grandad's favourite", desc: 'Max out everything in the shed.', stat: 'levels', goal: SHOP_LEVELS, show: n => n + ' / ' + SHOP_LEVELS + ' levels' },
    { id: 'labrat', name: 'Lab rat', desc: 'Run 25 lab tests in total.', stat: 'labs', goal: 25 },
    { id: 'knight', name: 'Knight takes', desc: 'Capture 25 knights by swiping the spoon across them.', stat: 'knights', goal: 25 },
    { id: 'royal', name: 'Royal charge', desc: 'Finish a boss off with the queen bee.' },
    { id: 'sugar', name: 'Sugar high', desc: 'Reach a ×5 combo.' },
    { id: 'tonnes', name: 'Ten tonnes', desc: 'Harvest 10,000 kg in total.', stat: 'harvested', goal: 1e4, show: n => Math.floor(n).toLocaleString('en-GB') + ' / 10,000 kg' },
    { id: 'hive', name: 'Hive mind', desc: 'Your bees catch 5,000 things in total.', stat: 'beeCatches', goal: 5000, show: n => Math.floor(n).toLocaleString('en-GB') + ' / 5,000' },
    { id: 'regular', name: 'Supermarket regular', desc: 'Get hit by 100 fakes in total.', stat: 'fakeHits', goal: 100 },
    { id: 'real', name: 'The real thing', desc: 'Open the waitlist from the game.' },
  ];
""")
# the Colonex achievement moved from 1 million to 10 million: anyone who unlocked it below 10 million earns it again
rep("""  try { const s = JSON.parse(localStorage.getItem('honey-gobbler-ach') || '{}'); if (s.done) achData.done = s.done; if (s.stats) achData.stats = s.stats; } catch (e) {}""",
"""  try { const s = JSON.parse(localStorage.getItem('honey-gobbler-ach') || '{}'); if (s.done) achData.done = s.done; if (s.stats) achData.stats = s.stats; } catch (e) {}
  function achMigrate() { if (achData.done.herp && (achData.stats.billed || 0) < 1e7) { delete achData.done.herp; achSave(); } } // its goal went from 1 to 10 million
  achMigrate();""")
rep("""    updateAchCount();
    resize(); reset(); requestAnimationFrame(frame);""", """    achMigrate(); updateAchCount();
    resize(); reset(); requestAnimationFrame(frame);""")
# saving: totals that grow all the time are saved every couple of seconds instead of on every catch
rep("""  function achSave() { try { localStorage.setItem('honey-gobbler-ach', JSON.stringify(achData)); } catch (e) {} }""",
"""  let achDirty = false, achTimer = 0;
  function achSave() { achDirty = false; try { localStorage.setItem('honey-gobbler-ach', JSON.stringify(achData)); } catch (e) {} }
  function achSaveSoon() { achDirty = true; if (!achTimer) achTimer = setTimeout(() => { achTimer = 0; if (achDirty) achSave(); }, 2000); }
  addEventListener('pagehide', () => { if (achDirty) achSave(); });""")
rep("""  function achAdd(key, n) { if (!n) return; achData.stats[key] = (achData.stats[key] || 0) + n; achSave(); achCheck(key); } // running total""",
    """  function achAdd(key, n, lazy) { if (!n) return; achData.stats[key] = (achData.stats[key] || 0) + n; lazy ? achSaveSoon() : achSave(); achCheck(key); } // running total""")
rep("          tally.billed += billed; achAdd('billed', billed);", "          tally.billed += billed; achAdd('billed', billed, true);")
# triggers
rep("""    const a = { keeper: fightHits === 0 ? 'trust' : null, ironfit: 'bigman', apologist: 'notes', looks: 'mogger', disprover: 'blocked' }[b.def.key];""",
    """    const a = { keeper: fightHits === 0 ? 'trust' : null, colonex: 'blacklist', ceo: 'fired', ironfit: 'bigman', apologist: 'notes', looks: 'mogger', disprover: 'blocked' }[b.def.key];""")
rep("""            proj.splice(i, 1); splat(p.x, p.y, '#f4f1ea', 12); floatText(p.x, p.y - c * 0.7, 'Knight captured', '#ffd36b');""",
    """            proj.splice(i, 1); splat(p.x, p.y, '#f4f1ea', 12); floatText(p.x, p.y - c * 0.7, 'Knight captured', '#ffd36b'); achAdd('knights', 1);""")
rep("""    if (two) achUnlock('crazy');""", """    if (two) { achUnlock('crazy'); achAdd('crazyWins', 1); }""")
rep("""    sfx.win(); $('toast').classList.add('low'); achUnlock('sold');""", """    sfx.win(); $('toast').classList.add('low'); achUnlock('sold');
    if (tally.spent === 0) achUnlock('spoon');
    if (revivesLeft === REVIVES) achUnlock('nospare');
    if (tally.minPurity >= 50) achUnlock('raw');
    if (elapsed < 12 * 60) achUnlock('fast');""")
rep("""    tally = { drops: 0, jars: 0, boxes: 0, comb: 0, labs: 0, bosses: 0, billed: 0, beeDrops: 0, spent: 0, shilajit: 0, saved: 0, bad: {} };""",
    """    tally = { drops: 0, jars: 0, boxes: 0, comb: 0, labs: 0, bosses: 0, billed: 0, beeDrops: 0, spent: 0, shilajit: 0, saved: 0, bad: {}, minPurity: 100 };""")
rep("""    if (!invincible) purity = Math.max(0, purity - dmg);""", """    if (!invincible) { purity = Math.max(0, purity - dmg); tally.minPurity = Math.min(tally.minPurity, purity); }""")
rep("""    if (combo > oldCombo && praiseT <= 0) { floatText(spoon.x, spoon.y - 70, pick(PRAISE), '#ffd36b'); praiseT = 2.5; }""",
    """    if (combo > oldCombo && praiseT <= 0) { floatText(spoon.x, spoon.y - 70, pick(PRAISE), '#ffd36b'); praiseT = 2.5; }
    if (combo >= 5) achUnlock('sugar');""")
rep("""    streak += BEE_COMBO; combo = Math.min(comboCap(), 1 + 0.5 * Math.floor(streak / 5)); // counts a third, and doesn't hold the combo up""",
    """    streak += BEE_COMBO; combo = Math.min(comboCap(), 1 + 0.5 * Math.floor(streak / 5)); // counts a third, and doesn't hold the combo up
    if (combo >= 5) achUnlock('sugar');
    achAdd('beeCatches', 1, true);""")
rep("""  function addKg(n) {
    score += n;""", """  function addKg(n) {
    score += n; achAdd('harvested', n, true);""")
rep("""        if (it.kind === 'bad') { splat(it.x, it.y, it.f.color, 12); hurtSpoon(it.f.dmg, it.f.color, it.f.name, { toxin: it.f.type === 'toxin' }); }""",
    """        if (it.kind === 'bad') { splat(it.x, it.y, it.f.color, 12); if (hurtSpoon(it.f.dmg, it.f.color, it.f.name, { toxin: it.f.type === 'toxin' })) achAdd('fakeHits', 1, true); }""")
rep("""  document.querySelectorAll('[data-ach]').forEach(el => el.addEventListener('click', openAch));""",
    """  document.querySelectorAll('[data-ach]').forEach(el => el.addEventListener('click', openAch));
  document.querySelectorAll('a[href*="pages/contact"]').forEach(el => el.addEventListener('click', () => achUnlock('real'))); // the waitlist links""")
# keep the saved totals up to date when a run ends
rep("""  function gameOver() {
    state = 'over'; $('toast').classList.add('low');""", """  function gameOver() {
    state = 'over'; $('toast').classList.add('low'); if (achDirty) achSave();""")
rep("""  function win() {
    state = 'won'; score = GOAL; updateHud();""", """  function win() {
    state = 'won'; score = GOAL; updateHud(); if (achDirty) achSave();""")
open(p, 'w').write(s)
print('ok')
