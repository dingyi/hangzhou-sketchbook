/* stage.js —— three.js 渲染台：场景装配、实时呼吸、快照、浓淡、视差。 */
import * as THREE from 'three';
import { PALETTE, WORLD } from './ink.js';
import { SCENES, furnish } from './scenes.js';

const SNAP_W = 1760, SNAP_H = 1240;
const CAM_Z = 30;

export class Stage {
  constructor(canvas, { reduced = false } = {}) {
    this.canvas = canvas;
    this.reduced = reduced;
    this.available = false;
    this.scenes = [];
    this.snaps = [];
    this.index = 0;
    this.density = 1.12;
    this.boilOn = !reduced;
    this.pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    this._raf = null;
    this._running = false;
    this._t0 = performance.now();
    this._cssW = 2; this._cssH = 2;
    this.onSnapshots = null;
  }

  async init(plates) {
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: this.canvas, antialias: true, alpha: false,
        preserveDrawingBuffer: true, powerPreference: 'high-performance',
      });
    } catch (e) {
      this.available = false;
      return false;
    }
    this.renderer = renderer;
    this.available = true;
    renderer.setClearColor(new THREE.Color(PALETTE.paper), 1);
    renderer.setPixelRatio(1);
    renderer.setSize(SNAP_W, SNAP_H, false);
    this.camera = new THREE.PerspectiveCamera(
      2 * Math.atan((WORLD.h / 2) / CAM_Z) * 180 / Math.PI, SNAP_W / SNAP_H, 0.1, 100
    );
    this.camera.position.set(0, 0, CAM_Z);
    this.root = new THREE.Scene();

    // 装配八页
    plates.forEach((p, i) => {
      const sc = SCENES[p.id]();
      furnish(sc, p, i, plates.length);
      sc.inks.forEach((k) => { k.setResolution(SNAP_W, SNAP_H); k.setDensity(this.density); });
      this.scenes.push(sc);
    });

    // 预渲染快照（翻页的纸面、放大镜、收藏都用它）
    for (let i = 0; i < this.scenes.length; i++) {
      this._show(i);
      this.scenes[i].inks.forEach((k) => k.boil(0));
      renderer.render(this.root, this.camera);
      this.snaps.push(renderer.domElement.toDataURL('image/png'));
    }
    this._show(this.index);
    if (this.onSnapshots) this.onSnapshots(this.snaps);
    return true;
  }

  _show(i) {
    this.root.clear();
    this.root.add(this.scenes[i].group);
    this.index = i;
  }

  setScene(i) {
    if (i === this.index && this.root.children.length) return;
    this._show(i);
    this._renderOnce();
  }

  resize(cssW, cssH, dpr) {
    if (!this.available) return;
    this._cssW = cssW; this._cssH = cssH;
    this.renderer.setPixelRatio(Math.min(2, dpr));
    this.renderer.setSize(cssW, cssH, false);
    this.camera.aspect = cssW / cssH;
    this.camera.updateProjectionMatrix();
    const w = cssW, h = cssH;
    this.scenes.forEach((sc) => sc.inks.forEach((k) => k.setResolution(w, h)));
    this._renderOnce();
  }

  _renderOnce() {
    if (!this.available) return;
    this.renderer.render(this.root, this.camera);
  }

  setPointer(nx, ny) { this.pointer.tx = nx; this.pointer.ty = ny; }

  setDensity(d) {
    this.density = d;
    this.scenes.forEach((sc) => sc.inks.forEach((k) => k.setDensity(d)));
    this._renderOnce();
    this._dirty = true;
  }

  /* 浓淡改变后重拍快照，放大镜与翻页纸面保持一致 */
  refreshSnapshots() {
    if (!this.available || !this._dirty) return;
    this._dirty = false;
    const cur = this.index;
    const pr = this.renderer.getPixelRatio();
    const size = this.renderer.getSize(new THREE.Vector2());
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(SNAP_W, SNAP_H, false);
    this.scenes.forEach((sc) => sc.inks.forEach((k) => k.setResolution(SNAP_W, SNAP_H)));
    for (let i = 0; i < this.scenes.length; i++) {
      this._show(i);
      this.renderer.render(this.root, this.camera);
      this.snaps[i] = this.renderer.domElement.toDataURL('image/png');
    }
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(size.x, size.y, false);
    this.scenes.forEach((sc) => sc.inks.forEach((k) => k.setResolution(size.x, size.y)));
    this._show(cur);
    this._renderOnce();
    if (this.onSnapshots) this.onSnapshots(this.snaps);
  }

  setBoil(on) { this.boilOn = on; if (!on) this.scenes.forEach((sc) => sc.inks.forEach((k) => k.boil(0))); }

  currentDataURL() {
    if (!this.available) return this.snaps[this.index];
    this._renderOnce();
    return this.renderer.domElement.toDataURL('image/png');
  }

  start() {
    if (!this.available || this._running) return;
    this._running = true;
    this._t0 = performance.now();
    const loop = (now) => {
      if (!this._running) return;
      this._raf = requestAnimationFrame(loop);
      const t = (now - this._t0) / 1000;
      const sc = this.scenes[this.index];
      if (this.boilOn && !this.reduced) {
        const tick = Math.floor(t * 5);
        sc.inks.forEach((k) => k.boil(tick));
      }
      if (!this.reduced) {
        sc.anims.forEach((f) => f(t));
        this.pointer.x += (this.pointer.tx - this.pointer.x) * 0.06;
        this.pointer.y += (this.pointer.ty - this.pointer.y) * 0.06;
        this.camera.position.x = this.pointer.x * 0.5;
        this.camera.position.y = this.pointer.y * 0.35;
        this.camera.lookAt(0, 0, 0);
      }
      this.renderer.render(this.root, this.camera);
    };
    this._raf = requestAnimationFrame(loop);
  }

  stop() {
    this._running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
  }
}