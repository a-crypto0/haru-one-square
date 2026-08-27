import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { copy } from '../../../content/ko/copy'
import { useFrontendTheme } from '../../theme/ThemeContext'
import { bodyType, radii, spacing } from '../../theme/tokens'
import type { TaskKind, TaskLogStatus, UiState } from '../../types'
import { ActionButton, StateMessage } from '../common/ui'

interface CompletionControlProps {
  kind: TaskKind
  status: TaskLogStatus
  onComplete: () => Promise<void> | void
  onDelay?: () => Promise<void> | void
  onHelp?: () => Promise<void> | void
  onUndo: () => Promise<void> | void
  state?: UiState
}

export function CompletionControl({ kind, status, onComplete, onDelay, onHelp, onUndo, state = 'success' }: CompletionControlProps) {
  const { colors, mode } = useFrontendTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [failed, setFailed] = useState(false)
  const effectiveState: UiState = isSubmitting ? 'loading' : failed ? 'error' : state

  async function submit(action: () => Promise<void> | void) {
    setIsSubmitting(true)
    setFailed(false)
    try { await action() }
    catch { setFailed(true) }
    finally { setIsSubmitting(false) }
  }

  if (effectiveState !== 'success') {
    return <StateMessage state={effectiveState} loadingText={copy.task.saving} errorText={copy.task.saveError} emptyText={copy.task.beforeChoice} />
  }
  if (status === 'completed' || status === 'delayed' || status === 'help_requested') {
    const recordedLabel = status === 'completed' ? copy.today.recorded : status === 'delayed' ? copy.task.delayedRecorded : copy.task.helpRecorded
    const backgroundColor = status === 'completed' ? colors.successSoft : status === 'delayed' ? colors.infoSoft : colors.warningSoft
    const foreground = status === 'completed' ? colors.success : status === 'delayed' ? colors.info : colors.warning
    return (
      <View style={[styles.completed, { backgroundColor, borderColor: foreground }]}> 
        <Text accessibilityLiveRegion="assertive" style={[bodyType(mode), { color: foreground }]}>{recordedLabel}</Text>
        <ActionButton label={copy.undo.action} onPress={() => void submit(onUndo)} tone="secondary" />
      </View>
    )
  }
  return (
    <View style={styles.actions}>
      <ActionButton
        label={kind === 'medication' ? copy.task.medicationComplete : copy.task.complete}
        onPress={() => void submit(onComplete)}
        tone="primary"
      />
      {kind === 'medication' ? (
        <View style={styles.secondaryRow}>
          {onDelay ? <ActionButton label={copy.task.delay} onPress={() => void submit(onDelay)} /> : null}
          {onHelp ? <ActionButton label={copy.task.help} onPress={() => void submit(onHelp)} /> : null}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  actions: { gap: spacing.sm },
  completed: { alignItems: 'center', borderRadius: radii.input, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between', padding: spacing.sm },
  secondaryRow: { flexDirection: 'row', gap: spacing.sm },
})
