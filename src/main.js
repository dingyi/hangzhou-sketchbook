/* main.js —— 装配与交互。 */
import './style.css';
import { PLATES, SEASONS, ABOUT, COLOPHON, UI, BOOK_TITLE } from './content.js';
import { seasonArt, divider, osmanthus, bigSeal, icons } from './svg.js';
import { Stage } from './three/stage.js';
import { Ambient } from './three/ambient.js';
import { Book } from './book/turn.js';
import { Loupe } from './book/loupe.js';
import { PaperSound } from './book/sound.js';

const $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------------- 静态内容 ---------------- */
function buildStatic() {
  // 导航
  const nav = $('nav');
  UI.nav.forEach((n) => {
    const a = document.createElement('a');
    a.href = '#' + n.id; a.textContent = n.label; a.dataset.sec = n.id;
    nav.appendChild(a);
  });
  const sb = document.createElement('button');
  sb.className = 'sound-btn'; sb.id = 'soundBtn';
  sb.setAttribute('aria-pressed', 'true'); sb.setAttribute('aria-label', UI.soundOn);
  sb.innerHTML = icons.soundOn;
  nav.appendChild(sb);

  $('kicker').innerHTML = `${UI.kicker}<span class="latin">${UI.kickerLatin}</span>`;
  $('sbHint').textContent = coarse ? UI.hintTouch : UI.hint;
  $('sbLeft').innerHTML = icons.prev;
  $('sbRight').innerHTML = icons.next;
  $('heroDown').innerHTML = icons.down;
  $('zOut').innerHTML = icons.zoomOut;
  $('zIn').innerHTML = icons.zoomIn;
  $('loupeBtn').innerHTML = icons.loupe;
  $('boilBtn').innerHTML = icons.boil;
  $('dlBtn').innerHTML = icons.download;
  $('boilBtn').setAttribute('aria-pressed', String(!reduced));
  $('seasonsIntro').textContent = UI.seasonsIntro;

  document.querySelectorAll('[data-rule]').forEach((d) => { d.innerHTML = divider(d.classList.contains('short')); });

  // 四季
  const grid = $('seasonGrid');
  SEASONS.forEach((s, i) => {
    const card = document.createElement('article');
    card.className = 'season-card reveal';
    card.style.transitionDelay = (i * 90) + 'ms';
    card.innerHTML = `<div class="season-art">${seasonArt(s.art)}</div>
      <div class="season-head"><span class="season-char">${s.season}</span><span class="season-name">${s.scene}</span></div>
      <p class="season-line">${s.line}</p>`;
    grid.appendChild(card);
  });

  // 关于
  const ap = $('aboutParas');
  ABOUT.paras.forEach((t) => { const p = document.createElement('p'); p.className = 'para reveal'; p.textContent = t; ap.appendChild(p); });
  $('osmanthus').innerHTML = osmanthus();
  $('aboutVertical').textContent = ABOUT.vertical;

  // 目录
  const list = $('plateList');
  PLATES.forEach((p, i) => {
    const li = document.createElement('li');
    li.className = 'reveal'; li.style.transitionDelay = (i * 50) + 'ms';
    const b = document.createElement('button');
    b.className = 'plate'; b.dataset.i = i;
    b.innerHTML = `<span class="n">${p.num}</span><span class="t">${p.title}</span>
      <span class="p">${p.place}<span class="latin">${p.latin}</span></span>`;
    li.appendChild(b); list.appendChild(li);
  });

  // 跋尾
  $('sealStamp').innerHTML = bigSeal();
  $('exportBtn').innerHTML = icons.download + `<span>${COLOPHON.export}</span>`;
  $('colophonMeta').textContent = COLOPHON.meta;
}

/* ---------------- 提示条 ---------------- */
let toastTimer = null;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function download(url, name) {
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
}

/* ---------------- 降级 ---------------- */
function fallback() {
  $('sbLoading').classList.add('gone');
  const wrap = $('sbWrap');
  wrap.innerHTML = '';
  const fb = document.createElement('div');
  fb.className = 'fallback';
  fb.innerHTML = `<p class="section-label">画册 · 文本版</p>` + PLATES.map((p) =>
    `<div class="fb-card"><h3>${p.num} · ${p.title}</h3>
     <div class="poem">${p.poem.join('<br>')}</div>
     <p style="color:var(--ink-soft);font-size:14px;margin:10px 0 0">${p.note} — ${p.author}</p></div>`).join('');
  wrap.appendChild(fb);
  document.querySelector('.sb-tools')?.remove();
}

