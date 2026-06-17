import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import nodePath from 'node:path'
import nodeFs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { initDB } from './db.js'
import db from './db.js'

// 导入所有后端路由
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import articlesRoutes from './routes/articles.js'
import adminArticlesRoutes from './routes/adminArticles.js'
import uploadRoutes from './routes/upload.js'
import commentsRoutes from './routes/comments.js'

// ========== 1. 基础配置 ==========
// ESM 模块下替代 __dirname
const __dirname = nodePath.dirname(fileURLToPath(import.meta.url))
const app = express()
const port = parseInt(process.env.PORT || '3001')
const isProduction = process.env.NODE_ENV === 'production'

// 初始化数据库
initDB()

// ========== 2. 中间件配置 ==========
// CORS 跨域配置：开发环境开启，生产环境同源托管无需开启
if (!isProduction) {
  app.use(cors({
    // 修复了原代码中 127.0.0.1 漏写 :3000 端口的问题
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], 
    credentials: true
  }))
}

// 解析 JSON 请求体
app.use(express.json())

// ========== 3. 上传文件静态目录（开发/生产通用） ==========
const uploadsDir = nodePath.resolve(__dirname, '..', 'uploads')
// 防御性编程：目录不存在则自动创建，防止首次上传文件时报错
if (!nodeFs.existsSync(uploadsDir)) {
  nodeFs.mkdirSync(uploadsDir, { recursive: true })
}
app.use('/uploads', express.static(uploadsDir))

// ========== 4. 注册所有 API 路由 ==========
app.use('/api', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/articles', articlesRoutes)
app.use('/api/admin/articles', adminArticlesRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/comments', commentsRoutes)

// 分类列表接口
app.get('/api/categories', (_req, res) => {
  const rows = db.prepare(`
    SELECT c.id, c.name, c.slug, COUNT(a.id) AS article_count
    FROM categories c
    LEFT JOIN articles a ON a.category_id = c.id AND a.is_published = 1
    GROUP BY c.id
    ORDER BY c.id
  `).all()
  res.json({ code: 0, message: 'success', data: rows })
})

// 标签列表接口
app.get('/api/tags', (_req, res) => {
  const rows = db.prepare('SELECT id, name FROM tags ORDER BY id').all()
  res.json({ code: 0, message: 'success', data: rows })
})

// 健康检查接口
app.get('/api/health', (_req, res) => {
  res.json({ code: 0, message: 'ok' })
})

// ========== 5. 生产环境专属：托管前端静态文件 + SPA 路由回退 ==========
if (isProduction) {
  // 指向项目根目录的 dist 文件夹（假设结构为：根目录/dist，当前文件在 根目录/server/src）
  const distDir = nodePath.resolve(__dirname, '..', '..', 'dist')
  
  // 托管前端打包后的静态资源 (js, css, img 等)
  app.use(express.static(distDir))

  // SPA 路由回退（⚠️ 必须放在所有 API 路由的最后！）
  // 所有未匹配到 API 和静态文件的请求，统一返回 index.html，交给 Vue Router 处理
  app.get('*', (_req, res) => {
    const indexPath = nodePath.join(distDir, 'index.html')
    if (nodeFs.existsSync(indexPath)) {
      res.sendFile(indexPath)
    } else {
      res.status(404).send('前端资源未构建，请先在前端目录运行 npm run build')
    }
  })
}

// ========== 6. 全局异常捕获中间件（兜底） ==========
// 修复：将 console.log 改为 console.error，确保错误日志输出到标准错误流
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('🔴 服务器未捕获异常:', err.stack)
  // 防止双重响应：如果 res.headersSent 为 true，说明路由里已经响应过了，直接交给 Express 默认处理
  if (res.headersSent) {
    return _next(err)
  }
  res.status(500).json({ code: 500, message: '服务器内部错误', data: null })
})

// ========== 7. 启动服务 ==========
app.listen(port, () => {
  console.log(`✅ DevBlog 服务启动成功 → http://localhost:${port}`)
  console.log(`   运行环境: ${isProduction ? '🚀 生产 (Production)' : '🛠️ 开发 (Development)'}`)
  if (isProduction) {
    console.log(`   前端模式: Express 托管 dist 静态文件 (SPA 同域部署)`)
  } else {
    console.log(`   前端模式: 跨域请求前端开发服务器 (CORS 已开启)`)
  }
  console.log(`   图片访问: http://localhost:${port}/uploads`)
})