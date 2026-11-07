# 学海 · 官网（公开版）

高考学习系统「学海」的公开站点。静态 HTML/CSS/JS，无构建步骤、无第三方脚本、无统计。

- 站点：https://doctor-who-134.github.io/xuehai-site
- 版本：当前公开版 **3.0.0（构建 35）** · 2026-10-31 · macOS；历史归档 v3.1.0-legacy（三端）与 v2.6.0-legacy（完整四端）为 Pre-release；本机候选 3.2.0+39 未上传、未评审
- 安装包：见 `download.html`（GitHub Release 直链，未公证，首次打开需右键「打开」）
- **影像版下载页**：`showcase/download.html`（含 3.2.0 候选状态、五端差异、SHA-256、安装卡点）
- **影像与设计展示**：`showcase/` 旗舰版 v2「观海」（一印到满海主时间轴、素纸/墨海双相、H3 影像、WebGL 墨潮、程序化等深线、编辑式六事），见其 `README.md`；v1 保留在 `showcase/index-legacy.html`
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
showcase/             影像与设计展示（独立页）+ 影像版下载页
```

六页主导航已接入「影像」入口；`sitemap.xml` 收录 `showcase/` 与 `showcase/download.html`。

## 许可

字体（霞鹜文楷 / Noto）为 OFL，Material Symbols 为 Apache 2.0，许可文本随分发包；八景插画随本站源码；
应用图标为 AI 辅助生成并在「许可与来源」页显式说明。
