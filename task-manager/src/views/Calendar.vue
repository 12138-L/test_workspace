<template>
  <div class="calendar-page">
    <header class="page-header">
      <h1>日历</h1>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="toggleLunar">
          {{ showLunar ? '隐藏农历' : '显示农历' }}
        </button>
        <button class="btn btn-primary" @click="showAddEventModal = true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          添加日程
        </button>
      </div>
    </header>
    
    <div class="calendar-container">
      <div class="calendar-nav">
        <div class="nav-left">
          <button class="btn btn-secondary" @click="goToPrevYear">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          <button class="btn btn-secondary" @click="goToPrevMonth">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
        </div>
        
        <div class="nav-center">
          <h2>{{ currentMonthYear }}</h2>
          <button class="btn btn-secondary" @click="goToToday">今天</button>
        </div>
        
        <div class="nav-right">
          <button class="btn btn-secondary" @click="goToNextMonth">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
          <button class="btn btn-secondary" @click="goToNextYear">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="calendar-grid">
        <div class="calendar-weekdays">
          <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
        </div>
        
        <div class="calendar-days">
          <div v-for="day in currentMonthDays" :key="day.date" 
               class="calendar-day" 
               :class="{ 
                 'other-month': !day.isCurrentMonth,
                 'today': day.isToday,
                 'weekend': day.isWeekend,
                 'has-holiday': day.holiday
               }"
               @click="selectDay(day)">
            <div class="day-header">
              <span class="day-number">{{ day.day }}</span>
              <span v-if="day.lunar" class="lunar-day">{{ day.lunar.day }}</span>
            </div>
            <div v-if="day.holiday" class="holiday-badge">{{ day.holiday }}</div>
            <div v-if="day.lunar && day.lunar.festival" class="lunar-festival">{{ day.lunar.festival }}</div>
            <div v-if="day.lunar && day.lunar.jieQi" class="jie-qi">{{ day.lunar.jieQi }}</div>
            
            <div class="day-events">
              <div v-for="event in day.events.slice(0, 2)" :key="event.id" 
                   class="event-item" 
                   :class="event.priority"
                   @click.stop="editEvent(event)">
                {{ event.title }}
              </div>
              <div v-if="day.events.length > 2" class="more-events">
                +{{ day.events.length - 2 }} 更多
              </div>
            </div>
            
            <div class="day-tasks">
              <div v-for="task in getTasksForDay(day.date).slice(0, 2)" :key="task.id" 
                   class="task-item-mini"
                   :class="task.status">
                {{ task.title }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <EventModal v-if="showAddEventModal" :event="editingEvent" :selectedDate="selectedDate" @close="closeEventModal" @save="saveEvent" @delete="deleteEvent" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCalendarStore } from '../stores/calendarStore'
import { useTaskStore } from '../stores/taskStore'
import dayjs from 'dayjs'
import EventModal from '../components/calendar/EventModal.vue'

const calendarStore = useCalendarStore()
const taskStore = useTaskStore()

const showAddEventModal = ref(false)
const editingEvent = ref(null)
const selectedDate = ref(null)

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const showLunar = computed(() => calendarStore.showLunar)
const currentMonthDays = computed(() => calendarStore.currentMonthDays)

const currentMonthYear = computed(() => {
  return calendarStore.currentDate.format('YYYY年MM月')
})

function toggleLunar() {
  calendarStore.toggleLunar()
}

function goToToday() {
  calendarStore.goToToday()
}

function goToPrevMonth() {
  calendarStore.goToPrevMonth()
}

function goToNextMonth() {
  calendarStore.goToNextMonth()
}

function goToPrevYear() {
  calendarStore.goToPrevYear()
}

function goToNextYear() {
  calendarStore.goToNextYear()
}

function selectDay(day) {
  selectedDate.value = day.date
  showAddEventModal.value = true
}

function getTasksForDay(date) {
  return taskStore.tasks.filter(t => t.dueDate === date)
}

function editEvent(event) {
  editingEvent.value = event
  showAddEventModal.value = true
}

function closeEventModal() {
  showAddEventModal.value = false
  editingEvent.value = null
  selectedDate.value = null
}

async function saveEvent(eventData) {
  if (editingEvent.value) {
    await calendarStore.updateEvent(editingEvent.value.id, eventData)
  } else {
    await calendarStore.addEvent({
      ...eventData,
      date: selectedDate.value || dayjs().format('YYYY-MM-DD')
    })
  }
  closeEventModal()
}

async function deleteEvent(eventId) {
  if (confirm('确定要删除这个日程吗？')) {
    await calendarStore.deleteEvent(eventId)
    closeEventModal()
  }
}
</script>

<style scoped>
.calendar-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.calendar-container {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.calendar-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.nav-left, .nav-right {
  display: flex;
  gap: 8px;
}

.nav-center {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-center h2 {
  font-size: 18px;
  font-weight: 600;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.weekday {
  padding: 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  min-height: 120px;
  padding: 8px;
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background 0.2s ease;
}

.calendar-day:nth-child(7n) {
  border-right: none;
}

.calendar-day:hover {
  background: var(--bg-tertiary);
}

.calendar-day.other-month {
  background: var(--bg-primary);
  opacity: 0.6;
}

.calendar-day.today {
  background: rgba(79, 70, 229, 0.05);
}

.calendar-day.today .day-number {
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-day.weekend {
  color: var(--danger-color);
}

.day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.day-number {
  font-size: 14px;
  font-weight: 500;
}

.lunar-day {
  font-size: 12px;
  color: var(--text-muted);
}

.holiday-badge {
  display: inline-block;
  padding: 2px 6px;
  background: var(--danger-color);
  color: white;
  font-size: 10px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.lunar-festival, .jie-qi {
  font-size: 11px;
  color: var(--secondary-color);
  margin-bottom: 4px;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
}

.event-item {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--primary-color);
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-item.high {
  background: var(--priority-high);
}

.event-item.medium {
  background: var(--priority-medium);
}

.event-item.low {
  background: var(--priority-low);
}

.more-events {
  font-size: 10px;
  color: var(--text-muted);
  padding: 2px 6px;
}

.day-tasks {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
}

.task-item-mini {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-left: 2px solid var(--primary-color);
}

.task-item-mini.completed {
  text-decoration: line-through;
  opacity: 0.6;
}
</style>
