import { useEffect, useState } from 'react'
import { nameOf, otherOf, usePerson } from '../../../shared/person'
import { Segment, Sheet, Sticker, cx, useOnline, useToast } from '../../../shared/ui'
import { CATEGORIES, CATEGORY } from '../data/demo'
import { useCarnet } from '../store'
import type { CatId, Payer, Trip } from '../types'
import { shortDay } from './bits'

/** Feuille « Nouvelle dépense » : montant, catégorie, qui a payé, libellé. */
export function ExpenseSheet({ trip, open, onClose }: { trip: Trip; open: boolean; onClose: () => void }) {
  const { me } = usePerson()
  const carnet = useCarnet()
  const online = useOnline()
  const toast = useToast()
  const [amount, setAmount] = useState('')
  const [cat, setCat] = useState<CatId>(carnet.state.lastCat)
  const [who, setWho] = useState<Payer>(me)
  const [label, setLabel] = useState('')

  // À chaque ouverture : la personne connectée paie, la dernière catégorie reste.
  useEffect(() => {
    if (!open) return
    setAmount('')
    setLabel('')
    setWho(me)
    setCat(carnet.state.lastCat)
  }, [open])

  const value = parseFloat(amount.replace(',', '.')) || 0
  const help =
    who === 'commun'
      ? 'Sort de l’épargne commune. Ne change pas qui doit quoi.'
      : `${nameOf(who)} avance : ${nameOf(otherOf(who))} lui doit la moitié.`

  const add = () => {
    if (!(value > 0)) {
      toast('Indique un montant')
      return
    }
    carnet.addExpense(trip, { cat, label: label.trim() || CATEGORY[cat].name, amount: value, who, day: shortDay() })
    toast(`+${value.toLocaleString('fr-FR')} € · ${CATEGORY[cat].name}${online ? '' : ' · en attente d’envoi'}`)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Nouvelle dépense" closeLabel="Annuler">
      <p className="meta">Voyage : {trip.name}</p>
      <label className="amount">
        <span className="visually-hidden">Montant en euros</span>
        <input
          className="amount__input"
          inputMode="decimal"
          autoFocus
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ''))}
        />
        <span className="amount__unit">€</span>
      </label>
      <div className="expcats">
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" className={cx('expcat', c.id === cat && 'is-active')} aria-pressed={c.id === cat} onClick={() => setCat(c.id)}>
            <Sticker emoji={c.emoji} color={c.color} size={46} />
            <span>{c.name}</span>
          </button>
        ))}
      </div>
      <div className="stack stack--sm">
        <div className="eyebrow">Qui a payé ?</div>
        <Segment<Payer>
          options={[
            { value: 'alex', label: 'Alex' },
            { value: 'antoine', label: 'Antoine' },
            { value: 'commun', label: 'Commun' },
          ]}
          value={who}
          onChange={setWho}
          label="Qui a payé ?"
        />
        <p className="meta">{help}</p>
      </div>
      <input className="field" placeholder="Libellé (facultatif)" value={label} onChange={(e) => setLabel(e.target.value)} />
      <button type="button" className="btn btn--primary btn--block" aria-disabled={!(value > 0)} onClick={add}>
        Ajouter {value > 0 ? `${value.toLocaleString('fr-FR')} €` : ''}
      </button>
    </Sheet>
  )
}
