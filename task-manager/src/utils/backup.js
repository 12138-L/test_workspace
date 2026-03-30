import { getAllItems, clearStore, addItem, STORES } from './database'
import { encrypt, decrypt } from './encryption'

export async function exportBackup() {
  const backup = {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    data: {}
  }
  
  for (const storeName of Object.values(STORES)) {
    const items = await getAllItems(storeName)
    backup.data[storeName] = items
  }
  
  const encryptedBackup = encrypt(backup)
  return encryptedBackup
}

export async function importBackup(encryptedBackup) {
  try {
    const backup = decrypt(encryptedBackup)
    
    if (!backup || !backup.data) {
      throw new Error('Invalid backup file')
    }
    
    for (const [storeName, items] of Object.entries(backup.data)) {
      await clearStore(storeName)
      for (const item of items) {
        await addItem(storeName, item)
      }
    }
    
    return true
  } catch (error) {
    console.error('Import backup failed:', error)
    return false
  }
}

export function downloadBackup(encryptedData) {
  const blob = new Blob([encryptedData], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `task-manager-backup-${new Date().toISOString().split('T')[0]}.tmbackup`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function readBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target.result)
    }
    reader.onerror = () => {
      reject(new Error('Failed to read backup file'))
    }
    reader.readAsText(file)
  })
}

export async function validateBackup(encryptedBackup) {
  try {
    const backup = decrypt(encryptedBackup)
    return backup && backup.version && backup.data
  } catch {
    return false
  }
}
