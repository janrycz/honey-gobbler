import sys
p = sys.argv[1]
s = open(p).read()
def rep(old, new, count=1):
    global s
    n = s.count(old); assert n == count, (n, old[:100]); s = s.replace(old, new)
def between(start, end, new):
    global s
    a = s.index(start); b = s.index(end, a); s = s[:a] + new + s[b:]

# ---------- helpers for the new attacks ----------
rep("  const ATTACKS = {\n", r'''  // the Looksmaxxer's stream chat
  function chatPush(user, col, text, o = {}) {
    if (!chat) return;
    chat.msgs.push(Object.assign({ user, col, text }, o));
    if (chat.msgs.length > 30) chat.msgs.shift();
  }
  function chatReact(text, n = 0) { // the same message from a few people at once, like a real chat
    if (!chat || (!n && chat.reactT > 0)) return;
    if (!n) { chat.reactT = 0.7; n = 1 + Math.floor(Math.random() * 2); }
    for (let i = 0; i < n; i++) { const [u, c] = pick(CHAT_USERS); chatPush(u, c, text); }
  }
  function updateChat(dt) {
    if (!chat) return;
    chat.viewers += dt * rnd(20, 140) * (chat.flood > 0 ? 3 : 1);
    chat.flood = Math.max(0, chat.flood - dt); chat.reactT = Math.max(0, chat.reactT - dt);
    for (const m of chat.msgs) if (m.banT > 0) { m.banT -= dt; if (m.banT <= 0) { m.banned = true; chatPush('ModBot', '#3ddc84', m.user + ' has been banned.', { mod: true }); } }
    chat.nextT -= dt;
    if (chat.nextT > 0) return;
    chat.nextT = chat.flood > 0 ? rnd(0.22, 0.45) : rnd(0.8, 1.6);
    const [u, c] = pick(CHAT_USERS);
    if (Math.random() < 0.16) { chatPush(u, c, pick(CHAT_PRO), { banT: rnd(0.8, 1.4) }); return; } // anyone who defends the honey gets banned
    let text = pick(CHAT_HATE);
    for (let k = 0; k < 6 && chat.recent.includes(text); k++) text = pick(CHAT_HATE);
    chat.recent.push(text); if (chat.recent.length > 5) chat.recent.shift();
    chatPush(u, c, text);
  }
  function floodChat(n) {
    for (let i = 0; i < n; i++) {
      const dir = Math.random() < 0.5 ? 1 : -1, [user, col] = pick(CHAT_USERS), text = pick(CHAT_HATE);
      proj.push(P({ k: 'chatMsg', name: 'Chat', color: col, user, text, x: dir > 0 ? -90 : W + 90, y: combBottom() + rnd(40, H * 0.32), vx: dir * rnd(220, 300), vy: rnd(70, 130), r: 14, dmg: 8, delay: i * 0.24 }));
      chatPush(user, col, text);
    }
  }
  function fireHyper(p) {
    const by = H - 26, m = p.targets.length;
    p.tops.forEach((x, j) => {
      const tg = p.targets[j % m], y0 = p.top + 6, T = 0.85, dx = tg.x - x, dy = by - y0;
      proj.push(P({ k: 'hyperArrow', name: 'Hypergamy chart', color: '#ff6fae', x, y: y0, vx: dx / T, vy: dy / T, rot: Math.atan2(dy, dx), r: 9, dmg: 10, ty: by, owner: p.owner }));
    });
    sfx.whoosh();
  }
  const ATTACKS = {
''')

between('    bars(b) {', '    chess(b) {', r'''    bars(b) {
      say(pick(["What's our MRR?", 'Churn is up. Who did this?', 'Downloads are flat. Why are downloads flat?']));
      sfx.warn();
      const w = clamp(spoonSize() * 1.2, 56, 90);
      const xs = [clamp(spoon.x, w / 2 + 6, W - w / 2 - 6)];
      for (let tries = 0; xs.length < 3 && tries < 40; tries++) { const x = rnd(w / 2 + 6, W - w / 2 - 6); if (xs.every(o => Math.abs(o - x) > w * 1.6)) xs.push(x); }
      // churn is always the tallest bar
      const others = [['MRR', '#34a853'], ['Downloads', '#4285f4'], ['DAU', '#fbbc05']].sort(() => Math.random() - .5), ci = Math.floor(Math.random() * xs.length);
      xs.forEach((x, i) => {
        const [label, color] = i === ci ? ['Churn', '#ea4335'] : others.pop();
        proj.push(P({ k: 'bar', harmless: true, dmg: 14, x, y: H, w, label, color, H0: i === ci ? H * 0.56 : H * rnd(0.28, 0.42), tele: 0.95 + i * 0.12, name: label + ' chart' }));
      });
      return 3.2;
    },
''')

