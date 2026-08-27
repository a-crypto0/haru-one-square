import 'expo-sqlite/localStorage/install'

import type { LocalState } from './localState'
import { createInitialState } from './localSeed'

const STORAGE_KEY = 'daily-support-app.local.v1'

interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

const memoryValues = new Map<string, string>()
const memoryStorage: KeyValueStorage = {
  getItem: (key) => memoryValues.get(key) ?? null,
  setItem: (key, value) => {
    memoryValues.set(key, value)
  },
}

function isKeyValueStorage(value: unknown): value is KeyValueStorage {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.getItem === 'function' &&
    typeof candidate.setItem === 'function'
  )
}

function findStorage(): KeyValueStorage {
  try {
    const candidate: unknown = globalThis.localStorage
    return isKeyValueStorage(candidate) ? candidate : memoryStorage
  } catch {
    return memoryStorage
  }
}

let activeStorage = findStorage()

function isLocalState(value: unknown): value is LocalState {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    candidate.schemaVersion === 1 &&
    candidate.storageMode === 'local' &&
    Array.isArray(candidate.tasks) &&
    Array.isArray(candidate.taskLogs) &&
    typeof candidate.profile === 'object' &&
    candidate.profile !== null
  )
}

function writeState(state: LocalState): void {
  const serialized = JSON.stringify(state)
  try {
    activeStorage.setItem(STORAGE_KEY, serialized)
  } catch {
    activeStorage = memoryStorage
    activeStorage.setItem(STORAGE_KEY, serialized)
  }
}

function readState(): LocalState {
  let raw: string | null = null
  try {
    raw = activeStorage.getItem(STORAGE_KEY)
  } catch {
    activeStorage = memoryStorage
    raw = activeStorage.getItem(STORAGE_KEY)
  }

  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw)
      if (isLocalState(parsed)) return parsed
    } catch {
      // 손상된 로컬 JSON은 아래의 안전한 초기 데이터로 교체한다.
    }
  }

  const initialState = createInitialState()
  writeState(initialState)
  return initialState
}

export function readLocalState(): Promise<LocalState> {
  return Promise.resolve(readState())
}

export function updateLocalState<Result>(
  update: (state: LocalState) => Result,
): Promise<Result> {
  const state = readState()
  const result = update(state)
  writeState(state)
  return Promise.resolve(result)
}
