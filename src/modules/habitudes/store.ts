import { createContext, createElement, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { repo, useCollection, usePeople, useRepo, type BaseDoc } from '../../lib/data'
import { useStored } from '../../shared/lib/localStore'
import { useToday } from '../../shared/lib/useToday'
import { isoDate } from '../../shared/lib/dates'
import { PERSONS, usePerson, type Owner, type Person } from '../../shared/person'
import type { DemoSeeder } from '../../shared/seed/DemoSeed'
import { DEMO_CATEGORIES, DEMO_GOALS, DEMO_HABITS, seedHistory } from './data/demo'
import { doers, type Category, type Goal, type Habit, type History } from './logic'

/** Documents Firestore ; l'identifiant du document est celui de l'habitude, de la catégorie, de l'objectif. */
type HabitDoc = Omit<Habit, 'id'> & BaseDoc
type CategoryDoc = Omit<Category, 'id'> & BaseDoc
type GoalDoc = Omit<Goal, 'id'> & BaseDoc
/** `habitLogs/<habitId>_<personne>` : dates ISO cochées par cette personne (elle seule écrit son document). */
interface LogDoc extends BaseDoc {
  checks?: string[]
}

type Mode = 'who' | 'theme'
const MODE_KEY = 'qg_habits_mode'

const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
/** Écritures lancées sans attendre : hors connexion, la promesse ne se résout qu'au retour du réseau. */
const fire = (p: Promise<unknown>) => void p.catch((e) => console.error('Écriture refusée', e))

/** « h1_alex » → { habitId: 'h1', person: 'alex' } */
function parseLogId(id: string): { habitId: string; person: Person } {
  const i = id.lastIndexOf('_')
  return { habitId: id.slice(0, i), person: id.slice(i + 1) as Person }
}

/** Habitudes, catégories, objectifs et coches, synchronisés en temps réel entre les deux personnes. */
export function useHabitsData() {
  const { me } = usePerson()
  const { uidOf } = usePeople()
  const today = useToday()
  const [mode, setMode] = useStored<Mode>(MODE_KEY, 'who')

  const habitDocs = useCollection<HabitDoc>('habits')
  const categoryDocs = useCollection<CategoryDoc>('habitCategories')
  const goalDocs = useCollection<GoalDoc>('habitGoals')
  const logDocs = useCollection<LogDoc>('habitLogs')
  const habitsRepo = useRepo<HabitDoc>('habits')
  const categoriesRepo = useRepo<CategoryDoc>('habitCategories')
  const logsRepo = useRepo<LogDoc>('habitLogs')

  const ownerUid = useCallback((owner: Owner) => (owner === 'both' ? null : uidOf(owner)), [uidOf])

  const habits = useMemo<Habit[]>(
    () => habitDocs.docs.map((d) => ({ ...d }) as unknown as Habit).sort((a, b) => a.id.localeCompare(b.id, 'fr', { numeric: true })),
    [habitDocs.docs],
  )
  const categories = useMemo<Category[]>(
    () => categoryDocs.docs.map((d) => ({ ...d }) as unknown as Category).sort((a, b) => a.id.localeCompare(b.id, 'fr', { numeric: true })),
    [categoryDocs.docs],
  )
  const goals = useMemo<Goal[]>(() => goalDocs.docs.map((d) => ({ ...d }) as unknown as Goal), [goalDocs.docs])

  const { history, pending } = useMemo(() => {
    const history: History = {}
    const pending = new Set<string>()
    for (const d of logDocs.docs) {
      const { habitId, person } = parseLogId(d.id)
      if (d.pending) pending.add(d.id)
      const byDay = (history[habitId] ??= {})
      for (const iso of d.checks ?? []) (byDay[iso] ??= []).push(person)
    }
    return { history, pending }
  }, [logDocs.docs])

  return useMemo(() => {
    const categoryOf = (h: Habit) => categories.find((c) => c.id === h.categoryId)
    return {
      habits,
      categories,
      goals,
      history,
      mode,
      today,
      loading: habitDocs.loading || categoryDocs.loading || goalDocs.loading || logDocs.loading,
      categoryOf,
      /** Fond de la gommette : celui de la catégorie, sinon celui de l'habitude. */
      colorOf: (h: Habit) => categoryOf(h)?.color ?? h.color,
      /** La coche de `p` est partie sur ce téléphone mais pas encore sur le serveur. */
      isPending: (habitId: string, p: Person) => pending.has(`${habitId}_${p}`),
      /** Coche ou décoche pour moi (un document de coches par habitude et par personne). */
      toggle: (habitId: string, p: Person, day = today) => {
        if (p !== me) return
        const iso = isoDate(day)
        const on = !(history[habitId]?.[iso] ?? []).includes(p)
        fire(logsRepo.arrayToggle(`${habitId}_${p}`, 'checks', iso, on))
      },
      updateHabit: (id: string, patch: Partial<Habit>) => {
        const { id: _id, owner: _owner, ...rest } = patch
        fire(habitsRepo.update(id, rest))
      },
      addHabit: (h: Omit<Habit, 'id'>) => {
        const { owner } = h
        fire(habitsRepo.upsert(newId('h'), { ...h, ownerId: ownerUid(owner) }))
      },
      addCategory: (c: Omit<Category, 'id'>) => {
        const id = newId('c')
        fire(categoriesRepo.upsert(id, { ...c, ownerId: null }))
        return id
      },
      setMode: (m: Mode) => setMode(m),
    }
  }, [habits, categories, goals, history, mode, today, me, pending, habitDocs.loading, categoryDocs.loading, goalDocs.loading, logDocs.loading, habitsRepo, categoriesRepo, logsRepo, ownerUid, setMode])
}

export type HabitsStore = ReturnType<typeof useHabitsData>

const HabitsContext = createContext<HabitsStore | null>(null)

/** Un seul jeu d'abonnements pour tout l'écran (lignes, onglets et feuilles le partagent). */
export function HabitsProvider({ children }: { children: ReactNode }) {
  return createElement(HabitsContext.Provider, { value: useHabitsData() }, children)
}

export function useHabits(): HabitsStore {
  const ctx = useContext(HabitsContext)
  if (!ctx) throw new Error('useHabits : à utiliser sous <HabitsProvider>')
  return ctx
}

/**
 * Démo (VITE_SEED_DEMO seulement). Chacun ne peut écrire que ses propres documents :
 * chaque personne sème ses habitudes, ses objectifs et ses coches ; la première à
 * arriver sème aussi les catégories et les éléments communs. Sans écrasement
 * (createIfMissing) ; le dernier document écrit sert de repère, donc un semis
 * interrompu est repris au lancement suivant.
 */
export const habitsSeeder: DemoSeeder = {
  name: 'habitudes',
  async run({ scope, uidOf }) {
    const me = PERSONS.find((p) => uidOf(p) === scope.uid)
    if (!me) return
    const habits = repo<HabitDoc>('habits', scope)
    const logs = repo<LogDoc>('habitLogs', scope)
    const goals = repo<GoalDoc>('habitGoals', scope)
    const categories = repo<CategoryDoc>('habitCategories', scope)
    const history = seedHistory(new Date())
    const ownerUid = (o: Owner) => (o === 'both' ? null : uidOf(o))

    // Éléments communs : la première catégorie est écrite en dernier.
    const [markerCategory, ...otherCategories] = DEMO_CATEGORIES
    if (!(await categories.existsOnServer(markerCategory.id))) {
      await Promise.all([
        ...otherCategories.map(({ id, ...c }) => categories.createIfMissing(id, { ...c, ownerId: null })),
        ...DEMO_HABITS.filter((h) => h.owner === 'both').map(({ id, ...h }) => habits.createIfMissing(id, { ...h, ownerId: null })),
        ...DEMO_GOALS.filter((g) => g.owner === 'both').map(({ id, ...g }) => goals.createIfMissing(id, { ...g, ownerId: null })),
      ])
      const { id, ...c } = markerCategory
      await categories.createIfMissing(id, { ...c, ownerId: null })
    }

    // Mes habitudes, mes objectifs et mes coches : mon premier document de coches est écrit en dernier.
    const mine = DEMO_HABITS.filter((h) => doers(h).includes(me))
    const logOf = (h: Habit) => {
      const days = Object.entries(history[h.id] ?? {})
        .filter(([, people]) => people.includes(me))
        .map(([iso]) => iso)
        .sort()
      return { id: `${h.id}_${me}`, days }
    }
    const [markerHabit, ...otherHabits] = mine
    if (markerHabit && !(await logs.existsOnServer(`${markerHabit.id}_${me}`))) {
      await Promise.all([
        ...DEMO_HABITS.filter((h) => h.owner === me).map(({ id, ...h }) => habits.createIfMissing(id, { ...h, ownerId: ownerUid(h.owner) })),
        ...DEMO_GOALS.filter((g) => g.owner === me).map(({ id, ...g }) => goals.createIfMissing(id, { ...g, ownerId: ownerUid(g.owner) })),
        ...otherHabits.map((h) => logs.createIfMissing(logOf(h).id, { checks: logOf(h).days })),
      ])
      await logs.createIfMissing(logOf(markerHabit).id, { checks: logOf(markerHabit).days })
    }
  },
}
