import { addDays, isoDate } from '../../../shared/lib/dates'
import type { Person } from '../../../shared/person'
import { doers, scheduled, type Category, type Goal, type Habit, type History } from '../logic'

/**
 * Données de démonstration des Habitudes (reprises du prototype).
 * L'historique est généré de façon déterministe autour de la date du
 * premier lancement ; il sera remplacé par les collections `habits` /
 * `habitLogs` de Firestore.
 */
export const DEMO_CATEGORIES: Category[] = [
  { id: 'bien', name: 'Bien-être', emoji: '🧘', color: 'sage' },
  { id: 'sport', name: 'Sport', emoji: '🏃', color: 'coral' },
  { id: 'learn', name: 'Apprendre', emoji: '📖', color: 'honey' },
  { id: 'home', name: 'Maison', emoji: '🧹', color: 'mist' },
]

const ALL_DAYS = [true, true, true, true, true, true, true]
const habit = (id: string, title: string, emoji: string, categoryId: string, color: Habit['color'], owner: Habit['owner']): Habit => ({
  id, title, emoji, categoryId, color, owner, rule: 'both', joker: true, days: ALL_DAYS, reminder: false,
})

export const DEMO_HABITS: Habit[] = [
  habit('h1', 'Méditer 10 minutes', '🧘', 'bien', 'sage', 'alex'),
  habit('h2', 'Lire 20 pages', '📖', 'learn', 'honey', 'alex'),
  habit('h3', 'Étirements', '🤸', 'bien', 'coral', 'alex'),
  habit('h4', 'Marcher ensemble', '🚶', 'sport', 'coral', 'both'),
  habit('h5', 'Pas d’écran après 23 h', '📵', 'bien', 'mist', 'both'),
  habit('h6', 'Courir 30 minutes', '🏃', 'sport', 'honey', 'antoine'),
  habit('h7', 'Boire 1,5 L d’eau', '💧', 'bien', 'mist', 'antoine'),
  habit('h8', 'Pas de sucre le soir', '🍬', 'bien', 'coral', 'antoine'),
]

/** Série en cours (avant aujourd'hui), record et état du jour, comme dans le prototype. */
const SEED: Record<string, { streak: number; record: number; rate: number; today: Partial<Record<Person, boolean>> }> = {
  h1: { streak: 11, record: 31, rate: 0.8, today: {} },
  h2: { streak: 7, record: 19, rate: 0.85, today: { alex: true } },
  h3: { streak: 2, record: 9, rate: 0.55, today: {} },
  h4: { streak: 20, record: 21, rate: 0.8, today: { antoine: true } },
  h5: { streak: 4, record: 12, rate: 0.7, today: {} },
  h6: { streak: 13, record: 26, rate: 0.85, today: { antoine: true } },
  h7: { streak: 8, record: 15, rate: 0.8, today: { antoine: true } },
  h8: { streak: 2, record: 6, rate: 0.5, today: {} },
}

/** Pseudo-aléatoire stable (mêmes coches à chaque génération). */
function rand(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const HISTORY_DAYS = 400

export function seedHistory(today: Date): History {
  const history: History = {}
  DEMO_HABITS.forEach((h, k) => {
    const seed = SEED[h.id]
    const checks: History[string] = {}
    const r = rand(17 + k * 101)
    for (let i = HISTORY_DAYS; i >= 1; i--) {
      const d = addDays(today, -i)
      if (!scheduled(h, d)) continue
      const iso = isoDate(d)
      // Série récente : les `streak` derniers jours sont faits (par les deux pour une commune),
      // précédée d'un jour manqué qui la borne.
      const inStreak = i <= seed.streak
      const breaker = i > seed.streak && i <= seed.streak + 3
      const recordRun = i > seed.streak + 20 && i <= seed.streak + 20 + seed.record
      const people = doers(h).filter((_p, j) => {
        if (inStreak || recordRun) return true
        if (breaker) return j === 1 && h.owner === 'both'
        return r() < seed.rate * 0.75
      })
      if (people.length) checks[iso] = people
    }
    const t = doers(h).filter((p) => seed.today[p])
    if (t.length) checks[isoDate(today)] = t
    history[h.id] = checks
  })
  return history
}

export const DEMO_GOALS: Goal[] = [
  { id: 'g1', emoji: '🏃', color: 'coral', title: 'Courir un semi-marathon', owner: 'antoine', current: 13, target: 21, unit: 'km', deadline: '15 mars' },
  { id: 'g2', emoji: '🇵🇹', color: 'lavender', title: 'Apprendre 200 mots de portugais', owner: 'both', current: 140, target: 200, unit: 'mots', deadline: '26 nov.' },
  { id: 'g3', emoji: '📚', color: 'honey', title: 'Lire 24 livres cette année', owner: 'alex', current: 15, target: 24, unit: 'livres', deadline: '31 déc.' },
  { id: 'g4', emoji: '📖', color: 'honey', title: 'Lire 12 livres', owner: 'alex', current: 12, target: 12, unit: 'livres', deadline: 'sept.' },
  { id: 'g5', emoji: '🧘', color: 'sage', title: '100 jours de méditation', owner: 'alex', current: 100, target: 100, unit: 'jours', deadline: 'août' },
  { id: 'g6', emoji: '🏃', color: 'coral', title: 'Courir 10 km sans s’arrêter', owner: 'antoine', current: 10, target: 10, unit: 'km', deadline: 'juin' },
]

export const EMOJIS = ['🧘', '📖', '💧', '🏃', '🛏️', '🥗', '🧹', '🎸', '💪', '🚶', '🧠', '✍️', '🎨', '🌿', '☀️', '🍎']
