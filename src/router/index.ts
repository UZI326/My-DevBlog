//路由配置
import {createRouter, createWebHistory} from 'vue-router'

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
    component: ()=> import('@/views/LoginPage.vue'),
     meta: { guest: true },
  },
  //404路由
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundPage.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router