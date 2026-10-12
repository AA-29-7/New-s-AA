import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from './firebase'

export function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export function logOut() {
  return signOut(auth)
}

/** Appelle `cb` à chaque changement de session ; renvoie la fonction de désabonnement. */
export function onUserChange(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb)
}