rep("    // 6. The Disprover\n", r'''    axes(b) {
      say(pick(['Answer the question. Yes or no.', 'Interesting. Very interesting.']));
      const k = bossK(), x0 = b.x + 30 * k, y0 = b.y - 10 * k;
      [-1, 0, 1].forEach((sd, i) => proj.push(P(Object.assign({ k: 'axe', name: 'Spinning axe', color: '#c9ced6', x: x0, y: y0, r: 15, dmg: 12, vr: (sd < 0 ? -1 : 1) * 11, delay: i * 0.22 }, lob(x0, y0, clamp(spoon.x + sd * 90, 20, W - 20), 1.15, 520)))));
      return 2.6;
    },
    axeChop(b) {
      say('Cross-examination time.');
      sfx.warn();
      proj.push(P({ k: 'chop', harmless: true, dmg: 18, name: 'Axe chop', color: '#c9ced6', x: clamp(spoon.x, 30, W - 30), y: H / 2, tele: 1.05 }));
      return 3.0;
    },
    // 6. The Looksmaxxer
    hypergamy(b) { // his signature attack: pink figures along the top fire along dashed arrows at a few blue men, one under you
      say("Women won't buy your honey. You're sub 5.");
      sfx.warn();
      const n = cnt(9), tops = [], top = combBottom() + 78;
      for (let i = 0; i < n; i++) tops.push(W * (i + 0.5) / n);
      const m = Math.random() < 0.5 ? 2 : 3, xs = [clamp(spoon.x, 30, W - 30)];
      for (let tries = 0; xs.length < m && tries < 40; tries++) { const x = rnd(40, W - 40); if (xs.every(o => Math.abs(o - x) > W * 0.22)) xs.push(x); }
      proj.push(P({ k: 'hyper', harmless: true, dmg: 0, x: W / 2, y: H / 2, tops, top, targets: xs.map((x, j) => ({ x, x0: x, ph: rnd(0, 6), track: j === 0 })), tele: 1.3, waves: b.p2 ? 2 : 1, moving: b.p2, fired: 0 }));
      return b.p2 ? 3.9 : 3.4;
    },
    needles(b) {
      say("Trust me bro, I'm natty.");
      const k = bossK(), x0 = b.x + 40 * k, y0 = b.y - 20 * k;
      NEEDLES.forEach((label, i) => proj.push(P(Object.assign({ k: 'syringe', name: label === 'FIN' ? 'Finasteride' : label === 'TRT' ? 'TRT' : 'Peptides', color: '#9be7ff', label, x: x0, y: y0, r: 13, dmg: 10, delay: i * 0.18 }, lob(x0, y0, clamp(spoon.x + (i - 1) * 75, 20, W - 20), 1.0, 360)))));
      return 2.4;
    },
    ratings(b) {
      say(pick(["Your canthal tilt is why the honey isn't selling.", 'Ur a Jeffrey.']));
      fallers(4, () => { const text = pick(RATINGS); return { k: 'rate', name: 'Rated ' + text, color: '#ff5a6e', text, vy: rnd(130, 170), r: 18, dmg: 10 }; }, 0.3);
      return 2.6;
    },
    pills(b) {
      say('Endocrine warfare is killing your T, bro.');
      const k = bossK(), x0 = b.x, y0 = b.y + 20 * k;
      for (let i = 0, n = cnt(4); i < n; i++) proj.push(P(Object.assign({ k: 'pill', name: 'Pills', color: pick(['#e2492f', '#4a7dff', '#f2c200']), x: x0, y: y0, r: 10, dmg: 8, vr: rnd(-6, 6), delay: i * 0.15, bounces: 0 }, lob(x0, y0, clamp(spoon.x + rnd(-160, 160), 20, W - 20), 0.9, 700))));
      return 2.6;
    },
    liver(b) {
      say("At least you sell raw honey. But why don't you eat raw meat?");
      const k = bossK(), x0 = b.x - 30 * k, y0 = b.y + 10 * k;
      [-1, 1].forEach((sd, i) => proj.push(P(Object.assign({ k: 'liver', name: 'Raw liver', color: '#8e1b2a', x: x0, y: y0, r: 16, dmg: 12, vr: rnd(-2, 2), delay: i * 0.25 }, lob(x0, y0, clamp(spoon.x + sd * rnd(20, 70), 20, W - 20), 1.2, 400)))));
      return 2.6;
    },
    courseAd(b) {
      say('Link in bio. $199 jawline course.');
      floatText(W / 2, H * 0.4, '$199 JAWLINE COURSE · LINK IN BIO', '#ffd36b', true);
      sfx.warn();
      wall(() => ({ k: 'ad', name: 'Jawline course', color: '#ffd400', vy: 150, r: 14, dmg: 12 }), 0.7);
      return 3.2;
    },
    chatFlood(b) {
      say('Forty thousand watching. Biggest stream ever.');
      floodChat(cnt(5));
      return 2.8;
    },
    bonesmash(b) {
      say('Mew harder.');
      sfx.warn();
      proj.push(P({ k: 'hammer', harmless: true, dmg: 16, name: 'Bonesmash', color: '#c9ced6', x: clamp(spoon.x, 30, W - 30), y: H / 2, tele: 0.95 }));
      return 2.8;
    },
    subathon(b) {
      floatText(W / 2, H * 0.4, 'SUBATHON', '#ff5a6e', true);
      sfx.warn();
      floodChat(cnt(9));
      fallers(3, () => { const text = pick(DONOS); return { k: 'dono', name: 'Donation alert', color: '#3ddc84', text, vy: rnd(120, 150), r: 18, dmg: 10 }; }, 0.45);
      if (chat) chat.flood = 6;
      return 3.8;
    },
    // 7. The Disprover
''')
rep("    bigbang(b) {\n", r'''    missingLink(b) {
      say(pick(['Show me the half bee. Show me one half bee.', 'Which monkey taught the bee the hexagon? Remind me again.']));
      floatText(W / 2, H * 0.4, 'THE MISSING LINK', '#cfe8ff', true);
      sfx.warn();
      let n = 0;
      wall(() => ({ k: 'link', name: 'Missing link', color: '#b8c0cc', vy: 150, r: 13, dmg: 12, flip: n++ % 2 }), 0.7, 3.0);
      return 3.2;
    },
    fishLegs(b) {
      say('Your grandfather was a fish? Speak for yourself.');
      for (let i = 0, n = cnt(2); i < n; i++) {
        const dir = i % 2 ? -1 : 1;
        proj.push(P({ k: 'fish', name: 'Fish with legs', color: '#7fa7c9', x: dir > 0 ? -40 : W + 40, y: H - 22, vx: dir * 120, r: 15, dmg: 12, dir, face: dir, walk: rnd(0, 6), delay: i * 0.7, safe: true }));
      }
      return 3.0;
    },
    bigbang(b) {
''')
rep("  const SWAY = { notify: 1, fee: 1, gif: 1, job: 1 };", "  const SWAY = { notify: 1, fee: 1, gif: 1, job: 1, rate: 1, dono: 1 };")

