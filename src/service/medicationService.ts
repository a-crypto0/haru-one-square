import type {
  MedicationDetail,
  MedicationLog,
  MedicationLogStatus,
} from '../db/types'
import { addChange } from './changeHistory'
import type { MedicationService } from './contracts'
import { updateLocalState } from './localStore'
import { LOCAL_OWNER_ID } from './localSeed'
import { recordService } from './recordService'
import { createId, nowIso, safeFileName, todayLocal } from './utils'

function assertMedicationTask(
  taskId: string,
  tasks: ReadonlyArray<{ id: string; kind: string }>,
): void {
  const task = tasks.find((item) => item.id === taskId)
  if (!task) throw new Error('약 일정을 찾지 못했어요.')
  if (task.kind !== 'medication') throw new Error('약 일정에서만 사용할 수 있어요.')
}

export const medicationService: MedicationService = {
  async get(taskId) {
    return updateLocalState(
      (state) =>
        state.medicationDetails.find((item) => item.task_id === taskId) ?? null,
    )
  },

  async save(taskId, detail, safetyConfirmed) {
    if (!safetyConfirmed) {
      throw new Error('안전 안내를 확인해야 약 정보를 저장할 수 있어요.')
    }
    if (!detail.displayName.trim()) throw new Error('약 이름을 적어 주세요.')
    return updateLocalState((state) => {
      assertMedicationTask(taskId, state.tasks)
      const existing = state.medicationDetails.find((item) => item.task_id === taskId)
      const before = existing ? { ...existing } : null
      const photoPath =
        detail.photoFileName === undefined
          ? (existing?.photo_path ?? null)
          : detail.photoFileName === null
            ? null
            : `${LOCAL_OWNER_ID}/${taskId}/${safeFileName(detail.photoFileName)}`
      const saved: MedicationDetail = existing ?? {
        id: createId(),
        owner_id: LOCAL_OWNER_ID,
        created_at: nowIso(),
        task_id: taskId,
        display_name: detail.displayName.trim(),
        photo_path: photoPath,
      }
      saved.display_name = detail.displayName.trim()
      saved.photo_path = photoPath
      if (!existing) state.medicationDetails.push(saved)
      addChange(state, {
        actorRole: 'owner',
        targetType: 'medication_detail',
        targetId: saved.id,
        action: existing ? 'updated' : 'created',
        beforeValue: before,
        afterValue: saved,
        summary: `${saved.display_name} 약 알림 정보를 바꿨어요.`,
      })
      return saved
    })
  },

  async record(taskId, status) {
    await updateLocalState((state) => assertMedicationTask(taskId, state.tasks))
    const taskStatus: MedicationLogStatus = status
    const taskLog = await recordService.setStatus(taskId, todayLocal(), taskStatus)
    return updateLocalState((state) => {
      assertMedicationTask(taskId, state.tasks)
      const recordedAt = nowIso()
      const existing = state.medicationLogs.find(
        (item) => item.task_log_id === taskLog.id,
      )
      if (existing) {
        existing.status = status
        existing.recorded_at = recordedAt
        return existing
      }
      const log: MedicationLog = {
        id: createId(),
        owner_id: LOCAL_OWNER_ID,
        created_at: recordedAt,
        task_id: taskId,
        task_log_id: taskLog.id,
        status,
        recorded_at: recordedAt,
      }
      state.medicationLogs.push(log)
      return log
    })
  },

  async getPhotoAccessPath(taskId, fileName) {
    if (!taskId.trim()) throw new Error('약 일정을 찾지 못했어요.')
    return updateLocalState((state) => {
      assertMedicationTask(taskId, state.tasks)
      return `${LOCAL_OWNER_ID}/${taskId}/${safeFileName(fileName)}`
    })
  },
}
