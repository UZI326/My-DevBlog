import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { loginApi, registerApi, getUserInfoApi } from '@/api/auth'
import type { LoginParams, RegisterParams, User } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  // 状态
  const token = ref<string | null>(localStorage.getItem('devblog_token'))
  const user = ref<User | null>(
    localStorage.getItem('devblog_user') ? JSON.parse(localStorage.getItem('devblog_user')!) : null
  )

  /**
   * 登录逻辑
   * @param params 登录参数
   */
  const login = async (params: LoginParams) => {
    const data = await loginApi(params)
    // 存储 Token 和用户信息
    token.value = data.token
     // 确保存储完整的用户对象，包括 role 字段（如果后端返回了的话）
    user.value = {
      id: data.id,
      username: data.username,
      user_pic: data.user_pic,
      role: (data as any).role || '' // 建议加上 role，防止 hasRoles 报错
    }as User
    localStorage.setItem('devblog_token', data.token)
    localStorage.setItem('devblog_user', JSON.stringify(user.value))
    // 跳转到首页
    router.push('/')
  }

  /**
   * 注册逻辑
   * @param params 注册参数
   */
  const register = async (params: RegisterParams) => {
    const data = await registerApi(params)
    // 注册成功后自动登录（可选）
    user.value = {
      id: data.id,
      username: data.username,
      user_pic: data.user_pic
    }
    router.push('/')
  }

  /**
   * 退出登录
   */
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('devblog_token')
    localStorage.removeItem('devblog_user')
    router.push('/login')
  }

  /**
   * 页面刷新时恢复登录态
   */
  const restoreSession = async () => {
    if (!token.value) return
    try {
      const userInfo = await getUserInfoApi()
      user.value = userInfo
      
    } catch (error) {
      // Token 失效，清空状态
      logout()
    }
  }

  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => user.value?.username ?? '')

  function hasRoles(roles: string[]): boolean {
    if (!user.value) return false
    return roles.includes(user.value.role ?? '')
  }

  return { token, user, isLoggedIn, username, hasRoles, login, register, logout, restoreSession }
})