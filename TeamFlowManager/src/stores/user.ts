import { defineStore } from 'pinia'
import type { UserInfo, LoginForm } from '@/types'
import router from '@/router'
import { message, loadingBar } from '@/utils/naive'
import { userRepo } from '@/db/repository'

interface UserState {
  token: string
  userInfo: UserInfo | null
  isAuthenticated: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: '',
    userInfo: null,
    isAuthenticated: false
  }),

  getters: {
    username: state => state.userInfo?.nickname || '未登录',
    avatar: state => state.userInfo?.avatar || '',
    userRole: state => state.userInfo?.role || 'guest'
  },

  actions: {
    async loadFromStorage() {
      const records = await userRepo.getAll()
      if (records.length > 0) {
        const saved = records[0]
        this.token = saved.token || ''
        this.userInfo = saved as UserInfo
        this.isAuthenticated = saved.isLoggedIn || false
      }
    },

    async saveToStorage() {
      const records = await userRepo.getAll()
      const data = {
        token: this.token,
        userInfo: this.userInfo,
        isLoggedIn: this.isAuthenticated
      }

      if (records.length > 0) {
        await userRepo.update(records[0].id!, data)
      } else {
        await userRepo.create(data as any)
      }
    },

    async login(loginForm: LoginForm) {
      loadingBar.start()

      try {
        await new Promise<void>(resolve => {
          setTimeout(async () => {
            const mockToken = 'mock-token-' + Date.now()
            const mockUserInfo: UserInfo = {
              id: 1,
              username: loginForm.username,
              nickname: '管理员',
              avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
              role: 'admin',
              email: 'admin@example.com'
            }

            this.token = mockToken
            this.userInfo = mockUserInfo
            this.isAuthenticated = true
            await this.saveToStorage()

            resolve()
          }, 800)
        })

        loadingBar.finish()
        message.success('登录成功，欢迎回来！')

        await router.push('/dashboard')
      } catch (error) {
        loadingBar.error()
        message.error('登录失败，请重试')
        throw error
      }
    },

    async logout() {
      this.token = ''
      this.userInfo = null
      this.isAuthenticated = false

      const records = await userRepo.getAll()
      if (records.length > 0) {
        await userRepo.delete(records[0].id!)
      }

      message.info('已安全退出登录')
      router.push('/login')
    },

    async refreshUserInfo() {
      if (!this.token) return

      try {
        const mockUserInfo: UserInfo = {
          id: 1,
          username: 'admin',
          nickname: '管理员',
          avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
          role: 'admin',
          email: 'admin@example.com'
        }

        this.userInfo = mockUserInfo
        await this.saveToStorage()
      } catch (e) {
        message.error('刷新用户信息失败')
      }
    }
  }
})
