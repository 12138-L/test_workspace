<template>
  <div class="calendar-container">
    <n-page-header title="日历" subtitle="查看任务日程与假期安排">
      <template #extra>
        <n-space>
          <n-button-group>
            <n-button @click="prevMonth">
              <span v-html="Icons.chevronLeft" class="icon-btn"></span>
            </n-button>
            <n-button @click="goToToday">今天</n-button>
            <n-button @click="nextMonth">
              <span v-html="Icons.chevronRight" class="icon-btn"></span>
            </n-button>
          </n-button-group>
          <n-button type="success" @click="handleAddLeave">
            <template #icon>
              <span v-html="Icons.user" class="icon-btn"></span>
            </template>
            申请请假
          </n-button>
          <n-button type="warning" @click="handleAddOvertime">
            <template #icon>
              <span v-html="Icons.clock" class="icon-btn"></span>
            </template>
            登记加班
          </n-button>
          <n-button type="primary" @click="handleCreateTask">
            <template #icon>
              <span v-html="Icons.add" class="icon-btn"></span>
            </template>
            新建任务
          </n-button>
        </n-space>
      </template>
    </n-page-header>

    <n-card style="margin-top: 20px">
      <template #header>
        <div class="calendar-header">
          <h2 class="calendar-title">{{ currentYear }}年{{ currentMonth }}月</h2>
          <n-space>
            <n-statistic label="应工作时长" :value="monthWorkHours" suffix="h" size="small" />
            <n-statistic label="加班时长" :value="monthOvertimeHours" suffix="h" size="small" />
            <n-statistic label="请假时长" :value="monthLeaveHours" suffix="h" size="small" />
            <n-statistic label="实际工作时长" :value="actualWorkHours" suffix="h" size="small" />
          </n-space>
        </div>
      </template>

      <div class="calendar-legend">
        <div class="legend-item">
          <span class="legend-dot holiday"></span>
          <span>法定假日</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot workday"></span>
          <span>调休上班</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot annual"></span>
          <span>请假</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot weekend"></span>
          <span>周末</span>
        </div>
      </div>

      <div class="calendar-weekdays">
        <div v-for="day in weekDays" :key="day" class="weekday-header">{{ day }}</div>
      </div>

      <div class="calendar-grid">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="calendar-day"
          :class="{
            'is-today': day.isToday,
            'is-current-month': day.isCurrentMonth,
            'is-holiday': day.isHoliday,
            'is-workday': day.isWorkday,
            'is-weekend': day.isWeekend,
            'has-leave': day.hasLeave,
            'has-overtime': day.hasOvertime,
            'has-tasks': day.tasks && day.tasks.length > 0
          }"
          @click="handleDayClick(day)"
        >
          <div class="day-header">
            <div class="day-number">
              {{ day.date.getDate() }}
              <span v-if="day.isHoliday" class="day-badge holiday-badge">假</span>
              <span v-if="day.isWorkday" class="day-badge workday-badge">班</span>
            </div>
            <div class="day-lunar" :class="{ 'is-term': day.lunar.term }">
              {{ day.holidayName || day.lunar.dayName }}
            </div>
          </div>

          <div v-if="day.leaves && day.leaves.length > 0" class="day-leaves">
            <div
              v-for="leave in day.leaves"
              :key="'leave-' + leave.id"
              class="record-item leave-item"
            >
              <span class="record-name">{{ leave.memberName }}</span>
              <n-tag size="small" type="info">请假{{ leave.hours }}h</n-tag>
            </div>
          </div>

          <div v-if="day.overtimes && day.overtimes.length > 0" class="day-overtimes">
            <div
              v-for="overtime in day.overtimes"
              :key="'overtime-' + overtime.id"
              class="record-item overtime-item"
            >
              <span class="record-name">{{ overtime.memberName }}</span>
              <n-tag size="small" type="warning">加班{{ overtime.hours }}h</n-tag>
            </div>
          </div>

          <div class="day-tasks">
            <div
              v-for="task in day.tasks?.slice(0, 2)"
              :key="task.id"
              class="day-task-item"
              :class="'priority-' + task.priority"
              @click.stop="handleTaskClick(task)"
            >
              <span class="task-dot"></span>
              <span class="task-title">{{ task.title }}</span>
            </div>
            <div v-if="day.tasks && day.tasks.length > 2" class="more-tasks">
              +{{ day.tasks.length - 2 }} 更多
            </div>
          </div>
        </div>
      </div>
    </n-card>

    <n-modal
      v-model:show="showDayModal"
      preset="card"
      :title="selectedDayTitle"
      style="width: 700px"
    >
      <div class="day-tasks-modal">
        <div class="modal-day-header">
          <div class="modal-day-left">
            <div class="modal-day-date">{{ selectedDayDate }}</div>
            <div class="modal-day-lunar">{{ selectedDayLunar }}</div>
          </div>
          <n-space>
            <n-button type="success" size="small" @click="handleLeaveForDay"> 申请请假 </n-button>
            <n-button type="warning" size="small" @click="handleOvertimeForDay">
              登记加班
            </n-button>
            <n-button type="primary" size="small" @click="createTaskForSelectedDay">
              <template #icon>
                <span v-html="Icons.add" class="icon-btn"></span>
              </template>
              添加任务
            </n-button>
          </n-space>
        </div>

        <n-tabs type="line">
          <n-tab-pane name="tasks" tab="任务">
            <div v-if="selectedDayTasks.length === 0" class="no-content-today">
              <span v-html="Icons.task" class="no-content-icon"></span>
              <p>当天暂无任务</p>
            </div>

            <n-list v-else hoverable>
              <n-list-item v-for="task in selectedDayTasks" :key="task.id">
                <template #prefix>
                  <n-tag :type="getStatusType(task.status)" size="small">
                    {{ task.status }}
                  </n-tag>
                </template>
                <template #default>
                  <div class="task-list-item" @click="handleEditTask(task)">
                    <div class="task-list-title">{{ task.title }}</div>
                    <div class="task-list-meta">
                      <span>负责人: {{ task.assignee || '未分配' }}</span>
                      <n-tag :type="getPriorityType(task.priority)" size="small">
                        {{ task.priority }}
                      </n-tag>
                    </div>
                  </div>
                </template>
              </n-list-item>
            </n-list>
          </n-tab-pane>

          <n-tab-pane name="leave" tab="请假">
            <div v-if="selectedDayLeaves.length === 0" class="no-content-today">
              <span v-html="Icons.user" class="no-content-icon"></span>
              <p>当天暂无请假记录</p>
            </div>

            <n-list v-else hoverable>
              <n-list-item v-for="leave in selectedDayLeaves" :key="leave.id">
                <template #prefix>
                  <n-tag :type="leave.type === '年假' ? 'success' : 'info'" size="small">
                    {{ leave.type }}
                  </n-tag>
                </template>
                <template #default>
                  <div class="record-list-item">
                    <div class="record-name">{{ leave.memberName }}</div>
                    <div class="record-desc">{{ leave.date }}，请假 {{ leave.hours }} 小时</div>
                  </div>
                </template>
                <template #suffix>
                  <n-button text type="error" size="small" @click="deleteLeave(leave.id)">
                    删除
                  </n-button>
                </template>
              </n-list-item>
            </n-list>
          </n-tab-pane>

          <n-tab-pane name="overtime" tab="加班">
            <div v-if="selectedDayOvertimes.length === 0" class="no-content-today">
              <span v-html="Icons.clock" class="no-content-icon"></span>
              <p>当天暂无加班记录</p>
            </div>

            <n-list v-else hoverable>
              <n-list-item v-for="overtime in selectedDayOvertimes" :key="overtime.id">
                <template #prefix>
                  <n-tag type="warning" size="small">
                    {{ overtime.type }}
                  </n-tag>
                </template>
                <template #default>
                  <div class="record-list-item">
                    <div class="record-name">{{ overtime.memberName }}</div>
                    <div class="record-desc">
                      {{ overtime.date }}，加班 {{ overtime.hours }} 小时
                    </div>
                  </div>
                </template>
                <template #suffix>
                  <n-button text type="error" size="small" @click="deleteOvertime(overtime.id)">
                    删除
                  </n-button>
                </template>
              </n-list-item>
            </n-list>
          </n-tab-pane>

          <n-tab-pane name="settings" tab="调休设置">
            <n-space vertical style="width: 100%; padding: 12px 0">
              <n-radio-group v-model:value="adjustmentType">
                <n-radio-button value="holiday">设为假期</n-radio-button>
                <n-radio-button value="workday">设为上班</n-radio-button>
                <n-radio-button value="normal">恢复正常</n-radio-button>
              </n-radio-group>

              <n-input
                v-model:value="adjustmentName"
                placeholder="请输入名称（如：公司团建）"
                style="max-width: 300px"
              />

              <n-button type="primary" @click="saveAdjustment" :loading="saving">
                保存设置
              </n-button>

              <n-divider style="margin: 8px 0" />

              <div class="custom-adjustments-list">
                <h4>本月自定义调休</h4>
                <n-tag
                  v-for="adj in monthCustomAdjustments"
                  :key="adj.id"
                  closable
                  size="large"
                  :type="adj.type === 'holiday' ? 'success' : 'warning'"
                  style="margin: 4px"
                  @close="deleteAdjustment(adj.id)"
                >
                  {{ adj.date }} {{ adj.name }}
                </n-tag>
              </div>
            </n-space>
          </n-tab-pane>
        </n-tabs>
      </div>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showDayModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showTaskModal"
      preset="card"
      :title="editingTask ? '编辑任务' : '新建任务'"
      style="width: 500px"
    >
      <n-form :model="formData" label-placement="left" label-width="100">
        <n-form-item label="任务标题" required>
          <n-input v-model:value="formData.title" placeholder="请输入任务标题" />
        </n-form-item>
        <n-form-item label="负责人">
          <n-input v-model:value="formData.assignee" placeholder="请输入负责人" />
        </n-form-item>
        <n-form-item label="优先级">
          <n-select v-model:value="formData.priority" :options="priorityOptions" />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="formData.status" :options="statusOptions" />
        </n-form-item>
        <n-form-item label="开始日期">
          <n-date-picker
            v-model:value="formData.startTime as any"
            type="date"
            format="yyyy-MM-dd"
            value-format="timestamp"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="截止日期">
          <n-date-picker
            v-model:value="formData.dueDate as any"
            type="date"
            format="yyyy-MM-dd"
            value-format="timestamp"
            style="width: 100%"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showTaskModal = false" :disabled="submitting">取消</n-button>
          <n-button type="primary" @click="handleSubmit" :loading="submitting">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showLeaveModal" preset="card" title="申请请假" style="width: 500px">
      <n-form :model="leaveForm" label-placement="left" label-width="100">
        <n-form-item label="请假人" required>
          <n-input v-model:value="leaveForm.memberName" placeholder="请输入姓名" />
        </n-form-item>
        <n-form-item label="请假类型" required>
          <n-select v-model:value="leaveForm.type" :options="leaveTypeOptions" />
        </n-form-item>
        <n-form-item label="请假日期" required>
          <n-date-picker
            v-model:value="leaveForm.date"
            type="date"
            format="yyyy-MM-dd"
            value-format="timestamp"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="请假小时" required>
          <n-input-number
            v-model:value="leaveForm.hours"
            :min="1"
            :max="24"
            placeholder="请输入小时数"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="请假原因">
          <n-input
            v-model:value="leaveForm.reason"
            type="textarea"
            placeholder="请输入请假原因"
            :rows="3"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showLeaveModal = false" :disabled="submitting">取消</n-button>
          <n-button type="primary" @click="handleSubmitLeave" :loading="submitting"
            >提交申请</n-button
          >
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showOvertimeModal" preset="card" title="登记加班" style="width: 500px">
      <n-form :model="overtimeForm" label-placement="left" label-width="100">
        <n-form-item label="姓名" required>
          <n-input v-model:value="overtimeForm.memberName" placeholder="请输入姓名" />
        </n-form-item>
        <n-form-item label="加班类型" required>
          <n-select v-model:value="overtimeForm.type" :options="overtimeTypeOptions" />
        </n-form-item>
        <n-form-item label="加班日期" required>
          <n-date-picker
            v-model:value="overtimeForm.date"
            type="date"
            format="yyyy-MM-dd"
            value-format="timestamp"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="加班小时" required>
          <n-input-number
            v-model:value="overtimeForm.hours"
            :min="1"
            :max="24"
            placeholder="请输入小时数"
            style="width: 100%"
          />
        </n-form-item>
        <n-form-item label="加班原因">
          <n-input
            v-model:value="overtimeForm.reason"
            type="textarea"
            placeholder="请输入加班原因"
            :rows="3"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showOvertimeModal = false" :disabled="submitting">取消</n-button>
          <n-button type="primary" @click="handleSubmitOvertime" :loading="submitting"
            >提交</n-button
          >
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Task, LeaveRecord, OvertimeRecord } from '@/types'
import { useTasksStore } from '@/stores/tasks'
import { useCalendarStore } from '@/stores/calendar'
import { message } from '@/utils/naive'
import { getStatusType, getPriorityType } from '@/utils/formatters'
import { solar2lunar, getHoliday } from '@/utils/lunar'
import { Icons } from '@/config/icons'

