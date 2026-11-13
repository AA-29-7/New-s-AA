import { addDays, isoDate } from '../../shared/lib/dates'
import { PERSONS, type Owner, type Person } from '../../shared/people'
import type { StickerColor } from '../../shared/ui'

/**
 * Habitudes : types et règles pures (séries, régularité, récaps, duel),
 * testées dans tests/unit/habitudes.test.ts.
 */
export interface Category {
  id: string
  name: string
  emoji: string
  color: StickerColor
}

export interface Habit {
  id: string
  title: string
  emoji: string
  /** '' = sans catégorie : le fond vient alors de `color`. */
  categoryId: string
  color: StickerColor
  owner: Owner
  /** Habitude commune : « À deux » (une série pour deux) ou « Chacun la sienne ». */
  rule: 'both' | 'each'
  /** Un oubli par semaine ne casse pas la série. */
  joker: boolean
  /** Jours prévus, lundi en premier. */
  days: boolean[]
  reminder: boolean
}

/** Coches : date ISO → personnes qui ont fait l'habitude ce jour-là. */
export type Checks = Record<string, Person[]>

export interface Goal {
  id: string
  title: string
  emoji: string
  color: StickerColor
  owner: Owner
  current: number
  target: number
  unit: string
  deadline: string
}

/** Lundi = 0 … dimanche = 6. */
export const weekday = (d: Date) => (d.getDay() + 6) % 7
export const scheduled = (h: Habit, d: Date) => h.days[weekday(d)]

/** Qui coche cette habitude : son propriétaire, ou chacun pour une commune. */
export const doers = (h: Habit): Person[] => (h.owner === 'both' ? PERSONS : [h.owner])
export const canCheck = (h: Habit, p: Person) => h.owner === 'both' || h.owner === p
/** Habitudes qui concernent une personne (les siennes et les communes). */
export const habitsOf = (habits: Habit[], p: Person) => habits.filter((h) => canCheck(h, p))

export const didOn = (checks: Checks, iso: string, p: Person) => !!checks[iso]?.includes(p)

/**
 * Le jour compte-t-il pour la série de `p` ? Pour une habitude commune
 * « À deux », il faut que les deux l'aient faite.
 */
function dayDone(h: Habit, checks: Checks, iso: string, p: Person) {
  if (h.owner === 'both' && h.rule === 'both') return PERSONS.every((x) => didOn(checks, iso, x))
  return didOn(checks, iso, p)
}

const weekKey = (d: Date) => isoDate(addDays(d, -weekday(d)))

/**
 * Série en cours : jours prévus consécutifs faits, en remontant depuis
 * aujourd'hui (aujourd'hui compte s'il est fait, sinon on part d'hier).
 * Avec le joker, un oubli par semaine est pardonné (il ne compte pas).
 */
export function currentStreak(h: Habit, checks: Checks, p: Person, today: Date, horizon = 400): number {
  let n = 0
  const jokers = new Set<string>()
  for (let i = 0; i < horizon; i++) {
    const d = addDays(today, -i)
    if (!scheduled(h, d)) continue
    const iso = isoDate(d)
    if (dayDone(h, checks, iso, p)) {
      n++
      continue
    }
    if (i === 0) continue
    const wk = weekKey(d)
    if (h.joker && !jokers.has(wk)) {
      jokers.add(wk)
      continue
    }
    break
  }
  return n
}

/** Plus longue série sur l'historique disponible. */
export function longestStreak(h: Habit, checks: Checks, p: Person, today: Date, horizon = 400): number {
  let best = 0
  let run = 0
  const jokers = new Set<string>()
  for (let i = horizon - 1; i >= 0; i--) {
    const d = addDays(today, -i)
    if (!scheduled(h, d)) continue
    if (dayDone(h, checks, isoDate(d), p)) {
      run++
    } else if (i > 0) {
      const wk = weekKey(d)
      if (h.joker && !jokers.has(wk)) jokers.add(wk)
      else run = 0
    }
    best = Math.max(best, run)
  }
  return best
}

/** Coches par habitude : identifiant → coches. */
export type History = Record<string, Checks>

/** Part (0 à 1) des habitudes prévues faites par `p` un jour donné ; null si rien n'était prévu. */
export function ratioOn(habits: Habit[], history: History, p: Person, d: Date): number | null {
  const mine = habitsOf(habits, p).filter((h) => scheduled(h, d))
  if (mine.length === 0) return null
  const iso = isoDate(d)
  return mine.filter((h) => didOn(history[h.id] ?? {}, iso, p)).length / mine.length
}

