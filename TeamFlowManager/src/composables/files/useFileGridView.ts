/**
 * useFileGridView - 分组视图逻辑
 *
 * 【职责】
 * ✅ 视图模式切换
 * ✅ 分组目标计算
 * ✅ 文件过滤与分组
 */

import { ref, computed, type Ref } from 'vue'
import type { FileRecord, FileCategory, TeamMember } from '@/types'
import type { DropTarget } from './useFileDragDrop'
import type { useTeamStore } from '@/stores/team'

type TeamStore = ReturnType<typeof useTeamStore>

export interface FileCategoryOption {
  label: string
  value: string
  type?: never
}

interface GridViewOptions {
  stores: { team: TeamStore }
  files: Ref<FileRecord[]>
  viewMode: Ref<'list' | 'byType' | 'byMember'>
}

export function useFileGridView(options: GridViewOptions) {
  const { stores, files, viewMode } = options

  const categoryOptions = [
    { label: '周报', value: '周报' },
    { label: '月报', value: '月报' },
    { label: '证件', value: '证件' },
    { label: '合同', value: '合同' },
    { label: '报告', value: '报告' },
    { label: '考勤', value: '考勤' },
    { label: '其他', value: '其他' }
  ]

  const memberOptions = computed(() => {
    return stores.team.activeMembers.map((m: TeamMember) => ({ label: m.name, value: m.id }))
  })

  const selectedCategory = ref<string>('周报')
  const selectedMemberId = ref<number | undefined>(undefined)

  const filterCategory = ref<FileCategory | null>(null)
  const searchKeyword = ref('')

  const filteredFiles = computed(() => {
    let result = [...files.value]
    if (filterCategory.value) {
      result = result.filter(f => f.category === filterCategory.value)
    }
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(f => f.originalName.toLowerCase().includes(keyword))
    }
    return result
  })

  const dropTargets = computed<DropTarget[]>(() => {
    if (viewMode.value === 'byType') {
      return stores.team.activeMembers.map((m: TeamMember) => ({
        id: `member-${m.id}`,
        name: m.name,
        type: 'member' as const,
        memberId: m.id
      }))
    } else {
      return categoryOptions.map(c => ({
        id: `category-${c.value}`,
        name: c.label,
        type: 'category' as const,
        category: c.value
      }))
    }
  })

  function getFilesInTarget(target: DropTarget): FileRecord[] {
    if (target.type === 'member') {
      return filteredFiles.value.filter(f => f.memberId === target.memberId)
    } else {
      return filteredFiles.value.filter(f => f.category === target.category)
    }
  }

  return {
    categoryOptions,
    memberOptions,
    selectedCategory,
    selectedMemberId,
    filterCategory,
    searchKeyword,
    filteredFiles,
    dropTargets,
    getFilesInTarget
  }
}
