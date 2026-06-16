import { api } from './request'

// 查看用户公开信息
export async function getUserProfileApi(userId: number) {
  return api.get<any>('/api/user/' + userId)
}

// 更新个人资料
export async function updateProfileApi(data: { nickname?: string; email?: string; user_pic?: string }) {
  return api.put<void>('/api/user/profile', data)
}
