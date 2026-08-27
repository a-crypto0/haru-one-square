import type { Task } from '../db/types'
import type {
  ScheduledTask,
  TaskCreateInput,
  TaskMutationActor,
  TaskUpdatePatch,
} from './contracts'
import type { LocalState } from './localState'
import { LOCAL_OWNER_ID } from './localSeed'
import {
  assertLocalDate,
  assertLocalTime,
  assertWeekdays,
  nowIso,
} from './utils'

export function asScheduled(state: LocalState, task: Task): ScheduledTask {
  const recurrence = state.recurrences.find((item) => item.task_id === task.id) ?? null
  const supporterCreated = task.created_by !== LOCAL_OWNER_ID
  return {
    task,
    recurrence,
    creatorRole: supporterCreated ? 'supporter' : 'owner',
    creatorLabel: supporterCreated ? '지원자가 추가' : '내가 추가',
  }
}

export function getTask(state: LocalState, id: string): Task {
  const task = state.tasks.find((item) => item.id === id)
  if (!task) throw new Error('할 일을 찾지 못했어요.')
  return task
}

export function assertActorPermission(
  state: LocalState,
  actor: TaskMutationActor | undefined,
  action: 'create' | 'update',
): void {
  if (actor?.role !== 'supporter') return
  const support = state.support
  if (!support || support.link.revoked_at || !support.link.accepted_at) {
    throw new Error('연결된 지원자만 일정을 바꿀 수 있어요.')
  }
  const allowed =
    action === 'create'
      ? support.link.permissions.can_add_schedule
      : support.link.permissions.can_update_schedule
  if (!allowed) throw new Error('이 일정을 바꿀 권한이 없어요.')
}

export function validateTaskInput(input: TaskCreateInput): void {
  if (!input.title.trim()) throw new Error('할 일 이름을 적어 주세요.')
  assertLocalTime(input.scheduledTime)
  assertWeekdays(input.weekdays)
  if (input.startsOn) assertLocalDate(input.startsOn, '시작 날짜')
}

export function applyTaskPatch(task: Task, patch: TaskUpdatePatch): void {
  if (patch.title !== undefined) {
    if (!patch.title.trim()) throw new Error('할 일 이름을 적어 주세요.')
    task.title = patch.title.trim()
  }
  if (patch.icon !== undefined) task.icon = patch.icon
  if (patch.colorToken !== undefined) task.color_token = patch.colorToken
  if (patch.scheduledTime !== undefined) {
    assertLocalTime(patch.scheduledTime)
    task.scheduled_time = patch.scheduledTime
  }
  if (patch.reminderEnabled !== undefined) task.reminder_enabled = patch.reminderEnabled
  if (patch.isHidden !== undefined) task.is_hidden = patch.isHidden
  task.updated_at = nowIso()
}
