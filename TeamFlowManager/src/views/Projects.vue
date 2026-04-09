<template>
  <div class="projects-container">
    <div class="page-header">
      <h1 class="page-title">项目管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="handleCreateProject">
          <el-icon><Plus /></el-icon>
          新建项目
        </el-button>
      </div>
    </div>

    <el-card>
      <template #header>
        <span>项目列表</span>
      </template>

      <el-table :data="projects" style="width: 100%">
        <el-table-column prop="name" label="项目名称" />
        <el-table-column prop="manager" label="负责人" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="120">
          <template #default="scope">
            <el-progress :percentage="scope.row.progress" />
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始日期" width="120" />
        <el-table-column prop="endDate" label="结束日期" width="120" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import type { TagType } from '@/types'
import { useProjectsStore } from '@/stores'

const projectsStore = useProjectsStore()
const projects = projectsStore.list

const getStatusType = (status: string): TagType => {
  const statusMap: Record<string, TagType> = {
    进行中: 'primary',
    已完成: 'success',
    已暂停: 'warning'
  }
  return statusMap[status] || 'info'
}

const handleCreateProject = () => {
  // 创建项目逻辑
}

const handleView = (_project: any) => {
  // 查看项目逻辑
}

const handleEdit = (_project: any) => {
  // 编辑项目逻辑
}
</script>

<style scoped>
.projects-container {
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

:deep(.el-progress) {
  width: 100px;
}
</style>
