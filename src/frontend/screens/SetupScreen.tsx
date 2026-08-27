import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { copy } from '../../content/ko/copy'
import { ActionButton, StateMessage } from '../components/common/ui'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { ModeSelector } from '../components/settings/ModeSelector'
import { useFrontendTheme } from '../theme/ThemeContext'
import { bodyType, layout, spacing, typography } from '../theme/tokens'
import type { AppRoute, DisplayMode, ProfilePreferences } from '../types'

interface SetupScreenProps {
  mode: DisplayMode
  speech: boolean
  loading: boolean
  error: string | null
  onSignIn: () => Promise<unknown>
  onUpdate: (patch: Partial<ProfilePreferences>) => Promise<unknown>
  onNavigate: (route: AppRoute) => void
}

export function SetupScreen({ mode, speech, loading, error, onSignIn, onUpdate, onNavigate }: SetupScreenProps) {
  const { colors } = useFrontendTheme()
  const [step, setStep] = useState(0)
  const [finished, setFinished] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  async function finish() {
    if (submitting) return
    setSubmitting(true)
    setActionError(null)
    try {
      const user = await onSignIn()
      if (!user) { setActionError(copy.setup.accountPrepareError); return }
      setFinished(true)
    } catch { setActionError(copy.setup.accountPrepareError) }
    finally { setSubmitting(false) }
  }
  async function update(patch: Partial<ProfilePreferences>) {
    setActionError(null)
    try { await onUpdate(patch) }
    catch { setActionError(copy.setup.updateError) }
  }
  if (loading) return <StateMessage state="loading" loadingText={copy.setup.accountDescription} />
  if (error) return <StateMessage state="error" errorText={copy.setup.error} />
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <ScreenHeader readAloudEnabled={speech} readText={copy.setup.title} title={copy.setup.title} />
        {actionError ? <StateMessage state="error" errorText={actionError} /> : null}
        {finished ? <View style={styles.section}><Text style={[typography.display, { color: colors.text }]}>{copy.setup.finishTitle}</Text><ActionButton label={copy.setup.connect} onPress={() => onNavigate('together')} tone="primary" /><ActionButton label={copy.setup.later} onPress={() => onNavigate('today')} /></View> : null}
        {!finished && step === 0 ? <View style={styles.section}><Text style={[bodyType(mode), { color: colors.textMuted }]}>{copy.setup.accountStep}</Text><Text style={[typography.display, { color: colors.text }]}>{copy.setup.accountQuestion}</Text><Text style={[bodyType(mode), { color: colors.textMuted }]}>{copy.setup.accountDescription}</Text><ActionButton label={copy.setup.accountAction} onPress={() => setStep(1)} tone="primary" /></View> : null}
        {!finished && step === 1 ? <View style={styles.section}><Text style={[bodyType(mode), { color: colors.textMuted }]}>{copy.setup.modeStep}</Text><Text style={[typography.display, { color: colors.text }]}>{copy.setup.modeQuestion}</Text><ModeSelector onChange={(value) => void update({ display_mode: value })} value={mode} /><ActionButton label={copy.common.next} onPress={() => setStep(2)} tone="primary" /></View> : null}
        {!finished && step === 2 ? <View style={styles.section}><Text style={[bodyType(mode), { color: colors.textMuted }]}>{copy.setup.speechStep}</Text><Text style={[typography.display, { color: colors.text }]}>{copy.setup.speechQuestion}</Text><ActionButton label={speech ? copy.setup.speechOff : copy.setup.speechOn} onPress={() => void update({ read_aloud_enabled: !speech })} selected={speech} /><ActionButton disabled={submitting} label={copy.common.done} onPress={() => void finish()} tone="primary" /></View> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({ content: { maxWidth: layout.formMax, padding: spacing.lg, width: '100%' }, screen: { alignItems: 'center', flex: 1 }, section: { gap: spacing.lg } })
