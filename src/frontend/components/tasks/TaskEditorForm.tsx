import { useMemo, useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

import { copy } from '../../../content/ko/copy'
import type { ScheduledTask } from '../../../service/contracts'
import { useFrontendTheme } from '../../theme/ThemeContext'
import { bodyType, radii, spacing, touchSize, typography } from '../../theme/tokens'
import type { DisplayMode, TaskDraft, TaskKind, UiState } from '../../types'
import { MedicationFields } from '../medication/MedicationFields'
import { ActionButton, StateMessage } from '../common/ui'
import { IconColorPicker, type IconOption } from './IconColorPicker'
import { ScheduleFieldGroup } from './ScheduleFieldGroup'

type EditField = 'identity' | 'schedule' | 'repeat' | 'reminder' | 'color'

interface TaskEditorFormProps {
  initialTask?: ScheduledTask
  medicationName?: string
  medicationPhotoUri?: string
  mode: DisplayMode
  onSave: (draft: TaskDraft) => Promise<void> | void
  onDelete: (id: string) => Promise<void> | void
  onCancel: () => void
  state?: UiState
}

const icons: IconOption[] = [
  { icon: '🪥', label: copy.picker.toothbrush }, { icon: '🚶', label: copy.picker.walking },
  { icon: '🚿', label: copy.picker.shower }, { icon: '💊', label: copy.picker.medicine },
]

function createDraft(initialTask?: ScheduledTask, medicationName = '', medicationPhotoUri?: string): TaskDraft {
  return {
    id: initialTask?.task.id,
    kind: initialTask?.task.kind ?? 'standard',
    title: initialTask?.task.title ?? '',
    icon: initialTask?.task.icon ?? '🚶',
    colorToken: initialTask?.task.color_token ?? 'sage',
    scheduledTime: initialTask?.task.scheduled_time ?? null,
    repeatDays: initialTask?.recurrence?.weekdays ?? [0, 1, 2, 3, 4, 5, 6],
    reminderEnabled: initialTask?.task.reminder_enabled ?? false,
    medicationName,
    medicationPhotoUri,
    safetyConfirmed: initialTask?.task.kind !== 'medication',
    saveScope: 'future',
  }
}

export function TaskEditorForm({ initialTask, medicationName, medicationPhotoUri, mode, onSave, onDelete, onCancel, state = 'success' }: TaskEditorFormProps) {
  const { colors } = useFrontendTheme()
  const [draft, setDraft] = useState(() => createDraft(initialTask, medicationName, medicationPhotoUri))
  const [step, setStep] = useState(0)
  const [editField, setEditField] = useState<EditField | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [isDirty, setIsDirty] = useState(!initialTask)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const easyNew = mode === 'easy' && !initialTask
  const choosingField = mode === 'easy' && Boolean(initialTask) && !editField
  const totalSteps = 5

  const show = useMemo(() => ({
    identity: mode === 'standard' || editField === 'identity' || (easyNew && step === 0),
    picker: mode === 'standard' || editField === 'identity' || editField === 'color' || (easyNew && step === 1),
    schedule: mode === 'standard' || editField === 'schedule' || editField === 'repeat' || editField === 'reminder' || (easyNew && (step === 2 || step === 3)),
    scope: Boolean(initialTask) && (mode === 'standard' || editField === 'schedule' || editField === 'repeat'),
    review: mode === 'standard' || (easyNew && step === 4) || Boolean(editField),
  }), [easyNew, editField, initialTask, mode, step])

  function patch(value: Partial<TaskDraft>) { setDraft((current) => ({ ...current, ...value })); setIsDirty(true); setErrors([]) }
  function next() {
    if (step === 0 && !draft.title.trim()) { setErrors([copy.task.required]); return }
    setStep((current) => Math.min(totalSteps - 1, current + 1))
  }
  async function save() {
    const nextErrors = !draft.title.trim() ? [copy.task.required] : []
    if (nextErrors.length > 0) { setErrors(nextErrors); return }
    setSaving(true)
    try { await onSave(draft) }
    catch { setErrors([copy.task.editorError]) }
    finally { setSaving(false) }
  }
  async function remove() {
    if (!initialTask) return
    setSaving(true)
    setErrors([])
    try { await onDelete(initialTask.task.id) }
    catch { setErrors([copy.task.deleteError]) }
    finally { setSaving(false) }
  }
  const visibleScheduleFields = mode === 'standard'
    ? undefined
    : easyNew
      ? step === 2 ? ['time'] as const : step === 3 ? ['days', 'reminder'] as const : undefined
      : editField === 'schedule' ? ['time'] as const : editField === 'repeat' ? ['days'] as const : editField === 'reminder' ? ['reminder'] as const : undefined
  if (state !== 'success' || saving) return <StateMessage state={saving ? 'loading' : state} loadingText={copy.task.prepare} errorText={copy.task.editorError} emptyText={copy.task.editorEmpty} />
  if (choosingField) {
    const labels: Record<EditField, string> = { identity: copy.task.nameAndIcon, schedule: copy.task.time, repeat: copy.task.repeat, reminder: copy.task.reminder, color: copy.task.color }
    return <View style={styles.wrapper}><Text style={[typography.section, { color: colors.text }]}>{copy.task.whatChange}</Text>{(['identity', 'schedule', 'repeat', 'reminder', 'color'] as const).map((field) => <ActionButton key={field} label={labels[field]} onPress={() => setEditField(field)} tone="secondary" />)}<ActionButton label={copy.common.cancel} onPress={onCancel} /></View>
  }
  return (
    <View style={styles.wrapper}>
      {easyNew ? <Text style={[bodyType(mode), { color: colors.textMuted }]}>{copy.task.step(step + 1, totalSteps)}</Text> : null}
      {errors.map((error) => <StateMessage key={error} state="error" errorText={error} />)}
      {show.identity ? <View style={styles.section}>
        <Text style={[typography.section, { color: colors.text }]}>{copy.task.name}</Text>
        <TextInput accessibilityLabel={copy.task.name} onChangeText={(title) => patch({ title })} style={[bodyType(mode), styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} value={draft.title} />
        {!initialTask ? <><Text style={[typography.section, { color: colors.text }]}>{copy.task.kind}</Text><View style={styles.row}><ActionButton label={copy.task.standardKind} onPress={() => patch({ kind: 'standard' as TaskKind, safetyConfirmed: true })} selected={draft.kind === 'standard'} /><ActionButton label={copy.task.medicationKind} onPress={() => patch({ kind: 'medication' as TaskKind, safetyConfirmed: false, icon: '▤' })} selected={draft.kind === 'medication'} /></View></> : null}
      </View> : null}
      {show.picker ? <IconColorPicker colorToken={draft.colorToken} icon={draft.icon} onChange={(value) => patch(value)} options={icons} /> : null}
      {show.schedule ? <ScheduleFieldGroup medication={draft.kind === 'medication'} onChange={(value) => patch({ scheduledTime: value.time, repeatDays: value.repeatDays, reminderEnabled: value.reminderEnabled })} reminderEnabled={draft.reminderEnabled} repeatDays={draft.repeatDays} time={draft.scheduledTime} visibleFields={visibleScheduleFields} /> : null}
      {draft.kind === 'medication' && show.review ? <MedicationFields displayName={draft.medicationName} isEditingExisting={Boolean(initialTask)} onConfirmSafety={(safetyConfirmed) => patch({ safetyConfirmed })} onDisplayNameChange={(value) => patch({ medicationName: value })} onPhotoChange={(medicationPhotoUri) => patch({ medicationPhotoUri })} photoUri={draft.medicationPhotoUri} safetyConfirmed={draft.safetyConfirmed} showDetails={!initialTask || editField === 'identity' || mode === 'standard'} /> : null}
      {show.scope ? <View style={styles.section}><Text style={[typography.section, { color: colors.text }]}>{copy.task.chooseScope}</Text><View style={styles.row}><ActionButton label={copy.task.todayOnly} onPress={() => patch({ saveScope: 'today' })} selected={draft.saveScope === 'today'} /><ActionButton label={copy.task.fromToday} onPress={() => patch({ saveScope: 'future' })} selected={draft.saveScope === 'future'} /></View></View> : null}
      {easyNew && step < totalSteps - 1 ? <View style={styles.row}>{step > 0 ? <ActionButton label={copy.task.previous} onPress={() => setStep((value) => value - 1)} /> : null}<ActionButton label={copy.common.next} onPress={next} tone="primary" /></View> : null}
      {show.review && (!easyNew || step === totalSteps - 1) ? <><Text style={[typography.section, { color: colors.text }]}>{copy.task.review}</Text>{draft.kind === 'medication' ? <Text style={[bodyType(mode), { color: colors.warning }]}>{copy.medication.changeSummary(draft.saveScope === 'today' ? copy.task.todayOnly : copy.task.fromToday, draft.scheduledTime ?? copy.schedule.empty)} · {copy.medication.safety}</Text> : null}<ActionButton disabled={!isDirty || (draft.kind === 'medication' && !draft.safetyConfirmed)} label={copy.common.save} onPress={() => void save()} tone="primary" /></> : null}
      <ActionButton label={copy.common.cancel} onPress={onCancel} />
      {initialTask ? <View style={[styles.deleteArea, { borderColor: colors.border }]}>{confirmDelete ? <><Text style={[bodyType(mode), { color: colors.error }]}>{copy.task.deleteQuestion(draft.title)}</Text>{draft.kind === 'medication' ? <Text style={[bodyType(mode), { color: colors.warning }]}>{copy.medication.safety}</Text> : null}<ActionButton disabled={draft.kind === 'medication' && !draft.safetyConfirmed} label={copy.common.delete} onPress={() => void remove()} tone="danger" /><ActionButton label={copy.common.cancel} onPress={() => setConfirmDelete(false)} /></> : <ActionButton label={copy.common.delete} onPress={() => setConfirmDelete(true)} tone="danger" />}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  deleteArea: { borderTopWidth: 1, gap: spacing.md, marginTop: spacing.xl, paddingTop: spacing.xl },
  input: { borderRadius: radii.input, borderWidth: 1, minHeight: touchSize, paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  section: { gap: spacing.md },
  wrapper: { gap: spacing.lg },
})
