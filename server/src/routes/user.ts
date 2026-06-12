import express from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'
import { sendResponse } from '../utils/response.js'

const router = express.Router()

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
