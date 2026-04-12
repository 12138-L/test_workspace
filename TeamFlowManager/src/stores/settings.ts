import { defineStore } from 'pinia'

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

export const useSettingsStore = defineStore('settings', {
  persist: {
    key: 'settings-store'
  },

  state: (): SettingsState => ({
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
  }),

  actions: {
    updateBasic(settings: Partial<SettingsState['basic']>) {
      this.basic = { ...this.basic, ...settings }
    },

    updateNotification(settings: Partial<SettingsState['notification']>) {
      this.notification = { ...this.notification, ...settings }
    },

    updateSecurity(settings: Partial<SettingsState['security']>) {
      this.security = { ...this.security, ...settings }
    },

    resetAll() {
      this.$reset()
    }
  }
})
