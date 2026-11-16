/* scenes.js —— 八页杭州，全部用墨线程序化画出。
   坐标：世界宽 20（x -10..10），高 14.1；折页在 x=0；
   画芯主要在右页 x∈[0.4,9.6]，左页留给诗笺。 */
import * as THREE from 'three';
import { Ink, PALETTE as P, wash, poemPlate, labelPlate, sealPlate, annotate } from './ink.js';

const TAU = Math.PI * 2;
function rnd(seed) { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

function newScene(id) {
  const group = new THREE.Group();
  const scene = { id, group, inks: [], anims: [], meshes: [] };
  scene.ink = (opts) => {
    const k = new Ink({ seed: scene.inks.length * 3.7 + 1, ...opts });
    scene.inks.push(k);
    return k;
  };
  scene.addInk = (k) => { const b = k.build(); group.add(b.group); return b; };
  scene.add = (m) => { group.add(m); scene.meshes.push(m); return m; };
  return scene;
}

/* ------------------------------------------------------- 通用笔法 */
function birds(ink, cx, cy, n = 3, s = 1, o = 0.6) {
  for (let i = 0; i < n; i++) {
    const x = cx + (rnd(i * 3 + 1) - 0.5) * 2.4 * s;
    const y = cy + (rnd(i * 5 + 2) - 0.5) * 1.1 * s;
    const w = (0.28 + rnd(i + 9) * 0.16) * s;
    ink.line([[x - w, y + w * 0.34, 0.4], [x, y, 0.4], [x + w, y + w * 0.3, 0.4]], { w: 2, o, sub: 0.18 });
  }
}

function farHills(scene, ink, { baseY = 1.4, amp = 1.1, o = 0.34, x0 = -0.5, x1 = 9.8, seed = 2 } = {}) {
  ink.ridge(x0, x1, baseY, amp, { seed, o, c: P.hillBlue, w: 1, z: -2 });
  ink.ridge(x0, x1, baseY - 0.55, amp * 0.7, { seed: seed + 4, o: o * 1.25, c: P.hillBlue, w: 1, z: -1.6 });
  scene.add(wash(4.6, baseY - 0.2, 11.5, 3.2, P.celadon, 0.1, { seed: 3, z: -2.4 }));
}

function willow(ink, x, y, h = 3, opts = {}) {
  const { lean = 0.3, leaves = true, o = 0.75, c = P.ink } = opts;
  ink.curve((t) => [x + lean * t * t, y + h * t, 0.3], 10, { w: 0, c, o, ghost: true });
  const topX = x + lean, topY = y + h;
  const branches = 6;
  for (let i = 0; i < branches; i++) {
    const a = -0.5 + (i / (branches - 1)) * 1.6;
    const bx = topX + Math.cos(a) * 0.7;
    const by = topY + Math.sin(a) * 0.4;
    const drop = 1.4 + rnd(i + x) * 1.4;
    const sway = (rnd(i * 2 + 3) - 0.5) * 0.8;
    ink.curve((t) => [bx + sway * t + Math.sin(t * 3 + i) * 0.06, by - drop * t, 0.32], 10, { w: 2, c, o: o * 0.8 });
    if (leaves) {
      for (let k = 1; k < 6; k++) {
        const t = k / 6;
        const lx = bx + sway * t, ly = by - drop * t;
        ink.line([[lx, ly, 0.33], [lx + 0.09, ly - 0.12, 0.33]], { w: 2, c: P.willow, o: o * 0.7, sub: 0.2 });
      }
    }
  }
}

function boatWupeng(ink, x, y, s = 1, opts = {}) {
  const { o = 0.85, canopy = true, figure = true } = opts;
  ink.curve((t) => [x - 1.1 * s + 2.2 * s * t, y + Math.sin(t * Math.PI) * -0.16 * s + (t < 0.12 || t > 0.88 ? 0.14 * s : 0), 0.5], 14, { w: 0, o, ghost: true });
  ink.line([[x - 0.95 * s, y + 0.06 * s, 0.5], [x + 0.95 * s, y + 0.06 * s, 0.5]], { w: 1, o: o * 0.7 });
  if (canopy) {
    ink.curve((t) => [x - 0.5 * s + 1.0 * s * t, y + 0.1 * s + Math.sin(t * Math.PI) * 0.42 * s, 0.52], 12, { w: 1, o });
    ink.line([[x - 0.5 * s, y + 0.1 * s, 0.52], [x + 0.5 * s, y + 0.1 * s, 0.52]], { w: 2, o: o * 0.6 });
    for (let i = 1; i < 4; i++) {
      const t = i / 4;
      ink.line([[x - 0.5 * s + 1.0 * s * t, y + 0.1 * s, 0.52], [x - 0.5 * s + 1.0 * s * t, y + 0.1 * s + Math.sin(t * Math.PI) * 0.4 * s, 0.52]], { w: 2, o: o * 0.4 });
    }
  }
  if (figure) {
    const fx = x + 0.78 * s;
    ink.circle(fx, y + 0.3 * s, 0.07 * s, { w: 2, o, z: 0.53, n: 8 });
    ink.line([[fx, y + 0.22 * s, 0.53], [fx - 0.05 * s, y + 0.05 * s, 0.53]], { w: 2, o });
    ink.line([[fx + 0.02 * s, y + 0.18 * s, 0.53], [fx + 0.3 * s, y - 0.1 * s, 0.53]], { w: 2, o: o * 0.7 }); // 橹
  }
}

/* 江南民居：白墙 + 马头墙 + 黛瓦 + 窗 */
function houseJiangnan(ink, x, y, w, h, opts = {}) {
  const { o = 0.85, roof = true, windows = 2, lantern = false, steps = 2 } = opts;
  ink.rect(x, y, w, h, { w: 1, o, z: 0.3 });
  // 马头墙（ stepped gable ）两端
  for (const side of [0, 1]) {
    const sx = side ? x + w : x;
    const dir = side ? -1 : 1;
    let cy = y + h;
    for (let s = 0; s < steps; s++) {
      const sw = w * (0.16 - s * 0.03);
      ink.line([[sx, cy, 0.31], [sx + dir * sw, cy, 0.31], [sx + dir * sw, cy + 0.16, 0.31]], { w: 1, o });
      cy += 0.16;
    }
  }
  if (roof) {
    const rh = h * 0.24;
    ink.curve((t) => [x - w * 0.06 + (w * 1.12) * t, y + h + rh * (0.5 - 0.5 * Math.cos(t * TAU)) * 0.3 + rh * 0.3, 0.32], 12, { w: 0, o });
    ink.line([[x - w * 0.06, y + h + rh * 0.3, 0.32], [x + w * 0.5, y + h + rh, 0.32], [x + w * 1.06, y + h + rh * 0.3, 0.32]], { w: 1, o });
    ink.hatch(x, y + h, w, rh * 0.7, { angle: -0.5, gap: 0.14, o: o * 0.22, z: 0.31 });
  }
  for (let i = 0; i < windows; i++) {
    const wx = x + w * (0.2 + (i / Math.max(1, windows)) * 0.6);
    ink.rect(wx, y + h * 0.42, w * 0.14, h * 0.26, { w: 2, o: o * 0.7, z: 0.32 });
    ink.line([[wx + w * 0.07, y + h * 0.42, 0.32], [wx + w * 0.07, y + h * 0.68, 0.32]], { w: 2, o: o * 0.4 });
  }
  ink.rect(x + w * 0.42, y, w * 0.16, h * 0.34, { w: 2, o: o * 0.75, z: 0.32 });
  if (lantern) {
    const lx = x + w * 0.5, ly = y + h * 0.86;
    ink.circle(lx, ly, 0.11, { w: 2, c: P.seal, o: o * 0.8, z: 0.34, n: 10 });
    ink.line([[lx, ly + 0.11, 0.34], [lx, ly + 0.2, 0.34]], { w: 2, o: o * 0.5 });
  }
}

/* 中式屋顶：起翘檐口 + 正脊 */
function roofChinese(ink, cx, y, halfW, h, opts = {}) {
  const { up = 0.22, o = 0.9, ridge = true, side = 0, hatch = true } = opts;
  const eave = (t) => [cx - halfW + 2 * halfW * t, y + up * Math.pow(2 * t - 1, 2) - 0.05 * Math.sin(t * Math.PI), 0.4];
  ink.curve(eave, 16, { w: 0, o, ghost: true });
  ink.curve((t) => [eave(t)[0], eave(t)[1] - 0.09, 0.4], 16, { w: 2, o: o * 0.5 });
  const rw = halfW * 0.42;
  if (ridge) {
    ink.line([[cx - rw, y + h, 0.41], [cx + rw, y + h, 0.41]], { w: 0, o });
    ink.line([[cx - halfW, y + up, 0.4], [cx - rw, y + h, 0.41]], { w: 1, o });
    ink.line([[cx + halfW, y + up, 0.4], [cx + rw, y + h, 0.41]], { w: 1, o });
    // 鸱吻
    ink.line([[cx - rw, y + h, 0.41], [cx - rw - 0.08, y + h + 0.14, 0.41]], { w: 2, o });
    ink.line([[cx + rw, y + h, 0.41], [cx + rw + 0.08, y + h + 0.14, 0.41]], { w: 2, o });
  }
  if (side > 0) {
    const dx = side, dy = side * 0.4;
    ink.curve((t) => [eave(t)[0] + dx, eave(t)[1] + dy, 0.38], 12, { w: 2, o: o * 0.55 });
    ink.line([[cx + halfW, y + up, 0.4], [cx + halfW + dx, y + up + dy, 0.38], [cx + rw + dx, y + h + dy, 0.38]], { w: 2, o: o * 0.5 });
  }
  if (hatch) ink.hatch(cx - halfW * 0.8, y + 0.02, halfW * 1.6, h * 0.8, { angle: -0.62, gap: 0.2, o: o * 0.16, z: 0.39 });
}

/* 雷峰塔：八面五层，3/4 视角 */
function leifengPagoda(ink, cx, baseY) {
  const levels = 5;
  let w = 2.1, y = baseY;
  // 台基
  ink.box(cx - w * 0.62, y - 0.3, 0.3, w * 1.24, 0.3, 0.5, { w: 1, o: 0.85 });
  ink.hatch(cx - w * 0.6, y - 0.28, w * 1.2, 0.26, { angle: -0.7, gap: 0.18, o: 0.18, z: 0.31 });
  for (let i = 0; i < levels; i++) {
    const bh = 0.66 - i * 0.04;
    const hw = w / 2;
    const side = hw * 0.42;
    // 塔身（正面 + 侧面）
    ink.rect(cx - hw, y, w, bh, { w: 1, o: 0.9, z: 0.4 });
    ink.line([[cx + hw, y, 0.4], [cx + hw + side, y + side * 0.5, 0.38], [cx + hw + side, y + bh + side * 0.5, 0.38], [cx + hw, y + bh, 0.4]], { w: 2, o: 0.6 });
    // 柱与门
    const cols = 4 - Math.min(2, Math.floor(i / 2));
    for (let c = 1; c < cols; c++) {
      const x = cx - hw + (w / cols) * c;
      ink.line([[x, y + 0.04, 0.41], [x, y + bh - 0.04, 0.41]], { w: 2, o: 0.55 });
    }
    ink.rect(cx - hw * 0.22, y + 0.02, hw * 0.44, bh * 0.62, { w: 2, o: 0.6, z: 0.42 });
    // 平座栏杆
    const ry = y + bh;
    ink.line([[cx - hw * 1.12, ry, 0.42], [cx + hw * 1.12, ry, 0.42]], { w: 1, o: 0.8 });
    for (let p = 0; p <= 6; p++) {
      const x = cx - hw * 1.1 + (hw * 2.2 / 6) * p;
      ink.line([[x, ry, 0.42], [x, ry + 0.12, 0.42]], { w: 2, o: 0.5 });
    }
    ink.line([[cx - hw * 1.12, ry + 0.12, 0.42], [cx + hw * 1.12, ry + 0.12, 0.42]], { w: 2, o: 0.6 });
    // 檐
    roofChinese(ink, cx, ry + 0.1, hw * 1.42, 0.34, { up: 0.2, o: 0.92, side, hatch: true });
    y = ry + 0.42;
    w *= 0.86;
  }
  // 塔刹
  ink.line([[cx, y, 0.42], [cx, y + 0.7, 0.42]], { w: 1, o: 0.9 });
  for (let r = 0; r < 3; r++) ink.circle(cx, y + 0.18 + r * 0.16, 0.1 - r * 0.025, { w: 2, o: 0.7, z: 0.43, n: 10 });
  ink.circle(cx, y + 0.72, 0.07, { w: 2, c: P.amber, o: 0.85, z: 0.43, n: 10 });
}

/* 保俶塔：瘦削七级 */
function baochuPagoda(ink, cx, baseY, h = 3.1) {
  let w = 0.5, y = baseY;
  const lh = h / 7;
  for (let i = 0; i < 7; i++) {
    ink.rect(cx - w / 2, y, w, lh * 0.72, { w: 2, o: 0.75, z: 0.2 });
    ink.line([[cx - w * 0.62, y + lh * 0.72, 0.21], [cx + w * 0.62, y + lh * 0.72, 0.21]], { w: 2, o: 0.7 });
    ink.line([[cx - w * 0.62, y + lh * 0.72, 0.21], [cx - w * 0.5, y + lh * 0.86, 0.21]], { w: 2, o: 0.5 });
    ink.line([[cx + w * 0.62, y + lh * 0.72, 0.21], [cx + w * 0.5, y + lh * 0.86, 0.21]], { w: 2, o: 0.5 });
    y += lh; w *= 0.9;
  }
  ink.line([[cx, y, 0.21], [cx, y + 0.4, 0.21]], { w: 2, o: 0.8 });
}

/* 三潭石塔：瓶形，球形顶带圆孔 */
function santanStone(ink, cx, cy, s = 1) {
  const prof = [[0.34, 0], [0.3, 0.1], [0.2, 0.18], [0.24, 0.34], [0.18, 0.5], [0.14, 0.56]];
  for (const dir of [-1, 1]) {
    ink.curve((t) => {
      const i = t * (prof.length - 1);
      const a = prof[Math.floor(i)], b = prof[Math.min(prof.length - 1, Math.ceil(i))];
      const f = i - Math.floor(i);
      return [cx + dir * (a[0] + (b[0] - a[0]) * f) * s, cy + (a[1] + (b[1] - a[1]) * f) * s, 0.5];
    }, 12, { w: 1, o: 0.88 });
  }
  ink.ellipse(cx, cy + 0.02 * s, 0.36 * s, 0.08 * s, { w: 1, o: 0.7, z: 0.5 });
  ink.circle(cx, cy + 0.72 * s, 0.17 * s, { w: 1, o: 0.9, z: 0.51, n: 14 });
  // 顶盖
  ink.line([[cx - 0.2 * s, cy + 0.86 * s, 0.51], [cx, cy + 0.98 * s, 0.51], [cx + 0.2 * s, cy + 0.86 * s, 0.51]], { w: 2, o: 0.8 });
  // 五孔（见三孔）
  for (const [dx, dy] of [[-0.08, 0.72], [0.08, 0.72], [0, 0.62]]) {
    ink.circle(cx + dx * s, cy + dy * s, 0.035 * s, { w: 2, o: 0.75, z: 0.52, n: 8 });
  }
}

function figureSimple(ink, x, y, s = 1, opts = {}) {
  const { bend = 0, hat = false, o = 0.8 } = opts;
  ink.circle(x + bend * 0.1 * s, y + 0.62 * s, 0.08 * s, { w: 2, o, z: 0.6, n: 8 });
  ink.curve((t) => [x + bend * 0.16 * s * t, y + 0.54 * s - 0.3 * s * t, 0.6], 6, { w: 1, o });
  ink.line([[x, y + 0.24 * s, 0.6], [x - 0.08 * s, y, 0.6]], { w: 2, o });
  ink.line([[x, y + 0.24 * s, 0.6], [x + 0.1 * s, y, 0.6]], { w: 2, o });
  ink.line([[x + bend * 0.1 * s, y + 0.46 * s, 0.6], [x + 0.2 * s, y + 0.3 * s, 0.6]], { w: 2, o: o * 0.8 });
  if (hat) ink.line([[x - 0.16 * s + bend * 0.1 * s, y + 0.68 * s, 0.61], [x + bend * 0.1 * s, y + 0.8 * s, 0.61], [x + 0.16 * s + bend * 0.1 * s, y + 0.68 * s, 0.61]], { w: 2, o });
}

function smokeCurl(scene, x, y, h = 2) {
  const k = scene.ink({ boilAmp: 0.03 });
  for (let i = 0; i < 3; i++) {
    const ox = (i - 1) * 0.06;
    k.curve((t) => [x + ox + Math.sin(t * 5 + i * 2) * 0.16 * (0.3 + t), y + h * t, 0.55], 16, { w: 2, c: P.inkSoft, o: 0.4 - i * 0.08 });
  }
  const b = scene.addInk(k);
  scene.anims.push((t) => { b.group.position.y = Math.sin(t * 0.5) * 0.05; b.group.position.x = Math.sin(t * 0.33) * 0.04; });
}

/* ------------------------------------------------------- 壹 · 断桥残雪 */
function duanqiao() {
  const s = newScene('duanqiao');
  const ink = s.ink();
  farHills(s, ink, { baseY: 1.9, amp: 1.15, o: 0.3, seed: 5 });
  s.add(wash(5, 2.2, 15, 3, P.hillBlue, 0.07, { seed: 8, z: -2.6 }));
  // 宝石山 + 保俶塔
  ink.curve((t) => [5.9 + 3.4 * t, 1.5 + Math.sin(t * Math.PI) * 1.15, -1.2], 16, { w: 1, c: P.hillBlue, o: 0.5 });
  baochuPagoda(ink, 7.7, 2.55, 3.0);
  // 白堤远岸
  ink.line([[-0.5, -1.05, -0.5], [9.7, -1.05, -0.5]], { w: 2, c: P.inkSoft, o: 0.4, sub: 0.7 });
  // 湖水
  const wk = s.ink({ boilAmp: 0.012 });
  wk.water(-0.5, 9.7, -1.3, -5.7, { rows: 11, o: 0.42 });
  const wb = s.addInk(wk);
  s.anims.push((t) => { wb.group.position.x = Math.sin(t * 0.24) * 0.07; });
  // 断桥：单孔石拱，券脸与桥面连成整体
  const bx = 4.8, span = 5.5, x0 = bx - span / 2;
  const deck = (t) => [x0 + span * t, -1.7 + 1.0 * Math.sin(t * Math.PI), 0.5];
  ink.curve(deck, 26, { w: 0, o: 0.95, ghost: true });
  ink.curve((t) => [deck(t)[0], deck(t)[1] - 0.18, 0.5], 26, { w: 2, o: 0.55 });
  ink.curve((t) => [deck(t)[0], deck(t)[1] + 0.32, 0.52], 26, { w: 1, o: 0.85 });
  for (let i = 0; i <= 14; i++) {
    const p = deck(i / 14);
    ink.line([[p[0], p[1], 0.52], [p[0], p[1] + 0.32, 0.52]], { w: 2, o: 0.6 });
  }
  // 桥洞：券脸 apex 顶到桥面底
  const wy = -2.0, ar = 1.16;
  ink.circle(bx, wy, ar, { a0: 0, a1: Math.PI, w: 0, o: 0.95, z: 0.49, n: 24 });
  ink.circle(bx, wy, ar * 0.84, { a0: 0, a1: Math.PI, w: 2, o: 0.45, z: 0.49, n: 22 });
  for (let i = 1; i < 9; i++) {
    const a = (i / 9) * Math.PI;
    ink.line([[bx + Math.cos(a) * ar * 0.84, wy + Math.sin(a) * ar * 0.84, 0.5], [bx + Math.cos(a) * ar, wy + Math.sin(a) * ar, 0.5]], { w: 2, o: 0.4 });
  }
  // 桥台：桥面两端落到水面
  for (const ex of [x0, x0 + span]) {
    ink.line([[ex, -1.7, 0.5], [ex, -2.7, 0.5]], { w: 1, o: 0.7 });
    ink.line([[ex - 0.18, -2.7, 0.5], [ex + 0.18, -2.7, 0.5]], { w: 2, o: 0.5 });
  }
  // 倒影
  ink.circle(bx, wy - 0.16, ar * 0.92, { a0: Math.PI, a1: TAU, w: 2, c: P.lake, o: 0.32, z: 0.3, n: 18 });
  // 雪：栏杆与山头的留白点
  for (let i = 0; i < 26; i++) {
    const x = 0.6 + rnd(i + 40) * 8.8, y = 2.6 + rnd(i + 80) * 3;
    ink.circle(x, y, 0.028 + rnd(i) * 0.02, { w: 2, c: P.hillBlue, o: 0.3, z: 0.4, n: 6 });
  }
  for (let i = 0; i <= 10; i++) {
    const p = deck(i / 10);
    ink.line([[p[0] - 0.06, p[1] + 0.32, 0.53], [p[0] + 0.08, p[1] + 0.33, 0.53]], { w: 2, c: P.hillBlue, o: 0.4 });
  }
  // 冬柳（疏枝带雪）
  willow(ink, 0.95, 2.5, 3.1, { lean: 0.5, leaves: false, o: 0.78 });
  boatWupeng(ink, 8.4, -3.8, 0.66, { canopy: false });
  birds(ink, 2.6, 4.8, 2, 0.85, 0.55);
  annotate(s, ink, '断桥 · 白堤东端', 1.3, 0.5, 3.6, -0.95, { size: 0.44 });
  annotate(s, ink, '保俶塔', 9.4, 5.5, 7.85, 4.7, { size: 0.44, align: 'right' });
  s.addInk(ink);
  return s;
}

/* ------------------------------------------------------- 贰 · 雷峰夕照 */
function leifeng() {
  const s = newScene('leifeng');
  const ink = s.ink();
  s.add(wash(6.4, 2.4, 12, 8, P.amber, 0.12, { seed: 5, z: -3 }));
  // 落日
  s.add(wash(7.0, 2.7, 4.4, 4.4, P.amber, 0.4, { seed: 2, z: -2.5 }));
  ink.circle(7.0, 2.7, 1.5, { w: 2, c: P.amber, o: 0.5, z: -1.8, n: 30 });
  farHills(s, ink, { baseY: 0.9, amp: 0.9, o: 0.3, x0: -0.5, x1: 3.4, seed: 9 });
  // 夕照山
  ink.curve((t) => [2.0 + 6.0 * t, -1.35 + Math.sin(t * Math.PI) * 1.5, -0.6], 20, { w: 1, o: 0.8, ghost: true });
  ink.hatch(5.2, -1.2, 2.6, 1.0, { angle: -0.7, gap: 0.2, o: 0.16, z: -0.5 });
  for (let i = 0; i < 9; i++) {
    const x = 2.5 + rnd(i + 3) * 5, y = -1.2 + Math.sin(((x - 2) / 6) * Math.PI) * 1.4;
    ink.line([[x, y, -0.5], [x, y + 0.2 + rnd(i) * 0.16, -0.5]], { w: 2, c: P.willow, o: 0.5 });
  }
  leifengPagoda(ink, 4.7, 0.05);
  s.add(wash(4.7, 2.6, 3.4, 5.4, P.amber, 0.1, { seed: 7, z: -0.8 }));
  // 湖水 + 夕照碎金
  const wk = s.ink({ boilAmp: 0.012 });
  wk.water(-0.5, 9.7, -1.5, -5.7, { rows: 11, o: 0.45 });
  for (let i = 0; i < 16; i++) {
    const t = i / 15;
    const y = -1.7 - t * 3.1;
    const w = 0.3 + t * 1.3;
    const x = 7.0 - w / 2 + (rnd(i + 11) - 0.5) * 0.5;
    wk.line([[x, y, 0.3], [x + w, y, 0.3]], { w: 2, c: P.amber, o: 0.5 - t * 0.25, sub: 0.5 });
  }
  const wb = s.addInk(wk);
  s.anims.push((t) => { wb.group.position.x = Math.sin(t * 0.2) * 0.06; });
  boatWupeng(ink, 1.9, -3.3, 0.66, {});
  boatWupeng(ink, 8.7, -2.7, 0.5, { figure: false });
  birds(ink, 2.6, 4.4, 3, 0.9, 0.55);
  annotate(s, ink, '雷峰塔 · 高七十一米', 9.4, 5.7, 5.5, 4.5, { size: 0.44, align: 'right' });
  s.addInk(ink);
  return s;
}

/* ------------------------------------------------------- 叁 · 三潭印月 */
function santan() {
  const s = newScene('santan');
  const ink = s.ink();
  s.add(wash(5, 3.4, 16, 7, P.hillBlue, 0.06, { seed: 4, z: -3 }));
  // 月
  s.add(wash(7.9, 4.4, 3.2, 3.2, P.amber, 0.34, { seed: 6, z: -2.5 }));
  ink.circle(7.9, 4.4, 1.02, { w: 1, c: P.amber, o: 0.6, z: -1.8, n: 26 });
  ink.line([[6.4, 4.1, -1.7], [7.2, 4.05, -1.7]], { w: 2, c: P.inkSoft, o: 0.3 });
  ink.line([[8.4, 4.9, -1.7], [9.3, 4.85, -1.7]], { w: 2, c: P.inkSoft, o: 0.25 });
  // 小瀛洲低岸
  ink.curve((t) => [-0.5 + 10.2 * t, -1.5 + Math.sin(t * Math.PI * 2.4) * 0.12, -0.8], 24, { w: 1, c: P.inkSoft, o: 0.55 });
  for (let i = 0; i < 7; i++) {
    const x = 0.3 + i * 1.4;
    ink.line([[x, -1.45, -0.7], [x, -1.1 - rnd(i) * 0.3, -0.7]], { w: 2, c: P.willow, o: 0.45 });
  }
  willow(ink, 1.0, -1.4, 1.5, { lean: 0.2, o: 0.5 });
  // 湖水
  const wk = s.ink({ boilAmp: 0.012 });
  wk.water(-0.5, 9.7, -1.7, -5.8, { rows: 12, o: 0.5 });
  // 月光碎金
  for (let i = 0; i < 14; i++) {
    const t = i / 13, y = -1.9 - t * 3.3, w = 0.25 + t * 1.1;
    const x = 7.9 - w / 2 + (rnd(i + 5) - 0.5) * 0.6;
    wk.line([[x, y, 0.3], [x + w, y, 0.3]], { w: 2, c: P.amber, o: 0.45 - t * 0.2, sub: 0.5 });
  }
  const wb = s.addInk(wk);
  s.anims.push((t) => { wb.group.position.x = Math.sin(t * 0.22) * 0.06; });
  // 三塔
  const stones = [[3.3, -3.0, 1.3], [5.7, -3.5, 1.4], [4.5, -2.25, 1.08]];
  for (const [x, y, sc] of stones) {
    santanStone(ink, x, y, sc);
    s.add(wash(x, y + 0.7 * sc, 0.5 * sc, 0.5 * sc, P.amber, 0.4, { seed: 9, z: 0.45 }));
    ink.ellipse(x, y - 0.06, 0.6 * sc, 0.14 * sc, { a0: 0.15, a1: Math.PI - 0.15, w: 2, c: P.lake, o: 0.4, z: 0.4 });
    ink.ellipse(x, y - 0.12, 0.95 * sc, 0.22 * sc, { a0: 0.3, a1: Math.PI - 0.3, w: 2, c: P.lake, o: 0.25, z: 0.39 });
  }
  boatWupeng(ink, 8.6, -4.0, 0.6, {});
  ink.circle(8.35, -3.85, 0.06, { w: 2, c: P.amber, o: 0.8, z: 0.6, n: 8 });
  annotate(s, ink, '三潭印月 · 塔高两米', 1.3, -0.5, 3.1, -2.5, { size: 0.44 });
  s.addInk(ink);
  return s;
}

/* ------------------------------------------------------- 肆 · 龙井问茶 */
function longjing() {
  const s = newScene('longjing');
  const ink = s.ink();
  farHills(s, ink, { baseY: 3.0, amp: 1.0, o: 0.28, seed: 13 });
  s.add(wash(5, 3.2, 15, 3, P.willow, 0.08, { seed: 11, z: -2.6 }));
  // 茶垄：等高线 + 茶丛短笔
  const bands = 7;
  for (let b = 0; b < bands; b++) {
    const t = b / (bands - 1);
    const y0 = -4.9 + t * 6.6;
    const rise = 1.15;
    const fn = (u) => [0.3 + 9.3 * u, y0 + rise * u + Math.sin(u * 7 + b * 1.7) * 0.16, 0.2 + t * 0.1];
    ink.curve(fn, 30, { w: b % 2 ? 1 : 0, c: P.ink, o: 0.72 - t * 0.18, ghost: b % 3 === 0 });
    const bush = 46;
    for (let i = 0; i < bush; i++) {
      const u = (i + 0.5) / bush;
      const p = fn(u);
      const hh = 0.14 + rnd(i + b * 40) * 0.09;
      ink.line([[p[0], p[1] + 0.02, p[2] + 0.01], [p[0] + (rnd(i) - 0.5) * 0.05, p[1] + hh, p[2] + 0.01]],
        { w: 2, c: P.willow, o: 0.72 - t * 0.15, sub: 0.2 });
    }
    if (b % 2 === 0) s.add(wash(5, y0 + 0.5, 10, 1.15, P.willow, 0.15, { seed: 12 + b, z: 0.1 }));
  }
  // 山径
  ink.curve((t) => [5.1 - 1.3 * Math.sin(t * 4) + t * 1.2, -5.7 + 6.6 * t, 0.35], 20, { w: 2, o: 0.5 });
  ink.curve((t) => [5.4 - 1.3 * Math.sin(t * 4) + t * 1.2, -5.7 + 6.6 * t, 0.35], 20, { w: 2, o: 0.4 });
  // 茶屋
  houseJiangnan(ink, 7.15, 1.5, 1.95, 1.15, { o: 0.85, windows: 1, steps: 1 });
  smokeCurl(s, 8.5, 2.7, 1.3);
  // 茶农
  figureSimple(ink, 3.3, -2.6, 1.45, { bend: 1, hat: true });
  ink.ellipse(3.75, -2.42, 0.16, 0.2, { w: 2, o: 0.6, z: 0.6 }); // 茶篓
  // 茶叶 doodle
  for (const [lx, ly, r] of [[1.7, 4.7, 0.5], [2.5, 5.3, -0.3], [8.9, 5.0, 0.9]]) {
    ink.curve((t) => [lx + Math.cos(r) * 0.5 * t - Math.sin(r) * Math.sin(t * Math.PI) * 0.16, ly + Math.sin(r) * 0.5 * t + Math.cos(r) * Math.sin(t * Math.PI) * 0.16, 0.5], 10, { w: 2, c: P.willow, o: 0.7 });
    ink.curve((t) => [lx + Math.cos(r) * 0.5 * t + Math.sin(r) * Math.sin(t * Math.PI) * 0.16, ly + Math.sin(r) * 0.5 * t - Math.cos(r) * Math.sin(t * Math.PI) * 0.16, 0.5], 10, { w: 2, c: P.willow, o: 0.7 });
    ink.line([[lx, ly, 0.5], [lx + Math.cos(r) * 0.5, ly + Math.sin(r) * 0.5, 0.5]], { w: 2, c: P.willow, o: 0.4 });
  }
  annotate(s, ink, '狮峰山 · 明前龙井', 1.2, 3.7, 3.2, 1.9, { size: 0.44 });
  annotate(s, ink, '龙井村', 8.6, 3.3, 8.1, 2.5, { size: 0.42, align: 'right' });
  s.addInk(ink);
  return s;
}

/* ------------------------------------------------------- 伍 · 灵隐钟声 */
function lingyin() {
  const s = newScene('lingyin');
  const ink = s.ink();
  s.add(wash(5, 2.6, 14, 6, P.willow, 0.07, { seed: 15, z: -3 }));
  farHills(s, ink, { baseY: 3.4, amp: 0.9, o: 0.24, seed: 21 });
  // 古木
  for (const [tx, th, lean] of [[0.7, 4.6, 0.3], [9.2, 4.2, -0.25]]) {
    ink.curve((t) => [tx + lean * t * t, -2.6 + th * t, 0.2], 12, { w: 0, o: 0.8, ghost: true });
    for (let i = 0; i < 5; i++) {
      const by = -2.6 + th * (0.55 + i * 0.09);
      const dir = i % 2 ? 1 : -1;
      ink.curve((t) => [tx + lean * 0.6 + dir * 1.1 * t, by + 0.5 * t - 0.3 * t * t, 0.22], 8, { w: 2, o: 0.6 });
    }
    s.add(wash(tx + lean, -2.6 + th * 0.8, 2.6, 2.2, P.willow, 0.16, { seed: 16, z: 0.1 }));
    for (let i = 0; i < 10; i++) {
      const x = tx + lean + (rnd(i + tx) - 0.5) * 2.2, y = -2.6 + th * 0.8 + (rnd(i + 3) - 0.5) * 1.6;
      ink.circle(x, y, 0.16 + rnd(i) * 0.12, { w: 2, c: P.willow, o: 0.35, z: 0.23, n: 8 });
    }
  }
  // 桂子
  for (let i = 0; i < 14; i++) {
    const x = 1 + rnd(i + 50) * 8, y = 1.5 + rnd(i + 90) * 3.4;
    ink.circle(x, y, 0.03, { w: 2, c: P.amber, o: 0.6, z: 0.4, n: 6 });
  }
  // 大殿（重檐）
  const cx = 5.0, base = -0.7;
  ink.rect(cx - 1.9, base, 3.8, 1.5, { w: 1, o: 0.88, z: 0.35 });
  for (let i = 0; i < 6; i++) {
    const x = cx - 1.75 + i * 0.7;
    ink.line([[x, base + 0.05, 0.36], [x, base + 1.45, 0.36]], { w: 1, o: 0.6 });
  }
  ink.rect(cx - 0.5, base + 0.05, 1.0, 1.0, { w: 2, o: 0.65, z: 0.37 }); // 门
  roofChinese(ink, cx, base + 1.5, 2.5, 0.62, { up: 0.3, o: 0.92, side: 0.5 });
  ink.rect(cx - 1.3, base + 2.25, 2.6, 0.85, { w: 1, o: 0.8, z: 0.35 });
  roofChinese(ink, cx, base + 3.1, 1.8, 0.6, { up: 0.28, o: 0.92, side: 0.4 });
  // 匾额
  ink.rect(cx - 0.7, base + 1.72, 1.4, 0.42, { w: 2, o: 0.7, z: 0.45 });
  const bian = labelPlate('灵隐寺', { size: 0.3, alpha: 0.85, font: '"Ma Shan Zheng"' });
  bian.position.set(cx, base + 1.93, 0.46);
  s.add(bian);
  // 台阶
  for (let i = 0; i < 5; i++) {
    const y = base - 0.18 * (i + 1), hw = 2.0 + i * 0.3;
    ink.line([[cx - hw, y, 0.3], [cx + hw, y, 0.3]], { w: 2, o: 0.5 - i * 0.06 });
  }
  // 香炉 + 烟
  ink.rect(2.5, -2.95, 0.6, 0.42, { w: 1, o: 0.8, z: 0.5 });
  ink.line([[2.56, -2.95, 0.5], [2.5, -3.15, 0.5]], { w: 2, o: 0.7 });
  ink.line([[3.04, -2.95, 0.5], [3.1, -3.15, 0.5]], { w: 2, o: 0.7 });
  ink.line([[2.8, -2.95, 0.5], [2.8, -3.12, 0.5]], { w: 2, o: 0.6 });
  for (let i = 0; i < 3; i++) ink.line([[2.66 + i * 0.14, -2.53, 0.51], [2.66 + i * 0.14, -2.3, 0.51]], { w: 2, c: P.seal, o: 0.6 });
  smokeCurl(s, 2.8, -2.3, 2.2);
  // 钟 + 声波
  ink.curve((t) => [6.55 + 0.3 * t, 0.62 - 0.34 * t - 0.06 * Math.sin(t * Math.PI), 0.5], 8, { w: 1, o: 0.8 });
  ink.curve((t) => [6.85 - 0.3 * t, 0.62 - 0.34 * t - 0.06 * Math.sin(t * Math.PI), 0.5], 8, { w: 1, o: 0.8 });
  ink.line([[6.55, 0.28, 0.5], [6.85, 0.28, 0.5]], { w: 1, o: 0.8 });
  const bell = s.ink({ boilAmp: 0.01 });
  for (let i = 1; i <= 3; i++) bell.circle(6.7, 0.45, 0.3 + i * 0.28, { a0: -0.7, a1: 0.7, w: 2, c: P.amber, o: 0.5 - i * 0.12, z: 0.5, n: 12 });
  const bb = s.addInk(bell);
  s.anims.push((t) => { bb.group.scale.setScalar(1 + Math.sin(t * 1.2) * 0.03); });
  // 飞来峰石
  ink.curve((t) => [1.0 + 1.3 * t, -2.5 + Math.sin(t * Math.PI) * 0.9 + Math.sin(t * 9) * 0.08, 0.4], 16, { w: 1, o: 0.7 });
  ink.circle(1.5, -2.0, 0.14, { w: 2, o: 0.4, z: 0.41, n: 8 });
  ink.circle(1.9, -1.85, 0.1, { w: 2, o: 0.35, z: 0.41, n: 8 });
  ink.hatch(1.0, -2.5, 1.3, 0.7, { angle: -0.8, gap: 0.18, o: 0.14, z: 0.4 });
  // 地面
  ink.line([[0.3, -3.2, 0.2], [9.6, -3.2, 0.2]], { w: 2, c: P.inkSoft, o: 0.35, sub: 0.7 });
  annotate(s, ink, '灵隐寺 · 咸和元年', 7.7, 4.7, 5.7, 2.7, { size: 0.44, align: 'right' });
  s.addInk(ink);
  return s;
}

/* ------------------------------------------------------- 陆 · 运河人家 */
function gongchen() {
  const s = newScene('gongchen');
  const ink = s.ink();
  s.add(wash(5, 2.8, 15, 5, P.amber, 0.08, { seed: 18, z: -3 }));
  farHills(s, ink, { baseY: 2.6, amp: 0.5, o: 0.2, x0: -0.5, x1: 9.8, seed: 25 });
  // 桥西人家（远岸）
  houseJiangnan(ink, 6.6, -0.35, 1.1, 0.8, { o: 0.6, windows: 1, steps: 2, lantern: true });
  houseJiangnan(ink, 7.9, -0.3, 1.3, 0.95, { o: 0.65, windows: 2, steps: 3, lantern: true });
  houseJiangnan(ink, 0.4, -0.3, 1.0, 0.75, { o: 0.55, windows: 1, steps: 2 });
  // 近岸人家
  houseJiangnan(ink, 8.5, -1.0, 1.25, 1.15, { o: 0.85, windows: 2, steps: 3, lantern: true });
  willow(ink, 9.4, 0.2, 2.0, { lean: -0.3, o: 0.6 });
  // 拱宸桥：三孔，中孔高
  const deck = (t) => [0.1 + 9.6 * t, -0.55 + 0.95 * Math.sin(t * Math.PI) ** 1.3, 0.5];
  ink.curve(deck, 30, { w: 0, o: 0.92, ghost: true });
  ink.curve((t) => [deck(t)[0], deck(t)[1] - 0.18, 0.5], 30, { w: 2, o: 0.5 });
  ink.curve((t) => [deck(t)[0], deck(t)[1] + 0.26, 0.52], 30, { w: 1, o: 0.75 });
  for (let i = 0; i <= 20; i++) {
    const p = deck(i / 20);
    ink.line([[p[0], p[1], 0.52], [p[0], p[1] + 0.26, 0.52]], { w: 2, o: 0.5 });
  }
  const arches = [[2.1, 0.82], [5.0, 1.5], [7.9, 0.82]];
  const wy = -2.55;
  for (const [ax, ar] of arches) {
    ink.circle(ax, wy, ar, { a0: 0, a1: Math.PI, w: 0, o: 0.9, z: 0.49, n: 22 });
    ink.circle(ax, wy, ar * 0.86, { a0: 0, a1: Math.PI, w: 2, o: 0.4, z: 0.49, n: 20 });
    const n = Math.round(ar * 7);
    for (let i = 1; i < n; i++) {
      const a = (i / n) * Math.PI;
      ink.line([[ax + Math.cos(a) * ar * 0.86, wy + Math.sin(a) * ar * 0.86, 0.5], [ax + Math.cos(a) * ar, wy + Math.sin(a) * ar, 0.5]], { w: 2, o: 0.3 });
    }
    // 倒影
    ink.circle(ax, wy - 0.12, ar * 0.92, { a0: Math.PI, a1: TAU, w: 2, c: P.lake, o: 0.28, z: 0.3, n: 18 });
  }
  // 桥墩
  for (const px of [3.55, 6.45]) ink.line([[px, wy, 0.48], [px, -0.2, 0.48]], { w: 1, o: 0.6 });
  // 河水
  const wk = s.ink({ boilAmp: 0.012 });
  wk.water(-0.5, 9.7, -2.7, -5.8, { rows: 10, o: 0.48 });
  const wb = s.addInk(wk);
  s.anims.push((t) => { wb.group.position.x = Math.sin(t * 0.26) * 0.08; });
  // 乌篷船过中孔
  boatWupeng(ink, 5.0, -3.35, 0.92, {});
  boatWupeng(ink, 1.6, -4.3, 0.6, { figure: false });
  // 灯影
  for (const [lx, ly] of [[7.15, -0.05], [8.5, 0.0], [9.1, 0.15]]) {
    s.add(wash(lx, ly - 1.4, 0.4, 1.6, P.amber, 0.2, { seed: 20, z: 0.25 }));
    ink.line([[lx, -2.7, 0.3], [lx, -3.6, 0.3]], { w: 2, c: P.amber, o: 0.3 });
  }
  annotate(s, ink, '拱宸桥 · 运河南端', 1.2, 2.4, 3.2, 0.2, { size: 0.44 });
  annotate(s, ink, '桥西直街', 8.3, 2.1, 8.5, 0.5, { size: 0.42, align: 'right' });
  s.addInk(ink);
  return s;
}

/* ------------------------------------------------------- 柒 · 河坊街市 */
function hefang() {
  const s = newScene('hefang');
  const ink = s.ink();
  s.add(wash(5, 3.2, 15, 6, P.amber, 0.1, { seed: 22, z: -3 }));
  const vp = { x: 5.0, y: 0.5 };
  // 街面透视
  for (const bx of [0.8, 2.4, 7.6, 9.2]) {
    ink.line([[bx, -5.8, 0.2], [vp.x + (bx - vp.x) * 0.12, vp.y - 0.9, 0.2]], { w: 2, c: P.inkSoft, o: 0.4, sub: 0.6 });
  }
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const y = -5.6 + t * 4.4;
    const hw = 4.4 * (1 - t * 0.82);
    ink.curve((u) => [vp.x - hw + 2 * hw * u, y + Math.sin(u * Math.PI) * 0.08 * (1 - t), 0.2], 14, { w: 2, c: P.inkSoft, o: 0.32 - t * 0.12 });
  }
  // 牌坊（街尽头）
  const px = 5.0, py = -0.5;
  for (const dx of [-1.1, -0.4, 0.4, 1.1]) ink.line([[px + dx, py, 0.3], [px + dx, py + 1.9, 0.3]], { w: 1, o: 0.8 });
  roofChinese(ink, px, py + 1.9, 1.4, 0.4, { up: 0.2, o: 0.85, hatch: false });
  roofChinese(ink, px - 0.75, py + 1.45, 0.5, 0.26, { up: 0.14, o: 0.7, hatch: false });
  roofChinese(ink, px + 0.75, py + 1.45, 0.5, 0.26, { up: 0.14, o: 0.7, hatch: false });
  ink.rect(px - 0.38, py + 1.5, 0.76, 0.3, { w: 2, o: 0.6, z: 0.32 });
  // 两侧店铺（近大远小）
  const shops = [
    [0.5, -1.6, 2.1, 2.6, 0.9], [2.7, -1.3, 1.2, 1.9, 0.75], [3.95, -1.05, 0.7, 1.4, 0.6],
    [7.4, -1.6, 2.1, 2.6, 0.9], [6.2, -1.3, 1.2, 1.9, 0.75], [5.55, -1.05, 0.6, 1.4, 0.6],
  ];
  for (const [sx, sy, sw, sh, o] of shops) {
    ink.rect(sx, sy, sw, sh, { w: 1, o, z: 0.35 });
    ink.line([[sx, sy + sh * 0.52, 0.36], [sx + sw, sy + sh * 0.52, 0.36]], { w: 2, o: o * 0.6 });
    roofChinese(ink, sx + sw / 2, sy + sh, sw * 0.62, sh * 0.16, { up: 0.14, o, hatch: false });
    // 排门板
    for (let i = 1; i < 4; i++) ink.line([[sx + (sw / 4) * i, sy + 0.05, 0.37], [sx + (sw / 4) * i, sy + sh * 0.48, 0.37]], { w: 2, o: o * 0.4 });
    // 幌子
    const fx = sx + sw * 0.86, fy = sy + sh * 0.78;
    ink.line([[fx, fy, 0.4], [fx + 0.22, fy + 0.1, 0.4]], { w: 2, o: o * 0.7 });
    ink.line([[fx + 0.22, fy + 0.1, 0.4], [fx + 0.2, fy - 0.5, 0.4], [fx + 0.36, fy - 0.46, 0.4], [fx + 0.38, fy + 0.12, 0.4]], { w: 2, c: P.seal, o: o * 0.6, closed: true });
    // 灯笼
    ink.circle(sx + sw * 0.2, sy + sh * 0.86, 0.14, { w: 2, c: P.seal, o: o * 0.8, z: 0.4, n: 10 });
    s.add(wash(sx + sw * 0.2, sy + sh * 0.86, 0.55, 0.55, P.amber, 0.32, { seed: 23, z: 0.38 }));
  }
  // 灯笼串
  ink.curve((t) => [1.2 + 7.6 * t, 2.5 - Math.sin(t * Math.PI) * 0.7, 0.45], 18, { w: 2, c: P.inkSoft, o: 0.5 });
  for (let i = 1; i < 6; i++) {
    const t = i / 6, x = 1.2 + 7.6 * t, y = 2.5 - Math.sin(t * Math.PI) * 0.7 - 0.16;
    ink.circle(x, y, 0.16, { w: 2, c: P.seal, o: 0.8, z: 0.46, n: 12 });
    s.add(wash(x, y, 0.6, 0.6, P.amber, 0.38, { seed: 24, z: 0.44 }));
  }
  // 糖画摊 + 人
  ink.circle(1.9, -3.5, 0.5, { a0: 0, a1: Math.PI, w: 1, o: 0.7, z: 0.55, n: 14 }); // 伞
  ink.line([[1.9, -3.5, 0.55], [1.9, -4.3, 0.55]], { w: 2, o: 0.7 });
  ink.rect(1.5, -4.35, 0.85, 0.4, { w: 2, o: 0.65, z: 0.55 });
  figureSimple(ink, 2.7, -4.35, 1.35, {});
  figureSimple(ink, 5.0, -3.7, 1.05, { bend: 0.4 });
  figureSimple(ink, 6.6, -4.55, 1.4, { hat: true });
  annotate(s, ink, '河坊街 · 南宋御街', 1.2, 4.9, 2.6, 2.4, { size: 0.44 });
  annotate(s, ink, '糖画', 1.0, -2.6, 1.7, -3.3, { size: 0.4 });
  s.addInk(ink);
  return s;
}

