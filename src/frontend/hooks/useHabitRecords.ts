import { useCallback, useEffect, useMemo, useState } from 'react'

import { appServices } from '../../service'
import { copy } from '../../content/ko/copy'
import type { TaskLog } from '../types'
import { shiftDate, shiftMonth, startOfWeek, toLocalDate } from '../utils/date'

export type RecordPeriod = 'weekly' | 'monthly'

export function useHabitRecords(initialPeriod: RecordPeriod = 'weekly') {
  const [period, setPeriod] = useState<RecordPeriod>(initialPeriod)
  const [anchor, setAnchor] = useState(toLocalDate())
  const [records, setRecords] = useState<TaskLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const range = useMemo(() => {
    if (period === 'weekly') {
      const start = startOfWeek(anchor)
      return { start, end: shiftDate(start, 6) }
    }
    const [year = 0, month = 1] = anchor.split('-').map(Number)
    const start = `${year}-${String(month).padStart(2, '0')}-01`
    const end = toLocalDate(new Date(year, month, 0))
    return { start, end }
  }, [anchor, period])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setRecords(await appServices.records.listRange(range.start, range.end)) }
    catch (reason: unknown) { setError(reason instanceof Error ? reason.message : copy.records.error) }
    finally { setLoading(false) }
  }, [range.end, range.start])

  useEffect(() => { void refresh() }, [refresh])

  const selectPeriod = useCallback((next: RecordPeriod) => setPeriod(next), [])
  const shiftRange = useCallback((direction: -1 | 1) => setAnchor((value) => period === 'weekly' ? shiftDate(value, direction * 7) : shiftMonth(value, direction)), [period])

  return { weekly: period === 'weekly' ? records : [], monthly: period === 'monthly' ? records : [], records, range, period, loading, error, selectPeriod, shiftRange, refresh }
}
