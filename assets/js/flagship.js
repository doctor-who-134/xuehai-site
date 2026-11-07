/* ═══════════════════════════════════════════════════════════════════════
   学海 · 旗舰版编排
   一条主时间轴驱动「一印到满海」，其余动效都是它的从属。
   零依赖、零外链、断网可用、reduced-motion 全停。
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ── 1. 双相：素纸 / 墨海 ── */
  function initPhase() {
    var btn = $("[data-night]");
    // 与官网内页共用同一个主题键（site.js 的 hai-site-theme），跨页切换不丢失
    var saved = null;
    try { saved = localStorage.getItem("hai-site-theme") || localStorage.getItem("xh-night"); } catch (e) {}
    // 素纸是主体相；夜读只由用户主动切换，不跟随系统主题自动改换气质
    if (saved === "night" || saved === "1") document.body.classList.add("night");
    function sync() {
      if (btn) btn.setAttribute("aria-pressed", document.body.classList.contains("night") ? "true" : "false");
    }
    sync();
    if (btn) btn.addEventListener("click", function () {
      var on = document.body.classList.toggle("night");
      try {
        localStorage.setItem("hai-site-theme", on ? "night" : "day");
        localStorage.removeItem("xh-night");
      } catch (e) {}
      sync();
    });
  }

  /* ── 2. 视频：懒挂载，同时最多播一支 ── */
  var vio;
  function initVideos() {
    var vids = $$("video[data-src]");
    function arm(v) {
      if (v.dataset.armed) return;
      v.dataset.armed = "1"; v.src = v.getAttribute("data-src"); v.load();
    }
    function play(v) { if (!REDUCE) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
    function pause(v) { try { v.pause(); } catch (e) {} }
    vio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { arm(v); if (!v.dataset.film) play(v); }
        else pause(v);
      });
    }, { rootMargin: "100px 0px", threshold: 0.01 });
    vids.forEach(function (v) { vio.observe(v); });
    window.XHV = { arm: arm, play: play, pause: pause };
  }

  /* ── 3. 主时间轴：一印到满海 + 全站进度 ── */
  function initTimeline() {
    var open = $(".open"), bar = $(".progress i");
    var chapters = $(".chapters"), links = $$(".chapters a");
    var secs = $$("[data-chapter]");
    var ticking = false;

    function update() {
      ticking = false;
      var max = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.width = (clamp(scrollY / (max || 1), 0, 1) * 100).toFixed(2) + "%";

      if (open && !REDUCE) {
        var r = open.getBoundingClientRect();
        var span = open.offsetHeight - innerHeight;
        var p = clamp(-r.top / (span || 1), 0, 1);
        var mob = innerWidth <= 820;
        var w0 = mob ? 84 : 33, h0 = mob ? 24 : 44,
            r0 = mob ? 8 : 6, t0 = mob ? 11 : 17;
        var s = open.style;
        s.setProperty("--w", (w0 + (100 - w0) * p).toFixed(2) + "vw");
        s.setProperty("--h", (h0 + (100 - h0) * p).toFixed(2) + "vh");
        s.setProperty("--r", (r0 * (1 - p)).toFixed(2) + "vw");
        s.setProperty("--t", (t0 * (1 - p)).toFixed(2) + "vh");
        s.setProperty("--br", (2 * (1 - p)).toFixed(1) + "px");
        s.setProperty("--tint", (0.20 - 0.14 * p).toFixed(3));
        s.setProperty("--grain", (1 - 0.9 * p).toFixed(3));
        // 文字比影像更早退场，避免中间态的文字压在画面上
        s.setProperty("--fade", clamp(1 - 2.6 * p, 0, 1).toFixed(3));
        s.setProperty("--ty", (-46 * p).toFixed(1) + "px");
        s.setProperty("--seal", clamp(1 - 3 * p, 0, 1).toFixed(3));
        s.setProperty("--cue", clamp(1 - 5 * p, 0, 1).toFixed(3));
        s.setProperty("--idx", clamp(1 - 3 * p, 0, 1).toFixed(3));
        // 满屏影像时导航融进画面；越过序章后章节轨才出现
        document.body.classList.toggle("sea",
          p > 0.55 && scrollY < open.offsetHeight - innerHeight * 0.5);
        if (chapters) chapters.classList.toggle("on", scrollY > open.offsetHeight * 0.94);
      } else if (chapters && !REDUCE) {
        chapters.classList.toggle("on", scrollY > innerHeight * 0.6);
      }
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    update();

    // 章节轨：视口中线落在哪一节
    if (links.length) {
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (!en.isIntersecting) return;
          var id = en.target.getAttribute("data-chapter");
          links.forEach(function (a) {
            a.setAttribute("aria-current", a.getAttribute("href") === "#" + id ? "true" : "false");
          });
        });
      }, { rootMargin: "-48% 0px -48% 0px", threshold: 0 });
      secs.forEach(function (s) { cio.observe(s); });
    }
  }

  /* ── 4. 五幕：滚动揭幕，逐行由 CSS stagger ── */
  function initFilm() {
    var film = $(".film--flag");
    if (!film) return;
    var frames = $$(".frame", film), caps = $$(".cap", film);
    var bar = $("#filmBar"), now = $("#filmNow");
    frames.forEach(function (f) { $("video", f).dataset.film = "1"; });
    var N = frames.length, active = -1, ticking = false;

    function setActive(i) {
      if (i === active) return;
      active = i;
      frames.forEach(function (f, k) {
        f.classList.toggle("is-active", k === i);
        var v = $("video", f);
        if (k === i) { window.XHV.arm(v); window.XHV.play(v); } else window.XHV.pause(v);
      });
      caps.forEach(function (c, k) { c.classList.toggle("is-active", k === i); });
      if (now) now.textContent = String(i + 1).padStart(2, "0");
    }
    function update() {
      ticking = false;
      var r = film.getBoundingClientRect();
      var total = film.offsetHeight - innerHeight;
      var p = clamp(-r.top / (total || 1), 0, 0.99999);
      var i = Math.min(N - 1, Math.floor(p * N));
      setActive(i);
      if (bar) bar.style.width = (p * 100).toFixed(2) + "%";
      var local = p * N - i;
      var reveal = clamp(local * 3.4, 0, 1);
      frames[i].style.clipPath = "inset(0 0 " + ((1 - reveal) * 100).toFixed(2) + "% 0)";
      frames.forEach(function (f, k) { if (k < i) f.style.clipPath = "inset(0 0 0 0)"; });
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /* ── 5. 程序化等深线（v5 几何，运行时生成） ── */
  function initContours() {
    var host = $(".contour-act__bg"), act = $(".contour-act");
    var data = window.H3_CONTOURS;
    if (!host || !data || !data.sets || !data.sets.length) return;
    var paths = data.sets[0].paths || [];
    var picked = paths.slice(0, 24);
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 1000 1000");
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.setAttribute("aria-hidden", "true");
    picked.forEach(function (d, idx) {
      var p = document.createElementNS(ns, "path");
      p.setAttribute("d", d);
      p.style.stroke = idx % 5 === 0 ? "var(--accent)" : "var(--accent-deep)";
      p.style.opacity = (0.20 + idx / picked.length * 0.5).toFixed(2);
      p.style.strokeWidth = idx % 5 === 0 ? "3.4" : "2";
      p.style.transitionDelay = (idx * 42) + "ms";
      svg.appendChild(p);
    });
    host.appendChild(svg);
    if (act) new IntersectionObserver(function (es, o) {
      es.forEach(function (en) { if (en.isIntersecting) { act.classList.add("drawn"); o.disconnect(); } });
    }, { threshold: 0.2 }).observe(act);
  }

  /* ── 6. 揭示 + 数字 ── */
  function fmt(n, sep) {
    var s = String(Math.round(n));
    return sep ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : s;
  }
  function countUp(el) {
    if (el.dataset.done) return; el.dataset.done = "1";
    var to = parseFloat(el.dataset.to || "0"), sep = el.dataset.sep === "1", suf = el.dataset.suffix || "";
    if (REDUCE) { el.textContent = fmt(to, sep) + suf; return; }
    var t0 = performance.now();
    (function step(t) {
      var p = Math.min(1, (t - t0) / 1500), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e, sep) + suf;
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(to, sep) + suf;
    })(t0);
  }
  function initReveal() {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var d = parseInt(el.dataset.d || "0", 10);
        if (d) el.style.transitionDelay = d + "ms";
        el.classList.add("in-view");
        if (el.classList.contains("count")) countUp(el);
        $$(".count", el).forEach(countUp);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    $$(".reveal, .count").forEach(function (el) { io.observe(el); });

    // 六事：主项默认落一幅 H3 影像，其余仅在悬停时才加载
    $$(".work[data-bg]").forEach(function (w) {
      var img = $("img", w);
      function load() { if (img && !img.getAttribute("src")) img.src = "assets/h3/" + w.dataset.bg + ".jpg"; }
      if (w.classList.contains("is-primary")) load();
      else w.addEventListener("pointerenter", load, { once: true });
    });

    // 深墨舞台（五幕 / 收束）进入视口时，导航与章节轨随之转深
    var darkZones = $$(".film--flag, .closing"), darkSet = new Set();
    if (darkZones.length) {
      var dio = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          en.isIntersecting ? darkSet.add(en.target) : darkSet.delete(en.target);
        });
        document.body.classList.toggle("on-dark", darkSet.size > 0);
      }, { rootMargin: "-64px 0px -64px 0px", threshold: 0 });
      darkZones.forEach(function (z) { dio.observe(z); });
    }
  }

  /* ── 7. 微交互：磁吸、墨滴、导航、锚点 ── */
  function initChrome() {
    var nav = $("#nav");
    function s() { nav.classList.toggle("stuck", scrollY > 40); }
    addEventListener("scroll", s, { passive: true }); s();

    if (!REDUCE && matchMedia("(hover:hover)").matches) {
      $$(".btn[data-magnetic]").forEach(function (b) {
        b.addEventListener("pointermove", function (e) {
          var r = b.getBoundingClientRect();
          var x = clamp((e.clientX - r.left - r.width / 2) * 0.16, -6, 6);
          var y = clamp((e.clientY - r.top - r.height / 2) * 0.16, -6, 6);
          b.style.setProperty("--mx", x.toFixed(1) + "px");
          b.style.setProperty("--my", y.toFixed(1) + "px");
        });
        b.addEventListener("pointerleave", function () {
          b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px");
        });
      });
    }

    var ink = $(".ink-splash");
    if (ink && !REDUCE) document.addEventListener("pointerdown", function (e) {
      ink.style.left = e.clientX + "px"; ink.style.top = e.clientY + "px";
      ink.classList.remove("go"); void ink.offsetWidth; ink.classList.add("go");
    });

    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href"); if (!id || id.length < 2) return;
        var t = document.querySelector(id); if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "start" });
      });
    });
  }

  initPhase();
  initVideos();
  initTimeline();
  initFilm();
  initContours();
  initReveal();
  initChrome();
  if (window.XHTide) window.XHTide.init();
})();
