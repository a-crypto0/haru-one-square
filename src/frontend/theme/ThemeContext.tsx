import { createContext, useContext, useMemo, type PropsWithChildren } from 'react'
import { useColorScheme } from 'react-native'

import type { DisplayMode, ThemePreference } from '../types'
import { resolveColors, type SemanticColors } from './tokens'

interface FrontendThemeValue {
  mode: DisplayMode
  theme: ThemePreference
  colors: SemanticColors
}

const ThemeContext = createContext<FrontendThemeValue>({
  mode: 'standard',
  theme: 'system',
  colors: resolveColors('system', 'light'),
})

interface ThemeProviderProps extends PropsWithChildren {
  mode: DisplayMode
  theme: ThemePreference
}

export function FrontendThemeProvider({ mode, theme, children }: ThemeProviderProps) {
  const scheme = useColorScheme()
  const value = useMemo(
    () => ({ mode, theme, colors: resolveColors(theme, scheme) }),
    [mode, scheme, theme],
  )
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useFrontendTheme() {
  return useContext(ThemeContext)
}

