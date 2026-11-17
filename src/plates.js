/* 九幅杭州图版 + 页面装饰，全部程序化绘制，无外部图片。 */
import { W, H, BX0, BY0, BW, BH, GX, AX, AY, AW, AH, makeSketch } from './sketch.js';

const R1 = AX + AW;            // 画面右缘 1634
const B1 = AY + AH;            // 画面下缘 934

function clipBook(ctx) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(BX0 + 2, BY0 + 2, BW - 4, BH - 4, 14);
  ctx.clip();
}

/* 01 灵隐梵音：黄墙重檐大殿 + 飞来峰松石 + 香炉青烟 */
function lingyin(S, ctx) {
  S.band(AX, R1, AY + 70, 120, '190,176,140', 0.12);
  S.hills(AX, GX + 120, AY + 250, 150, '120,130,110', 0.14, 1.2);
  for (const [x, y, s] of [[260, 560, 1.1], [330, 590, 0.9], [1500, 600, 1.15], [1560, 640, 0.9]]) S.pine(x, y, s);
  // 飞来峰石
  S.poly(S.blobPts(300, 640, 90, 52, 12, 0.3), '140,134,120', 0.2);
  S.line(S.blobPts(300, 640, 90, 52, 12, 0.3), { w: 1.3, a: 0.5 });
  // 大殿
  const cx = 990, base = 800, w = 560;
  S.poly([[cx - w / 2 - 30, base], [cx + w / 2 + 30, base], [cx + w / 2 + 14, base - 26], [cx - w / 2 - 14, base - 26]], '150,138,116', 0.2);
  for (let i = 0; i < 3; i++) S.seg(cx - w / 2 - 26 + i * 5, base - i * 8, cx + w / 2 + 26 - i * 5, base - i * 8, { w: 1.1, a: 0.5, passes: 1 });
  const wy = base - 26, wh = 150;
  S.poly([[cx - w * 0.44, wy], [cx + w * 0.44, wy], [cx + w * 0.44, wy - wh], [cx - w * 0.44, wy - wh]], '214,178,106', 0.3);
  for (let i = 0; i <= 6; i++) {
    const px = cx - w * 0.44 + (w * 0.88) * i / 6;
    S.seg(px, wy, px, wy - wh, { w: 1.7, a: 0.75, col: '96,64,40' });
  }
  for (let i = 0; i < 6; i++) {
    const dx = cx - w * 0.44 + (w * 0.88) * (i + 0.5) / 6;
    S.seg(dx - 14, wy - 20, dx + 14, wy - 20, { w: 1, a: 0.4, col: '96,64,40', passes: 1 });
    S.seg(dx, wy - 20, dx, wy - wh * 0.72, { w: 1, a: 0.4, col: '96,64,40', passes: 1 });
    for (let k = 1; k < 4; k++) S.seg(dx - 12, wy - 20 - k * 22, dx + 12, wy - 20 - k * 22, { w: 0.7, a: 0.3, col: '96,64,40', passes: 1 });
  }
  S.roof(cx, wy - wh, w * 1.06, 64);
  const uy = wy - wh - 52;
  S.poly([[cx - w * 0.3, uy], [cx + w * 0.3, uy], [cx + w * 0.3, uy - 64], [cx - w * 0.3, uy - 64]], '214,178,106', 0.26);
  for (let i = 0; i <= 4; i++) S.seg(cx - w * 0.3 + w * 0.6 * i / 4, uy, cx - w * 0.3 + w * 0.6 * i / 4, uy - 64, { w: 1.4, a: 0.65, col: '96,64,40' });
  S.roof(cx, uy - 64, w * 0.72, 56);
  // 匾额
  ctx.fillStyle = 'rgba(46,40,34,.8)';
  ctx.fillRect(cx - 52, uy - 52, 104, 34);
  S.label('灵隐寺', cx, uy - 34, 24, '236,226,200');
  // 香炉与烟
  const ix = 620, iy = 828;
  S.poly([[ix - 26, iy], [ix + 26, iy], [ix + 20, iy - 30], [ix - 20, iy - 30]], '110,100,84', 0.3);
  S.line([[ix - 26, iy], [ix + 26, iy], [ix + 20, iy - 30], [ix - 20, iy - 30], [ix - 26, iy]], { w: 1.5, a: 0.7 });
  S.seg(ix - 16, iy, ix - 20, iy + 14, { w: 1.6, a: 0.7 }); S.seg(ix + 16, iy, ix + 20, iy + 14, { w: 1.6, a: 0.7 });
  for (const o of [-8, 0, 8]) S.curve(ix + o, iy - 32, ix + o + 14, iy - 90, ix + o - 6, iy - 150, { w: 1.1, a: 0.3, col: '120,120,116', passes: 1 });
  S.figure(760, 850, 1.1); S.figure(800, 856, 1); S.figure(1240, 852, 1.05);
  S.birds(1300, AY + 80, 3);
  S.water(AX, R1, 880, B1, '150,150,140', 0.06);
}

