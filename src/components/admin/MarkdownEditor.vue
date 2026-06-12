<script setup lang="ts">
import { ref, watch } from 'vue'
import { marked } from 'marked'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const activeTab = ref<'edit' | 'preview'>('edit')
const renderedHtml = ref('')
const textareaRef = ref<HTMLTextAreaElement>()

// 延迟计算：watch + requestAnimationFrame 防止频繁解析阻塞输入
let rafId = 0
function scheduleRender(val: string) {
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    if (!val) {
      renderedHtml.value = ''
      return
    }
    // marked@18：无 { async: true } 时 parse() 始终同步返回 string
    renderedHtml.value = marked.parse(val) as string
  })
}

watch(() => props.modelValue, scheduleRender, { immediate: true })

function insertMarkdown(prefix: string, suffix: string = '') {
  const el = textareaRef.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const selected = props.modelValue.substring(start, end)
  const newText = props.modelValue.substring(0, start) + prefix + selected + suffix + props.modelValue.substring(end)
  emit('update:modelValue', newText)
  // 恢复光标到插入文本后
  setTimeout(() => {
    el.focus()
    el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length)
  }, 0)
}

function insertImage() {
  const url = prompt('请输入图片URL：')
  if (url) insertMarkdown('![image](' + url + ')')
}
</script>

<template>
  <div class="markdown-editor">
    <div class="editor-tabs">
      <button :class="{ active: activeTab === 'edit' }" @click="activeTab = 'edit'">编辑</button>
      <button :class="{ active: activeTab === 'preview' }" @click="activeTab = 'preview'">预览</button>
    </div>

    <div v-show="activeTab === 'edit'" class="editor-toolbar">
      <button @click="insertMarkdown('**', '**')" title="加粗">B</button>
      <button @click="insertMarkdown('*', '*')" title="斜体">I</button>
      <button @click="insertMarkdown('# ', '')" title="标题1">H1</button>
      <button @click="insertMarkdown('## ', '')" title="标题2">H2</button>
      <button @click="insertMarkdown('> ', '')" title="引用">"</button>
      <button @click="insertMarkdown('`', '`')" title="行内代码">&lt;/&gt;</button>
      <button @click="insertMarkdown('\n```\n', '\n```\n')" title="代码块">Code</button>
      <button @click="insertMarkdown('- ', '')" title="无序列表">•</button>
      <button @click="insertMarkdown('[', '](url)')" title="链接">🔗</button>
      <button @click="insertImage()" title="插入图片">🖼</button>
    </div>

    <div class="editor-content">
      <textarea
        v-show="activeTab === 'edit'"
        ref="textareaRef"
        :value="modelValue"
        @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        class="editor-textarea"
        placeholder="在此输入 Markdown 内容..."
      ></textarea>

      <div
        v-show="activeTab === 'preview'"
        class="editor-preview markdown-body"
        v-html="renderedHtml"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.markdown-editor {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.editor-tabs {
  display: flex;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.editor-tabs button {
  padding: 0.6rem 1.2rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.editor-tabs button.active {
  color: #4299e1;
  border-bottom-color: #4299e1;
  font-weight: 500;
}

.editor-toolbar {
  display: flex;
  gap: 0.3rem;
  padding: 0.5rem;
  background: #fafafa;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
}

.editor-toolbar button {
  padding: 0.3rem 0.6rem;
  border: 1px solid #ddd;
  border-radius: 3px;
  background: white;
  cursor: pointer;
  font-size: 0.8rem;
  color: #555;
  transition: all 0.15s;
}

.editor-toolbar button:hover {
  background: #4299e1;
  color: white;
  border-color: #4299e1;
}

.editor-textarea {
  width: 100%;
  min-height: 400px;
  padding: 1rem;
  border: none;
  outline: none;
  resize: vertical;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.7;
  color: #333;
}

.editor-preview {
  min-height: 400px;
  padding: 1rem;
}

/* ===== Markdown 渲染样式：:deep() 穿透 v-html ===== */
.markdown-body :deep(h1) { font-size: 1.8rem; margin: 0.8em 0 0.4em; }
.markdown-body :deep(h2) { font-size: 1.5rem; margin: 0.6em 0 0.3em; }
.markdown-body :deep(h3) { font-size: 1.2rem; margin: 0.4em 0 0.2em; }
.markdown-body :deep(p) { margin: 0.5em 0; line-height: 1.7; }
.markdown-body :deep(code) { background: #f0f0f0; padding: 0.15em 0.4em; border-radius: 3px; font-size: 0.9em; }
.markdown-body :deep(pre) { background: #282c34; color: #abb2bf; padding: 1rem; border-radius: 6px; overflow-x: auto; }
.markdown-body :deep(pre) code { background: none; padding: 0; }
.markdown-body :deep(blockquote) { border-left: 3px solid #4299e1; padding-left: 1rem; color: #666; margin: 0.5em 0; }
.markdown-body :deep(img) { max-width: 100%; border-radius: 4px; }
.markdown-body :deep(ul),
.markdown-body :deep(ol) { padding-left: 1.5em; margin: 0.5em 0; }
</style>
