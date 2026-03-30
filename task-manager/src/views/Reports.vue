<template>
  <div class="reports-page">
    <header class="page-header">
      <h1>报表统计</h1>
    </header>
    
    <div class="report-controls">
      <div class="control-group">
        <label>报表类型</label>
        <select v-model="reportType">
          <option value="daily">日报</option>
          <option value="weekly">周报</option>
          <option value="monthly">月报</option>
          <option value="custom">自定义</option>
        </select>
      </div>
      
      <div class="control-group" v-if="reportType === 'daily'">
        <label>选择日期</label>
        <input type="date" v-model="selectedDate" />
      </div>
      
      <div class="control-group" v-if="reportType === 'weekly'">
        <label>周起始日</label>
        <select v-model="weekStart">
          <option :value="0">周日</option>
          <option :value="1">周一</option>
        </select>
      </div>
      
      <div class="control-group" v-if="reportType === 'monthly'">
        <label>选择月份</label>
        <input type="month" v-model="selectedMonth" />
      </div>
      
      <div class="control-group" v-if="reportType === 'custom'">
        <label>开始日期</label>
        <input type="date" v-model="customStartDate" />
      </div>
      
      <div class="control-group" v-if="reportType === 'custom'">
        <label>结束日期</label>
        <input type="date" v-model="customEndDate" />
      </div>
      
      <button class="btn btn-primary" @click="generateReport">生成报表</button>
    </div>
    
    <div class="report-content" v-if="reportData">
      <div class="report-summary">
        <div class="summary-card">
          <h3>总任务数</h3>
          <span class="summary-value">{{ reportData.totalTasks }}</span>
        </div>
        <div class="summary-card">
          <h3>已完成</h3>
          <span class="summary-value success">{{ reportData.completedTasks }}</span>
        </div>
        <div class="summary-card">
          <h3>完成率</h3>
          <span class="summary-value">{{ reportData.completionRate }}%</span>
        </div>
        <div class="summary-card">
          <h3>延期任务</h3>
          <span class="summary-value danger">{{ reportData.overdueTasks }}</span>
        </div>
      </div>
      
      <div class="report-sections">
        <div class="report-section">
          <h3>任务类型分布</h3>
          <div class="type-distribution">
            <div v-for="(count, type) in reportData.typeDistribution" :key="type" class="type-bar">
              <div class="type-label">{{ getTypeName(type) }}</div>
              <div class="type-progress">
                <div class="type-progress-fill" :style="{ width: getTypePercentage(type) + '%', background: getTypeColor(type) }"></div>
              </div>
              <div class="type-count">{{ count }}</div>
            </div>
          </div>
        </div>
        
        <div class="report-section">
          <h3>优先级分布</h3>
          <div class="priority-distribution">
            <div v-for="(count, priority) in reportData.priorityDistribution" :key="priority" class="priority-item">
              <span class="priority-badge" :class="priority">{{ getPriorityName(priority) }}</span>
              <span class="priority-count">{{ count }}</span>
            </div>
          </div>
        </div>
        
        <div class="report-section">
          <h3>任务详情</h3>
          <div class="task-table">
            <table>
              <thead>
                <tr>
                  <th>任务名称</th>
                  <th>类型</th>
                  <th>优先级</th>
                  <th>截止日期</th>
                  <th>状态</th>
                  <th>进度</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in reportData.tasks" :key="task.id">
                  <td>{{ task.title }}</td>
                  <td><span class="type-badge" :style="{ background: getTypeColor(task.type) }">{{ getTypeName(task.type) }}</span></td>
                  <td><span class="priority-badge" :class="task.priority">{{ getPriorityName(task.priority) }}</span></td>
                  <td>{{ formatDate(task.dueDate) }}</td>
                  <td><span class="status-badge" :class="task.status">{{ getStatusName(task.status) }}</span></td>
                  <td>
                    <div class="progress-bar">
                      <div class="progress-bar-fill" :style="{ width: task.progress + '%' }"></div>
                    </div>
                    <span class="progress-text">{{ task.progress }}%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div class="export-actions">
        <button class="btn btn-secondary" @click="exportCSV">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01 12.01 11z"/>
          </svg>
          导出CSV
        </button>
        <button class="btn btn-secondary" @click="exportPDF">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/>
          </svg>
          导出PDF
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import dayjs from 'dayjs'
import { exportToCSV, exportToPDF } from '../utils/reportExport'

const taskStore = useTaskStore()