/* 02 河坊街市：牌坊 + 清末商铺 + 灯笼串 */
function hefang(S, ctx) {
  S.band(AX, R1, AY + 60, 110, '206,180,140', 0.14);
  const vy = 700; // 街面消失带
  // 左侧商铺（近大）
  const shop = (x, w, h, floors, sign) => {
    const y = 830;
    S.poly([[x, y], [x + w, y], [x + w, y - h], [x, y - h]], '226,214,190', 0.28);
    S.path([[x, y], [x, y - h], [x + w, y - h], [x + w, y]], { w: 1.6, a: 0.75 });
    S.roof(x + w / 2, y - h, w * 1.12, 30);
    for (let f = 0; f < floors; f++) {
      const fy = y - h * (f + 1) / (floors + 0.4);
      S.seg(x + 6, fy, x + w - 6, fy, { w: 1.1, a: 0.5, passes: 1 });
      for (let k = 0; k < 3; k++) {
        const wx = x + w * (k + 0.5) / 3;
        S.path([[wx - 12, fy - 8], [wx + 12, fy - 8], [wx + 12, fy - 34], [wx - 12, fy - 34], [wx - 12, fy - 8]], { w: 1, a: 0.5, passes: 1 });
        S.seg(wx, fy - 8, wx, fy - 34, { w: 0.7, a: 0.35, passes: 1 });
      }
    }
    // 门板
    for (let k = 0; k < 4; k++) S.seg(x + w * (k + 0.5) / 4, y, x + w * (k + 0.5) / 4, y - 46, { w: 1, a: 0.45, passes: 1 });
    if (sign) {
      const sx = x + w - 14;
      ctx.fillStyle = 'rgba(70,58,44,.82)'; ctx.fillRect(sx - 12, y - h + 26, 24, 64);
      S.label(sign, sx, y - h + 48, 17, '238,228,204');
      S.label(sign === '茶' ? '庄' : '铺', sx, y - h + 72, 17, '238,228,204');
    }
    S.lantern(x + 18, y - h + 40, 1);
  };
  shop(240, 190, 250, 2, '茶');
  shop(450, 150, 210, 1, '酥');
  shop(1180, 170, 230, 2, '伞');
  shop(1370, 190, 260, 2, '药');
  // 牌坊
  const px = 800, py = 848, pw = 300, ph = 300;
  for (const k of [-0.5, -0.17, 0.17, 0.5]) S.seg(px + pw * k, py, px + pw * k, py - ph * (Math.abs(k) > 0.3 ? 0.72 : 0.92), { w: 3, a: 0.8, col: '80,70,58' });
  S.seg(px - pw * 0.55, py - ph * 0.66, px + pw * 0.55, py - ph * 0.66, { w: 2.2, a: 0.75, col: '80,70,58' });
  S.seg(px - pw * 0.22, py - ph * 0.86, px + pw * 0.22, py - ph * 0.86, { w: 2, a: 0.75, col: '80,70,58' });
  S.roof(px, py - ph * 0.92, pw * 0.52, 34);
  S.roof(px - pw * 0.38, py - ph * 0.72, pw * 0.3, 24);
  S.roof(px + pw * 0.38, py - ph * 0.72, pw * 0.3, 24);
  ctx.fillStyle = 'rgba(52,46,38,.82)'; ctx.fillRect(px - 56, py - ph * 0.84, 112, 34);
  S.label('河坊街', px, py - ph * 0.84 + 18, 22, '238,228,204');
  // 灯笼串
  S.curve(430, 540, 800, 606, 1180, 548, { w: 1, a: 0.5, passes: 1 });
  for (let i = 1; i < 7; i++) {
    const t = i / 7, u = 1 - t;
    const lx = u * u * 430 + 2 * u * t * 800 + t * t * 1180;
    const ly = u * u * 540 + 2 * u * t * 606 + t * t * 548;
    S.seg(lx, ly, lx, ly + 10, { w: 0.9, a: 0.5, passes: 1 });
    S.lantern(lx, ly + 20, 1.05);
  }
  // 石板路
  for (let i = 0; i < 12; i++) {
    const t = i / 12, y = 850 + t * 74;
    S.seg(300 - t * 120, y, 1500 + t * 100, y + 2, { w: 0.9, a: 0.2 + t * 0.12, passes: 1 });
  }
  for (let i = 0; i < 9; i++) {
    const x = 380 + i * 130;
    S.seg(x, 852, x + (x - 880) * 0.16, 926, { w: 0.8, a: 0.16, passes: 1 });
  }
  S.figure(680, 902, 1.5); S.figure(950, 894, 1.4); S.figure(1060, 908, 1.55); S.figure(560, 882, 1.2);
}

