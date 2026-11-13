import { useState } from 'react'
import { dayIndex } from '../lib/dates'
import { Sheet, Sticker } from '../ui'
import { FUN_FACTS } from './content'

/** Fun fact du jour : change chaque jour, le bouton passe au suivant. */
export function FunFactCard() {
  const [open, setOpen] = useState(false)
  const [offset, setOffset] = useState(0)
  const fact = FUN_FACTS[(dayIndex() + offset) % FUN_FACTS.length]

  return (
    <>
      <button type="button" className="card card--md card--click funfact" onClick={() => setOpen(true)}>
        <Sticker emoji="💡" color="honey" size={38} rotate={-4} />
        <span className="funfact__body">
          <span className="eyebrow">Fun fact du jour</span>
          <span className="funfact__text">{fact.text}</span>
          <span className="spread funfact__foot">
            <span className="meta">{fact.category}</span>
            <span className="link-btn">En savoir plus →</span>
          </span>
        </span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)}>
        <div className="spread">
          <span className="funfact__sheet-head">
            <Sticker emoji={fact.emoji} color="honey" size={52} rotate={-4} />
            <span className="eyebrow">Fun fact · {fact.category}</span>
          </span>
          <button type="button" className="btn btn--text" onClick={() => setOpen(false)}>
            Fermer
          </button>
        </div>
        <p className="funfact__lead">{fact.text}</p>
        {fact.details.map((p) => (
          <p key={p} className="funfact__para">
            {p}
          </p>
        ))}
        <p className="meta">Source : {fact.source}</p>
        <button type="button" className="btn btn--primary btn--block" onClick={() => setOffset((o) => o + 1)}>
          🎲 Un autre fun fact
        </button>
      </Sheet>
    </>
  )
}
