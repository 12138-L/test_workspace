<template>
  <div class="tasks-container">
    <n-page-header title="任务管理" subtitle="管理所有团队任务">
      <template #extra>
        <n-space>
          <n-radio-group v-model:value="viewMode" size="small">
            <n-radio-button value="list">列表</n-radio-button>
            <n-radio-button value="kanban">看板</n-radio-button>
          </n-radio-group>
          <n-select
            v-model:value="tasksStore.statusFilter"
            :options="filterOptions"
            placeholder="筛选状态"
            style="width: 120px"
            clearable
          />
          <n-button type="primary" @click="handleCreateTask">
            <template #icon>
              <span v-html="Icons.add" class="icon-btn"></span>
            </template>
            新建任务
          </n-button>
        </n-space>
      </template>
    </n-page-header>

    <n-card style="margin-top: 20px">
      <template #header v-if="viewMode === 'list'">
        <div class="card-header">
          <span>任务列表</span>
          <n-input
            v-model:value="localSearch"
            placeholder="搜索任务"
            style="width: 240px"
            clearable
          >
            <template #prefix>
              <span v-html="Icons.search" class="icon-btn"></span>
            </template>
          </n-input>
        </div>
      </template>

      <n-spin :show="tasksStore.loading" description="加载中...">
        <div v-if="viewMode === 'list'">
          <n-data-table
            :columns="columns"
            :data="tasksStore.filteredTasks"
            :pagination="pagination"
            striped
            virtual-scroll
            :max-height="550"
            :row-properties="
              (row: Task) => ({
                style: 'cursor: pointer',
                onClick: () => handleEdit(row)
              })
            "
          >
            <template #empty>
              <DataTableEmpty
                title="暂无任务"
                description="点击下方按钮创建第一个任务"
                create-text="新建任务"
                @create="handleCreateTask"
              />
            </template>
          </n-data-table>
        </div>

        <div v-else class="kanban-wrapper">
          <KanbanBoard
            :tasks="tasksStore.filteredTasks"
            @task-click="handleEdit"
            @task-delete="handleDelete"
            @status-change="handleStatusChange"
          />
        </div>
      </n-spin>
    </n-card>

    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="editingTask ? '编辑任务' : '新建任务'"
      style="width: 500px"
    >
      <n-form :model="formData" label-placement="left" label-width="100">
        <n-form-item label="任务标题" required>
          <n-input v-model:value="formData.title" placeholder="请输入任务标题" />
        </n-form-item>
        <n-form-item label="任务内容">
          <n-input
            v-model:value="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入任务详情描述"
          />
        </n-form-item>
        <n-form-item label="备注">
          <n-input
            v-model:value="formData.remark"
            type="textarea"
            :rows="2"
            placeholder="添加备注信息"
          />
        </n-form-item>
        <n-form-item label="负责人">
          <n-input v-model:value="formData.assignee" placeholder="请输入负责人" />
        </n-form-item>
        <n-form-item label="优先级">
          <n-select v-model:value="formData.priority" :options="priorityOptions" />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="formData.status" :options="statusOptions" />
        </n-form-item>
        <n-form-item label="开始日期">
          <n-date-picker
            v-model:value="formData.startTime as any"
            type="date"
            format="yyyy-MM-dd"
            value-format="timestamp"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="截止日期">
          <n-date-picker
            v-model:value="formData.dueDate as any"
            type="date"
            format="yyyy-MM-dd"
            value-format="timestamp"
            style="width: 100%"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false" :disabled="submitting">取消</n-button>
          <n-button type="primary" @click="handleSubmit" :loading="submitting">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import type { DataTableColumns, SelectOption } from 'naive-ui'
import { h, ref, onMounted, watch } from 'vue'
import { message, dialog } from '@/utils/naive'
import type { Task } from '@/types'
import { useTasksStore } from '@/stores/tasks'
import { getStatusType, getPriorityType } from '@/utils/formatters'
import { Icons } from '@/config/icons'
import DataTableActions from '@/components/DataTableActions.vue'
import DataTableEmpty from '@/components/DataTableEmpty.vue'
import KanbanBoard from '@/components/KanbanBoard.vue'

function debounce<T extends (..._args: any[]) => any>(fn: T, delay: number) {
  let timer: number
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = window.setTimeout(() => fn(...args), delay)
  }
}

const tasksStore = useTasksStore()

const viewMode = ref<'list' | 'kanban'>('kanban')
const showModal = ref(false)
const editingTask = ref<Task | null>(null)
const localSearch = ref('')
const submitting = ref(false)

const defaultFormData = {
  title: '',
  description: '',
  remark: '',
  assignee: '',
  priority: '中' as Task['priority'],
  status: '待开始' as Task['status'],
  startTime: null as number | null,
  dueDate: null as number | null
}

const formData = ref({ ...defaultFormData })

