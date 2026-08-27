import { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

import { copy } from '../../../content/ko/copy'
import { useFrontendTheme } from '../../theme/ThemeContext'
import { radii, spacing, touchSize, typography } from '../../theme/tokens'
import type { UiState, WeightLog } from '../../types'
import { formatKoreanDateTime } from '../../utils/date'
import { ActionButton, StateMessage } from '../common/ui'

interface WeightEntryCardProps {
  value?: string
  previousRecord?: WeightLog | null
  onChange: (value: string) => void
  onSave: (value: number) => Promise<void> | void
  state?: UiState
}

export function WeightEntryCard({ value = '', previousRecord, onChange, onSave, state = 'success' }: WeightEntryCardProps) {
  const { colors } = useFrontendTheme()
  const [validationError, setValidationError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function change(next: string) {
    const sanitized = next.replace(/[^0-9.]/g, '')
    setValidationError(null)
    onChange(sanitized)
  }
  async function save() {
    const parsed = Number(value)
    if (!value || !Number.isFinite(parsed) || parsed <= 0) { setValidationError(copy.weight.invalid); return }
    setSaving(true)
    try { await onSave(parsed) }
    catch { setValidationError(copy.weight.error) }
    finally { setSaving(false) }
  }
  const effectiveState: UiState = saving ? 'loading' : validationError ? 'error' : !value && state === 'success' ? 'empty' : state
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {effectiveState !== 'success' ? <StateMessage state={effectiveState} loadingText={copy.weight.loading} errorText={validationError ?? copy.weight.error} emptyText={copy.weight.empty} /> : null}
      <Text style={[typography.section, { color: colors.text }]}>{copy.weight.question}</Text>
      <View style={styles.inputRow}>
        <TextInput
          accessibilityLabel={copy.weight.question}
          inputMode="decimal"
          keyboardType="decimal-pad"
          onChangeText={change}
          style={[typography.number, styles.input, { backgroundColor: colors.surfaceSoft, borderColor: colors.border, color: colors.text }]}
          value={value}
        />
        <Text style={[typography.section, { color: colors.text }]}>{copy.weight.unit}</Text>
      </View>
      {previousRecord ? <Text style={[typography.bodyStandard, { color: colors.textMuted }]}>{copy.weight.previous} {previousRecord.weight_kg}{copy.weight.unit} · {formatKoreanDateTime(previousRecord.recorded_at)}</Text> : null}
      <ActionButton disabled={!value} label={copy.common.save} onPress={() => void save()} tone="primary" />
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.card, borderWidth: 1, gap: spacing.lg, padding: spacing.lg },
  input: { borderRadius: radii.input, borderWidth: 1, flex: 1, minHeight: touchSize, paddingHorizontal: spacing.md, textAlign: 'center' },
  inputRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
})
