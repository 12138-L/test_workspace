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
