import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios'
import { storage } from '@/utils/storage'
import type { ApiResponse } from '@/types/api'

// 1. 创建 Axios 实例（保留你的原有配置，适配环境变量）
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
})

// 2. 请求拦截器：携带 Token（键名统一为 devblog_token，对齐文档/Store）
instance.interceptors.request.use(
  (config) => {
    // 统一使用文档规定的 token 键名
    const token = storage.get<string>('devblog_token')
    if (token && config.headers) {
      // JWT 规范：Bearer 令牌
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 3. 响应拦截器：核心修改！统一解包 + 错误处理（严格对齐后端规范）
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    // 后端规范：code=0 代表成功，直接返回业务数据 data
    if (res.code === 0) {
      return res.data
    }
    // 业务错误：直接抛出错误信息
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error: AxiosError) => {
    // 网络层 / HTTP 状态码错误处理
    let errorMsg = '网络异常，请稍后重试'

    // 请求超时
    if (error.code === 'ECONNABORTED') {
      errorMsg = '请求超时，请稍后重试'
    }
    // 后端返回 HTTP 状态码
    else if (error.response) {
      const status = error.response.status
      switch (status) {
        case 401:
          errorMsg = '登录已失效，请重新登录'
          // 清空本地存储（对齐文档键名）
          storage.remove('devblog_token')
          storage.remove('devblog_user')
          // 自动跳转到登录页
          window.location.href = '/login'
          break
        case 404:
          errorMsg = '请求资源不存在'
          break
        case 500:
          errorMsg = '服务器内部错误'
          break
        default:
          errorMsg = (error.response.data as ApiResponse)?.message || `请求错误(${status})`
      }
    }

    return Promise.reject(new Error(errorMsg))
  }
)

// 4. 简化请求封装：响应拦截已处理所有逻辑，此处仅做泛型转发
type RequestMethod = 'get' | 'post' | 'put' | 'delete'
/**
 * 内部请求核心
 * @returns Promise<T> 注意：这里直接返回 T，因为拦截器已经解包了
 */
const request = async <T = unknown, P = unknown>(
  method: RequestMethod,
  url: string,
  data?: P,
  params?: P,
  config?: AxiosRequestConfig
):Promise<T> => {  // <--- 显式声明返回值为 Promise<T>
  // 所有业务/错误处理已在拦截器完成，直接返回结果
  const result = await instance.request<T>({   // 这里用 any 避免中间层类型检查报错
    url,
    method,
    data,
    params,
    ...config
  })
  return result as T  // 断言为 T，因为拦截器已经处理过了
}

// 5. 导出 API 方法（保留你的原有调用方式，完全兼容）
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

// export default instance