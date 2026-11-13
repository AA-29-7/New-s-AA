import { useState } from 'react'
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { Chip, OwnerDots, Sticker, cssVars, cx, useIsDesktop, useOnline, useToast } from '../../../shared/ui'
import { CATEGORIES } from '../data/demo'
import { balance, balanceText, budgetBounds, budgetStatus, eur, totalOf, tripDays } from '../logic'
import { CatDot, Cover, Gauge, OwnerTag, formatRange, useConfetti } from '../parts/bits'
import { BASE, Soon } from '../parts/common'
import { ExpenseSheet } from '../parts/ExpenseSheet'
import { Notebook } from '../parts/Notebook'
import { Photos } from '../parts/Photos'
import { TripMap } from '../parts/TripMap'
import { useCarnet } from '../store'

type Section = 'dep' | 'itin' | 'souv'
const SECTIONS: { id: Section; label: string }[] = [
  { id: 'dep', label: 'Dépenses' },
  { id: 'itin', label: 'Itinéraire' },
  { id: 'souv', label: 'Souvenirs' },
]
const BACK: Record<string, { label: string; to: string }> = {
  home: { label: 'Accueil', to: BASE },
  onsite: { label: 'Sur place', to: `${BASE}/sur-place` },
  trips: { label: 'Nos voyages', to: `${BASE}/voyages` },
}

/** Formes grises en attendant les données (jamais d'écran vide). */
function TripSkeleton() {
  return (
    <div className="page carnet" aria-busy="true">
      <div className="skeleton tripskeleton" />
      <div className="skeleton skeleton--row" />
      <div className="skeleton skeleton--row" />
    </div>
  )
}

