import sys
fn = sys.argv[1]
s = open(fn).read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)

# ---------- Honeycomb shield: 5th power ----------
rep("    queen: lv => ({ cd: 35 - (lv - 1), charges: lv < 4 ? 2 : lv < 8 ? 3 : 4, dmg: 14 + (lv - 1) * 10 / 9 }),",
    "    queen: lv => ({ cd: 35 - (lv - 1), charges: lv < 4 ? 2 : lv < 8 ? 3 : 4, dmg: 14 + (lv - 1) * 10 / 9 }),\n"
    "    shield: lv => ({ cd: 40 - (lv - 1) * 15 / 9, hits: [2, 2, 2, 3, 3, 3, 4, 4, 4, 5][lv - 1], dur: 6 + (lv - 1) * 0.5 }),")
rep("  const PKEY = { smoker: '1', magnet: '2', extractor: '3', queen: '4' };\n  const PKEYS = ['smoker', 'magnet', 'extractor', 'queen'];",
    "  const PKEY = { smoker: '1', magnet: '2', extractor: '3', queen: '4', shield: '5' };\n  const PKEYS = ['smoker', 'magnet', 'extractor', 'queen', 'shield'];")
rep("    { id: 'wax', name: 'Beeswax coating',",
    "    { id: 'shield', name: 'Honeycomb shield', cost: costs(1.2), desc: 'A wax hexagon over your spoon that soaks up the next few hits, then cracks. It wears off after a few seconds if nothing hits it.',\n"
    "      lvText: lv => { if (!lv) return 'Not owned'; const q = PW.shield(lv); return `Soaks up ${q.hits} hits, lasts ${q.dur.toFixed(1)} s. Recharges in ${Math.round(q.cd)} s.`; } },\n"
    "    { id: 'wax', name: 'Beeswax coating',")
rep("upg = { thick: 0, bee: 0, colonex: 0, smoker: 0, magnet: 0, extractor: 0, queen: 0, wax: 0, sweet: 0, hives: 0, crazy: 0 }; pcd = { smoker: 0, magnet: 0, extractor: 0, queen: 0 }; readyAt = { smoker: 0, magnet: 0, extractor: 0, queen: 0 };",
    "upg = { thick: 0, bee: 0, colonex: 0, smoker: 0, magnet: 0, extractor: 0, queen: 0, shield: 0, wax: 0, sweet: 0, hives: 0, crazy: 0 }; pcd = { smoker: 0, magnet: 0, extractor: 0, queen: 0, shield: 0 }; readyAt = { smoker: 0, magnet: 0, extractor: 0, queen: 0, shield: 0 };")
rep("  let upg, pcd, readyAt, bees = [], smokeT = 0, magnetT = 0, extractT = 0,",
    "  let shieldT = 0, shieldHits = 0, shieldMax = 0; // Honeycomb shield\n  let upg, pcd, readyAt, bees = [], smokeT = 0, magnetT = 0, extractT = 0,")
rep("    bees = []; smokeT = 0; magnetT = 0; extractT = 0; extractRun = null;",
    "    bees = []; smokeT = 0; magnetT = 0; extractT = 0; extractRun = null; shieldT = 0; shieldHits = 0;")
rep("    else if (k === 'magnet') { magnetT = st.dur; magnetReach = st.reach; floatText(W / 2, H * 0.42, 'HONEY MAGNET', '#ffd36b', true); sfx.comb(); }",
    "    else if (k === 'magnet') { magnetT = st.dur; magnetReach = st.reach; floatText(W / 2, H * 0.42, 'HONEY MAGNET', '#ffd36b', true); sfx.comb(); }\n"
    "    else if (k === 'shield') { shieldT = st.dur; shieldHits = shieldMax = st.hits; floatText(W / 2, H * 0.42, 'HONEYCOMB SHIELD', '#ffd36b', true); sfx.comb(); }")
rep("    smokeT = Math.max(0, smokeT - dt); magnetT = Math.max(0, magnetT - dt); extractT = Math.max(0, extractT - dt);",
    "    smokeT = Math.max(0, smokeT - dt); magnetT = Math.max(0, magnetT - dt); extractT = Math.max(0, extractT - dt);\n"
    "    if (shieldT > 0) { shieldT -= dt; if (shieldT <= 0) { shieldT = 0; if (shieldHits) floatText(spoon.x, spoon.y - 58, 'Shield wore off', '#e8e2d4'); shieldHits = 0; } }")
