import { defineStore } from 'pinia'
import type { UserInfo, LoginForm } from '@/types'
import router from '@/router'
import { ElMessage } from 'element-plus'

interface UserState {
  token: string
  userInfo: UserInfo | null
  isAuthenticated: boolean
}

export const useUserStore = defineStore('user', {
  persist: {
    key: 'user-store',
    paths: ['token', 'userInfo', 'isAuthenticated']
  },

  state: (): UserState => ({
    token: '',
    userInfo: null,
    isAuthenticated: false
  }),

  getters: {
    username: state => state.userInfo?.nickname || '未登录',
    avatar: state => state.userInfo?.avatar || ''
  },

  actions: {
    async login(_loginForm: LoginForm) {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          const mockToken = 'mock-token-' + Date.now()
          const mockUserInfo: UserInfo = {
            id: 1,
            username: _loginForm.username,
            nickname: '管理员',
            avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
            role: 'admin',
            email: 'admin@example.com'
          }

          this.token = mockToken
          this.userInfo = mockUserInfo
          this.isAuthenticated = true

          this.$persist()

          resolve()
        }, 1000)
      })
    },

    logout() {
      this.token = ''
      this.userInfo = null
      this.isAuthenticated = false

      this.$persist()

      router.push('/login')
      ElMessage.success('已退出登录')
    },

    getUserInfo() {
      return new Promise(resolve => {
        const mockUserInfo: UserInfo = {
          id: 1,
          username: 'admin',
          nickname: '管理员',
          avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
          role: 'admin',
          email: 'admin@example.com'
        }
        this.userInfo = mockUserInfo
        resolve(mockUserInfo)
      })
    }
  }
})
