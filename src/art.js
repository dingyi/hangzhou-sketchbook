/* art.js —— 页面合成：把 Painter 原创插画作为整幅跨页纸面，
   再以 2D canvas 精确叠印竖排诗笺、款识、跋、印章与页码。
   合成图同时用于实时显示、翻页纸面、放大镜与导出，保证一致与清晰。 */
import { PALETTE as P } from './three/ink.js';

const CW = 2240, CH = 1580; // 跨页合成分辨率（≈1760/1240）
const DISPLAY = '"Ma Shan Zheng", "LXGW WenKai", serif';
const BODY = '"LXGW WenKai", serif';
const SERIF = '"Instrument Serif", Georgia, serif';

function rnd(seed) { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function cv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

/* 竖排诗笺：右起数列，字带轻微倾侧；款识左侧小字自上而下 */
export function makePoem(lines, author, charPx, colGapPx, color = P.ink) {
  const px = Math.round(charPx);
  const colW = Math.round(colGapPx);
  const maxLen = Math.max(...lines.map((l) => l.length));
  const pad = Math.round(px * 0.5);
  const authorPx = Math.round(px * 0.42);
  const W = lines.length * colW + colW + pad * 2;
  const H = maxLen * Math.round(px * 1.14) + pad * 2 + authorPx * 3;
  const c = cv(W, H); const ctx = c.getContext('2d');
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
  lines.forEach((ln, ci) => {
    const x = W - pad - colW * (ci + 0.5);
    ctx.font = `${px}px ${DISPLAY}`;
    [...ln].forEach((ch, ri) => {
      const y = pad + px * 0.6 + ri * px * 1.14;
      const rot = (rnd(ci * 7 + ri) - 0.5) * 0.05;
      const dx = (rnd(ri * 3 + ci) - 0.5) * px * 0.05;
      ctx.save(); ctx.translate(x + dx, y); ctx.rotate(rot);
      ctx.globalAlpha = 0.86 + rnd(ci + ri * 2) * 0.14;
      ctx.fillText(ch, 0, 0); ctx.restore();
    });
  });
  ctx.font = `${authorPx}px ${BODY}`; ctx.globalAlpha = 0.66;
  const ax = pad + authorPx * 0.7, ay0 = pad + px * 1.6;
  [...author].forEach((ch, i) => ctx.fillText(ch, ax, ay0 + i * authorPx * 1.18));
  return c;
}

/* 朱文小印：毛边印框 + 白文 + 残破 */
export function makeSeal(chars, sizePx, rot = -0.05) {
  const px = Math.round(sizePx);
  const c = cv(px + 8, px + 8); const ctx = c.getContext('2d');
  const S = c.width;
  ctx.save(); ctx.translate(S / 2, S / 2); ctx.rotate(rot);
  ctx.fillStyle = P.seal; ctx.globalAlpha = 0.92;
  ctx.beginPath();
  const r = S * 0.44, n = 34;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (0.94 + rnd(i * 3 + 11) * 0.09);
    const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.paper; ctx.globalAlpha = 0.96;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const list = [...chars];
  if (list.length === 2) {
    ctx.font = `${S * 0.36}px ${DISPLAY}`;
    ctx.fillText(list[0], 0, -S * 0.2); ctx.fillText(list[1], 0, S * 0.22);
  } else {
    ctx.font = `${S * 0.3}px ${DISPLAY}`;
    ctx.fillText(list[0] || '', -S * 0.18, -S * 0.18); ctx.fillText(list[1] || '', S * 0.18, -S * 0.18);
    ctx.fillText(list[2] || '', -S * 0.18, S * 0.2); ctx.fillText(list[3] || '', S * 0.18, S * 0.2);
  }
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 26; i++) {
    const x = (rnd(i + 2) - 0.5) * S * 0.9, y = (rnd(i + 40) - 0.5) * S * 0.9;
    ctx.globalAlpha = 0.12 + rnd(i + 7) * 0.2;
    ctx.beginPath(); ctx.arc(x, y, 1 + rnd(i + 20) * 2.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  return c;
}

/* 横排小字 */
export function makeLabel(text, px, color = P.ink, alpha = 0.8, font = BODY) {
  px = Math.round(px);
  const pad = Math.round(px * 0.35);
  const meas = cv(4, 4).getContext('2d');
  meas.font = `${px}px ${font}`;
  const tw = Math.ceil(meas.measureText(text).width);
  const c = cv(tw + pad * 2, Math.round(px * 1.5) + pad);
  const ctx = c.getContext('2d');
  ctx.font = `${px}px ${font}`; ctx.fillStyle = color; ctx.globalAlpha = alpha;
  ctx.textBaseline = 'middle'; ctx.fillText(text, pad, c.height / 2);
  return c;
}

function loadImage(url) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = url;
  });
}

