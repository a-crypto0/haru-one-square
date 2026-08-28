import { StyleSheet, Text, View, useWindowDimensions } from 'react-native'

import { copy } from '../../../content/ko/copy'
import type { ScheduledTask } from '../../../service/contracts'
import type { RecordPeriod } from '../../hooks/useHabitRecords'
import { useFrontendTheme } from '../../theme/ThemeContext'
import { bodyType, layout, radii, spacing } from '../../theme/tokens'
import type { RecordRange, TaskLog, TaskLogStatus, UiState } from '../../types'
import { shiftDate } from '../../utils/date'
import { ActionButton, StateMessage } from '../common/ui'

interface PeriodHabitGridProps {
  period: RecordPeriod
  visibleRange: RecordRange
  tasks: ScheduledTask[]
  records: TaskLog[]
  onPeriodChange: (period: RecordPeriod) => void
  onRangeChange: (direction: -1 | 1) => void
  state?: UiState
}

const statusCopy: Record<TaskLogStatus, string> = {
  completed: copy.records.completeStatus,
  missing: copy.records.missingStatus,
  not_scheduled: copy.records.notScheduledStatus,
  delayed: copy.records.missingStatus,
  help_requested: copy.records.missingStatus,
}

const statusSymbol: Record<TaskLogStatus, string> = {
  completed: '✓', missing: '○', not_scheduled: '—', delayed: '○', help_requested: '○',
}

function rangeLabel(period: RecordPeriod, visibleRange: RecordRange) {
  if (period === 'monthly') {
    const [year = 0, month = 1] = visibleRange.start.split('-').map(Number)
    return copy.records.monthLabel(year, month)
  }
  const representativeDate = shiftDate(visibleRange.start, 3)
  const [year = 0, month = 1, day = 1] = representativeDate.split('-').map(Number)
  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const mondayStartIndex = (firstWeekday + 6) % 7
  const week = Math.floor((day + mondayStartIndex - 1) / 7) + 1
  return copy.records.weekLabel(year, month, week)
}

