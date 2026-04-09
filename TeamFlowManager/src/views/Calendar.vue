<template>
  <div class="calendar-container">
    <div class="page-header">
      <h1 class="page-title">日历</h1>
      <div class="header-actions">
        <el-button type="primary" @click="handleAddEvent">
          <el-icon><Plus /></el-icon>
          添加事件
        </el-button>
      </div>
    </div>

    <el-card>
      <template #header>
        <span>日程安排</span>
      </template>

      <div class="calendar-placeholder">
        <el-icon size="48" color="#909399"><Calendar /></el-icon>
        <p>日历组件区域</p>
        <p class="placeholder-description">这里将集成完整的日历功能，支持事件创建、查看和编辑</p>
      </div>
    </el-card>

    <el-row :gutter="20" class="events-section">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>今日事件</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="event in todayEvents"
              :key="event.id"
              :timestamp="event.time"
              :type="event.type"
            >
              {{ event.title }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <span>即将到来</span>
          </template>
          <el-table :data="upcomingEvents" style="width: 100%">
            <el-table-column prop="date" label="日期" width="100" />
            <el-table-column prop="title" label="事件" />
            <el-table-column prop="type" label="类型" width="80">
              <template #default="scope">
                <el-tag size="small" :type="getEventType(scope.row.type)">
                  {{ scope.row.type }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { Plus, Calendar } from '@element-plus/icons-vue'
import type { CalendarEvent, UpcomingEvent, TagType } from '@/types'

const todayEvents: CalendarEvent[] = [
  { id: 1, title: '项目进度会议', time: '09:00', type: 'primary' },
  { id: 2, title: '客户需求讨论', time: '14:30', type: 'warning' },
  { id: 3, title: '代码审查', time: '16:00', type: 'success' }
]

const upcomingEvents: UpcomingEvent[] = [
  { id: 1, date: '01-20', title: '产品发布', type: '重要' },
  { id: 2, date: '01-22', title: '团队建设活动', type: '活动' },
  { id: 3, date: '01-25', title: '技术分享会', type: '会议' },
  { id: 4, date: '01-28', title: '项目总结', type: '重要' }
]

const getEventType = (type: string): TagType => {
  const typeMap: Record<string, TagType> = {
    重要: 'danger',
    会议: 'primary',
    活动: 'success'
  }
  return typeMap[type] || 'info'
}

const handleAddEvent = () => {
  // 添加事件逻辑
}
</script>

<style scoped>
.calendar-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.calendar-placeholder {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 4px;
  color: #909399;
}

.placeholder-description {
  margin-top: 8px;
  font-size: 14px;
  text-align: center;
}

.events-section {
  margin-top: 20px;
}

:deep(.el-timeline) {
  padding-left: 0;
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 12px;
}
</style>
