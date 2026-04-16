export type SettingsType = 'basic' | 'notification' | 'security'

export interface BasicSettings {
  systemName: string
  language: string
  timezone: string
}

export interface NotificationSettings {
  email: boolean
  inApp: boolean
  taskReminder: boolean
  projectUpdate: boolean
}

export interface SecuritySettings {
  twoFactorAuth: boolean
  sessionTimeout: string
  passwordStrength: string
}

export interface Settings {
  id?: number
  type: SettingsType
  value: BasicSettings | NotificationSettings | SecuritySettings
}

export interface AppConfig {
  sidebarCollapsed: boolean
}
