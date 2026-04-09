<template>
  <div class="tasks-container">
    <div class="page-header">
      <h1 class="page-title">任务管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="handleCreateTask">
          <el-icon><Plus /></el-icon>
          新建任务
        </el-button>
      </div>
    </div>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>任务列表</span>
          <el-input
            :model-value="tasksStore.searchKeyword"
            placeholder="搜索任务"
            style="width: 240px"
            clearable
            @update:model-value="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </template>

      <el-table :data="tasksStore.filteredTasks" style="width: 100%">
        <el-table-column prop="title" label="任务标题" />
        <el-table-column prop="assignee" label="负责人" width="120" />
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="scope">
            <el-tag :type="getPriorityType(scope.row.priority)">
              {{ scope.row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dueDate" label="截止日期" width="120" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Plus, Search } from '@element-plus/icons-vue'
import type { Task, TagType } from '@/types'
import { useTasksStore } from '@/stores'

const tasksStore = useTasksStore()

const handleSearch = (value: string) => {
  tasksStore.setSearchKeyword(value)
}

const getPriorityType = (priority: string): TagType => {
  const priorityMap: Record<string, TagType> = {
    高: 'danger',
    中: 'warning',
    低: 'info'
  }
  return priorityMap[priority] || 'info'
}

const getStatusType = (status: string): TagType => {
  const statusMap: Record<string, TagType> = {
    待开始: 'info',
    进行中: 'primary',
    已完成: 'success',
    已延期: 'danger'
  }
  return statusMap[status] || 'info'
}

const handleCreateTask = () => {
  // 创建任务逻辑
}

const handleEdit = (_task: Task) => {
  // 编辑任务逻辑
}

const handleDelete = (_task: Task) => {
  // 删除任务逻辑
}
</script>

<style scoped>
.tasks-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
