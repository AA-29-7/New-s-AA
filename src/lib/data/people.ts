import type { PersonId } from './types'

/**
 * `people` est saisi à la main dans la console : on accepte « Alex » / « alex » / « alex » avec
 * espaces, et on ignore toute valeur qui n'est ni Alex ni Antoine (l'écran « Profil non configuré »
 * s'affiche alors, au lieu d'un plantage).
 */
export function cleanPeople(raw: unknown): Record<string, PersonId> {
  const out: Record<string, PersonId> = {}
  if (raw && typeof raw === 'object') {
    for (const [uid, v] of Object.entries(raw as Record<string, unknown>)) {
      const name = typeof v === 'string' ? v.trim().toLowerCase() : ''
      if (name === 'alex' || name === 'antoine') out[uid.trim()] = name
    }
  }
  return out
}
