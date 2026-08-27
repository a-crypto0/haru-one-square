import { useState } from 'react'
import { View } from 'react-native'

import { copy } from '../../content/ko/copy'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { WeightEntryCard } from '../components/weight/WeightEntryCard'
import { useWeightLog } from '../hooks/useWeightLog'

interface WeightScreenProps { speech: boolean; onBack: () => void; onSaved: () => void }

export function WeightScreen({ speech, onBack, onSaved }: WeightScreenProps) {
  const { latest, loading, error, save } = useWeightLog()
  const [value, setValue] = useState('')
  const state = loading ? 'loading' : error ? 'error' : value ? 'success' : 'empty'
  return <View><ScreenHeader onBack={onBack} readAloudEnabled={speech} readText={copy.weight.question} title={copy.weight.title} /><WeightEntryCard onChange={setValue} onSave={async (weight) => { await save(weight); onSaved() }} previousRecord={latest} state={state} value={value} /></View>
}

