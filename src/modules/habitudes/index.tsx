import { isoDate } from '../../shared/lib/dates'
import { usePerson } from '../../shared/person'
import { didOn, habitsOf, scheduled } from './logic'
import { HabitsPage } from './screens/HabitsPage'
import { HabitsProvider, useHabitsData } from './store'
import './habitudes.css'

export { TodayCard as HabitsTodayCard } from './parts/TodayCard'
export { habitsSeeder } from './store'

/** Module Habitudes, monté sur /habitudes. */
export function HabitsModule() {
  return (
    <HabitsProvider>
      <HabitsPage />
    </HabitsProvider>
  )
}

/** Texte de la carte du module sur l'accueil (« Tout » sur mobile). */
export function useHabitsSummary() {
  const { me } = usePerson()
  const store = useHabitsData()
  const mine = habitsOf(store.habits, me).filter((h) => scheduled(h, store.today))
  const done = mine.filter((h) => didOn(store.history[h.id] ?? {}, isoDate(store.today), me)).length
  return { title: `${done} / ${mine.length}`, note: 'faites aujourd’hui' }
}
