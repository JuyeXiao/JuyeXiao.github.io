// contact.js - 联系页面专用JavaScript文件

// 等待公共模块初始化完成后执行页面特有功能
document.addEventListener('DOMContentLoaded', () => {
    // 公共功能已由 common.js 自动初始化
    initContactPageFeatures();
});

function initContactPageFeatures() {
    // 联系表单处理
    const contactCardForm = document.querySelector('.contact-card-simple form');
    if (contactCardForm) {
        contactCardForm.addEventListener('submit', handleContactFormSubmit);
    }
}

/**
 * 双语 UI 文案：中文为默认，仅当页面 lang 以 "en" 开头时切换为英文
 * （contact.html 为 zh-CN，contact-en.html 为 en）
 */
function getContactStrings() {
    const isEn = (document.documentElement.lang || '').toLowerCase().startsWith('en');
    return isEn ? {
        required: 'Please fill in all required fields',
        invalidEmail: 'Please enter a valid email address',
        sending: 'Sending...',
        success: 'Thanks! Your message has been sent. I will get back to you soon.',
        error: 'Sorry, something went wrong. Please try again or use "Email Directly".',
        network: 'Network error. Please check your connection and try again.',
        send: 'Send Message'
    } : {
        required: '请填写所有必填字段',
        invalidEmail: '请输入有效的邮箱地址',
        sending: '正在发送...',
        success: '消息已发送，感谢您的来信！我会尽快回复。',
        error: '发送失败，请稍后重试，或使用“直接邮件”。',
        network: '网络错误，请检查网络连接后重试。',
        send: '发送消息'
    };
}

/**
 * 显示通知（优先用 common.js 的 showNotification，未就绪时回退到 alert）
 */
function notify(message, type) {
    if (window.commonFeatures && typeof window.commonFeatures.showNotification === 'function') {
        window.commonFeatures.showNotification(message, type);
    } else {
        alert(message);
    }
}

/**
 * 处理联系表单提交（通过 Web3Forms AJAX 真正发送邮件）
 */
async function handleContactFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const t = getContactStrings();

    // 获取表单数据
    const formData = new FormData(form);
    const name = (formData.get('name') || '').toString();
    const email = (formData.get('email') || '').toString();
    const message = (formData.get('message') || '').toString();

    // 简单验证
    if (!name.trim() || !email.trim() || !message.trim()) {
        notify(t.required, 'error');
        return;
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        notify(t.invalidEmail, 'error');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');

    // 提醒开发者：access_key 占位符未替换则无法真正发送
    const accessKey = (formData.get('access_key') || '').toString();
    if (!accessKey || accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY') {
        console.warn('[contact] Web3Forms access_key 占位符未替换 — 提交会失败。');
    }

    // 进入加载/禁用状态（同时防止重复提交）
    let originalLabel = '';
    if (submitBtn) {
        originalLabel = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.classList.add('is-loading');
        submitBtn.textContent = t.sending;
    }

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (response.ok && data.success) {
            notify(t.success, 'success');
            form.reset();
        } else {
            console.error('Web3Forms error:', data);
            notify(t.error, 'error');
        }
    } catch (error) {
        console.error('Contact form submission failed:', error);
        notify(t.network, 'error');
    } finally {
        // 无论成功失败都恢复按钮，保证可重试
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('is-loading');
            submitBtn.textContent = originalLabel || t.send;
        }
    }
}
