import { useEffect, useMemo, useState } from 'react'
import { where } from 'firebase/firestore'
import { repo } from './repo'
import { useScope } from './session'
import type { BaseDoc, CollectionName, WithId } from './types'

type Eq = Record<string, string | number | boolean>

/** Accès en écriture à une collection, borné au foyer et à la personne connectée. */
export function useRepo<T extends BaseDoc>(name: CollectionName) {
  const scope = useScope()
  return useMemo(() => repo<T>(name, scope), [name, scope])
}

/**
 * Liste temps réel d'une collection (documents communs + les siens), avec l'état
 * de chargement. `eq` filtre par égalité de champs (ex. `{ tripId: 'rome' }`).
 * Fonctionne hors connexion grâce au cache persistant.
 */
export function useCollection<T extends BaseDoc>(name: CollectionName, opts: { eq?: Eq } = {}) {
  const scope = useScope()
  const eqKey = JSON.stringify(opts.eq ?? {})
  const [state, setState] = useState<{ key: string; docs: WithId<T>[]; error?: Error }>({ key: '', docs: [] })
  const key = `${name}|${scope.hid}|${scope.uid}|${eqKey}`

  useEffect(() => {
    const eq = JSON.parse(eqKey) as Eq
    const constraints = Object.entries(eq).map(([field, value]) => where(field, '==', value))
    return repo<T>(name, scope).subscribe(
      (docs) => setState({ key, docs }),
      constraints,
      (error) => setState({ key, docs: [], error }),
    )
  }, [key])

  return { docs: state.docs, loading: state.key !== key, error: state.error }
}
