import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LeaveRecord, OvertimeRecord, WorkdayAdjustment } from '@/types'
import { calendarDB } from '@/db/repository'
import { legalHolidays } from '@/utils/lunar'

function toPlainObject<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export const useCalendarStore = defineStore('calendar', () => {
  const leaveRecords = ref<LeaveRecord[]>([])
  const overtimeRecords = ref<OvertimeRecord[]>([])
  const adjustments = ref<WorkdayAdjustment[]>([])
  const loading = ref(false)

  async function fetchLeaveRecords() {
    loading.value = true
    try {
      leaveRecords.value = await calendarDB.getAllLeaves()
    } finally {
      loading.value = false
    }
  }

  async function fetchOvertimeRecords() {
    loading.value = true
    try {
      overtimeRecords.value = await calendarDB.getAllOvertimes()
    } finally {
      loading.value = false
    }
  }

  async function fetchAdjustments() {
    loading.value = true
    try {
      adjustments.value = await calendarDB.getAllAdjustments()
      if (adjustments.value.length === 0) {
        await initDefaultHolidays()
      }
    } finally {
      loading.value = false
    }
  }

  async function initDefaultHolidays() {
    const defaultAdjustments: WorkdayAdjustment[] = Object.entries(legalHolidays).map(
      ([date, info], index) => ({
        id: index + 1,
        date,
        type: info.type,
        name: info.name,
        isCustom: false,
        createdAt: Date.now()
      })
    )

    for (const adj of defaultAdjustments) {
      await calendarDB.addAdjustment(toPlainObject(adj))
    }

    adjustments.value = defaultAdjustments
  }

  async function addLeaveRecord(record: Omit<LeaveRecord, 'id' | 'createdAt'>) {
    const newRecord: LeaveRecord = toPlainObject({
      ...record,
      id: Date.now(),
      createdAt: Date.now()
    })

    const optimisticList = [...leaveRecords.value, newRecord]
    leaveRecords.value = optimisticList

    try {
      const id = await calendarDB.addLeave(newRecord)
      leaveRecords.value = leaveRecords.value.map(r => (r.id === newRecord.id ? { ...r, id } : r))
      return id
    } catch (e) {
      leaveRecords.value = leaveRecords.value.filter(r => r.id !== newRecord.id)
      throw e
    }
  }

  async function deleteLeaveRecord(id: number) {
    const record = leaveRecords.value.find(r => r.id === id)
    if (!record) return

    leaveRecords.value = leaveRecords.value.filter(r => r.id !== id)

    try {
      await calendarDB.deleteLeave(id)
    } catch (e) {
      leaveRecords.value.push(record)
      throw e
    }
  }

  async function addOvertimeRecord(record: Omit<OvertimeRecord, 'id' | 'createdAt'>) {
    const newRecord: OvertimeRecord = toPlainObject({
      ...record,
      id: Date.now(),
      createdAt: Date.now()
    })

    const optimisticList = [...overtimeRecords.value, newRecord]
    overtimeRecords.value = optimisticList

    try {
      const id = await calendarDB.addOvertime(newRecord)
      overtimeRecords.value = overtimeRecords.value.map(r =>
        r.id === newRecord.id ? { ...r, id } : r
      )
      return id
    } catch (e) {
      overtimeRecords.value = overtimeRecords.value.filter(r => r.id !== newRecord.id)
      throw e
    }
  }

  async function deleteOvertimeRecord(id: number) {
    const record = overtimeRecords.value.find(r => r.id === id)
    if (!record) return

    overtimeRecords.value = overtimeRecords.value.filter(r => r.id !== id)

    try {
      await calendarDB.deleteOvertime(id)
    } catch (e) {
      overtimeRecords.value.push(record)
      throw e
    }
  }

  async function updateLeaveStatus(id: number, status: LeaveRecord['status']) {
    const record = leaveRecords.value.find(r => r.id === id)
    if (!record) return

    const originalStatus = record.status
    record.status = status

    try {
      await calendarDB.updateLeave(id, { status })
    } catch (e) {
      record.status = originalStatus
      throw e
    }
  }

  async function addAdjustment(adj: Omit<WorkdayAdjustment, 'id' | 'createdAt' | 'isCustom'>) {
    const newAdj: WorkdayAdjustment = toPlainObject({
      ...adj,
      id: Date.now(),
      isCustom: true,
      createdAt: Date.now()
    })

    const existingIndex = adjustments.value.findIndex(a => a.date === newAdj.date)
    if (existingIndex >= 0) {
      adjustments.value[existingIndex] = newAdj
    } else {
      adjustments.value.push(newAdj)
    }

    try {
      const id = await calendarDB.addAdjustment(newAdj)
      return id
    } catch (e) {
      if (existingIndex >= 0) {
        adjustments.value.splice(existingIndex, 1)
      } else {
        adjustments.value = adjustments.value.filter(a => a.id !== newAdj.id)
      }
      throw e
    }
  }

  async function deleteAdjustment(id: number) {
    const adj = adjustments.value.find(a => a.id === id)
    if (!adj || !adj.isCustom) return

    adjustments.value = adjustments.value.filter(a => a.id !== id)

    try {
      await calendarDB.deleteAdjustment(id)
    } catch (e) {
      adjustments.value.push(adj)
      throw e
    }
  }

  function getLeavesForDate(dateStr: string): LeaveRecord[] {
    return leaveRecords.value.filter(l => l.status === '已批准' && l.date === dateStr)
  }

  function getOvertimesForDate(dateStr: string): OvertimeRecord[] {
    return overtimeRecords.value.filter(o => o.date === dateStr)
  }

  function getAdjustmentForDate(dateStr: string): WorkdayAdjustment | undefined {
    return adjustments.value.find(a => a.date === dateStr)
  }

  return {
    leaveRecords,
    overtimeRecords,
    adjustments,
    loading,
    fetchLeaveRecords,
    fetchOvertimeRecords,
    fetchAdjustments,
    addLeaveRecord,
    deleteLeaveRecord,
    addOvertimeRecord,
    deleteOvertimeRecord,
    updateLeaveStatus,
    getLeavesForDate,
    getOvertimesForDate,
    addAdjustment,
    deleteAdjustment,
    getAdjustmentForDate
  }
})
