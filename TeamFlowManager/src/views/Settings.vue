<template>
  <div class="settings-container">
    <n-page-header title="系统设置" subtitle="配置系统参数">
      <template #extra>
        <n-button type="primary" @click="saveAllSettings">
          <template #icon>
            <span v-html="Icons.check" class="icon-btn"></span>
          </template>
          保存全部
        </n-button>
      </template>
    </n-page-header>

    <n-grid :x-gap="20" :y-gap="20" cols="1 s:1 m:3 l:3 xl:3" style="margin-top: 20px">
      <n-grid-item>
        <n-card title="基本设置" hoverable>
          <template #header-extra>
            <span v-html="Icons.settings" class="card-header-icon"></span>
          </template>
          <n-form :model="basicSettings" label-placement="left" label-width="100" class="settings-form">
            <n-form-item label="系统名称">
              <n-input v-model:value="basicSettings.systemName" />
            </n-form-item>
            <n-form-item label="语言">
              <n-select v-model:value="basicSettings.language" style="width: 100%" :options="languageOptions" />
            </n-form-item>
            <n-form-item label="时区">
              <n-select v-model:value="basicSettings.timezone" style="width: 100%" :options="timezoneOptions" />
            </n-form-item>
          </n-form>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card title="通知设置" hoverable>
          <template #header-extra>
            <span v-html="Icons.bell" class="card-header-icon"></span>
          </template>
          <n-form :model="notificationSettings" label-placement="left" label-width="100" class="settings-form">
            <n-form-item label="邮件通知">
              <n-switch v-model:value="notificationSettings.email" />
            </n-form-item>
            <n-form-item label="站内消息">
              <n-switch v-model:value="notificationSettings.inApp" />
            </n-form-item>
            <n-form-item label="任务提醒">
              <n-switch v-model:value="notificationSettings.taskReminder" />
            </n-form-item>
            <n-form-item label="项目更新">
              <n-switch v-model:value="notificationSettings.projectUpdate" />
            </n-form-item>
          </n-form>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card title="安全设置" hoverable>
          <template #header-extra>
            <span v-html="Icons.user" class="card-header-icon"></span>
          </template>
          <n-form :model="securitySettings" label-placement="left" label-width="100" class="settings-form">
            <n-form-item label="双重认证">
              <n-switch v-model:value="securitySettings.twoFactorAuth" />
            </n-form-item>
            <n-form-item label="会话超时">
              <n-select v-model:value="securitySettings.sessionTimeout" style="width: 100%" :options="timeoutOptions" />
            </n-form-item>
            <n-form-item label="密码强度">
              <n-select v-model:value="securitySettings.passwordStrength" style="width: 100%" :options="strengthOptions" />
            </n-form-item>
          </n-form>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-card style="margin-top: 20px" title="系统信息" hoverable>
      <n-descriptions :column="2" bordered>
        <n-descriptions-item label="系统版本">v1.0.0</n-descriptions-item>
        <n-descriptions-item label="Vue版本">3.4.15</n-descriptions-item>
        <n-descriptions-item label="构建时间">2024-01-15</n-descriptions-item>
        <n-descriptions-item label="UI框架">Naive UI 2.38.x</n-descriptions-item>
      </n-descriptions>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from '@/utils/naive'
import { useSettingsStore } from '@/stores'
import { Icons } from '@/config/icons'

const settingsStore = useSettingsStore()

const basicSettings = ref({ ...settingsStore.basic })
const notificationSettings = ref({ ...settingsStore.notification })
const securitySettings = ref({ ...settingsStore.security })

const languageOptions = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]

const timezoneOptions = [
  { label: '北京时间 (UTC+8)', value: 'UTC+8' },
  { label: 'UTC', value: 'UTC' }
]

const timeoutOptions = [
  { label: '30分钟', value: '30' },
  { label: '1小时', value: '60' },
  { label: '2小时', value: '120' },
  { label: '4小时', value: '240' }
]

const strengthOptions = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' }
]

const saveAllSettings = () => {
  settingsStore.updateBasic(basicSettings.value)
  settingsStore.updateNotification(notificationSettings.value)
  settingsStore.updateSecurity(securitySettings.value)
  message.success('所有设置已保存')
}
</script>

<style scoped>
.settings-container {
  padding: 0 4px;
}

.card-header-icon {
  display: flex;
  width: 18px;
  height: 18px;
  color: #8c9aa8;
}

.settings-form {
  margin-top: 8px;
}

.settings-form .n-form-item {
  margin-bottom: 18px;
}

.settings-form .n-form-item:last-child {
  margin-bottom: 0;
}
</style>
