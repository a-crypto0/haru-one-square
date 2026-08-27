import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'

import { copy } from '../../../content/ko/copy'
import type { ScheduledTask } from '../../../service/contracts'
import type { RecordPeriod } from '../../hooks/useHabitRecords'
import { useFrontendTheme } from '../../theme/ThemeContext'
import { bodyType, layout, radii, spacing, touchSize } from '../../theme/tokens'
import type { RecordRange, TaskLog, TaskLogStatus, UiState } from '../../types'
import { shiftDate } from '../../utils/date'
import { ActionButton, StateMessage } from '../common/ui'

interface PeriodHabitGridProps {
  period: RecordPeriod
  visibleRange: RecordRange
  tasks: ScheduledTask[]
  records: TaskLog[]
  selectedTaskId?: string
  onPeriodChange: (period: RecordPeriod) => void
  onRangeChange: (direction: -1 | 1) => void
  onTaskSelect: (taskId: string) => void
  state?: UiState
}

const statusCopy: Record<TaskLogStatus, string> = {
  completed: copy.records.complete, missing: copy.records.missing, not_scheduled: copy.records.notScheduled,
  delayed: copy.records.missing, help_requested: copy.records.missing,
}

export function PeriodHabitGrid({ period, visibleRange, tasks, records, selectedTaskId, onPeriodChange, onRangeChange, onTaskSelect, state = 'success' }: PeriodHabitGridProps) {
  const { colors, mode } = useFrontendTheme()
  const { width } = useWindowDimensions()
  const effectiveState = tasks.length === 0 && state === 'success' ? 'empty' : state
  if (effectiveState !== 'success') return <StateMessage state={effectiveState} loadingText={copy.records.loading} errorText={copy.records.error} emptyText={copy.records.empty} />
  const dayCount = Math.round((new Date(`${visibleRange.end}T00:00:00`).getTime() - new Date(`${visibleRange.start}T00:00:00`).getTime()) / 86400000) + 1
  const dates = Array.from({ length: dayCount }, (_, index) => shiftDate(visibleRange.start, index))
  const visibleTasks = width < layout.tabletBreakpoint && mode === 'easy' ? tasks.filter((item) => item.task.id === (selectedTaskId ?? tasks[0]?.task.id)) : tasks
  function cellStatus(item: ScheduledTask, date: string): TaskLogStatus {
    const record = records.find((entry) => entry.task_id === item.task.id && entry.occurrence_date === date)
    if (record) return record.status
    const recurrence = item.recurrence
    if (!recurrence || date < recurrence.starts_on || (recurrence.ends_on && date > recurrence.ends_on)) return 'not_scheduled'
    const weekday = new Date(`${date}T12:00:00`).getDay()
    return recurrence.weekdays.includes(weekday) ? 'missing' : 'not_scheduled'
  }
  return (
    <View style={styles.wrapper}>
      <View style={styles.controls}>
        <ActionButton label={copy.records.weekly} onPress={() => onPeriodChange('weekly')} selected={period === 'weekly'} />
        <ActionButton label={copy.records.monthly} onPress={() => onPeriodChange('monthly')} selected={period === 'monthly'} />
      </View>
      <View style={styles.controls}>
        <ActionButton label={period === 'weekly' ? copy.records.previousWeek : copy.records.previousMonth} onPress={() => onRangeChange(-1)} />
        <Text style={[bodyType(mode), { color: colors.text }]}>{visibleRange.start} ~ {visibleRange.end}</Text>
        <ActionButton label={period === 'weekly' ? copy.records.nextWeek : copy.records.nextMonth} onPress={() => onRangeChange(1)} />
      </View>
      {width < layout.tabletBreakpoint && mode === 'easy' ? <View style={styles.controls}>{tasks.map((item) => <ActionButton key={item.task.id} label={item.task.title} onPress={() => onTaskSelect(item.task.id)} selected={item.task.id === (selectedTaskId ?? tasks[0]?.task.id)} />)}</View> : null}
      <ScrollView horizontal>
        <View style={[styles.grid, { borderColor: colors.border }]}>
          <View style={styles.gridRow}><View style={[styles.taskName, { backgroundColor: colors.surfaceSoft }]} /><View style={styles.cells}>{dates.map((date) => <Text key={date} style={[styles.cellText, { color: colors.textMuted }]}>{date.slice(5)}</Text>)}</View></View>
          {visibleTasks.map((item) => <View key={item.task.id} style={[styles.gridRow, { borderColor: colors.border }]}><Text style={[bodyType(mode), styles.taskName, { color: colors.text }]}>{item.task.title}</Text><View style={styles.cells}>{dates.map((date) => { const status = cellStatus(item, date); return <View accessible accessibilityLabel={`${date} ${statusCopy[status]}`} key={date} style={[styles.cell, { backgroundColor: status === 'completed' ? colors.successSoft : status === 'not_scheduled' ? colors.surfaceSoft : colors.surface }]}><Text style={[bodyType(mode), { color: status === 'completed' ? colors.success : colors.textMuted }]}>{statusCopy[status].slice(0, 1)}</Text></View> })}</View></View>)}
        </View>
      </ScrollView>
      <Text style={[bodyType(mode), { color: colors.text }]}>{copy.records.complete}　{copy.records.missing}　{copy.records.notScheduled}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  cell: { alignItems: 'center', justifyContent: 'center', minHeight: touchSize, width: 56 },
  cells: { flexDirection: 'row' },
  cellText: { textAlign: 'center', width: 56 },
  controls: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  grid: { borderRadius: radii.input, borderWidth: 1, overflow: 'hidden' },
  gridRow: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row' },
  taskName: { minWidth: 120, padding: spacing.sm },
  wrapper: { gap: spacing.md },
})
