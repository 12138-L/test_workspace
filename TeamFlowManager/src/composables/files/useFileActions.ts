import { message } from '@/utils/naive'
import { decryptFile, downloadDecryptedFile, importEncryptionKey } from '@/utils/crypto'
import { useUserStore } from '@/stores/user'
import type { FileRecord } from '@/types'
import { logger } from '@/utils/logger'

export function useFileActions() {
  const userStore = useUserStore()

  async function handleDownload(file: FileRecord) {
    let loadingMessage: { destroy: () => void } | null = null

    try {
      if (file.encrypted && file.data && file.encryptionIv) {
        if (!userStore.encryptionKey) {
          message.error('文件已加密，请重新登录以获取解密密钥')
          return
        }

        loadingMessage = message.loading('正在解密文件...', { duration: 0 })

        const cryptoKey = await importEncryptionKey(userStore.encryptionKey)
        const blob = await decryptFile(
          cryptoKey,
          file.data,
          file.encryptionIv,
          file.originalType || 'application/octet-stream'
        )

        downloadDecryptedFile(blob, file.originalName)
        message.success('文件解密下载成功 🔓')
        logger.info('[File] Decrypted download:', file.originalName)
      } else {
        const blob = new Blob([file.data || ''], {
          type: file.type || 'application/octet-stream'
        })
        downloadDecryptedFile(blob, file.originalName)
        message.success('文件下载成功')
        logger.info('[File] Plain download:', file.originalName)
      }
    } catch (e) {
      logger.error('[File] Download failed:', e)
      const errorMessage = e instanceof Error ? e.message : '文件下载/解密失败，请重试'
      message.error(errorMessage)
    } finally {
      if (loadingMessage) {
        loadingMessage.destroy()
      }
    }
  }

  function getEncryptionBadge(file: FileRecord): {
    type: 'success' | 'info' | 'default'
    text: string
  } {
    if (file.encrypted) {
      return { type: 'success', text: '🔐 已加密' }
    }
    return { type: 'info', text: '📄 明文' }
  }

  return {
    handleDownload,
    getEncryptionBadge
  }
}
