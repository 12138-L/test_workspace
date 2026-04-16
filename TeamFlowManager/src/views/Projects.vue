<template>
  <div class="projects-container">
    <n-page-header title="项目管理" subtitle="管理所有团队项目">
      <template #extra>
        <n-button type="primary" @click="handleCreateProject">
          <template #icon>
            <span v-html="Icons.add" class="icon-btn"></span>
          </template>
          新建项目
        </n-button>
      </template>
    </n-page-header>

    <n-card style="margin-top: 20px">
      <n-spin :show="projectsStore.loading" description="加载中...">
        <n-data-table
          :columns="columns"
          :data="projectsStore.list"
          :pagination="pagination"
          striped
          virtual-scroll
          :max-height="500"
          :row-properties="
            (row: Project) => ({
              style: 'cursor: pointer',
              onClick: () => handleEdit(row)
            })
          "
        >
          <template #empty>
            <DataTableEmpty
              title="暂无项目"
              description="点击下方按钮创建第一个项目"
              create-text="新建项目"
              @create="handleCreateProject"
            />
          </template>
        </n-data-table>
      </n-spin>
    </n-card>

    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="editingProject ? '编辑项目' : '新建项目'"
      style="width: 500px"
    >
      <n-form v-if="showModal" :model="formData" label-placement="left" label-width="100">
        <n-form-item label="项目名称" required>
          <n-input v-model:value="formData.name" placeholder="请输入项目名称" />
        </n-form-item>
        <n-form-item label="负责人">
          <n-input v-model:value="formData.manager" placeholder="请输入负责人" />
        </n-form-item>
        <n-form-item label="项目状态">
          <n-select v-model:value="formData.status" :options="statusOptions" />
        </n-form-item>
        <n-form-item label="进度">
          <n-slider v-model:value="formData.progress" :min="0" :max="100" :step="5" />
          <div style="text-align: right; color: #666; font-size: 12px">
            {{ formData.progress }}%
          </div>
        </n-form-item>
        <n-form-item label="开始日期">
          <n-date-picker
            v-model:value="formData.startDate"
            type="date"
            format="yyyy-MM-dd"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="截止日期">
          <n-date-picker
            v-model:value="formData.endDate"
            type="date"
            format="yyyy-MM-dd"
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
/**
 * Projects - 项目管理页面
 *
 * 【最终架构】
 * Projects.vue                  ← 视图层 - 布局
 *     ↓
 * useProjects.ts                ← 业务逻辑层 - CRUD + useAsync
 */

import type { DataTableColumns } from 'naive-ui'
import { h, onMounted } from 'vue'
import type { Project } from '@/types'
import { useProjectsStore } from '@/stores/projects'
import { dialog } from '@/utils/naive'
import { getStatusType, getProgressColor } from '@/utils/formatters'
import { Icons } from '@/config/icons'
import { useProjects } from '@/composables/useProjects'
import DataTableActions from '@/components/DataTableActions.vue'
import DataTableEmpty from '@/components/DataTableEmpty.vue'

const projectsStore = useProjectsStore()

const {
  pagination,
  showModal,
  editingProject,
  submitting,
  formData,
  statusOptions,
  handleCreateProject,
  handleEdit,
  handleDelete,
  handleSubmit
} = useProjects({ projects: projectsStore })

const columns: DataTableColumns<Project> = [
  {
    title: '项目名称',
    key: 'name',
    width: 200
  },
  {
    title: '负责人',
    key: 'manager',
    width: 100
  },
  {
    title: '状态',
    key: 'status',
    width: 120,
    render: (row: Project) =>
      h('n-tag', { type: getStatusType(row.status), size: 'small' }, { default: () => row.status })
  },
  {
    title: '进度',
    key: 'progress',
    width: 180,
    render: (row: Project) =>
      h('n-progress', {
        percentage: Number(row.progress),
        color: getProgressColor(Number(row.progress)),
        height: 6
      })
  },
  {
    title: '开始日期',
    key: 'startDate',
    width: 120
  },
  {
    title: '截止日期',
    key: 'endDate',
    width: 120
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render: (row: Project) =>
      h(DataTableActions, {
        onEdit: () => handleEdit(row),
        onDelete: () => {
          dialog.warning({
            title: '确认删除',
            content: `确定要删除项目「${row.name}」吗？此操作不可恢复。`,
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
  projectsStore.fetchProjects()
})
</script>

<style scoped>
.projects-container {
  padding: 0;
}

.icon-btn {
  display: flex;
  width: 16px;
  height: 16px;
}
</style>
