import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/main.css'
import { reminderService } from './utils/reminder'

const app = createApp(App)

app.use(createPinia())
app.use(router)

reminderService.initialize().then(() => {
  console.log('Reminder service initialized')
})

app.mount('#app')
