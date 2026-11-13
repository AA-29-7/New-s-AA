import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { longDate } from '../../../shared/lib/dates'
import { THEME_OPTIONS, useTheme } from '../../../shared/theme'
import { ProgressBar, Sheet, Sticker, cx } from '../../../shared/ui'
import { FRISE_IDS, HOME_SECTIONS, NEXT_TRIP_ID, OFFERS, TRIPS } from '../data/demo'
import { balanceText, eur, plannedBudget, stepSummary, stepsDone, suggestedStep } from '../logic'
import { BASE, ScreenHead, usePrepareOffer } from '../parts/common'
import { Gauge, OwnerTag, TripSticker, formatRange, shortMonth } from '../parts/bits'
import { daysUntil, tripById, useCarnet } from '../store'
import type { HomeSectionId } from '../types'

/** Le chiffre défile de 0 à n au chargement (38 ms par pas). */
function useCountUp(target: number) {
  const still = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const [n, setN] = useState(still ? target : 0)
  useEffect(() => {
    if (still) return setN(target)
    let i = 0
    setN(0)
    const t = window.setInterval(() => {
      i++
      setN(Math.min(i, target))
      if (i >= target) window.clearInterval(t)
    }, 38)
    return () => window.clearInterval(t)
  }, [target, still])
  return n
}

