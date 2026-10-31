import sys
fn = sys.argv[1]
s = open(fn).read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)

# ---------- styles ----------
rep(".achtotal { text-align: left; font: 700 .86rem var(--body); }",
    """.achtotal { text-align: left; font: 700 .86rem var(--body); }
.lbtabs { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
.lbtabs button { font: 700 .86rem var(--body); padding: 7px 13px 6px; border-radius: 999px; border: 2px solid var(--honey-deep); background: transparent; color: var(--ink); cursor: pointer; }
.lbtabs button[aria-selected="true"] { background: var(--honey); border-color: var(--honey); }
.lblist { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; text-align: left; font-variant-numeric: tabular-nums; min-height: 90px; }
.lblist li { display: grid; grid-template-columns: 2.6em 1fr auto; gap: 8px; align-items: baseline; padding: 6px 10px; border-radius: 10px; background: color-mix(in srgb, var(--ink) 6%, transparent); font: 600 .9rem var(--body); }
.lblist li.me { background: color-mix(in srgb, var(--honey) 40%, transparent); }
.lblist li.empty { display: block; text-align: center; font-weight: 600; color: color-mix(in srgb, var(--ink) 65%, transparent); }
.lblist .rk { font-weight: 800; color: var(--honey-deep); }
.lblist .nm { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lblist .v { font-weight: 800; text-align: right; }
.lblist .v small { display: block; font-weight: 600; font-size: .72rem; opacity: .7; }
.lbform { display: flex; flex-direction: column; gap: 8px; text-align: left; }
.lbform input[type=text] { font: 600 1rem var(--body); padding: 9px 12px; border-radius: 10px; border: 2px solid var(--honey-deep); background: #fffaf0; color: var(--ink); }
.lbform .chk { display: flex; gap: 8px; align-items: flex-start; font-size: .86rem; cursor: pointer; }
.lbform .chk input { margin-top: 3px; accent-color: var(--honey-deep); }
.lberr { color: #b0142c; font-weight: 700; font-size: .86rem !important; }
.lbline { font-weight: 700; }
.lbline button { font: 700 .8rem var(--body); margin-left: 6px; padding: 3px 10px; border-radius: 999px; border: 2px solid var(--honey-deep); background: var(--honey); color: var(--ink); cursor: pointer; }""")

# ---------- markup ----------
LB_BTN = '<button class="btn ghost small" data-lb type="button" hidden>Leaderboard</button>'
# start, pause, over and sold screens each get a Leaderboard button next to Achievements
rep('<div class="actions"><button class="btn ghost small" data-ach type="button">Achievements <span class="achcount"></span></button></div>\n        <p class="hint">On a phone,',
    '<div class="actions"><button class="btn ghost small" data-ach type="button">Achievements <span class="achcount"></span></button>' + LB_BTN + '</div>\n        <p class="hint lbline" id="lbStartLine" hidden></p>\n        <p class="hint">On a phone,')
rep('<button class="btn ghost small" id="pauseShed" type="button">Grandad\'s Shed</button><button class="btn ghost small" data-ach type="button">Achievements <span class="achcount"></span></button></div>',
    '<button class="btn ghost small" id="pauseShed" type="button">Grandad\'s Shed</button><button class="btn ghost small" data-ach type="button">Achievements <span class="achcount"></span></button>' + LB_BTN + '</div>')
rep('<p id="bestLine" class="hint"></p>\n        <div class="actions"><button class="btn" id="againBtn" type="button">Try again</button><button class="btn ghost small" data-ach type="button">Achievements <span class="achcount"></span></button></div>',
    '<p id="bestLine" class="hint"></p>\n        <p class="hint lbline" id="lbOver" hidden></p>\n        <div class="actions"><button class="btn" id="againBtn" type="button">Try again</button><button class="btn ghost small" data-ach type="button">Achievements <span class="achcount"></span></button>' + LB_BTN + '</div>')
rep('<p id="soldBest" class="hint"></p>',
    '<p id="soldBest" class="hint"></p>\n        <p class="hint lbline" id="lbSold" hidden></p>')
rep('''        <div class="actions"><button class="btn ghost small" data-ach type="button">Achievements <span class="achcount"></span></button></div>
        <p class="credit">A fan game''',
    '''        <div class="actions"><button class="btn ghost small" data-ach type="button">Achievements <span class="achcount"></span></button>''' + LB_BTN + '''</div>
        <p class="credit">A fan game''')
