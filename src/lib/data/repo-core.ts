import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  runTransaction,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type DocumentData,
  type Firestore,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import type { BaseDoc, CollectionName, NewDoc, Visibility, WithId } from './types'

export interface Scope {
  hid: string
  uid: string
}

/**
 * Fabrique `repo` pour une instance Firestore donnée (l'app utilise celle de firebase.ts,
 * les tests celle de l'émulateur).
 *
 * Accès à une collection de module, toujours borné à l'espace couple.
 *
 * Les règles de sécurité ne filtrent pas les listes : chaque lecture passe donc
 * par deux requêtes (documents 'household' + documents dont on est propriétaire),
 * dont les contraintes prouvent aux règles que rien d'interdit n'est demandé.
 */
export function makeRepo(db: Firestore) {
  return function repo<T extends BaseDoc>(name: CollectionName, scope: Scope) {
    const col = collection(db, name)
    const { hid, uid } = scope

    const shared = (extra: QueryConstraint[]) =>
      query(col, where('hid', '==', hid), where('visibility', '==', 'household'), ...extra)
    const mine = (extra: QueryConstraint[]) =>
      query(col, where('hid', '==', hid), where('ownerId', '==', uid), ...extra)

    const toDoc = (d: QueryDocumentSnapshot<DocumentData>) =>
      ({ ...d.data(), id: d.id, pending: d.metadata.hasPendingWrites }) as WithId<T>

    function merge(a: WithId<T>[], b: WithId<T>[]) {
      const byId = new Map<string, WithId<T>>()
      for (const d of [...a, ...b]) byId.set(d.id, d)
      return [...byId.values()]
    }

    return {
      async list(...extra: QueryConstraint[]): Promise<WithId<T>[]> {
        const [s, m] = await Promise.all([getDocs(shared(extra)), getDocs(mine(extra))])
        return merge(s.docs.map(toDoc), m.docs.map(toDoc))
      },

      /**
       * Écoute temps réel ; `cb` reçoit la liste fusionnée, une fois que les deux
       * requêtes ont répondu puis à chaque changement.
       */
      subscribe(cb: (docs: WithId<T>[]) => void, extra: QueryConstraint[] = [], onError?: (e: Error) => void) {
        let a: WithId<T>[] | null = null
        let b: WithId<T>[] | null = null
        const emit = () => {
          if (a && b) cb(merge(a, b))
        }
        const u1 = onSnapshot(
          shared(extra),
          (s) => {
            a = s.docs.map(toDoc)
            emit()
          },
          onError,
        )
        const u2 = onSnapshot(
          mine(extra),
          (s) => {
            b = s.docs.map(toDoc)
            emit()
          },
          onError,
        )
        return () => {
          u1()
          u2()
        }
      },

      async get(id: string): Promise<WithId<T> | null> {
        const snap = await getDoc(doc(col, id))
        return snap.exists() ? toDoc(snap as QueryDocumentSnapshot<DocumentData>) : null
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

      /**
       * Crée ou complète un document à identifiant choisi (idempotent : deux appareils
       * peuvent l'exécuter en même temps). Les objets imbriqués sont fusionnés champ par champ.
       */
      async upsert(id: string, data: NewDoc<T>) {
        const visibility: Visibility = data.visibility ?? 'household'
        const ownerId = data.ownerId === undefined ? uid : data.ownerId
        await setDoc(doc(col, id), { ...data, hid, ownerId, visibility, updatedAt: serverTimestamp() }, { merge: true })
      },

      /**
       * Crée le document seulement s'il n'existe pas (transaction : jamais d'écrasement,
       * même si les deux téléphones l'exécutent en même temps). Nécessite le réseau ;
       * sert au semis de démonstration.
       */
      async createIfMissing(id: string, data: NewDoc<T>) {
        const visibility: Visibility = data.visibility ?? 'household'
        const ownerId = data.ownerId === undefined ? uid : data.ownerId
        const ref = doc(col, id)
        await runTransaction(db, async (tx) => {
          if ((await tx.get(ref)).exists()) return
          tx.set(ref, { ...data, hid, ownerId, visibility, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
        })
      },

      /** Le document existe-t-il sur le serveur (lecture directe, pas le cache) ? Lève une erreur hors connexion. */
      async existsOnServer(id: string): Promise<boolean> {
        return (await getDocFromServer(doc(col, id))).exists()
      },

      /**
       * Ajoute ou retire une valeur d'un champ tableau, sans lire le document :
       * deux appareils (ou un appareil hors connexion) ne s'écrasent pas.
       */
      async arrayToggle(id: string, field: string, value: string | number, on: boolean, defaults: Pick<NewDoc<T>, 'ownerId' | 'visibility'> = {}) {
        const visibility: Visibility = defaults.visibility ?? 'household'
        const ownerId = defaults.ownerId === undefined ? uid : defaults.ownerId
        await setDoc(
          doc(col, id),
          { hid, ownerId, visibility, [field]: on ? arrayUnion(value) : arrayRemove(value), updatedAt: serverTimestamp() },
          { merge: true },
        )
      },

      remove(id: string) {
        return deleteDoc(doc(col, id))
      },
    }
  }
}
