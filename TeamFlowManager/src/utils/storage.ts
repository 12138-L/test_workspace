/**
 * 简单的Base64编码混淆
 * 注意：这不是真正的加密，只是避免密码在localStorage中明文可见
 * 生产环境建议使用更安全的加密方案如AES
 */

/**
 * 简单编码 - 避免明文可见
 */
export function encode(value: string): string {
  try {
    return btoa(encodeURIComponent(value))
  } catch {
    return value
  }
}

/**
 * 解码
 */
export function decode(encoded: string): string {
  try {
    return decodeURIComponent(atob(encoded))
  } catch {
    return encoded
  }
}

/**
 * 安全的localStorage操作
 * 带try-catch容错，避免隐私模式下的异常
 */
export const safeStorage = {
  setItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value)
      return true
    } catch (e) {
      console.warn('localStorage写入失败', e)
      return false
    }
  },

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch (e) {
      console.warn('localStorage读取失败', e)
      return null
    }
  },

  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key)
      return true
    } catch (e) {
      console.warn('localStorage删除失败', e)
      return false
    }
  }
}

const REMEMBER_KEY = 'teamflow_login_remember'

export interface SavedCredentials {
  username: string
  password: string
  remember: boolean
}

/**
 * 保存记住的登录凭证
 * 密码进行简单编码避免明文
 */
export function saveCredentials(data: SavedCredentials): void {
  const toSave: SavedCredentials = {
    username: data.username,
    password: data.remember ? encode(data.password) : '',
    remember: data.remember
  }
  safeStorage.setItem(REMEMBER_KEY, JSON.stringify(toSave))
}

/**
 * 加载记住的登录凭证
 */
export function loadCredentials(): SavedCredentials {
  const saved = safeStorage.getItem(REMEMBER_KEY)
  if (!saved) {
    return { username: '', password: '', remember: false }
  }
  try {
    const data = JSON.parse(saved) as SavedCredentials
    return {
      username: data.username || '',
      password: data.password ? decode(data.password) : '',
      remember: !!data.remember
    }
  } catch {
    return { username: '', password: '', remember: false }
  }
}

/**
 * 清除记住的登录凭证
 */
export function clearCredentials(): void {
  safeStorage.removeItem(REMEMBER_KEY)
}
