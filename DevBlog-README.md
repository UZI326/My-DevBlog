# DevBlog

> 全栈自研博客平台 — Vue3 + TypeScript + Express + SQLite，手写代码、零脚手架模板。
> 中小厂前端面试作品：覆盖登录注册、文章管理、评论互动、全文搜索、权限控制、生产部署全链路。

---

## 一、项目定位

**一句话**：一个能写文章、能评论、能搜索、能部署上线的开发者博客。

**面向面试**：简历上放这个项目，中小厂前端岗位的技术面基本全覆盖——从组件设计到状态管理、从路由守卫到 API 封装、从数据库设计到部署上线，面试官随便问，你都能讲清楚「为什么这样设计」。

---

## 二、技术栈

| 层级 | 技术 | 面试考点 |
|---|---|---|
| 框架 | Vue 3.5 + Composition API + `<script setup>` | 响应式原理、组合式 vs 选项式 |
| 类型 | TypeScript strict 模式 | 泛型、类型推导、零 any |
| 状态管理 | Pinia | setup store vs option store |
| 路由 | Vue Router 4 + 导航守卫 | 懒加载、元信息、路由拦截 |
| 构建 | Vite 7 | ESM 开发、Rollup 生产构建 |
| HTTP | Axios（泛型封装 + 拦截器链） | 请求/响应拦截、token 自动注入 |
| Markdown | marked + highlight.js | 自定义渲染器、XSS 防护 |
| 后端 | Express 4 | 中间件模式、RESTful API |
| 数据库 | SQLite + better-sqlite3 | 手写 SQL、FTS5 全文索引、事务 |
| 认证 | JWT（access token）+ bcrypt | 无状态认证、token 存储策略 |
| 文件上传 | Multer | MIME 校验、文件大小限制 |
| 部署 | PM2 进程守护 | 静态托管、SPA 回退、环境变量 |

---

## 三、功能清单

### 前台（读者端）

| 功能 | 说明 |
|---|---|
| 文章列表 | 卡片展示 + 分类筛选 + 分页 |
| 文章详情 | Markdown 渲染 + 代码语法高亮 |
| 全文搜索 | FTS5 引擎，标题/内容/摘要检索，按相关度排序 |
| 评论系统 | 登录后发表评论，作者/管理员可删除 |
| 点赞系统 | Toggle 模式（点一下赞、再点取消），数据库唯一约束防重复 |
| 用户主页 | 公开信息展示（文章数/评论数）、自己的主页可编辑 |

### 后台（作者端）

| 功能 | 说明 |
|---|---|
| 文章管理 | 创建/编辑/删除，支持草稿/发布状态 |
| Markdown 编辑器 | 编辑/预览双标签 + 工具栏（加粗/标题/代码块/图片） |
| 图片上传 | Multer 本地存储、MIME 白名单、5MB 限制 |
| 管理面板 | 侧边栏布局 + 嵌套路由 + 表格展示 |

### 用户系统

| 功能 | 说明 |
|---|---|
| 注册/登录 | bcrypt 加密、JWT 签发 |
| 角色权限 | admin/user 两级，中间件链校验 |
| 路由守卫 | 未登录 → 跳登录页；已登录 → 跳首页；无权限 → 403 |
| 登录态持久化 | localStorage + Pinia + 页面刷新恢复 |

### 部署

| 特性 | 说明 |
|---|---|
| 生产构建 | `vue-tsc --noEmit && vite build` |
| 同源部署 | Express 托管前端 dist + SPA 回退 |
| 进程守护 | PM2，崩溃自动重启，内存超限重启 |
| 环境切换 | `NODE_ENV` 区分开发/生产，CORS 按需开启 |

---

## 四、项目结构

