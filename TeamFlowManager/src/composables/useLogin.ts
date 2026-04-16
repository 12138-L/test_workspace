import type { LoginForm } from '@/types'
import { ref, reactive, onMounted } from 'vue'
import { loadCredentials, saveCredentials } from '@/utils/storage'

/**
 * useLogin - 登录业务逻辑可组合函数
 *
 * 【设计理念】
 * 将登录业务逻辑从视图组件中抽离，实现：
 * 1. 关注点分离 - 业务逻辑与UI渲染彻底分离
 * 2. 可测试性 - 业务逻辑可以脱离Vue组件进行单元测试
 * 3. 可复用性 - 在多个登录入口复用相同逻辑
 * 4. 代码组织 - 所有登录相关逻辑集中在一个地方
 *
 * @param _userStore 用户Store实例
 * @param _message 消息提示工具
 * @returns 登录相关状态和方法
 */
export function useLogin(
  _userStore: { login: (_form: LoginForm) => Promise<void> },
  _message: { warning: (_msg: string) => void }
) {
  const loginFormRef = ref<{ validate: () => Promise<void> } | null>(null)
  const loading = ref(false)

  const loginForm = reactive<LoginForm>({
    username: '',
    password: '',
    remember: false
  })

  /**
   * 页面加载时从localStorage恢复记住的账号
   */
  onMounted(() => {
    const saved = loadCredentials()
    loginForm.username = saved.username
    loginForm.password = saved.password
    loginForm.remember = saved.remember
  })

  /**
   * 登录主流程
   */
  async function handleLogin() {
    if (!loginFormRef.value || loading.value) return

    try {
      await loginFormRef.value.validate()
      loading.value = true

      saveCredentials({
        username: loginForm.username,
        password: loginForm.password,
        remember: loginForm.remember
      })

      await _userStore.login(loginForm)
    } catch (error) {
      if (error && typeof error === 'object' && 'errors' in error) {
        _message.warning('请填写完整的登录信息')
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 一键快速登录 - DEMO体验优化
   */
  function quickLogin() {
    loginForm.username = 'admin'
    loginForm.password = '123456'
    handleLogin()
  }

  return {
    loginFormRef,
    loading,
    loginForm,
    handleLogin,
    quickLogin
  }
}
