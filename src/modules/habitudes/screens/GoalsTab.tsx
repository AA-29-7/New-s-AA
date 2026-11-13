import { useState } from 'react'
import { nameOf, usePerson } from '../../../shared/person'
import { ProgressBar, Segment, Sticker, useToast } from '../../../shared/ui'
import { useHabits } from '../store'

/** Onglet Objectifs : en cours / atteints. */
export function GoalsTab() {
  const { me } = usePerson()
  const store = useHabits()
  const toast = useToast()
  const [tab, setTab] = useState<'cur' | 'done'>('cur')
  const reached = store.goals.filter((g) => g.current >= g.target)
  const goals = tab === 'cur' ? store.goals.filter((g) => g.current < g.target) : reached

  return (
    <div className="stack">
      <Segment
        options={[
          { value: 'cur', label: 'En cours' },
          { value: 'done', label: `Atteints · ${reached.length}` },
        ]}
        value={tab}
        onChange={setTab}
        className="hseg-goals"
        label="Objectifs"
      />
      <div className="grid-auto hgrid">
        {goals.map((g) => {
          const pct = Math.round((g.current / g.target) * 100)
          return (
            <article key={g.id} className="card hgoal" data-person={g.owner}>
              <div className="hgoal__head">
                <Sticker emoji={g.emoji} color={g.color} size={40} />
                <div className="row__body">
                  <div className="hgoal__title">{g.title}</div>
                  <div className="meta">
                    {g.owner === 'both' ? 'Commun' : g.owner === me ? 'Moi' : nameOf(g.owner)} · pour le {g.deadline}
                  </div>
                </div>
              </div>
              <div className="spread">
                <span className="hgoal__value">
                  {g.current} <span className="meta">/ {g.target} {g.unit}</span>
                </span>
                <strong className="hgoal__pct person-text" data-person={g.owner}>
                  {pct}&nbsp;%
                </strong>
              </div>
              <ProgressBar value={pct / 100} large className="hgoal__bar" />
            </article>
          )
        })}
      </div>
      <button type="button" className="btn btn--dashed btn--block" onClick={() => toast('Création d’un objectif : bientôt')}>
        + Nouvel objectif
      </button>
    </div>
  )
}
