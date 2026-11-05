import sys
fn = sys.argv[1]
s = open(fn).read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)

# ---------- game speed: 1x to 2.5x, on the start and pause screens, remembered per browser ----------
rep(".btn.small { font-size: 1.05rem; padding: 9px 16px 7px; }", """.btn.small { font-size: 1.05rem; padding: 9px 16px 7px; }
.speedrow { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 12px 0 0; font-size: .92rem; font-weight: 700; color: var(--honey-deep); }
.speedrow input { accent-color: var(--honey-deep); width: 150px; margin: 0; cursor: pointer; }
.speedrow b { min-width: 3.2em; text-align: left; font-variant-numeric: tabular-nums; }""")
SLIDER = '<label class="speedrow" title="Everything runs faster. The run clock counts game time, so speedrun times stay fair.">Game speed <input class="speedIn" type="range" min="0" max="4" step="1" value="0" aria-label="Game speed"><b class="speedVal">1×</b></label>'
rep("""        <div class="actions"><button class="btn ghost small" data-ach type="button">Achievements <span class="achcount"></span></button><button class="btn ghost small" data-lb type="button" hidden>Leaderboard</button></div>
        <p class="hint lbline" id="lbStartLine" hidden></p>""", """        <div class="actions"><button class="btn ghost small" data-ach type="button">Achievements <span class="achcount"></span></button><button class="btn ghost small" data-lb type="button" hidden>Leaderboard</button></div>
        """ + SLIDER + """
        <p class="hint lbline" id="lbStartLine" hidden></p>""")
rep("""        <div class="actions"><button class="btn ghost small" id="lockBtn" type="button" hidden>Mouse lock: on</button></div>
        <p class="hint" id="pauseRevive"></p>""", """        """ + SLIDER + """
        <div class="actions"><button class="btn ghost small" id="lockBtn" type="button" hidden>Mouse lock: on</button></div>
        <p class="hint" id="pauseRevive"></p>""")
# the speed setting itself
rep("""  const hudCache = {};""", """  const SPEEDS = [1, 1.25, 1.5, 2, 2.5];
  let gameSpeed = 1;
  try { const v = +localStorage.getItem('honey-gobbler-speed'); if (SPEEDS.includes(v)) gameSpeed = v; } catch (e) {}
  const fmtSpeed = v => v + '×';
  function speedUi() {
    document.querySelectorAll('.speedIn').forEach(el => { el.value = SPEEDS.indexOf(gameSpeed); });
    document.querySelectorAll('.speedVal').forEach(el => { el.textContent = fmtSpeed(gameSpeed); });
  }
  document.querySelectorAll('.speedIn').forEach(el => el.addEventListener('input', () => {
    if (state === 'play') { speedUi(); return; } // only from the start and pause screens
    gameSpeed = SPEEDS[+el.value] || 1;
    try { localStorage.setItem('honey-gobbler-speed', String(gameSpeed)); } catch (e) {}
    speedUi(); if (spoon) updateHud();
  }));
  speedUi();
  const hudCache = {};""")
rep("""    setText('next', next);""", """    if (gameSpeed !== 1 && W >= 560) next += ' · ' + fmtSpeed(gameSpeed); // no room for it on a phone
    setText('next', next);""")
# arrow keys move the slider while it has focus on a menu
rep("    if (e.key.startsWith('Arrow')) e.preventDefault();",
    "    if (e.key.startsWith('Arrow') && !(state !== 'play' && e.target && e.target.classList && e.target.classList.contains('speedIn'))) e.preventDefault();")
# faster runs take more steps per frame, never bigger ones, so nothing can skip through the spoon
rep("    if (state === 'play' && !frozen) update(dt);", """    if (state === 'play' && !frozen) {
      if (gameSpeed === 1) update(dt);
      else {
        const g = dt * gameSpeed, n = Math.max(1, Math.ceil(g / Math.max(dt, 1 / 60) - 1e-6));
        for (let i = 0; i < n && state === 'play' && !frozen; i++) update(g / n);
      }
    }""")
rep("      runStats() { return runStats; },", "      runStats() { return runStats; },\n      speed: v => { if (v !== undefined) { gameSpeed = v; speedUi(); } return gameSpeed; },")

open(fn, 'w').write(s)
print('ok')
