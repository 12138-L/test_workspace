<template>
  <n-list-item>
    <div class="task-item">
      <div class="task-icon">
        <span v-html="Icons.task"></span>
      </div>
      <div class="task-content">
        <div class="task-title">{{ title }}</div>
        <div class="task-desc">
          <span v-html="Icons.user" class="task-desc-icon"></span>
          {{ assignee }} · {{ dueDate }}
        </div>
      </div>
      <n-tag :type="statusType" size="small">
        {{ status }}
      </n-tag>
    </div>
  </n-list-item>
</template>

<script setup lang="ts">
/**
 * TaskListItem - 任务列表项组件
 *
 * 【复用价值】
 * ✅ Dashboard 最近任务列表
 * ✅ 任务管理页列表
 * ✅ 项目详情页关联任务列表
 * ✅ 我的任务中心
 */

import { computed } from 'vue'
import { Icons } from '@/config/icons'
import { getStatusType } from '@/composables/useDashboard'

const props = defineProps<{
  /** 任务标题 */
  title: string
  /** 负责人 */
  assignee: string
  /** 截止日期 */
  dueDate: string
  /** 任务状态 */
  status: string
}>()

const statusType = computed(() => getStatusType(props.status))
</script>

<style scoped>
.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
  padding: 8px 0;
  transition: transform 0.2s;
}

.task-item:hover {
  transform: translateX(4px);
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
  transition: all 0.2s;
}

.task-item:hover .task-icon {
  background: rgba(112, 192, 232, 0.2);
  transform: scale(1.05);
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
</style>
