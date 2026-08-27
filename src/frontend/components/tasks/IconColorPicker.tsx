import { StyleSheet, Text, View } from 'react-native'

import { copy } from '../../../content/ko/copy'
import { useFrontendTheme } from '../../theme/ThemeContext'
import { spacing, typography } from '../../theme/tokens'
import type { TaskColorToken, UiState } from '../../types'
import { ActionButton, StateMessage } from '../common/ui'

export interface IconOption { icon: string; label: string }

interface IconColorPickerProps {
  icon?: string
  colorToken?: TaskColorToken
  options: IconOption[]
  onChange: (value: { icon?: string; colorToken?: TaskColorToken }) => void
  state?: UiState
}

const colors: { token: TaskColorToken; label: string }[] = [
  { token: 'sage', label: copy.picker.sage }, { token: 'lavender', label: copy.picker.lavender },
  { token: 'sky', label: copy.picker.sky }, { token: 'butter', label: copy.picker.butter },
]

export function IconColorPicker({ icon, colorToken, options, onChange, state = 'success' }: IconColorPickerProps) {
  const { colors: themeColors } = useFrontendTheme()
  const effectiveState = options.length === 0 && state === 'success' ? 'empty' : state
  if (effectiveState !== 'success') return <StateMessage state={effectiveState} loadingText={copy.picker.loading} errorText={copy.picker.error} emptyText={copy.picker.empty} />
  return (
    <View style={styles.wrapper}>
      <Text style={[typography.section, { color: themeColors.text }]}>{copy.picker.iconTitle}</Text>
      <View style={styles.options}>
        {options.map((option) => <ActionButton key={option.label} label={`${option.icon} ${option.label}`} onPress={() => onChange({ icon: option.icon })} selected={icon === option.icon} />)}
      </View>
      <Text style={[typography.section, { color: themeColors.text }]}>{copy.picker.colorTitle}</Text>
      <View style={styles.options}>
        {colors.map((option) => <ActionButton key={option.token} label={`${colorToken === option.token ? '✓ ' : ''}${option.label}`} onPress={() => onChange({ colorToken: option.token })} selected={colorToken === option.token} />)}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({ options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, wrapper: { gap: spacing.md } })