const tasksStore = useTasksStore()
const calendarStore = useCalendarStore()

const today = new Date()
const currentDate = ref(new Date())

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const priorityOptions = [
  { label: '高', value: '高' },
  { label: '中', value: '中' },
  { label: '低', value: '低' }
]

const statusOptions = [
  { label: '待开始', value: '待开始' },
  { label: '进行中', value: '进行中' },
  { label: '已完成', value: '已完成' },
  { label: '已延期', value: '已延期' }
]

const leaveTypeOptions = [
  { label: '年假', value: '年假' },
  { label: '事假', value: '事假' },
  { label: '病假', value: '病假' },
  { label: '调休', value: '调休' },
  { label: '婚假', value: '婚假' },
  { label: '产假', value: '产假' },
  { label: '陪产假', value: '陪产假' }
]

const overtimeTypeOptions = [
  { label: '平时加班', value: '平时加班' },
  { label: '周末加班', value: '周末加班' },
  { label: '节假日加班', value: '节假日加班' }
]

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth() + 1)

const showDayModal = ref(false)
const showTaskModal = ref(false)
const showLeaveModal = ref(false)
const showOvertimeModal = ref(false)
const selectedDay = ref<any>(null)
const editingTask = ref<Task | null>(null)
const submitting = ref(false)
const saving = ref(false)
const adjustmentType = ref<'normal' | 'holiday' | 'workday'>('normal')
const adjustmentName = ref('')

