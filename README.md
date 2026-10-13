# 数据分析师个人作品集网站

## 🎯 项目状态

主页、项目详情页、联系页、双语切换和深色模式已实现；当前本地验收与范围见 [2026-10-13 审计修复记录](docs/audit-fixes-2026-10-13/DELIVERY.md)。部署是否完成需单独核对 GitHub Pages 状态。

## 🌟 特性

- **混合架构设计**：主页快速概览 + 详情页深度展示
- **响应式布局**：完美适配桌面、平板和手机
- **深色/浅色主题**：支持主题切换，状态持久化
- **中英双语**：每个页面均有 `-en.html` 镜像版本，URL 路由切换，本地存储保留偏好
- **米色设计系统**：温暖优雅的视觉风格（数据诗学 Data Poetics）
- **动画效果**：Logo "Data Weaver" 动画、滚动渐现、数字计数
- **项目展示**：8 个首页主项目，12 组中英文详情（24 页）；当前报告引用 96 个图表资源文件
- **代码展示**：语法高亮的代码块
- **SEO 优化**：完整的元数据和结构化数据

## 📁 项目结构

页面使用已生成的本地 `assets/css/utilities.css`，访问网站不再依赖 Tailwind CDN 或 JavaScript 生成布局。修改工具类或新增页面后，在仓库根目录重新生成并一并保存该 CSS：

```bash
npx --yes tailwindcss@3.4.17 -c scripts/tailwind.config.cjs -i assets/css/utilities.input.css -o assets/css/utilities.css --minify
```

生成配置扫描主页、联系页、项目页和站点脚本，并使用 `html.dark` 切换深色样式。普通文案和现有自定义 CSS 修改不需要重新生成；部署仍直接使用静态文件。

```
portfolio/
├── index.html / index-en.html              # 主页（中文 / 英文镜像）✅
├── contact.html / contact-en.html          # 联系页（中文 / 英文镜像）✅
├── projects/                               # 项目详情页目录
│   ├── _template.html                     # 项目页模板 ✅
│   ├── Bank Customer Churn Prediction/    # 银行客户流失预测 ✅
│   │   ├── *.html / *-en.html             # 中英两版项目页
│   │   └── figures/                       # 当前报告引用图表及原有历史资源
│   ├── e-commerce fraud detection/        # 电商欺诈检测 ✅
│   │   ├── *.html / *-en.html             # 中英两版项目页
│   │   └── figures/                       # 时间评估图表及原有历史资源
│   ├── lendingclub loan prediction/      # 9,004 笔样本与 full data 进阶案例
│   ├── youtube comment analysis/         # 弱监督与助手复核
│   ├── spglobal climate comparison/      # 综合报告 + 三个双语专题
│   ├── ab testing/                       # Cookie Cats 实验分析
│   ├── healthy home/                     # 嵌套空间评价与相对预测图
│   └── amazon watch reviews/             # 手表评论聚类与主题建模
├── assets/
│   ├── css/                                # 样式文件
│   │   ├── utilities.css                  # 预生成的 Tailwind 样式，先加载
│   │   ├── utilities.input.css            # 生成输入，配置见 scripts/tailwind.config.cjs
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
│       ├── about-portrait.jpg             # About 区装饰性墙面光影图
│       └── hero/atmosphere-bg.jpg         # Hero 通栏氛围背景
├── test-common.html                         # common.js 手动测试页
├── demo-editorial-hero.html                 # Hero 设计探索 demo
├── 肖炬晔简历.pdf                          # 中文简历 ✅
├── Juye Xiao Resume.pdf                    # 英文简历 ✅
├── README.md                               # 项目说明 ✅
├── prd需求.md                              # 产品需求文档 ✅
└── 设计风格文档米色.md                      # 设计系统文档 ✅
```

> **关于双语**：站点采用 URL 路由式双语方案，每个页面有 `foo.html`（中文）和 `foo-en.html`（英文）两份静态文件，不存在运行时 i18n。修改内容时记得两份都改；本次报告内容由限定范围的维护脚本同步。


## 🛠️ 技术栈

- **前端**：纯静态 HTML5、CSS3、JavaScript (ES6+)，部署时无构建步骤；工具类变更时预生成 CSS
- **CSS 架构**：CSS Grid、Flexbox、CSS 自定义属性（变量）
- **设计系统**：米色调色板（Data Poetics 设计风格）
- **动画**：CSS Animation + Intersection Observer
- **图表**：Plotly.js（待集成）；项目页当前使用静态 PNG 图表
- **代码高亮**：Prism.js（按需引入）
- **图标**：Lucide Icons（CDN）
- **CSS 工具类**：Tailwind CSS 3.4.17（本地生成的静态 CSS）
- **字体**：Google Fonts（Inter、JetBrains Mono、Fraunces、Noto Sans SC、Noto Serif SC）
- **部署**：GitHub Pages（直接从 `master` 分支静态托管）


## 🎨 设计特色