/* 03 曲院风荷：莲叶莲花 + 曲桥 + 亭 */
function quyuan(S, ctx) {
  S.band(AX, R1, AY + 60, 100, '180,190,170', 0.12);
  S.hills(AX, R1, AY + 210, 90, '130,144,124', 0.12, 2.4);
  S.willow(300, 640, 220, 1.1);
  S.water(AX, R1, 620, B1, '118,138,138', 0.18);
  // 曲桥（低平折桥）
  const by = 700;
  const segs = [[560, by], [760, by - 14], [980, by + 6], [1180, by - 10]];
  for (let i = 0; i < segs.length - 1; i++) {
    const [x1, y1] = segs[i], [x2, y2] = segs[i + 1];
    S.seg(x1, y1, x2, y2, { w: 2, a: 0.75 });
    S.seg(x1, y1 + 8, x2, y2 + 8, { w: 1.2, a: 0.5, passes: 1 });
    const n = 5;
    for (let k = 0; k <= n; k++) {
      const t = k / n, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
      S.seg(x, y, x, y - 12, { w: 1, a: 0.6, passes: 1 });
    }
    S.seg(x1, y1 - 12, x2, y2 - 12, { w: 1, a: 0.55, passes: 1 });
    S.refl((x1 + x2) / 2, y2 + 12, 18, '70,90,90', 0.14, 1.4);
  }
  S.pavilion(1310, 690, 150, 130);
  // 前景莲叶
  for (const [x, y, r, rot] of [[380, 850, 120, 2.2], [540, 880, 90, 0.6], [250, 780, 80, 4.0], [1420, 860, 110, 1.4], [1550, 800, 76, 3.2], [1280, 900, 84, 5.2], [700, 910, 70, 2.8]]) {
    S.seg(x, y + r * 0.5, x + 6, y + r * 0.5 + 30, { w: 1.6, a: 0.5, col: '70,94,64' });
    S.lotusLeaf(x, y, r, rot);
  }
  S.lotusFlower(470, 760, 1.5);
  S.lotusFlower(1470, 730, 1.3);
  S.lotusFlower(640, 820, 1.1, true);
  // 蜻蜓
  const dx0 = 860, dy0 = 616;
  S.seg(dx0, dy0, dx0 + 30, dy0 - 6, { w: 1.6, a: 0.7, col: '150,80,60', passes: 1 });
  S.blob(dx0 + 30, dy0 - 6, 2.4, 2.4, '150,80,60', 0.7, 0.1);
  for (const [dx, dy] of [[-5, -10], [5, -10], [-5, 8], [5, 8]]) S.curve(dx0 + 12, dy0 - 2, dx0 + 12 + dx * 2, dy0 - 2 + dy, dx0 + 12 + dx * 3.6, dy0 - 2 + dy * 1.5, { w: 0.9, a: 0.5, col: '120,110,90', passes: 1 });
  S.birds(1150, AY + 70, 2);
}

/* 04 花港观鱼：红鱼池 + 拱桥 + 亭 + 柳 */
function huagang(S, ctx) {
  S.band(AX, R1, AY + 60, 100, '186,196,176', 0.12);
  S.hills(AX, R1, AY + 200, 80, '130,144,124', 0.12, 0.8);
  S.water(AX, R1, 600, B1, '122,142,138', 0.2);
  S.stoneBridge(430, 640, 340, 110, 1);
  S.pavilion(1290, 640, 160, 140);
  S.willow(220, 620, 230, 1.15);
  S.willow(1540, 630, 210, 1);
  S.tree(1120, 630, 1, '110,130,90');
  // 锦鲤
  for (const [x, y, s, r, c] of [[660, 780, 1.5, 0.3, '196,84,52'], [820, 830, 1.8, -0.5, '206,96,58'], [980, 770, 1.3, 2.6, '188,70,44'], [1120, 850, 1.6, 0.9, '214,120,70'], [760, 890, 1.2, -2.2, '196,84,52'], [1300, 800, 1.4, 1.8, '206,96,58']]) {
    S.koi(x, y, s, r, c);
    S.curve(x - 30 * s, y + 8, x, y + 12, x + 30 * s, y + 8, { w: 0.8, a: 0.14, col: '70,90,90', passes: 1 });
  }
  // 池石岸
  S.poly(S.blobPts(300, 900, 110, 34, 12, 0.3), '150,142,124', 0.26);
  S.line(S.blobPts(300, 900, 110, 34, 12, 0.3), { w: 1.2, a: 0.45 });
  S.poly(S.blobPts(1520, 910, 100, 30, 12, 0.3), '150,142,124', 0.26);
  S.line(S.blobPts(1520, 910, 100, 30, 12, 0.3), { w: 1.2, a: 0.45 });
  S.birds(1050, AY + 70, 3);
}

