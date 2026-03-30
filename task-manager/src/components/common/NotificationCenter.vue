<template>
  <div class="notification-center">
    <Transition name="fade">
      <div v-if="showNotification" class="notification-popup" :class="notificationType">
        <div class="notification-content">
          <div class="notification-icon">
            <svg v-if="notificationType === 'warning'" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <svg v-else-if="notificationType === 'success'" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          <div class="notification-text">
            <h4>{{ notificationTitle }}</h4>
            <p>{{ notificationMessage }}</p>
          </div>
          <button class="notification-close" @click="closeNotification">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div v-if="notificationActions.length > 0" class="notification-actions">
          <button v-for="action in notificationActions" :key="action.id" 
                  class="btn btn-sm" :class="action.class" @click="action.handler">
            {{ action.label }}
          </button>
        </div>
      </div>
    </Transition>
    
    <Transition name="slide">
      <div v-if="showOverduePanel" class="overdue-panel">
        <div class="overdue-header">
          <h3>逾期任务提醒</h3>
          <button class="btn-close" @click="closeOverduePanel">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="overdue-list">
          <div v-for="task in overdueTasks" :key="task.id" class="overdue-item">
            <div class="overdue-item-info">
              <span class="overdue-date">{{ formatDate(task.dueDate) }}</span>
              <h4>{{ task.title }}</h4>
            </div>
            <div class="overdue-item-actions">
              <button class="btn btn-sm btn-primary" @click="rescheduleTask(task)">重新安排</button>
              <button class="btn btn-sm btn-success" @click="completeTask(task)">完成</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import dayjs from 'dayjs'

const taskStore = useTaskStore()

const showNotification = ref(false)
const notificationType = ref('info')
const notificationTitle = ref('')
const notificationMessage = ref('')
const notificationActions = ref([])
const showOverduePanel = ref(false)

const overdueTasks = computed(() => taskStore.overdueTasks)

onMounted(() => {
  checkOverdueTasks()
})

function checkOverdueTasks() {
  const overdue = taskStore.checkDailyTasks()
  if (overdue.length > 0) {
    showOverduePanel.value = true
  }
}

function showNotificationPopup(type, title, message, actions = []) {
  notificationType.value = type
  notificationTitle.value = title
  notificationMessage.value = message
  notificationActions.value = actions
  showNotification.value = true
}

function closeNotification() {
  showNotification.value = false
}

function closeOverduePanel() {
  showOverduePanel.value = false
}

function formatDate(date) {
  return dayjs(date).format('MM月DD日')
}

async function rescheduleTask(task) {
  const today = dayjs().format('YYYY-MM-DD')
  await taskStore.rescheduleTask(task.id, today)
  showNotificationPopup('success', '任务已重新安排', `"${task.title}" 已移至今天`)
}

async function completeTask(task) {
  await taskStore.updateTask(task.id, { status: 'completed' })
  showNotificationPopup('success', '任务已完成', `"${task.title}" 已标记为完成`)
}

defineExpose({
  showNotification: showNotificationPopup
})
</script>

<style scoped>
.notification-center {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.notification-popup {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  min-width: 320px;
  max-width: 400px;
  overflow: hidden;
}

.notification-popup.warning {
  border-left: 4px solid var(--warning-color);
}

.notification-popup.success {
  border-left: 4px solid var(--success-color);
}

.notification-popup.info {
  border-left: 4px solid var(--info-color);
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
}

.notification-icon {
  flex-shrink: 0;
}

.notification-popup.warning .notification-icon {
  color: var(--warning-color);
}

.notification-popup.success .notification-icon {
  color: var(--success-color);
}

.notification-popup.info .notification-icon {
  color: var(--info-color);
}

.notification-text {
  flex: 1;
}

.notification-text h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.notification-text p {
  font-size: 13px;
  color: var(--text-secondary);
}

.notification-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
}

.notification-close:hover {
  color: var(--text-primary);
}

.notification-actions {
  display: flex;
  gap: 8px;
  padding: 0 16px 16px;
}

.overdue-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  max-height: 400px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.overdue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--danger-color);
  color: white;
}

.overdue-header h3 {
  font-size: 14px;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  opacity: 0.8;
}

.btn-close:hover {
  opacity: 1;
}

.overdue-list {
  max-height: 320px;
  overflow-y: auto;
}

.overdue-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.overdue-item:last-child {
  border-bottom: none;
}

.overdue-item-info {
  flex: 1;
}

.overdue-date {
  font-size: 12px;
  color: var(--danger-color);
  font-weight: 500;
}

.overdue-item-info h4 {
  font-size: 14px;
  margin-top: 2px;
}

.overdue-item-actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}
</style>
