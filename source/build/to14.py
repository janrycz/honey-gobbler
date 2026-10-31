import sys
fn = sys.argv[1]
s = open(fn).read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, (n, old[:100])
    s = s.replace(old, new)

# ---------- Colonex: about a third of invoices come with 5% VAT on top ----------
rep("      proj.push(P({ k: 'allyFee', harmless: true, dmg: L.dmg, x: ally.x + 16, y: ally.y - 20, text: feeText(pick(ALLY_FEES), L.fee), r: 12, tgt: pick(bosses.filter(fighting)), owner: null }));",
    "      const text = feeText(pick(ALLY_FEES), L.fee), vat = Math.random() < 0.35 ? Math.max(1, Math.round((parseInt(text, 10) || 0) * 0.05)) : 0; // some invoices come with 5% VAT\n"
    "      proj.push(P({ k: 'allyFee', harmless: true, dmg: L.dmg * (vat ? 1.05 : 1), x: ally.x + 16, y: ally.y - 20, text, vat, r: 12, tgt: pick(bosses.filter(fighting)), owner: null }));")
rep("""          floatText(b.x, b.y - 40 * bossK(), p.text, '#b48cff'); // on the boss, clear of his name bar
          const billed = parseInt(p.text, 10) || 0;""",
    """          floatText(b.x, b.y - 40 * bossK(), p.text, '#b48cff', false, p.vat ? '+' + p.vat + '$ VAT' : ''); // on the boss, clear of his name bar
          const billed = (parseInt(p.text, 10) || 0) + (p.vat || 0);""")
rep("          case 'allyFee': roundRect(-13, -8, 26, 16, 2); ctx.fillStyle = '#fbf8f0'; ctx.fill(); txt('$', 0, 1, 11, '#c8102e', 900); break;",
    "          case 'allyFee': roundRect(-13, -8, 26, 16, 2); ctx.fillStyle = '#fbf8f0'; ctx.fill(); txt('$', 0, 1, 11, '#c8102e', 900);\n"
    "            if (p.vat) { roundRect(-13, 8, 26, 9, 2); ctx.fillStyle = '#ffd36b'; ctx.fill(); txt('+VAT', 0, 12.5, 6.5, '#2a1606', 900); }\n"
    "            break;\n"
    "          case 'knightBack': ctx.scale(p.c / 34 * 0.8, p.c / 34 * 0.8); knightShape(); break;")

# ---------- Spoon takes knight: the knight flies back at the boss who sent it ----------
rep("""            proj.splice(i, 1); splat(p.x, p.y, '#f4f1ea', 12); floatText(p.x, p.y - c * 0.7, 'Sx' + square(p.x, knightRank(p, p.y)) + '!', '#ffd36b', false, 'Spoon takes knight'); achAdd('knights', 1);""",
    """            proj.splice(i, 1); splat(p.x, p.y, '#f4f1ea', 12); floatText(p.x, p.y - c * 0.7, 'Sx' + square(p.x, knightRank(p, p.y)) + '!', '#ffd36b', false, 'Spoon takes knight'); achAdd('knights', 1);
            const kb = p.owner && fighting(p.owner) ? p.owner : nearestFighting(p.x); // and it flies back at the boss who sent it
            if (kb) proj.push(P({ k: 'knightBack', harmless: true, dmg: 6 * thickMul(upg.thick || 0), x: p.x, y: p.y, c, tgt: kb, owner: null, vr: 9 }));""")
rep("""      if (k === 'knight') {
        const c = p.c;""", """      if (k === 'knightBack') {
        let b = p.tgt;
        if (!b || !fighting(b)) b = p.tgt = nearestFighting(p.x);
        if (!b) { proj.splice(i, 1); continue; }
        const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy) || 1;
        p.x += dx / d * 760 * rdt; p.y += dy / d * 760 * rdt; p.rot += p.vr * rdt;
        if (d < 40 * bossK()) {
          proj.splice(i, 1); splat(b.x, b.y, '#f4f1ea', 10);
          damageBoss(p.dmg, b);
          if (!anyFighting() || state !== 'play') return;
        }
        continue;
      }
      if (k === 'knight') {
        const c = p.c;""")
