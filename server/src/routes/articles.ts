import express from 'express'
import db from '../db.js'
import { sendResponse } from '../utils/response.js'
import { parse } from 'node:path';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router()

// 文章列表项的类型
interface ArticleItem {
  id: number;
  title: string;
  summary: string;
  cover_url: string;
  view_count: number;
  like_count: number;
  created_at: string; // 或 Date，根据数据库字段类型调整
  author_name: string;
  cat_id: number;
  cat_name: string;
  cat_slug: string;
}

// 标签项的类型
interface TagItem {
  id: number
  name: string
}

// 总数的类型（COUNT(*) 结果为数字）
interface TotalResult {
  total: number
}

// 带标签的文章列表项
interface ArticleWithTags extends ArticleItem {
  tags: TagItem[]
}

// 文章详情（比列表项多 content、updated_at 等字段）
interface ArticleDetail {
  id: number
  title: string
  content: string
  summary: string | null
  cover_url: string | null
  author_id: number
  category_id: number
  view_count: number
  like_count: number
  is_published: number
  created_at: string
  updated_at: string
  author_name: string
  cat_id: number
  cat_name: string
  cat_slug: string
}

// 文章列表（分页+分类筛选）
router.get('/', (req, res) => {
  const pagenum = parseInt(req.query.pagenum as string) || 1
  const pagesize = Math.min(parseInt(req.query.pagesize as string) || 6, 100)
  const category_slug = req.query.category_slug as string

  const offset = (pagenum - 1) * pagesize
  let whereClause = 'a.is_published = 1'
  const params: any[] = []

  if (category_slug && category_slug !== 'all') {
    whereClause += ' AND c.slug = ?'
    params.push(category_slug)
  }

  // 查询总数
  const { total } = db.prepare(`
    SELECT COUNT(*) as total
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE ${whereClause}
  `).get(...params) as TotalResult

  // 查询文章列表
  const articles = db.prepare(`
    SELECT
      a.id, a.title, a.summary, a.cover_url, a.view_count, a.like_count,
      a.created_at, u.username AS author_name,
      c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug
    FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE ${whereClause}
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, pagesize, offset) as ArticleItem[]

  const tagStmt = db.prepare('SELECT t.id, t.name FROM article_tags at JOIN tags t ON at.tag_id = t.id WHERE at.article_id = ?')
  const articlesWithTags: ArticleWithTags[] = articles.map(article => ({
    ...article,
    tags: tagStmt.all(article.id) as TagItem[]
  }))

  sendResponse(res, 0, '获取文章列表成功', { items: articlesWithTags, total, pagenum, pagesize })
})

// 全局搜索接口（必须放在 /:id 之前，否则 "search" 会被 :id 捕获）
router.get('/search',(req,res)=>{
  const q = (req.query.q as string || '').trim()
  const pagenum = parseInt(req.query.pagenum as string) ||1
  const pagesize = parseInt(req.query.pagesize as string) ||10
  if(!q) return sendResponse(res,400,'请输入关键词')
  const offset = (pagenum-1)*pagesize
  const { total } = db.prepare('SELECT COUNT(*) as total FROM articles_fts WHERE articles_fts MATCH ?').get(q) as { total: number }
   // ✅ 核心：FTS5 MATCH 语法 + ORDER BY rank 按相关度排序
   const articles = db.prepare(`
    SELECT a.*, u.username AS author_name, c.name AS category_name
    FROM articles_fts fts JOIN articles a ON a.id = fts.rowid
    LEFT JOIN users u ON a.author_id = u.id LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.is_published = 1 AND articles_fts MATCH ?
    ORDER BY rank LIMIT ? OFFSET ?
  `).all(q, pagesize, offset)
    sendResponse(res, 0, 'success', { items: articles, total, pagenum, pagesize })
})

// 文章详情
router.get('/:id', (req, res) => {
  const articleId = parseInt(req.params.id)
  if (isNaN(articleId)) return sendResponse(res, 400, '文章ID不合法')

  const article = db.prepare(`
    SELECT
      a.*, u.username AS author_name,
      c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug
    FROM articles a
    LEFT JOIN users u ON a.author_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.id = ? AND a.is_published = 1
  `).get(articleId) as ArticleDetail | undefined

  if (!article) return sendResponse(res, 404, '文章不存在')

  const tags = db.prepare('SELECT t.id, t.name FROM article_tags at JOIN tags t ON at.tag_id = t.id WHERE at.article_id = ?').all(articleId) as TagItem[]
  sendResponse(res, 0, '获取文章详情成功', { ...article, tags })
})

// 点赞/取消点赞（Toggle模式）
router.post('/:id/like', authMiddleware, (req, res) => {
  const articleId = parseInt(req.params.id as string)
  const article = db.prepare('SELECT id FROM articles WHERE id = ? AND is_published = 1').get(articleId)
  if (!article) return sendResponse(res, 404, '文章不存在')

  // 查是否已点赞
  const existing = db.prepare('SELECT id FROM likes WHERE user_id = ? AND article_id = ?')
    .get(req.user!.id, articleId)
  if (existing) {
    // 已点 → 取消
    db.prepare('DELETE FROM likes WHERE id = ?').run((existing as any).id)
    db.prepare('UPDATE articles SET like_count = like_count - 1 WHERE id = ?').run(articleId)
    sendResponse(res, 0, '已取消点赞', { liked: false })
  } else {
    // 未点 → 点赞
    db.prepare('INSERT INTO likes (user_id, article_id) VALUES (?, ?)').run(req.user!.id, articleId)
    db.prepare('UPDATE articles SET like_count = like_count + 1 WHERE id = ?').run(articleId)
    sendResponse(res, 0, '点赞成功', { liked: true })
  }
})
//查询点赞状态
router.get('/:id/like-status',authMiddleware,(req,res)=>{
  const articleId = parseInt(req.params.id as string)
  const existing = db.prepare('SELECT id FROM likes WHERE user_id = ? AND article_id = ?')
    .get(req.user!.id, articleId)
  sendResponse(res, 0, 'success', { liked: !!existing })
})
export default router