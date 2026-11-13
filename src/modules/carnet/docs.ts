import type { BaseDoc, DeepPartial, WithId } from '../../lib/data'
import type { Person } from '../../shared/person'
import { STEP_ORDER } from './data/demo'
import type { Activity, Expense, PackItem, Payer, Photo, Prefs, PrepTrip, Step, StepLine, Trip } from './types'

/** Documents Firestore du Carnet et conversions pures (testées dans tests/unit/carnet.test.ts). */
/** Firestore refuse les tableaux de tableaux : repères et propositions sont stockés comme objets. */
export type PinDoc = { label: string; lon: number; lat: number }
export type StepDoc = Omit<Step, 'proposals'> & { proposals: { lines: StepLine[] }[] }
export type TripDoc = Omit<Trip, 'id' | 'pins'> & BaseDoc & { pins: PinDoc[] }
export type ExpenseDoc = Omit<Expense, 'id' | 'pending'> & BaseDoc & { tripId: string }
export type PhotoDoc = BaseDoc & { tripId: string; at: number; data?: string; color?: Photo['color'] }
/** `tripNotes` : `<tripId>_mode` (format du carnet) et `<tripId>_<NNN>` (une page). */
export type NoteDoc = BaseDoc & { tripId: string; mode?: 'free' | 'daily'; index?: number; title?: string; text?: string; author?: Person; photos?: string[] }
export type PrepDoc = BaseDoc & {
  name: string
  ideal: number
  limit: number
  at: number
  steps: Partial<Record<Step['id'], StepDoc>>
  pack: Record<Payer, PackItem[]>
  packParams: string[]
  activities: Activity[]
}
export type PrefsDoc = BaseDoc & Partial<Prefs>


const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

export const encodeStep = (st: Step): StepDoc => ({ ...st, proposals: st.proposals.map((lines) => ({ lines })) })
export const decodeStep = (d: StepDoc): Step => ({ ...d, proposals: (d.proposals ?? []).map((p) => p.lines ?? []) })
export const toTrip = (d: WithId<TripDoc>): Trip => ({ ...(d as object), pins: (d.pins ?? []).map((p): [string, number, number] => [p.label, p.lon, p.lat]) }) as unknown as Trip
export const tripToDoc = ({ id: _id, pins, ...t }: Trip, ownerId: string | null) => ({ ...t, pins: pins.map(([label, lon, lat]) => ({ label, lon, lat })), ownerId })

export const toPrep = (d: WithId<PrepDoc>): PrepTrip => ({
  id: d.id,
  name: d.name,
  ideal: d.ideal,
  limit: d.limit,
  steps: STEP_ORDER.map((id) => d.steps?.[id]).filter((s): s is StepDoc => !!s).map(decodeStep),
  pack: d.pack ?? { alex: [], antoine: [], commun: [] },
  packParams: d.packParams ?? [],
  activities: d.activities ?? [],
})

/** Ce qui a changé entre deux préparations : une étape modifiée = un champ de `steps` (pas de conflit entre étapes). */
export function prepPatch(before: PrepTrip, after: PrepTrip): DeepPartial<PrepDoc> {
  const patch: DeepPartial<PrepDoc> = {}
  if (before.name !== after.name) patch.name = after.name
  if (before.ideal !== after.ideal) patch.ideal = after.ideal
  if (before.limit !== after.limit) patch.limit = after.limit
  if (!same(before.pack, after.pack)) patch.pack = after.pack
  if (!same(before.packParams, after.packParams)) patch.packParams = after.packParams
  if (!same(before.activities, after.activities)) patch.activities = after.activities
  const steps: Partial<Record<Step['id'], StepDoc>> = {}
  for (const s of after.steps) {
    const old = before.steps.find((x) => x.id === s.id)
    if (!same(old, s)) steps[s.id] = encodeStep(s)
  }
  if (Object.keys(steps).length) patch.steps = steps as DeepPartial<PrepDoc>['steps']
  return patch
}

export const prepDoc = (p: PrepTrip, at: number) => ({
  name: p.name,
  ideal: p.ideal,
  limit: p.limit,
  at,
  steps: Object.fromEntries(p.steps.map((s) => [s.id, encodeStep(s)])),
  pack: p.pack,
  packParams: p.packParams,
  activities: p.activities,
})

