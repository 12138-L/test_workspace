<template>
  <div class="team-container">
    <div class="page-header">
      <h1 class="page-title">团队管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="handleAddMember">
          <el-icon><Plus /></el-icon>
          添加成员
        </el-button>
      </div>
    </div>

    <el-card>
      <template #header>
        <span>团队成员列表</span>
      </template>

      <el-table :data="teamMembers" style="width: 100%">
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="role" label="角色" width="120" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
              {{ scope.row.status === 'active' ? '活跃' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
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
import { Plus } from '@element-plus/icons-vue'
import type { TeamMember } from '@/types'

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: '张三',
    role: '项目经理',
    email: 'zhangsan@example.com',
    department: '技术部',
    status: 'active'
  },
  {
    id: 2,
    name: '李四',
    role: '前端开发',
    email: 'lisi@example.com',
    department: '技术部',
    status: 'active'
  },
  {
    id: 3,
    name: '王五',
    role: '后端开发',
    email: 'wangwu@example.com',
    department: '技术部',
    status: 'active'
  },
  {
    id: 4,
    name: '赵六',
    role: 'UI设计师',
    email: 'zhaoliu@example.com',
    department: '设计部',
    status: 'active'
  },
  {
    id: 5,
    name: '钱七',
    role: '产品经理',
    email: 'qianqi@example.com',
    department: '产品部',
    status: 'inactive'
  }
]

const handleAddMember = () => {
  // 添加成员逻辑
}

const handleEdit = (_member: TeamMember) => {
  // 编辑成员逻辑
}

const handleDelete = (_member: TeamMember) => {
  // 删除成员逻辑
}
</script>

<style scoped>
.team-container {
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
</style>
