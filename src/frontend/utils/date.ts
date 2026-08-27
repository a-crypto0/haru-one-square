export function toLocalDate(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function shiftDate(value: string, days: number): string {
  const [year = 0, month = 1, day = 1] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return toLocalDate(date)
}

export function shiftMonth(value: string, months: number): string {
  const [year = 0, month = 1, day = 1] = value.split('-').map(Number)
  const target = new Date(year, month - 1 + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(day, lastDay))
  return toLocalDate(target)
}

export function startOfWeek(value: string): string {
  const [year = 0, month = 1, day = 1] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const mondayOffset = date.getDay() === 0 ? -6 : 1 - date.getDay()
  date.setDate(date.getDate() + mondayOffset)
  return toLocalDate(date)
}

export function formatKoreanDate(value: string): string {
  const [year = 0, month = 1, day = 1] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })
    .format(new Date(year, month - 1, day))
}

export function formatKoreanDateTime(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(new Date(value))
}
