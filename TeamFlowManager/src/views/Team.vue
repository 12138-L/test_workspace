<template>
  <div class="team-container">
    <n-page-header title="团队管理" subtitle="管理团队成员">
      <template #extra>
        <n-button type="primary" @click="handleAddMember">
          <template #icon>
            <span v-html="Icons.add" class="icon-btn"></span>
          </template>
          添加成员
        </n-button>
      </template>
    </n-page-header>

    <n-card style="margin-top: 20px" title="团队成员列表">
      <n-spin :show="teamStore.loading" description="加载中...">
        <n-data-table
          :columns="columns"
          :data="teamStore.list"
          :pagination="pagination"
          virtual-scroll
          :max-height="500"
          :row-properties="
            (row: TeamMember) => ({
              style: 'cursor: pointer',
              onClick: () => handleEdit(row)
            })
          "
        >
          <template #empty>
            <DataTableEmpty
              title="暂无团队成员"
              description="点击下方按钮添加第一位成员"
              create-text="添加成员"
              @create="handleAddMember"
            />
          </template>
        </n-data-table>
      </n-spin>
    </n-card>

    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="editingMember ? '编辑成员' : '添加成员'"
      style="width: 500px"
    >
      <n-form :model="formData" label-placement="left" label-width="100">
        <n-form-item label="姓名" required>
          <n-input v-model:value="formData.name" placeholder="请输入姓名" />
        </n-form-item>
        <n-form-item label="角色">
          <n-input v-model:value="formData.role" placeholder="请输入角色" />
        </n-form-item>
        <n-form-item label="邮箱">
          <n-input v-model:value="formData.email" placeholder="请输入邮箱" />
        </n-form-item>
        <n-form-item label="部门">
          <n-select
            v-model:value="formData.department"
            :options="departmentOptions"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="formData.status" :options="statusOptions" style="width: 100%" />
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
 * Team - 团队管理页面
 *
 * 【最终架构】
 * Team.vue                      ← 视图层 - 布局
 *     ↓
 * useTeam.ts                    ← 业务逻辑层 - CRUD + useAsync
 */

import type { DataTableColumns } from 'naive-ui'
import { h, onMounted } from 'vue'
import type { TeamMember } from '@/types'
import { useTeamStore } from '@/stores'
import { dialog } from '@/utils/naive'
import { getStatusType, getMemberStatusText } from '@/utils/formatters'
import { Icons } from '@/config/icons'
import { useTeam } from '@/composables/useTeam'
import DataTableActions from '@/components/DataTableActions.vue'
import DataTableEmpty from '@/components/DataTableEmpty.vue'

const teamStore = useTeamStore()

const {
  pagination,
  departmentOptions,
  statusOptions,
  showModal,
  editingMember,
  submitting,
  formData,
  handleAddMember,
  handleEdit,
  handleDelete,
  handleSubmit
} = useTeam({ team: teamStore })

const columns: DataTableColumns<TeamMember> = [
  {
    title: '姓名',
    key: 'name',
    width: 120
  },
  {
    title: '角色',
    key: 'role',
    width: 120
  },
  {
    title: '邮箱',
    key: 'email'
  },
  {
    title: '部门',
    key: 'department',
    width: 120
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: TeamMember) =>
      h(
        'n-tag',
        { type: getStatusType(row.status), size: 'small' },
        { default: () => getMemberStatusText(row.status) }
      )
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render: (row: TeamMember) =>
      h(DataTableActions, {
        onEdit: () => handleEdit(row),
        onDelete: () => {
          dialog.warning({
            title: '确认删除',
            content: `确定要删除成员「${row.name}」吗？此操作不可恢复。`,
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
  teamStore.fetchTeam()
})
</script>

<style scoped>
.team-container {
  padding: 0;
}

.icon-btn {
  display: flex;
  width: 16px;
  height: 16px;
}
</style>
