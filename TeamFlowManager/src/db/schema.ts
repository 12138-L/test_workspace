import Dexie, { Table } from 'dexie'
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

export class TeamFlowDB extends Dexie {
  projects!: Table<Project, number>
  tasks!: Table<Task, number>
  team!: Table<TeamMember, number>
  settings!: Table<Settings, number>
  user!: Table<User, number>
  appState!: Table<Record<string, any>, number>
  leaveRecords!: Table<LeaveRecord, number>
  overtimeRecords!: Table<OvertimeRecord, number>
  workdayAdjustments!: Table<WorkdayAdjustment, number>
  files!: Table<FileRecord, number>

  constructor() {
    super('TeamFlowDB')

    this.version(4)
      .stores({
        projects: '++id, name, status, manager, createdAt',
        tasks: '++id, title, status, assignee, projectId, dueDate, createdAt',
        team: '++id, name, role, department, email, createdAt',
        settings: '++id, type',
        user: '++id, username, isLoggedIn',
        appState: '++id, key',
        leaveRecords: '++id, memberId, date, status, createdAt',
        overtimeRecords: '++id, memberId, date, createdAt',
        workdayAdjustments: '++id, date, type, isCustom, createdAt',
        files: '++id, name, category, memberId, uploadedAt, createdAt'
      })
      .upgrade(() => {})
  }
}

export const db = new TeamFlowDB()

export type DBTable = 'projects' | 'tasks' | 'team' | 'settings' | 'user' | 'appState'

export const TABLES: Record<DBTable, string> = {
  projects: 'projects',
  tasks: 'tasks',
  team: 'team',
  settings: 'settings',
  user: 'user',
  appState: 'appState'
}

export type { Project, Task, TeamMember, Settings, User } from '@/types'
