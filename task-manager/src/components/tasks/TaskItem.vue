<template>
  <div class="task-item" :class="{ completed: task.status === 'completed', overdue: overdue }">
    <div class="task-checkbox" @click="$emit('complete', task)">
      <svg v-if="task.status === 'completed'" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
      </svg>
    </div>
    
    <div class="task-content">
      <div class="task-header">
        <h4>{{ task.title }}</h4>
        <span class="priority-badge" :class="task.priority">{{ getPriorityName(task.priority) }}</span>
      </div>
      
      <div class="task-meta">
        <span class="type-badge" :style="{ background: getTypeColor(task.type) }">
          {{ getTypeName(task.type) }}
        </span>
        <span class="due-date" :class="{ overdue: isOverdue }">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
          </svg>
          {{ formatDate(task.dueDate) }}
        </span>
      </div>
      
      <div class="task-progress" v-if="task.status !== 'completed'">
        <div class="progress-bar">
          <div class="progress-bar-fill" :style="{ width: task.progress + '%' }"></div>
        </div>
        <span class="progress-text">{{ task.progress }}%</span>
      </div>
    </div>
    
    <div class="task-actions">
      <button class="action-btn" @click="$emit('edit', task)" title="编辑">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
      </button>
      <button class="action-btn danger" @click="$emit('delete', task)" title="删除">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
      </button>
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
  },
  overdue: {
    type: Boolean,
    default: false
  }
})

defineEmits(['edit', 'complete', 'delete'])

const taskStore = useTaskStore()

const isOverdue = computed(() => {
  return props.task.dueDate < dayjs().format('YYYY-MM-DD') && props.task.status !== 'completed'
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

function formatDate(date) {
  return dayjs(date).format('MM-DD')
}
</script>

<style scoped>
.task-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.task-item:hover {
  background: var(--border-color);
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.completed .task-header h4 {
  text-decoration: line-through;
}

.task-item.overdue {
  border-left: 3px solid var(--danger-color);
}

.task-checkbox {
  flex-shrink: 0;
  cursor: pointer;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.task-checkbox:hover {
  color: var(--success-color);
}

.task-item.completed .task-checkbox {
  color: var(--success-color);
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.task-header h4 {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.task-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.type-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  color: white;
}

.due-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-muted);
}

.due-date.overdue {
  color: var(--danger-color);
}

.task-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 11px;
  color: var(--text-muted);
  min-width: 32px;
}

.task-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.task-item:hover .task-actions {
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
</style>
