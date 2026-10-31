import sys
p = sys.argv[1]
s = open(p).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:120]); s = s.replace(old, new)

# ---- factors
rep("let W = 0, H = 0, DPR = 1, WR = 1, G = 1, GT = 1, WX = 1;", "let W = 0, H = 0, DPR = 1, WR = 1, G = 1, GT = 1, WX = 1, HS = 1, NF = 1, THUMB = 0;")
rep("    WR = Math.min(1, W / 1100); G = 0.5 + 0.5 * WR; GT = 0.5 + 0.5 * G; WX = Math.max(1, W / 1100);",
"""    WR = Math.min(1, W / 1100); G = 0.5 + 0.5 * WR; GT = 0.5 + 0.5 * G; WX = Math.max(1, W / 1100);
    // Phones: on a shorter screen things fall more slowly, so they take as long to reach you as on a laptop; hits are a
    // little more forgiving on narrow screens; and on touch screens the spoon sits higher so your thumb can rest under it.
    HS = clamp(H / 640, 0.7, 1); NF = 0.85 + 0.15 * WR; THUMB = touchUI ? clamp(H * 0.1, 40, 70) : 0;""")
rep("    if (spoon) spoon.y = H - spoonSize() * 0.9;", "    if (spoon) spoon.y = H - spoonSize() * 0.9 - THUMB;")
rep("    spoon = { x: W / 2, y: H - spoonSize() * 0.9, tx: W / 2,", "    spoon = { x: W / 2, y: H - spoonSize() * 0.9 - THUMB, tx: W / 2,")
# falling speeds
rep("      it.y += it.vy * dt * (bad ? sm : 1);", "      it.y += it.vy * dt * HS * (bad ? sm : 1);")
rep("    const pdt = dt * (1 + 0.5 * Math.min(bossIdx, BOSS_COUNT - 1) / (BOSS_COUNT - 1) + (endless ? Math.min(0.9, 0.08 * endlessRound) : 0));",
    "    const pdt = dt * HS * (1 + 0.5 * Math.min(bossIdx, BOSS_COUNT - 1) / (BOSS_COUNT - 1) + (endless ? Math.min(0.9, 0.08 * endlessRound) : 0));")
# hit boxes
rep("        ? Math.hypot((it.x - spoon.x) * .8, it.y - spoon.y) < S * 0.45 + ir * 0.6", "        ? Math.hypot((it.x - spoon.x) * .8, it.y - spoon.y) < (S * 0.45 + ir * 0.6) * NF")
rep("        const hit = Math.hypot((p.x - spoon.x) * .8, p.y - spoon.y) < S * 0.45 + p.r * ps(p) * 0.6;", "        const hit = Math.hypot((p.x - spoon.x) * .8, p.y - spoon.y) < (S * 0.45 + p.r * ps(p) * 0.6) * NF;")
# fewer attacks on narrow screens (G is about 1 on a laptop)
rep("  const cntW = n => Math.max(1, Math.round(n * GT * WX * endlessMore())); // spread across the screen", "  const cntW = n => Math.max(1, Math.round(n * G * WX * endlessMore())); // spread across the screen")
rep("  const cntA = n => Math.max(1, Math.round(n * GT * endlessMore())); // aimed at you", "  const cntA = n => Math.max(1, Math.round(n * G * endlessMore())); // aimed at you")
# fakes: fewer and less wobbly on narrow screens
rep("    const badChance = endless ? Math.min(0.62, 0.32 + 0.04 * lvl) : 0.12 + bossIdx * 0.035;",
    "    const badChance = (endless ? Math.min(0.62, 0.32 + 0.04 * lvl) : 0.12 + bossIdx * 0.035) * (0.7 + 0.3 * WR);")
rep("      phase: Math.random() * 6, amp: toxin ? 12 + Math.random() * 20 : f.type === 'bag' ? 10 : 30 + Math.random() * 50,",
    "      phase: Math.random() * 6, amp: (toxin ? 12 + Math.random() * 20 : f.type === 'bag' ? 10 : 30 + Math.random() * 50) * G,")
