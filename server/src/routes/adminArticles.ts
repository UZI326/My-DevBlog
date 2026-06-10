//编写 Admin 文章 CRUD 接口
import express from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'
import { adminMiddleware } from '../middleware/admin.js'
import { sendResponse } from '../utils/response.js'

const router = express.Router()

// 1. 获取管理端文章列表
router.get('/', authMiddleware, adminMiddleware, (req, res) => {
  const pagenum = parseInt(req.query.pagenum as string) || 1
  const pagesize = Math.min(parseInt(req.query.pagesize as string) || 10, 100)
  const offset = (pagenum - 1) * pagesize

  const { total } = db.prepare('SELECT COUNT(*) as total FROM articles').get() as { total: number }

  const articles = db.prepare(`
    SELECT a.*, u.username AS author_name, c.name AS category_name
    FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `).all(pagesize, offset)

  sendResponse(res, 0, 'success', { items: articles, total, pagenum, pagesize })
})

// 2. 创建文章
router.post('/', authMiddleware, adminMiddleware, (req, res) => {
  const { title, content, summary, cover_url, category_id, tag_ids, is_published } = req.body

  if (!title || !content || !category_id) {
    return sendResponse(res, 400, '标题、内容和分类不能为空')
  }

  // 清洗 tag_ids：转数字 + 过滤非法值，防止脏数据导致数据库报错
  const safeTagIds: number[] = tag_ids
    ? tag_ids.map(Number).filter((id: number) => !isNaN(id) && id > 0)
    : []

  try {
    const insertArticle = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO articles (title, content, summary, cover_url, author_id, category_id, is_published)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(title, content, summary || '', cover_url || '', req.user!.id, Number(category_id), is_published ? 1 : 0)

      const articleId = result.lastInsertRowid as number

      if (safeTagIds.length > 0) {
        const insertTag = db.prepare('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)')
        for (const tagId of safeTagIds) {
          insertTag.run(articleId, tagId)
        }
      }

      return articleId
    })

    const articleId = insertArticle()
    sendResponse(res, 0, '文章创建成功', { id: articleId })
  } catch (error: any) {
    sendResponse(res, 500, error.message || '文章创建失败')
  }
})

// 3. 更新文章
router.put('/:id', authMiddleware, adminMiddleware, (req, res) => {
  const articleId = parseInt(req.params.id)
  if (isNaN(articleId)) return sendResponse(res, 400, '文章ID不合法')

  const { title, content, summary, cover_url, category_id, tag_ids, is_published } = req.body

  if (!title || !content || !category_id) {
    return sendResponse(res, 400, '标题、内容和分类不能为空')
  }

  const safeTagIds: number[] = tag_ids
    ? tag_ids.map(Number).filter((id: number) => !isNaN(id) && id > 0)
    : []

  try {
    const updateArticle = db.transaction(() => {
      const info = db.prepare(`
        UPDATE articles
        SET title = ?, content = ?, summary = ?, cover_url = ?, category_id = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(title, content, summary || '', cover_url || '', Number(category_id), is_published ? 1 : 0, articleId)

      // 无行被更新 → 文章不存在
      if (info.changes === 0) {
        throw new Error('ARTICLE_NOT_FOUND')
      }

      db.prepare('DELETE FROM article_tags WHERE article_id = ?').run(articleId)
      if (safeTagIds.length > 0) {
        const insertTag = db.prepare('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)')
        for (const tagId of safeTagIds) {
          insertTag.run(articleId, tagId)
        }
      }
    })

    updateArticle()
    sendResponse(res, 0, '文章更新成功')
  } catch (error: any) {
    if (error.message === 'ARTICLE_NOT_FOUND') {
      return sendResponse(res, 404, '文章不存在')
    }
    sendResponse(res, 500, error.message || '文章更新失败')
  }
})

// 4. 删除文章
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  const articleId = parseInt(req.params.id)
  if (isNaN(articleId)) return sendResponse(res, 400, '文章ID不合法')

  try {
    const deleteArticle = db.transaction(() => {
      // 先清理关联的标签记录，防止遗留孤儿数据
      db.prepare('DELETE FROM article_tags WHERE article_id = ?').run(articleId)

      const info = db.prepare('DELETE FROM articles WHERE id = ?').run(articleId)

      if (info.changes === 0) {
        throw new Error('ARTICLE_NOT_FOUND')
      }
    })

    deleteArticle()
    sendResponse(res, 0, '文章删除成功')
  } catch (error: any) {
    if (error.message === 'ARTICLE_NOT_FOUND') {
      return sendResponse(res, 404, '文章不存在')
    }
    sendResponse(res, 500, error.message || '文章删除失败')
  }
})

export default router