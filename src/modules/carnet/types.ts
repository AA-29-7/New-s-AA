import type { Owner, Person } from '../../shared/person'
import type { StickerColor } from '../../shared/ui'

export type CatId = 'transport' | 'logement' | 'resto' | 'activites' | 'courses' | 'shopping' | 'local'

export interface Category {
  id: CatId
  emoji: string
  color: StickerColor
  name: string
}

/** Qui a payé : une personne, ou l'épargne commune (hors remboursements). */
export type Payer = Person | 'commun'

export interface Expense {
  id: string
  cat: CatId
  label: string
  amount: number
  who: Payer
  day: string
  /** Saisie hors connexion, pas encore envoyée. */
  pending?: boolean
}

export interface Trip {
  id: string
  name: string
  country: string
  continent: string
  /** Dates ISO (AAAA-MM-JJ). */
  start: string
  end: string
  owner: Owner
  emoji: string
  color: StickerColor
  rotate: number
  memory: string
  /** Total des dépenses de démonstration quand le détail n'est pas saisi. */
  total: number
  ideal?: number
  limit?: number
  /** Nombre de photos de démonstration (vignettes rayées). */
  photos: number
  /** Coordonnées des repères : [libellé, longitude, latitude]. */
  pins: [string, number, number][]
  itinerary: string[]
}

export interface Photo {
  id: string
  /** Vignette de démonstration (rayures) quand il n'y a pas de vraie photo. */
  color?: StickerColor
}

export interface NotebookPage {
  title: string
  text: string
  author?: Person
  photos: string[]
}

export interface Notebook {
  mode: 'free' | 'daily' | null
  view: 'write' | 'book'
  current: number
  pages: NotebookPage[]
}

export type StepId = 'dest' | 'dates' | 'budget' | 'vols' | 'logement' | 'pack' | 'acts' | 'itin' | 'docs'
export type StepStatus = 'todo' | 'wip' | 'ia' | 'ok'

export interface StepLine {
  k: string
  v: string
  /** Autres propositions de l'IA, utilisées à la régénération. */
  alts: string[]
  locked: boolean
}

export interface Step {
  id: StepId
  emoji: string
  color: StickerColor
  rotate: number
  title: string
  kind: 'lines' | 'budget' | 'pack' | 'acts'
  mode: 'auto' | 'manual'
  status: StepStatus
  /** Nombre de propositions demandées (1 à 3). */
  count: number
  selected: number
  /** Vrai dès que l'étape a un contenu. */
  filled: boolean
  /** Bouton « Réserver sur le site officiel ». */
  bookable?: boolean
  proposals: StepLine[][]
  budget?: Record<CatId, number>
}

export interface PackItem {
  label: string
  done: boolean
  tag: string
}

export type ActivityStatus = 0 | 1 | 2

export interface Activity {
  name: string
  price: string
  duration: string
  rating: string
  place: string
  status: ActivityStatus
  /** Jour du voyage, 0 = pas placé. */
  day: number
  color: StickerColor
}

export interface PrepTrip {
  id: string
  name: string
  ideal: number
  limit: number
  steps: Step[]
  pack: Record<Payer, PackItem[]>
  packParams: string[]
  activities: Activity[]
}

export interface Offer {
  id: number
  type: 'Séjour' | 'Train' | 'Vol' | 'Hôtel' | 'Activité' | 'Idée'
  emoji: string
  color: StickerColor
  destination: string
  dates: string
  /** Prix pour deux, en euros ; null pour une idée sans prix. */
  price: number | null
  per: string
  reading: string
  trip: string
  weather: string
  why: string
  shortcuts: string[]
  /** Champs structurés pour les filtres. */
  zones: string[]
  transport: 'Avion' | 'Train' | 'Voiture'
  hours: number
  temp: number
  nights: number
  themes: string[]
  /** [longitude, latitude] ; absent si hors de la carte d'Europe. */
  coord?: [number, number]
}

export type HomeSectionId = 'prep' | 'frise' | 'saved' | 'souv' | 'solde' | 'budget'

/** Tout ce que le module garde sur l'appareil. */
export interface CarnetState {
  expenses: Record<string, Expense[]>
  settled: Record<string, boolean>
  photos: Record<string, Photo[]>
  notebooks: Record<string, Notebook>
  preps: Record<string, PrepTrip>
  prepOrder: string[]
  saved: number[]
  dismissed: number[]
  homeOrder: HomeSectionId[]
  homeOn: Partial<Record<HomeSectionId, boolean>>
  origin: string
  lastCat: CatId
  filters: Record<string, string[]>
}
