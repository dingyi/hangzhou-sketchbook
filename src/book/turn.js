/* turn.js —— 翻页引擎。移植自 MengTo sketchbook 的曲面书页：
   18 条嵌套 strips 的切线扫过一段弧，纸像纸一样弯，而不是门一样转。
   纸面图像来自 three.js 快照；静止时露出实时 canvas。 */

const N = 18, SPAN = 0.449, BETA = 0.60;
const TILT_X = 4.5, TILT_Y = 7, ZOOM_MIN = 0.9, ZOOM_MAX = 1.5;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function el(t, c) { const e = document.createElement(t); if (c) e.className = c; return e; }

export class Book {
  constructor({ stage3d, book, stageEl, capBox, hint, pages, reduced, onSound, onIndex, wrapEl, onIntro }) {
    this.sb3d = stage3d; this.book = book; this.stageEl = stageEl;
    this.capBox = capBox; this.hint = hint; this.pages = pages;
    this.reduced = reduced; this.onSound = onSound; this.onIndex = onIndex;
    this.wrapEl = wrapEl; this.onIntro = onIntro;
    this.M = pages.length;
    this.snaps = [];
    this.idx = 0; this.turn = null; this.strips = [];
    this.spring = null; this.raf = null; this.last = 0;
    this.view = { rx: 0, ry: 0, z: 1, trx: 0, try_: 0, tz: 1 };
    this.viewActive = false; this.lastZ = 1;
    this.drag = null; this.introOn = false;
    this.onTick = null; this.onPaint = null;
    this.live = el('div', 'sb-live');
    this.artImg = new Image();
    this.artImg.className = 'sb-art';
    this.artImg.draggable = false;
    this.artImg.alt = '';
    this.live.appendChild(this.artImg);
    this.book.appendChild(this.live);
    const zp = el('button', 'sb-zone sb-prev'); zp.setAttribute('aria-label', '上一页');
    const zn = el('button', 'sb-zone sb-next'); zn.setAttribute('aria-label', '下一页');
    this.book.appendChild(zp); this.book.appendChild(zn);
    this._bindPointer();
    this.layout();
    addEventListener('resize', () => this.layout());
  }

  setSnaps(snaps) { this.snaps = snaps; this.paint(); }
  attachCanvas(canvas) { this.live.appendChild(canvas); }
  layout() { this.sb3d.style.setProperty('--bw', this.book.clientWidth + 'px'); }

  /* ------------------------------------------------ DOM */
  _img(i, side) {
    const im = new Image();
    im.className = 'sb-half-img ' + side;
    im.draggable = false; im.alt = '';
    im.src = this.snaps[i];
    return im;
  }
  _half(pos, i) {
    const d = el('div', 'sb-half ' + pos);
    d.appendChild(this._img(i, pos));
    d.appendChild(el('div', 'gutter-shade ' + pos));
    return d;
  }
  _buildCurl(dir, from, to) {
    this.strips = [];
    const c = el('div', 'curl ' + dir);
    c.style.setProperty('--n', N);
    c.style.setProperty('--span', SPAN);
    let host = c;
    for (let i = 0; i < N; i++) {
      const s = el('div', 'strip');
      const gut = 'calc(var(--bw) * 0.5)';
      const sw = 'calc(var(--bw) * ' + SPAN + ' / ' + N + ')';
      const A = 'calc(-1 * (' + gut + ' + ' + i + ' * ' + sw + '))';
      const B = 'calc(' + (i + 1) + ' * ' + sw + ' - ' + gut + ')';
      const f = el('div', 'face front'), b = el('div', 'face back');
      const dress = (e, url, px) => { e.style.backgroundImage = 'url(' + url + ')'; e.style.backgroundPositionX = px; };
      dress(f, this.snaps[from], dir === 'next' ? A : B);
      dress(b, this.snaps[to], dir === 'next' ? B : A);
      f.appendChild(el('div', 'sh')); f.appendChild(el('div', 'gl'));
      b.appendChild(el('div', 'sh')); b.appendChild(el('div', 'gl'));
      s.appendChild(f); s.appendChild(b);
      if (i === N - 1) s.classList.add('edge');
      host.appendChild(s); host = s;
      this.strips.push(s);
    }
    return c;
  }

