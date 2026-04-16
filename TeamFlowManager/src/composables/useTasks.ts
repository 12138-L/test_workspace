/**
 * useTasks - 任务管理业务层
 *
 * 【职责边界】
 * ✅ CRUD 流程控制
 * ✅ 表单逻辑封装
 * ✅ 搜索防抖
 * ✅ 视图模式切换
 *
 * 【生产级特性】
 * useAsync v2 + 失败自动重试
 * 搜索防抖 300ms
 * 表单自动重置
 */

import { ref, watch, computed } from 'vue'
import type { Task } from '@/types'
import { useAsync, debounce } from '@/utils'
import { message } from '@/utils/naive'
import type { useTasksStore } from '@/stores/tasks'

type TasksStore = ReturnType<typeof useTasksStore>

interface FormDataType {
  title: string
  description: string
  remark: string
  assignee: string
  status: Task['status']
  priority: Task['priority']
  startTime: number | null
  dueDate: number | null
}

export function useTasks(stores: { tasks: TasksStore }) {
  const showModal = ref(false)
  const editingTask = ref<Task | null>(null)
  const submitting = ref(false)
  const viewMode = ref<'list' | 'kanban'>('list')
  const searchKeyword = ref('')
  const localSearch = ref('')

  const statusOptions = [
    { label: '待办', value: '待办' },
    { label: '进行中', value: '进行中' },
    { label: '已完成', value: '已完成' }
  ]

  const priorityOptions = [
    { label: '高', value: '高' },
    { label: '中', value: '中' },
    { label: '低', value: '低' }
  ]

  const filterOptions = computed(() => [{ label: '全部', value: '' }, ...statusOptions])

  const pagination = {
    pageSize: 10
  }

  const defaultFormData: FormDataType = {
    title: '',
    description: '',
    remark: '',
    assignee: '',
    status: '待办' as Task['status'],
    priority: '中' as Task['priority'],
    startTime: null as number | null,
    dueDate: null as number | null
  }

  const formData = ref({ ...defaultFormData })

  const debouncedSearch = debounce((val: string) => {
    searchKeyword.value = val
  }, 300)

  watch(localSearch, debouncedSearch)

  function resetForm() {
    editingTask.value = null
    formData.value = { ...defaultFormData }
  }

  watch(showModal, open => {
    if (!open) {
      resetForm()
    }
  })

  function handleCreateTask() {
    resetForm()
    showModal.value = true
  }

  function handleEdit(task: Task) {
    editingTask.value = task
    formData.value = {
      title: task.title,
      description: task.description || '',
      remark: task.remark || '',
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      startTime: task.startTime ? new Date(task.startTime).getTime() : null,
      dueDate: task.dueDate ? new Date(task.dueDate).getTime() : null
    } as FormDataType
    showModal.value = true
  }

  function formatTimestamp(ts: number | null): string {
    if (!ts) return ''
    const d = new Date(ts)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const { execute: handleDelete } = useAsync(
    async (...args: unknown[]) => {
      const task = args[0] as Task
      await stores.tasks.deleteTask(task.id)
      message.success('已删除')
    },
    {
      errorMessage: '删除失败',
      maxRetries: 1
    }
  )

  const { execute: handleStatusChange } = useAsync(
    async (...args: unknown[]) => {
      const taskId = args[0] as number
      const newStatus = args[1] as Task['status']
      await stores.tasks.updateTask(taskId, { status: newStatus })
      message.success('任务状态已更新')
    },
    {
      errorMessage: '更新状态失败',
      maxRetries: 2
    }
  )

  const { execute: handleSubmit } = useAsync(
    async (...args: unknown[]) => {
      const submittedFormData = (args[0] || formData.value) as FormDataType
      const title = submittedFormData.title?.trim()
      if (!title) {
        message.warning('请输入任务标题')
        return
      }

      const submitData = {
        ...submittedFormData,
        title,
        description: submittedFormData.description?.trim() || '',
        assignee: submittedFormData.assignee?.trim() || '',
        startTime: formatTimestamp(submittedFormData.startTime),
        dueDate: formatTimestamp(submittedFormData.dueDate)
      }

      if (editingTask.value) {
        await stores.tasks.updateTask(editingTask.value.id, submitData as Partial<Task>)
        message.success('任务已更新')
      } else {
        await stores.tasks.addTask({
          ...submitData,
          remark: '',
          startTime: ''
        })
        message.success('任务创建成功')
      }

      showModal.value = false
    },
    {
      errorMessage: editingTask.value ? '更新失败' : '创建失败',
      maxRetries: 1
    }
  )

  return {
    showModal,
    editingTask,
    viewMode,
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
  }
}
