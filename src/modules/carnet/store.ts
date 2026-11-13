import { createContext, createElement, useContext, useMemo, useState, type ReactNode } from 'react'
import { repo, useCollection, usePeople, useRepo, type DeepPartial } from '../../lib/data'
import { daysBetween, parseIso } from '../../shared/lib/dates'
import { usePerson } from '../../shared/person'
import type { DemoSeeder } from '../../shared/seed/DemoSeed'
import { DEFAULT_PREFS, NEXT_TRIP_ID, PHOTO_COLORS, ROME_EXPENSES, ROME_NOTEBOOK, TRIPS, lisbonPrep } from './data/demo'
import { generatedExpenses } from './logic'
import {
  prepDoc,
  prepPatch,
  toPrep,
  toTrip,
  tripToDoc,
  type ExpenseDoc,
  type NoteDoc,
  type PhotoDoc,
  type PrefsDoc,
  type PrepDoc,
  type TripDoc,
} from './docs'
import { resizeImage } from './imageResize'
import type { CatId, Expense, Notebook, NotebookPage, Photo, Prefs, PrepTrip, Step, Trip } from './types'

const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
/** Écritures lancées sans attendre : hors connexion, la promesse ne se résout qu'au retour du réseau. */
const fire = (p: Promise<unknown>) => void p.catch((e) => console.error('Écriture refusée', e))
const pageId = (tripId: string, index: number) => `${tripId}_${String(index).padStart(3, '0')}`
const shortMonth = (iso: string) => parseIso(iso).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })

/* ---------- Dates ---------- */
/** Jours avant le départ (négatif une fois parti). */
export const daysUntil = (trip: Trip, today = new Date()) => daysBetween(today, parseIso(trip.start))
/** Voyage terminé (le retour est passé). */
export const isPast = (trip: Trip, today = new Date()) => daysBetween(parseIso(trip.end), today) > 0
/** Jour du voyage en cours (1 = jour du départ), ou null hors du voyage. */
export function tripDay(trip: Trip, today = new Date()): number | null {
  const n = daysBetween(parseIso(trip.start), today) + 1
  return n >= 1 && daysBetween(today, parseIso(trip.end)) >= 0 ? n : null
}

