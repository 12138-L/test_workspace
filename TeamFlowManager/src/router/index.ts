import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layouts/Layout.vue'
import { useUserStore } from '@/stores'
import { generateRoutes } from '@/config/menu'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: generateRoutes() as RouteRecordRaw[]
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { title: '登录' }
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()

  document.title = `${to.meta.title || '页面'} - TeamFlow Manager`

  if (to.path === '/login') {
    if (userStore.isAuthenticated) {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    if (userStore.isAuthenticated) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