# belt
rep("      const push = belt.dir * BELT_PUSH * G * (smokeT > 0 ? smokeSlow : 1) * dt;", "      const push = belt.dir * BELT_PUSH * G * G * (smokeT > 0 ? smokeSlow : 1) * dt;")
# spreads around the spoon shrink with the screen
rep("      fan(moreE(3), 70).forEach((off, i) => {\n        const f = pick(syrups);", "      fan(moreE(3), 70 * G).forEach((off, i) => {\n        const f = pick(syrups);")
rep("        const tx = clamp(spoon.x + s * rnd(30, 80), 30, W - 30);", "        const tx = clamp(spoon.x + s * rnd(30, 80) * G, 30, W - 30);")
rep("      fan(moreE(3), 80).forEach((off, i) => {\n        proj.push(P(Object.assign({ k: 'gear',", "      fan(moreE(3), 80 * G).forEach((off, i) => {\n        proj.push(P(Object.assign({ k: 'gear',")
rep("lob(b.x, b.y, clamp(spoon.x + rnd(-120, 120), 20, W - 20), 1.25, 420))));", "lob(b.x, b.y, clamp(spoon.x + rnd(-120, 120) * G, 20, W - 20), 1.25, 420))));")
rep("      fan(moreE(3), 70).forEach((off, i) => {\n        const y = combBottom() + 10;", "      fan(moreE(3), 70 * G).forEach((off, i) => {\n        const y = combBottom() + 10;")
rep("lob(x0, y0, clamp(spoon.x + rnd(-90, 90), 20, W - 20), 1.2, 420))));", "lob(x0, y0, clamp(spoon.x + rnd(-90, 90) * G, 20, W - 20), 1.2, 420))));")
rep("lob(x0, y0, clamp(spoon.x + s * 70, 30, W - 30), 1.15, 380)))));", "lob(x0, y0, clamp(spoon.x + s * 70 * G, 30, W - 30), 1.15, 380)))));")
rep("lob(x0, y0, clamp(spoon.x + sd * 90, 20, W - 20), 1.15, 520)))));", "lob(x0, y0, clamp(spoon.x + sd * 90 * G, 20, W - 20), 1.15, 520)))));")
rep("      fan(moreE(3), 75).forEach((off, i) => { const label", "      fan(moreE(3), 75 * G).forEach((off, i) => { const label")
rep("lob(x0, y0, clamp(spoon.x + rnd(-160, 160), 20, W - 20), 0.9, 700))));", "lob(x0, y0, clamp(spoon.x + rnd(-160, 160) * G, 20, W - 20), 0.9, 700))));")
rep("lob(x0, y0, clamp(spoon.x + Math.sign(sd) * (Math.abs(sd) + 0.5) * rnd(20, 70), 20, W - 20), 1.2, 400)))));", "lob(x0, y0, clamp(spoon.x + Math.sign(sd) * (Math.abs(sd) + 0.5) * rnd(20, 70) * G, 20, W - 20), 1.2, 400)))));")
rep("lob(x0, y0, clamp(spoon.x + rnd(-130, 130), 20, W - 20), 1.35, 420))));", "lob(x0, y0, clamp(spoon.x + rnd(-130, 130) * G, 20, W - 20), 1.35, 420))));")

# ---- speech bubbles go under the attacks, so nothing that can hit you is ever hidden behind words
rep("""    drawBg(t);
    drawChat();""", """    drawBg(t);
    drawChat();
    drawAllySpeech(); // speech sits under everything that can hit you, so words never hide an attack
    for (const b of bosses) drawSpeech(b);""")
rep("""    drawAllySpeech();
    for (const b of bosses) drawSpeech(b);
    for (const b of bosses) drawBossUI(b);""", """    for (const b of bosses) drawBossUI(b);""")
# banners: a bit smaller on narrow screens
rep("    if (f.big) f.fs = fitFont(f.text, 38, 900, 'Gluten, cursive', W - 32);", "    if (f.big) f.fs = fitFont(f.text, Math.round(clamp(38 * GT, 28, 38)), 900, 'Gluten, cursive', W - 32);")
# header: more compact on phones, for a taller play area
rep("""@media (max-width: 520px) {
  .brand { font-size: 1.2rem; } .brand small { display: none; }""", """@media (max-width: 520px) {
  .bar { padding-block: 6px 7px; gap: 4px 12px; }
  .track { margin: 3px 8px 0; }
  .brand { font-size: 1.2rem; } .brand small { display: none; }""")
open(p, 'w').write(s)
print('ok')
