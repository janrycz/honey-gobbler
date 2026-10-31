import sys
p = sys.argv[1]
s = open(p).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:100]); s = s.replace(old, new)
def between(start, end, new):
    global s
    a = s.index(start); b = s.index(end, a); s = s[:a] + new + s[b:]

# ---- extractor: once switched on, it pulls honey in one piece at a time until it has pulled in its full amount
rep("""    if (k === 'extractor') { // waits until there's enough honey on screen to be worth it
      if (extractArm) { if (!extractable().length) return false; fireExtract(); return true; } // pressed again: go now
      extractArm = { t: 0, grab: st.grab, peak: 0 };
      if (extractable().length >= Math.min(st.grab, EXTRACT_FULL)) fireExtract();
      else { floatText(W / 2, H * 0.42, 'EXTRACTOR READY', '#ffd36b', true); floatText(W / 2, H * 0.42 + 34, 'Waiting for more honey', '#f6e3b4'); sfx.ready(); updatePowerUi(); }
      return true;
    }
""", """    if (k === 'extractor') { // runs until it has pulled in its full amount; the cooldown starts when it's done
      if (extractRun) return false;
      extractRun = { left: st.grab, got: 0, t: 0, next: 0 };
      floatText(W / 2, H * 0.42, 'EXTRACTOR', '#ffd36b', true); sfx.whoosh();
      updatePowerUi();
      return true;
    }
""")
rep("""    else if (k === 'extractor') extract(st.grab);
    else launchQueen(st);""", """    else launchQueen(st);""")
rep("!(k === 'extractor' && extractArm) && (!best", "!(k === 'extractor' && extractRun) && (!best")
between("  const EXTRACT_FULL = 5;", "  function updatePowers(dt) {", """  const EXTRACT_ALL_TIME = 6, EXTRACT_GAP = 0.12; // the top level pulls in everything for 6 s; one piece every 0.12 s
  const extractable = () => items.filter(it => it.kind !== 'bad' && !it.suck && !it.held);
  // Only honey the extractor itself pulls in counts towards its amount: honey you or your bees catch doesn't.
  function updateExtract(dt) {
    const r = extractRun;
    if (!r) return;
    r.t += dt; r.next -= dt;
    if (r.left <= 0 || (r.left === Infinity && r.t > EXTRACT_ALL_TIME)) { endExtract(); return; }
    if (r.next > 0) return;
    const c = extractable();
    if (!c.length) return;
    const d = it => Math.hypot(it.x - spoon.x, it.y - spoon.y);
    const it = c.reduce((a, b) => (d(a) <= d(b) ? a : b)); // the nearest piece first
    it.suck = { t: 0, x0: it.x, y0: it.y }; if (it.bee) it.bee.tgt = null;
    r.left--; r.got++; r.next = EXTRACT_GAP; extractT = 0.7;
    tone(500 + Math.min(r.got, 20) * 25, 700 + Math.min(r.got, 20) * 25, 0.06, 'sine', 0.04);
  }
  function endExtract() {
    const r = extractRun; if (!r) return;
    extractRun = null;
    if (upg.extractor) pcd.extractor = PW.extractor(upg.extractor).cd;
    if (spoon && state === 'play') floatText(spoon.x, spoon.y - 84, 'Extracted ' + r.got, '#ffd36b');
    sfx.comb(); updatePowerUi();
  }
""")
rep("""    if (extractArm && upg.extractor) {
      // fire on a screenful; after 3 s, on the best moment so far; after 7 s, on anything
      const a = extractArm, n = extractable().length;
      a.t += dt;
      if (n >= Math.min(a.grab, EXTRACT_FULL) || (a.t > 3 && n >= Math.max(1, a.peak)) || (a.t > 7 && n > 0)) fireExtract();
      else a.peak = Math.max(a.peak, n);
    }
""", """    updateExtract(dt);
""")
rep("(k === 'extractor' && (extractT > 0 || !!extractArm))", "(k === 'extractor' && !!extractRun)")
rep("!(k === 'extractor' && extractArm) ? ' ready' : ''", "!(k === 'extractor' && extractRun) ? ' ready' : ''")
rep("""    if (extractT > 0 || extractArm) { // spinning while it sucks; idling while it waits for more honey
      const a = extractT > 0 ? Math.min(1, extractT * 3) : 0.55, x = spoon.x, y = spoon.y - spoonSize() * 1.3;""",
"""    if (extractT > 0 || extractRun) { // spins while it runs; the number is how many pieces it still has to pull in
      const a = extractRun ? 1 : Math.min(1, extractT * 3), x = spoon.x, y = spoon.y - spoonSize() * 1.3;""")