rep('''    <div class="toast hide" id="toast" aria-live="polite"></div>''',
    '''    <div class="overlay" id="lbScreen" hidden>
      <div class="card">
        <h2>Leaderboard</h2>
        <div class="lbtabs" role="tablist">
          <button type="button" role="tab" data-board="endless" aria-selected="true">Endless</button>
          <button type="button" role="tab" data-board="speed" aria-selected="false">Speedrun</button>
          <button type="button" role="tab" data-board="crazy" aria-selected="false">Crazy mode</button>
        </div>
        <p class="hint" id="lbDesc"></p>
        <ol class="lblist" id="lbList"></ol>
        <p class="hint lbline" id="lbMe"></p>
        <div class="lbform" id="lbNameForm" hidden>
          <p><b>Pick a leaderboard name.</b> Everyone can see it, so keep it clean. 2 to 16 letters, numbers, spaces, dots, dashes or underscores.</p>
          <input type="text" id="lbName" maxlength="16" autocomplete="nickname" spellcheck="false" placeholder="Your name" aria-label="Leaderboard name">
          <label class="chk"><input type="checkbox" id="lbWait"> <span>Also put me on the waitlist, so I hear first when the honey is back.</span></label>
          <p class="lberr" id="lbErr" hidden></p>
          <div class="actions"><button class="btn small" id="lbSave" type="button">Save name</button><button class="btn small ghost" id="lbCancel" type="button" hidden>Cancel</button></div>
        </div>
        <div class="actions"><button class="btn small" id="lbLogin" type="button" hidden>Log in to join</button><button class="btn small ghost" id="lbRename" type="button" hidden>Change name</button></div>
        <p class="hint">One entry per account on each board; only your best counts. Runs are checked, and anything that looks fake gets taken off.</p>
        <button class="btn" id="lbClose" type="button">Back</button>
      </div>
    </div>
    <div class="toast hide" id="toast" aria-live="polite"></div>''')

# ---------- hooks into the game ----------
rep("    seasonBanner();\n    last = performance.now(); lockMouse();\n  }\n  function startEndless() {",
    "    seasonBanner(); lbStartRun();\n    last = performance.now(); lockMouse();\n  }\n  function startEndless() {")
rep("    if (wasEndless) { endlessRound++; endlessNext += STAGE_KG; achStat('round', endlessRound + 1); openShed(); return; }",
    "    if (wasEndless) { endlessRound++; endlessNext += STAGE_KG; achStat('round', endlessRound + 1); lbSubmit(lbEntry(), null); openShed(); return; } // saved after every round, quietly")
rep("""    $('bestLine').textContent = endless
      ? 'Best endless: ' + fmtKg(best.endless) + '  ·  ' + fmtTime(elapsed)
      : 'Best: ' + fmtKg(best.kg) + '  ·  lasted ' + fmtTime(elapsed);""",
    """    $('bestLine').textContent = endless
      ? 'Best endless: ' + fmtKg(best.endless) + '  ·  ' + fmtTime(elapsed)
      : 'Best: ' + fmtKg(best.kg) + '  ·  lasted ' + fmtTime(elapsed);
    $('lbOver').hidden = true; lbSubmit(lbEntry(), $('lbOver'));""")
rep("""    state = 'won'; score = GOAL; updateHud(); if (achDirty) achSave();""",
    """    state = 'won'; score = GOAL; updateHud(); if (achDirty) achSave();
    if (lbRun) lbRun.wonAt = elapsed;""")
rep("""    $('soldScreen').hidden = false; $('endlessBtn').focus();""",
    """    $('soldScreen').hidden = false; $('endlessBtn').focus();
    $('lbSold').hidden = true; lbSubmit(lbEntry(), $('lbSold'));""")
rep("""    if (!$('achScreen').hidden) { if (e.key === 'Escape') { e.preventDefault(); closeAch(); } return; }""",
    """    if (!$('achScreen').hidden) { if (e.key === 'Escape') { e.preventDefault(); closeAch(); } return; }
    if (!$('lbScreen').hidden) { if (e.key === 'Escape') { e.preventDefault(); lbClose(); } else if (e.key === 'Enter' && document.activeElement === $('lbName')) { e.preventDefault(); lbSaveName(); } return; }""")
