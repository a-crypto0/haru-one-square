import { useCallback, useState } from 'react'
import { View } from 'react-native'

import { copy } from '../../content/ko/copy'
import type { ScheduledTask, TaskCreateInput, TaskUpdatePatch } from '../../service/contracts'
import { StateMessage } from '../components/common/ui'
import { UndoBanner } from '../components/feedback/UndoBanner'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { TaskEditorForm } from '../components/tasks/TaskEditorForm'
import { useMedicationTask } from '../hooks/useMedicationTask'
import { useTasks } from '../hooks/useTasks'
import type { DisplayMode, TaskDraft } from '../types'
import { toLocalDate } from '../utils/date'

interface TaskEditorScreenProps { taskId?: string; mode: DisplayMode; speech: boolean; onBack: () => void }

function sameDays(left: readonly number[], right: readonly number[]) {
  return left.length === right.length && left.every((day) => right.includes(day))
}

function futurePatch(initial: ScheduledTask, draft: TaskDraft): TaskUpdatePatch {
  const patch: TaskUpdatePatch = {}
  if (draft.title.trim() !== initial.task.title) patch.title = draft.title.trim()
  if (draft.icon !== initial.task.icon) patch.icon = draft.icon
  if (draft.colorToken !== initial.task.color_token) patch.colorToken = draft.colorToken
  if (draft.scheduledTime !== initial.task.scheduled_time) patch.scheduledTime = draft.scheduledTime
  if (!sameDays(draft.repeatDays, initial.recurrence?.weekdays ?? [])) patch.weekdays = draft.repeatDays
  if (draft.reminderEnabled !== initial.task.reminder_enabled) patch.reminderEnabled = draft.reminderEnabled
  return patch
}

function permanentPatch(initial: ScheduledTask, draft: TaskDraft): TaskUpdatePatch {
  const patch: TaskUpdatePatch = {}
  if (draft.title.trim() !== initial.task.title) patch.title = draft.title.trim()
  if (draft.icon !== initial.task.icon) patch.icon = draft.icon
  if (draft.colorToken !== initial.task.color_token) patch.colorToken = draft.colorToken
  if (draft.reminderEnabled !== initial.task.reminder_enabled) patch.reminderEnabled = draft.reminderEnabled
  return patch
}

export function TaskEditorScreen({ taskId, mode, speech, onBack }: TaskEditorScreenProps) {
  const { tasks, loading, error, add, update, remove, restore } = useTasks()
  const initial = tasks.find((item) => item.task.id === taskId)
  const medication = useMedicationTask(taskId)
  const [deleted, setDeleted] = useState(false)
  const dismissDeleted = useCallback(() => { setDeleted(false); onBack() }, [onBack])
  async function save(draft: TaskDraft) {
    let saved: ScheduledTask
    if (!draft.id || !initial) {
      const input: TaskCreateInput = { title: draft.title.trim(), icon: draft.icon, colorToken: draft.colorToken, scheduledTime: draft.scheduledTime, weekdays: draft.repeatDays, reminderEnabled: draft.reminderEnabled, kind: draft.kind }
      saved = await add(input)
    } else if (draft.saveScope === 'today') {
      const localDate = toLocalDate()
      const weekday = new Date(`${localDate}T12:00:00`).getDay()
      saved = await update(draft.id, { scheduledTime: draft.scheduledTime, isHidden: !draft.repeatDays.includes(weekday) }, { kind: 'today', localDate })
      const metadata = permanentPatch(initial, draft)
      if (Object.keys(metadata).length > 0) saved = await update(draft.id, metadata, { kind: 'future' })
    } else {
      const patch = futurePatch(initial, draft)
      saved = Object.keys(patch).length > 0 ? await update(draft.id, patch, { kind: 'future' }) : initial
    }
    if (saved.task.kind === 'medication') {
      const name = (draft.medicationName || draft.title).trim()
      const initialName = medication.detail?.display_name ?? ''
      const initialPhoto = medication.photo ?? undefined
      const photoChanged = draft.medicationPhotoUri !== initialPhoto
      if (!initial || !medication.detail || name !== initialName || photoChanged) {
        await medication.save(name, !initial || photoChanged ? draft.medicationPhotoUri ?? null : undefined, draft.safetyConfirmed, saved.task.id)
      }
    }
    onBack()
  }
  async function deleteTask(id: string) { await remove(id); setDeleted(true) }
  const isExistingMedication = initial?.task.kind === 'medication'
  const state = loading ? 'loading' : error ? 'error' : taskId && !initial ? 'empty' : isExistingMedication && medication.loading ? 'loading' : isExistingMedication && medication.error ? 'error' : 'success'
  const title = taskId ? copy.task.editorEditTitle : copy.task.editorNewTitle
  return <View><ScreenHeader onBack={onBack} readAloudEnabled={speech} readText={title} title={title} />{state !== 'success' ? <StateMessage state={state} loadingText={copy.task.prepare} errorText={error ?? medication.error ?? copy.task.editorError} emptyText={copy.task.editorEmpty} /> : <TaskEditorForm initialTask={initial} medicationName={medication.detail?.display_name} medicationPhotoUri={medication.photo ?? undefined} mode={mode} onCancel={onBack} onDelete={deleteTask} onSave={save} />}{deleted ? <UndoBanner message={copy.task.deleted} onDismiss={dismissDeleted} onUndo={async () => { await restore(); setDeleted(false) }} /> : null}</View>
}
