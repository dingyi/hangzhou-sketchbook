# 杭州手帖 · West Lake Sketchbook

一句话提示词测试产物：模仿 [Meng To 的 Sketchbook 落地页](https://threeui.com/landing-pages/meng-to-sketchbook-landing-page) 的杭州主题版本。分支 `one-line-hangzhou` 为交接状态，含未完成工作。

## 运行

```bash
npm install
npm run dev      # 开发
npm run build    # 生产构建（已验证通过）
npm run preview  # 预览 dist
```

Vite 7，无框架。`index.html` 内联全部 CSS 与翻页引擎；`src/sketch.js` + `src/plates.js` 为程序化绘图模块，通过 head 里的 module script 渲染九幅图版，引擎 boot 以 `window.__platesReady` Promise 等待结果。

## 架构

- **翻页引擎**：移植自 [MengTo/threeui](https://github.com/MengTo/threeui)（MIT）`public/landing-pages/meng-to-sketchbook.html`。18 条嵌套纸带 CSS 3D 弧面翻页，弹簧驱动，支持拖拽/箭头/键盘/开场 riffle；可拖拽放大镜、缩放、随鼠标倾斜、图版索引。未改动引擎逻辑。
- **图版**：九幅杭州场景全部由 Canvas 程序化绘制（`src/plates.js`），无外部图片：灵隐梵音、河坊街市、曲院风荷、花港观鱼、三潭印月、运河夜色、湖东暮色、城市阳台、湖畔市集。画布 1760×1240，书本区 x 90–1670 / y 270–970，中缝 x 880，与引擎的 `--pg 21.8%` 几何对齐。输出 webp dataURL。
- **绘图库** `src/sketch.js`：种子随机、两遍抖动钢笔线、模糊多层水彩晕染 + 边缘积色、纸面纤维/中缝/叠页边、塔/桥/亭/莲/锦鲤/三潭石塔等构件、竖排题字 + 印章 + 日期落款。
- **装饰**：背景水渍、角落柳枝/荷枝、关于页荷花、分隔笔触，均程序化生成（`decorate()`）。
- **字体**：`public/fonts/` 三个 woff2（Instrument Serif、Newsreader，OFL，来自 threeui 仓库）；中文用系统栈（Kaiti/宋体/Noto CJK 回退）。

## 调试参数

- `?nointro` 跳过开场 riffle
- `?shot=i` 静态停在第 i 幅（0–8）
- `?shot=i&t=0.3&dir=next` 静态停在翻页中间态（截图用）

## 当前完成度（交接时）

已完成：
- 引擎移植 + 杭州文案/标签/索引/致谢，全部交互保留
- 九幅程序化场景全部实现并可渲染，启动无控制台错误
- 水彩渲染库一轮质量修正（模糊晕染、保俶塔细塔身、落日渐变、小船体积）
- 桌面/手机无横向溢出（≤640px 隐藏放大镜及其按钮）
- 生产构建通过

未完成 / 接手者须知：
1. **逐页目检只做了 4/9**（0 灵隐、4 三潭、6 湖东、7 城市阳台）。1 河坊、2 曲院、3 花港、5 运河、8 市集尚未目检，构图可能有构件错位。
2. 已知画面问题：
   - 湖东暮色：前景柳枝与左侧竖排题字重叠，柳枝起点右移约 260px 即可（`plates.js` hudong 内 `AX + 10` 起）。
   - 三潭印月：月光倒影太淡；中间石塔 x=880 正压中缝，建议移到 820 或 940。
   - 城市阳台：双子塔扭转感弱、江面倒影淡。
   - 整体对比度偏低，可按需上调墨线 alpha。
   - 放大镜静止位盖住右下印章/落款（与参考页行为一致，可不改）。
3. **交互复验未在新图版上重跑**：拖拽翻页/放大镜/缩放/移动端溢出在旧素材版验证过；换程序化图版后只验证了加载、ready、控制台干净。接手后请重跑一遍拖拽与 390px 溢出检查。
4. **1080p 交互录屏未做**，视频线程 `T-01a1e436-e42f-7795-b88f-33b5a373a7c2` 未通知（任务在录屏前被叫停）。
5. 原 orb 里 dev server 以 `amp orb service start sketchbook` 跑在 5173，portal `https://t-03h8xzdw3pqmk1dm9kovmgesb-p22281.onamp.dev/`；新环境需自行 `npm run dev`。`vite.config.js` 已允许 `.onamp.dev` host。

## 许可

引擎代码 © Meng To（MIT，见 threeui 仓库）。字体 OFL。图版与绘图库为本项目原创程序化绘制。