rep("    achMigrate(); updateAchCount(); checkWaitlist();\n    resize(); reset(); requestAnimationFrame(frame);",
    "    achMigrate(); updateAchCount(); checkWaitlist();\n    resize(); reset(); requestAnimationFrame(frame); lbBoot();")

# ---------- the leaderboard client ----------
rep("  $('achClose').addEventListener('click', closeAch);",
    r"""  $('achClose').addEventListener('click', closeAch);

  // ---------- leaderboard ----------
  // Only on janhoney.com: the page says who's logged in (a token signed by Shopify) and where the leaderboard lives.
  // Each run gets a ticket when it starts; scores are sent with it. Nothing here runs in the artifact.
  const LB = window.HG_LB && window.HG_LB.api ? window.HG_LB : null;
  const LB_PEND = 'honey-gobbler-lb-pending', LB_NAMES = { endless: 'Endless', speed: 'Speedrun', crazy: 'Crazy mode' };
  const LB_DESC = { endless: 'Highest round in endless mode. Honey harvested breaks ties.', speed: 'Fastest win against all eight bosses, from the first drop.', crazy: 'Highest round in endless runs where more than half of the fights were crazy mode.' };
  let lbRun = null, lbMe = null, lbBoard = 'endless', lbFrom = null, lbWaiting = null;
  async function lbCall(path, body) {
    let r;
    try { r = await fetch(LB.api + path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}); }
    catch (e) { throw Object.assign(new Error("Can't reach the leaderboard. Check your connection."), { code: 'net' }); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.message || 'The leaderboard is having a moment. Try again in a minute.'), { code: j.error || 'server' });
    return j;
  }
  function lbStartRun() {
    if (!LB) return;
    const run = lbRun = { ticket: null };
    lbCall('/api/start', {}).then(j => { run.ticket = j.ticket; }).catch(() => {});
  }
  function lbEntry() { // what this run would put on a board right now
    if (!LB || !lbRun || !lbRun.ticket) return null;
    const stats = { played: Math.floor(elapsed), bosses: Math.min(bossIdx, BOSS_COUNT), endlessFights: runStats.endlessFights, crazyFights: runStats.crazyFights };
    if (endless) return { board: runStats.crazyFights * 2 > runStats.endlessFights ? 'crazy' : 'endless', value: endlessRound + 1, tie: Math.floor(score * 10) / 10, stats, ticket: lbRun.ticket };
    if (state === 'won' && lbRun.wonAt) return { board: 'speed', value: Math.round(lbRun.wonAt * 10) / 10, tie: 0, stats, ticket: lbRun.ticket };
    return null;
  }
  const lbVal = (board, v, tie) => board === 'speed' ? fmtTime(v) : 'Round ' + v + (tie ? '<small>' + esc(fmtKg(tie)) + '</small>' : '');
  const lbValText = (board, v) => board === 'speed' ? fmtTime(v) : 'round ' + v;
  function lbLine(el, html) { if (!el) return; el.innerHTML = html; el.hidden = !html; }
  function lbLoginUrl() { return LB.login || '/customer_authentication/login?return_to=' + encodeURIComponent(location.pathname); }
  function lbGoLogin(entry) {
    if (entry) try { localStorage.setItem(LB_PEND, JSON.stringify({ entry, at: Date.now() })); } catch (e) {}
    location.href = lbLoginUrl();
  }
  async function lbEnsureMe() { if (!lbMe) lbMe = await lbCall('/api/me', { token: LB.token }); return lbMe; }
  async function lbSubmit(entry, el) { // el: a line on the screen to report back on, or null to save quietly
    if (!entry) return;
    if (!LB.token) {
      if (el) { lbLine(el, 'Log in to put your ' + lbValText(entry.board, entry.value) + ' on the leaderboard. <button type="button" data-lblogin>Log in</button>'); el.querySelector('[data-lblogin]').onclick = () => lbGoLogin(entry); }
      return;
    }
    try {
      await lbEnsureMe();
      if (!lbMe.name) {
        lbWaiting = { entry, el };
        if (el) { lbLine(el, 'Pick a name to put your ' + lbValText(entry.board, entry.value) + ' on the leaderboard. <button type="button" data-lbname>Pick a name</button>'); el.querySelector('[data-lbname]').onclick = () => lbOpen(entry.board, true); }
        return;
      }
      const j = await lbCall('/api/submit', { token: LB.token, ...entry });
      lbMe.bests[j.board] = { value: j.best.value, tie: j.best.tie, rank: j.rank };
      lbLine(el, j.improved ? LB_NAMES[j.board] + ': #' + j.rank + ' with ' + lbValText(j.board, j.best.value) + '. Your best yet.' : LB_NAMES[j.board] + ': your best is still ' + lbValText(j.board, j.best.value) + ', #' + j.rank + '.');
      return j;
    } catch (e) { lbLine(el, esc(e.message)); if (!el && e.code === 'login') LB.token = null; }
  }
  function lbOpen(board, naming) {
    if (!LB) return;
    lbFrom = ['startScreen', 'pauseScreen', 'overScreen', 'soldScreen', 'shedScreen'].find(id => !$(id).hidden) || null;
    if (lbFrom) $(lbFrom).hidden = true;
    $('lbScreen').hidden = false; $('lbScreen').querySelector('.card').scrollTop = 0;
    lbTab(typeof board === 'string' ? board : lbBoard);
    lbRenderMe(naming === true);
    $('lbClose').focus({ preventScroll: true });
  }
  function lbClose() {
    $('lbScreen').hidden = true;
    if (lbFrom) { $(lbFrom).hidden = false; const f = $(lbFrom).querySelector('[data-lb]'); if (f) f.focus({ preventScroll: true }); }
    lbFrom = null;
  }
  async function lbTab(board) {
    lbBoard = board;
    document.querySelectorAll('.lbtabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.board === board ? 'true' : 'false'));
    $('lbDesc').textContent = LB_DESC[board];
    $('lbList').innerHTML = '<li class="empty">Loading...</li>';
    try {
      const j = await lbCall('/api/top?board=' + board + '&limit=50');
      if (lbBoard !== board) return;
      const mine = lbMe && lbMe.name;
      $('lbList').innerHTML = j.rows.length ? j.rows.map(r => `<li${r.name === mine ? ' class="me"' : ''}><span class="rk">#${r.rank}</span><span class="nm">${esc(r.name)}</span><span class="v">${lbVal(board, r.value, r.tie)}</span></li>`).join('')
        : '<li class="empty">No one yet. Be the first.</li>';
    } catch (e) { if (lbBoard === board) $('lbList').innerHTML = '<li class="empty">' + esc(e.message) + '</li>'; }
    lbRenderMe();
  }
  function lbRenderMe(naming) {
    const me = $('lbMe'), form = $('lbNameForm');
    $('lbLogin').hidden = !!LB.token; $('lbRename').hidden = true;
    if (!LB.token) { form.hidden = true; lbLine(me, 'Log in to your janhoney.com account to get on the leaderboard.'); return; }
    if (!lbMe) { lbLine(me, ''); lbEnsureMe().then(() => lbRenderMe(naming)).catch(e => lbLine(me, esc(e.message))); return; }
    if (!lbMe.name || naming === true) {
      lbLine(me, ''); if (form.hidden) { form.hidden = false; $('lbName').value = lbMe.name || ''; $('lbErr').hidden = true; $('lbWait').checked = false; $('lbWait').parentNode.hidden = !LB.email; }
      $('lbCancel').hidden = !lbMe.name; return;
    }
    form.hidden = true; $('lbRename').hidden = false;
    const b = lbMe.bests[lbBoard];
    lbLine(me, 'You are <b>' + esc(lbMe.name) + '</b>. ' + (b ? 'Your best here: ' + lbValText(lbBoard, b.value) + (b.rank ? ', #' + b.rank : '') + '.' : 'Nothing on this board yet.'));
  }
  async function lbSaveName() {
    const name = $('lbName').value.trim(), err = $('lbErr'), btn = $('lbSave');
    err.hidden = true; btn.disabled = true;
    try {
      const j = await lbCall('/api/name', { token: LB.token, name });
      await lbEnsureMe(); lbMe.name = j.name;
      if ($('lbWait').checked) lbJoinWaitlist(j.name);
      $('lbNameForm').hidden = true;
      const w = lbWaiting; lbWaiting = null;
      if (w) await lbSubmit(w.entry, w.el);
      await lbSendPending();
      lbTab(lbBoard);
      lbStartLine();
    } catch (e) { err.textContent = e.message; err.hidden = false; }
    btn.disabled = false;
  }
  function lbJoinWaitlist(name) { // the same signup as the waitlist page: an email subscriber tagged "waitlist"
    const fd = new FormData();
    fd.append('form_type', 'customer'); fd.append('utf8', '✓');
    fd.append('contact[email]', LB.email); fd.append('contact[tags]', 'waitlist,leaderboard');
    if (LB.first || name) fd.append('contact[first_name]', LB.first || name);
    if (LB.last) fd.append('contact[last_name]', LB.last);
    fetch('/contact', { method: 'POST', body: fd, credentials: 'same-origin' })
      .then(r => { if (!r.ok || /challenge/.test(r.url)) throw 0; try { localStorage.setItem(WAIT_KEY, '1'); } catch (e) {} achUnlock('real'); toast("You're on the waitlist"); })
      .catch(() => { window.open('/pages/contact', '_blank'); }); // if Shopify wants a captcha, the waitlist page handles it
  }
  async function lbSendPending() { // a score saved before going off to log in
    let p = null;
    try { p = JSON.parse(localStorage.getItem(LB_PEND) || 'null'); } catch (e) {}
    if (!p || !p.entry) return;
    if (Date.now() - p.at > 3.5 * 86400e3) { try { localStorage.removeItem(LB_PEND); } catch (e) {} return; }
    if (!lbMe || !lbMe.name) return;
    try {
      const j = await lbCall('/api/submit', { token: LB.token, ...p.entry });
      try { localStorage.removeItem(LB_PEND); } catch (e) {}
      lbMe.bests[j.board] = { value: j.best.value, tie: j.best.tie, rank: j.rank };
      toast('Your ' + lbValText(j.board, p.entry.value) + ' is on the ' + LB_NAMES[j.board] + ' board: <b>#' + j.rank + '</b>');
    } catch (e) { if (e.code !== 'net' && e.code !== 'server') try { localStorage.removeItem(LB_PEND); } catch (e2) {} toast(esc(e.message)); }
  }
  function lbStartLine() {
    const el = $('lbStartLine');
    if (!LB.token) { lbLine(el, 'Log in to get on the leaderboard. Do it before you play: logging in reloads the page. <button type="button" data-lblogin>Log in</button>'); el.querySelector('[data-lblogin]').onclick = () => lbGoLogin(null); return; }
    if (!lbMe) return;
    let pend = null; try { pend = JSON.parse(localStorage.getItem(LB_PEND) || 'null'); } catch (e) {}
    if (!lbMe.name) { lbLine(el, (pend ? 'Pick a name to put your ' + lbValText(pend.entry.board, pend.entry.value) + ' on the leaderboard.' : 'Pick a name for the leaderboard.') + ' <button type="button" data-lbname>Pick a name</button>'); el.querySelector('[data-lbname]').onclick = () => lbOpen(pend ? pend.entry.board : 'endless', true); return; }
    lbLine(el, 'On the leaderboard as ' + esc(lbMe.name) + '.');
  }
  function lbBoot() {
    if (!LB) return;
    document.querySelectorAll('[data-lb]').forEach(el => { el.hidden = false; el.addEventListener('click', () => lbOpen()); });
    document.querySelectorAll('.lbtabs button').forEach(b => b.addEventListener('click', () => lbTab(b.dataset.board)));
    $('lbClose').addEventListener('click', lbClose);
    $('lbSave').addEventListener('click', lbSaveName);
    $('lbCancel').addEventListener('click', () => { $('lbNameForm').hidden = true; lbRenderMe(); });
    $('lbRename').addEventListener('click', () => lbRenderMe(true));
    $('lbLogin').addEventListener('click', () => lbGoLogin(null));
    lbStartLine();
    if (LB.token) lbEnsureMe().then(() => { lbStartLine(); return lbSendPending(); }).then(lbStartLine).catch(() => {});
  }""")

# test hooks
rep("      runStats() { return runStats; },",
    "      runStats() { return runStats; },\n"
    "      lb() { return { run: lbRun, me: lbMe, entry: lbEntry() }; },\n"
    "      lbSetFights(e, c) { runStats.endlessFights = e; runStats.crazyFights = c; },\n"
    "      setElapsed(t) { elapsed = t; },")

open(fn, 'w').write(s)
print('ok')
