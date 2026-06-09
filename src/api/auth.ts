import { api } from './request'
import type { LoginResult, RegisterResult } from '@/types/api'
import type { LoginParams, RegisterParams, User } from '@/types/user'

/**
 * 登录接口
 * @param params 登录参数（用户名+密码）
 */
export async function loginApi(params: LoginParams): Promise<LoginResult> {
  return api.post<LoginResult, LoginParams>('/api/login', params)
}

/**
 * 注册接口
 * @param params 注册参数
 */
export async function registerApi(params: RegisterParams): Promise<RegisterResult> {
  return api.post<RegisterResult, RegisterParams>('/api/register', params)
}

/**
 * 获取当前登录用户信息
 */
export async function getUserInfoApi(): Promise<User> {
  return api.get<User>('/api/user/info')
}

/**
 * 更新用户信息（暂存，后续扩展）
 * @param params 用户信息参数
 */
export async function updateUserInfoApi(params: { nickname?: string; email?: string }): Promise<void> {
   await api.put<void>('/user/info',params)
}