  paint() {
    this.book.querySelectorAll('.sb-half,.curl').forEach((n) => n.remove());
    if (!this.turn) {
      this.artImg.src = this.snaps[this.idx];
      this.artImg.alt = this.pages[this.idx].title + ' · ' + this.pages[this.idx].place;
      this.live.style.visibility = 'visible';
      this.sb3d.style.setProperty('--shade', '0');
    } else {
      this.live.style.visibility = 'hidden';
      const next = this.turn.dir === 'next';
      this.book.insertBefore(this._half('left', next ? this.turn.from : this.turn.to), this.book.querySelector('.sb-zone'));
      this.book.insertBefore(this._half('right', next ? this.turn.to : this.turn.from), this.book.querySelector('.sb-zone'));
      this.book.insertBefore(this._buildCurl(this.turn.dir, this.turn.from, this.turn.to), this.book.querySelector('.sb-zone'));
      this.applyTurn(this.turn.t);
    }
    this.layout();
    this.caption();
    if (this.onPaint) this.onPaint(this.turn ? this.turn.to : this.idx);
    if (this.onIndex && !this.turn) this.onIndex(this.idx);
  }

  caption() {
    this.capBox.textContent = '';
    this.capOut = this.capIn = null;
    if (this.turn) {
      this.capOut = el('p', 'sb-caption live'); this.capOut.textContent = this.pages[this.turn.from].title;
      this.capIn = el('p', 'sb-caption live'); this.capIn.textContent = this.pages[this.turn.to].title;
      this.capBox.appendChild(this.capOut); this.capBox.appendChild(this.capIn);
      this.fadeCaption(this.turn.t);
    } else {
      const p = el('p', 'sb-caption');
      p.textContent = this.pages[this.idx].title + ' · ' + this.pages[this.idx].place;
      this.capBox.appendChild(p);
    }
  }
  fadeCaption(t) {
    if (!this.capOut) return;
    this.capOut.style.opacity = (1 - clamp((t - 0.10) / 0.28, 0, 1)).toFixed(3);
    this.capIn.style.opacity = clamp((t - 0.56) / 0.30, 0, 1).toFixed(3);
  }

  applyTurn(t) {
    const th = Math.PI * t, beta = BETA * Math.sin(Math.PI * t), D = 180 / Math.PI;
    const tt = th + beta, td = 2 * beta / N;
    this.sb3d.style.setProperty('--tt', (tt * D).toFixed(2) + 'deg');
    this.sb3d.style.setProperty('--td', (td * D).toFixed(3) + 'deg');
    this.sb3d.style.setProperty('--shade', Math.sin(Math.PI * t).toFixed(3));
    this.fadeCaption(t);
    for (let i = 0; i < this.strips.length; i++) {
      const l1 = Math.abs(Math.cos(tt - i * td)), l2 = Math.abs(Math.cos(tt - (i + 1) * td));
      const st = this.strips[i].style;
      st.setProperty('--lit', l1.toFixed(3));
      st.setProperty('--a1', ((1 - l1) * 0.62).toFixed(3));
      st.setProperty('--a2', ((1 - l2) * 0.62).toFixed(3));
    }
  }

