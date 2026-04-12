export { db, type DBTable } from './schema'
export * from './repository'
export * from './migration'

import { runMigrationIfNeeded } from './migration'
import { projectsRepo, tasksRepo, teamRepo } from './repository'
import { initDemoData } from './migration'

export async function initDatabase() {
  const migration = await runMigrationIfNeeded()

  const hasData = (await projectsRepo.count()) > 0

  if (!hasData) {
    await initDemoData()
  }

  return {
    migrationRun: migration.run,
    migrationResult: migration.result,
    demoDataInitialized: !hasData
  }
}

export async function resetDatabase() {
  await Promise.all([
    projectsRepo.clear(),
    tasksRepo.clear(),
    teamRepo.clear()
  ])
  await initDemoData()
}

export async function clearAllData() {
  await Promise.all([
    projectsRepo.clear(),
    tasksRepo.clear(),
    teamRepo.clear()
  ])
}

export async function getDatabaseStats() {
  return {
    projects: await projectsRepo.count(),
    tasks: await tasksRepo.count(),
    team: await teamRepo.count()
  }
}

export default {
  init: initDatabase,
  reset: resetDatabase,
  clear: clearAllData,
  stats: getDatabaseStats
}
