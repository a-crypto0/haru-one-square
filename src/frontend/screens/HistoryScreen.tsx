import { View } from 'react-native'

import { copy } from '../../content/ko/copy'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { ChangeHistoryList } from '../components/support/ChangeHistoryList'
import { useChangeHistory } from '../hooks/useChangeHistory'

interface HistoryScreenProps { speech: boolean; onBack: () => void; onOpenTask: (id: string) => void }

export function HistoryScreen({ speech, onBack, onOpenTask }: HistoryScreenProps) {
  const { entries, loading, error } = useChangeHistory()
  const state = loading ? 'loading' : error ? 'error' : entries.length === 0 ? 'empty' : 'success'
  return <View><ScreenHeader onBack={onBack} readAloudEnabled={speech} readText={copy.history.title} title={copy.history.title} /><ChangeHistoryList entries={entries} onOpenRelated={onOpenTask} state={state} /></View>
}

