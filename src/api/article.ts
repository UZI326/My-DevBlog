//删除所有 Mock，调用真实接口
import {api} from './request'
import type {PaginatedData } from '@/types/api.ts'
import type { ArticleListItem,ArticleDetail,ArticleFilter,Category } from '@/types/article'

/**
 * 获取文章列表（分页+分类筛选）
 * @param params 筛选参数
 */
export async function getArticlesApi(params:ArticleFilter):Promise<PaginatedData<ArticleListItem>>{
  return api.get<PaginatedData<ArticleListItem>, ArticleFilter>('/api/articles', params)
  
}

/**
 * 获取文章详情
 * @param id 文章ID
 */
export async function getArticleDetailApi(id:number):Promise<ArticleDetail>{
 return api.get<ArticleDetail>(`/api/articles/${id}`)
 
}

/**
 * 获取全部分类列表
 */
export async function getCategoriesApi():Promise<Category[]>{
  return api.get<Category[]>('/api/categories')
  
}

// 搜索文章
export async function searchArticlesApi(params: { q: string; pagenum: number; pagesize: number }) {
  return api.get<PaginatedData<ArticleListItem>>('/api/articles/search', params)
}

// 点赞/取消点赞
export async function toggleLikeApi(articleId: number) {
  return api.post<{ liked: boolean }>('/api/articles/' + articleId + '/like')
}

// 查点赞状态
export async function getLikeStatusApi(articleId: number) {
  return api.get<{ liked: boolean }>('/api/articles/' + articleId + '/like-status')
}
