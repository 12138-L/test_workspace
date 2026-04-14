<template>
  <div class="files-container">
    <n-page-header title="文件管理" subtitle="管理团队文档和附件">
      <template #extra>
        <n-space>
          <n-radio-group v-model:value="viewMode" size="small">
            <n-radio-button value="list">列表视图</n-radio-button>
            <n-radio-button value="byType">按类型分组</n-radio-button>
            <n-radio-button value="byMember">按人员分组</n-radio-button>
          </n-radio-group>
        </n-space>
      </template>
    </n-page-header>

    <n-card v-if="viewMode === 'list'" style="margin-top: 20px" title="文件列表">
      <template #header-extra>
        <n-space>
          <n-button v-if="selectedRowKeys.length > 0" type="error" size="small" @click="handleBatchDelete">
            批量删除 ({{ selectedRowKeys.length }})
          </n-button>
          <n-select
            v-model:value="filterCategory"
            placeholder="分类筛选"
            clearable
            :options="categoryOptions"
            style="width: 120px"
          />
          <n-input
            v-model:value="searchKeyword"
            placeholder="搜索文件名"
            clearable
            style="width: 200px"
          />
          <n-button type="primary" size="small" @click="showUploadModal = true">
            <template #icon>
              <span v-html="Icons.upload" style="width: 16px; height: 16px"></span>
            </template>
            上传文件
          </n-button>
        </n-space>
      </template>

      <FileUploadArea
        :category-options="categoryOptions"
        :member-options="memberOptions"
        @drop="handleListDrop"
      />

      <FileListTable
        :files="filteredFiles"
        :selected-row-keys="selectedRowKeys"
        @update:selected-row-keys="(keys) => selectedRowKeys = keys"
        :loading="loading"
        @download="handleDownload"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </n-card>

    <n-card v-else style="margin-top: 20px">
      <template #header>
        <n-space align="center">
          <span class="card-title">{{ viewMode === 'byType' ? '按文件类型分组' : '按人员分组' }}</span>
          <n-select
            v-if="viewMode === 'byType'"
            v-model:value="selectedCategory"
            :options="categoryOptions"
            placeholder="选择文件类型"
            style="width: 150px"
            @update:value="loadGroupedData"
          />
          <n-select
            v-if="viewMode === 'byMember'"
            v-model:value="selectedMemberId"
            :options="memberOptions"
            placeholder="选择人员"
            clearable
            style="width: 150px"
            @update:value="loadGroupedData"
          />
        </n-space>
      </template>

      <FileGroupView
        :drop-targets="dropTargets"
        :files="files"
        :get-files-in-target="getFilesInTarget"
        :is-drag-over="isDragOver"
        @drag-over="handleDragOver"
        @drag-leave="handleDragLeave"
        @drop="handleDrop"
        @delete="handleDelete"
      />
    </n-card>

    <FileUploadModal
      v-model:show="showUploadModal"
      :category-options="categoryOptions"
      :member-options="memberOptions"
      @upload="handleModalUpload"
    />

    <FileEditModal
      v-model:show="showEditModal"
      :editing-file="editingFile"
      :category-options="categoryOptions"
      :member-options="memberOptions"
      @save="handleSaveEdit"
    />
  </div>
</template>

<script setup lang="ts">
import type { UploadCustomRequestOptions } from 'naive-ui'
import { ref, computed, onMounted } from 'vue'
import type { FileRecord, FileCategory } from '@/types'
import { fileDB } from '@/db/repository'
import { useTeamStore } from '@/stores/team'
import { message, dialog } from '@/utils/naive'
import { Icons } from '@/config/icons'
import FileListTable from '@/components/files/FileListTable.vue'
import FileUploadArea from '@/components/files/FileUploadArea.vue'
import FileUploadModal from '@/components/files/FileUploadModal.vue'
import FileEditModal from '@/components/files/FileEditModal.vue'
import FileGroupView from '@/components/files/FileGroupView.vue'

const teamStore = useTeamStore()

type ViewMode = 'list' | 'byType' | 'byMember'

const categoryOptions = [
  { label: '周报', value: '周报' },
  { label: '月报', value: '月报' },
  { label: '证件', value: '证件' },
  { label: '合同', value: '合同' },
  { label: '报告', value: '报告' },
  { label: '考勤', value: '考勤' },
  { label: '其他', value: '其他' }
]