```
DevBlog/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── ecosystem.config.cjs        # PM2 配置
├── .env.development
├── .env.production
│
├── src/                        # 前端源码
│   ├── main.ts                 # 入口
│   ├── App.vue                 # 根组件 + Toast 挂载
│   ├── api/                    # 接口层（6 个模块）
│   │   ├── request.ts          # Axios 封装（拦截器 + 泛型 + 错误统一处理）
│   │   ├── auth.ts             # 登录/注册
│   │   ├── article.ts          # 文章列表/详情/搜索/点赞
│   │   ├── admin.ts            # 管理端文章 CRUD
│   │   ├── comment.ts          # 评论发表/列表/删除
│   │   ├── upload.ts           # 图片上传（FormData）
│   │   └── user.ts             # 用户资料/更新
│   ├── assets/styles/          # CSS 设计令牌
│   │   ├── tokens.css          # 颜色/间距/字体/阴影变量
│   │   ├── reset.css           # 浏览器默认样式重置
│   │   └── global.css          # 全局工具类
│   ├── components/
│   │   ├── admin/              # MarkdownEditor / ArticleTable
│   │   ├── article/            # CommentList / ArticleCard
│   │   └── common/             # AppHeader / SearchBar / ToastContainer / HeroBanner
│   ├── router/index.ts         # 路由表 + beforeEach 守卫
│   ├── stores/                 # auth / article / toast
│   ├── types/                  # api / user / article（TS 接口定义）
│   ├── utils/                  # storage / markdown / url
│   └── views/                  # 10 个页面组件（含懒加载）
│
├── server/                     # 后端源码
│   ├── package.json
│   ├── src/
│   │   ├── index.ts            # Express 入口（开发/生产双模式）
│   │   ├── db.ts               # SQLite 建表 + FTS5 + 触发器 + 幂等升级
│   │   ├── seed.ts             # 种子数据（admin 用户 + 分类 + 示例文章）
│   │   ├── middleware/
│   │   │   ├── auth.ts         # JWT 鉴权（签发 + 验证）
│   │   │   └── admin.ts        # 角色鉴权（admin only）
│   │   ├── routes/
│   │   │   ├── auth.ts         # /api/login  /api/register
│   │   │   ├── articles.ts     # /api/articles  /api/articles/search  /api/articles/:id/like
│   │   │   ├── adminArticles.ts# /api/admin/articles (CRUD)
│   │   │   ├── comments.ts     # /api/comments
│   │   │   ├── upload.ts       # /api/upload (Multer)
│   │   │   └── user.ts         # /api/user/*
│   │   └── utils/response.ts   # 统一响应格式 { code, message, data }
│   ├── uploads/                # 上传文件存储
│   └── data/                   # SQLite 数据库文件
│
└── dist/                       # Vite 构建产物（gitignore）
```

---

## 五、本地运行

```bash
# 1. 安装依赖
npm install
cd server && npm install && cd ..

# 2. 初始化数据库（首次运行）
cd server && npm run seed && cd ..

# 3. 启动后端（终端1）
cd server && npm run dev
# → http://localhost:3001

# 4. 启动前端（终端2）
npm run dev
# → http://localhost:3000
```

**默认管理员账号**：

```
账号: admin
密码: admin123
```

---

## 六、生产部署

```bash
# 1. 前端构建
npm run build

# 2. PM2 启动（生产模式，Express 托管前端 + API）
pm2 start ecosystem.config.cjs

# 3. 访问
# → http://localhost:3001
```

```bash
# PM2 常用命令
pm2 status              # 查看进程状态
pm2 logs devblog        # 查看日志
pm2 restart devblog     # 重启
pm2 stop devblog        # 停止
pm2 monit               # 监控面板
```

---

## 七、API 接口一览

