// 等待公共模块初始化完成后执行页面特有功能
document.addEventListener('DOMContentLoaded', () => {
  // 公共功能已由 common.js 自动初始化
  initIndexPageFeatures();
});

function initIndexPageFeatures() {

  // 导航链接高亮 (Scroll Spy) - 使用公共模块
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  window.commonFeatures.initScrollSpy(sections, navLinks);

  // 平滑滚动导航 - 使用公共模块
  window.commonFeatures.initSmoothScroll();

  // 数字滚动动画 - 使用公共模块
  const countElements = document.querySelectorAll('[data-count]');
  window.commonFeatures.initCountUp(countElements);

  // 主题切换和语言切换已由公共模块处理
}