# ---------- drawing the new attacks ----------
rep("  const SPECIAL = { ring: 1, smoke: 1, bar: 1, beam: 1, belt: 1, rope: 1, crowFly: 1, blendSrc: 1, allyFee: 1 };", r'''  // ---------- the new attacks ----------
  function drawSyringe(p) {
    ctx.rotate(-p.rot); // the syringe points where it's flying, its label stays level
    ctx.save(); ctx.rotate(p.rot);
    const liq = p.label === 'TRT' ? '#ffd36b' : p.label === 'FIN' ? '#7cc4ff' : '#ff8ad0';
    ctx.strokeStyle = '#d9d9de'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(25, 0); ctx.stroke();
    roundRect(-15, -5.5, 27, 11, 3); ctx.fillStyle = 'rgba(232,244,255,.92)'; ctx.fill();
    ctx.fillStyle = liq; ctx.fillRect(-3, -4, 14, 8);
    ctx.lineWidth = 1.2; ctx.strokeStyle = '#6a6e76'; roundRect(-15, -5.5, 27, 11, 3); ctx.stroke();
    ctx.fillStyle = '#6a6e76'; ctx.fillRect(-22, -1.6, 7, 3.2); ctx.fillRect(-25, -6, 3, 12);
    ctx.restore();
    ctx.font = '900 8px "Instrument Sans", sans-serif';
    const w = ctx.measureText(p.label).width + 8;
    roundRect(-w / 2, -22, w, 12, 3); ctx.fillStyle = '#16161c'; ctx.fill();
    txt(p.label, 0, -15.6, 8, '#ffffff', 900);
  }
  function drawPill(p) {
    const r = p.r, body = () => roundRect(-r * 1.15, -r * 0.5, r * 2.3, r, r * 0.5);
    body(); ctx.fillStyle = '#f4f1ea'; ctx.fill();
    ctx.save(); body(); ctx.clip(); ctx.fillStyle = p.color; ctx.fillRect(0, -r, r * 1.3, r * 2); ctx.restore();
    ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(0,0,0,.35)'; body(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.55)'; roundRect(-r * 0.9, -r * 0.32, r * 1.6, r * 0.18, 2); ctx.fill();
  }
  function drawLiver(r) {
    ctx.beginPath(); ctx.moveTo(-r * 1.2, -r * 0.1); ctx.bezierCurveTo(-r * 1.2, -r * 0.95, r * 0.2, -r * 1.05, r * 1.25, -r * 0.45); ctx.bezierCurveTo(r * 1.0, r * 0.25, r * 0.2, r * 0.9, -r * 0.3, r * 0.75); ctx.bezierCurveTo(-r * 0.9, r * 0.6, -r * 1.2, r * 0.3, -r * 1.2, -r * 0.1); ctx.closePath();
    const g = ctx.createLinearGradient(0, -r, 0, r); g.addColorStop(0, '#a3243a'); g.addColorStop(1, '#5e0f1a'); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(40,0,6,.6)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-r * 0.1, -r * 0.82); ctx.quadraticCurveTo(0, 0, -r * 0.35, r * 0.7); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(-r * 0.55, -r * 0.4, r * 0.35, r * 0.12, -0.4, 0, TAU); ctx.fill();
    txt('RAW', r * 0.4, r * 0.05, r * 0.42, 'rgba(255,220,225,.9)', 900);
  }
  function drawRate(p) {
    const w = 66, h = 32;
    card(w, h, '#fbfbfd', Math.sin(p.t * 2 + p.ph) * .14);
    ctx.fillStyle = '#16161c'; ctx.fillRect(-w / 2, -h / 2, w, 9);
    txt('RATING', 0, -h / 2 + 4.6, 6, '#ffffff', 900);
    txt(p.text, 0, 5, 12, '#e2203a', 900, 'Gluten, cursive', w - 8);
  }
  function drawChatMsg(p) {
    ctx.font = '700 9px "Instrument Sans", sans-serif';
    const uw = ctx.measureText(p.user + ': ').width;
    ctx.font = '600 9px "Instrument Sans", sans-serif';
    const w = Math.min(200, uw + ctx.measureText(p.text).width + 14), h = 20;
    card(w, h, 'rgba(24,24,28,.95)', 0);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.font = '700 9px "Instrument Sans", sans-serif'; ctx.fillStyle = p.color; ctx.fillText(p.user + ':', -w / 2 + 7, 0.5);
    ctx.font = '600 9px "Instrument Sans", sans-serif'; ctx.fillStyle = '#efeff1'; ctx.fillText(p.text, -w / 2 + 7 + uw, 0.5, w - uw - 12);
  }
  function drawDono(p) {
    ctx.font = '800 9px "Instrument Sans", sans-serif';
    const w = Math.min(190, ctx.measureText(p.text).width + 18), h = 24;
    card(w, h, '#101a14', Math.sin(p.t * 2 + p.ph) * .1);
    ctx.lineWidth = 2; ctx.strokeStyle = '#3ddc84'; roundRect(-w / 2, -h / 2, w, h, 7); ctx.stroke();
    txt(p.text, 0, 0.5, 9, '#3ddc84', 800, '"Instrument Sans", sans-serif', w - 10);
  }
  function drawAd() {
    roundRect(-18, -10, 36, 20, 4); ctx.fillStyle = '#ffd400'; ctx.fill();
    ctx.lineWidth = 1.4; ctx.strokeStyle = '#16161c'; ctx.stroke();
    txt('$199', 0, -2.5, 9, '#c8102e', 900);
    txt('COURSE', 0, 5.5, 5.5, '#16161c', 900);
  }
  function drawAxe(r) {
    roundRect(-2.5, -r * 1.2, 5, r * 2.4, 2); ctx.fillStyle = '#8a5a2b'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(2, -r * 1.1); ctx.quadraticCurveTo(r * 1.5, -r * 1.2, r * 1.3, -r * 0.1); ctx.quadraticCurveTo(r * 0.9, -r * 0.35, 2, -r * 0.35); ctx.closePath();
    ctx.fillStyle = '#c9ced6'; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = '#6a6e76'; ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(r * 1.0, -r * 0.95); ctx.quadraticCurveTo(r * 1.35, -r * 0.6, r * 1.22, -r * 0.2); ctx.stroke();
  }
  function drawLink(p) {
    if (p.flip) ctx.rotate(Math.PI / 2);
    ctx.lineWidth = 4.5; ctx.strokeStyle = '#8a929e'; ctx.beginPath(); ctx.ellipse(0, 0, p.r * 0.95, p.r * 0.55, 0, 0, TAU); ctx.stroke();
    ctx.lineWidth = 1.6; ctx.strokeStyle = '#d9dee6'; ctx.beginPath(); ctx.ellipse(0, -1, p.r * 0.95, p.r * 0.55, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  }
  function drawFish(p) {
    ctx.scale(p.face || p.dir, 1);
    const step = p.air ? 3 : Math.sin(p.walk || 0) * 5;
    ctx.strokeStyle = '#3a4a5a'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-4, 6); ctx.lineTo(-4 + step, 16); ctx.lineTo(-1 + step, 16); ctx.moveTo(5, 6); ctx.lineTo(5 - step, 16); ctx.lineTo(8 - step, 16); ctx.stroke();
    ctx.fillStyle = '#5f87ad'; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-25, -8); ctx.lineTo(-22, 0); ctx.lineTo(-25, 8); ctx.closePath(); ctx.fill();
    const g = ctx.createLinearGradient(0, -9, 0, 9); g.addColorStop(0, '#8fb6d8'); g.addColorStop(1, '#5a7fa3');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 16, 9, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#5f87ad'; ctx.beginPath(); ctx.moveTo(-5, -8); ctx.lineTo(2, -14); ctx.lineTo(6, -8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; for (const x of [-7, -2, 3]) { ctx.beginPath(); ctx.arc(x, 0, 5, -0.8, 0.8); ctx.stroke(); }
    ctx.strokeStyle = '#3a5a7a'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(9, 0, 5, -1.2, 1.2); ctx.stroke();
  }
  function drawHyperArrow() {
    ctx.strokeStyle = 'rgba(255,111,174,.55)'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(-22, 0); ctx.stroke();
    ctx.fillStyle = '#ff6fae'; ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(-6, -7.5); ctx.lineTo(-2, 0); ctx.lineTo(-6, 7.5); ctx.closePath(); ctx.fill();
  }
  function drawPicto(x, y, pink, sc) { // toilet-sign figures, no faces
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    const c = pink ? '#ff6fae' : '#4a90ff';
    ctx.fillStyle = c; ctx.strokeStyle = c;
    circle(0, -16, 4.6); ctx.fill();
    if (pink) { ctx.beginPath(); ctx.moveTo(-3.5, -10); ctx.lineTo(3.5, -10); ctx.lineTo(8, 5); ctx.lineTo(-8, 5); ctx.closePath(); ctx.fill(); }
    else { roundRect(-5, -10, 10, 15, 2.5); ctx.fill(); }
    ctx.fillRect(-4, 5, 3, 8); ctx.fillRect(1, 5, 3, 8);
    ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(pink ? -4 : -5.5, -8.5); ctx.lineTo(pink ? -8 : -8.5, 1); ctx.moveTo(pink ? 4 : 5.5, -8.5); ctx.lineTo(pink ? 8 : 8.5, 1); ctx.stroke();
    ctx.restore();
  }
  function drawHyper(p, t) {
    const end = p.tele + (p.waves - 1) * 0.5;
    const a = p.t < end + 0.25 ? Math.min(1, p.t * 5) : Math.max(0, 1 - (p.t - end - 0.25) / 0.7);
    if (a <= 0) return;
    const pulse = .5 + .5 * Math.sin(t * 14), by = H - 26, sc = Math.max(0.75, G), m = p.targets.length;
    ctx.globalAlpha = a;
    const cap = 'HYPERGAMY CHART · SOURCE: TRUST ME BRO';
    fitFont(cap, 15, 900, 'Gluten, cursive', W - 24);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(29,17,8,.85)'; ctx.strokeText(cap, W / 2, p.top - 34);
    ctx.fillStyle = '#ffb3d1'; ctx.fillText(cap, W / 2, p.top - 34);
    if (p.fired < p.waves) { // the dashed arrows it's about to fire along
      ctx.setLineDash([7, 7]); ctx.lineDashOffset = -t * 40; ctx.lineWidth = 2; ctx.strokeStyle = `rgba(255,111,174,${.45 + pulse * .4})`;
      p.tops.forEach((x, j) => { const tg = p.targets[j % m]; ctx.beginPath(); ctx.moveTo(x, p.top + 8); ctx.lineTo(tg.x, by - 20); ctx.stroke(); });
      ctx.setLineDash([]); ctx.lineDashOffset = 0;
    }
    const nb = Math.max(6, Math.round(W / 70));
    for (let j = 0; j < nb; j++) { const x = W * (j + .5) / nb; if (p.targets.every(tg => Math.abs(tg.x - x) > 26 * sc)) drawPicto(x, by, false, sc * 0.85); }
    for (const tg of p.targets) {
      ctx.strokeStyle = `rgba(74,144,255,${.5 + pulse * .5})`; ctx.lineWidth = 3; circle(tg.x, by - 4, 22 * sc); ctx.stroke();
      drawPicto(tg.x, by, false, sc * 1.1);
    }
    p.tops.forEach(x => drawPicto(x, p.top, true, sc));
    ctx.globalAlpha = 1;
  }
  function drawHammerHead(x, y, sc) {
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    roundRect(-4, -76, 8, 64, 3); ctx.fillStyle = '#7a4a1e'; ctx.fill();
    roundRect(-31, -15, 62, 30, 5);
    const g = ctx.createLinearGradient(0, -15, 0, 15); g.addColorStop(0, '#dde1e7'); g.addColorStop(1, '#7d838c'); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#4a4f57'; ctx.stroke();
    txt('BONESMASH', 0, 1, 8.5, '#2a2d33', 900, '"Instrument Sans", sans-serif', 56);
    ctx.restore();
  }
  function warnStrip(p, t, half, label) {
    const top = combBottom(), pulse = .5 + .5 * Math.sin(t * 16);
    ctx.fillStyle = `rgba(200,16,46,${.1 + pulse * .1})`; ctx.fillRect(p.x - half, top, half * 2, H - top);
    ctx.setLineDash([8, 8]); ctx.lineWidth = 2; ctx.strokeStyle = `rgba(255,120,100,${.5 + pulse * .4})`; ctx.strokeRect(p.x - half, top, half * 2, H - top); ctx.setLineDash([]);
    outlined(label, p.x, top + 18, 13, '#ff9a8a');
  }
  function drawHammer(p, t) {
    const top = combBottom();
    if (p.t < p.tele) { warnStrip(p, t, 30 * G, 'BONESMASH'); drawHammerHead(p.x, top + 120 * G - p.t / p.tele * 34 * G, G); return; }
    const t0 = p.t - p.tele, u = ease(Math.min(1, t0 / 0.08)), y0 = top + 86 * G, y1 = H - 16 * G;
    ctx.globalAlpha = 1 - clamp((t0 - 0.55) / 0.3, 0, 1);
    drawHammerHead(p.x, y0 + (y1 - y0) * u, G);
    ctx.globalAlpha = 1;
  }
  function drawBigAxe(x, y, sc) {
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    roundRect(-4, -118, 8, 104, 3); ctx.fillStyle = '#8a5a2b'; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(-2, -116, 2, 100);
    ctx.beginPath(); ctx.moveTo(-11, -26); ctx.lineTo(11, -26); ctx.quadraticCurveTo(26, -12, 32, 8); ctx.quadraticCurveTo(0, 0, -32, 8); ctx.quadraticCurveTo(-26, -12, -11, -26); ctx.closePath();
    const g = ctx.createLinearGradient(0, -26, 0, 8); g.addColorStop(0, '#7d838c'); g.addColorStop(1, '#e4e7ec'); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 1.6; ctx.strokeStyle = '#4a4f57'; ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-28, 6); ctx.quadraticCurveTo(0, -1, 28, 6); ctx.stroke();
    ctx.restore();
  }
  function drawChop(p, t) {
    const top = combBottom();
    if (p.t < p.tele) { warnStrip(p, t, 24 * G, 'AXE'); drawBigAxe(p.x, top + 140 * G - p.t / p.tele * 40 * G, G); return; }
    const t0 = p.t - p.tele, u = ease(Math.min(1, t0 / 0.08)), y0 = top + 100 * G, y1 = H - 10 * G;
    ctx.globalAlpha = 1 - clamp((t0 - 0.55) / 0.3, 0, 1);
    drawBigAxe(p.x, y0 + (y1 - y0) * u, G);
    ctx.globalAlpha = 1;
  }
  const SPECIAL = { ring: 1, smoke: 1, bar: 1, beam: 1, belt: 1, rope: 1, crowFly: 1, blendSrc: 1, allyFee: 1, hyper: 1, hammer: 1, chop: 1 };''')
