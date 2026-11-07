# 学海 · 影像与设计（showcase）

独立展示页，自包含，不依赖主站样式表，也不改动主站任何既有页面。

- 入口：`showcase/index.html`（影像与设计）· `showcase/download.html`（影像版下载页）
- 预览：`cd 官网-公开版 && python3 -m http.server 8765` → `http://127.0.0.1:8765/showcase/`
- 下载页数据口径：
  - 当前公开版 **3.0.0 / 构建 35 / 101,778,679 B / SHA-256 `504230b4…41dc`**（v3.0.0 Release 直链）。
  - 历史归档 **v3.1.0-legacy**（Pre-release）：Windows / Android / iOS 三端；本机没有 3.1.0 的 macOS dmg，故如实写「三端」。
  - 历史归档 **v2.6.0-legacy**（Pre-release）：完整四端，macOS 取自 11-07 冷存储隔离副本。
  - **3.2.0+39 / 215,369,819 B / SHA-256 `bd995a7b…c2da`** 是本机候选，分发 README 明确「未评审、未上传」，
    故本页标注「未上传」且**不放下载按钮**。
  - 五端差异如实列出，不做假开关；iOS 开发签名 7 天早已过期，标注「当前不可安装、仅作留痕」。
  - 上传用 ASCII 资产名（gh 的 `file#label` 遇中文路径会产出坏名，已修一次）。
- 部署：随 `官网-公开版/` 一起发布，GitHub Pages 路径 `/showcase/`
- 体积：4.8 MB（41 个文件），零外链、断网可用、无构建步骤

---

## 一、这一版解决了什么

原先桌面那份前端展示只有手绘 SVG 线稿。本版把「插画」换成**本机 MiniMax H3 已生成的真实影像**，
并叠加实时生成式渲染与滚动编排。没有重新跑模型——H3 影像是其他 Codex 会话在 2026-10-31
已产出并接入 App 的成品，重跑是重复劳动，且本机 64G 内存对满精度 H3 仍是硬墙。

## 二、资产来源（复制，不引用外部路径）

| 资产 | 数量 | 来源 |
|---|---|---|
| H3 影像 mp4 + 首帧 jpg | 15 支 × 2 | `App/assets/videos/`（web_ 11 支 + delivery_ 4 支） |
| 等深线几何 | 24 层 | `文档/denghua-design/assets/contours/library.json`，导出为 `assets/js/contours-data.js` |
| 设计令牌参考 | 1 份 | `文档/denghua-design/assets/tokens/denghua.tokens.json`（仅取几何与间距，配色按天青裁决） |

影像规格：800×448、24fps、约 2.6 秒、静音循环。首帧 jpg 作 poster。

## 三、技术清单（逐项可指认）

| 技术 | 实现位置 | 说明 |
|---|---|---|
| H3 影像 | `index.html` 的 `video[data-src]` | 懒加载、进入视口才播、当前幕独占播放、首帧占位 |
| WebGL 实时墨潮 | `showcase.js` `initTide()` | 片元着色器 fbm 噪声 + 域扭曲，低分辨率渲染；无 WebGL 时 `fallbackTide()` 降级 canvas2D 波纹 |
| 程序化等深线 | `initContours()` + `contours-data.js` | 运行时取路径建 SVG，24 层按层级给色/粗细/透明度，逐层描边自绘 |
| 电影级滚动编排 | `initFilm()` | 520vh 滚动轨道 + sticky 舞台；scroll progress 驱动五幕揭幕（clip-path）、文案切换、进度线与幕号；原生 rAF，无第三方库、无自动轮播 |
| SVG 滤镜 | `index.html` `<defs>` | `gooey`（feGaussianBlur + feColorMatrix）用于点击墨晕；`feTurbulence` 用于纸纹 |
| 滚动揭示 / 数字 | `initReveal()` | IntersectionObserver，33 处揭示、数字滚动、等深线描边触发 |
| 深色区导航适配 | `initChrome()` | 电影区/CTA 进入视口时导航转深，避免浅色割裂带 |
| 降级 | 全局 | `prefers-reduced-motion` 全停、无 JS 内容仍可读、视频静音、焦点可见 |

## 四、设计口径

只守四条：**浑厚 · 质朴 · 疏朗 · 天青**。其余宪章细则按灯花 2026-10-31 明令放开。
- 浑厚：宋体巨字、深墨主体量、层叠影、重心偏下。
- 质朴：哑光纸纹、真数据、可验证陈述；不辉光、不霓虹、不渐变字、不自动轮播。
- 疏朗：首屏留白过半、版心 1120、主体偏席不居中、章节间距 104–168。
- 天青：唯一强调色 `#6BA3B8`（深 `#3C7E92`），界面面积克制；影像里的天青来自 H3。

数字口径：76,794 题、28 支 H3 影像（本页取 15）、24 层等深线、5 端。均为可指认的既有事实，未编造。

## 五、实测记录（2026-11-07，headless Chrome + CDP）

- 分段截图 10 张（hero / facts / film×3 / contours / features / science / design / cta），逐张目视核对。
- 网络 **404 = 0**，console error = 0。
- 运行态：等深线 24 层已生成并完成描边、33/33 揭示已触发、WebGL 上下文可用、
  7 支已挂载视频 `readyState=4`、页面总高 9833px。
- 修复过三处实见问题：CSS 变量内 `url()` 按样式表目录解析导致卡片材质 404；
  深色舞台上导航为浅色割裂带；功能图标默认描边被隐藏，看起来像缺笔。

## 六、边界（明确未做）

- 未改 `App/` 任何代码，未提交 git。
- 主站只做**增量接入**：六页 head-nav 各加一条「影像」链接、旧 `download.html` 加一条指向新下载页的提示条、
  `sitemap.xml` 加两条 URL、根 `README.md` 补说明。未重排或覆盖任何既有页面的结构与样式。
- 未重新启动 ComfyUI、未生成新 H3 图（原因见第一节）。
- 未引入任何 npm 依赖、CDN、外部字体或第三方动画库。
- 网页版与 App 的功能一致性以 App 源码为准；本页只做展示，不宣称功能已上线。
