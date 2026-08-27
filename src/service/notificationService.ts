import type { NotificationSchedule, NotificationService } from './contracts'
import {
  cancelOnDevice,
  scheduleOnDevice,
  snoozeOnDevice,
} from './deviceAdapters'
import { updateLocalState } from './localStore'
import { assertLocalTime } from './utils'

const BODY = '확인할 일정이 있어요' as const

export const notificationService: NotificationService = {
  async schedule(task) {
    if (!task.scheduled_time) throw new Error('알림 시간을 먼저 정해 주세요.')
    assertLocalTime(task.scheduled_time)
    const existing = await updateLocalState(
      (state) =>
        state.notifications.find((item) => item.taskId === task.id) ?? null,
    )
    if (existing) await cancelOnDevice(existing.notificationId)
    const notificationId = await scheduleOnDevice(task)
    return updateLocalState((state) => {
      const scheduled: NotificationSchedule = {
        taskId: task.id,
        notificationId,
        scheduledTime: task.scheduled_time,
        body: BODY,
        snoozedUntil: null,
      }
      state.notifications = state.notifications.filter(
        (item) => item.taskId !== task.id,
      )
      state.notifications.push(scheduled)
      return scheduled
    })
  },

  async cancel(taskId) {
    const existing = await updateLocalState(
      (state) =>
        state.notifications.find((item) => item.taskId === taskId) ?? null,
    )
    if (existing) await cancelOnDevice(existing.notificationId)
    return updateLocalState((state) => {
      state.notifications = state.notifications.filter(
        (item) => item.taskId !== taskId,
      )
    })
  },

  async snooze(taskId, minutes) {
    if (!Number.isInteger(minutes) || minutes <= 0) {
      throw new Error('미룰 시간을 다시 확인해 주세요.')
    }
    const existing = await updateLocalState(
      (state) =>
        state.notifications.find((item) => item.taskId === taskId) ?? null,
    )
    if (!existing) throw new Error('미룰 알림을 찾지 못했어요.')
    await cancelOnDevice(existing.notificationId)
    const notificationId = await snoozeOnDevice(minutes)
    return updateLocalState((state) => {
      const scheduled: NotificationSchedule = {
        ...existing,
        notificationId,
        snoozedUntil: new Date(Date.now() + minutes * 60_000).toISOString(),
      }
      state.notifications = state.notifications.filter(
        (item) => item.taskId !== taskId,
      )
      state.notifications.push(scheduled)
      return scheduled
    })
  },
}
