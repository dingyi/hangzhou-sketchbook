/* 程序化钢笔淡彩工具库：抖动墨线、水彩晕染、纸面、山水建筑构件。
   所有随机数带种子，同一页每次渲染一致。 */

export const W = 1760, H = 1240;
export const BX0 = 90, BY0 = 270, BW = 1580, BH = 700;
export const GX = BX0 + BW / 2;                 // 中缝
export const AX = BX0 + 36, AY = BY0 + 36;      // 画面区
export const AW = BW - 72, AH = BH - 72;

export const CJK = '"Kaiti SC","STKaiti","KaiTi","Noto Serif CJK SC","Noto Sans CJK SC",serif';

export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

export function makeSketch(ctx, seed) {
  const R = rng(seed);
  const j = (a) => (R() - 0.5) * a;
  const S = {};

  /* ---------- 墨线：两遍抖动，模拟钢笔 */
  S.line = (pts, { w = 1.5, col = '43,38,30', a = 0.82, jit = 1.4, passes = 2 } = {}) => {
    for (let p = 0; p < passes; p++) {
      const ww = p ? w * 0.55 : w, aa = p ? a * 0.38 : a, off = p ? 0.8 : 0;
      ctx.strokeStyle = `rgba(${col},${aa})`;
      ctx.lineWidth = ww; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      const q = pts.map(([x, y]) => [x + j(jit) + off, y + j(jit) + off]);
      ctx.moveTo(q[0][0], q[0][1]);
      for (let i = 1; i < q.length - 1; i++) {
        const mx = (q[i][0] + q[i + 1][0]) / 2, my = (q[i][1] + q[i + 1][1]) / 2;
        ctx.quadraticCurveTo(q[i][0], q[i][1], mx, my);
      }
      const l = q[q.length - 1];
      ctx.lineTo(l[0], l[1]); ctx.stroke();
    }
  };
  S.seg = (x1, y1, x2, y2, o = {}) => {
    const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / 26));
    const pts = [];
    for (let i = 0; i <= n; i++) pts.push([x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n]);
    S.line(pts, o);
  };
  S.curve = (x1, y1, cx, cy, x2, y2, o = {}) => {
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12, u = 1 - t;
      pts.push([u * u * x1 + 2 * u * t * cx + t * t * x2, u * u * y1 + 2 * u * t * cy + t * t * y2]);
    }
    S.line(pts, o);
  };

  /* ---------- 水彩：模糊多层晕染 + 边缘积色 */
  const smoothPath = (pts) => {
    ctx.beginPath();
    ctx.moveTo((pts[0][0] + pts[pts.length - 1][0]) / 2, (pts[0][1] + pts[pts.length - 1][1]) / 2);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
    }
    ctx.closePath();
  };
  S.poly = (pts, col, a, blur = 5) => {
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    ctx.save();
    ctx.filter = `blur(${blur}px)`;
    for (let l = 0; l < 3; l++) {
      const sc = 0.9 + l * 0.07;
      ctx.fillStyle = `rgba(${col},${a * 0.34})`;
      smoothPath(pts.map(([x, y]) => [cx + (x - cx) * sc + j(4), cy + (y - cy) * sc + j(4)]));
      ctx.fill();
    }
    ctx.restore();
    ctx.strokeStyle = `rgba(${col},${a * 0.4})`; ctx.lineWidth = 1.2;
    smoothPath(pts.map(([x, y]) => [x + j(2), y + j(2)]));
    ctx.stroke();
  };
  S.blobPts = (cx, cy, rx, ry, n = 16, irr = 0.24) => {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2, k = 1 + j(irr * 2);
      pts.push([cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k]);
    }
    return pts;
  };
  S.blob = (cx, cy, rx, ry, col, a, irr = 0.24, blur = 6) => S.poly(S.blobPts(cx, cy, rx, ry, 16, irr), col, a, blur);
  S.band = (x0, x1, y, h, col, a) => {
    const n = Math.max(3, Math.round((x1 - x0) / 300));
    for (let i = 0; i < n; i++) {
      const cx = x0 + (x1 - x0) * (i + 0.5) / n;
      S.blob(cx, y + j(h * 0.3), (x1 - x0) / n * 0.78, h * (0.5 + R() * 0.3), col, a, 0.34, 14);
    }
  };

  /* ---------- 山 */
  S.hills = (x0, x1, base, amp, col, a, ph = 0) => {
    const pts = [], n = 26;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const y = base - amp * (0.42 + 0.58 * Math.abs(Math.sin(t * 5.1 + ph) * 0.7 + Math.sin(t * 11.7 + ph * 2) * 0.3)) * (0.8 + R() * 0.3);
      pts.push([x0 - 60 + (x1 - x0 + 120) * t, y]);
    }
    const fill = [...pts, [x1 + 60, BY0 + BH + 60], [x0 - 60, BY0 + BH + 60]];
    ctx.save();
    ctx.filter = 'blur(7px)';
    ctx.fillStyle = `rgba(${col},${a * 0.8})`;
    ctx.beginPath();
    fill.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.closePath(); ctx.fill();
    ctx.restore();
    S.line(pts.filter((_, i) => i % 2 === 0), { w: 1.1, a: a * 1.5, col, jit: 1 });
    return pts;
  };

  /* ---------- 水 */
  S.water = (x0, x1, y0, y1, col = '110,130,140', a = 0.16) => {
    S.band(x0, x1, (y0 + y1) / 2, (y1 - y0) * 0.8, col, a);
    const n = Math.round((y1 - y0) / 7);
    for (let i = 0; i < n; i++) {
      const y = y0 + (y1 - y0) * (i / n) + j(3);
      const len = 26 + R() * 90 * (0.4 + i / n), x = x0 + R() * (x1 - x0 - len);
      S.curve(x, y, x + len / 2, y - 1.6 - R() * 1.6, x + len, y, { w: 1, a: 0.05 + R() * 0.11, col: '70,90,100', passes: 1, jit: 0.6 });
    }
  };
  S.refl = (x, y0, len, col = '70,80,86', a = 0.22, w = 2) => {
    let y = y0;
    while (y < y0 + len) {
      const seg = 6 + R() * 12;
      S.seg(x + j(5), y, x + j(5), Math.min(y + seg, y0 + len), { w, a: a * (1 - (y - y0) / len * 0.7), col, passes: 1, jit: 1.2 });
      y += seg + 3 + R() * 6;
    }
  };

  /* ---------- 树 */
  S.willow = (x, y, h, s = 1) => {
    S.curve(x, y, x + 6 * s, y - h * 0.55, x + 14 * s, y - h, { w: 2.6 * s, a: 0.8 });
    S.curve(x + 5 * s, y, x + 12 * s, y - h * 0.5, x + 19 * s, y - h * 0.96, { w: 1.4 * s, a: 0.5 });
    const topX = x + 15 * s, topY = y - h;
    S.blob(topX + 8 * s, topY + h * 0.22, 46 * s, h * 0.34, '120,140,100', 0.14);
    for (let b = 0; b < 9; b++) {
      const bx = topX + j(56 * s), len = h * (0.42 + R() * 0.4), sway = (10 + R() * 26) * s;
      S.curve(bx, topY + j(14 * s), bx + sway * 0.4, topY + len * 0.6, bx + sway, topY + len, { w: 1 * s, a: 0.5, col: '70,88,60', passes: 1 });
      for (let t = 0.15; t < 0.95; t += 0.1) {
        const px = bx + sway * t * t, py = topY + len * t;
        S.seg(px, py, px + 4 * s, py + 5 * s, { w: 0.9 * s, a: 0.42, col: '70,88,60', passes: 1, jit: 0.5 });
      }
    }
  };
  S.tree = (x, y, s, col = '100,120,86') => {
    S.seg(x, y, x + j(4), y - 34 * s, { w: 2.2 * s, a: 0.75 });
    S.curve(x, y - 20 * s, x - 12 * s, y - 30 * s, x - 16 * s, y - 40 * s, { w: 1.3 * s, a: 0.6 });
    for (let i = 0; i < 3; i++) S.blob(x + j(20 * s), y - (42 + i * 12) * s, (26 - i * 5) * s, (18 - i * 3) * s, col, 0.2);
    for (let i = 0; i < 7; i++) {
      const a0 = R() * Math.PI * 2, r0 = 16 * s * R();
      S.curve(x + Math.cos(a0) * r0, y - 46 * s + Math.sin(a0) * r0 * 0.7,
        x + j(30 * s), y - 52 * s + j(16 * s), x + j(34 * s), y - 44 * s + j(20 * s),
        { w: 0.9 * s, a: 0.4, passes: 1 });
    }
  };
  S.pine = (x, y, s) => {
    S.curve(x, y, x - 4 * s, y - 40 * s, x + 6 * s, y - 78 * s, { w: 2.4 * s, a: 0.8 });
    for (let i = 0; i < 4; i++) {
      const ly = y - (34 + i * 15) * s, lw = (34 - i * 7) * s, lx = x + 4 * s + j(8 * s);
      S.blob(lx, ly, lw, 8 * s, '70,92,70', 0.26);
      S.seg(lx - lw, ly + 3 * s, lx + lw, ly + 2 * s, { w: 1 * s, a: 0.5, col: '50,66,50', passes: 1 });
    }
  };

  /* ---------- 建筑构件 */
  S.roof = (cx, y, w, h, col = '70,64,56') => {
    // 中式屋面：正脊 + 两坡凹曲 + 起翘
    const x0 = cx - w / 2, x1 = cx + w / 2;
    S.curve(x0, y - h * 0.16, x0 + w * 0.16, y + h * 0.1, cx, y + h * 0.14, { w: 1.8, a: 0.85, col });
    S.curve(cx, y + h * 0.14, x1 - w * 0.16, y + h * 0.1, x1, y - h * 0.16, { w: 1.8, a: 0.85, col });
    S.curve(x0, y - h * 0.16, cx - w * 0.2, y - h * 0.92, cx, y - h, { w: 1.8, a: 0.85, col });
    S.curve(cx, y - h, cx + w * 0.2, y - h * 0.92, x1, y - h * 0.16, { w: 1.8, a: 0.85, col });
    S.seg(cx - w * 0.16, y - h * 0.98, cx + w * 0.16, y - h * 0.98, { w: 2.2, a: 0.85, col });
    S.poly([[x0 + 4, y - h * 0.1], [cx, y - h * 0.94], [x1 - 4, y - h * 0.1], [cx, y + h * 0.1]], col, 0.16);
    for (let i = 1; i < 6; i++) {
      const t = i / 6;
      S.seg(cx - w * 0.16 + (x0 + w * 0.16 - (cx - w * 0.16)) * t, y - h * 0.96 + h * 0.8 * t,
        cx + (x0 + w * 0.1 - cx) * t, y + h * 0.08, { w: 0.8, a: 0.3, col, passes: 1 });
      S.seg(cx + w * 0.16 + (x1 - w * 0.16 - (cx + w * 0.16)) * t, y - h * 0.96 + h * 0.8 * t,
        cx + (x1 - w * 0.1 - cx) * t, y + h * 0.08, { w: 0.8, a: 0.3, col, passes: 1 });
    }
  };
  S.pagoda = (cx, baseY, w, tiers, tierH, { slender = false, col = '66,58,48', wash = '150,120,90', glow = false } = {}) => {
    let y = baseY, ww = w;
    S.seg(cx - ww * 0.62, baseY, cx + ww * 0.62, baseY, { w: 2, a: 0.8, col });
    for (let i = 0; i < tiers; i++) {
      const bh = tierH * (slender ? 0.62 : 0.78), rh = tierH * (slender ? 0.3 : 0.5);
      const bw = ww * (slender ? 0.5 : 0.66);
      S.poly([[cx - bw / 2, y], [cx + bw / 2, y], [cx + bw / 2, y - bh], [cx - bw / 2, y - bh]], wash, 0.2);
      S.seg(cx - bw / 2, y, cx - bw / 2, y - bh, { w: 1.5, a: 0.75, col });
      S.seg(cx + bw / 2, y, cx + bw / 2, y - bh, { w: 1.5, a: 0.75, col });
      if (!slender) {
        S.seg(cx - bw / 2, y - bh * 0.42, cx + bw / 2, y - bh * 0.42, { w: 1, a: 0.5, col, passes: 1 });
        for (let k = -1; k <= 1; k++) {
          const wx = cx + k * bw * 0.28;
          if (glow) { ctx.fillStyle = 'rgba(232,180,96,.55)'; ctx.fillRect(wx - 3, y - bh * 0.72, 6, bh * 0.34); }
          S.seg(wx, y - bh * 0.72, wx, y - bh * 0.36, { w: 1, a: 0.55, col, passes: 1 });
        }
      }
      const ry = y - bh;
      if (slender) {
        // 细塔：收窄塔身 + 每层短檐翘角
        S.poly([[cx - bw / 2, y], [cx + bw / 2, y], [cx + bw * 0.42, ry], [cx - bw * 0.42, ry]], wash, 0.22, 2);
        S.seg(cx - bw / 2, y, cx - bw * 0.42, ry, { w: 1.2, a: 0.7, col });
        S.seg(cx + bw / 2, y, cx + bw * 0.42, ry, { w: 1.2, a: 0.7, col });
        S.curve(cx - ww / 2, ry + 2, cx - ww * 0.2, ry - rh * 0.5, cx, ry - rh * 0.62, { w: 1.4, a: 0.8, col });
        S.curve(cx, ry - rh * 0.62, cx + ww * 0.2, ry - rh * 0.5, cx + ww / 2, ry + 2, { w: 1.4, a: 0.8, col });
        S.seg(cx - ww / 2, ry + 2, cx - ww * 0.44, ry - 1, { w: 1.2, a: 0.7, col, passes: 1 });
        S.seg(cx + ww / 2, ry + 2, cx + ww * 0.44, ry - 1, { w: 1.2, a: 0.7, col, passes: 1 });
      } else {
        S.roof(cx, ry, ww, rh, col);
      }
      y = ry - rh * (slender ? 0.5 : 0.62);
      ww *= slender ? 0.9 : 0.84;
    }
    S.seg(cx, y + 4, cx, y - tierH * 0.7, { w: 1.6, a: 0.8, col });
    S.blob(cx, y - tierH * 0.74, 3.4, 3.4, col, 0.6, 0.1);
  };
  S.pavilion = (cx, baseY, w, h, col = '66,58,48') => {
    const pw = w * 0.72, ph = h * 0.42;
    S.seg(cx - w * 0.6, baseY, cx + w * 0.6, baseY, { w: 2, a: 0.8, col });
    S.seg(cx - w * 0.55, baseY - 5, cx + w * 0.55, baseY - 5, { w: 1.2, a: 0.5, col, passes: 1 });
    for (const k of [-0.5, -0.17, 0.17, 0.5]) {
      S.seg(cx + pw * k, baseY - 5, cx + pw * k, baseY - ph, { w: 1.7, a: 0.8, col });
    }
    S.seg(cx - pw * 0.5, baseY - ph * 0.4, cx + pw * 0.5, baseY - ph * 0.4, { w: 1.1, a: 0.55, col, passes: 1 });
    S.roof(cx, baseY - ph, w, h * 0.5, col);
    S.seg(cx, baseY - ph - h * 0.5, cx, baseY - ph - h * 0.62, { w: 1.5, a: 0.8, col });
    S.blob(cx, baseY - ph - h * 0.66, 3, 3, col, 0.6, 0.1);
  };
  S.stoneBridge = (cx, deckY, w, h, arches, col = '76,68,58') => {
    const x0 = cx - w / 2, x1 = cx + w / 2;
    const deck = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      deck.push([x0 + w * t, deckY - h * 0.34 * Math.sin(Math.PI * t)]);
    }
    S.line(deck, { w: 2.2, a: 0.85, col });
    S.line(deck.map(([x, y]) => [x, y + 7]), { w: 1.3, a: 0.6, col });
    // 栏杆
    for (let i = 0; i <= 14; i++) {
      const t = i / 14, x = x0 + w * t, y = deckY - h * 0.34 * Math.sin(Math.PI * t);
      S.seg(x, y, x, y - 13, { w: 1.2, a: 0.7, col, passes: 1 });
      S.blob(x, y - 15, 2.2, 2.2, col, 0.5, 0.1);
    }
    S.line(deck.map(([x, y]) => [x, y - 14]), { w: 1.2, a: 0.65, col });
    // 拱券
    const aw = w / (arches * 1.6);
    for (let i = 0; i < arches; i++) {
      const t = (i + 0.5) / arches, ax = x0 + w * t;
      const r = aw * (i === Math.floor(arches / 2) && arches % 2 ? 0.62 : 0.44);
      const wy = deckY + h * 0.5;
      const pts = [];
      for (let k = 0; k <= 12; k++) {
        const a = Math.PI * (1 - k / 12);
        pts.push([ax + Math.cos(a) * r, wy - Math.sin(a) * r * 1.05]);
      }
      S.line(pts, { w: 1.8, a: 0.8, col });
      S.line(pts.map(([x, y]) => [x + (x - ax) * 0.08, y - 4]), { w: 1, a: 0.4, col, passes: 1 });
      // 倒影
      S.line(pts.map(([x, y]) => [x + j(4), wy + (wy - y) * 0.55 + 4]), { w: 1.2, a: 0.2, col, passes: 1, jit: 2.4 });
    }
    // 桥身石缝
    S.seg(x0, deckY + h * 0.5, x0 + w * 0.06, deckY + 4, { w: 1.4, a: 0.6, col });
    S.seg(x1, deckY + h * 0.5, x1 - w * 0.06, deckY + 4, { w: 1.4, a: 0.6, col });
    for (let i = 0; i < 10; i++) {
      const x = x0 + w * (0.1 + R() * 0.8), y = deckY + j(h * 0.2);
      S.seg(x, y, x + 12 + R() * 16, y + j(3), { w: 0.8, a: 0.25, col, passes: 1 });
    }
    S.poly([[x0, deckY + 4], [x1, deckY + 4], [x1, deckY + h * 0.5], [x0, deckY + h * 0.5]], '150,136,112', 0.12);
  };
  S.boat = (x, y, s, canopy = true) => {
    S.poly([[x - 34 * s, y - 6 * s], [x - 20 * s, y + 4 * s], [x + 22 * s, y + 4 * s], [x + 38 * s, y - 8 * s], [x + 26 * s, y - 2 * s], [x - 24 * s, y - 2 * s]], '96,84,64', 0.24, 2);
    S.curve(x - 34 * s, y - 6 * s, x, y + 10 * s, x + 38 * s, y - 8 * s, { w: 1.8, a: 0.8 });
    S.curve(x - 30 * s, y - 3 * s, x, y + 5 * s, x + 33 * s, y - 5 * s, { w: 1, a: 0.45, passes: 1 });
    if (canopy) {
      S.curve(x - 16 * s, y - 4 * s, x, y - 24 * s, x + 16 * s, y - 4 * s, { w: 1.5, a: 0.75 });
      S.poly([[x - 16 * s, y - 4 * s], [x, y - 22 * s], [x + 16 * s, y - 4 * s]], '90,80,64', 0.26, 2);
      S.seg(x - 10 * s, y - 12 * s, x + 10 * s, y - 12 * s, { w: 0.8, a: 0.4, passes: 1 });
    } else {
      S.seg(x + 10 * s, y - 4 * s, x + 12 * s, y - 18 * s, { w: 1.3, a: 0.7, passes: 1 });
      S.blob(x + 12 * s, y - 21 * s, 2.6 * s, 3 * s, '50,44,36', 0.6, 0.1, 1);
      S.seg(x + 14 * s, y - 14 * s, x + 26 * s, y + 2 * s, { w: 1, a: 0.55, passes: 1 });
    }
    S.refl(x, y + 8 * s, 16 * s, '70,80,86', 0.18, 1.4 * s);
  };
  S.lantern = (x, y, s, glow = false) => {
    if (glow) S.blob(x, y, 13 * s, 13 * s, '226,150,80', 0.22);
    S.blob(x, y, 7 * s, 8.4 * s, '188,74,52', 0.5, 0.12);
    S.seg(x - 4 * s, y - 8.4 * s, x + 4 * s, y - 8.4 * s, { w: 1.2, a: 0.7, col: '120,50,36', passes: 1 });
    S.seg(x - 4 * s, y + 8.4 * s, x + 4 * s, y + 8.4 * s, { w: 1.2, a: 0.7, col: '120,50,36', passes: 1 });
    S.seg(x, y + 8.4 * s, x, y + 13 * s, { w: 1, a: 0.6, col: '150,60,40', passes: 1 });
    S.curve(x - 5 * s, y - 3 * s, x, y - 1 * s, x + 5 * s, y - 3 * s, { w: 0.8, a: 0.4, col: '120,50,36', passes: 1 });
  };
  S.figure = (x, y, s, col = '52,46,38') => {
    S.blob(x, y - 15 * s, 2.6 * s, 2.8 * s, col, 0.65, 0.1);
    S.curve(x, y - 12 * s, x + j(3 * s), y - 6 * s, x + j(2 * s), y, { w: 1.8 * s, a: 0.7, col, passes: 1 });
    S.seg(x, y - 8 * s, x - 3.4 * s, y - 3 * s, { w: 1 * s, a: 0.55, col, passes: 1 });
    S.seg(x, y - 8 * s, x + 3.4 * s, y - 3 * s, { w: 1 * s, a: 0.55, col, passes: 1 });
  };
  S.birds = (x, y, n, s = 1) => {
    for (let i = 0; i < n; i++) {
      const bx = x + i * 26 * s + j(10), by = y + j(16), bs = (5 - i * 0.6) * s;
      S.curve(bx - bs, by, bx - bs / 2, by - bs * 0.9, bx, by, { w: 1.1, a: 0.6, passes: 1 });
      S.curve(bx, by, bx + bs / 2, by - bs * 0.9, bx + bs, by, { w: 1.1, a: 0.6, passes: 1 });
    }
  };

  /* ---------- 莲 */
  S.lotusLeaf = (cx, cy, r, rot = 0, col = '96,128,88') => {
    const pts = [], n = 22, notch = rot;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * Math.PI * 2;
      const d = Math.abs(((t - notch + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      const k = d < 0.5 ? 0.25 + d : 1 + j(0.12);
      pts.push([cx + Math.cos(t) * r * k, cy + Math.sin(t) * r * k * 0.82]);
    }
    S.poly(pts, col, 0.26);
    S.line(pts, { w: 1.3, a: 0.55, col: '60,86,56' });
    for (let i = 0; i < 9; i++) {
      const t = notch + 0.6 + (i / 9) * (Math.PI * 2 - 1.2);
      S.seg(cx, cy, cx + Math.cos(t) * r * 0.86, cy + Math.sin(t) * r * 0.7, { w: 0.8, a: 0.3, col: '60,86,56', passes: 1 });
    }
  };
  S.lotusFlower = (x, y, s, bud = false) => {
    const petals = bud ? 4 : 7;
    for (let i = 0; i < petals; i++) {
      const t = bud ? -0.5 + i * 0.34 : -1.5 + i * (3 / (petals - 1));
      const px = x + Math.sin(t) * 10 * s, py = y - Math.cos(t) * 4 * s;
      const tipX = x + Math.sin(t) * (bud ? 8 : 20) * s, tipY = y - (bud ? 30 : 26) * s + Math.abs(t) * 6 * s;
      const pts = [];
      for (let k = 0; k <= 10; k++) {
        const u = k / 10;
        pts.push([px + (tipX - px) * u - Math.sin(u * Math.PI) * 6 * s * Math.sign(t || 1), py + (tipY - py) * u]);
      }
      for (let k = 10; k >= 0; k--) {
        const u = k / 10;
        pts.push([px + (tipX - px) * u + Math.sin(u * Math.PI) * 6 * s * Math.sign(t || 1), py + (tipY - py) * u]);
      }
      S.poly(pts, '214,138,150', 0.3);
      S.line(pts, { w: 1, a: 0.5, col: '160,84,100', passes: 1 });
      S.seg(tipX, tipY, tipX + j(2), tipY + 5 * s, { w: 1.4, a: 0.5, col: '190,100,116', passes: 1 });
    }
    if (!bud) { ctx.fillStyle = 'rgba(206,170,80,.7)'; ctx.beginPath(); ctx.arc(x, y - 8 * s, 4 * s, 0, 7); ctx.fill(); }
    S.seg(x, y, x + j(4), y + 34 * s, { w: 1.6, a: 0.65, col: '80,100,70' });
  };
  S.koi = (x, y, s, rot, col = '196,84,52') => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const body = [[-16 * s, 0], [-8 * s, -5 * s], [6 * s, -4 * s], [14 * s, 0], [6 * s, 4 * s], [-8 * s, 5 * s]];
    S.poly(body, col, 0.4);
    S.line([...body, body[0]], { w: 1, a: 0.45, col: '120,60,40', passes: 1 });
    S.poly([[-16 * s, 0], [-26 * s, -6 * s], [-23 * s, 0], [-26 * s, 6 * s]], col, 0.3);
    S.blob(2 * s, -1 * s, 4 * s, 2.6 * s, '240,236,226', 0.5, 0.2);
    ctx.restore();
  };
  S.stoneLantern3 = (x, y, s, glow = false) => {
    // 三潭印月石塔：葫芦身 + 五孔
    S.blob(x, y, 16 * s, 4.6 * s, '120,112,98', 0.3, 0.1);
    S.line(S.blobPts(x, y, 16 * s, 4.6 * s, 12, 0.08), { w: 1.2, a: 0.6, passes: 1 });
    const by = y - 20 * s;
    S.poly(S.blobPts(x, by, 13 * s, 15 * s, 16, 0.06), '136,128,112', 0.26);
    S.line(S.blobPts(x, by, 13 * s, 15 * s, 16, 0.06), { w: 1.4, a: 0.7 });
    for (let i = 0; i < 5; i++) {
      const t = -0.9 + i * 0.45, hx = x + Math.sin(t) * 9 * s, hy = by + Math.cos(t) * 3 * s;
      if (glow) { ctx.fillStyle = 'rgba(236,190,110,.75)'; ctx.beginPath(); ctx.arc(hx, hy, 2.6 * s, 0, 7); ctx.fill(); }
      ctx.strokeStyle = 'rgba(50,44,36,.7)'; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.arc(hx, hy, 2.6 * s, 0, 7); ctx.stroke();
    }
    S.blob(x, by - 16 * s, 8 * s, 3 * s, '120,112,98', 0.3, 0.1);
    S.curve(x - 8 * s, by - 16 * s, x, by - 27 * s, x + 8 * s, by - 16 * s, { w: 1.3, a: 0.7 });
    S.seg(x, by - 25 * s, x, by - 31 * s, { w: 1.3, a: 0.7, passes: 1 });
    S.blob(x, by - 33 * s, 2.6 * s, 2.6 * s, '90,82,70', 0.5, 0.1);
    S.refl(x, y + 6 * s, 30 * s, '70,80,86', 0.22, 1.6 * s);
    if (glow) S.refl(x, y + 6 * s, 22 * s, '210,160,90', 0.3, 1.2 * s);
  };

  /* ---------- 文字与印章 */
  S.vtext = (text, x, y, size, col = '52,46,38', gap = 1.22) => {
    ctx.fillStyle = `rgba(${col},.82)`;
    ctx.font = `${size}px ${CJK}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    [...text].forEach((ch, i) => ctx.fillText(ch, x + j(1.2), y + i * size * gap + j(1.2)));
  };
  S.caps = (text, x, y, size, col = '90,74,54', tracking = 0.22) => {
    ctx.fillStyle = `rgba(${col},.8)`;
    ctx.font = `${size}px Newsreader, Georgia, serif`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    let cx = x;
    for (const ch of text) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + size * tracking; }
    return cx - x;
  };
  S.label = (text, x, y, size, col = '60,52,42') => {
    ctx.fillStyle = `rgba(${col},.85)`;
    ctx.font = `${size}px ${CJK}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  };
  S.seal = (x, y, s, text) => {
    const pts = S.blobPts(x, y, s / 2, s / 2, 10, 0.06).map(([px, py]) => [x + (px - x) * 1.32, y + (py - y) * 1.32]);
    ctx.fillStyle = 'rgba(178,60,40,.85)';
    ctx.beginPath();
    pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py));
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(248,242,230,.92)';
    ctx.font = `${s * (text.length > 1 ? 0.4 : 0.62)}px ${CJK}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (text.length === 2) {
      ctx.fillText(text[0], x, y - s * 0.21);
      ctx.fillText(text[1], x, y + s * 0.23);
    } else ctx.fillText(text, x, y + 1);
  };

  /* ---------- 纸面与装帧 */
  S.paper = () => {
    const r = 16;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(BX0, BY0, BW, BH, r);
    ctx.clip();
    ctx.fillStyle = '#f8f3e7'; ctx.fillRect(BX0, BY0, BW, BH);
    ctx.fillStyle = 'rgba(214,196,160,.07)'; ctx.fillRect(BX0, BY0, BW / 2, BH);
    // 纤维
    for (let i = 0; i < 3200; i++) {
      ctx.fillStyle = `rgba(${120 + R() * 60},${104 + R() * 50},${76 + R() * 40},${0.02 + R() * 0.035})`;
      ctx.fillRect(BX0 + R() * BW, BY0 + R() * BH, 1 + R() * 1.6, 1 + R() * 1.2);
    }
    for (let i = 0; i < 90; i++) {
      const x = BX0 + R() * BW, y = BY0 + R() * BH, a = R() * Math.PI;
      ctx.strokeStyle = `rgba(150,130,96,${0.03 + R() * 0.04})`; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * (6 + R() * 14), y + Math.sin(a) * 3); ctx.stroke();
    }
    // 中缝
    const g = ctx.createLinearGradient(GX - 34, 0, GX + 34, 0);
    g.addColorStop(0, 'rgba(96,76,48,0)');
    g.addColorStop(0.5, 'rgba(96,76,48,.2)');
    g.addColorStop(1, 'rgba(96,76,48,0)');
    ctx.fillStyle = g; ctx.fillRect(GX - 34, BY0, 68, BH);
    ctx.strokeStyle = 'rgba(70,56,36,.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(GX, BY0 + 4); ctx.lineTo(GX, BY0 + BH - 4); ctx.stroke();
    for (const s of [-1, 1]) {
      const hg = ctx.createLinearGradient(GX + s * 10, 0, GX + s * 60, 0);
      hg.addColorStop(0, 'rgba(255,252,242,.24)'); hg.addColorStop(1, 'rgba(255,252,242,0)');
      ctx.fillStyle = hg; ctx.fillRect(Math.min(GX + s * 10, GX + s * 60), BY0, 50, BH);
    }
    ctx.restore();
    // 叠页边
    for (let i = 1; i <= 5; i++) {
      const o = i * 2.6;
      ctx.strokeStyle = `rgba(140,118,84,${0.4 - i * 0.06})`; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(BX0 - o + 2, BY0 + 10 + i * 2);
      ctx.quadraticCurveTo(BX0 - o - 1, BY0 + BH / 2, BX0 - o + 2, BY0 + BH - 8 - i);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(BX0 + BW + o - 2, BY0 + 10 + i * 2);
      ctx.quadraticCurveTo(BX0 + BW + o + 1, BY0 + BH / 2, BX0 + BW + o - 2, BY0 + BH - 8 - i);
      ctx.stroke();
    }
    for (let i = 1; i <= 3; i++) {
      ctx.strokeStyle = `rgba(140,118,84,${0.32 - i * 0.08})`; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(BX0 + 14, BY0 + BH + i * 2.4);
      ctx.quadraticCurveTo(GX, BY0 + BH + i * 2.4 + 2, BX0 + BW - 14, BY0 + BH + i * 2.4);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(120,100,70,.4)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.roundRect(BX0, BY0, BW, BH, r); ctx.stroke();
  };

  S.finish = (title, place, date, sealText) => {
    S.vtext(title, BX0 + 52, BY0 + 64, 40);
    S.vtext(place, BX0 + 92, BY0 + 70, 19, '96,82,62', 1.3);
    S.seal(BX0 + BW - 64, BY0 + BH - 88, 44, sealText);
    const t = `HANGZHOU · ${date}`;
    ctx.font = '13px Newsreader, Georgia, serif';
    const w = [...t].reduce((s, ch) => s + ctx.measureText(ch).width + 13 * 0.22, 0);
    S.caps(t, BX0 + BW - 40 - w, BY0 + BH - 42, 13);
  };

  return S;
}