export function PeriodHabitGrid({ period, visibleRange, tasks, records, onPeriodChange, onRangeChange, state = 'success' }: PeriodHabitGridProps) {
  const { colors, mode } = useFrontendTheme()
  const { width } = useWindowDimensions()
  const navigationButtonSize = mode === 'easy' ? 56 : 48
  const effectiveState = tasks.length === 0 && state === 'success' ? 'empty' : state
  if (effectiveState !== 'success') return <StateMessage state={effectiveState} loadingText={copy.records.loading} errorText={copy.records.error} emptyText={copy.records.empty} />

  const dayCount = Math.round((new Date(`${visibleRange.end}T00:00:00`).getTime() - new Date(`${visibleRange.start}T00:00:00`).getTime()) / 86400000) + 1
  const dates = Array.from({ length: dayCount }, (_, index) => shiftDate(visibleRange.start, index))
  const weeklyColumns = Array.from({ length: 7 }, (_, index) => ({
    date: shiftDate(visibleRange.start, index),
    weekday: copy.schedule.weekdays[index] ?? '',
  }))
  const recordByTaskDate = new Map(records.map((record) => [`${record.task_id}:${record.occurrence_date}`, record]))

  function cellStatus(item: ScheduledTask, date: string): TaskLogStatus {
    const record = recordByTaskDate.get(`${item.task.id}:${date}`)
    if (record) return record.status
    const recurrence = item.recurrence
    if (!recurrence || date < recurrence.starts_on || (recurrence.ends_on && date > recurrence.ends_on)) return 'not_scheduled'
    const weekday = new Date(`${date}T12:00:00`).getDay()
    return recurrence.weekdays.includes(weekday) ? 'missing' : 'not_scheduled'
  }

  function taskPalette(item: ScheduledTask) {
    if (item.task.color_token === 'lavender') return { accent: colors.secondary, soft: colors.secondarySoft }
    if (item.task.color_token === 'sky') return { accent: colors.info, soft: colors.infoSoft }
    if (item.task.color_token === 'butter') return { accent: colors.warning, soft: colors.warningSoft }
    return { accent: colors.primary, soft: colors.primarySoft }
  }

  return (
    <View style={styles.wrapper}>
      <View style={[styles.segment, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
        <View style={styles.segmentItem}><ActionButton label={copy.records.weekly} onPress={() => onPeriodChange('weekly')} selected={period === 'weekly'} /></View>
        <View style={styles.segmentItem}><ActionButton label={copy.records.monthly} onPress={() => onPeriodChange('monthly')} selected={period === 'monthly'} /></View>
      </View>
      <View style={styles.rangeControls}>
        <View style={{ width: navigationButtonSize }}><ActionButton label={period === 'weekly' ? copy.records.previousWeek : copy.records.previousMonth} onPress={() => onRangeChange(-1)}>{'‹'}</ActionButton></View>
        <Text style={[bodyType(mode), styles.rangeLabel, { color: colors.text }]}>{rangeLabel(period, visibleRange)}</Text>
        <View style={{ width: navigationButtonSize }}><ActionButton label={period === 'weekly' ? copy.records.nextWeek : copy.records.nextMonth} onPress={() => onRangeChange(1)}>{'›'}</ActionButton></View>
      </View>

      {period === 'weekly' ? (
        <View style={[styles.weekGrid, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.weekRow, styles.weekHeader, { backgroundColor: colors.surfaceSoft }]}>
            <Text numberOfLines={1} style={[styles.weekTaskName, styles.headerText, { color: colors.textMuted }]}>{copy.records.task}</Text>
            <View style={styles.weekCells}>
              {weeklyColumns.map(({ date, weekday }) => (
                <Text key={date} style={[styles.weekCellText, styles.headerText, { color: colors.textMuted }]}>{weekday}</Text>
              ))}
            </View>
          </View>
          {tasks.map((item) => {
            const palette = taskPalette(item)
            return (
              <View key={item.task.id} style={[styles.weekRow, { borderColor: colors.border, minHeight: mode === 'easy' ? 56 : 48 }]}>
                <Text numberOfLines={1} style={[bodyType(mode), styles.weekTaskName, { color: colors.text }]}>{item.task.icon} {item.task.title}</Text>
                <View style={styles.weekCells}>
                  {weeklyColumns.map(({ date, weekday }) => {
                    const status = cellStatus(item, date)
                    return (
                      <View
                        accessible
                        accessibilityLabel={copy.records.weeklyCellLabel(item.task.title, weekday, statusCopy[status])}
                        key={date}
                        style={[styles.weekCell, { backgroundColor: status === 'completed' ? palette.soft : status === 'not_scheduled' ? colors.surfaceSoft : colors.surface, borderColor: colors.border }]}
                      >
                        <Text style={[styles.symbol, { color: status === 'completed' ? palette.accent : colors.textMuted }]}>{statusSymbol[status]}</Text>
                      </View>
                    )
                  })}
                </View>
              </View>
            )
          })}
        </View>
      ) : (
        <View style={styles.monthCards}>
          {tasks.map((item) => {
            const palette = taskPalette(item)
            const firstWeekday = new Date(`${visibleRange.start}T12:00:00`).getDay()
            const leadingBlankCount = (firstWeekday + 6) % 7
            const completedCount = dates.filter((date) => cellStatus(item, date) === 'completed').length
            return (
              <View key={item.task.id} style={[styles.monthCard, width >= layout.tabletBreakpoint ? styles.monthCardWide : undefined, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.monthCardHeader, { backgroundColor: palette.soft }]}>
                  <Text numberOfLines={1} style={[bodyType(mode), styles.monthTaskTitle, { color: colors.text }]}>{item.task.icon} {item.task.title}</Text>
                  <Text style={[styles.countText, { color: palette.accent }]}>{copy.records.completedCount(completedCount)}</Text>
                </View>
                <View style={styles.monthWeekdays}>
                  {copy.schedule.weekdays.map((weekday) => <Text key={weekday} style={[styles.monthWeekday, { color: colors.textMuted }]}>{weekday}</Text>)}
                </View>
                <View style={styles.monthDays}>
                  {Array.from({ length: leadingBlankCount }, (_, index) => <View accessible={false} key={`blank-${index}`} style={styles.monthCellFrame} />)}
                  {dates.map((date) => {
                    const status = cellStatus(item, date)
                    const day = Number(date.slice(8))
                    const [year = 0, month = 1] = date.split('-').map(Number)
                    const weekdayIndex = (new Date(`${date}T12:00:00`).getDay() + 6) % 7
                    const weekday = copy.schedule.weekdays[weekdayIndex] ?? ''
                    return (
                      <View key={date} style={styles.monthCellFrame}>
                        <View
                          accessible
                          accessibilityLabel={copy.records.monthlyCellLabel(item.task.title, year, month, day, weekday, statusCopy[status])}
                          style={[styles.monthCell, { backgroundColor: status === 'completed' ? palette.soft : status === 'not_scheduled' ? colors.surfaceSoft : colors.surface, borderColor: colors.border, minHeight: mode === 'easy' ? 48 : 42 }]}
                        >
                          <Text style={[styles.dateNumber, { color: colors.textMuted }]}>{day}</Text>
                          <Text style={[styles.symbol, { color: status === 'completed' ? palette.accent : colors.textMuted }]}>{statusSymbol[status]}</Text>
                        </View>
                      </View>
                    )
                  })}
                </View>
              </View>
            )
          })}
        </View>
      )}
      <Text style={[bodyType(mode), { color: colors.text }]}>{copy.records.complete}　{copy.records.missing}　{copy.records.notScheduled}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  countText: { fontSize: 14, fontWeight: '700' },
  dateNumber: { fontSize: 11, fontWeight: '600', lineHeight: 14 },
  headerText: { fontSize: 13, fontWeight: '700' },
  monthCard: { borderRadius: radii.input, borderWidth: 1, overflow: 'hidden', width: '100%' },
  monthCardHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between', minHeight: 52, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  monthCardWide: { width: '48%' },
  monthCards: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  monthCell: { alignItems: 'center', borderRadius: radii.small, borderWidth: 1, flex: 1, justifyContent: 'center' },
  monthCellFrame: { padding: 2, width: '14.285714%' },
  monthDays: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.xs },
  monthTaskTitle: { flex: 1 },
  monthWeekday: { fontSize: 12, fontWeight: '700', textAlign: 'center', width: '14.285714%' },
  monthWeekdays: { flexDirection: 'row', paddingHorizontal: spacing.xs, paddingTop: spacing.sm },
  rangeControls: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs, justifyContent: 'space-between' },
  rangeLabel: { flex: 1, fontWeight: '700', textAlign: 'center' },
  segment: { borderRadius: radii.input, borderWidth: 1, flexDirection: 'row', gap: spacing.xs, padding: spacing.xs },
  segmentItem: { flex: 1 },
  symbol: { fontSize: 17, fontWeight: '800', lineHeight: 22 },
  weekCell: { alignItems: 'center', alignSelf: 'stretch', borderLeftWidth: 1, flex: 1, justifyContent: 'center', minWidth: 0 },
  weekCellText: { flex: 1, minWidth: 0, textAlign: 'center' },
  weekCells: { alignSelf: 'stretch', flex: 1, flexDirection: 'row' },
  weekGrid: { borderRadius: radii.input, borderWidth: 1, overflow: 'hidden' },
  weekHeader: { borderTopWidth: 0, minHeight: 42 },
  weekRow: { alignItems: 'center', borderTopWidth: 1, flexDirection: 'row' },
  weekTaskName: { paddingHorizontal: spacing.sm, width: 132 },
  wrapper: { gap: spacing.md },
})
