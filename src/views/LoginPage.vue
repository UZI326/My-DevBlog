<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 标题区域 -->
      <div class="login-header">
        <h1 class="login-title">DevBlog</h1>
        <p class="login-subtitle">欢迎回来 👋</p>
        <p class="login-desc">登录你的账号，继续创作</p>
      </div>

      <!-- 表单区域 -->
      <form class="login-form" @submit.prevent="handleLogin">
        <!-- 用户名输入框 -->
        <div class="form-item">
          <label class="form-label">
            <span class="icon">👤</span>
            <input
              v-model="form.username"
              type="text"
              class="form-input"
              placeholder="请输入用户名"
              @blur="validateUsername"
            />
          </label>
          <p class="error-text" v-if="errors.username">{{ errors.username }}</p>
        </div>

        <!-- 密码输入框（显示/隐藏） -->
        <div class="form-item">
          <label class="form-label">
            <span class="icon">🔒</span>
            <input
              v-model="form.password"
              :type="showPwd ? 'text' : 'password'"
              class="form-input"
              placeholder="请输入密码"
              @blur="validatePassword"
            />
            <span class="pwd-toggle" @click="showPwd = !showPwd">
              {{ showPwd ? '隐藏' : '显示' }}
            </span>
          </label>
          <p class="error-text" v-if="errors.password">{{ errors.password }}</p>
        </div>

        <!-- 登录按钮 -->
        <button
          type="submit"
          class="login-btn"
          :disabled="isLoading"
        >
          <span v-if="isLoading">登录中...</span>
          <span v-else>登 录</span>
        </button>
      </form>

      <!-- 注册跳转 -->
      <div class="login-footer">
        还没有账号？<router-link to="/register" class="register-link">立即注册</router-link>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue';
import { api } from '@/api/request';
import type { LoginParams, LoginResult } from '@/types/api';
import { storage } from '@/utils/storage';

// 表单数据
const form = reactive<LoginParams>({
  username: '',
  password: '',
});

// 状态管理
const showPwd = ref(false); // 密码显示/隐藏
const isLoading = ref(false); // 登录按钮 loading 加载状态指示器 
const errors = reactive<Record<string, string>>({
  username: '',
  password: '',
});
//用户名校验 
const validateUsername = ()=>{
  if(!form.username.trim()){
    errors.username = '用户名不能为空'
  }else if(form.username.length<3||form.username.length>10){
    errors.username = '用户名需要为3-10个字符'
  }else{
    errors.username = ''
  }
}
//密码校验
const validatePassword = ()=>{
   if(!form.password.trim()){
    errors.password = '密码不能为空'
   }else if(form.password.length<6 || form.password.length >12){
     errors.password = '密码需要为6-12个字符'
   }else{
    errors.password = ''
   }
}
// 登录提交
const handleLogin = async () => {
  // 先执行校验
  validateUsername()
  validatePassword()
  // 有错误则终止
  if(errors.username || errors.password) return
  
  try {
    isLoading.value = true
    // 模拟延迟（后端未就绪时用）
    await new Promise(resolve => setTimeout(resolve,800))
    
    // 调用登录接口（类型自动推导）
    const result = await api.post<LoginParams,LoginResult>(
      '/auth/login',
      form
    )
    
    
    // 登录成功：存储 token 和用户信息   核心目的：持久化数据（Persist Data）
   storage.set('token',result.token)
   storage.set('userInfo',{
    id: result.id,
    username: result.username,
    user_pic: result.user_pic
   })

    // 跳转到首页
    alert('登录成功!')
    window.location.href = '/'
    
  } catch (error) {
    // 捕获错误并提示
    if (error instanceof Error) {
      alert(`登录失败：${error.message}`);
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* 全局容器：居中 + 背景色 */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg);
  padding: 0 16px;
}

/* 登录卡片：响应式 */
.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px 32px;
  background: #fff;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}

/* 标题区域 */
.login-header {
  text-align: center;
  margin-bottom: 32px;
}
.login-title {
  font-size: 24px;
  color: var(--color-primary);
  margin: 0 0 8px;
}
.login-subtitle {
  font-size: 18px;
  color: var(--color-text);
  margin: 0 0 4px;
}
.login-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

/* 表单样式 */
.login-form {
  margin-bottom: 24px;
}
.form-item {
  margin-bottom: 20px;
  position: relative;
}
.form-label {
  display: flex;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0 12px;
  transition: border-color 0.2s;
}
.form-label:focus-within {
  border-color: var(--color-primary);
}
.icon {
  font-size: 16px;
  margin-right: 8px;
  color: var(--color-text-secondary);
}
.form-input {
  flex: 1;
  height: 44px;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--color-text);
}
.form-input::placeholder {
  color: var(--color-text-secondary);
}
.pwd-toggle {
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px;
}
.error-text {
  margin: 4px 0 0;
  font-size: 12px;
  color: #f56c6c;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 44px;
  background-color: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.login-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

/* 底部跳转 */
.login-footer {
  text-align: center;
  font-size: 14px;
  color: var(--color-text-secondary);
}
.register-link {
  color: var(--color-primary);
  text-decoration: none;
  margin-left: 4px;
}
.register-link:hover {
  text-decoration: underline;
}
</style>