### 米色调色板（Data Poetics设计系统）
- **背景色**：#FAF7F2 (奶油色) / #E8DFD3 (米色)
- **文字色**：#2C2416 (深褐) / #6B5942 (棕色)
- **边框色**：#D4C4B0 (棕褐色)
- **强调色**：
  - #A43D49 (珊瑚色) - 主要强调
  - #95B99F (鼠尾草绿) - 成功/增长
  - #5B8FB9 (天蓝色) - 数据/信息色；正文链接单独使用 `--link: #36668D`（深色为 `#7BA9CD`）
  - #D4A574 (金色) - 特殊强调

### 响应式断点
- 手机：< 640px
- 平板：768px - 1024px
- 桌面：> 1280px
- 大屏：> 1536px

### 字体系统
- 正文 / UI：Inter（从 Google Fonts 加载）
- 代码：JetBrains Mono（从 Google Fonts 加载，回退 Fira Code / Consolas）
- 展示字体：Fraunces / Noto Serif SC；中英文主页与报告页通过 Google Fonts 加载，失败时回退到系统衬线字体
- 中文回退：PingFang SC / Noto Sans SC

> 实际生效的字体以 `index.html` 的 `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?...">` 为准。报告页使用同一套字体家族。

## 📊 项目展示

### 当前项目入口

| 首页主项目 | 详情范围 |
|---|---|
| S&P Global Capstone | 最新综合报告；模型比较、长序列预测、长期情景与空间暴露三个专题。各页互链，同一项目保留一个首页卡片 |
| YouTube 评论 | 养宠文本信号、弱监督模型、新评论助手复核与频道候选排序 |
| 银行客户流失 | 客户分组模式、模型比较、SHAP、选择集阈值 0.275 与服务容量取舍 |
| 电商首单欺诈 | 回顾性时间评估；正式模型测试 AP=0.010121，既定成本情景选择全批准、测试欺诈零检出 |
| LendingClub | 9,004 笔贷款样本，Random Forest 阈值 0.22；另附独立时间协议的全量进阶案例，净模拟成本降幅 −21.48% |
| A/B Testing | Cookie Cats 留存比较、分流检验与关卡体验建议 |
| Healthy Home | 奥克兰污染物嵌套空间评价、道路相对预测、分区误差诊断与补充观测方案 |
| Amazon 手表评论 | 评论语料整理、聚类、主题解释与产品改进建议 |

详情正文依据当前对应语言的正式 Markdown 报告，按个人作品集的阅读需要整理，展示分析问题、方法、结果和行动建议。图片为源报告当前引用的原始文件，未重绘。旧资源文件保留，不再作为当前报告引用。

首页卡片、项目导语和相关项目文案维护于 `scripts/report_summaries.json`：`card_description` 仅供首页卡片使用，`description` 用于详情导语、元信息和相关项目；正文展示调整维护于 `scripts/report_presentation.json`。页面不展示内部运行说明、材料访问声明或仅含内部文件入口的附录。生成时逐项核对原文，验证结果表格和图表引用，并保留公开来源与方法链接。

原始同步记录见 [内容同步交付说明](docs/content-sync-2026-10-13/DELIVERY.md)，当前展示调整及验证见 [作品集文案调整](docs/portfolio-presentation-2026-10-13/DELIVERY.md)。维护脚本 `scripts/sync_reports.py` 的 `render` 和 `verify` 使用原始来源清单核对输入，并将当前记录写入展示调整目录。网页本身仍无需构建；脚本不执行 notebook、不训练模型。

## 🔧 开发指南

### 添加新功能

1. 在相应的CSS文件中添加样式
2. 在JavaScript文件中添加逻辑
3. 更新HTML模板
4. 工具类变化时按上文命令生成 `utilities.css`；页面依次加载它、`index.css` 和页面专用 CSS
5. 测试中英文、明暗主题、手机/桌面布局、无 JS 可读性，以及带章节锚点的语言切换


## 📈 开发进度

### ✅ 已完成
- 基础架构和设计系统
- 主页所有功能模块（Hero、关于、经历、教育、项目、技能、联系）
- 8 个首页主项目、24 个中英文详情页（包括 Capstone 专题与 LendingClub 全量进阶案例）
- Logo "Data Weaver" 动画 + 滚动渐现 + 数字计数
- 深色/浅色主题切换（`localStorage.theme` 持久化）
- 联系页面与表单
- 响应式布局（手机 / 平板 / 桌面）
- **中英双语**：每个页面都有 `-en.html` 镜像 + 切换按钮 + 偏好持久化
- 本地静态 Tailwind CSS（工具类变更后按上文命令重新生成）
- 中英文简历按钮连接对应 PDF
- 审计修复：卡片摘要、对比度、44px 头部按钮、目录/表头语义、锚点保留、页面描述和 GitHub 可见入口

### ⚠️ 进行中
- 图表交互化（`charts.js` 仅为脚手架，Plotly 集成待做）


### 📋 待完成
- GitHub Actions 自动化部署
- WebP 转换、进一步资源优化和生产性能验收（现有报告图片已懒加载，工具 CSS 已压缩）
