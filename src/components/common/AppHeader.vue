<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
const authStore = useAuthStore()
const router = useRouter()

// 下拉菜单显隐
const dropdownOpen = ref(false)

// 退出登录处理
function handleLogout() {
  authStore.logout()
  dropdownOpen.value = false
  router.push('/login')
}
//下拉菜单新增一个跳转写文章的方法
function goWrite(){
  dropdownOpen.value = false
  router.push('/admin/edit')
}
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- Logo -->
      <router-link to="/" class="logo">📝 DevBlog</router-link>

      <!-- 导航链接 -->
      <nav class="nav-links">
        <router-link to="/" class="nav-link" active-class="active">首页</router-link>
        <!-- 已登录显示后台入口 -->
        <router-link 
          v-if="authStore.isLoggedIn" 
          to="/admin" 
          class="nav-link" 
          active-class="active"
        >
          后台
        </router-link>
      </nav>

      <!-- 登录态控制 -->
      <div class="auth-actions">
        <!-- 未登录：登录/注册 -->
        <div v-if="!authStore.isLoggedIn" class="guest-actions">
          <router-link to="/login" class="auth-btn">登录</router-link>
          <router-link to="/register" class="auth-btn primary">注册</router-link>
        </div>

        <!-- 已登录：用户名 + 下拉菜单 -->
        <div v-else class="user-menu" @click="dropdownOpen = !dropdownOpen">
          <span class="user-name">👤 {{ authStore.username }} ▾</span>
          <!-- 下拉菜单 -->
          <div v-show="dropdownOpen" class="dropdown-menu">
            <div class="dropdown-item" @click="goWrite">写文章</div>
            <div class="dropdown-item" @click="dropdownOpen = false">个人中心</div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item danger" @click="handleLogout">退出登录</div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: white;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: #666;
  text-decoration: none;
  padding: 0.5rem 0;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.active {
  color: #4299e1;
  border-bottom: 2px solid #4299e1;
}

.auth-actions {
  display: flex;
  align-items: center;
}

.guest-actions {
  display: flex;
  gap: 1rem;
}

.auth-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.auth-btn:not(.primary) {
  color: #666;
}

.auth-btn.primary {
  background-color: #4299e1;
  color: white;
}

.auth-btn:hover:not(.primary) {
  color: #4299e1;
}

.auth-btn.primary:hover {
  background-color: #3182ce;
}

/* 已登录用户菜单 */
.user-menu {
  position: relative;
  cursor: pointer;
  color: #333;
  padding: 0.5rem 1rem;
}

.user-name {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 150px;
  background: white;
  border: 1px solid #eee;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 101;
  margin-top: 0.5rem;
}

.dropdown-item {
  padding: 0.7rem 1rem;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-divider {
  height: 1px;
  background-color: #eee;
  margin: 0.3rem 0;
}

.dropdown-item.danger {
  color: #e53e3e;
}

.dropdown-item.danger:hover {
  background-color: #fef2f2;
}
</style>