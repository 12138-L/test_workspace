/**
 * useProjects - 项目管理业务层
 *
 * 【生产级标准】
 * useAsync v2 统一错误处理 + 重试
 * 表单自动重置
 * 类型安全全程保障
 */

import { ref, watch } from 'vue'
import type { Project } from '@/types'
import { useAsync } from '@/utils/async'
import { message } from '@/utils/naive'
import type { useProjectsStore } from '@/stores/projects'

type ProjectsStore = ReturnType<typeof useProjectsStore>

interface FormDataType {
  name: string
  manager: string
  status: Project['status']
  progress: number
  startDate: number | null
  endDate: number | null
}

export function useProjects(stores: { projects: ProjectsStore }) {
  const showModal = ref(false)
  const editingProject = ref<Project | null>(null)
  const submitting = ref(false)

  const pagination = {
    pageSize: 10
  }

  const statusOptions = [
    { label: '进行中', value: '进行中' },
    { label: '已完成', value: '已完成' },
    { label: '已暂停', value: '已暂停' }
  ]

  const defaultFormData: FormDataType = {
    name: '',
    manager: '',
    status: '进行中' as Project['status'],
    progress: 0,
    startDate: new Date().getTime(),
    endDate: null
  }

  const formData = ref<FormDataType>({ ...defaultFormData })

  function formatTimestamp(ts: number | null): string {
    if (!ts) return ''
    const d = new Date(ts)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  function parseDateStr(dateStr: string): number | null {
    if (!dateStr) return null
    const ts = new Date(dateStr).getTime()
    return isNaN(ts) ? null : ts
  }

  function resetForm() {
    editingProject.value = null
    formData.value = { ...defaultFormData }
  }

  watch(showModal, open => {
    if (!open) {
      resetForm()
    }
  })

  function handleCreateProject() {
    resetForm()
    showModal.value = true
  }

  function handleEdit(project: Project) {
    editingProject.value = project
    formData.value = {
      name: project.name,
      manager: project.manager,
      status: project.status,
      progress: project.progress,
      startDate: parseDateStr(project.startDate),
      endDate: parseDateStr(project.endDate)
    }
    showModal.value = true
  }

  const { execute: handleDelete } = useAsync(
    async (...args: unknown[]) => {
      const project = args[0] as Project
      await stores.projects.deleteProject(project.id)
      message.success(`项目「${project.name}」已删除`)
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
        message.warning('请输入项目名称')
        return
      }

      const submitData = {
        ...formData.value,
        name,
        manager: formData.value.manager?.trim() || '',
        startDate: formatTimestamp(formData.value.startDate),
        endDate: formatTimestamp(formData.value.endDate)
      }

      if (editingProject.value) {
        await stores.projects.updateProject(editingProject.value.id, submitData)
        message.success('项目已更新')
      } else {
        await stores.projects.addProject(submitData)
        message.success('项目创建成功')
      }

      showModal.value = false
    },
    {
      errorMessage: editingProject.value ? '更新失败' : '创建失败',
      maxRetries: 1
    }
  )

  return {
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
  }
}
