<template>
  <div class="tasks-container">
    <n-page-header title="任务管理" subtitle="管理所有团队任务">
      <template #extra>
        <n-space>
          <n-select
            v-model:value="statusFilter"
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
      <template #header>
        <div class="card-header">
          <span>任务列表</span>
          <n-input
            v-model:value="tasksStore.searchKeyword"
            placeholder="搜索任务"
            style="width: 240px"
            clearable
            @update:value="handleSearch"
          >
            <template #prefix>🔍</template>
          </n-input>
        </div>
      </template>

      <n-spin :show="loading">
        <template #description>加载中...</template>
        <n-data-table
          :columns="columns"
          :data="tasksStore.filteredTasks"
          :pagination="pagination"
          virtual-scroll
          :max-height="500"
        />
      </n-spin>
    </n-card>

    <n-modal v-model:show="showModal" preset="card" :title="editingTask ? '编辑任务' : '新建任务'" style="width: 500px">
      <n-form :model="formData" label-placement="left" label-width="100">
        <n-form-item label="任务标题" required>
          <n-input v-model:value="formData.title" placeholder="请输入任务标题" />
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
        <n-form-item label="截止日期">
          <n-date-picker v-model:value="formData.dueDate as any" type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" style="width: 100%" />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">确定</n-button>
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

const tasksStore = useTasksStore()
const loading = ref(false)
const statusFilter = ref<string | null>(null)
const showModal = ref(false)
const editingTask = ref<Task | null>(null)

const formData = ref({
  title: '',
  assignee: '',
  priority: '中' as Task['priority'],
  status: '待开始' as Task['status'],
  dueDate: ''
})

const pagination = {
  pageSize: 10
}

const filterOptions: SelectOption[] = [
  { label: '待开始', value: '待开始' },
  { label: '进行中', value: '进行中' },
  { label: '已完成', value: '已完成' },
  { label: '已延期', value: '已延期' }
]

const priorityOptions: SelectOption[] = [
  { label: '高', value: '高' },
  { label: '中', value: '中' },
  { label: '低', value: '低' }
]

const statusOptions: SelectOption[] = [
  { label: '待开始', value: '待开始' },
  { label: '进行中', value: '进行中' },
  { label: '已完成', value: '已完成' },
  { label: '已延期', value: '已延期' }
]

const columns: DataTableColumns<Task> = [
  {
    title: '任务标题',
    key: 'title'
  },
  {
    title: '负责人',
    key: 'assignee',
    width: 120
  },
  {
    title: '优先级',
    key: 'priority',
    width: 100,
    render: (row: Task) =>
      h(
        'n-tag',
        { type: getPriorityType(String(row.priority)), size: 'small' },
        { default: () => row.priority }
      )
  },
  {
    title: '状态',
    key: 'status',
    width: 120,
    render: (row: Task) =>
      h(
        'n-tag',
        { type: getStatusType(String(row.status)), size: 'small' },
        { default: () => row.status }
      )
  },
  {
    title: '截止日期',
    key: 'dueDate',
    width: 120
  },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    fixed: 'right',
    render: (row: Task) => [
      h(
        'n-button',
        { quaternary: true, circle: true, size: 'small', onClick: () => handleEdit(row) },
        {
          icon: () =>
            h('span', {
              innerHTML: Icons.edit,
              style: 'display: flex; width: 16px; height: 16px'
            })
        }
      ),
      h(
        'n-button',
        { quaternary: true, circle: true, size: 'small', onClick: () => handleDelete(row) },
        {
          icon: () =>
            h('span', {
              innerHTML: Icons.delete,
              style: 'display: flex; width: 16px; height: 16px; color: #d03050'
            })
        }
      )
    ]
  }
]

onMounted(() => {
  fetchTasks()
})

watch(statusFilter, () => {
  tasksStore.setStatusFilter(statusFilter.value)
})

const fetchTasks = async () => {
  loading.value = true
  try {
    await tasksStore.fetchTasks()
  } catch (error) {
    message.error('加载任务失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = (value: string) => {
  tasksStore.setSearchKeyword(value)
}

const handleCreateTask = () => {
  editingTask.value = null
  formData.value = {
    title: '',
    assignee: '',
    priority: '中',
    status: '待开始',
    dueDate: new Date().toISOString().slice(0, 10)
  }
  showModal.value = true
}

const handleEdit = (task: Task) => {
  editingTask.value = task
  formData.value = { ...task }
  showModal.value = true
}

const handleDelete = (task: Task) => {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除任务「${task.title}」吗？此操作不可恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      tasksStore.deleteTask(task.id)
      message.success(`任务「${task.title}」已删除`)
    }
  })
}

const handleSubmit = () => {
  if (!formData.value.title.trim()) {
    message.warning('请输入任务标题')
    return
  }

  if (editingTask.value) {
    tasksStore.updateTask(editingTask.value.id, formData.value)
    message.success('任务已更新')
  } else {
    tasksStore.addTask(formData.value)
    message.success('任务创建成功')
  }

  showModal.value = false
}
</script>

<style scoped>
.tasks-container {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>
