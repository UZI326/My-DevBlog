//认证api  封装 4 个接口函数，类型完整，走 mock 返回假数据
import type {ApiResponse} from '@/types/api'
import type { User, LoginParams, RegisterParams, RegisterResult } from '@/types/user'

//登录
export async function loginApi(params:LoginParams):Promise<ApiResponse<{token: string;id:number;username:string}>>{
  //先用mock返回假数据 后面替换为真实请求 模拟返回假token
  await new Promise(r=>setTimeout(r,500))
  return{
    status:0,
    message:'success',
    data: { token: 'mock-jwt-token-' + new Date(), id: 1, username: params.username }
  }
    // Week 2 替换为：const { data } = await request.post('/api/login', params); return data
}
//封装注册接口
export async function registerApi(params:RegisterParams):Promise<ApiResponse<RegisterResult>>{
  await new Promise(r=>setTimeout(r,500))
  return {
    status:0,
    message:'注册成功',
    data:{id:new Date(),username:params.username}
  }
}
//获取当前用户信息
export async function getUserInfoApi(User): Promise<ApiResponse<User>>{
  await new Promise(r=>setTimeout(r,300))
  //从localStorage 读用户名模拟当前用户
  const raw = localStorage.getItem('devblog_user')
  const user: User = raw?JSON.parse(raw):{id:1,username:'admin'}
  return {status:0,message:'success',data:user}
}
// 更新用户信息
export async function updateUserInfoApi(params:{nickname?:string;email?:string}):Promise<ApiResponse>{
  await new Promise(r=>setTimeout(r,300))
  return {status:0,message:'更新成功',data:null}
}
