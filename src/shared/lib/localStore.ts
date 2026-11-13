import { useCallback, useSyncExternalStore } from 'react'

/**
 * État persistant sur l'appareil (localStorage), partagé entre les composants
 * et entre les onglets. Les modules s'en servent tant que leurs données ne
 * sont pas branchées sur Firestore (voir docs/decisions.md).
 */
const cache = new Map<string, unknown>()
const listeners = new Map<string, Set<() => void>>()

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

function read<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T
  let value = fallback
  const raw = storage()?.getItem(key)
  if (raw != null) {
    try {
      value = JSON.parse(raw) as T
    } catch {
      value = fallback
    }
  }
  cache.set(key, value)
  return value
}

function emit(key: string) {
  listeners.get(key)?.forEach((l) => l())
}

export function getStored<T>(key: string, fallback: T): T {
  return read(key, fallback)
}

export function setStored<T>(key: string, next: T | ((prev: T) => T), fallback: T) {
  const prev = read(key, fallback)
  const value = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
  cache.set(key, value)
  try {
    storage()?.setItem(key, JSON.stringify(value))
  } catch {
    // Quota dépassé ou stockage indisponible : l'état reste en mémoire.
  }
  emit(key)
}

function subscribe(key: string, listener: () => void) {
  let set = listeners.get(key)
  if (!set) listeners.set(key, (set = new Set()))
  set.add(listener)
  return () => {
    set.delete(listener)
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!e.key || !listeners.has(e.key)) return
    cache.delete(e.key)
    emit(e.key)
  })
}

/** `fallback` doit être stable (constante de module ou valeur primitive). */
export function useStored<T>(key: string, fallback: T) {
  const value = useSyncExternalStore(
    useCallback((l: () => void) => subscribe(key, l), [key]),
    () => read(key, fallback),
  )
  const set = useCallback(
    (next: T | ((prev: T) => T)) => setStored(key, next, fallback),
    [key, fallback],
  )
  return [value, set] as const
}
