//使用pinia实现完整的认证状态管理
import { defineStore } from 'pinia'
import {ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { loginApi,registerApi,getUserInfoApi }from '@/api/auth.ts'
import type { User,LoginParams,RegisterParams} from '@/types/user'

export const useAuthStore = defineStore('auth',()=>{
  //状态
  const user = ref<User|null>(null)
  const token = ref<string>('')
  const router = useRouter()

  // 判断是否已登录（token存在 + user存在）
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  // 角色权限检查（当前用户无角色字段，预留接口，只要已登录即通过）
  function hasRoles(roles: string[]): boolean {
    if (!roles.length) return true
    return isLoggedIn.value
  }
  // 获取用户名（兜底空字符串）
  const username = computed(() => user.value?.username||'')
  //登录
  async function login(params:LoginParams){
    try{
      //1.调用登录api
      const res = await loginApi(params)
      if(res.status!==0) throw new Error(res.message||'登录失败')
      //2.保存token到state + localStorage
      token.value = res.data.token
      localStorage.setItem('devblog_token',res.data.token)
      //3.保存用户基本信息到localStorage
      const userInfo: User ={
        id: res.data.id,
        username: res.data.username
      }
      localStorage.setItem('devblog_user',JSON.stringify(userInfo))
      //4.更新user状态
      user.value = userInfo
      //5.登录成功跳转首页
      router.push('/')  
    }catch(err){
      console.log('登录失败',err)
      alert((err as Error).message || '登录失败, 请重试')
    }
  }
  //注册 （成功后自动登录）
  async function register(params:RegisterParams){
    try{
      //1.调用注册api
      const res = await registerApi(params)
      if(res.status!==0) throw new Error(res.message||'注册失败')
      // 2.注册成功后自动登录
      await login({
        username: params.username,
        password: params.password
      }) 
    }catch(err){
      console.log('注册失败',err)
      alert((err as Error).message || '注册失败,请重试')
    }
  }
  //退出登录
  function logout(){
    //1.清空state
    token.value = ''
    user.value = null
    //2.清空localStorage
    localStorage.removeItem('devblog_token')
    localStorage.removeItem('devblog_user')
    //3.跳转至登录页面
    router.push('/')
  }
  //恢复会话(页面刷新后恢复登录态)
  async function restoreSession(){
    try{
      //1.从localStorage读取token
      const savedToken = localStorage.getItem('devblog_token')
      if(!savedToken)return
      //2.恢复token到state（同步）
      token.value = savedToken
      //3.同步恢复user（login时已存入localStorage），保证路由守卫立即可用
      const savedUser = localStorage.getItem('devblog_user')
      if(savedUser) {
        user.value = JSON.parse(savedUser)
      }
      //4.异步刷新最新用户信息（失败不影响已恢复的会话）
      try {
        const res = await getUserInfoApi()
        if(res.status === 0) {
          user.value = res.data
        }
      } catch {
        console.log('刷新用户信息失败，使用缓存数据')
      }
    }catch(err){
      console.log('恢复会话失败',err)
      //恢复失败则清空状态
      logout()
    }
  }
   //更新用户信息
   async function updateProfile(params:{nickname?:string;email?:string}){
     try{
      // 这里省略updateUserInfoApi调用（Day3暂不验证）
      // const res = await updateUserInfoApi(params)
      // if (res.status !== 0) throw new Error(res.message)

      // 模拟更新本地state
      if(user.value){
        user.value = {...user.value,...params}
      }
      alert('用户信息更新成功')
     }catch(err){
      console.log('更新用户信息失败:',err)
      alert((err as Error).message || '更新失败,请重试')
     }
   }
   return {
    user, token, isLoggedIn, username, hasRoles,
    login, register, logout, restoreSession, updateProfile,
  }
})
