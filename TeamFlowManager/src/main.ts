import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/tailwind.css'
import './styles/icons.css'
import { setupNaiveDiscreteApi } from './utils/naive'
import { initDatabase } from './db'
import { useUserStore, useSettingsStore, useAppStore } from './stores'

async function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  try {
    await initDatabase()

    const userStore = useUserStore()
    const settingsStore = useSettingsStore()
    const appStore = useAppStore()

    await Promise.all([
      userStore.loadFromStorage(),
      settingsStore.loadFromStorage(),
      appStore.loadFromStorage()
    ])
  } catch (e) {
    console.warn('DB init failed, using fallback:', e)
  }

  app.mount('#app')
  setupNaiveDiscreteApi()
}

bootstrap()
