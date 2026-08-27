import { useCallback, useEffect, useState } from 'react'

import { appServices } from '../../service'
import { copy } from '../../content/ko/copy'
import type { WeightLog } from '../types'

export function useWeightLog() {
  const [latest, setLatest] = useState<WeightLog | null>(null)
  const [history, setHistory] = useState<WeightLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [newest, records] = await Promise.all([appServices.weights.latest(), appServices.weights.list()])
      setLatest(newest)
      setHistory(records)
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : copy.weight.loadError)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const save = useCallback(async (valueKg: number) => {
    setError(null)
    const record = await appServices.weights.save(valueKg)
    setLatest(record)
    setHistory((current) => [record, ...current.filter((item) => item.id !== record.id)])
    return record
  }, [])

  return { latest, history, loading, error, save, refresh }
}
