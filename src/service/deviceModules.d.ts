declare module 'expo-notifications' {
  export const SchedulableTriggerInputTypes: {
    DAILY: string
    TIME_INTERVAL: string
  }
  export function setNotificationHandler(handler: unknown): void
  export function scheduleNotificationAsync(request: unknown): Promise<string>
  export function cancelScheduledNotificationAsync(identifier: string): Promise<void>
}

declare module 'expo-speech' {
  export function speak(text: string, options?: unknown): void
  export function stop(): Promise<void>
}
