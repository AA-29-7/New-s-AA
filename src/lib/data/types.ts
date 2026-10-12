export type Visibility = 'private' | 'household'
export type MemberRole = 'member' | 'viewer'

export const COLLECTIONS = [
  'habits',
  'habitLogs',
  'journalEntries',
  'trips',
  'tripPhotos',
  'films',
  'filmRatings',
] as const

export type CollectionName = (typeof COLLECTIONS)[number]

export interface Household {
  members: Record<string, MemberRole>
}

/** Champs communs à tous les documents des collections de modules. */
export interface BaseDoc {
  /** Identifiant de l'espace couple. */
  hid: string
  /** uid du propriétaire, ou null si le document est commun. */
  ownerId: string | null
  visibility: Visibility
}

export type WithId<T> = T & { id: string }

/** Données fournies par un module à la création : hid/ownerId/visibility sont posés par la couche data. */
export type NewDoc<T extends BaseDoc> = Omit<T, keyof BaseDoc> & {
  ownerId?: string | null
  visibility?: Visibility
}