const defaultFormData = {
  title: '',
  description: '',
  remark: '',
  assignee: '',
  priority: '中' as Task['priority'],
  status: '待开始' as Task['status'],
  startTime: null as number | null,
  dueDate: null as number | null
}

const formData = ref({ ...defaultFormData })

const defaultLeaveForm = {
  memberName: '',
  type: '年假' as LeaveRecord['type'],
  date: today.getTime(),
  hours: 8,
  reason: '',
  memberId: 0
}

const leaveForm = ref({ ...defaultLeaveForm })

const defaultOvertimeForm = {
  memberName: '',
  type: '平时加班' as OvertimeRecord['type'],
  date: today.getTime(),
  hours: 2,
  reason: '',
  memberId: 0
}

const overtimeForm = ref({ ...defaultOvertimeForm })

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(firstDay.getDate() - firstDay.getDay())

  const days = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    const isCurrentMonth = date.getMonth() === month
    const isToday = date.toDateString() === today.toDateString()
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    const dateStr = formatDate(date)
    const dayTasks = getTasksForDate(date)
    const leaves = calendarStore.getLeavesForDate(dateStr)
    const overtimes = calendarStore.getOvertimesForDate(dateStr)
    const adjustment = calendarStore.getAdjustmentForDate(dateStr)
    const holidayInfo = getHoliday(date)
    const lunar = solar2lunar(date)

    let holidayName = ''
    let isHoliday = false
    let isWorkday = false

    if (adjustment) {
      if (adjustment.type === 'holiday') {
        isHoliday = true
        holidayName = adjustment.name
      } else {
        isWorkday = true
      }
    } else if (holidayInfo.legal) {
      if (holidayInfo.legal.type === 'holiday') {
        isHoliday = true
        holidayName = holidayInfo.legal.name
      } else {
        isWorkday = true
      }
    }

    days.push({
      date,
      isCurrentMonth,
      isToday,
      isWeekend,
      isHoliday,
      isWorkday,
      hasLeave: leaves.length > 0,
      hasOvertime: overtimes.length > 0,
      tasks: dayTasks,
      leaves,
      overtimes,
      holidayName,
      lunar
    })
  }

  return days
})