/** Niveau de calendrier : 0 rien, 1 un peu, 2 presque, 3 tout fait. */
export function level(ratio: number | null): 0 | 1 | 2 | 3 {
  if (ratio == null || ratio === 0) return 0
  if (ratio >= 1) return 3
  return ratio >= 0.6 ? 2 : 1
}

function daysRange(from: Date, to: Date): Date[] {
  const out: Date[] = []
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d)
  return out
}

/** Régularité moyenne entre deux dates (jours sans habitude prévue ignorés). */
export function regularity(habits: Habit[], history: History, p: Person, from: Date, to: Date): number {
  const r = daysRange(from, to)
    .map((d) => ratioOn(habits, history, p, d))
    .filter((x): x is number => x != null)
  return r.length ? r.reduce((a, b) => a + b, 0) / r.length : 0
}

export function perfectDays(habits: Habit[], history: History, p: Person, from: Date, to: Date): number {
  return daysRange(from, to).filter((d) => ratioOn(habits, history, p, d) === 1).length
}

/** Plus longue suite de jours parfaits consécutifs. */
export function perfectRun(habits: Habit[], history: History, p: Person, from: Date, to: Date): number {
  let best = 0
  let run = 0
  for (const d of daysRange(from, to)) {
    const r = ratioOn(habits, history, p, d)
    if (r == null) continue
    run = r === 1 ? run + 1 : 0
    best = Math.max(best, run)
  }
  return best
}

/** Nombre de coches de `p` entre deux dates. */
export function checkCount(habits: Habit[], history: History, p: Person, from: Date, to: Date): number {
  let n = 0
  for (const d of daysRange(from, to)) {
    const iso = isoDate(d)
    for (const h of habitsOf(habits, p)) if (didOn(history[h.id] ?? {}, iso, p)) n++
  }
  return n
}

/** Part des jours prévus où une habitude a été faite. */
export function habitRate(h: Habit, history: History, p: Person, from: Date, to: Date): number {
  const days = daysRange(from, to).filter((d) => scheduled(h, d))
  if (days.length === 0) return 0
  return days.filter((d) => didOn(history[h.id] ?? {}, isoDate(d), p)).length / days.length
}

export interface DuelRow {
  label: string
  values: Record<Person, number>
  format: (n: number) => string
}

/** Duel du mois : quatre manches, chacune gagnée par le meilleur score. */
export function duel(habits: Habit[], history: History, monthStart: Date, today: Date) {
  const rows: DuelRow[] = [
    {
      label: 'Régularité du mois',
      values: { alex: Math.round(regularity(habits, history, 'alex', monthStart, today) * 100), antoine: Math.round(regularity(habits, history, 'antoine', monthStart, today) * 100) },
      format: (n) => `${n} %`,
    },
    {
      label: 'Jours parfaits',
      values: { alex: perfectDays(habits, history, 'alex', monthStart, today), antoine: perfectDays(habits, history, 'antoine', monthStart, today) },
      format: String,
    },
    {
      label: 'Plus longue série',
      values: {
        alex: Math.max(0, ...habitsOf(habits, 'alex').map((h) => longestStreak(h, history[h.id] ?? {}, 'alex', today))),
        antoine: Math.max(0, ...habitsOf(habits, 'antoine').map((h) => longestStreak(h, history[h.id] ?? {}, 'antoine', today))),
      },
      format: (n) => `${n} j`,
    },
    {
      label: 'Habitudes tenues',
      values: {
        alex: habitsOf(habits, 'alex').filter((h) => habitRate(h, history, 'alex', monthStart, today) >= 0.8).length,
        antoine: habitsOf(habits, 'antoine').filter((h) => habitRate(h, history, 'antoine', monthStart, today) >= 0.8).length,
      },
      format: String,
    },
  ]
  const score = { alex: 0, antoine: 0 }
  for (const r of rows) {
    if (r.values.alex > r.values.antoine) score.alex++
    else if (r.values.antoine > r.values.alex) score.antoine++
  }
  return { rows, score }
}

/** « Encore n à cocher » → « Plus qu'une habitude » → « Journée bouclée, bravo ». */
export function headline(left: number): string {
  if (left <= 0) return 'Journée bouclée, bravo'
  if (left === 1) return 'Plus qu’une habitude'
  return `Encore ${left} à cocher`
}

export function toggleCheck(checks: Checks, iso: string, p: Person): Checks {
  const cur = checks[iso] ?? []
  const next = cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]
  const out = { ...checks }
  if (next.length) out[iso] = next
  else delete out[iso]
  return out
}

export const monthStartOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)
