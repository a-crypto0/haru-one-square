import { useCallback, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { copy } from '../../content/ko/copy'
import type { TodayRecord } from '../../service/contracts'
import { ActionButton, StateMessage } from '../components/common/ui'
import { UndoBanner } from '../components/feedback/UndoBanner'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { TaskCard } from '../components/tasks/TaskCard'
import { useTodayChecklist } from '../hooks/useTodayChecklist'
import { useFrontendTheme } from '../theme/ThemeContext'
import { bodyType, radii, spacing, typography } from '../theme/tokens'
import type { AppRoute } from '../types'
import { formatKoreanDate, shiftDate, startOfWeek, toLocalDate } from '../utils/date'

interface TodayScreenProps {
  speech: boolean
  onNavigate: (route: AppRoute) => void
  onEditTask: (id?: string) => void
}

interface RoutineGroup {
  key: 'morning' | 'daytime' | 'evening' | 'anytime'
  label: string
  symbol: string
  items: TodayRecord[]
}

const weekdayLabels = copy.schedule.weekdays

function groupTodayItems(items: TodayRecord[]): RoutineGroup[] {
  const groups: RoutineGroup[] = [
    { key: 'morning', label: copy.today.morning, symbol: '☀', items: [] },
    { key: 'daytime', label: copy.today.daytime, symbol: '◐', items: [] },
    { key: 'evening', label: copy.today.evening, symbol: '☾', items: [] },
    { key: 'anytime', label: copy.today.anytime, symbol: '◇', items: [] },
  ]
  items.forEach((item) => {
    const time = item.task.task.scheduled_time
    if (!time) { groups[3]?.items.push(item); return }
    const hour = Number(time.slice(0, 2))
    if (hour < 12) groups[0]?.items.push(item)
    else if (hour < 18) groups[1]?.items.push(item)
    else groups[2]?.items.push(item)
  })
  return groups.filter((group) => group.items.length > 0)
}

export function TodayScreen({ speech, onNavigate, onEditTask }: TodayScreenProps) {
  const { colors, mode } = useFrontendTheme()
  const { items, loading, error, complete, delay, requestHelp, undo } = useTodayChecklist()
  const visibleItems = items.filter((item) => item.status !== 'not_scheduled')
  const today = toLocalDate()
  const weekStart = startOfWeek(today)
  const completedCount = visibleItems.filter((item) => item.status === 'completed').length
  const [undoTaskId, setUndoTaskId] = useState<string | null>(null)
  const dismissUndo = useCallback(() => setUndoTaskId(null), [])
  async function markComplete(id: string) { await complete(id); setUndoTaskId(id) }
  async function undoTask(id: string) {
    await undo(id)
    setUndoTaskId((current) => current === id ? null : current)
  }
  const state = loading ? 'loading' : error ? 'error' : visibleItems.length === 0 ? 'empty' : 'success'
  const routineGroups = groupTodayItems(visibleItems)

  return (
    <View style={styles.screen}>
      <View style={styles.intro}>
        <ScreenHeader
          readAloudEnabled={speech}
          readText={`${copy.today.subtitle} ${visibleItems.map((item) => item.task.task.title).join(', ')}`}
          title={copy.today.brand}
        />
        <Text style={[styles.date, { color: colors.textMuted }]}>{formatKoreanDate(today)}</Text>
        <Text style={[bodyType(mode), { color: colors.text }]}>{copy.today.subtitle}</Text>
      </View>

      <View style={[styles.weekCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.weekHeading}>
          <Text style={[typography.section, { color: colors.text }]}>{copy.today.week}</Text>
          <Text style={[bodyType(mode), styles.summary, { color: colors.primary }]}>{copy.today.summary(completedCount, visibleItems.length)}</Text>
        </View>
        <View accessibilityLabel={copy.today.week} style={styles.weekStrip}>
          {weekdayLabels.map((label, index) => {
            const date = shiftDate(weekStart, index)
            const selected = date === today
            return (
              <View key={date} style={styles.weekDay}>
                <Text style={[styles.weekLabel, { color: selected ? colors.primary : colors.textMuted }]}>{label}</Text>
                <View style={[styles.dateCircle, { backgroundColor: selected ? colors.primary : colors.surfaceSoft }]}>
                  <Text style={[styles.dateNumber, { color: selected ? colors.surface : colors.text }]}>{Number(date.slice(8))}</Text>
                </View>
              </View>
            )
          })}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[typography.title, { color: colors.text }]}>{copy.today.section}</Text>
        <ActionButton label={copy.today.manage} onPress={() => onNavigate('tasks')} tone="secondary" />
      </View>
      {state !== 'success' ? <StateMessage state={state} loadingText={copy.task.loading} errorText={error ?? copy.task.error} emptyText={copy.task.empty} /> : null}
      <View style={styles.groups}>
        {routineGroups.map((group) => {
          const groupCompletedCount = group.items.filter((item) => item.status === 'completed').length
          const palette = group.key === 'morning'
            ? { background: colors.warningSoft, foreground: colors.warning }
            : group.key === 'daytime'
              ? { background: colors.infoSoft, foreground: colors.info }
              : group.key === 'evening'
                ? { background: colors.secondarySoft, foreground: colors.secondary }
                : { background: colors.primarySoft, foreground: colors.primary }
          return (
            <View key={group.key} style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.groupHeader, { backgroundColor: palette.background }]}>
                <Text style={[styles.groupSymbol, { color: palette.foreground }]}>{group.symbol}</Text>
                <Text style={[typography.section, { color: colors.text }]}>{group.label}</Text>
                <Text style={[styles.groupCount, { color: palette.foreground }]}>{groupCompletedCount}/{group.items.length}</Text>
              </View>
              <View>
                {group.items.map((item, index) => (
                  <TaskCard
                    creatorLabel={item.task.creatorRole === 'supporter' ? copy.task.supporterAdded : undefined}
                    key={item.task.task.id}
                    onComplete={() => markComplete(item.task.task.id)}
                    onDelay={() => delay(item.task.task.id)}
                    onEdit={() => onEditTask(item.task.task.id)}
                    onHelp={() => requestHelp(item.task.task.id)}
                    onUndo={() => undoTask(item.task.task.id)}
                    isLast={index === group.items.length - 1}
                    status={item.status}
                    task={item.task.task}
                  />
                ))}
              </View>
            </View>
          )
        })}
      </View>
      <View style={styles.actions}>
        <ActionButton label={`＋ ${copy.today.add}`} onPress={() => onEditTask()} tone="primary" />
        <ActionButton label={copy.today.weight} onPress={() => onNavigate('weight')} tone="secondary" />
      </View>
      {undoTaskId ? <UndoBanner message={copy.today.undoRecorded} onDismiss={dismissUndo} onUndo={() => undoTask(undoTaskId)} /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  date: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  dateCircle: { alignItems: 'center', borderRadius: radii.pill, height: 36, justifyContent: 'center', width: 36 },
  dateNumber: { fontSize: 15, fontWeight: '800', lineHeight: 20 },
  group: { borderRadius: radii.card, borderWidth: 1, overflow: 'hidden' },
  groupCount: { fontSize: 14, fontWeight: '800', marginLeft: 'auto' },
  groupHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  groupSymbol: { fontSize: 19, fontWeight: '800' },
  groups: { gap: spacing.md },
  intro: { gap: spacing.xs },
  screen: { gap: spacing.md, paddingBottom: spacing.md },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  summary: { fontWeight: '700', textAlign: 'right' },
  weekCard: { borderRadius: radii.input, borderWidth: 1, gap: spacing.sm, padding: spacing.sm },
  weekDay: { alignItems: 'center', flex: 1, gap: spacing.xs },
  weekHeading: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  weekLabel: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  weekStrip: { flexDirection: 'row', justifyContent: 'space-between' },
})
