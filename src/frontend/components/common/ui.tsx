import type { PropsWithChildren } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { copy } from '../../../content/ko/copy'
import type { DisplayMode, UiState } from '../../types'
import { useFrontendTheme } from '../../theme/ThemeContext'
import { bodyType, radii, spacing, touchSize } from '../../theme/tokens'

interface StateMessageProps {
  state: UiState
  loadingText?: string
  errorText?: string
  emptyText?: string
  mode?: DisplayMode
}

export function StateMessage({
  state,
  loadingText = copy.common.loading,
  errorText,
  emptyText,
  mode,
}: StateMessageProps) {
  const { colors, mode: contextMode } = useFrontendTheme()
  const resolvedMode = mode ?? contextMode
  const text = state === 'loading' ? loadingText : state === 'error' ? errorText : emptyText
  if (state === 'success' || !text) return null
  return (
    <View style={[styles.state, { backgroundColor: state === 'error' ? colors.errorSoft : colors.surfaceSoft }]}>
      <Text accessibilityLiveRegion="polite" style={[bodyType(resolvedMode), { color: state === 'error' ? colors.error : colors.text }]}> 
        {text}
      </Text>
    </View>
  )
}

interface ActionButtonProps extends PropsWithChildren {
  label: string
  onPress: () => void
  mode?: DisplayMode
  tone?: 'primary' | 'secondary' | 'neutral' | 'danger'
  selected?: boolean
  disabled?: boolean
}

export function ActionButton({
  label,
  onPress,
  mode,
  tone = 'neutral',
  selected = false,
  disabled = false,
  children,
}: ActionButtonProps) {
  const { colors, mode: contextMode } = useFrontendTheme()
  const resolvedMode = mode ?? contextMode
  const filled = tone === 'primary' || selected
  const backgroundColor = disabled
    ? colors.surfaceSoft
    : filled
      ? colors.primary
      : tone === 'secondary'
        ? colors.secondarySoft
        : tone === 'danger'
          ? colors.errorSoft
          : colors.surface
  const foreground = disabled
    ? colors.textMuted
    : filled
      ? colors.surface
      : tone === 'danger'
        ? colors.error
        : tone === 'secondary'
          ? colors.secondary
          : colors.text
  const borderColor = disabled
    ? colors.border
    : filled
      ? colors.transparent
      : tone === 'danger'
        ? colors.errorSoft
        : tone === 'secondary'
          ? colors.secondarySoft
          : colors.border
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor,
          minHeight: resolvedMode === 'easy' ? 56 : touchSize,
          shadowColor: filled ? colors.primary : colors.text,
        },
        filled && !disabled ? styles.filledButton : undefined,
        pressed && !disabled ? { opacity: 0.72 } : undefined,
      ]}
    >
      <Text style={[bodyType(resolvedMode), styles.buttonLabel, { color: foreground }]}>{children ?? label}</Text>
    </Pressable>
  )
}

export const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radii.input,
    borderWidth: 1,
    justifyContent: 'center',
    minWidth: touchSize,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buttonLabel: { fontWeight: '700', textAlign: 'center' },
  filledButton: { elevation: 1, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
  state: {
    borderRadius: radii.input,
    padding: spacing.md,
  },
})
