import { useEffect, useMemo, useState } from 'react'
import { isoDate } from '../../shared/lib/dates'
import { useStored } from '../../shared/lib/localStore'
import type { Person } from '../../shared/person'
import { DEMO_CATEGORIES, DEMO_GOALS, DEMO_HABITS, seedHistory } from './data/demo'
import { toggleCheck, type Category, type Goal, type Habit, type History } from './logic'

interface HabitsState {
  habits: Habit[]
  categories: Category[]
  goals: Goal[]
  history: History
  /** Mode d'affichage de l'onglet Aujourd'hui, gardé par appareil. */
  mode: 'who' | 'theme'
}

const KEY = 'qg_habitudes_v1'
let seed: HabitsState | null = null
const initial = () =>
  (seed ??= { habits: DEMO_HABITS, categories: DEMO_CATEGORIES, goals: DEMO_GOALS, history: seedHistory(new Date()), mode: 'who' })

/** Date du jour, qui change d'elle-même à minuit et au retour sur l'app. */
function useToday(): Date {
  const [today, setToday] = useState(() => new Date())
  useEffect(() => {
    const refresh = () => setToday((d) => (isoDate(d) === isoDate(new Date()) ? d : new Date()))
    const now = new Date()
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime()
    const timer = window.setTimeout(refresh, midnight + 1000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [today])
  return today
}

/** Habitudes gardées sur l'appareil, avec leurs actions. */
export function useHabits() {
  const [stored, setStored] = useStored<HabitsState | null>(KEY, null)
  const today = useToday()
  const state = stored ?? initial()

  return useMemo(() => {
    const set = (fn: (s: HabitsState) => Partial<HabitsState>) =>
      setStored((prev) => {
        const s = prev ?? initial()
        return { ...s, ...fn(s) }
      })
    const categoryOf = (h: Habit) => state.categories.find((c) => c.id === h.categoryId)
    return {
      ...state,
      today,
      categoryOf,
      /** Fond de la gommette : celui de la catégorie, sinon celui de l'habitude. */
      colorOf: (h: Habit) => categoryOf(h)?.color ?? h.color,
      toggle: (habitId: string, p: Person, day = today) =>
        set((s) => ({ history: { ...s.history, [habitId]: toggleCheck(s.history[habitId] ?? {}, isoDate(day), p) } })),
      updateHabit: (id: string, patch: Partial<Habit>) => set((s) => ({ habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)) })),
      addHabit: (h: Omit<Habit, 'id'>) => set((s) => ({ habits: [...s.habits, { ...h, id: `h${Date.now()}` }] })),
      addCategory: (c: Omit<Category, 'id'>) => {
        const id = `c${Date.now()}`
        set((s) => ({ categories: [...s.categories, { ...c, id }] }))
        return id
      },
      setMode: (mode: HabitsState['mode']) => set(() => ({ mode })),
    }
  }, [state, setStored, today])
}

export type HabitsStore = ReturnType<typeof useHabits>
