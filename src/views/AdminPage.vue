<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const currentPath = computed(() => route.path)
</script>

<template>
  <div class="admin-layout">
    <!-- 侧边导航 -->
    <aside class="admin-sidebar">
      <div class="sidebar-title">后台管理</div>
      <nav class="sidebar-nav">
        <router-link to="/admin" exact-active-class="active" class="nav-item">
          📄 文章管理
        </router-link>
        <router-link to="/admin/edit" active-class="active" class="nav-item">
          ✏️ 写文章
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <router-link to="/" class="back-link">← 返回前台</router-link>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="admin-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
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
}

.back-link:hover { color: white; }

.admin-content {
  flex: 1;
  background: #f7fafc;
  overflow-y: auto;
}
</style>