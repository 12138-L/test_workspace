<template>
  <div class="app-container">
    <Sidebar />
    <main class="main-content">
      <router-view />
    </main>
    <NotificationCenter />
  </div>
</template>

<script setup>
import Sidebar from './components/layout/Sidebar.vue'
import NotificationCenter from './components/common/NotificationCenter.vue'
import { useTaskStore } from './stores/taskStore'
import { useCalendarStore } from './stores/calendarStore'
import { onMounted } from 'vue'

const taskStore = useTaskStore()
const calendarStore = useCalendarStore()

onMounted(async () => {
  await taskStore.initialize()
  await calendarStore.initialize()
  taskStore.checkDailyTasks()
})
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

.main-content {
  flex: 1;
  margin-left: 260px;
  padding: 20px;
  overflow-y: auto;
}
</style>
