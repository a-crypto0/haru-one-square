import { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

import { copy } from '../../../content/ko/copy'
import { useFrontendTheme } from '../../theme/ThemeContext'
import { bodyType, radii, spacing, touchSize, typography } from '../../theme/tokens'
import type { SupportPermissions, SupporterView, UiState } from '../../types'
import { ActionButton, StateMessage } from '../common/ui'

interface SupporterPanelProps {
  supporter?: SupporterView | null
  permissions?: SupportPermissions | null
  onInvite: (displayName: string) => Promise<void> | void
  onPermissionChange: (patch: Partial<SupportPermissions>) => Promise<void> | void
  onDisconnect: () => Promise<void> | void
  state?: UiState
}

export function SupporterPanel({ supporter, permissions, onInvite, onPermissionChange, onDisconnect, state = 'success' }: SupporterPanelProps) {
  const { colors, mode } = useFrontendTheme()
  const [inviteName, setInviteName] = useState('')
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  async function invite() {
    setActionError(null)
    try { await onInvite(inviteName.trim()); setInviteName('') }
    catch { setActionError(copy.support.inviteError) }
  }
  async function changePermission(patch: Partial<SupportPermissions>) {
    setActionError(null)
    try { await onPermissionChange(patch) }
    catch { setActionError(copy.support.permissionError) }
  }
  async function disconnect() {
    setActionError(null)
    try { await onDisconnect() }
    catch { setActionError(copy.support.disconnectError) }
  }
  if (state === 'loading' || state === 'error') return <StateMessage state={state} loadingText={copy.support.loading} errorText={copy.support.error} />
  if (!supporter || !permissions) {
    return <View style={styles.wrapper}><StateMessage state="empty" emptyText={copy.support.empty} />{actionError ? <StateMessage state="error" errorText={actionError} /> : null}<TextInput accessibilityLabel={copy.support.invitePrompt} onChangeText={setInviteName} placeholder={copy.support.invitePrompt} placeholderTextColor={colors.textMuted} style={[bodyType(mode), styles.input, { borderColor: colors.border, color: colors.text }]} value={inviteName} /><ActionButton disabled={!inviteName.trim()} label={copy.support.invite} onPress={() => void invite()} tone="primary" /></View>
  }
  const permissionRows: { key: keyof SupportPermissions; label: string }[] = [
    { key: 'can_view_schedule', label: copy.support.scheduleView }, { key: 'can_add_schedule', label: copy.support.scheduleAdd }, { key: 'can_update_schedule', label: copy.support.scheduleUpdate },
  ]
  return (
    <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[typography.section, { color: colors.text }]}>{copy.support.one}</Text>
      <Text style={[bodyType(mode), { color: colors.text }]}>{supporter.displayName} · {copy.support.connected}</Text>
      <Text style={[typography.section, { color: colors.text }]}>{copy.support.shared}</Text>
      {actionError ? <StateMessage state="error" errorText={actionError} /> : null}
      {permissionRows.map((row) => <ActionButton key={row.key} label={`${permissions[row.key] ? '✓' : '○'} ${row.label}`} onPress={() => void changePermission({ [row.key]: !permissions[row.key] })} selected={permissions[row.key]} />)}
      <Text style={[bodyType(mode), { color: colors.info }]}>{copy.support.selfOnly}</Text>
      <View style={[styles.danger, { borderColor: colors.border }]}>
        <Text style={[bodyType(mode), { color: colors.textMuted }]}>{copy.support.disconnectExplain}</Text>
        {confirmingDisconnect ? <><Text style={[bodyType(mode), { color: colors.error }]}>{copy.support.disconnectConfirm}</Text><ActionButton label={copy.common.yes} onPress={() => void disconnect()} tone="danger" /><ActionButton label={copy.common.no} onPress={() => setConfirmingDisconnect(false)} /></> : <ActionButton label={copy.support.disconnect} onPress={() => setConfirmingDisconnect(true)} tone="danger" />}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  danger: { borderTopWidth: 1, gap: spacing.md, marginTop: spacing.xl, paddingTop: spacing.xl },
  input: { borderRadius: radii.input, borderWidth: 1, minHeight: touchSize, paddingHorizontal: spacing.md },
  panel: { borderRadius: radii.card, borderWidth: 1, gap: spacing.md, padding: spacing.lg },
  wrapper: { gap: spacing.md },
})