const memberOptions = computed(() => {
  return teamStore.activeMembers.map(m => ({ label: m.name, value: m.id }))
})

const loading = ref(false)
const viewMode = ref<ViewMode>('list')
const files = ref<FileRecord[]>([])
const filterCategory = ref<FileCategory | null>(null)
const searchKeyword = ref('')
const selectedRowKeys = ref<(number | string)[]>([])

const showUploadModal = ref(false)
const showEditModal = ref(false)
const editingFile = ref<FileRecord | null>(null)

const selectedCategory = ref<string>('周报')
const selectedMemberId = ref<number | undefined>(undefined)
const dragOverTarget = ref<string | null>(null)

const filteredFiles = computed(() => {
  let result = [...files.value]
  if (filterCategory.value) {
    result = result.filter(f => f.category === filterCategory.value)
  }
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(f => f.originalName.toLowerCase().includes(keyword))
  }
  return result
})

interface DropTarget {
  id: string
  name: string
  type: 'member' | 'category'
  category?: string
  memberId?: number
}

const dropTargets = computed<DropTarget[]>(() => {
  if (viewMode.value === 'byType') {
    return teamStore.activeMembers.map(m => ({
      id: `member-${m.id}`,
      name: m.name,
      type: 'member' as const,
      memberId: m.id
    }))
  } else {
    return categoryOptions.map(c => ({
      id: `category-${c.value}`,
      name: c.label,
      type: 'category' as const,
      category: c.value
    }))
  }
})

function isDragOver(targetId: string): boolean {
  return dragOverTarget.value === targetId
}

function handleDragOver(_e: DragEvent, targetId: string) {
  dragOverTarget.value = targetId
}

function handleDragLeave(targetId: string) {
  if (dragOverTarget.value === targetId) {
    dragOverTarget.value = null
  }
}

function generateFileName(originalName: string, target: DropTarget, index: number): string {
  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const ext = originalName.split('.').pop() || ''
  const timeStamp = String(Date.now()).slice(-4)

  if (viewMode.value === 'byType') {
    return `${target.name}_${selectedCategory.value}_${dateStr}_${timeStamp}_${index + 1}.${ext}`
  } else {
    const member = teamStore.list.find(m => m.id === selectedMemberId.value)
    return `${member?.name || '未知'}_${target.category}_${dateStr}_${timeStamp}_${index + 1}.${ext}`
  }
}

async function handleDrop(e: DragEvent, target: DropTarget) {
  dragOverTarget.value = null
  const dataTransfer = e.dataTransfer

  if (!dataTransfer || dataTransfer.files.length === 0) {
    return
  }

  const dropFiles = Array.from(dataTransfer.files)

  for (let i = 0; i < dropFiles.length; i++) {
    const file = dropFiles[i]
    const reader = new FileReader()
    const dataUrl = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })

    const category = viewMode.value === 'byType'
      ? selectedCategory.value as FileCategory
      : (target.category as FileCategory) || '其他'
    const memberId = viewMode.value === 'byMember'
      ? selectedMemberId.value
      : target.memberId
    const memberName = memberId
      ? teamStore.list.find(m => m.id === memberId)?.name || ''
      : ''
    const newFileName = generateFileName(file.name, target, i)

    await fileDB.addFile({
      name: newFileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      category,
      data: dataUrl,
      memberId,
      memberName,
      remark: `自动命名: ${newFileName}`,
      uploadedAt: Date.now()
    })
  }

  message.success(`成功上传 ${dropFiles.length} 个文件`)
  await loadFiles()
  await loadGroupedData()
}

function getFilesInTarget(target: DropTarget): FileRecord[] {
  if (viewMode.value === 'byType') {
    return files.value.filter(f =>
      f.memberId === target.memberId &&
      f.category === selectedCategory.value
    )
  } else {
    return files.value.filter(f =>
      f.category === target.category &&
      f.memberId === selectedMemberId.value
    )
  }
}

async function loadFiles() {
  loading.value = true
  try {
    files.value = await fileDB.getAllFiles()
  } finally {
    loading.value = false
  }
}

async function loadGroupedData() {
  await loadFiles()
}

