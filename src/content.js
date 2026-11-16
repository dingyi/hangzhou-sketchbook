/* 杭州速写本 —— 全部文案与 plate 数据。
   诗词均为咏杭州的真实古诗，按页配景。 */

export const BOOK_TITLE = '杭州速写本';
export const BOOK_LATIN = 'A Sketchbook of Hangzhou';

export const PLATES = [
  {
    id: 'duanqiao',
    num: '壹',
    title: '断桥残雪',
    place: '白堤 · 北山街',
    latin: 'Broken Bridge, Lingering Snow',
    poem: ['水光潋滟晴方好', '山色空蒙雨亦奇', '欲把西湖比西子', '淡妆浓抹总相宜'],
    author: '苏轼 · 饮湖上初晴后雨',
    note: '雪霁，桥阳面先融，阴面犹白，自葛岭望之若断。',
    seal: '断桥',
  },
  {
    id: 'leifeng',
    num: '贰',
    title: '雷峰夕照',
    place: '夕照山 · 南山路',
    latin: 'Leifeng Pagoda at Dusk',
    poem: ['烟光山色淡溟蒙', '千尺浮图兀倚空', '湖上画船归欲尽', '孤峰犹带夕阳红'],
    author: '尹廷高 · 雷峰夕照',
    note: '塔八面五层，高七十一米。夕照山前，浮图兀倚空。',
    seal: '雷峰',
  },
  {
    id: 'santan',
    num: '叁',
    title: '三潭印月',
    place: '小瀛洲 · 湖心',
    latin: 'Three Pools Mirroring the Moon',
    poem: ['片月生沧海', '三潭处处明', '夜船歌舞处', '人在镜中行'],
    author: '张宁 · 三潭印月',
    note: '三塔亭亭，塔腹中空。月夜烛光透洞，与月影相乱。',
    seal: '印月',
  },
  {
    id: 'longjing',
    num: '肆',
    title: '龙井问茶',
    place: '狮峰山 · 龙井村',
    latin: 'Longjing Tea Terraces',
    poem: ['仙山灵草湿行云', '洗遍香肌粉未匀', '明月来投玉川子', '清风吹破武林春'],
    author: '苏轼 · 次韵曹辅寄壑源试焙新芽',
    note: '狮峰山下，明前初芽。一旗一枪，指轻手快。',
    seal: '问茶',
  },
  {
    id: 'lingyin',
    num: '伍',
    title: '灵隐钟声',
    place: '灵隐寺 · 飞来峰',
    latin: 'Bell Sound of Lingyin',
    poem: ['桂子月中落', '天香云外飘', '楼观沧海日', '门对浙江潮'],
    author: '宋之问 · 灵隐寺',
    note: '咸和元年开山。香炉烟直，钟声渡岭，桂子落满肩。',
    seal: '灵隐',
  },
  {
    id: 'gongchen',
    num: '陆',
    title: '运河人家',
    place: '拱宸桥 · 桥西直街',
    latin: 'Gongchen Bridge, Grand Canal',
    poem: ['尽道隋亡为此河', '至今千里赖通波', '若无水殿龙舟事', '共禹论功不较多'],
    author: '皮日休 · 汴河怀古',
    note: '三孔薄墩，运河南端。乌篷过洞，灯影入水。',
    seal: '拱宸',
  },
  {
    id: 'hefang',
    num: '柒',
    title: '河坊街市',
    place: '河坊街 · 南宋御街',
    latin: 'Hefang Street Market',
    poem: ['烟柳画桥', '风帘翠幕', '参差十万人家', '市列珠玑'],
    author: '柳永 · 望海潮',
    note: '南宋御街旧地。幌子风里斜，定胜糕热，糖画未凉。',
    seal: '河坊',
  },
  {
    id: 'qiantang',
    num: '捌',
    title: '钱塘新潮',
    place: '城市阳台 · 钱塘江',
    latin: 'Qiantang River, New Tide',
    poem: ['云树绕堤沙', '怒涛卷霜雪', '天堑无涯', '钱塘自古繁华'],
    author: '柳永 · 望海潮',
    note: '杭州之门对望，金球浮江。八月十八，潮头如雪。',
    seal: '观潮',
  },
];

export const SEASONS = [
  { key: 'chun', season: '春', scene: '苏堤春晓', line: '六桥烟柳，桃红初匀。', art: 'willow' },
  { key: 'xia', season: '夏', scene: '曲院风荷', line: '接天莲叶无穷碧，映日荷花别样红。', art: 'lotus' },
  { key: 'qiu', season: '秋', scene: '平湖秋月', line: '白苹红蓼西风里，一色湖光万顷秋。', art: 'moon' },
  { key: 'dong', season: '冬', scene: '断桥残雪', line: '桥影卧波，雪意未阑。', art: 'snow' },
];

export const ABOUT = {
  label: '关于此册',
  paras: [
    '这是一本摊开在杭州的速写本。八页线稿，从断桥的残雪画到钱塘的夜潮：塔影、茶山、钟声、桥洞、幌子与江潮，都是这座城市慢下来的样子。',
    '笔是 three.js，墨是实时生成的线稿。每一根线条都在轻微呼吸，像手还没有离开纸面；纸是代码叠出来的，宣纸的底色、纤维的颗粒、折页处的阴影，一层一层铺上去。',
    '你可以拖动书页翻页，拿起放大镜看笔触，调一调墨的浓淡，或者只是顺着目录，一页一页读下去。画得慢一点，杭州就慢一点。',
  ],
  vertical: '淡妆浓抹总相宜',
};

export const COLOPHON = {
  title: '画于西子湖畔',
  line: '以代码为墨，以屏幕为纸。',
  meta: '线稿 three.js 实时绘制 · 字体 霞鹜文楷 / 马善政楷书 / Instrument Serif',
  date: '二〇二六年 · 秋',
  back: '回到卷首',
  export: '收藏此页线稿',
};

export const UI = {
  kicker: '上有天堂 · 下有苏杭',
  kickerLatin: 'Eight plates of West Lake & the Qiantang River',
  hint: '拖动书页翻页 · 拿起放大镜看笔触',
  hintTouch: '左右轻扫翻页',
  nav: [
    { id: 'sketchbook', label: '画册' },
    { id: 'seasons', label: '四季' },
    { id: 'about', label: '关于' },
    { id: 'plates', label: '目录' },
  ],
  seasonsLabel: '湖上四季',
  seasonsIntro: '西湖十景，四时不同。先把四季折进册子里。',
  platesLabel: '目录 · 八页',
  loading: '装订中…',
  soundOn: '纸声：开',
  soundOff: '纸声：关',
  zoomIn: '放大',
  zoomOut: '缩小',
  loupe: '放大镜',
  boil: '线条呼吸',
  ink: '墨色浓淡',
  exportPage: '收藏此页',
  prev: '上一页',
  next: '下一页',
};