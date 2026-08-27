import type {
  MedicationDetail,
  Profile,
  Task,
  TaskRecurrence,
  UUID,
} from '../db/types'
import type { LocalState } from './localState'
import { createId, nowIso, todayLocal } from './utils'

export const LOCAL_OWNER_ID: UUID = '10000000-0000-4000-8000-000000000001'
export const LOCAL_SUPPORTER_ID: UUID = '20000000-0000-4000-8000-000000000002'
export const LOCAL_OWNER_NAME = '나'
export const LOCAL_SUPPORTER_NAME = '지원자'

interface SeedTaskInput {
  title: string
  icon: string
  scheduledTime: string
  weekdays: number[]
  creatorId?: UUID
  medication?: boolean
}

function seedTask(
  input: SeedTaskInput,
  position: number,
  createdAt: string,
): { task: Task; recurrence: TaskRecurrence } {
  const taskId = createId()
  return {
    task: {
      id: taskId,
      owner_id: LOCAL_OWNER_ID,
      created_at: createdAt,
      created_by: input.creatorId ?? LOCAL_OWNER_ID,
      updated_at: createdAt,
      kind: input.medication ? 'medication' : 'standard',
      title: input.title,
      icon: input.icon,
      color_token: input.medication ? 'butter' : 'sage',
      scheduled_time: input.scheduledTime,
      reminder_enabled: true,
      position,
      is_hidden: false,
    },
    recurrence: {
      id: createId(),
      owner_id: LOCAL_OWNER_ID,
      created_at: createdAt,
      task_id: taskId,
      weekdays: input.weekdays,
      starts_on: todayLocal(),
      ends_on: null,
    },
  }
}

export function createInitialState(): LocalState {
  const createdAt = nowIso()
  const seeds = [
    seedTask(
      {
        title: '아침 약',
        icon: '약',
        scheduledTime: '08:00',
        weekdays: [0, 1, 2, 3, 4, 5, 6],
        creatorId: LOCAL_SUPPORTER_ID,
        medication: true,
      },
      0,
      createdAt,
    ),
    seedTask(
      {
        title: '산책하기',
        icon: '산책',
        scheduledTime: '09:30',
        weekdays: [2, 4, 6],
      },
      1,
      createdAt,
    ),
    seedTask(
      {
        title: '양치하기',
        icon: '양치',
        scheduledTime: '20:00',
        weekdays: [0, 1, 2, 3, 4, 5, 6],
      },
      2,
      createdAt,
    ),
    seedTask(
      {
        title: '머리 감기',
        icon: '씻기',
        scheduledTime: '21:00',
        weekdays: [1, 4],
      },
      3,
      createdAt,
    ),
  ]
  const medicationTask = seeds[0]?.task
  const profile: Profile = {
    id: createId(),
    owner_id: LOCAL_OWNER_ID,
    created_at: createdAt,
    display_name: LOCAL_OWNER_NAME,
    preferences: {
      display_mode: 'easy',
      theme: 'system',
      read_aloud_enabled: false,
    },
  }
  const medicationDetails: MedicationDetail[] = medicationTask
    ? [
        {
          id: createId(),
          owner_id: LOCAL_OWNER_ID,
          created_at: createdAt,
          task_id: medicationTask.id,
          display_name: medicationTask.title,
          photo_path: null,
        },
      ]
    : []

  return {
    schemaVersion: 1,
    storageMode: 'local',
    session: null,
    profile,
    tasks: seeds.map(({ task }) => task),
    recurrences: seeds.map(({ recurrence }) => recurrence),
    overrides: [],
    taskLogs: [],
    weights: [],
    medicationDetails,
    medicationLogs: [],
    support: null,
    changeLogs: [],
    notifications: [],
  }
}