rep("    if (p.k === 'stamp' && p.delay > 0) { drawStampTele(p, t); return; }", "    if (p.dead) return;\n    if (p.k === 'stamp' && p.delay > 0) { drawStampTele(p, t); return; }")
rep("      case 'belt': drawBelt(p, t); return;\n", "      case 'belt': drawBelt(p, t); return;\n      case 'hyper': drawHyper(p, t); return;\n      case 'hammer': drawHammer(p, t); return;\n      case 'chop': drawChop(p, t); return;\n")
rep("    if (!SPECIAL[p.k] && !p.harmless && p.dmg > 0) {", "    if (!SPECIAL[p.k] && !p.harmless && !p.safe && p.dmg > 0) {")
rep("      case 'gif': drawGif(p); break;\n", "      case 'gif': drawGif(p); break;\n      case 'rate': drawRate(p); break;\n      case 'chatMsg': drawChatMsg(p); break;\n      case 'dono': drawDono(p); break;\n")
rep("          case 'hexShard': hexPath(0, 0, p.r); ctx.fillStyle = '#f2a516'; ctx.fill(); break;\n", r'''          case 'hexShard': hexPath(0, 0, p.r); ctx.fillStyle = '#f2a516'; ctx.fill(); break;
          case 'syringe': drawSyringe(p); break;
          case 'pill': drawPill(p); break;
          case 'liver': drawLiver(p.r); break;
          case 'ad': drawAd(); break;
          case 'axe': drawAxe(p.r); break;
          case 'link': drawLink(p); break;
          case 'fish': drawFish(p); break;
          case 'hyperArrow': drawHyperArrow(); break;
''')

