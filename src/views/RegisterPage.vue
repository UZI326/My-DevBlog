//实现注册逻辑
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { RegisterParams } from '@/types/user'

//状态定义
const authStore = useAuthStore()
const router = useRouter()
const loading = ref(false) //注册按钮加载态
//表单数据
const form = ref<{
  username: string
  password: string
  confirmPwd: string
}>({
  username:'',
  password:'',
  confirmPwd:'',
})

// 错误提示
const errors = ref<{
  username: string
  password: string
  confirmPwd: string
}>({
  username: '',
  password: '',
  confirmPwd: ''
})
// 表单校验
 function validateForm():boolean {
  let isValid = true
  errors.value = {username:'',password:'',confirmPwd:''}
  //用户名验证: 非空+3-10字符
  if(!form.value.username.trim()){
    errors.value.username = '用户名不能用空'
    isValid = false
  }else if(form.value.username.length<3||form.value.username.length>10){
    errors.value.username = '用户名需为3-10字符'
    isValid = false
  }
   //密码校: 非空+ 6-12个字符
   if(!form.value.password.trim()){
    errors.value.password = '密码不能为空'
    isValid = false
   }else if(form.value.password.length<6||form.value.password.length>12){
    errors.value.password = '密码需为6-12字符'
    isValid = false
   }
  //确认密码校验 和原密码一样
  if(form.value.password!==form.value.confirmPwd){
    errors.value.confirmPwd = '两次输入的密码不一致'
    isValid = false
  }
  return isValid
 }
//注册提交
async function handleRegister(){
  //1.先进行表单验证
  if(!validateForm()) return 
  //2.防止重复提交
  if(loading.value) return
  loading.value = true
  try{
    // 3. 调用Pinia的register方法
    const params: RegisterParams = {
      username: form.value.username.trim(),
      password: form.value.password.trim(),
    }
    await authStore.register(params)
  }finally{
    loading.value = false
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-container">
      <h1 class="logo">📝 DevBlog</h1>
      <h2 class="title">创建账号</h2>
      <p class="subtitle">注册即可开始写作</p>

      <!-- 用户名输入框 -->
      <div class="form-item">
        <input
          type="text"
          v-model="form.username"
          placeholder="👤 用户名（3-10字符）"
          class="form-input"
        />
        <span class="error-text" v-if="errors.username">{{ errors.username }}</span>
      </div>

      <!-- 密码输入框 -->
      <div class="form-item">
        <input
          type="password"
          v-model="form.password"
          placeholder="🔒 密码（6-12字符）"
          class="form-input"
        />
        <span class="error-text" v-if="errors.password">{{ errors.password }}</span>
      </div>

      <!-- 确认密码输入框 -->
      <div class="form-item">
        <input
          type="password"
          v-model="form.confirmPwd"
          placeholder="🔒 再次输入密码"
          class="form-input"
        />
        <span class="error-text" v-if="errors.confirmPwd">{{ errors.confirmPwd }}</span>
      </div>

      <!-- 注册按钮 -->
      <button
        class="register-btn"
        @click="handleRegister"
        :disabled="loading"
      >
        {{ loading ? '注册中...' : '注 册' }}
      </button>

      <!-- 登录跳转 -->
      <p class="login-link">
        已有账号？<router-link to="/login">立即登录</router-link>
      </p>
    </div>
  </div>
</template>


<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.register-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
}

.logo {
  font-size: 2rem;
  margin: 0 0 0.5rem;
}

.title {
  font-size: 1.5rem;
  margin: 0 0 0.3rem;
  color: #333;
}

.subtitle {
  color: #666;
  margin: 0 0 2rem;
}

.form-item {
  margin-bottom: 1.2rem;
  text-align: left;
}

.form-input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #4299e1;
}

.error-text {
  display: block;
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.3rem;
}

.register-btn {
  width: 100%;
  padding: 0.8rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.register-btn:disabled {
  background-color: #90cdf4;
  cursor: not-allowed;
}

.register-btn:hover:not(:disabled) {
  background-color: #3182ce;
}

.login-link {
  margin-top: 1.5rem;
  color: #666;
}

.login-link a {
  color: #4299e1;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>