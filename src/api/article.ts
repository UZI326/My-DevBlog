import type { ApiResponse, PaginatedData } from '@/types/api'
import type {
  ArticleListItem,
  ArticleDetail,
  ArticleFilter,
  Category,
} from '@/types/article'

// 模拟分类数据
const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: '前端', slug: 'frontend', article_count: 2 },
  { id: 2, name: '后端', slug: 'backend', article_count: 2 },
  { id: 3, name: 'DevOps', slug: 'devops', article_count: 2 },
]

// 模拟文章列表数据
const MOCK_ARTICLES: ArticleListItem[] = [
  // 前端分类（2篇）
  {
    id: 1,
    title: 'Vue3 + Pinia 状态管理最佳实践',
    summary: '本文详细讲解 Vue3 中 Pinia 的核心用法，包括状态定义、行动方法、getters 计算属性，以及如何结合路由做状态持久化。',
    cover_url: 'https://picsum.photos/seed/1/800/400',
    category: MOCK_CATEGORIES[0],
    tags: [{ id: 1, name: 'Vue3' }, { id: 2, name: 'Pinia' }],
    author_name: 'DevBlog',
    view_count: 128,
    like_count: 32,
    is_published: true,
    created_at: '2026-06-01T10:00:00.000Z',
    updated_at: '2026-06-02T15:30:00.000Z',
  },
  {
    id: 2,
    title: 'TypeScript 类型体操实战',
    summary: '从基础类型到高级泛型，手把手教你写 TypeScript 类型体操，解决日常开发中的类型推导问题，告别 any 类型。',
    cover_url: 'https://picsum.photos/seed/2/800/400',
    category: MOCK_CATEGORIES[0],
    tags: [{ id: 3, name: 'TypeScript' }, { id: 4, name: '类型体操' }],
    author_name: 'DevBlog',
    view_count: 156,
    like_count: 48,
    is_published: true,
    created_at: '2026-06-01T14:20:00.000Z',
    updated_at: '2026-06-02T09:10:00.000Z',
  },
  // 后端分类（2篇）
  {
    id: 3,
    title: 'Express 中间件开发指南',
    summary: '深入理解 Express 中间件的执行机制，从零实现日志中间件、权限校验中间件，以及错误处理中间件。',
    cover_url: 'https://picsum.photos/seed/3/800/400',
    category: MOCK_CATEGORIES[1],
    tags: [{ id: 5, name: 'Express' }, { id: 6, name: 'Node.js' }],
    author_name: 'DevBlog',
    view_count: 98,
    like_count: 24,
    is_published: true,
    created_at: '2026-06-01T09:15:00.000Z',
    updated_at: '2026-06-02T11:45:00.000Z',
  },
  {
    id: 4,
    title: 'SQLite 数据库优化技巧',
    summary: '针对小型项目使用的 SQLite 数据库，分享索引优化、查询语句优化、事务管理的实用技巧，提升查询性能。',
    cover_url: 'https://picsum.photos/seed/4/800/400',
    category: MOCK_CATEGORIES[1],
    tags: [{ id: 7, name: 'SQLite' }, { id: 8, name: '数据库优化' }],
    author_name: 'DevBlog',
    view_count: 87,
    like_count: 18,
    is_published: true,
    created_at: '2026-06-01T16:40:00.000Z',
    updated_at: '2026-06-02T13:20:00.000Z',
  },
  // DevOps分类（2篇）
  {
    id: 5,
    title: 'Docker 容器化前端项目实战',
    summary: '将 Vue 前端项目打包成 Docker 镜像，配置多阶段构建，实现开发环境与生产环境的一致性部署。',
    cover_url: 'https://picsum.photos/seed/5/800/400',
    category: MOCK_CATEGORIES[2],
    tags: [{ id: 9, name: 'Docker' }, { id: 10, name: '前端部署' }],
    author_name: 'DevBlog',
    view_count: 112,
    like_count: 30,
    is_published: true,
    created_at: '2026-06-01T11:30:00.000Z',
    updated_at: '2026-06-02T17:10:00.000Z',
  },
  {
    id: 6,
    title: 'Nginx 反向代理配置详解',
    summary: '从基础配置到高级场景，讲解 Nginx 反向代理、负载均衡、静态资源缓存的配置方法，解决跨域和性能问题。',
    cover_url: 'https://picsum.photos/seed/6/800/400',
    category: MOCK_CATEGORIES[2],
    tags: [{ id: 11, name: 'Nginx' }, { id: 12, name: '反向代理' }],
    author_name: 'DevBlog',
    view_count: 135,
    like_count: 42,
    is_published: true,
    created_at: '2026-06-01T15:10:00.000Z',
    updated_at: '2026-06-02T18:50:00.000Z',
  },
]

