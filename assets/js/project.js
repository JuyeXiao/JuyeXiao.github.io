// project.js - 项目详情页专用逻辑
// 主题切换 / 导航 / scroll-reveal 由 common.js 统一提供

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    initScrollReveals();
    initImageZoom();
    initCodeHighlight();
    initToc();
    initScrollProgress();
    initReadingTime();
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

  // 点击图片全屏查看
  function initImageZoom() {
    const images = document.querySelectorAll(
      '.figure-editorial img, .content-area img, .project-content img, article img'
    );
    images.forEach((img) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function () {
        const overlay = document.createElement('div');
        overlay.className = 'image-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(20,18,15,0.92);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:40px;';
        const full = document.createElement('img');
        full.src = this.src;
        full.style.cssText = 'max-width:92%;max-height:92%;object-fit:contain;box-shadow:0 24px 60px rgba(0,0,0,0.5);';
        overlay.appendChild(full);
        document.body.appendChild(overlay);
        overlay.addEventListener('click', () => document.body.removeChild(overlay));
      });
    });
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
        const top = target.offsetTop - 96;
        window.scrollTo({ top, behavior: 'smooth' });
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
    node.textContent = `约 ${minutes} 分钟阅读`;
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.ProjectPage = { scrollToTop };
})();
