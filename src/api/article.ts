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