# ---------- the Looksmaxxer ----------
rep("  const BOSS_DRAW = { keeper: drawKeeper, colonex: drawColonex, ceo: drawCEO, ironfit: drawIronfit, apologist: drawApologist, disprover: drawDisprover };", r'''  function drawLooks(b, t) {
    const p2 = b.p2, act = b.pose > 0;
    const skin = p2 ? '#cf5640' : '#c98a5c', skinD = p2 ? '#9e3324' : '#a5693f', skinL = p2 ? '#f39a82' : '#e6b088', tee = '#141416', vein = '#701810';
    if (p2) {
      const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 105); g.addColorStop(0, 'rgba(255,70,40,.32)'); g.addColorStop(1, 'rgba(255,70,40,0)');
      ctx.fillStyle = g; circle(0, 0, 105); ctx.fill();
      ctx.translate(0, -4); ctx.scale(1.12, 1.12); // he swells
    }
    // joggers and white trainers
    ctx.fillStyle = '#25252a'; roundRect(-21, 34, 18, 32, 5); ctx.fill(); roundRect(3, 34, 18, 32, 5); ctx.fill();
    ctx.fillStyle = '#f2f2ee'; roundRect(-24, 63, 23, 8, 4); ctx.fill(); roundRect(1, 63, 23, 8, 4); ctx.fill();
    // traps and a neck far too big for his head
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.moveTo(-11, -42); ctx.quadraticCurveTo(-24, -31, -46, -20); ctx.lineTo(46, -20); ctx.quadraticCurveTo(24, -31, 11, -42); ctx.closePath(); ctx.fill();
    roundRect(-12, -46, 24, 28, 7); ctx.fill();
    ctx.strokeStyle = p2 ? vein : skinD; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-8, -38); ctx.quadraticCurveTo(-5, -29, -2, -22); ctx.moveTo(8, -38); ctx.quadraticCurveTo(5, -29, 2, -22); ctx.stroke();
    ctx.strokeStyle = skinL; ctx.lineWidth = 1.6; // collarbones
    ctx.beginPath(); ctx.moveTo(-6, -21); ctx.quadraticCurveTo(-20, -25, -34, -21); ctx.moveTo(6, -21); ctx.quadraticCurveTo(20, -25, 34, -21); ctx.stroke();
    // torso: a V-taper in a black tee two sizes too small
    const torso = () => { ctx.beginPath(); ctx.moveTo(-47, -18); ctx.quadraticCurveTo(-49, 8, -25, 36); ctx.lineTo(25, 36); ctx.quadraticCurveTo(49, 8, 47, -18); ctx.quadraticCurveTo(24, -21, 9, -20); ctx.quadraticCurveTo(0, -12, -9, -20); ctx.quadraticCurveTo(-24, -21, -47, -18); ctx.closePath(); };
    torso(); ctx.fillStyle = tee; ctx.fill();
    ctx.save(); torso(); ctx.clip();
    if (p2) { // the shirt rips
      ctx.fillStyle = skin;
      ctx.beginPath(); ctx.moveTo(-7, -22); ctx.lineTo(-13, -8); ctx.lineTo(-7, 0); ctx.lineTo(-15, 12); ctx.lineTo(-8, 22); ctx.lineTo(-14, 40); ctx.lineTo(14, 40); ctx.lineTo(9, 24); ctx.lineTo(16, 12); ctx.lineTo(8, 2); ctx.lineTo(14, -9); ctx.lineTo(7, -22); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-50, -4); ctx.lineTo(-38, 3); ctx.lineTo(-44, 12); ctx.lineTo(-50, 10); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(50, 6); ctx.lineTo(37, 12); ctx.lineTo(43, 21); ctx.lineTo(50, 19); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = skinD; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(-10, -5); ctx.quadraticCurveTo(0, 1, 10, -5); ctx.moveTo(0, 2); ctx.lineTo(0, 36); for (const y of [12, 20, 28]) { ctx.moveTo(-7, y); ctx.lineTo(7, y); } ctx.stroke();
    } else { // so tight you can see every muscle through it
      ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(-34, -6); ctx.quadraticCurveTo(-17, 6, -1, -4); ctx.moveTo(34, -6); ctx.quadraticCurveTo(17, 6, 1, -4); ctx.moveTo(0, 2); ctx.lineTo(0, 34); for (const y of [13, 21, 29]) { ctx.moveTo(-8, y); ctx.lineTo(8, y); } ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = '#e8c547'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-11, -30); ctx.quadraticCurveTo(0, -12, 11, -30); ctx.stroke(); // gold chain
    const arm = (sx, ex, ey, hx, hy, bx, by, br) => {
      const ang = Math.atan2(ey + 15, ex - sx);
      limb(sx, -15, ex, ey, 19, skin); limb(ex, ey, hx, hy, 15, skin);
      ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(bx, by, 12 * br, 9 * br, ang, 0, TAU); ctx.fill();
      ctx.fillStyle = skinL; ctx.globalAlpha = .5; ctx.beginPath(); ctx.ellipse(bx - 2, by - 3, 5 * br, 2.5 * br, ang, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      if (p2) { ctx.strokeStyle = vein; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(sx * 1.02, -10); ctx.quadraticCurveTo(bx + 4, by + 4, ex, ey); ctx.quadraticCurveTo((ex + hx) / 2 + 3, (ey + hy) / 2, hx, hy); ctx.stroke(); }
      else limb(sx, -16, sx + (ex - sx) * 0.35, -16 + (ey + 16) * 0.35, 23, tee); // tight sleeve
      ctx.fillStyle = skin; circle(hx, hy, 6.5); ctx.fill();
    };
    // left arm holds the selfie stick: he's live
    arm(-44, -60, 6, -66, -20, -53, -6, 1);
    ctx.strokeStyle = '#2a2a30'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-66, -22); ctx.lineTo(-78, -56); ctx.stroke();
    ctx.save(); ctx.translate(-80, -66); ctx.rotate(-0.3);
    roundRect(-10, -16, 20, 32, 4); ctx.fillStyle = '#0d0d10'; ctx.fill();
    roundRect(-8, -13, 16, 26, 2); ctx.fillStyle = '#1d2230'; ctx.fill();
    roundRect(-7, -11, 14, 7, 2); ctx.fillStyle = '#e8142c'; ctx.fill();
    txt('LIVE', 0, -7.4, 5, '#ffffff', 900);
    txt(fmtViewers(chat ? chat.viewers : 40000), 0, 3, 4.6, '#ffffff', 800, '"Instrument Sans", sans-serif', 14);
    ctx.restore();
    // right arm flexes, or throws
    if (act) arm(44, 62, 8, 76, 22, 54, -3, 0.9);
    else arm(44, 62, -2, 58, -30, 54, -12, 1.12 * (1 + 0.07 * Math.sin(t * 3)));
    // head: a razor-sharp diamond jaw, hollow cheeks from mewing, and no face at all
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.ellipse(-16.5, -55, 3, 5, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(16.5, -55, 3, 5, 0, 0, TAU); ctx.fill();
    const head = () => { ctx.beginPath(); ctx.moveTo(-15, -61); ctx.quadraticCurveTo(-15, -77, 0, -77); ctx.quadraticCurveTo(15, -77, 15, -61); ctx.lineTo(17.5, -53); ctx.lineTo(15.5, -43); ctx.lineTo(0, -30); ctx.lineTo(-15.5, -43); ctx.lineTo(-17.5, -53); ctx.closePath(); };
    head(); ctx.fill();
    ctx.save(); head(); ctx.clip();
    ctx.fillStyle = skinD; ctx.globalAlpha = .6;
    ctx.beginPath(); ctx.moveTo(-16, -51); ctx.quadraticCurveTo(-8, -47, -10.5, -38); ctx.lineTo(-16, -43); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(16, -51); ctx.quadraticCurveTo(8, -47, 10.5, -38); ctx.lineTo(16, -43); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = skinL; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-15.5, -53); ctx.lineTo(-9, -51); ctx.moveTo(15.5, -53); ctx.lineTo(9, -51); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = skinD; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(-17.5, -53); ctx.lineTo(-15.5, -43); ctx.lineTo(0, -30); ctx.lineTo(15.5, -43); ctx.lineTo(17.5, -53); ctx.stroke();
    ctx.fillStyle = '#24170e'; // slicked-back quiff
    ctx.beginPath(); ctx.moveTo(-15.5, -59); ctx.quadraticCurveTo(-17, -75, -6, -80); ctx.quadraticCurveTo(10, -85, 17, -73); ctx.quadraticCurveTo(17, -65, 15.5, -59); ctx.quadraticCurveTo(8, -67, 0, -66); ctx.quadraticCurveTo(-9, -66, -15.5, -59); ctx.closePath(); ctx.fill();
  }
  const BOSS_DRAW = { keeper: drawKeeper, colonex: drawColonex, ceo: drawCEO, ironfit: drawIronfit, apologist: drawApologist, looks: drawLooks, disprover: drawDisprover };''')
