import type { UploadResult } from '@/types/api'
import { storage } from '@/utils/storage'

// 图片上传
export async function uploadImageApi(file: File): Promise<UploadResult> {
   // 1. 构建表单数据
  const formData = new FormData()
  formData.append('file', file)

   // 2. 获取环境配置
  const baseURL = import.meta.env.VITE_API_BASE_URL || '' // 从 Vite 环境变量读取API地址
  const token = storage.get<string>('devblog_token') // 从本地存储读取JWT令牌

   // 3. 发送上传请求
  const res = await fetch(baseURL + '/api/upload', {
    method: 'POST',
    headers: token ? { Authorization: 'Bearer ' + token } : {},
    body: formData,
  })

   // 4. 处理响应
  const json = await res.json()
  if (json.code !== 0) throw new Error(json.message || '上传失败') //统一错误逻辑
  return json.data  // 返回标准化数据
}