function handleDownload(file: FileRecord) {
  const link = document.createElement('a')
  link.href = file.data
  link.download = file.name
  link.click()
  message.success('开始下载')
}

async function handleDelete(file: FileRecord) {
  try {
    await fileDB.deleteFile(file.id)
    message.success('删除成功')
    await loadFiles()
  } catch (e) {
    message.error('删除失败')
  }
}

async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}

function generateListFileName(originalName: string, index: number, category: string, memberId?: number): string {
  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const ext = originalName.split('.').pop() || ''
  const timeStamp = String(Date.now()).slice(-4)
  const member = memberId ? teamStore.list.find(m => m.id === memberId)?.name || '' : ''
  const prefix = member ? `${member}_${category}` : category
  return `${prefix}_${dateStr}_${timeStamp}_${index + 1}.${ext}`
}

async function handleListDrop(e: DragEvent, category: string, memberId: number | undefined) {
  const dataTransfer = e.dataTransfer

  if (!dataTransfer || dataTransfer.files.length === 0) {
    return
  }

  const dropFiles = Array.from(dataTransfer.files)
  const memberName = memberId ? teamStore.list.find(m => m.id === memberId)?.name || '' : ''

  loading.value = true

  try {
    for (let i = 0; i < dropFiles.length; i++) {
      const file = dropFiles[i]
      const dataUrl = await readFileAsDataURL(file)
      const newFileName = generateListFileName(file.name, i, category, memberId)

      await fileDB.addFile({
        name: newFileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        category: category as FileCategory,
        data: dataUrl,
        memberId,
        memberName,
        remark: `拖拽上传: ${newFileName}`,
        uploadedAt: Date.now()
      })
    }

    message.success(`成功上传 ${dropFiles.length} 个文件`)
    await loadFiles()
  } catch (e) {
    message.error('上传失败')
  } finally {
    loading.value = false
  }
}

async function handleModalUpload(options: UploadCustomRequestOptions, form: { category: string, memberId: number | undefined, remark: string }) {
  const uploadFile = options.file.file as File
  const category = form.category || '其他'
  const memberId = form.memberId
  const memberName = memberId ? teamStore.list.find(m => m.id === memberId)?.name || '' : ''

  loading.value = true

  try {
    const dataUrl = await readFileAsDataURL(uploadFile)
    const newFileName = generateListFileName(uploadFile.name, 0, category, memberId)

    await fileDB.addFile({
      name: newFileName,
      originalName: uploadFile.name,
      size: uploadFile.size,
      type: uploadFile.type,
      category: category as FileCategory,
      data: dataUrl,
      memberId,
      memberName,
      remark: form.remark || newFileName,
      uploadedAt: Date.now()
    })

    message.success('上传成功')
    options.onFinish()
    showUploadModal.value = false
    await loadFiles()
  } catch (e) {
    message.error('上传失败')
  } finally {
    loading.value = false
  }
}

function handleEdit(file: FileRecord) {
  editingFile.value = file
  showEditModal.value = true
}

async function handleSaveEdit(form: { category: string, memberId: number | undefined, remark: string }) {
  if (!editingFile.value) {
    return
  }

  const memberName = form.memberId
    ? teamStore.list.find(m => m.id === form.memberId)?.name || ''
    : ''

  try {
    await fileDB.updateFile(editingFile.value.id, {
      category: form.category as FileCategory,
      memberId: form.memberId,
      memberName,
      remark: form.remark
    })
    message.success('保存成功')
    showEditModal.value = false
    editingFile.value = null
    await loadFiles()
  } catch (e) {
    message.error('保存失败')
  }
}

async function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    return
  }

  dialog.warning({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个文件吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      loading.value = true
      try {
        for (const id of selectedRowKeys.value) {
          await fileDB.deleteFile(Number(id))
        }
        message.success(`成功删除 ${selectedRowKeys.value.length} 个文件`)
        selectedRowKeys.value = []
        await loadFiles()
      } catch (e) {
        message.error('删除失败')
      } finally {
        loading.value = false
      }
    }
  })
}

onMounted(async () => {
  loading.value = true
  try {
    await teamStore.fetchTeam()
    await loadFiles()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.files-container {
  padding: 16px 20px;
}

.card-title {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}
</style>
