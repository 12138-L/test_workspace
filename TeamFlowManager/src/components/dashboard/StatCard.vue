<template>
  <n-card hoverable class="stat-card" :class="variant">
    <div class="stat-item">
      <div class="stat-icon" :class="variant">
        <span v-html="icon"></span>
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ value }}</div>
        <div class="stat-label">{{ label }}</div>
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
/**
 * StatCard - 通用统计卡片组件
 *
 * 【复用价值】
 * ✅ Dashboard 4个统计卡片全部使用这一个组件
 * ✅ 报表页、项目详情页、团队管理页都可以复用
 * ✅ 自动配色，只需传 variant 类型
 *
 * 【设计特点】
 * - 4 种预设配色：projects / tasks / team / done
 * - 统一上浮动画 + 顶部渐变装饰条
 * - 图标缩放微交互
 * - 渐变数字上色
 */

defineProps<{
  /** 统计数值 */
  value: number | string
  /** 标签文字 */
  label: string
  /** 图标 svg */
  icon: string
  /** 样式变体 - 决定配色方案 */
  variant: 'projects' | 'tasks' | 'team' | 'done'
}>()
</script>

<style scoped>
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

.stat-card.projects::before {
  background: linear-gradient(90deg, #8080f2, #a0a0ff);
}

.stat-card.tasks::before {
  background: linear-gradient(90deg, #63e2b7, #85f0d0);
}

.stat-card.team::before {
  background: linear-gradient(90deg, #70c0e8, #90d8ff);
}

.stat-card.done::before {
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
</style>
