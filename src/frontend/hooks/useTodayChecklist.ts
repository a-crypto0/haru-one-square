import { useCallback, useEffect, useState } from 'react'

import { appServices } from '../../service'
import { copy } from '../../content/ko/copy'
import type { TodayRecord } from '../../service/contracts'
import type { TaskLogStatus } from '../types'
import { toLocalDate } from '../utils/date'

export function useTodayChecklist(localDate = toLocalDate()) {
  const [items, setItems] = useState<TodayRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setItems(await appServices.records.listToday(localDate)) }
    catch (reason: unknown) { setError(reason instanceof Error ? reason.message : copy.task.error) }
    finally { setLoading(false) }
  }, [localDate])

  useEffect(() => { void refresh() }, [refresh])

  const setStatus = useCallback(async (taskId: string, status: TaskLogStatus) => {
    const log = await appServices.records.setStatus(taskId, localDate, status)
    setItems((current) => current.map((item) => item.task.task.id === taskId ? { ...item, status, log } : item))
    return log
  }, [localDate])

  const recordStatus = useCallback(async (taskId: string, status: 'completed' | 'delayed' | 'help_requested') => {
    const item = items.find((value) => value.task.task.id === taskId)
    if (item?.task.task.kind === 'medication') {
      await appServices.medications.record(taskId, status)
      setItems((current) => current.map((value) => value.task.task.id === taskId ? { ...value, status } : value))
      return
    }
    await setStatus(taskId, status)
  }, [items, setStatus])
  const complete = useCallback((taskId: string) => recordStatus(taskId, 'completed'), [recordStatus])
  const delay = useCallback((taskId: string) => recordStatus(taskId, 'delayed'), [recordStatus])
  const requestHelp = useCallback((taskId: string) => recordStatus(taskId, 'help_requested'), [recordStatus])
  const undo = useCallback(async (taskId: string) => {
    await appServices.records.undo(taskId, localDate)
    setItems((current) => current.map((item) => item.task.task.id === taskId ? { ...item, status: 'missing', log: null } : item))
  }, [localDate])

  return { items, loading, error, complete, delay, requestHelp, undo, refresh }
}
