<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const keyword = ref('')

function search() {
  const q = keyword.value.trim()
  if (!q) return
  router.push({ name: 'search', query: { q } })
  keyword.value = ''
}

function onEnter(e: KeyboardEvent) {
  if (e.key === 'Enter') search()
}
</script>

<template>
  <div class="search-bar">
    <input
      v-model="keyword"
      type="text"
      placeholder="搜索文章..."
      class="search-input"
      @keydown="onEnter"
    />
    <button class="search-btn" @click="search">
      🔍
    </button>
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  overflow: hidden;
  width: 260px;
  transition: border-color 0.2s;
}

.search-bar:focus-within {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66,153,225,0.1);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0.5rem 0.8rem;
  font-size: 0.85rem;
  background: transparent;
}

.search-btn {
  border: none;
  background: none;
  cursor: pointer;
  padding: 0.5rem 0.7rem;
  font-size: 0.9rem;
}

.search-btn:hover { background: #f3f4f6; }
</style>
