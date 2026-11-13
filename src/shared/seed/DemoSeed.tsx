import { useEffect, useRef } from 'react'
import { useScope, usePeople, type Scope } from '../../lib/data'

/** Contexte donné à un semis de démonstration. */
export interface SeedContext {
  scope: Scope
  uidOf: ReturnType<typeof usePeople>['uidOf']
}

export interface DemoSeeder {
  name: string
  /** Doit être idempotent (identifiants choisis) et s'abstenir si des données existent déjà. */
  run: (ctx: SeedContext) => Promise<void>
}

export const SEED_DEMO = import.meta.env.VITE_SEED_DEMO === 'true'

/**
 * Remplit Firestore avec les données de démonstration au premier lancement.
 * Désactivé sauf si VITE_SEED_DEMO=true (préprod) : jamais sur la prod.
 */
export function DemoSeed({ seeders }: { seeders: DemoSeeder[] }) {
  const scope = useScope()
  const { uidOf } = usePeople()
  const done = useRef(false)

  useEffect(() => {
    if (!SEED_DEMO || done.current) return
    done.current = true
    for (const s of seeders) {
      s.run({ scope, uidOf }).catch((e) => console.warn(`Démo « ${s.name} » non chargée :`, e))
    }
  }, [])
  return null
}
