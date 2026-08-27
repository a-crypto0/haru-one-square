import type {
  MedicationDetail,
  MedicationLog,
  Profile,
  SupportLink,
  Task,
  TaskLog,
  TaskOverride,
  TaskRecurrence,
  WeightLog,
} from '../db/types'
import type {
  AppSession,
  ChangeHistoryEntry,
  NotificationSchedule,
} from './contracts'

export interface StoredSupportLink {
  link: SupportLink
  supporterDisplayName: string
}

export interface LocalState {
  schemaVersion: 1
  storageMode: 'local'
  session: AppSession | null
  profile: Profile
  tasks: Task[]
  recurrences: TaskRecurrence[]
  overrides: TaskOverride[]
  taskLogs: TaskLog[]
  weights: WeightLog[]
  medicationDetails: MedicationDetail[]
  medicationLogs: MedicationLog[]
  support: StoredSupportLink | null
  changeLogs: ChangeHistoryEntry[]
  notifications: NotificationSchedule[]
}
