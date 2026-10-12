import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { completeRedirectSignIn, onUserChange } from './auth'
import { getHousehold, roleOf } from './households'
import type { Scope } from './repo'

export const HOUSEHOLD_ID: string = import.meta.env.VITE_HOUSEHOLD_ID || 'foyer'

export type Session =
  | { status: 'loading' }
  | { status: 'signedOut'; error?: string }
  /** Connecté, mais l'UID n'est pas membre du foyer (ou le foyer est illisible). */
  | { status: 'denied'; user: User }
  | { status: 'ready'; user: User; scope: Scope }

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
        setSession(
          isMember
            ? { status: 'ready', user, scope: { hid: HOUSEHOLD_ID, uid: user.uid } }
            : { status: 'denied', user },
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

/** Portée (hid + uid) à passer à `repo()` ; ne s'utilise que sous <AuthGate>. */
export function useScope(): Scope {
  const s = useSession()
  if (s.status !== 'ready') throw new Error('useScope : utilisateur non connecté')
  return s.scope
}
