import type { App, ComponentPublicInstance } from 'vue'
import { logger } from './logger'
import { message, dialog } from './naive'

interface ErrorContext {
  component?: string
  props?: Record<string, unknown>
  emits?: string[]
  lifecycleHook?: string
}

export function setupErrorHandler(app: App): void {
  app.config.errorHandler = (
    err: unknown,
    instance: ComponentPublicInstance | null,
    info: string
  ) => {
    const context: ErrorContext = {
      lifecycleHook: info
    }

    if (instance) {
      context.component = instance.$options.name || 'UnknownComponent'
      context.props = instance.$props as Record<string, unknown>
    }

    logger.error('[Vue Error]', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      ...context
    })

    if (import.meta.env.DEV) {
      console.group('🔴 Vue Error Handler')
      console.error('Error:', err)
      console.error('Context:', context)
      console.groupEnd()
    }

    if (err instanceof Error && !err.message.includes('Network')) {
      message.error('应用发生错误，请刷新页面重试')
    }
  }

  app.config.warnHandler = (
    msg: string,
    instance: ComponentPublicInstance | null,
    trace: string
  ) => {
    const component = instance?.$options.name || 'UnknownComponent'

    logger.warn('[Vue Warning]', {
      message: msg,
      component,
      trace
    })

    if (import.meta.env.DEV) {
      console.group('🟡 Vue Warning')
      console.warn('Message:', msg)
      console.warn('Component:', component)
      console.warn('Trace:', trace)
      console.groupEnd()
    }
  }

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    event.preventDefault()

    logger.error('[Unhandled Promise Rejection]', {
      reason: event.reason instanceof Error ? event.reason.message : String(event.reason),
      stack: event.reason instanceof Error ? event.reason.stack : undefined
    })

    if (event.reason instanceof Error && !event.reason.message.includes('Network')) {
      message.warning('操作失败，请重试')
    }
  })

  window.addEventListener('error', (event: ErrorEvent) => {
    const benignErrors = [
      'ResizeObserver loop completed with undelivered notifications.',
      'ResizeObserver loop limit exceeded'
    ]

    if (benignErrors.some(msg => event.message.includes(msg))) {
      logger.warn('[Ignored Benign Error]', event.message)
      return
    }

    event.preventDefault()

    logger.error('[Global Error]', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    })

    dialog.error({
      title: '应用错误',
      content: '检测到应用异常，建议刷新页面以恢复正常使用',
      positiveText: '刷新页面',
      onPositiveClick: () => {
        window.location.reload()
      }
    })
  })
}
