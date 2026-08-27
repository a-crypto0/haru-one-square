import { useCallback, useEffect, useState } from 'react'

import { appServices } from '../../service'
import { copy } from '../../content/ko/copy'
import type { ProfilePreferences } from '../types'

const defaults: ProfilePreferences = { display_mode: 'easy', theme: 'system', read_aloud_enabled: true }

export function usePreferences() {
  const [preferences, setPreferences] = useState<ProfilePreferences>(defaults)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setPreferences(await appServices.preferences.get()) }
    catch (reason: unknown) { setError(reason instanceof Error ? reason.message : copy.mode.error) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void refresh() }, [refresh])
  const update = useCallback(async (patch: Partial<ProfilePreferences>) => {
    setPreferences((current) => ({ ...current, ...patch }))
    try {
      const saved = await appServices.preferences.update(patch)
      setPreferences(saved)
      return saved
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : copy.mode.error)
      throw reason
    }
  }, [])

  return { mode: preferences.display_mode, theme: preferences.theme, speech: preferences.read_aloud_enabled, preferences, loading, error, update, refresh }
}
