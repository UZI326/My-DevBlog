// 1. 分类
export interface Category {
  id: number
  name: string
  slug: string
  article_count?: number // 可选：该分类下的文章数
}

// 2. 标签
export interface Tag {
  id: number
  name: string
}

// 3. 文章列表项(卡片用)
export interface ArticleListItem {
  id: number
  title: string
  summary: string        // 摘要（截取正文前150字）
  cover_url: string | null // 封面图（无则为null）
  category: Category | null // 所属分类（无则为null）
  tags: Tag[]            // 标签列表（至少2个）
  author_name: string    // 作者名
  view_count: number     // 阅读量
  like_count: number     // 点赞数
  is_published: boolean  // 是否发布
  created_at: string     // ISO日期字符串（创建时间）
  updated_at: string     // ISO日期字符串（更新时间）
}

// 4. 文章详情（详情页用）
export interface ArticleDetail {
  id: number
  title: string
  content: string        // Markdown原文（详情页核心）
  summary: string        // 摘要（和列表项一致）
  cover_url: string | null // 封面图
  category: Category | null // 所属分类
  tags: Tag[]            // 标签列表
  author_id: number      // 作者ID（详情页需补充）
  author_name: string    // 【补全】作者名（列表项有，详情页不能漏）
  view_count: number     // 【补全】阅读量
  like_count: number     // 【补全】点赞数
  is_published: boolean
  created_at: string
  updated_at: string
}

// 5. 文章筛选参数
export interface ArticleFilter {
  category_slug?: string // 按分类slug筛选（可选）
  tag?: string           // 按标签筛选（可选）
  keyword?: string       // 【修正】搜索关键词（可选）
  pagenum: number        // 页码（必选）
  pagesize: number       // 每页条数（必选）
}


// 6. 筛选值类型（UI组件用）
export type FilterOption = 'all' | string // all=全部，string=分类slug

// 7.文章表单数据（用于创建/编辑）
export interface ArticleFormData {
  title: string
  content: string
  summary: string
  cover_url: string
  category_id: number | null
  tag_ids: number[]
  is_published: number
}

// 8.管理端文章列表项
export interface AdminArticleItem {
  id: number
  title: string
  summary: string | null
  cover_url: string | null
  author_name: string
  category_name: string
  is_published: boolean
  view_count: number
  like_count: number
  created_at: string
  updated_at: string
}


// 9.评论项
export interface CommentItem {
  id: number
  content: string
  article_id: number
  user_id: number
  username: string
  nickname: string | null
  avatar: string | null
  created_at: string
}
