import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from './firebase'
import type { BaseDoc, CollectionName, NewDoc, Visibility, WithId } from './types'

export interface Scope {
  hid: string
  uid: string
}

/**
 * Accès à une collection de module, toujours borné à l'espace couple.
 *
 * Les règles de sécurité ne filtrent pas les listes : chaque lecture passe donc
 * par deux requêtes (documents 'household' + documents dont on est propriétaire),
 * dont les contraintes prouvent aux règles que rien d'interdit n'est demandé.
 */
export function repo<T extends BaseDoc>(name: CollectionName, scope: Scope) {
  const col = collection(db, name)
  const { hid, uid } = scope

  const shared = (extra: QueryConstraint[]) =>
    query(col, where('hid', '==', hid), where('visibility', '==', 'household'), ...extra)
  const mine = (extra: QueryConstraint[]) =>
    query(col, where('hid', '==', hid), where('ownerId', '==', uid), ...extra)

  const toDoc = (id: string, data: DocumentData) => ({ ...data, id }) as WithId<T>

  function merge(a: WithId<T>[], b: WithId<T>[]) {
    const byId = new Map<string, WithId<T>>()
    for (const d of [...a, ...b]) byId.set(d.id, d)
    return [...byId.values()]
  }

  return {
    async list(...extra: QueryConstraint[]): Promise<WithId<T>[]> {
      const [s, m] = await Promise.all([getDocs(shared(extra)), getDocs(mine(extra))])
      return merge(
        s.docs.map((d) => toDoc(d.id, d.data())),
        m.docs.map((d) => toDoc(d.id, d.data())),
      )
    },

    /** Écoute temps réel ; `cb` reçoit la liste fusionnée à chaque changement. */
    subscribe(cb: (docs: WithId<T>[]) => void, ...extra: QueryConstraint[]) {
      let a: WithId<T>[] = []
      let b: WithId<T>[] = []
      const emit = () => cb(merge(a, b))
      const u1 = onSnapshot(shared(extra), (s) => {
        a = s.docs.map((d) => toDoc(d.id, d.data()))
        emit()
      })
      const u2 = onSnapshot(mine(extra), (s) => {
        b = s.docs.map((d) => toDoc(d.id, d.data()))
        emit()
      })
      return () => {
        u1()
        u2()
      }
    },

    async get(id: string): Promise<WithId<T> | null> {
      const snap = await getDoc(doc(col, id))
      return snap.exists() ? toDoc(snap.id, snap.data()) : null
    },

    async create(data: NewDoc<T>): Promise<string> {
      const visibility: Visibility = data.visibility ?? 'household'
      const ownerId = data.ownerId === undefined ? uid : data.ownerId
      const ref = await addDoc(col, {
        ...data,
        hid,
        ownerId,
        visibility,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return ref.id
    },

    /** Met à jour des champs ; hid/ownerId/visibility ne sont pas modifiables ici. */
    async update(id: string, patch: Partial<NewDoc<T>>) {
      const { ownerId: _o, visibility: _v, ...rest } = patch as Record<string, unknown>
      await setDoc(doc(col, id), { ...rest, updatedAt: serverTimestamp() }, { merge: true })
    },

    remove(id: string) {
      return deleteDoc(doc(col, id))
    },
  }
}
