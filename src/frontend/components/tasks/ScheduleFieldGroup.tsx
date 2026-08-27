import { StyleSheet, Text, TextInput, View } from 'react-native'

import { copy } from '../../../content/ko/copy'
import { useFrontendTheme } from '../../theme/ThemeContext'
import { bodyType, radii, spacing, touchSize, typography } from '../../theme/tokens'
import type { UiState } from '../../types'
import { ActionButton, StateMessage } from '../common/ui'

interface ScheduleValue { time: string | null; repeatDays: number[]; reminderEnabled: boolean }
type ScheduleField = 'time' | 'days' | 'reminder'
interface ScheduleFieldGroupProps extends ScheduleValue {
  medication?: boolean
  visibleFields?: readonly ScheduleField[]
  onChange: (value: ScheduleValue) => void
  state?: UiState
}

const weekdayOptions = [
  { label: copy.schedule.weekdays[0], value: 1 },
  { label: copy.schedule.weekdays[1], value: 2 },
  { label: copy.schedule.weekdays[2], value: 3 },
  { label: copy.schedule.weekdays[3], value: 4 },
  { label: copy.schedule.weekdays[4], value: 5 },
  { label: copy.schedule.weekdays[5], value: 6 },
  { label: copy.schedule.weekdays[6], value: 0 },
] as const

export function ScheduleFieldGroup({ time, repeatDays, reminderEnabled, medication = false, visibleFields, onChange, state = 'success' }: ScheduleFieldGroupProps) {
  const { colors, mode } = useFrontendTheme()
  const shows = (field: ScheduleField) => !visibleFields || visibleFields.includes(field)
  if (state !== 'success') return <StateMessage state={state} loadingText={copy.schedule.loading} errorText={copy.schedule.error} emptyText={copy.schedule.empty} />
  function toggleDay(day: number) {
    const next = repeatDays.includes(day) ? repeatDays.filter((value) => value !== day) : [...repeatDays, day].sort()
    onChange({ time, repeatDays: next, reminderEnabled })
  }
  return (
    <View style={styles.wrapper}>
      <Text style={[typography.section, { color: colors.text }]}>{copy.schedule.title}</Text>
      {shows('time') ? <><Text style={[bodyType(mode), { color: colors.text }]}>{medication ? copy.schedule.medicationTime : copy.schedule.time}</Text><TextInput accessibilityLabel={medication ? copy.schedule.medicationTime : copy.schedule.time} maxLength={5} onChangeText={(next) => onChange({ time: next || null, repeatDays, reminderEnabled })} placeholder="08:00" placeholderTextColor={colors.textMuted} style={[bodyType(mode), styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} value={time ?? ''} /></> : null}
      {shows('days') ? <><Text style={[bodyType(mode), { color: colors.text }]}>{copy.schedule.days}</Text><View style={styles.days}>{weekdayOptions.map(({ label, value }) => <ActionButton key={value} label={`${repeatDays.includes(value) ? '✓ ' : ''}${label}`} onPress={() => toggleDay(value)} selected={repeatDays.includes(value)} />)}</View></> : null}
      {shows('reminder') ? <ActionButton label={reminderEnabled ? copy.schedule.reminderOn : copy.schedule.reminderOff} onPress={() => onChange({ time, repeatDays, reminderEnabled: !reminderEnabled })} selected={reminderEnabled} /> : null}
    </View>
  )
}

const styles = StyleSheet.create({ days: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, input: { borderRadius: radii.input, borderWidth: 1, minHeight: touchSize, paddingHorizontal: spacing.md }, wrapper: { gap: spacing.md } })