/** Fiche d'un voyage : dépenses, itinéraire, souvenirs. */
export function TripScreen() {
  const { id } = useParams()
  const carnet = useCarnet()
  const trip = carnet.tripById(id)
  const desktop = useIsDesktop()
  const online = useOnline()
  const confetti = useConfetti()
  const toast = useToast()
  const location = useLocation()
  const [params] = useSearchParams()
  const [section, setSection] = useState<Section>((params.get('section') as Section) || 'dep')
  const [adding, setAdding] = useState(false)

  if (carnet.loading) return <TripSkeleton />
  if (!trip) return <Navigate to={`${BASE}/voyages`} replace />

  const back = BACK[(location.state as { from?: string } | null)?.from ?? 'trips'] ?? BACK.trips
  const expenses = carnet.expensesOf(trip)
  const total = totalOf(expenses)
  const { ideal, limit } = budgetBounds(trip)
  const status = budgetStatus(total, ideal, limit)
  const bal = balance(expenses)
  const settled = !!carnet.state.settled[trip.id]
  const shared = trip.owner === 'both'
  const show = (s: Section) => desktop || section === s

  return (
    <div className="page carnet">
      <div className="spread">
        <Link to={back.to} className="link-btn link-btn--soft">
          ‹ {back.label}
        </Link>
        <span className="btn btn--secondary btn--compact" aria-disabled="true">
          Partager en lecture · <Soon />
        </span>
      </div>
      <Cover color={trip.color} emoji={trip.emoji} rotate={trip.rotate} sticker={64} className="tripcover">
        <span className="tripcover__label">photo de couverture</span>
      </Cover>
      <header className="page__head stack stack--sm">
        <h1 className="chead__title">{trip.name}</h1>
        <p className="muted">
          {trip.country} · {formatRange(trip.start, trip.end)} · {tripDays(trip)} j
        </p>
        <div>
          <OwnerTag owner={trip.owner} />
        </div>
      </header>
      <div className="inset souvenir">
        <Sticker emoji="💛" color="honey" size={34} rotate={-4} />
        <div>
          <div className="eyebrow">Souvenir préféré</div>
          <p className="quote">« {trip.memory} »</p>
        </div>
      </div>

      {!desktop && (
        <div className="chips noscroll">
          {SECTIONS.map((s) => (
            <Chip key={s.id} active={section === s.id} onClick={() => setSection(s.id)}>
              {s.label}
            </Chip>
          ))}
        </div>
      )}

      <div className="grid-auto carnet__grid">
        {show('dep') && (
          <div className="stack">
            <section className="card csection">
              <div className="spread">
                <div>
                  <div className="eyebrow">Dépenses</div>
                  <div className="cnum">{eur(total)}</div>
                </div>
                <strong className="status" data-level={status.level}>
                  {status.label}
                </strong>
              </div>
              <div className="inset balance">
                <OwnerDots owner="both" />
                <strong>{balanceText(trip, expenses, settled)}</strong>
              </div>
              <Gauge value={total} ideal={ideal} limit={limit} level={status.level} />
              <div className="stack stack--sm">
                {CATEGORIES.map((c) => ({ c, v: totalOf(expenses.filter((e) => e.cat === c.id)) }))
                  .filter(({ v }) => v > 0)
                  .map(({ c, v }) => (
                    <div key={c.id} className="catline">
                      <CatDot cat={c.id} />
                      <span className="catline__name ellipsis">{c.name}</span>
                      <span className="catline__bar">
                        <span className="swatch-bg" data-color={c.color} style={cssVars({ '--w': v / (total || 1) })} />
                      </span>
                      <strong>{eur(v)}</strong>
                    </div>
                  ))}
              </div>
              <div>
                {expenses.length === 0 && <p className="muted">Rien pour l'instant. Le bouton + ajoute une dépense en deux gestes.</p>}
                {[...expenses].reverse().map((e, i) => (
                  <div key={e.id} className={cx('row', i === 0 && 'row--first')}>
                    <CatDot cat={e.cat} />
                    <div className="row__body">
                      <div className="row__title ellipsis">{e.label}</div>
                      <div className="meta">
                        {e.who === 'commun' ? 'Épargne commune' : `Payé par ${e.who === 'alex' ? 'Alex' : 'Antoine'}`} · {e.day}
                        {e.pending && !online ? ' · en attente d’envoi' : ''}
                      </div>
                    </div>
                    <strong className="row__amount">{eur(e.amount)}</strong>
                  </div>
                ))}
              </div>
            </section>
            <section className="card csection">
              <div className="eyebrow">Qui a payé quoi</div>
              <div className="paid">
                <div className="paid__box person-tint" data-person="alex">
                  <span>Alex</span>
                  <strong>{trip.owner === 'antoine' ? '—' : eur(bal.paidByAlex)}</strong>
                </div>
                <div className="paid__box person-tint" data-person="antoine">
                  <span>Antoine</span>
                  <strong>{trip.owner === 'alex' ? '—' : eur(bal.paidByAntoine)}</strong>
                </div>
              </div>
              <p className="meta">Épargne commune : {eur(bal.fromSavings)}. N'entre pas dans les remboursements.</p>
              <div className="inset">
                <div className="eyebrow">{!shared ? 'Voyage perso' : settled || bal.quits ? 'Comptes' : 'Pour être quittes'}</div>
                <strong>{balanceText(trip, expenses, settled)}</strong>
              </div>
              {shared && !settled && !bal.quits && (
                <button
                  type="button"
                  className="btn btn--primary btn--block"
                  onClick={() => {
                    carnet.settle(trip)
                    confetti()
                    toast('Comptes à zéro !')
                  }}
                >
                  Marquer comme réglé
                </button>
              )}
            </section>
          </div>
        )}

        {show('itin') && (
          <section className="card csection">
            <div className="eyebrow">Itinéraire</div>
            <div>
              {trip.itinerary.map((v, i) => (
                <div key={i} className={cx('row itin', i === 0 && 'row--first')}>
                  <strong className="itin__day">Jour {i + 1}</strong>
                  <span className="row__body">{v}</span>
                </div>
              ))}
            </div>
            <TripMap pins={trip.pins.map(([label, lon, lat], i) => ({ label, lon, lat, n: i + 1 }))} />
          </section>
        )}

        {show('souv') && (
          <section className="card csection">
            <div className="eyebrow">Souvenirs</div>
            <Photos trip={trip} />
            <hr className="sep" />
            <Notebook trip={trip} />
          </section>
        )}
      </div>

      <button type="button" className="fab" onClick={() => setAdding(true)} aria-label="Ajouter une dépense">
        +
      </button>
      <ExpenseSheet trip={trip} open={adding} onClose={() => setAdding(false)} />
    </div>
  )
}
