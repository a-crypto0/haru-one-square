import type {
  DisplayMode,
  ProfilePreferences,
  ThemePreference,
} from '../db/types'
import type { PreferenceService } from './contracts'
import { updateLocalState } from './localStore'

const displayModes: ReadonlyArray<DisplayMode> = ['easy', 'standard']
const themes: ReadonlyArray<ThemePreference> = ['system', 'light', 'dark']

function validatePreferences(patch: Partial<ProfilePreferences>): void {
  if (patch.display_mode && !displayModes.includes(patch.display_mode)) {
    throw new Error('표시 모드를 다시 확인해 주세요.')
  }
  if (patch.theme && !themes.includes(patch.theme)) {
    throw new Error('화면 테마를 다시 확인해 주세요.')
  }
  if (
    patch.read_aloud_enabled !== undefined &&
    typeof patch.read_aloud_enabled !== 'boolean'
  ) {
    throw new Error('읽어주기 설정을 다시 확인해 주세요.')
  }
}

export const preferenceService: PreferenceService = {
  async get() {
    return updateLocalState((state) => ({ ...state.profile.preferences }))
  },

  async update(patch) {
    validatePreferences(patch)
    return updateLocalState((state) => {
      state.profile.preferences = { ...state.profile.preferences, ...patch }
      return { ...state.profile.preferences }
    })
  },
}
