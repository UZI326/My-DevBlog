# DevBlog

> 开发者技术博客平台 — 支持 Markdown 写作、代码高亮、文章管理、评论互动。
> 全栈手写项目，Vue3 + TypeScript + Express + SQLite，零 AI 生成、零脚手架模板。

---

## 技术栈

| 层级 | 技术 | 选型理由 |
|---|---|---|
| 前端框架 | Vue 3.5 + Composition API + `<script setup>` | 中小厂主流，组合式 API 逻辑复用性强 |
| 类型系统 | TypeScript（strict 模式） | 零 `any`，完整泛型类型推导 |
| 状态管理 | Pinia | Vue 官方推荐，TS 支持优于 Vuex |
| 路由 | Vue Router 4 | 懒加载 + 导航守卫 + 动态面包屑 |
| 构建工具 | Vite | 开发 HMR 毫秒级，生产构建基于 Rollup |
| HTTP 客户端 | Axios（TypeScript 泛型封装） | 拦截器链 + 统一错误处理 + token 自动注入 |
| 样式方案 | CSS Variables + 手写 CSS | 无 UI 框架依赖，设计令牌统一管理 |
| 代码质量 | ESLint + Prettier + vue-tsc | 提交规范，类型安全 |
| 后端框架 | Express.js | 轻量灵活，中间件模式手写 |
| 数据库 | SQLite（better-sqlite3） | 零配置、SQL 手写、无 ORM |
| 认证方案 | JWT（access + refresh 双 token） | bcrypt 加密、中间件鉴权 |

---

## 功能清单

### 前台（读者端）

- [x] 文章列表（卡片展示 + 分类筛选 + 标签云）
- [x] 文章详情（Markdown 渲染 + 代码高亮）
- [x] 文章搜索（标题 + 内容全文检索）
- [ ] 嵌套评论（楼中楼回复 + 删除）
- [ ] 文章点赞 / 收藏
- [ ] 时间线归档（按月份分组）
- [ ] 暗色模式切换
- [ ] RSS 订阅

### 后台（作者端）

- [x] 数据看板（文章数 / 分类数 / 标签数 / 总阅读量）
- [ ] 文章管理（新建 / 编辑 / 删除 / 草稿 / 发布）
- [ ] Markdown 编辑器（实时预览 + 图片上传）
- [ ] 分类管理（CRUD）
- [ ] 标签管理（CRUD + 关联文章）
- [ ] 评论管理（审核 / 删除）

### 用户系统

- [x] 注册 / 登录 / 退出
- [x] JWT 双 token 鉴权（access 15min + refresh 7d）
- [x] 路由守卫（未登录跳转登录页）
- [ ] 个人主页（头像 / 简介 / 我的文章）
- [ ] 头像上传（multer + sharp 压缩）

### 工程化

- [x] Vite + TS 严格模式手动搭建（非脚手架）
- [x] ESLint + Prettier 代码规范
- [x] Axios 类型安全请求层
- [x] CSS 设计令牌系统
- [ ] Vite 生产构建拆包优化
- [ ] Lighthouse 性能审计 > 85 分
- [ ] 单元测试（Vitest）覆盖率 > 60%
- [ ] README + API 文档 + 设计令牌文档
- [ ] Docker 部署配置
- [ ] 公网 Demo 上线

---

## 项目结构