function resetForm() {
  editingTask.value = null
  formData.value = { ...defaultFormData }
}

const pagination = {
  pageSize: 10
}

const filterOptions: SelectOption[] = [
  { label: '待开始', value: '待开始' },
  { label: '进行中', value: '进行中' },
  { label: '已完成', value: '已完成' },
  { label: '已延期', value: '已延期' }
]

const statusOptions = [
  { label: '待开始', value: '待开始' },
  { label: '进行中', value: '进行中' },
  { label: '已完成', value: '已完成' },
  { label: '已延期', value: '已延期' }
]

const priorityOptions = [
  { label: '高', value: '高' },
  { label: '中', value: '中' },
  { label: '低', value: '低' }
]

const columns: DataTableColumns<Task> = [
  {
    title: '任务信息',
    key: 'title',
    width: 280,
    render: (row: Task) =>
      h('div', { class: 'task-info-cell' }, [
        h('div', { class: 'task-title' }, row.title),
        row.description ? h('div', { class: 'task-desc' }, row.description) : null
      ])
  },
  {
    title: '负责人',
    key: 'assignee',
    width: 90
  },
  {
    title: '优先级',
    key: 'priority',
    width: 80,
    render: (row: Task) =>
      h(
        'n-tag',
        { type: getPriorityType(row.priority), size: 'small' },
        { default: () => row.priority }
      )
  },
  {
    title: '状态',
    key: 'status',
    width: 90,
    render: (row: Task) =>
      h('n-tag', { type: getStatusType(row.status), size: 'small' }, { default: () => row.status })
  },
  {
    title: '开始',
    key: 'startTime',
    width: 100
  },
  {
    title: '截止',
    key: 'dueDate',
    width: 100
  },
  {
    title: '备注',
    key: 'remark',
    width: 120,
    render: (row: Task) =>
      row.remark
        ? h(
            'n-tooltip',
            { trigger: 'hover', placement: 'top' },
            {
              default: () => row.remark,
              trigger: () =>
                h(
                  'span',
                  { class: 'remark-text' },
                  row.remark.slice(0, 12) + (row.remark.length > 12 ? '...' : '')
                )
            }
          )
        : h('span', { class: 'empty-text' }, '-')
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render: (row: Task) =>
      h(DataTableActions, {
        onEdit: () => handleEdit(row),
        onDelete: () => handleDelete(row)
      })
  }
]

function handleCreateTask() {
  resetForm()
  showModal.value = true
}

function parseDateString(dateStr: string): number | null {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date.getTime()
}

function formatTimestamp(timestamp: number | null): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function handleEdit(task: Task) {
  editingTask.value = task
  formData.value = {
    title: task.title,
    description: task.description || '',
    remark: task.remark || '',
    assignee: task.assignee,
    priority: task.priority,
    status: task.status,
    startTime: parseDateString(task.startTime),
    dueDate: parseDateString(task.dueDate)
  }
  showModal.value = true
}

function handleDelete(task: Task) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除任务「${task.title}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      await tasksStore.deleteTask(task.id)
      message.success('已删除')
    }
  })
}

async function handleStatusChange(taskId: number, newStatus: Task['status']) {
  await tasksStore.updateTask(taskId, { status: newStatus })
  message.success('任务状态已更新')
}

async function handleSubmit() {
  if (submitting.value) return

  const title = formData.value.title?.trim()
  if (!title) {
    message.warning('请输入任务标题')
    return
  }

  submitting.value = true
  try {
    const submitData = {
      ...formData.value,
      title,
      description: formData.value.description?.trim() || '',
      remark: formData.value.remark?.trim() || '',
      assignee: formData.value.assignee?.trim() || '',
      startTime: formatTimestamp(formData.value.startTime as number | null),
      dueDate: formatTimestamp(formData.value.dueDate as number | null)
    }

    if (editingTask.value) {
      await tasksStore.updateTask(editingTask.value.id, submitData)
      message.success('任务已更新')
    } else {
      await tasksStore.addTask(submitData)
      message.success('任务创建成功')
    }

    showModal.value = false
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  tasksStore.fetchTasks()
  localSearch.value = tasksStore.searchKeyword
})

const setSearchDebounced = debounce((value: string) => {
  tasksStore.setSearchKeyword(value)
}, 300)

watch(localSearch, value => {
  setSearchDebounced(value)
})

watch(showModal, open => {
  if (!open) {
    resetForm()
  }
})
</script>

<style scoped>
.tasks-container {
  padding: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kanban-wrapper {
  padding: 8px 0;
}

.task-info-cell {
  line-height: 1.4;
}

.task-info-cell .task-title {
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 2px;
}

.task-info-cell .task-desc {
  font-size: 12px;
  color: #86909c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remark-text {
  cursor: help;
  color: #4e5969;
}

.empty-text {
  color: #c9cdd4;
}
</style>
