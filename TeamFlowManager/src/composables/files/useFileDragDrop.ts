/**
 * useFileDragDrop - 文件拖拽核心逻辑
 *
 * 【职责】
 * ✅ 拖拽事件处理
 * ✅ 拖拽状态管理
 * ✅ 放置目标匹配
 */

import { ref, type Ref } from 'vue'
import type { FileCategory, TeamMember } from '@/types'
import { fileDB } from '@/db/repository'
import { useAsync } from '@/utils/async'
import { message } from '@/utils/naive'
import { encryptFile, importEncryptionKey } from '@/utils/crypto'
import { useUserStore } from '@/stores/user'
import type { useTeamStore } from '@/stores/team'

type TeamStore = ReturnType<typeof useTeamStore>

export interface DropTarget {
  id: string
  name: string
  type: 'member' | 'category'
  category?: string
  memberId?: number
}

interface DragDropOptions {
  stores: { team: TeamStore }
  onFilesChanged: () => void
}

export function useFileDragDrop(
  options: DragDropOptions & {
    viewMode: Ref<'byMember' | 'byCategory'>
    selectedMemberId: Ref<number | undefined>
    selectedCategory: string
  }
) {
  const {
    stores,
    onFilesChanged,
    viewMode: _viewMode,
    selectedMemberId: _selectedMemberId,
    selectedCategory: _selectedCategory
  } = options
  const userStore = useUserStore()

  const dragOverTarget = ref<string | null>(null)

  function isDragOver(targetId: string): boolean {
    return dragOverTarget.value === targetId
  }

  function handleDragOver(e: DragEvent, targetId: string) {
    e.preventDefault()
    dragOverTarget.value = targetId
  }

  function handleDragLeave() {
    dragOverTarget.value = null
  }

  function generateFileName(
    originalName: string,
    target: DropTarget,
    index: number,
    stores: { team: TeamStore },
    selectedMemberId: number | undefined,
    selectedCategory: string
  ): string {
    const ext = originalName.split('.').pop() || ''
    const dateStr = new Date().toISOString().slice(0, 10)
    const timeStamp = String(Date.now()).slice(-4)

    if (target.type === 'member') {
      const member = stores.team.list.find((m: TeamMember) => m.id === selectedMemberId)
      return `${member?.name || '未知'}_${selectedCategory}_${dateStr}_${timeStamp}_${index + 1}.${ext}`
    } else {
      const member = stores.team.list.find((m: TeamMember) => m.id === selectedMemberId)
      return `${member?.name || '未知'}_${target.category}_${dateStr}_${timeStamp}_${index + 1}.${ext}`
    }
  }

  const { execute: handleDrop } = useAsync(
    async (...args: unknown[]) => {
      const e = args[0] as DragEvent
      const target = args[1] as DropTarget

      e.preventDefault()
      dragOverTarget.value = null

      if (!e.dataTransfer?.files) return

      const fileList = Array.from(e.dataTransfer.files)
      const cryptoKey = userStore.encryptionKey
        ? await importEncryptionKey(userStore.encryptionKey)
        : null

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i]
        const category =
          target.type === 'category'
            ? (target.category as FileCategory) || '其他'
            : ('其他' as FileCategory)
        const memberId = _viewMode.value === 'byMember' ? _selectedMemberId.value : target.memberId
        const memberName = memberId
          ? stores.team.list.find((m: TeamMember) => m.id === memberId)?.name || ''
          : ''
        const newFileName = generateFileName(
          file.name,
          target,
          i,
          stores,
          _selectedMemberId.value,
          _selectedCategory
        )

        let fileData = ''
        let encrypted = false
        let encryptionIv = ''
        let originalType = file.type || 'application/octet-stream'

        if (cryptoKey) {
          const encryptedResult = await encryptFile(cryptoKey, file)
          fileData = encryptedResult.encryptedData
          encryptionIv = encryptedResult.iv
          originalType = encryptedResult.originalType
          encrypted = true
        }

        await fileDB.addFile({
          originalName: file.name,
          name: newFileName,
          size: file.size,
          category,
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
    },
    {
      errorMessage: '文件上传失败',
      maxRetries: 1
    }
  )

  return {
    dragOverTarget,
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop
  }
}
