<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
// ✅ 1. 导入 SearchBar 组件
import SearchBar from '@/components/common/SearchBar.vue'

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

// 跳转写文章
function goWrite() {
  dropdownOpen.value = false
  router.push('/admin/edit')
}

// 跳转个人中心
function goProfile() {
  dropdownOpen.value = false
  router.push('/user')
}
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- ✅ 2. 左侧：Logo -->
      <div class="header-left">
        <router-link to="/" class="logo">📝 DevBlog</router-link>
      </div>

      <!-- ✅ 3. 中间：搜索栏 (占据剩余空间) -->
      <div class="header-center">
        <SearchBar />
      </div>

      <!-- ✅ 4. 右侧：导航与用户操作区 -->
      <div class="header-right">
        <!-- 已登录状态 -->
        <template v-if="authStore.isLoggedIn">
          <!-- 后台入口链接 -->
          <router-link to="/admin" class="nav-link admin-link" active-class="active">
            后台
          </router-link>

          <!-- 用户头像/名称区域 -->
          <div class="user-menu" @click="dropdownOpen = !dropdownOpen">
            <div class="user-info">
              <!-- 如果有头像则显示头像，否则显示默认占位符 -->
              <img
                :src="authStore.user?.user_pic || '/default-avatar.png'"
                alt="avatar"
                class="user-avatar"
              />
              <span class="user-name">{{ authStore.user?.nickname || authStore.username }}</span>
              <span class="arrow">▾</span>
            </div>

            <!-- 下拉菜单 -->
            <div v-show="dropdownOpen" class="dropdown-menu">
              <div class="dropdown-item" @click="goWrite">✏️ 写文章</div>
              <div class="dropdown-item" @click="goProfile">👤 个人中心</div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item danger" @click="handleLogout">🚪 退出登录</div>
            </div>
          </div>
        </template>

        <!-- 未登录状态 -->
        <template v-else>
          <div class="guest-actions">
            <router-link to="/login" class="auth-btn">登录</router-link>
            <router-link to="/register" class="auth-btn primary">注册</router-link>
          </div>
        </template>
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
  height: 64px; /* 稍微增加高度以容纳搜索框 */
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem; /* 左右区块之间的间距 */
}

/* --- 左侧 Logo --- */
.header-left {
  flex-shrink: 0; /* 防止被压缩 */
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
  text-decoration: none;
  white-space: nowrap;
}

/* --- 中间 搜索栏 --- */
.header-center {
  flex-grow: 1; /* 占据中间所有剩余空间 */
  max-width: 500px; /* 限制最大宽度，避免在大屏上太宽 */
  margin: 0 auto; /* 居中显示 */
}

/* --- 右侧 用户区 --- */
.header-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.active {
  color: #4299e1;
}

/* 用户信息容器 */
.user-menu {
  position: relative;
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  transition: background 0.2s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #eee;
}

.user-name {
  font-size: 0.9rem;
  color: #333;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow {
  font-size: 0.8rem;
  color: #999;
}

/* 下拉菜单样式 */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 160px;
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 101;
  overflow: hidden;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-item:hover {
  background-color: #f8fafc;
  color: #4299e1;
}

.dropdown-divider {
  height: 1px;
  background-color: #f0f0f0;
  margin: 0.2rem 0;
}

.dropdown-item.danger {
  color: #e53e3e;
}

.dropdown-item.danger:hover {
  background-color: #fff5f5;
  color: #e53e3e;
}

/* 未登录按钮组 */
.guest-actions {
  display: flex;
  gap: 0.8rem;
}

.auth-btn {
  padding: 0.4rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s;
  color: #666;
}

.auth-btn.primary {
  background-color: #4299e1;
  color: white;
}

.auth-btn.primary:hover {
  background-color: #3182ce;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .header-center {
    display: none; /* 移动端隐藏搜索栏或改为图标点击展开 */
  }
  .user-name {
    display: none; /* 移动端只显示头像 */
  }
}
</style>