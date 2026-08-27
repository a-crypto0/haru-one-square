import type {
  ChangeHistoryEntry,
  MedicationService,
  PreferenceService,
  RecordService,
  ScheduledTask,
  SharingLink,
  WeightService,
} from '../service/contracts'

export type Task = ScheduledTask['task']
export type TaskKind = Task['kind']
export type TaskColorToken = Task['color_token']
export type TaskLog = Awaited<ReturnType<RecordService['setStatus']>>
export type TaskLogStatus = Parameters<RecordService['setStatus']>[2]
export type WeightLog = Awaited<ReturnType<WeightService['save']>>
export type MedicationDetail = NonNullable<Awaited<ReturnType<MedicationService['get']>>>
export type MedicationLogStatus = Parameters<MedicationService['record']>[1]
export type ProfilePreferences = Awaited<ReturnType<PreferenceService['get']>>
export type DisplayMode = ProfilePreferences['display_mode']
export type ThemePreference = ProfilePreferences['theme']
export type SupportLink = SharingLink['link']
export type SupportPermissions = SupportLink['permissions']
export type ChangeLog = Omit<ChangeHistoryEntry, 'actorRole' | 'actorDisplayName' | 'summary'>

export type UiState = 'loading' | 'error' | 'empty' | 'success'
export type AppRoute =
  | 'setup'
  | 'today'
  | 'tasks'
  | 'task-editor'
  | 'weight'
  | 'records'
  | 'together'
  | 'history'
  | 'settings'

export interface TodayItem {
  task: Task
  status: TaskLogStatus
  creatorLabel?: string
  medication?: MedicationDetail | null
}

export interface TaskDraft {
  id?: string
  kind: TaskKind
  title: string
  icon: string
  colorToken: TaskColorToken
  scheduledTime: string | null
  repeatDays: number[]
  reminderEnabled: boolean
  medicationName: string
  medicationPhotoUri?: string
  safetyConfirmed: boolean
  saveScope: 'today' | 'future'
}

export interface MedicationDraft {
  taskId: string
  displayName: string
  photoUri?: string
  scheduledTime: string | null
  repeatDays: number[]
  safetyConfirmed: boolean
  saveScope: 'today' | 'future'
}

export interface RecordRange {
  start: string
  end: string
}

export interface HabitRecordCell {
  taskId: string
  date: string
  status: TaskLogStatus
}

export interface SupporterView {
  id: string
  displayName: string
  connected: boolean
}

export interface HistoryEntryView {
  id: string
  actorLabel: string
  targetLabel: string
  sentence: string
  occurredAt: string
  targetId?: string
}

export interface NavItem {
  route: AppRoute
  icon: string
  label: string
}
