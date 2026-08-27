import { useCallback, useEffect, useState } from 'react'

import { appServices } from '../../service'
import { copy } from '../../content/ko/copy'
import type { MedicationDetail, MedicationLogStatus } from '../types'

export function useMedicationTask(taskId?: string) {
  const [photo, setPhoto] = useState<string | null>(null)
  const [detail, setDetail] = useState<MedicationDetail | null>(null)
  const [loading, setLoading] = useState(Boolean(taskId))
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!taskId) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const next = await appServices.medications.get(taskId)
      setDetail(next)
      if (next?.photo_path) setPhoto(await appServices.medications.getPhotoAccessPath(taskId, next.photo_path))
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : copy.medication.detailError)
    } finally { setLoading(false) }
  }, [taskId])

  useEffect(() => { void refresh() }, [refresh])

  const save = useCallback(async (displayName: string, photoFileName: string | null | undefined, safetyConfirmed: boolean, targetTaskId?: string) => {
    const id = targetTaskId ?? taskId
    if (!id) throw new Error(copy.medication.saveFirst)
    const next = await appServices.medications.save(id, { displayName, photoFileName }, safetyConfirmed)
    setDetail(next)
    return next
  }, [taskId])

  const record = useCallback(async (status: MedicationLogStatus) => {
    if (!taskId) throw new Error(copy.medication.taskMissing)
    return appServices.medications.record(taskId, status)
  }, [taskId])

  return { photo, detail, schedule: null, loading, error, save, record, confirmSafety: save, refresh }
}
