/* svg.js —— 四季小景、笔触分隔、桂花、印章与图标。全部内联，无外部资源。 */
const INK = '#2b3238';

export function seasonArt(kind) {
  const head = `<svg viewBox="0 0 220 150" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">`;
  const wash = (x, y, rx, ry, c, o) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}" opacity="${o}" stroke="none"/>`;
  let body = '';
  if (kind === 'willow') {
    body = wash(110, 120, 95, 16, '#7fa396', 0.16)
      + `<path d="M30 118 Q110 96 190 118" stroke="${INK}" stroke-width="2" opacity=".7"/>`
      + `<path d="M70 118 Q110 100 150 118" stroke="${INK}" stroke-width="1.4" opacity=".4"/>`
      + `<path d="M44 40 Q52 70 48 104" stroke="${INK}" stroke-width="2.2" opacity=".8"/>`
      + `<g stroke="#7c9a62" stroke-width="1.3" opacity=".75">
          <path d="M48 46 Q70 60 66 96"/><path d="M50 50 Q84 66 80 104"/>
          <path d="M46 52 Q34 72 38 100"/><path d="M52 48 Q96 70 92 100"/>
          <path d="M49 54 Q60 78 56 108"/></g>`
      + `<g fill="#c4838a" stroke="none" opacity=".85">
          <circle cx="150" cy="52" r="3.4"/><circle cx="162" cy="60" r="2.6"/><circle cx="140" cy="62" r="2.8"/>
          <circle cx="172" cy="50" r="2.2"/><circle cx="156" cy="70" r="2.4"/></g>`
      + `<path d="M150 52 Q158 78 152 104" stroke="${INK}" stroke-width="1.6" opacity=".6"/>`;
  } else if (kind === 'lotus') {
    body = wash(110, 124, 96, 14, '#7fa396', 0.18)
      + `<g stroke="#7c9a62" stroke-width="1.8" opacity=".8">
          <ellipse cx="70" cy="112" rx="30" ry="9"/><ellipse cx="150" cy="118" rx="26" ry="8"/></g>`
      + `<path d="M110 118 Q108 80 112 56" stroke="#7c9a62" stroke-width="2" opacity=".85"/>`
      + `<g stroke="#c4838a" stroke-width="1.8" fill="#c4838a" fill-opacity=".22">
          <path d="M112 56 Q98 40 104 26 Q112 38 112 56"/>
          <path d="M112 56 Q126 40 120 26 Q112 38 112 56"/>
          <path d="M112 56 Q92 48 90 34 Q106 40 112 56"/>
          <path d="M112 56 Q132 48 134 34 Q118 40 112 56"/></g>`
      + `<g stroke="${INK}" stroke-width="1.1" opacity=".35">
          <path d="M30 128 h26"/><path d="M168 130 h24"/><path d="M96 134 h30"/></g>`;
  } else if (kind === 'moon') {
    body = wash(150, 44, 26, 26, '#d9a441', 0.3)
      + `<circle cx="150" cy="44" r="20" stroke="#d9a441" stroke-width="1.6" opacity=".7"/>`
      + wash(110, 122, 96, 14, '#54718c', 0.14)
      + `<g stroke="${INK}" stroke-width="1.3" opacity=".5">
          <path d="M28 116 h30"/><path d="M70 122 h36"/><path d="M120 118 h28"/><path d="M160 124 h30"/>
          <path d="M48 130 h26"/><path d="M104 132 h30"/></g>`
      + `<g stroke="#d9a441" stroke-width="1.3" opacity=".55">
          <path d="M138 112 h24"/><path d="M142 120 h18"/><path d="M146 128 h12"/></g>`
      + `<path d="M52 108 L52 84 L74 84 L74 108 M46 84 L63 72 L80 84" stroke="${INK}" stroke-width="1.8" opacity=".7"/>`;
  } else {
    body = wash(110, 122, 96, 14, '#54718c', 0.12)
      + `<path d="M40 116 Q110 92 180 116" stroke="${INK}" stroke-width="2.2" opacity=".8"/>`
      + `<path d="M84 116 Q110 100 136 116" stroke="${INK}" stroke-width="1.6" opacity=".6"/>`
      + `<path d="M96 116 Q110 104 124 116" stroke="${INK}" stroke-width="1.2" opacity=".4"/>`
      + `<g stroke="${INK}" stroke-width="1.4" opacity=".55">
          <path d="M52 108 v8"/><path d="M72 102 v9"/><path d="M148 102 v9"/><path d="M168 108 v8"/></g>`
      + `<path d="M40 44 Q60 60 56 88 M56 52 Q76 64 74 88" stroke="${INK}" stroke-width="1.6" opacity=".6"/>`
      + `<g fill="#54718c" stroke="none" opacity=".5">
          <circle cx="100" cy="40" r="2"/><circle cx="130" cy="52" r="1.8"/><circle cx="150" cy="36" r="2.2"/>
          <circle cx="116" cy="64" r="1.6"/><circle cx="170" cy="60" r="1.8"/><circle cx="86" cy="56" r="1.6"/></g>`;
  }
  return head + body + '</svg>';
}

