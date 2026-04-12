<template>
  <div class="kanban-board">
    <div class="kanban-columns">
      <div
        v-for="column in columns"
        :key="column.status"
        class="kanban-column"
      >
        <div class="column-header">
          <span class="column-title">{{ column.title }}</span>
          <n-tag :type="column.type" size="small">{{ getTasksByStatus(column.status).length }}</n-tag>
        </div>

        <div
          class="column-tasks"
          :class="{ 'drag-over': dragOverStatus === column.status }"
          @dragover.prevent="handleDragOver($event, column.status)"
          @dragleave="handleDragLeave"
          @drop.prevent="handleDrop(column.status)"
        >
          <div
            v-for="task in getTasksByStatus(column.status)"
            :key="task.id"
            class="task-card"
            draggable="true"
            :class="{ 'dragging': draggingTaskId === task.id }"
            @dragstart="handleDragStart($event, task.id)"
            @dragend="handleDragEnd"
          >
            <div class="task-header">
              <div class="task-title" @click="$emit('task-click', task)">{{ task.title }}</div>
              <button class="delete-btn" @click.stop="$emit('task-delete', task)">
                ×
              </button>
            </div>
            <div v-if="task.description" class="task-description">{{ task.description }}</div>
            <div class="task-meta">
              <n-tag size="small" :type="getPriorityType(task.priority)" :bordered="false">
                {{ task.priority }}
              </n-tag>
              <span class="task-assignee">{{ task.assignee }}</span>
            </div>
            <div class="task-dates">
              <div v-if="task.startTime" class="task-date">
                <span class="label">开始</span>
                {{ task.startTime }}
              </div>
              <div v-if="task.dueDate" class="task-date">
                <span class="label">截止</span>
                {{ task.dueDate }}
              </div>
            </div>
            <div v-if="task.remark" class="task-remark">
              <span class="remark-badge">📝</span>
              <span class="remark-text">{{ task.remark.slice(0, 20) }}{{ task.remark.length > 20 ? '...' : '' }}</span>
            </div>
          </div>

          <div v-if="getTasksByStatus(column.status).length === 0" class="empty-column">
            <span class="empty-text">拖拽任务到此处</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Task } from '@/types'
import { getPriorityType } from '@/utils/formatters'

interface Column {
  status: Task['status']
  title: string
  type: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'
}

const props = defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  'task-click': [task: Task]
  'task-delete': [task: Task]
  'status-change': [taskId: number, newStatus: Task['status']]
}>()

const columns: Column[] = [
  { status: '待开始', title: '待开始', type: 'default' },
  { status: '进行中', title: '进行中', type: 'info' },
  { status: '已完成', title: '已完成', type: 'success' },
  { status: '已延期', title: '已延期', type: 'warning' }
]

const draggingTaskId = ref<number | null>(null)
const dragOverStatus = ref<Task['status'] | null>(null)

function getTasksByStatus(status: Task['status']) {
  return props.tasks.filter((t: Task) => t.status === status)
}

function handleDragStart(e: DragEvent, taskId: number) {
  draggingTaskId.value = taskId
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(taskId))
  }
}

function handleDragEnd() {
  draggingTaskId.value = null
  dragOverStatus.value = null
}

function handleDragOver(e: DragEvent, status: Task['status']) {
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
  dragOverStatus.value = status
}

function handleDragLeave() {
  dragOverStatus.value = null
}

function handleDrop(newStatus: Task['status']) {
  if (draggingTaskId.value) {
    emit('status-change', draggingTaskId.value, newStatus)
  }
  handleDragEnd()
}
</script>

<style scoped>
.kanban-board {
  width: 100%;
  overflow-x: auto;
  padding-bottom: 16px;
}

.kanban-columns {
  display: flex;
  gap: 16px;
  min-width: 900px;
}

.kanban-column {
  flex: 1;
  min-width: 200px;
  background: #f7f8fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  font-weight: 500;
  border-bottom: 1px solid #e5e6eb;
}

.column-title {
  font-size: 14px;
  color: #1d2129;
}

.column-tasks {
  flex: 1;
  min-height: 400px;
  padding: 8px;
  transition: background-color 0.2s;
}

.column-tasks.drag-over {
  background: #e8f3ff;
  border: 2px dashed #18a0fb;
  border-radius: 4px;
}

.task-card {
  background: #fff;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e5e6eb;
  cursor: grab;
  transition: all 0.2s;
  user-select: none;
}

.task-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-color: #18a0fb;
}

.task-card.dragging {
  opacity: 0.5;
  transform: scale(1.02);
}

.task-card:active {
  cursor: grabbing;
}

.task-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.task-title {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #1d2129;
  line-height: 1.5;
  cursor: pointer;
}

.task-title:hover {
  color: #18a0fb;
}

.task-description {
  font-size: 12px;
  color: #86909c;
  line-height: 1.5;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.delete-btn {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  background: #f7f8fa;
  color: #86909c;
  font-size: 14px;
  font-weight: bold;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.delete-btn:hover {
  background: #fff1f0;
  color: #f53f3f;
  transform: scale(1.1);
}

.task-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.task-assignee {
  font-size: 12px;
  color: #86909c;
}

.task-dates {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 4px;
}

.task-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #86909c;
}

.task-date .label {
  padding: 0 4px;
  border-radius: 2px;
  font-size: 10px;
  background: #f2f3f5;
  color: #86909c;
}

.task-remark {
  margin-top: 6px;
  padding: 6px 8px;
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.task-remark:hover {
  background: #ffe7ba;
  border-color: #ffc069;
}

.task-remark .remark-badge {
  font-size: 12px;
  line-height: 1;
}

.task-remark .remark-text {
  flex: 1;
  font-size: 11px;
  color: #d46b08;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-column {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  color: #c9cdd4;
  font-size: 12px;
  border: 2px dashed #e5e6eb;
  border-radius: 4px;
}

.empty-text {
  text-align: center;
}
</style>