rep("  function drawBoss(b, t) {\n    const k = bossK();", "  function drawBoss(b, t) {\n    if (b.done) return;\n    const k = bossK();")

# ---------- stream chat panel ----------
rep("  function drawWorkerBees(t) {", r'''  const fmtViewers = v => (v / 1000).toFixed(1) + 'K';
  function drawChat() { // drawn under everything else, so it never hides an attack
    if (!chat) return;
    const narrow = W < 640, fs = narrow ? 10.5 : 12, lh = Math.round(fs * 1.4), pad = 8, rows = narrow ? 4 : 8;
    const w = narrow ? Math.min(W * 0.56, 240) : Math.min(290, W * 0.27), x = narrow ? 8 : 12, top = combBottom() + (narrow ? 40 : 46);
    const lines = [];
    for (const m of chat.msgs) {
      ctx.font = `800 ${fs}px "Instrument Sans", sans-serif`; const hw = ctx.measureText(m.user + ': ').width;
      ctx.font = `600 ${fs}px "Instrument Sans", sans-serif`;
      wrap(m.text, Math.max(40, w - pad * 2 - hw)).forEach((l, j) => lines.push({ m, l, first: j === 0, hw }));
    }
    const shown = lines.slice(-rows), hh = lh + 8, h = hh + rows * lh + pad;
    ctx.fillStyle = 'rgba(14,12,18,.6)'; roundRect(x, top, w, h, 10); ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.stroke();
    roundRect(x + pad, top + 6, 34, lh - 2, 4); ctx.fillStyle = '#e8142c'; ctx.fill();
    txt('LIVE', x + pad + 17, top + 6 + (lh - 2) / 2 + 0.5, fs - 2, '#ffffff', 900);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = `700 ${fs - 1}px "Instrument Sans", sans-serif`; ctx.fillStyle = 'rgba(239,239,241,.85)';
    ctx.fillText(fmtViewers(chat.viewers) + ' watching', x + pad + 42, top + 6 + (lh - 2) / 2 + 0.5);
    let y = top + hh + pad / 2 + (rows - shown.length) * lh + lh / 2;
    for (const L of shown) {
      const m = L.m, tx = x + pad + L.hw;
      ctx.globalAlpha = m.banned ? 0.45 : 1;
      if (L.first) { ctx.font = `800 ${fs}px "Instrument Sans", sans-serif`; ctx.fillStyle = m.col; ctx.fillText(m.user + ':', x + pad, y); }
      ctx.font = `${m.mod ? 'italic 600' : '600'} ${fs}px "Instrument Sans", sans-serif`; ctx.fillStyle = m.mod ? '#9aa0a8' : '#efeff1';
      ctx.fillText(L.l, tx, y);
      if (m.banned) { ctx.strokeStyle = '#efeff1'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx, y); ctx.lineTo(tx + ctx.measureText(L.l).width, y); ctx.stroke(); }
      y += lh;
    }
    ctx.globalAlpha = 1;
  }
  function drawWorkerBees(t) {''')

