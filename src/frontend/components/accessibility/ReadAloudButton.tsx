import { useState } from 'react'

import { copy } from '../../../content/ko/copy'
import { useReadAloud } from '../../hooks/useReadAloud'
import type { UiState } from '../../types'
import { ActionButton, StateMessage } from '../common/ui'

interface ReadAloudButtonProps {
  text: string
  enabled: boolean
  onStart?: () => void
  onStop?: () => void
  state?: UiState
}

export function ReadAloudButton({ text, enabled, onStart, onStop, state = 'success' }: ReadAloudButtonProps) {
  const { speaking, error, speak, stop } = useReadAloud()
  const [busy, setBusy] = useState(false)
  const effectiveState: UiState = busy ? 'loading' : error ? 'error' : !enabled || !text ? 'empty' : state

  async function handleToggle() {
    setBusy(true)
    try {
      if (speaking) {
        await stop()
        onStop?.()
      } else {
        await speak(text)
        onStart?.()
      }
    } finally { setBusy(false) }
  }

  if (effectiveState !== 'success') {
    return (
      <StateMessage
        state={effectiveState}
        loadingText={copy.readAloud.loading}
        errorText={copy.readAloud.error}
        emptyText={copy.readAloud.disabled}
      />
    )
  }
  const label = speaking ? copy.readAloud.stop : copy.readAloud.start
  return <ActionButton label={label} onPress={() => void handleToggle()} tone="secondary" />
}
