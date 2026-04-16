/**
 * 数据库加密工具 - AES-GCM 256位
 *
 * 【安全标准】
 * ✅ Web Crypto API (浏览器原生)
 * ✅ AES-GCM 认证加密 (防篡改)
 * ✅ 每记录独立 IV (防重放)
 * ✅ PBKDF2 密钥派生 (10万轮)
 *
 * 【加密范围策略】
 * - 🔒 加密：个人隐私、联系方式、业务敏感数据
 * - 📤 明文：索引字段、ID、分类字段 (保证查询性能)
 */

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12
const SALT_LENGTH = 16
const PBKDF2_ITERATIONS = 100000

interface EncryptedData {
  iv: string
  data: string
}

interface EncryptionOptions {
  fields: string[]
  exclude: string[]
}

const DEFAULT_OPTIONS: EncryptionOptions = {
  fields: ['email', 'phone', 'remark', 'description', 'reason', 'content', 'password', 'token'],
  exclude: ['id', 'createdAt', 'updatedAt', 'status', 'type', 'category']
}

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  return btoa(String.fromCharCode(...bytes))
}

function base64ToBuffer(base64: string): ArrayBuffer {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer
}

async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function generateEncryptionKey(): Promise<string> {
  const key = await crypto.subtle.generateKey({ name: ALGORITHM, length: KEY_LENGTH }, true, [
    'encrypt',
    'decrypt'
  ])
  const rawKey = await crypto.subtle.exportKey('raw', key)
  return bufferToBase64(rawKey)
}

export async function deriveDeterministicKey(seed: string): Promise<string> {
  const encoder = new TextEncoder()
  const seedBuffer = encoder.encode(seed)

  const hashBuffer = await crypto.subtle.digest('SHA-256', seedBuffer)

  return bufferToBase64(hashBuffer)
}

export async function importEncryptionKey(keyString: string): Promise<CryptoKey> {
  const keyBuffer = base64ToBuffer(keyString)
  return crypto.subtle.importKey('raw', keyBuffer, { name: ALGORITHM, length: KEY_LENGTH }, false, [
    'encrypt',
    'decrypt'
  ])
}

export async function encryptValue(key: CryptoKey, plaintext: string): Promise<EncryptedData> {
  const encoder = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const dataBuffer = encoder.encode(plaintext)

  const encrypted = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, dataBuffer)

  return {
    iv: bufferToBase64(iv),
    data: bufferToBase64(encrypted)
  }
}

export async function decryptValue(key: CryptoKey, encrypted: EncryptedData): Promise<string> {
  const decoder = new TextDecoder()
  const iv = base64ToBuffer(encrypted.iv)
  const data = base64ToBuffer(encrypted.data)

  const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, data)

  return decoder.decode(decrypted)
}

function shouldEncryptField(fieldName: string, options: EncryptionOptions): boolean {
  if (options.exclude.includes(fieldName)) return false
  if (options.fields.includes(fieldName)) return true
  return false
}

export async function encryptRecord<T extends object>(
  key: CryptoKey,
  record: T,
  _options: EncryptionOptions = DEFAULT_OPTIONS
): Promise<T> {
  const result = { ...record } as Record<string, unknown>

  for (const [field, value] of Object.entries(result)) {
    if (value && typeof value === 'string' && shouldEncryptField(field, DEFAULT_OPTIONS)) {
      try {
        const encrypted = await encryptValue(key, value)
        result[field] = JSON.stringify(encrypted)
      } catch (e) {
        console.warn(`[Crypto] Failed to encrypt field ${field}:`, e)
      }
    }
  }

  return result as T
}

export async function decryptRecord<T extends object>(
  key: CryptoKey,
  record: T,
  _options: EncryptionOptions = DEFAULT_OPTIONS
): Promise<T> {
  const result = { ...record } as Record<string, unknown>

  for (const [field, value] of Object.entries(result)) {
    if (typeof value === 'string' && value.startsWith('{"iv":')) {
      try {
        const encrypted = JSON.parse(value) as EncryptedData
        result[field] = await decryptValue(key, encrypted)
      } catch (e) {
        console.warn(`[Crypto] Failed to decrypt field ${field}:`, e)
      }
    }
  }

  return result as T
}

export interface EncryptionProgress {
  loaded: number
  total: number
  progress: number
}

export async function encryptFile(
  key: CryptoKey,
  file: File,
  onProgress?: (_p: EncryptionProgress) => void
): Promise<{
  encryptedData: string
  iv: string
  originalType: string
  originalName: string
}> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const fileBuffer = await file.arrayBuffer()

  onProgress?.({ loaded: 0, total: file.size, progress: 0 })

  const chunkSize = 1024 * 1024
  const totalChunks = Math.ceil(fileBuffer.byteLength / chunkSize)
  const encryptedChunks: Uint8Array[] = []

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, fileBuffer.byteLength)
    const chunk = fileBuffer.slice(start, end)

    const encryptedChunk = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, chunk)

    encryptedChunks.push(new Uint8Array(encryptedChunk))
    onProgress?.({
      loaded: end,
      total: file.size,
      progress: Math.round(((i + 1) / totalChunks) * 100)
    })
  }

  const combined = new Uint8Array(encryptedChunks.reduce((sum, c) => sum + c.length, 0))
  let offset = 0
  for (const chunk of encryptedChunks) {
    combined.set(chunk, offset)
    offset += chunk.length
  }

  return {
    encryptedData: bufferToBase64(combined),
    iv: bufferToBase64(iv),
    originalType: file.type,
    originalName: file.name
  }
}

export async function decryptFile(
  key: CryptoKey,
  encryptedData: string,
  iv: string,
  originalType: string
): Promise<Blob> {
  try {
    const dataBuffer = base64ToBuffer(encryptedData)
    const ivBuffer = base64ToBuffer(iv)

    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: ivBuffer },
      key,
      dataBuffer
    )

    return new Blob([decrypted], { type: originalType })
  } catch (e) {
    if (e instanceof Error && e.name === 'OperationError') {
      throw new Error('解密验证失败：密钥不匹配或数据已损坏，请重新登录')
    }
    throw e
  }
}

export function downloadDecryptedFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function setupUserEncryption(
  password: string
): Promise<{ salt: string; encryptedKey: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const masterKey = await deriveKeyFromPassword(password, salt)
  const dataKey = await generateEncryptionKey()

  const encoder = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv as BufferSource },
    masterKey,
    encoder.encode(dataKey)
  )

  return {
    salt: bufferToBase64(salt.buffer as ArrayBuffer),
    encryptedKey: JSON.stringify({
      iv: bufferToBase64(iv.buffer as ArrayBuffer),
      data: bufferToBase64(encrypted)
    })
  }
}
