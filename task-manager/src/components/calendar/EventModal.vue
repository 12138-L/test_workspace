<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ event ? '编辑日程' : '新建日程' }}</h2>
        <button class="btn-close" @click="$emit('close')">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label>日程标题 *</label>
          <input type="text" v-model="form.title" placeholder="输入日程标题" />
        </div>
        
        <div class="form-group">
          <label>日期</label>
          <input type="date" v-model="form.date" />
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>开始时间</label>
            <input type="time" v-model="form.startTime" />
          </div>
          
          <div class="form-group">
            <label>结束时间</label>
            <input type="time" v-model="form.endTime" />
          </div>
        </div>
        
        <div class="form-group">
          <label>优先级</label>
          <select v-model="form.priority">
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>备注</label>
          <textarea v-model="form.notes" placeholder="添加备注" rows="3"></textarea>
        </div>
        
        <div class="form-group">
          <label>重复</label>
          <select v-model="form.repeat">
            <option value="none">不重复</option>
            <option value="daily">每天</option>
            <option value="weekly">每周</option>
            <option value="monthly">每月</option>
            <option value="yearly">每年</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>提醒</label>
          <select v-model="form.reminder">
            <option value="none">无提醒</option>
            <option value="0">准时</option>
            <option value="5">提前5分钟</option>
            <option value="15">提前15分钟</option>
            <option value="30">提前30分钟</option>
            <option value="60">提前1小时</option>
            <option value="1440">提前1天</option>
          </select>
        </div>
      </div>
      
      <div class="modal-footer">
        <button v-if="event" class="btn btn-danger" @click="$emit('delete', event.id)">删除</button>
        <div class="footer-right">
          <button class="btn btn-secondary" @click="$emit('close')">取消</button>
          <button class="btn btn-primary" @click="save">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  event: {
    type: Object,
    default: null
  },
  selectedDate: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'save', 'delete'])

const form = reactive({
  title: '',
  date: dayjs().format('YYYY-MM-DD'),
  startTime: '',
  endTime: '',
  priority: 'medium',
  notes: '',
  repeat: 'none',
  reminder: 'none'
})

watch(() => props.event, (event) => {
  if (event) {
    form.title = event.title
    form.date = event.date
    form.startTime = event.startTime || ''
    form.endTime = event.endTime || ''
    form.priority = event.priority || 'medium'
    form.notes = event.notes || ''
    form.repeat = event.repeat || 'none'
    form.reminder = event.reminder || 'none'
  }
}, { immediate: true })

watch(() => props.selectedDate, (date) => {
  if (date && !props.event) {
    form.date = date
  }
}, { immediate: true })

function save() {
  if (!form.title.trim()) {
    alert('请输入日程标题')
    return
  }
  
  emit('save', {
    title: form.title.trim(),
    date: form.date,
    startTime: form.startTime,
    endTime: form.endTime,
    priority: form.priority,
    notes: form.notes.trim(),
    repeat: form.repeat,
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

.modal-footer {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
}

.footer-right {
  display: flex;
  gap: 12px;
}
</style>
