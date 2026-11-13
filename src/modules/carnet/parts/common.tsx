import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../shared/ui'
import { blankPrep } from '../data/demo'
import { useCarnet } from '../store'
import type { Offer, PrepTrip } from '../types'

export const BASE = '/carnet'

/** En-tête d'écran : repère, titre, action à droite. */
export function ScreenHead({ eyebrow, title, lead, action }: { eyebrow: string; title: string; lead?: ReactNode; action?: ReactNode }) {
  return (
    <header className="page__head chead">
      {lead}
      <div className="chead__text">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="chead__title">{title}</h1>
      </div>
      {action}
    </header>
  )
}

/** Mention des fonctions prévues mais pas encore disponibles (décision validée). */
export function Soon({ children }: { children?: ReactNode }) {
  return <span className="soon">{children ? <>{children} · </> : null}Available soon…</span>
}

function prepFromOffer(o: Offer): PrepTrip {
  const name = o.destination.split(',')[0]
  const prep = blankPrep(`d${o.id}`, name)
  const fill = (id: string, values: string[]) => {
    const step = prep.steps.find((s) => s.id === id)
    if (!step) return
    step.proposals[0].forEach((l, i) => {
      if (values[i]) l.v = values[i]
    })
    step.filled = true
    step.status = 'wip'
  }
  fill('dest', [o.destination, o.trip, o.weather, o.why])
  fill('dates', [o.dates])
  const budget = prep.steps.find((s) => s.id === 'budget')
  if (budget?.budget && o.price != null) {
    budget.budget[o.type === 'Hôtel' ? 'logement' : o.type === 'Activité' ? 'activites' : 'transport'] = o.price
    budget.status = 'wip'
    budget.filled = true
  }
  return prep
}

/** « Préparer ce voyage » : crée un brouillon pré-rempli et ouvre Préparer. */
export function usePrepareOffer() {
  const carnet = useCarnet()
  const navigate = useNavigate()
  const toast = useToast()
  return (o: Offer) => {
    const id = `d${o.id}`
    if (!carnet.state.preps[id]) {
      carnet.addPrep(prepFromOffer(o))
      toast(`« ${o.destination.split(',')[0]} » pré-rempli : destination, dates, budget`)
    }
    navigate(`${BASE}/preparer/${id}`)
  }
}
