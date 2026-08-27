import { useCallback, useEffect, useState } from 'react'

import { appServices } from '../../service'
import { copy } from '../../content/ko/copy'
import type { AppSession } from '../../service/contracts'

export function useSession() {
  const [user, setUser] = useState<AppSession['user'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const session = await appServices.auth.getSession()
      setUser(session?.user ?? null)
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : copy.setup.accountLoadError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const signIn = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const session = await appServices.auth.signInAsLocalUser()
      setUser(session.user)
      return session.user
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : copy.setup.accountPrepareError)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    await appServices.auth.signOut()
    setUser(null)
  }, [])

  return { user, loading, error, signIn, signOut, refresh }
}
