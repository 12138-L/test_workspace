<template>
  <div class="daily-tasks-page">
    <header class="page-header">
      <h1>每日任务</h1>
      <button class="btn btn-primary" @click="showAddTemplateModal = true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
        添加常规任务
      </button>
    </header>
    
    <div class="daily-content">
      <div class="section">
        <div class="section-header">
          <h2>今日任务</h2>
          <span class="date-badge">{{ todayDate }}</span>
        </div>
        
        <div class="task-list" v-if="todayTasks.length > 0">
          <div v-for="task in todayTasks" :key="task.id" 
               class="daily-task-item" 
               :class="{ completed: task.completed }">
            <div class="task-checkbox" @click="toggleTask(task)">
              <svg v-if="task.completed" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
              </svg>
            </div>
            
            <div class="task-info">
              <h4>{{ task.title }}</h4>
              <div class="task-meta">
                <span class="type-badge" :style="{ background: getTypeColor(task.type) }">
                  {{ getTypeName(task.type) }}
                </span>
                <span class="priority-badge" :class="task.priority">
                  {{ getPriorityName(task.priority) }}
                </span>
                <span v-if="task.completedAt" class="completed-time">
                  完成于 {{ formatTime(task.completedAt) }}
                </span>
              </div>
            </div>
            
            <div class="task-actions">
              <button class="action-btn" @click="rescheduleTask(task)" title="延期">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
          </svg>
          <p>今天没有常规任务</p>
        </div>
      </div>
      
      <div class="section">
        <div class="section-header">
          <h2>常规任务模板</h2>
        </div>
        
        <div class="template-list" v-if="templates.length > 0">
          <div v-for="template in templates" :key="template.id" class="template-item">
            <div class="template-info">
              <h4>{{ template.title }}</h4>
              <div class="template-meta">
                <span class="type-badge" :style="{ background: getTypeColor(template.type) }">
                  {{ getTypeName(template.type) }}
                </span>
                <span class="priority-badge" :class="template.priority">
                  {{ getPriorityName(template.priority) }}
                </span>
                <span v-if="template.reminder && template.reminder.enabled" class="reminder-badge">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                  </svg>
                  提醒
                </span>
              </div>
            </div>
            
            <div class="template-actions">
              <button class="action-btn" @click="editTemplate(template)" title="编辑">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </button>
              <button class="action-btn danger" @click="deleteTemplate(template)" title="删除">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          <p>添加常规任务模板，每天自动创建</p>
        </div>
      </div>
      
      <div class="section" v-if="incompleteYesterday.length > 0">
        <div class="section-header warning">
          <h2>昨日未完成</h2>
        </div>
        
        <div class="incomplete-list">
          <div v-for="task in incompleteYesterday" :key="task.id" class="incomplete-item">
            <div class="incomplete-info">
              <h4>{{ task.title }}</h4>
              <span class="incomplete-date">{{ formatDate(task.date) }}</span>
            </div>
            <div class="incomplete-actions">
              <button class="btn btn-sm btn-primary" @click="moveToToday(task)">移至今天</button>
              <button class="btn btn-sm btn-success" @click="completeAndMove(task)">完成</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <DailyTaskModal v-if="showAddTemplateModal" :template="editingTemplate" @close="closeModal" @save="saveTemplate" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDailyTaskStore } from '../stores/dailyTaskStore'
import { useTaskStore } from '../stores/taskStore'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import DailyTaskModal from '../components/daily/DailyTaskModal.vue'

dayjs.locale('zh-cn')

const dailyTaskStore = useDailyTaskStore()
const taskStore = useTaskStore()

const showAddTemplateModal = ref(false)
const editingTemplate = ref(null)

const todayDate = computed(() => dayjs().format('YYYY年MM月DD日'))
const templates = computed(() => dailyTaskStore.getTemplates())
const todayTasks = computed(() => dailyTaskStore.getTodayTasks())
const incompleteYesterday = computed(() => dailyTaskStore.incompleteYesterdayTasks)

onMounted(async () => {
  await dailyTaskStore.initialize()
})

function getTypeName(type) {
  return taskStore.getTaskType(type).name
}

function getTypeColor(type) {
  return taskStore.getTaskType(type).color
}

function getPriorityName(priority) {
  return taskStore.getPriority(priority).name
}

function formatTime(time) {
  return dayjs(time).format('HH:mm')
}

function formatDate(date) {
  return dayjs(date).format('MM-DD')
}

async function toggleTask(task) {
  if (task.completed) {
    await dailyTaskStore.uncompleteDailyTask(task.id)
  } else {
    await dailyTaskStore.completeDailyTask(task.id)
  }
}

async function rescheduleTask(task) {
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
  await dailyTaskStore.rescheduleTask(task.id, tomorrow)
}

function editTemplate(template) {
  editingTemplate.value = template
  showAddTemplateModal.value = true
}

async function deleteTemplate(template) {
  if (confirm('确定要删除这个常规任务模板吗？')) {
    await dailyTaskStore.deleteTemplate(template.id)
  }
}

function closeModal() {
  showAddTemplateModal.value = false
  editingTemplate.value = null
}

async function saveTemplate(templateData) {
  if (editingTemplate.value) {
    await dailyTaskStore.updateTemplate(editingTemplate.value.id, templateData)
  } else {
    await dailyTaskStore.createTemplate(templateData)
  }
  closeModal()
}

async function moveToToday(task) {
  const today = dayjs().format('YYYY-MM-DD')
  await dailyTaskStore.rescheduleTask(task.id, today)
}

async function completeAndMove(task) {
  await dailyTaskStore.completeDailyTask(task.id)
}
</script>

<style scoped>
.daily-tasks-page {
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

.daily-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  padding: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 16px;
  font-weight: 600;
}

.section-header.warning h2 {
  color: var(--danger-color);
}

.date-badge {
  padding: 4px 12px;
  background: var(--bg-tertiary);
  border-radius: 20px;
  font-size: 12px;
  color: var(--text-secondary);
}

.task-list, .template-list, .incomplete-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.daily-task-item, .template-item, .incomplete-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.daily-task-item:hover, .template-item:hover, .incomplete-item:hover {
  background: var(--border-color);
}

.daily-task-item.completed {
  opacity: 0.6;
}

.daily-task-item.completed .task-info h4 {
  text-decoration: line-through;
}

.task-checkbox {
  cursor: pointer;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.task-checkbox:hover {
  color: var(--success-color);
}

.daily-task-item.completed .task-checkbox {
  color: var(--success-color);
}

.task-info, .template-info, .incomplete-info {
  flex: 1;
}

.task-info h4, .template-info h4, .incomplete-info h4 {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.task-meta, .template-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  color: white;
}

.priority-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.priority-badge.high {
  background: rgba(239, 68, 68, 0.1);
  color: var(--priority-high);
}

.priority-badge.medium {
  background: rgba(245, 158, 11, 0.1);
  color: var(--priority-medium);
}

.priority-badge.low {
  background: rgba(16, 185, 129, 0.1);
  color: var(--priority-low);
}

.completed-time {
  font-size: 11px;
  color: var(--text-muted);
}

.reminder-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--info-color);
}

.incomplete-date {
  font-size: 12px;
  color: var(--danger-color);
}

.task-actions, .template-actions, .incomplete-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.daily-task-item:hover .task-actions,
.template-item:hover .template-actions,
.incomplete-item:hover .incomplete-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.action-btn.danger:hover {
  color: var(--danger-color);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
}

.empty-state svg {
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 14px;
}
</style>
