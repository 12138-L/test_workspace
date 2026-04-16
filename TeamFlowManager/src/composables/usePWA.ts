import { ref, onMounted } from 'vue'
import { message, dialog } from '@/utils/naive'
import { logger } from '@/utils/logger'

export function usePWA() {
  const deferredPrompt = ref<any>(null)
  const isInstallable = ref(false)
  const isInstalled = ref(false)
  const isServiceWorkerReady = ref(false)

  onMounted(() => {
    logger.info('[PWA] Initializing PWA module')

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(registration => {
          isServiceWorkerReady.value = true
          logger.info('[PWA] Service Worker ready:', registration.scope)
        })
        .catch(err => {
          logger.warn('[PWA] Service Worker not ready:', err)
        })
    } else {
      logger.warn('[PWA] Service Worker not supported in this browser')
    }

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      logger.info('[PWA] ✅ beforeinstallprompt event fired!')
      e.preventDefault()
      deferredPrompt.value = e
      isInstallable.value = true
      logger.info('[PWA] App is installable!')
      setTimeout(() => showInstallPrompt(), 2000)
    })

    window.addEventListener('appinstalled', () => {
      isInstalled.value = true
      isInstallable.value = false
      deferredPrompt.value = null
      message.success('应用已成功安装！')
      logger.info('[PWA] App installed successfully')
    })

    if (window.matchMedia('(display-mode: standalone)').matches) {
      isInstalled.value = true
      logger.info('[PWA] Running in standalone mode (PWA)')
    }

    setTimeout(() => {
      if (!isInstallable.value && !isInstalled.value) {
        logger.info('[PWA] 💡 Install hint: Browser decides when to prompt')
        logger.info('[PWA]    - Check if running on HTTPS/localhost')
        logger.info('[PWA]    - Check if manifest.json is valid')
        logger.info('[PWA]    - User may have previously dismissed')
        logger.info('[PWA]    - Chrome: Use "Install" icon in address bar')
      }
    }, 5000)
  })

  function showInstallPrompt() {
    if (!isInstallable.value || isInstalled.value) return

    dialog.info({
      title: '安装应用',
      content: 'TeamFlowManager 可以安装为桌面应用，获得更好的使用体验。\n\n💡 提示：也可以点击浏览器地址栏的安装图标。',
      positiveText: '立即安装',
      negativeText: '稍后再说',
      onPositiveClick: async () => {
        await triggerInstall()
      }
    })
  }

  async function triggerInstall() {
    if (!deferredPrompt.value) {
      message.info('安装提示由浏览器控制。请点击地址栏安装图标，或刷新页面后重试。')
      return
    }

    deferredPrompt.value.prompt()

    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') {
      logger.info('[PWA] User accepted the install prompt')
    } else {
      logger.info('[PWA] User dismissed the install prompt')
    }

    deferredPrompt.value = null
    isInstallable.value = false
  }

  return {
    isInstallable,
    isInstalled,
    isServiceWorkerReady,
    triggerInstall,
    showInstallPrompt
  }
}