rep("""    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(c / 34, c / 34); if (spoon.x < p.x) ctx.scale(-1, 1);
    ctx.fillStyle = '#f4f1ea'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 1.8;
    roundRect(-12, 10, 24, 7, 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-9, 10); ctx.lineTo(-7, 0); ctx.quadraticCurveTo(-12, -6, -6, -14); ctx.quadraticCurveTo(-2, -20, 4, -19); ctx.lineTo(7, -23); ctx.lineTo(8, -16);
    ctx.quadraticCurveTo(13, -10, 12, -4); ctx.lineTo(4, -6); ctx.quadraticCurveTo(2, 2, 9, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-5, -13); ctx.quadraticCurveTo(-10, -5, -7, 2); ctx.stroke();
    ctx.restore();
  }""", """    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(c / 34, c / 34); if (spoon.x < p.x) ctx.scale(-1, 1);
    knightShape();
    ctx.restore();
  }
  function knightShape() { // the white knight piece, 34 units tall, centred on 0,0
    ctx.fillStyle = '#f4f1ea'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 1.8;
    roundRect(-12, 10, 24, 7, 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-9, 10); ctx.lineTo(-7, 0); ctx.quadraticCurveTo(-12, -6, -6, -14); ctx.quadraticCurveTo(-2, -20, 4, -19); ctx.lineTo(7, -23); ctx.lineTo(8, -16);
    ctx.quadraticCurveTo(13, -10, 12, -4); ctx.lineTo(4, -6); ctx.quadraticCurveTo(2, 2, 9, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-5, -13); ctx.quadraticCurveTo(-10, -5, -7, 2); ctx.stroke();
  }""")

# ---------- Queen bee: with two bosses, one charge goes in a line through both ----------
rep("  function queenTarget() { const f = bosses.filter(fighting); return f.length ? f.reduce((a, c) => (a.hp <= c.hp ? a : c)) : null; }",
    """  function queenTarget() {
    const f = bosses.filter(fighting);
    if (!f.length) return null;
    if (f.length > 1 && qd) return f.reduce((a, c) => (Math.abs(a.x - qd.x) >= Math.abs(c.x - qd.x) ? a : c)); // two at once: aim at the far one, through the near one
    return f.reduce((a, c) => (a.hp <= c.hp ? a : c));
  }""")
rep("""      if (!qd.hit && tg && fighting(tg) && Math.hypot(tg.x - qd.x, tg.y - qd.y) < 62 * bossK()) {
        qd.hit = true; shake = reduceMotion ? 0 : 8;
        for (const ob of bosses.filter(fighting)) { // in crazy mode one charge hits both bosses at the same time
          for (let i = 0; i < 3; i++) splat(ob.x + rnd(-30, 30), ob.y + rnd(-30, 30), '#f2a516', 10);
          floatText(ob.x, ob.y - 30 * bossK(), 'ROYAL CHARGE', '#ffd36b');
          damageBoss(qd.dmg, ob);
          if (ob.mode === 'down') achUnlock('royal');
          else if (fighting(ob)) ob.atkT = Math.max(ob.atkT, 0) + 1; // knocked off his next attack for a second
          if (state !== 'play' || !qd) return;
        }
      }
      if (qd.x < -110 || qd.x > W + 110 || qd.y < combBottom() - 60 || qd.y > H + 60 || qd.t > 1.3) {""",
    """      const fl = bosses.filter(fighting);
      if (fl.length > 1) { // two at once: she bends a little towards the next one ahead of her, so one charge goes through both
        const ahead = fl.filter(ob => !qd.hitList.includes(ob) && (ob.x - qd.x) * qd.vx + (ob.y - qd.y) * qd.vy > 0);
        const next = ahead.sort((a, c) => Math.hypot(a.x - qd.x, a.y - qd.y) - Math.hypot(c.x - qd.x, c.y - qd.y))[0];
        if (next) {
          const cur = Math.atan2(qd.vy, qd.vx), want = Math.atan2(next.y - qd.y, next.x - qd.x);
          const a = cur + clamp(Math.atan2(Math.sin(want - cur), Math.cos(want - cur)), -3 * dt, 3 * dt);
          qd.vx = Math.cos(a); qd.vy = Math.sin(a); qd.ang = a;
        }
      }
      for (const ob of fl) { // each boss she flies through takes the hit
        if (qd.hitList.includes(ob) || Math.hypot(ob.x - qd.x, ob.y - qd.y) >= 62 * bossK()) continue;
        qd.hitList.push(ob); shake = reduceMotion ? 0 : 8;
        for (let i = 0; i < 3; i++) splat(ob.x + rnd(-30, 30), ob.y + rnd(-30, 30), '#f2a516', 10);
        floatText(ob.x, ob.y - 30 * bossK(), 'ROYAL CHARGE', '#ffd36b');
        damageBoss(qd.dmg, ob);
        if (ob.mode === 'down') achUnlock('royal');
        else if (fighting(ob)) ob.atkT = Math.max(ob.atkT, 0) + 1; // knocked off his next attack for a second
        if (state !== 'play' || !qd) return;
      }
      if (qd.x < -110 || qd.x > W + 110 || qd.y < combBottom() - 60 || qd.y > H + 60 || qd.t > (fl.length > 1 ? 1.8 : 1.3)) {""")