const selectedDayTitle = computed(() => {
  if (!selectedDay.value) return '当天详情'
  const d = selectedDay.value.date
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 详情`
})

const selectedDayDate = computed(() => {
  if (!selectedDay.value) return ''
  const d = selectedDay.value.date
  const weekDayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekDayNames[d.getDay()]}`
})

const selectedDayLunar = computed(() => {
  if (!selectedDay.value) return ''
  const lunar = selectedDay.value.lunar
  return `${lunar.ganZhiYear}年 ${lunar.animal}年 ${lunar.monthName}${lunar.dayName}`
})

const selectedDayTasks = computed(() => selectedDay.value?.tasks || [])
const selectedDayLeaves = computed(() => selectedDay.value?.leaves || [])
const selectedDayOvertimes = computed(() => selectedDay.value?.overtimes || [])

const monthWorkHours = computed(() => {
  const workDays = calendarDays.value.filter(d => {
    if (!d.isCurrentMonth) return false
    if (d.isHoliday) return false
    if (d.isWorkday) return true
    return !d.isWeekend
  }).length
  return workDays * 8
})

const monthOvertimeHours = computed(() => {
  const year = currentYear.value
  const month = currentDate.value.getMonth()
  return calendarStore.overtimeRecords.reduce((sum, o) => {
    const oDate = new Date(o.date)
    if (oDate.getFullYear() === year && oDate.getMonth() === month) {
      return sum + o.hours
    }
    return sum
  }, 0)
})

