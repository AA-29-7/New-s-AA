import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useSession } from '../lib/data'
import { useStored } from './lib/localStore'

export type Person = 'alex' | 'antoine'
/** Propriétaire d'un élément : une personne, ou les deux (commun). */
export type Owner = Person | 'both'

export const PEOPLE: Record<Person, { name: string; initial: string }> = {
  alex: { name: 'Alex', initial: 'A' },
  antoine: { name: 'Antoine', initial: 'A' },
}
export const PERSONS: Person[] = ['alex', 'antoine']

export const otherOf = (p: Person): Person => (p === 'alex' ? 'antoine' : 'alex')
export const nameOf = (p: Person) => PEOPLE[p].name

interface PersonContextValue {
  /** Personne connectée sur cet appareil. */
  me: Person
  other: Person
  setMe: (p: Person) => void
}

const PersonContext = createContext<PersonContextValue | null>(null)

/**
 * Qui utilise l'app sur cet appareil ? Le choix est mémorisé par compte
 * (uid) sur l'appareil ; il sera porté par le foyer quand les données
 * seront synchronisées.
 */
export function PersonGate({ children }: { children: ReactNode }) {
  const session = useSession()
  const uid = session.status === 'ready' ? session.user.uid : 'anonyme'
  const [stored, setStored] = useStored<Person | null>(`qg_person_${uid}`, null)

  useEffect(() => {
    if (stored) document.documentElement.dataset.user = stored
    else delete document.documentElement.dataset.user
  }, [stored])

  const value = useMemo(
    () => (stored ? { me: stored, other: otherOf(stored), setMe: setStored } : null),
    [stored, setStored],
  )

  if (!value) return <PersonPicker onPick={setStored} />
  return <PersonContext.Provider value={value}>{children}</PersonContext.Provider>
}

export function PersonPicker({ onPick }: { onPick: (p: Person) => void }) {
  return (
    <main className="who">
      <h1 className="who__title">Qui es-tu ?</h1>
      <p className="muted">Choisis ton profil. Tu pourras le changer plus tard.</p>
      <div className="who__choices">
        {PERSONS.map((p) => (
          <button key={p} className="who__choice card pressable" data-person={p} onClick={() => onPick(p)}>
            <span className="avatar who__avatar" data-person={p}>
              {PEOPLE[p].initial}
            </span>
            <span className="who__name">{PEOPLE[p].name}</span>
          </button>
        ))}
      </div>
    </main>
  )
}

export function usePerson(): PersonContextValue {
  const ctx = useContext(PersonContext)
  if (!ctx) throw new Error('usePerson : à utiliser sous <PersonGate>')
  return ctx
}
