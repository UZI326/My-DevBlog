import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDB } from './db.js'
import db from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import articlesRoutes from './routes/articles.js'
import adminArticlesRoutes from './routes/adminArticles.js'
import uploadRoutes from './routes/upload.js'
import commentsRoutes from './routes/comments.js'
const app = express()
const port = parseInt(process.env.port || '3001')
initDB()

//中间件
//CORS：只允许前端地址 localhost:3000 和 127.0.0.1:3000 访问，并允许携带 cookie / 认证信息（credentials: true）。
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], credentials: true }))
app.use(express.json())  //	解析请求体 JSON

// 静态文件服务 —— 让上传的图片可以通过 /uploads/xxx.jpg 访问
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

//路由
app.use('/api',authRoutes)
app.use('/api/user',userRoutes)
app.use('/api/articles',articlesRoutes)
app.use('/api/admin/articles',adminArticlesRoutes)
app.use('/api/upload',uploadRoutes)
app.use('/api/comments',commentsRoutes) 
//分类列表接口
app.get('/api/categories',(_req,res)=>{
  const rows = db.prepare(`
     SELECT c.id, c.name, c.slug, COUNT(a.id) AS article_count
    FROM categories c
    LEFT JOIN articles a ON a.category_id = c.id AND a.is_published = 1
    GROUP BY c.id
    ORDER BY c.id
    `).all()
    res.json({code:0, message:'success',data:rows})
})

// 标签列表接口
app.get('/api/tags', (_req, res) => {
  const rows = db.prepare('SELECT id, name FROM tags ORDER BY id').all()
  res.json({ code: 0, message: 'success', data: rows })
})
//健康检查
app.get('/api/health',(_req,res)=>{
  res.json({code:0,message:'ok'})
})

//全局错误处理(错误处理的中间件)
app.use((err:Error, _req:express.Request,res:express.Response,_next:express.NextFunction)=>{
  console.log('服务器错误',err.stack)
  res.status(500).json({code:500,message:'服务器内部错误',data:null})

})

//启动服务器
app.listen(port,()=>{
   console.log(`✅ DevBlog API Server 启动成功 → http://localhost:${port}`)
   console.log(`📁 静态文件服务已开启 → http://localhost:${port}/uploads`)
})
