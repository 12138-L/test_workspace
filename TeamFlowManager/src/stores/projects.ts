import { defineStore } from 'pinia'
import type { Project } from '@/types'
import { projectsRepo } from '@/db/repository'

interface ProjectsState {
  list: Project[]
  loading: boolean
  currentProject: Project | null
}

export const useProjectsStore = defineStore('projects', {
  state: (): ProjectsState => ({
    list: [],
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
      try {
        this.list = await projectsRepo.getAll()
      } finally {
        this.loading = false
      }
    },

    async addProject(project: Omit<Project, 'id'>) {
      const id = await projectsRepo.create(project)
      const newProject = { ...project, id } as Project
      this.list = [...this.list, newProject]
      return id
    },

    async updateProject(id: number, updates: Partial<Project>) {
      await projectsRepo.update(id, updates)
      this.list = this.list.map(p =>
        p.id === id ? { ...p, ...updates } : p
      )
    },

    async deleteProject(id: number) {
      await projectsRepo.delete(id)
      this.list = this.list.filter(p => p.id !== id)
    },

    setCurrentProject(project: Project) {
      this.currentProject = project
    },

    async clearAll() {
      await projectsRepo.clear()
      this.list = []
    },

    async bulkCreate(projects: Array<Omit<Project, 'id'>>) {
      await projectsRepo.bulkCreate(projects)
      await this.fetchProjects()
    }
  }
})
