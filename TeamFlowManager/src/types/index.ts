export type TagType = 'default' | 'info' | 'success' | 'warning' | 'error'

export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  role: string
  email: string
}

export interface Project {
  id: number
  name: string
  manager: string
  status: '进行中' | '已完成' | '已暂停'
  progress: number
  startDate: string
  endDate: string
}

export interface Task {
  id: number
  title: string
  assignee: string
  priority: '高' | '中' | '低'
  status: '待开始' | '进行中' | '已完成' | '已延期'
  dueDate: string
}

export interface TeamMember {
  id: number
  name: string
  role: string
  email: string
  department: string
  status: 'active' | 'inactive'
}

export interface Activity {
  id: number
  time: string
  content: string
}

export interface CalendarEvent {
  id: number
  title: string
  time: string
  type: TagType
}

export interface UpcomingEvent {
  id: number
  date: string
  title: string
  type: string
}

export interface LoginForm {
  username: string
  password: string
  remember: boolean
}

export interface AppConfig {
  sidebarCollapsed: boolean
}
