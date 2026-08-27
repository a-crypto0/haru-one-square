import type { MedicationDetail } from '../db/types'
import type { TaskService } from './contracts'
import { addChange } from './changeHistory'
import { updateLocalState } from './localStore'
import { nowIso } from './utils'
import { asScheduled, getTask } from './taskHelpers'

export const removeTask: TaskService['remove'] = async (id) =>
  updateLocalState((state) => {
    const task = getTask(state, id)
    const recurrence = state.recurrences.find((item) => item.task_id === id) ?? null
    const medicationDetail: MedicationDetail | null =
      state.medicationDetails.find((item) => item.task_id === id) ?? null
    state.tasks = state.tasks.filter((item) => item.id !== id)
    state.recurrences = state.recurrences.filter((item) => item.task_id !== id)
    state.overrides = state.overrides.filter((item) => item.task_id !== id)
    state.medicationDetails = state.medicationDetails.filter(
      (item) => item.task_id !== id,
    )
    state.notifications = state.notifications.filter((item) => item.taskId !== id)
    addChange(state, {
      actorRole: 'owner',
      targetType: 'task',
      targetId: task.id,
      action: 'deleted',
      beforeValue: task,
      afterValue: null,
      summary: `${task.title} 일정을 지웠어요. 되돌릴 수 있어요.`,
    })
    return { task, recurrence, medicationDetail }
  })

export const restoreTask: TaskService['restore'] = async (removed) =>
  updateLocalState((state) => {
    if (state.tasks.some((item) => item.id === removed.task.id)) {
      throw new Error('이미 되돌린 할 일이에요.')
    }
    state.tasks.push(removed.task)
    if (removed.recurrence) state.recurrences.push(removed.recurrence)
    if (removed.medicationDetail) {
      state.medicationDetails.push(removed.medicationDetail)
    }
    addChange(state, {
      actorRole: 'owner',
      targetType: 'task',
      targetId: removed.task.id,
      action: 'created',
      beforeValue: null,
      afterValue: removed.task,
      summary: `${removed.task.title} 일정을 되돌렸어요.`,
    })
    return asScheduled(state, removed.task)
  })

export const reorderTasks: TaskService['reorder'] = async (ids) =>
  updateLocalState((state) => {
    if (new Set(ids).size !== ids.length) {
      throw new Error('할 일 순서를 다시 확인해 주세요.')
    }
    const knownIds = new Set(state.tasks.map((task) => task.id))
    if (ids.some((id) => !knownIds.has(id))) {
      throw new Error('순서를 바꿀 할 일을 찾지 못했어요.')
    }
    const orderedIds = [
      ...ids,
      ...state.tasks.map((task) => task.id).filter((id) => !ids.includes(id)),
    ]
    orderedIds.forEach((id, position) => {
      const task = getTask(state, id)
      task.position = position
      task.updated_at = nowIso()
    })
    const firstTask = orderedIds[0] ? getTask(state, orderedIds[0]) : null
    if (firstTask) {
      addChange(state, {
        actorRole: 'owner',
        targetType: 'task',
        targetId: firstTask.id,
        action: 'updated',
        beforeValue: null,
        afterValue: orderedIds,
        summary: '할 일 순서를 바꿨어요.',
      })
    }
    return state.tasks
      .slice()
      .sort((left, right) => left.position - right.position)
      .map((task) => asScheduled(state, task))
  })
