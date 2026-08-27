import type { Task, TaskLog, TaskLogStatus } from '../db/types'
import type { RecordService, ScheduledTask } from './contracts'
import type { LocalState } from './localState'
import { updateLocalState } from './localStore'
import { LOCAL_OWNER_ID } from './localSeed'
import {
  assertLocalDate,
  createId,
  nowIso,
  weekdayForLocalDate,
} from './utils'

function scheduledTask(state: LocalState, task: Task): ScheduledTask {
  const recurrence = state.recurrences.find((item) => item.task_id === task.id) ?? null
  const supporterCreated = task.created_by !== LOCAL_OWNER_ID
  return {
    task,
    recurrence,
    creatorRole: supporterCreated ? 'supporter' : 'owner',
    creatorLabel: supporterCreated ? '지원자가 추가' : '내가 추가',
  }
}

function isScheduled(state: LocalState, task: Task, localDate: string): boolean {
  if (task.is_hidden) return false
  const override = state.overrides.find(
    (item) => item.task_id === task.id && item.occurrence_date === localDate,
  )
  if (override?.is_cancelled) return false
  const recurrence = state.recurrences.find((item) => item.task_id === task.id)
  if (!recurrence) return true
  if (localDate < recurrence.starts_on) return false
  if (recurrence.ends_on && localDate > recurrence.ends_on) return false
  return recurrence.weekdays.includes(weekdayForLocalDate(localDate))
}

function completedAt(status: TaskLogStatus, recordedAt: string): string | null {
  return status === 'completed' ? recordedAt : null
}

export const recordService: RecordService = {
  async listToday(localDate) {
    assertLocalDate(localDate)
    return updateLocalState((state) =>
      [...state.tasks]
        .sort((left, right) => left.position - right.position)
        .map((task) => {
          const override = state.overrides.find(
            (item) =>
              item.task_id === task.id && item.occurrence_date === localDate,
          )
          const displayTask = override
            ? { ...task, scheduled_time: override.scheduled_time }
            : task
          const log =
            state.taskLogs.find(
              (item) =>
                item.task_id === task.id && item.occurrence_date === localDate,
            ) ?? null
          return {
            task: scheduledTask(state, displayTask),
            localDate,
            status: log?.status ?? (isScheduled(state, task, localDate) ? 'missing' : 'not_scheduled'),
            log,
          }
        }),
    )
  },

  async setStatus(taskId, localDate, status) {
    assertLocalDate(localDate)
    return updateLocalState((state) => {
      if (!state.tasks.some((task) => task.id === taskId)) {
        throw new Error('기록할 할 일을 찾지 못했어요.')
      }
      const recordedAt = nowIso()
      const existing = state.taskLogs.find(
        (item) => item.task_id === taskId && item.occurrence_date === localDate,
      )
      if (existing) {
        existing.status = status
        existing.recorded_at = recordedAt
        existing.completed_at = completedAt(status, recordedAt)
        return existing
      }
      const log: TaskLog = {
        id: createId(),
        owner_id: LOCAL_OWNER_ID,
        created_at: recordedAt,
        task_id: taskId,
        occurrence_date: localDate,
        status,
        recorded_at: recordedAt,
        completed_at: completedAt(status, recordedAt),
      }
      state.taskLogs.push(log)
      return log
    })
  },

  async undo(taskId, localDate) {
    assertLocalDate(localDate)
    return updateLocalState((state) => {
      const existing =
        state.taskLogs.find(
          (item) => item.task_id === taskId && item.occurrence_date === localDate,
        ) ?? null
      state.taskLogs = state.taskLogs.filter(
        (item) => !(item.task_id === taskId && item.occurrence_date === localDate),
      )
      if (existing) {
        state.medicationLogs = state.medicationLogs.filter(
          (item) => item.task_log_id !== existing.id,
        )
      }
      return existing
    })
  },

  async listRange(from, to) {
    assertLocalDate(from, '시작 날짜')
    assertLocalDate(to, '끝 날짜')
    if (from > to) throw new Error('시작 날짜는 끝 날짜보다 늦을 수 없어요.')
    return updateLocalState((state) =>
      state.taskLogs
        .filter(
          (item) => item.occurrence_date >= from && item.occurrence_date <= to,
        )
        .sort((left, right) => left.occurrence_date.localeCompare(right.occurrence_date)),
    )
  },
}
