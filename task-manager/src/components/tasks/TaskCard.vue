<template>
  <div class="task-card" :class="{ completed: task.status === 'completed' }">
    <div class="card-header">
      <span class="type-indicator" :style="{ background: getTypeColor(task.type) }"></span>
      <div class="card-actions">
        <button class="action-btn" @click="$emit('edit', task)">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
        <button class="action-btn danger" @click="$emit('delete', task)">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="card-body">
      <h3 class="task-title">{{ task.title }}</h3>
      <p v-if="task.description" class="task-description">{{ task.description }}</p>
      
      <div class="task-tags">
        <span class="type-badge" :style="{ background: getTypeColor(task.type) }">
          {{ getTypeName(task.type) }}
        </span>
        <span class="priority-badge" :class="task.priority">
          {{ getPriorityName(task.priority) }}
        </span>
        <span class="status-badge" :class="task.status">
          {{ getStatusName(task.status) }}
        </span>
      </div>
      
      <div class="task-dates">
        <div class="date-item">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
          </svg>
          <span>截止: {{ formatDate(task.dueDate) }}</span>
        </div>
      </div>
    </div>
    
    <div class="card-footer">
      <div class="progress-section">
        <div class="progress-header">
          <span>进度</span>
          <span>{{ task.progress }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill" :style="{ width: task.progress + '%' }"></div>
        </div>
      </div>
      
      <div class="stage-section" v-if="task.stages && task.stages.length > 0">
        <div class="stage-header">阶段</div>
        <div class="stage-list">
          <div v-for="stage in task.stages" :key="stage.id" 
               class="stage-item" 
               :class="{ completed: stage.completed }"
               @click="toggleStage(stage)">
            <span class="stage-checkbox">
              <svg v-if="stage.completed" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </span>
            <span class="stage-name">{{ stage.name }}</span>
          </div>
        </div>
      </div>
      
      <div class="card-actions-bottom">
        <button v-if="task.status !== 'completed'" class="btn btn-sm btn-success" @click="$emit('complete', task)">
          完成任务
        </button>
        <button v-else class="btn btn-sm btn-secondary" @click="uncompleteTask">
          重新打开
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import dayjs from 'dayjs'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'complete', 'delete', 'update-progress'])

const taskStore = useTaskStore()

function getTypeName(type) {
  return taskStore.getTaskType(type).name
}

function getTypeColor(type) {
  return taskStore.getTaskType(type).color
}

function getPriorityName(priority) {
  return taskStore.getPriority(priority).name
}

function getStatusName(status) {
  const statusMap = {
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成'
  }
  return statusMap[status] || status
}

function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD')
}

function toggleStage(stage) {
  const stageUpdates = [{
    id: stage.id,
    completed: !stage.completed
  }]
  
  const completedStages = props.task.stages.filter(s => 
    s.id === stage.id ? !stage.completed : s.completed
  ).length
  const progress = Math.round((completedStages / props.task.stages.length) * 100)
  
  emit('update-progress', props.task.id, progress, stageUpdates)
}

async function uncompleteTask() {
  await taskStore.updateTask(props.task.id, { status: 'pending', progress: 0 })
}
</script>

<style scoped>
.task-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: all 0.2s ease;
}

.task-card:hover {
  box-shadow: var(--shadow-md);
}

.task-card.completed {
  opacity: 0.7;
}

.task-card.completed .task-title {
  text-decoration: line-through;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.type-indicator {
  width: 4px;
  height: 24px;
  border-radius: 2px;
}

.card-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.task-card:hover .card-actions {
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

.card-body {
  padding: 16px;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.task-description {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
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

.status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.status-badge.pending {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.status-badge.in_progress {
  background: rgba(59, 130, 246, 0.1);
  color: var(--info-color);
}

.status-badge.completed {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.task-dates {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.card-footer {
  padding: 16px;
  background: var(--bg-tertiary);
}

.progress-section {
  margin-bottom: 12px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.progress-bar {
  height: 6px;
  background: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.stage-section {
  margin-bottom: 12px;
}

.stage-header {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.stage-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stage-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.stage-item:hover {
  background: var(--border-color);
}

.stage-item.completed {
  opacity: 0.6;
}

.stage-item.completed .stage-name {
  text-decoration: line-through;
}

.stage-checkbox {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--success-color);
}

.stage-item.completed .stage-checkbox {
  border-color: var(--success-color);
  background: var(--success-color);
  color: white;
}

.stage-name {
  font-size: 13px;
}

.card-actions-bottom {
  display: flex;
  justify-content: flex-end;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}
</style>
