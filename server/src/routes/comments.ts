import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'  // ⚠️ 必须导入权限中间件
import { sendResponse } from '../utils/response.js'
const router = Router()

// GET 获取评论列表（公开接口）
router.get('/', (req, res) => {
  const articleId = parseInt(req.query.article_id as string)
  const pagenum = parseInt(req.query.pagenum as string) || 1
  const pagesize = parseInt(req.query.pagesize as string) || 10
  if (isNaN(articleId)) return sendResponse(res, 400, '缺少 article_id')

  const offset = (pagenum - 1) * pagesize
  const { total } = db.prepare('SELECT COUNT(*) as total FROM comments WHERE article_id = ?').get(articleId) as { total: number }
  // ✅ 核心：联表查用户信息（头像/昵称）
  const comments = db.prepare(`
    SELECT c.*, u.username, u.nickname, u.user_pic AS avatar
    FROM comments c LEFT JOIN users u ON c.user_id = u.id
    WHERE c.article_id = ? ORDER BY c.created_at DESC LIMIT ? OFFSET ?
  `).all(articleId, pagesize, offset)
  sendResponse(res, 0, 'success', { items: comments, total, pagenum, pagesize })
})

// POST 发表评论（需登录）
router.post('/', authMiddleware, (req, res) => {
  const { article_id, content } = req.body
  if (!article_id || !content.trim()) return sendResponse(res, 400, '评论不能为空')
  // ⚠️ 校验：文章必须存在且已发布
  const article = db.prepare('SELECT id FROM articles WHERE id = ? AND is_published = 1').get(article_id)
  if (!article) return sendResponse(res, 404, '文章不存在')
  // ✅ 核心：用 req.user!.id 获取当前登录用户ID
  const result = db.prepare('INSERT INTO comments (content, article_id, user_id) VALUES (?, ?, ?)')
    .run(content.trim(), article_id, req.user!.id)
  sendResponse(res, 0, '评论发表成功', { id: result.lastInsertRowid })
})

// DELETE 删除评论（仅作者/管理员）
router.delete('/:id', authMiddleware, (req, res) => {
  const commentId = parseInt(req.params.id as string)
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(commentId) as any
  if (!comment) return sendResponse(res, 404, '评论不存在')
  // ⚠️ 权限校验：本人 或 管理员
  if (comment.user_id !== req.user!.id && req.user!.role !== 'admin') {
    return sendResponse(res, 403, '无权删除')
  }
  db.prepare('DELETE FROM comments WHERE id = ?').run(commentId)
  sendResponse(res, 0, '评论已删除')
})

export default router