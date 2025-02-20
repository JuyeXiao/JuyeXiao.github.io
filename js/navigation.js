class PageTransition {
    constructor() {
        this.transition = document.querySelector('.page-transition');
        this.links = document.querySelectorAll('a[data-page]');
        this.currentPage = window.location.pathname.split('/').pop() || 'index.html';
        this.pageOrder = ['index.html', 'about.html', 'projects.html', 'resume.html', 'contact.html'];
        this.init();
    }

    init() {
        this.links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                if (target !== this.currentPage) {
                    const direction = this.getTransitionDirection(target);
                    this.changePage(target, direction);
                }
            });
        });

        window.addEventListener('popstate', (e) => {
            const target = window.location.pathname.split('/').pop() || 'index.html';
            const direction = this.getTransitionDirection(target);
            this.changePage(target, direction, false);
        });
    }

    getTransitionDirection(targetPath) {
        const currentIndex = this.pageOrder.indexOf(this.currentPage);
        const targetIndex = this.pageOrder.indexOf(targetPath);
        return targetIndex > currentIndex ? 'right' : 'left';
    }

    async changePage(target, direction, addToHistory = true) {
        // 设置过渡方向
        this.transition.setAttribute('data-direction', direction);
        const currentContainer = document.querySelector('.page-container');
        currentContainer.setAttribute('data-direction', direction);

        // 开始过渡动画
        await this.startTransition();

        // 更新历史记录
        if (addToHistory) {
            history.pushState({}, '', target);
        }

        try {
            // 获取新页面内容
            const response = await fetch(target);
            if (!response.ok) throw new Error('Page not found');
            
            const html = await response.text();
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, 'text/html');
            
            // 准备新页面
            const newMain = newDoc.querySelector('main');
            if (!newMain) throw new Error('Main content not found');

            // 设置新页面初始位置
            newMain.style.opacity = '0';
            newMain.style.transform = `translateX(${direction === 'right' ? '100%' : '-100%'})`;
            document.body.appendChild(newMain);

            // 执行过渡动画
            requestAnimationFrame(() => {
                // 旧页面滑出
                currentContainer.style.transform = `translateX(${direction === 'right' ? '-100%' : '100%'})`;
                currentContainer.style.opacity = '0';
                
                // 新页面滑入
                newMain.style.transform = 'translateX(0)';
                newMain.style.opacity = '1';
                newMain.style.transition = 'all 0.6s ease-in-out';
            });

            // 清理旧页面
            setTimeout(() => {
                currentContainer.remove();
            }, 600);

            // 更新状态
            document.title = newDoc.title;
            this.updateActiveLink(target);
            this.currentPage = target;
        } catch (error) {
            console.error('Page transition error:', error);
            // 错误处理：重定向或显示错误消息
        }

        await this.endTransition();
    }

    async startTransition() {
        return new Promise(resolve => {
            this.transition.classList.add('page-leave');
            setTimeout(resolve, 600);
        });
    }

    async endTransition() {
        return new Promise(resolve => {
            this.transition.classList.remove('page-leave');
            this.transition.classList.add('page-enter');
            
            setTimeout(() => {
                this.transition.classList.remove('page-enter');
                resolve();
            }, 600);
        });
    }

    updateActiveLink(path) {
        this.links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === path) {
                link.classList.add('active');
            }
        });
    }
}

// 初始化页面过渡
document.addEventListener('DOMContentLoaded', () => {
    new PageTransition();
}); 