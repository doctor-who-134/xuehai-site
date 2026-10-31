# 学海 · 官网（公开版）

高考学习系统「学海」的公开站点。静态 HTML/CSS/JS，无构建步骤、无第三方脚本、无统计。

- 站点：https://doctor-who-134.github.io/xuehai-site
- 版本：3.0.0（构建 35）· 2026-10-31 · 仅 macOS
- 安装包：见 `download.html`（GitHub Release 直链，未公证，首次打开需右键「打开」）
- 说明：应用仍在测试中；页面上的「还差什么」是真实缺口清单。

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
```

## 许可

字体（霞鹜文楷 / Noto）为 OFL，Material Symbols 为 Apache 2.0，许可文本随分发包；八景插画随本站源码；
应用图标为 AI 辅助生成并在「许可与来源」页显式说明。
