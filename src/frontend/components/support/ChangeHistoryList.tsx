import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { copy } from '../../../content/ko/copy'
import { useFrontendTheme } from '../../theme/ThemeContext'
import { bodyType, radii, spacing } from '../../theme/tokens'
import type { HistoryEntryView, UiState } from '../../types'
import { formatKoreanDateTime } from '../../utils/date'
import { ActionButton, StateMessage } from '../common/ui'

interface ChangeHistoryListProps {
  entries: HistoryEntryView[]
  onOpenRelated: (id: string) => void
  state?: UiState
}

export function ChangeHistoryList({ entries, onOpenRelated, state = 'success' }: ChangeHistoryListProps) {
  const { colors, mode } = useFrontendTheme()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const effectiveState = entries.length === 0 && state === 'success' ? 'empty' : state
  if (effectiveState !== 'success') return <StateMessage state={effectiveState} loadingText={copy.history.loading} errorText={copy.history.error} emptyText={copy.history.empty} />
  return (
    <View style={styles.list}>
      {entries.map((entry) => <View key={entry.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[bodyType(mode), { color: colors.secondary }]}>{entry.actorLabel}</Text><Text style={[bodyType(mode), { color: colors.text }]}>{entry.sentence}</Text><Text style={[bodyType(mode), { color: colors.textMuted }]}>{formatKoreanDateTime(entry.occurredAt)}</Text><ActionButton label={expandedId === entry.id ? copy.common.done : copy.history.detail} onPress={() => setExpandedId((value) => value === entry.id ? null : entry.id)} />{expandedId === entry.id && entry.targetId ? <ActionButton label={copy.history.open} onPress={() => onOpenRelated(entry.targetId ?? '')} tone="secondary" /> : null}</View>)}
    </View>
  )
}

const styles = StyleSheet.create({ card: { borderRadius: radii.card, borderWidth: 1, gap: spacing.sm, padding: spacing.md }, list: { gap: spacing.md } })
