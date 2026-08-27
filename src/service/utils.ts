import type { ISODate, ISODateTime, LocalTime, UUID } from '../db/types'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

export function nowIso(): ISODateTime {
  return new Date().toISOString()
}

export function todayLocal(): ISODate {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function assertLocalDate(value: ISODate, label = '날짜'): void {
  if (!DATE_PATTERN.test(value)) {
    throw new Error(`${label}는 YYYY-MM-DD 형식이어야 해요.`)
  }
  const [year, month, day] = value.split('-').map(Number)
  const check = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 0))
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() + 1 !== month ||
    check.getUTCDate() !== day
  ) {
    throw new Error(`${label}를 다시 확인해 주세요.`)
  }
}

export function assertLocalTime(value: string | null): asserts value is LocalTime | null {
  if (value !== null && !TIME_PATTERN.test(value)) {
    throw new Error('시간은 HH:mm 형식이어야 해요.')
  }
}

export function assertWeekdays(weekdays: number[]): void {
  if (
    weekdays.some(
      (weekday) => !Number.isInteger(weekday) || weekday < 0 || weekday > 6,
    )
  ) {
    throw new Error('반복 요일을 다시 확인해 주세요.')
  }
}

export function createId(): UUID {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (token) => {
    const random = Math.floor(Math.random() * 16)
    const value = token === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

export function weekdayForLocalDate(localDate: ISODate): number {
  assertLocalDate(localDate)
  return new Date(`${localDate}T12:00:00`).getDay()
}

export function safeFileName(fileName: string): string {
  const leaf = fileName.trim().split(/[\\/]/).pop() ?? ''
  const safe = leaf.normalize('NFKC').replace(/[^\p{L}\p{N}._-]+/gu, '_')
  if (!safe || safe === '.' || safe === '..') {
    throw new Error('사진 파일 이름을 다시 확인해 주세요.')
  }
  return safe
}
