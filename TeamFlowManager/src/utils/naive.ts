import { createDiscreteApi } from 'naive-ui'

const { message, dialog, notification, loadingBar } = createDiscreteApi(
  ['message', 'dialog', 'notification', 'loadingBar'],
  {
    configProviderProps: {
      tag: 'body'
    },
    messageProviderProps: {
      max: 3,
      placement: 'top',
      to: 'body',
      duration: 3000
    }
  }
)

export { message, dialog, notification, loadingBar }

export function setupNaiveDiscreteApi() {
  window.$message = message
  window.$dialog = dialog
  window.$notification = notification
  window.$loadingBar = loadingBar
}
