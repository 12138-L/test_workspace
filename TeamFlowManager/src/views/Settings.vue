<template>
  <div class="settings-container">
    <div class="page-header">
      <h1 class="page-title">系统设置</h1>
    </div>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>基本设置</span>
          </template>
          <el-form :model="basicSettings" label-width="100px">
            <el-form-item label="系统名称">
              <el-input v-model="basicSettings.systemName" />
            </el-form-item>
            <el-form-item label="语言">
              <el-select v-model="basicSettings.language" style="width: 100%">
                <el-option label="中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>
            <el-form-item label="时区">
              <el-select v-model="basicSettings.timezone" style="width: 100%">
                <el-option label="北京时间 (UTC+8)" value="UTC+8" />
                <el-option label="UTC" value="UTC" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBasicSettings">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <span>通知设置</span>
          </template>
          <el-form :model="notificationSettings" label-width="100px">
            <el-form-item label="邮件通知">
              <el-switch v-model="notificationSettings.email" />
            </el-form-item>
            <el-form-item label="站内消息">
              <el-switch v-model="notificationSettings.inApp" />
            </el-form-item>
            <el-form-item label="任务提醒">
              <el-switch v-model="notificationSettings.taskReminder" />
            </el-form-item>
            <el-form-item label="项目更新">
              <el-switch v-model="notificationSettings.projectUpdate" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveNotificationSettings">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <span>安全设置</span>
          </template>
          <el-form :model="securitySettings" label-width="100px">
            <el-form-item label="双重认证">
              <el-switch v-model="securitySettings.twoFactorAuth" />
            </el-form-item>
            <el-form-item label="会话超时">
              <el-select v-model="securitySettings.sessionTimeout" style="width: 100%">
                <el-option label="30分钟" value="30" />
                <el-option label="1小时" value="60" />
                <el-option label="2小时" value="120" />
                <el-option label="4小时" value="240" />
              </el-select>
            </el-form-item>
            <el-form-item label="密码强度">
              <el-select v-model="securitySettings.passwordStrength" style="width: 100%">
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveSecuritySettings">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="system-info">
      <template #header>
        <span>系统信息</span>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="系统版本">v1.0.0</el-descriptions-item>
        <el-descriptions-item label="Vue版本">3.4.15</el-descriptions-item>
        <el-descriptions-item label="构建时间">2024-01-15</el-descriptions-item>
        <el-descriptions-item label="最后更新">2024-01-15</el-descriptions-item>
        <el-descriptions-item label="技术支持">tech@teamflow.com</el-descriptions-item>
        <el-descriptions-item label="文档地址">
          <el-link type="primary" href="#">查看文档</el-link>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface BasicSettings {
  systemName: string
  language: string
  timezone: string
}

interface NotificationSettings {
  email: boolean
  inApp: boolean
  taskReminder: boolean
  projectUpdate: boolean
}

interface SecuritySettings {
  twoFactorAuth: boolean
  sessionTimeout: string
  passwordStrength: string
}

const basicSettings = ref<BasicSettings>({
  systemName: 'TeamFlowManager',
  language: 'zh-CN',
  timezone: 'UTC+8'
})

const notificationSettings = ref<NotificationSettings>({
  email: true,
  inApp: true,
  taskReminder: true,
  projectUpdate: false
})

const securitySettings = ref<SecuritySettings>({
  twoFactorAuth: false,
  sessionTimeout: '60',
  passwordStrength: 'medium'
})

const saveBasicSettings = () => {
  // 保存基本设置逻辑
}

const saveNotificationSettings = () => {
  // 保存通知设置逻辑
}

const saveSecuritySettings = () => {
  // 保存安全设置逻辑
}
</script>

<style scoped>
.settings-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.system-info {
  margin-top: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-descriptions) {
  margin-top: 0;
}
</style>
