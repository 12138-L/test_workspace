import repo from './repository'
import type { Project, Task, TeamMember } from '@/types'

interface OldStoreData {
  projects?: { list: Project[] }
  tasks?: { list: Task[]; stats: { total: number; completed: number } }
  team?: { list: TeamMember[]; stats: { total: number } }
}

const STORAGE_KEYS = ['projects', 'tasks', 'team']

export async function hasLocalStorageData(): Promise<boolean> {
  return STORAGE_KEYS.some(key => localStorage.getItem(key) !== null)
}

export async function migrateFromLocalStorage(): Promise<{
  success: boolean
  migrated: string[]
  errors: string[]
}> {
  const migrated: string[] = []
  const errors: string[] = []

  try {
    const oldData: OldStoreData = {}

    STORAGE_KEYS.forEach(key => {
      const raw = localStorage.getItem(key)
      if (raw) {
        try {
          oldData[key as keyof OldStoreData] = JSON.parse(raw)
        } catch (e) {
          errors.push(`Failed to parse ${key}`)
        }
      }
    })

    if (oldData.projects?.list?.length) {
      for (const { id, ...project } of oldData.projects.list) {
        await repo.projects.create(project)
      }
      migrated.push('projects')
    }

    if (oldData.tasks?.list?.length) {
      for (const { id, ...task } of oldData.tasks.list) {
        await repo.tasks.create(task)
      }
      migrated.push('tasks')
    }

    if (oldData.team?.list?.length) {
      for (const { id, ...member } of oldData.team.list) {
        await repo.team.create(member)
      }
      migrated.push('team')
    }

    return {
      success: true,
      migrated,
      errors
    }
  } catch (error: any) {
    errors.push(error.message || 'Unknown migration error')
    return {
      success: false,
      migrated,
      errors
    }
  }
}

export async function clearOldLocalStorage(): Promise<void> {
  STORAGE_KEYS.forEach(key => localStorage.removeItem(key))
}

export async function runMigrationIfNeeded(): Promise<{
  run: boolean
  result?: Awaited<ReturnType<typeof migrateFromLocalStorage>>
}> {
  const hasOldData = await hasLocalStorageData()
  const hasNewData = (await repo.projects.count()) > 0

  if (hasOldData && !hasNewData) {
    const result = await migrateFromLocalStorage()
    if (result.success && result.migrated.length > 0) {
      await clearOldLocalStorage()
    }
    return { run: true, result }
  }

  return { run: false }
}

export async function initDemoData(): Promise<void> {
  const demoProjects: Array<Omit<Project, 'id'>> = [
    { name: '官网重构项目', manager: '张三', status: '进行中', progress: 65, startDate: '2024-01-01', endDate: '2024-03-31', createdAt: Date.now() },
    { name: '移动端APP开发', manager: '李四', status: '进行中', progress: 40, startDate: '2024-01-15', endDate: '2024-04-30', createdAt: Date.now() },
    { name: '数据大屏系统', manager: '王五', status: '已完成', progress: 100, startDate: '2023-12-01', endDate: '2024-01-31', createdAt: Date.now() }
  ]

  const demoTasks: Array<Omit<Task, 'id'>> = [
    { title: '完成首页设计稿', assignee: '张三', priority: '高', status: '已完成', dueDate: '2024-01-10', projectId: 1, createdAt: Date.now() },
    { title: 'API接口开发', assignee: '李四', priority: '高', status: '进行中', dueDate: '2024-01-20', projectId: 1, createdAt: Date.now() },
    { title: '单元测试编写', assignee: '王五', priority: '中', status: '待开始', dueDate: '2024-01-25', projectId: 1, createdAt: Date.now() },
    { title: '用户模块开发', assignee: '赵六', priority: '高', status: '进行中', dueDate: '2024-02-01', projectId: 2, createdAt: Date.now() }
  ]

  const demoTeam: Array<Omit<TeamMember, 'id'>> = [
    { name: '张三', role: '前端工程师', department: '技术部', email: 'zhangsan@example.com', phone: '13800138001', status: 'active', avatar: '', joinedAt: '2023-06-15', createdAt: Date.now() },
    { name: '李四', role: '后端工程师', department: '技术部', email: 'lisi@example.com', phone: '13800138002', status: 'active', avatar: '', joinedAt: '2023-07-20', createdAt: Date.now() },
    { name: '王五', role: '产品经理', department: '产品部', email: 'wangwu@example.com', phone: '13800138003', status: 'active', avatar: '', joinedAt: '2023-08-10', createdAt: Date.now() }
  ]

  await repo.projects.bulkCreate(demoProjects)
  await repo.tasks.bulkCreate(demoTasks)
  await repo.team.bulkCreate(demoTeam)
}