### 公开接口

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/register` | 用户注册 |
| POST | `/api/login` | 用户登录（返回 JWT） |
| GET | `/api/articles` | 文章列表（分页 + 分类筛选 + 标签筛选） |
| GET | `/api/articles/search?q=` | 全文搜索 |
| GET | `/api/articles/:id` | 文章详情 |
| GET | `/api/categories` | 分类列表 |
| GET | `/api/tags` | 标签列表 |
| GET | `/api/comments?article_id=` | 评论列表 |
| GET | `/api/user/:id` | 用户公开信息 |
| GET | `/api/health` | 健康检查 |

### 需登录接口

| 方法 | 路径 | 说明 |
|---|---|---|
| GET  | `/api/user/info` | 当前用户信息 |
| POST | `/api/comments` | 发表评论 |
| DELETE | `/api/comments/:id` | 删除评论（仅作者/管理员） |
| POST | `/api/articles/:id/like` | 点赞/取消点赞 |
| GET  | `/api/articles/:id/like-status` | 查询点赞状态 |
| PUT  | `/api/user/profile` | 更新个人资料 |
| POST | `/api/upload` | 上传图片 |

### 管理员接口

| 方法 | 路径 | 说明 |
|---|---|---|
| GET    | `/api/admin/articles` | 文章管理列表（含草稿） |
| POST   | `/api/admin/articles` | 创建文章 |
| PUT    | `/api/admin/articles/:id` | 更新文章 |
| DELETE | `/api/admin/articles/:id` | 删除文章 |

> 统一响应格式：`{ code: 0, message: 'success', data: ... }`

---

## 八、面试考点覆盖

这个项目涉及的技术点，覆盖了中小厂前端面试的高频问题：

| 面试题 | 项目对应位置 |
|---|---|
| Vue3 响应式原理？ref vs reactive 区别？ | `stores/` 全部用 ref + computed |
| 组件通信方式？provide/inject vs props vs emit vs Pinia？ | `CommentList` emit / `Toast` Pinia / `ArticleEditor` props |
| Vue Router 导航守卫怎么用？ | `router/index.ts` — beforeEach 三段式守卫 |
| 路由懒加载原理？ | 所有页面组件 `() => import(...)` |
| Pinia 和 Vuex 的区别？ | `stores/auth.ts` — setup store 写法 |
| Axios 封装怎么做？拦截器链顺序？ | `api/request.ts` — 请求拦截加 token / 响应拦截解包 + 401 跳转 |
| TypeScript 泛型在项目中怎么用的？ | `api/request.ts` — `<T>` 泛型推导请求返回值 |
| JWT 是什么？和 Session 的区别？ | `middleware/auth.ts` — 无状态认证 |
| 跨域怎么解决？CORS 原理？ | `index.ts` — 开发环境 CORS / 生产环境同源 |
| 权限控制怎么做？ | `middleware/admin.ts` + 路由 `meta.requiresAuth` |
| 文件上传安全怎么保证？ | `routes/upload.ts` — MIME 白名单 + 文件大小限制 |
| SQL 注入怎么防？ | 全部 `db.prepare().run()` 参数化查询 |
| 全文搜索怎么实现？ | `db.ts` — FTS5 虚拟表 + 触发器同步 |
| 怎么防止重复点赞？ | `db.ts` — `UNIQUE(user_id, article_id)` 数据库约束 |
| Markdown 编辑器怎么做的？ | `MarkdownEditor.vue` — textarea + marked + 光标操作 |
| 生产环境怎么部署？ | `ecosystem.config.cjs` + Express SPA 回退 + PM2 |

---

## 九、数据库设计

```sql
users         -- 用户（id / username / password / role / nickname / email / user_pic）
categories    -- 分类（id / name / slug）
tags          -- 标签（id / name）
articles      -- 文章（id / title / content / summary / cover_url / author_id / category_id / is_published / view_count / like_count）
article_tags  -- 文章-标签关联（多对多，article_id + tag_id 联合主键，ON DELETE CASCADE）
comments      -- 评论（id / content / article_id / user_id / parent_id，级联删除）
likes         -- 点赞（user_id + article_id 联合唯一约束，级联删除）
articles_fts  -- FTS5 虚拟表（全文索引，3 个触发器保同步）
```

---

## 十、设计规范

| 维度 | 值 |
|---|---|
| 主色 | `#4299e1` |
| 字体 | `PingFang SC, Microsoft YaHei, sans-serif` |
| 代码字体 | `Menlo, Monaco, Courier New, monospace` |
| 间距栅格 | 4px 倍数（4/8/12/16/24/32） |
| 圆角 | 4px(按钮) / 6px(卡片) / 8px(弹窗) |

详见 `src/assets/styles/tokens.css`。

---

## 十一、脚本命令

```bash
# 前端
npm run dev            # Vite 开发服务器 (:3000)
npm run build          # 类型检查 + 生产构建
npm run preview        # 预览构建产物
npm run lint           # ESLint
npm run type-check     # TypeScript 类型检查

# 后端
cd server
npm run dev            # tsx watch 热重载开发
npm run seed           # 初始化种子数据
npm start              # 生产启动（NODE_ENV=production）

# 部署
pm2 start ecosystem.config.cjs
```

---

## 十二、开发原则

- **手写代码**：每行代码都能解释「为什么这么写」
- **零 `any`**：TypeScript strict 模式，完整类型推导链
- **手写 SQL**：不用 ORM，`better-sqlite3` 参数化查询
- **前后端双 strict**：前端 `vue-tsc --noEmit` + 后端 TypeScript strict
- **防御性编程**：数据库幂等升级、文件目录自动创建、双重响应防护

---

## 许可证

MIT
