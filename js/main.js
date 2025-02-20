// 主要JavaScript代码 

// 页面加载动画
document.addEventListener('DOMContentLoaded', () => {
    gsap.from('.hero-content', {
        duration: 1,
        y: 60,
        opacity: 0,
        ease: 'power3.out'
    });

    gsap.from('.nav-links a', {
        duration: 0.8,
        y: -20,
        opacity: 0,
        stagger: 0.1,
        ease: 'power2.out'
    });

    initializeLanguage();
    initializeLanguageDisplay();
});

// Glitch效果
const glitchText = document.querySelector('.glitch');
if (glitchText) {
    setInterval(() => {
        glitchText.classList.add('active');
        setTimeout(() => {
            glitchText.classList.remove('active');
        }, 200);
    }, 3000);
}

// 技能条动画
const observerOptions = {
    threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.width = entry.target.getAttribute('data-width');
        }
    });
}, observerOptions);

document.querySelectorAll('.progress').forEach(progress => {
    progress.style.width = '0';
    progress.setAttribute('data-width', progress.style.width);
    observer.observe(progress);
});

// 表单提交消息
const formMessages = {
    en: {
        sending: 'Sending...',
        success: 'Message sent successfully!',
        error: 'Failed to send message. Please try again.',
        submit: 'Send Message'
    },
    zh: {
        sending: '发送中...',
        success: '消息发送成功！',
        error: '发送失败，请重试。',
        submit: '发送消息'
    }
};

// 表单提交处理
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentLang = document.documentElement.getAttribute('data-lang');
        const formData = new FormData(contactForm);
        const submitButton = contactForm.querySelector('button[type="submit"]');
        
        try {
            submitButton.disabled = true;
            submitButton.textContent = formMessages[currentLang].sending;
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            alert(formMessages[currentLang].success);
            contactForm.reset();
        } catch (error) {
            alert(formMessages[currentLang].error);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = formMessages[currentLang].submit;
        }
    });
}

// 移动端菜单
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// 点击导航链接时关闭菜单
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// 导航栏滚动效果
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.querySelector('.nav-blur').style.background = `rgba(var(--bg-primary-rgb), 0.85)`;
    } else {
        navbar.querySelector('.nav-blur').style.background = 'transparent';
    }
});

// 语言切换
const langDropdown = document.querySelector('.lang-dropdown');
const langToggle = document.querySelector('.lang-toggle');
const currentLangSpan = document.querySelector('.current-lang');

if (langDropdown && langToggle) {
    // 点击切换下拉菜单
    langToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.classList.toggle('active');
    });

    // 点击选项切换语言
    document.querySelectorAll('.lang-options li').forEach(option => {
        option.addEventListener('click', () => {
            const newLang = option.getAttribute('data-lang');
            const currentLang = document.documentElement.getAttribute('data-lang');
            
            if (newLang !== currentLang) {
                document.documentElement.setAttribute('data-lang', newLang);
                localStorage.setItem('lang', newLang);
                
                // 更新当前语言显示
                currentLangSpan.textContent = option.querySelector('.lang-code').textContent;
                
                // 更新所有带有数据属性的文本
                document.querySelectorAll('[data-en][data-zh]').forEach(element => {
                    element.textContent = element.getAttribute(`data-${newLang}`);
                });
            }
            
            langDropdown.classList.remove('active');
        });
    });

    // 点击页面其他地方关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!langDropdown.contains(e.target)) {
            langDropdown.classList.remove('active');
        }
    });
}

// 主题切换
const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// 初始化语言文本
function initializeLanguage() {
    const currentLang = document.documentElement.getAttribute('data-lang');
    document.querySelectorAll('[data-en][data-zh]').forEach(element => {
        element.textContent = element.getAttribute(`data-${currentLang}`);
    });
}

// 初始化当前语言显示
function initializeLanguageDisplay() {
    const currentLang = document.documentElement.getAttribute('data-lang');
    const langCode = currentLang === 'zh' ? '中' : 'EN';
    if (currentLangSpan) {
        currentLangSpan.textContent = langCode;
    }
}

// 添加语言数据属性
const translations = {
    en: {
        'hero-title': 'Data Explorer',
        'hero-role': 'Data Analyst & Full Stack Developer',
        'hero-tagline': 'Transforming Data into Insights, Building the Future with Code',
        'view-projects': 'View Projects',
        'contact-me': 'Contact Me',
        // ... 添加更多翻译
    },
    zh: {
        'hero-title': '数据探索者',
        'hero-role': '数据分析师 & 全栈工程师',
        'hero-tagline': '将数据转化为洞见，用代码构建未来',
        'view-projects': '查看项目',
        'contact-me': '联系我',
        // ... 添加更多翻译
    }
};

// 更新所有需要翻译的元素
function updateTranslations() {
    const currentLang = document.documentElement.getAttribute('data-lang');
    Object.entries(translations[currentLang]).forEach(([key, value]) => {
        const elements = document.querySelectorAll(`[data-translate="${key}"]`);
        elements.forEach(element => {
            element.textContent = value;
        });
    });
}

