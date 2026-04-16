import { logger } from '@/utils/logger'
import {
  projectsRepo,
  tasksRepo,
  teamRepo,
  settingsRepo,
  leaveRepo,
  overtimeRepo,
  fileRepo
} from './repository'
import { EncryptedRepository } from './encrypted-repository'
import type {
  Project,
  Task,
  TeamMember,
  Settings,
  LeaveRecord,
  OvertimeRecord,
  FileRecord
} from '@/types'

interface MigrationProgress {
  total: number
  completed: number
  currentTable: string
}

type MigrationCallback = (progress: MigrationProgress) => void

class EncryptionMigrator {
  private progress: MigrationProgress = {
    total: 0,
    completed: 0,
    currentTable: ''
  }

  private tables = [
    {
      name: 'projects',
      repo: projectsRepo,
      encryptedRepo: null as unknown as EncryptedRepository<Project, number>
    },
    {
      name: 'tasks',
      repo: tasksRepo,
      encryptedRepo: null as unknown as EncryptedRepository<Task, number>
    },
    {
      name: 'team',
      repo: teamRepo,
      encryptedRepo: null as unknown as EncryptedRepository<TeamMember, number>
    },
    {
      name: 'settings',
      repo: settingsRepo,
      encryptedRepo: null as unknown as EncryptedRepository<Settings, number>
    },
    {
      name: 'leave',
      repo: leaveRepo,
      encryptedRepo: null as unknown as EncryptedRepository<LeaveRecord, number>
    },
    {
      name: 'overtime',
      repo: overtimeRepo,
      encryptedRepo: null as unknown as EncryptedRepository<OvertimeRecord, number>
    },
    {
      name: 'files',
      repo: fileRepo,
      encryptedRepo: null as unknown as EncryptedRepository<FileRecord, number>
    }
  ]

  constructor(
    private _key: CryptoKey,
    private _direction: 'encrypt' | 'decrypt',
    private _onProgress?: MigrationCallback
  ) {}

  setEncryptedRepos(repos: {
    projects: EncryptedRepository<Project, number>
    tasks: EncryptedRepository<Task, number>
    team: EncryptedRepository<TeamMember, number>
    settings: EncryptedRepository<Settings, number>
    leave: EncryptedRepository<LeaveRecord, number>
    overtime: EncryptedRepository<OvertimeRecord, number>
    files: EncryptedRepository<FileRecord, number>
  }) {
    this.tables[0].encryptedRepo = repos.projects
    this.tables[1].encryptedRepo = repos.tasks
    this.tables[2].encryptedRepo = repos.team
    this.tables[3].encryptedRepo = repos.settings
    this.tables[4].encryptedRepo = repos.leave
    this.tables[5].encryptedRepo = repos.overtime
    this.tables[6].encryptedRepo = repos.files
  }

  private async getTotalRecords(): Promise<number> {
    let total = 0
    for (const table of this.tables) {
      total += await table.repo.count()
    }
    return total
  }

  private updateProgress(completed: number, table: string) {
    this.progress.completed = completed
    this.progress.currentTable = table
    this._onProgress?.(this.progress)
  }

  async migrateTable<T extends object>(
    tableName: string,
    sourceRepo: {
      getAll(): Promise<T[]>
      clear(): Promise<void>
      bulkCreate(_items: T[]): Promise<number[]>
      create(item: Omit<T, 'id'>): Promise<number>
    },
    targetRepo: EncryptedRepository<T, number>
  ): Promise<void> {
    logger.info(
      `[Migration] ${this._direction === 'encrypt' ? 'Encrypting' : 'Decrypting'} ${tableName}...`
    )

    const records = await sourceRepo.getAll()
    if (records.length === 0) {
      logger.info(`[Migration] ${tableName} is empty, skipping`)
      return
    }

    await sourceRepo.clear()

    for (const record of records) {
      if (this._direction === 'encrypt') {
        await targetRepo.create(record as Omit<T, 'id'>)
      } else {
        await sourceRepo.create(record as Omit<T, 'id'>)
      }
      this.updateProgress(this.progress.completed + 1, tableName)
    }

    logger.info(`[Migration] ${tableName} completed: ${records.length} records`)
  }

  async execute(): Promise<boolean> {
    logger.info(`[Migration] Starting ${this._direction} migration...`)

    try {
      this.progress.total = await this.getTotalRecords()
      this.progress.completed = 0

      for (const table of this.tables) {
        this.progress.currentTable = table.name
        await this.migrateTable(table.name, table.repo as any, table.encryptedRepo)
      }

      logger.info(`[Migration] ${this._direction} completed successfully!`)
      return true
    } catch (e) {
      logger.error(`[Migration] ${this._direction} failed:`, e)
      return false
    }
  }
}

export async function migrateToEncrypted(
  key: CryptoKey,
  encryptedRepos: any,
  onProgress?: MigrationCallback
): Promise<boolean> {
  const migrator = new EncryptionMigrator(key, 'encrypt', onProgress)
  migrator.setEncryptedRepos(encryptedRepos)
  return migrator.execute()
}

export async function migrateToPlaintext(
  key: CryptoKey,
  encryptedRepos: any,
  onProgress?: MigrationCallback
): Promise<boolean> {
  const migrator = new EncryptionMigrator(key, 'decrypt', onProgress)
  migrator.setEncryptedRepos(encryptedRepos)
  return migrator.execute()
}

export async function verifyEncryptionStatus(): Promise<{
  isEncrypted: boolean
  encryptedTables: string[]
  plaintextTables: string[]
}> {
  logger.info('[Migration] Verifying encryption status...')

  const encryptedTables: string[] = []
  const plaintextTables: string[] = []

  const sampleTasks = await tasksRepo.getAll()
  const isEncrypted = sampleTasks.some(task => {
    return typeof task.description === 'string' && task.description.startsWith('{"iv":')
  })

  if (isEncrypted) {
    encryptedTables.push('tasks')
  } else {
    plaintextTables.push('tasks')
  }

  return {
    isEncrypted,
    encryptedTables,
    plaintextTables: ['projects', 'team', 'settings', 'leave', 'overtime', 'files']
  }
}