  /* ------------------------------------------------ spring loop */
  kick() { if (this.raf === null) { this.last = performance.now(); this.raf = requestAnimationFrame((n) => this.tick(n)); } }
  tick(now) {
    this.raf = null;
    const dt = Math.min(0.032, (now - this.last) / 1000 || 0.016); this.last = now;
    if (this.spring && this.turn) {
      const s = this.spring;
      if (s.kind === 'tween') {
        s.e += dt;
        const k = Math.min(1, s.e / s.dur);
        this.turn.t = s.from + (s.target - s.from) * k;
        this.applyTurn(this.turn.t);
        if (k >= 1) { this.spring = null; s.done && s.done(); }
      } else {
        const x = this.turn.t - s.target;
        s.v += (-s.k * x - s.c * s.v) * dt;
        this.turn.t += s.v * dt;
        if (Math.abs(this.turn.t - s.target) < 0.002 && Math.abs(s.v) < 0.02) {
          this.turn.t = s.target; this.spring = null; this.applyTurn(this.turn.t);
          s.done && s.done();
        } else this.applyTurn(this.turn.t);
      }
    }
    this.viewSpring();
    let lmoved = false;
    if (this.onTick) lmoved = this.onTick();
    if ((this.spring || this.viewActive || lmoved) && this.raf === null) this.raf = requestAnimationFrame((n) => this.tick(n));
  }
  animateTo(target, done, k = 150, c = 22) { this.spring = { kind: 'spring', v: 0, target, done, k, c }; this.kick(); }
  tweenTo(target, dur, done) { this.spring = { kind: 'tween', from: this.turn ? this.turn.t : 0, target, dur, e: 0, done }; this.kick(); }

  /* ------------------------------------------------ view */
  applyView() {
    this.sb3d.style.setProperty('--rx', this.view.rx.toFixed(2) + 'deg');
    this.sb3d.style.setProperty('--ry', this.view.ry.toFixed(2) + 'deg');
    this.sb3d.style.setProperty('--zoom', this.view.z.toFixed(3));
    if (this.view.z !== this.lastZ) { this.lastZ = this.view.z; if (this.onZoom) this.onZoom(); }
  }
  viewSpring() {
    const e = 0.14; let moved = false;
    for (const [k, t] of [['rx', 'trx'], ['ry', 'try_'], ['z', 'tz']]) {
      const d = this.view[t] - this.view[k];
      if (Math.abs(d) > 0.0006) { this.view[k] += d * e; moved = true; }
      else this.view[k] = this.view[t];
    }
    if (moved) this.applyView();
    this.viewActive = moved;
    return moved;
  }
  setView(rx, ry, z) {
    this.view.trx = clamp(rx, -TILT_X, TILT_X);
    this.view.try_ = clamp(ry, -TILT_Y, TILT_Y);
    this.view.tz = clamp(z, ZOOM_MIN, ZOOM_MAX);
    this.viewActive = true; this.kick();
    if (this.onZoom) this.onZoom();
  }
  tiltTo(cx, cy) {
    if (this.drag || this.reduced) return;
    const r = this.book.getBoundingClientRect();
    if (!r.width) return;
    const nx = clamp((cx - (r.left + r.width / 2)) / (r.width * 0.62), -1, 1);
    const ny = clamp((cy - (r.top + r.height / 2)) / (r.height * 0.9), -1, 1);
    this.setView(-ny * TILT_X, nx * TILT_Y, this.view.tz);
  }

