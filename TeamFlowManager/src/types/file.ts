export type FileCategory = '周报' | '月报' | '证件' | '合同' | '报告' | '考勤' | '其他'

export interface FileRecord {
  id: number
  name: string
  originalName: string
  size: number
  type: string
  category: FileCategory
  memberId: number
  memberName: string
  uploadedAt: number
  data?: string
  encrypted?: boolean
  encryptionIv?: string
  originalType?: string
  remark?: string
  createdAt?: number
}
