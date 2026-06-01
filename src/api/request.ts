//核心任务 - 封装 Axios src/api/request.ts
import axios,{ AxiosRequestConfig,AxiosError } from 'axios'
import {storage} from '@/utils/storage'
import type {ApiResponse} from '@/types/api'

// 1.创建 Axios 实例
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,// 从环境变量取基地址
  timeout: 10000,  //允许超时时间10s
  withCredentials: true, // 允许携带跨域 cookie
  headers: {'Content-Type': 'application/json;charset=utf-8',}
});
//1.请求拦截器： 自动携带token
instance.interceptors.request.use(
  (config)=>{
    // 从 localStorage 取 token（约定 key 为 'token'）
    const token = storage.get<string>('token');
    if(token && config.headers){
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (err,AxiosError) =>{
    return Promise.reject(error)
  }
)
//2.响应拦截器： 同意处理响应/错误
axios.interceptors.response.use(
    (response)=> {
    // 提取后端返回的统一响应格式
       const res = response.data as ApiResponse
       // code !== 0 视为业务错误，主动抛错
       if(res.code !==0 ){
        //401 代表token过期/未登录，清除登录状态
        if(res.code === 401){
          storage.remove('token')
          storage.remove('userInfo')
          // 跳转到登录页（后续结合路由守卫，这里先提示）
          alert('登录态已过期,请重新登录')
          window.location.href = '/login'// 清空所有内存状态
        }
        // 抛出自定义错误（包含业务信息）
          return Promise.reject(new Error(res.message || '请求失败'))
       }
      // 成功则只返回 data（简化组件层调用）
       return res.data;
    }, (error: AxiosError) =>{
     // 统一处理网络/超时错误
     let errorMsg = '网络异常, 请稍后重试'
     if(errorMsg === 'ECONNABORTED'){
      errorMsg = '请求超时,请稍后重试'
     }else if(error.response){
      // 服务端返回非 2xx 状态码
      errorMsg = `请求失败（${error.response.status}) : ${error.message}`;
     }
     console.error('Axios 错误:', errorMsg);
      return Promise.reject(new Error(errorMsg))
  });

  // 🔹 类型安全的请求方法封装（核心：泛型推导）
type RequestMethod = 'get' | 'post' | 'put' | 'delete'
//定义通用请求函数
const request = <T = unknown , P = unknown>(
  method: RequestMethod,
  url: string,
  data? :P,  // POST/PUT 用 data（body）
  params?: P, // GET/DELETE 用 params（URL 参数）
  config?: AxiosRequestConfig // 新增 config 参数
)=>{
  switch(method){
    case 'get':
      return instance.get<ApiResponse<T>>(url, { params, ...config });
    case 'delete':
      return instance.delete<ApiResponse<T>>(url, { params, ...config });
    case 'post':
      return instance.post<ApiResponse<T>>(url, data, config);
    case 'put':
      return instance.put<ApiResponse<T>>(url, data, config);
    default:
      throw new Error(`不支持的请求方法：${method}`);
  } 
}

// 导出简化的 get/post/put/delete 方法（组件层直接用）
export const api = {
  get: <T, P = unknown>(url: string, params?: P, config?: AxiosRequestConfig) =>
    request<T, P>('get', url, undefined, params, config),
  post: <T, P = unknown>(url: string, data?: P, config?: AxiosRequestConfig) =>
    request<T, P>('post', url, data, undefined, config),
  put: <T, P = unknown>(url: string, data?: P, config?: AxiosRequestConfig) =>
    request<T, P>('put', url, data, undefined, config),
  delete: <T, P = unknown>(url: string, params?: P, config?: AxiosRequestConfig) =>
    request<T, P>('delete', url, undefined, params, config),
};

// 导出 Axios 实例（备用）
export default instance