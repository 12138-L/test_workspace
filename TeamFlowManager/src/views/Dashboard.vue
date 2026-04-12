<template>
  <div class="dashboard-container">
    <n-page-header :title="greeting" :subtitle="`今天是 ${currentDate}, ${userStore.username}`">
      <template #extra>
        <n-button type="primary" @click="handleRefresh" size="small">
          <template #icon>
            <span v-html="Icons.refresh" class="icon-btn"></span>
          </template>
          刷新数据
        </n-button>
      </template>
    </n-page-header>

    <n-grid :x-gap="20" :y-gap="20" cols="4 s:2 m:4 l:4 xl:4" style="margin-top: 20px">
      <n-grid-item>
        <n-card hoverable class="stat-card">
          <div class="stat-item">
            <div class="stat-icon projects">
              <span v-html="Icons.project"></span>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ projectsStore.list.length }}</div>
              <div class="stat-label">项目总数</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card hoverable class="stat-card">
          <div class="stat-item">
            <div class="stat-icon tasks">
              <span v-html="Icons.task"></span>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ tasksStore.stats.total }}</div>
              <div class="stat-label">任务总数</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card hoverable class="stat-card">
          <div class="stat-item">
            <div class="stat-icon team">
              <span v-html="Icons.team"></span>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ teamStore.stats.total }}</div>
              <div class="stat-label">团队成员</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card hoverable class="stat-card">
          <div class="stat-item">
            <div class="stat-icon done">
              <span v-html="Icons.check"></span>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ tasksStore.stats.completed }}</div>
              <div class="stat-label">已完成任务</div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-grid :x-gap="20" :y-gap="20" cols="1 s:1 m:2 l:2 xl:2" style="margin-top: 20px">
      <n-grid-item>
        <n-card title="最近任务" hoverable>
          <n-spin :show="loading">
            <template #description>加载中...</template>
            <n-list bordered class="task-list">
              <template v-if="tasksStore.list.length > 0">
                <n-list-item v-for="task in tasksStore.list.slice(0, 5)" :key="task.id">
                  <div class="task-item">
                    <div class="task-icon">
                      <span v-html="Icons.task"></span>
                    </div>
                    <div class="task-content">
                      <div class="task-title">{{ task.title }}</div>
                      <div class="task-desc">
                        <span v-html="Icons.user" class="task-desc-icon"></span>
                        {{ task.assignee }} · {{ task.dueDate }}
                      </div>
                    </div>
                    <n-tag :type="getStatusType(task.status)" size="small">
                      {{ task.status }}
                    </n-tag>
                  </div>
                </n-list-item>
              </template>
              <div v-else class="empty-state">
                <div class="empty-icon">
                  <span v-html="Icons.task"></span>
                </div>
                <p>暂无任务</p>
              </div>
            </n-list>
          </n-spin>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card title="项目进度" hoverable>
          <n-spin :show="loading">
            <template #description>加载中...</template>
            <n-space vertical class="progress-wrapper">
              <template v-if="projectsStore.list.length > 0">
                <div
                  v-for="project in projectsStore.list.slice(0, 5)"
                  :key="project.id"
                  class="project-progress"
                >
                  <div class="progress-header">
                    <div class="project-info">
                      <div class="project-icon">
                        <span v-html="Icons.project"></span>
                      </div>
                      <span class="project-name">{{ project.name }}</span>
                    </div>
                    <span class="progress-value">{{ project.progress }}%</span>
                  </div>
                  <n-progress
                    :percentage="project.progress"
                    :color="getProgressColor(project.progress)"
                    :height="8"
                    :show-indicator="false"
                    class="progress-bar"
                  />
                </div>
              </template>
              <div v-else class="empty-state">
                <div class="empty-icon">
                  <span v-html="Icons.project"></span>
                </div>
                <p>暂无项目</p>
              </div>
            </n-space>
          </n-spin>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { message, getStatusType, getProgressColor, useAsync } from '@/utils'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'
import { useUserStore, useTeamStore } from '@/stores'
import { Icons } from '@/config/icons'

const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const userStore = useUserStore()
const teamStore = useTeamStore()

const currentDate = computed(() => {
  const now = new Date()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${now.getMonth() + 1}月${now.getDate()}日 ${weekDays[now.getDay()]}`
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const { loading, execute: fetchData } = useAsync(
  async () => {
    await Promise.all([
      projectsStore.fetchProjects(),
      tasksStore.fetchTasks(),
      teamStore.fetchMembers()
    ])
  },
  {
    errorMessage: '加载数据失败'
  }
)

onMounted(() => {
  fetchData()
})

const handleRefresh = () => {
  message.info('正在刷新数据...')
  fetchData()
}
</script>

<style scoped>
.dashboard-container {
  padding: 0 4px;
}

.stat-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  overflow: hidden;
  position: relative;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.stat-card:nth-child(1)::before {
  background: linear-gradient(90deg, #8080f2, #a0a0ff);
}

.stat-card:nth-child(2)::before {
  background: linear-gradient(90deg, #63e2b7, #85f0d0);
}

.stat-card:nth-child(3)::before {
  background: linear-gradient(90deg, #70c0e8, #90d8ff);
}

.stat-card:nth-child(4)::before {
  background: linear-gradient(90deg, #f7c861, #ffdd88);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 0;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
}

.stat-icon span {
  display: flex;
  width: 28px;
  height: 28px;
}

.stat-icon.projects {
  background: linear-gradient(135deg, #8080f2 0%, #a0a0ff 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(128, 128, 242, 0.4);
}

.stat-icon.tasks {
  background: linear-gradient(135deg, #63e2b7 0%, #85f0d0 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(99, 226, 183, 0.4);
}

.stat-icon.team {
  background: linear-gradient(135deg, #70c0e8 0%, #90d8ff 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(112, 192, 232, 0.4);
}

.stat-icon.done {
  background: linear-gradient(135deg, #f7c861 0%, #ffdd88 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(247, 200, 97, 0.4);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #333647 0%, #555867);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #8c9aa8;
  margin-top: 6px;
  font-weight: 500;
}

.task-list {
  margin-top: 16px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
  padding: 8px 0;
}

.task-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(112, 192, 232, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #70c0e8;
}

.task-icon span {
  display: flex;
  width: 18px;
  height: 18px;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 14px;
  font-weight: 600;
  color: #333647;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-desc {
  font-size: 12px;
  color: #8c9aa8;
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.4;
}

.task-desc-icon {
  display: flex;
  width: 14px;
  height: 14px;
}

.progress-wrapper {
  padding: 16px 0 0 0;
}

.project-progress {
  padding: 10px 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.project-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.project-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(128, 128, 242, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #8080f2;
}

.project-icon span {
  display: flex;
  width: 18px;
  height: 18px;
}

.project-name {
  font-size: 14px;
  font-weight: 600;
  color: #333647;
}

.progress-value {
  font-size: 16px;
  font-weight: 700;
  color: #8080f2;
}

.progress-bar {
  border-radius: 4px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 20px;
  color: #8c9aa8;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 50%;
  margin-bottom: 16px;
  color: #8c9aa8;
}

.empty-icon span {
  display: flex;
  width: 28px;
  height: 28px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}
</style>
