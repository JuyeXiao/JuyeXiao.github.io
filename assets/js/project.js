// project.js - 项目详情页专用逻辑
// 主题切换 / 导航 / scroll-reveal 由 common.js 统一提供

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    initScrollReveals();
    initCodeHighlight();
    initToc();
    initScrollProgress();
    initReadingTime();
    initFigureViewer();
  });

  // 内容入场动画
  function initScrollReveals() {
    const elements = document.querySelectorAll('.fade-in, .slide-up, .reveal');
    if (!elements.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    elements.forEach((el) => observer.observe(el));
  }

  function initCodeHighlight() {
    if (typeof Prism !== 'undefined') Prism.highlightAll();
  }

  // 目录 active 高亮 + 平滑滚动
  function initToc() {
    const tocLinks = document.querySelectorAll('.toc-link');
    if (!tocLinks.length) return;

    tocLinks.forEach((link) => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (!target) return;
        const top = target.getBoundingClientRect().top + window.scrollY - 96;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top, behavior: reducedMotion ? 'instant' : 'smooth' });
        history.replaceState(null, '', `#${targetId}`);
      });
    });

    const sections = document.querySelectorAll('section[id]');
    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -70% 0px',
      threshold: 0
    };
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('id');
        const tocLink = document.querySelector(`.toc-link[href="#${id}"]`);
        if (!tocLink) return;
        if (entry.isIntersecting) {
          document.querySelectorAll('.toc-link').forEach((l) => l.classList.remove('active'));
          tocLink.classList.add('active');
        }
      });
    }, observerOptions);
    sections.forEach((s) => sectionObserver.observe(s));
  }

  // 顶部 2px 阅读进度条
  function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    const compute = () => {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop || document.body.scrollTop;
      const total = doc.scrollHeight - doc.clientHeight;
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    compute();
  }

  // Hero 阅读时长 — 优雅降级：若 HTML 已硬编码则不动
  function initReadingTime() {
    const node = document.querySelector('.reading-time[data-auto]');
    if (!node) return;
    const text = document.querySelector('.content-area')?.textContent || '';
    const wordsZh = text.replace(/\s+/g, '').length;
    const wordsEn = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(Math.max(wordsZh / 380, wordsEn / 220)));
    node.textContent = document.documentElement.lang.startsWith('en')
      ? `${minutes} min read` : `约 ${minutes} 分钟阅读`;
  }

  // Source figures are shared by both languages; the viewer preserves reading position.
  function initFigureViewer() {
    const triggers = document.querySelectorAll('.figure-zoom');
    if (!triggers.length) return;
    const english = document.documentElement.lang.startsWith('en');
    const dialog = document.createElement('dialog');
    dialog.className = 'figure-viewer';
    dialog.setAttribute('aria-label', english ? 'Figure viewer' : '图片查看器');
    dialog.innerHTML = `<div class="figure-viewer__toolbar">
      <button type="button" class="btn-secondary" data-size>${english ? 'Original size' : '原始尺寸'}</button>
      <button type="button" class="btn-secondary" data-close>${english ? 'Close' : '关闭'}</button>
      </div><div class="figure-viewer__canvas"><img alt=""></div><p class="figure-viewer__caption"></p>`;
    document.body.append(dialog);
    const image = dialog.querySelector('img');
    const toggle = dialog.querySelector('[data-size]');
    const close = dialog.querySelector('[data-close]');
    let opener;
    let scrollY = 0;
    let previousOverflow;
    let previousPadding;
    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        opener = trigger;
        scrollY = window.scrollY;
        const original = trigger.querySelector('img');
        image.src = original.currentSrc || original.src;
        image.alt = original.alt;
        dialog.querySelector('.figure-viewer__caption').textContent = original.alt;
        dialog.classList.remove('is-original');
        toggle.textContent = english ? 'Original size' : '原始尺寸';
        toggle.setAttribute('aria-pressed', 'false');
        previousOverflow = document.body.style.overflow;
        previousPadding = document.body.style.paddingRight;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.body.style.overflow = 'hidden';
        dialog.showModal();
        close.focus();
      });
    });
    toggle.addEventListener('click', () => {
      const original = dialog.classList.toggle('is-original');
      toggle.textContent = original ? (english ? 'Fit window' : '适应窗口') : (english ? 'Original size' : '原始尺寸');
      toggle.setAttribute('aria-pressed', String(original));
    });
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      opener?.focus({ preventScroll: true });
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    });
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.ProjectPage = { scrollToTop };
})();
