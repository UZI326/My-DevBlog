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
        <button
          :class="['action-btn', 'like-btn', { liked }]"
          :disabled="likeLoading"
          @click="handleLike"
        >
          {{ liked ? '❤️' : '🤍' }} {{ article?.like_count || 0 }}
        </button>
      </div>
      <!-- 评论区 -->
      <CommentList v-if="article" :article-id="article.id" />

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
import CommentList from '@/components/article/CommentList.vue'
import { toggleLikeApi, getLikeStatusApi } from '@/api/article'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/toast'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToast()

// 点赞
const liked = ref(false)
const likeLoading = ref(false)


// 状态
const article = ref<ArticleDetail | null>(null)
const loading = ref(true)

async function checkLikeStatus(){
  if (!auth.isLoggedIn || !article.value) return
  try {
    const res = await getLikeStatusApi(article.value.id)
    liked.value = res.liked
  } catch { /* ignore */ }
}

async function handleLike() {
  if (!auth.isLoggedIn) {
    toast.info('请先登录后再点赞')
    return
  }
  if (!article.value) return

  likeLoading.value = true
  try {
    const res = await toggleLikeApi(article.value.id)
    liked.value = res.liked
    article.value.like_count += res.liked ? 1 : -1
  } catch (e: any) {
    toast.error(e.message || '操作失败')
  } finally {
    likeLoading.value = false
  }
}

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
onMounted(async () => {
  await loadArticleDetail()
  checkLikeStatus()
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

/* 1. 操作区容器：改为 Flex 居中布局 */
.article-actions {
  display: flex;
  justify-content: center; /* 核心：水平居中 */
  align-items: center;
  margin: 3rem 0 2rem;     /* 增加上下间距，与评论区拉开距离 */
}

/* 2. 点赞按钮样式：胶囊形状 + 交互反馈 */
.like-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;                /* Emoji 和数字之间的间距 */
  padding: 8px 24px;       /* 左右宽一点，更像胶囊 */
  border: 1px solid #e5e7eb;
  border-radius: 9999px;   /* 核心：圆角设为最大值形成胶囊状 */
  background: white;
  color: #374151;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 悬停效果 */
.like-btn:hover:not(:disabled) {
  border-color: #fca5a5;
  color: #ef4444;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.1);
}

/* 已点赞状态 (高亮) */
.like-btn.liked {
  border-color: #fca5a5;
  background: #fef2f2;     /* 浅红背景 */
  color: #ef4444;          /* 红色文字 */
}

/* 禁用状态 (加载中) */
.like-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 3. 评论区组件的顶部间距微调 */
:deep(.comment-list) {
  margin-top: 1rem;
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
  display: block;           /* 让返回按钮也独占一行居中 */
  margin-left: auto;
  margin-right: auto;
}

.back-btn:hover {
  background: #667eea;
  color: white;
}
</style>