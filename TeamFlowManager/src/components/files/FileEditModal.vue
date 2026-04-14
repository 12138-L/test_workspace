<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FileRecord, FileCategory } from '@/types'

interface CategoryOption {
  label: string
  value: string
}

interface MemberOption {
  label: string
  value: number
}

interface EditForm {
  originalName: string
  category: FileCategory
  memberId: number | undefined
  remark: string
}

interface Props {
  show: boolean
  editingFile: FileRecord | null
  categoryOptions: CategoryOption[]
  memberOptions: MemberOption[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  save: [form: EditForm]
}>()

const editForm = ref<EditForm>({
  originalName: '',
  category: '其他' as FileCategory,
  memberId: undefined,
  remark: ''
})

watch(() => props.editingFile, (file) => {
  if (file) {
    editForm.value = {
      originalName: file.originalName,
      category: file.category,
      memberId: file.memberId,
      remark: file.remark || ''
    }
  }
}, { immediate: true })
</script>

<template>
  <n-modal :show="show" @update:show="(v) => emit('update:show', v)" preset="card" title="编辑文件" style="width: 500px">
    <n-space vertical style="width: 100%" v-if="editingFile">
      <n-form-item label="文件名">
        <n-input v-model:value="editForm.originalName" disabled />
      </n-form-item>
      <n-form-item label="文件分类">
        <n-select
          v-model:value="editForm.category"
          :options="props.categoryOptions as any"
          placeholder="请选择分类"
        />
      </n-form-item>
      <n-form-item label="关联人员">
        <n-select
          v-model:value="editForm.memberId"
          :options="props.memberOptions as any"
          placeholder="请选择人员（可选）"
          clearable
        />
      </n-form-item>
      <n-form-item label="备注">
        <n-input
          v-model:value="editForm.remark"
          type="textarea"
          placeholder="添加备注（可选）"
          :rows="2"
        />
      </n-form-item>
    </n-space>
    <template #footer>
      <n-space justify="end">
        <n-button @click="emit('update:show', false)">取消</n-button>
        <n-button type="primary" @click="emit('save', editForm)">保存</n-button>
      </n-space>
    </template>
  </n-modal>
</template>
