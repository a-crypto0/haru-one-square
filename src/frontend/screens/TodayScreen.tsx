import { useCallback, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { copy } from '../../content/ko/copy'
import { ActionButton, StateMessage } from '../components/common/ui'
import { UndoBanner } from '../components/feedback/UndoBanner'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { TaskCard } from '../components/tasks/TaskCard'
import { useTodayChecklist } from '../hooks/useTodayChecklist'
import { useFrontendTheme } from '../theme/ThemeContext'
import { spacing, typography } from '../theme/tokens'
import type { AppRoute } from '../types'
import { formatKoreanDate, toLocalDate } from '../utils/date'

interface TodayScreenProps {
  speech: boolean
  onNavigate: (route: AppRoute) => void
  onEditTask: (id?: string) => void
}

export function TodayScreen({ speech, onNavigate, onEditTask }: TodayScreenProps) {
  const { colors } = useFrontendTheme()
  const { items, loading, error, complete, delay, requestHelp, undo } = useTodayChecklist()
  const visibleItems = items.filter((item) => item.status !== 'not_scheduled')
  const [undoTaskId, setUndoTaskId] = useState<string | null>(null)
  const dismissUndo = useCallback(() => setUndoTaskId(null), [])
  async function markComplete(id: string) { await complete(id); setUndoTaskId(id) }
  const state = loading ? 'loading' : error ? 'error' : visibleItems.length === 0 ? 'empty' : 'success'
  return (
    <View style={styles.screen}>
      <ScreenHeader readAloudEnabled={speech} readText={`${copy.today.section}. ${visibleItems.map((item) => item.task.task.title).join(', ')}`} title={`${formatKoreanDate(toLocalDate())} · ${copy.today.title}`} />
      <View style={styles.sectionHeader}><Text style={[typography.section, { color: colors.text }]}>{copy.today.section}</Text><ActionButton label={copy.today.manage} onPress={() => onNavigate('tasks')} /></View>
      {state !== 'success' ? <StateMessage state={state} loadingText={copy.task.loading} errorText={error ?? copy.task.error} emptyText={copy.task.empty} /> : null}
      <View style={styles.cards}>{visibleItems.map((item) => <TaskCard creatorLabel={item.task.creatorRole === 'supporter' ? copy.task.supporterAdded : undefined} key={item.task.task.id} onComplete={() => markComplete(item.task.task.id)} onDelay={() => delay(item.task.task.id)} onEdit={() => onEditTask(item.task.task.id)} onHelp={() => requestHelp(item.task.task.id)} onUndo={() => undo(item.task.task.id)} status={item.status} task={item.task.task} />)}</View>
      <View style={styles.actions}><ActionButton label={`＋ ${copy.today.add}`} onPress={() => onEditTask()} tone="primary" /><ActionButton label={copy.today.weight} onPress={() => onNavigate('weight')} tone="secondary" /></View>
      {undoTaskId ? <UndoBanner message={copy.today.undoRecorded} onDismiss={dismissUndo} onUndo={async () => { await undo(undoTaskId); dismissUndo() }} /> : null}
    </View>
  )
}

const styles = StyleSheet.create({ actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, cards: { gap: spacing.md }, screen: { gap: spacing.lg }, sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' } })
