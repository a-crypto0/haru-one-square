import { Pressable, StyleSheet, Text, View } from 'react-native'

import { copy } from '../../../content/ko/copy'
import { useFrontendTheme } from '../../theme/ThemeContext'
import { bodyType, layout, spacing, touchSize } from '../../theme/tokens'
import type { AppRoute, NavItem, UiState } from '../../types'
import { StateMessage } from '../common/ui'

interface BottomNavProps {
  activeRoute: AppRoute
  items: NavItem[]
  onNavigate: (route: AppRoute) => void
  width: number
  state?: UiState
}

export function BottomNav({ activeRoute, items, onNavigate, width, state = 'success' }: BottomNavProps) {
  const { colors, mode } = useFrontendTheme()
  const wide = width >= layout.tabletBreakpoint
  const visibleItems = items.length > 0 ? items : [{ route: 'today' as const, icon: '✓', label: copy.nav.today }]
  if (state === 'loading' || state === 'error') {
    return <StateMessage state={state} loadingText={copy.nav.loading} errorText={copy.nav.error} />
  }
  return (
    <View
      accessibilityLabel={copy.nav.accessibility}
      accessibilityRole="tablist"
      style={[
        styles.container,
        wide ? styles.wide : styles.mobile,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.text,
          width: wide ? (width >= layout.desktopBreakpoint ? layout.desktopRail : layout.tabletRail) : undefined,
        },
      ]}
    >
      {visibleItems.map((item) => {
        const selected = item.route === activeRoute
        return (
          <Pressable
            accessibilityLabel={item.label}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={item.route}
            onPress={() => onNavigate(item.route)}
            style={({ pressed }) => [
              styles.item,
              wide ? styles.wideItem : styles.mobileItem,
              { borderColor: colors.transparent },
              selected ? { backgroundColor: colors.primarySoft } : undefined,
              pressed ? { opacity: 0.72 } : undefined,
            ]}
          >
            <Text style={[styles.icon, { color: selected ? colors.primary : colors.textMuted }]}>{item.icon}</Text>
            <Text
              numberOfLines={wide && width < layout.desktopBreakpoint ? 1 : 2}
              style={[
                bodyType(mode),
                styles.label,
                { color: selected ? colors.primary : colors.text, fontWeight: selected ? '700' : '500' },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, elevation: 8, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 18 },
  icon: { fontSize: 19, lineHeight: 24 },
  item: { alignItems: 'center', justifyContent: 'center', minHeight: touchSize, padding: spacing.sm },
  label: { textAlign: 'center' },
  mobile: { borderRadius: 24, bottom: 12, flexDirection: 'row', left: 12, padding: spacing.xs, position: 'absolute', right: 12 },
  mobileItem: { borderRadius: 18, flex: 1 },
  wide: { alignSelf: 'stretch', borderTopWidth: 0, minHeight: '100%', paddingTop: spacing.lg },
  wideItem: { borderRadius: 18, marginHorizontal: spacing.sm, marginBottom: spacing.sm, minHeight: 64 },
})
