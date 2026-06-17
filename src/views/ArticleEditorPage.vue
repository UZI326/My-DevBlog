<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownEditor from '@/components/admin/MarkdownEditor.vue'
import { createArticleApi, updateArticleApi } from '@/api/admin'
import { getArticleDetailApi } from '@/api/article'
import { getCategoriesApi } from '@/api/article'
import { getTagsApi } from '@/api/admin'
import { uploadImageApi } from '@/api/upload'
import { useToast } from '@/stores/toast'
import type { ArticleFormData } from '@/types/article'
import type { Category, Tag } from '@/types/article'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// 是否是编辑模式（有 :id 就是编辑）
const editId = computed(() => {
  const id = parseInt(route.params.id as string)
  return isNaN(id) ? null : id
})
const isEdit = computed(() => editId.value !== null)
const pageTitle = computed(() => isEdit.value ? '编辑文章' : '写文章')

// 表单数据
const form = reactive<ArticleFormData>({
  title: '',
  content: '',
  summary: '',
  cover_url: '',
  category_id: null,
  tag_ids: [],
  is_published: 1,
})

// 加载状态
const saving = ref(false)
const loading = ref(false)
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])

// ========== 表单校验（NEW） ==========
const errors = reactive({
  title: '',
  content: '',
  category_id: '',
})

function validateForm(): boolean {
  // 重置
  errors.title = ''
  errors.content = ''
  errors.category_id = ''

  let valid = true

  if (!form.title.trim()) {
    errors.title = '文章标题不能为空'
    valid = false
  } else if (form.title.length > 100) {
    errors.title = '标题不能超过100个字符'
    valid = false
  }

  if (!form.content.trim()) {
    errors.content = '文章内容不能为空'
    valid = false
  }

  if (!form.category_id) {
    errors.category_id = '请选择分类'
    valid = false
  }

  if (!valid) {
    toast.warning('请填写必填项')
  }
  return valid
}

// 输入时清除对应字段的错误
function clearError(field: keyof typeof errors) {
  errors[field] = ''
}

// 页面初始化
onMounted(async () => {
  // 并行加载分类和标签，用 allSettled 防止任一接口失败导致整页白屏
  const [catResult, tagResult] = await Promise.allSettled([getCategoriesApi(), getTagsApi()])
  categories.value = catResult.status === 'fulfilled' ? catResult.value : []
  tags.value = tagResult.status === 'fulfilled' ? tagResult.value : []

  // 编辑模式：加载文章数据
  if (editId.value) {
    loading.value = true
    try {
      const article = await getArticleDetailApi(editId.value)
      form.title = article.title
      form.content = article.content
      form.summary = article.summary || ''
      form.cover_url = article.cover_url || ''
      form.category_id = (article as any).category_id || article.category?.id || null
      form.tag_ids = article.tags?.map(t => t.id) || []
      form.is_published = article.is_published ? 1 : 0
    } finally {
      loading.value = false
    }
  }
})

// 标签选择（toggle 多选）
function toggleTag(tagId: number) {
  const idx = form.tag_ids.indexOf(tagId)
  if (idx > -1) {
    form.tag_ids.splice(idx, 1)
  } else {
    form.tag_ids.push(tagId)
  }
}

// 图片上传处理
const uploading = ref(false)
async function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const result = await uploadImageApi(file)
    // 把图片链接插入到编辑器内容末尾
    form.content += '\n![图片](' + result.url + ')'
  } catch (err: any) {
    toast.error('图片上传失败：' + err.message)
  } finally {
    uploading.value = false
  }
}

