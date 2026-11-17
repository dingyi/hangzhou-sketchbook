/* stage.js —— 渲染台。主体插画是 Painter 原创 PNG 的合成图（snaps）；
   three.js 退为一层透明的轻微动态叠层：水面微光与浮尘，随「线条呼吸」开关。
   快照同时供翻页纸面、放大镜与高清导出使用。 */
import * as THREE from 'three';
import { Ink, PALETTE as P } from './ink.js';
import { buildAll } from '../art.js';

export class Stage {
  constructor(canvas, { reduced = false } = {}) {
    this.canvas = canvas;
    this.reduced = reduced;
    this.available = false;
    this.snaps = [];
    this.index = 0;
    this.density = 1.12;
    this.boilOn = !reduced;
    this.pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    this._raf = null; this._running = false; this._t0 = performance.now();
    this.onSnapshots = null;
  }

  async init(plates) {
    const built = await buildAll(plates);
    this.snaps = built.dataURLs;
    this.canvases = built.canvases;
    this.compositeW = built.width; this.compositeH = built.height;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true, preserveDrawingBuffer: false });
    } catch (e) {
      this.available = false;
      if (this.onSnapshots) this.onSnapshots(this.snaps);
      return true; // 叠层不可用也不影响主体插画
    }
    this.renderer = renderer;
    this.available = true;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    this.camera = new THREE.OrthographicCamera(-10, 10, 7.05, -7.05, 0.1, 100);
    this.camera.position.z = 30;
    this.root = new THREE.Scene();
    this.inks = []; this.anims = [];

    // 水面微光：右页下方几道极淡的横向断笔，缓慢漂移
    const sh = new Ink({ boilAmp: 0.02, staticAmp: 0.02, seed: 5 });
    for (let r = 0; r < 5; r++) {
      const y = -5.0 - r * 0.34;
      for (let s = 0; s < 4; s++) {
        const x = 1.2 + s * 2.1 + (r % 2) * 0.6;
        const len = 0.7 + ((r + s) % 3) * 0.4;
        sh.line([[x, y, 0.2], [x + len, y, 0.2]], { w: 2, c: P.hillBlue, o: 0.16, sub: 0.5 });
      }
    }
    const shb = sh.build(); this.root.add(shb.group); this.inks.push(sh);
    this.anims.push((t) => { shb.group.position.x = Math.sin(t * 0.25) * 0.12; });

    // 浮尘：右页空中几点极淡的微粒，缓缓上浮
    const mo = new Ink({ boilAmp: 0.03, seed: 9 });
    for (let i = 0; i < 5; i++) {
      const x = 2 + i * 1.6, y = 1.5 + (i % 3) * 1.2;
      mo.circle(x, y, 0.04, { w: 2, c: P.amber, o: 0.18, z: 0.3, n: 6 });
    }
    const mob = mo.build(); this.root.add(mob.group); this.inks.push(mo);
    this.anims.push((t) => { mob.group.position.y = Math.sin(t * 0.18) * 0.3; mob.group.position.x = Math.sin(t * 0.12) * 0.2; });

    if (this.onSnapshots) this.onSnapshots(this.snaps);
    return true;
  }

  setScene(i) { this.index = i; }

  resize(cssW, cssH, dpr) {
    if (!this.available) return;
    this.renderer.setPixelRatio(Math.min(2, dpr || 1));
    this.renderer.setSize(cssW, cssH, false);
    const aspect = cssW / cssH;
    this.camera.left = -7.05 * aspect; this.camera.right = 7.05 * aspect;
    this.camera.updateProjectionMatrix();
    this.inks.forEach((k) => k.setResolution(cssW, cssH));
    this._render(performance.now() / 1000);
  }

  setPointer(nx, ny) { this.pointer.tx = nx; this.pointer.ty = ny; }
  setDensity(d) { this.density = d; this.inks.forEach((k) => k.setDensity(d)); }
  refreshSnapshots() { /* 浓淡由纸面 CSS 滤镜实时呈现，快照无需重拍 */ }
  setBoil(on) { this.boilOn = on; if (!on) this.inks.forEach((k) => k.boil(0)); }
  currentDataURL() { return this.canvases[this.index].toDataURL('image/png'); }

  _render(t) {
    if (!this.available) return;
    if (this.boilOn && !this.reduced) {
      const tick = Math.floor(t * 5);
      this.inks.forEach((k) => k.boil(tick));
      this.anims.forEach((f) => f(t));
      this.pointer.x += (this.pointer.tx - this.pointer.x) * 0.06;
      this.pointer.y += (this.pointer.ty - this.pointer.y) * 0.06;
      this.camera.position.x = this.pointer.x * 0.25;
      this.camera.position.y = this.pointer.y * 0.18;
      this.camera.lookAt(0, 0, 0);
    }
    this.renderer.render(this.root, this.camera);
  }

  start() {
    if (!this.available || this._running || this.reduced) return;
    this._running = true; this._t0 = performance.now();
    const loop = (now) => {
      if (!this._running) return;
      this._raf = requestAnimationFrame(loop);
      this._render((now - this._t0) / 1000);
    };
    this._raf = requestAnimationFrame(loop);
  }
  stop() { this._running = false; if (this._raf) cancelAnimationFrame(this._raf); this._raf = null; }
}