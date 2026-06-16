<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { searchArticlesApi } from '@/api/article'
import type { ArticleListItem } from '@/types/article'
import ArticleCard from '@/components/common/ArticleCard.vue'

const route = useRoute()
const articles = ref<ArticleListItem[]>([])
const total = ref(0)
const loading = ref(false)
const pagenum = ref(1)
const pagesize = 10

async function loadResults() {
  const q = route.query.q as string
  if (!q) return

  loading.value = true
  try {
    const res = await searchArticlesApi({ q, pagenum: pagenum.value, pagesize })
    articles.value = res.items
    total.value = res.total
  } catch (e: any) {
    articles.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 监听路由 query 变化重新搜索
watch(() => route.query.q, (newQ) => {
  if (newQ) {
    pagenum.value = 1
    loadResults()
  }
}, { immediate: true })

function changePage(page: number) {
  pagenum.value = page
  loadResults()
}
</script>

<template>
  <div class="search-page">
    <div class="search-header">
      <h2>搜索结果：<em>{{ route.query.q }}</em></h2>
      <span class="result-count" v-if="!loading">共 {{ total }} 篇文章</span>
    </div>

    <div v-if="loading" class="loading">搜索中...</div>

    <template v-else>
      <div v-if="articles.length === 0" class="empty">
        <p>未找到相关文章</p>
        <p class="hint">试试其他关键词？</p>
      </div>

      <div v-else class="article-grid">
        <ArticleCard v-for="a in articles" :key="a.id" :article="a" />
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="total > pagesize">
        <button :disabled="pagenum <= 1" @click="changePage(pagenum - 1)">上一页</button>
        <span>{{ pagenum }} / {{ Math.ceil(total / pagesize) }}</span>
        <button :disabled="pagenum >= Math.ceil(total / pagesize)" @click="changePage(pagenum + 1)">下一页</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.search-page { max-width: 800px; margin: 0 auto; padding: 2rem 1rem; }
.search-header { margin-bottom: 1.5rem; }
.search-header h2 { font-size: 1.3rem; font-weight: 500; }
.search-header h2 em { color: #4299e1; font-style: normal; }
.result-count { color: #999; font-size: 0.85rem; }
.loading, .empty { text-align: center; padding: 3rem; color: #999; }
.hint { font-size: 0.85rem; color: #bbb; }
.article-grid { display: flex; flex-direction: column; gap: 1rem; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; }
.pagination button { padding: 0.4rem 0.8rem; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer; }
.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
