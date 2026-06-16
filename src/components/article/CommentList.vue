<script setup lang="ts">
import { ref } from 'vue'
import { getCommentsApi, postCommentApi, deleteCommentApi } from '@/api/comment'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/toast'
import type { CommentItem } from '@/types/article'

const props = defineProps<{ articleId: number }>()
const auth = useAuthStore()
const toast = useToast()

const comments = ref<CommentItem[]>([])
const total = ref(0)
const loading = ref(false)
const pagenum = ref(1)
const pagesize = 10

async function loadComments() {
  loading.value = true
  try {
    const res = await getCommentsApi({ article_id: props.articleId, pagenum: pagenum.value, pagesize })
    comments.value = res.items
    total.value = res.total
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

// 发表评论
const newComment = ref('')
const submitting = ref(false)
async function submitComment() {
  const content = newComment.value.trim()
  if (!content) return
  submitting.value = true
  try {
    await postCommentApi({ article_id: props.articleId, content })
    newComment.value = ''
    toast.success('评论发表成功')
    pagenum.value = 1
    await loadComments()
  } catch (e: any) {
    toast.error(e.message || '评论失败')
  } finally {
    submitting.value = false
  }
}

// 删除评论
async function handleDelete(commentId: number) {
  if (!confirm('确定删除此评论？')) return
  try {
    await deleteCommentApi(commentId)
    toast.success('评论已删除')
    await loadComments()
  } catch (e: any) {
    toast.error(e.message || '删除失败')
  }
}

// 判断是否可以删除
function canDelete(comment: CommentItem): boolean {
  if (!auth.user) return false
  return auth.user.id === comment.user_id || auth.user.role === 'admin'
}

// 初始化
loadComments()

defineExpose({ loadComments })
</script>

<template>
  <div class="comment-section">
    <h3>评论 ({{ total }})</h3>

    <!-- 评论输入框（需登录） -->
    <div v-if="auth.isLoggedIn" class="comment-form">
      <textarea
        v-model="newComment"
        placeholder="写下你的评论..."
        rows="3"
        class="comment-textarea"
      ></textarea>
      <button
        class="comment-submit"
        :disabled="submitting || !newComment.trim()"
        @click="submitComment"
      >
        {{ submitting ? '发表中...' : '发表评论' }}
      </button>
    </div>
    <div v-else class="comment-login-hint">
      <router-link to="/login">登录</router-link> 后参与评论
    </div>

    <!-- 评论列表 -->
    <div v-if="loading" class="comment-loading">加载中...</div>
    <div v-else-if="comments.length === 0" class="comment-empty">暂无评论，来说两句吧</div>
    <ul v-else class="comment-list">
      <li v-for="c in comments" :key="c.id" class="comment-item">
        <div class="comment-avatar">
          <img :src="c.avatar || '/default-avatar.png'" :alt="c.username" />
        </div>
        <div class="comment-body">
          <div class="comment-head">
            <span class="comment-user">{{ c.nickname || c.username }}</span>
            <span class="comment-time">{{ new Date(c.created_at).toLocaleDateString('zh-CN') }}</span>
          </div>
          <p class="comment-content">{{ c.content }}</p>
          <button
            v-if="canDelete(c)"
            class="comment-delete"
            @click="handleDelete(c.id)"
          >删除</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.comment-section { margin-top: 2.5rem; border-top: 1px solid #eee; padding-top: 2rem; }
.comment-section h3 { font-size: 1.1rem; margin-bottom: 1rem; }

.comment-form { margin-bottom: 1.5rem; }
.comment-textarea {
  width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 6px;
  resize: vertical; font-size: 0.9rem; outline: none; box-sizing: border-box;
}
.comment-textarea:focus { border-color: #4299e1; }
.comment-submit {
  margin-top: 0.5rem; padding: 0.5rem 1.5rem; border: none; border-radius: 4px;
  background: #4299e1; color: white; cursor: pointer; font-size: 0.9rem;
}
.comment-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.comment-login-hint { color: #999; font-size: 0.9rem; margin-bottom: 1rem; }
.comment-login-hint a { color: #4299e1; }

.comment-loading, .comment-empty { text-align: center; color: #999; padding: 2rem; font-size: 0.9rem; }

.comment-list { list-style: none; padding: 0; margin: 0; }
.comment-item { display: flex; gap: 0.8rem; padding: 1rem 0; border-bottom: 1px solid #f5f5f5; }
.comment-avatar img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
.comment-body { flex: 1; }
.comment-head { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem; }
.comment-user { font-weight: 500; font-size: 0.85rem; color: #333; }
.comment-time { font-size: 0.75rem; color: #aaa; }
.comment-content { font-size: 0.9rem; color: #444; line-height: 1.6; margin: 0; }
.comment-delete {
  margin-top: 0.3rem; padding: 0; border: none; background: none;
  color: #e53e3e; cursor: pointer; font-size: 0.75rem;
}
.comment-delete:hover { text-decoration: underline; }
</style>
