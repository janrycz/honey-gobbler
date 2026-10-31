import sys
p = sys.argv[1]
s = open(p).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:120]); s = s.replace(old, new)

rep("""        <p class="hint">On a phone, drag your thumb anywhere on the screen, no need to touch the spoon. On a computer, use the mouse or arrow keys. P pauses.</p>""",
    """        <p class="hint">On a phone, drag your thumb anywhere on the screen, no need to touch the spoon. On a computer, use the mouse or arrow keys. The mouse stays locked to the game while you play: Esc frees it and pauses, and so does P.</p>""")
rep("""        <div class="actions"><button class="btn ghost small" id="pauseShed" type="button">Grandad's Shed</button><button class="btn ghost small" data-ach type="button">Achievements <span class="achcount"></span></button></div>
        <p class="hint" id="pauseRevive"></p>""", """        <div class="actions"><button class="btn ghost small" id="pauseShed" type="button">Grandad's Shed</button><button class="btn ghost small" data-ach type="button">Achievements <span class="achcount"></span></button></div>
        <div class="actions"><button class="btn ghost small" id="lockBtn" type="button" hidden>Mouse lock: on</button></div>
        <p class="hint" id="pauseRevive"></p>""")

# pointer handling while the mouse is locked to the game
rep("""  function pointer(e) {
    if (!spoon) return;
    const r = stage.getBoundingClientRect(), x = e.clientX - r.left;
    if (e.pointerType === 'mouse') { spoon.tx = clamp(x + spoon.drift, 20, W - 20); if (e.type === 'pointerdown' && e.button === 0 && e.target === cv && state === 'play') fireReady(); return; }""",
"""  function pointer(e) {
    if (!spoon) return;
    if (locked) { // the mouse is locked to the game: the spoon moves by however far the mouse moves
      if (e.type === 'pointermove') spoon.tx = clamp(spoon.tx + (e.movementX || 0), 20, W - 20);
      else if (e.type === 'pointerdown' && e.button === 0 && state === 'play') fireReady();
      return;
    }
    const r = stage.getBoundingClientRect(), x = e.clientX - r.left;
    if (e.pointerType === 'mouse') { spoon.tx = clamp(x + spoon.drift, 20, W - 20); if (e.type === 'pointerdown' && e.button === 0 && e.target === cv && state === 'play') { lockMouse(); fireReady(); } return; }""")
rep("""  stage.addEventListener('pointermove', pointer);""", """  // ---------- mouse lock ----------
  // On a computer the mouse locks to the game while you play, so it can't wander onto a second monitor. Escape frees it
  // and pauses; resuming or clicking back in locks it again. Phones and tablets never lock, and it can be switched off when paused.
  const canLock = !touchUI && typeof stage.requestPointerLock === 'function';
  let locked = false, lockPref = true, lockLostAt = -1e4, lockErrors = 0, lockAskT = -1e4;
  try { lockPref = localStorage.getItem('honey-gobbler-lock') !== '0'; } catch (e) {}
  function lockMouse() {
    if (!canLock || !lockPref || locked || lockErrors >= 3 || state !== 'play') return;
    const now = performance.now();
    if (now - lockLostAt < 1300 || now - lockAskT < 300) return; // browsers refuse to lock again straight after Escape
    lockAskT = now;
    try { const r = stage.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (e) { lockErrors++; }
  }
  function unlockMouse() { if (document.pointerLockElement) document.exitPointerLock(); }
  document.addEventListener('pointerlockchange', () => {
    const was = locked;
    locked = document.pointerLockElement === stage;
    if (locked) lockErrors = 0;
    if (was && !locked) { lockLostAt = performance.now(); if (state === 'play') togglePause(); }
  });
  document.addEventListener('pointerlockerror', () => { if (performance.now() - lockLostAt > 1500) lockErrors++; lockLabel(); }); // e.g. a page that isn't allowed to lock
  function lockLabel() {
    const el = $('lockBtn'); el.hidden = !canLock;
    el.disabled = lockErrors >= 3;
    el.textContent = lockErrors >= 3 ? 'Mouse lock: not available here' : 'Mouse lock: ' + (lockPref ? 'on' : 'off');
  }
  $('lockBtn').addEventListener('click', () => { lockPref = !lockPref; try { localStorage.setItem('honey-gobbler-lock', lockPref ? '1' : '0'); } catch (e) {} lockLabel(); });
  stage.addEventListener('pointermove', pointer);""")
rep("""    if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && (state === 'play' || state === 'pause')) togglePause();""",
"""    if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && (state === 'play' || state === 'pause')) {
      if (e.key === 'Escape' && state === 'pause' && performance.now() - lockLostAt < 500) return; // that Escape just freed the mouse and paused
      togglePause();
    }""")
# overlays free the mouse; the main loop makes sure of it
rep("""    if (state === 'play' && !frozen) update(dt);""", """    if (locked && state !== 'play') unlockMouse(); // every menu frees the mouse
    if (state === 'play' && !frozen) update(dt);""")
# resuming, starting, endless, a second chance, and leaving the shed lock it again
rep("""    else if (state === 'pause') { state = 'play'; $('pauseScreen').hidden = true; $('toast').classList.remove('low'); last = performance.now(); }""",
    """    else if (state === 'pause') { state = 'play'; $('pauseScreen').hidden = true; $('toast').classList.remove('low'); last = performance.now(); lockMouse(); }""")
rep("""  function pauseInfo() { $('pauseRevive').textContent""", """  function pauseInfo() { lockLabel(); $('pauseRevive').textContent""")
rep("""    if (endless) floatText(W / 2, H * 0.44, 'Round ' + (endlessRound + 1), '#cfe8ff', true); else seasonBanner();
    updateHud();""", """    if (endless) floatText(W / 2, H * 0.44, 'Round ' + (endlessRound + 1), '#cfe8ff', true); else seasonBanner();
    updateHud(); lockMouse();""")
rep("""    seasonBanner();
    last = performance.now();
  }
  function startEndless() {""", """    seasonBanner();
    last = performance.now(); lockMouse();
  }
  function startEndless() {""")
rep("""    achStat('round', 1);
    seasonBanner();
    last = performance.now();
  }""", """    achStat('round', 1);
    seasonBanner();
    last = performance.now(); lockMouse();
  }""")
rep("""    sfx.comb();
    updateHud();
  }
  // ---------- achievements ----------""", """    sfx.comb();
    updateHud(); lockMouse();
  }
  // ---------- achievements ----------""")
# a key held when the window lost focus would otherwise stay held
rep("""  addEventListener('blur', () => { if (state === 'play') togglePause(); });""",
    """  addEventListener('blur', () => { for (const k in keys) keys[k] = false; if (state === 'play') togglePause(); });""")
open(p, 'w').write(s)
print('ok')
