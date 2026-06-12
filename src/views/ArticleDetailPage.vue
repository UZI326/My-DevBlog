<template>
  <div class="article-detail-page">
    <div class="container">
      <!-- 加载态 -->
      <div class="loading" v-if="loading">加载中...</div>

      <!-- 文章不存在 -->
      <div class="not-found" v-else-if="!article">
        <h2>文章未找到</h2>
        <button class="back-btn" @click="goBack">返回首页</button>
      </div>

      <!-- 文章详情 -->
      <div class="article-content" v-else>
        <!-- 标题 -->
        <h1 class="article-title">{{ article.title }}</h1>

        <!-- 元信息 -->
        <div class="article-meta">
          <span>👤 {{ article.author_name }}</span>
          <span>📅 {{ formatDate(article.created_at) }}</span>
          <span v-if="article.category">📂 {{ article.category.name }}</span>
          <div class="tag-list">
            🏷
            <span v-for="tag in article.tags" :key="tag.id" class="tag">
              {{ tag.name }}
            </span>
          </div>
        </div>

        <hr class="divider" />

        <!-- 封面图 -->
        <div class="article-cover" v-if="article.cover_url">
          <img :src="getFullImageUrl(article.cover_url)" :alt="article.title" />
        </div>

        <!-- Markdown正文（v-html渲染，key 确保文章切换时全量重建DOM） -->
        <div
          class="article-body"
          v-html="renderedContent"
          :key="article?.id"
        ></div>

        <hr class="divider" />

        <!-- 点赞/评论 -->
        <div class="article-actions">
          <button class="action-btn">👍 点赞 ({{ article.like_count }})</button>
          <button class="action-btn">💬 评论 (0)</button>
        </div>

        <!-- 返回首页 -->
        <button class="back-btn" @click="goBack">← 返回首页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { marked } from 'marked'
import 'highlight.js/styles/github-dark.css'
import { getArticleDetailApi } from '@/api/article'
import type { ArticleDetail } from '@/types/article'
import { getFullImageUrl } from '@/utils/url'


const router = useRouter()
const route = useRoute()

// 状态
const article = ref<ArticleDetail | null>(null)
const loading = ref(true)

// 从路由参数获取文章ID
const articleId = Number(route.params.id)

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 渲染 Markdown 内容（marked@18 同步调用，无 { async: true } 始终返回 string）
const renderedContent = computed(() => {
  const content = article.value?.content ?? ''
  if (!content) return ''
  return marked.parse(content) as string
})

// 返回首页
const goBack = () => {
  router.push('/')
}

// 加载文章详情
const loadArticleDetail = async () => {
  loading.value = true
  try {
    const res = await getArticleDetailApi(articleId)
    if (res) {
      article.value = res
    } else {
      article.value = null
    }
  } catch (error) {
    console.error('加载文章详情失败：', error)
    article.value = null
  } finally {
    loading.value = false
  }
}
// 初始化加载
onMounted(() => {
  loadArticleDetail()
})
</script>

<style scoped>
.article-detail-page {
  padding: 20px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.loading, .not-found {
  text-align: center;
  padding: 40px 0;
  font-size: 16px;
  color: #666;
}

.article-title {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.4;
  margin: 0 0 20px;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
  color: #666;
  margin: 0 0 20px;
}

.tag-list {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tag {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.divider {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 20px 0;
}

.article-cover {
  width: 100%;
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
}

.article-cover img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.article-body {
  line-height: 1.8;
  font-size: 16px;
  color: #333;
  margin: 20px 0;
}

/* Markdown 样式适配 —— :deep() 穿透 v-html */
.article-body :deep(h2) {
  font-size: 24px;
  font-weight: 600;
  margin: 24px 0 12px;
}

.article-body :deep(h3) {
  font-size: 20px;
  font-weight: 600;
  margin: 20px 0 10px;
}

.article-body :deep(p) {
  margin: 12px 0;
}

.article-body :deep(ul) {
  margin: 12px 0;
  padding-left: 20px;
}

.article-body :deep(pre) {
  background: #1e1e1e;
  color: white;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 12px 0;
}

.article-body :deep(code) {
  font-family: 'Consolas', 'Monaco', monospace;
}

.article-body :deep(img) {
  max-width: 100%;
  border-radius: 4px;
}

.article-actions {
  display: flex;
  gap: 16px;
  margin: 20px 0;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.back-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #667eea;
  background: white;
  color: #667eea;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 20px 0;
}

.back-btn:hover {
  background: #667eea;
  color: white;
}
</style>