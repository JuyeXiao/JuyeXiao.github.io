// common.js - 公共功能模块
// 提供所有页面共用的基础功能

/**
 * 公共功能管理器
 */
class CommonFeatures {
    constructor() {
        this.isInitialized = false;
        this.observers = new Map();
        this.themeToggle = null;
        this.langToggle = null;
        this.navbar = null;
    }

    /**
     * 初始化所有公共功能
     */
    init() {
        if (this.isInitialized) {
            console.warn('CommonFeatures already initialized');
            return;
        }

        try {
            this.initLucideIcons();
            this.initNavbarScroll();
            this.initMobileMenu();
            this.initThemeToggle();
            this.initLanguageToggle();
            this.initScrollReveal();
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize CommonFeatures:', error);
        }
    }

    /**
     * 激活 Lucide 图标
     */
    initLucideIcons() {
        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        } else {
            console.warn('Lucide icons not available');
        }
    }

    /**
     * 导航栏滚动效果
     */
    initNavbarScroll() {
        this.navbar = document.getElementById('navbar');
        if (!this.navbar) {
            console.warn('Navbar element not found');
            return;
        }

        const handleScroll = () => {
            if (window.scrollY > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // 存储引用以便后续清理
        this.observers.set('navbar-scroll', handleScroll);
    }

    /**
     * 移动端菜单（所有页面通用；页面没有菜单标记时静默跳过）
     */
    initMobileMenu() {
        const toggle = document.getElementById('menu-toggle');
        const menu = document.getElementById('mobile-menu');
        if (!toggle || !menu || !this.navbar) {
            return;
        }

        const setOpen = (open) => {
            this.navbar.classList.toggle('menu-open', open);
            toggle.setAttribute('aria-expanded', String(open));
        };

        toggle.addEventListener('click', () => {
            setOpen(!this.navbar.classList.contains('menu-open'));
        });

        // 点击菜单项后收起
        menu.addEventListener('click', (e) => {
            if (e.target.closest('.nav-link')) {
                setOpen(false);
            }
        });

        // Escape 关闭并把焦点还给按钮
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.navbar.classList.contains('menu-open')) {
                setOpen(false);
                toggle.focus();
            }
        });
    }

    /**
     * 主题切换功能
     */
    initThemeToggle() {
        this.themeToggle = document.getElementById('theme-toggle');
        const htmlEl = document.documentElement;

        // 初始主题设置
        if (localStorage.getItem('theme') === 'dark' || 
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            htmlEl.classList.add('dark');
        } else {
            htmlEl.classList.remove('dark');
        }

        if (!this.themeToggle) {
            console.warn('Theme toggle button not found');
            return;
        }

        const handleThemeToggle = () => {
            // 添加旋转动画
            this.themeToggle.classList.add('spinning');
            setTimeout(() => this.themeToggle.classList.remove('spinning'), 650);

            // 切换主题
            htmlEl.classList.toggle('dark');
            const theme = htmlEl.classList.contains('dark') ? 'dark' : 'light';
            localStorage.setItem('theme', theme);

            // 触发主题变化事件，供其他模块监听
            window.dispatchEvent(new CustomEvent('themechange', { 
                detail: { theme } 
            }));
        };

        this.themeToggle.addEventListener('click', handleThemeToggle);
        this.observers.set('theme-toggle', handleThemeToggle);
    }

    /**
     * 语言切换功能
     * Note: The actual language switching is handled by language-switcher.js
     * This only ensures the button exists and has the right initial state
     */
    initLanguageToggle() {
        this.langToggle = document.getElementById('lang-toggle');
        if (!this.langToggle) {
            console.warn('Language toggle button not found');
            return;
        }

        // The language-switcher.js module will handle the actual functionality
        // We just ensure the button is ready here
    }

    /**
     * Legacy method kept for compatibility
     * @deprecated Use language-switcher.js instead
     */
    updateLanguageButton(lang) {
        // This method is now handled by language-switcher.js
    }

    /**
     * Legacy method kept for compatibility
     * @deprecated Use language-switcher.js instead
     */
    updatePageLanguage(lang) {
        // This method is now handled by language-switcher.js
    }

    /**
     * 滚动渐现动画
     */
    initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal');
        if (revealElements.length === 0) {
            return;
        }

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // 一次性动画，观察后即可移除
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
        this.observers.set('scroll-reveal', revealObserver);
    }

    /**
     * 导航链接滚动监听（首页专用）— 基于顶部锚线判定当前区段
     * @param {NodeList} sections - 要监听的页面区段（文档顺序）
     * @param {NodeList} navLinks - 导航链接（含桌面与移动端）
     */
    initScrollSpy(sections, navLinks) {
        if (!sections.length || !navLinks.length) {
            return;
        }

        const OFFSET = 96; // 72px 导航栏 + 呼吸空间，与 scroll-margin-top: 88px 协调
        const sectionList = Array.from(sections);
        const linkList = Array.from(navLinks);
        let ticking = false;

        const update = () => {
            ticking = false;
            let currentId = null;

            const atBottom = window.innerHeight + window.scrollY
                >= document.documentElement.scrollHeight - 2;
            if (atBottom) {
                // 页底强制点亮最后一节（联系），否则短区段永远无法激活
                currentId = sectionList[sectionList.length - 1].id;
            } else {
                for (const section of sectionList) {
                    if (section.getBoundingClientRect().top <= OFFSET) {
                        currentId = section.id;
                    }
                }
            }

            linkList.forEach(link => {
                const href = link.getAttribute('href') || '';
                link.classList.toggle('active', !!currentId && href.endsWith(`#${currentId}`));
            });
        };

        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        update();

        const handle = { disconnect: () => window.removeEventListener('scroll', onScroll) };
        this.observers.set('scroll-spy', handle);
        return handle;
    }

    /**
     * 数字滚动动画（首页专用）
     * @param {NodeList} countElements - 包含 data-count 属性的元素
     */
    initCountUp(countElements) {
        if (!countElements.length) {
            return;
        }

        const countUp = (el) => {
            const target = +el.getAttribute('data-count');
            const duration = 2000;
            let current = 0;
            const stepTime = Math.abs(Math.floor(duration / target));
            
            const timer = setInterval(() => {
                current += 1;
                el.textContent = current;
                if (current === target) {
                    clearInterval(timer);
                }
            }, stepTime);
        };

        const countObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    countUp(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.8 });

        countElements.forEach(el => countObserver.observe(el));
        this.observers.set('count-up', countObserver);
        return countObserver;
    }

    /**
     * 平滑滚动到指定元素
     * @param {string} targetId - 目标元素ID
     * @param {number} offset - 偏移量（用于固定导航栏）
     */
    scrollToElement(targetId, offset = 88) {
        const targetEl = document.querySelector(targetId);
        if (!targetEl) {
            console.warn(`Target element ${targetId} not found`);
            return;
        }

        const y = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;
        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
        window.scrollTo({ top: y, behavior });
    }

    /**
     * 初始化导航链接的平滑滚动
     */
    initSmoothScroll() {
        document.querySelectorAll('a.nav-link[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                const targetEl = document.querySelector(targetId);
                if (!targetEl) return;
                
                e.preventDefault();
                this.scrollToElement(targetId);
            });
        });
    }

    /**
     * 显示通知消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型 ('success', 'error', 'info', 'warning')
     * @param {number} duration - 显示时长（毫秒）
     */
    showNotification(message, type = 'info', duration = 3000) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        // 可访问性：错误用 assertive 立即播报，其它用 polite
        notification.setAttribute('role', type === 'error' ? 'alert' : 'status');
        notification.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        notification.setAttribute('aria-atomic', 'true');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--${type === 'error' ? 'coral' : type === 'success' ? 'sage' : 'blue'});
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-size: 14px;
        `;
        notification.textContent = message;

        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 自动移除
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    /**
     * 获取当前主题
     * @returns {string} 'light' | 'dark'
     */
    getCurrentTheme() {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }

    /**
     * 清理所有事件监听器和观察器
     */
    destroy() {
        this.observers.forEach((observer, key) => {
            if (observer && typeof observer.disconnect === 'function') {
                observer.disconnect();
            } else if (typeof observer === 'function' && key === 'navbar-scroll') {
                window.removeEventListener('scroll', observer);
            }
        });
        this.observers.clear();
        this.isInitialized = false;
    }
}

// 创建全局实例
window.commonFeatures = new CommonFeatures();

// 自动初始化（在 DOM 加载完成后）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.commonFeatures.init();
    });
} else {
    window.commonFeatures.init();
}

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommonFeatures;
}