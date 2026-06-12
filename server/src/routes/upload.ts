import express from 'express'
import multer from 'multer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = path.resolve(__dirname, '..', '..', 'uploads')

// 配置 Multer 存储 磁盘存储引擎（防内存爆炸） cb 是 Multer 的回调函数，格式：cb(错误信息, 存储路径)
const storage = multer.diskStorage({
  //文件存在那
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR)
  },
  // 文件叫什么名（最容易踩坑的地方）
  filename: (_req, file, cb) => {
    // ✅ 仅修改这里：去掉 encodeURIComponent，彻底解决中文/特殊字符编码问题
    // 只保留文件后缀，用时间戳做唯一文件名，100%不会出现编码不匹配
    const ext = path.extname(file.originalname).toLowerCase()
    const uniqueName = Date.now() + ext
    cb(null, uniqueName)
  }
})

// 只允许图片类型 MIME 类型白名单（防伪装文件）
function fileFilter(_req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('仅支持 JPG、PNG、GIF、WebP 格式的图片'))
  }
}

const upload = multer({
  storage,  // 存储规则
  fileFilter,  // 文件类型过滤
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB 限制
})

const router = express.Router()

// POST /api/upload
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.json({ code: 400, message: '请选择要上传的文件', data: null })
    return
  }

  const url = '/uploads/' + req.file.filename
  res.json({ code: 0, message: '上传成功', data: { url } })
})

// Multer 错误处理  错误处理中枢（异常熔断机制）
router.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.json({ code: 400, message: '文件大小不能超过 5MB', data: null })
      return
    }
    res.json({ code: 400, message: err.message, data: null })
    return
  }
  res.json({ code: 400, message: err.message, data: null })
})

export default router