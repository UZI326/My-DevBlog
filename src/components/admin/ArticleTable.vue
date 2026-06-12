<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { AdminArticleItem } from '@/types/article'
import { getAdminArticlesApi, deleteArticleApi } from '@/api/admin'

const router = useRouter()

const articles = ref<AdminArticleItem[]>([])
const loading = ref(false)
const total = ref(0)
const pagenum = ref(1)
const pagesize = ref(10)

async function fetchArticles() {
  loading.value = true
  try {
    const data = await getAdminArticlesApi({ pagenum: pagenum.value, pagesize: pagesize.value })
    articles.value = data.items
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  pagenum.value = page
  fetchArticles()
}

function handleEdit(id: number) {
  router.push('/admin/edit/' + id)
}

async function handleDelete(id: number) {
  try {
    await deleteArticleApi(id)
    fetchArticles()
  } catch (e: any) {
    alert('删除失败：' + e.message)
  }
}

// 删除确认
const deleteTarget = ref<number | null>(null)

function confirmDelete(id: number) {
  deleteTarget.value = id
}

function cancelDelete() {
  deleteTarget.value = null
}

function doDelete(id: number) {
  handleDelete(id)
  deleteTarget.value = null
}

function totalPages(total: number, pagesize: number): number {
  return Math.ceil(total / pagesize) || 1
}

onMounted(() => {
  fetchArticles()
})
</script>

<template>
  <div class="article-table-container">
    <div v-if="loading" class="table-loading">加载中...</div>

    <div v-else-if="articles.length === 0" class="table-empty">
      <p>还没有文章</p>
      <router-link to="/admin/edit" class="create-link">写第一篇文章 →</router-link>
    </div>

    <template v-else>
      <table class="article-table">
        <thead>
          <tr>
            <th style="width: 40%">标题</th>
            <th>分类</th>
            <th>状态</th>
            <th>阅读</th>
            <th>更新日期</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in articles" :key="article.id">
            <td class="title-cell">
              <router-link :to="'/article/' + article.id">{{ article.title }}</router-link>
            </td>
            <td>{{ article.category_name }}</td>
            <td>
              <span :class="article.is_published ? 'status-pub' : 'status-draft'">
                {{ article.is_published ? '已发布' : '草稿' }}
              </span>
            </td>
            <td>{{ article.view_count }}</td>
            <td>{{ new Date(article.updated_at).toLocaleDateString('zh-CN') }}</td>
            <td class="action-cell">
              <button class="btn-edit" @click="handleEdit(article.id)">编辑</button>
              <button
                v-if="deleteTarget !== article.id"
                class="btn-delete"
                @click="confirmDelete(article.id)"
              >删除</button>
              <span v-else class="confirm-group">
                <button class="btn-confirm-yes" @click="doDelete(article.id)">确认</button>
                <button class="btn-confirm-no" @click="cancelDelete">取消</button>
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="table-pagination" v-if="total > pagesize">
        <button
          :disabled="pagenum <= 1"
          @click="handlePageChange(pagenum - 1)"
        >上一页</button>
        <span>{{ pagenum }} / {{ totalPages(total, pagesize) }}</span>
        <button
          :disabled="pagenum >= totalPages(total, pagesize)"
          @click="handlePageChange(pagenum + 1)"
        >下一页</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.article-table-container {
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.table-loading, .table-empty {
  padding: 3rem;
  text-align: center;
  color: #999;
}

.article-table {
  width: 100%;
  border-collapse: collapse;
}

.article-table th,
.article-table td {
  padding: 0.8rem 1rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.article-table th {
  background: #fafafa;
  font-weight: 500;
  color: #666;
  font-size: 0.85rem;
}

.title-cell a {
  color: #333;
  text-decoration: none;
}

.title-cell a:hover {
  color: #4299e1;
}

.status-pub {
  color: #38a169;
  font-size: 0.8rem;
}

.status-draft {
  color: #a0aec0;
  font-size: 0.8rem;
}

.action-cell {
  white-space: nowrap;
}

.btn-edit {
  padding: 0.3rem 0.7rem;
  border: 1px solid #4299e1;
  border-radius: 3px;
  background: white;
  color: #4299e1;
  cursor: pointer;
  margin-right: 0.4rem;
  font-size: 0.8rem;
}

.btn-edit:hover { background: #ebf8ff; }

.btn-delete {
  padding: 0.3rem 0.7rem;
  border: 1px solid #e53e3e;
  border-radius: 3px;
  background: white;
  color: #e53e3e;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-delete:hover { background: #fef2f2; }

.confirm-group {
  display: inline-flex;
  gap: 0.3rem;
}

.btn-confirm-yes {
  padding: 0.3rem 0.5rem;
  border: none;
  border-radius: 3px;
  background: #e53e3e;
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-confirm-no {
  padding: 0.3rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 3px;
  background: white;
  cursor: pointer;
  font-size: 0.8rem;
}

.table-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
}

.table-pagination button {
  padding: 0.4rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.table-pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