/* 05 三潭印月：月夜 + 三座石塔 */
function santan(S, ctx) {
  // 夜空：更深的蓝灰，让月亮与灯火跳出来
  S.band(AX, R1, AY + 90, 170, '86,100,120', 0.3);
  S.band(AX, R1, AY + 230, 90, '106,120,136', 0.18);
  // 月
  const mx = 1370, my = AY + 130;
  S.blob(mx, my, 104, 104, '214,210,190', 0.16, 0.06);
  ctx.fillStyle = 'rgba(248,244,228,.95)';
  ctx.beginPath(); ctx.arc(mx, my, 56, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(120,120,110,.45)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(mx, my, 56, 0, 7); ctx.stroke();
  // 小瀛洲
  S.hills(AX + 100, R1 - 60, 640, 46, '76,88,92', 0.28, 3.1);
  S.pavilion(700, 630, 90, 74, '50,54,58');
  S.tree(1050, 628, 0.7, '70,86,76');
  S.water(AX, R1, 660, B1, '76,94,112', 0.3);
  // 月光倒影：一道柔光带 + 由近及远的粼粼碎金
  const mg = ctx.createLinearGradient(0, 670, 0, B1);
  mg.addColorStop(0, 'rgba(232,228,204,0)');
  mg.addColorStop(0.35, 'rgba(232,228,204,.16)');
  mg.addColorStop(1, 'rgba(232,228,204,.05)');
  ctx.save(); ctx.filter = 'blur(10px)';
  ctx.fillStyle = mg;
  ctx.beginPath();
  ctx.moveTo(mx - 26, 670); ctx.lineTo(mx + 26, 670);
  ctx.lineTo(mx + 72, B1); ctx.lineTo(mx - 72, B1);
  ctx.closePath(); ctx.fill(); ctx.restore();
  for (let y = 684; y < B1 - 8; y += 13) {
    const k = (y - 684) / (B1 - 692);
    const half = 16 + k * 46, wob = Math.sin(y * 0.35) * 7;
    S.seg(mx + wob - half, y, mx + wob + half, y, { w: 1.8, a: 0.36 - k * 0.12, col: '238,234,210', passes: 1, jit: 1.5 });
  }
  // 三塔：中塔避开中缝
  S.stoneLantern3(560, 760, 1.5, true);
  S.stoneLantern3(940, 800, 1.7, true);
  S.stoneLantern3(1200, 756, 1.45, true);
  S.birds(420, AY + 90, 2, 0.9);
}

/* 06 运河夜色：拱宸桥三孔 + 桥西人家 + 漕船 */
function yunhe(S, ctx) {
  S.band(AX, R1, AY + 80, 150, '96,108,128', 0.26);
  S.band(AX, R1, AY + 210, 80, '140,132,124', 0.14);
  // 桥西历史街区（白墙直角，暖窗）
  const house = (x, w, h) => {
    const y = 640;
    S.poly([[x, y], [x + w, y], [x + w, y - h], [x, y - h]], '232,226,210', 0.32);
    S.path([[x, y], [x, y - h], [x + w, y - h], [x + w, y]], { w: 1.4, a: 0.65 });
    S.roof(x + w / 2, y - h, w * 1.1, 22, '52,56,62');
    for (let k = 0; k < 2; k++) {
      const wx = x + w * (k + 0.5) / 2;
      ctx.fillStyle = 'rgba(226,170,96,.6)'; ctx.fillRect(wx - 8, y - h * 0.6, 16, 20);
      S.path([[wx - 8, y - h * 0.6], [wx + 8, y - h * 0.6], [wx + 8, y - h * 0.6 + 20], [wx - 8, y - h * 0.6 + 20], [wx - 8, y - h * 0.6]], { w: 0.9, a: 0.5, passes: 1 });
    }
  };
  house(1180, 110, 120); house(1300, 130, 150); house(1440, 120, 110);
  house(240, 120, 130); house(370, 100, 100);
  S.water(AX, R1, 660, B1, '74,90,110', 0.3);
  // 拱宸桥
  S.stoneBridge(880, 620, 760, 150, 3, '60,58,54');
  for (const k of [-0.36, -0.12, 0.12, 0.36]) S.lantern(880 + 760 * k, 620 - 150 * 0.34 * Math.sin(Math.PI * (k + 0.5)) - 24, 0.9, true);
  S.boat(880, 780, 1.3);
  S.boat(1350, 840, 1, false);
  // 灯影
  for (const x of [610, 790, 970, 1150]) S.refl(x, 700, 72, '216,160,90', 0.36, 1.4);
  for (const x of [1240, 1360, 1500]) S.refl(x, 668, 54, '216,170,100', 0.3, 1.2);
  S.birds(420, AY + 70, 2, 0.9);
}

/* 07 湖东暮色：保俶塔 + 雷峰塔 + 湖面游船 */
function hudong(S, ctx) {
  S.band(AX, R1, AY + 70, 120, '216,158,108', 0.2);
  S.band(AX, R1, AY + 190, 90, '206,138,108', 0.16);
  // 落日
  const sg = ctx.createRadialGradient(1180, 560, 6, 1180, 560, 78);
  sg.addColorStop(0, 'rgba(240,186,116,.75)');
  sg.addColorStop(0.55, 'rgba(236,176,110,.4)');
  sg.addColorStop(1, 'rgba(236,176,110,0)');
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.arc(1180, 560, 78, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(242,196,128,.6)';
  ctx.beginPath(); ctx.arc(1180, 560, 34, 0, 7); ctx.fill();
  // 宝石山 + 保俶塔（左）
  S.hills(AX, 700, 620, 130, '120,116,104', 0.2, 1.6);
  S.pagoda(400, 540, 46, 7, 26, { slender: true, col: '70,62,52', wash: '160,140,110' });
  S.pine(300, 600, 0.8); S.pine(500, 610, 0.7);
  // 夕照山 + 雷峰塔（右）
  S.hills(1000, R1, 640, 110, '130,110,92', 0.22, 4.2);
  S.pagoda(1380, 580, 110, 5, 40, { col: '76,58,44', wash: '190,140,90', glow: true });
  S.water(AX, R1, 660, B1, '140,128,122', 0.2);
  S.refl(1180, 670, 130, '226,170,110', 0.34, 2);
  S.refl(1380, 670, 84, '120,90,60', 0.26, 1.6);
  S.refl(400, 660, 64, '90,84,70', 0.22, 1.4);
  S.boat(700, 780, 1.2); S.boat(980, 830, 1, false); S.boat(520, 860, 0.9);
  // 前景柳枝：右移避开左侧竖排题字，轻拂保俶塔梢
  S.curve(AX + 270, AY + 10, AX + 380, AY + 40, AX + 470, AY + 90, { w: 2, a: 0.6, col: '70,80,58' });
  for (let i = 0; i < 6; i++) {
    const bx = AX + 320 + i * 28, by = AY + 26 + i * 11;
    S.curve(bx, by, bx + 8, by + 60, bx + 16, by + 110 + i * 6, { w: 1, a: 0.5, col: '70,88,60', passes: 1 });
    for (let t = 0.2; t < 0.95; t += 0.14) S.seg(bx + 16 * t * t, by + (110 + i * 6) * t, bx + 16 * t * t + 4, by + (110 + i * 6) * t + 5, { w: 0.8, a: 0.4, col: '70,88,60', passes: 1 });
  }
  S.birds(900, AY + 80, 4);
}

/* 08 城市阳台：钱江新城——金球会议中心 + 月牙大剧院 + 扭转双子塔 */
function chengshi(S, ctx) {
  S.band(AX, R1, AY + 70, 120, '168,178,190', 0.16);
  const base = 680;
  // 背景楼群（直角轮廓）
  const tower = (x, w, h, grid = true) => {
    S.poly([[x, base], [x + w, base], [x + w, base - h], [x, base - h]], '150,158,166', 0.2);
    S.path([[x, base], [x, base - h], [x + w, base - h], [x + w, base]], { w: 1.4, a: 0.65 });
    if (grid) for (let y = base - h + 16; y < base - 8; y += 18) S.seg(x + 4, y, x + w - 4, y, { w: 0.7, a: 0.24, passes: 1 });
  };
  tower(250, 70, 240); tower(340, 56, 300); tower(410, 80, 200); tower(1500, 70, 260); tower(1580, 50, 190);
  // 国际会议中心（金球）
  const sx = 640, sy = base - 100, sr = 104;
  S.blob(sx, sy, sr, sr, '206,164,92', 0.32, 0.05);
  ctx.strokeStyle = 'rgba(120,96,52,.65)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 7); ctx.stroke();
  for (let i = 1; i < 5; i++) {
    ctx.strokeStyle = 'rgba(120,96,52,.32)'; ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.ellipse(sx, sy, sr * Math.sin(i * 0.32), sr, 0, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(sx, sy, sr, sr * Math.sin(i * 0.32), 0, 0, 7); ctx.stroke();
  }
  S.seg(sx - sr * 0.7, base, sx + sr * 0.7, base, { w: 1.8, a: 0.7 });
  S.seg(sx - sr * 0.5, base, sx - sr * 0.4, sy + sr * 0.8, { w: 1.3, a: 0.55 });
  S.seg(sx + sr * 0.5, base, sx + sr * 0.4, sy + sr * 0.8, { w: 1.3, a: 0.55 });
  // 杭州大剧院（月牙）：两条弧之间拉接幕墙分格，避免笔触溢出轮廓
  const tx = 980;
  const A0 = [tx - 150, base], A1 = [tx - 40, base - 260], A2 = [tx + 130, base - 190];
  const B0 = [tx - 150, base], B1 = [tx + 10, base - 120], B2 = [tx + 130, base - 190];
  const q = (t, p0, p1, p2) => [(1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]];
  S.curve(A0[0], A0[1], A1[0], A1[1], A2[0], A2[1], { w: 2, a: 0.8, col: '80,86,94' });
  S.curve(B0[0], B0[1], B1[0], B1[1], B2[0], B2[1], { w: 1.6, a: 0.7, col: '80,86,94' });
  S.poly([[tx - 150, base], [tx - 40, base - 250], [tx + 130, base - 190], [tx + 10, base - 110]], '160,170,182', 0.18);
  for (let i = 1; i < 9; i++) {
    const t = i / 9, p = q(t, A0, A1, A2), r = q(t, B0, B1, B2);
    S.seg(p[0], p[1], r[0], r[1], { w: 0.8, a: 0.32, col: '80,86,94', passes: 1 });
  }
  // 来福士双子（扭转）：轴线蛇形收分 + 逐层反向楼板 + 扭转棱线
  const twistTower = (cx, w, h, dir) => {
    const top = base - h, N = 20;
    const edge = (side) => {
      const pts = [];
      for (let i = 0; i <= N; i++) {
        const t = i / N, y = base - h * t;
        const sway = Math.sin(t * Math.PI * 2) * (w * 0.14) * dir;
        const half = (w / 2) * (1 - 0.18 * t);
        pts.push([cx + sway + side * half, y]);
      }
      return pts;
    };
    const L = edge(-1), R = edge(1);
    S.poly([...L, ...R.slice().reverse()], '150,160,172', 0.22);
    S.line(L, { w: 1.6, a: 0.75 });
    S.line(R, { w: 1.6, a: 0.75 });
    S.seg(L[N][0], top, R[N][0], top, { w: 1.6, a: 0.75 });
    for (let i = 1; i < 16; i++) {
      const t = i / 16, li = Math.round(t * N);
      const tilt = Math.cos(t * Math.PI * 2) * 6 * dir;
      S.seg(L[li][0], L[li][1] + tilt, R[li][0], R[li][1] - tilt, { w: 0.8, a: 0.34, passes: 1 });
    }
    S.curve(cx - (w / 2) * dir, base, cx + w * 0.2 * dir, base - h * 0.5, cx + (w / 2) * dir * 0.7, top, { w: 1.1, a: 0.5, passes: 1 });
  };
  twistTower(1270, 64, 330, 1);
  twistTower(1370, 64, 330, -1);
  // 江面与倒影：一道岸线把天际线落在水上
  S.water(AX, R1, base + 10, B1, '86,102,120', 0.3);
  S.seg(AX, base + 10, R1, base + 10, { w: 1.2, a: 0.3, col: '90,104,118', passes: 1 });
  S.refl(sx, base + 16, 150, '200,160,92', 0.42, 2.2);
  S.refl(tx, base + 16, 120, '110,120,132', 0.32, 1.8);
  S.refl(1270, base + 16, 130, '110,120,132', 0.32, 1.8);
  S.refl(1370, base + 16, 130, '110,120,132', 0.32, 1.8);
  S.boat(800, 810, 1, false);
  S.birds(480, AY + 70, 3);
}

/* 09 湖畔市集：湖滨摊位 + 串灯 + 西湖背景 */
function shiji(S, ctx) {
  S.band(AX, R1, AY + 60, 110, '196,190,164', 0.13);
  S.hills(900, R1, AY + 230, 80, '130,142,124', 0.13, 2.0);
  S.water(900, R1, 600, 760, '126,142,142', 0.14);
  S.boat(1420, 680, 0.9);
  S.willow(250, 660, 240, 1.15);
  // 摊位
  const stall = (x, w, sign, col) => {
    const y = 850, h = 150;
    S.seg(x, y, x, y - h, { w: 2.2, a: 0.8 }); S.seg(x + w, y, x + w, y - h, { w: 2.2, a: 0.8 });
    // 条纹棚（直角梯形棚顶 + 波浪檐口）
    const ay = y - h, aw = w + 26;
    S.poly([[x - 13, ay], [x + w + 13, ay], [x + w + 4, ay - 34], [x - 4, ay - 34]], col, 0.32);
    S.path([[x - 13, ay], [x + w + 13, ay], [x + w + 4, ay - 34], [x - 4, ay - 34], [x - 13, ay]], { w: 1.5, a: 0.7 });
    for (let i = 1; i < 6; i++) {
      const t = i / 6;
      S.seg(x - 13 + aw * t, ay, x - 4 + (aw - 18) * t, ay - 34, { w: 0.9, a: 0.4, passes: 1 });
      S.curve(x - 13 + aw * (t - 0.08), ay, x - 13 + aw * (t - 0.04), ay + 7, x - 13 + aw * t, ay, { w: 1, a: 0.55, passes: 1 });
    }
    // 台面与货物
    S.seg(x + 4, y - 56, x + w - 4, y - 56, { w: 1.8, a: 0.75 });
    S.seg(x + 4, y - 48, x + w - 4, y - 48, { w: 1.2, a: 0.5, passes: 1 });
    const goods = ['170,140,90', '150,110,80', '120,140,100', '180,120,90', '140,120,150'];
    for (let i = 0; i < 5; i++) S.blob(x + w * (i + 0.5) / 5, y - 64, 8, 6, goods[i], 0.42, 0.2);
    ctx.fillStyle = 'rgba(60,52,42,.82)'; ctx.fillRect(x + w / 2 - 16, ay - 30, 32, 26);
    S.label(sign, x + w / 2, ay - 17, 17, '240,232,210');
    S.lantern(x + 10, ay + 16, 0.8);
  };
  stall(420, 150, '茶', '150,90,70');
  stall(620, 150, '藕', '110,130,110');
  stall(820, 150, '扇', '150,110,70');
  stall(1020, 150, '绸', '120,90,110');
  // 串灯
  S.curve(400, 616, 780, 656, 1180, 622, { w: 0.9, a: 0.45, passes: 1 });
  for (let i = 1; i < 9; i++) {
    const t = i / 9, u = 1 - t;
    const lx = u * u * 400 + 2 * u * t * 780 + t * t * 1180;
    const ly = u * u * 616 + 2 * u * t * 656 + t * t * 622;
    S.blob(lx, ly + 6, 6, 6, '236,190,110', 0.22, 0.1);
    S.blob(lx, ly + 6, 3, 3.6, '228,176,92', 0.6, 0.1);
  }
  // 石板与行人
  for (let i = 0; i < 6; i++) S.seg(300, 868 + i * 12, 1240, 870 + i * 12, { w: 0.8, a: 0.15, passes: 1 });
  S.figure(560, 912, 1.5); S.figure(760, 908, 1.4); S.figure(940, 916, 1.55); S.figure(1130, 904, 1.25);
  S.birds(1300, AY + 70, 2);
}

const SCENES = [
  { key: 'lingyin', fn: lingyin, title: '灵隐梵音', place: '天竺路', date: 'OCT 2024', seal: '灵隐', seed: 101 },
  { key: 'hefang', fn: hefang, title: '河坊街市', place: '南宋御街', date: 'MAY 2024', seal: '河坊', seed: 202 },
  { key: 'quyuan', fn: quyuan, title: '曲院风荷', place: '金沙涧', date: 'JUL 2024', seal: '风荷', seed: 303 },
  { key: 'huagang', fn: huagang, title: '花港观鱼', place: '西山路', date: 'APR 2024', seal: '观鱼', seed: 404 },
  { key: 'santan', fn: santan, title: '三潭印月', place: '小瀛洲', date: 'SEP 2024', seal: '印月', seed: 505 },
  { key: 'yunhe', fn: yunhe, title: '运河夜色', place: '拱宸桥', date: 'NOV 2024', seal: '运河', seed: 606 },
  { key: 'hudong', fn: hudong, title: '湖东暮色', place: '湖滨', date: 'AUG 2024', seal: '西湖', seed: 707 },
  { key: 'chengshi', fn: chengshi, title: '城市阳台', place: '钱塘江畔', date: 'JUN 2024', seal: '钱江', seed: 808 },
  { key: 'shiji', fn: shiji, title: '湖畔市集', place: '湖滨步行街', date: 'MAR 2024', seal: '湖畔', seed: 909 },
];

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

/* 页面装饰：背景水渍、角落植物、分隔笔触 */
function decorate() {
  // 背景水渍
  const wc = canvas(1600, 1000), wx = wc.getContext('2d');
  const WS = makeSketch(wx, 4242);
  wx.fillStyle = '#ece7dc'; wx.fillRect(0, 0, 1600, 1000);
  WS.blob(140, 160, 260, 220, '150,160,130', 0.1, 0.4);
  WS.blob(1480, 220, 240, 260, '170,150,120', 0.09, 0.4);
  WS.blob(200, 860, 300, 200, '140,156,140', 0.08, 0.4);
  WS.blob(1420, 880, 280, 220, '160,150,120', 0.08, 0.4);
  WS.blob(800, 60, 420, 140, '180,170,140', 0.06, 0.4);
  document.querySelector('.wash').style.backgroundImage = `url(${wc.toDataURL('image/webp', 0.9)})`;
  // 左角柳枝
  const bl = canvas(420, 640), bx = bl.getContext('2d');
  const BS = makeSketch(bx, 777);
  BS.curve(40, 620, 90, 320, 210, 60, { w: 3, a: 0.6, col: '80,96,66' });
  for (let i = 0; i < 8; i++) {
    const t = 0.25 + i * 0.09, u = 1 - t;
    const px = u * u * 40 + 2 * u * t * 90 + t * t * 210, py = u * u * 620 + 2 * u * t * 320 + t * t * 60;
    BS.curve(px, py, px + 30, py + 90, px + 44, py + 190, { w: 1.2, a: 0.45, col: '80,96,66', passes: 1 });
    for (let k = 0.15; k < 0.95; k += 0.1) BS.seg(px + 44 * k * k, py + 190 * k, px + 44 * k * k + 6, py + 190 * k + 8, { w: 1, a: 0.35, col: '80,96,66', passes: 1 });
  }
  document.querySelector('.botany.l').src = bl.toDataURL('image/webp', 0.9);
  // 右角荷枝
  const br = canvas(380, 560), rx2 = br.getContext('2d');
  const RS = makeSketch(rx2, 888);
  RS.seg(190, 540, 210, 240, { w: 2.2, a: 0.55, col: '80,100,70' });
  RS.lotusLeaf(210, 220, 110, 2.4, '110,134,96');
  RS.lotusFlower(150, 160, 1.4);
  RS.seg(150, 160, 140, 420, { w: 1.8, a: 0.5, col: '80,100,70' });
  document.querySelector('.botany.r').src = br.toDataURL('image/webp', 0.9);
  // 关于页荷花
  const bc = canvas(440, 440), cx2 = bc.getContext('2d');
  const CS = makeSketch(cx2, 999);
  CS.lotusLeaf(160, 300, 130, 2.0);
  CS.lotusLeaf(320, 340, 90, 4.4);
  CS.lotusFlower(280, 200, 1.8);
  CS.lotusFlower(120, 170, 1.2, true);
  document.querySelector('.bloom').src = bc.toDataURL('image/webp', 0.9);
  // 分隔笔触
  const dc = canvas(1080, 46), dx2 = dc.getContext('2d');
  const DS = makeSketch(dx2, 555);
  DS.curve(20, 26, 300, 14, 540, 24, { w: 2.4, a: 0.5, col: '90,80,60', jit: 2 });
  DS.curve(540, 24, 780, 32, 1060, 20, { w: 2, a: 0.45, col: '90,80,60', jit: 2 });
  DS.blob(540, 23, 5, 4, '150,70,50', 0.5, 0.2);
  const durl = dc.toDataURL('image/webp', 0.9);
  document.querySelectorAll('.rule').forEach((r) => { r.style.backgroundImage = `url(${durl})`; });
}

export async function renderAll() {
  if (document.fonts && document.fonts.ready) await document.fonts.ready.catch(() => {});
  const pages = SCENES.map((sc) => {
    const c = canvas(W, H), ctx = c.getContext('2d');
    const S = makeSketch(ctx, sc.seed);
    S.paper();
    clipBook(ctx);
    sc.fn(S, ctx);
    ctx.restore();
    S.finish(sc.title, sc.place, sc.date, sc.seal);
    return { key: sc.key, url: c.toDataURL('image/webp', 0.92) };
  });
  decorate();
  return pages;
}