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
      for (const { id: _id, ...project } of oldData.projects.list) {
        await repo.projects.create(project)
      }
      migrated.push('projects')
    }

    if (oldData.tasks?.list?.length) {
      for (const { id: _id, ...task } of oldData.tasks.list) {
        await repo.tasks.create(task)
      }
      migrated.push('tasks')
    }

    if (oldData.team?.list?.length) {
      for (const { id: _id, ...member } of oldData.team.list) {
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
