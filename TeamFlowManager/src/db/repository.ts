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

function toPlainObject<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

function safeSerialize<T>(obj: T): T {
  try {
    return toPlainObject(obj)
  } catch (e) {
    console.warn('[Dexie] Serialization fallback, some data may be lost:', e)
    return { ...obj } as T
  }
}

export class DexieRepository<T, K = number> implements IRepository<T, K> {
  constructor(protected table: Table<T, K>) {}

  async getAll(): Promise<T[]> {
    try {
      return this.table.toArray()
    } catch (e) {
      console.error('[Dexie] getAll error:', e)
      return []
    }
  }

  async getById(id: K): Promise<T | undefined> {
    try {
      return this.table.get(id)
    } catch (e) {
      console.error('[Dexie] getById error:', e)
      return undefined
    }
  }

  async create(item: Omit<T, 'id'>): Promise<K> {
    try {
      return this.table.add(safeSerialize(item) as T) as Promise<K>
    } catch (e) {
      console.error('[Dexie] create error:', e)
      throw e
    }
  }

  async update(id: K, changes: Partial<T>): Promise<number> {
    try {
      return this.table.update(id, safeSerialize(changes) as any)
    } catch (e) {
      console.error('[Dexie] update error:', e)
      throw e
    }
  }

  async delete(id: K): Promise<void> {
    try {
      await this.table.delete(id)
    } catch (e) {
      console.error('[Dexie] delete error:', e)
      throw e
    }
  }

  async bulkCreate(items: Array<Omit<T, 'id'>>): Promise<K[]> {
    try {
      return this.table.bulkAdd(items.map(i => safeSerialize(i) as T), { allKeys: true }) as Promise<K[]>
    } catch (e) {
      console.error('[Dexie] bulkCreate error:', e)
      throw e
    }
  }

  async clear(): Promise<void> {
    try {
      await this.table.clear()
    } catch (e) {
      console.error('[Dexie] clear error:', e)
      throw e
    }
  }

  async count(): Promise<number> {
    try {
      return this.table.count()
    } catch (e) {
      console.error('[Dexie] count error:', e)
      return 0
    }
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