/* 合成单页：插画铺满跨页 + 左页诗笺（带淡纸 veil）+ 印章页码 */
export async function buildComposite(plate, index, total) {
  const img = await loadImage(`${import.meta.env.BASE_URL}plates/${plate.id}.webp`);
  const c = cv(CW, CH); const ctx = c.getContext('2d');
  ctx.fillStyle = P.paper; ctx.fillRect(0, 0, CW, CH);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, CW, CH);

  // 左页淡纸 veil： lifting 诗笺，不遮住右页主体
  const veil = ctx.createLinearGradient(0, 0, CW * 0.47, 0);
  veil.addColorStop(0, 'rgba(244,239,227,0.66)');
  veil.addColorStop(0.55, 'rgba(244,239,227,0.42)');
  veil.addColorStop(0.85, 'rgba(244,239,227,0.16)');
  veil.addColorStop(1, 'rgba(244,239,227,0)');
  ctx.fillStyle = veil; ctx.fillRect(0, 0, CW * 0.47, CH * 0.8);

  // 诗笺（右缘靠近中缝，自上而下）
  const charPx = CW * 0.04, colGapPx = CW * 0.058;
  const poem = makePoem(plate.poem, plate.author, charPx, colGapPx);
  const rightEdge = CW * 0.435, top = CH * 0.055;
  ctx.drawImage(poem, rightEdge - poem.width, top);

  // 跋（诗笺下方小字，垫一层柔和纸底保证可读）
  const note = makeLabel(plate.note, CW * 0.0165, P.ink, 0.62);
  const nx = rightEdge - poem.width + charPx * 0.2;
  const ny = top + poem.height + CH * 0.018;
  const ng = ctx.createRadialGradient(nx + note.width / 2, ny + note.height / 2, 0,
    nx + note.width / 2, ny + note.height / 2, Math.max(note.width, note.height) * 0.72);
  ng.addColorStop(0, 'rgba(244,239,227,0.78)');
  ng.addColorStop(0.7, 'rgba(244,239,227,0.4)');
  ng.addColorStop(1, 'rgba(244,239,227,0)');
  ctx.fillStyle = ng;
  ctx.fillRect(nx - note.height, ny - note.height, note.width + note.height * 2, note.height * 3);
  ctx.drawImage(note, nx, ny);

  // 引首章（诗笺右上）
  const headSeal = makeSeal(plate.title.slice(0, 2), CW * 0.026, 0.05);
  ctx.drawImage(headSeal, rightEdge - headSeal.width * 0.4, top - CH * 0.012);

  // 落款印 + 页码（左页下方，与诗笺同侧，右页留给插画）
  const seal = makeSeal(plate.seal, CW * 0.042, -0.06 + index * 0.012);
  ctx.drawImage(seal, CW * 0.355, CH * 0.83);
  const num = makeLabel(`${plate.num} / 捌`, CW * 0.021, P.ink, 0.6, DISPLAY);
  ctx.drawImage(num, CW * 0.36, CH * 0.915);

  // 左页页脚
  const foot = makeLabel(`杭州速写本 · ${plate.latin}`, CW * 0.0145, P.ink, 0.42, SERIF);
  ctx.drawImage(foot, CW * 0.055, CH * 0.925);

  return c;
}

export async function buildAll(plates) {
  const canvases = [];
  const dataURLs = [];
  for (let i = 0; i < plates.length; i++) {
    const c = await buildComposite(plates[i], i, plates.length);
    canvases.push(c);
    dataURLs.push(c.toDataURL('image/jpeg', 0.92));
  }
  return { canvases, dataURLs, width: CW, height: CH };
}