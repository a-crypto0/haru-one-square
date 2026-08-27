import type { WeightLog } from '../db/types'
import type { WeightService } from './contracts'
import { updateLocalState } from './localStore'
import { LOCAL_OWNER_ID } from './localSeed'
import { createId, nowIso } from './utils'

function newestFirst(left: WeightLog, right: WeightLog): number {
  return right.recorded_at.localeCompare(left.recorded_at)
}

export const weightService: WeightService = {
  async latest() {
    return updateLocalState(
      (state) => [...state.weights].sort(newestFirst)[0] ?? null,
    )
  },

  async list() {
    return updateLocalState((state) => [...state.weights].sort(newestFirst))
  },

  async save(valueKg) {
    if (!Number.isFinite(valueKg) || valueKg <= 0 || valueKg >= 500) {
      throw new Error('체중 숫자를 다시 확인해 주세요.')
    }
    return updateLocalState((state) => {
      const recordedAt = nowIso()
      const log: WeightLog = {
        id: createId(),
        owner_id: LOCAL_OWNER_ID,
        created_at: recordedAt,
        weight_kg: Math.round(valueKg * 100) / 100,
        recorded_at: recordedAt,
      }
      state.weights.push(log)
      return log
    })
  },
}
