<template>
  <div class="files-container">
    <n-page-header title="文件管理" subtitle="管理团队文档和附件">
      <template #extra>
        <n-space>
          <n-radio-group v-model:value="viewMode" size="small">
            <n-radio-button value="list">列表视图</n-radio-button>
            <n-radio-button value="byType">按类型分组</n-radio-button>
            <n-radio-button value="byMember">按人员分组</n-radio-button>
          </n-radio-group>
        </n-space>
      </template>
    </n-page-header>

    <n-card v-if="viewMode === 'list'" style="margin-top: 20px" title="文件列表">
      <template #header-extra>
        <n-space>
          <n-button
            v-if="selectedRowKeys.length > 0"
            type="error"
            size="small"
            @click="handleBatchDelete"
          >
            批量删除 ({{ selectedRowKeys.length }})
          </n-button>
          <n-select
            v-model:value="filterCategory"
            placeholder="分类筛选"
            clearable
            :options="categoryOptions"
            style="width: 120px"
          />
          <n-input
            v-model:value="searchKeyword"
            placeholder="搜索文件名"
            clearable
            style="width: 200px"
          />
          <n-button type="primary" size="small" @click="showUploadModal = true">
            <template #icon>
              <span v-html="Icons.upload" style="width: 16px; height: 16px"></span>
            </template>
            上传文件
          </n-button>
        </n-space>
      </template>

      <FileUploadArea
        :category-options="categoryOptions"
        :member-options="memberOptions"
        @drop="handleListDrop"
      />

      <FileListTable
        :files="filteredFiles"
        :selected-row-keys="selectedRowKeys"
        @update:selected-row-keys="keys => (selectedRowKeys = keys)"
        :loading="loading"
        @download="handleDownload"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </n-card>

    <n-card v-else style="margin-top: 20px">
      <template #header>
        <n-space align="center">
          <span class="card-title">{{
            viewMode === 'byType' ? '按文件类型分组' : '按人员分组'
          }}</span>
          <n-select
            v-if="viewMode === 'byType'"
            v-model:value="selectedCategory"
            :options="categoryOptions"
            placeholder="选择文件类型"
            style="width: 150px"
            @update:value="loadGroupedData"
          />
          <n-select
            v-if="viewMode === 'byMember'"
            v-model:value="selectedMemberId"
            :options="memberOptions"
            placeholder="选择人员"
            clearable
            style="width: 150px"
            @update:value="loadGroupedData"
          />
        </n-space>
      </template>

      <FileGroupView
        :drop-targets="dropTargets"
        :files="files"
        :get-files-in-target="getFilesInTarget"
        :is-drag-over="isDragOver"
        @drag-over="handleDragOver"
        @drag-leave="handleDragLeave"
        @drop="handleDrop"
        @delete="handleDelete"
      />
    </n-card>

    <FileUploadModal
      v-model:show="showUploadModal"
      :category-options="categoryOptions"
      :member-options="memberOptions"
      @upload="handleModalUpload"
    />

    <FileEditModal
      v-model:show="showEditModal"
      :editing-file="editingFile"
      :category-options="categoryOptions"
      :member-options="memberOptions"
      @save="handleSaveEdit"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * Files - 文件管理页面
 *
 * 【架构评价 - 已非常优秀】
 * ✅ 5个专用组件已完全拆分
 * ✅ 三种视图模式完整实现
 * ✅ 拖拽上传 + 批量操作
 *
 * 【本次升级完成】
 * ✅ 业务逻辑抽离到 useFiles
 * ✅ useAsync 统一错误处理
 */

import { onMounted } from 'vue'
import { useTeamStore } from '@/stores/team'
import { Icons } from '@/config/icons'
import { useFiles } from '@/composables/useFiles'
import FileListTable from '@/components/files/FileListTable.vue'
import FileUploadArea from '@/components/files/FileUploadArea.vue'
import FileUploadModal from '@/components/files/FileUploadModal.vue'
import FileEditModal from '@/components/files/FileEditModal.vue'
import FileGroupView from '@/components/files/FileGroupView.vue'

const teamStore = useTeamStore()

const {
  categoryOptions,
  memberOptions,
  loading,
  viewMode,
  files,
  filterCategory,
  searchKeyword,
  selectedRowKeys,
  showUploadModal,
  showEditModal,
  editingFile,
  selectedCategory,
  selectedMemberId,
  filteredFiles,
  dropTargets,
  isDragOver,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  getFilesInTarget,
  loadFiles,
  loadGroupedData,
  handleDownload,
  handleDelete,
  handleBatchDelete,
  handleListDrop,
  handleModalUpload,
  handleSaveEdit,
  handleEdit
} = useFiles({ team: teamStore })

onMounted(() => {
  loadFiles()
  teamStore.fetchTeam()
})
</script>

<style scoped>
.card-title {
  font-weight: 600;
  font-size: 16px;
}
</style>
