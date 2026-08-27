import type { AppSession, AuthService } from './contracts'
import { updateLocalState } from './localStore'
import { LOCAL_OWNER_ID, LOCAL_OWNER_NAME } from './localSeed'
import { nowIso } from './utils'

export const authService: AuthService = {
  async getSession() {
    return updateLocalState((state) => state.session)
  },

  async signInAsLocalUser() {
    return updateLocalState((state) => {
      const session: AppSession = {
        mode: 'local',
        user: { id: LOCAL_OWNER_ID, displayName: LOCAL_OWNER_NAME },
        signedInAt: nowIso(),
      }
      state.session = session
      return session
    })
  },

  async signOut() {
    return updateLocalState((state) => {
      state.session = null
    })
  },
}
