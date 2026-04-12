<template>
  <div class="calendar-container">
    <n-page-header title="日历" subtitle="管理日程安排">
      <template #extra>
        <n-button type="primary" @click="handleAddEvent">
          <template #icon>
            <span v-html="Icons.add" class="icon-btn"></span>
          </template>
          添加事件
        </n-button>
      </template>
    </n-page-header>

    <n-card class="calendar-main-card" title="日程安排">
      <div class="calendar-placeholder">
        <div class="placeholder-icon">
          <span v-html="Icons.calendar"></span>
        </div>
        <p class="placeholder-title">日历视图开发中</p>
        <p class="placeholder-description">即将集成月视图、周视图，支持拖拽创建和编辑日程事件</p>
      </div>
    </n-card>

    <n-grid :x-gap="20" :y-gap="20" cols="1 s:1 m:2 l:2 xl:2" class="calendar-grid">
      <n-grid-item>
        <n-card title="今日事件" hoverable>
          <div class="timeline-wrapper">
            <div v-for="event in todayEvents" :key="event.id" class="timeline-item">
              <div class="timeline-dot" :class="event.type"></div>
              <div class="timeline-time">{{ event.time }}</div>
              <div class="timeline-content">
                <n-tag :type="getEventType(event.type)" size="small">
                  {{ event.title }}
                </n-tag>
              </div>
            </div>
          </div>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card title="即将到来" hoverable>
          <n-data-table :columns="columns" :data="upcomingEvents" :pagination="false" class="upcoming-table" />
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import { h } from 'vue'
import type { CalendarEvent, UpcomingEvent } from '@/types'
import { message } from '@/utils/naive'
import { getEventType } from '@/utils/formatters'
import { Icons } from '@/config/icons'

const columns: DataTableColumns<UpcomingEvent> = [
  {
    title: '日期',
    key: 'date',
    width: 100
  },
  {
    title: '事件',
    key: 'title'
  },
  {
    title: '类型',
    key: 'type',
    width: 80,
    render: (row: UpcomingEvent) =>
      h('n-tag', { type: getEventType(row.type), size: 'small' }, { default: () => row.type })
  }
]

const todayEvents: CalendarEvent[] = [
  { id: 1, title: '项目进度会议', time: '09:00', type: 'info' },
  { id: 2, title: '客户需求讨论', time: '14:30', type: 'warning' },
  { id: 3, title: '代码审查', time: '16:00', type: 'success' }
]

const upcomingEvents: UpcomingEvent[] = [
  { id: 1, date: '01-20', title: '产品发布', type: 'error' },
  { id: 2, date: '01-22', title: '团队建设活动', type: 'success' },
  { id: 3, date: '01-25', title: '技术分享会', type: 'info' },
  { id: 4, date: '01-28', title: '项目总结', type: 'error' }
]

const handleAddEvent = () => {
  message.info('日历功能开发中，敬请期待！')
}
</script>

<style scoped>
.calendar-container {
  padding: 0;
}

.calendar-main-card {
  margin-top: 20px;
}

.calendar-grid {
  margin-top: 20px;
}

.calendar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #8c9aa8;
  text-align: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
}

.placeholder-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  color: #70c0e8;
}

.placeholder-icon span {
  display: flex;
  width: 36px;
  height: 36px;
}

.placeholder-title {
  font-size: 18px;
  font-weight: 600;
  color: #333647;
  margin: 0 0 8px 0;
}

.placeholder-description {
  font-size: 14px;
  color: #8c9aa8;
  margin: 0;
  max-width: 400px;
}

.timeline-wrapper {
  padding: 8px 0;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 36px;
  width: 2px;
  height: calc(100% - 8px);
  background: #f0f0f0;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.timeline-dot.info {
  background: #70c0e8;
}

.timeline-dot.success {
  background: #63e2b7;
}

.timeline-dot.warning {
  background: #f7c861;
}

.timeline-dot.error {
  background: #d03050;
}

.timeline-time {
  font-size: 13px;
  color: #8c9aa8;
  font-weight: 600;
  min-width: 60px;
}

.upcoming-table {
  margin-top: -8px;
}
</style>
