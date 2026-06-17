<script setup lang="ts">
defineProps<{
  message?: string
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="error-state">
    <div class="error-icon">⚠️</div>
    <p class="error-msg">{{ message || '加载失败，请稍后重试' }}</p>
    <button class="error-retry" @click="emit('retry')">重新加载</button>
  </div>
</template>

<style scoped>
.error-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #999;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.error-msg {
  font-size: 0.9rem;
  margin: 0 0 1rem;
  color: #666;
}

.error-retry {
  padding: 0.5rem 1.5rem;
  border: 1px solid #4299e1;
  border-radius: 4px;
  background: white;
  color: #4299e1;
  cursor: pointer;
  font-size: 0.85rem;
}

.error-retry:hover {
  background: #ebf8ff;
}
</style>