const monthLeaveHours = computed(() => {
  const year = currentYear.value
  const month = currentDate.value.getMonth()
  return calendarStore.leaveRecords.reduce((sum, l) => {
    if (l.status !== '已批准') return sum
    const lDate = new Date(l.date)
    if (lDate.getFullYear() === year && lDate.getMonth() === month) {
      return sum + l.hours
    }
    return sum
  }, 0)
})

const actualWorkHours = computed(() => {
  return monthWorkHours.value - monthLeaveHours.value + monthOvertimeHours.value
})

const monthCustomAdjustments = computed(() => {
  return calendarStore.adjustments.filter(a => {
    if (!a.isCustom) return false
    const [y, m] = a.date.split('-')
    return parseInt(y) === currentYear.value && parseInt(m) === currentMonth.value
  })
})

function getTasksForDate(date: Date): Task[] {
  const dateStr = formatDate(date)
  return tasksStore.list.filter(task => {
    if (!task.startTime) return false
    const taskDate = new Date(task.startTime)
    return formatDate(taskDate) === dateStr
  })
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatTimestamp(timestamp: number | null): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return formatDate(date)
}

function prevMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

function goToToday() {
  currentDate.value = new Date()
}

function handleDayClick(day: any) {
  selectedDay.value = day
  const adj = day.isHoliday ? 'holiday' : day.isWorkday ? 'workday' : 'normal'
  adjustmentType.value = adj
  adjustmentName.value = day.holidayName || ''
  showDayModal.value = true
}

