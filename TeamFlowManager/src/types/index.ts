export type TagType = 'default' | 'info' | 'success' | 'warning' | 'error'

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

export interface Settings {
  id?: number
  type: 'basic' | 'notification' | 'security'
  [key: string]: any
}

export interface Project {
  id: number
  name: string
  manager: string
  status: '进行中' | '已完成' | '已暂停'
  progress: number
  startDate: string
  endDate: string
  createdAt?: number
}

export interface Task {
  id: number
  title: string
  description: string
  remark: string
  assignee: string
  priority: '高' | '中' | '低'
  status: '待开始' | '进行中' | '已完成' | '已延期'
  startTime: string
  dueDate: string
  projectId?: number
  createdAt?: number
}

export interface TeamMember {
  id: number
  name: string
  role: string
  email: string
  phone?: string
  avatar?: string
  department: string
  status: 'active' | 'inactive'
  joinedAt?: string
  createdAt?: number
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

export type LeaveType = '年假' | '事假' | '病假' | '调休' | '婚假' | '产假' | '陪产假'
export type LeaveStatus = '待审批' | '已批准' | '已拒绝' | '已撤销'

export interface LeaveRecord {
  id: number
  memberId: number
  memberName: string
  type: LeaveType
  date: string
  hours: number
  reason: string
  status: LeaveStatus
  createdAt: number
  approvedAt?: number
}

export type OvertimeType = '平时加班' | '周末加班' | '节假日加班'

export interface OvertimeRecord {
  id: number
  memberId: number
  memberName: string
  type: OvertimeType
  date: string
  hours: number
  reason: string
  createdAt: number
}

export interface WorkdayAdjustment {
  id: number
  date: string
  type: 'holiday' | 'workday'
  name: string
  isCustom: boolean
  createdAt: number
}

export type FileCategory = '周报' | '月报' | '证件' | '合同' | '报告' | '考勤' | '其他'

export interface FileRecord {
  id: number
  name: string
  originalName: string
  size: number
  type: string
  category: FileCategory
  data: string
  memberId?: number
  memberName?: string
  remark?: string
  uploadedAt: number
  createdAt: number
}
