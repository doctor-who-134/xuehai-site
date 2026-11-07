/* ═══════════════════════════════════════════════════════════════════════
   公共模块 · 生成式墨潮
   WebGL 片元着色器（fbm 噪声 + 域扭曲）实时渲染低频的「气」；
   无 WebGL 时降级 canvas2D 波纹。首页与下载页共用，零依赖。
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;

  var VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  var FRAG = [
    "precision mediump float;",
    "uniform vec2 u_res; uniform float u_t; uniform float u_night;",
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
    " vec3 night=vec3(.082,.094,.086);",
    " vec3 nightQing=vec3(.20,.42,.50);",
    " vec3 dn=mix(night,nightQing,m*.26);",
    " gl_FragColor=vec4(mix(col,dn,u_night),1.);",
    "}"
  ].join("\n");

  function fallback(cv) {
    var ctx = cv.getContext("2d");
    if (!ctx || REDUCE) return;
    var w = 0, h = 0;
    function resize() { w = cv.width = Math.floor(innerWidth / 3); h = cv.height = Math.floor(innerHeight / 3); }
    resize(); addEventListener("resize", resize, { passive: true });
    var k = 0;
    (function loop() {
      k += 0.012;
      var night = document.body.classList.contains("night");
      ctx.fillStyle = night ? "#151714" : "#EEEFEA"; ctx.fillRect(0, 0, w, h);
      for (var i = 0; i < 9; i++) {
        ctx.beginPath();
        for (var x = 0; x <= w; x += 6) {
          var y = h * (0.55 + i * 0.05) + Math.sin(x * 0.012 + k + i * 0.7) * (6 + i * 1.6);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = night ? "rgba(143,192,190,.07)" : "rgba(107,163,184," + (0.05 + i * 0.006) + ")";
        ctx.lineWidth = 1; ctx.stroke();
      }
      requestAnimationFrame(loop);
    })();
  }

  function init() {
    if (window.XHTide.started) return;   // 首页/下载页可能各引一次，幂等
    window.XHTide.started = true;
    var cv = document.querySelector("#tide-gl");
    if (!cv || REDUCE) return;
    var gl = null;
    try {
      gl = cv.getContext("webgl", { alpha: false, antialias: false, depth: false })
        || cv.getContext("experimental-webgl");
    } catch (e) { gl = null; }
    if (!gl) { fallback(cv); return; }

    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
      return s;
    }
    var vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { fallback(cv); return; }
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { fallback(cv); return; }
    gl.useProgram(prog);

    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uRes = gl.getUniformLocation(prog, "u_res"),
        uT = gl.getUniformLocation(prog, "u_t"),
        uN = gl.getUniformLocation(prog, "u_night");

    function resize() {
      var scale = 0.65;
      var w = Math.max(1, Math.floor(innerWidth * scale)), h = Math.max(1, Math.floor(innerHeight * scale));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
    }
    resize(); addEventListener("resize", resize, { passive: true });

    var t0 = performance.now(), visible = true;
    document.addEventListener("visibilitychange", function () { visible = !document.hidden; });
    (function frame(now) {
      if (visible) {
        gl.uniform2f(uRes, cv.width, cv.height);
        gl.uniform1f(uT, (now - t0) / 1000);
        gl.uniform1f(uN, document.body.classList.contains("night") ? 1 : 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      requestAnimationFrame(frame);
    })(t0);
  }

  window.XHTide = { init: init };
})();
