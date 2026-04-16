export type TaskPriority = '高' | '中' | '低'
export type TaskStatus = '待开始' | '进行中' | '已完成' | '已延期'

export interface Task {
  id: number
  title: string
  description: string
  remark: string
  assignee: string
  priority: TaskPriority
  status: TaskStatus
  startTime: string
  dueDate: string
  projectId?: number
  createdAt?: number
}