/* ------------------------------------------------------- 捌 · 钱塘新潮 */
function qiantang() {
  const s = newScene('qiantang');
  const ink = s.ink();
  s.add(wash(5.5, 3, 16, 6, P.hillBlue, 0.07, { seed: 26, z: -3 }));
  ink.circle(8.9, 5.0, 0.5, { w: 2, c: P.amber, o: 0.5, z: -2, n: 18 });
  birds(ink, 2.2, 5.2, 3, 0.8, 0.5);
  // 西兴大桥（斜拉，跨折页）
  const deckY = -0.55;
  ink.line([[-0.5, deckY, 0.1], [3.6, deckY, 0.1]], { w: 1, c: P.hillBlue, o: 0.7 });
  ink.line([[-0.5, deckY - 0.12, 0.1], [3.6, deckY - 0.12, 0.1]], { w: 2, c: P.hillBlue, o: 0.4 });
  for (const tx of [0.6, 2.6]) {
    ink.line([[tx, deckY, 0.12], [tx, 2.7, 0.12]], { w: 0, c: P.hillBlue, o: 0.8 });
    ink.line([[tx - 0.12, deckY, 0.12], [tx - 0.12, 2.5, 0.12]], { w: 2, c: P.hillBlue, o: 0.4 });
    for (let i = 1; i <= 6; i++) {
      const d = i * 0.42;
      ink.line([[tx, 2.6 - i * 0.06, 0.11], [tx - d, deckY, 0.11]], { w: 2, c: P.hillBlue, o: 0.45 });
      ink.line([[tx, 2.6 - i * 0.06, 0.11], [tx + d, deckY, 0.11]], { w: 2, c: P.hillBlue, o: 0.45 });
    }
  }
  // 杭州之门：双塔内弧
  for (const [bx, dir] of [[4.0, 1], [6.4, -1]]) {
    ink.curve((t) => [bx + dir * 0.6 * t * t, -1.1 + 6.1 * t, 0.3], 20, { w: 0, o: 0.92, ghost: true });
    ink.curve((t) => [bx + 0.66 * dir + dir * 0.32 * t * t, -1.1 + 5.9 * t, 0.3], 20, { w: 1, o: 0.72 });
    ink.line([[bx + dir * 0.6, 5.0, 0.31], [bx + 0.66 * dir + dir * 0.32, 4.8, 0.31]], { w: 1, o: 0.85 });
    for (let i = 1; i < 18; i++) {
      const t = i / 18;
      const x1 = bx + dir * 0.6 * t * t, x2 = bx + 0.66 * dir + dir * 0.32 * t * t;
      const y = -1.1 + 6.1 * t;
      ink.line([[x1, y, 0.31], [x2, y - 0.02, 0.31]], { w: 2, c: P.hillBlue, o: 0.32 });
    }
    s.add(wash(bx + dir * 0.4, 1.9, 1.3, 6.0, P.hillBlue, 0.09, { seed: 27, z: 0.2 }));
  }
  // 大金球 + 大剧院月牙
  s.add(wash(8.3, 0.35, 2.6, 2.6, P.amber, 0.3, { seed: 28, z: 0.1 }));
  ink.circle(8.3, 0.35, 1.05, { w: 0, c: P.ink, o: 0.88, z: 0.32, n: 30, ghost: true });
  ink.hatch(7.4, -0.5, 1.8, 1.7, { angle: 0.7, gap: 0.2, o: 0.18, z: 0.31 });
  ink.circle(8.0, 0.7, 0.3, { a0: 0.6, a1: 2.2, w: 2, c: P.amber, o: 0.5, z: 0.33, n: 10 });
  ink.rect(7.5, -1.1, 1.6, 0.3, { w: 2, o: 0.6, z: 0.3 });
  ink.curve((t) => [9.1 + 0.7 * t, -0.5 + Math.sin(t * Math.PI) * 0.7, 0.3], 12, { w: 1, o: 0.7 });
  ink.line([[9.1, -0.5, 0.3], [9.8, -0.5, 0.3]], { w: 2, o: 0.6 });
  // 江面
  const wk = s.ink({ boilAmp: 0.014 });
  wk.water(-0.5, 9.7, -1.3, -5.2, { rows: 10, o: 0.5, c: P.hillBlue });
  const wb = s.addInk(wk);
  s.anims.push((t) => { wb.group.position.x = Math.sin(t * 0.3) * 0.09; });
  // 钱塘潮：一线横江，右端卷起
  const wave = s.ink({ boilAmp: 0.02 });
  wave.curve((t) => [0.4 + 8.6 * t, -3.7 + Math.sin(t * 7) * 0.1 + 0.5 * t * t, 0.5], 34, { w: 0, o: 0.9, ghost: true });
  wave.curve((t) => {
    const a = t * Math.PI * 1.9;
    const r = 0.72 * (1 - t * 0.72);
    return [8.7 + Math.cos(a + 2.4) * r, -3.1 + Math.sin(a + 2.4) * r * 0.85, 0.52];
  }, 22, { w: 1, o: 0.85 });
  wave.curve((t) => [0.6 + 8.0 * t, -4.05 + Math.sin(t * 9 + 1) * 0.08 + 0.3 * t * t, 0.5], 28, { w: 2, c: P.hillBlue, o: 0.5 });
  for (let i = 0; i < 16; i++) {
    const x = 7.4 + rnd(i + 60) * 2.0, y = -2.7 + rnd(i + 70) * 0.9;
    wave.circle(x, y, 0.03 + rnd(i) * 0.035, { w: 2, c: P.hillBlue, o: 0.55, z: 0.53, n: 6 });
  }
  const wvb = s.addInk(wave);
  s.anims.push((t) => { wvb.group.position.x = Math.sin(t * 0.4) * 0.1; });
  // 城市阳台栏杆 + 看潮人
  ink.line([[0.3, -5.5, 0.6], [9.6, -5.5, 0.6]], { w: 1, o: 0.6 });
  for (let i = 0; i < 16; i++) ink.line([[0.5 + i * 0.6, -5.5, 0.6], [0.5 + i * 0.6, -5.85, 0.6]], { w: 2, o: 0.4 });
  figureSimple(ink, 3.0, -5.5, 0.7, {});
  figureSimple(ink, 3.5, -5.5, 0.62, { bend: 0.3 });
  figureSimple(ink, 7.4, -5.5, 0.7, { hat: true });
  annotate(s, ink, '杭州之门 · 三百一十米', 1.2, 5.3, 4.5, 4.7, { size: 0.44 });
  annotate(s, ink, '大金球', 9.0, 2.4, 8.5, 1.2, { size: 0.42, align: 'right' });
  s.addInk(ink);
  return s;
}

