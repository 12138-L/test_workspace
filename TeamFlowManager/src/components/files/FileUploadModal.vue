<script setup lang="ts">
import type { UploadCustomRequestOptions } from 'naive-ui'
import { ref, watch } from 'vue'

interface CategoryOption {
  label: string
  value: string
}

interface MemberOption {
  label: string
  value: number
}

interface Props {
  show: boolean
  categoryOptions: CategoryOption[]
  memberOptions: MemberOption[]
}

interface UploadForm {
  category: string
  memberId: number | undefined
  remark: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  upload: [options: UploadCustomRequestOptions, form: UploadForm]
}>()

const uploadForm = ref({
  category: '其他',
  memberId: undefined as number | undefined,
  remark: ''
})

watch(
  () => props.show,
  val => {
    if (!val) {
      uploadForm.value = { category: '其他', memberId: undefined, remark: '' }
    }
  }
)

function handleModalUpload(options: UploadCustomRequestOptions) {
  emit('upload', options, uploadForm.value)
}
</script>

<template>
  <n-modal
    :show="show"
    @update:show="v => emit('update:show', v)"
    preset="card"
    title="上传文件"
    style="width: 500px"
  >
    <n-space vertical style="width: 100%">
      <n-form-item label="选择文件">
        <n-upload :show-file-list="true" :custom-request="handleModalUpload" multiple :max="10">
          <n-button>选择文件</n-button>
        </n-upload>
      </n-form-item>
      <n-form-item label="文件分类">
        <n-select
          v-model:value="uploadForm.category"
          :options="props.categoryOptions as any"
          placeholder="请选择分类"
        />
      </n-form-item>
      <n-form-item label="关联人员">
        <n-select
          v-model:value="uploadForm.memberId"
          :options="props.memberOptions as any"
          placeholder="请选择人员（可选）"
          clearable
        />
      </n-form-item>
      <n-form-item label="备注">
        <n-input
          v-model:value="uploadForm.remark"
          type="textarea"
          placeholder="添加备注（可选）"
          :rows="2"
        />
      </n-form-item>
    </n-space>
    <template #footer>
      <n-space justify="end">
        <n-button @click="emit('update:show', false)">取消</n-button>
      </n-space>
    </template>
  </n-modal>
</template>
