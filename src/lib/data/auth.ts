import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from './firebase'

export function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

/**
 * Connexion Google : popup, avec repli sur la redirection quand la popup est
 * bloquée (fréquent dans un PWA installé sur mobile).
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  try {
    return await signInWithPopup(auth, provider)
  } catch (e) {
    const code = (e as { code?: string }).code
    if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, provider)
      return null
    }
    throw e
  }
}

/** À appeler une fois au démarrage pour terminer une connexion par redirection. */
export function completeRedirectSignIn() {
  return getRedirectResult(auth)
}

export function logOut() {
  return signOut(auth)
}

/** Appelle `cb` à chaque changement de session ; renvoie la fonction de désabonnement. */
export function onUserChange(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb)
}
