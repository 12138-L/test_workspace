import { defineStore } from 'pinia'
import type { AppConfig } from '@/types'
import { appStateRepo } from '@/db/repository'

const defaults: AppConfig = {
  sidebarCollapsed: false
}

export const useAppStore = defineStore('app', {
  state: (): AppConfig => ({ ...defaults }),

  getters: {
    sidebarWidth: state => (state.sidebarCollapsed ? '64px' : '200px')
  },

  actions: {
    async loadFromStorage() {
      const records = await appStateRepo.getAll()
      if (records.length === 0) return

      records.forEach(record => {
        if (record.key === 'sidebar') {
          this.sidebarCollapsed = record.sidebarCollapsed ?? false
        }
      })
    },

    async saveToStorage() {
      const records = await appStateRepo.getAll()
      const existing = records.find(r => r.key === 'sidebar')
      const data = { key: 'sidebar', sidebarCollapsed: this.sidebarCollapsed }

      if (existing) {
        await appStateRepo.update(existing.id!, data)
      } else {
        await appStateRepo.create(data)
      }
    },

    async toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
      await this.saveToStorage()
    },

    async setSidebarCollapsed(collapsed: boolean) {
      this.sidebarCollapsed = collapsed
      await this.saveToStorage()
    }
  }
})
