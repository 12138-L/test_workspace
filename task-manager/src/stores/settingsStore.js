import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAllItems, addItem, updateItem, STORES } from '../utils/database'
import { toPlainObject } from '../utils/encryption'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref({
    theme: 'light',
    language: 'zh-CN',
    weekStart: 1,
    reminderEnabled: true,
    reminderSound: true,
    reminderPopup: true,
    autoBackup: false,
    autoBackupInterval: 7,
    lastBackupDate: null,
    dataVersion: '1.0.0'
  })

  async function initialize() {
    try {
      const savedSettings = await getAllItems(STORES.SETTINGS)
      savedSettings.forEach(item => {
        if (settings.value.hasOwnProperty(item.key)) {
          settings.value[item.key] = item.value
        }
      })
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  async function updateSetting(key, value) {
    if (!settings.value.hasOwnProperty(key)) return false
    
    settings.value[key] = value
    
    await updateItem(STORES.SETTINGS, { key, value: toPlainObject(value) })
    return true
  }

  async function updateSettings(newSettings) {
    for (const [key, value] of Object.entries(newSettings)) {
      await updateSetting(key, value)
    }
  }

  function getSetting(key) {
    return settings.value[key]
  }

  return {
    settings,
    initialize,
    updateSetting,
    updateSettings,
    getSetting
  }
})
