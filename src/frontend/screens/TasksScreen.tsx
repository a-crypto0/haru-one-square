import { View } from 'react-native'

import { copy } from '../../content/ko/copy'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { TaskList } from '../components/tasks/TaskList'
import { useTasks } from '../hooks/useTasks'

interface TasksScreenProps {
  speech: boolean
  onBack: () => void
  onEditTask: (id?: string) => void
}

export function TasksScreen({ speech, onBack, onEditTask }: TasksScreenProps) {
  const { tasks, loading, error, reorder } = useTasks()
  const state = loading ? 'loading' : error ? 'error' : tasks.length === 0 ? 'empty' : 'success'
  return <View><ScreenHeader onBack={onBack} readAloudEnabled={speech} readText={copy.task.listTitle} title={copy.task.listTitle} /><TaskList onAdd={() => onEditTask()} onEdit={onEditTask} onReorder={async (ids) => { await reorder(ids) }} state={state} tasks={tasks} /></View>
}
