<template>
  <div class="home-page">
    <!-- Hero横幅 -->
    <HeroBanner />
     <div class="home-header">
      <h1>DevBlog</h1>
      <p>一个开发者博客</p>
      <SearchBar />
    </div>
    <!-- 分类筛选栏 -->
    <div class="filter-bar">
      <button
        class="filter-btn"
        :class="{ active: articleStore.currentFilter === 'all' }"
        @click="articleStore.setFilter('all')"
      >
        全部
      </button>
      <button
        class="filter-btn"
        :class="{ active: articleStore.currentFilter === category.slug }"
        @click="articleStore.setFilter(category.slug)"
        v-for="category in articleStore.categories"
        :key="category.id"
      >
        {{ category.name }}
      </button>
    </div>

    <!-- 文章列表 -->
    <div id="article-list" class="article-list">
      <!-- 加载态 -->
      <div class="loading" v-if="articleStore.loading">加载中...</div>

      <!-- 错误态 -->
      <ErrorState v-else-if="articleStore.loadError" message="加载文章失败，请稍后重试" @retry="articleStore.fetchArticles()" />

      <!-- 空状态 -->
      <div class="empty" v-else-if="articleStore.articles.length === 0">
        暂无文章
      </div>

      <!-- 文章卡片网格 -->
      <div class="card-grid" v-else>
        <ArticleCard
          v-for="article in articleStore.articles"
          :key="article.id"
          :article="article"
        />
      </div>
    </div>

    <!-- 分页器 -->
    <div class="pagination" v-if="articleStore.total > 0 && !articleStore.loading">
      <button
        class="page-btn"
        @click="articleStore.setPage(articleStore.currentPage - 1)"
        :disabled="articleStore.currentPage === 1"
      >
        ← 上一页
      </button>
      <span class="page-info">
        {{ articleStore.currentPage }} / {{articleStore.totalPages }}
      </span>
      <button
        class="page-btn"
        @click="articleStore.setPage(articleStore.currentPage + 1)"
        :disabled="articleStore.currentPage >= articleStore.totalPages"
      >
        下一页 →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useArticleStore } from '@/stores/article'
import HeroBanner from '@/components/common/HeroBanner.vue'
import ArticleCard from '@/components/common/ArticleCard.vue'
import SearchBar from '@/components/common/SearchBar.vue' // <--- 添加这行
import ErrorState from '@/components/common/ErrorState.vue'
const articleStore = useArticleStore()

// 初始化加载数据
onMounted(async () => {
  await articleStore.fetchCategories()
  await articleStore.fetchArticles()
})
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  padding: 20px 0;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.filter-btn:hover:not(.active) {
  border-color: #667eea;
  color: #667eea;
}

.article-list {
  margin: 20px 0;
}

.loading, .empty {
  text-align: center;
  padding: 40px 0;
  font-size: 16px;
  color: #666;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px 0 40px;
}

.page-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: white;
  cursor: pointer;
}

.page-btn:disabled {
  cursor: not-allowed;
  color: #ccc;
  border-color: #eee;
}

.page-info {
  font-size: 14px;
  color: #666;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
}
</style>