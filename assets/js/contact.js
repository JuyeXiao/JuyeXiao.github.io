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
 * 处理联系表单提交
 */
function handleContactFormSubmit(e) {
    e.preventDefault();
    
    // 获取表单数据
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // 简单验证
    if (!name.trim() || !email.trim() || !message.trim()) {
        window.commonFeatures.showNotification('请填写所有必填字段', 'error');
        return;
    }
    
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        window.commonFeatures.showNotification('请输入有效的邮箱地址', 'error');
        return;
    }
    
    try {
        // 构建邮件链接
        const subject = '来自作品集网站的消息';
        const emailBody = `姓名: ${name}\n邮箱: ${email}\n\n消息内容:\n${message}`;
        const mailtoLink = `mailto:jx2479@columbia.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
        
        // 打开邮件客户端
        window.location.href = mailtoLink;
        
        // 显示成功消息
        window.commonFeatures.showNotification('邮件客户端已打开，请发送邮件', 'success');
        
        // 重置表单
        e.target.reset();
        
    } catch (error) {
        console.error('Failed to open email client:', error);
        window.commonFeatures.showNotification('打开邮件客户端失败，请稍后重试', 'error');
    }
}
