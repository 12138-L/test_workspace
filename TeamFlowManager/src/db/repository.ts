import type { Table } from 'dexie'
import { db } from './schema'
import type {
  Project,
  Task,
  TeamMember,
  Settings,
  User,
  LeaveRecord,
  OvertimeRecord,
  WorkdayAdjustment,
  FileRecord
} from '@/types'

export interface IRepository<T, K = number> {
  getAll(): Promise<T[]>
  getById(_id: K): Promise<T | undefined>
  create(_item: Omit<T, 'id'>): Promise<K>
  update(_id: K, _changes: Partial<T>): Promise<number>
  delete(_id: K): Promise<void>
  bulkCreate(_items: Array<Omit<T, 'id'>>): Promise<K[]>
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
  constructor(protected _table: Table<T, K>) {}

  async getAll(): Promise<T[]> {
    try {
      return this._table.toArray()
    } catch (e) {
      console.error('[Dexie] getAll error:', e)
      return []
    }
  }

  async getById(id: K): Promise<T | undefined> {
    try {
      return this._table.get(id)
    } catch (e) {
      console.error('[Dexie] getById error:', e)
      return undefined
    }
  }

  async create(item: Omit<T, 'id'>): Promise<K> {
    try {
      return this._table.add(safeSerialize(item) as T) as Promise<K>
    } catch (e) {
      console.error('[Dexie] create error:', e)
      throw e
    }
  }

  async update(id: K, changes: Partial<T>): Promise<number> {
    try {
      return this._table.update(id, safeSerialize(changes) as any)
    } catch (e) {
      console.error('[Dexie] update error:', e)
      throw e
    }
  }

  async delete(id: K): Promise<void> {
    try {
      await this._table.delete(id)
    } catch (e) {
      console.error('[Dexie] delete error:', e)
      throw e
    }
  }

  async bulkCreate(items: Array<Omit<T, 'id'>>): Promise<K[]> {
    try {
      return this._table.bulkAdd(
        items.map(i => safeSerialize(i) as T),
        { allKeys: true }
      ) as Promise<K[]>
    } catch (e) {
      console.error('[Dexie] bulkCreate error:', e)
      throw e
    }
  }

  async clear(): Promise<void> {
    try {
      await this._table.clear()
    } catch (e) {
      console.error('[Dexie] clear error:', e)
      throw e
    }
  }

  async count(): Promise<number> {
    try {
      return this._table.count()
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
export const leaveRepo = new DexieRepository<LeaveRecord, number>(db.leaveRecords)
export const overtimeRepo = new DexieRepository<OvertimeRecord, number>(db.overtimeRecords)
export const adjustmentRepo = new DexieRepository<WorkdayAdjustment, number>(db.workdayAdjustments)
export const fileRepo = new DexieRepository<FileRecord, number>(db.files)

export const fileDB = {
  getAllFiles: () => fileRepo.getAll(),
  addFile: (record: Omit<FileRecord, 'id' | 'createdAt'>) =>
    fileRepo.create({ ...record, createdAt: Date.now() } as FileRecord),
  updateFile: (id: number, changes: Partial<FileRecord>) => fileRepo.update(id, changes),
  deleteFile: (id: number) => fileRepo.delete(id),
  getFilesByCategory: (category: string) =>
    db.files.where('category').equals(category).toArray(),
  getFilesByMember: (memberId: number) =>
    db.files.where('memberId').equals(memberId).toArray()
}

export const calendarDB = {
  getAllLeaves: () => leaveRepo.getAll(),
  addLeave: (record: LeaveRecord) => leaveRepo.create(record as any),
  updateLeave: (id: number, changes: Partial<LeaveRecord>) => leaveRepo.update(id, changes),
  deleteLeave: (id: number) => leaveRepo.delete(id),
  bulkCreateLeaves: (records: Array<Omit<LeaveRecord, 'id' | 'createdAt'>>) =>
    leaveRepo.bulkCreate(records as any[]),
  getAllOvertimes: () => overtimeRepo.getAll(),
  addOvertime: (record: OvertimeRecord) => overtimeRepo.create(record as any),
  updateOvertime: (id: number, changes: Partial<OvertimeRecord>) =>
    overtimeRepo.update(id, changes),
  deleteOvertime: (id: number) => overtimeRepo.delete(id),
  bulkCreateOvertimes: (records: Array<Omit<OvertimeRecord, 'id' | 'createdAt'>>) =>
    overtimeRepo.bulkCreate(records as any[]),
  getAllAdjustments: () => adjustmentRepo.getAll(),
  addAdjustment: (adj: WorkdayAdjustment) => adjustmentRepo.create(adj as any),
  updateAdjustment: (id: number, changes: Partial<WorkdayAdjustment>) =>
    adjustmentRepo.update(id, changes),
  deleteAdjustment: (id: number) => adjustmentRepo.delete(id)
}

export const hasDexie = true

export default {
  projects: projectsRepo,
  tasks: tasksRepo,
  team: teamRepo,
  settings: settingsRepo,
  user: userRepo,
  appState: appStateRepo,
  leave: leaveRepo,
  adjustment: adjustmentRepo
}
