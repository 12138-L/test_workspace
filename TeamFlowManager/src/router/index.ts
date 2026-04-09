import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layouts/Layout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue'),
          meta: { title: '仪表板', icon: 'Dashboard' }
        },
        {
          path: 'team',
          name: 'Team',
          component: () => import('@/views/Team.vue'),
          meta: { title: '团队管理', icon: 'User' }
        },
        {
          path: 'projects',
          name: 'Projects',
          component: () => import('@/views/Projects.vue'),
          meta: { title: '项目管理', icon: 'Document' }
        },
        {
          path: 'tasks',
          name: 'Tasks',
          component: () => import('@/views/Tasks.vue'),
          meta: { title: '任务管理', icon: 'List' }
        },
        {
          path: 'calendar',
          name: 'Calendar',
          component: () => import('@/views/Calendar.vue'),
          meta: { title: '日历', icon: 'Calendar' }
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/views/Settings.vue'),
          meta: { title: '系统设置', icon: 'Setting' }
        }
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  let isAuthenticated = false

  try {
    const userStoreData = JSON.parse(localStorage.getItem('user-store') || '{}')
    isAuthenticated = !!userStoreData.state?.isAuthenticated
  } catch (e) {
    isAuthenticated = false
  }

  if (to.path === '/login') {
    if (isAuthenticated) {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    if (isAuthenticated) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
