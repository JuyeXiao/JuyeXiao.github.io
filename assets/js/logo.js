// logo.js - 导航栏Logo动画专用JavaScript文件

/**
 * Logo动画管理类
 * 负责处理"数据织者"Logo的动画效果
 */
class LogoAnimation {
    constructor() {
        this.weaverLine = null;
        this.logoLetters = null;
        this.isAnimating = false;
        this.init();
    }

    /**
     * 初始化Logo动画
     */
    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupElements();
                this.bindEvents();
            });
        } else {
            this.setupElements();
            this.bindEvents();
        }
    }

    /**
     * 设置动画元素引用
     */
    setupElements() {
        this.weaverLine = document.getElementById('weaverLine');
        this.logoLetters = document.getElementById('logoLetters');
        
        if (!this.weaverLine || !this.logoLetters) {
            console.warn('Logo animation elements not found');
            return;
        }
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // Logo点击功能 - 根据页面类型执行不同操作
        const logoContainer = document.getElementById('navbar-logo');
        if (logoContainer) {
            logoContainer.addEventListener('click', (e) => {
                // 检查是否在主页面
                if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
                    // 主页面：阻止默认跳转，滚动到Hero并重播动画
                    e.preventDefault();
                    
                    // 滚动到Hero区域
                    const heroSection = document.getElementById('hero');
                    if (heroSection) {
                        heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                    
                    // 延迟一点时间重播动画，让滚动先完成
                    setTimeout(() => {
                        this.playAnimation();
                    }, 500);
                }
                // 其他页面：保持默认行为（通过HTML链接导航）
            });
        }

        // 页面加载时自动播放动画
        window.addEventListener('load', () => {
            // 延迟300ms开始，让页面完全渲染
            setTimeout(() => {
                this.playAnimation();
            }, 300);
        });
    }

    /**
     * 播放完整动画序列
     */
    playAnimation() {
        if (this.isAnimating || !this.weaverLine || !this.logoLetters) {
            return;
        }

        this.isAnimating = true;

        // 重置动画类
        this.weaverLine.classList.remove('animate');
        this.logoLetters.classList.remove('animate');
        
        // 强制重排
        void this.weaverLine.offsetWidth;
        void this.logoLetters.offsetWidth;
        
        // 800ms后：纬线穿梭
        setTimeout(() => {
            this.weaverLine.classList.add('animate');
        }, 800);
        
        // 1800ms后：图样显现
        setTimeout(() => {
            this.logoLetters.classList.add('animate');
        }, 1800);
        
        // 2800ms后：完成
        setTimeout(() => {
            this.isAnimating = false;
        }, 2800);
    }



    /**
     * 重播动画（外部接口）
     */
    replay() {
        this.playAnimation();
    }

    /**
     * 停止动画
     */
    stop() {
        this.isAnimating = false;
        if (this.weaverLine) this.weaverLine.classList.remove('animate');
        if (this.logoLetters) this.logoLetters.classList.remove('animate');
    }
}

// 全局实例
let logoAnimationInstance = null;

/**
 * 初始化Logo动画
 */
function initLogoAnimation() {
    if (!logoAnimationInstance) {
        logoAnimationInstance = new LogoAnimation();
    }
    return logoAnimationInstance;
}

/**
 * 重播Logo动画（全局函数）
 */
function replayLogoAnimation() {
    if (logoAnimationInstance) {
        logoAnimationInstance.replay();
    }
}

// 自动初始化
initLogoAnimation();

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LogoAnimation, initLogoAnimation, replayLogoAnimation };
}
