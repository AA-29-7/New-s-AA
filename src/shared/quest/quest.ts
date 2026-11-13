import { daysInMonth } from '../lib/dates'
import { otherOf, type Person } from '../people'
import type { StickerColor } from '../ui/basics'

/**
 * La quête du QG : un défi par mois, proposé en tour de rôle.
 * Règles pures (sans React ni stockage), testées dans tests/unit.
 */
export interface Challenge {
  emoji: string
  color: StickerColor
  title: string
  /** Vrai si le défi se fait à deux. */
  both: boolean
  description: string
}

export type QuestStatus = 'proposed' | 'accepted' | 'refused'
export type Review = 'yes' | 'part' | 'no'

export interface Quest {
  /** Mois du défi, « AAAA-MM ». */
  month: string
  challenge: Challenge
  /** Personne qui a choisi le défi. */
  chooser: Person
  status: QuestStatus
  /** Jours du mois cochés par chacun. */
  checks: Record<Person, number[]>
  /** Bilan de fin de mois, par personne. */
  /** Bilan de fin de mois par personne ; null = bilan retiré. */
  review: Partial<Record<Person, Review | null>>
}

export type QuestBook = Record<string, Quest>

export type QuestOutcome = 'proposed' | 'unanswered' | 'refused' | 'running' | 'done' | 'partial' | 'missed' | 'unreviewed'

export const OUTCOME_LABEL: Record<QuestOutcome, string> = {
  proposed: 'Proposé',
  unanswered: 'Sans réponse',
  refused: 'Refusé',
  running: 'En cours',
  done: 'Réalisé',
  partial: 'En partie',
  missed: 'Pas fait',
  unreviewed: 'Bilan à faire',
}

export const CHALLENGE_IDEAS: Challenge[] = [
  {
    emoji: '📵',
    color: 'mist',
    title: 'Pas d’écran après 22 h',
    both: true,
    description: 'Écrans éteints à 22 h, tous les soirs du mois. Une habitude commune est ajoutée à vos listes.',
  },
  {
    emoji: '🚶',
    color: 'coral',
    title: '8 000 pas par jour',
    both: false,
    description: 'Chacun relève le défi de son côté. On compare les totaux à la fin du mois.',
  },
  {
    emoji: '📸',
    color: 'honey',
    title: 'Une photo par jour',
    both: false,
    description: 'Une photo chaque jour, à retrouver dans le Carnet à la fin du mois.',
  },
  {
    emoji: '🍳',
    color: 'sage',
    title: 'Un plat nouveau par semaine',
    both: true,
    description: 'Quatre recettes inédites à cuisiner à deux, avec une note par plat.',
  },
  {
    emoji: '✍️',
    color: 'lavender',
    title: 'Trois gratitudes par jour',
    both: false,
    description: 'À écrire dans ton Journal, qui reste privé. Seule ta série est visible.',
  },
]

export const challengeTag = (c: Challenge) => (c.both ? 'Ensemble' : 'Chacun de son côté')

export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function monthDate(key: string): Date {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, 1)
}

export function shiftMonth(key: string, delta: number): string {
  const d = monthDate(key)
  return monthKey(new Date(d.getFullYear(), d.getMonth() + delta, 1))
}

export function monthLength(key: string): number {
  const d = monthDate(key)
  return daysInMonth(d.getFullYear(), d.getMonth())
}

/** Tour de rôle : Antoine choisit en novembre 2026, Alex en décembre, etc. */
export function chooserFor(key: string): Person {
  const d = monthDate(key)
  return (d.getFullYear() * 12 + d.getMonth()) % 2 === 0 ? 'antoine' : 'alex'
}

/** Jours consécutifs cochés jusqu'à aujourd'hui (ou hier si aujourd'hui n'est pas encore coché). */
export function questStreak(checks: number[], today: number): number {
  const set = new Set(checks)
  let day = set.has(today) ? today : today - 1
  let n = 0
  while (day >= 1 && set.has(day)) {
    n++
    day--
  }
  return n
}

export function toggleDay(checks: number[], day: number): number[] {
  return checks.includes(day) ? checks.filter((d) => d !== day) : [...checks, day].sort((a, b) => a - b)
}

/** État d'un défi vu depuis le mois courant. */
export function outcomeOf(q: Quest, currentMonth: string): QuestOutcome {
  if (q.status === 'refused') return 'refused'
  // Une proposition restée sans réponse à la fin du mois n'est pas un refus.
  if (q.status === 'proposed') return q.month >= currentMonth ? 'proposed' : 'unanswered'
  const reviews = Object.values(q.review)
  if (reviews.includes('yes')) return 'done'
  if (reviews.includes('part')) return 'partial'
  if (reviews.includes('no')) return 'missed'
  return q.month >= currentMonth ? 'running' : 'unreviewed'
}

export function countOutcomes(book: QuestBook, currentMonth: string) {
  const all = Object.values(book).map((q) => outcomeOf(q, currentMonth))
  return {
    done: all.filter((o) => o === 'done').length,
    running: all.filter((o) => o === 'running' || o === 'proposed').length,
    missed: all.filter((o) => o === 'missed' || o === 'refused' || o === 'unanswered').length,
  }
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1)

/**
 * Données de démonstration, calées sur la date du premier lancement :
 * le défi du mois en cours et cinq mois d'historique (maquette 12d).
 */
export function seedQuests(today: Date): QuestBook {
  const current = monthKey(today)
  const day = today.getDate()
  const before = range(day - 1)
  const book: QuestBook = {}
  const add = (delta: number, idea: Challenge, patch: Partial<Quest>) => {
    const month = shiftMonth(current, delta)
    book[month] = {
      month,
      challenge: idea,
      chooser: chooserFor(month),
      status: 'accepted',
      checks: { alex: [], antoine: [] },
      review: {},
      ...patch,
    }
  }
  const ideas = CHALLENGE_IDEAS
  const fill = (month: string, n: number) => range(Math.min(n, monthLength(month)))

  const chooser = chooserFor(current)
  // Celui qui a choisi a déjà coché aujourd'hui ; l'autre a tout fait jusqu'à hier.
  add(0, ideas[0], {
    checks: {
      [chooser]: [...before.filter((d) => d !== 4 && d !== 9), day],
      [otherOf(chooser)]: before,
    } as Record<Person, number[]>,
  })
  const m1 = shiftMonth(current, -1)
  add(-1, ideas[4], { checks: { alex: fill(m1, 30), antoine: fill(m1, 27) }, review: { alex: 'yes', antoine: 'yes' } })
  add(-2, ideas[3], { status: 'refused' })
  const m3 = shiftMonth(current, -3)
  add(-3, ideas[2], { checks: { alex: fill(m3, 31), antoine: fill(m3, 24) }, review: { alex: 'yes', antoine: 'part' } })
  const m4 = shiftMonth(current, -4)
  add(-4, ideas[1], { checks: { alex: fill(m4, 26), antoine: fill(m4, 29) }, review: { alex: 'yes', antoine: 'yes' } })
  const m5 = shiftMonth(current, -5)
  add(
    -5,
    { emoji: '🧹', color: 'mint', title: 'Un coin rangé par jour', both: false, description: 'Un tiroir, une étagère, un coin de bureau : un petit rangement chaque jour.' },
    { checks: { alex: fill(m5, 11), antoine: fill(m5, 6) }, review: { alex: 'no', antoine: 'no' } },
  )
  return book
}
