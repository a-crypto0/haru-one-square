import type { PropsWithChildren } from 'react'
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native'

import { copy } from '../../../content/ko/copy'
import { useFrontendTheme } from '../../theme/ThemeContext'
import { layout, spacing } from '../../theme/tokens'
import type { AppRoute, DisplayMode, NavItem, ThemePreference, UiState } from '../../types'
import { StateMessage } from '../common/ui'
import { BottomNav } from '../navigation/BottomNav'

interface AppShellProps extends PropsWithChildren {
  mode: DisplayMode
  theme: ThemePreference
  activeRoute: AppRoute
  onNavigate: (route: AppRoute) => void
  state?: UiState
}

const navItems: NavItem[] = [
  { route: 'today', icon: '✓', label: copy.nav.today },
  { route: 'records', icon: '▦', label: copy.nav.records },
  { route: 'together', icon: '♡', label: copy.nav.together },
  { route: 'settings', icon: '⚙', label: copy.nav.settings },
]

export function AppShell({ activeRoute, onNavigate, state = 'success', children }: AppShellProps) {
  const { colors } = useFrontendTheme()
  const { width } = useWindowDimensions()
  const wide = width >= layout.tabletBreakpoint
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {wide ? <BottomNav activeRoute={activeRoute} items={navItems} onNavigate={onNavigate} width={width} /> : null}
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: wide ? spacing.xl : 120, paddingTop: wide ? spacing.xl : spacing.md },
        ]}
        keyboardShouldPersistTaps="handled"
        style={styles.scroll}
      >
        <View style={[styles.maxWidth, width >= layout.desktopBreakpoint ? styles.desktopMaxWidth : undefined]}>
          {state === 'success' ? children : (
            <StateMessage state={state} loadingText={copy.shell.loading} errorText={copy.shell.error} />
          )}
        </View>
      </ScrollView>
      {!wide ? <BottomNav activeRoute={activeRoute} items={navItems} onNavigate={onNavigate} width={width} /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', flexGrow: 1 },
  desktopMaxWidth: { paddingHorizontal: spacing.xl },
  maxWidth: { maxWidth: layout.contentMax, paddingHorizontal: spacing.md, width: '100%' },
  root: { flex: 1, flexDirection: 'row' },
  scroll: { flex: 1 },
})
