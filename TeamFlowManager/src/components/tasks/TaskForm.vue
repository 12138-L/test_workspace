<template>
  <n-modal
    :show="showRef"
    @update:show="showRef = $event"
    preset="card"
    :title="editing ? '编辑任务' : '新建任务'"
    style="width: 500px"
  >
    <n-form :model="localForm" label-placement="left" label-width="100">
      <n-form-item label="任务标题" required>
        <n-input v-model:value="localForm.title" placeholder="请输入任务标题" />
      </n-form-item>
      <n-form-item label="任务内容">
        <n-input
          v-model:value="localForm.description"
          type="textarea"
          :rows="3"
          placeholder="请输入任务详情描述"
        />
      </n-form-item>
      <n-form-item label="备注">
        <n-input
          v-model:value="localForm.remark"
          type="textarea"
          :rows="2"
          placeholder="添加备注信息"
        />
      </n-form-item>
      <n-form-item label="负责人">
        <n-input v-model:value="localForm.assignee" placeholder="请输入负责人" />
      </n-form-item>
      <n-form-item label="优先级">
        <n-select v-model:value="localForm.priority" :options="priorityOptions" />
      </n-form-item>
      <n-form-item label="状态">
        <n-select v-model:value="localForm.status" :options="statusOptions" />
      </n-form-item>
      <n-form-item label="开始日期">
        <n-date-picker
          v-model:value="localForm.startTime as any"
          type="date"
          format="yyyy-MM-dd"
          value-format="timestamp"
          style="width: 100%"
        />
      </n-form-item>
      <n-form-item label="截止日期">
        <n-date-picker
          v-model:value="localForm.dueDate as any"
          type="date"
          format="yyyy-MM-dd"
          value-format="timestamp"
          style="width: 100%"
        />
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button @click="showRef = false" :disabled="loading">取消</n-button>
        <n-button type="primary" @click="handleSubmit" :loading="loading">确定</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
/**
 * TaskForm - 任务表单组件
 *
 * 【Vue 规范遵守】
 * ✅ 单向数据流：子组件不直接修改 props
 * ✅ 使用 defineModel 实现 v-model 双向绑定
 * ✅ 本地表单状态 + watch 同步父组件数据
 *
 * 【复用价值】
 * ✅ Tasks 任务管理页
 * ✅ Projects 项目内创建任务
 * ✅ Dashboard 快捷创建任务
 */

import { ref, watch } from 'vue'
import type { Task } from '@/types'

interface FormDataType {
  title: string
  description: string
  remark: string
  assignee: string
  priority: Task['priority']
  status: Task['status']
  startTime: number | null
  dueDate: number | null
}

const props = defineProps<{
  editing: boolean
  formData: FormDataType
  loading: boolean
  priorityOptions: Array<{ label: string; value: string }>
  statusOptions: Array<{ label: string; value: string }>
}>()

const emit = defineEmits<{
  submit: [formData: FormDataType]
}>()

const showRef = defineModel<boolean>('show')

const localForm = ref<FormDataType>({ ...props.formData })

watch(
  () => props.formData,
  newData => {
    localForm.value = { ...newData }
  },
  { deep: true }
)

function handleSubmit() {
  emit('submit', { ...localForm.value })
}
</script>
