const lunarInfo = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, 0x04ae0,
  0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, 0x04970, 0x0a4b0,
  0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, 0x06566, 0x0d4a0, 0x0ea50,
  0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, 0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0,
  0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, 0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0,
  0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0, 0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260,
  0x0f263, 0x0d950, 0x05b57, 0x056a0, 0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558,
  0x0b540, 0x0b5a0, 0x195a6, 0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46,
  0x0ab60, 0x09570, 0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5,
  0x092e0, 0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, 0x07954,
  0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, 0x05aa0, 0x076a3,
  0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, 0x0b5a0, 0x056d0, 0x055b2,
  0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0
]

const Gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const Zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const Animals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
const lunarMonth = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']
const lunarDay = [
  '初一',
  '初二',
  '初三',
  '初四',
  '初五',
  '初六',
  '初七',
  '初八',
  '初九',
  '初十',
  '十一',
  '十二',
  '十三',
  '十四',
  '十五',
  '十六',
  '十七',
  '十八',
  '十九',
  '二十',
  '廿一',
  '廿二',
  '廿三',
  '廿四',
  '廿五',
  '廿六',
  '廿七',
  '廿八',
  '廿九',
  '三十'
]

const solarHoliday: Record<string, string> = {
  '1-1': '元旦',
  '2-14': '情人节',
  '3-8': '妇女节',
  '3-12': '植树节',
  '4-1': '愚人节',
  '5-1': '劳动节',
  '5-4': '青年节',
  '6-1': '儿童节',
  '7-1': '建党节',
  '8-1': '建军节',
  '9-10': '教师节',
  '10-1': '国庆节',
  '12-25': '圣诞节'
}

const lunarHoliday: Record<string, string> = {
  '1-1': '春节',
  '1-15': '元宵节',
  '2-2': '龙抬头',
  '5-5': '端午节',
  '7-7': '七夕节',
  '7-15': '中元节',
  '8-15': '中秋节',
  '9-9': '重阳节',
  '12-8': '腊八节',
  '12-23': '小年',
  '12-30': '除夕'
}

const legalHolidays2025: Record<string, { type: 'holiday' | 'workday'; name: string }> = {
  '2025-01-01': { type: 'holiday', name: '元旦' },
  '2025-01-26': { type: 'workday', name: '春节调休' },
  '2025-01-28': { type: 'holiday', name: '春节' },
  '2025-01-29': { type: 'holiday', name: '春节' },
  '2025-01-30': { type: 'holiday', name: '春节' },
  '2025-01-31': { type: 'holiday', name: '春节' },
  '2025-02-01': { type: 'holiday', name: '春节' },
  '2025-02-02': { type: 'holiday', name: '春节' },
  '2025-02-03': { type: 'holiday', name: '春节' },
  '2025-02-04': { type: 'holiday', name: '春节' },
  '2025-02-08': { type: 'workday', name: '春节调休' },
  '2025-04-04': { type: 'holiday', name: '清明节' },
  '2025-04-05': { type: 'holiday', name: '清明节' },
  '2025-04-06': { type: 'holiday', name: '清明节' },
  '2025-04-27': { type: 'workday', name: '劳动节调休' },
  '2025-05-01': { type: 'holiday', name: '劳动节' },
  '2025-05-02': { type: 'holiday', name: '劳动节' },
  '2025-05-03': { type: 'holiday', name: '劳动节' },
  '2025-05-04': { type: 'holiday', name: '劳动节' },
  '2025-05-05': { type: 'holiday', name: '劳动节' },
  '2025-05-31': { type: 'holiday', name: '端午节' },
  '2025-06-01': { type: 'holiday', name: '端午节' },
  '2025-06-02': { type: 'holiday', name: '端午节' },
  '2025-09-28': { type: 'workday', name: '国庆调休' },
  '2025-10-01': { type: 'holiday', name: '国庆节/中秋节' },
  '2025-10-02': { type: 'holiday', name: '国庆节/中秋节' },
  '2025-10-03': { type: 'holiday', name: '国庆节/中秋节' },
  '2025-10-04': { type: 'holiday', name: '国庆节/中秋节' },
  '2025-10-05': { type: 'holiday', name: '国庆节/中秋节' },
  '2025-10-06': { type: 'holiday', name: '国庆节/中秋节' },
  '2025-10-07': { type: 'holiday', name: '国庆节/中秋节' },
  '2025-10-08': { type: 'holiday', name: '国庆节/中秋节' },
  '2025-10-11': { type: 'workday', name: '国庆调休' }
}

