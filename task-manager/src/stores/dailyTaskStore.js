import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAllItems, addItem, updateItem, deleteItem, STORES } from '../utils/database'
import { generateId } from '../utils/encryption'
import dayjs from 'dayjs'

export const useDailyTaskStore = defineStore('dailyTask', () => {
  const templates = ref([])
  const todayTasks = ref([])
  const loading = ref(false)

  const incompleteYesterdayTasks = computed(() => {
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
    return todayTasks.value.filter(task => 
      task.date === yesterday && !task.completed
    )
  })

  async function initialize() {
    loading.value = true
    try {
      templates.value = await getAllItems(STORES.DAILY_TASKS)
      await checkAndResetDailyTasks()
    } catch (error) {
      console.error('Failed to initialize daily task store:', error)
    } finally {
      loading.value = false
    }
  }

  async function checkAndResetDailyTasks() {
    const today = dayjs().format('YYYY-MM-DD')
    const todayTasksFromDB = templates.value.filter(t => t.date === today)
    
    if (todayTasksFromDB.length === 0) {
      const taskTemplates = templates.value.filter(t => t.isTemplate)
      for (const template of taskTemplates) {
        await createDailyTaskFromTemplate(template, today)
      }
    }
    
    todayTasks.value = templates.value.filter(t => t.date === today && !t.isTemplate)
  }

  async function createTemplate(templateData) {
    const template = {
      id: generateId(),
      isTemplate: true,
      ...templateData,
      createdAt: new Date().toISOString()
    }
    
    await addItem(STORES.DAILY_TASKS, template)
    templates.value.push(template)
    return template
  }

  async function updateTemplate(id, updates) {
    const index = templates.value.findIndex(t => t.id === id)
    if (index === -1) return null
    
    const updatedTemplate = {
      ...templates.value[index],
      ...updates
    }
    
    await updateItem(STORES.DAILY_TASKS, updatedTemplate)
    templates.value[index] = updatedTemplate
    return updatedTemplate
  }

  async function deleteTemplate(id) {
    await deleteItem(STORES.DAILY_TASKS, id)
    templates.value = templates.value.filter(t => t.id !== id)
  }

  async function createDailyTaskFromTemplate(template, date) {
    const dailyTask = {
      id: generateId(),
      templateId: template.id,
      date: date,
      title: template.title,
      type: template.type,
      priority: template.priority,
      reminder: template.reminder,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString()
    }
    
    await addItem(STORES.DAILY_TASKS, dailyTask)
    templates.value.push(dailyTask)
    return dailyTask
  }

  async function completeDailyTask(id) {
    const index = templates.value.findIndex(t => t.id === id)
    if (index === -1) return null
    
    const updatedTask = {
      ...templates.value[index],
      completed: true,
      completedAt: new Date().toISOString()
    }
    
    await updateItem(STORES.DAILY_TASKS, updatedTask)
    templates.value[index] = updatedTask
    return updatedTask
  }

  async function uncompleteDailyTask(id) {
    const index = templates.value.findIndex(t => t.id === id)
    if (index === -1) return null
    
    const updatedTask = {
      ...templates.value[index],
      completed: false,
      completedAt: null
    }
    
    await updateItem(STORES.DAILY_TASKS, updatedTask)
    templates.value[index] = updatedTask
    return updatedTask
  }

  async function rescheduleTask(id, newDate) {
    const index = templates.value.findIndex(t => t.id === id)
    if (index === -1) return null
    
    const updatedTask = {
      ...templates.value[index],
      date: newDate
    }
    
    await updateItem(STORES.DAILY_TASKS, updatedTask)
    templates.value[index] = updatedTask
    return updatedTask
  }

  function getTemplates() {
    return templates.value.filter(t => t.isTemplate)
  }

  function getTodayTasks() {
    const today = dayjs().format('YYYY-MM-DD')
    return templates.value.filter(t => t.date === today && !t.isTemplate)
  }

  function getTasksByDate(date) {
    return templates.value.filter(t => t.date === date && !t.isTemplate)
  }

  return {
    templates,
    todayTasks,
    loading,
    incompleteYesterdayTasks,
    initialize,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    completeDailyTask,
    uncompleteDailyTask,
    rescheduleTask,
    getTemplates,
    getTodayTasks,
    getTasksByDate
  }
})
