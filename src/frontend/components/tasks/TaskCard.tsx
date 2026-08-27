import { StyleSheet, Text, View } from 'react-native'

import { copy } from '../../../content/ko/copy'
import { useFrontendTheme } from '../../theme/ThemeContext'
import { bodyType, radii, spacing, typography } from '../../theme/tokens'
import type { Task, TaskLogStatus, UiState } from '../../types'
import { ActionButton, StateMessage } from '../common/ui'
import { CompletionControl } from './CompletionControl'

interface TaskCardProps {
  task?: Task
  status?: TaskLogStatus
  creatorLabel?: string
  onEdit: () => void
  onComplete: () => Promise<void> | void
  onDelay?: () => Promise<void> | void
  onHelp?: () => Promise<void> | void
  onUndo: () => Promise<void> | void
  state?: UiState
}

export function TaskCard({ task, status = 'missing', creatorLabel, onEdit, onComplete, onDelay, onHelp, onUndo, state = 'success' }: TaskCardProps) {
  const { colors, mode } = useFrontendTheme()
  const effectiveState = !task && state === 'success' ? 'empty' : state
  if (effectiveState !== 'success' || !task) {
    return <StateMessage state={effectiveState} loadingText={copy.task.loading} errorText={copy.task.itemError} emptyText={copy.task.itemEmpty} />
  }
  const colorMap = {
    sage: colors.primarySoft,
    lavender: colors.secondarySoft,
    sky: colors.infoSoft,
    butter: colors.warningSoft,
  }
  return (
    <View
      accessibilityLabel={`${task.title}, ${task.scheduled_time ?? copy.schedule.empty}`}
      style={[styles.card, { backgroundColor: status === 'completed' ? colors.successSoft : colorMap[task.color_token], borderColor: colors.border, shadowColor: colors.text }]}
    >
      <View style={styles.topRow}>
        <View style={styles.identity}>
          <Text style={[styles.icon, { color: colors.text }]}>{task.icon}</Text>
          <View style={styles.textBlock}>
            <Text style={[typography.section, { color: colors.text }]}>{task.title}</Text>
            <Text style={[bodyType(mode), { color: colors.textMuted }]}>{task.scheduled_time ?? copy.schedule.empty}</Text>
          </View>
        </View>
        <ActionButton label={copy.common.edit} onPress={onEdit} />
      </View>
      {creatorLabel ? <Text style={[bodyType(mode), { color: colors.secondary }]}>{creatorLabel}</Text> : null}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <CompletionControl kind={task.kind} onComplete={onComplete} onDelay={onDelay} onHelp={onHelp} onUndo={onUndo} status={status} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.card, borderWidth: 1, elevation: 2, gap: spacing.md, padding: spacing.md, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  divider: { height: 1 },
  icon: { fontSize: 28, lineHeight: 36 },
  identity: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: spacing.md },
  textBlock: { flex: 1 },
  topRow: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between' },
})

