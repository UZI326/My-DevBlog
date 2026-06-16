import { api } from './request'
import type { PaginatedData } from '@/types/api'
import type { CommentItem } from '@/types/article'

// 获取评论列表
export async function getCommentsApi(params: { article_id: number; pagenum: number; pagesize: number }) {
  return api.get<PaginatedData<CommentItem>>('/api/comments', params)
}

// 发表评论
export async function postCommentApi(data: { article_id: number; content: string }) {
  return api.post<{ id: number }>('/api/comments', data)
}

// 删除评论
export async function deleteCommentApi(commentId: number) {
  return api.delete<void>('/api/comments/' + commentId)
}
