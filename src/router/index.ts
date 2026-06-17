//路由配置
import {createRouter, createWebHistory} from 'vue-router'
import { useAuthStore } from '@/stores/auth.ts'

const routes = [
  {
    path: '/',
    name: 'home',
    component: ()=>import ('@/views/HomePage.vue'),
    meta: { title: '首页' },
  },
  {
    path:'/login',
    name: 'login',
    component: ()=>import ('@/views/LoginPage.vue'),
    meta: { guest: true ,title: '登录' }, // 仅未登录可访问

  },
  {
    path:'/register',
    name: 'register',
    component: ()=> import('@/views/RegisterPage.vue'),
    meta: { guest: true , title: '注册'}, //标记为游客专属页
  },
  {
    path: '/article/:id',
    name: 'article-detail',
    component: () => import('@/views/ArticleDetailPage.vue'),
    props: true, // 将路由参数作为组件 props 传递
    meta: { title: '' },  // 动态设置，在组件内覆盖
  },
  // ✅ 合并后的嵌套路由（删除了重复的/admin定义）
  {
    path: '/admin',
    component: () => import('@/views/AdminPage.vue'),
    meta: { requiresAuth: true , title: '后台管理'}, // 需登录才能访问
    children: [
      {
        path: '',
        name: 'admin-articles',
        component: () => import('@/components/admin/ArticleTable.vue'),
        meta: { title: '文章管理' }, // 子路由可单独设置
      },
      {
        path: 'edit/:id?',  // ✅ :id? 问号表示可选参数
        name: 'admin-edit',
        component: () => import('@/views/ArticleEditorPage.vue'),
        props: true,
        meta: { title: '编辑文章' },
      },
    ]
  },
  {
    path:'/search',
    name:'search',
    component:()=>import('@/views/SearchResultPage.vue'),
    meta: { title: '搜索' },
  },
  {
    path:'/user/:id?',  // :id? 可选 → 不传就是自己的主页
    name:'user-profile',
    component: () => import('@/views/UserProfilePage.vue'),
    props: true,
    meta: { title: '用户主页' },
  },
  {
    path: '/profile/:id?', // :id? 代表参数可选
    name: 'profile',
    component: () => import('@/views/UserProfilePage.vue'),
    meta: { title: '个人资料' },
  },
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('@/views/ForbiddenPage.vue'),
    meta: { title: '无权限访问' },
  },
  //404路由 兜底路由
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundPage.vue'),
    meta: { title: '页面未找到' },
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
   // ===== NEW：滚动行为 =====
  scrollBehavior(_to, _from, savedPosition) {
    // 浏览器前进/后退 → 恢复上次位置
    if (savedPosition) {
      return savedPosition
    }
    // 正常导航 → 滚到顶部
    return { top: 0 }
  },
})
// ===== NEW：动态标题 =====
router.afterEach((to) => {
  const baseTitle = 'DevBlog'
  // 从路由 meta 取标题，没有就用页面名
  const pageTitle = (to.meta.title as string) || ''
  document.title = pageTitle ? `${pageTitle} - ${baseTitle}` : baseTitle
})


// 路由守卫：惰性获取Auth Store（避免Pinia未挂载）
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  
  // 1. 需登录但未登录 → 跳登录页（带来源路径）
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next({
      name: 'login',
      query: { returnUrl: to.fullPath }
    })
  }
  // 2. 游客页但已登录 → 跳首页
  if (to.meta.guest && auth.isLoggedIn) {
    return next({ name: 'home' })
  }
  // 3. 角色权限检查
  if (to.meta.requiredRoles && !auth.hasRoles(to.meta.requiredRoles)) {
    return next({ name: 'forbidden' })
  }
  next()
})

export default router