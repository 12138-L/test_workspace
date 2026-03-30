import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAllItems, addItem, updateItem, deleteItem, getItemsByIndex, STORES } from '../utils/database'
import { generateId } from '../utils/encryption'
import dayjs from 'dayjs'
import { Solar, Lunar } from 'lunar-javascript'

export const useCalendarStore = defineStore('calendar', () => {
  const events = ref([])
  const memos = ref([])
  const currentDate = ref(dayjs())
  const viewMode = ref('month')
  const showLunar = ref(true)
  const loading = ref(false)

  const HOLIDAYS = {
    '2024-01-01': '元旦',
    '2024-02-10': '春节',
    '2024-04-04': '清明节',
    '2024-05-01': '劳动节',
    '2024-06-10': '端午节',
    '2024-09-17': '中秋节',
    '2024-10-01': '国庆节',
    '2025-01-01': '元旦',
    '2025-01-29': '春节',
    '2025-04-04': '清明节',
    '2025-05-01': '劳动节',
    '2025-05-31': '端午节',
    '2025-10-01': '国庆节',
    '2025-10-06': '中秋节'
  }

  const currentMonthDays = computed(() => {
    const start = currentDate.value.startOf('month')
    const end = currentDate.value.endOf('month')
    const days = []
    
    const startDay = start.day()
    for (let i = startDay - 1; i >= 0; i--) {
      const date = start.subtract(startDay - i, 'day')
      days.push(createDayInfo(date, false))
    }
    
    for (let i = 0; i < end.date(); i++) {
      const date = start.add(i, 'day')
      days.push(createDayInfo(date, true))
    }
    
    const endDay = end.day()
    for (let i = 1; i < 7 - endDay; i++) {
      const date = end.add(i, 'day')
      days.push(createDayInfo(date, false))
    }
    
    return days
  })

  function createDayInfo(date, isCurrentMonth) {
    const solar = Solar.fromDate(date.toDate())
    const lunar = solar.getLunar()
    
    const lunarInfo = showLunar.value ? {
      day: lunar.getDayInChinese(),
      month: lunar.getMonthInChinese(),
      year: lunar.getYearInGanZhi(),
      festival: lunar.getFestivals().join(', '),
      jieQi: lunar.getJieQi()
    } : null

    const dateStr = date.format('YYYY-MM-DD')
    
    return {
      date: dateStr,
      day: date.date(),
      month: date.month() + 1,
      year: date.year(),
      isToday: date.isSame(dayjs(), 'day'),
      isCurrentMonth,
      isWeekend: [0, 6].includes(date.day()),
      holiday: HOLIDAYS[dateStr],
      lunar: lunarInfo,
      events: events.value.filter(e => e.date === dateStr),
      memos: memos.value.filter(m => m.date === dateStr)
    }
  }

  async function initialize() {
    loading.value = true
    try {
      const allEvents = await getAllItems(STORES.CALENDAR)
      events.value = allEvents.filter(e => e.type === 'event')
      memos.value = allEvents.filter(e => e.type === 'memo')
    } catch (error) {
      console.error('Failed to initialize calendar store:', error)
    } finally {
      loading.value = false
    }
  }

  async function addEvent(eventData) {
    const event = {
      id: generateId(),
      type: 'event',
      ...eventData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await addItem(STORES.CALENDAR, event)
    events.value.push(event)
    return event
  }

  async function updateEvent(id, updates) {
    const index = events.value.findIndex(e => e.id === id)
    if (index === -1) return null
    
    const updatedEvent = {
      ...events.value[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    await updateItem(STORES.CALENDAR, updatedEvent)
    events.value[index] = updatedEvent
    return updatedEvent
  }

  async function deleteEvent(id) {
    await deleteItem(STORES.CALENDAR, id)
    events.value = events.value.filter(e => e.id !== id)
  }

  async function addMemo(memoData) {
    const memo = {
      id: generateId(),
      type: 'memo',
      ...memoData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await addItem(STORES.CALENDAR, memo)
    memos.value.push(memo)
    return memo
  }

  async function updateMemo(id, updates) {
    const index = memos.value.findIndex(m => m.id === id)
    if (index === -1) return null
    
    const updatedMemo = {
      ...memos.value[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    await updateItem(STORES.CALENDAR, updatedMemo)
    memos.value[index] = updatedMemo
    return updatedMemo
  }

  async function deleteMemo(id) {
    await deleteItem(STORES.CALENDAR, id)
    memos.value = memos.value.filter(m => m.id !== id)
  }

  function goToToday() {
    currentDate.value = dayjs()
  }

  function goToPrevMonth() {
    currentDate.value = currentDate.value.subtract(1, 'month')
  }

  function goToNextMonth() {
    currentDate.value = currentDate.value.add(1, 'month')
  }

  function goToPrevYear() {
    currentDate.value = currentDate.value.subtract(1, 'year')
  }

  function goToNextYear() {
    currentDate.value = currentDate.value.add(1, 'year')
  }

  function toggleLunar() {
    showLunar.value = !showLunar.value
  }

  function getEventsByDate(date) {
    return events.value.filter(e => e.date === date)
  }

  function getMemosByDate(date) {
    return memos.value.filter(m => m.date === date)
  }

  return {
    events,
    memos,
    currentDate,
    viewMode,
    showLunar,
    loading,
    currentMonthDays,
    HOLIDAYS,
    initialize,
    addEvent,
    updateEvent,
    deleteEvent,
    addMemo,
    updateMemo,
    deleteMemo,
    goToToday,
    goToPrevMonth,
    goToNextMonth,
    goToPrevYear,
    goToNextYear,
    toggleLunar,
    getEventsByDate,
    getMemosByDate
  }
})
