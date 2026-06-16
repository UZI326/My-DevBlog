<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/toast'
import { getUserProfileApi, updateProfileApi } from '@/api/user'

const route = useRoute()
const auth = useAuthStore()
const toast = useToast()

//确定显示的用户 ID 和是否为主人
const userId = computed(() => {
  // 如果路由有 :id 就显示他人主页，否则显示自己主页
  const id = parseInt(route.params.id as string)
  return isNaN(id) ? null : id
})

// 【修复】isOwner 判定逻辑：
// 原逻辑 `!userId.value` 将「路由无:id参数（null）」误判为「非本人」，
// 修正为：userId===null 表示无目标用户 → 视为访问本人主页 → isOwner=true
const isOwner = computed(() => {
  if (!auth.user) return false
  // 无路由:id参数 → 目标即当前登录用户 → 本人主页
  if (userId.value === null) return true
  // 有数字id → 对比路由id与当前登录用户id
  return auth.user.id === userId.value
})

// 用户数据
const profile = ref<any>(null)
const loading = ref(true)

// 编辑模式
const editing = ref(false) //是否处于编辑模式
const editForm = ref({ nickname: '', email: '', user_pic: '' })  //编辑表单绑定的数据
const saving = ref(false)    //保存中状态 防止重复提交保存中...

//加载用户资料函数 loadProfile
async function loadProfile() {
  loading.value = true
  try {
    if (userId.value) {
      profile.value = await getUserProfileApi(userId.value)
    } else if (auth.user) {
      profile.value = await getUserProfileApi(auth.user.id)
    }
  } finally {
    loading.value = false
  }
}

function startEdit() {
  if (!profile.value) return
  editForm.value = {
    nickname: profile.value.nickname || '',
    email: profile.value.email || '',
    user_pic: profile.value.user_pic || '',
  }
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

async function saveProfile() {
  saving.value = true
  try {
    await updateProfileApi(editForm.value)
    toast.success('资料已更新')
    editing.value = false
    await loadProfile()
  } catch (e: any) {
    toast.error(e.message || '更新失败')
  } finally {
    saving.value = false
  }
}

onMounted(loadProfile)
</script>

<template>
  <div class="profile-page">
    <!-- 调试信息：验证 isOwner 计算是否正常 -->

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="!profile" class="empty">用户不存在</div>

    <template v-else>
      <!-- 头像和基本信息 -->
      <div class="profile-header">
        <img
          :src="profile.user_pic || '/default-avatar.png'"
          :alt="profile.username"
          class="profile-avatar"
        />
        <div class="profile-info">
          <h2>{{ profile.nickname || profile.username }}</h2>
          <p class="username">@{{ profile.username }}</p>
          <p class="email" v-if="profile.email">{{ profile.email }}</p>
          <div class="profile-stats">
            <span>📄 {{ profile.article_count || 0 }} 篇文章</span>
            <span>💬 {{ profile.comment_count || 0 }} 条评论</span>
          </div>
          <p class="join-date">加入于 {{ new Date(profile.created_at).toLocaleDateString('zh-CN') }}</p>
        </div>

        <!-- 编辑按钮（仅自己的主页） -->
        <button v-if="isOwner && !editing" class="btn-edit" @click="startEdit">
          编辑资料
        </button>
      </div>

      <!-- 编辑表单（仅自己的主页） -->
      <div v-if="isOwner && editing" class="edit-form">
        <h3>编辑个人资料</h3>
        <div class="form-group">
          <label>昵称</label>
          <input v-model="editForm.nickname" type="text" />
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <input v-model="editForm.email" type="email" />
        </div>
        <div class="form-group">
          <label>头像URL</label>
          <input v-model="editForm.user_pic" type="text" placeholder="https://..." />
        </div>
        <div class="form-actions">
          <button class="btn-save" :disabled="saving" @click="saveProfile">
            {{ saving ? '保存中...' : '保存' }}
          </button>
          <button class="btn-cancel" @click="cancelEdit">取消</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.profile-page { max-width: 700px; margin: 0 auto; padding: 2rem 1rem; }
.loading, .empty { text-align: center; padding: 3rem; color: #999; }

.profile-header { display: flex; align-items: flex-start; gap: 1.5rem; position: relative; }
.profile-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #f0f0f0; }
.profile-info { flex: 1; }
.profile-info h2 { margin: 0; font-size: 1.4rem; }
.username { color: #999; font-size: 0.9rem; margin: 0.2rem 0; }
.email { color: #666; font-size: 0.85rem; margin: 0.2rem 0; }
.profile-stats { display: flex; gap: 1.5rem; margin: 0.8rem 0; font-size: 0.85rem; color: #555; }
.join-date { color: #aaa; font-size: 0.8rem; }

.btn-edit {
  padding: 0.5rem 1rem; border: 1px solid #4299e1; border-radius: 4px;
  background: white; color: #4299e1; cursor: pointer; font-size: 0.85rem;
  position: absolute; right: 0; top: 0;
}
.btn-edit:hover { background: #ebf8ff; }

.edit-form { margin-top: 2rem; padding: 1.5rem; background: #fafafa; border-radius: 8px; }
.edit-form h3 { margin-top: 0; font-size: 1.1rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.3rem; font-weight: 500; font-size: 0.85rem; }
.form-group input {
  width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 4px;
  font-size: 0.9rem; outline: none; box-sizing: border-box;
}
.form-group input:focus { border-color: #4299e1; }
.form-actions { display: flex; gap: 0.5rem; }
.btn-save {
  padding: 0.5rem 1.5rem; border: none; border-radius: 4px;
  background: #4299e1; color: white; cursor: pointer;
}
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-cancel {
  padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 4px;
  background: white; cursor: pointer;
}
</style>
