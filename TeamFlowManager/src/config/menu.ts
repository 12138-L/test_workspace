import { h } from 'vue'
import type { MenuOption } from 'naive-ui'
import type { RouteRecordRaw } from 'vue-router'
import { Icons, type IconName } from './icons'

export interface MenuConfig {
  path: string
  name: string
  title: string
  icon: IconName
  component: RouteRecordRaw['component']
}

export const menuConfig: MenuConfig[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    title: '仪表板',
    icon: 'dashboard',
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/team',
    name: 'Team',
    title: '团队管理',
    icon: 'team',
    component: () => import('@/views/Team.vue')
  },
  {
    path: '/projects',
    name: 'Projects',
    title: '项目管理',
    icon: 'project',
    component: () => import('@/views/Projects.vue')
  },
  {
    path: '/tasks',
    name: 'Tasks',
    title: '任务管理',
    icon: 'task',
    component: () => import('@/views/Tasks.vue')
  },
  {
    path: '/calendar',
    name: 'Calendar',
    title: '日历',
    icon: 'calendar',
    component: () => import('@/views/Calendar.vue')
  },
  {
    path: '/files',
    name: 'Files',
    title: '文件管理',
    icon: 'file',
    component: () => import('@/views/Files.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    title: '系统设置',
    icon: 'settings',
    component: () => import('@/views/Settings.vue')
  }
]

export function generateMenuOptions(handleClick: (_path: string) => void): MenuOption[] {
  return menuConfig.map(item => ({
    label: () =>
      h(
        'div',
        {
          onClick: () => handleClick(item.path),
          style: { width: '100%' }
        },
        item.title
      ),
    key: item.path,
    icon: () =>
      h('span', {
        innerHTML: Icons[item.icon],
        style: {
          display: 'flex',
          width: '18px',
          height: '18px'
        }
      })
  }))
}

export function generateRoutes() {
  return menuConfig.map(item => ({
    path: item.path.slice(1),
    name: item.name,
    component: item.component,
    meta: { title: item.title }
  }))
}
