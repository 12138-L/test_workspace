export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  role: string
  email: string
}

export interface User {
  id?: number
  token?: string
  username: string
  isLoggedIn?: boolean
}

export interface LoginForm {
  username: string
  password: string
  remember: boolean
}
