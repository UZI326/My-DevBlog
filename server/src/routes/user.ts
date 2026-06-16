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

//更新个人资料
// 【修复说明】
// 1. 移除 next 参数：catch 中 sendResponse 已完成响应，不应再传给全局中间件
// 2. 移除 next(err)：消除 ERR_HTTP_HEADERS_SENT 双重响应问题
// 3. 增加空值合并运算符 ?? null 兼容前端未传字段的场景
router.put('/profile', authMiddleware, (req, res) => {
  try {
    const { nickname, email, user_pic } = req.body
    db.prepare(`
      UPDATE users SET nickname = ?, email = ?, user_pic = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(nickname ?? null, email ?? null, user_pic ?? null, req.user!.id)

    sendResponse(res, 0, '资料更新成功')
  } catch (err) {
    // 终端打印完整报错堆栈，精准定位SQL/字段问题
    console.error('【更新用户资料SQL异常】完整错误信息：', err)
    // 向前端返回标准化500提示（此后不再调用 next，防止双重响应）
    return sendResponse(res, 500, '服务器内部错误：用户资料更新失败')
  }
})

// 查看他人公开信息
router.get('/:id',(req,res)=>{
  const userId = parseInt(req.params.id)
  const user = db.prepare('SELECT id, username, nickname, email, user_pic, role, created_at FROM users WHERE id = ?').get(userId) as any
  if(!user) return sendResponse(res,404,'用户不存在')
  //统计文章数, 评论数
  const { article_count } = db.prepare('SELECT COUNT(*) as article_count FROM articles WHERE author_id = ? AND is_published = 1').get(userId) as { article_count: number }
  const { comment_count } = db.prepare('SELECT COUNT(*) as comment_count FROM comments WHERE user_id = ?').get(userId) as { comment_count: number }  
  sendResponse(res, 0, 'success', { ...user, article_count, comment_count })
})
export default router
