# 学海 · 影像与设计（showcase）

> **2026-11-07 融合说明**：影像网已并入官网，本目录不再是独立站点。
> - 官网首页 = 根 `index.html`（观海 v2）；下载页 = 根 `download.html`。
> - 影像资源已归位到根 `assets/h3/`、`assets/css/`、`assets/js/`、`assets/contours/`。
> - 本目录 `index.html` / `download.html` 仅为跳转到官网的过渡页；`index-legacy.html` 保留 v1 对照。
> - 全站统一层见根 `assets/css/unify.css` 与 `assets/js/unify.js`；结构以根 `README.md` 为准。
>
> 以下为融合前的交付记录，保留作沿革；其中的旧路径已不再适用。

独立展示页，自包含，不依赖主站样式表，也不改动主站任何既有页面。

- 入口：`showcase/index.html`（**旗舰版 v2 · 观海**）· `showcase/download.html`（影像版下载页）
- 回退：`showcase/index-legacy.html`（v1 展示页，保留可对照，sitemap 未收录）
- 预览：`cd 官网-公开版 && python3 -m http.server 8765` → `http://127.0.0.1:8765/showcase/`
- 双相：素纸为默认主体；右上日月按钮切到墨海（只认用户主动选择，不跟随系统主题）
- 下载页数据口径：
  - 当前公开版 **3.0.0 / 构建 35 / 101,778,679 B / SHA-256 `504230b4…41dc`**（v3.0.0 Release 直链）。
  - 历史归档 **v3.1.0-legacy**（Pre-release）：Windows / Android / iOS 三端；本机没有 3.1.0 的 macOS dmg，故如实写「三端」。
  - 历史归档 **v2.6.0-legacy**（Pre-release）：完整四端，macOS 取自 11-07 冷存储隔离副本。
  - **3.2.0+39 / 215,369,819 B / SHA-256 `bd995a7b…c2da`** 是本机候选，分发 README 明确「未评审、未上传」，
    故本页标注「未上传」且**不放下载按钮**。
  - 五端差异如实列出，不做假开关；iOS 开发签名 7 天早已过期，标注「当前不可安装、仅作留痕」。
  - 上传用 ASCII 资产名（gh 的 `file#label` 遇中文路径会产出坏名，已修一次）。
- 部署：随 `官网-公开版/` 一起发布，GitHub Pages 路径 `/showcase/`
- 体积：4.8 MB（45 个文件），零外链、断网可用、无构建步骤、无任何第三方库

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

**v2 旗舰版**（`index.html` + `flagship.css` + `flagship.js` + 公共 `tide.js`）：

| 技术 | 实现位置 | 说明 |
|---|---|---|
| 一印到满海主时间轴 | `flagship.js` `initTimeline()` | 270vh sticky 舞台；scroll progress 由 JS 算成**具体 CSS 变量**（不用 `calc()` 乘法，浏览器兼容不成立），驱动影像窗口由 33vw 小窗扩到满屏、文字提前退场、导航融入画面 |
| 双相：素纸 / 墨海 | `flagship.css` + `initPhase()` | 全套令牌覆盖；WebGL 墨潮用 `u_night` uniform 同步换夜色；`localStorage` 只记用户主动选择，不跟随系统主题 |
| 章节轨 / 顶部进度 | `flagship.css` + `initTimeline()` | 越过序章才出现、视口中线联动高亮；顶部 2px 天青进度线 |
| 编辑式六事 | `flagship.css` `.works` | 一主五辅列表替代等宽三卡矩阵；主项默认落 H3 影像，其余仅悬停时加载 |
| 五幕逐行揭幕 | `flagship.css` `.cap__line` + `initFilm()` | 560vh 轨道，clip-path 揭幕 + 每行 stagger（`--d` 变量），当前幕独占播放 |
| 程序化等深线 | `flagship.js` `initContours()` | v5 几何 24 层运行时建 SVG，全幅铺纹，逐层描边自绘 |
| WebGL 实时墨潮 | `tide.js`（**公共模块**） | fbm 噪声 + 域扭曲，低分辨率渲染；无 WebGL 降级 canvas2D 波纹；首页与下载页共用、无重复代码 |
| 微交互 | `flagship.js` `initChrome()` | 磁吸按钮（限幅 6px、仅 hover 设备）、gooey 墨滴、下划线中心展开；全站一条缓动曲线、无回弹 |
| 降级 | 全局 | `prefers-reduced-motion` 首屏退为静态一印构图；无 JS 内容仍可读、视频静音、焦点可见、键盘可达 |

**v1 旧版**（`index-legacy.html`）仍用 `showcase.css` + `showcase.js`；下载页继续走这一套，只是把墨潮抽到了公共 `tide.js`。

## 四、设计口径

只守四条：**浑厚 · 质朴 · 疏朗 · 天青**。其余宪章细则按灯花 2026-10-31 明令放开。
- 浑厚：宋体巨字、深墨主体量、层叠影、重心偏下。
- 质朴：哑光纸纹、真数据、可验证陈述；不辉光、不霓虹、不渐变字、不自动轮播。
- 疏朗：首屏留白过半、版心 1120、主体偏席不居中、章节间距 104–168。
- 天青：唯一强调色 `#6BA3B8`（深 `#3C7E92`），界面面积克制；影像里的天青来自 H3。

数字口径：76,794 题、28 支 H3 影像（本页取 15）、24 层等深线、5 端。均为可指认的既有事实，未编造。

## 五、实测记录（2026-11-07，headless Chrome + CDP）

- **v2 四态实测**：桌面 9 张分段截图（序章 p=0 / 0.5 / 满屏、数、五幕、纹、六事、法、收）、
  夜读相、390×844 手机 2 张、`prefers-reduced-motion` 首屏，逐张目视核对。
- 网络 **404 = 0**，console error = 0；CDP 遍历 5 页（含下载页公共模块回归）均 0 error；
  全站 12 页本地链接 0 断。
- 运行态：24 层等深线生成并描边、30 处揭示触发、6 条功能、WebGL 上下文可用、
  主时间轴变量 `--w = 475px`（= 33vw @1440）随滚动正确插值。
- v2 修过的实见问题（逐条对应截图）：`calc()` 乘法兼容性；章节轨与大标题重叠；
  中间态文字压在影像上；深墨舞台浅色导航割裂带；两枚「海」印重复（改三横几何落款）；
  标题后天青圆点像 UI 加载点（删）；主功能项影像空块（改默认落图）；
  夜读按钮白字在浅天青上对比不足；手机影像窗口比例与 eyebrow 折行；
  默认相误随系统深色主题（改为只认用户主动选择）。
- v1 曾修：CSS 变量内 `url()` 按样式表目录解析导致卡片材质 404；功能图标默认描边被隐藏。

## 六、边界（明确未做）

- 未改 `App/` 任何代码，未提交 git。
- 主站只做**增量接入**：六页 head-nav 各加一条「影像」链接、旧 `download.html` 加一条指向新下载页的提示条、
  `sitemap.xml` 加两条 URL、根 `README.md` 补说明。未重排或覆盖任何既有页面的结构与样式。
- 未重新启动 ComfyUI、未生成新 H3 图（原因见第一节）。
- 未引入任何 npm 依赖、CDN、外部字体或第三方动画库。
- 网页版与 App 的功能一致性以 App 源码为准；本页只做展示，不宣称功能已上线。