// 保存文章
async function handleSave(publish: boolean) {
  // 防止快速双击重复提交
  if (saving.value) return

  // 【替换】原来三行 toast 校验 → 一行调用
  if (!validateForm()) return

  form.is_published = publish ? 1 : 0
  saving.value = true
  try {
    if (isEdit.value) {
      await updateArticleApi(editId.value!, form)
      toast.success('更新成功')
    } else {
      await createArticleApi(form)
      toast.success('发布成功')
    }
    // 延迟跳转，给Toast足够展示时间
    await new Promise(r => setTimeout(r, 600))
    router.push('/admin')
  } catch (err: any) {
    toast.error('保存失败：' + err.message)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="article-editor">
    <!-- 加载中 -->
    <div v-if="loading" class="loading-state">加载文章数据...</div>

    <template v-else>
      <!-- 页面标题 -->
      <div class="editor-header">
        <h2>{{ pageTitle }}</h2>
        <div class="header-actions">
          <button class="btn-draft" :disabled="saving" @click="handleSave(false)">存草稿</button>
          <button class="btn-publish" :disabled="saving" @click="handleSave(true)">
            {{ saving ? '保存中...' : (isEdit ? '更新文章' : '发布文章') }}
          </button>
        </div>
      </div>

      <!-- 表单 -->
      <div class="editor-form">
        <!-- 标题 -->
        <div class="form-group" :class="{ 'has-error': errors.title }">
          <label>文章标题 <span class="required">*</span></label>
          <input
            v-model="form.title"
            type="text"
            class="input-title"
            placeholder="输入文章标题..."
            @input="clearError('title')"
          />
          <p v-if="errors.title" class="field-error">{{ errors.title }}</p>
        </div>

        <!-- 摘要 -->
        <div class="form-group">
          <label>文章摘要（可选）</label>
          <input
            v-model="form.summary"
            type="text"
            class="input-summary"
            placeholder="简短描述文章内容..."
          />
        </div>

        <!-- 封面图 URL -->
        <div class="form-group">
          <label>封面图URL（可选）</label>
          <div class="cover-row">
            <input
              v-model="form.cover_url"
              type="text"
              class="input-cover"
              placeholder="https://..."
            />
            <img v-if="form.cover_url" :src="form.cover_url" class="cover-preview" />
          </div>
        </div>

        <!-- 分类 -->
        <div class="form-group" :class="{ 'has-error': errors.category_id }">
          <label>分类 <span class="required">*</span></label>
          <select
            v-model.number="form.category_id"
            class="select-category"
            @change="clearError('category_id')"
          >
            <option :value="null" disabled>请选择分类</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
          <p v-if="errors.category_id" class="field-error">{{ errors.category_id }}</p>
        </div>

        <!-- 标签选择（多选） -->
        <div class="form-group">
          <label>标签</label>
          <div class="tag-list">
            <button
              v-for="tag in tags"
              :key="tag.id"
              :class="['tag-btn', { selected: form.tag_ids.includes(tag.id) }]"
              @click="toggleTag(tag.id)"
            >{{ tag.name }}</button>
          </div>
        </div>

        <!-- Markdown 编辑器 -->
        <div class="form-group" :class="{ 'has-error': errors.content }">
          <div class="editor-label-row">
            <label>文章内容（Markdown） <span class="required">*</span></label>
            <label class="upload-btn">
              {{ uploading ? '上传中...' : '📎 上传图片' }}
              <input type="file" accept="image/*" hidden @change="handleImageUpload" />
            </label>
          </div>
          <MarkdownEditor v-model="form.content" @update:model-value="clearError('content')" />
          <p v-if="errors.content" class="field-error">{{ errors.content }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.article-editor {
  padding: 1.5rem;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.editor-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-draft {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-publish {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #4299e1;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-draft:disabled, .btn-publish:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.editor-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #666;
}

.input-title {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.input-summary, .input-cover {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.cover-row {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.cover-preview {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #eee;
}

.select-category {
  width: 200px;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  font-size: 0.85rem;
}

.tag-btn.selected {
  background: #4299e1;
  color: white;
  border-color: #4299e1;
}

.editor-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-btn {
  cursor: pointer;
  color: #4299e1;
  font-size: 0.9rem;
  padding: 0.3rem 0.6rem;
  border: 1px dashed #4299e1;
  border-radius: 4px;
}

/* ===== 表单校验样式 ===== */
.required {
  color: #e53e3e;
  margin-left: 2px;
}

.has-error .input-title,
.has-error .select-category,
.has-error :deep(.markdown-editor) {
  border-color: #e53e3e;
}

.field-error {
  color: #e53e3e;
  font-size: 0.8rem;
  margin: 0.3rem 0 0;
}
</style>