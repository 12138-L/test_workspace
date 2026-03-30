import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/main.css'
import { reminderService } from './utils/reminder'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import weekday from 'dayjs/plugin/weekday'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(weekday)
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const app = createApp(App)

app.use(createPinia())
app.use(router)

reminderService.initialize().then(() => {
  console.log('Reminder service initialized')
})

app.mount('#app')