/* ---------------- 启动 ---------------- */
async function boot() {
  buildStatic();

  const sound = new PaperSound();
  const canvas = document.createElement('canvas');
  const stage = new Stage(canvas, { reduced });
  const ambient = new Ambient($('ambient'), { reduced });

  // 字体就绪后再画题字，保证快照与实时一致
  try {
    await Promise.all([
      document.fonts.load('16px "Ma Shan Zheng"'),
      document.fonts.load('16px "LXGW WenKai"'),
      document.fonts.load('16px "Instrument Serif"'),
      document.fonts.load('16px "Caveat"'),
    ]);
    await document.fonts.ready;
  } catch (e) { /* 字体失败仍可继续 */ }

  const ok = await stage.init(PLATES);
  if (!ok) { fallback(); ambient.init(); wireStaticOnly(sound); return; }
  ambient.init();

  const book = new Book({
    stage3d: $('sb3d'), book: $('sbBook'), stageEl: $('sbStage'),
    capBox: $('sbCaptions'), hint: $('sbHint'), pages: PLATES, reduced,
    wrapEl: $('sbWrap'),
    onSound: () => sound.rustle(),
    onIndex: (i) => { stage.setScene(i); if (!book.introOn) stage.start(); marks(i); },
    onIntro: (on) => { if (on) stage.stop(); else { stage.setScene(book.idx); stage.start(); } },
  });
  book.attachCanvas(canvas);
  book.onPaint = (i) => { loupe.setIndex(i); marks(i); if (book.turn) stage.stop(); };
  book.onZoom = () => { syncZoom(); loupe.place(); };
  book.onShove = (dir) => loupe.shove(dir);
  book.onTick = () => loupe.ease();

  const loupe = new Loupe({
    sb3d: $('sb3d'), book: $('sbBook'), loupe: $('loupe'), lens: $('loupeLens'),
    zoomWrap: $('zoomWrap'), zoomInner: $('zoomInner'), bookRef: book, enabled: !coarse,
  });
  $('loupeBtn').setAttribute('aria-pressed', String(!coarse));
  if (coarse) $('loupeBtn').disabled = true;

  stage.onSnapshots = () => { loupe.setIndex(book.idx); };
  book.setSnaps(stage.snaps);
  loupe.setSnaps();
  loupe.rest();

  // 尺寸
  const doResize = () => {
    const b = $('sbBook');
    stage.resize(b.clientWidth, b.clientHeight, devicePixelRatio || 1);
    book.layout(); loupe.place();
  };
  new ResizeObserver(doResize).observe($('sbBook'));
  doResize();
  addEventListener('resize', () => { ambient.resize(); loupe.rest(); });

  // 指针倾斜 + 视差
  if (!coarse && !reduced) {
    addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      book.tiltTo(e.clientX, e.clientY);
      const r = $('sbBook').getBoundingClientRect();
      if (r.width) stage.setPointer(clamp((e.clientX - (r.left + r.width / 2)) / (r.width * 0.6), -1, 1),
        clamp(-(e.clientY - (r.top + r.height / 2)) / (r.height * 0.7), -1, 1));
    }, { passive: true });
    addEventListener('pointerout', (e) => { if (!e.relatedTarget) { book.setView(0, 0, book.view.tz); stage.setPointer(0, 0); } });
  }

  // 工具
  function syncZoom() {
    $('zRead').textContent = Math.round(book.view.tz * 100) + '%';
    $('zOut').disabled = book.view.tz <= 0.901;
    $('zIn').disabled = book.view.tz >= 1.499;
  }
  $('zIn').onclick = () => { book.setView(book.view.trx, book.view.try_, book.view.tz * 1.16); };
  $('zOut').onclick = () => { book.setView(book.view.trx, book.view.try_, book.view.tz / 1.16); };
  $('sbLeft').onclick = () => book.step('prev');
  $('sbRight').onclick = () => book.step('next');
  $('loupeBtn').onclick = () => { const on = loupe.toggle(); $('loupeBtn').setAttribute('aria-pressed', String(on)); };
  $('boilBtn').onclick = () => {
    const on = $('boilBtn').getAttribute('aria-pressed') !== 'true';
    $('boilBtn').setAttribute('aria-pressed', String(on));
    stage.setBoil(on);
  };
  let inkTimer = null;
  $('inkRange').oninput = (e) => {
    stage.setDensity(parseInt(e.target.value, 10) / 100);
    clearTimeout(inkTimer);
    inkTimer = setTimeout(() => stage.refreshSnapshots(), 260);
  };
  const exportPage = () => {
    const p = PLATES[book.idx];
    download(stage.currentDataURL(), `hangzhou-sketchbook-${p.id}.png`);
    toast('已收藏「' + p.title + '」线稿');
  };
  $('dlBtn').onclick = exportPage;
  $('exportBtn').onclick = exportPage;
  syncZoom();

  // 声音
  $('soundBtn').onclick = () => {
    const on = $('soundBtn').getAttribute('aria-pressed') !== 'true';
    $('soundBtn').setAttribute('aria-pressed', String(on));
    $('soundBtn').setAttribute('aria-label', on ? UI.soundOn : UI.soundOff);
    $('soundBtn').innerHTML = on ? icons.soundOn : icons.soundOff;
    sound.setEnabled(on);
    if (on) sound.rustle();
  };

  // 目录跳转
  $('plateList').addEventListener('click', (e) => {
    const b = e.target.closest('.plate');
    if (!b) return;
    book.goTo(parseInt(b.dataset.i, 10));
    $('sketchbook').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  });
  function marks(i) {
    document.querySelectorAll('.plate').forEach((b, k) => b.setAttribute('aria-current', k === i ? 'true' : 'false'));
  }

  $('heroDown').onclick = () => $('seasons').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });

  // 可见性：离屏即停，省电
  let heroVisible = true;
  const updateRunning = () => {
    const active = heroVisible && !document.hidden;
    if (active) { if (!book.introOn && !book.turn) stage.start(); ambient.start(); }
    else { stage.stop(); ambient.stop(); }
  };
  new IntersectionObserver((es) => { heroVisible = es[0].isIntersecting; updateRunning(); }, { threshold: 0.05 })
    .observe($('sketchbook'));
  document.addEventListener('visibilitychange', updateRunning);

  wireStaticOnly(sound, ambient);

  // 开场
  $('sbLoading').classList.add('gone');
  document.body.dataset.ready = '1';
  if (Q.has('shot')) {
    book.idx = (parseInt(Q.get('shot'), 10) || 0) % PLATES.length;
    book.paint(); stage.setScene(book.idx); stage.start(); marks(book.idx);
    if (Q.has('turn')) {
      stage.stop();
      book.startTurn(Q.get('dir') || 'next', clamp(parseFloat(Q.get('turn')) || 0.45, 0, 1));
    }
  } else if (Q.has('nointro') || reduced || coarse) {
    book.idx = 0; book.paint(); stage.setScene(0); stage.start(); marks(0);
  } else {
    marks(0);
    setTimeout(() => book.startIntro(), 260);
  }
}

/* 导航高亮 / 入场 / 印章 / 进度 / 底景视差（无论 WebGL 是否可用都生效） */
function wireStaticOnly(sound, ambient) {
  const navLinks = document.querySelectorAll('#nav a[data-sec]');
  const secObs = new IntersectionObserver((es) => {
    es.forEach((en) => {
      if (en.isIntersecting) {
        navLinks.forEach((a) => a.toggleAttribute('aria-current', a.dataset.sec === en.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['sketchbook', 'seasons', 'about', 'plates'].forEach((id) => { const s = $(id); if (s) secObs.observe(s); });

  const revObs = new IntersectionObserver((es) => {
    es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); revObs.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => revObs.observe(el));

  const seal = $('sealStamp');
  new IntersectionObserver((es, obs) => {
    if (es[0].isIntersecting) { seal.classList.add('stamped'); obs.disconnect(); }
  }, { threshold: 0.4 }).observe($('colophon'));

  const bar = $('progressBar');
  const hero = $('sketchbook');
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    if (ambient && ambient.available) {
      const hh = hero.offsetHeight || innerHeight;
      ambient.canvas.style.opacity = (clamp(1 - h.scrollTop / (hh * 0.85), 0, 1) * 0.9).toFixed(3);
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

boot();