// A bot that plays a bit like a person: it re-plans every 0.2 s (reaction time), moves the spoon at most 2.5 screen
// widths a second, chases honey, and dodges fakes and attacks it can see coming.
window.dodge = (frames, opts = {}) => {
  const replan = opts.replan || 12, widthsPerSec = opts.speed || 2.5, margin = opts.margin || 1;
  let tx = null;
  for (let f = 0; f < frames; f++) {
    const T = __hg.threats(); if (!T) break;
    if (f % replan === 0 || tx === null) {
      const N = 56, xs = []; for (let i = 0; i < N; i++) xs.push(20 + (T.W - 40) * i / (N - 1));
      const score = xs.map(() => 0), hitR = T.S * 0.45 * margin;
      for (const h of T.honey) { const dt = (T.sy - h.y) / Math.max(30, h.vy); if (dt < 0 || dt > 1.6) continue; xs.forEach((x, i) => { if (Math.abs(x - h.x) < T.S * 0.55) score[i] += h.v * (1.7 - dt); }); }
      for (const q of T.fakes) { const dt = (T.sy - q.y) / Math.max(30, q.vy); if (dt < -0.15 || dt > 1.1) continue; const span = q.amp + q.r * 0.6 + hitR; xs.forEach((x, i) => { if (Math.abs(x - q.base) < span) score[i] -= 30 * (1.25 - dt); }); }
      for (const p of T.proj) {
        if (p.harmless) {
          const col = p.k === 'goyGun' ? 0 : p.half || { beam: 14, rope: 24, hammer: 30, chop: 24 }[p.k];
          if (col) { const half = col * p.G + hitR * 0.7; xs.forEach((x, i) => { if (Math.abs(x - p.x) < half) score[i] -= 60; }); }
          else if (p.k === 'bar') { const half = p.w / 2 + hitR * 0.7; xs.forEach((x, i) => { if (Math.abs(x - p.x) < half) score[i] -= 60; }); }
          else if (p.k === 'ring') xs.forEach((x, i) => { const d = Math.hypot(x - p.x, T.sy - p.y); if (d < p.R + 14 + T.S * 0.3) score[i] -= 45; });
          else if (p.k === 'knight' && p.st === 'tele' && Math.abs(p.ty - p.floor) < p.c * 0.5) xs.forEach((x, i) => { if (Math.abs(x - p.tx) < p.c * 0.5 + T.S * 0.25) score[i] -= 60; });
          else if (p.k === 'goyGun' && p.ang !== undefined && !(p.fired && p.t > p.tele + p.on)) { // where the aim line crosses the spoon's row
            const c = Math.cos(p.ang), sn = Math.sin(p.ang);
            if (Math.abs(sn) > 0.15) { const xl = p.px + (T.sy - p.py) * c / sn, half = (p.half * p.G + hitR * 0.7) / Math.abs(sn); xs.forEach((x, i) => { if (Math.abs(x - xl) < half) score[i] -= 60; }); }
          }
          else if (p.k === 'tower5g') xs.forEach((x, i) => { if (Math.hypot(x - p.x, T.sy - p.cy) < p.R + 12 * p.G + T.S * 0.3) score[i] -= 45; });
          else if (p.k === 'belt') xs.forEach((x, i) => { if (Math.abs(x - p.mx) < 40 * p.G + T.S * 0.3) score[i] -= 50; });
          continue;
        }
        if (p.safe) continue;
        let x = p.x, y = p.y, vx = p.vx, vy = p.vy;
        const bnc = p.k === 'goyWord' ? 0.84 : p.k === 'pill' ? 0.7 : 0; let nb = 0, was = false; // bouncers: it sees the bounce coming, like a person would
        for (let s2 = 1; s2 <= 24; s2++) {
          const t = s2 * 0.05; if (t < p.delay) continue; vy += p.g * 0.05; x += vx * 0.05; y += vy * 0.05;
          if (bnc && y > T.H - 14 && vy > (p.k === 'goyWord' ? 420 : 0) && nb < (p.k === 'goyWord' && T.W >= 560 ? 4 : 3)) { y = T.H - 14; vy = -Math.abs(vy) * bnc; vx *= p.k === 'pill' ? 0.45 : 0.85; nb++; }
          const near = Math.abs(y - T.sy) < 26 + p.r;
          if (near && !was) { xs.forEach((xx, i) => { if (Math.abs(xx - x) < p.r * 0.7 + hitR) score[i] -= 50 * (1.3 - t); }); if (!bnc) break; }
          was = near;
        }
      }
      let best = 0, bs = -1e9;
      const prev = window.__dodgeTx; // sticks with the way it already chose when it's just as good, like a person would, instead of dithering
      xs.forEach((x, i) => { const sc = score[i] - Math.abs(x - T.sx) * 0.004 - (prev != null && Math.abs(prev - T.sx) < T.W * 0.5 ? Math.abs(x - prev) * 0.003 : 0); if (sc > bs) { bs = sc; best = i; } });
      tx = xs[best]; window.__dodgeTx = tx;
    }
    const maxStep = widthsPerSec * T.W / 60;
    __hg.spoonTo(T.sx + Math.max(-maxStep, Math.min(maxStep, tx - T.sx)));
    __hg.step(1);
  }
};
