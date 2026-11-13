export type Visibility = 'private' | 'household'
export type MemberRole = 'member' | 'viewer'

/** Doit rester aligné avec `isModuleCol` dans firestore.rules. */
export const COLLECTIONS = [
  'habits',
  'habitLogs',
  'habitCategories',
  'habitGoals',
  'quests',
  'journalEntries',
  'trips',
  'tripPhotos',
  'tripExpenses',
  'tripNotes',
  'tripPreps',
  'films',
  'filmRatings',
  'userPrefs',
] as const

export type CollectionName = (typeof COLLECTIONS)[number]

/** Les deux personnes du foyer. */
export type PersonId = 'alex' | 'antoine'

export interface Household {
  members: Record<string, MemberRole>
  /** uid → personne, saisi à la main dans la console (comme `members`). */
  people?: Record<string, PersonId>
}

/** Champs communs à tous les documents des collections de modules. */
export interface BaseDoc {
  /** Identifiant de l'espace couple. */
  hid: string
  /** uid du propriétaire, ou null si le document est commun. */
  ownerId: string | null
  visibility: Visibility
}

/** `pending` : modification locale pas encore envoyée au serveur (« en attente d'envoi »). */
export type WithId<T> = T & { id: string; pending?: boolean }

/** Données fournies par un module à la création : hid/ownerId/visibility sont posés par la couche data. */
export type NewDoc<T extends BaseDoc> = Omit<T, keyof BaseDoc> & {
  ownerId?: string | null
  visibility?: Visibility
}
