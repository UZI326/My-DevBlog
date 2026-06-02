import {createApp} from 'vue'
import {createPinia} from 'pinia'
import App from'./App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'
// 导入全局样式
import '@/assets/styles/global.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)  //先挂载 Pinia → 初始化所有 Store
app.use(router)   // 再挂载 Router → 确保守卫执行时 Store 已就绪

// 3. 恢复登录会话（必须在Pinia挂载后）
const authStore = useAuthStore()
authStore.restoreSession()

app.mount('#app')