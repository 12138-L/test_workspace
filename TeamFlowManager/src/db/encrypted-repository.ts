/**
 * 加密 Repository - Dexie 透明加密中间件
 *
 * 【架构设计】
 *                                    +----------------+
 *              +----------+          |  业务 Composable  |
 *              |  View    |          +--------+-------+
 *              +-----+----+                   |
 *                    |                        |
 *              +-----v----+                   |
 *              | useTasks |                   |
 *              +-----+----+                   |
 *                    |                        |
 *              +-----v------------------------v-----+
 *              |         EncryptedRepository          |  ← 你在这：透明加密层
 *              +-----+------------------------+-----+
 *                    |                        |
 *              +-----v----+                   |
 *              |   AES    |               自动加解密
 *              |  GCM     |
 *              +----------+
 *
 * 【使用方式】
 * // 初始化时注入密钥
 * await encryptedRepo.setEncryptionKey(masterKey)
 *
 * // 业务代码完全不变
 * await encryptedRepo.create(data)  // ✅ 自动加密敏感字段
 */

import type { Table } from 'dexie'

import { logger } from '@/utils/logger'
import { encryptRecord, decryptRecord } from '@/utils/crypto'
import type {
  Project,
  Task,
  TeamMember,
  Settings,
  LeaveRecord,
  OvertimeRecord,
  FileRecord
} from '@/types'

export class EncryptedRepository<T extends object, K = number> {
  private encryptionKey: CryptoKey | null = null
  private encryptionEnabled = false

  constructor(protected _table: Table<T, K>) {}

  setEncryptionKey(key: CryptoKey | null): void {
    this.encryptionKey = key
    this.encryptionEnabled = key !== null
    logger.info('[EncryptedRepo] Encryption', this.encryptionEnabled ? 'ENABLED' : 'DISABLED')
  }

  isEncrypted(): boolean {
    return this.encryptionEnabled
  }

  private async encrypt(item: T): Promise<T> {
    if (!this.encryptionEnabled || !this.encryptionKey) {
      return item
    }
    return encryptRecord(this.encryptionKey, item)
  }

  private async decrypt(item: T): Promise<T> {
    if (!this.encryptionEnabled || !this.encryptionKey) {
      return item
    }
    return decryptRecord(this.encryptionKey, item)
  }

  private async encryptAll(items: T[]): Promise<T[]> {
    if (!this.encryptionEnabled) return items
    return Promise.all(items.map(item => this.encrypt(item)))
  }

  private async decryptAll(items: T[]): Promise<T[]> {
    if (!this.encryptionEnabled) return items
    return Promise.all(items.map(item => this.decrypt(item)))
  }

  async getAll(): Promise<T[]> {
    try {
      const items = await this._table.toArray()
      return this.decryptAll(items)
    } catch (e) {
      logger.error('[EncryptedRepo] getAll error:', e)
      return []
    }
  }

  async getById(id: K): Promise<T | undefined> {
    try {
      const item = await this._table.get(id)
      if (!item) return undefined
      return this.decrypt(item)
    } catch (e) {
      logger.error('[EncryptedRepo] getById error:', e)
      return undefined
    }
  }

  async create(item: Omit<T, 'id'>): Promise<K> {
    try {
      const encrypted = await this.encrypt(item as T)
      return this._table.add(encrypted) as Promise<K>
    } catch (e) {
      logger.error('[EncryptedRepo] create error:', e)
      throw e
    }
  }

  async update(id: K, changes: Partial<T>): Promise<number> {
    try {
      const encryptedChanges = await this.encrypt(changes as T)
      return this._table.update(id, encryptedChanges as any)
    } catch (e) {
      logger.error('[EncryptedRepo] update error:', e)
      throw e
    }
  }

  async delete(id: K): Promise<void> {
    try {
      await this._table.delete(id)
    } catch (e) {
      logger.error('[EncryptedRepo] delete error:', e)
      throw e
    }
  }

  async bulkCreate(items: Array<Omit<T, 'id'>>): Promise<K[]> {
    try {
      const encrypted = await this.encryptAll(items as T[])
      return this._table.bulkAdd(encrypted, { allKeys: true }) as Promise<K[]>
    } catch (e) {
      logger.error('[EncryptedRepo] bulkCreate error:', e)
      throw e
    }
  }

  async clear(): Promise<void> {
    try {
      await this._table.clear()
    } catch (e) {
      logger.error('[EncryptedRepo] clear error:', e)
      throw e
    }
  }

  async count(): Promise<number> {
    try {
      return this._table.count()
    } catch (e) {
      logger.error('[EncryptedRepo] count error:', e)
      return 0
    }
  }
}

export function createEncryptedRepos(db: {
  projects: Table<Project, number>
  tasks: Table<Task, number>
  team: Table<TeamMember, number>
  settings: Table<Settings, number>
  leaveRecords: Table<LeaveRecord, number>
  overtimeRecords: Table<OvertimeRecord, number>
  files: Table<FileRecord, number>
}) {
  return {
    projects: new EncryptedRepository<Project, number>(db.projects),
    tasks: new EncryptedRepository<Task, number>(db.tasks),
    team: new EncryptedRepository<TeamMember, number>(db.team),
    settings: new EncryptedRepository<Settings, number>(db.settings),
    leave: new EncryptedRepository<LeaveRecord, number>(db.leaveRecords),
    overtime: new EncryptedRepository<OvertimeRecord, number>(db.overtimeRecords),
    files: new EncryptedRepository<FileRecord, number>(db.files),

    setGlobalEncryptionKey(key: CryptoKey | null) {
      this.projects.setEncryptionKey(key)
      this.tasks.setEncryptionKey(key)
      this.team.setEncryptionKey(key)
      this.settings.setEncryptionKey(key)
      this.leave.setEncryptionKey(key)
      this.overtime.setEncryptionKey(key)
      this.files.setEncryptionKey(key)
    },

    isEncryptionEnabled() {
      return this.projects.isEncrypted()
    }
  }
}

export type EncryptedRepos = ReturnType<typeof createEncryptedRepos>
