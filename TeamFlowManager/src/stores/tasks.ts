import { defineStore } from 'pinia'
import type { Task } from '@/types'

interface TasksState {
  list: Task[]
  loading: boolean
  searchKeyword: string
  statusFilter: string | null
}

const mockTasks: Task[] = [
  {
    id: 1,
    title: '完成项目需求文档',
    assignee: '张三',
    priority: '高',
    status: '进行中',
    dueDate: '2024-01-20'
  },
  {
    id: 2,
    title: 'UI设计评审',
    assignee: '李四',
    priority: '中',
    status: '待开始',
    dueDate: '2024-01-22'
  },
  {
    id: 3,
    title: '后端接口开发',
    assignee: '王五',
    priority: '高',
    status: '进行中',
    dueDate: '2024-01-25'
  },
  {
    id: 4,
    title: '单元测试编写',
    assignee: '赵六',
    priority: '低',
    status: '已完成',
    dueDate: '2024-01-18'
  },
  {
    id: 5,
    title: '部署上线准备',
    assignee: '张三',
    priority: '高',
    status: '已延期',
    dueDate: '2024-01-10'
  }
]

export const useTasksStore = defineStore('tasks', {
  persist: {
    key: 'tasks-store',
    paths: ['list']
  },

  state: (): TasksState => ({
    list: mockTasks,
    loading: false,
    searchKeyword: '',
    statusFilter: null
  }),

  getters: {
    filteredTasks: state => {
      let result = state.list

      if (state.statusFilter) {
        result = result.filter(task => task.status === state.statusFilter)
      }

      if (state.searchKeyword) {
        result = result.filter(
          task =>
            task.title.includes(state.searchKeyword) || task.assignee.includes(state.searchKeyword)
        )
      }

      return result
    },
    pendingTasks: state => state.list.filter(t => t.status === '待开始'),
    inProgressTasks: state => state.list.filter(t => t.status === '进行中'),
    completedTasks: state => state.list.filter(t => t.status === '已完成'),
    overdueTasks: state => state.list.filter(t => t.status === '已延期'),
    stats: state => ({
      total: state.list.length,
      pending: state.list.filter(t => t.status === '待开始').length,
      inProgress: state.list.filter(t => t.status === '进行中').length,
      completed: state.list.filter(t => t.status === '已完成').length
    })
  },

  actions: {
    setSearchKeyword(keyword: string) {
      this.searchKeyword = keyword
    },

    setStatusFilter(status: string | null) {
      this.statusFilter = status
    },

    async fetchTasks() {
      this.loading = true
      return new Promise(resolve => {
        setTimeout(() => {
          this.loading = false
          resolve(this.list)
        }, 500)
      })
    },

    addTask(task: Omit<Task, 'id'>) {
      const newId = Math.max(...this.list.map(t => t.id), 0) + 1
      this.list.push({
        id: newId,
        ...task
      })
    },

    updateTask(id: number, updates: Partial<Task>) {
      const index = this.list.findIndex(t => t.id === id)
      if (index > -1) {
        this.list[index] = { ...this.list[index], ...updates }
      }
    },

    deleteTask(id: number) {
      this.list = this.list.filter(t => t.id !== id)
    }
  }
})