export function HomeScreen() {
  const carnet = useCarnet()
  const { state } = carnet
  const { pref, setPref } = useTheme()
  const prepare = usePrepareOffer()
  const [custom, setCustom] = useState(false)

  const next = tripById(NEXT_TRIP_ID)!
  const prep = state.preps[NEXT_TRIP_ID]
  const days = Math.max(0, daysUntil(next))
  const count = useCountUp(days)
  const done = prep ? stepsDone(prep.steps) : 0
  const step = prep ? (suggestedStep(prep.steps) ?? prep.steps[0]) : undefined
  const last = tripById('rome')!
  const saved = OFFERS.filter((o) => state.saved.includes(o.id) && !state.dismissed.includes(o.id))
  const themeLabel = THEME_OPTIONS.find((t) => t.value === pref)?.label
  const cycleTheme = () => setPref(pref === 'auto' ? 'light' : pref === 'light' ? 'dark' : 'auto')
  const prepLink = `${BASE}/preparer/${NEXT_TRIP_ID}`

  const move = (i: number, d: number) =>
    carnet.update((s) => {
      const order = [...s.homeOrder]
      const j = i + d
      if (j < 0 || j >= order.length) return {}
      ;[order[i], order[j]] = [order[j], order[i]]
      return { homeOrder: order }
    })

  const sections: Record<HomeSectionId, () => React.ReactNode> = {
    prep: () =>
      step && (
        <section className="card csection">
          <div className="eyebrow">À préparer ensuite</div>
          <div className="csection__row">
            <Sticker emoji={step.emoji} color={step.color} size={44} rotate={step.rotate} />
            <div className="row__body">
              <div className="ctitle">{step.title}</div>
              <div className="meta ellipsis">{stepSummary(step, prep!)}</div>
            </div>
          </div>
          <Link to={`${prepLink}/${step.id}`} className="btn btn--primary btn--block">
            Ouvrir l'étape
          </Link>
          <Link to={prepLink} className="link-btn">
            Voir les 9 étapes ›
          </Link>
        </section>
      ),
    frise: () => (
      <section className="card csection">
        <div className="spread">
          <span className="eyebrow">Notre frise</span>
          <span className="meta">Voyages communs</span>
        </div>
        <div className="frise noscroll">
          {FRISE_IDS.map((id) => TRIPS.find((t) => t.id === id)!).map((t) => (
            <Link key={t.id} to={`${BASE}/voyages/${t.id}`} state={{ from: 'home' }} className="frise__item">
              <TripSticker trip={t} />
              <span className="frise__name">{t.name}</span>
              <span className="frise__date">{shortMonth(t.start)}</span>
            </Link>
          ))}
          <Link to={prepLink} className="frise__item frise__item--next">
            <Sticker emoji={next.emoji} color={next.color} size={44} />
            <span className="frise__name">{next.name}</span>
            <span className="frise__date">J-{days}</span>
          </Link>
          <Link to={`${BASE}/discover`} className="frise__item frise__item--unknown">
            <span className="frise__q">?</span>
            <span className="frise__name">Le suivant</span>
            <span className="frise__date">Discover</span>
          </Link>
        </div>
      </section>
    ),
    saved: () => (
      <section className="card csection">
        <div className="spread">
          <span className="eyebrow">Destinations enregistrées</span>
          {saved.length > 0 && (
            <Link to={`${BASE}/discover?raccourci=saved`} className="link-btn">
              Voir tout ›
            </Link>
          )}
        </div>
        {saved.length === 0 ? (
          <p className="muted">
            Touche ♥ sur une offre de Discover pour la retrouver ici.{' '}
            <Link to={`${BASE}/discover`} className="link-inline">
              Aller dans Discover ›
            </Link>
          </p>
        ) : (
          <div>
            {saved.slice(0, 3).map((o, i) => (
              <button key={o.id} type="button" className={cx('row crow', i === 0 && 'row--first')} onClick={() => prepare(o)}>
                <span className="catdot swatch-bg" data-color={o.color} />
                <span className="row__body row__title ellipsis">{o.destination}</span>
                <strong>{o.price == null ? '—' : eur(o.price)}</strong>
                <span className="link-btn">Préparer ›</span>
              </button>
            ))}
          </div>
        )}
      </section>
    ),
    souv: () => (
      <Link to={`${BASE}/voyages/${last.id}?section=souv`} state={{ from: 'home' }} className="card card--click csection">
        <div className="eyebrow">Dernier souvenir · {last.name}</div>
        <div className="csection__row">
          <TripSticker trip={last} />
          <p className="quote">« {last.memory} »</p>
        </div>
        <span className="link-btn">Ouvrir les souvenirs ›</span>
      </Link>
    ),
    solde: () => (
      <Link to={`${BASE}/voyages/${last.id}`} state={{ from: 'home' }} className="card card--click csection">
        <div className="eyebrow">Comptes · {last.name}</div>
        <div className="cbig">{balanceText(last, carnet.expensesOf(last), state.settled[last.id])}</div>
        <span className="link-btn">Voir les dépenses ›</span>
      </Link>
    ),
    budget: () =>
      prep && (
        <Link to={prepLink} className="card card--click csection">
          <div className="spread">
            <span className="eyebrow">Budget · {next.name}</span>
            <span className="cbig">{eur(plannedBudget(prep))}</span>
          </div>
          <Gauge value={plannedBudget(prep)} ideal={prep.ideal} limit={prep.limit} />
        </Link>
      ),
  }

  return (
    <div className="page carnet">
      <div className="spread only-mobile">
        <Link to="/" className="link-btn link-btn--soft">
          ‹ Le QG
        </Link>
        <button type="button" className="link-btn link-btn--soft" onClick={cycleTheme}>
          ◐ {themeLabel}
        </button>
      </div>
      <ScreenHead
        eyebrow={longDate()}
        title="Accueil"
        lead={<Sticker emoji="🌍" color="honey" size={54} rotate={4} />}
        action={
          <button type="button" className="btn btn--surface btn--compact" onClick={() => setCustom(true)}>
            ✎ Personnaliser
          </button>
        }
      />

      <Link to={prepLink} className="card card--click hero">
        <div className="hero__top">
          <div className="hero__text">
            <div className="eyebrow">Prochain départ</div>
            <div className="hero__name">{next.name}</div>
            <div className="muted">{formatRange(next.start, next.end).replace(/ \d{4}$/, '')}</div>
            <OwnerTag owner={next.owner} />
          </div>
          <div className="hero__count">
            <div className="hero__num">
              <Sticker emoji="✈️" color="mist" size={34} className="hero__plane" />
              <span>{count}</span>
            </div>
            <div className="meta">{days > 1 ? 'jours avant le départ' : days === 1 ? 'jour avant le départ' : 'C’est le jour du départ'}</div>
          </div>
        </div>
        <div className="hero__prep">
          <div className="spread meta">
            <span>Préparation</span>
            <strong>{done}/9 étapes validées</strong>
          </div>
          <ProgressBar value={done / 9} ink />
        </div>
      </Link>

      <div className="grid-auto carnet__grid">
        {state.homeOrder.filter((id) => state.homeOn[id]).map((id) => (
          <div key={id} className="carnet__cell">
            {sections[id]()}
          </div>
        ))}
      </div>
      <button type="button" className="btn btn--dashed btn--block" onClick={() => setCustom(true)}>
        + Ajouter une section
      </button>

      <Sheet open={custom} onClose={() => setCustom(false)} title="Mon accueil" closeLabel="Terminer">
        <p className="meta">Choisis les sections affichées sous le prochain départ, et leur ordre.</p>
        <div>
          {state.homeOrder.map((id, i) => {
            const on = !!state.homeOn[id]
            return (
              <div key={id} className={cx('row', i === 0 && 'row--first')}>
                <div className="row__body">
                  <div className="row__title">{HOME_SECTIONS[id].label}</div>
                  <div className="meta">{HOME_SECTIONS[id].description}</div>
                </div>
                <button type="button" className="arrow" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Monter ${HOME_SECTIONS[id].label}`}>
                  ↑
                </button>
                <button type="button" className="arrow" disabled={i === state.homeOrder.length - 1} onClick={() => move(i, 1)} aria-label={`Descendre ${HOME_SECTIONS[id].label}`}>
                  ↓
                </button>
                <button
                  type="button"
                  className={cx('btn btn--mini', on ? 'btn--secondary' : 'btn--accent')}
                  onClick={() => carnet.update((s) => ({ homeOn: { ...s.homeOn, [id]: !on } }))}
                >
                  {on ? 'Retirer' : 'Ajouter'}
                </button>
              </div>
            )
          })}
        </div>
        <button type="button" className="btn btn--primary btn--block" onClick={() => setCustom(false)}>
          Terminer
        </button>
      </Sheet>
    </div>
  )
}
