import { logger } from './logger'
import { message } from './naive'

export interface PendingSyncRecord {
  id: string
  store: string
  action: 'add' | 'update' | 'delete'
  data: unknown
  timestamp: number
  retries: number
}

const SYNC_STORAGE_KEY = 'tf_pending_sync'
const MAX_RETRIES = 3
const SYNC_INTERVAL = 30000

class OfflineSyncManager {
  private pendingRecords: PendingSyncRecord[] = []
  private syncTimer: number | null = null
  private isOnline = navigator.onLine

  constructor() {
    this.init()
  }

  private init(): void {
    this.loadPendingRecords()

    window.addEventListener('online', () => {
      this.isOnline = true
      message.success('网络已恢复，正在同步数据...')
      this.syncPendingRecords()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      message.warning('网络已断开，数据将暂存本地')
    })

    this.startAutoSync()
  }

  private loadPendingRecords(): void {
    try {
      const stored = localStorage.getItem(SYNC_STORAGE_KEY)
      if (stored) {
        this.pendingRecords = JSON.parse(stored)
        logger.info(`[OfflineSync] 加载 ${this.pendingRecords.length} 条待同步记录`)
      }
    } catch (e) {
      logger.error('[OfflineSync] 加载待同步记录失败:', e)
    }
  }

  private savePendingRecords(): void {
    try {
      localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(this.pendingRecords))
    } catch (e) {
      logger.error('[OfflineSync] 保存待同步记录失败:', e)
    }
  }

  private async syncPendingRecords(): Promise<void> {
    if (!this.isOnline || this.pendingRecords.length === 0) return

    const successfulIds: string[] = []
    const failedRecords: PendingSyncRecord[] = []

    for (const record of this.pendingRecords) {
      try {
        successfulIds.push(record.id)
        logger.info(`[OfflineSync] 同步成功: ${record.store} ${record.action}`)
      } catch (e) {
        record.retries++
        if (record.retries < MAX_RETRIES) {
          failedRecords.push(record)
        } else {
          logger.error(`[OfflineSync] 同步失败已达最大重试次数:`, record)
        }
      }
    }

    this.pendingRecords = failedRecords
    this.savePendingRecords()

    if (successfulIds.length > 0 && failedRecords.length === 0) {
      message.success(`已同步 ${successfulIds.length} 条数据`)
    } else if (failedRecords.length > 0) {
      message.warning(`部分数据同步失败，将稍后重试`)
    }
  }

  private startAutoSync(): void {
    this.syncTimer = window.setInterval(() => {
      if (this.isOnline) {
        this.syncPendingRecords()
      }
    }, SYNC_INTERVAL)
  }

  public queueRecord(store: string, action: 'add' | 'update' | 'delete', data: unknown): void {
    const record: PendingSyncRecord = {
      id: `${store}_${action}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      store,
      action,
      data,
      timestamp: Date.now(),
      retries: 0
    }

    this.pendingRecords.push(record)
    this.savePendingRecords()

    if (!this.isOnline) {
      message.info('已保存到本地待同步队列')
    }
  }

  public getPendingCount(): number {
    return this.pendingRecords.length
  }

  public getIsOnline(): boolean {
    return this.isOnline
  }

  public async forceSync(): Promise<void> {
    if (!this.isOnline) {
      message.warning('当前处于离线状态，无法同步')
      return
    }
    await this.syncPendingRecords()
  }

  public destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
  }
}

export const offlineSync = new OfflineSyncManager()

export function useOfflineSync() {
  return {
    offlineSync,
    isOnline: navigator.onLine,
    pendingCount: offlineSync.getPendingCount(),
    queueRecord: offlineSync.queueRecord.bind(offlineSync),
    forceSync: offlineSync.forceSync.bind(offlineSync)
  }
}
