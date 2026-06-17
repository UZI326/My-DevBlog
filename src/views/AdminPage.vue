<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 移动端侧边栏开关
const sidebarOpen = ref(false)

function closeSidebar() {
  sidebarOpen.value = false
}

function goBackToFront() {
  router.push('/')
}
</script>

<template>
  <div class="admin-layout">
    <!-- ====== 手机端遮罩 ====== -->
    <div
      v-show="sidebarOpen"
      class="sidebar-overlay"
      @click="closeSidebar"
    ></div>

    <!-- ====== 侧边导航 ====== -->
    <aside :class="['admin-sidebar', { open: sidebarOpen }]">
      <div class="sidebar-title">后台管理</div>
      <nav class="sidebar-nav">
        <router-link
          to="/admin"
          active-class=""
          exact-active-class="active"
          class="nav-item"
          @click="closeSidebar"
        >
          📄 文章管理
        </router-link>
        <router-link
          to="/admin/edit"
          active-class="active"
          class="nav-item"
          @click="closeSidebar"
        >
          ✏️ 写文章
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <a href="javascript:void(0)" class="back-link" @click="goBackToFront">
          ← 返回前台
        </a>
      </div>
    </aside>

    <!-- ====== 主内容区 ====== -->
    <main class="admin-content">
      <!-- 汉堡按钮（仅手机端显示） -->
      <button class="hamburger-btn" @click="sidebarOpen = !sidebarOpen">
        {{ sidebarOpen ? '✕' : '☰' }}
      </button>

      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
/* ===== PC 端：侧边栏常驻 ===== */
.admin-layout {
  display: flex;
  min-height: calc(100vh - 60px);
}

.admin-sidebar {
  width: 220px;
  background: #2d3748;
  color: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: transform 0.25s ease;
  z-index: 100;
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
  cursor: pointer;
}

.back-link:hover { color: white; }

/* ===== 汉堡按钮（默认隐藏） ===== */
.hamburger-btn {
  display: none;
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 200;
  width: 38px;
  height: 38px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* ===== 内容区 ===== */
.admin-content {
  flex: 1;
  background: #f7fafc;
  overflow-y: auto;
  padding: 20px;
}

/* ===== 淡入淡出 ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ========================================
   手机端（≤768px）
   ======================================== */
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  /* 侧边栏：固定在左侧，默认滑出屏幕 */
  .admin-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 240px;
    transform: translateX(-100%);
  }

  .admin-sidebar.open {
    transform: translateX(0);
  }

  /* 遮罩层 */
  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 99;
  }

  /* 汉堡按钮：显示 */
  .hamburger-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* 内容区：占满屏幕，去掉固定 padding */
  .admin-content {
    padding: 12px;
    padding-top: 56px; /* 给汉堡按钮留空间 */
    min-height: 100vh;
  }
}
</style>