export function divider(short = false) {
  return `<svg viewBox="0 0 600 40" preserveAspectRatio="none" aria-hidden="true" class="${short ? 'short' : ''}">
    <path d="M8 22 C120 12 220 26 300 20 C380 14 480 26 592 18"
      stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".5"/>
    <path d="M40 26 C160 20 260 30 360 24 C440 20 520 28 560 24"
      stroke="${INK}" stroke-width="1" fill="none" stroke-linecap="round" opacity=".25"/>
    <circle cx="300" cy="20" r="3" fill="#b5432e" opacity=".7"/>
  </svg>`;
}

export function osmanthus() {
  return `<svg viewBox="0 0 200 200" fill="none" stroke-linecap="round" aria-hidden="true">
    <path d="M40 170 Q80 120 96 70 Q104 44 120 30" stroke="${INK}" stroke-width="2.4" opacity=".8"/>
    <path d="M96 70 Q130 78 150 64 M88 96 Q60 92 48 76 M104 52 Q132 50 146 36"
      stroke="${INK}" stroke-width="1.8" opacity=".65"/>
    <g stroke="#7c9a62" stroke-width="1.6" fill="#7c9a62" fill-opacity=".18">
      <path d="M150 64 Q168 58 176 66 Q160 74 150 64"/>
      <path d="M48 76 Q30 70 24 80 Q40 88 48 76"/>
      <path d="M146 36 Q164 28 174 36 Q158 46 146 36"/>
      <path d="M120 30 Q126 12 140 10 Q136 26 120 30"/></g>
    <g fill="#d9a441" stroke="none">
      <g opacity=".9"><circle cx="108" cy="80" r="3"/><circle cx="114" cy="76" r="3"/><circle cx="112" cy="86" r="3"/><circle cx="118" cy="82" r="3"/></g>
      <g opacity=".8"><circle cx="84" cy="112" r="2.6"/><circle cx="90" cy="108" r="2.6"/><circle cx="88" cy="118" r="2.6"/><circle cx="94" cy="114" r="2.6"/></g>
      <g opacity=".85"><circle cx="132" cy="56" r="2.4"/><circle cx="137" cy="52" r="2.4"/><circle cx="136" cy="60" r="2.4"/></g>
      <circle cx="70" cy="140" r="2.2" opacity=".6"/><circle cx="150" cy="96" r="2" opacity=".6"/>
    </g></svg>`;
}

export function bigSeal() {
  return `<svg viewBox="0 0 160 160" aria-hidden="true" class="seal-svg">
    <defs><filter id="seal-rough"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="4"/></filter></defs>
    <g filter="url(#seal-rough)">
      <rect x="10" y="10" width="140" height="140" rx="10" fill="#b5432e"/>
      <rect x="20" y="20" width="120" height="120" rx="5" fill="none" stroke="#f4efe3" stroke-width="2.5" opacity=".85"/>
      <text x="52" y="66" font-family="'Ma Shan Zheng',serif" font-size="40" fill="#f4efe3" text-anchor="middle">杭</text>
      <text x="108" y="66" font-family="'Ma Shan Zheng',serif" font-size="40" fill="#f4efe3" text-anchor="middle">州</text>
      <text x="52" y="122" font-family="'Ma Shan Zheng',serif" font-size="40" fill="#f4efe3" text-anchor="middle">速</text>
      <text x="108" y="122" font-family="'Ma Shan Zheng',serif" font-size="40" fill="#f4efe3" text-anchor="middle">写</text>
    </g></svg>`;
}

export const icons = {
  soundOn: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6"/><path d="M18.5 6.5a8 8 0 0 1 0 11"/></svg>`,
  soundOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>`,
  zoomIn: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="8.6" cy="8.6" r="5.6"/><path d="M12.8 12.8 17.4 17.4M6.2 8.6h4.8M8.6 6.2v4.8"/></svg>`,
  zoomOut: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="8.6" cy="8.6" r="5.6"/><path d="M12.8 12.8 17.4 17.4M6.2 8.6h4.8"/></svg>`,
  loupe: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="8.8" cy="8.8" r="5.8"/><path d="M13 13l4.4 4.4"/><path d="M6.4 7.2a3.2 3.2 0 0 1 2.4-1.4" opacity=".55"/></svg>`,
  boil: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2 10q2.5-4 5 0t5 0 5 0"/><path d="M2 14q2.5-3 5 0t5 0 5 0" opacity=".5"/></svg>`,
  download: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3v9M6.5 8.5 10 12l3.5-3.5"/><path d="M4 15h12"/></svg>`,
  prev: `<svg viewBox="0 0 14 44" width="14" height="44" fill="none"><polyline points="11,3 3,22 11,41" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  next: `<svg viewBox="0 0 14 44" width="14" height="44" fill="none"><polyline points="3,3 11,22 3,41" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  down: `<svg viewBox="0 0 44 22" width="34" height="17" fill="none"><polyline points="3,3 22,11 41,3" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/><polyline points="3,11 22,19 41,11" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};