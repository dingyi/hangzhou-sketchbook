/* ink.js —— 手绘线稿引擎。
   所有画面都是「墨线 + 淡水彩 + 手写题字」三层：
   - 墨线用 LineSegments2（像素级线宽），顶点带静态手抖 + 低频 boil（线条呼吸）
   - 水彩是程序生成的软边晕染贴图
   - 题字用 2D canvas 写好后贴成平面，快照与实时画面完全一致 */
import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

export const PALETTE = {
  paper: '#f4efe3',
  paperDeep: '#ece5d4',
  ink: '#2b3238',
  inkSoft: '#4a5560',
  celadon: '#6f9484',
  lake: '#7fa396',
  hillBlue: '#54718c',
  amber: '#d9a441',
  seal: '#b5432e',
  willow: '#7c9a62',
  lotus: '#c4838a',
};

export const WORLD = { w: 20, h: 14.1, gutter: 0 };
const PX_PER_UNIT = 112; // 题字贴图分辨率
const WIDTHS = [3.0, 1.9, 1.3]; // 浓 / 中 / 淡 三档笔
const SUBDIV = 0.34;

function fract(n) { return n - Math.floor(n); }
function hash3(x, y, z, s) {
  return fract(Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + s * 269.5) * 43758.5453);
}
function q(v) { return Math.round(v * 512); }

const _c = new THREE.Color();
const _paper = new THREE.Color(PALETTE.paper);
function inkColor(hex, opacity, density, out) {
  _c.set(hex);
  const k = Math.max(0, Math.min(1, opacity * density));
  out[0] = _paper.r + (_c.r - _paper.r) * k;
  out[1] = _paper.g + (_c.g - _paper.g) * k;
  out[2] = _paper.b + (_c.b - _paper.b) * k;
}

/* --------------------------------------------------------------- Ink */
export class Ink {
  constructor({ boilAmp = 0.02, staticAmp = 0.016, seed = 1 } = {}) {
    this.segs = [];
    this.boilAmp = boilAmp;
    this.staticAmp = staticAmp;
    this.seed = seed;
    this.density = 1;
    this.built = null;
  }

