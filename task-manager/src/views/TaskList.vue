<template>
  <div class="task-list-page">
    <header class="page-header">
      <h1>任务列表</h1>
      <button class="btn btn-primary" @click="showAddTaskModal = true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
        新建任务
      </button>
    </header>
    
    <div class="filter-bar">
      <div class="filter-group">
        <label>类型</label>
        <select v-model="localFilter.type" @change="updateFilter">
          <option value="all">全部</option>
          <option v-for="type in TASK_TYPES" :key="type.id" :value="type.id">{{ type.name }}</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>优先级</label>
        <select v-model="localFilter.priority" @change="updateFilter">
          <option value="all">全部</option>
          <option v-for="priority in PRIORITIES" :key="priority.id" :value="priority.id">{{ priority.name }}</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>状态</label>
        <select v-model="localFilter.status" @change="updateFilter">
          <option value="all">全部</option>
          <option value="pending">待处理</option>
          <option value="in_progress">进行中</option>
          <option value="completed">已完成</option>
        </select>
      </div>
      
      <div class="search-box">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input type="text" v-model="localFilter.search" @input="updateFilter" placeholder="搜索任务..." />
      </div>
    </div>
    
    <div class="tasks-container">
      <div v-if="filteredTasks.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
        </svg>
        <h3>没有找到任务</h3>
        <p>点击"新建任务"按钮创建您的第一个任务</p>
      </div>
      
      <div v-else class="task-grid">
        <TaskCard v-for="task in filteredTasks" :key="task.id" :task="task" @edit="editTask" @complete="completeTask" @delete="deleteTask" @update-progress="updateProgress" />
      </div>
    </div>
    
    <TaskModal v-if="showAddTaskModal" :task="editingTask" @close="closeModal" @save="saveTask" />
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import TaskCard from '../components/tasks/TaskCard.vue'
import TaskModal from '../components/tasks/TaskModal.vue'

const taskStore = useTaskStore()

const showAddTaskModal = ref(false)
const editingTask = ref(null)

const TASK_TYPES = taskStore.TASK_TYPES
const PRIORITIES = taskStore.PRIORITIES

const localFilter = reactive({
  type: 'all',
  priority: 'all',
  status: 'all',
  search: ''
})

const filteredTasks = computed(() => taskStore.filteredTasks)

watch(() => taskStore.filter, (newFilter) => {
  Object.assign(localFilter, newFilter)
}, { immediate: true })

function updateFilter() {
  taskStore.setFilter({ ...localFilter })
}

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

async function updateProgress(taskId, progress, stageUpdates) {
  await taskStore.updateTaskProgress(taskId, progress, stageUpdates)
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
.task-list-page {
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

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-group label {
  font-size: 12px;
  color: var(--text-secondary);
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  min-width: 120px;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  margin-left: auto;
}

.search-box svg {
  color: var(--text-muted);
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
}

.tasks-container {
  min-height: 400px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-muted);
}

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 18px;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.empty-state p {
  font-size: 14px;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}
</style>