// 模拟文章详情（扩展content为真实Markdown）
const MOCK_ARTICLE_DETAILS: Record<number, ArticleDetail> = {
  1: {
    ...MOCK_ARTICLES[0],
    author_id: 1,
    content: `# Vue3 + Pinia 状态管理最佳实践

## 一、Pinia 核心优势
- 替代 Vuex，更简洁的 API
- 无 mutations，直接通过 actions 修改状态
- 完美支持 TypeScript，零 any 类型

## 二、基础用法
### 1. 定义 Store
\`\`\`typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const increment = () => count.value++
  return { count, increment }
})
\`\`\`

### 2. 组件中使用
\`\`\`vue
<template>
  <div>{{ count }}</div>
  <button @click="increment">+1</button>
</template>

<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'
const counterStore = useCounterStore()
const { count, increment } = counterStore
</script>
\`\`\`

## 三、高级技巧
- 状态持久化：结合 localStorage 实现
- 跨 Store 调用：直接导入其他 Store 即可
- getters 计算属性：基于状态派生新值

更多内容参考：[Pinia 官方文档](https://pinia.vuejs.org/)
`,
  },
  2: {
    ...MOCK_ARTICLES[1],
    author_id: 1,
    content: `# TypeScript 类型体操实战

## 一、基础类型推导
### 1. 联合类型
\`\`\`typescript
type Status = 'success' | 'error' | 'loading'
const status: Status = 'success'
\`\`\`

### 2. 交叉类型
\`\`\`typescript
type User = { id: number; name: string }
type UserInfo = { age: number; gender: string }
type UserDetail = User & UserInfo

const user: UserDetail = {
  id: 1,
  name: 'DevBlog',
  age: 28,
  gender: 'male'
}
\`\`\`

## 二、高级泛型
\`\`\`typescript
// 提取对象的键类型
type ObjectKeys<T> = keyof T

// 只读类型
type ReadonlyObj<T> = {
  readonly [K in keyof T]: T[K]
}
\`\`\`

## 三、实战案例
解决日常开发中常见的类型问题，比如：
1. 接口返回数据类型推导
2. 组件 Props 类型校验
3. 工具函数类型封装
`,
  },
  3: { ...MOCK_ARTICLES[2], author_id: 1, content: `# Express 中间件开发指南

## 一、中间件执行流程
Express 中间件是按顺序执行的函数，格式如下：
\`\`\`javascript
app.use((req, res, next) => {
  console.log('请求时间：', new Date())
  next() // 执行下一个中间件
})
\`\`\`

## 二、自定义中间件
### 1. 日志中间件
\`\`\`javascript
const loggerMiddleware = (req, res, next) => {
  console.log(\`[\${req.method}] \${req.url}\`)
  next()
}

app.use(loggerMiddleware)
\`\`\`

### 2. 权限校验中间件
\`\`\`javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization
  if (!token) {
    return res.status(401).json({ code: 401, msg: '未授权' })
  }
  next()
}

app.use('/api', authMiddleware)
\`\`\`
` },
  4: { ...MOCK_ARTICLES[3], author_id: 1, content: `# SQLite 数据库优化技巧

## 一、索引优化
### 1. 创建索引
\`\`\`sql
CREATE INDEX idx_user_name ON users(name);
\`\`\`

### 2. 避免全表扫描
- 对查询条件的字段建立索引
- 避免使用 SELECT *，只查询需要的字段

## 二、查询优化
\`\`\`sql
-- 优化前
SELECT * FROM articles WHERE created_at > '2026-01-01';

-- 优化后（添加索引 + 指定字段）
SELECT id, title FROM articles WHERE created_at > '2026-01-01';
\`\`\`

## 三、事务管理
\`\`\`javascript
const db = new sqlite3.Database('devblog.db')

db.run('BEGIN TRANSACTION')
// 执行多个操作
db.run('INSERT INTO users (name) VALUES (?)', ['DevBlog'])
db.run('INSERT INTO articles (title) VALUES (?)', ['SQLite 优化'])
db.run('COMMIT')
\`\`\`
` },
  5: { ...MOCK_ARTICLES[4], author_id: 1, content: `# Docker 容器化前端项目实战

## 一、Dockerfile 编写
\`\`\`dockerfile
# 阶段1：构建项目
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 阶段2：部署
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

## 二、构建镜像
\`\`\`bash
docker build -t devblog-frontend:v1 .
\`\`\`

## 三、运行容器
\`\`\`bash
docker run -d -p 8080:80 --name devblog devblog-frontend:v1
\`\`\`

访问：http://localhost:8080 即可看到前端项目
` },
  6: { ...MOCK_ARTICLES[5], author_id: 1, content: `# Nginx 反向代理配置详解

## 一、基础反向代理
\`\`\`nginx
server {
  listen 80;
  server_name localhost;

  # 代理前端项目
  location / {
    root /usr/share/nginx/html;
    index index.html;
    try_files $uri $uri/ /index.html;
  }

  # 代理后端API
  location /api {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
\`\`\`

## 二、负载均衡
\`\`\`nginx
upstream backend {
  server 192.168.1.100:3001;
  server 192.168.1.101:3001;
}

server {
  listen 80;
  location /api {
    proxy_pass http://backend;
  }
}
\`\`\`

## 三、静态资源缓存
\`\`\`nginx
location ~* \\.(js|css|png|jpg|gif)$ {
  root /usr/share/nginx/html;
  expires 7d; # 缓存7天
}
\`\`\`
` },
}

