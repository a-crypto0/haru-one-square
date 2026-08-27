import type { ColorSchemeName } from 'react-native'

import type { DisplayMode, ThemePreference } from '../types'

export interface SemanticColors {
  background: string
  surface: string
  surfaceSoft: string
  text: string
  textMuted: string
  border: string
  primary: string
  primarySoft: string
  secondary: string
  secondarySoft: string
  info: string
  infoSoft: string
  warning: string
  warningSoft: string
  success: string
  successSoft: string
  error: string
  errorSoft: string
  focus: string
  overlay: string
  transparent: string
}

export const lightColors: SemanticColors = {
  background: '#FAF8F3',
  surface: '#FFFFFF',
  surfaceSoft: '#F4F1EB',
  text: '#292B29',
  textMuted: '#686B67',
  border: '#DEDAD2',
  primary: '#587864',
  primarySoft: '#E2EEE5',
  secondary: '#7C6A9A',
  secondarySoft: '#EEE9F6',
  info: '#4F7695',
  infoSoft: '#E4F0F7',
  warning: '#8A691F',
  warningSoft: '#FFF1C8',
  success: '#3F7652',
  successSoft: '#E0F1E5',
  error: '#9A4545',
  errorSoft: '#F8E3E2',
  focus: '#315F7C',
  overlay: '#292B294D',
  transparent: '#FFFFFF00',
}

export const darkColors: SemanticColors = {
  background: '#1D211E',
  surface: '#292E2A',
  surfaceSoft: '#343A35',
  text: '#F5F2EA',
  textMuted: '#C8C4B9',
  border: '#485049',
  primary: '#A4C7AE',
  primarySoft: '#30443A',
  secondary: '#C0AEDB',
  secondarySoft: '#403750',
  info: '#9DC5E0',
  infoSoft: '#2C4352',
  warning: '#E1C473',
  warningSoft: '#50441F',
  success: '#9CCBAB',
  successSoft: '#294437',
  error: '#F0A4A2',
  errorSoft: '#522F30',
  focus: '#9DCEF0',
  overlay: '#1D211EB3',
  transparent: '#FFFFFF00',
}

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const
export const radii = { input: 16, card: 20, pill: 999 } as const
export const touchSize = 48

export const typography = {
  display: { fontSize: 28, lineHeight: 36, fontWeight: '700' as const },
  title: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
  section: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
  bodyEasy: { fontSize: 19, lineHeight: 30, fontWeight: '600' as const },
  bodyStandard: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
  detailEasy: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
  detailStandard: { fontSize: 14, lineHeight: 22, fontWeight: '500' as const },
  number: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
} as const

export const layout = {
  tabletBreakpoint: 768,
  desktopBreakpoint: 1024,
  tabletRail: 72,
  desktopRail: 240,
  contentMax: 1120,
  formMax: 720,
} as const

export function resolveColors(
  preference: ThemePreference,
  systemScheme: ColorSchemeName,
): SemanticColors {
  const dark = preference === 'dark' || (preference === 'system' && systemScheme === 'dark')
  return dark ? darkColors : lightColors
}

export function bodyType(mode: DisplayMode) {
  return mode === 'easy' ? typography.bodyEasy : typography.bodyStandard
}
