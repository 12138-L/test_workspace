<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ task ? '编辑任务' : '新建任务' }}</h2>
        <button class="btn-close" @click="$emit('close')">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label>任务标题 *</label>
          <input type="text" v-model="form.title" placeholder="输入任务标题" />
        </div>
        
        <div class="form-group">
          <label>任务描述</label>
          <textarea v-model="form.description" placeholder="输入任务描述" rows="3"></textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>任务类型</label>
            <select v-model="form.type">
              <option v-for="type in TASK_TYPES" :key="type.id" :value="type.id">
                {{ type.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>优先级</label>
            <select v-model="form.priority">
              <option v-for="priority in PRIORITIES" :key="priority.id" :value="priority.id">
                {{ priority.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>截止日期 *</label>
            <input type="date" v-model="form.dueDate" />
          </div>
          
          <div class="form-group">
            <label>截止时间</label>
            <input type="time" v-model="form.dueTime" />
          </div>
        </div>
        
        <div class="form-group">
          <label>进度模式</label>
          <div class="progress-mode-toggle">
            <button :class="{ active: form.progressMode === 'percentage' }" @click="form.progressMode = 'percentage'">
              百分比
            </button>
            <button :class="{ active: form.progressMode === 'stages' }" @click="form.progressMode = 'stages'">
              阶段式
            </button>
          </div>
        </div>
        
        <div v-if="form.progressMode === 'percentage'" class="form-group">
          <label>当前进度: {{ form.progress }}%</label>
          <input type="range" v-model.number="form.progress" min="0" max="100" step="5" />
        </div>
        
        <div v-if="form.progressMode === 'stages'" class="form-group">
          <label>任务阶段</label>
          <div class="stages-container">
            <div v-for="(stage, index) in form.stages" :key="index" class="stage-row">
              <input type="text" v-model="stage.name" placeholder="阶段名称" />
              <button class="btn-remove" @click="removeStage(index)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M19 13H5v-2h14v2z"/>
                </svg>
              </button>
            </div>
            <button class="btn btn-secondary btn-sm" @click="addStage">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              添加阶段
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label>提醒设置</label>
          <div class="reminder-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.reminder.enabled" />
              启用提醒
            </label>
            <select v-if="form.reminder.enabled" v-model="form.reminder.time">
              <option value="0">截止时</option>
              <option value="5">提前5分钟</option>
              <option value="15">提前15分钟</option>
              <option value="30">提前30分钟</option>
              <option value="60">提前1小时</option>
              <option value="1440">提前1天</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">取消</button>
        <button class="btn btn-primary" @click="save">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import dayjs from 'dayjs'
import { generateId } from '../../utils/encryption'

const props = defineProps({
  task: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const taskStore = useTaskStore()

const TASK_TYPES = taskStore.TASK_TYPES
const PRIORITIES = taskStore.PRIORITIES

const form = reactive({
  title: '',
  description: '',
  type: 'work',
  priority: 'medium',
  dueDate: dayjs().format('YYYY-MM-DD'),
  dueTime: '',
  progressMode: 'percentage',
  progress: 0,
  stages: [],
  reminder: {
    enabled: false,
    time: '30'
  }
})

watch(() => props.task, (task) => {
  if (task) {
    form.title = task.title
    form.description = task.description || ''
    form.type = task.type
    form.priority = task.priority
    form.dueDate = task.dueDate
    form.dueTime = task.dueTime || ''
    form.progressMode = task.stages && task.stages.length > 0 ? 'stages' : 'percentage'
    form.progress = task.progress || 0
    form.stages = task.stages ? [...task.stages] : []
    form.reminder = task.reminder || { enabled: false, time: '30' }
  }
}, { immediate: true })

function addStage() {
  form.stages.push({
    id: generateId(),
    name: '',
    completed: false
  })
}

function removeStage(index) {
  form.stages.splice(index, 1)
}

function save() {
  if (!form.title.trim()) {
    alert('请输入任务标题')
    return
  }
  
  if (!form.dueDate) {
    alert('请选择截止日期')
    return
  }
  
  const taskData = {
    title: form.title.trim(),
    description: form.description.trim(),
    type: form.type,
    priority: form.priority,
    dueDate: form.dueDate,
    dueTime: form.dueTime,
    progress: form.progressMode === 'stages' 
      ? calculateStageProgress() 
      : form.progress,
    stages: form.progressMode === 'stages' ? form.stages : [],
    reminder: form.reminder
  }
  
  emit('save', taskData)
}

function calculateStageProgress() {
  if (form.stages.length === 0) return 0
  const completed = form.stages.filter(s => s.completed).length
  return Math.round((completed / form.stages.length) * 100)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
}

.btn-close:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.form-group input[type="text"],
.form-group input[type="date"],
.form-group input[type="time"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.progress-mode-toggle {
  display: flex;
  gap: 8px;
}

.progress-mode-toggle button {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.progress-mode-toggle button.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.form-group input[type="range"] {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: var(--bg-tertiary);
  outline: none;
  -webkit-appearance: none;
}

.form-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
}

.stages-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stage-row {
  display: flex;
  gap: 8px;
}

.stage-row input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
}

.btn-remove {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  padding: 8px;
  border-radius: var(--radius-md);
  cursor: pointer;
}

.btn-remove:hover {
  color: var(--danger-color);
  border-color: var(--danger-color);
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}

.reminder-options {
  display: flex;
  align-items: center;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
}

.reminder-options select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
}
</style>
