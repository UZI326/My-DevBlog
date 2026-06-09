import 'dotenv/config'
import db, { initDB } from './db.js'
import bcrypt from 'bcryptjs'

initDB()

// 1. 清空所有表（注意顺序：先删关联表，再删主表）
db.exec('DELETE FROM article_tags')
db.exec('DELETE FROM articles')
db.exec('DELETE FROM tags')
db.exec('DELETE FROM categories')
db.exec('DELETE FROM users')
// 重置自增ID
db.exec("DELETE FROM sqlite_sequence")

// 2. 插入管理员用户（密码 admin123）
const hashedPwd = bcrypt.hashSync('admin123', 10)
db.prepare('INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)')
  .run('admin', hashedPwd, 'DevBlog管理员')

// 3. 插入3个分类
const insertCategory = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)')
insertCategory.run('前端', 'frontend')
insertCategory.run('后端', 'backend')
insertCategory.run('DevOps', 'devops')

// 4. 插入12个标签
const tags = [
  'Vue3', 'Pinia', 'TypeScript', '类型体操',
  'Express', 'Node.js', 'SQLite', '数据库优化',
  'Docker', '前端部署', 'Nginx', '反向代理'
]
const insertTag = db.prepare('INSERT INTO tags (name) VALUES (?)')
const tagIds: number[] = []
tags.forEach(tag => {
  const result = insertTag.run(tag)
  tagIds.push(result.lastInsertRowid as number)
})

// 5. 插入6篇文章（每分类2篇）
const insertArticle = db.prepare(`
  INSERT INTO articles (
    title, content, summary, cover_url, author_id, category_id
  ) VALUES (?, ?, ?, ?, ?, ?)
`)

// 文章内容示例（简化版，可替换为自己的内容）
const articleContents = [
  // 前端-1
  {
    title: 'Vue3 + TypeScript 实战：响应式原理',
    content: `# Vue3 响应式原理
    ## 核心API
    - ref：基本类型响应式
    - reactive：对象类型响应式
    \`\`\`ts
    const count = ref(0)
    const user = reactive({ name: '张三' })
    \`\`\`
    `,
    summary: '详解Vue3响应式原理，从ref到reactive的底层实现',
    categoryId: 1 // 前端
  },
  // 前端-2
  {
    title: 'Pinia 替代 Vuex：状态管理最佳实践',
    content: `# Pinia 最佳实践
    ## 为什么用Pinia？
    - 无嵌套模块，扁平化设计
    - 天生支持TypeScript
    \`\`\`ts
    export const useUserStore = defineStore('user', {
      state: () => ({ name: '' }),
      actions: {
        setName(name: string) {
          this.name = name
        }
      }
    })
    \`\`\`
    `,
    summary: 'Pinia状态管理的核心用法和实战技巧',
    categoryId: 1
  },
  // 后端-1
  {
    title: 'Express + TypeScript 搭建后端服务',
    content: `# Express + TS 实战
    ## 初始化项目
    \`\`\`bash
    npm init -y
    npm i express
    npm i -D typescript @types/express
    \`\`\`
    ## 核心代码
    \`\`\`ts
    import express from 'express'
    const app = express()
    app.get('/api/health', (req, res) => {
      res.json({ code: 0, message: 'ok' })
    })
    app.listen(3001)
    \`\`\`
    `,
    summary: '从零搭建Express + TypeScript后端，配置热更新',
    categoryId: 2 // 后端
  },
  // 后端-2
  {
    title: 'SQLite 优化：WAL模式与索引设计',
    content: `# SQLite 性能优化
    ## 1. 启用WAL模式
    \`\`\`sql
    PRAGMA journal_mode = WAL;
    \`\`\`
    ## 2. 索引设计
    - 给常用查询字段加索引
    - 避免过度索引
    `,
    summary: 'SQLite在小型项目中的性能优化技巧，WAL模式和索引设计',
    categoryId: 2
  },
  // DevOps-1
  {
    title: 'Docker 部署前端项目：Nginx 镜像',
    content: `# Docker 部署Vue项目
    ## Dockerfile
    \`\`\`dockerfile
    FROM nginx:alpine
    COPY dist/ /usr/share/nginx/html
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    EXPOSE 80
    \`\`\`
    ## 构建命令
    \`\`\`bash
    docker build -t devblog-frontend .
    docker run -p 80:80 devblog-frontend
    \`\`\`
    `,
    summary: '用Docker打包Vue前端项目，基于Nginx镜像部署',
    categoryId: 3 // DevOps
  },
  // DevOps-2
  {
    title: 'Nginx 反向代理：解决跨域与负载均衡',
    content: `# Nginx 反向代理配置
    ## 基础配置
    \`\`\`nginx
    server {
      listen 80;
      server_name localhost;
      location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
      }
      location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
      }
    }
    \`\`\`
    `,
    summary: 'Nginx反向代理配置，解决跨域问题，实现前后端分离部署',
    categoryId: 3
  }
]

// 批量插入文章
const articleIds: number[] = []
articleContents.forEach(article => {
  const result = insertArticle.run(
    article.title,
    article.content,
    article.summary,
    'https://picsum.photos/800/400?random=' + Math.random(), // 随机封面图
    1, // 作者ID：admin
    article.categoryId
  )
  articleIds.push(result.lastInsertRowid as number)
})

// 6. 插入文章-标签关联（每篇文章2个标签）
const insertArticleTag = db.prepare('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)')
// 文章1：Vue3 + TypeScript
insertArticleTag.run(articleIds[0], tagIds[0])
insertArticleTag.run(articleIds[0], tagIds[2])
// 文章2：Pinia + TypeScript
insertArticleTag.run(articleIds[1], tagIds[1])
insertArticleTag.run(articleIds[1], tagIds[2])
// 文章3：Express + Node.js
insertArticleTag.run(articleIds[2], tagIds[4])
insertArticleTag.run(articleIds[2], tagIds[5])
// 文章4：SQLite + 数据库优化
insertArticleTag.run(articleIds[3], tagIds[6])
insertArticleTag.run(articleIds[3], tagIds[7])
// 文章5：Docker + 前端部署
insertArticleTag.run(articleIds[4], tagIds[8])
insertArticleTag.run(articleIds[4], tagIds[9])
// 文章6：Nginx + 反向代理
insertArticleTag.run(articleIds[5], tagIds[10])
insertArticleTag.run(articleIds[5], tagIds[11])

console.log('✅ 数据库种子数据已就绪！')