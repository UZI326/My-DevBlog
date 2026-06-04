//路由配置
import {createRouter, createWebHistory} from 'vue-router'
import { useAuthStore } from '@/stores/auth.ts'
const routes = [
  {
    path: '/',
    name: 'name',
    component: ()=>import ('@/views/HomePage.vue'),
  },
  {
    path:'/login',
    name: 'login',
    component: ()=>import ('@/views/LoginPage.vue'),
     meta: { guest: true }, // 仅未登录可访问
  },
  {
    path:'/register',
    name: 'register',
    component: ()=> import('@/views/RegisterPage.vue'),
     meta: { guest: true }, //标记为游客专属页
  },
  {
    path: '/article/:id',
    name: 'article-detail',
    component: () => import('@/views/ArticleDetailPage.vue'),
    props: true, // 将路由参数作为组件 props 传递
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminPage.vue'),
    meta: { requiresAuth: true }, // 需登录才能访问
  },
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('@/views/ForbiddenPage.vue'),
  },
  //404路由 兜底路由
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundPage.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
// 路由守卫：惰性获取Auth Store（避免Pinia未挂载）
// 全局守卫（同步执行，无需 async）
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore() // ✅ 直接调用，无时序风险
  // 1. 需登录但未登录 → 跳登录页（带来源路径）
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next({
      name: 'login',
      query: { returnUrl: to.fullPath } // 保留来源路径
    })
  }
  // 2. 游客页但已登录 → 跳首页
  if (to.meta.guest && auth.isLoggedIn) {
    return next({ name: 'name' })
  }
  // 3. 角色权限检查（生产级增强）
  if (to.meta.requiredRoles && !auth.hasRoles(to.meta.requiredRoles)) {
    return next({ name: 'forbidden' }) // 跳转 403 页面
  }
  next()
})
export default router