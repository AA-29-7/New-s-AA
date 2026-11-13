import { useState } from 'react'
import { Link } from 'react-router-dom'
import { capitalize, monthName } from '../lib/dates'
import { nameOf, otherOf, PERSONS } from '../person'
import { Chip, Sticker } from '../ui'
import { OUTCOME_LABEL, countOutcomes, monthDate, monthLength, outcomeOf, type Quest, type QuestOutcome } from './quest'
import { useQuests } from './useQuests'

type Filter = 'all' | 'done' | 'missed'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'done', label: 'Réalisées' },
  { value: 'missed', label: 'Pas faites' },
]

function detail(q: Quest, outcome: QuestOutcome, day: number): string {
  const length = monthLength(q.month)
  if (outcome === 'refused') return `${nameOf(otherOf(q.chooser))} a répondu « Pas ce mois-ci »`
  if (outcome === 'proposed') return `En attente de la réponse de ${nameOf(otherOf(q.chooser))}`
  if (outcome === 'unanswered') return `Proposé à ${nameOf(otherOf(q.chooser))}, resté sans réponse`
  const total = outcome === 'running' ? day : length
  const scores = PERSONS.map((p) => `${nameOf(p)} ${q.checks[p].length} / ${total}`).join(' · ')
  return outcome === 'running' ? `Jour ${day} sur ${length} · ${scores}` : scores
}

/** « Nos quêtes » : tous les défis, mois après mois. */
export function QuestsPage() {
  const { book, month, day } = useQuests()
  const [filter, setFilter] = useState<Filter>('all')
  const counts = countOutcomes(book, month)
  const rows = Object.values(book)
    .sort((a, b) => b.month.localeCompare(a.month))
    .map((q) => ({ q, outcome: outcomeOf(q, month) }))
    .filter(({ outcome }) =>
      filter === 'all' ? true : filter === 'done' ? outcome === 'done' : outcome === 'missed' || outcome === 'refused' || outcome === 'unanswered',
    )

  return (
    <div className="page quests">
      <div className="page__head">
        <Link to="/" className="link-btn link-btn--soft">
          ‹ Retour
        </Link>
        <h1 className="screen-title">Nos quêtes</h1>
        <p className="muted">Un défi par mois, chacun son tour.</p>
      </div>
      <div className="quests__counts">
        {(
          [
            [counts.done, 'réalisées'],
            [counts.running, 'en cours'],
            [counts.missed, 'pas faites'],
          ] as const
        ).map(([n, label]) => (
          <div key={label} className="card quests__count">
            <strong>{n}</strong>
            <span className="meta">{label}</span>
          </div>
        ))}
      </div>
      <div className="chips noscroll">
        {FILTERS.map((f) => (
          <Chip key={f.value} active={filter === f.value} onClick={() => setFilter(f.value)}>
            {f.label}
          </Chip>
        ))}
      </div>
      <div className="grid-auto">
        {rows.map(({ q, outcome }) => (
          <article key={q.month} className="card">
            <div className="spread">
              <span className="eyebrow">{capitalize(monthName(monthDate(q.month)))}</span>
              <span className="tag quests__state" data-outcome={outcome}>
                {OUTCOME_LABEL[outcome]}
              </span>
            </div>
            <div className="quest__main">
              <Sticker emoji={q.challenge.emoji} color={q.challenge.color} size={40} />
              <div className="row__body">
                <div className="quest__title">{q.challenge.title}</div>
                <div className="meta">Choisi par {nameOf(q.chooser)}</div>
              </div>
            </div>
            <p className="meta">{detail(q, outcome, day)}</p>
          </article>
        ))}
        {rows.length === 0 && <p className="muted">Aucun défi dans cette liste pour l'instant.</p>}
      </div>
    </div>
  )
}
