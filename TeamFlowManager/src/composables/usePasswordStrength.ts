import { computed, toRef, isRef, type MaybeRef } from 'vue'

/**
 * 密码强度等级类型
 */
export type PasswordStrengthLevel = 0 | 1 | 2 | 3

/**
 * 密码强度检测结果
 */
export interface PasswordStrengthResult {
  level: PasswordStrengthLevel
  text: string
  color: string
  score: number
}

/**
 * usePasswordStrength - 密码强度检测可组合函数
 *
 * 【防踩坑设计】
 * ✅ 自动处理响应式：支持 Ref 或 getter 函数
 * ✅ 傻瓜式调用：调用者不会因为响应式连接错误出bug
 * ✅ 类型安全：完整TypeScript支持
 *
 * 【设计理念】
 * 将密码强度检测逻辑从组件中抽离，实现：
 * 1. 可复用性 - 在登录、注册、修改密码等页面复用
 * 2. 可测试性 - 可以独立进行单元测试
 * 3. 可扩展性 - 未来可以轻松增加更复杂的检测规则
 *
 * @param password 密码（支持：ref、computed、普通字符串、getter函数）
 * @returns 密码强度计算结果
 *
 * @example
 * // 最简单用法 - 传普通ref即可
 * const password = ref('')
 * const { passwordStrength } = usePasswordStrength(password)
 *
 * // 从对象中提取 - 自动转响应式
 * const form = ref({ password: '' })
 * const { passwordStrength } = usePasswordStrength(() => form.value.password)
 */
export function usePasswordStrength(password: MaybeRef<string> | (() => string)) {
  const passwordRef = isRef(password)
    ? password
    : typeof password === 'function'
      ? computed(password as () => string)
      : toRef(password)

  const passwordStrength = computed<PasswordStrengthResult>(() => {
    const pwd = passwordRef.value

    if (!pwd) {
      return { level: 0, text: '', color: '', score: 0 }
    }

    let score = 0

    if (pwd.length >= 3) score += 1
    if (pwd.length >= 6) score += 1
    if (pwd.length >= 8) score += 1
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1
    if (/\d/.test(pwd)) score += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 1

    if (score <= 2) {
      return { level: 1, text: '弱', color: '#f56c6c', score }
    }
    if (score <= 4) {
      return { level: 2, text: '中', color: '#e6a23c', score }
    }
    return { level: 3, text: '强', color: '#67c23a', score }
  })

  return { passwordStrength }
}
