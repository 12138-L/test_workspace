import { defineStore } from 'pinia'
import type { TeamMember } from '@/types'

interface TeamState {
  list: TeamMember[]
  loading: boolean
}

const mockTeamMembers: TeamMember[] = [
  {
    id: 1,
    name: '张三',
    role: '项目经理',
    email: 'zhangsan@example.com',
    department: '技术部',
    status: 'active'
  },
  {
    id: 2,
    name: '李四',
    role: '前端开发',
    email: 'lisi@example.com',
    department: '技术部',
    status: 'active'
  },
  {
    id: 3,
    name: '王五',
    role: '后端开发',
    email: 'wangwu@example.com',
    department: '技术部',
    status: 'active'
  },
  {
    id: 4,
    name: '赵六',
    role: 'UI设计师',
    email: 'zhaoliu@example.com',
    department: '设计部',
    status: 'inactive'
  },
  {
    id: 5,
    name: '钱七',
    role: '产品经理',
    email: 'qianqi@example.com',
    department: '产品部',
    status: 'active'
  }
]

export const useTeamStore = defineStore('team', {
  persist: {
    key: 'team-store',
    paths: ['list']
  },

  state: (): TeamState => ({
    list: mockTeamMembers,
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
    async fetchMembers() {
      this.loading = true
      return new Promise(resolve => {
        setTimeout(() => {
          this.loading = false
          resolve(this.list)
        }, 300)
      })
    },

    addMember(member: Omit<TeamMember, 'id'>) {
      const newId = Math.max(...this.list.map(m => m.id), 0) + 1
      this.list.push({
        id: newId,
        ...member
      })
    },

    updateMember(id: number, updates: Partial<TeamMember>) {
      const index = this.list.findIndex(m => m.id === id)
      if (index > -1) {
        this.list[index] = { ...this.list[index], ...updates }
      }
    },

    deleteMember(id: number) {
      this.list = this.list.filter(m => m.id !== id)
    }
  }
})
