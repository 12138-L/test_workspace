<template>
  <div class="project-progress">
    <div class="progress-header">
      <div class="project-info">
        <div class="project-icon">
          <span v-html="Icons.project"></span>
        </div>
        <span class="project-name">{{ name }}</span>
      </div>
      <span class="progress-value">{{ progress }}%</span>
    </div>
    <n-progress
      :percentage="progress"
      :color="progressColor"
      :height="8"
      :show-indicator="false"
      class="progress-bar"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * ProgressItem - 项目进度条组件
 *
 * 【复用价值】
 * ✅ Dashboard 项目进度列表
 * ✅ 项目管理页列表
 * ✅ 团队概览页
 */

import { computed } from 'vue'
import { Icons } from '@/config/icons'
import { getProgressColor } from '@/composables/useDashboard'

const props = defineProps<{
  /** 项目名称 */
  name: string
  /** 进度百分比 0-100 */
  progress: number
}>()

const progressColor = computed(() => getProgressColor(props.progress))
</script>

<style scoped>
.project-progress {
  padding: 10px 0;
  transition: transform 0.2s;
}

.project-progress:hover {
  transform: translateX(4px);
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
  transition: all 0.2s;
}

.project-progress:hover .project-icon {
  background: rgba(128, 128, 242, 0.2);
  transform: scale(1.05);
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
  transition: all 0.5s ease;
}
</style>
