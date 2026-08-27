import { useCallback, useState } from 'react'

import { appServices } from '../../service'
import { copy } from '../../content/ko/copy'

export function useReadAloud() {
  const [speaking, setSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const speak = useCallback(async (text: string) => {
    setError(null)
    try {
      await appServices.speech.speak(text)
      setSpeaking(true)
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : copy.readAloud.error)
    }
  }, [])
  const stop = useCallback(async () => {
    try { await appServices.speech.stop() }
    finally { setSpeaking(false) }
  }, [])
  return { speaking, error, speak, stop }
}