  /* ------------------------------------------------ pointer */
  _hideHint() { this.hint && this.hint.classList.add('gone'); }
  _bindPointer() {
    const st = this.stageEl;
    st.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const onBook = e.target.closest('.sb-zone');
      this._hideHint();
      if (!onBook || this.introOn) return;   // 箭头等控件保留自己的 click
      e.preventDefault();
      st.setPointerCapture(e.pointerId);
      const r = this.book.getBoundingClientRect();
      const dir = (e.clientX - r.left) / r.width > 0.5 ? 'next' : 'prev';
      this.startTurn(dir, 0);
      this.drag = { dir, x0: e.clientX, w: r.width, moved: 0, vel: 0, tPrev: performance.now() };
    });
    st.addEventListener('pointermove', (e) => {
      if (!this.drag) return;
      const dx = e.clientX - this.drag.x0;
      this.drag.moved = Math.max(this.drag.moved, Math.abs(dx));
      const raw = (this.drag.dir === 'next' ? -dx : dx) / (this.drag.w * 0.62);
      const t = clamp(raw, 0, 1);
      const now = performance.now();
      this.drag.vel = (t - (this.turn ? this.turn.t : 0)) / Math.max(0.001, (now - this.drag.tPrev) / 1000);
      this.drag.tPrev = now;
      if (this.turn) { this.turn.t = t; this.applyTurn(t); }
    });
    const end = () => {
      if (!this.drag) return;
      const d = this.drag; this.drag = null;
      if (!this.turn) return;
      if (d.moved < 6) { this.commit(); return; }
      if (this.turn.t > 0.42 || d.vel > 1.1) this.commit(); else this.cancel();
    };
    st.addEventListener('pointerup', end);
    st.addEventListener('pointercancel', end);
    st.addEventListener('dragstart', (e) => e.preventDefault());
    st.addEventListener('selectstart', (e) => e.preventDefault());
    st.addEventListener('dblclick', () => this.setView(this.view.trx, this.view.try_, 1));
    addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault(); this._hideHint();
      this.step(e.key === 'ArrowRight' ? 'next' : 'prev');
    });
  }

  /* ------------------------------------------------ turn control */
  startTurn(dir, t) {
    this.spring = null;
    if (this.turn) { this.idx = this.turn.to; this.turn = null; }
    if (this.onShove) this.onShove(dir);
    const from = this.idx;
    this.turn = { dir, from, to: dir === 'next' ? (from + 1) % this.M : (from - 1 + this.M) % this.M, t: t || 0 };
    this.paint();
  }
  commit() {
    if (!this.turn) return;
    if (this.onSound) this.onSound();
    if (this.reduced) { this.idx = this.turn.to; this.turn = null; this.paint(); return; }
    this.animateTo(1, () => { this.idx = this.turn.to; this.turn = null; this.paint(); }, 170, 26);
    this.kick();
  }
  cancel() {
    if (!this.turn) return;
    this.animateTo(0, () => { this.turn = null; this.paint(); }, 150, 24);
    this.kick();
  }
  step(dir) {
    if (this.introOn) this.endIntro();
    if (this.turn) { this.idx = this.turn.to; this.turn = null; }
    this.startTurn(dir, 0); this.commit();
  }
  goTo(i) {
    if (this.introOn) this.endIntro();
    if (i === this.idx) return;
    if (this.turn) { this.idx = this.turn.to; this.turn = null; }
    const fwd = (i - this.idx + this.M) % this.M, back = (this.idx - i + this.M) % this.M;
    if (Math.min(fwd, back) === 1) { this.step(fwd === 1 ? 'next' : 'prev'); return; }
    this.idx = i; this.paint();
    if (this.onSound) this.onSound();
  }

  /* ------------------------------------------------ intro riffle */
  endIntro() {
    this.introOn = false;
    if (this.wrapEl) this.wrapEl.classList.remove('intro', 'b2');
    if (this.onIntro) this.onIntro(false);
    this.onPaint && this.onPaint(this.idx);
  }
  startIntro() {
    const coarse = matchMedia('(max-width: 640px), (pointer: coarse)').matches;
    if (coarse || this.reduced) { this.idx = 0; this.paint(); return; }
    const steps = this.M + 2;
    this.riffle = [];
    for (let r = 0; r < steps; r++) {
      const bell = Math.sin(Math.PI * (r / (steps - 1)));
      this.riffle.push({ bell, dur: 0.26 - 0.19 * bell });
    }
    this.riffleAt = 0; this.introOn = true;
    if (this.wrapEl) this.wrapEl.classList.add('intro');
    if (this.onIntro) this.onIntro(true);
    this._riffleStep();
  }
  _riffleStep() {
    const s = this.riffle[this.riffleAt];
    if (this.wrapEl) this.wrapEl.classList.toggle('b2', s.bell > 0.55);
    this.startTurn('next', 0);
    this.tweenTo(1, s.dur, () => {
      this.idx = this.turn.to; this.turn = null;
      this.riffleAt++;
      if (this.introOn && this.riffleAt < this.riffle.length) { this.paint(); this._riffleStep(); }
      else { this.endIntro(); this.paint(); }
    });
  }
}