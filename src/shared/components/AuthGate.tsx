import { useState, type ReactNode } from 'react'
import { logOut, signIn, signInWithGoogle, useSession } from '../../lib/data'

const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou mot de passe incorrect.',
  'auth/popup-closed-by-user': 'Connexion annulée.',
  'auth/cancelled-popup-request': 'Connexion annulée.',
  'auth/network-request-failed': 'Pas de connexion réseau.',
  'auth/too-many-requests': 'Trop de tentatives, réessaie dans quelques minutes.',
}

function LoginPage({ initialError }: { initialError?: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(initialError)
  const [busy, setBusy] = useState(false)

  async function run(action: () => Promise<unknown>) {
    setBusy(true)
    setError(undefined)
    try {
      await action()
    } catch (e) {
      const code = (e as { code?: string }).code ?? ''
      setError(MESSAGES[code] ?? `Connexion impossible (${code || 'erreur inconnue'}).`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth">
      <h1 className="auth__title">New AA's</h1>
      <button className="auth__btn auth__btn--primary" disabled={busy} onClick={() => run(signInWithGoogle)}>
        Continuer avec Google
      </button>
      <form className="auth__form" onSubmit={(e) => { e.preventDefault(); void run(() => signIn(email, password)) }}>
        <input type="email" placeholder="E-mail" autoComplete="username" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mot de passe" autoComplete="current-password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        <button className="auth__btn" disabled={busy} type="submit">Se connecter</button>
      </form>
      {error && <p className="auth__error" role="alert">{error}</p>}
    </main>
  )
}

/** Affiche l'app seulement pour un membre connecté du foyer. */
export function AuthGate({ children }: { children: ReactNode }) {
  const session = useSession()

  if (session.status === 'loading') return <main className="auth"><p className="muted">Chargement…</p></main>
  if (session.status === 'signedOut') return <LoginPage initialError={session.error && (MESSAGES[session.error] ?? session.error)} />
  if (session.status === 'denied') {
    return (
      <main className="auth">
        <h1 className="auth__title">Accès refusé</h1>
        <p className="muted">Ce compte n'est pas membre du foyer. Donne cet identifiant pour être ajouté :</p>
        <code className="auth__uid">{session.user.uid}</code>
        <button className="auth__btn" onClick={() => void logOut()}>Changer de compte</button>
      </main>
    )
  }
  return <>{children}</>
}
