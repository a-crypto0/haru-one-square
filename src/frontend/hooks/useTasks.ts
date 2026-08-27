import { useCallback, useEffect, useState } from 'react'

import { appServices } from '../../service'
import { copy } from '../../content/ko/copy'
import type { RemovedTask, ScheduledTask, TaskCreateInput, TaskUpdatePatch, TaskUpdateScope } from '../../service/contracts'

export function useTasks() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRemoved, setLastRemoved] = useState<RemovedTask | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setTasks(await appServices.tasks.list()) }
    catch (reason: unknown) { setError(reason instanceof Error ? reason.message : copy.task.error) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const add = useCallback(async (input: TaskCreateInput) => {
    const created = await appServices.tasks.create(input)
    if (created.task.reminder_enabled) await appServices.notifications.schedule(created.task)
    setTasks((current) => [...current, created])
    return created
  }, [])

  const update = useCallback(async (id: string, patch: TaskUpdatePatch, scope: TaskUpdateScope) => {
    const changed = await appServices.tasks.update(id, patch, scope)
    if (changed.task.reminder_enabled) await appServices.notifications.schedule(changed.task)
    else await appServices.notifications.cancel(id)
    setTasks((current) => current.map((item) => item.task.id === id ? changed : item))
    return changed
  }, [])

  const remove = useCallback(async (id: string) => {
    const removed = await appServices.tasks.remove(id)
    await appServices.notifications.cancel(id)
    setLastRemoved(removed)
    setTasks((current) => current.filter((item) => item.task.id !== id))
    return removed
  }, [])

  const restore = useCallback(async () => {
    if (!lastRemoved) return null
    const restored = await appServices.tasks.restore(lastRemoved)
    if (restored.task.reminder_enabled) await appServices.notifications.schedule(restored.task)
    setTasks((current) => [...current, restored].sort((a, b) => a.task.position - b.task.position))
    setLastRemoved(null)
    return restored
  }, [lastRemoved])

  const reorder = useCallback(async (ids: string[]) => {
    const ordered = await appServices.tasks.reorder(ids)
    setTasks(ordered)
    return ordered
  }, [])

  return { tasks, loading, error, lastRemoved, add, update, remove, restore, reorder, refresh }
}
