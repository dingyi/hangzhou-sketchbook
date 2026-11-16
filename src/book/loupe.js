/* loupe.js —— 可拖拽放大镜。镜片下是 current plate 的快照，
   随书页缩放校正，翻页时被书页推开。移植自原版的几何。 */
const MAG = 2.3;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class Loupe {
  constructor({ sb3d, book, loupe, lens, zoomWrap, zoomInner, bookRef, enabled }) {
    this.sb3d = sb3d; this.bookEl = book; this.loupe = loupe; this.lens = lens;
    this.zoomWrap = zoomWrap; this.zoomInner = zoomInner; this.B = bookRef;
    this.enabled = enabled; this.on = enabled;
    this.lx = null; this.ly = null; this.lgrab = null; this.lTarget = null;
    this.page = document.createElement('div');
    this.page.className = 'loupe-page';
    this.zoomInner.appendChild(this.page);
    this.index = 0;
    this._bind();
  }

  setSnaps() { this.setIndex(this.B.idx); }
  setIndex(i) {
    this.index = i;
    const url = this.B.snaps[i];
    if (url) this.page.style.backgroundImage = 'url(' + url + ')';
    this.place();
  }
  size() { return Math.round(clamp(this.bookEl.clientWidth * 0.235, 165, 262)); }

  rest() {
    const w = this.bookEl.clientWidth, h = this.bookEl.clientHeight;
    this.lx = w * 0.6; this.ly = h * 0.82;
    this.place();
  }

  place() {
    if (this.lx === null || !this.on) { this.zoomWrap.style.opacity = '0'; return; }
    const bw = this.bookEl.clientWidth, bh = this.bookEl.clientHeight;
    if (!bw) return;
    const R = this.size() / 2, bez = R * 2 * 0.058;
    this.loupe.style.setProperty('--lr', R * 2 + 'px');
    this.loupe.style.transform = 'translate3d(' + (this.lx - R).toFixed(1) + 'px,' + (this.ly - R).toFixed(1) + 'px,0)';
    this.loupe.classList.add('on');
    this.page.style.width = bw + 'px';
    this.page.style.height = bh + 'px';
    const z = this.B.view.z, cx = bw / 2, cy = bh / 2;
    const x0 = 0, x1 = bw, y0 = 0, y1 = bh;
    const nx = clamp(this.lx, x0, x1), ny = clamp(this.ly, y0, y1);
    const inside = (this.lx > x0 && this.lx < x1 && this.ly > y0 && this.ly < y1)
      ? Math.min(this.lx - x0, x1 - this.lx, this.ly - y0, y1 - this.ly)
      : -Math.hypot(this.lx - nx, this.ly - ny);
    const k = clamp((inside + R * 0.30) / (R * 0.55), 0, 1);
    this.zoomWrap.style.opacity = k.toFixed(3);
    if (k <= 0.002) return;
    const r = (R - bez).toFixed(1);
    const mask = 'radial-gradient(circle ' + r + 'px at ' + this.lx.toFixed(1) + 'px ' + this.ly.toFixed(1) + 'px,#000 calc(100% - 1px),transparent 100%)';
    this.zoomWrap.style.webkitMaskImage = mask;
    this.zoomWrap.style.maskImage = mask;
    const px = cx + (this.lx - cx) / z, py = cy + (this.ly - cy) / z, s = MAG * z;
    this.zoomInner.style.transform = 'translate(' + (this.lx - px * s).toFixed(1) + 'px,' + (this.ly - py * s).toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
  }

  shove(dir) {
    if (!this.on || this.lx === null || this.lgrab) return;
    const w = this.bookEl.clientWidth, h = this.bookEl.clientHeight;
    const nx = (w / 2 + (this.lx - w / 2) / this.B.view.z) / w;
    const ny = (h / 2 + (this.ly - h / 2) / this.B.view.z) / h;
    if (nx < 0.02 || nx > 0.98 || ny < 0.02 || ny > 0.98) return;
    this.lTarget = { x: w * (dir === 'next' ? 0.12 : 0.88), y: h * 0.855 };
    this.B.kick();
  }

  ease() {
    if (!this.lTarget) return false;
    if (this.lgrab) { this.lTarget = null; return false; }
    const dx = this.lTarget.x - this.lx, dy = this.lTarget.y - this.ly;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) { this.lx = this.lTarget.x; this.ly = this.lTarget.y; this.lTarget = null; this.place(); return false; }
    this.lx += dx * 0.17; this.ly += dy * 0.17; this.place();
    return true;
  }

  toggle() {
    this.on = !this.on;
    this.loupe.classList.toggle('on', this.on);
    if (this.on && this.lx === null) this.rest();
    if (!this.on) this.zoomWrap.style.opacity = '0';
    return this.on;
  }

  _bind() {
    this.loupe.addEventListener('pointerdown', (e) => {
      if (!this.on || e.button !== 0) return;
      e.preventDefault(); e.stopPropagation();
      this.lTarget = null;
      this.lgrab = { cx: e.clientX, cy: e.clientY, lx0: this.lx, ly0: this.ly };
      this.loupe.classList.add('held');
      this.loupe.setPointerCapture(e.pointerId);
    });
    this.loupe.addEventListener('pointermove', (e) => {
      if (!this.lgrab) return;
      const w = this.bookEl.clientWidth, h = this.bookEl.clientHeight, R = this.size() / 2;
      this.lx = clamp(this.lgrab.lx0 + (e.clientX - this.lgrab.cx), -R * 0.7, w + R * 0.7);
      this.ly = clamp(this.lgrab.ly0 + (e.clientY - this.lgrab.cy), -R * 0.7, h + R);
      this.place();
    });
    const drop = () => { this.lgrab = null; this.loupe.classList.remove('held'); };
    this.loupe.addEventListener('pointerup', drop);
    this.loupe.addEventListener('pointercancel', drop);
  }
}