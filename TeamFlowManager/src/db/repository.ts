import type { Table } from 'dexie'
import { db } from './schema'
import type { Project, Task, TeamMember, Settings, User } from '@/types'

export interface IRepository<T, K = number> {
  getAll(): Promise<T[]>
  getById(id: K): Promise<T | undefined>
  create(item: Omit<T, 'id'>): Promise<K>
  update(id: K, changes: Partial<T>): Promise<number>
  delete(id: K): Promise<void>
  bulkCreate(items: Array<Omit<T, 'id'>>): Promise<K[]>
  clear(): Promise<void>
  count(): Promise<number>
}

export class DexieRepository<T, K = number> implements IRepository<T, K> {
  constructor(protected table: Table<T, K>) {}

  async getAll(): Promise<T[]> {
    return this.table.toArray()
  }

  async getById(id: K): Promise<T | undefined> {
    return this.table.get(id)
  }

  async create(item: Omit<T, 'id'>): Promise<K> {
    return this.table.add(item as T) as Promise<K>
  }

  async update(id: K, changes: Partial<T>): Promise<number> {
    return this.table.update(id, changes as any)
  }

  async delete(id: K): Promise<void> {
    await this.table.delete(id)
  }

  async bulkCreate(items: Array<Omit<T, 'id'>>): Promise<K[]> {
    return this.table.bulkAdd(items as T[], { allKeys: true }) as Promise<K[]>
  }

  async clear(): Promise<void> {
    await this.table.clear()
  }

  async count(): Promise<number> {
    return this.table.count()
  }
}

export const projectsRepo = new DexieRepository<Project, number>(db.projects)
export const tasksRepo = new DexieRepository<Task, number>(db.tasks)
export const teamRepo = new DexieRepository<TeamMember, number>(db.team)
export const settingsRepo = new DexieRepository<Settings, number>(db.settings)
export const userRepo = new DexieRepository<User, number>(db.user)
export const appStateRepo = new DexieRepository<Record<string, any>, number>(db.appState)

export const hasDexie = true

export default {
  projects: projectsRepo,
  tasks: tasksRepo,
  team: teamRepo,
  settings: settingsRepo,
  user: userRepo,
  appState: appStateRepo
}
