<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ template ? '编辑常规任务' : '添加常规任务' }}</h2>
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
import { reactive, watch } from 'vue'
import { useTaskStore } from '../../stores/taskStore'

const props = defineProps({
  template: {
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
  type: 'work',
  priority: 'medium',
  reminder: {
    enabled: false,
    time: '30'
  }
})

watch(() => props.template, (template) => {
  if (template) {
    form.title = template.title
    form.type = template.type
    form.priority = template.priority
    form.reminder = template.reminder || { enabled: false, time: '30' }
  }
}, { immediate: true })

function save() {
  if (!form.title.trim()) {
    alert('请输入任务标题')
    return
  }
  
  emit('save', {
    title: form.title.trim(),
    type: form.type,
    priority: form.priority,
    reminder: form.reminder
  })
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
  width: 480px;
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
.form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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
