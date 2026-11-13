import { useSyncExternalStore } from 'react'

/** Première erreur de lecture Firestore (droits refusés, règles non déployées…), affichée par la coque. */
let current: string | null = null
const listeners = new Set<() => void>()

export function reportDataError(collection: string, error: Error) {
  console.error(`Lecture de « ${collection} » impossible`, error)
  if (current) return
  current = (error as { code?: string }).code === 'permission-denied'
    ? 'Accès refusé aux données : vérifie que les règles Firestore et le profil du foyer (people) sont à jour.'
    : 'Les données ne se chargent pas. Vérifie ta connexion.'
  listeners.forEach((l) => l())
}

export function clearDataError() {
  current = null
  listeners.forEach((l) => l())
}

export function useDataError(): string | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => current,
  )
}
