// src/api/request.ts
import axios, { AxiosRequestConfig, AxiosError } from 'axios'
import { storage } from '@/utils/storage'
import type { ApiResponse } from '@/types/api'

// 1. 创建 Axios 实例（保持原有配置）
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
})

// 2. 请求拦截器：仅处理协议层逻辑（保持原有设计）
instance.interceptors.request.use(
  (config) => {
    const token = storage.get<string>('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => { // ✅ FIX: 修复参数类型错误
    return Promise.reject(error)
  }
)

// 3. 响应拦截器：仅处理网络层错误（关键修改！）
instance.interceptors.response.use(
  (response) => {
    // ✅ FIX: 1. 移除业务错误处理逻辑
    // ✅ FIX: 2. 直接返回原始响应（不解包！）
    return response // 保留完整响应结构
  },
  (error: AxiosError) => {
    // ✅ FIX: 3. 仅处理网络层错误（不碰业务错误码！）
    let errorMsg = '网络异常, 请稍后重试'
    
    // 修复错误判断逻辑（原代码有逻辑错误）
    if (error.code === 'ECONNABORTED') { // ✅ FIX: 检查 error.code 而非 errorMsg
      errorMsg = '请求超时, 请稍后重试'
    } else if (error.response) {
      errorMsg = `服务异常（${error.response.status}）`
    }
    
    console.error('Axios 网络错误:', errorMsg)
    return Promise.reject({ 
      ...error, 
      message: errorMsg // 保留原始错误信息
    })
  }
)

// 4. 类型安全的请求封装（核心修改：处理业务错误）
type RequestMethod = 'get' | 'post' | 'put' | 'delete'

const request = async <T = unknown, P = unknown>(
  method: RequestMethod,
  url: string,
  data?: P,
  params?: P,
  config?: AxiosRequestConfig
) => {
  try {
    const response = await instance.request<ApiResponse<T>>({
      url,
      method,
      data,
      params,
      ...config
    })

    // ✅ FIX: 5. 在此处集中处理业务错误（关键！）
    const res = response.data
    if (res.code !== 0) {
      // 401 特殊处理（但不再跳转，交给上层决定）
      if (res.code === 401) {
        storage.remove('token')
        storage.remove('userInfo')
        // 抛出带状态的错误，由调用层决定跳转逻辑
        throw new Error('AUTH_EXPIRED')
      }
      throw new Error(res.message || '请求失败')
    }
    
    return res.data // 仅成功时返回业务数据
  } catch (error: any) {
    // ✅ FIX: 6. 统一抛出可识别的错误类型
    if (error.message === 'AUTH_EXPIRED') {
      throw error // 保留特殊标识
    }
    throw error.isAxiosError 
      ? error.response?.data?.message || '网络请求失败' 
      : error.message
  }
}

// 5. 导出简化的请求方法
export const api = {
  get: <T, P = unknown>(url: string, params?: P, config?: AxiosRequestConfig) =>
    request<T, P>('get', url, undefined, params, config),
  post: <T, P = unknown>(url: string, data?: P, config?: AxiosRequestConfig) =>
    request<T, P>('post', url, data, undefined, config),
  put: <T, P = unknown>(url: string, data?: P, config?: AxiosRequestConfig) =>
    request<T, P>('put', url, data, undefined, config),
  delete: <T, P = unknown>(url: string, params?: P, config?: AxiosRequestConfig) =>
    request<T, P>('delete', url, undefined, params, config),
}

export default instance