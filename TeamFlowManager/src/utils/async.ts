import { ref, type Ref } from 'vue'
import { message } from '@/utils/naive'

/**
 * 异步操作配置选项
 *
 * 【升级】新增 retry 重试机制支持
 */
interface UseAsyncOptions<T> {
  onSuccess?: (_data: T) => void
  onError?: (_error: unknown, _retryCount: number) => boolean | void
  successMessage?: string
  errorMessage?: string
  /** 最大重试次数，默认 0（不重试） */
  maxRetries?: number
  /** 重试延迟毫秒，默认 1000ms */
  retryDelay?: number
}

/**
 * useAsync - 异步操作通用封装
 *
 * 【升级亮点】
 * ✅ 内置重试机制 - 网络波动自动恢复
 * ✅ onError 支持返回 boolean 控制是否继续重试
 * ✅ 完整的类型安全 - 泛型支持
 * ✅ loading/error 统一状态管理
 *
 * @param fn 异步函数
 * @param options 配置选项
 *
 * @example
 * // 失败自动重试 2 次
 * const { loading, execute } = useAsync(fetchData, {
 *   maxRetries: 2,
 *   retryDelay: 1000
 * })
 */
export function useAsync<T = unknown>(
  fn: (..._args: unknown[]) => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const loading = ref(false)
  const error = ref<unknown>(null)
  const data = ref<T | null>(null)

  const { maxRetries = 0, retryDelay = 1000 } = options

  const execute = async (...args: unknown[]): Promise<T> => {
    loading.value = true
    error.value = null

    let retryCount = 0

    const attempt = async (): Promise<T> => {
      try {
        const result = await fn(...args)
        data.value = result

        if (options.successMessage) {
          message.success(options.successMessage)
        }

        options.onSuccess?.(result)
        return result
      } catch (err) {
        error.value = err

        // 调用 onError，返回 false 终止重试链
        const shouldContinue = options.onError?.(err, retryCount)
        if (shouldContinue === false) {
          throw err
        }

        // 失败重试
        if (retryCount < maxRetries) {
          retryCount++
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          return attempt()
        }

        if (options.errorMessage) {
          message.error(options.errorMessage)
        }

        throw err
      } finally {
        loading.value = false
      }
    }

    return attempt()
  }

  return {
    loading,
    error,
    data,
    execute
  }
}

export async function withLoading<T>(promise: Promise<T>, loadingRef: Ref<boolean>): Promise<T> {
  loadingRef.value = true
  try {
    return await promise
  } finally {
    loadingRef.value = false
  }
}

export async function withErrorHandling<T>(
  promise: Promise<T>,
  errorHandler?: (_error: unknown) => void
): Promise<T | null> {
  try {
    return await promise
  } catch (err) {
    errorHandler?.(err)
    return null
  }
}
