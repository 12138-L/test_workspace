export type TagType = 'default' | 'info' | 'success' | 'warning' | 'error'

export interface Activity {
  id: number
  time: string
  content: string
}

export interface CalendarEvent {
  id: number
  title: string
  time: string
  type: TagType
}

export interface UpcomingEvent {
  id: number
  date: string
  title: string
  type: string
}
