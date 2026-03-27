// project.js - 项目详情页专用逻辑
// 注意：主题切换和导航滚动等基础功能由 common.js 提供

(function () {
  // 页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面特定功能
    initProjectPageFeatures();
  });

  // 初始化项目页面特定功能
  function initProjectPageFeatures() {
    // 初始化滚动效果
    initScrollEffects();
    
    // 初始化图片放大功能
    initImageZoom();
    
    // 初始化代码高亮
    initCodeHighlight();
    
    // 初始化目录导航
    initTableOfContents();
  }

  // 初始化滚动效果
  function initScrollEffects() {
    const elements = document.querySelectorAll('.fade-in, .slide-up, .reveal');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1
    });
    
    elements.forEach(element => {
      observer.observe(element);
    });
  }

  // 初始化图片放大功能
  function initImageZoom() {
    const images = document.querySelectorAll('.project-content img, article img');
    
    images.forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function() {
        // 创建全屏查看容器
        const overlay = document.createElement('div');
        overlay.className = 'image-overlay';
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 9999; display: flex; align-items: center; justify-content: center; cursor: zoom-out;';
        
        const fullImg = document.createElement('img');
        fullImg.src = this.src;
        fullImg.style.cssText = 'max-width: 90%; max-height: 90%; object-fit: contain;';
        
        overlay.appendChild(fullImg);
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', function() {
          document.body.removeChild(overlay);
        });
      });
    });
  }

  // 初始化代码高亮
  function initCodeHighlight() {
    // Prism.js 通常会自动初始化
    if (typeof Prism !== 'undefined') {
      Prism.highlightAll();
    }
  }

  // 初始化目录导航
  function initTableOfContents() {
    const tocLinks = document.querySelectorAll('.table-of-contents a');
    
    tocLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          const offsetTop = targetElement.offsetTop - 100; // 留出导航栏高度
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
    
    // 高亮当前所在章节
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -70% 0px',
      threshold: 0
    };
    
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        const id = entry.target.getAttribute('id');
        const tocLink = document.querySelector(`.table-of-contents a[href="#${id}"]`);
        
        if (tocLink) {
          if (entry.isIntersecting) {
            // 移除其他活动链接
            document.querySelectorAll('.table-of-contents a').forEach(link => {
              link.classList.remove('active');
            });
            tocLink.classList.add('active');
          }
        }
      });
    };
    
    const sectionObserver = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => {
      sectionObserver.observe(section);
    });
  }

  // 项目页面滚动到顶部功能
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // 导出函数供外部使用
  window.ProjectPage = {
    scrollToTop: scrollToTop
  };
})();