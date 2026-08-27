import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { copy } from '../../content/ko/copy'
import { ActionButton, StateMessage } from '../components/common/ui'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { ModeSelector } from '../components/settings/ModeSelector'
import { useFrontendTheme } from '../theme/ThemeContext'
import { spacing, typography } from '../theme/tokens'
import type { DisplayMode, ProfilePreferences, ThemePreference } from '../types'

interface SettingsScreenProps {
  mode: DisplayMode
  theme: ThemePreference
  speech: boolean
  loading: boolean
  error: string | null
  onUpdate: (patch: Partial<ProfilePreferences>) => Promise<unknown>
  onSignOut: () => Promise<void>
}

export function SettingsScreen({ mode, theme, speech, loading, error, onUpdate, onSignOut }: SettingsScreenProps) {
  const { colors } = useFrontendTheme()
  const [actionError, setActionError] = useState<string | null>(null)
  async function update(patch: Partial<ProfilePreferences>) {
    setActionError(null)
    try { await onUpdate(patch) }
    catch { setActionError(copy.settings.updateError) }
  }
  if (loading || error) return <StateMessage state={loading ? 'loading' : 'error'} loadingText={copy.mode.loading} errorText={error ?? copy.mode.error} />
  return <View style={styles.screen}><ScreenHeader readAloudEnabled={speech} readText={copy.settings.title} title={copy.settings.title} />{actionError ? <StateMessage state="error" errorText={actionError} /> : null}<ModeSelector onChange={(value) => void update({ display_mode: value })} value={mode} /><View style={styles.section}><Text style={[typography.section, { color: colors.text }]}>{copy.settings.speech}</Text><ActionButton label={speech ? copy.setup.speechOff : copy.setup.speechOn} onPress={() => void update({ read_aloud_enabled: !speech })} selected={speech} /><Text style={[typography.bodyStandard, { color: colors.textMuted }]}>{copy.settings.speechDescription}</Text></View><View style={styles.section}><Text style={[typography.section, { color: colors.text }]}>{copy.settings.brightness}</Text><View style={styles.row}>{(['system', 'light', 'dark'] as const).map((value) => { const labels: Record<ThemePreference, string> = { system: copy.settings.system, light: copy.settings.light, dark: copy.settings.dark }; return <ActionButton key={value} label={labels[value]} onPress={() => void update({ theme: value })} selected={theme === value} /> })}</View></View><ActionButton label={copy.settings.signedOut} onPress={() => void onSignOut()} tone="danger" /></View>
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, screen: { gap: spacing.xl }, section: { gap: spacing.md } })
