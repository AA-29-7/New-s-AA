import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { completeRedirectSignIn, onUserChange } from './auth'
import { getHousehold, roleOf } from './households'
import type { Scope } from './repo'
import type { PersonId } from './types'

export const HOUSEHOLD_ID: string = import.meta.env.VITE_HOUSEHOLD_ID || 'foyer'

export type Session =
  | { status: 'loading' }
  | { status: 'signedOut'; error?: string }
  /** Connecté, mais l'UID n'est pas membre du foyer (ou le foyer est illisible). */
  | { status: 'denied'; user: User }
  /** Membre du foyer, mais l'uid n'est pas associé à Alex ou Antoine (`households/<id>.people`). */
  | { status: 'unmapped'; user: User }
  | { status: 'ready'; user: User; scope: Scope; person: PersonId; people: Record<string, PersonId> }

const SessionContext = createContext<Session>({ status: 'loading' })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({ status: 'loading' })

  useEffect(() => {
    let redirectError: string | undefined
    completeRedirectSignIn().catch((e: unknown) => {
      redirectError = (e as { code?: string }).code ?? 'auth/unknown'
    })

    let cancelled = false
    const unsubscribe = onUserChange(async (user) => {
      if (!user) {
        if (!cancelled) setSession({ status: 'signedOut', error: redirectError })
        return
      }
      if (!cancelled) setSession({ status: 'loading' })
      try {
        const household = await getHousehold(HOUSEHOLD_ID)
        const isMember = household && roleOf(household, user.uid) === 'member'
        if (cancelled) return
        if (!isMember) return setSession({ status: 'denied', user })
        const people = household.people ?? {}
        const person = people[user.uid]
        setSession(
          person
            ? { status: 'ready', user, scope: { hid: HOUSEHOLD_ID, uid: user.uid }, person, people }
            : { status: 'unmapped', user },
        )
      } catch {
        // Les règles refusent la lecture du foyer aux non-membres.
        if (!cancelled) setSession({ status: 'denied', user })
      }
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}

export function useSession(): Session {
  return useContext(SessionContext)
}

/** Personne connectée et correspondance uid → personne ; ne s'utilise que sous <AuthGate>. */
export function usePeople() {
  const s = useSession()
  if (s.status !== 'ready') throw new Error('usePeople : utilisateur non connecté')
  const uidOf = (p: PersonId) => Object.keys(s.people).find((uid) => s.people[uid] === p) ?? null
  return { me: s.person, people: s.people, uidOf }
}

/** Portée (hid + uid) à passer à `repo()` ; ne s'utilise que sous <AuthGate>. */
export function useScope(): Scope {
  const s = useSession()
  if (s.status !== 'ready') throw new Error('useScope : utilisateur non connecté')
  return s.scope
}
