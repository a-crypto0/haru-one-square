import { StyleSheet, Text, View } from 'react-native'

import { copy } from '../../../content/ko/copy'
import { useFrontendTheme } from '../../theme/ThemeContext'
import { bodyType, spacing, typography } from '../../theme/tokens'
import type { DisplayMode, UiState } from '../../types'
import { ActionButton, StateMessage } from '../common/ui'

interface ModeSelectorProps {
  value?: DisplayMode
  onChange: (mode: DisplayMode) => void
  state?: UiState
}

export function ModeSelector({ value, onChange, state = 'success' }: ModeSelectorProps) {
  const { colors, mode } = useFrontendTheme()
  const effectiveState = !value && state === 'success' ? 'empty' : state
  if (effectiveState !== 'success') {
    return <StateMessage state={effectiveState} loadingText={copy.mode.loading} errorText={copy.mode.error} emptyText={copy.mode.empty} />
  }
  return (
    <View style={styles.wrapper}>
      <Text accessibilityRole="header" style={[typography.section, { color: colors.text }]}>{copy.mode.title}</Text>
      <View style={styles.options}>
        <ActionButton label={copy.mode.easy} onPress={() => onChange('easy')} selected={value === 'easy'}>
          {`${value === 'easy' ? '◉' : '○'} ${copy.mode.easy}`}
        </ActionButton>
        <Text style={[bodyType(mode), { color: colors.textMuted }]}>{copy.mode.easyDescription}</Text>
        <ActionButton label={copy.mode.standard} onPress={() => onChange('standard')} selected={value === 'standard'}>
          {`${value === 'standard' ? '◉' : '○'} ${copy.mode.standard}`}
        </ActionButton>
        <Text style={[bodyType(mode), { color: colors.textMuted }]}>{copy.mode.standardDescription}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({ options: { gap: spacing.sm }, wrapper: { gap: spacing.md } })