  /* 一条折线。opts: w(0浓1中2淡) c o ghost(复笔) sub(细分步长) */
  line(points, opts = {}) {
    const { w = 1, c = PALETTE.ink, o = 0.9, ghost = false, sub = SUBDIV, closed = false } = opts;
    const pts = closed ? [...points, points[0]] : points;
    const strokeSeed = this.seed * 17.3 + this.segs.length * 0.618;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const dx = b[0] - a[0], dy = b[1] - a[1], dz = (b[2] || 0) - (a[2] || 0);
      const len = Math.hypot(dx, dy, dz);
      const n = Math.max(1, Math.ceil(len / sub));
      for (let k = 0; k < n; k++) {
        const t0 = k / n, t1 = (k + 1) / n;
        this._seg(
          a[0] + dx * t0, a[1] + dy * t0, (a[2] || 0) + dz * t0,
          a[0] + dx * t1, a[1] + dy * t1, (a[2] || 0) + dz * t1,
          w, c, o, strokeSeed
        );
      }
    }
    if (ghost) {
      const gs = strokeSeed + 91.7;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        const ox = (hash3(q(a[0]), q(a[1]), 0, gs) - 0.5) * 0.07;
        const oy = (hash3(q(a[1]), q(a[0]), 3, gs) - 0.5) * 0.07;
        this._seg(a[0] + ox, a[1] + oy, (a[2] || 0) - 0.01, b[0] + ox, b[1] + oy, (b[2] || 0) - 0.01,
          Math.min(2, w + 1), c, o * 0.3, gs);
      }
    }
    return this;
  }

  _seg(ax, ay, az, bx, by, bz, w, c, o, seed) {
    this.segs.push({ ax, ay, az, bx, by, bz, w, c, o, seed });
  }

  /* 参数曲线采样 */
  curve(fn, n, opts = {}) {
    const pts = [];
    for (let i = 0; i <= n; i++) pts.push(fn(i / n));
    return this.line(pts, opts);
  }

  circle(cx, cy, r, opts = {}) {
    const { a0 = 0, a1 = Math.PI * 2, z = 0, n = Math.max(10, Math.round(r * 14)) } = opts;
    return this.curve((t) => {
      const a = a0 + (a1 - a0) * t;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z];
    }, n, opts);
  }

  ellipse(cx, cy, rx, ry, opts = {}) {
    const { a0 = 0, a1 = Math.PI * 2, z = 0, n = 26 } = opts;
    return this.curve((t) => {
      const a = a0 + (a1 - a0) * t;
      return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, z];
    }, n, opts);
  }

  /* 矩形框（可带轻微手抖角） */
  rect(x, y, w, h, opts = {}) {
    const z = opts.z || 0;
    return this.line([[x, y, z], [x + w, y, z], [x + w, y + h, z], [x, y + h, z]], { ...opts, closed: true });
  }

  /* 长方体可见棱（正面 + 顶面 + 侧面），用于塔身房屋 */
  box(x, y, z, w, h, d, opts = {}) {
    const f = [[x, y, z], [x + w, y, z], [x + w, y + h, z], [x, y + h, z]];
    this.line(f, { ...opts, closed: true });
    if (d > 0) {
      const off = [d * 0.55, d * 0.38];
      const b = f.map((p) => [p[0] + off[0], p[1] + off[1], z - d]);
      this.line([f[1], b[1], b[2], f[2]], opts);
      this.line([f[3], b[3]], opts);
      this.line([b[2], b[3]], opts);
    }
    return this;
  }

  /* 排线阴影：在矩形区域内按角度画短促平行线 */
  hatch(x, y, w, h, opts = {}) {
    const { angle = -0.7, gap = 0.16, w: lw = 2, c = PALETTE.ink, o = 0.28, z = 0, jitter = 0.05 } = opts;
    const dx = Math.cos(angle), dy = Math.sin(angle);
    const diag = Math.hypot(w, h);
    const cx = x + w / 2, cy = y + h / 2;
    const px = -dy, py = dx;
    const count = Math.ceil(diag / gap);
    for (let i = -count; i <= count; i++) {
      const ox = cx + px * i * gap, oy = cy + py * i * gap;
      // 与矩形求交
      let tmin = -diag, tmax = diag;
      for (const [p, d, lo, hi] of [[ox, dx, x, x + w], [oy, dy, y, y + h]]) {
        if (Math.abs(d) < 1e-6) { if (p < lo || p > hi) { tmin = 1; tmax = 0; break; } continue; }
        let t0 = (lo - p) / d, t1 = (hi - p) / d;
        if (t0 > t1) [t0, t1] = [t1, t0];
        tmin = Math.max(tmin, t0); tmax = Math.min(tmax, t1);
      }
      if (tmax - tmin < 0.05) continue;
      const j1 = (hash3(i, this.seed, 1, 7) - 0.5) * jitter;
      const j2 = (hash3(i, this.seed, 2, 7) - 0.5) * jitter;
      const shrink = 0.06 + hash3(i, 3, this.seed, 9) * 0.1;
      const a = tmin + (tmax - tmin) * shrink, b = tmax - (tmax - tmin) * shrink;
      this.line([[ox + dx * a + j1, oy + dy * a + j1, z], [ox + dx * b + j2, oy + dy * b + j2, z]],
        { w: lw, c, o: o * (0.7 + hash3(i, 5, this.seed, 3) * 0.5), sub: 0.5 });
    }
    return this;
  }

  /* 水面：横向断笔，越远越密 */
  water(x0, x1, yTop, yBottom, opts = {}) {
    const { rows = 9, c = PALETTE.lake, o = 0.5, z = 0.2 } = opts;
    for (let r = 0; r < rows; r++) {
      const t = r / (rows - 1);
      const y = yTop + (yBottom - yTop) * (t * t * 0.72 + t * 0.28);
      const segs = 3 + Math.round(t * 5);
      const span = x1 - x0;
      for (let s = 0; s < segs; s++) {
        const h = hash3(r, s, this.seed, 31);
        const sx = x0 + span * (s / segs) + h * span * 0.08;
        const len = span * (0.05 + h * 0.1) * (0.5 + t);
        const yy = y + (hash3(s, r, 3, 17) - 0.5) * 0.12;
        this.line([[sx, yy, z], [sx + len, yy + (h - 0.5) * 0.03, z]],
          { w: 2, c, o: o * (0.45 + t * 0.55), sub: 0.6 });
      }
    }
    return this;
  }

  /* 远山：一条起伏轮廓 + 可选淡晕 */
  ridge(x0, x1, baseY, amp, opts = {}) {
    const { seed = 0, z = -2, c = PALETTE.hillBlue, o = 0.5, w = 1 } = opts;
    const pts = [];
    const n = 30;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = x0 + (x1 - x0) * t;
      const y = baseY + amp * (
        0.6 * Math.sin(t * 5.1 + seed) + 0.3 * Math.sin(t * 11.7 + seed * 2.3) +
        0.18 * Math.sin(t * 23 + seed * 4.1)
      ) * (0.55 + 0.45 * Math.sin(t * Math.PI));
      pts.push([x, y, z]);
    }
    this.line(pts, { w, c, o, sub: 0.5 });
    return pts;
  }

  /* ------------------------------------------------------- build */
  build() {
    const group = new THREE.Group();
    const byClass = [[], [], []];
    for (const s of this.segs) byClass[s.w].push(s);
    const parts = [];
    for (let w = 0; w < 3; w++) {
      const list = byClass[w];
      if (!list.length) continue;
      const n = list.length;
      const pos = new Float32Array(n * 6);
      const col = new Float32Array(n * 6);
      for (let i = 0; i < n; i++) {
        const s = list[i];
        // 静态手抖：共享端点得到相同偏移，折线不断开
        const sa = this.staticAmp * (0.6 + w * 0.35);
        const ax = s.ax + (hash3(q(s.ax), q(s.ay), q(s.az), this.seed + 5) - 0.5) * 2 * sa;
        const ay = s.ay + (hash3(q(s.ay), q(s.az), q(s.ax), this.seed + 9) - 0.5) * 2 * sa;
        const bx = s.bx + (hash3(q(s.bx), q(s.by), q(s.bz), this.seed + 5) - 0.5) * 2 * sa;
        const by = s.by + (hash3(q(s.by), q(s.bz), q(s.bx), this.seed + 9) - 0.5) * 2 * sa;
        pos.set([ax, ay, s.az, bx, by, s.bz], i * 6);
        const rgb = [0, 0, 0];
        inkColor(s.c, s.o, this.density, rgb);
        col.set([...rgb, ...rgb], i * 6);
      }
      const geo = new LineSegmentsGeometry();
      geo.setPositions(pos);
      geo.setColors(col);
      const mat = new LineMaterial({
        vertexColors: true, linewidth: WIDTHS[w], worldUnits: false,
        transparent: true, opacity: 1, depthTest: false, depthWrite: false,
      });
      mat.color.set('#ffffff');
      const mesh = new LineSegments2(geo, mat);
      mesh.frustumCulled = false;
      mesh.renderOrder = 10 + w;
      group.add(mesh);
      parts.push({ mesh, mat, geo, base: pos.slice(), n, segs: list });
    }
    this.built = { group, parts };
    this._tick = -1;
    this.boil(0);
    return this.built;
  }

  setResolution(w, h) {
    if (!this.built) return;
    for (const p of this.built.parts) p.mat.resolution.set(w, h);
  }

  setDensity(d) {
    this.density = d;
    if (!this.built) return;
    const rgb = [0, 0, 0];
    for (const p of this.built.parts) {
      const arr = p.geo.attributes.instanceColorStart.data.array;
      for (let i = 0; i < p.n; i++) {
        const s = p.segs[i];
        inkColor(s.c, s.o, d, rgb);
        arr[i * 6] = rgb[0]; arr[i * 6 + 1] = rgb[1]; arr[i * 6 + 2] = rgb[2];
        arr[i * 6 + 3] = rgb[0]; arr[i * 6 + 4] = rgb[1]; arr[i * 6 + 5] = rgb[2];
      }
      p.geo.attributes.instanceColorStart.data.needsUpdate = true;
    }
  }

  /* boil：低频重抖，像手还在纸上 */
  boil(tick) {
    if (!this.built || tick === this._tick) return;
    this._tick = tick;
    const amp = this.boilAmp;
    for (const p of this.built.parts) {
      const arr = p.geo.attributes.instanceStart.data.array;
      const b = p.base;
      for (let i = 0; i < p.n * 6; i += 3) {
        const x = b[i], y = b[i + 1], z = b[i + 2];
        const s = this.seed + tick * 13.77;
        arr[i] = x + (hash3(q(x), q(y), q(z), s) - 0.5) * 2 * amp;
        arr[i + 1] = y + (hash3(q(y), q(z), q(x), s + 41) - 0.5) * 2 * amp;
        arr[i + 2] = z;
      }
      p.geo.attributes.instanceStart.data.needsUpdate = true;
    }
  }

  dispose() {
    if (!this.built) return;
    for (const p of this.built.parts) { p.geo.dispose(); p.mat.dispose(); }
  }
}

