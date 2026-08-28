import { StyleSheet, Text, View } from 'react-native'

import { copy } from '../../../content/ko/copy'
import { useFrontendTheme } from '../../theme/ThemeContext'
import { spacing, typography } from '../../theme/tokens'
import type { UiState } from '../../types'
import { ReadAloudButton } from '../accessibility/ReadAloudButton'
import { ActionButton, StateMessage } from '../common/ui'

interface ScreenHeaderProps {
  title: string
  backLabel?: string
  onBack?: () => void
  readText?: string
  readAloudEnabled?: boolean
  state?: UiState
}

export function ScreenHeader({
  title,
  backLabel = copy.common.back,
  onBack,
  readText,
  readAloudEnabled = true,
  state = 'success',
}: ScreenHeaderProps) {
  const { colors } = useFrontendTheme()
  if (state !== 'success') {
    return <StateMessage state={state} loadingText={copy.header.loading} errorText={copy.header.error} emptyText={backLabel} />
  }
  return (
    <View style={styles.header}>
      <View style={styles.heading}>
        {onBack ? <ActionButton label={`← ${backLabel}`} onPress={onBack} /> : null}
        <Text accessibilityRole="header" style={[typography.title, { color: colors.text }]}>{title}</Text>
      </View>
      {readText ? <ReadAloudButton enabled={readAloudEnabled} text={readText} /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between', marginBottom: spacing.md },
  heading: { alignItems: 'center', flexDirection: 'row', flexShrink: 1, gap: spacing.md },
})
