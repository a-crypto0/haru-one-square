import { StyleSheet, Text, View } from 'react-native'

import { copy } from '../../content/ko/copy'
import { ActionButton, StateMessage } from '../components/common/ui'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { PeriodHabitGrid } from '../components/records/PeriodHabitGrid'
import { useHabitRecords } from '../hooks/useHabitRecords'
import { useTasks } from '../hooks/useTasks'
import { useWeightLog } from '../hooks/useWeightLog'
import { useFrontendTheme } from '../theme/ThemeContext'
import { bodyType, radii, spacing } from '../theme/tokens'
import type { AppRoute } from '../types'
import { formatKoreanDateTime } from '../utils/date'

interface RecordsScreenProps { speech: boolean; onNavigate: (route: AppRoute) => void }

export function RecordsScreen({ speech, onNavigate }: RecordsScreenProps) {
  const { colors, mode } = useFrontendTheme()
  const tasksHook = useTasks()
  const recordHook = useHabitRecords()
  const weightHook = useWeightLog()
  const error = tasksHook.error ?? recordHook.error
  const state = tasksHook.loading || recordHook.loading ? 'loading' : error ? 'error' : tasksHook.tasks.length === 0 ? 'empty' : 'success'
  return <View style={styles.screen}><ScreenHeader readAloudEnabled={speech} readText={copy.records.title} title={copy.records.title} />{state !== 'success' ? <StateMessage state={state} loadingText={copy.records.loading} errorText={error ?? copy.records.error} emptyText={copy.records.empty} /> : <PeriodHabitGrid onPeriodChange={recordHook.selectPeriod} onRangeChange={recordHook.shiftRange} period={recordHook.period} records={recordHook.records} tasks={tasksHook.tasks} visibleRange={recordHook.range} />}<View style={[styles.weight, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[bodyType(mode), { color: colors.text }]}>{copy.weight.recent}</Text>{weightHook.latest ? <Text style={[bodyType(mode), { color: colors.textMuted }]}>{weightHook.latest.weight_kg}{copy.weight.unit} · {formatKoreanDateTime(weightHook.latest.recorded_at)}</Text> : <StateMessage state={weightHook.loading ? 'loading' : weightHook.error ? 'error' : 'empty'} loadingText={copy.weight.loading} errorText={copy.weight.error} emptyText={copy.weight.empty} />}<ActionButton label={`＋ ${copy.weight.title}`} onPress={() => onNavigate('weight')} tone="secondary" /></View></View>
}

const styles = StyleSheet.create({ screen: { gap: spacing.lg }, weight: { borderRadius: radii.card, borderWidth: 1, gap: spacing.sm, padding: spacing.md } })
