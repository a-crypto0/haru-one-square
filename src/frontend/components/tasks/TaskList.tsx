import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { copy } from '../../../content/ko/copy'
import type { ScheduledTask } from '../../../service/contracts'
import { useFrontendTheme } from '../../theme/ThemeContext'
import { bodyType, radii, spacing } from '../../theme/tokens'
import type { TaskLogStatus, UiState } from '../../types'
import { ActionButton, StateMessage } from '../common/ui'

interface TaskListProps {
  tasks: ScheduledTask[]
  statusById?: Readonly<Record<string, TaskLogStatus>>
  onReorder: (ids: string[]) => Promise<void> | void
  onAdd: () => void
  onEdit: (id: string) => void
  state?: UiState
}

export function TaskList({ tasks, onReorder, onAdd, onEdit, state = 'success' }: TaskListProps) {
  const { colors, mode } = useFrontendTheme()
  const [pendingOrder, setPendingOrder] = useState(tasks)
  const [reorderError, setReorderError] = useState(false)
  useEffect(() => { setPendingOrder(tasks); setReorderError(false) }, [tasks])
  const effectiveState = pendingOrder.length === 0 && state === 'success' ? 'empty' : state

  async function move(index: number, offset: -1 | 1) {
    const target = index + offset
    if (target < 0 || target >= pendingOrder.length) return
    const next = [...pendingOrder]
    const currentItem = next[index]
    const targetItem = next[target]
    if (!currentItem || !targetItem) return
    next[index] = targetItem
    next[target] = currentItem
    setPendingOrder(next)
    setReorderError(false)
    try { await onReorder(next.map((item) => item.task.id)) }
    catch { setPendingOrder(pendingOrder); setReorderError(true) }
  }

  if (effectiveState !== 'success') {
    return (
      <View style={styles.list}>
        <StateMessage state={effectiveState} loadingText={copy.task.loading} errorText={copy.task.error} emptyText={copy.task.empty} />
        {effectiveState === 'empty' ? <ActionButton label={`＋ ${copy.today.add}`} onPress={onAdd} tone="primary" /> : null}
      </View>
    )
  }
  return (
    <View style={styles.list}>
      {reorderError ? <StateMessage state="error" errorText={copy.task.reorderError} /> : null}
      {pendingOrder.map((item, index) => (
        <View key={item.task.id} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.orderButtons}>
            <ActionButton disabled={index === 0} label={`↑ ${copy.task.moveUp}`} onPress={() => void move(index, -1)} />
            <ActionButton disabled={index === pendingOrder.length - 1} label={`↓ ${copy.task.moveDown}`} onPress={() => void move(index, 1)} />
          </View>
          <View style={styles.summary}>
            <Text style={[bodyType(mode), { color: colors.text }]}>{item.task.icon} {item.task.title}</Text>
            <Text style={[bodyType(mode), { color: colors.textMuted }]}>{item.task.scheduled_time ?? copy.schedule.empty}</Text>
            <Text style={[bodyType(mode), { color: colors.textMuted }]}>{repeatSummary(item.recurrence?.weekdays ?? [])}</Text>
            {item.creatorRole === 'supporter' ? <Text style={[bodyType(mode), { color: colors.secondary }]}>{copy.task.supporterAdded}</Text> : null}
          </View>
          <ActionButton label={copy.common.edit} onPress={() => onEdit(item.task.id)} tone="secondary" />
        </View>
      ))}
      <ActionButton label={`＋ ${copy.today.add}`} onPress={onAdd} tone="primary" />
    </View>
  )
}

const weekdayOptions = [
  { label: copy.schedule.weekdays[0], value: 1 }, { label: copy.schedule.weekdays[1], value: 2 },
  { label: copy.schedule.weekdays[2], value: 3 }, { label: copy.schedule.weekdays[3], value: 4 },
  { label: copy.schedule.weekdays[4], value: 5 }, { label: copy.schedule.weekdays[5], value: 6 },
  { label: copy.schedule.weekdays[6], value: 0 },
] as const

function repeatSummary(days: readonly number[]) {
  if (days.length === 7) return copy.task.everyDay
  const labels = weekdayOptions.filter(({ value }) => days.includes(value)).map(({ label }) => label)
  return labels.length > 0 ? copy.task.repeatSummary(labels) : copy.task.noRepeat
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  orderButtons: { gap: spacing.sm },
  row: { alignItems: 'center', borderRadius: radii.card, borderWidth: 1, flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  summary: { flex: 1 },
})
