import type { SupportLink, SupportPermissions } from '../db/types'
import { addChange } from './changeHistory'
import type {
  CompletionPermissionPolicy,
  SharingLink,
  SharingService,
} from './contracts'
import type { StoredSupportLink } from './localState'
import { updateLocalState } from './localStore'
import { LOCAL_OWNER_ID } from './localSeed'
import { createId, nowIso } from './utils'

const completionPermission: CompletionPermissionPolicy = {
  ownerCanRecord: true,
  supporterCanRecord: false,
}

function asSharingLink(stored: StoredSupportLink): SharingLink {
  return {
    link: stored.link,
    supporterDisplayName: stored.supporterDisplayName,
    completionPermission,
  }
}

function activeSupport(stored: StoredSupportLink | null): StoredSupportLink {
  if (!stored || stored.link.revoked_at) {
    throw new Error('연결된 지원자가 없어요.')
  }
  return stored
}

function applyPermissionPatch(
  permissions: SupportPermissions,
  patch: Partial<SupportPermissions>,
): void {
  for (const value of Object.values(patch)) {
    if (value !== undefined && typeof value !== 'boolean') {
      throw new Error('공유 권한을 다시 확인해 주세요.')
    }
  }
  Object.assign(permissions, patch)
}

export const sharingService: SharingService = {
  async getLink() {
    return updateLocalState((state) => {
      if (!state.support || state.support.link.revoked_at) return null
      return asSharingLink(state.support)
    })
  },

  async invite(displayName) {
    const name = displayName.trim()
    if (!name) throw new Error('지원자 이름을 적어 주세요.')
    return updateLocalState((state) => {
      if (state.support && !state.support.link.revoked_at) {
        throw new Error('지원자는 한 명만 연결할 수 있어요.')
      }
      const createdAt = nowIso()
      const link: SupportLink = {
        id: createId(),
        owner_id: LOCAL_OWNER_ID,
        created_at: createdAt,
        supporter_id: createId(),
        permissions: {
          can_view_schedule: true,
          can_add_schedule: true,
          can_update_schedule: true,
        },
        accepted_at: createdAt,
        revoked_at: null,
      }
      state.support = { link, supporterDisplayName: name }
      addChange(state, {
        actorRole: 'owner',
        targetType: 'support_link',
        targetId: link.id,
        action: 'created',
        beforeValue: null,
        afterValue: link,
        summary: `${name} 지원자와 일정을 함께 보기 시작했어요.`,
      })
      return asSharingLink(state.support)
    })
  },

  async updatePermissions(patch) {
    return updateLocalState((state) => {
      const stored = activeSupport(state.support)
      const before = { ...stored.link.permissions }
      applyPermissionPatch(stored.link.permissions, patch)
      addChange(state, {
        actorRole: 'owner',
        targetType: 'support_link',
        targetId: stored.link.id,
        action: 'updated',
        beforeValue: before,
        afterValue: stored.link.permissions,
        summary: `${stored.supporterDisplayName} 지원자의 일정 공유 범위를 바꿨어요.`,
      })
      return asSharingLink(stored)
    })
  },

  async disconnect() {
    return updateLocalState((state) => {
      const stored = activeSupport(state.support)
      const before = { ...stored.link }
      stored.link.revoked_at = nowIso()
      addChange(state, {
        actorRole: 'owner',
        targetType: 'support_link',
        targetId: stored.link.id,
        action: 'deleted',
        beforeValue: before,
        afterValue: stored.link,
        summary: `${stored.supporterDisplayName} 지원자와 일정 공유를 멈췄어요.`,
      })
      return asSharingLink(stored)
    })
  },

  async history() {
    return updateLocalState((state) =>
      [...state.changeLogs].sort((left, right) =>
        right.created_at.localeCompare(left.created_at),
      ),
    )
  },
}
