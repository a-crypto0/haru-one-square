import type { Task } from '../db/types'
import { createId } from './utils'

interface NotificationModule {
  SchedulableTriggerInputTypes: {
    DAILY: string
    TIME_INTERVAL: string
  }
  setNotificationHandler(handler: unknown): void
  scheduleNotificationAsync(request: unknown): Promise<string>
  cancelScheduledNotificationAsync(identifier: string): Promise<void>
}

interface SpeechModule {
  speak(text: string, options?: unknown): void
  stop(): Promise<void>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNotificationModule(value: unknown): value is NotificationModule {
  if (!isRecord(value)) return false
  const triggerTypes = value.SchedulableTriggerInputTypes
  return (
    isRecord(triggerTypes) &&
    typeof triggerTypes.DAILY === 'string' &&
    typeof triggerTypes.TIME_INTERVAL === 'string' &&
    typeof value.setNotificationHandler === 'function' &&
    typeof value.scheduleNotificationAsync === 'function' &&
    typeof value.cancelScheduledNotificationAsync === 'function'
  )
}

function isSpeechModule(value: unknown): value is SpeechModule {
  return (
    isRecord(value) &&
    typeof value.speak === 'function' &&
    typeof value.stop === 'function'
  )
}

async function notificationsModule(): Promise<NotificationModule | null> {
  try {
    const loaded: unknown = await import('expo-notifications')
    return isNotificationModule(loaded) ? loaded : null
  } catch {
    return null
  }
}

async function speechModule(): Promise<SpeechModule | null> {
  try {
    const loaded: unknown = await import('expo-speech')
    return isSpeechModule(loaded) ? loaded : null
  } catch {
    return null
  }
}

export async function scheduleOnDevice(task: Task): Promise<string> {
  const module = await notificationsModule()
  if (!module || !task.scheduled_time) return createId()
  const [hour, minute] = task.scheduled_time.split(':').map(Number)
  try {
    module.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    })
    return await module.scheduleNotificationAsync({
      content: { title: '일정 알림', body: '확인할 일정이 있어요' },
      trigger: {
        type: module.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    })
  } catch {
    return createId()
  }
}

export async function snoozeOnDevice(minutes: number): Promise<string> {
  const module = await notificationsModule()
  if (!module) return createId()
  try {
    return await module.scheduleNotificationAsync({
      content: { title: '일정 알림', body: '확인할 일정이 있어요' },
      trigger: {
        type: module.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: minutes * 60,
      },
    })
  } catch {
    return createId()
  }
}

export async function cancelOnDevice(notificationId: string): Promise<void> {
  const module = await notificationsModule()
  if (!module) return
  try {
    await module.cancelScheduledNotificationAsync(notificationId)
  } catch {
    return
  }
}

export async function speakOnDevice(text: string): Promise<void> {
  const module = await speechModule()
  if (!module) return
  try {
    module.speak(text, { language: 'ko-KR' })
  } catch {
    throw new Error('지금은 읽어드릴 수 없어요.')
  }
}

export async function stopSpeakingOnDevice(): Promise<void> {
  const module = await speechModule()
  if (!module) return
  try {
    await module.stop()
  } catch {
    throw new Error('읽어주기를 멈추지 못했어요.')
  }
}