rep("(k === 'extractor' && !!extractRun) || (k === 'queen' && !!qd);",
    "(k === 'extractor' && !!extractRun) || (k === 'queen' && !!qd) || (k === 'shield' && shieldHits > 0);")
rep("""  function hurtSpoon(dmg, color, name, opts = {}) {
    if (spoon.hurt > 0 || state !== 'play') return false;""",
    """  function hurtSpoon(dmg, color, name, opts = {}) {
    if (spoon.hurt > 0 || state !== 'play') return false;
    if (shieldHits > 0) { // the Honeycomb shield takes it
      shieldHits--; spoon.hurt = 0.35; spoon.tint = '#ffd36b'; shake = reduceMotion ? 0 : 4; sfx.hit();
      floatText(spoon.x, spoon.y - 58, shieldHits ? 'Blocked' : 'Shield cracked', '#ffd36b');
      for (let i = 0; i < 5; i++) splat(spoon.x + rnd(-24, 24), spoon.y - 24 + rnd(-12, 12), '#f2a516', 5);
      if (!shieldHits) shieldT = 0;
      return false;
    }""")
rep("      const pk = { 1: 'smoker', 2: 'magnet', 3: 'extractor', 4: 'queen' }[e.key];",
    "      const pk = { 1: 'smoker', 2: 'magnet', 3: 'extractor', 4: 'queen', 5: 'shield' }[e.key];")
rep("""  function drawPowerFx(t) {
    if (!spoon) return;""", """  function drawPowerFx(t) {
    if (!spoon) return;
    if (shieldHits > 0) { // a wax hexagon over the spoon, cracking as it soaks up hits
      const R = spoonSize() * 0.95, a = Math.min(1, shieldT * 2) * (0.75 + 0.25 * Math.sin(t * 5)), lost = shieldMax - shieldHits;
      ctx.save(); ctx.translate(spoon.x, spoon.y - spoonSize() * 0.32); ctx.globalAlpha = a;
      hexPath(0, 0, R); ctx.fillStyle = 'rgba(242,165,22,.16)'; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = '#ffd36b'; ctx.stroke();
      ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,211,107,.55)';
      for (let i = 0; i < 6; i++) { const an = Math.PI / 6 + i * Math.PI / 3; hexPath(Math.cos(an) * R * 0.52, Math.sin(an) * R * 0.52, R * 0.26); ctx.stroke(); }
      ctx.strokeStyle = '#7a4a0c'; ctx.lineWidth = 2;
      for (let i = 0; i < lost; i++) { const an = i * 2.1 + 0.4; ctx.beginPath(); ctx.moveTo(Math.cos(an) * R * 0.2, Math.sin(an) * R * 0.2); ctx.lineTo(Math.cos(an + 0.3) * R * 0.6, Math.sin(an + 0.3) * R * 0.6); ctx.lineTo(Math.cos(an - 0.1) * R * 0.98, Math.sin(an - 0.1) * R * 0.98); ctx.stroke(); }
      ctx.restore();
    }""")
rep("""<kbd>4</kbd></button>
    </div>""", """<kbd>4</kbd></button>
      <button class="pbtn" id="pw-shield" type="button" hidden aria-label="Honeycomb shield"><i><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 27 9.5v13L16 29 5 22.5v-13z" fill="rgba(242,165,22,.25)" stroke="#ffd36b" stroke-width="2.2"/><path d="M16 10.5 21 13.4v5.2L16 21.5l-5-2.9v-5.2z" fill="none" stroke="#f2a516" stroke-width="1.6"/><path d="M16 3v7.5M27 9.5l-6 3.9M27 22.5l-6-3.9M16 29v-7.5M5 22.5l6-3.9M5 9.5l6 3.9" stroke="#f2a516" stroke-width="1.2"/></svg></i><kbd>5</kbd></button>
    </div>""")
rep("  const GRANDAD_BUY = { wax:", "  const GRANDAD_BUY = { shield: \"Wax from the old frames. It'll hold. For a bit.\", wax:")

# ---------- the shed: no key labels on phones ----------
rep("        : 'Level ' + inf.lv + '/' + s.max + (s.key ? (touchUI ? ' · power' : ' · key ' + s.key) : '');",
    "        : 'Level ' + inf.lv + '/' + s.max + (s.key && !touchUI ? ' · key ' + s.key : '');")

open(fn, 'w').write(s)
print('ok')
