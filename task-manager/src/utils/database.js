import { openDB } from 'idb'

const DB_NAME = 'TaskManagerDB'
const DB_VERSION = 1

const STORES = {
  TASKS: 'tasks',
  CALENDAR: 'calendar',
  SETTINGS: 'settings',
  DAILY_TASKS: 'daily_tasks',
  BACKUPS: 'backups'
}

let dbInstance = null

export async function getDB() {
  if (dbInstance) return dbInstance
  
  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (!db.objectStoreNames.contains(STORES.TASKS)) {
        const taskStore = db.createObjectStore(STORES.TASKS, { keyPath: 'id' })
        taskStore.createIndex('type', 'type')
        taskStore.createIndex('priority', 'priority')
        taskStore.createIndex('status', 'status')
        taskStore.createIndex('dueDate', 'dueDate')
        taskStore.createIndex('createdAt', 'createdAt')
      }
      
      if (!db.objectStoreNames.contains(STORES.CALENDAR)) {
        const calendarStore = db.createObjectStore(STORES.CALENDAR, { keyPath: 'id' })
        calendarStore.createIndex('date', 'date')
        calendarStore.createIndex('type', 'type')
      }
      
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' })
      }
      
      if (!db.objectStoreNames.contains(STORES.DAILY_TASKS)) {
        const dailyStore = db.createObjectStore(STORES.DAILY_TASKS, { keyPath: 'id' })
        dailyStore.createIndex('date', 'date')
        dailyStore.createIndex('templateId', 'templateId')
      }
      
      if (!db.objectStoreNames.contains(STORES.BACKUPS)) {
        const backupStore = db.createObjectStore(STORES.BACKUPS, { keyPath: 'id' })
        backupStore.createIndex('createdAt', 'createdAt')
      }
    }
  })
  
  return dbInstance
}

export async function addItem(storeName, item) {
  const db = await getDB()
  return await db.add(storeName, item)
}

export async function updateItem(storeName, item) {
  const db = await getDB()
  return await db.put(storeName, item)
}

export async function getItem(storeName, id) {
  const db = await getDB()
  return await db.get(storeName, id)
}

export async function getAllItems(storeName) {
  const db = await getDB()
  return await db.getAll(storeName)
}

export async function deleteItem(storeName, id) {
  const db = await getDB()
  return await db.delete(storeName, id)
}

export async function clearStore(storeName) {
  const db = await getDB()
  return await db.clear(storeName)
}

export async function getItemsByIndex(storeName, indexName, value) {
  const db = await getDB()
  return await db.getAllFromIndex(storeName, indexName, value)
}

export async function getItemsByDateRange(storeName, indexName, start, end) {
  const db = await getDB()
  const range = IDBKeyRange.bound(start, end)
  return await db.getAllFromIndex(storeName, indexName, range)
}

export { STORES }
