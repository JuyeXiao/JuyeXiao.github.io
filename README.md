# 数据分析师个人作品集网站

## 🎯 项目状态

**核心功能已完成** —— 主页、项目详情页、联系页、双语切换、深色模式均已上线；剩余事项见 [📈 开发进度](#-开发进度)。

## 🌟 特性

- **混合架构设计**：主页快速概览 + 详情页深度展示
- **响应式布局**：完美适配桌面、平板和手机
- **深色/浅色主题**：支持主题切换，状态持久化
- **中英双语**：每个页面均有 `-en.html` 镜像版本，URL 路由切换，本地存储保留偏好
- **米色设计系统**：温暖优雅的视觉风格（数据诗学 Data Poetics）
- **动画效果**：Logo "Data Weaver" 动画、滚动渐现、数字计数
- **项目展示**：3 个完整的数据分析项目，28 张专业图表
- **代码展示**：语法高亮的代码块
- **SEO 优化**：完整的元数据和结构化数据

## 📁 项目结构

```
portfolio/
├── index.html / index-en.html              # 主页（中文 / 英文镜像）✅
├── contact.html / contact-en.html          # 联系页（中文 / 英文镜像）✅
├── projects/                               # 项目详情页目录
│   ├── _template.html                     # 项目页模板 ✅
│   ├── Bank Customer Churn Prediction/    # 银行客户流失预测 ✅
│   │   ├── *.html / *-en.html             # 中英两版项目页
│   │   └── figures/                       # 5 张数据可视化图表
│   ├── e-commerce fraud detection/        # 电商欺诈检测 ✅
│   │   ├── *.html / *-en.html             # 中英两版项目页
│   │   └── figures/                       # 8 张数据可视化图表
│   └── lendingclub loan prediction/       # 贷款违约预测 ✅
│       ├── *.html / *-en.html             # 中英两版项目页
│       └── figures/                       # 15 张数据可视化图表
├── assets/
│   ├── css/                                # 样式文件
│   │   ├── index.css                      # 主样式 + 全局变量 ✅
│   │   ├── project.css                    # 项目详情页样式 ✅
│   │   ├── contact.css                    # 联系页面样式 ✅
│   │   └── README.md                      # CSS 模块说明
│   ├── js/                                 # JavaScript 文件
│   │   ├── common.js                      # 通用功能（主题切换/滚动渐现/导航栏）自动初始化 ✅
│   │   ├── index.js                       # 主页页面行为 ✅
│   │   ├── contact.js                     # 联系页面功能 ✅
│   │   ├── project.js                     # 项目页面逻辑 ✅
│   │   ├── logo.js                        # Logo "Data Weaver" 动画 ✅
│   │   ├── language-switcher.js           # 中英双语 URL 切换 ✅
│   │   └── charts.js                      # 图表工具（脚手架）
│   └── img/                               # 图片资源
│       ├── about-portrait.jpg             # About 区肖像
│       └── hero/atmosphere-bg.jpg         # Hero 通栏氛围背景
├── test-common.html                         # common.js 手动测试页
├── demo-editorial-hero.html                 # Hero 设计探索 demo
├── 肖炬晔简历.pdf                          # 中文简历 ✅
├── Juye Xiao Resume.pdf                    # 英文简历 ✅
├── README.md                               # 项目说明 ✅
├── prd需求.md                              # 产品需求文档 ✅
└── 设计风格文档米色.md                      # 设计系统文档 ✅
```

> **关于双语**：站点采用 URL 路由式双语方案，每个页面有 `foo.html`（中文）和 `foo-en.html`（英文）两份手写副本，不存在运行时 i18n。修改内容时记得两份都改。


## 🛠️ 技术栈

- **前端**：纯静态 HTML5、CSS3、JavaScript (ES6+)，无构建流程
- **CSS 架构**：CSS Grid、Flexbox、CSS 自定义属性（变量）
- **设计系统**：米色调色板（Data Poetics 设计风格）
- **动画**：CSS Animation + Intersection Observer
- **图表**：Plotly.js（待集成）；项目页当前使用静态 PNG 图表
- **代码高亮**：Prism.js（按需引入）
- **图标**：Lucide Icons（CDN）
- **CSS 工具类**：Tailwind CSS（开发期 CDN 运行时构建）
- **字体**：Google Fonts（Inter、JetBrains Mono）
- **部署**：GitHub Pages（直接从 `master` 分支静态托管）


## 🎨 设计特色

### 米色调色板（Data Poetics设计系统）
- **背景色**：#FAF7F2 (奶油色) / #E8DFD3 (米色)
- **文字色**：#2C2416 (深褐) / #8B7355 (棕色)
- **边框色**：#D4C4B0 (棕褐色)
- **强调色**：
  - #FF6B6B (珊瑚色) - 主要强调
  - #95B99F (鼠尾草绿) - 成功/增长
  - #5B8FB9 (天蓝色) - 链接/信息
  - #D4A574 (金色) - 特殊强调

### 响应式断点
- 手机：< 640px
- 平板：768px - 1024px
- 桌面：> 1280px
- 大屏：> 1536px

### 字体系统
- 正文 / UI：Inter（从 Google Fonts 加载）
- 代码：JetBrains Mono（从 Google Fonts 加载，回退 Fira Code / Consolas）
- 展示字体（标题装饰）：`--font-display` 声明为 `Fraunces, Noto Serif SC, Songti SC, Georgia`，但 Fraunces 当前**未引入**到 Google Fonts `<link>` 中，实际渲染会回退到 Songti SC / Georgia
- 中文回退：PingFang SC / Noto Sans SC

> 实际生效的字体以 `index.html` 的 `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?...">` 为准。如需启用 Fraunces，需把它追加到该 URL 的 `family=` 参数里。

## 📊 项目展示

### 已实现项目（3个）

1. **银行客户流失预测** 
   - 使用机器学习预测客户流失风险
   - SHAP值分析和特征重要性
   - 5张专业数据可视化图表

2. **电商欺诈检测**
   - 实时欺诈交易识别系统
   - 多维度特征工程
   - 8张数据分析图表

3. **贷款违约预测**
   - 信贷风险评估模型
   - LightGBM和随机森林对比
   - 15张深度分析图表

每个项目都包含：
- 业务背景和问题定义
- 数据探索和可视化
- 特征工程和模型构建
- 代码展示（Python）
- 结果分析和业务影响
- SHAP解释性分析

## 🔧 开发指南

### 添加新功能

1. 在相应的CSS文件中添加样式
2. 在JavaScript文件中添加逻辑
3. 更新HTML模板
4. 测试响应式布局


## 📈 开发进度

### ✅ 已完成
- 基础架构和设计系统
- 主页所有功能模块（Hero、关于、经历、教育、项目、技能、联系）
- 3 个完整的项目详情页（28 张数据可视化图表）
- Logo "Data Weaver" 动画 + 滚动渐现 + 数字计数
- 深色/浅色主题切换（`localStorage.theme` 持久化）
- 联系页面与表单
- 响应式布局（手机 / 平板 / 桌面）
- **中英双语**：每个页面都有 `-en.html` 镜像 + 切换按钮 + 偏好持久化

### ⚠️ 进行中
- 图表交互化（`charts.js` 仅为脚手架，Plotly 集成待做）
- 简历下载按钮联动（PDF 文件已就位，hero 区按钮 `href` 仍为占位符 `#`）

### 📋 待完成
- GitHub Actions 自动化部署
- 性能优化（图片懒加载、WebP、资源压缩）
- Tailwind 生产构建（当前使用开发期 CDN 运行时）
