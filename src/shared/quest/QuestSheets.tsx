import { useState } from 'react'
import { Link } from 'react-router-dom'
import { capitalize, monthName } from '../lib/dates'
import { nameOf, usePerson } from '../person'
import { Avatar, ProgressBar, Sheet, Sticker, cx } from '../ui'
import { CHALLENGE_IDEAS, challengeTag, chooserFor, monthDate, shiftMonth, type Challenge, type Review } from './quest'
import { useQuests } from './useQuests'

interface SheetProps {
  open: boolean
  onClose: () => void
}

/** Pop-up du 1er du mois, chez la personne dont c'est le tour de choisir. */
export function QuestChooseSheet({ open, onClose }: SheetProps) {
  const { me, other } = usePerson()
  const quests = useQuests()
  const [sel, setSel] = useState(0)
  const [custom, setCustom] = useState<string | null>(null)
  const label = monthName(monthDate(quests.month))
  const next = monthName(monthDate(shiftMonth(quests.month, 1)))
  const idea = CHALLENGE_IDEAS[sel]
  const writing = custom !== null

  const chosen: Challenge | null = writing
    ? custom.trim()
      ? { emoji: '🏁', color: 'honey', title: custom.trim(), both: true, description: `Défi écrit par ${nameOf(me)}.` }
      : null
    : idea

  const random = () => {
    setCustom(null)
    setSel((s) => (s + 1 + Math.floor(Math.random() * (CHALLENGE_IDEAS.length - 1))) % CHALLENGE_IDEAS.length)
  }

  return (
    <Sheet open={open} onClose={onClose} title={`Quel défi pour ${nameOf(other)} ?`} closeLabel="Annuler">
      <div className="eyebrow">
        🏁 {capitalize(label)} · à toi de choisir
      </div>
      <p className="muted">
        {nameOf(other)} choisira en {next}, puis chacun son tour.
      </p>
      <div className="stack stack--sm">
        {CHALLENGE_IDEAS.map((c, i) => (
          <button
            key={c.title}
            type="button"
            className="idea"
            aria-pressed={!writing && i === sel}
            onClick={() => {
              setCustom(null)
              setSel(i)
            }}
          >
            <Sticker emoji={c.emoji} color={c.color} size={34} />
            <span className="row__body">
              <span className="row__title">{c.title}</span>
              <span className="meta idea__tag">{challengeTag(c)}</span>
            </span>
          </button>
        ))}
      </div>
      {writing ? (
        <input
          className="field"
          autoFocus
          placeholder="Ton défi du mois"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
      ) : (
        <div className="inset">
          <div className="meta">
            {challengeTag(idea)} · {quests.length} jours
          </div>
          <p>{idea.description}</p>
        </div>
      )}
      <button
        className="btn btn--primary btn--block"
        disabled={!chosen}
        onClick={() => {
          if (!chosen) return
          quests.propose(chosen, me)
          onClose()
        }}
      >
        Proposer à {nameOf(other)}
      </button>
      <div className="spread">
        <button className="btn btn--secondary" onClick={random}>
          🎲 Un autre au hasard
        </button>
        <button className="btn btn--secondary" onClick={() => setCustom(writing ? null : '')}>
          {writing ? 'Voir les idées' : '✎ Écrire le mien'}
        </button>
      </div>
      <p className="meta sheet__note">{nameOf(other)} pourra accepter ou refuser.</p>
    </Sheet>
  )
}

