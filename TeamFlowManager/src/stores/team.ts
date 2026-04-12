import { defineStore } from 'pinia'
import type { TeamMember } from '@/types'
import { teamRepo } from '@/db/repository'

interface TeamState {
  list: TeamMember[]
  loading: boolean
}

export const useTeamStore = defineStore('team', {
  state: (): TeamState => ({
    list: [],
    loading: false
  }),

  getters: {
    activeMembers: state => state.list.filter(m => m.status === 'active'),
    inactiveMembers: state => state.list.filter(m => m.status === 'inactive'),
    stats: state => ({
      total: state.list.length,
      active: state.list.filter(m => m.status === 'active').length,
      inactive: state.list.filter(m => m.status === 'inactive').length
    }),
    getByDepartment: state => {
      return (department: string) => state.list.filter(m => m.department === department)
    }
  },

  actions: {
    async fetchTeam() {
      this.loading = true
      try {
        this.list = await teamRepo.getAll()
      } finally {
        this.loading = false
      }
    },

    async addMember(member: Omit<TeamMember, 'id'>) {
      const id = await teamRepo.create(member)
      await this.fetchTeam()
      return id
    },

    async updateMember(id: number, updates: Partial<TeamMember>) {
      await teamRepo.update(id, updates)
      await this.fetchTeam()
    },

    async deleteMember(id: number) {
      await teamRepo.delete(id)
      await this.fetchTeam()
    },

    async clearAll() {
      await teamRepo.clear()
      this.list = []
    },

    async bulkCreate(members: Array<Omit<TeamMember, 'id'>>) {
      await teamRepo.bulkCreate(members)
      await this.fetchTeam()
    },

    async fetchMembers() {
      return this.fetchTeam()
    }
  }
})