// 活动链接高亮
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelector(`.nav-link[href*=${sectionId}]`).classList.add('active');
        } else {
            document.querySelector(`.nav-link[href*=${sectionId}]`).classList.remove('active');
        }
    });
});

// 添加鼠标移动视差效果
document.addEventListener('mousemove', (e) => {
    const navbar = document.querySelector('.navbar');
    const { clientX, clientY } = e;
    const x = (clientX - window.innerWidth / 2) * 0.01;
    const y = (clientY - window.innerHeight / 2) * 0.01;
    
    navbar.style.setProperty('--mouse-x', `${x}px`);
    navbar.style.setProperty('--mouse-y', `${y}px`);
});

// 按钮流光效果
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mouseenter', () => {
        // 移除之前的动画类
        button.classList.remove('animate');
        
        // 触发重排以重置动画
        void button.offsetWidth;
        
        // 添加动画类
        button.classList.add('animate');
        
        // GSAP动画
        gsap.to(button, {
            duration: 0.3,
            scale: 1.05,
            ease: "power2.out"
        });
        
        // 发光效果
        gsap.to(button, {
            duration: 0.2,
            boxShadow: `0 0 20px ${button.classList.contains('primary') ? 'rgba(0, 255, 157, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
            ease: "power2.out"
        });
    });

    button.addEventListener('mouseleave', () => {
        gsap.to(button, {
            duration: 0.3,
            scale: 1,
            boxShadow: 'none',
            ease: "power2.out"
        });
    });
});

// 3D 文字浮动效果
function init3DEffect() {
    const hero = document.querySelector('.hero');
    const title = document.querySelector('.glitch');
    const role = document.querySelector('.role');
    const tagline = document.querySelector('.tagline');
    
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    
    // 平滑动画函数
    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    // 更新鼠标位置
    function onMouseMove(event) {
        targetX = (event.clientX - windowHalfX) * 0.15;
        targetY = (event.clientY - windowHalfY) * 0.15;
    }
    
    // 添加鼠标移动监听
    hero.addEventListener('mousemove', onMouseMove);
    
    // 动画函数
    function animate() {
        // 平滑过渡
        mouseX = lerp(mouseX, targetX, 0.05);
        mouseY = lerp(mouseY, targetY, 0.05);
        
        // 标题动画 - 更柔和的3D效果
        gsap.to(title, {
            duration: 1,
            rotationX: -mouseY * 0.1,
            rotationY: mouseX * 0.1,
            y: -mouseY * 0.3,
            x: mouseX * 0.3,
            ease: 'power2.out',
            transformPerspective: 1000,
            transformOrigin: 'center'
        });
        
        // 角色文字动画 - 相反方向的微妙移动
        gsap.to(role, {
            duration: 1,
            rotationX: mouseY * 0.05,
            rotationY: -mouseX * 0.05,
            y: mouseY * 0.2,
            x: -mouseX * 0.2,
            ease: 'power2.out',
            transformPerspective: 1000,
            transformOrigin: 'center'
        });
        
        // 标语动画 - 更微妙的移动
        gsap.to(tagline, {
            duration: 1,
            rotationX: -mouseY * 0.02,
            rotationY: mouseX * 0.02,
            y: mouseY * 0.1,
            x: mouseX * 0.1,
            ease: 'power2.out',
            transformPerspective: 1000,
            transformOrigin: 'center'
        });
        
        // 添加视差背景效果
        gsap.to('.grid-background', {
            duration: 1,
            x: -mouseX * 0.02,
            y: -mouseY * 0.02,
            ease: 'power2.out'
        });
        
        gsap.to('.tech-lines', {
            duration: 1,
            x: mouseX * 0.03,
            y: mouseY * 0.03,
            ease: 'power2.out'
        });
    }
    
    // 设置动画循环
    gsap.ticker.add(animate);
    
    // 窗口大小改变时更新
    window.addEventListener('resize', () => {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
    });
    
    // 移动端优化 - 使用更平滑的陀螺仪控制
    if (window.matchMedia('(max-width: 768px)').matches) {
        window.addEventListener('deviceorientation', (event) => {
            targetX = (event.gamma || 0) * 2;
            targetY = (event.beta || 0) * 2;
        });
    }
    
    // 初始动画
    const tl = gsap.timeline();
    
    tl.from(title, {
        duration: 1.2,
        y: 100,
        rotationX: 30,
        opacity: 0,
        ease: 'power4.out'
    })
    .from(role, {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out'
    }, '-=0.8')
    .from(tagline, {
        duration: 1,
        y: 30,
        opacity: 0,
        ease: 'power2.out'
    }, '-=0.6')
    .from('.cta-buttons', {
        duration: 0.8,
        y: 20,
        opacity: 0,
        ease: 'power2.out'
    }, '-=0.4');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化粒子系统
    const particleSystem = new ParticleSystem();
    particleSystem.enableMouseInteraction();

    // 根据页面类型初始化不同的效果
    if (document.querySelector('.hero')) {
        init3DEffect();
    }
    
    // 其他页面特定的初始化...
}); 