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

    <TaskForm
      v-model:show="showModal"
      :editing="!!editingTask"
      :form-data="formData"
      :loading="submitting"
      :priority-options="priorityOptions"
      :status-options="statusOptions"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * Tasks - 任务管理页面
 *
 * 【最终架构】
 * Tasks.vue                     ← 你在这：视图层 - 只负责布局
 *     ↓
 * TaskForm/KanbanBoard          ← 通用UI组件
 *     ↓
 * useTasks.ts                   ← 业务逻辑层 - CRUD + 防抖 + 表单
 */

import type { DataTableColumns } from 'naive-ui'
import { h, onMounted } from 'vue'
import { dialog } from '@/utils/naive'
import type { Task } from '@/types'
import { useTasksStore } from '@/stores/tasks'
import { getStatusType, getPriorityType } from '@/utils/formatters'
import { Icons } from '@/config/icons'
import { useTasks } from '@/composables/useTasks'
import DataTableActions from '@/components/DataTableActions.vue'
import DataTableEmpty from '@/components/DataTableEmpty.vue'
import KanbanBoard from '@/components/KanbanBoard.vue'
import TaskForm from '@/components/tasks/TaskForm.vue'

const tasksStore = useTasksStore()

const {
  viewMode,
  showModal,
  editingTask,
  localSearch,
  submitting,
  formData,
  pagination,
  filterOptions,
  statusOptions,
  priorityOptions,
  handleCreateTask,
  handleEdit,
  handleDelete,
  handleStatusChange,
  handleSubmit
} = useTasks({ tasks: tasksStore })

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
        onDelete: () => {
          dialog.warning({
            title: '确认删除',
            content: `确定要删除任务「${row.title}」吗？`,
            positiveText: '删除',
            negativeText: '取消',
            onPositiveClick: async () => {
              await handleDelete(row)
            }
          })
        }
      })
  }
]

onMounted(() => {
  tasksStore.fetchTasks()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kanban-wrapper {
  overflow-x: auto;
  padding-bottom: 8px;
}

.task-info-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-title {
  font-weight: 600;
  color: #333647;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 260px;
}

.task-desc {
  font-size: 12px;
  color: #8c9aa8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 260px;
}

.remark-text {
  cursor: help;
}

.empty-text {
  color: #8c9aa8;
}

.icon-btn {
  display: flex;
  width: 16px;
  height: 16px;
}
</style>
