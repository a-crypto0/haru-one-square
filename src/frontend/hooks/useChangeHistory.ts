import { useCallback, useEffect, useState } from 'react'

import { appServices } from '../../service'
import { copy } from '../../content/ko/copy'
import type { HistoryEntryView } from '../types'

export function useChangeHistory() {
  const [entries, setEntries] = useState<HistoryEntryView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const history = await appServices.sharing.history()
      setEntries(history.map((entry) => ({
        id: entry.id,
        actorLabel: entry.actorRole === 'owner' ? copy.history.ownerActor : copy.history.supporterActor(entry.actorDisplayName),
        targetLabel: entry.target_type === 'task' ? copy.history.targetTask : entry.target_type === 'task_recurrence' ? copy.history.targetRecurrence : entry.target_type === 'task_override' ? copy.history.targetOverride : entry.target_type === 'medication_detail' ? copy.history.targetMedication : copy.history.targetSupport,
        sentence: entry.summary,
        occurredAt: entry.created_at,
        targetId: entry.target_type === 'task' ? entry.target_id : undefined,
      })))
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : copy.history.error)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void refresh() }, [refresh])
  return { entries, loading, error, refresh }
}