function handleTaskClick(task: Task) {
  editingTask.value = task
  formData.value = {
    title: task.title,
    description: task.description || '',
    remark: task.remark || '',
    assignee: task.assignee,
    priority: task.priority,
    status: task.status,
    startTime: task.startTime ? new Date(task.startTime).getTime() : null,
    dueDate: task.dueDate ? new Date(task.dueDate).getTime() : null
  }
  showTaskModal.value = true
}

function handleEditTask(task: Task) {
  handleTaskClick(task)
  showDayModal.value = false
}

function createTaskForSelectedDay() {
  editingTask.value = null
  formData.value = { ...defaultFormData }
  if (selectedDay.value) {
    formData.value.startTime = selectedDay.value.date.getTime()
  }
  showDayModal.value = false
  showTaskModal.value = true
}

function handleCreateTask() {
  editingTask.value = null
  formData.value = { ...defaultFormData }
  showTaskModal.value = true
}

function handleAddLeave() {
  leaveForm.value = { ...defaultLeaveForm }
  showLeaveModal.value = true
}

function handleLeaveForDay() {
  leaveForm.value = { ...defaultLeaveForm }
  if (selectedDay.value) {
    leaveForm.value.date = selectedDay.value.date.getTime()
  }
  showDayModal.value = false
  showLeaveModal.value = true
}

function handleAddOvertime() {
  overtimeForm.value = { ...defaultOvertimeForm }
  showOvertimeModal.value = true
}

function handleOvertimeForDay() {
  overtimeForm.value = { ...defaultOvertimeForm }
  if (selectedDay.value) {
    overtimeForm.value.date = selectedDay.value.date.getTime()
  }
  showDayModal.value = false
  showOvertimeModal.value = true
}

async function handleSubmit() {
  if (submitting.value) return

  const title = formData.value.title?.trim()
  if (!title) {
    message.warning('请输入任务标题')
    return
  }

  submitting.value = true
  try {
    const submitData = {
      ...formData.value,
      title,
      description: formData.value.description?.trim() || '',
      remark: formData.value.remark?.trim() || '',
      assignee: formData.value.assignee?.trim() || '',
      startTime: formatTimestamp(formData.value.startTime as number | null),
      dueDate: formatTimestamp(formData.value.dueDate as number | null)
    }

    if (editingTask.value) {
      await tasksStore.updateTask(editingTask.value.id, submitData)
      message.success('任务已更新')
    } else {
      await tasksStore.addTask(submitData)
      message.success('任务创建成功')
    }

    showTaskModal.value = false
  } finally {
    submitting.value = false
  }
}

async function handleSubmitLeave() {
  if (submitting.value) return

  if (!leaveForm.value.memberName?.trim()) {
    message.warning('请输入请假人姓名')
    return
  }
  if (!leaveForm.value.date) {
    message.warning('请选择请假日期')
    return
  }
  if (!leaveForm.value.hours || leaveForm.value.hours < 1 || leaveForm.value.hours > 24) {
    message.warning('请输入有效的请假小时数 (1-24)')
    return
  }

  submitting.value = true
  try {
    await calendarStore.addLeaveRecord({
      memberId: 0,
      memberName: leaveForm.value.memberName.trim(),
      type: leaveForm.value.type,
      date: formatDate(new Date(leaveForm.value.date)),
      hours: leaveForm.value.hours,
      reason: leaveForm.value.reason?.trim() || '',
      status: '已批准'
    })

    message.success('请假申请已提交')
    showLeaveModal.value = false
  } finally {
    submitting.value = false
  }
}

