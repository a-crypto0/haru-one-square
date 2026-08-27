import { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'

import { StateMessage } from './src/frontend/components/common/ui'
import { AppShell } from './src/frontend/components/layout/AppShell'
import { usePreferences } from './src/frontend/hooks/usePreferences'
import { useSession } from './src/frontend/hooks/useSession'
import { HistoryScreen } from './src/frontend/screens/HistoryScreen'
import { RecordsScreen } from './src/frontend/screens/RecordsScreen'
import { SettingsScreen } from './src/frontend/screens/SettingsScreen'
import { SetupScreen } from './src/frontend/screens/SetupScreen'
import { TaskEditorScreen } from './src/frontend/screens/TaskEditorScreen'
import { TasksScreen } from './src/frontend/screens/TasksScreen'
import { TodayScreen } from './src/frontend/screens/TodayScreen'
import { TogetherScreen } from './src/frontend/screens/TogetherScreen'
import { WeightScreen } from './src/frontend/screens/WeightScreen'
import { FrontendThemeProvider, useFrontendTheme } from './src/frontend/theme/ThemeContext'
import type { AppRoute } from './src/frontend/types'

interface AppContentProps {
  preferences: ReturnType<typeof usePreferences>
}

function AppContent({ preferences }: AppContentProps) {
  const { colors } = useFrontendTheme()
  const session = useSession()
  const [route, setRoute] = useState<AppRoute>('setup')
  const [initialRouteRead, setInitialRouteRead] = useState(false)
  const [editorTaskId, setEditorTaskId] = useState<string>()
  const [previousRoute, setPreviousRoute] = useState<AppRoute>('today')

  useEffect(() => {
    if (session.loading || initialRouteRead) return
    if (session.user) setRoute('today')
    setInitialRouteRead(true)
  }, [initialRouteRead, session.loading, session.user])

  function openEditor(id?: string) {
    setPreviousRoute(route)
    setEditorTaskId(id)
    setRoute('task-editor')
  }
  function renderScreen() {
    const shared = { speech: preferences.speech }
    switch (route) {
      case 'today': return <TodayScreen {...shared} onEditTask={openEditor} onNavigate={setRoute} />
      case 'tasks': return <TasksScreen {...shared} onBack={() => setRoute('today')} onEditTask={openEditor} />
      case 'task-editor': return <TaskEditorScreen {...shared} mode={preferences.mode} onBack={() => setRoute(previousRoute)} taskId={editorTaskId} />
      case 'weight': return <WeightScreen {...shared} onBack={() => setRoute('today')} onSaved={() => setRoute('records')} />
      case 'records': return <RecordsScreen {...shared} onNavigate={setRoute} />
      case 'together': return <TogetherScreen {...shared} onNavigate={setRoute} />
      case 'history': return <HistoryScreen {...shared} onBack={() => setRoute('together')} onOpenTask={openEditor} />
      case 'settings': return <SettingsScreen error={preferences.error} loading={preferences.loading} mode={preferences.mode} onSignOut={async () => { await session.signOut(); setRoute('setup') }} onUpdate={preferences.update} speech={preferences.speech} theme={preferences.theme} />
      case 'setup': return <SetupScreen error={session.error ?? preferences.error} loading={session.loading || preferences.loading} mode={preferences.mode} onNavigate={setRoute} onSignIn={session.signIn} onUpdate={preferences.update} speech={preferences.speech} />
    }
  }
  if (preferences.loading || (!initialRouteRead && session.loading)) return <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}><StateMessage state="loading" /></SafeAreaView>
  if (route === 'setup') return <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>{renderScreen()}</SafeAreaView>
  return <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}><AppShell activeRoute={route} mode={preferences.mode} onNavigate={setRoute} theme={preferences.theme}>{renderScreen()}</AppShell></SafeAreaView>
}

export default function App() {
  const preferences = usePreferences()
  return <FrontendThemeProvider mode={preferences.mode} theme={preferences.theme}><AppContent preferences={preferences} /></FrontendThemeProvider>
}

const styles = StyleSheet.create({ safeArea: { flex: 1 } })
