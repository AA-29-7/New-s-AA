import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { usePeople as usePeopleSession } from '../lib/data'
import { otherOf, type Person } from './people'

export { PEOPLE, PERSONS, nameOf, otherOf, type Owner, type Person } from './people'

interface PersonContextValue {
  /** Personne connectée (fournie par le foyer : `households/<id>.people`). */
  me: Person
  other: Person
}

const PersonContext = createContext<PersonContextValue | null>(null)

/** Pose la personne connectée (couleurs `--user-*`) ; ne s'utilise que sous <AuthGate>. */
export function PersonProvider({ children }: { children: ReactNode }) {
  const { me } = usePeopleSession()
  useEffect(() => {
    document.documentElement.dataset.user = me
    return () => {
      delete document.documentElement.dataset.user
    }
  }, [me])
  const value = useMemo(() => ({ me, other: otherOf(me) }), [me])
  return <PersonContext.Provider value={value}>{children}</PersonContext.Provider>
}

export function usePerson(): PersonContextValue {
  const ctx = useContext(PersonContext)
  if (!ctx) throw new Error('usePerson : à utiliser sous <PersonProvider>')
  return ctx
}