/** Pop-up de réception, chez la personne à qui le défi est proposé. */
export function QuestReceiveSheet({ open, onClose }: SheetProps) {
  const quests = useQuests()
  const q = quests.current
  if (!q) return null
  const from = nameOf(q.chooser)
  const label = monthName(monthDate(q.month))

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="popup">
        {q.status === 'proposed' && (
          <>
            <div className="eyebrow">{from} te propose un défi</div>
            <Sticker emoji={q.challenge.emoji} color={q.challenge.color} size={96} rotate={-6} />
            <h2 className="popup__title">{q.challenge.title}</h2>
            <span className="tag">
              {challengeTag(q.challenge)} · {quests.length} jours
            </span>
            <p className="muted">
              {q.challenge.description} Si tu acceptes, il devient l'habitude imposée du mois, sur votre accueil.
            </p>
            <button className="btn btn--primary btn--block" onClick={() => quests.respond(true)}>
              J'accepte le défi
            </button>
            <button className="btn btn--text" onClick={() => quests.respond(false)}>
              Je refuse
            </button>
          </>
        )}
        {q.status === 'accepted' && (
          <>
            <Sticker emoji={q.challenge.emoji} color={q.challenge.color} size={96} rotate={-6} />
            <h2 className="popup__title">Défi accepté</h2>
            <p className="muted">
              Il est maintenant sur l'accueil, et ajouté à tes habitudes jusqu'au {quests.length} {label}. {from} est
              prévenu.
            </p>
            <button className="btn btn--primary btn--block" onClick={onClose}>
              Voir l'accueil
            </button>
            <button className="btn btn--text" onClick={quests.reopen}>
              Revoir la proposition
            </button>
          </>
        )}
        {q.status === 'refused' && (
          <>
            <Sticker emoji="🌿" color="sage" size={96} rotate={-6} />
            <h2 className="popup__title">Défi refusé</h2>
            <p className="muted">{from} verra « Pas ce mois-ci ». Tu peux lui répondre avec une autre idée.</p>
            <button className="btn btn--primary btn--block" onClick={onClose}>
              Fermer
            </button>
            <button className="btn btn--text" onClick={quests.reopen}>
              Finalement, revoir la proposition
            </button>
          </>
        )}
      </div>
    </Sheet>
  )
}

const REVIEW_RESULT: Record<Review, { emoji: string; title: string; message: string }> = {
  yes: { emoji: '🎉', title: 'Défi réussi !', message: 'Il passe en « Réalisé » dans votre historique.' },
  part: { emoji: '👍', title: 'Presque !', message: 'Noté « En partie ».' },
  no: { emoji: '🌱', title: 'Pas grave', message: 'Noté « Pas fait ».' },
}

/** Bilan du dernier jour du mois. Ton neutre, jamais culpabilisant. */
export function QuestReviewSheet({ open, onClose }: SheetProps) {
  const { me, other } = usePerson()
  const quests = useQuests()
  const q = quests.current
  if (!q) return null
  const mine = q.review[me]
  const checks = q.checks[me].length
  const nextMonth = shiftMonth(q.month, 1)
  const nextLabel = monthName(monthDate(nextMonth))
  const turn = chooserFor(nextMonth) === me ? 'c’est toi qui choisis le défi' : `c’est ${nameOf(other)} qui choisit le défi`

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="popup">
        {!mine ? (
          <>
            <div className="quest__label">🏁 La quête du QG</div>
            <Sticker emoji={q.challenge.emoji} color={q.challenge.color} size={96} rotate={-6} />
            <h2 className="popup__title">{q.challenge.title}</h2>
            <p className="muted">Alors, tu as relevé le défi ?</p>
            <div className="inset popup__wide">
              <div className="spread">
                <span className="meta">Tes coches</span>
                <strong>
                  {checks} / {quests.length}
                </strong>
              </div>
              <ProgressBar value={checks / quests.length} className="popup__bar" />
            </div>
            <button className="btn btn--primary btn--block" onClick={() => quests.review(me, 'yes')}>
              Oui, défi réussi
            </button>
            <div className="popup__pair">
              <button className="btn btn--secondary" onClick={() => quests.review(me, 'part')}>
                En partie
              </button>
              <button className="btn btn--secondary" onClick={() => quests.review(me, 'no')}>
                Pas fait
              </button>
            </div>
          </>
        ) : (
          <>
            <Sticker emoji={REVIEW_RESULT[mine].emoji} color="honey" size={96} rotate={-6} />
            <h2 className="popup__title">{REVIEW_RESULT[mine].title}</h2>
            <p className="muted">
              {REVIEW_RESULT[mine].message} En {nextLabel}, {turn}.
            </p>
            <div className="popup__pair">
              {([me, other] as const).map((p) => (
                <span key={p} className={cx('tag', q.review[p] && 'tag--done')}>
                  <Avatar person={p} size={22} />
                  {nameOf(p)} · {q.review[p] ? 'répondu' : 'en attente'}
                </span>
              ))}
            </div>
            <Link to="/quetes" className="btn btn--primary btn--block" onClick={onClose}>
              Voir nos quêtes
            </Link>
            <button className="btn btn--text" onClick={() => quests.review(me, null)}>
              Revoir la question
            </button>
          </>
        )}
      </div>
    </Sheet>
  )
}
