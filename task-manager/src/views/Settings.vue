<template>
  <div class="settings-page">
    <header class="page-header">
      <h1>设置</h1>
    </header>
    
    <div class="settings-container">
      <section class="settings-section">
        <h2>基本设置</h2>
        
        <div class="setting-item">
          <div class="setting-info">
            <h3>周起始日</h3>
            <p>设置日历周的起始日</p>
          </div>
          <select v-model="settings.weekStart" @change="updateSetting('weekStart', settings.weekStart)">
            <option :value="0">周日</option>
            <option :value="1">周一</option>
          </select>
        </div>
      </section>
      
      <section class="settings-section">
        <h2>提醒设置</h2>
        
        <div class="setting-item">
          <div class="setting-info">
            <h3>启用提醒</h3>
            <p>开启任务提醒功能</p>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="settings.reminderEnabled" @change="updateSetting('reminderEnabled', settings.reminderEnabled)" />
            <span class="toggle-slider"></span>
          </label>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <h3>提醒声音</h3>
            <p>任务提醒时播放声音</p>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="settings.reminderSound" @change="updateSetting('reminderSound', settings.reminderSound)" />
            <span class="toggle-slider"></span>
          </label>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <h3>弹窗提醒</h3>
            <p>显示桌面通知弹窗</p>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="settings.reminderPopup" @change="updateSetting('reminderPopup', settings.reminderPopup)" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </section>
      
      <section class="settings-section">
        <h2>数据管理</h2>
        
        <div class="setting-item">
          <div class="setting-info">
            <h3>自动备份</h3>
            <p>定期自动备份任务数据</p>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="settings.autoBackup" @change="updateSetting('autoBackup', settings.autoBackup)" />
            <span class="toggle-slider"></span>
          </label>
        </div>
        
        <div class="setting-item" v-if="settings.autoBackup">
          <div class="setting-info">
            <h3>备份间隔（天）</h3>
            <p>设置自动备份的间隔天数</p>
          </div>
          <input type="number" v-model.number="settings.autoBackupInterval" min="1" max="30" @change="updateSetting('autoBackupInterval', settings.autoBackupInterval)" />
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <h3>手动备份</h3>
            <p>导出所有数据到备份文件</p>
          </div>
          <button class="btn btn-secondary" @click="handleBackup">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
            </svg>
            导出备份
          </button>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <h3>恢复数据</h3>
            <p>从备份文件恢复数据</p>
          </div>
          <div class="file-input-wrapper">
            <input type="file" ref="backupFileInput" accept=".tmbackup" @change="handleRestore" style="display: none" />
            <button class="btn btn-secondary" @click="$refs.backupFileInput.click()">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
              </svg>
              导入备份
            </button>
          </div>
        </div>
        
        <div class="setting-item danger">
          <div class="setting-info">
            <h3>清除所有数据</h3>
            <p>删除所有任务和日历数据（此操作不可恢复）</p>
          </div>
          <button class="btn btn-danger" @click="clearAllData">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            清除数据
          </button>
        </div>
      </section>
      
      <section class="settings-section">
        <h2>关于</h2>
        
        <div class="about-info">
          <div class="about-item">
            <span class="about-label">版本</span>
            <span class="about-value">1.0.0</span>
          </div>
          <div class="about-item">
            <span class="about-label">数据版本</span>
            <span class="about-value">{{ settings.dataVersion }}</span>
          </div>
          <div class="about-item">
            <span class="about-label">上次备份</span>
            <span class="about-value">{{ settings.lastBackupDate ? formatDate(settings.lastBackupDate) : '从未备份' }}</span>
          </div>
        </div>
      </section>
    </div>
    
    <div v-if="showToast" class="toast" :class="toastType">{{ toastMessage }}</div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useSettingsStore } from '../stores/settingsStore'
import { exportBackup, importBackup, downloadBackup, readBackupFile, validateBackup } from '../utils/backup'
import { clearStore, STORES } from '../utils/database'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

const settingsStore = useSettingsStore()

const settings = reactive({
  weekStart: 1,
  reminderEnabled: true,
  reminderSound: true,
  reminderPopup: true,
  autoBackup: false,
  autoBackupInterval: 7,
  lastBackupDate: null,
  dataVersion: '1.0.0'
})

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

onMounted(async () => {
  await settingsStore.initialize()
  Object.assign(settings, settingsStore.settings)
})

async function updateSetting(key, value) {
  await settingsStore.updateSetting(key, value)
  showNotification('设置已保存', 'success')
}

async function handleBackup() {
  try {
    const backupData = await exportBackup()
    downloadBackup(backupData)
    settings.lastBackupDate = new Date().toISOString()
    await settingsStore.updateSetting('lastBackupDate', settings.lastBackupDate)
    showNotification('备份成功', 'success')
  } catch (error) {
    showNotification('备份失败', 'error')
  }
}

async function handleRestore(event) {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    const backupData = await readBackupFile(file)
    const isValid = await validateBackup(backupData)
    
    if (!isValid) {
      showNotification('无效的备份文件', 'error')
      return
    }
    
    if (confirm('恢复数据将覆盖当前所有数据，确定要继续吗？')) {
      const success = await importBackup(backupData)
      if (success) {
        showNotification('数据恢复成功，页面将刷新', 'success')
        setTimeout(() => window.location.reload(), 1500)
      } else {
        showNotification('数据恢复失败', 'error')
      }
    }
  } catch (error) {
    showNotification('读取备份文件失败', 'error')
  }
  
  event.target.value = ''
}

async function clearAllData() {
  if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
    if (confirm('再次确认：这将删除所有任务、日历事件和设置数据！')) {
      try {
        for (const store of Object.values(STORES)) {
          await clearStore(store)
        }
        showNotification('数据已清除，页面将刷新', 'success')
        setTimeout(() => window.location.reload(), 1500)
      } catch (error) {
        showNotification('清除数据失败', 'error')
      }
    }
  }
}

function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function showNotification(message, type) {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}
</script>

<style scoped>
.settings-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
}

.settings-container {
  max-width: 800px;
}

.settings-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  padding: 24px;
  margin-bottom: 20px;
}

.settings-section h2 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item.danger {
  background: rgba(239, 68, 68, 0.05);
  margin: 0 -24px;
  padding: 16px 24px;
}

.setting-info h3 {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.setting-info p {
  font-size: 12px;
  color: var(--text-muted);
}

.setting-item select,
.setting-item input[type="number"] {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  min-width: 120px;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.about-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.about-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.about-label {
  color: var(--text-secondary);
  font-size: 14px;
}

.about-value {
  font-size: 14px;
  font-weight: 500;
}

.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  color: white;
  font-size: 14px;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.toast.success {
  background: var(--success-color);
}

.toast.error {
  background: var(--danger-color);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
