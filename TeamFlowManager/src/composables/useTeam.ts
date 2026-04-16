/**
 * useTeam - 团队管理业务层
 */

import { ref, watch } from 'vue'
import type { TeamMember } from '@/types'
import { useAsync } from '@/utils/async'
import { message } from '@/utils/naive'
import type { useTeamStore } from '@/stores/team'

type TeamStore = ReturnType<typeof useTeamStore>

export function useTeam(stores: { team: TeamStore }) {
  const showModal = ref(false)
  const editingMember = ref<TeamMember | null>(null)
  const submitting = ref(false)
  const searchKeyword = ref('')
  const filterDepartment = ref<string>('')

  const pagination = {
    pageSize: 10
  }

  const statusOptions = [
    { label: '在职', value: 'active' },
    { label: '离职', value: 'inactive' }
  ]

  const departmentOptions = [
    { label: '技术部', value: '技术部' },
    { label: '产品部', value: '产品部' },
    { label: '设计部', value: '设计部' },
    { label: '市场部', value: '市场部' },
    { label: '行政部', value: '行政部' }
  ]

  const defaultFormData = {
    name: '',
    role: '',
    email: '',
    phone: '',
    department: '技术部',
    status: 'active' as TeamMember['status']
  }

  const formData = ref({ ...defaultFormData })

  function resetForm() {
    editingMember.value = null
    formData.value = { ...defaultFormData }
  }

  watch(showModal, open => {
    if (!open) {
      resetForm()
    }
  })

  function handleAddMember() {
    resetForm()
    showModal.value = true
  }

  function handleEdit(member: TeamMember) {
    editingMember.value = member
    formData.value = {
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone || '',
      department: member.department,
      status: member.status
    }
    showModal.value = true
  }

  const { execute: handleDelete } = useAsync(
    async (...args: unknown[]) => {
      const member = args[0] as TeamMember
      await stores.team.deleteMember(member.id)
      message.success(`成员「${member.name}」已删除`)
    },
    {
      errorMessage: '删除失败',
      maxRetries: 1
    }
  )

  const { execute: handleSubmit } = useAsync(
    async () => {
      const name = formData.value.name?.trim()
      if (!name) {
        message.warning('请输入姓名')
        return
      }

      const submitData = {
        ...formData.value,
        name,
        role: formData.value.role?.trim() || '',
        email: formData.value.email?.trim() || ''
      }

      if (editingMember.value) {
        await stores.team.updateMember(editingMember.value.id, submitData)
        message.success('成员信息已更新')
      } else {
        await stores.team.addMember(submitData)
        message.success('成员添加成功')
      }

      showModal.value = false
    },
    {
      errorMessage: editingMember.value ? '更新失败' : '添加失败',
      maxRetries: 1
    }
  )

  return {
    pagination,
    statusOptions,
    showModal,
    editingMember,
    submitting,
    searchKeyword,
    filterDepartment,
    departmentOptions,
    formData,
    handleAddMember,
    handleEdit,
    handleDelete,
    handleSubmit
  }
}