# ---------- powers: honey magnet visuals, the queen bee ----------
between('    if (queenT > 0) {', '    if (extractT > 0) {', r'''    if (magnetT > 0) {
      const R = W * magnetReach, a = Math.min(1, magnetT * 2);
      ctx.globalAlpha = a;
      ctx.setLineDash([6, 8]); ctx.lineDashOffset = -t * 24; ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,211,107,.5)'; circle(spoon.x, spoon.y - 10, R); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
      ctx.save(); ctx.translate(spoon.x, spoon.y - spoonSize() * 1.2 + Math.sin(t * 6) * 3); ctx.scale(G, G);
      ctx.lineCap = 'butt'; ctx.lineWidth = 9; ctx.strokeStyle = '#e2492f';
      ctx.beginPath(); ctx.moveTo(-12, -10); ctx.lineTo(-12, 0); ctx.arc(0, 0, 12, Math.PI, 0, true); ctx.lineTo(12, -10); ctx.stroke();
      ctx.strokeStyle = '#d9d9de'; ctx.beginPath(); ctx.moveTo(-12, -10); ctx.lineTo(-12, -17); ctx.moveTo(12, -10); ctx.lineTo(12, -17); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,211,107,.8)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) { const ph = (t * 1.5 + i / 3) % 1; ctx.globalAlpha = a * (1 - ph); ctx.beginPath(); ctx.arc(0, -14, 22 + ph * 18, -Math.PI * 0.8, -Math.PI * 0.2); ctx.stroke(); }
      ctx.restore();
      ctx.globalAlpha = 1;
    }
''')
rep("  function drawSmokeFx(t) {", r'''  function drawQueen(x, y, ang, t, sc) {
    const flip = Math.cos(ang) < 0;
    ctx.save(); ctx.translate(x, y); ctx.rotate(flip ? ang + Math.PI : ang); ctx.scale(flip ? -sc : sc, sc);
    const flap = Math.sin(t * 46) * 0.35;
    ctx.fillStyle = 'rgba(235,245,255,.42)'; ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1; // see-through wings
    ctx.save(); ctx.translate(4, -7); ctx.rotate(-0.55 + flap); ctx.beginPath(); ctx.ellipse(-15, -6, 24, 8.5, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.translate(9, -6); ctx.rotate(-0.15 - flap); ctx.beginPath(); ctx.ellipse(-9, -8, 17, 6.5, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
    const abd = () => { ctx.beginPath(); ctx.moveTo(-5, -8); ctx.bezierCurveTo(-28, -10, -50, -6, -64, 0); ctx.bezierCurveTo(-50, 6, -28, 10, -5, 8); ctx.closePath(); };
    abd(); const ag = ctx.createLinearGradient(0, -10, 0, 10); ag.addColorStop(0, '#ffd86b'); ag.addColorStop(1, '#c8861a'); ctx.fillStyle = ag; ctx.fill(); // long, slim, gold and amber
    ctx.save(); abd(); ctx.clip(); ctx.fillStyle = '#9a560e'; for (let i = 0; i < 5; i++) ctx.fillRect(-15 - i * 10, -11, 4.5, 22); ctx.restore();
    ctx.fillStyle = '#6a3a0a'; ctx.beginPath(); ctx.moveTo(-63, -1.6); ctx.lineTo(-72, 0); ctx.lineTo(-63, 1.6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#6a3a0a'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-1, 7); ctx.lineTo(-8, 16); ctx.moveTo(4, 8); ctx.lineTo(2, 18); ctx.moveTo(9, 7); ctx.lineTo(13, 16); ctx.stroke();
    ctx.fillStyle = '#b8761a'; ctx.beginPath(); ctx.ellipse(4, 0, 11, 9, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,230,160,.4)'; ctx.beginPath(); ctx.ellipse(2, -3.5, 6, 3, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#d99a22'; ctx.beginPath(); ctx.ellipse(19, 0, 7, 6.5, 0, 0, TAU); ctx.fill(); // plain head, no face
    ctx.strokeStyle = '#6a3a0a'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(25, -2); ctx.quadraticCurveTo(31, -8, 36, -8); ctx.moveTo(24, -3); ctx.quadraticCurveTo(28, -11, 32, -14); ctx.stroke();
    ctx.fillStyle = '#ffd700'; ctx.strokeStyle = '#a8700f'; ctx.lineWidth = 1; // crown
    ctx.beginPath(); ctx.moveTo(13, -5); ctx.lineTo(13, -14); ctx.lineTo(16, -10); ctx.lineTo(19, -16); ctx.lineTo(22, -10); ctx.lineTo(25, -14); ctx.lineTo(25, -5); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e2203a'; circle(19, -8.5, 1.5); ctx.fill();
    ctx.restore();
  }
  function drawQueenFx(t) {
    if (!qd) return;
    if (qd.mode === 'boss' && qd.st === 'tele' && qd.tgt) { // her warning line
      const pulse = .5 + .5 * Math.sin(t * 22), tg = qd.tgt;
      ctx.setLineDash([12, 9]); ctx.lineDashOffset = -t * 60; ctx.lineWidth = 3; ctx.strokeStyle = `rgba(255,211,107,${.5 + pulse * .45})`;
      ctx.beginPath(); ctx.moveTo(qd.x, qd.y); ctx.lineTo(tg.x, tg.y); ctx.stroke();
      circle(tg.x, tg.y, 44 * bossK()); ctx.stroke();
      ctx.setLineDash([]); ctx.lineDashOffset = 0;
    }
    drawQueen(qd.x, qd.y, qd.ang, t, 1.45 * Math.max(0.7, G));
  }
  function drawSmokeFx(t) {''')
