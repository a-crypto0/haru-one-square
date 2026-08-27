import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { copy } from '../../../content/ko/copy'
import { useFrontendTheme } from '../../theme/ThemeContext'
import { bodyType, radii, spacing } from '../../theme/tokens'
import type { UiState } from '../../types'
import { ActionButton, StateMessage } from '../common/ui'

interface UndoBannerProps {
  message: string
  durationMs?: number
  onUndo: () => Promise<void> | void
  onDismiss: () => void
  state?: UiState
}

export function UndoBanner({ message, durationMs = 8000, onUndo, onDismiss, state = 'success' }: UndoBannerProps) {
  const { colors, mode } = useFrontendTheme()
  const safeDuration = Math.max(durationMs, 8000)
  const [remainingTime, setRemainingTime] = useState(safeDuration)
  const [undoError, setUndoError] = useState(false)

  useEffect(() => {
    setRemainingTime(safeDuration)
    const interval = setInterval(() => setRemainingTime((value) => Math.max(0, value - 1000)), 1000)
    const timeout = setTimeout(onDismiss, safeDuration)
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [message, onDismiss, safeDuration])

  async function undo() {
    setUndoError(false)
    try { await onUndo() }
    catch { setUndoError(true) }
  }

  if (!message || state === 'empty') return null
  if (state !== 'success') {
    return <StateMessage state={state} loadingText={copy.undo.loading} errorText={copy.undo.error} />
  }
  return (
    <View accessibilityLiveRegion="assertive" style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.text }]}>
      <View style={styles.message}>{undoError ? <StateMessage state="error" errorText={copy.undo.error} /> : <Text style={[bodyType(mode), { color: colors.text }]}>{message} · {copy.undo.remaining(Math.ceil(remainingTime / 1000))}</Text>}</View>
      <ActionButton label={copy.undo.action} onPress={() => void undo()} tone="secondary" />
      <ActionButton label={copy.undo.dismiss} onPress={onDismiss} />
    </View>
  )
}

const styles = StyleSheet.create({
  banner: { alignItems: 'center', borderRadius: radii.card, borderWidth: 1, bottom: 88, elevation: 3, flexDirection: 'row', gap: spacing.sm, left: spacing.md, padding: spacing.md, position: 'absolute', right: spacing.md, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8 },
  message: { flex: 1 },
})
