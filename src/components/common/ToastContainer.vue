<script setup lang="ts">
import { useToast } from '@/stores/toast'
const { toasts } = useToast()
</script>
<template>
  <!-- ✅ 核心：Teleport 把组件挂载到 body，避免被父组件遮挡 -->
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div v-for="t in toasts" :key="t.id" :class="['toast-item', 'toast-' + t.type]">
          <span>{{ t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️' }}</span>
          <span>{{ t.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-size: 0.9rem;
  max-width: 380px;
}

.toast-success { background: #f0fdf4; border: 1px solid #86efac; color: #166534; }
.toast-error   { background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; }
.toast-info    { background: #eff6ff; border: 1px solid #93c5fd; color: #1e40af; }
.toast-warning { background: #fffbeb; border: 1px solid #fcd34d; color: #92400e; }

.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(60px); }
.toast-leave-to     { opacity: 0; transform: translateX(60px); }
</style>


