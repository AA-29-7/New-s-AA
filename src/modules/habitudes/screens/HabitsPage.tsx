import { useState } from 'react'
import { isoDate, longDate } from '../../../shared/lib/dates'
import { usePerson } from '../../../shared/person'
import { QuestCard } from '../../../shared/quest/QuestCard'
import { Ring, Segment } from '../../../shared/ui'
import { didOn, habitsOf, headline, scheduled } from '../logic'
import { CategoriesSheet, CreateSheet, DetailSheet, StreakListSheet } from '../parts/Sheets'
import { useHabits } from '../store'
import { GoalsTab } from './GoalsTab'
import { SeriesTab } from './SeriesTab'
import { TodayTab } from './TodayTab'

type Tab = 'today' | 'series' | 'goals'

/** Page Habitudes : Aujourd'hui, Séries, Objectifs. */
export function HabitsPage() {
  const { me } = usePerson()
  const store = useHabits()
  const [tab, setTab] = useState<Tab>('today')
  const [detail, setDetail] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [cats, setCats] = useState(false)
  const [streaks, setStreaks] = useState<'cur' | 'rec' | null>(null)
  const mine = habitsOf(store.habits, me).filter((h) => scheduled(h, store.today))
  const done = mine.filter((h) => didOn(store.history[h.id] ?? {}, isoDate(store.today), me)).length

  return (
    <div className="page habits">
      <header className="page__head hhead">
        <div>
          <div className="eyebrow">{longDate()}</div>
          <h1 className="screen-title">Habitudes</h1>
        </div>
        <div className="hhead__right">
          <button type="button" className="btn btn--primary btn--compact only-desktop" onClick={() => setCreating(true)}>
            + Nouvelle habitude
          </button>
          <span className="hhead__line">{headline(mine.length - done)}</span>
          <Ring value={mine.length ? done / mine.length : 0}>
            {done} / {mine.length}
          </Ring>
        </div>
      </header>
      <Segment<Tab>
        options={[
          { value: 'today', label: 'Aujourd’hui' },
          { value: 'series', label: 'Séries' },
          { value: 'goals', label: 'Objectifs' },
        ]}
        value={tab}
        onChange={setTab}
        className="hseg"
        label="Onglets"
      />
      {store.loading && (
        <div className="grid-auto hgrid" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card hgroup">
              <div className="skeleton skeleton--row" />
              <div className="skeleton skeleton--row hskeleton" />
            </div>
          ))}
        </div>
      )}
      {!store.loading && tab === 'today' && (
        <>
          <QuestCard />
          <TodayTab onOpen={setDetail} onCategories={() => setCats(true)} />
        </>
      )}
      {!store.loading && tab === 'series' && <SeriesTab onStreaks={setStreaks} />}
      {!store.loading && tab === 'goals' && <GoalsTab />}

      <button type="button" className="fab only-mobile" onClick={() => setCreating(true)} aria-label="Nouvelle habitude">
        +
      </button>
      <DetailSheet habitId={detail} onClose={() => setDetail(null)} />
      <CreateSheet open={creating} onClose={() => setCreating(false)} />
      <CategoriesSheet open={cats} onClose={() => setCats(false)} />
      <StreakListSheet kind={streaks} onClose={() => setStreaks(null)} />
    </div>
  )
}