```
DevBlog/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── eslint.config.js
├── .prettierrc.json
├── .env.development
├── .env.production
├── .gitignore
├── README.md
│
├── src/
│   ├── main.ts                    # 入口：createApp + Pinia + Router
│   ├── App.vue                    # 根组件
│   ├── env.d.ts                   # 类型声明
│   │
│   ├── api/                       # 接口层
│   │   ├── request.ts             # Axios 封装（拦截器 + 泛型推导）
│   │   ├── auth.ts                # 登录 / 注册 / 刷新 token
│   │   └── article.ts             # 文章 CRUD / 搜索
│   │
│   ├── assets/
│   │   └── styles/
│   │       ├── tokens.css         # 设计令牌（颜色 / 间距 / 阴影）
│   │       ├── reset.css          # CSS 重置
│   │       └── global.css         # 全局工具类
│   │
│   ├── components/
│   │   ├── common/                # AppHeader / AppPagination / AppLoading
│   │   └── layout/                # AdminLayout / FrontLayout
│   │
│   ├── composables/               # useAuth / usePagination / useRequest
│   ├── router/index.ts            # 路由表 + 导航守卫
│   ├── stores/                    # auth / article / category (Pinia)
│   │
│   ├── types/
│   │   ├── api.ts                 # ApiResponse / PaginationParams
│   │   ├── user.ts                # User / LoginParams / RegisterParams
│   │   └── article.ts             # Article / ArticleForm / Comment
│   │
│   ├── utils/
│   │   ├── storage.ts             # localStorage 泛型封装
│   │   └── format.ts              # 日期 / Markdown 格式化
│   │
│   └── views/
│       ├── HomePage.vue           # 首页（文章列表）
│       ├── LoginPage.vue          # 登录页
│       ├── RegisterPage.vue       # 注册页
│       ├── ArticleDetail.vue      # 文章详情
│       ├── NotFoundPage.vue       # 404
│       └── admin/
│           ├── Dashboard.vue      # 数据看板
│           ├── ArticleManage.vue  # 文章管理
│           ├── ArticleEdit.vue    # 文章编辑（Markdown）
│           └── CategoryManage.vue # 分类管理
│
├── server/                        # Express 后端
│   ├── package.json
│   ├── src/
│   │   ├── index.js               # 服务入口
│   │   ├── db.js                  # SQLite 连接 + 建表
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT 鉴权中间件
│   │   │   ├── errorHandler.js    # 统一错误处理
│   │   │   └── logger.js          # 请求日志
│   │   ├── routes/
│   │   │   ├── auth.js            # /api/auth/*
│   │   │   ├── articles.js        # /api/articles/*
│   │   │   ├── categories.js      # /api/categories/*
│   │   │   ├── tags.js            # /api/tags/*
│   │   │   ├── comments.js        # /api/comments/*
│   │   │   └── upload.js          # /api/upload
│   │   └── utils/
│   │       └── token.js           # JWT 签发 / 验证
│   └── uploads/                   # 上传文件目录
│
└── docs/
    ├── API.md                     # 接口文档
    ├── DESIGN_TOKENS.md           # 设计令牌说明
    └── PERFORMANCE.md             # 性能优化报告
```

---

## 本地运行

```bash
# 1. 克隆项目
git clone <repo-url>
cd DevBlog

# 2. 安装前端依赖
npm install

# 3. 启动前端开发服务器
npm run dev
# → http://localhost:3000

# 4. （第二周）安装后端依赖
cd server
npm install

# 5. 初始化数据库
npm run db:init

# 6. 启动后端服务
npm run dev
# → http://localhost:3001
```

---

## 环境变量

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3001/api
VITE_USE_MOCK=true               # Week1 用 mock，Week2 关掉

# .env.production
VITE_API_BASE_URL=https://api.your-domain.com/api
VITE_USE_MOCK=false
```

---

## 脚本命令

```bash
npm run dev            # 启动开发服务器
npm run build          # 生产构建
npm run preview        # 预览生产构建
npm run lint           # ESLint 检查
npm run format         # Prettier 格式化
npm run type-check     # TypeScript 类型检查
npm run test           # 运行单元测试
```

---

## 设计规范

| 维度 | 值 |
|---|---|
| 主色 | `#409eff`（Element Plus 标准蓝） |
| 字体 | 系统无衬线栈（`-apple-system, PingFang SC, Microsoft YaHei`） |
| 间距 | 4/8/12/16/20/24/32/40/48px（4px 栅格） |
| 圆角 | 4px(sm) / 8px(md) / 12px(lg) |
| 阴影 | 1px 微影 / 4px 悬浮 / 8px 弹窗 |

详见 [docs/DESIGN_TOKENS.md](./docs/DESIGN_TOKENS.md)

---

## 开发原则

- **零 AI 生成**：每行代码手写，能解释为什么这样写
- **零 `any` 类型**：TypeScript strict 模式，完整类型推导
- **零脚手架模板**：Vite / ESLint / Prettier 全部手动配置
- **手写 SQL**：不用 ORM，直接写 SQL 语句
- **Git 提交规范**：Conventional Commits（`feat:` / `fix:` / `perf:`）

---

## 许可证

MIT
