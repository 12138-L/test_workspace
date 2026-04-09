import { defineStore } from 'pinia'
import type { AppConfig } from '@/types'

export const useAppStore = defineStore('app', {
  state: (): AppConfig => ({
    sidebarCollapsed: false
  }),

  getters: {
    sidebarWidth: state => (state.sidebarCollapsed ? '64px' : '200px')
  },

  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    setSidebarCollapsed(collapsed: boolean) {
      this.sidebarCollapsed = collapsed
    }
  },

  persist: true
})
