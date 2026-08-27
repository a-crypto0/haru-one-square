import { StyleSheet, View } from 'react-native'

import { copy } from '../../content/ko/copy'
import { ActionButton } from '../components/common/ui'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { SupporterPanel } from '../components/support/SupporterPanel'
import { useSupportLink } from '../hooks/useSupportLink'
import { spacing } from '../theme/tokens'
import type { AppRoute } from '../types'

interface TogetherScreenProps { speech: boolean; onNavigate: (route: AppRoute) => void }

export function TogetherScreen({ speech, onNavigate }: TogetherScreenProps) {
  const { supporter, permissions, loading, error, invite, update, disconnect } = useSupportLink()
  const state = loading ? 'loading' : error ? 'error' : supporter ? 'success' : 'empty'
  return <View style={styles.screen}><ScreenHeader readAloudEnabled={speech} readText={copy.support.title} title={copy.support.title} /><SupporterPanel onDisconnect={async () => { await disconnect() }} onInvite={async (name) => { await invite(name) }} onPermissionChange={async (patch) => { await update(patch) }} permissions={permissions} state={state} supporter={supporter} />{supporter ? <View style={styles.actions}><ActionButton label={copy.today.manage} onPress={() => onNavigate('tasks')} /><ActionButton label={copy.support.history} onPress={() => onNavigate('history')} tone="secondary" /></View> : null}</View>
}

const styles = StyleSheet.create({ actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, screen: { gap: spacing.lg } })
