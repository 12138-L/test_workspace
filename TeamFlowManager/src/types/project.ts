export type ProjectStatus = '进行中' | '已完成' | '已暂停'

export interface Project {
  id: number
  name: string
  manager: string
  status: ProjectStatus
  progress: number
  startDate: string
  endDate: string
  createdAt?: number
}
