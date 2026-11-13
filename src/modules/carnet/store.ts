import { useCallback, useMemo } from 'react'
import { daysBetween, parseIso } from '../../shared/lib/dates'
import { useStored } from '../../shared/lib/localStore'
import { NEXT_TRIP_ID, PHOTO_COLORS, ROME_EXPENSES, ROME_NOTEBOOK, TRIPS, lisbonPrep } from './data/demo'
import { generatedExpenses } from './logic'
import type { CarnetState, Expense, Notebook, Photo, PrepTrip, Step, Trip } from './types'

const KEY = 'qg_carnet_v1'

const shortMonth = (iso: string) => parseIso(iso).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })

/** État de départ : les données de démonstration du prototype. */
const INITIAL: CarnetState = {
  expenses: { rome: ROME_EXPENSES, [NEXT_TRIP_ID]: [] },
  settled: {},
  photos: {},
  notebooks: { rome: ROME_NOTEBOOK },
  preps: { [NEXT_TRIP_ID]: lisbonPrep() },
  prepOrder: [NEXT_TRIP_ID],
  saved: [],
  dismissed: [],
  homeOrder: ['prep', 'frise', 'saved', 'souv', 'solde', 'budget'],
  homeOn: { prep: true, frise: true, saved: true },
  origin: 'Paris',
  lastCat: 'resto',
  filters: { per: ['Pour deux'] },
}

export const EMPTY_NOTEBOOK: Notebook = { mode: null, view: 'write', current: 0, pages: [] }

export const tripById = (id: string | undefined): Trip | undefined => TRIPS.find((t) => t.id === id)

export function demoPhotos(trip: Trip): Photo[] {
  return Array.from({ length: trip.photos }, (_, i) => ({ id: `${trip.id}-demo-${i}`, color: PHOTO_COLORS[i % PHOTO_COLORS.length] }))
}

/** Jours avant le départ (négatif une fois parti). */
export const daysUntil = (trip: Trip, today = new Date()) => daysBetween(today, parseIso(trip.start))

/** Jour du voyage en cours (1 = jour du départ), ou null hors du voyage. */
export function tripDay(trip: Trip, today = new Date()): number | null {
  const n = daysBetween(parseIso(trip.start), today) + 1
  return n >= 1 && daysBetween(today, parseIso(trip.end)) >= 0 ? n : null
}

/** État du Carnet gardé sur l'appareil, avec ses actions. */
export function useCarnet() {
  const [state, setState] = useStored<CarnetState>(KEY, INITIAL)

  const update = useCallback((fn: (s: CarnetState) => Partial<CarnetState>) => setState((s) => ({ ...s, ...fn(s) })), [setState])

  return useMemo(() => {
    const expensesOf = (trip: Trip): Expense[] => state.expenses[trip.id] ?? generatedExpenses(trip, shortMonth(trip.start))
    const photosOf = (trip: Trip): Photo[] => state.photos[trip.id] ?? demoPhotos(trip)
    const notebookOf = (tripId: string): Notebook => state.notebooks[tripId] ?? EMPTY_NOTEBOOK

    const setPrep = (id: string, fn: (p: PrepTrip) => PrepTrip) =>
      update((s) => (s.preps[id] ? { preps: { ...s.preps, [id]: fn(s.preps[id]) } } : {}))

    return {
      state,
      update,
      expensesOf,
      photosOf,
      notebookOf,
      addExpense: (trip: Trip, e: Omit<Expense, 'id'>) =>
        update((s) => ({
          expenses: { ...s.expenses, [trip.id]: [...(s.expenses[trip.id] ?? generatedExpenses(trip, shortMonth(trip.start))), { ...e, id: `e${Date.now()}` }] },
          settled: { ...s.settled, [trip.id]: false },
          lastCat: e.cat,
        })),
      settle: (tripId: string) => update((s) => ({ settled: { ...s.settled, [tripId]: true } })),
      setPhotos: (trip: Trip, fn: (p: Photo[]) => Photo[]) =>
        update((s) => ({ photos: { ...s.photos, [trip.id]: fn(s.photos[trip.id] ?? demoPhotos(trip)) } })),
      setNotebook: (tripId: string, fn: (n: Notebook) => Notebook) =>
        update((s) => ({ notebooks: { ...s.notebooks, [tripId]: fn(s.notebooks[tripId] ?? EMPTY_NOTEBOOK) } })),
      setPrep,
      setStep: (prepId: string, stepId: Step['id'], fn: (st: Step) => Step) =>
        setPrep(prepId, (p) => ({ ...p, steps: p.steps.map((st) => (st.id === stepId ? fn(st) : st)) })),
      addPrep: (prep: PrepTrip) =>
        update((s) => ({ preps: { ...s.preps, [prep.id]: prep }, prepOrder: [...s.prepOrder.filter((id) => id !== prep.id), prep.id] })),
      toggleSaved: (id: number) =>
        update((s) => ({ saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id] })),
      dismiss: (id: number) => update((s) => ({ dismissed: [...s.dismissed.filter((x) => x !== id), id] })),
    }
  }, [state, update])
}

export type Carnet = ReturnType<typeof useCarnet>
