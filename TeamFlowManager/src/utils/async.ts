import { ref, type Ref } from 'vue'
import { message } from '@/utils/naive'

interface UseAsyncOptions<T> {
  onSuccess?: (_data: T) => void
  onError?: (_error: unknown) => void
  successMessage?: string
  errorMessage?: string
}

export function useAsync<T = unknown>(
  fn: (..._args: unknown[]) => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const loading = ref(false)
  const error = ref<unknown>(null)
  const data = ref<T | null>(null)

  const execute = async (...args: unknown[]) => {
    loading.value = true
    error.value = null

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

      if (options.errorMessage) {
        message.error(options.errorMessage)
      }

      options.onError?.(err)
      throw err
    } finally {
      loading.value = false
    }
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
