import type {
  ChangeLog,
  ISODate,
  ISODateTime,
  MedicationDetail,
  MedicationLog,
  MedicationLogStatus,
  ProfilePreferences,
  SupportLink,
  SupportPermissions,
  Task,
  TaskColorToken,
  TaskKind,
  TaskLog,
  TaskLogStatus,
  TaskRecurrence,
  UUID,
  WeightLog,
} from '../db/types'

export type ServiceMode = 'local'
export type ChangeActorRole = 'owner' | 'supporter'

export interface LocalUser {
  id: UUID
  displayName: string
}

export interface AppSession {
  mode: ServiceMode
  user: LocalUser
  signedInAt: ISODateTime
}

export interface AuthService {
  getSession(): Promise<AppSession | null>
  signInAsLocalUser(): Promise<AppSession>
  signOut(): Promise<void>
}

export interface TaskMutationActor {
  role: ChangeActorRole
  displayName?: string
}

export interface TaskCreateInput {
  title: string
  icon: string
  colorToken: TaskColorToken
  scheduledTime: string | null
  weekdays: number[]
  reminderEnabled: boolean
  kind?: TaskKind
  startsOn?: ISODate
  actor?: TaskMutationActor
}

export interface TaskUpdatePatch {
  title?: string
  icon?: string
  colorToken?: TaskColorToken
  scheduledTime?: string | null
  weekdays?: number[]
  reminderEnabled?: boolean
  isHidden?: boolean
  actor?: TaskMutationActor
}

export type TaskUpdateScope =
  | { kind: 'today'; localDate: ISODate }
  | { kind: 'future' }

export interface ScheduledTask {
  task: Task
  recurrence: TaskRecurrence | null
  creatorRole: ChangeActorRole
  creatorLabel: string
}

export interface RemovedTask {
  task: Task
  recurrence: TaskRecurrence | null
  medicationDetail: MedicationDetail | null
}

export interface TaskService {
  list(): Promise<ScheduledTask[]>
  create(input: TaskCreateInput): Promise<ScheduledTask>
  update(
    id: UUID,
    patch: TaskUpdatePatch,
    scope: TaskUpdateScope,
  ): Promise<ScheduledTask>
  remove(id: UUID): Promise<RemovedTask>
  restore(task: RemovedTask): Promise<ScheduledTask>
  reorder(ids: UUID[]): Promise<ScheduledTask[]>
}

export interface TodayRecord {
  task: ScheduledTask
  localDate: ISODate
  status: TaskLogStatus
  log: TaskLog | null
}

export interface RecordService {
  listToday(localDate: ISODate): Promise<TodayRecord[]>
  setStatus(
    taskId: UUID,
    localDate: ISODate,
    status: TaskLogStatus,
  ): Promise<TaskLog>
  undo(taskId: UUID, localDate: ISODate): Promise<TaskLog | null>
  listRange(from: ISODate, to: ISODate): Promise<TaskLog[]>
}

export interface WeightService {
  latest(): Promise<WeightLog | null>
  list(): Promise<WeightLog[]>
  save(valueKg: number): Promise<WeightLog>
}

export interface MedicationDetailInput {
  displayName: string
  photoFileName?: string | null
}

export interface MedicationService {
  get(taskId: UUID): Promise<MedicationDetail | null>
  save(
    taskId: UUID,
    detail: MedicationDetailInput,
    safetyConfirmed: boolean,
  ): Promise<MedicationDetail>
  record(taskId: UUID, status: MedicationLogStatus): Promise<MedicationLog>
  getPhotoAccessPath(taskId: UUID, fileName: string): Promise<string>
}

export interface CompletionPermissionPolicy {
  ownerCanRecord: true
  supporterCanRecord: false
}

export interface SharingLink {
  link: SupportLink
  supporterDisplayName: string
  completionPermission: CompletionPermissionPolicy
}

export interface ChangeHistoryEntry extends ChangeLog {
  actorRole: ChangeActorRole
  actorDisplayName: string
  summary: string
}

export interface SharingService {
  getLink(): Promise<SharingLink | null>
  invite(displayName: string): Promise<SharingLink>
  updatePermissions(patch: Partial<SupportPermissions>): Promise<SharingLink>
  disconnect(): Promise<SharingLink>
  history(): Promise<ChangeHistoryEntry[]>
}

export interface NotificationSchedule {
  taskId: UUID
  notificationId: string
  scheduledTime: string | null
  body: '확인할 일정이 있어요'
  snoozedUntil: ISODateTime | null
}

export interface NotificationService {
  schedule(task: Task): Promise<NotificationSchedule>
  cancel(taskId: UUID): Promise<void>
  snooze(taskId: UUID, minutes: number): Promise<NotificationSchedule>
}

export interface SpeechService {
  speak(text: string): Promise<void>
  stop(): Promise<void>
}

export interface PreferenceService {
  get(): Promise<ProfilePreferences>
  update(patch: Partial<ProfilePreferences>): Promise<ProfilePreferences>
}

export interface AppServices {
  auth: AuthService
  tasks: TaskService
  records: RecordService
  weights: WeightService
  medications: MedicationService
  sharing: SharingService
  notifications: NotificationService
  speech: SpeechService
  preferences: PreferenceService
}