rep("""      const lx = qd.x < W / 2 ? queenEdge() : W - queenEdge(), ly = clamp(tg.y + 20 * bossK(), combBottom() + 60, H * 0.6);""",
    """      const lx = qd.x < W / 2 ? queenEdge() : W - queenEdge(), f2b = bosses.filter(fighting);
      let ly = tg.y + 20 * bossK();
      if (f2b.length > 1) { const [a, c] = f2b; ly = a.y + (c.y - a.y) * (lx - a.x) / ((c.x - a.x) || 1) + 20 * bossK(); } // on the line through both
      ly = clamp(ly, combBottom() + 60, H * 0.6);""")
rep("      qd.st = 'go'; qd.t = 0; qd.hit = false; qd.vx = (tg.x - qd.x) / d; qd.vy = (tg.y - qd.y) / d;",
    "      qd.st = 'go'; qd.t = 0; qd.hitList = []; qd.vx = (tg.x - qd.x) / d; qd.vy = (tg.y - qd.y) / d;")
rep("""      ctx.beginPath(); ctx.moveTo(qd.x, qd.y); ctx.lineTo(tg.x, tg.y); ctx.stroke();
      circle(tg.x, tg.y, 44 * bossK()); ctx.stroke();""",
    """      ctx.beginPath(); ctx.moveTo(qd.x, qd.y); ctx.lineTo(tg.x, tg.y); ctx.stroke();
      for (const ob of bosses.filter(fighting)) { circle(ob.x, ob.y, 44 * bossK()); ctx.stroke(); } // with two bosses the line runs through both""")

# ---------- Honey magnet: 75% of the size on a computer screen, and a bit shorter ----------
rep("    magnet: lv => ({ cd: 35 - (lv - 1) * 17 / 9, dur: 5 + (lv - 1) * 5 / 9, reach: 0.15 + (lv - 1) * 0.15 / 9 }),",
    "    magnet: lv => ({ cd: 35 - (lv - 1) * 17 / 9, dur: 4.5 + (lv - 1) * 4 / 9, reach: 0.15 + (lv - 1) * 0.15 / 9 }),")
rep("  const magR = () => W * magnetReach * (endless ? 1 + Math.min(0.4, 0.08 * Math.max(0, fallMul() - 3)) : 1); // reaches further in endless as things fall faster",
    "  const magSize = () => 0.75 + 0.25 * clamp((1100 - W) / 725, 0, 1); // 75% on a computer screen, full size on a phone\n"
    "  const magR = () => W * magnetReach * magSize() * (endless ? 1 + Math.min(0.4, 0.08 * Math.max(0, fallMul() - 3)) : 1); // reaches further in endless as things fall faster")
rep("return `Reaches ${Math.round(q.reach * 100)}% of the screen's width for ${q.dur.toFixed(1)} s.",
    "return `Reaches ${Math.round(q.reach * magSize() * 100)}% of the screen's width for ${q.dur.toFixed(1)} s.")

# ---------- Endless: steeper per meeting, crazy starts further along, damage climbs slowly to +150% ----------
rep("  const ENDLESS_STEP = 3; // endless: levels a boss gains each time you meet him again",
    "  const ENDLESS_STEP = 4; // endless: levels a boss gains each time you meet him again")
rep("    // endless: how hard this boss is depends on how many times you've met him this run (first time 0, then 3, 6, 9...)\n"
    "    const elv = isEndless ? ENDLESS_STEP * ((endlessSeen[i] = (endlessSeen[i] || 0) + 1) - 1) : 0;",
    "    // endless: how hard this boss is depends on how many times you've met him this run (first time 0, then 4, 8, 12...);\n"
    "    // in crazy mode they count as met once more\n"
    "    const elv = isEndless ? ENDLESS_STEP * ((endlessSeen[i] = (endlessSeen[i] || 0) + 1) - 1 + (n > 1 ? 1 : 0)) : 0;")
rep("    if (opts.boss && endless) dmg = Math.round(dmg * (1 + Math.min(0.6, 0.04 * lvOf(opts.boss)))); // endless bosses hit harder each time you meet them",
    "    if (opts.boss && endless) dmg = Math.round(dmg * (1 + Math.min(1.5, 0.04 * lvOf(opts.boss)))); // endless bosses hit 4% harder per level, slowly up to +150%")
rep("""  // Endless bosses get a level each time you meet the same one again (0, 3, 6, 9...). Per level they throw 10% more (up to
  // double), hit 4% harder (up to +60%) and give 3.75% less warning (down to 70%).""",
    """  // Endless bosses gain levels each time you meet the same one again (0, 4, 8, 12...). Per level they throw 10% more (up to
  // double), hit 4% harder (slowly, up to +150%) and give 3.75% less warning (down to 70%).""")

# ---------- the smoker doesn't slow the App Founder's bar charts (they'd just stay up longer) ----------
rep("""      if (k === 'bar') {
        const t0 = p.t - p.tele;""", """      if (k === 'bar') {
        p.t += rdt - dt; // bar charts ignore the smoker, or they'd just block you for longer
        const t0 = p.t - p.tele;""")

open(fn, 'w').write(s)
print('ok')
