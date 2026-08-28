import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { copy } from '../../../content/ko/copy'
import { useFrontendTheme } from '../../theme/ThemeContext'
import { bodyType, radii, spacing, touchSize } from '../../theme/tokens'
import type { Task, TaskLogStatus, UiState } from '../../types'
import { ActionButton, StateMessage } from '../common/ui'
import { CompletionControl } from './CompletionControl'

interface TaskCardProps {
  task?: Task
  status?: TaskLogStatus
  creatorLabel?: string
  isLast?: boolean
  onEdit: () => void
  onComplete: () => Promise<void> | void
  onDelay?: () => Promise<void> | void
  onHelp?: () => Promise<void> | void
  onUndo: () => Promise<void> | void
  state?: UiState
}

export function TaskCard({ task, status = 'missing', creatorLabel, isLast = false, onEdit, onComplete, onDelay, onHelp, onUndo, state = 'success' }: TaskCardProps) {
  const { colors, mode } = useFrontendTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [failed, setFailed] = useState(false)
  const effectiveState = !task && state === 'success' ? 'empty' : state
  if (effectiveState !== 'success' || !task) {
    return <StateMessage state={effectiveState} loadingText={copy.task.loading} errorText={copy.task.itemError} emptyText={copy.task.itemEmpty} />
  }

  async function submit(action?: () => Promise<void> | void) {
    if (!action) return
    setIsSubmitting(true)
    setFailed(false)
    try { await action() }
    catch { setFailed(true) }
    finally { setIsSubmitting(false) }
  }

  const colorMap = {
    sage: colors.primarySoft,
    lavender: colors.secondarySoft,
    sky: colors.infoSoft,
    butter: colors.warningSoft,
  }
  const touchTarget = mode === 'easy' ? 56 : touchSize
  const recorded = status === 'completed' || status === 'delayed' || status === 'help_requested'
  const recordedLabel = status === 'completed'
    ? copy.today.recorded
    : status === 'delayed'
      ? copy.task.delayedRecorded
      : copy.task.helpRecorded
  const recordedBackground = status === 'completed'
    ? colors.successSoft
    : status === 'delayed'
      ? colors.infoSoft
      : colors.warningSoft
  const recordedForeground = status === 'completed'
    ? colors.success
    : status === 'delayed'
      ? colors.info
      : colors.warning

  return (
    <View
      accessibilityLabel={`${task.title}, ${task.scheduled_time ?? copy.schedule.empty}`}
      style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: isLast ? 0 : 1 }]}
    >
      <View style={styles.mainRow}>
        <Text style={[styles.time, { color: colors.textMuted }]}>{task.scheduled_time ?? '—'}</Text>
        <View style={styles.identity}>
          <View style={[styles.iconBubble, { backgroundColor: colorMap[task.color_token], height: touchTarget, width: touchTarget }]}>
            <Text style={styles.icon}>{task.icon}</Text>
          </View>
          <View style={styles.textBlock}>
            <Text numberOfLines={2} style={[bodyType(mode), styles.title, { color: colors.text }]}>{task.title}</Text>
            {creatorLabel ? <Text numberOfLines={2} style={[styles.creatorText, { color: colors.secondary }]}>{creatorLabel}</Text> : null}
          </View>
          <Pressable
            accessibilityLabel={`${task.title} ${copy.common.edit}`}
            accessibilityRole="button"
            accessibilityState={{ disabled: isSubmitting }}
            disabled={isSubmitting}
            onPress={onEdit}
            style={({ pressed }) => [styles.edit, { backgroundColor: colors.secondarySoft, height: touchTarget, opacity: pressed ? 0.72 : 1, width: touchTarget }]}
          >
            <Text style={[styles.editText, { color: colors.secondary }]}>{copy.common.edit}</Text>
          </Pressable>
        </View>
        <CompletionControl
          busy={isSubmitting}
          completeLabel={task.kind === 'medication' ? copy.task.medicationComplete : copy.task.complete}
          label={task.title}
          onComplete={() => submit(onComplete)}
          status={status}
        />
      </View>

      {failed ? <StateMessage state="error" errorText={copy.task.saveError} /> : null}
      {task.kind === 'medication' && status === 'missing' ? (
        <View style={styles.auxiliaryRow}>
          {onDelay ? <ActionButton disabled={isSubmitting} label={copy.task.delay} onPress={() => void submit(onDelay)} /> : null}
          {onHelp ? <ActionButton disabled={isSubmitting} label={copy.task.help} onPress={() => void submit(onHelp)} /> : null}
        </View>
      ) : null}
      {recorded ? (
        <View style={[styles.recordedRow, { backgroundColor: recordedBackground }]}>
          <Text accessibilityLiveRegion="assertive" style={[bodyType(mode), styles.recordedText, { color: recordedForeground }]}>{recordedLabel}</Text>
          <ActionButton disabled={isSubmitting} label={copy.undo.action} onPress={() => void submit(onUndo)} tone="secondary" />
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  auxiliaryRow: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end', paddingLeft: 52 },
  creatorText: { fontSize: 12, fontWeight: '600', lineHeight: 17 },
  edit: { alignItems: 'center', borderRadius: radii.small, flexShrink: 0, justifyContent: 'center' },
  editText: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  icon: { fontSize: 24, lineHeight: 30 },
  iconBubble: { alignItems: 'center', borderRadius: radii.small, flexShrink: 0, justifyContent: 'center' },
  identity: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: spacing.sm, minWidth: 0 },
  mainRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  recordedRow: { alignItems: 'center', borderRadius: radii.small, flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between', marginLeft: 52, padding: spacing.sm },
  recordedText: { flex: 1, fontWeight: '700' },
  row: { gap: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  textBlock: { flex: 1, gap: 2, minWidth: 0 },
  time: { fontSize: 12, fontWeight: '700', lineHeight: 18, textAlign: 'center', width: 44 },
  title: { fontWeight: '700' },
})
