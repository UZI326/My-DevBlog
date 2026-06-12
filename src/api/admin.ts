import { api } from './request'
import type { PaginatedData } from '@/types/api'
import type { AdminArticleItem, ArticleFormData } from '@/types/article'

// 管理端文章列表
export async function getAdminArticlesApi(params: { pagenum: number; pagesize: number }) {
  return api.get<PaginatedData<AdminArticleItem>>('/api/admin/articles', params)
}

// 创建文章
export async function createArticleApi(data: ArticleFormData) {
  return api.post<{ id: number }>('/api/admin/articles', data)
}

// 更新文章
export async function updateArticleApi(id: number, data: ArticleFormData) {
  return api.put<void>('/api/admin/articles/' + id, data)
}

// 删除文章
export async function deleteArticleApi(id: number) {
  return api.delete<void>('/api/admin/articles/' + id)
}

// 获取标签列表
export async function getTagsApi() {
  return api.get<{ id: number; name: string }[]>('/api/tags')
}