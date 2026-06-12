import express from 'express'
import db from '../db.js'
import { sendResponse } from '../utils/response.js'

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

export default router