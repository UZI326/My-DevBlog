
<template>
  <div class="article-card" @click="goToDetail">
    <!-- 封面图 -->
    <div class="card-cover" v-if="article.cover_url">
      <img :src="getFullImageUrl(article.cover_url)" alt="cover" />
    </div>
    <div class="card-cover placeholder" v-else></div>

    <!-- 分类 + 标签 -->
    <div class="card-meta">
      <span class="category-badge" v-if="article.category">
        {{ article.category.name }}
      </span>
      <div class="tag-list">
        <span class="tag" v-for="tag in article.tags" :key="tag.id">
          {{ tag.name }}
        </span>
      </div>
    </div>

    <!-- 标题 -->
    <h3 class="card-title">{{ article.title }}</h3>

    <!-- 摘要 -->
    <p class="card-summary">{{ article.summary }}</p>

    <!-- 底部信息 -->
    <div class="card-footer">
      <div class="author-date">
        <span>👤 {{ article.author_name }}</span>
        <span>📅 {{ formatDate(article.created_at) }}</span>
      </div>
      <div class="stats">
        <span>👁 {{ article.view_count }}</span>
        <span>👍 {{ article.like_count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {useRouter} from 'vue-router'
  import type {ArticleListItem} from '@/types/article'
  import { getFullImageUrl } from '@/utils/url'
  // 定义props，接收文章列表项数据
  interface Props {
    article: ArticleListItem
  }
  const props = defineProps<Props>()
  const router = useRouter()
  // 点击卡片跳转到文章详情页
  const goToDetail = () => {
    router.push(`/article/${props.article.id}`)
  } 
  //格式化日期 简化ISO字符串
  const formatDate = (dateStr: string)=>{
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN')
  }
</script>
<style scoped>
.article-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-cover {
  width: 100%;
  height: 200px;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  background: #f5f5f5;
  width: 100%;
  height: 200px;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.category-badge {
  background: var(--color-primary, #667eea);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.tag-list {
  display: flex;
  gap: 6px;
}

.tag {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  padding: 0 16px;
  margin: 0 0 8px;
  line-height: 1.4;
}

.card-summary {
  font-size: 14px;
  color: #666;
  padding: 0 16px;
  margin: 0 0 16px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  margin-top: auto;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
}

.author-date, .stats {
  display: flex;
  gap: 12px;
}
</style>