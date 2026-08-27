import type { ChangeTargetType, Json, UUID } from '../db/types'
import type { ChangeActorRole, ChangeHistoryEntry } from './contracts'
import type { LocalState } from './localState'
import {
  LOCAL_OWNER_ID,
  LOCAL_OWNER_NAME,
  LOCAL_SUPPORTER_ID,
  LOCAL_SUPPORTER_NAME,
} from './localSeed'
import { createId, nowIso } from './utils'

export interface ChangeInput {
  actorRole: ChangeActorRole
  actorDisplayName?: string
  targetType: ChangeTargetType
  targetId: UUID
  action: 'created' | 'updated' | 'deleted'
  beforeValue: unknown
  afterValue: unknown
  summary: string
}

function toJson(value: unknown): Json | null {
  if (value === null || value === undefined) return null
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }
  if (Array.isArray(value)) return value.map((item) => toJson(item))
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, toJson(item)]),
    )
  }
  return String(value)
}

export function actorId(state: LocalState, role: ChangeActorRole): UUID {
  if (role === 'owner') return LOCAL_OWNER_ID
  return state.support?.link.supporter_id ?? LOCAL_SUPPORTER_ID
}

export function actorName(
  state: LocalState,
  role: ChangeActorRole,
  displayName?: string,
): string {
  if (displayName?.trim()) return displayName.trim()
  if (role === 'owner') return LOCAL_OWNER_NAME
  return state.support?.supporterDisplayName ?? LOCAL_SUPPORTER_NAME
}

export function addChange(state: LocalState, input: ChangeInput): ChangeHistoryEntry {
  const createdAt = nowIso()
  const entry: ChangeHistoryEntry = {
    id: createId(),
    owner_id: LOCAL_OWNER_ID,
    created_at: createdAt,
    actor_id: actorId(state, input.actorRole),
    actorRole: input.actorRole,
    actorDisplayName: actorName(
      state,
      input.actorRole,
      input.actorDisplayName,
    ),
    target_type: input.targetType,
    target_id: input.targetId,
    action: input.action,
    before_value: toJson(input.beforeValue),
    after_value: toJson(input.afterValue),
    summary: input.summary,
  }
  state.changeLogs.unshift(entry)
  return entry
}
