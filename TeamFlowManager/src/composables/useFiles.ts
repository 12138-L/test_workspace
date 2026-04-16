/**
 * useFiles - 文件管理组合入口
 *
 * 【架构设计 - 按职责拆分】
 * useFiles (主入口)
 *   ├── useFileDragDrop  - 拖拽事件处理
 *   ├── useFileUpload    - 文件上传逻辑
 *   └── useFileGridView  - 视图与分组
 *
 * 【依赖注入原则】
 * ✅ stores 从参数传入，支持测试时 Mock
 * ✅ message 内部获取，符合 naive-ui 约定
 * ✅ 子 composable 通过回调通信
 */

import { ref } from 'vue'
import type { FileRecord } from '@/types'
import { fileDB } from '@/db/repository'
import { useAsync } from '@/utils/async'
import { message } from '@/utils/naive'
import type { useTeamStore } from '@/stores/team'

import { useFileDragDrop } from './files/useFileDragDrop'
import { useFileUpload } from './files/useFileUpload'
import { useFileGridView } from './files/useFileGridView'
import { useFileActions } from './files/useFileActions'

type TeamStore = ReturnType<typeof useTeamStore>

export type { DropTarget } from './files/useFileDragDrop'

export function useFiles(stores: { team: TeamStore }) {
  type ViewMode = 'list' | 'byType' | 'byMember'

  const loading = ref(false)
  const viewMode = ref<ViewMode>('list')
  const files = ref<FileRecord[]>([])
  const selectedRowKeys = ref<(number | string)[]>([])
  const showEditModal = ref(false)
  const editingFile = ref<FileRecord | null>(null)

  async function loadFiles() {
    loading.value = true
    try {
      files.value = await fileDB.getAllFiles()
    } finally {
      loading.value = false
    }
  }

  function loadGroupedData() {
    loadFiles()
  }

  const gridView = useFileGridView({ stores, files, viewMode })
  const fileActions = useFileActions()

  const dragDrop = useFileDragDrop({
    stores,
    onFilesChanged: loadFiles,
    viewMode: viewMode as Ref<'byMember' | 'byCategory'>,
    selectedMemberId: gridView.selectedMemberId,
    selectedCategory: gridView.selectedCategory.value
  })

  const upload = useFileUpload({
    stores,
    onFilesChanged: loadFiles
  })

  const { execute: handleDownload } = useAsync(
    async (...args: unknown[]) => {
      const file = args[0] as FileRecord
      await fileActions.handleDownload(file)
    },
    {
      errorMessage: '下载失败',
      maxRetries: 1
    }
  )

  const { execute: handleDelete } = useAsync(
    async (...args: unknown[]) => {
      const file = args[0] as FileRecord
      await fileDB.deleteFile(file.id!)
      message.success(`文件「${file.originalName}」已删除`)
      loadFiles()
    },
    {
      errorMessage: '删除失败',
      maxRetries: 1
    }
  )

  async function handleBatchDelete() {
    if (selectedRowKeys.value.length === 0) {
      message.warning('请选择要删除的文件')
      return
    }
    for (const id of selectedRowKeys.value) {
      await fileDB.deleteFile(Number(id))
    }
    message.success(`成功删除 ${selectedRowKeys.value.length} 个文件`)
    selectedRowKeys.value = []
    loadFiles()
  }

  function handleEdit(file: FileRecord) {
    editingFile.value = file
    showEditModal.value = true
  }

  const { execute: handleSaveEdit } = useAsync(
    async () => {
      if (!editingFile.value) return
      await fileDB.updateFile(editingFile.value.id!, {
        category: editingFile.value.category,
        originalName: editingFile.value.originalName
      })
      message.success('文件信息已更新')
      showEditModal.value = false
      loadFiles()
    },
    {
      errorMessage: '保存失败',
      maxRetries: 1
    }
  )

  return {
    loading,
    viewMode,
    files,
    selectedRowKeys,
    showEditModal,
    editingFile,
    loadFiles,
    loadGroupedData,
    handleDownload,
    handleDelete,
    handleBatchDelete,
    handleEdit,
    handleSaveEdit,
    getEncryptionBadge: fileActions.getEncryptionBadge,

    ...gridView,
    ...dragDrop,
    ...upload
  }
}
