<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1 class="page-title">仪表板</h1>
      <p class="page-description">欢迎使用 TeamFlowManager，这里是您的团队工作流管理中心</p>
    </div>

    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="40" color="#409EFF"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">5</div>
            <div class="stat-label">团队成员</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="40" color="#67C23A"><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ projectsStore.activeProjects.length }}</div>
            <div class="stat-label">进行中项目</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="40" color="#E6A23C"><List /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ tasksStore.pendingTasks.length }}</div>
            <div class="stat-label">待完成任务</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="40" color="#F56C6C"><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ tasksStore.overdueTasks.length }}</div>
            <div class="stat-label">已逾期任务</div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="dashboard-content">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card class="chart-card">
            <template #header>
              <span class="card-title">项目进度</span>
            </template>
            <div class="chart-placeholder">
              <p>项目进度图表区域</p>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="activity-card">
            <template #header>
              <span class="card-title">最近活动</span>
            </template>
            <el-timeline>
              <el-timeline-item
                v-for="activity in activities"
                :key="activity.id"
                :timestamp="activity.time"
              >
                {{ activity.content }}
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Clock, User, Document, List } from '@element-plus/icons-vue'
import type { Activity } from '@/types'
import { useProjectsStore, useTasksStore } from '@/stores'

const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()

const activities: Activity[] = [
  { id: 1, time: '2024-01-15 14:30', content: '张三完成了"项目需求分析"任务' },
  { id: 2, time: '2024-01-15 13:15', content: '李四创建了新项目"产品设计"' },
  { id: 3, time: '2024-01-15 11:45', content: '王五更新了"技术文档"' },
  { id: 4, time: '2024-01-15 10:20', content: '赵六加入了团队' },
  { id: 5, time: '2024-01-15 09:00', content: '系统每日备份已完成' }
]
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-description {
  color: #909399;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  margin-right: 16px;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stat-label {
  color: #909399;
  margin-top: 4px;
}

.dashboard-content {
  margin-top: 24px;
}

.chart-card,
.activity-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 4px;
  color: #909399;
}

:deep(.el-timeline) {
  padding-left: 0;
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 12px;
}
</style>