/* ---------- Données du Carnet ---------- */
function useCarnetData() {
  const { me } = usePerson()
  const { uidOf } = usePeople()
  const myUid = uidOf(me)

  const tripDocs = useCollection<TripDoc>('trips')
  const expenseDocs = useCollection<ExpenseDoc>('tripExpenses')
  const noteDocs = useCollection<NoteDoc>('tripNotes')
  const prepDocs = useCollection<PrepDoc>('tripPreps')
  const prefsDocs = useCollection<PrefsDoc>('userPrefs')

  const tripsRepo = useRepo<TripDoc>('trips')
  const expensesRepo = useRepo<ExpenseDoc>('tripExpenses')
  const notesRepo = useRepo<NoteDoc>('tripNotes')
  const prepsRepo = useRepo<PrepDoc>('tripPreps')
  const prefsRepo = useRepo<PrefsDoc>('userPrefs')
  const prefsId = `carnet_${myUid}`

  /** Préparations créées sur ce téléphone, visibles tout de suite (avant le premier instantané du serveur). */
  const [optimistic, setOptimistic] = useState<Record<string, { prep: PrepTrip; at: number }>>({})

  const loading = tripDocs.loading || expenseDocs.loading || noteDocs.loading || prepDocs.loading || prefsDocs.loading

  return useMemo(() => {
    const trips: Trip[] = tripDocs.docs.map(toTrip).sort((a, b) => b.start.localeCompare(a.start))
    const tripById = (id: string | undefined) => trips.find((t) => t.id === id)

    const today = new Date()
    const upcoming = trips.filter((t) => !isPast(t, today)).sort((a, b) => a.start.localeCompare(b.start))
    const finished = trips.filter((t) => isPast(t, today))
    const nextTrip: Trip | undefined = upcoming[0]
    const lastTrip: Trip | undefined = finished[0]
    const friseTrips = finished.filter((t) => t.owner === 'both').slice(0, 5).reverse()

    const expensesByTrip = new Map<string, Expense[]>()
    for (const d of expenseDocs.docs) {
      const list = expensesByTrip.get(d.tripId) ?? []
      list.push({ id: d.id, cat: d.cat, label: d.label, amount: d.amount, who: d.who, day: d.day, at: d.at ?? 0, pending: d.pending })
      expensesByTrip.set(d.tripId, list)
    }
    for (const list of expensesByTrip.values()) list.sort((a, b) => a.at - b.at)
    /** Dépenses saisies ; à défaut, dépenses générées d'après le total (voyages passés de démonstration). */
    const expensesOf = (trip: Trip): Expense[] => expensesByTrip.get(trip.id) ?? generatedExpenses(trip, shortMonth(trip.start))

    const preps: Record<string, PrepTrip> = {}
    const prepAt: Record<string, number> = {}
    for (const [id, o] of Object.entries(optimistic)) {
      preps[id] = o.prep
      prepAt[id] = o.at
    }
    for (const d of prepDocs.docs) {
      preps[d.id] = toPrep(d)
      prepAt[d.id] = d.at ?? 0
    }
    const prepOrder = Object.keys(preps).sort((a, b) => prepAt[a] - prepAt[b])

    const mine = prefsDocs.docs.find((d) => d.id === prefsId)
    const prefs: Prefs = {
      saved: mine?.saved ?? DEFAULT_PREFS.saved,
      dismissed: mine?.dismissed ?? DEFAULT_PREFS.dismissed,
      homeOrder: mine?.homeOrder ?? DEFAULT_PREFS.homeOrder,
      homeOn: mine?.homeOn ?? DEFAULT_PREFS.homeOn,
      origin: mine?.origin ?? DEFAULT_PREFS.origin,
      lastCat: mine?.lastCat ?? DEFAULT_PREFS.lastCat,
      filters: mine?.filters ?? DEFAULT_PREFS.filters,
    }
    const priv = { ownerId: myUid, visibility: 'private' } as const
    const setPrefs = (patch: DeepPartial<PrefsDoc>) => fire(prefsRepo.upsert(prefsId, { ...patch, ...priv }))

    const notebookOf = (tripId: string): Notebook => {
      const mode = noteDocs.docs.find((d) => d.id === `${tripId}_mode`)?.mode ?? null
      const pages = noteDocs.docs
        .filter((d) => d.tripId === tripId && d.index != null)
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
      return {
        mode,
        pages: pages.map((d): NotebookPage => ({ title: d.title ?? '', text: d.text ?? '', author: d.author, photos: d.photos ?? [] })),
      }
    }

    const setPrep = (id: string, fn: (p: PrepTrip) => PrepTrip) => {
      const before = preps[id]
      if (!before) return
      const patch = prepPatch(before, fn(before))
      if (Object.keys(patch).length) fire(prepsRepo.upsert(id, { ...patch, ownerId: null }))
    }

    return {
      loading,
      trips,
      tripById,
      nextTrip,
      lastTrip,
      friseTrips,
      expensesOf,
      notebookOf,
      /** Pour les écrans qui lisent l'état comme avant : préparations, préférences. */
      state: { preps, prepOrder, ...prefs, settled: Object.fromEntries(trips.map((t) => [t.id, !!t.settled])) },
      setPrefs,

      /** Ajoute une dépense ; sur un voyage sans détail saisi, le détail généré devient réel d'abord. */
      addExpense: (trip: Trip, e: Omit<Expense, 'id' | 'at' | 'pending'>) => {
        const base = Date.now()
        if (!expensesByTrip.has(trip.id)) {
          generatedExpenses(trip, shortMonth(trip.start)).forEach(({ id, pending: _p, ...g }) =>
            fire(expensesRepo.upsert(id, { ...g, tripId: trip.id, ownerId: null })),
          )
        }
        fire(expensesRepo.upsert(newId('e'), { ...e, tripId: trip.id, at: base, ownerId: null }))
        if (trip.settled && trip.owner === 'both') fire(tripsRepo.upsert(trip.id, { settled: false, ownerId: null }))
        setPrefs({ lastCat: e.cat as CatId })
      },
      settle: (trip: Trip) => {
        if (trip.owner === 'both') fire(tripsRepo.upsert(trip.id, { settled: true, ownerId: null }))
      },

      setNotebookMode: (tripId: string, mode: 'free' | 'daily' | null) => {
        if (mode) fire(notesRepo.upsert(`${tripId}_mode`, { tripId, mode, ownerId: null }))
        else fire(notesRepo.remove(`${tripId}_mode`))
      },
      /** Écrit (ou crée) une page du carnet ; l'auteur est la personne qui écrit la première. */
      savePage: (tripId: string, index: number, patch: Partial<NotebookPage>, current?: NotebookPage) =>
        fire(notesRepo.upsert(pageId(tripId, index), { tripId, index, ...patch, author: current?.author ?? me, ownerId: null })),
      /** Retire une photo de toutes les pages qui l'utilisent. */
      removePhotoFromPages: (tripId: string, photoId: string) => {
        for (const d of noteDocs.docs) {
          if (d.tripId === tripId && d.photos?.includes(photoId)) {
            fire(notesRepo.upsert(d.id, { photos: d.photos.filter((x) => x !== photoId), ownerId: null }))
          }
        }
      },

      setPrep,
      setStep: (prepId: string, stepId: Step['id'], fn: (st: Step) => Step) =>
        setPrep(prepId, (p) => ({ ...p, steps: p.steps.map((st) => (st.id === stepId ? fn(st) : st)) })),
      addPrep: (prep: PrepTrip) => {
        const at = Date.now()
        setOptimistic((o) => ({ ...o, [prep.id]: { prep, at } }))
        fire(prepsRepo.upsert(prep.id, { ...prepDoc(prep, at), ownerId: null }))
      },

      toggleSaved: (id: number) =>
        fire(prefsRepo.arrayToggle(prefsId, 'saved', id, !prefs.saved.includes(id), priv)),
      dismiss: (id: number) => fire(prefsRepo.arrayToggle(prefsId, 'dismissed', id, true, priv)),

    }
  }, [tripDocs.docs, expenseDocs.docs, noteDocs.docs, prepDocs.docs, prefsDocs.docs, loading, me, myUid, optimistic])
}