async function handleSubmitOvertime() {
  if (submitting.value) return

  if (!overtimeForm.value.memberName?.trim()) {
    message.warning('请输入姓名')
    return
  }
  if (!overtimeForm.value.date) {
    message.warning('请选择加班日期')
    return
  }
  if (!overtimeForm.value.hours || overtimeForm.value.hours < 1 || overtimeForm.value.hours > 24) {
    message.warning('请输入有效的加班小时数 (1-24)')
    return
  }

  submitting.value = true
  try {
    await calendarStore.addOvertimeRecord({
      memberId: 0,
      memberName: overtimeForm.value.memberName.trim(),
      type: overtimeForm.value.type,
      date: formatDate(new Date(overtimeForm.value.date)),
      hours: overtimeForm.value.hours,
      reason: overtimeForm.value.reason?.trim() || ''
    })

    message.success('加班已登记')
    showOvertimeModal.value = false
  } finally {
    submitting.value = false
  }
}

async function deleteLeave(id: number) {
  await calendarStore.deleteLeaveRecord(id)
  message.success('已删除请假记录')
}

async function deleteOvertime(id: number) {
  await calendarStore.deleteOvertimeRecord(id)
  message.success('已删除加班记录')
}

async function saveAdjustment() {
  if (!selectedDay.value) return

  saving.value = true
  try {
    const dateStr = formatDate(selectedDay.value.date)

    if (adjustmentType.value === 'normal') {
      const adj = calendarStore.getAdjustmentForDate(dateStr)
      if (adj && adj.isCustom) {
        await calendarStore.deleteAdjustment(adj.id)
        message.success('已恢复正常日期')
      }
    } else {
      const name =
        adjustmentName.value.trim() ||
        (adjustmentType.value === 'holiday' ? '自定义假期' : '调休上班')
      await calendarStore.addAdjustment({
        date: dateStr,
        type: adjustmentType.value,
        name
      })
      message.success('调休设置已保存')
    }

    showDayModal.value = false
  } finally {
    saving.value = false
  }
}

async function deleteAdjustment(id: number) {
  await calendarStore.deleteAdjustment(id)
  message.success('已删除自定义调休')
}

watch(showTaskModal, open => {
  if (!open) {
    editingTask.value = null
    formData.value = { ...defaultFormData }
  }
})

watch(showLeaveModal, open => {
  if (!open) {
    leaveForm.value = { ...defaultLeaveForm }
  }
})

watch(showOvertimeModal, open => {
  if (!open) {
    overtimeForm.value = { ...defaultOvertimeForm }
  }
})

onMounted(() => {
  tasksStore.fetchTasks()
  calendarStore.fetchLeaveRecords()
  calendarStore.fetchOvertimeRecords()
  calendarStore.fetchAdjustments()
})
</script>

<style scoped>
.calendar-container {
  padding: 0;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333647;
}

.calendar-header :deep(.n-statistic) {
  padding: 0 12px;
  border-left: 1px solid #e5e6eb;
}

.calendar-header :deep(.n-statistic:first-child) {
  border-left: none;
}

.calendar-header :deep(.n-statistic-label) {
  font-size: 12px;
  color: #86909c;
  margin-bottom: 2px;
}

.calendar-header :deep(.n-statistic-value) {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .calendar-header :deep(.n-statistic) {
    padding: 0 8px;
  }

  .calendar-header :deep(.n-statistic-label) {
    font-size: 11px;
  }

  .calendar-header :deep(.n-statistic-value) {
    font-size: 16px;
  }
}

.calendar-legend {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  padding: 8px 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #86909c;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-dot.holiday {
  background: #00b42a;
}

.legend-dot.workday {
  background: #ff7d00;
}

.legend-dot.annual {
  background: #722ed1;
}

.legend-dot.weekend {
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 4px;
}

.weekday-header {
  text-align: center;
  padding: 12px;
  font-weight: 600;
  color: #86909c;
  background: #f7f8fa;
  border-radius: 6px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  min-height: 110px;
  padding: 6px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}

