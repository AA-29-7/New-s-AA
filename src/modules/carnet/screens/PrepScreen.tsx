import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Chip, Ring, Sticker, cx } from '../../../shared/ui'
import { blankPrep } from '../data/demo'
import { budgetStatus, eur, plannedBudget, stepSummary, stepsDone, suggestedStep } from '../logic'
import { Gauge } from '../parts/bits'
import { BASE, ScreenHead, Soon } from '../parts/common'
import { useCarnet } from '../store'
import type { StepStatus } from '../types'

export const STATUS_LABEL: Record<StepStatus, string> = {
  todo: 'À faire',
  wip: 'En cours',
  ia: "Proposé par l'IA",
  ok: 'Validé ✓',
}

/** Préparer : les 9 étapes d'un voyage, à remplir dans n'importe quel ordre. */
export function PrepScreen() {
  const { tripId } = useParams()
  const carnet = useCarnet()
  const navigate = useNavigate()
  const { preps, prepOrder } = carnet.state
  const id = tripId ?? prepOrder[0]
  const prep = preps[id]

  if (!prep) return <Navigate to={`${BASE}/preparer`} replace />

  const done = stepsDone(prep.steps)
  const suggested = suggestedStep(prep.steps)?.id
  const total = plannedBudget(prep)
  const level = budgetStatus(total, prep.ideal, prep.limit).level

  const create = () => {
    const newId = `n${Date.now()}`
    carnet.addPrep(blankPrep(newId, 'Nouveau voyage'))
    navigate(`${BASE}/preparer/${newId}`)
  }

  return (
    <div className="page carnet">
      <ScreenHead
        eyebrow="Carnet de voyage"
        title="Préparer"
        action={
          <span className="btn btn--secondary btn--compact" aria-disabled="true">
            Partager · <Soon />
          </span>
        }
      />
      <div className="chips noscroll">
        {prepOrder.map((pid) => (
          <Chip key={pid} active={pid === id} onClick={() => navigate(`${BASE}/preparer/${pid}`)}>
            {preps[pid]?.name}
          </Chip>
        ))}
        <Chip className="chip--dashed" onClick={create}>
          + Nouveau voyage
        </Chip>
      </div>

      <div className="budgetbar">
        <div className="budgetbar__main">
          <div className="spread">
            <span className="budgetbar__label">Budget prévu</span>
            <strong className="budgetbar__total">{eur(total)}</strong>
          </div>
          <Gauge value={total} ideal={prep.ideal} limit={prep.limit} level={level} inverse />
        </div>
        <Ring value={done / 9} size={52}>
          {done}/9
        </Ring>
      </div>

      <div className="steps">
        {prep.steps.map((s) => (
          <Link key={s.id} to={`${BASE}/preparer/${prep.id}/${s.id}`} className={cx('card card--md card--click stepcard', s.id === suggested && 'is-suggested')}>
            <span className="spread">
              <Sticker emoji={s.emoji} color={s.color} size={40} rotate={s.rotate} />
              <span className="stepstatus" data-status={s.status}>
                {STATUS_LABEL[s.status]}
              </span>
            </span>
            {s.id === suggested && <span className="stepcard__suggested">Suggérée</span>}
            <span className="stepcard__title">{s.title}</span>
            <span className="meta stepcard__sum">{stepSummary(s, prep)}</span>
            <span className="meta stepcard__mode">{s.mode === 'auto' ? '✦ Automatique' : '✎ Manuel'}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
