import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePerson, type Person } from '../../../shared/person'
import { Chip, Segment, cssVars } from '../../../shared/ui'
import { CATEGORIES, TRIPS } from '../data/demo'
import { eur, totalOf, tripStats } from '../logic'
import { Cover, OwnerTag, formatRange, shortMonth } from '../parts/bits'
import { BASE, ScreenHead } from '../parts/common'
import { isPast, useCarnet } from '../store'

type PersoFilter = 'tous' | Person

/** « Nos voyages » : statistiques et liste des voyages passés. */
export function TripsScreen() {
  const { me } = usePerson()
  const carnet = useCarnet()
  const [tab, setTab] = useState<'commun' | 'perso'>('commun')
  const [perso, setPerso] = useState<PersoFilter>('tous')
  const [stat, setStat] = useState<'cat' | 'pays'>('cat')
  const [view, setView] = useState<'list' | 'grid'>('list')

  // Les voyages en cours ou à venir ne comptent pas dans les statistiques ni dans la liste.
  const trips = TRIPS.filter((t) => isPast(t))
    .filter((t) => (tab === 'commun' ? t.owner === 'both' : t.owner !== 'both'))
    .filter((t) => tab === 'commun' || perso === 'tous' || t.owner === perso)
    .sort((a, b) => b.start.localeCompare(a.start))
  const stats = tripStats(trips, carnet.expensesOf)
  const plural = (n: number, w: string) => `${n} ${w}${n > 1 ? 's' : ''}`

  return (
    <div className="page carnet">
      <ScreenHead eyebrow="Carnet de voyage" title="Nos voyages" />
      <Segment
        options={[
          { value: 'commun', label: 'Communs' },
          { value: 'perso', label: 'Perso' },
        ]}
        value={tab}
        onChange={setTab}
        className="seg-narrow"
        label="Voyages communs ou personnels"
      />
      {tab === 'perso' && (
        <div className="chips noscroll">
          {(['tous', me, me === 'alex' ? 'antoine' : 'alex'] as PersoFilter[]).map((p) => (
            <Chip key={p} active={perso === p} onClick={() => setPerso(p)}>
              {p === 'tous' ? 'Tous' : p === 'alex' ? 'Alex' : 'Antoine'}
            </Chip>
          ))}
        </div>
      )}

      <section className="card csection">
        <div className="spread">
          <div>
            <div className="eyebrow">En tout</div>
            <div className="cnum">{eur(stats.total)}</div>
          </div>
          <Segment
            size="sm"
            inline
            options={[
              { value: 'cat', label: 'Catégories' },
              { value: 'pays', label: 'Pays' },
            ]}
            value={stat}
            onChange={setStat}
            label="Répartition"
          />
        </div>
        <p className="meta">
          {plural(stats.trips, 'voyage')} · {stats.countries.length} pays · {plural(stats.continents, 'continent')} · {stats.days} j
        </p>
        {stat === 'cat' ? (
          <>
            <div className="stackbar" aria-hidden="true">
              {CATEGORIES.map((c) => (
                <span key={c.id} className="swatch-bg" data-color={c.color} style={cssVars({ '--w': stats.byCategory[c.id] / (stats.total || 1) })} />
              ))}
            </div>
            <div className="legend">
              {CATEGORIES.map((c) => (
                <div key={c.id} className="legend__item">
                  <span className="catdot swatch-bg" data-color={c.color} />
                  <span className="row__body ellipsis">{c.name}</span>
                  <strong>{Math.round((stats.byCategory[c.id] / (stats.total || 1)) * 100)}&nbsp;%</strong>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div>
            {stats.countries.map((g, i) => (
              <div key={g.name} className={i === 0 ? 'row row--first' : 'row'}>
                <div className="row__body">
                  <div className="row__title">{g.name}</div>
                  <div className="meta">
                    {g.continent} · {plural(g.count, 'voyage')}
                  </div>
                </div>
                <strong>{eur(g.amount)}</strong>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="spread">
        <strong>{plural(trips.length, 'voyage')}</strong>
        <Segment
          size="sm"
          inline
          options={[
            { value: 'list', label: 'Liste' },
            { value: 'grid', label: 'Grille' },
          ]}
          value={view}
          onChange={setView}
          label="Affichage"
        />
      </div>

      {trips.length === 0 && <p className="muted">Aucun voyage ici pour l'instant.</p>}
      {view === 'list' ? (
        <div className="grid-auto carnet__grid">
          {trips.map((t) => (
            <Link key={t.id} to={`${BASE}/voyages/${t.id}`} state={{ from: 'trips' }} className="card card--click tripcard">
              <Cover color={t.color} emoji={t.emoji} rotate={t.rotate} className="tripcard__cover" />
              <span className="tripcard__body">
                <span className="spread">
                  <span className="ctitle">{t.name}</span>
                  <strong className="tripcard__total">{eur(totalOf(carnet.expensesOf(t)))}</strong>
                </span>
                <span className="meta">{formatRange(t.start, t.end)}</span>
                <span className="tripcard__memory">« {t.memory} »</span>
                <OwnerTag owner={t.owner} />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="tripgrid">
          {trips.map((t) => (
            <Link key={t.id} to={`${BASE}/voyages/${t.id}`} state={{ from: 'trips' }} className="card card--click tripgrid__item">
              <Cover color={t.color} emoji={t.emoji} rotate={t.rotate} className="tripgrid__cover" />
              <span className="ctitle">{t.name}</span>
              <span className="meta">
                {shortMonth(t.start)} · {eur(totalOf(carnet.expensesOf(t)))}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