.calendar-day:hover {
  border-color: #18a0fb;
  background: #f0f7ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(24, 160, 251, 0.15);
}

.calendar-day.is-today {
  background: linear-gradient(135deg, #e8f3ff 0%, #d6eaff 100%);
  border: 2px solid #18a0fb;
}

.calendar-day.is-today .day-number {
  color: #18a0fb;
  font-weight: 700;
}

.calendar-day:not(.is-current-month) {
  background: #f7f8fa;
  opacity: 0.5;
}

.calendar-day:not(.is-current-month):hover {
  opacity: 0.8;
}

.calendar-day.is-holiday {
  background: linear-gradient(135deg, #e8fff3 0%, #ccffe1 100%);
  border-color: #00b42a;
}

.calendar-day.is-workday {
  background: linear-gradient(135deg, #fffbe8 0%, #fff3c9 100%);
  border-color: #ff7d00;
}

.calendar-day.is-weekend:not(.is-workday):not(.is-holiday) {
  background: #fafbfc;
}

.calendar-day.has-leave:not(.is-holiday):not(.has-overtime) {
  border-color: #722ed1;
}

.calendar-day.has-overtime:not(.is-holiday):not(.has-leave) {
  border-color: #ff7d00;
}

.calendar-day.has-leave.has-overtime:not(.is-holiday) {
  border-color: #165dff;
  border-width: 2px;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.day-number {
  font-size: 14px;
  font-weight: 500;
  color: #4e5969;
  display: flex;
  align-items: center;
  gap: 4px;
}

.day-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 0 4px;
  border-radius: 2px;
  line-height: 16px;
}

.day-badge.holiday-badge {
  background: #e8ffea;
  color: #00b42a;
}

.day-badge.workday-badge {
  background: #fff2e8;
  color: #ff7d00;
}

.day-lunar {
  font-size: 11px;
  color: #86909c;
}

.day-lunar.is-term {
  color: #f53f3f;
  font-weight: 500;
}

.day-leaves {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 2px;
}

.day-overtimes {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 4px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
}

.record-item.leave-item {
  background: #f3e8ff;
  color: #722ed1;
}

.record-item.overtime-item {
  background: #fff7e8;
  color: #ff7d00;
}

.record-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-list-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-name {
  font-weight: 500;
  color: #4e5969;
}

.record-desc {
  font-size: 12px;
  color: #86909c;
}

.day-tasks {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.day-task-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
  background: #f7f8fa;
  border-left: 2px solid transparent;
}

.day-task-item:hover {
  filter: brightness(0.95);
}

.day-task-item.priority-高 {
  background: #fff1f0;
  border-left-color: #f53f3f;
}

.day-task-item.priority-中 {
  background: #fff7e6;
  border-left-color: #ff7d00;
}

.day-task-item.priority-低 {
  background: #e8fffa;
  border-left-color: #00b42a;
}

.task-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #86909c;
  flex-shrink: 0;
}

.task-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-tasks {
  font-size: 11px;
  color: #18a0fb;
  text-align: center;
  padding: 2px 0;
  cursor: pointer;
}

.more-tasks:hover {
  text-decoration: underline;
}

.day-tasks-modal {
  min-height: 350px;
}

.modal-day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e6eb;
}

.modal-day-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal-day-date {
  font-size: 16px;
  font-weight: 600;
  color: #333647;
}

.modal-day-lunar {
  font-size: 12px;
  color: #86909c;
}

.no-content-today {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #86909c;
}

.no-content-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.task-list-item {
  cursor: pointer;
  flex: 1;
}

.task-list-item:hover {
  color: #18a0fb;
}

.task-list-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.task-list-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #86909c;
}

.leave-list-item {
  flex: 1;
}

.leave-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.leave-desc {
  font-size: 12px;
  color: #86909c;
}

.custom-adjustments-list h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
}
</style>
