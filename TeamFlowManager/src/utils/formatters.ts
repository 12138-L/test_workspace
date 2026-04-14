import type { TagType } from '@/types'

export function getStatusType(status: string): TagType {
  const statusMap: Record<string, TagType> = {
    进行中: 'info',
    已完成: 'success',
    待开始: 'default',
    已延期: 'error',
    已暂停: 'warning',
    active: 'success',
    inactive: 'info'
  }
  return statusMap[status] || 'default'
}

export function getMemberStatusText(status: string): string {
  return status === 'active' ? '活跃' : '离职'
}

export function getPriorityType(priority: string): TagType {
  const priorityMap: Record<string, TagType> = {
    高: 'error',
    中: 'warning',
    低: 'info'
  }
  return priorityMap[priority] || 'info'
}

export function getProgressColor(progress: number): string {
  if (progress >= 80) return '#63e2b7'
  if (progress >= 50) return '#70c0e8'
  return '#f7c861'
}

export function getEventType(type: string): TagType {
  const typeMap: Record<string, TagType> = {
    重要: 'error',
    会议: 'info',
    活动: 'success',
    error: 'error',
    success: 'success',
    warning: 'warning',
    info: 'info'
  }
  return typeMap[type] || 'info'
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatDateTime(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}
