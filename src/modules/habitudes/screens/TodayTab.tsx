import { useState } from 'react'
import { isoDate } from '../../../shared/lib/dates'
import { nameOf, usePerson } from '../../../shared/person'
import { Chip, OwnerDots, Segment, Sticker, cx } from '../../../shared/ui'
import { canCheck, didOn, type Habit } from '../logic'
import { HabitRow } from '../parts/HabitRow'
import { useHabits } from '../store'

/** Carte d'un groupe « Par qui ». */
function Group({ title, meta, owner, habits, muted, onOpen }: { title: string; meta: string; owner: Habit['owner']; habits: Habit[]; muted?: boolean; onOpen: (id: string) => void }) {
  return (
    <section className={cx('card hgroup', muted && 'card--muted')}>
      <div className="spread hgroup__head">
        <span className="hgroup__title">
          <OwnerDots owner={owner} />
          {title}
        </span>
        <span className="meta">{meta}</span>
      </div>
      {habits.map((h, i) => (
        <HabitRow key={h.id} habit={h} first={i === 0} onOpen={() => onOpen(h.id)} />
      ))}
      {habits.length === 0 && <p className="meta hgroup__empty">Rien ici pour l'instant.</p>}
    </section>
  )
}

/** Onglet Aujourd'hui : par qui (à moi, communes, chez l'autre) ou par thème. */
export function TodayTab({ onOpen, onCategories }: { onOpen: (id: string) => void; onCategories: () => void }) {
  const { me, other } = usePerson()
  const store = useHabits()
  const [filter, setFilter] = useState('all')
  const H = store.habits
  const orphans = H.filter((h) => !store.categoryOf(h))

  const groups = [
    ...store.categories.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji, color: c.color, habits: H.filter((h) => h.categoryId === c.id) })),
    { id: 'none', name: 'Sans catégorie', emoji: '📌', color: 'neutral' as const, habits: orphans },
  ].filter((g) => g.habits.length > 0 && (filter === 'all' || filter === g.id))

  return (
    <div className="stack">
      <div className="spread htoolbar">
        <Segment
          size="sm"
          inline
          options={[
            { value: 'who', label: 'Par qui' },
            { value: 'theme', label: 'Par thème' },
          ]}
          value={store.mode}
          onChange={store.setMode}
          label="Regrouper"
        />
        <button type="button" className="link-btn link-btn--soft" onClick={onCategories}>
          ⚙︎ Gérer les catégories
        </button>
      </div>

      {store.mode === 'who' ? (
        <div className="grid-auto hgrid">
          <Group title="À moi" meta={`Visible par ${nameOf(other)}`} owner={me} habits={H.filter((h) => h.owner === me)} onOpen={onOpen} />
          <Group title="Communes" meta="Chacun coche la sienne" owner="both" habits={H.filter((h) => h.owner === 'both')} onOpen={onOpen} />
          <Group title={`Chez ${nameOf(other)}`} meta="Lecture seule" owner={other} habits={H.filter((h) => h.owner === other)} muted onOpen={onOpen} />
        </div>
      ) : (
        <>
          <div className="chips noscroll">
            <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
              Tout
            </Chip>
            {store.categories.map((c) => (
              <Chip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>
                {c.emoji} {c.name}
              </Chip>
            ))}
            {orphans.length > 0 && (
              <Chip active={filter === 'none'} onClick={() => setFilter('none')}>
                📌 Sans catégorie
              </Chip>
            )}
          </div>
          <div className="grid-auto hgrid">
            {groups.map((g) => {
              const mine = g.habits.filter((h) => canCheck(h, me))
              const done = mine.filter((h) => didOn(store.history[h.id] ?? {}, isoDate(store.today), me)).length
              return (
                <section key={g.id} className="card hgroup">
                  <div className="spread hgroup__head">
                    <span className="hgroup__title">
                      <Sticker emoji={g.emoji} color={g.color} size={32} />
                      {g.name}
                    </span>
                    {mine.length > 0 && (
                      <strong className="hgroup__count">
                        {done} / {mine.length}
                      </strong>
                    )}
                  </div>
                  {g.habits.map((h, i) => (
                    <HabitRow key={h.id} habit={h} first={i === 0} onOpen={() => onOpen(h.id)} />
                  ))}
                </section>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
