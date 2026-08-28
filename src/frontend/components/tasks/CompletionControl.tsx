import { Pressable, StyleSheet, Text } from 'react-native'

import { copy } from '../../../content/ko/copy'
import { useFrontendTheme } from '../../theme/ThemeContext'
import { radii, touchSize } from '../../theme/tokens'
import type { TaskLogStatus } from '../../types'

interface CompletionControlProps {
  label: string
  completeLabel?: string
  status: TaskLogStatus
  onComplete: () => Promise<void> | void
  busy?: boolean
}

export function CompletionControl({ label, completeLabel = copy.task.complete, status, onComplete, busy = false }: CompletionControlProps) {
  const { colors, mode } = useFrontendTheme()
  const completed = status === 'completed'
  const disabled = busy || status !== 'missing'
  const size = mode === 'easy' ? 56 : touchSize
  const accessibilityLabel = completed
    ? `${label}, ${copy.today.recorded}`
    : status === 'delayed'
      ? `${label}, ${copy.task.delayedRecorded}`
      : status === 'help_requested'
        ? `${label}, ${copy.task.helpRecorded}`
        : `${label}, ${completeLabel}`

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ busy, disabled, selected: completed }}
      disabled={disabled}
      onPress={onComplete}
      style={({ pressed }) => [
        styles.check,
        {
          backgroundColor: completed ? colors.successSoft : colors.surface,
          borderColor: completed ? colors.success : colors.border,
          height: size,
          opacity: pressed ? 0.72 : 1,
          width: size,
        },
      ]}
    >
      <Text style={[styles.symbol, { color: completed ? colors.success : colors.textMuted }]}>{completed ? '✓' : '○'}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  check: {
    alignItems: 'center',
    borderRadius: radii.small,
    borderWidth: 1,
    flexShrink: 0,
    justifyContent: 'center',
  },
  symbol: { fontSize: 24, fontWeight: '800', lineHeight: 30 },
})
