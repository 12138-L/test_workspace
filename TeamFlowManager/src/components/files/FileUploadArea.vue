<script setup lang="ts">
import { ref } from 'vue'
import { Icons } from '@/config/icons'

interface CategoryOption {
  label: string
  value: string
}

interface MemberOption {
  label: string
  value: number
}

interface Props {
  categoryOptions: CategoryOption[]
  memberOptions: MemberOption[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  drop: [event: DragEvent, category: string, memberId: number | undefined]
}>()

const isListDragOver = ref(false)
const uploadDefaultCategory = ref('其他')
const uploadDefaultMemberId = ref<number | undefined>(undefined)

function handleListDrop(e: DragEvent) {
  isListDragOver.value = false
  emit('drop', e, uploadDefaultCategory.value, uploadDefaultMemberId.value)
}
</script>

<template>
  <div
    class="list-upload-area"
    :class="{ 'drop-over': isListDragOver }"
    @dragover.prevent="isListDragOver = true"
    @dragleave="isListDragOver = false"
    @drop.prevent="handleListDrop"
  >
    <span v-html="Icons.upload" class="upload-icon"></span>
    <div class="upload-content">
      <span class="upload-text">拖拽文件到此处上传</span>
      <div class="upload-options">
        <n-select
          v-model:value="uploadDefaultCategory"
          placeholder="默认分类"
          :options="props.categoryOptions as any"
          size="small"
          style="width: 110px"
          @click.stop
        />
        <n-select
          v-model:value="uploadDefaultMemberId"
          placeholder="关联人员"
          :options="props.memberOptions as any"
          clearable
          size="small"
          style="width: 110px"
          @click.stop
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-upload-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 20px;
  margin-bottom: 16px;
  border: 2px dashed #d0d7de;
  border-radius: 8px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.list-upload-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(24, 160, 88, 0.05), transparent);
  transition: left 0.5s;
}

.list-upload-area:hover::before {
  left: 100%;
}

.list-upload-area:hover {
  border-color: #18a058;
  background: linear-gradient(135deg, #f0fff4 0%, #ffffff 100%);
  box-shadow: 0 4px 12px rgba(24, 160, 88, 0.1);
}

.list-upload-area.drop-over {
  border-color: #18a058;
  background: linear-gradient(135deg, #e6f7ed 0%, #f0fff4 100%);
  border-style: solid;
  box-shadow: 0 8px 24px rgba(24, 160, 88, 0.15);
  transform: scale(1.01);
}

.list-upload-area .upload-icon {
  width: 28px;
  height: 28px;
  color: #8b949e;
  flex-shrink: 0;
  transition: all 0.3s;
}

.list-upload-area.drop-over .upload-icon,
.list-upload-area:hover .upload-icon {
  color: #18a058;
  transform: translateY(-1px);
}

.upload-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.list-upload-area .upload-text {
  font-size: 13px;
  color: #57606a;
  font-weight: 500;
  transition: all 0.3s;
}

.list-upload-area.drop-over .upload-text,
.list-upload-area:hover .upload-text {
  color: #18a058;
  font-weight: 600;
}

.upload-options {
  display: flex;
  gap: 8px;
}

.upload-icon svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
