import type { Task, TaskRecurrence } from '../db/types'
import type { TaskService } from './contracts'
import { actorId, addChange } from './changeHistory'
import { updateLocalState } from './localStore'
import { LOCAL_OWNER_ID } from './localSeed'
import { removeTask, reorderTasks, restoreTask } from './taskLifecycle'
import {
  applyTaskPatch,
  asScheduled,
  assertActorPermission,
  getTask,
  validateTaskInput,
} from './taskHelpers'
import {
  assertLocalDate,
  assertLocalTime,
  assertWeekdays,
  createId,
  nowIso,
  todayLocal,
} from './utils'

export const taskService: TaskService = {
  async list() {
    return updateLocalState((state) =>
      [...state.tasks]
        .sort((left, right) => left.position - right.position)
        .map((task) => asScheduled(state, task)),
    )
  },

  async create(input) {
    validateTaskInput(input)
    return updateLocalState((state) => {
      assertActorPermission(state, input.actor, 'create')
      const createdAt = nowIso()
      const task: Task = {
        id: createId(),
        owner_id: LOCAL_OWNER_ID,
        created_at: createdAt,
        created_by: actorId(state, input.actor?.role ?? 'owner'),
        updated_at: createdAt,
        kind: input.kind ?? 'standard',
        title: input.title.trim(),
        icon: input.icon,
        color_token: input.colorToken,
        scheduled_time: input.scheduledTime,
        reminder_enabled: input.reminderEnabled,
        position: state.tasks.length,
        is_hidden: false,
      }
      const recurrence: TaskRecurrence = {
        id: createId(),
        owner_id: LOCAL_OWNER_ID,
        created_at: createdAt,
        task_id: task.id,
        weekdays: [...new Set(input.weekdays)].sort(),
        starts_on: input.startsOn ?? todayLocal(),
        ends_on: null,
      }
      state.tasks.push(task)
      state.recurrences.push(recurrence)
      addChange(state, {
        actorRole: input.actor?.role ?? 'owner',
        actorDisplayName: input.actor?.displayName,
        targetType: 'task',
        targetId: task.id,
        action: 'created',
        beforeValue: null,
        afterValue: task,
        summary: `${task.title} 일정을 추가했어요.`,
      })
      return asScheduled(state, task)
    })
  },

  async update(id, patch, scope) {
    return updateLocalState((state) => {
      const task = getTask(state, id)
      assertActorPermission(state, patch.actor, 'update')
      const before = { ...task }
      if (scope.kind === 'today') {
        assertLocalDate(scope.localDate)
        if (
          patch.title !== undefined ||
          patch.icon !== undefined ||
          patch.colorToken !== undefined ||
          patch.weekdays !== undefined ||
          patch.reminderEnabled !== undefined
        ) {
          throw new Error('오늘만 바꾸기에서는 시간이나 표시 여부만 바꿀 수 있어요.')
        }
        if (patch.scheduledTime !== undefined) assertLocalTime(patch.scheduledTime)
        const existing = state.overrides.find(
          (item) => item.task_id === id && item.occurrence_date === scope.localDate,
        )
        const beforeOverride = existing ? { ...existing } : null
        const override = existing ?? {
          id: createId(),
          owner_id: LOCAL_OWNER_ID,
          created_at: nowIso(),
          task_id: id,
          occurrence_date: scope.localDate,
          scheduled_time: task.scheduled_time,
          is_cancelled: false,
        }
        if (patch.scheduledTime !== undefined) override.scheduled_time = patch.scheduledTime
        if (patch.isHidden !== undefined) override.is_cancelled = patch.isHidden
        if (!existing) state.overrides.push(override)
        addChange(state, {
          actorRole: patch.actor?.role ?? 'owner',
          actorDisplayName: patch.actor?.displayName,
          targetType: 'task_override',
          targetId: override.id,
          action: existing ? 'updated' : 'created',
          beforeValue: beforeOverride,
          afterValue: override,
          summary: `${task.title} 일정을 ${scope.localDate} 하루만 바꿨어요.`,
        })
        return asScheduled(state, task)
      }

      applyTaskPatch(task, patch)
      if (patch.weekdays !== undefined) {
        assertWeekdays(patch.weekdays)
        const recurrence = state.recurrences.find((item) => item.task_id === id)
        if (recurrence) recurrence.weekdays = [...new Set(patch.weekdays)].sort()
      }
      addChange(state, {
        actorRole: patch.actor?.role ?? 'owner',
        actorDisplayName: patch.actor?.displayName,
        targetType: 'task',
        targetId: task.id,
        action: 'updated',
        beforeValue: before,
        afterValue: task,
        summary: `${task.title} 일정을 앞으로도 바꿨어요.`,
      })
      return asScheduled(state, task)
    })
  },

  remove: removeTask,
  restore: restoreTask,
  reorder: reorderTasks,
}
