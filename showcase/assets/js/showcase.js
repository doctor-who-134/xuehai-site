/* ═══════════════════════════════════════════════════════════════════════
   学海 · 影像与设计
   WebGL 实时墨潮 / 程序化等深线 / 滚动编排 / 视频按需播放
   零依赖、零外链、断网可用。
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ─────────── 1. WebGL 生成式墨潮 ─────────── */
  function initTide() {
    var cv = $("#tide-gl");
    if (!cv || REDUCE) return;

    var VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
    var FRAG = [
      "precision mediump float;",
      "uniform vec2 u_res; uniform float u_t;",
      "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
      "float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);",
      " float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));",
      " return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}",
      "float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}",
      "void main(){",
      " vec2 uv=gl_FragCoord.xy/u_res;",
      " vec2 p=uv*vec2(3.2,2.1);",
      " float t=u_t*0.05;",
      " vec2 q=vec2(fbm(p+vec2(0.,t)),fbm(p+vec2(5.2,1.3)-t));",
      " float f=fbm(p+2.3*q+vec2(t*.5,0.));",
      " vec3 paper=vec3(.933,.937,.918);",
      " vec3 qing=vec3(.30,.55,.66);",
      " float m=smoothstep(.40,.88,f);",
      " vec3 col=mix(paper,qing,m*.20);",
      " col=mix(col,qing,smoothstep(.55,1.,1.-uv.y)*.07);",
      " gl_FragColor=vec4(col,1.);",
      "}"
    ].join("\n");

    var gl = null;
    try { gl = cv.getContext("webgl", { alpha: false, antialias: false, depth: false })
             || cv.getContext("experimental-webgl"); } catch (e) { gl = null; }
    if (!gl) { fallbackTide(cv); return; }

    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
      return s;
    }
    var vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { fallbackTide(cv); return; }
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { fallbackTide(cv); return; }
    gl.useProgram(prog);

    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uRes = gl.getUniformLocation(prog, "u_res"), uT = gl.getUniformLocation(prog, "u_t");

    function resize() {
      var scale = 0.65; // 性能：低分辨率渲染，视觉本就是低频噪声
      var w = Math.max(1, Math.floor(innerWidth * scale)), h = Math.max(1, Math.floor(innerHeight * scale));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
    }
    resize(); addEventListener("resize", resize, { passive: true });

    var t0 = performance.now(), visible = true;
    document.addEventListener("visibilitychange", function () { visible = !document.hidden; });
    function frame(now) {
      if (visible) {
        gl.uniform2f(uRes, cv.width, cv.height);
        gl.uniform1f(uT, (now - t0) / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* WebGL 不可用：canvas2D 低频波纹，同样是生成式而非静态图 */
  function fallbackTide(cv) {
    var ctx = cv.getContext("2d");
    if (!ctx || REDUCE) return;
    var w = 0, h = 0;
    function resize() { w = cv.width = Math.floor(innerWidth / 3); h = cv.height = Math.floor(innerHeight / 3); }
    resize(); addEventListener("resize", resize, { passive: true });
    var k = 0;
    (function loop() {
      k += 0.012;
      ctx.fillStyle = "#EEEFEA"; ctx.fillRect(0, 0, w, h);
      for (var i = 0; i < 9; i++) {
        ctx.beginPath();
        for (var x = 0; x <= w; x += 6) {
          var y = h * (0.55 + i * 0.05) + Math.sin(x * 0.012 + k + i * 0.7) * (6 + i * 1.6);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(107,163,184," + (0.05 + i * 0.006) + ")";
        ctx.lineWidth = 1; ctx.stroke();
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ─────────── 2. 程序化等深线 ─────────── */
  function initContours() {
    var host = $("#contourArt");
    var data = window.H3_CONTOURS;
    if (!host || !data || !data.sets || !data.sets.length) return;
    var paths = data.sets[0].paths || [];
    // 取连续层级，才有等深线的嵌套感；不是跨层抽样
    var want = 24;
    var picked = paths.slice(0, Math.min(want, paths.length));

    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 1000 1000");
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "程序化生成的 24 层等深线");
    picked.forEach(function (d, idx) {
      var p = document.createElementNS(ns, "path");
      p.setAttribute("d", d);
      p.setAttribute("stroke", idx % 4 === 0 ? "#6BA3B8" : "#3C7E92");
      p.style.opacity = (0.42 + idx / picked.length * 0.46).toFixed(2);
      // viewBox 1000 缩到约 400px，须用视图单位加粗才有 1px 以上的实线
      p.style.strokeWidth = (idx % 4 === 0 ? 4 : 2.6).toFixed(1);
      p.style.transitionDelay = (idx * 55) + "ms";
      svg.appendChild(p);
    });
    host.appendChild(svg);
  }

  /* ─────────── 3. 视频按需加载 / 播放 ─────────── */
  var videos = $$("video[data-src]");
  function arm(v) {
    if (v.dataset.armed) return;
    v.dataset.armed = "1";
    v.src = v.getAttribute("data-src");
    v.load();
  }
  function safePlay(v) { if (!REDUCE) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
  function safePause(v) { try { v.pause(); } catch (e) {} }

  var vio = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      var v = en.target;
      if (en.isIntersecting) { arm(v); if (!v.dataset.film) safePlay(v); }
      else safePause(v);
    });
  }, { rootMargin: "120px 0px", threshold: 0.01 });
  videos.forEach(function (v) { vio.observe(v); });

  /* ─────────── 4. 电影级滚动编排（一日五幕） ─────────── */
  function initFilm() {
    var film = $("#film"), frames = $$(".frame", film), caps = $$(".cap", film);
    var bar = $("#filmBar"), now = $("#filmNow");
    if (!film || !frames.length) return;
    frames.forEach(function (f) { $("video", f).dataset.film = "1"; });
    var N = frames.length, active = -1, ticking = false;

    function setActive(i) {
      if (i === active) return;
      active = i;
      frames.forEach(function (f, k) {
        f.classList.toggle("is-active", k === i);
        var v = $("video", f);
        if (k === i) { arm(v); safePlay(v); } else safePause(v);
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
      // 幕内揭幕：每幕前 1/3 行程从下往上揭开
      var local = p * N - i;
      var reveal = clamp(local * 3, 0, 1);
      frames[i].style.clipPath = "inset(0 0 " + ((1 - reveal) * 100).toFixed(2) + "% 0)";
      frames.forEach(function (f, k) { if (k < i) f.style.clipPath = "inset(0 0 0 0)"; });
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /* ─────────── 5. 滚动揭示 + 数字滚动 + 等深线描边 ─────────── */
  function fmt(n, sep) {
    var s = String(Math.round(n));
    return sep ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : s;
  }
  function countUp(el) {
    if (el.dataset.done) return; el.dataset.done = "1";
    var to = parseFloat(el.dataset.to || "0"), sep = el.dataset.sep === "1", suf = el.dataset.suffix || "";
    if (REDUCE) { el.textContent = fmt(to, sep) + suf; return; }
    var t0 = performance.now(), dur = 1500;
    (function step(t) {
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
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
        $$(".count", el).forEach(countUp);
        if (el.classList.contains("count")) countUp(el);
        if (el.id === "contourArt") el.classList.add("drawn");
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });

    $$(".reveal, .count, #contourArt, .science__viz").forEach(function (el) { io.observe(el); });
    // 卡片材质：规则写进文档内 <style>，url 按文档目录解析（外部 CSS 会按 css/ 解析）
    var rules = $$(".card[data-bg]").map(function (c) {
      return ".card[data-bg='" + c.dataset.bg + "']::before{background-image:url('assets/h3/"
           + c.dataset.bg + ".jpg')}";
    });
    if (rules.length) {
      var st = document.createElement("style");
      st.textContent = rules.join("\n");
      document.head.appendChild(st);
    }
  }

  /* ─────────── 6. 导航固化 / 墨滴 / 锚点 ─────────── */
  function initChrome() {
    var nav = $("#nav");
    function s() { nav.classList.toggle("stuck", scrollY > 40); }
    addEventListener("scroll", s, { passive: true }); s();

    // 深色舞台（电影区 / CTA）进入视口时，导航随之转深
    var darkZones = $$(".film, .cta");
    var darkSet = new Set();
    var dio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        var el = en.target;
        en.isIntersecting ? darkSet.add(el) : darkSet.delete(el);
      });
      document.body.classList.toggle("on-dark", darkSet.size > 0);
    }, { rootMargin: "-60px 0px -60px 0px", threshold: 0 });
    darkZones.forEach(function (z) { dio.observe(z); });

    var ink = $(".ink-splash");
    if (ink && !REDUCE) document.addEventListener("pointerdown", function (e) {
      ink.style.left = e.clientX + "px"; ink.style.top = e.clientY + "px";
      ink.classList.remove("go"); void ink.offsetWidth; ink.classList.add("go");
    });

    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (!id || id.length < 2) return;
        var t = document.querySelector(id); if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "start" });
      });
    });
  }

  initTide();
  initContours();
  initFilm();
  initReveal();
  initChrome();
})();
