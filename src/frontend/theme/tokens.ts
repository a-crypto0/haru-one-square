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
  background: '#FFFDF7',
  surface: '#FFFFFF',
  surfaceSoft: '#F5F7F3',
  text: '#26322C',
  textMuted: '#737C76',
  border: '#E7E9E2',
  primary: '#36B879',
  primarySoft: '#E7F8EF',
  secondary: '#8572CF',
  secondarySoft: '#F1EDFF',
  info: '#5F9DD7',
  infoSoft: '#EAF5FF',
  warning: '#A97919',
  warningSoft: '#FFF5D6',
  success: '#249E65',
  successSoft: '#DFF6E9',
  error: '#B6545A',
  errorSoft: '#FCE8E9',
  focus: '#218A61',
  overlay: '#26322C4D',
  transparent: '#FFFFFF00',
}

export const darkColors: SemanticColors = {
  background: '#17211C',
  surface: '#223029',
  surfaceSoft: '#2D3B34',
  text: '#F8FBF8',
  textMuted: '#C2CCC5',
  border: '#405149',
  primary: '#64D69A',
  primarySoft: '#214B36',
  secondary: '#C0B2F0',
  secondarySoft: '#40395C',
  info: '#9BC9EE',
  infoSoft: '#294358',
  warning: '#F0CE75',
  warningSoft: '#4C421F',
  success: '#72D7A1',
  successSoft: '#214A35',
  error: '#F2A2A6',
  errorSoft: '#522F34',
  focus: '#7DE2AE',
  overlay: '#17211CB3',
  transparent: '#FFFFFF00',
}

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const
export const radii = { input: 18, card: 24, small: 12, pill: 999 } as const
export const touchSize = 48

export const typography = {
  display: { fontSize: 30, lineHeight: 38, fontWeight: '800' as const },
  title: { fontSize: 24, lineHeight: 32, fontWeight: '800' as const },
  section: { fontSize: 20, lineHeight: 28, fontWeight: '700' as const },
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