/* ------------------------------------------------------- 水彩晕染 */
const washCache = new Map();
export function washTexture(seed = 1) {
  if (washCache.has(seed)) return washCache.get(seed);
  const S = 256;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, S, S);
  // 一团由许多半透明圆叠出来的软边
  for (let i = 0; i < 46; i++) {
    const a = hash3(i, seed, 1, 3) * Math.PI * 2;
    const r = hash3(i, seed, 2, 5) * S * 0.26;
    const x = S / 2 + Math.cos(a) * r;
    const y = S / 2 + Math.sin(a) * r * 0.86;
    const rad = S * (0.16 + hash3(i, seed, 3, 7) * 0.2);
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, 'rgba(255,255,255,0.10)');
    g.addColorStop(0.7, 'rgba(255,255,255,0.05)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
  }
  // 边缘再收一道，做出水痕
  ctx.globalCompositeOperation = 'destination-in';
  const g2 = ctx.createRadialGradient(S / 2, S / 2, S * 0.1, S / 2, S / 2, S * 0.5);
  g2.addColorStop(0, 'rgba(0,0,0,1)');
  g2.addColorStop(0.72, 'rgba(0,0,0,0.85)');
  g2.addColorStop(0.9, 'rgba(0,0,0,0.28)');
  g2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  washCache.set(seed, tex);
  return tex;
}

export function wash(x, y, w, h, color, opacity, opts = {}) {
  const { z = -1.5, seed = 1, rot = 0, order = 1 } = opts;
  const mat = new THREE.MeshBasicMaterial({
    map: washTexture(seed), color, transparent: true, opacity,
    depthTest: false, depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.z = rot;
  mesh.renderOrder = order;
  return mesh;
}