export type Carnet = ReturnType<typeof useCarnetData>

const CarnetContext = createContext<Carnet | null>(null)

/** Abonne le module à ses collections une seule fois ; les écrans lisent via `useCarnet()`. */
export function CarnetProvider({ children }: { children: ReactNode }) {
  const value = useCarnetData()
  return createElement(CarnetContext.Provider, { value }, children)
}

export function useCarnet(): Carnet {
  const ctx = useContext(CarnetContext)
  if (!ctx) throw new Error('useCarnet : à utiliser sous <CarnetProvider>')
  return ctx
}

/* ---------- Photos d'un voyage ---------- */
export const MAX_PHOTOS = 20

/** Photos d'un voyage (chargées pour ce voyage seulement : chaque photo pèse jusqu'à ~900 Ko). */
export function useTripPhotos(trip: Trip) {
  const { docs, loading } = useCollection<PhotoDoc>('tripPhotos', { eq: { tripId: trip.id } })
  const photosRepo = useRepo<PhotoDoc>('tripPhotos')
  const photos = useMemo<Photo[]>(
    () => [...docs].sort((a, b) => (a.at ?? 0) - (b.at ?? 0)).map((d) => ({ id: d.id, color: d.color, data: d.data })),
    [docs],
  )
  return {
    photos,
    loading,
    /** Ajoute des images (redimensionnées) dans la limite de 20 ; renvoie les identifiants créés et le nombre refusé. */
    add: async (files: FileList | File[] | null): Promise<{ ids: string[]; skipped: number; failed: number }> => {
      const images = Array.from(files ?? []).filter((f) => f.type.startsWith('image/'))
      const room = Math.max(0, MAX_PHOTOS - photos.length)
      const ids: string[] = []
      let failed = 0
      for (const f of images.slice(0, room)) {
        try {
          const data = await resizeImage(f)
          const id = newId('p')
          fire(photosRepo.upsert(id, { tripId: trip.id, data, at: Date.now() + ids.length, ownerId: null }))
          ids.push(id)
        } catch {
          failed++
        }
      }
      return { ids, skipped: Math.max(0, images.length - room), failed }
    },
    remove: (photo: Photo) => fire(photosRepo.remove(photo.id)),
  }
}

