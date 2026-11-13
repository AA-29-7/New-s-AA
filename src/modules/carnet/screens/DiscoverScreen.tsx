import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Chip, Segment, Sheet, Sticker, cx, useToast } from '../../../shared/ui'
import { FILTER_GROUPS, OFFERS, ORIGINS, SHORTCUTS, SHORTCUTS_VISIBLE } from '../data/demo'
import { activeFilters, eur, matchesFilters } from '../logic'
import { Cover } from '../parts/bits'
import { ScreenHead, usePrepareOffer } from '../parts/common'
import { TripMap } from '../parts/TripMap'
import { useCarnet } from '../store'
import type { Offer } from '../types'

type View = 'feed' | 'list' | 'map'
const price = (o: Offer) => (o.price == null ? '—' : eur(o.price))

/** Bouton ♥ ; la clé relance le rebond seulement quand l'état change. */
function Heart({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button type="button" key={on ? 'on' : 'off'} className={cx('heart', on && 'is-on')} aria-pressed={on} aria-label={on ? 'Retirer des enregistrées' : 'Enregistrer'} onClick={onToggle}>
      ♥
    </button>
  )
}

/** Discover : offres du moment, raccourcis, filtres, feed / liste / carte. */
export function DiscoverScreen() {
  const carnet = useCarnet()
  const { state } = carnet
  const toast = useToast()
  const prepare = usePrepareOffer()
  const [params, setParams] = useSearchParams()
  const shortcut = params.get('raccourci') ?? 'all'
  const [view, setView] = useState<View>('feed')
  const [more, setMore] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [shown, setShown] = useState(6)
  const [leaving, setLeaving] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [refresh, setRefresh] = useState({ n: 0, label: 'Mis à jour hier à 6 h' })

  const setShortcut = (id: string) => {
    setShown(6)
    setParams(id === 'all' ? {} : { raccourci: id }, { replace: true })
  }
  const pool = OFFERS.filter((o) => !state.dismissed.includes(o.id))
    .filter((o) => (shortcut === 'all' ? true : shortcut === 'saved' ? state.saved.includes(o.id) : o.shortcuts.includes(shortcut)))
    .filter((o) => matchesFilters(o, state.filters))
  const visible = pool.slice(0, shown)
  const onMap = pool.filter((o) => o.coord)
  const offMap = pool.filter((o) => !o.coord)
  const sel = onMap.find((o) => o.id === selected) ?? onMap[0]
  const nFilters = activeFilters(state.filters)
  const visibleShortcuts = more ? SHORTCUTS : SHORTCUTS.slice(0, SHORTCUTS_VISIBLE)

  const save = (o: Offer) => {
    const was = state.saved.includes(o.id)
    carnet.toggleSaved(o.id)
    toast(was ? 'Retiré des enregistrées' : 'Enregistré · le feed en tient compte')
  }
  const dismiss = (o: Offer) => {
    setLeaving((l) => [...l, o.id])
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    window.setTimeout(() => {
      carnet.dismiss(o.id)
      setLeaving((l) => l.filter((x) => x !== o.id))
    }, still ? 0 : 400)
  }
  const pickFilter = (gid: string, opt: string, multi?: boolean) =>
    carnet.update((s) => {
      const cur = s.filters[gid] ?? []
      const next = multi ? (cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt]) : cur[0] === opt && gid !== 'per' ? [] : [opt]
      return { filters: { ...s.filters, [gid]: next } }
    })

  return (
    <div className="page carnet">
      <ScreenHead
        eyebrow="Offres du moment"
        title="Discover"
        action={
          <button
            type="button"
            className="btn btn--surface btn--compact"
            onClick={() => {
              setRefresh((r) => ({ n: r.n + 1, label: 'Mis à jour à l’instant' }))
              toast('Offres actualisées')
            }}
          >
            <span className="ai__spin" style={{ ['--turns' as string]: refresh.n }}>
              ↻
            </span>
            Actualiser
          </button>
        }
      />
      <div className="fresh meta">
        <span className="sync">{refresh.label}</span>
        <label className="fresh__origin">
          Départ :
          <select value={state.origin} onChange={(e) => carnet.update(() => ({ origin: e.target.value }))}>
            {ORIGINS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="chips noscroll">
        {visibleShortcuts.map((s) => (
          <Chip key={s.id} active={shortcut === s.id} onClick={() => setShortcut(s.id)}>
            {s.label}
            {s.id === 'saved' && state.saved.length > 0 ? ` · ${state.saved.length}` : ''}
          </Chip>
        ))}
        <Chip className="chip--dashed" onClick={() => setMore((m) => !m)}>
          {more ? 'Moins ▴' : 'Plus ▾'}
        </Chip>
      </div>

      <div className="spread">
        <button type="button" className="btn btn--outline btn--compact" onClick={() => setFiltersOpen(true)}>
          Filtres{nFilters ? ` · ${nFilters}` : ''}
        </button>
        <Segment<View>
          size="sm"
          inline
          options={[
            { value: 'feed', label: 'Feed' },
            { value: 'list', label: 'Liste' },
            { value: 'map', label: 'Carte' },
          ]}
          value={view}
          onChange={setView}
          label="Affichage"
        />
      </div>
      <p className="meta">
        Le feed apprend de vos choix · {state.saved.length} enregistrée{state.saved.length > 1 ? 's' : ''}, {state.dismissed.length} écartée
        {state.dismissed.length > 1 ? 's' : ''}
      </p>

      {pool.length === 0 && (
        <div className="empty empty--inline">
          <Sticker emoji="🧭" color="mist" size={72} rotate={-4} />
          <strong>Rien pour ce raccourci</strong>
          <p className="empty__text">Essaie un autre raccourci ou enlève des filtres.</p>
        </div>
      )}

      {view === 'feed' && (
        <div key={refresh.n} className="offers">
          {visible.map((o) => (
            <article key={o.id} className={cx('card offer', leaving.includes(o.id) && 'is-leaving', refresh.n > 0 && 'is-shimmer')}>
              <Cover color={o.color} emoji={o.emoji} rotate={o.id % 2 ? -5 : 4} sticker={56} className="offer__cover">
                <span className="offer__type">{o.type}</span>
              </Cover>
              <Heart on={state.saved.includes(o.id)} onToggle={() => save(o)} />
              <div className="spread offer__head">
                <div className="row__body">
                  <div className="ctitle">{o.destination}</div>
                  <div className="meta">{o.dates}</div>
                </div>
                <div className="offer__price">
                  <strong>{price(o)}</strong>
                  <span className="meta">{o.per}</span>
                </div>
              </div>
              <p className="inset offer__why">
                <strong>Pourquoi c'est intéressant :</strong> {o.why}
              </p>
              <p className="meta">
                {o.trip} · {o.weather}
                {o.reading ? ` · ${o.reading}` : ''}
              </p>
              <button type="button" className="btn btn--primary btn--block" onClick={() => prepare(o)}>
                Préparer ce voyage
              </button>
              <button type="button" className="btn btn--text" onClick={() => dismiss(o)}>
                ✕ Écarter
              </button>
            </article>
          ))}
        </div>
      )}

      {view === 'list' && pool.length > 0 && (
        <section className="card">
          {visible.map((o, i) => (
            <div key={o.id} className={cx('row offerrow', i === 0 && 'row--first', leaving.includes(o.id) && 'is-leaving')}>
              <button type="button" className="row__body offerrow__main" onClick={() => prepare(o)}>
                <span className="catdot swatch-bg" data-color={o.color} />
                <span className="row__body">
                  <span className="row__title ellipsis">{o.destination}</span>
                  <span className="meta ellipsis">
                    {o.type} · {o.trip} · {o.weather}
                  </span>
                </span>
              </button>
              <strong>{price(o)}</strong>
              <Heart on={state.saved.includes(o.id)} onToggle={() => save(o)} />
              <button type="button" className="arrow" aria-label="Écarter" onClick={() => dismiss(o)}>
                ✕
              </button>
            </div>
          ))}
        </section>
      )}

      {view === 'map' && pool.length > 0 && (
        <>
          {onMap.length > 0 && (
            <TripMap
              variant="prices"
              height={300}
              pins={onMap.map((o) => ({
                lon: o.coord![0],
                lat: o.coord![1],
                label: o.price == null ? o.emoji : price(o),
                active: o.id === sel?.id,
                onPick: () => setSelected(o.id),
              }))}
            />
          )}
          {sel && (
            <article className="card csection">
              <div className="csection__row">
                <Sticker emoji={sel.emoji} color={sel.color} size={44} rotate={-4} />
                <div className="row__body">
                  <div className="ctitle">{sel.destination}</div>
                  <div className="meta">{sel.dates}</div>
                </div>
                <Heart on={state.saved.includes(sel.id)} onToggle={() => save(sel)} />
              </div>
              <p className="meta">
                {sel.trip} · {sel.weather}
              </p>
              <div className="spread">
                <strong className="cbig">{price(sel)}</strong>
                <span className="meta">{sel.per}</span>
              </div>
              <button type="button" className="btn btn--primary btn--block" onClick={() => prepare(sel)}>
                Préparer ce voyage
              </button>
              <button type="button" className="btn btn--text" onClick={() => dismiss(sel)}>
                ✕ Écarter
              </button>
            </article>
          )}
          {offMap.length > 0 && (
            <section className="card">
              <div className="eyebrow">Hors de la carte</div>
              {offMap.map((o) => (
                <button key={o.id} type="button" className="row offerrow__main" onClick={() => prepare(o)}>
                  <span className="catdot swatch-bg" data-color={o.color} />
                  <span className="row__body row__title">{o.destination}</span>
                  <strong>{price(o)}</strong>
                </button>
              ))}
            </section>
          )}
        </>
      )}

      {view !== 'map' && pool.length > shown && (
        <button type="button" className="btn btn--secondary btn--block" onClick={() => setShown((n) => n + 3)}>
          Voir plus
        </button>
      )}

      <Sheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtres">
        {FILTER_GROUPS.map((g) => (
          <div key={g.id} className="stack stack--sm">
            <strong>{g.title}</strong>
            <div className="chips chips--wrap">
              {g.options.map((opt) => (
                <Chip key={opt} className="chip--sunken" active={(state.filters[g.id] ?? []).includes(opt)} onClick={() => pickFilter(g.id, opt, g.multi)}>
                  {opt}
                </Chip>
              ))}
            </div>
          </div>
        ))}
        <div className="spread">
          <button type="button" className="btn btn--text" onClick={() => carnet.update(() => ({ filters: { per: ['Pour deux'] } }))}>
            Réinitialiser
          </button>
          <button type="button" className="btn btn--primary" onClick={() => setFiltersOpen(false)}>
            Voir les offres
          </button>
        </div>
      </Sheet>
    </div>
  )
}
