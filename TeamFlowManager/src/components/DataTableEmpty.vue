<template>
  <div class="empty-state-wrapper">
    <div class="empty-icon">
      <span v-html="icon"></span>
    </div>
    <p class="empty-title">{{ title }}</p>
    <p v-if="description" class="empty-desc">{{ description }}</p>
    <slot>
      <n-button v-if="showCreateBtn" type="primary" size="small" @click="$emit('create')">
        {{ createText }}
      </n-button>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { Icons } from '@/config/icons'

defineEmits<{
  create: []
}>()

defineProps({
  icon: {
    type: String,
    default: Icons.empty
  },
  title: {
    type: String,
    default: '暂无数据'
  },
  description: {
    type: String,
    default: ''
  },
  showCreateBtn: {
    type: Boolean,
    default: true
  },
  createText: {
    type: String,
    default: '新建'
  }
})
</script>

<style scoped>
.empty-state-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #c9cdd4;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-icon span {
  width: 48px;
  height: 48px;
  display: flex;
}

.empty-title {
  font-size: 14px;
  color: #86909c;
  margin: 0 0 8px 0;
}

.empty-desc {
  font-size: 12px;
  color: #c9cdd4;
  margin: 0 0 16px 0;
}
</style>
