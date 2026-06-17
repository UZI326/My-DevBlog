<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 退出后台，返回前台首页
const goBackToFront = () => {
  // 可以在这里添加离开后台前的逻辑，比如保存草稿、断开特定连接等
  router.push('/')
}
</script>

<template>
  <div class="admin-layout">
    <!-- 侧边导航 -->
    <aside class="admin-sidebar">
      <div class="sidebar-title">后台管理</div>
      <nav class="sidebar-nav">
        <!-- 
          修复点 1：同时指定 active-class 和 exact-active-class
          当路径是 /admin 时，添加 exact-active (高亮)
          当路径是 /admin/xxx 时，添加普通的 active (这里我们设为空字符串，防止父菜单被错误高亮)
        -->
        <router-link 
          to="/admin" 
          active-class="" 
          exact-active-class="active" 
          class="nav-item"
        >
          📄 文章管理
        </router-link>

        <!-- 
          写文章/编辑文章：只要是 /admin/edit 开头的路径都高亮 
        -->
        <router-link 
          to="/admin/edit" 
          active-class="active" 
          class="nav-item"
        >
          ✏️ 写文章
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <!-- 修复点 2：改用普通标签 + 编程式导航，语义更清晰 -->
        <a href="javascript:void(0)" class="back-link" @click="goBackToFront">
          ← 返回前台
        </a>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="admin-content">
      <!-- 添加过渡动画，让后台页面切换更丝滑（可选） -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
/* ... 你原来的 CSS 保持不变 ... */
.admin-layout {
  display: flex;
  min-height: calc(100vh - 60px); /* 假设顶部有 60px 的 Header */
}

.admin-sidebar {
  width: 220px;
  background: #2d3748;
  color: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-title {
  padding: 1.5rem 1.2rem 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 1px solid #4a5568;
}

.sidebar-nav {
  flex: 1;
  padding: 0.8rem 0;
}

.nav-item {
  display: block;
  padding: 0.7rem 1.2rem;
  color: #cbd5e0;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.15s;
}

.nav-item:hover {
  color: white;
  background: #4a5568;
}

.nav-item.active {
  color: white;
  background: #4299e1;
}

.sidebar-footer {
  padding: 1rem 1.2rem;
  border-top: 1px solid #4a5568;
}

.back-link {
  color: #a0aec0;
  text-decoration: none;
  font-size: 0.85rem;
  cursor: pointer; /* 增加鼠标手型 */
}

.back-link:hover { color: white; }

.admin-content {
  flex: 1;
  background: #f7fafc;
  overflow-y: auto;
  padding: 20px; /* 建议给主内容区加个内边距 */
}

/* 新增：简单的页面切换淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>