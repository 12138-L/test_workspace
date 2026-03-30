import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = 'TaskManagerSecretKey2024'

export function toPlainObject(obj) {
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj
  return JSON.parse(JSON.stringify(obj))
}

export function encrypt(data) {
  const jsonString = JSON.stringify(data)
  const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString()
  return encrypted
}

export function decrypt(encryptedData) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8)
    return JSON.parse(decryptedString)
  } catch (error) {
    console.error('Decryption failed:', error)
    return null
  }
}

export function encryptField(value) {
  if (value === null || value === undefined) return value
  return encrypt(value)
}

export function decryptField(encryptedValue) {
  if (!encryptedValue) return encryptedValue
  return decrypt(encryptedValue)
}

export function hashPassword(password) {
  return CryptoJS.SHA256(password).toString()
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
