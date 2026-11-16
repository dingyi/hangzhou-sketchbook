/* 扫描源码里用到的所有字符，把三套字体子集化成小 woff2，自托管、零外部请求。 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.(js|css|html|json)$/.test(name)) files.push(p);
  }
})(root);

const set = new Set();
// 基础 ASCII + 常用标点 + 箭头 + 中文标点
for (let c = 0x20; c <= 0x7e; c++) set.add(String.fromCharCode(c));
for (const ch of '·—…‘’“”「」『』《》〈〉（）【】、。，：；！？％＋－／↑↓←→°') set.add(ch);
for (let c = 0x2190; c <= 0x21ff; c++) set.add(String.fromCharCode(c));
for (const p of files) {
  const txt = readFileSync(p, 'utf8');
  for (const ch of txt) {
    const code = ch.codePointAt(0);
    if (code > 0x2000 && code !== 0xfeff) set.add(ch); // 收所有非 ASCII 字符（含 CJK）
  }
}
const chars = [...set].join('');
const charsetPath = join(root, 'scripts', 'charset.txt');
writeFileSync(charsetPath, chars);
console.log('charset chars:', [...set].length);

const jobs = [
  ['/tmp/MaShanZheng-Regular.ttf', 'public/fonts/ma-shan-zheng.woff2'],
  ['/tmp/LXGWWenKai-Regular.ttf', 'public/fonts/lxgw-wenkai.woff2'],
  ['/tmp/Caveat.ttf', 'public/fonts/caveat.woff2'],
];
for (const [src, out] of jobs) {
  execFileSync('pyftsubset', [
    src,
    '--text-file=' + charsetPath,
    '--flavor=woff2',
    '--output-file=' + join(root, out),
    '--layout-features=*',
    '--no-hinting',
    '--desubroutinize',
  ], { stdio: 'inherit' });
  const kb = (statSync(join(root, out)).size / 1024).toFixed(0);
  console.log(out, kb + ' KB');
}