import { describe, it, expect } from 'vitest'
import { formatFileSize, formatDateTime } from '@/utils/formatters'

describe('Formatters Utils', () => {
  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(500)).toBe('500 B')
    })

    it('should format KB correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
    })

    it('should format MB correctly', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB')
    })
  })

  describe('formatDateTime', () => {
    it('should format date correctly', () => {
      const result = formatDateTime(new Date())
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/)
    })
  })
})
