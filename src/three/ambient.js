/* ambient.js —— 首屏背后的远山薄雾，一层极淡的 three.js 底景。 */
import * as THREE from 'three';
import { Ink, PALETTE as P, wash } from './ink.js';

export class Ambient {
  constructor(canvas, { reduced = false } = {}) {
    this.canvas = canvas;
    this.reduced = reduced;
    this.available = false;
    this._raf = null;
    this._running = false;
  }

  init() {
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true, preserveDrawingBuffer: false });
    } catch (e) { return false; }
    this.renderer = renderer;
    this.available = true;
    renderer.setClearColor(0x000000, 0);
    this.camera = new THREE.OrthographicCamera(-12, 12, 7, -7, 0.1, 100);
    this.camera.position.z = 30;
    this.root = new THREE.Scene();
    this.inks = [];
    this.anims = [];

    const layers = [
      { y: -1.2, amp: 2.4, o: 0.10, c: P.hillBlue, seed: 2, z: -3 },
      { y: -2.4, amp: 1.9, o: 0.14, c: P.celadon, seed: 7, z: -2 },
      { y: -3.6, amp: 1.4, o: 0.18, c: P.hillBlue, seed: 12, z: -1 },
    ];
    for (const L of layers) {
      const k = new Ink({ boilAmp: 0.01, staticAmp: 0.02, seed: L.seed });
      k.ridge(-12, 12, L.y, L.amp, { seed: L.seed, o: L.o, c: L.c, w: 1, z: L.z });
      k.ridge(-12, 12, L.y - 0.5, L.amp * 0.6, { seed: L.seed + 3, o: L.o * 0.8, c: L.c, w: 2, z: L.z });
      const b = k.build();
      b.parts.forEach((p) => p.mat.resolution.set(innerWidth, innerHeight));
      this.root.add(b.group);
      this.inks.push(k);
      this.root.add(wash(0, L.y - 0.6, 26, 4, L.c, L.o * 0.5, { seed: L.seed, z: L.z - 0.5 }));
    }
    // 飞鸟
    const bk = new Ink({ boilAmp: 0.02, seed: 99 });
    for (let i = 0; i < 5; i++) {
      const x = -6 + i * 2.6, y = 3.2 + (i % 2) * 0.8, w = 0.3;
      bk.line([[x - w, y + 0.12, 1], [x, y, 1], [x + w, y + 0.1, 1]], { w: 2, c: P.inkSoft, o: 0.28, sub: 0.15 });
    }
    const bb = bk.build();
    bb.parts.forEach((p) => p.mat.resolution.set(innerWidth, innerHeight));
    this.root.add(bb.group);
    this.inks.push(bk);
    this.anims.push((t) => { bb.group.position.x = Math.sin(t * 0.05) * 1.5; bb.group.position.y = Math.sin(t * 0.08) * 0.3; });

    this.resize();
    this._render(0);
    return true;
  }

  resize() {
    if (!this.available) return;
    const w = this.canvas.clientWidth || innerWidth;
    const h = this.canvas.clientHeight || innerHeight;
    this.renderer.setPixelRatio(Math.min(1.5, devicePixelRatio));
    this.renderer.setSize(w, h, false);
    const aspect = w / h;
    this.camera.left = -7 * aspect; this.camera.right = 7 * aspect;
    this.camera.updateProjectionMatrix();
    this.inks.forEach((k) => k.setResolution(w, h));
    this._render(performance.now() / 1000);
  }

  _render(t) {
    if (!this.reduced) {
      const tick = Math.floor(t * 3);
      this.inks.forEach((k) => k.boil(tick));
      this.anims.forEach((f) => f(t));
    }
    this.renderer.render(this.root, this.camera);
  }

  start() {
    if (!this.available || this._running || this.reduced) return;
    this._running = true;
    const loop = (now) => {
      if (!this._running) return;
      this._raf = requestAnimationFrame(loop);
      this._render(now / 1000);
    };
    this._raf = requestAnimationFrame(loop);
  }

  stop() { this._running = false; if (this._raf) cancelAnimationFrame(this._raf); this._raf = null; }
}