export const SCENES = { duanqiao, leifeng, santan, longjing, lingyin, gongchen, hefang, qiantang };

/* 每页共用的诗笺 / 跋 / 页码 / 印，由 stage 统一装配 */
export function furnish(scene, plate, index, total) {
  const poem = poemPlate(plate.poem, plate.author, { charSize: 0.9, colGap: 1.2 });
  const pw = poem.geometry.parameters.width, ph = poem.geometry.parameters.height;
  poem.position.set(-1.7 - pw / 2, 5.15 - ph / 2, 0.7);
  scene.group.add(poem);
  const note = labelPlate(plate.note, { size: 0.34, alpha: 0.62 });
  note.position.set(-5.3, 5.15 - ph - 0.55, 0.7);
  scene.group.add(note);
  const footL = labelPlate('杭州速写本 · ' + plate.latin, { size: 0.26, alpha: 0.4, font: '"Instrument Serif"' });
  footL.position.set(-5.6, -6.35, 0.7);
  scene.group.add(footL);
  const footR = labelPlate(plate.num + ' / 捌', { size: 0.34, alpha: 0.55, font: '"Ma Shan Zheng"' });
  footR.position.set(8.7, -6.3, 0.7);
  scene.group.add(footR);
  const seal = sealPlate(plate.seal, { size: 0.82, rot: -0.06 + index * 0.012 });
  seal.position.set(9.0, -5.55, 0.72);
  scene.group.add(seal);
  const titleSeal = sealPlate(plate.title.slice(0, 2), { size: 0.5, rot: 0.05 });
  titleSeal.position.set(-2.15, 5.62, 0.72);
  scene.group.add(titleSeal);
}