const reportType = ref('daily')
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const selectedMonth = ref(dayjs().format('YYYY-MM'))
const weekStart = ref(1)
const customStartDate = ref(dayjs().subtract(7, 'day').format('YYYY-MM-DD'))
const customEndDate = ref(dayjs().format('YYYY-MM-DD'))

const reportData = ref(null)

function generateReport() {
  let startDate, endDate
  
  switch (reportType.value) {
    case 'daily':
      startDate = endDate = selectedDate.value
      break
    case 'weekly':
      const current = dayjs(selectedDate.value)
      const dayOfWeek = current.day()
      const diff = dayOfWeek - weekStart.value
      startDate = current.subtract(diff >= 0 ? diff : diff + 7, 'day').format('YYYY-MM-DD')
      endDate = current.add(6 - (diff >= 0 ? diff : diff + 7), 'day').format('YYYY-MM-DD')
      break
    case 'monthly':
      startDate = dayjs(selectedMonth.value).startOf('month').format('YYYY-MM-DD')
      endDate = dayjs(selectedMonth.value).endOf('month').format('YYYY-MM-DD')
      break
    case 'custom':
      startDate = customStartDate.value
      endDate = customEndDate.value
      break
  }
  
  const tasks = taskStore.tasks.filter(t => t.dueDate >= startDate && t.dueDate <= endDate)
  
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const overdueTasks = tasks.filter(t => {
    return t.dueDate < dayjs().format('YYYY-MM-DD') && t.status !== 'completed'
  })
  
  const typeDistribution = {}
  const priorityDistribution = {}
  
  tasks.forEach(task => {
    typeDistribution[task.type] = (typeDistribution[task.type] || 0) + 1
    priorityDistribution[task.priority] = (priorityDistribution[task.priority] || 0) + 1
  })
  
  reportData.value = {
    startDate,
    endDate,
    totalTasks: tasks.length,
    completedTasks: completedTasks.length,
    completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
    overdueTasks: overdueTasks.length,
    typeDistribution,
    priorityDistribution,
    tasks
  }
}

function getTypeName(type) {
  const typeObj = taskStore.TASK_TYPES.find(t => t.id === type)
  return typeObj ? typeObj.name : type
}

function getTypeColor(type) {
  const typeObj = taskStore.TASK_TYPES.find(t => t.id === type)
  return typeObj ? typeObj.color : '#64748b'
}

function getTypePercentage(type) {
  if (!reportData.value || reportData.value.totalTasks === 0) return 0
  return Math.round((reportData.value.typeDistribution[type] / reportData.value.totalTasks) * 100)
}

function getPriorityName(priority) {
  const priorityObj = taskStore.PRIORITIES.find(p => p.id === priority)
  return priorityObj ? priorityObj.name : priority
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

function exportCSV() {
  if (!reportData.value) return
  exportToCSV(reportData.value, `任务报表_${reportData.value.startDate}_${reportData.value.endDate}`)
}

function exportPDF() {
  if (!reportData.value) return
  exportToPDF(reportData.value, `任务报表_${reportData.value.startDate}_${reportData.value.endDate}`)
}
</script>

<style scoped>
.reports-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
}

.report-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  margin-bottom: 24px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-group label {
  font-size: 12px;
  color: var(--text-secondary);
}

.control-group input,
.control-group select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
}

.report-content {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  padding: 24px;
}

.report-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.summary-card {
  text-align: center;
  padding: 20px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.summary-card h3 {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.summary-value {
  font-size: 32px;
  font-weight: 600;
}

.summary-value.success {
  color: var(--success-color);
}

.summary-value.danger {
  color: var(--danger-color);
}

.report-sections {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.report-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.type-distribution {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.type-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.type-label {
  width: 60px;
  font-size: 14px;
}

.type-progress {
  flex: 1;
  height: 24px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.type-progress-fill {
  height: 100%;
  border-radius: var(--radius-md);
  transition: width 0.3s ease;
}

.type-count {
  width: 40px;
  text-align: right;
  font-size: 14px;
  font-weight: 500;
}

.priority-distribution {
  display: flex;
  gap: 24px;
}

.priority-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.priority-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
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

.priority-count {
  font-size: 16px;
  font-weight: 600;
}

.task-table {
  overflow-x: auto;
}

.task-table table {
  width: 100%;
  border-collapse: collapse;
}

.task-table th,
.task-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.task-table th {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
}

.task-table td {
  font-size: 14px;
}

.type-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
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

.progress-text {
  font-size: 12px;
  margin-left: 8px;
}

.export-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}
</style>
