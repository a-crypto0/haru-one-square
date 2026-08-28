import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { copy } from '../../../content/ko/copy'
import type { ScheduledTask } from '../../../service/contracts'
import { useFrontendTheme } from '../../theme/ThemeContext'
import { bodyType, radii, spacing, touchSize } from '../../theme/tokens'
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
  const touchTarget = mode === 'easy' ? 56 : touchSize

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
      <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {pendingOrder.map((item, index) => {
          const softColor = item.task.color_token === 'lavender'
            ? colors.secondarySoft
            : item.task.color_token === 'sky'
              ? colors.infoSoft
              : item.task.color_token === 'butter'
                ? colors.warningSoft
                : colors.primarySoft
          const rowActions = [
            { label: copy.task.moveUp, text: '↑', disabled: index === 0, onPress: () => void move(index, -1) },
            { label: copy.task.moveDown, text: '↓', disabled: index === pendingOrder.length - 1, onPress: () => void move(index, 1) },
            { label: `${item.task.title} ${copy.common.edit}`, text: copy.common.edit, disabled: false, onPress: () => onEdit(item.task.id) },
          ]
          return (
            <View key={item.task.id} style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: index === pendingOrder.length - 1 ? 0 : 1 }]}>
              <View style={[styles.iconBubble, { backgroundColor: softColor, height: touchTarget, width: touchTarget }]}><Text style={styles.icon}>{item.task.icon}</Text></View>
              <View style={styles.summary}>
                <Text numberOfLines={2} style={[bodyType(mode), styles.title, { color: colors.text }]}>{item.task.title}</Text>
                <Text numberOfLines={2} style={[styles.detail, { color: colors.textMuted }]}>{item.task.scheduled_time ?? copy.schedule.empty} · {repeatSummary(item.recurrence?.weekdays ?? [])}</Text>
                {item.creatorRole === 'supporter' ? <Text numberOfLines={2} style={[styles.supporter, { color: colors.secondary }]}>{copy.task.supporterAdded}</Text> : null}
              </View>
              <View style={styles.rowActions}>
                {rowActions.map((action) => (
                  <Pressable
                    accessibilityLabel={action.label}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: action.disabled }}
                    disabled={action.disabled}
                    key={action.label}
                    onPress={action.onPress}
                    style={({ pressed }) => [
                      styles.compactButton,
                      {
                        backgroundColor: action.disabled ? colors.surfaceSoft : colors.surface,
                        borderColor: colors.border,
                        height: touchTarget,
                        opacity: action.disabled ? 0.45 : pressed ? 0.72 : 1,
                        width: touchTarget,
                      },
                    ]}
                  >
                    <Text style={[styles.compactButtonText, { color: colors.text }]}>{action.text}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )
        })}
      </View>
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
  compactButton: { alignItems: 'center', borderRadius: radii.small, borderWidth: 1, justifyContent: 'center' },
  compactButtonText: { fontSize: 13, fontWeight: '700', lineHeight: 18, textAlign: 'center' },
  detail: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  icon: { fontSize: 24, lineHeight: 30 },
  iconBubble: { alignItems: 'center', borderRadius: radii.small, flexShrink: 0, justifyContent: 'center' },
  list: { gap: spacing.md },
  panel: { borderRadius: radii.card, borderWidth: 1, overflow: 'hidden' },
  row: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, padding: spacing.sm },
  rowActions: { flexDirection: 'row', gap: spacing.xs },
  summary: { flex: 1, gap: 2, minWidth: 0 },
  supporter: { fontSize: 12, fontWeight: '600', lineHeight: 17 },
  title: { fontWeight: '700' },
})
