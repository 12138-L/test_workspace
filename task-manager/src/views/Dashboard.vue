<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <div class="header-left">
        <h1>仪表盘</h1>
        <p class="date-display">{{ currentDateDisplay }}</p>
      </div>
      <div class="header-right">
        <button class="btn btn-primary" @click="showAddTaskModal = true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          新建任务
        </button>
      </div>
    </header>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ todayTasks.length }}</span>
          <span class="stat-label">今日任务</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ completedToday.length }}</span>
          <span class="stat-label">已完成</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(239, 68, 68, 0.1); color: #ef4444;">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ overdueTasks.length }}</span>
          <span class="stat-label">已逾期</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6;">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ pendingTasks.length }}</span>
          <span class="stat-label">待处理</span>
        </div>
      </div>
    </div>
    
    <div class="dashboard-content">
      <div class="content-section">
        <div class="section-header">
          <h2>今日任务</h2>
          <router-link to="/tasks" class="view-all">查看全部</router-link>
        </div>
        <div class="task-list">
          <div v-if="todayTasks.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
            </svg>
            <p>今天没有任务</p>
          </div>
          <TaskItem v-for="task in todayTasks" :key="task.id" :task="task" @edit="editTask" @complete="completeTask" @delete="deleteTask" />
        </div>
      </div>
      
      <div class="content-section">
        <div class="section-header">
          <h2>逾期任务</h2>
        </div>
        <div class="task-list">
          <div v-if="overdueTasks.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <p>没有逾期任务</p>
          </div>
          <TaskItem v-for="task in overdueTasks" :key="task.id" :task="task" :overdue="true" @edit="editTask" @complete="completeTask" @delete="deleteTask" />
        </div>
      </div>
    </div>
    
    <TaskModal v-if="showAddTaskModal" :task="editingTask" @close="closeModal" @save="saveTask" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import dayjs from 'dayjs'
import TaskItem from '../components/tasks/TaskItem.vue'
import TaskModal from '../components/tasks/TaskModal.vue'

const taskStore = useTaskStore()

const showAddTaskModal = ref(false)
const editingTask = ref(null)

const currentDateDisplay = computed(() => {
  return dayjs().format('YYYY年MM月DD日 dddd')
})

const todayTasks = computed(() => taskStore.todayTasks)
const completedToday = computed(() => taskStore.completedToday)
const overdueTasks = computed(() => taskStore.overdueTasks)
const pendingTasks = computed(() => {
  return taskStore.tasks.filter(t => t.status !== 'completed')
})

function editTask(task) {
  editingTask.value = task
  showAddTaskModal.value = true
}

async function completeTask(task) {
  await taskStore.updateTask(task.id, { status: 'completed' })
}

async function deleteTask(task) {
  if (confirm('确定要删除这个任务吗？')) {
    await taskStore.deleteTask(task.id)
  }
}

function closeModal() {
  showAddTaskModal.value = false
  editingTask.value = null
}

async function saveTask(taskData) {
  if (editingTask.value) {
    await taskStore.updateTask(editingTask.value.id, taskData)
  } else {
    await taskStore.addTask(taskData)
  }
  closeModal()
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 4px;
}

.date-display {
  color: var(--text-secondary);
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  display: block;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.content-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 16px;
  font-weight: 600;
}

.view-all {
  font-size: 14px;
  color: var(--primary-color);
  text-decoration: none;
}

.view-all:hover {
  text-decoration: underline;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
