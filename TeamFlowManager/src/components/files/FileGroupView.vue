<script setup lang="ts">
import type { FileRecord } from '@/types'
import { formatFileSize } from '@/utils/formatters'
import { Icons } from '@/config/icons'

interface DropTarget {
  id: string
  name: string
  type: 'member' | 'category'
  category?: string
  memberId?: number
}

interface Props {
  dropTargets: DropTarget[]
  files: FileRecord[]
  getFilesInTarget: (target: DropTarget) => FileRecord[]
  isDragOver: (targetId: string) => boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  dragOver: [event: DragEvent, targetId: string]
  dragLeave: [targetId: string]
  drop: [event: DragEvent, target: DropTarget]
  delete: [file: FileRecord]
}>()
</script>

<template>
  <div class="drop-grid">
    <div
      v-for="target in props.dropTargets"
      :key="target.id"
      class="drop-column"
      :class="{ 'drop-over': props.isDragOver(target.id) }"
      @dragover.prevent="emit('dragOver', $event, target.id)"
      @dragleave="emit('dragLeave', target.id)"
      @drop.prevent="emit('drop', $event, target)"
    >
      <div class="drop-header">
        <span class="drop-title">{{ target.name }}</span>
        <n-tag size="small" type="info">
          {{ props.getFilesInTarget(target).length }} 个文件
        </n-tag>
      </div>

      <div class="drop-area">
        <div class="drop-hint">
          <span v-html="Icons.upload" class="upload-icon"></span>
          <p>拖拽文件到此处</p>
        </div>

        <div class="file-list">
          <div
            v-for="file in props.getFilesInTarget(target)"
            :key="file.id"
            class="file-item"
          >
            <span v-html="Icons.file" class="file-icon"></span>
            <div class="file-info">
              <div class="file-name">{{ file.originalName }}</div>
              <div class="file-meta">{{ formatFileSize(file.size) }}</div>
            </div>
            <n-button
              quaternary
              size="tiny"
              type="error"
              @click.stop="emit('delete', file)"
            >
              <span v-html="Icons.delete" style="width: 14px; height: 14px"></span>
            </n-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.drop-column {
  border: 2px dashed #d0d7de;
  border-radius: 8px;
  min-height: 280px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  overflow: hidden;
}

.drop-column:hover {
  border-color: #afb8c1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.drop-column.drop-over {
  border-color: #18a058;
  background: linear-gradient(180deg, #e6f7ed 0%, #f0fff4 100%);
  border-style: solid;
  box-shadow: 0 8px 24px rgba(24, 160, 88, 0.15);
  transform: translateY(-2px);
}

.drop-header {
  padding: 10px 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f6f8fa 100%);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drop-title {
  font-weight: 600;
  color: #24292f;
  font-size: 13px;
}

.drop-area {
  min-height: 210px;
  padding: 12px;
}

.drop-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 12px;
  color: #8b949e;
  border: 2px dashed #e5e7eb;
  border-radius: 6px;
  margin-bottom: 12px;
  transition: all 0.3s;
}

.drop-column.drop-over .drop-hint {
  border-color: #18a058;
  background: rgba(24, 160, 88, 0.05);
}

.drop-hint .upload-icon {
  width: 28px;
  height: 28px;
  margin-bottom: 6px;
  color: #afb8c1;
  transition: all 0.3s;
}

.drop-column.drop-over .drop-hint .upload-icon {
  color: #18a058;
  transform: scale(1.1);
}

.drop-hint p {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.file-item:hover {
  border-color: #18a058;
  box-shadow: 0 2px 8px rgba(24, 160, 88, 0.12);
  transform: translateY(-1px);
}

.file-icon {
  width: 14px;
  height: 14px;
  color: #18a058;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-icon svg,
.upload-icon svg {
  width: 100%;
  height: 100%;
  display: block;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 12px;
  font-weight: 500;
  color: #24292f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  font-size: 11px;
  color: #656d76;
}
</style>