rep("""      ctx.rotate(t * (extractT > 0 ? 20 : 3)); ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 4); ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(18, 0); ctx.stroke(); }
      ctx.fillStyle = '#f2a516'; circle(0, 0, 5); ctx.fill();
      ctx.restore();""", """      ctx.save(); ctx.rotate(t * 20); ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 4); ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(18, 0); ctx.stroke(); }
      ctx.fillStyle = '#f2a516'; circle(0, 0, 5); ctx.fill();
      ctx.restore();
      if (extractRun) txt(extractRun.left === Infinity ? Math.max(0, Math.ceil(EXTRACT_ALL_TIME - extractRun.t)) + 's' : String(extractRun.left), 0, -36, 15, '#ffd36b', 800);
      ctx.restore();""")
rep("extractT = 0, extractArm = null, shedFromPause = false,", "extractT = 0, extractRun = null, shedFromPause = false,")
rep("extractT = 0; extractArm = null; allyQueue = null;", "extractT = 0; extractRun = null; allyQueue = null;")
rep("sticky = []; extractArm = null; }", "sticky = []; if (extractRun) endExtract(); }")
rep("""      extractArm: () => extractArm && { t: +extractArm.t.toFixed(2), grab: extractArm.grab, n: extractable().length },""",
    """      extractRun: () => extractRun && { left: extractRun.left, got: extractRun.got, t: +extractRun.t.toFixed(2) },
      drops(n, y) { for (let i = 0; i < n; i++) spawnDrop(1, y); },
      globsN: () => globs.length,""")
rep("""    { id: 'extractor', name: 'Extractor', cost: costs(1.0), desc: 'Sucks honey on screen into your spoon. If there is not much about, it waits for more first (press it again to use it straight away).',
      lvText: lv => { if (!lv) return 'Not owned'; const q = PW.extractor(lv); return `${q.grab === Infinity ? 'Grabs all the honey on screen' : 'Grabs the ' + q.grab + ' nearest bits of honey'}. Recharges in ${Math.round(q.cd)} s.`; } },""",
"""    { id: 'extractor', name: 'Extractor', cost: costs(1.0), desc: 'Pulls honey into your spoon one piece at a time, as it falls, until it has pulled in its full amount. In boss fights that honey gets flicked at the boss too.',
      lvText: lv => { if (!lv) return 'Not owned'; const q = PW.extractor(lv); return `${q.grab === Infinity ? 'Pulls in all the honey for ' + EXTRACT_ALL_TIME + ' s' : 'Pulls in ' + q.grab + ' pieces of honey'}. Recharges in ${Math.round(q.cd)} s once it's done.`; } },""")

# ---- magnet: also pushes boss attacks away from the spoon
rep("""      if (k === 'bishop' && ((p.x < p.r && p.vx < 0) || (p.x > W - p.r && p.vx > 0))) p.vx *= -1;""",
"""      if (magnetT > 0 && !p.harmless && p.dmg > 0) { // the honey magnet pushes boss attacks sideways, away from the spoon, and holds them up
        const R = W * magnetReach * 1.15, ddx = p.x - spoon.x, dd = Math.hypot(ddx, p.y - (spoon.y - 10));
        if (dd < R) {
          const f = 1 - dd / R, push = (ddx >= 0 ? 1 : -1) * 560 * G * (0.35 + f) * dt;
          if (SWAY[k]) p.bx += push; else p.x += push;
          if (p.vy > 0) p.y -= p.vy * pdt * Math.min(1, 1.3 * f);
          if (!p.deflected) { p.deflected = true; splat(p.x, p.y, '#ffd36b', 4); }
        }
      }
      if (k === 'bishop' && ((p.x < p.r && p.vx < 0) || (p.x > W - p.r && p.vx > 0))) p.vx *= -1;""")
rep("desc: 'Pulls nearby honey into your spoon and pushes fakes away, for a few seconds.',", "desc: 'Pulls nearby honey into your spoon and pushes fakes and boss attacks away, for a few seconds.',")
assert 'extractArm' not in s and 'EXTRACT_FULL' not in s and 'fireExtract' not in s
open(p, 'w').write(s)
print('ok')
