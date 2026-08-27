export type UUID = string
export type ISODate = string
export type ISODateTime = string
export type LocalTime = string

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface OwnedEntity {
  id: UUID
  owner_id: UUID
  created_at: ISODateTime
}

export type DisplayMode = 'easy' | 'standard'
export type ThemePreference = 'system' | 'light' | 'dark'

export interface ProfilePreferences {
  display_mode: DisplayMode
  theme: ThemePreference
  read_aloud_enabled: boolean
}

export interface Profile extends OwnedEntity {
  display_name: string
  preferences: ProfilePreferences
}

export type TaskKind = 'standard' | 'medication'
export type TaskColorToken = 'sage' | 'lavender' | 'sky' | 'butter'

export interface Task extends OwnedEntity {
  created_by: UUID
  updated_at: ISODateTime
  kind: TaskKind
  title: string
  icon: string
  color_token: TaskColorToken
  scheduled_time: LocalTime | null
  reminder_enabled: boolean
  position: number
  is_hidden: boolean
}

export interface TaskRecurrence extends OwnedEntity {
  task_id: UUID
  weekdays: number[]
  starts_on: ISODate
  ends_on: ISODate | null
}

export interface TaskOverride extends OwnedEntity {
  task_id: UUID
  occurrence_date: ISODate
  scheduled_time: LocalTime | null
  is_cancelled: boolean
}

export type TaskLogStatus =
  | 'completed'
  | 'missing'
  | 'not_scheduled'
  | 'delayed'
  | 'help_requested'

export interface TaskLog extends OwnedEntity {
  task_id: UUID
  occurrence_date: ISODate
  status: TaskLogStatus
  recorded_at: ISODateTime
  completed_at: ISODateTime | null
}

export interface WeightLog extends OwnedEntity {
  weight_kg: number
  recorded_at: ISODateTime
}

export interface MedicationDetail extends OwnedEntity {
  task_id: UUID
  display_name: string
  photo_path: string | null
}

export type MedicationLogStatus = 'completed' | 'delayed' | 'help_requested'

export interface MedicationLog extends OwnedEntity {
  task_id: UUID
  task_log_id: UUID
  status: MedicationLogStatus
  recorded_at: ISODateTime
}

export interface SupportPermissions {
  can_view_schedule: boolean
  can_add_schedule: boolean
  can_update_schedule: boolean
}

export interface SupportLink extends OwnedEntity {
  supporter_id: UUID
  permissions: SupportPermissions
  accepted_at: ISODateTime | null
  revoked_at: ISODateTime | null
}

export type ChangeTargetType =
  | 'task'
  | 'task_recurrence'
  | 'task_override'
  | 'medication_detail'
  | 'support_link'

export interface ChangeLog extends OwnedEntity {
  actor_id: UUID
  target_type: ChangeTargetType
  target_id: UUID
  action: 'created' | 'updated' | 'deleted'
  before_value: Json | null
  after_value: Json | null
}
