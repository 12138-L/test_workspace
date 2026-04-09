import { defineStore } from 'pinia'
import type { Project } from '@/types'

interface ProjectsState {
  list: Project[]
  loading: boolean
  currentProject: Project | null
}

const mockProjects: Project[] = [
  {
    id: 1,
    name: '电商平台重构',
    manager: '张三',
    status: '进行中',
    progress: 65,
    startDate: '2024-01-01',
    endDate: '2024-03-31'
  },
  {
    id: 2,
    name: '移动端APP开发',
    manager: '李四',
    status: '进行中',
    progress: 30,
    startDate: '2024-01-15',
    endDate: '2024-04-30'
  },
  {
    id: 3,
    name: '数据中台建设',
    manager: '王五',
    status: '已暂停',
    progress: 45,
    startDate: '2023-12-01',
    endDate: '2024-02-29'
  },
  {
    id: 4,
    name: 'CRM系统升级',
    manager: '赵六',
    status: '已完成',
    progress: 100,
    startDate: '2023-11-01',
    endDate: '2024-01-15'
  }
]

export const useProjectsStore = defineStore('projects', {
  state: (): ProjectsState => ({
    list: mockProjects,
    loading: false,
    currentProject: null
  }),

  getters: {
    activeProjects: state => state.list.filter(p => p.status === '进行中'),
    completedProjects: state => state.list.filter(p => p.status === '已完成'),
    totalCount: state => state.list.length,
    getProjectById: state => {
      return (id: number) => state.list.find(p => p.id === id)
    }
  },

  actions: {
    async fetchProjects() {
      this.loading = true
      return new Promise(resolve => {
        setTimeout(() => {
          this.loading = false
          resolve(this.list)
        }, 500)
      })
    },

    addProject(project: Omit<Project, 'id'>) {
      const newId = Math.max(...this.list.map(p => p.id), 0) + 1
      this.list.push({
        id: newId,
        ...project
      })
    },

    updateProject(id: number, updates: Partial<Project>) {
      const index = this.list.findIndex(p => p.id === id)
      if (index !== -1) {
        this.list[index] = { ...this.list[index], ...updates }
      }
    },

    deleteProject(id: number) {
      this.list = this.list.filter(p => p.id !== id)
    },

    setCurrentProject(project: Project) {
      this.currentProject = project
    }
  }
})
