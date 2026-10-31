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
          const col = { beam: 14, rope: 24, hammer: 30, chop: 24 }[p.k];
          if (col) { const half = col * p.G + hitR * 0.7; xs.forEach((x, i) => { if (Math.abs(x - p.x) < half) score[i] -= 60; }); }
          else if (p.k === 'bar') { const half = p.w / 2 + hitR * 0.7; xs.forEach((x, i) => { if (Math.abs(x - p.x) < half) score[i] -= 60; }); }
          else if (p.k === 'ring') xs.forEach((x, i) => { const d = Math.hypot(x - p.x, T.sy - p.y); if (d < p.R + 14 + T.S * 0.3) score[i] -= 45; });
          else if (p.k === 'knight' && p.st === 'tele' && Math.abs(p.ty - p.floor) < p.c * 0.5) xs.forEach((x, i) => { if (Math.abs(x - p.tx) < p.c * 0.5 + T.S * 0.25) score[i] -= 60; });
          else if (p.k === 'belt') xs.forEach((x, i) => { if (Math.abs(x - p.mx) < 40 * p.G + T.S * 0.3) score[i] -= 50; });
          continue;
        }
        if (p.safe) continue;
        let x = p.x, y = p.y, vx = p.vx, vy = p.vy;
        for (let s2 = 1; s2 <= 24; s2++) { const t = s2 * 0.05; if (t < p.delay) continue; vy += p.g * 0.05; x += vx * 0.05; y += vy * 0.05; if (Math.abs(y - T.sy) < 26 + p.r) { xs.forEach((xx, i) => { if (Math.abs(xx - x) < p.r * 0.7 + hitR) score[i] -= 50 * (1.3 - t); }); break; } }
      }
      let best = 0, bs = -1e9;
      xs.forEach((x, i) => { const sc = score[i] - Math.abs(x - T.sx) * 0.004; if (sc > bs) { bs = sc; best = i; } });
      tx = xs[best];
    }
    const maxStep = widthsPerSec * T.W / 60;
    __hg.spoonTo(T.sx + Math.max(-maxStep, Math.min(maxStep, tx - T.sx)));
    __hg.step(1);
  }
};
