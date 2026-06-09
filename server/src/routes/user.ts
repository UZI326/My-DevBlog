import express from 'express'
import db from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

interface ApiResponse<T> {
  code: number
  message: string
  data: T | null
}

function sendResponse<T>(res: express.Response, code: number, message: string, data: T | null = null): void {
  res.json({ code, message, data } as ApiResponse<T>)
}

// GET /api/user/info — 获取当前登录用户信息
router.get('/info', authMiddleware, (req, res) => {
  const userId = req.user!.id

  const user = db.prepare(`
    SELECT id, username, nickname, email, user_pic
    FROM users WHERE id = ?
  `).get(userId)

  if (!user) {
    return sendResponse(res, 404, '用户不存在')
  }

  sendResponse(res, 0, '获取用户信息成功', user)
})

export default router
