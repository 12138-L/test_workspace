import { defineStore } from 'pinia'
import { settingsRepo } from '@/db/repository'

interface SettingsState {
  basic: {
    systemName: string
    language: string
    timezone: string
  }
  notification: {
    email: boolean
    inApp: boolean
    taskReminder: boolean
    projectUpdate: boolean
  }
  security: {
    twoFactorAuth: boolean
    sessionTimeout: string
    passwordStrength: string
  }
}

const defaults: SettingsState = {
  basic: {
    systemName: 'TeamFlow Manager',
    language: 'zh-CN',
    timezone: 'UTC+8'
  },
  notification: {
    email: true,
    inApp: true,
    taskReminder: true,
    projectUpdate: true
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: '60',
    passwordStrength: 'medium'
  }
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({ ...defaults }),

  actions: {
    async loadFromStorage() {
      const records = await settingsRepo.getAll()
      if (records.length === 0) return

      records.forEach(record => {
        if (record.type === 'basic') {
          this.basic = { ...this.basic, ...record }
        } else if (record.type === 'notification') {
          this.notification = { ...this.notification, ...record }
        } else if (record.type === 'security') {
          this.security = { ...this.security, ...record }
        }
      })
    },

    async saveByType(type: 'basic' | 'notification' | 'security', data: any) {
      const records = await settingsRepo.getAll()
      const existing = records.find(r => r.type === type)
      const saveData = { ...data, type }

      if (existing) {
        await settingsRepo.update(existing.id!, saveData)
      } else {
        await settingsRepo.create(saveData)
      }
    },

    async updateBasic(settings: Partial<SettingsState['basic']>) {
      this.basic = { ...this.basic, ...settings }
      await this.saveByType('basic', this.basic)
    },

    async updateNotification(settings: Partial<SettingsState['notification']>) {
      this.notification = { ...this.notification, ...settings }
      await this.saveByType('notification', this.notification)
    },

    async updateSecurity(settings: Partial<SettingsState['security']>) {
      this.security = { ...this.security, ...settings }
      await this.saveByType('security', this.security)
    },

    async resetAll() {
      this.$patch({ ...defaults })
      await Promise.all([
        this.saveByType('basic', this.basic),
        this.saveByType('notification', this.notification),
        this.saveByType('security', this.security)
      ])
    }
  }
})
