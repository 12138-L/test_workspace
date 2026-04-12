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

    <n-modal v-model:show="showModal" preset="card" :title="editingMember ? '编辑成员' : '添加成员'" style="width: 500px">
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
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import { h, ref, onMounted } from 'vue'
import type { TeamMember } from '@/types'
import { useTeamStore } from '@/stores'
import { message, dialog } from '@/utils/naive'
import { getStatusType, getMemberStatusText } from '@/utils/formatters'
import { Icons } from '@/config/icons'
import DataTableActions from '@/components/DataTableActions.vue'
import DataTableEmpty from '@/components/DataTableEmpty.vue'

const teamStore = useTeamStore()

const pagination = {
  pageSize: 10
}

const departmentOptions = [
  { label: '技术部', value: '技术部' },
  { label: '产品部', value: '产品部' },
  { label: '设计部', value: '设计部' },
  { label: '运营部', value: '运营部' },
  { label: '市场部', value: '市场部' }
]

const statusOptions = [
  { label: '活跃', value: 'active' },
  { label: '离职', value: 'inactive' }
]

const showModal = ref(false)
const editingMember = ref<TeamMember | null>(null)
const formData = ref({
  name: '',
  role: '',
  email: '',
  department: '技术部',
  status: 'active' as TeamMember['status']
})

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
        onDelete: () => handleDelete(row)
      })
  }
]

onMounted(() => {
  teamStore.fetchTeam()
})

function handleAddMember() {
  editingMember.value = null
  formData.value = {
    name: '',
    role: '',
    email: '',
    department: '技术部',
    status: 'active'
  }
  showModal.value = true
}

function handleEdit(member: TeamMember) {
  editingMember.value = member
  formData.value = { ...member }
  showModal.value = true
}

function handleDelete(member: TeamMember) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除成员「${member.name}」吗？此操作不可恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      await teamStore.deleteMember(member.id)
      message.success(`成员「${member.name}」已删除`)
    }
  })
}

async function handleSubmit() {
  if (!formData.value.name.trim()) {
    message.warning('请输入姓名')
    return
  }

  if (editingMember.value) {
    await teamStore.updateMember(editingMember.value.id, formData.value)
    message.success('成员信息已更新')
  } else {
    await teamStore.addMember(formData.value)
    message.success('成员添加成功')
  }

  showModal.value = false
}
</script>

<style scoped>
.team-container {
  padding: 0;
}
</style>
