import type { CatId, Expense, Offer, PrepTrip, Step, Trip } from './types'

/**
 * Règles métier du Carnet de voyage : fonctions pures, testées dans tests/unit.
 */

/** « 1 072 € » (espace insécable avant le symbole). */
export const eur = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} €`

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
export const totalOf = (expenses: Expense[]) => sum(expenses.map((e) => e.amount))

const WEIGHTS: [CatId, number, string, 'alex' | 'antoine' | 'commun'][] = [
  ['transport', 0.28, 'Trajet aller-retour', 'alex'],
  ['logement', 0.4, 'Logement', 'commun'],
  ['resto', 0.14, 'Restaurants', 'antoine'],
  ['activites', 0.08, 'Visites', 'alex'],
  ['courses', 0.04, 'Courses', 'antoine'],
  ['shopping', 0.03, 'Souvenirs', 'alex'],
  ['local', 0.03, 'Transports sur place', 'antoine'],
]

/** Dépenses de démonstration d'un voyage dont seul le total est connu. */
export function generatedExpenses(trip: Trip, dayLabel: string): Expense[] {
  let acc = 0
  return WEIGHTS.map(([cat, weight, label, who], i) => {
    const amount = i === WEIGHTS.length - 1 ? trip.total - acc : Math.round(trip.total * weight)
    acc += amount
    return { id: `${trip.id}-gen${i}`, cat, label, amount, who: trip.owner === 'both' ? who : trip.owner, day: dayLabel, at: i }
  }).filter((e) => e.amount > 0)
}

export interface Balance {
  paidByAlex: number
  paidByAntoine: number
  fromSavings: number
  /** > 0 : Antoine doit ce montant à Alex ; < 0 : Alex doit à Antoine. */
  diff: number
  quits: boolean
}

/**
 * Qui doit quoi : on ne compte que les dépenses payées par Alex ou Antoine.
 * Les dépenses de l'épargne commune n'entrent jamais dans le calcul.
 */
export function balance(expenses: Expense[]): Balance {
  const paidByAlex = sum(expenses.filter((e) => e.who === 'alex').map((e) => e.amount))
  const paidByAntoine = sum(expenses.filter((e) => e.who === 'antoine').map((e) => e.amount))
  const fromSavings = sum(expenses.filter((e) => e.who === 'commun').map((e) => e.amount))
  const diff = paidByAlex - (paidByAlex + paidByAntoine) / 2
  return { paidByAlex, paidByAntoine, fromSavings, diff, quits: Math.abs(diff) < 1 }
}

export function balanceText(trip: Pick<Trip, 'owner'>, expenses: Expense[], settled = false): string {
  if (trip.owner !== 'both') return 'Rien à partager'
  const b = balance(expenses)
  if (settled || b.quits) return 'Vous êtes quittes'
  return b.diff > 0 ? `Antoine doit ${eur(b.diff)} à Alex` : `Alex doit ${eur(-b.diff)} à Antoine`
}

/** Idéal et limite d'un voyage ; déduits du total quand ils ne sont pas fixés. */
export function budgetBounds(trip: Pick<Trip, 'ideal' | 'limit' | 'total'>) {
  return {
    ideal: trip.ideal ?? Math.round((trip.total * 0.95) / 50) * 50,
    limit: trip.limit ?? Math.round((trip.total * 1.2) / 50) * 50,
  }
}

export type BudgetLevel = 'under' | 'overIdeal' | 'overLimit'

export function budgetStatus(total: number, ideal: number, limit: number): { level: BudgetLevel; label: string } {
  if (total > limit) return { level: 'overLimit', label: 'Au-dessus de la limite' }
  if (total > ideal) return { level: 'overIdeal', label: `${eur(total - ideal)} au-dessus de l’idéal` }
  return { level: 'under', label: 'Sous l’idéal' }
}

/** Position (0 à 1) sur la jauge, plafonnée à 115 % de la limite. */
export function gaugePosition(value: number, limit: number): number {
  const max = limit * 1.15
  return max > 0 ? Math.min(1, Math.max(0, value / max)) : 0
}

export const stepsDone = (steps: Step[]) => steps.filter((s) => s.status === 'ok').length

/** Étape suggérée : la première qui n'est pas validée. */
export const suggestedStep = (steps: Step[]) => steps.find((s) => s.status !== 'ok')

export const budgetTotal = (step: Step | undefined) => (step?.budget ? sum(Object.values(step.budget)) : 0)

export const plannedBudget = (prep: PrepTrip) => budgetTotal(prep.steps.find((s) => s.id === 'budget'))

export function stepSummary(step: Step, prep: PrepTrip): string {
  if (step.kind === 'budget') return `${eur(budgetTotal(step))} au total`
  if (step.kind === 'pack') {
    const all = [...prep.pack.alex, ...prep.pack.antoine, ...prep.pack.commun]
    return `${all.filter((i) => i.done).length}/${all.length} affaires prêtes`
  }
  if (step.kind === 'acts') {
    const booked = prep.activities.filter((a) => a.status > 0).length
    return `${prep.activities.length} activités · ${booked} réservée(s)`
  }
  const first = step.proposals[step.selected]?.[0]
  return step.filled && first?.v ? first.v : 'À remplir'
}

/**
 * Régénération : seules les lignes non gardées changent ; chaque ligne passe
 * à sa proposition suivante, l'ancienne valeur retourne en fin de liste.
 */
export function regenerate(step: Step): Step {
  const proposals = step.proposals.map((lines, i) =>
    i !== step.selected
      ? lines
      : lines.map((l) => {
          if (l.locked || l.alts.length === 0) return l
          const [next, ...rest] = l.alts
          return { ...l, v: next, alts: l.v ? [...rest, l.v] : rest }
        }),
  )
  const status = step.status === 'todo' || step.status === 'wip' ? 'ia' : step.status
  return { ...step, proposals, status, filled: true }
}

/**
 * Import d'une réponse collée depuis Claude : une ligne « Libellé : valeur »
 * remplit la ligne du même libellé ; les autres lignes remplissent, dans
 * l'ordre, les lignes restantes. Les lignes gardées ne changent pas.
 */
export function importResponse(step: Step, text: string): Step {
  const rows = text
    .split('\n')
    .map((r) => r.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').trim())
    .filter(Boolean)
  if (rows.length === 0) return step
  const lines = step.proposals[step.selected].map((l) => ({ ...l }))
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
  const touched = new Set<number>()
  const rest: string[] = []
  for (const row of rows) {
    const m = /^([^:]{1,40}?)\s*:\s*(.+)$/.exec(row)
    const i = m ? lines.findIndex((l, k) => !touched.has(k) && norm(l.k).startsWith(norm(m[1]))) : -1
    if (m && i >= 0) {
      if (!lines[i].locked) lines[i].v = m[2].trim()
      touched.add(i)
    } else rest.push(row)
  }
  for (const row of rest) {
    const i = lines.findIndex((l, k) => !touched.has(k) && !l.locked)
    if (i < 0) break
    lines[i].v = row
    touched.add(i)
  }
  const proposals = step.proposals.map((p, i) => (i === step.selected ? lines : p))
  return { ...step, proposals, status: step.status === 'ok' ? 'ok' : 'ia', filled: true }
}

/** Demande à copier pour générer une étape avec Claude. */
export function claudePrompt(prep: PrepTrip, step: Step, adjust: string): string {
  const lines = step.proposals[step.selected] ?? []
  const kept = lines.filter((l) => l.locked && l.v).map((l) => `- ${l.k} : ${l.v}`)
  const wanted = lines.filter((l) => !l.locked).map((l) => `- ${l.k} :`)
  return [
    `Nous préparons un voyage à deux : ${prep.name}.`,
    `Budget idéal ${eur(prep.ideal)}, limite ${eur(prep.limit)}.`,
    `Étape à préparer : ${step.title}.`,
    kept.length ? `À garder tel quel :\n${kept.join('\n')}` : '',
    adjust.trim() ? `Ajustement demandé : ${adjust.trim()}.` : '',
    `Réponds uniquement avec ces lignes, au format « Libellé : valeur » :\n${wanted.join('\n')}`,
  ]
    .filter(Boolean)
    .join('\n\n')
}

export interface TripStats {
  total: number
  trips: number
  countries: { name: string; continent: string; count: number; amount: number }[]
  continents: number
  days: number
  byCategory: Record<CatId, number>
}

export function tripDays(trip: Pick<Trip, 'start' | 'end'>): number {
  const [a, b] = [trip.start, trip.end].map((iso) => {
    const [y, m, d] = iso.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  })
  return Math.round((b - a) / 86400000) + 1
}

export function tripStats(trips: Trip[], expensesOf: (t: Trip) => Expense[]): TripStats {
  const byCategory = { transport: 0, logement: 0, resto: 0, activites: 0, courses: 0, shopping: 0, local: 0 }
  const countries = new Map<string, TripStats['countries'][number]>()
  let total = 0
  for (const t of trips) {
    const ex = expensesOf(t)
    const amount = totalOf(ex)
    total += amount
    for (const e of ex) byCategory[e.cat] += e.amount
    const c = countries.get(t.country) ?? { name: t.country, continent: t.continent, count: 0, amount: 0 }
    c.count++
    c.amount += amount
    countries.set(t.country, c)
  }
  return {
    total,
    trips: trips.length,
    countries: [...countries.values()].sort((a, b) => b.amount - a.amount),
    continents: new Set(trips.map((t) => t.continent)).size,
    days: sum(trips.map(tripDays)),
    byCategory,
  }
}

const first = (v: string[] | undefined) => v?.[0]

/** Filtres de Discover. « Budget compté » règle l'unité du budget max. */
export function matchesFilters(o: Offer, f: Record<string, string[]>): boolean {
  const budget = first(f.budget)
  if (budget && budget !== 'Sans limite' && o.price != null) {
    const max = Number(budget.replace(/\D/g, ''))
    const price = first(f.per) === 'Par personne' ? o.price / 2 : o.price
    if (price > max) return false
  }
  if (f.zone?.length && !f.zone.some((z) => o.zones.includes(z) || z === 'Monde')) return false
  const duree = first(f.duree)
  if (duree === 'Week-end' && o.nights > 2) return false
  if (duree === '3-4 j' && (o.nights < 2 || o.nights > 4)) return false
  if (duree === 'Une semaine' && (o.nights < 5 || o.nights > 8)) return false
  if (duree === '10 j et plus' && o.nights < 9) return false
  if (f.theme?.length && !f.theme.some((t) => o.themes.includes(t))) return false
  const trajet = first(f.trajet)
  if (trajet && trajet !== 'Peu importe' && o.hours > Number(trajet.replace(/\D/g, ''))) return false
  if (f.mode?.length && !f.mode.includes(o.transport)) return false
  const quand = first(f.quand)
  if (quand && quand !== 'Dates précises' && !o.when.includes(quand)) return false
  if (first(f.visa) === 'Sans visa uniquement' && o.visa) return false
  const meteo = first(f.meteo)
  if (meteo === 'Chaud, + 20 °C' && o.temp < 20) return false
  if (meteo === 'Doux' && (o.temp < 12 || o.temp >= 20)) return false
  return true
}

/** Nombre de filtres actifs (« Budget compté » ne compte pas). */
export const activeFilters = (f: Record<string, string[]>) =>
  Object.entries(f).filter(([id, v]) => id !== 'per' && v.length > 0).length
