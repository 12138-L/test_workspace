import { defineStore } from 'pinia'
import type { Task } from '@/types'
import { tasksRepo } from '@/db/repository'

interface TasksState {
  list: Task[]
  loading: boolean
  searchKeyword: string
  statusFilter: string | null
}

export const useTasksStore = defineStore('tasks', {
  state: (): TasksState => ({
    list: [],
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
        const keyword = state.searchKeyword.toLowerCase()
        result = result.filter(
          task =>
            task.title.toLowerCase().includes(keyword) ||
            task.description?.toLowerCase().includes(keyword) ||
            task.remark?.toLowerCase().includes(keyword) ||
            task.assignee.toLowerCase().includes(keyword)
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
      try {
        this.list = await tasksRepo.getAll()
      } finally {
        this.loading = false
      }
    },

    async addTask(task: Omit<Task, 'id'>) {
      const id = await tasksRepo.create(task)
      const newTask = { ...task, id } as Task
      this.list = [...this.list, newTask]
      return id
    },

    async updateTask(id: number, updates: Partial<Task>) {
      await tasksRepo.update(id, updates)
      this.list = this.list.map(t => (t.id === id ? { ...t, ...updates } : t))
    },

    async deleteTask(id: number) {
      await tasksRepo.delete(id)
      this.list = this.list.filter(t => t.id !== id)
    },

    async clearAll() {
      await tasksRepo.clear()
      this.list = []
    },

    async bulkCreate(tasks: Array<Omit<Task, 'id'>>) {
      await tasksRepo.bulkCreate(tasks)
      await this.fetchTasks()
    }
  }
})