// 获取文章列表（支持分类筛选 + 分页）
export async function getArticlesApi(
  params: ArticleFilter
): Promise<ApiResponse<PaginatedData<ArticleListItem>>> {
  await new Promise(r => setTimeout(r, 400))
  
  // 筛选逻辑：按分类slug过滤
  let filteredArticles = MOCK_ARTICLES
  if (params.category_slug && params.category_slug !== 'all') {
    filteredArticles = MOCK_ARTICLES.filter(
      article => article.category?.slug === params.category_slug
    )
  }

  // 分页逻辑
  const start = (params.pagenum - 1) * params.pagesize
  const end = start + params.pagesize
  const paginatedList = filteredArticles.slice(start, end)

  return {
    code: 200,
    msg: 'success',
    data: {
      list: paginatedList,
      total: filteredArticles.length,
      pagenum: params.pagenum,
      pagesize: params.pagesize,
    },
  }
}

// 获取文章详情
export async function getArticleDetailApi(
  id: number
): Promise<ApiResponse<ArticleDetail>> {
  await new Promise(r => setTimeout(r, 300))
  
  const article = MOCK_ARTICLE_DETAILS[id]
  if (!article) {
    return {
      code: 404,
      msg: '文章不存在',
      data: {} as ArticleDetail,
    }
  }

  return {
    code: 200,
    msg: 'success',
    data: article,
  }
}

// 获取全部分类
export async function getCategoriesApi(): Promise<ApiResponse<Category[]>> {
  await new Promise(r => setTimeout(r, 200))
  return {
    code: 200,
    msg: 'success',
    data: MOCK_CATEGORIES,
  }
}