/* ---------- Résumé pour l'accueil du QG ---------- */
/** Texte de la carte du module sur l'accueil du QG (n'a pas besoin du fournisseur). */
export function useCarnetSummary() {
  const trips = useCollection<TripDoc>('trips')
  const preps = useCollection<PrepDoc>('tripPreps')
  return useMemo(() => {
    const today = new Date()
    const next = trips.docs
      .map(toTrip)
      .filter((t) => !isPast(t, today))
      .sort((a, b) => a.start.localeCompare(b.start))[0]
    if (!next) return { title: trips.loading ? '…' : 'Aucun voyage prévu' }
    const days = daysUntil(next, today)
    const prep = preps.docs.find((p) => p.id === next.id)
    const done = prep ? Object.values(prep.steps ?? {}).filter((s) => s?.status === 'ok').length : 0
    return {
      title: next.name,
      note: days > 1 ? `dans ${days} jours` : days === 1 ? 'demain' : days === 0 ? 'c’est aujourd’hui' : `${done}/9 étapes`,
    }
  }, [trips.docs, trips.loading, preps.docs])
}

/* ---------- Démo ---------- */
/**
 * Démo (VITE_SEED_DEMO seulement). Chacun ne peut écrire que ses propres documents :
 * chaque personne sème ses voyages personnels ; la première à arriver sème aussi
 * les voyages communs, leurs dépenses, photos, pages de carnet et la préparation.
 */
export const carnetSeeder: DemoSeeder = {
  name: 'carnet',
  async run({ scope, uidOf }) {
    const me = (['alex', 'antoine'] as const).find((p) => uidOf(p) === scope.uid)
    if (!me) return
    const trips = repo<TripDoc>('trips', scope)
    const expenses = repo<ExpenseDoc>('tripExpenses', scope)
    const photos = repo<PhotoDoc>('tripPhotos', scope)
    const notes = repo<NoteDoc>('tripNotes', scope)
    const preps = repo<PrepDoc>('tripPreps', scope)

    if (await preps.isEmptyOnServer()) {
      await Promise.all([
        ...TRIPS.filter((t) => t.owner === 'both').map((t) => trips.upsert(t.id, tripToDoc(t, null))),
        ...ROME_EXPENSES.map(({ id, ...e }) => expenses.upsert(id, { ...e, tripId: 'rome', ownerId: null })),
        ...TRIPS.flatMap((t) =>
          Array.from({ length: t.photos }, (_, i) =>
            photos.upsert(`${t.id}-demo${i}`, { tripId: t.id, color: PHOTO_COLORS[i % PHOTO_COLORS.length], at: i, ownerId: null }),
          ),
        ),
        notes.upsert('rome_mode', { tripId: 'rome', mode: ROME_NOTEBOOK.mode!, ownerId: null }),
        ...ROME_NOTEBOOK.pages.map((p, i) => notes.upsert(pageId('rome', i), { tripId: 'rome', index: i, ...p, ownerId: null })),
        preps.upsert(NEXT_TRIP_ID, { ...prepDoc(lisbonPrep(), 1), ownerId: null }),
      ])
    }
    if (await trips.isEmptyOnServer('mine')) {
      await Promise.all(TRIPS.filter((t) => t.owner === me).map((t) => trips.upsert(t.id, tripToDoc(t, scope.uid))))
    }
  },
}