rep("  function updateBees(dt) {", r'''  // ---------- the queen bee ----------
  // In a boss fight: a warning line, a roar, then a charge through the boss, once per charge.
  // Otherwise she sweeps across the screen: honey in her path flies into your spoon and fakes get smashed.
  function launchQueen(st) {
    floatText(W / 2, H * 0.42, 'QUEEN BEE', '#ffd36b', true);
    if (phase === 'boss' && bosses.some(b => b.mode === 'intro' || fighting(b))) {
      const fromL = spoon.x > W / 2;
      qd = { mode: 'boss', st: 'enter', t: 0, left: st.charges, dmg: st.dmg, x: fromL ? -90 : W + 90, y: H * 0.45, ang: fromL ? 0 : Math.PI, tgt: null };
    } else {
      const dir = Math.random() < 0.5 ? 1 : -1;
      qd = { mode: 'sweep', st: 'sweep', t: 0, dir, x: dir > 0 ? -130 : W + 130, y: H * 0.5, band: st.band * H, ang: dir > 0 ? 0 : Math.PI };
      sfx.roar(1.2);
    }
  }
  function queenTarget() { const f = bosses.filter(fighting); return f.length ? f.reduce((a, c) => (a.hp <= c.hp ? a : c)) : null; }
  function queenTrail(n = 1) {
    if (reduceMotion) return;
    for (let i = 0; i < n; i++) particles.push({ x: qd.x - Math.cos(qd.ang) * 55 * G, y: qd.y - Math.sin(qd.ang) * 55 * G + rnd(-4, 4), vx: rnd(-30, 30), vy: rnd(-10, 50), r: rnd(2, 4.5), life: .8, color: pick(['#f2a516', '#ffd36b', '#e08e0b']) });
  }
  function updateQueen(dt) {
    if (!qd) return;
    qd.t += dt;
    if (qd.mode === 'sweep') {
      qd.x += qd.dir * (W + 260) / 1.5 * dt;
      qd.y = H * 0.5 + Math.sin(qd.t * 4) * 10;
      queenTrail();
      const half = qd.band / 2, reach = 60 * Math.max(0.7, G);
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        if (it.carried || Math.abs(it.y - qd.y) > half || Math.abs(it.x - qd.x) > reach) continue;
        if (it.kind === 'bad') { splat(it.x, it.y, it.f.color, 12); items.splice(i, 1); floatText(it.x, it.y - 22, 'SMASHED', '#ffd36b'); sfx.hit(); }
        else if (!it.suck) { it.suck = { t: 0, x0: it.x, y0: it.y }; if (it.bee) it.bee.tgt = null; }
      }
      if (qd.dir > 0 ? qd.x > W + 150 : qd.x < -150) qd = null;
      return;
    }
    if (qd.st === 'exit') {
      qd.x += Math.cos(qd.ang) * 900 * dt; qd.y += Math.sin(qd.ang) * 900 * dt; queenTrail();
      if (qd.x < -200 || qd.x > W + 200 || qd.y < -200 || qd.y > H + 200) qd = null;
      return;
    }
    if (qd.st === 'go') { // straight through the boss and out the other side
      const sp = 1500 * Math.max(0.7, G), tg = qd.tgt;
      qd.x += qd.vx * sp * dt; qd.y += qd.vy * sp * dt; queenTrail(2);
      if (!qd.hit && tg && fighting(tg) && Math.hypot(tg.x - qd.x, tg.y - qd.y) < 62 * bossK()) {
        qd.hit = true; shake = reduceMotion ? 0 : 8;
        for (let i = 0; i < 3; i++) splat(tg.x + rnd(-30, 30), tg.y + rnd(-30, 30), '#f2a516', 10);
        floatText(tg.x, tg.y - 95 * bossK(), 'ROYAL CHARGE', '#ffd36b');
        damageBoss(qd.dmg, tg);
        if (state !== 'play' || !qd) return;
      }
      if (qd.x < -110 || qd.x > W + 110 || qd.y < combBottom() - 60 || qd.y > H + 60 || qd.t > 1.3) {
        qd.left--;
        if (qd.left > 0 && phase === 'boss' && anyFighting()) { qd.st = 'enter'; qd.t = 0; qd.tgt = null; qd.x = clamp(qd.x, -90, W + 90); qd.y = clamp(qd.y, combBottom() + 40, H * 0.7); }
        else { qd.st = 'exit'; qd.ang = qd.x < W / 2 ? -2.2 : -0.9; }
      }
      return;
    }
    const tg = qd.tgt && fighting(qd.tgt) ? qd.tgt : (qd.tgt = queenTarget());
    if (!tg) {
      if (phase === 'boss' && bosses.some(b => b.mode === 'intro') && qd.t < 5) { qd.x += ((qd.x < W / 2 ? W * 0.08 : W * 0.92) - qd.x) * Math.min(1, dt * 5); return; } // wait for the boss to land
      qd.st = 'exit'; qd.ang = qd.x < W / 2 ? -2.2 : -0.9; return;
    }
    if (qd.st === 'enter') { // glide to her side of the screen, level with the boss
      const lx = qd.x < W / 2 ? W * 0.08 : W * 0.92, ly = clamp(tg.y + 20 * bossK(), combBottom() + 60, H * 0.6);
      qd.x += (lx - qd.x) * Math.min(1, dt * 6); qd.y += (ly - qd.y) * Math.min(1, dt * 6);
      qd.ang = Math.atan2(tg.y - qd.y, tg.x - qd.x); queenTrail();
      if (qd.t > 0.55) { qd.st = 'tele'; qd.t = 0; }
      return;
    }
    qd.ang = Math.atan2(tg.y - qd.y, tg.x - qd.x); // 'tele': the warning line, then the roar
    if (qd.t > 0.5) {
      const d = Math.hypot(tg.x - qd.x, tg.y - qd.y) || 1;
      qd.st = 'go'; qd.t = 0; qd.hit = false; qd.vx = (tg.x - qd.x) / d; qd.vy = (tg.y - qd.y) / d;
      sfx.roar(0.9);
    }
  }
  function updateBees(dt) {''')

# ---------- draw order ----------
rep("    drawBg(t);\n    for (const it of items) {", "    drawBg(t);\n    drawChat();\n    for (const it of items) {")
rep("    if (boss) drawBoss(boss, t);\n", "    for (const b of bosses) drawBoss(b, t);\n")
rep("    drawSwarm(t);\n", "    drawSwarm(t);\n    drawQueenFx(t);\n")
rep("    if (boss) { drawSpeech(boss); drawBossUI(boss); }", "    for (const b of bosses) drawSpeech(b);\n    for (const b of bosses) drawBossUI(b);")

# ---------- March catkins, swarm direction ----------
rep("    else if (a.part === 'pollen') {", "    else if (a.part === 'catkin') { ctx.beginPath(); ctx.ellipse(0, 0, 5.5, 2.3, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.55)'; for (let i = -1; i <= 1; i++) { circle(i * 2.6, -0.5, 0.9); ctx.fill(); } }\n    else if (a.part === 'pollen') {")
rep("    const dir = ev.side === 'L' ? -1 : 1, spreadX", "    const dir = ev.side === 'L' ? 1 : -1, spreadX")

open(p, 'w').write(s)
print('to5c ok')
