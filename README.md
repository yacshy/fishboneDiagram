# 鱼骨图可视化系统

## 项目简介

这是一个基于Vue 3的鱼骨图（Fishbone Diagram）可视化系统，用于展示农业相关的新闻数据。系统通过SVG技术绘制交互式鱼骨图，支持数据的动态展示和详情查看。

## 技术栈

- **前端框架**：Vue 3 + Vite
- **状态管理**：Pinia
- **UI组件库**：Element Plus
- **动画效果**：animate.css
- **图表绘制**：SVG + jQuery
- **数据处理**：自定义工具函数

## 项目结构

```
├── public/              # 静态资源
├── src/
│   ├── assets/          # 样式和图片资源
│   │   ├── image/       # 图片文件
│   │   └── style/       # 样式文件
│   ├── auto/            # 自动生成的文件
│   ├── components/      # Vue组件
│   ├── mixins/          # 混入函数
│   │   ├── tree/        # 树状结构相关混入
│   │   └── tree-detail/ # 树状结构详情相关混入
│   ├── store/           # Pinia状态管理
│   ├── utils/           # 工具函数
│   ├── main.js          # 应用入口
│   └── main.vue         # 根组件
├── .gitignore           # Git忽略文件
├── index.html           # HTML模板
├── package.json         # 项目配置
├── pnpm-lock.yaml       # pnpm依赖锁文件
└── vite.config.js       # Vite配置
```

## 核心功能

1. **鱼骨图可视化**：通过SVG技术绘制动态鱼骨图，展示农业新闻数据的层级关系
2. **数据切换**：支持左右箭头切换不同时间的数据视图
3. **详情查看**：点击节点可查看详细信息
4. **响应式布局**：适配不同屏幕尺寸
5. **动画效果**：节点展开/收起时的平滑过渡动画

## 数据结构

项目使用三种数据格式：

- **RAW_DATA**：原始数据，包含完整的组织、人员和标题信息
- **SPAY_DATA**：简化后的原始数据
- **CLEAN_DATA**：清洗后的数据，仅包含标题和新闻标题

数据格式示例：

```typescript
type SPAY_DATA = RAW_DATA & {
  time: string;
  total: number;
  ty: string;
}

type CLEAN_DATA = {
  news_title: string;
  org: string[];
  pre: string[];
  title: string;
}

type RAW_DATA = CLEAN_DATA & {
  time: string;
  total: number;
  ty: string;
}
```

## 快速开始

### 安装依赖

```bash
# 使用npm
npm install

# 或使用pnpm
pnpm install
```

### 开发环境运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 主要模块说明

### 1. 状态管理（store）

- **data.js**：管理应用的核心数据，包括当前视图、数据列表和详情面板状态
- **svg.js**：管理SVG画布的尺寸和状态
- **tree.js**：管理树状结构的状态

### 2. 树状结构（mixins/tree）

包含树状结构的初始化、构建、展开和收起等核心功能：

- **init.js**：初始化树状结构
- **construct.js**：构建树状结构
- **spread-branch.js**：展开分支
- **shrink-branch.js**：收起分支

### 3. 工具函数（utils）

- **data.js**：数据定义和处理
- **data-calcs.js**：数据计算和转换
- **draw-detail.js**：绘制详情面板
- **math.js**：数学计算工具
- **public.js**：公共工具函数

## 核心组件

### main.vue

应用的根组件，包含：
- 左右箭头导航
- SVG画布
- 详情对话框

### the-defs.vue

定义SVG的可复用元素，如箭头、节点样式等。

## 项目特点

1. **模块化设计**：采用Mixin和工具函数的方式，将功能拆分为独立模块
2. **性能优化**：使用requestAnimationFrame实现平滑动画
3. **可扩展性**：支持自定义数据和样式
4. **交互友好**：直观的操作方式和清晰的视觉反馈

## 浏览器兼容性

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 许可证

MIT
