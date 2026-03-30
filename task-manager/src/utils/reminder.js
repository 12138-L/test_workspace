class ReminderService {
  constructor() {
    this.timers = new Map()
    this.notificationPermission = 'default'
    this.audioContext = null
  }

  async initialize() {
    if ('Notification' in window) {
      this.notificationPermission = await Notification.requestPermission()
    }
    
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
  }

  scheduleReminder(id, reminderTime, title, options = {}) {
    this.cancelReminder(id)
    
    const now = Date.now()
    const delay = reminderTime - now
    
    if (delay <= 0) {
      this.triggerReminder(title, options)
      return
    }
    
    const timerId = setTimeout(() => {
      this.triggerReminder(title, options)
      this.timers.delete(id)
    }, delay)
    
    this.timers.set(id, timerId)
  }

  cancelReminder(id) {
    if (this.timers.has(id)) {
      clearTimeout(this.timers.get(id))
      this.timers.delete(id)
    }
  }

  cancelAllReminders() {
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()
  }

  async triggerReminder(title, options = {}) {
    const {
      body = '',
      icon = '/vite.svg',
      sound = true,
      onClick = null
    } = options
    
    if (this.notificationPermission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon,
        requireInteraction: true
      })
      
      if (onClick) {
        notification.onclick = onClick
      }
    }
    
    if (sound && this.audioContext) {
      this.playSound()
    }
    
    window.dispatchEvent(new CustomEvent('task-reminder', {
      detail: { title, body, ...options }
    }))
  }

  playSound() {
    if (!this.audioContext) return
    
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5)
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.5)
  }

  calculateReminderTime(dueDate, dueTime, reminderMinutes) {
    const dateTimeStr = dueTime ? `${dueDate}T${dueTime}` : `${dueDate}T23:59`
    const dueDateTime = new Date(dateTimeStr).getTime()
    return dueDateTime - (reminderMinutes * 60 * 1000)
  }

  scheduleTaskReminder(task) {
    if (!task.reminder || !task.reminder.enabled) return
    
    const reminderTime = this.calculateReminderTime(
      task.dueDate,
      task.dueTime,
      parseInt(task.reminder.time)
    )
    
    this.scheduleReminder(task.id, reminderTime, `任务提醒: ${task.title}`, {
      body: `截止时间: ${task.dueDate}${task.dueTime ? ' ' + task.dueTime : ''}`,
      sound: true
    })
  }

  scheduleEventReminder(event) {
    if (event.reminder === 'none') return
    
    const reminderMinutes = parseInt(event.reminder)
    const dateTimeStr = event.startTime 
      ? `${event.date}T${event.startTime}` 
      : `${event.date}T09:00`
    const eventTime = new Date(dateTimeStr).getTime()
    const reminderTime = eventTime - (reminderMinutes * 60 * 1000)
    
    this.scheduleReminder(event.id, reminderTime, `日程提醒: ${event.title}`, {
      body: `时间: ${event.date}${event.startTime ? ' ' + event.startTime : ''}`,
      sound: true
    })
  }
}

export const reminderService = new ReminderService()
export default reminderService
