# CSS架构说明

## 文件结构

### `index.css` - 主样式文件
- 包含全站通用样式和变量定义
- 首页和所有页面共享的基础组件样式
- 通用的.contact-info-card样式（在项目页面的hero部分也会使用）

### `project.css` - 项目详情页专用样式
- 项目目录导航样式 (.toc-link, .project-toc)
- 执行摘要卡片样式 (.summary-card)
- 相关项目卡片样式 (.related-project-card)
- 适用于所有项目详情页，支持复用

### `contact.css` - 联系页面专用样式
- 联系页面特有的布局 (.contact-main-layout, .contact-info-layout)
- 联系表单样式 (.contact-card-simple, .contact-label, .contact-input)
- 联系页面特有的按钮样式 (.btn-contact-primary, .btn-contact-secondary)
- 联系页面特有的锚点偏移

## 使用方式

### 首页
```html
<link rel="stylesheet" href="assets/css/index.css" />
```

### 项目详情页
```html
<link rel="stylesheet" href="assets/css/index.css" />
<link rel="stylesheet" href="assets/css/project.css" />
```

### 联系页面
```html
<link rel="stylesheet" href="assets/css/index.css" />
<link rel="stylesheet" href="assets/css/contact.css" />
```

## 设计原则

1. **复用性** - 通用样式保留在index.css中
2. **模块化** - 页面特有样式分离到独立文件
3. **维护性** - 样式职责清晰，便于维护和修改
4. **一致性** - 使用相同的CSS变量保持设计一致性
