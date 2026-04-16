/**
 * useFileUpload - 文件上传核心逻辑
 *
 * 【职责】
 * ✅ 列表视图拖拽上传
 * ✅ 弹窗上传
 * ✅ 文件名生成
 */

import { ref } from 'vue'
import type { FileCategory, TeamMember } from '@/types'
import { fileDB } from '@/db/repository'
import { useAsync } from '@/utils/async'
import { message } from '@/utils/naive'
import { encryptFile, importEncryptionKey } from '@/utils/crypto'
import { useUserStore } from '@/stores/user'
import type { useTeamStore } from '@/stores/team'

type TeamStore = ReturnType<typeof useTeamStore>

interface UploadOptions {
  stores: { team: TeamStore }
  onFilesChanged: () => void
}

export function useFileUpload(options: UploadOptions) {
  const { stores, onFilesChanged } = options
  const userStore = useUserStore()

  const showUploadModal = ref(false)
  const dragOverTarget = ref<string | null>(null)
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const uploadingFileName = ref('')
  const abortController = ref<AbortController | null>(null)

  function generateListFileName(
    originalName: string,
    index: number,
    category: string,
    memberId: number | undefined
  ): string {
    const ext = originalName.split('.').pop() || ''
    const dateStr = new Date().toISOString().slice(0, 10)
    const timeStamp = String(Date.now()).slice(-4)
    const member = memberId
      ? stores.team.list.find((m: TeamMember) => m.id === memberId)?.name || ''
      : ''
    const prefix = member ? `${member}_${category}` : category
    return `${prefix}_${dateStr}_${timeStamp}_${index + 1}.${ext}`
  }

  function cancelUpload(): void {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
      isUploading.value = false
      uploadProgress.value = 0
      uploadingFileName.value = ''
      message.info('已取消上传')
    }
  }

  const { execute: handleListDrop } = useAsync(
    async (...args: unknown[]) => {
      const e = args[0] as DragEvent
      const category = args[1] as string
      const memberId = args[2] as number | undefined
      e.preventDefault()
      dragOverTarget.value = null

      if (!e.dataTransfer?.files) return

      isUploading.value = true
      uploadProgress.value = 0
      abortController.value = new AbortController()

      try {
        const fileList = Array.from(e.dataTransfer.files)
        const cryptoKey = userStore.encryptionKey
          ? await importEncryptionKey(userStore.encryptionKey)
          : null

        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i]
          uploadingFileName.value = file.name
          const newFileName = generateListFileName(file.name, i, category, memberId)
          const memberName = memberId
            ? stores.team.list.find((m: TeamMember) => m.id === memberId)?.name || ''
            : ''

          let fileData = ''
          let encrypted = false
          let encryptionIv = ''
          let originalType = file.type || 'application/octet-stream'

          if (cryptoKey) {
            const encryptedResult = await encryptFile(cryptoKey, file, p => {
              uploadProgress.value = Math.round((p.progress + i * 100) / fileList.length)
            })
            fileData = encryptedResult.encryptedData
            encryptionIv = encryptedResult.iv
            originalType = encryptedResult.originalType
            encrypted = true
          } else {
            uploadProgress.value = Math.round(((i + 1) / fileList.length) * 100)
          }

          await fileDB.addFile({
            originalName: file.name,
            name: newFileName,
            size: file.size,
            category: category as FileCategory,
            type: 'application/octet-stream-encrypted',
            data: fileData,
            encrypted,
            encryptionIv,
            originalType,
            uploadedAt: Date.now(),
            memberId: memberId || 0,
            memberName
          })
        }

        const encryptedCount = cryptoKey ? fileList.length : 0
        message.success(
          `成功上传 ${fileList.length} 个文件${encryptedCount > 0 ? ` (已加密 ${encryptedCount} 个)` : ''}`
        )
        onFilesChanged()
      } finally {
        isUploading.value = false
        uploadProgress.value = 0
        uploadingFileName.value = ''
        abortController.value = null
      }
    },
    {
      errorMessage: '文件上传失败',
      maxRetries: 1
    }
  )

  async function handleModalUpload() {
    message.success('上传成功')
    showUploadModal.value = false
    onFilesChanged()
  }

  return {
    showUploadModal,
    isUploading,
    uploadProgress,
    uploadingFileName,
    handleListDrop,
    handleModalUpload,
    generateListFileName,
    cancelUpload
  }
}
