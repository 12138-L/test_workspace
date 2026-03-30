import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAllItems, addItem, updateItem, deleteItem, getItemsByIndex, getItemsByDateRange, STORES } from '../utils/database'
import { generateId } from '../utils/encryption'
import dayjs from 'dayjs'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref([])
  const dailyTasks = ref([])
  const loading = ref(false)
  const filter = ref({
    type: 'all',
    priority: 'all',
    status: 'all',
    search: ''
  })

  const TASK_TYPES = [
    { id: 'work', name: '工作', color: '#3b82f6', icon: 'briefcase' },
    { id: 'study', name: '学习', color: '#8b5cf6', icon: 'book' },
    { id: 'life', name: '生活', color: '#10b981', icon: 'home' },
    { id: 'health', name: '健康', color: '#ef4444', icon: 'heart' },
    { id: 'finance', name: '财务', color: '#f59e0b', icon: 'wallet' }
  ]

  const PRIORITIES = [
    { id: 'high', name: '高', color: '#ef4444' },
    { id: 'medium', name: '中', color: '#f59e0b' },
    { id: 'low', name: '低', color: '#10b981' }
  ]

  const filteredTasks = computed(() => {
    return tasks.value.filter(task => {
      if (filter.value.type !== 'all' && task.type !== filter.value.type) return false
      if (filter.value.priority !== 'all' && task.priority !== filter.value.priority) return false
      if (filter.value.status !== 'all' && task.status !== filter.value.status) return false
      if (filter.value.search && !task.title.toLowerCase().includes(filter.value.search.toLowerCase())) return false
      return true
    })
  })

  const todayTasks = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return tasks.value.filter(task => task.dueDate === today)
  })

  const overdueTasks = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return tasks.value.filter(task => 
      task.dueDate < today && task.status !== 'completed'
    ).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  })

  const completedToday = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return tasks.value.filter(task => 
      task.status === 'completed' && task.completedAt && dayjs(task.completedAt).format('YYYY-MM-DD') === today
    )
  })

  async function initialize() {
    loading.value = true
    try {
      tasks.value = await getAllItems(STORES.TASKS)
      dailyTasks.value = await getAllItems(STORES.DAILY_TASKS)
    } catch (error) {
      console.error('Failed to initialize task store:', error)
    } finally {
      loading.value = false
    }
  }

  async function addTask(taskData) {
    const task = {
      id: generateId(),
      ...taskData,
      status: 'pending',
      progress: 0,
      stages: taskData.stages || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null
    }
    
    await addItem(STORES.TASKS, task)
    tasks.value.push(task)
    return task
  }

  async function updateTask(id, updates) {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index === -1) return null
    
    const updatedTask = {
      ...tasks.value[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    if (updates.status === 'in_progress' && !tasks.value[index].startedAt) {
      updatedTask.startedAt = new Date().toISOString()
    }
    
    if (updates.status === 'completed') {
      updatedTask.completedAt = new Date().toISOString()
      updatedTask.progress = 100
    }
    
    await updateItem(STORES.TASKS, updatedTask)
    tasks.value[index] = updatedTask
    return updatedTask
  }

  async function deleteTask(id) {
    await deleteItem(STORES.TASKS, id)
    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  async function updateTaskProgress(id, progress, stageUpdates = []) {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return null
    
    const updates = { progress }
    
    if (stageUpdates.length > 0) {
      updates.stages = task.stages.map(stage => {
        const update = stageUpdates.find(s => s.id === stage.id)
        return update ? { ...stage, ...update } : stage
      })
    }
    
    return await updateTask(id, updates)
  }

  async function getTasksByDate(date) {
    return await getItemsByIndex(STORES.TASKS, 'dueDate', date)
  }

  async function getTasksByDateRange(start, end) {
    return await getItemsByDateRange(STORES.TASKS, 'dueDate', start, end)
  }

  function checkDailyTasks() {
    const today = dayjs().format('YYYY-MM-DD')
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
    
    const uncompletedYesterday = tasks.value.filter(task => 
      task.dueDate === yesterday && task.status !== 'completed'
    )
    
    return uncompletedYesterday
  }

  async function rescheduleTask(id, newDate) {
    return await updateTask(id, { dueDate: newDate })
  }

  function setFilter(newFilter) {
    filter.value = { ...filter.value, ...newFilter }
  }

  function getTaskType(typeId) {
    return TASK_TYPES.find(t => t.id === typeId) || TASK_TYPES[0]
  }

  function getPriority(priorityId) {
    return PRIORITIES.find(p => p.id === priorityId) || PRIORITIES[1]
  }

  return {
    tasks,
    dailyTasks,
    loading,
    filter,
    filteredTasks,
    todayTasks,
    overdueTasks,
    completedToday,
    TASK_TYPES,
    PRIORITIES,
    initialize,
    addTask,
    updateTask,
    deleteTask,
    updateTaskProgress,
    getTasksByDate,
    getTasksByDateRange,
    checkDailyTasks,
    rescheduleTask,
    setFilter,
    getTaskType,
    getPriority
  }
})
