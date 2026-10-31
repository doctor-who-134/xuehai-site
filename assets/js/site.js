/* ═══════════════════════════════════════════════════════════════════════
   学海官网 · 交互
   原则：没有它页面仍完整（渐进增强）；动效只解释状态；减少动态时一步到位；
        全站零外链、零依赖。
   世界：真实时间决定数据光色（清晨/午后/黄昏/夜深），可手动覆盖。
   功能：日夜切换 / 叠纸视差 / 画面呼吸 / 胶片带 / 走马灯 / 入场 / 数字 /
        ⌘K 面板 / 光箱 / 复制 / 页顶潮位 / 回到顶部 / 日夜间截图切换
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const html = document.documentElement;
  const IS_STATIC = /[?&](static|motion=off)\b/.test(location.search);
  if (IS_STATIC) html.dataset.static = 'true';
  const reduceMotion = () =>
    IS_STATIC || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = () => window.matchMedia('(pointer: fine)').matches;

  /* ── 0. 世界：此刻与纸色 ──────────────────────────────────────────── */
  const THEME_KEY = 'hai-site-theme'; // 'auto' | 'day' | 'night'
  const TIMES = { dawn: '清晨', day: '午后', dusk: '黄昏', night: '夜深' };
  const metaTheme = document.querySelector('meta[name="theme-color"]');

  function timeOf(hour) {
    if (hour >= 5 && hour < 8) return 'dawn';
    if (hour >= 8 && hour < 17) return 'day';
    if (hour >= 17 && hour < 20) return 'dusk';
    return 'night';
  }

  function readMode() {
    try { return localStorage.getItem(THEME_KEY) || 'auto'; } catch (_) { return 'auto'; }
  }

  function applyWorld(mode, { animate = false } = {}) {
    const urlTheme = new URLSearchParams(location.search).get('theme');
    if (urlTheme === 'night' || urlTheme === 'day') mode = urlTheme;
    const hour = new Date().getHours();
    const autoTime = timeOf(hour);
    const sysNight = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let time = autoTime;
    let theme = (autoTime === 'night' || sysNight) ? 'night' : 'day';
    if (mode === 'day') { time = 'day'; theme = 'day'; }
    if (mode === 'night') { time = 'night'; theme = 'night'; }
    if (IS_STATIC && mode === 'auto') { time = 'day'; theme = 'day'; }

    const set = () => {
      html.dataset.time = time;
      html.dataset.theme = theme;
      if (metaTheme) metaTheme.setAttribute('content', theme === 'night' ? '#141613' : '#FAF9F5');
      document.querySelectorAll('[data-now]').forEach((el) => { el.textContent = TIMES[time] || '此刻'; });
      document.querySelectorAll('[data-now-icon]').forEach((el) => { el.dataset.time = time; });
      document.querySelectorAll('[data-theme-btn]').forEach((b) => {
        const label = theme === 'night' ? '切到日间' : '切到夜读';
        b.setAttribute('aria-label', label);
        b.setAttribute('aria-pressed', theme === 'night' ? 'true' : 'false');
      });
      swapTheoryShots(theme);
    };
    if (animate && document.startViewTransition && !reduceMotion()) {
      document.startViewTransition(set);
    } else {
      set();
    }
  }

  function initWorld() {
    applyWorld(readMode());
    document.querySelectorAll('[data-theme-btn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = html.dataset.theme === 'night' ? 'day' : 'night';
        try { localStorage.setItem(THEME_KEY, next); } catch (_) {}
        applyWorld(next, { animate: true });
      });
    });
    // 每分钟刷新「此刻」（自动模式）
    setInterval(() => {
      if (readMode() === 'auto') applyWorld('auto');
    }, 60000);
  }

  /* 日/夜双套截图：主题切换时同步换图 */
  function swapTheoryShots(theme) {
    document.querySelectorAll('img[data-day][data-night]').forEach((img) => {
      const next = theme === 'night' ? img.dataset.night : img.dataset.day;
      if (next && img.getAttribute('src') !== next) {
        img.setAttribute('src', next);
      }
    });
  }

  /* ── 1. 移动端导航 / dock ─────────────────────────────────────────── */
  function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.head-nav');
    if (toggle && nav) {
      const setOpen = (open) => {
        nav.dataset.open = open ? 'true' : 'false';
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.dataset.navopen = open ? 'true' : 'false';
      };
      toggle.addEventListener('click', () => setOpen(nav.dataset.open !== 'true'));
      nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
      window.addEventListener('resize', () => { if (window.innerWidth > 900) setOpen(false); });
    }
  }

  /* ── 2. 入场 reveal（620ms；stagger 32ms，最多 6 项） ─────────────── */
  function initReveal() {
    const items = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;
    if (reduceMotion() || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const show = (el) => {
      const delay = Math.min(Number(el.dataset.delay || 0), 6) * 32;
      el.style.setProperty('--d', delay + 'ms');
      el.classList.add('is-in');
      io.unobserve(el);
      pending.delete(el);
    };
    const pending = new Set(items);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) show(entry.target); });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    items.forEach((el) => io.observe(el));
    // 兜底：跳转锚点或直接落在页面深处时，把当前位置之上的元素一次补齐
    let raf = 0;
    const sweep = () => {
      raf = 0;
      const vh = window.innerHeight;
      pending.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 1.04) show(el);
      });
    };
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(sweep); }, { passive: true });
    window.addEventListener('resize', () => { if (!raf) raf = requestAnimationFrame(sweep); });
    sweep();
  }

  /* ── 3. 数字滚动（620ms；读屏只报终值） ──────────────────────────── */
  function initCount() {
    const nodes = Array.from(document.querySelectorAll('[data-count]'));
    if (!nodes.length) return;
    const paint = (el, value) => {
      const digits = Number(el.dataset.countDigits || 0);
      el.textContent = digits > 0
        ? Number(value).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
        : Math.round(Number(value)).toLocaleString('en-US');
    };
    const run = (el) => {
      const target = Number(el.dataset.count);
      if (!Number.isFinite(target)) return;
      if (reduceMotion()) { paint(el, target); return; }
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / 620);
        paint(el, target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick); else paint(el, target);
      };
      paint(el, 0);
      requestAnimationFrame(tick);
    };
    if (reduceMotion() || !('IntersectionObserver' in window)) {
      nodes.forEach((el) => paint(el, Number(el.dataset.count)));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.4 });
    nodes.forEach((el) => { paint(el, 0); io.observe(el); });
  }

  /* ── 4. ⌘K 命令面板 ──────────────────────────────────────────────── */
  const DESTINATIONS = [
    { n: '01', t: '首页', k: '页面', href: 'index.html' },
    { n: '02', t: '这一版改了什么', k: '首页', href: 'index.html#change' },
    { n: '03', t: '判分三态', k: '首页', href: 'index.html#scoring' },
    { n: '04', t: '真实截图 · 26 屏', k: '首页', href: 'index.html#shots' },
    { n: '05', t: '数据底座', k: '首页', href: 'index.html#base' },
    { n: '06', t: '八景与六色', k: '首页', href: 'index.html#design' },
    { n: '07', t: '还差什么（诚实清单）', k: '首页', href: 'index.html#gap' },
    { n: '08', t: '能力面板', k: '能力', href: 'capability.html' },
    { n: '09', t: '设计语言「墨潮」', k: '设计', href: 'design.html' },
    { n: '10', t: '八景插画', k: '设计', href: 'design.html#art' },
    { n: '11', t: '字阶与色板', k: '设计', href: 'design.html#type' },
    { n: '12', t: '潮汐节拍', k: '设计', href: 'design.html#motion' },
    { n: '13', t: '下载 macOS 3.0.0', k: '下载', href: 'download.html' },
    { n: '14', t: '历史版本', k: '下载', href: 'download.html#history' },
    { n: '15', t: '航行日志（版本记录）', k: '记录', href: 'changelog.html' },
    { n: '16', t: '关于学海', k: '关于', href: 'about.html' },
    { n: '17', t: '隐私政策', k: '协议', href: 'legal/privacy.html' },
    { n: '18', t: '用户协议', k: '协议', href: 'legal/terms.html' },
    { n: '19', t: '未成年人模式', k: '协议', href: 'legal/minor.html' },
  ];

  function initPalette() {
    const panel = document.querySelector('.palette');
    if (!panel) return;
    const BASE = html.dataset.base ?? (/(^|\/)legal\//.test(location.pathname) ? '../' : '');
    const input = panel.querySelector('.palette-input input');
    const list = panel.querySelector('.palette-list');
    let items = [];
    let cursor = 0;

    const render = (query) => {
      const q = query.trim().toLowerCase();
      items = DESTINATIONS.filter((d) => !q || (d.t + ' ' + d.k).toLowerCase().includes(q));
      cursor = 0;
      list.innerHTML = '';
      if (!items.length) {
        const empty = document.createElement('li');
        empty.className = 'palette-empty';
        empty.textContent = '没有匹配的目的地。';
        list.appendChild(empty);
        return;
      }
      items.forEach((d, i) => {
        const li = document.createElement('li');
        li.className = 'palette-item';
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        li.innerHTML = '<span class="p-num">' + d.n + '</span><span class="p-title"></span><span class="p-kind">' + d.k + '</span>';
        li.querySelector('.p-title').textContent = d.t;
        li.addEventListener('click', () => { location.href = BASE + d.href; });
        li.addEventListener('mousemove', () => select(i));
        list.appendChild(li);
      });
    };
    const select = (i) => {
      cursor = Math.max(0, Math.min(items.length - 1, i));
      Array.from(list.children).forEach((li, idx) => {
        if (!li.classList || li.classList.contains('palette-empty')) return;
        li.setAttribute('aria-selected', idx === cursor ? 'true' : 'false');
        if (idx === cursor) li.scrollIntoView({ block: 'nearest' });
      });
    };
    const open = () => {
      panel.classList.add('is-open');
      document.body.dataset.lock = 'true';
      input.value = '';
      render('');
      setTimeout(() => input.focus(), 30);
    };
    const close = () => {
      panel.classList.remove('is-open');
      document.body.dataset.lock = 'false';
    };
    document.querySelectorAll('[data-palette-open]').forEach((b) => b.addEventListener('click', open));
    input.addEventListener('input', () => render(input.value));
    panel.addEventListener('click', (e) => { if (e.target === panel) close(); });
    document.addEventListener('keydown', (e) => {
      const cmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (cmdK) { e.preventDefault(); panel.classList.contains('is-open') ? close() : open(); return; }
      if (!panel.classList.contains('is-open')) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); select(cursor + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); select(cursor - 1); }
      else if (e.key === 'Enter' && items.length) { e.preventDefault(); location.href = BASE + items[cursor].href; }
    });
  }

  /* ── 5. 光箱 ─────────────────────────────────────────────────────── */
  function initLightbox() {
    const box = document.querySelector('.lightbox');
    if (!box) return;
    const img = box.querySelector('img');
    const closeBtn = box.querySelector('.lightbox-close');
    const close = () => {
      box.classList.remove('is-open');
      document.body.dataset.lock = 'false';
      img.removeAttribute('src');
    };
    document.querySelectorAll('[data-lightbox]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const source = link.querySelector('img');
        img.src = (source && (source.currentSrc || source.src)) || link.getAttribute('href');
        img.alt = (source && source.alt) || '';
        box.classList.add('is-open');
        document.body.dataset.lock = 'true';
        closeBtn.focus();
      });
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* ── 6. 复制（校验值，落印） ─────────────────────────────────────── */
  function initCopy() {
    document.querySelectorAll('[data-copy]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const text = btn.dataset.copy || '';
        try { await navigator.clipboard.writeText(text); }
        catch (_) {
          const ta = document.createElement('textarea');
          ta.value = text; document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); } catch (__) {}
          ta.remove();
        }
        const old = btn.dataset.label || btn.textContent;
        btn.dataset.label = old;
        btn.textContent = '已复制';
        btn.classList.add('is-copied');
        setTimeout(() => { btn.textContent = old; btn.classList.remove('is-copied'); }, 1700);
      });
    });
  }

  /* ── 7. 页顶潮位 / 页头收拢 / 回到顶部 ───────────────────────────── */
  function initScrollChrome() {
    if (IS_STATIC) return;
    const bar = document.createElement('div');
    bar.className = 'scroll-tide';
    bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = '<i></i>';
    document.body.appendChild(bar);
    const fill = bar.firstChild;

    const head = document.querySelector('.site-head');
    let toTop = null;
    if (!document.querySelector('.page-home')) {
      toTop = document.createElement('button');
      toTop.className = 'to-top';
      toTop.type = 'button';
      toTop.setAttribute('aria-label', '回到顶部');
      toTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V5M6 11l6-6 6 6"/></svg>';
      toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' }));
      document.body.appendChild(toTop);
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const y = window.scrollY;
      fill.style.transform = 'scaleX(' + (max > 0 ? (y / max) : 0).toFixed(4) + ')';
      if (head) head.classList.toggle('is-solid', y > 10);
      if (toTop) toTop.classList.toggle('is-on', y > 900);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ── 8. 画面呼吸：可见时缓慢推拉 ─────────────────────────────────── */
  function initLiveArt() {
    const nodes = Array.from(document.querySelectorAll('.scene, .ds-scene, .art-band, .plate--breath'));
    if (!nodes.length || reduceMotion() || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle('is-live', e.isIntersecting));
    }, { threshold: 0.2 });
    nodes.forEach((n) => io.observe(n));
  }

  /* ── 9. 视差：墨潮各层 / 图版 ────────────────────────────────────── */
  function initParallax() {
    if (reduceMotion() || !finePointer()) return;
    const layerEls = Array.from(document.querySelectorAll('[data-parallax]'));
    if (!layerEls.length) return;
    let tx = 0, ty = 0, rx = 0, ry = 0, raf = 0;
    const apply = () => {
      raf = 0;
      rx += (tx - rx) * .1;
      ry += (ty - ry) * .1;
      layerEls.forEach((el) => {
        const d = parseFloat(el.dataset.depth || '.4');
        el.style.transform = 'translate3d(' + (rx * d).toFixed(2) + 'px,' + (ry * d * .6).toFixed(2) + 'px,0)';
      });
      if (Math.abs(tx - rx) > .05 || Math.abs(ty - ry) > .05) raf = requestAnimationFrame(apply);
    };
    const onMove = (e) => {
      tx = (e.clientX / window.innerWidth - .5) * 14;
      ty = (e.clientY / window.innerHeight - .5) * 10;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(apply); });
  }

  /* ── 10. 叠纸：轻微跟随倾斜 ──────────────────────────────────────── */
  function initDeckTilt() {
    if (reduceMotion() || !finePointer()) return;
    document.querySelectorAll('.stack-deck').forEach((deck) => {
      const main = deck.querySelector('.stack-deck__main');
      if (!main) return;
      const onMove = (e) => {
        const r = deck.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - .5;
        const ny = (e.clientY - r.top) / r.height - .5;
        main.style.setProperty('--tilt-x', (-ny * 2.4).toFixed(2) + 'deg');
        main.style.setProperty('--tilt-y', (nx * 3).toFixed(2) + 'deg');
      };
      const reset = () => {
        main.style.setProperty('--tilt-x', '0deg');
        main.style.setProperty('--tilt-y', '0deg');
      };
      deck.addEventListener('pointermove', onMove, { passive: true });
      deck.addEventListener('pointerleave', reset);
    });
  }

  /* ── 11. 磁吸按钮（2–3px，克制） ─────────────────────────────────── */
  function initMagnetic() {
    if (reduceMotion() || !finePointer()) return;
    document.querySelectorAll('.btn, .btn-dl, .filmstrip__btn, .icon-btn').forEach((el) => {
      const onMove = (e) => {
        const r = el.getBoundingClientRect();
        const dx = ((e.clientX - r.left) / r.width - .5) * 4;
        const dy = ((e.clientY - r.top) / r.height - .5) * 3;
        el.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
      };
      const reset = () => { el.style.transform = ''; };
      el.addEventListener('pointermove', onMove, { passive: true });
      el.addEventListener('pointerleave', reset);
    });
  }

  /* ── 12. 胶片带：拖动 / 按钮 / 滚轮 ──────────────────────────────── */
  function initFilmstrip() {
    document.querySelectorAll('.filmstrip').forEach((strip) => {
      const vp = strip.querySelector('.filmstrip__viewport');
      if (!vp) return;
      const prev = strip.querySelector('[data-strip-prev]');
      const next = strip.querySelector('[data-strip-next]');
      const step = () => {
        const item = vp.querySelector('.filmstrip__item');
        return item ? item.getBoundingClientRect().width + 18 : 400;
      };
      if (prev) prev.addEventListener('click', () => vp.scrollBy({ left: -step(), behavior: reduceMotion() ? 'auto' : 'smooth' }));
      if (next) next.addEventListener('click', () => vp.scrollBy({ left: step(), behavior: reduceMotion() ? 'auto' : 'smooth' }));

      // 拖动
      let down = false, startX = 0, startLeft = 0, moved = false;
      vp.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'touch') return;
        down = true; moved = false; startX = e.clientX; startLeft = vp.scrollLeft;
        vp.classList.add('is-dragging');
      });
      window.addEventListener('pointermove', (e) => {
        if (!down) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 3) moved = true;
        vp.scrollLeft = startLeft - dx;
      });
      window.addEventListener('pointerup', () => {
        if (!down) return;
        down = false;
        vp.classList.remove('is-dragging');
      });
      vp.addEventListener('click', (e) => {
        if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
      }, true);
      // 竖向滚轮 → 横向（触控板横向滚动不拦截）
      vp.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && !e.shiftKey) {
          e.preventDefault();
          vp.scrollLeft += e.deltaY;
        }
      }, { passive: false });
    });
  }

  /* ── 13. 页脚海平线 ─────────────────────────────────────────────── */
  function initSeaLine() {
    const foot = document.querySelector('.site-foot .wrap-wide') || document.querySelector('.site-foot .wrap');
    if (!foot || foot.querySelector('.foot-sea')) return;
    const div = document.createElement('div');
    div.className = 'foot-sea';
    div.setAttribute('aria-hidden', 'true');
    div.innerHTML = '<svg viewBox="0 0 1200 64" preserveAspectRatio="none"><path d="M0 38 C 130 30 260 46 390 38 S 650 26 780 36 S 1020 44 1140 36 S 1170 34 1200 38"/><path d="M0 54 C 150 48 320 60 490 54 S 810 44 980 54 S 1160 56 1200 52" stroke-opacity=".55"/></svg>';
    foot.insertBefore(div, foot.firstChild);
  }

  /* ── 14. 年份 / 调试 ────────────────────────────────────────────── */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  }

  function initDebug() {
    if (!/[?&]debug=1/.test(location.search)) return;
    window.addEventListener('load', () => {
      const vw = document.documentElement.clientWidth;
      const offenders = Array.from(document.querySelectorAll('body *'))
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width && r.height && (r.right > vw + 1 || r.left < -1))
        .slice(0, 14)
        .map(({ el, r }) => {
          const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).join('.') : '';
          return (el.tagName.toLowerCase() + (cls ? '.' + cls : '')) + '@' + Math.round(r.left) + '..' + Math.round(r.right);
        });
      document.title = 'VW=' + vw + ' SW=' + document.documentElement.scrollWidth + ' || ' + offenders.join(' ; ');
    });
  }

  /* ── 启动 ───────────────────────────────────────────────────────── */
  const start = () => {
    initDebug();
    initWorld();
    initNav();
    initReveal();
    initCount();
    initPalette();
    initLightbox();
    initCopy();
    initScrollChrome();
    initLiveArt();
    initParallax();
    initDeckTilt();
    initMagnetic();
    initFilmstrip();
    initSeaLine();
    initYear();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
