/* sound.js —— 翻页的纸声。WebAudio 合成，无外部资源；
   只在用户手势（翻页）后发声，顶部一个开关全局静音。 */
export class PaperSound {
  constructor() {
    this.enabled = true;
    this.ctx = null;
    this.noise = null;
  }
  _ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      const len = Math.floor(this.ctx.sampleRate * 0.22);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      this.noise = buf;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return true;
  }
  rustle() {
    if (!this.enabled) return;
    try {
      if (!this._ensure()) return;
      const ctx = this.ctx, t = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      src.playbackRate.value = 0.9 + Math.random() * 0.3;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1800 + Math.random() * 900;
      bp.Q.value = 0.7;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass'; hp.frequency.value = 700;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.09, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.19);
      src.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
      src.start(t); src.stop(t + 0.22);
    } catch (e) { /* 静默失败，不影响翻页 */ }
  }
  setEnabled(b) { this.enabled = b; if (b) this._ensure(); }
}