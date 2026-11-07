# 学海 · 官网（公开版）

高考学习系统「学海」的公开站点。静态 HTML/CSS/JS，无构建步骤、无第三方脚本、无统计。

- 站点：https://doctor-who-134.github.io/xuehai-site
- 版本：当前公开版 **3.0.0（构建 35）** · 2026-10-31 · macOS；历史归档 v3.1.0-legacy（三端）与 v2.6.0-legacy（完整四端）为 Pre-release；本机候选 3.2.0+39 未上传、未评审
- 安装包：见 `download.html`（GitHub Release 直链，未公证，首次打开需右键「打开」）
- **下载页**：`download.html`（影像版；含 3.0.0 公开直链、3.1.0 / 2.6.0 历史归档、3.2.0 候选状态、五端差异、SHA-256、安装卡点）
- **官网首页即「观海」**：`index.html` 为旗舰版 v2（一印到满海主时间轴、素纸/墨海双相、H3 影像、WebGL 墨潮、程序化等深线、编辑式六事）；原产品内容由 `capability.html` / `design.html` / `changelog.html` 等内页承载，未丢失
- **全站统一层**：`assets/css/unify.css` + `assets/js/unify.js`（素纸·天青·墨海令牌、WebGL 墨潮、顶部进度、gooey 墨滴、与 `site.js` 的 `data-theme` 联动），已注入全部内页与法律页
- **跳转与对照**：`showcase/` 两页退为跳转；`showcase/index-legacy.html` 保留 v1 供对照
- 说明：应用仍在测试中；页面上的「还差什么」是真实缺口清单。3.2.0 未发布，站点不给假下载按钮。

## 本地预览

```bash
python3 -m http.server 8080 --bind 127.0.0.1
# http://127.0.0.1:8080/
```

`?static=1` 关闭入场动效；`&theme=night` 强制夜读。

## 结构

```
index.html … 九页
assets/css/{base,components,pages}.css
assets/js/site.js
assets/art/*.svg      八景墨潮插画（代码绘制，含内嵌 CSS 动画）
assets/shots/         真实截图（日/夜两套）
assets/img/           应用图标与 og 封面
legal/                隐私 / 协议 / 未成年人
assets/h3/            H3 生成影像（15 支 mp4 + 首帧 jpg）
assets/contours/      灯花 v5 等深线几何与令牌（溯源用）
assets/css/{showcase,flagship,download,unify}.css · assets/js/{tide,flagship,showcase,unify,contours-data}.js
showcase/             跳转页 + v1 对照页（资源已归位到根 assets/）
```

六页主导航统一为「首页 / 能力 / 设计 / 下载 / 航行日志 / 关于」，内页另加「观海」回到首页五幕；`sitemap.xml` 收录 9 条正式 URL，跳转页不收录。

## 许可

字体（霞鹜文楷 / Noto）为 OFL，Material Symbols 为 Apache 2.0，许可文本随分发包；八景插画随本站源码；
应用图标为 AI 辅助生成并在「许可与来源」页显式说明。