const legalHolidays2026: Record<string, { type: 'holiday' | 'workday'; name: string }> = {
  '2026-01-01': { type: 'holiday', name: '元旦' },
  '2026-01-02': { type: 'holiday', name: '元旦' },
  '2026-01-03': { type: 'holiday', name: '元旦' },
  '2026-01-04': { type: 'workday', name: '元旦调休' },
  '2026-02-14': { type: 'workday', name: '春节调休' },
  '2026-02-15': { type: 'holiday', name: '春节' },
  '2026-02-16': { type: 'holiday', name: '春节' },
  '2026-02-17': { type: 'holiday', name: '春节' },
  '2026-02-18': { type: 'holiday', name: '春节' },
  '2026-02-19': { type: 'holiday', name: '春节' },
  '2026-02-20': { type: 'holiday', name: '春节' },
  '2026-02-21': { type: 'holiday', name: '春节' },
  '2026-02-22': { type: 'holiday', name: '春节' },
  '2026-02-23': { type: 'holiday', name: '春节' },
  '2026-02-28': { type: 'workday', name: '春节调休' },
  '2026-04-04': { type: 'holiday', name: '清明节' },
  '2026-04-05': { type: 'holiday', name: '清明节' },
  '2026-04-06': { type: 'holiday', name: '清明节' },
  '2026-05-01': { type: 'holiday', name: '劳动节' },
  '2026-05-02': { type: 'holiday', name: '劳动节' },
  '2026-05-03': { type: 'holiday', name: '劳动节' },
  '2026-05-04': { type: 'holiday', name: '劳动节' },
  '2026-05-05': { type: 'holiday', name: '劳动节' },
  '2026-05-09': { type: 'workday', name: '劳动节调休' },
  '2026-06-19': { type: 'holiday', name: '端午节' },
  '2026-06-20': { type: 'holiday', name: '端午节' },
  '2026-06-21': { type: 'holiday', name: '端午节' },
  '2026-09-20': { type: 'workday', name: '国庆调休' },
  '2026-09-25': { type: 'holiday', name: '中秋节' },
  '2026-09-26': { type: 'holiday', name: '中秋节' },
  '2026-09-27': { type: 'holiday', name: '中秋节' },
  '2026-10-01': { type: 'holiday', name: '国庆节' },
  '2026-10-02': { type: 'holiday', name: '国庆节' },
  '2026-10-03': { type: 'holiday', name: '国庆节' },
  '2026-10-04': { type: 'holiday', name: '国庆节' },
  '2026-10-05': { type: 'holiday', name: '国庆节' },
  '2026-10-06': { type: 'holiday', name: '国庆节' },
  '2026-10-07': { type: 'holiday', name: '国庆节' },
  '2026-10-10': { type: 'workday', name: '国庆调休' }
}

export const legalHolidays: Record<string, { type: 'holiday' | 'workday'; name: string }> = {
  ...legalHolidays2025,
  ...legalHolidays2026
}

function lYearDays(y: number): number {
  let i,
    sum = 348
  for (i = 0x8000; i > 0x8; i >>= 1) {
    sum += lunarInfo[y - 1900] & i ? 1 : 0
  }
  return sum + leapDays(y)
}

function leapMonth(y: number): number {
  return lunarInfo[y - 1900] & 0xf
}

function leapDays(y: number): number {
  if (leapMonth(y)) {
    return lunarInfo[y - 1900] & 0x10000 ? 30 : 29
  }
  return 0
}

function monthDays(y: number, m: number): number {
  return lunarInfo[y - 1900] & (0x10000 >> m) ? 30 : 29
}

export function solar2lunar(date: Date) {
  let i,
    leap = 0,
    temp = 0
  const baseDate = new Date(1900, 0, 31)
  let offset = Math.floor((date.getTime() - baseDate.getTime()) / 86400000)

  let year = 1900,
    month = 0,
    day = 0
  for (i = 1900; i < 2101 && offset > 0; i++) {
    temp = lYearDays(i)
    offset -= temp
    year = i
  }

  if (offset < 0) {
    offset += temp
    year--
  }

  leap = leapMonth(year)
  let isLeap = false

  for (i = 1; i < 13 && offset > 0; i++) {
    if (leap > 0 && i === leap + 1 && !isLeap) {
      --i
      isLeap = true
      temp = leapDays(year)
    } else {
      temp = monthDays(year, i)
    }

    if (isLeap && i === leap + 1) isLeap = false
    offset -= temp
    month = i
  }

  if (offset === 0 && leap > 0 && i === leap + 1) {
    if (isLeap) {
      isLeap = false
    } else {
      isLeap = true
      --month
    }
  }

  if (offset < 0) {
    offset += temp
    month--
  }
  day = offset + 1

  const year2 = year
  const yearCyl = year2 - 1864
  const monthCyl = (year2 - 1900) * 12 + month + 12
  const dayCyl = offset + 11

  return {
    year,
    month,
    day,
    isLeap,
    yearCyl,
    monthCyl,
    dayCyl,
    ganZhiYear: Gan[yearCyl % 10] + Zhi[yearCyl % 12],
    ganZhiMonth: Gan[monthCyl % 10] + Zhi[monthCyl % 12],
    ganZhiDay: Gan[dayCyl % 10] + Zhi[dayCyl % 12],
    animal: Animals[(year - 4) % 12],
    monthName: (isLeap ? '闰' : '') + lunarMonth[month - 1] + '月',
    dayName: lunarDay[day - 1],
    term: ''
  }
}

export function getHoliday(date: Date): {
  solar?: string
  lunar?: string
  legal?: { type: 'holiday' | 'workday'; name: string }
} {
  const result: ReturnType<typeof getHoliday> = {}

  const m = date.getMonth() + 1
  const d = date.getDate()
  const solarKey = `${m}-${d}`
  if (solarHoliday[solarKey]) {
    result.solar = solarHoliday[solarKey]
  }

  const lunar = solar2lunar(date)
  const lunarKey = `${lunar.month}-${lunar.day}`
  if (lunarHoliday[lunarKey]) {
    result.lunar = lunarHoliday[lunarKey]
  }

  const legalKey = `${String(date.getFullYear())}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  if (legalHolidays[legalKey]) {
    result.legal = legalHolidays[legalKey]
  }

  return result
}
