import sys
fn = sys.argv[1]
s = open(fn).read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)
rep('        <p class="hint">Saved in this browser.</p>', '        <p class="hint" id="achWhere">Saved in this browser.</p>')
rep("  function saveBest() { try { localStorage.setItem('honey-gobbler-3', JSON.stringify(best)); } catch (e) {} }",
    "  function saveBest() { try { localStorage.setItem('honey-gobbler-3', JSON.stringify(best)); } catch (e) {} lbSyncSoon(); }")
rep("  function achSave() { achDirty = false; try { localStorage.setItem('honey-gobbler-ach', JSON.stringify(achData)); } catch (e) {} }",
    "  function achSave() { achDirty = false; try { localStorage.setItem('honey-gobbler-ach', JSON.stringify(achData)); } catch (e) {} lbSyncSoon(); }")
rep("    lbLine(el, 'On the leaderboard as ' + esc(lbMe.name) + '.');",
    "    lbLine(el, 'On the leaderboard as ' + esc(lbMe.name) + '. Your achievements save to your account.');")
rep("    if (LB.token) lbEnsureMe().then(() => { lbStartLine(); return lbSendPending(); }).then(lbStartLine).catch(() => {});",
    """    if (LB.token) lbEnsureMe().then(() => { lbStartLine(); return lbSendPending(); }).then(lbStartLine).catch(() => {});
    $('achWhere').textContent = LB.token ? 'Saved to your account, so they follow you to any device.' : 'Saved in this browser. Log in to keep them on your account.';
    if (LB.token) {
      lbSync();
      addEventListener('pagehide', () => { // anything not sent yet goes out as the page closes
        if (!lbSyncT) return;
        try { navigator.sendBeacon(LB.api + '/api/sync', new Blob([JSON.stringify({ token: LB.token, data: lbSaveData() })], { type: 'text/plain' })); } catch (e) {}
      });
    }""")
rep("  function lbStartLine() {", """  // achievements, counters and records follow the account
  let lbSyncT = 0, lbSyncing = false;
  const lbSaveData = () => ({ done: achData.done, stats: achData.stats, best: { kg: best.kg, time: best.time, endless: best.endless, brawl: best.brawl } });
  function lbSyncSoon() { if (!LB || !LB.token) return; clearTimeout(lbSyncT); lbSyncT = setTimeout(lbSync, 8000); }
  async function lbSync() {
    lbSyncT = 0;
    if (!LB || !LB.token || lbSyncing) return;
    lbSyncing = true;
    try {
      const m = await lbCall('/api/sync', { token: LB.token, data: lbSaveData() });
      let changed = false;
      for (const [k, v] of Object.entries(m.done || {})) if (!achData.done[k] && ACH.some(a => a.id === k)) { achData.done[k] = v; changed = true; }
      for (const [k, v] of Object.entries(m.stats || {})) if (v > (achData.stats[k] || 0)) { achData.stats[k] = v; changed = true; }
      const bb = m.best || {}, b0 = JSON.stringify(best);
      if (bb.kg > best.kg) best.kg = Math.min(GOAL, bb.kg);
      if (bb.endless > best.endless) best.endless = bb.endless;
      if (bb.time && (!best.time || bb.time < best.time)) best.time = bb.time;
      if (bb.brawl && (!best.brawl || bb.brawl < best.brawl)) best.brawl = bb.brawl;
      if (changed) { try { localStorage.setItem('honey-gobbler-ach', JSON.stringify(achData)); } catch (e) {} updateAchCount(); }
      if (JSON.stringify(best) !== b0) try { localStorage.setItem('honey-gobbler-3', JSON.stringify(best)); } catch (e) {}
    } catch (e) {}
    lbSyncing = false;
  }
  function lbStartLine() {""")
rep("      runStats() { return runStats; },", "      runStats() { return runStats; },\n      lbSyncNow() { return lbSync(); },")
open(fn, 'w').write(s)
print('ok')
