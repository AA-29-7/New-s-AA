import { Link } from 'react-router-dom'
import { isoDate } from '../../../shared/lib/dates'
import { usePerson } from '../../../shared/person'
import { Sticker } from '../../../shared/ui'
import { didOn, habitsOf, scheduled } from '../logic'
import { HabitsProvider, useHabits } from '../store'
import { HabitRow } from './HabitRow'

/** Carte « Aujourd'hui » de l'accueil du QG : 4 habitudes maximum. */
export function TodayCard() {
  return (
    <HabitsProvider>
      <TodayCardContent />
    </HabitsProvider>
  )
}

function TodayCardContent() {
  const { me } = usePerson()
  const store = useHabits()
  const mine = habitsOf(store.habits, me).filter((h) => scheduled(h, store.today))
  const done = mine.filter((h) => didOn(store.history[h.id] ?? {}, isoDate(store.today), me)).length

  return (
    <section className="card htoday" aria-label="Habitudes du jour">
      <div className="spread">
        <span className="htoday__title">
          <Sticker emoji="💪" color="sage" size={30} rotate={-6} />
          Aujourd'hui
        </span>
        <Link to="/habitudes" className="link-btn">
          {done} / {mine.length} · tout voir ›
        </Link>
      </div>
      <div>
        {mine.slice(0, 4).map((h, i) => (
          <HabitRow key={h.id} habit={h} first={i === 0} compact />
        ))}
        {mine.length === 0 && <p className="muted">Aucune habitude prévue aujourd'hui.</p>}
      </div>
    </section>
  )
}
