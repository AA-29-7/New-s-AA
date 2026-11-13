import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { capitalize, monthName } from '../lib/dates'
import { nameOf, usePerson } from '../person'
import { CheckCircle, OwnerDots, Sticker, StreakPill, cx } from '../ui'
import { monthDate, questStreak } from './quest'
import { QuestChooseSheet, QuestReceiveSheet, QuestReviewSheet } from './QuestSheets'
import { useQuests } from './useQuests'

/** Carte « La quête du QG », épinglée en haut de l'accueil et des Habitudes. */
export function QuestCard() {
  const { me, other } = usePerson()
  const quests = useQuests()
  const { current, month, day, length, chooser, isLastDay } = quests
  const [sheet, setSheet] = useState<'choose' | 'receive' | 'review' | null>(null)
  const label = monthName(monthDate(month))

  // Dernier jour du mois : le bilan se propose tout seul, une fois.
  const needsReview = isLastDay && current?.status === 'accepted' && !current.review[me]
  useEffect(() => {
    if (needsReview) setSheet('review')
  }, [needsReview])

  const head = (right?: string) => (
    <div className="quest__head">
      <Link to="/quetes" className="quest__label">
        🏁 La quête du QG
      </Link>
      {right && <span className="meta">{right}</span>}
    </div>
  )

  let body
  if (!current) {
    body =
      chooser === me ? (
        <>
          {head(`${capitalize(label)} · à toi de choisir`)}
          <p className="quest__text">Quel défi pour {nameOf(other)} ce mois-ci ?</p>
          <button className="btn btn--primary btn--block" onClick={() => setSheet('choose')}>
            Choisir un défi
          </button>
        </>
      ) : (
        <>
          {head(capitalize(label))}
          <p className="quest__text">
            C'est au tour de {nameOf(chooser)} de choisir le défi du mois. Tu pourras accepter ou refuser.
          </p>
        </>
      )
  } else if (current.status !== 'accepted') {
    const mine = current.chooser === me
    const refused = current.status === 'refused'
    body = (
      <>
        {head(mine ? 'choisie par toi' : `proposée par ${nameOf(current.chooser)}`)}
        <div className="quest__main">
          <Sticker emoji={current.challenge.emoji} color={current.challenge.color} size={38} />
          <div className="row__body">
            <div className="quest__title">{current.challenge.title}</div>
            <div className="meta">
              {refused
                ? mine
                  ? `${nameOf(other)} a répondu « Pas ce mois-ci »`
                  : 'Tu as répondu « Pas ce mois-ci »'
                : mine
                  ? `Proposé à ${nameOf(other)} · en attente de sa réponse`
                  : `${nameOf(current.chooser)} te propose ce défi`}
            </div>
          </div>
        </div>
        {mine && refused && (
          <button className="btn btn--secondary btn--block" onClick={() => setSheet('choose')}>
            Proposer autre chose
          </button>
        )}
        {!mine && (
          <button className={cx('btn btn--block', refused ? 'btn--secondary' : 'btn--primary')} onClick={() => setSheet('receive')}>
            {refused ? 'Revoir la proposition' : 'Voir le défi'}
          </button>
        )}
      </>
    )
  } else {
    const mine = current.checks[me]
    const done = mine.includes(day)
    const did = (p: 'alex' | 'antoine') => current.checks[p].includes(day)
    body = (
      <>
        {head(current.chooser === me ? 'choisie par toi' : `proposée par ${nameOf(current.chooser)}`)}
        <div className="quest__main">
          <CheckCircle
            checked={done}
            size={32}
            label={`${current.challenge.title} : ${done ? 'fait' : 'à faire'} aujourd'hui`}
            onToggle={() => quests.toggleToday(me)}
          />
          <Sticker emoji={current.challenge.emoji} color={current.challenge.color} size={38} />
          <div className="row__body">
            <div className={cx('quest__title', done && 'row__title--done')}>{current.challenge.title}</div>
            <div className="meta">
              Jour {day} sur {length} · {label}
            </div>
          </div>
        </div>
        <div className="quest__days" aria-hidden="true">
          {Array.from({ length }, (_, i) => {
            const d = i + 1
            const state = d === day ? (done ? 'done' : 'today') : d < day ? (mine.includes(d) ? 'done' : 'missed') : 'next'
            return <span key={d} className="quest__day" data-state={state} />
          })}
        </div>
        <div className="quest__foot">
          <span className="quest__who">
            <OwnerDots owner="alex" hollow={{ alex: !did('alex') }} />
            {did('alex') ? 'Alex a fait' : 'Alex pas encore'}
            <span aria-hidden="true">·</span>
            <OwnerDots owner="antoine" hollow={{ antoine: !did('antoine') }} />
            {did('antoine') ? 'Antoine a fait' : 'Antoine pas encore'}
          </span>
          <StreakPill days={questStreak(mine, day)} />
        </div>
        {isLastDay && (
          <button className="btn btn--secondary btn--block" onClick={() => setSheet('review')}>
            {current.review[me] ? 'Revoir mon bilan' : 'Faire le bilan du mois'}
          </button>
        )}
      </>
    )
  }

  return (
    <section className="card quest" aria-label="La quête du QG">
      {body}
      <QuestChooseSheet open={sheet === 'choose'} onClose={() => setSheet(null)} />
      <QuestReceiveSheet open={sheet === 'receive'} onClose={() => setSheet(null)} />
      <QuestReviewSheet open={sheet === 'review'} onClose={() => setSheet(null)} />
    </section>
  )
}
