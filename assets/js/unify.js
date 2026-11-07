/* ═══════════════════════════════════════════════════════════════════════
   全站统一层 · 运行时
   与主站 site.js 的 html[data-theme] 联动，不另起一套主题状态。
   幂等；下载页带 data-unify-core 时跳过墨滴（showcase.js 已实现）。
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  if (window.XHUnifyStarted) return;
  window.XHUnifyStarted = true;

  var REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CORE = document.body.hasAttribute("data-unify-core");
  var html = document.documentElement;
  var body = document.body;
  var $ = function (s) { return document.querySelector(s); };

  /* ── 1. 动态挂载统一层元素 ── */
  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  if (!$("#tide-gl")) { var cv = el("canvas"); cv.id = "tide-gl"; cv.setAttribute("aria-hidden", "true"); body.insertBefore(cv, body.firstChild); }
  if (!$(".progress")) { var pr = el("div", "progress"); pr.setAttribute("aria-hidden", "true"); pr.appendChild(el("i")); body.appendChild(pr); }

  if (!CORE && !REDUCE) {
    if (!$(".unify-defs")) {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "unify-defs"); svg.setAttribute("aria-hidden", "true");
      svg.innerHTML = '<defs><filter id="unify-gooey">' +
        '<feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b"/>' +
        '<feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="g"/>' +
        '<feBlend in="SourceGraphic" in2="g"/></filter></defs>';
      body.appendChild(svg);
    }
    if (!$(".ink-splash")) body.appendChild(el("div", "ink-splash"));
  }

  /* ── 2. 双相：读主站 data-theme，同步 body.night 给墨潮着色器 ── */
  function sync() {
    var night = html.getAttribute("data-theme") === "night" || body.classList.contains("night");
    body.classList.toggle("night", night);
    var btn = $("[data-night]");
    if (btn) btn.setAttribute("aria-pressed", night ? "true" : "false");
  }
  var saved = null;
  try { saved = localStorage.getItem("hai-site-theme"); } catch (e) {}
  if (saved === "night") { body.classList.add("night"); html.setAttribute("data-theme", "night"); }
  sync();

  // 主站内页：site.js 切换主题后 data-theme 变化，这里跟着同步
  new MutationObserver(sync).observe(html, { attributes: true, attributeFilter: ["data-theme"] });

  // 下载页：没有 site.js，自带 [data-night] 按钮，直接改同一个主题键
  var nightBtn = $("[data-night]");
  if (nightBtn) nightBtn.addEventListener("click", function () {
    var on = !body.classList.contains("night");
    body.classList.toggle("night", on);
    html.setAttribute("data-theme", on ? "night" : "day");
    try { localStorage.setItem("hai-site-theme", on ? "night" : "day"); } catch (e) {}
    sync();
  });

  /* ── 3. 墨潮 ── */
  if (window.XHTide) window.XHTide.init();

  /* ── 4. 顶部进度 ── */
  var bar = $(".progress i"), ticking = false;
  function update() {
    ticking = false;
    if (!bar) return;
    var max = html.scrollHeight - innerHeight;
    bar.style.width = (Math.max(0, Math.min(1, scrollY / (max || 1))) * 100).toFixed(2) + "%";
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll, { passive: true });
  update();

  /* ── 5. gooey 墨滴（内页；下载页由 showcase.js 提供） ── */
  if (!CORE && !REDUCE) {
    var ink = $(".ink-splash");
    if (ink) document.addEventListener("pointerdown", function (e) {
      ink.style.left = e.clientX + "px"; ink.style.top = e.clientY + "px";
      ink.classList.remove("go"); void ink.offsetWidth; ink.classList.add("go");
    });
  }
})();
