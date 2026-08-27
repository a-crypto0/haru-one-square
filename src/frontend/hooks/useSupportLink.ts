import { useCallback, useEffect, useState } from 'react'

import { appServices } from '../../service'
import { copy } from '../../content/ko/copy'
import type { SharingLink } from '../../service/contracts'
import type { SupportPermissions } from '../types'

export function useSupportLink() {
  const [link, setLink] = useState<SharingLink | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setLink(await appServices.sharing.getLink()) }
    catch (reason: unknown) { setError(reason instanceof Error ? reason.message : copy.support.error) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void refresh() }, [refresh])
  const invite = useCallback(async (displayName: string) => { const next = await appServices.sharing.invite(displayName); setLink(next); return next }, [])
  const update = useCallback(async (patch: Partial<SupportPermissions>) => { const next = await appServices.sharing.updatePermissions(patch); setLink(next); return next }, [])
  const disconnect = useCallback(async () => { const next = await appServices.sharing.disconnect(); setLink(null); return next }, [])

  return { supporter: link ? { id: link.link.supporter_id, displayName: link.supporterDisplayName, connected: !link.link.revoked_at } : null, permissions: link?.link.permissions ?? null, completionPermission: link?.completionPermission ?? null, loading, error, invite, update, disconnect, refresh }
}
