<template>
  <n-space size="small">
    <n-button quaternary circle size="small" @click="$emit('edit')" class="action-btn">
      <template #icon>
        <span v-html="Icons.edit" class="icon-btn"></span>
      </template>
    </n-button>
    <n-button quaternary circle size="small" @click="$emit('delete')" class="action-btn delete">
      <template #icon>
        <span v-html="Icons.delete" class="icon-btn"></span>
      </template>
    </n-button>
  </n-space>
</template>

<script setup lang="ts">
import { Icons } from '@/config/icons'

defineEmits<{
  edit: []
  delete: []
}>()
</script>

<style scoped>
.action-btn {
  transition: all 0.2s;
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn.delete :deep(.icon-btn) {
  color: #d03050;
}
</style>
