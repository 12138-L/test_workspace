<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import { h } from 'vue'
import type { FileRecord } from '@/types'
import { formatFileSize, formatDateTime } from '@/utils/formatters'
import { Icons } from '@/config/icons'
import { NButton } from 'naive-ui'

interface Props {
  files: FileRecord[]
  selectedRowKeys: (number | string)[]
  loading: boolean
}

const _props = defineProps<Props>()

const emit = defineEmits<{
  'update:selectedRowKeys': [keys: (number | string)[]]
  download: [file: FileRecord]
  edit: [file: FileRecord]
  delete: [file: FileRecord]
}>()

function getCategoryTagType(category: string): string {
  const typeMap: Record<string, string> = {
    周报: 'info',
    月报: 'primary',
    证件: 'warning',
    合同: 'success',
    报告: 'error',
    考勤: 'default',
    其他: 'info'
  }
  return typeMap[category] || 'default'
}

const columns: DataTableColumns<FileRecord> = [
  {
    type: 'selection',
    width: 50
  },
  {
    title: '文件名',
    key: 'originalName',
    ellipsis: { tooltip: true },
    minWidth: 180,
    render: row =>
      h('div', { class: 'file-name-cell', title: row.originalName }, [
        h('span', { class: 'file-name-text' }, row.originalName)
      ])
  },
  {
    title: '分类',
    key: 'category',
    width: 90,
    render: row =>
      h(
        'n-tag',
        { type: getCategoryTagType(row.category), size: 'small', round: true },
        { default: () => row.category }
      )
  },
  {
    title: '关联人员',
    key: 'memberName',
    width: 90,
    render: row => row.memberName || h('n-text', { depth: 3 }, '-')
  },
  {
    title: '大小',
    key: 'size',
    width: 85,
    render: row => h('n-text', { code: true, depth: 2 }, formatFileSize(row.size))
  },
  {
    title: '上传时间',
    key: 'uploadedAt',
    width: 150,
    render: row => h('n-text', { depth: 2 }, formatDateTime(new Date(row.uploadedAt)))
  },
  {
    title: '备注',
    key: 'remark',
    ellipsis: { tooltip: true },
    minWidth: 100,
    render: row => row.remark || h('n-text', { depth: 3 }, '-')
  },
  {
    title: '操作',
    key: 'actions',
    width: 110,
    fixed: 'right',
    render: (row: FileRecord) =>
      h('div', { class: 'table-actions' }, [
        h(
          NButton,
          {
            size: 'tiny',
            quaternary: true,
            onClick: () => emit('download', row),
            title: '下载',
            style: { color: '#18a058' }
          },
          {
            icon: () =>
              h('span', {
                innerHTML: Icons.download,
                style:
                  'width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;'
              })
          }
        ),
        h(
          NButton,
          {
            size: 'tiny',
            quaternary: true,
            onClick: () => emit('edit', row),
            title: '编辑',
            style: { color: '#2080f0' }
          },
          {
            icon: () =>
              h('span', {
                innerHTML: Icons.edit,
                style:
                  'width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;'
              })
          }
        ),
        h(
          NButton,
          {
            size: 'tiny',
            quaternary: true,
            onClick: () => emit('delete', row),
            title: '删除',
            style: { color: '#d03050' }
          },
          {
            icon: () =>
              h('span', {
                innerHTML: Icons.delete,
                style:
                  'width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;'
              })
          }
        )
      ])
  }
]

const pagination = {
  pageSize: 10
}
</script>

<template>
  <n-spin :show="loading" description="加载中...">
    <n-data-table
      :checked-row-keys="selectedRowKeys"
      @update:checked-row-keys="keys => emit('update:selectedRowKeys', keys)"
      :row-key="(row: FileRecord) => row.id"
      :columns="columns"
      :data="files"
      :pagination="pagination"
      :max-height="380"
    >
      <template #empty>
        <DataTableEmpty title="暂无文件" description="拖拽文件到上方区域或点击上传按钮" />
      </template>
    </n-data-table>
  </n-spin>
</template>

<style scoped>
.file-name-cell {
  display: flex;
  align-items: center;
  padding: 2px 0;
}

.file-name-text {
  font-weight: 500;
  color: #24292f;
  transition: color 0.2s;
  font-size: 13px;
}

.file-name-cell:hover .file-name-text {
  color: #18a058;
}

.table-actions {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
}

.table-actions svg {
  width: 16px !important;
  height: 16px !important;
  min-width: 16px !important;
  min-height: 16px !important;
  max-width: 16px !important;
  max-height: 16px !important;
  display: block !important;
}

:deep(.n-data-table tr:hover td) {
  background-color: #fafbfc !important;
}

:deep(.n-data-table th) {
  background-color: #f6f8fa !important;
  font-weight: 600 !important;
  color: #24292f !important;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}

:deep(.n-data-table td) {
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}
</style>
