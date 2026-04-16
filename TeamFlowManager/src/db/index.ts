export { db, type DBTable } from './schema'
export * from './repository'
export * from './migration'
export * from './encrypted-repository'

import { runMigrationIfNeeded } from './migration'
import {
  projectsRepo,
  tasksRepo,
  teamRepo,
  leaveRepo,
  overtimeRepo,
  adjustmentRepo
} from './repository'
import { db as database } from './schema'
import { createEncryptedRepos } from './encrypted-repository'

export const encryptedRepos = createEncryptedRepos(database)

export async function initDatabase() {
  const migration = await runMigrationIfNeeded()

  return {
    migrationRun: migration.run,
    migrationResult: migration.result,
    demoDataInitialized: false
  }
}

export async function resetDatabase() {
  await Promise.all([
    projectsRepo.clear(),
    tasksRepo.clear(),
    teamRepo.clear(),
    leaveRepo.clear(),
    overtimeRepo.clear(),
    adjustmentRepo.clear()
  ])
}

export async function clearAllData() {
  await Promise.all([
    projectsRepo.clear(),
    tasksRepo.clear(),
    teamRepo.clear(),
    leaveRepo.clear(),
    overtimeRepo.clear()
  ])
}

export async function getDatabaseStats() {
  return {
    projects: await projectsRepo.count(),
    tasks: await tasksRepo.count(),
    team: await teamRepo.count(),
    leaves: await leaveRepo.count(),
    overtimes: await overtimeRepo.count()
  }
}

export default {
  init: initDatabase,
  reset: resetDatabase,
  clear: clearAllData,
  stats: getDatabaseStats
}
