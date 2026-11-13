import { useState } from 'react'
import { addDays, daysInMonth, isoDate, monthYear } from '../../../shared/lib/dates'
import { PERSONS, nameOf, usePerson, type Person } from '../../../shared/person'
import { Avatar, Chip, Ring, Segment, StreakPill, Sticker, cssVars, cx } from '../../../shared/ui'
import {
  checkCount,
  currentStreak,
  didOn,
  duel,
  habitRate,
  habitsOf,
  level,
  longestStreak,
  monthStartOf,
  perfectDays,
  perfectRun,
  ratioOn,
  regularity,
} from '../logic'
import { useHabits } from '../store'

type Period = 'semaine' | 'mois' | 'annee'
type Scope = 'me' | 'other' | 'us' | 'duel'
const DAY_HEAD = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
const pct = (x: number) => `${Math.round(x * 100)} %`
/** Niveau d'une barre : plein à 100 %, éclairci en dessous (charte §8). */
const barLevel = (x: number) => (x >= 0.995 ? 3 : x >= 0.8 ? 2 : 1)

/** Trois compteurs ; ceux qui ouvrent une liste portent un « › ». */
function Counters({ items }: { items: { value: string; label: string; onClick?: () => void }[] }) {
  return (
    <div className="hstats">
      {items.map((it) =>
        it.onClick ? (
          <button key={it.label} type="button" className="card hstat card--click" onClick={it.onClick}>
            <span className="hstats__num">{it.value}</span>
            <span className="meta">{it.label} ›</span>
          </button>
        ) : (
          <div key={it.label} className="card hstat">
            <span className="hstats__num">{it.value}</span>
            <span className="meta">{it.label}</span>
          </div>
        ),
      )}
    </div>
  )
}

/** Onglet Séries : régularité, récaps, « Nous » et duel. */
export function SeriesTab({ onStreaks }: { onStreaks: (k: 'cur' | 'rec') => void }) {
  const { me, other } = usePerson()
  const store = useHabits()
  const [period, setPeriod] = useState<Period>('mois')
  const [scope, setScope] = useState<Scope>('me')
  const monthOnly = scope === 'us' || scope === 'duel'
  const p: Person = scope === 'other' ? other : me
  const today = store.today
  const H = store.habits
  const hist = store.history
  const mine = habitsOf(H, p)
  const streakOf = (h: (typeof H)[number]) => currentStreak(h, hist[h.id] ?? {}, h.owner === 'both' ? p : h.owner, today)
  const curMax = Math.max(0, ...mine.map(streakOf))
  const recMax = Math.max(0, ...mine.map((h) => longestStreak(h, hist[h.id] ?? {}, p, today)))
  const effective: Period = monthOnly ? 'mois' : period

  const month = () => {
    const start = monthStartOf(today)
    const n = daysInMonth(today.getFullYear(), today.getMonth())
    const lead = (start.getDay() + 6) % 7
    const cells = [...Array.from({ length: lead }, () => null), ...Array.from({ length: n }, (_, i) => addDays(start, i))]
    const top = mine
      .map((h) => ({ h, n: streakOf(h) }))
      .sort((a, b) => b.n - a.n)
      .slice(0, 4)
    return (
      <>
        <Counters
          items={[
            { value: `🔥 ${curMax} j`, label: 'série en cours', onClick: () => onStreaks('cur') },
            { value: `${recMax} j`, label: 'plus longue série', onClick: () => onStreaks('rec') },
            { value: pct(regularity(H, hist, p, start, today)), label: 'ce mois-ci' },
          ]}
        />
        <div className="grid-auto hgrid">
          <section className="card csec">
            <strong>Streaks en cours</strong>
            {top.map(({ h, n }, i) => (
              <div key={h.id} className={cx('row', i === 0 && 'row--first')}>
                <Sticker emoji={h.emoji} color={store.colorOf(h)} size={34} />
                <span className="row__body row__title">{h.title}</span>
                <StreakPill days={n} />
              </div>
            ))}
          </section>
          <section className="card csec">
            <div className="spread">
              <strong className="hcal__title">{monthYear(today)}</strong>
              {scope === 'other' && <span className="meta">{nameOf(other)}</span>}
            </div>
            <div className="hcal" data-person={p}>
              {DAY_HEAD.map((d) => (
                <span key={d} className="hcal__head">
                  {d}
                </span>
              ))}
              {cells.map((d, i) =>
                d ? (
                  <span
                    key={i}
                    className={cx('hcal__day', isoDate(d) === isoDate(today) && 'is-today')}
                    data-level={d > today ? 'future' : level(ratioOn(H, hist, p, d))}
                    title={d > today ? undefined : pct(ratioOn(H, hist, p, d) ?? 0)}
                  >
                    {d.getDate()}
                  </span>
                ) : (
                  <span key={i} />
                ),
              )}
            </div>
            <div className="hlegend" data-person={p}>
              {(['0', '1', '2', '3'] as const).map((l, i) => (
                <span key={l}>
                  <span className="hcal__day hlegend__dot" data-level={l} />
                  {['Rien', 'Un peu', 'Presque', 'Tout fait'][i]}
                </span>
              ))}
              <span>
                <span className="hcal__day hlegend__dot" data-level="future" />À venir
              </span>
            </div>
          </section>
        </div>
      </>
    )
  }

  const recap = (kind: 'semaine' | 'annee') => {
    const weekStart = addDays(today, -((today.getDay() + 6) % 7))
    const from = kind === 'semaine' ? weekStart : new Date(today.getFullYear(), 0, 1)
    const reg = regularity(H, hist, p, from, today)
    const bars =
      kind === 'semaine'
        ? Array.from({ length: 7 }, (_, i) => {
            const d = addDays(weekStart, i)
            return { label: DAY_HEAD[i][0], value: d > today ? null : (ratioOn(H, hist, p, d) ?? 0) }
          })
        : MONTH_LETTERS.map((label, m) => {
            if (m > today.getMonth()) return { label, value: null }
            const s = new Date(today.getFullYear(), m, 1)
            const e = m === today.getMonth() ? today : new Date(today.getFullYear(), m + 1, 0)
            return { label, value: regularity(H, hist, p, s, e) }
          })
    const tops = mine
      .map((h) => ({ h, r: habitRate(h, hist, p, from, today) }))
      .sort((a, b) => b.r - a.r)
      .slice(0, 3)
    const checks = checkCount(H, hist, p, from, today)
    const title =
      kind === 'semaine'
        ? `Du ${weekStart.getDate()} au ${addDays(weekStart, 6).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
        : `Année ${today.getFullYear()}`
    const perfect = perfectDays(H, hist, p, from, today)
    return (
      <>
        <section className="card hrecap">
          <Ring value={reg} size={92} person={p}>
            <span className="hrecap__pct">{pct(reg)}</span>
          </Ring>
          <div>
            <div className="eyebrow">
              {scope === 'other' ? `${nameOf(other)} · ` : ''}
              {title}
            </div>
            <p>
              {checks.toLocaleString('fr-FR')} coche{checks > 1 ? 's' : ''} {kind === 'semaine' ? 'cette semaine' : 'depuis janvier'}.{' '}
              {perfect > 0 ? `${perfect} jour${perfect > 1 ? 's' : ''} où tout était fait.` : 'Pas encore de journée parfaite.'}
            </p>
          </div>
        </section>
        <Counters
          items={[
            kind === 'semaine'
              ? { value: `${perfectRun(H, hist, p, from, today)} j`, label: 'tout fait d’affilée' }
              : { value: String(perfect), label: 'jours parfaits' },
            { value: `🔥 ${recMax} j`, label: 'plus longue série', onClick: () => onStreaks('rec') },
            { value: `🔥 ${curMax} j`, label: 'série en cours', onClick: () => onStreaks('cur') },
          ]}
        />
        <div className="grid-auto hgrid">
          <section className="card csec">
            <div className="spread">
              <strong>{kind === 'semaine' ? 'Jour par jour' : 'Mois par mois'}</strong>
              <span className="meta">% d'habitudes faites</span>
            </div>
            <div className="hbars" data-person={p}>
              {bars.map((b, i) => (
                <div key={i} className="hbars__col">
                  <span
                    className="hbars__bar"
                    data-level={b.value == null ? 'future' : barLevel(b.value)}
                    style={cssVars({ '--h': b.value == null ? 0.12 : Math.max(0.04, b.value) })}
                    title={b.value == null ? undefined : pct(b.value)}
                  />
                  <span className="meta">{b.label}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="card csec">
            <strong>Les plus solides</strong>
            {tops.map(({ h, r }) => (
              <div key={h.id} className="htop">
                <Sticker emoji={h.emoji} color={store.colorOf(h)} size={30} />
                <span className="row__body">
                  <span className="row__title hblock">{h.title}</span>
                  <span className="htop__bar" data-person={p}>
                    <span style={cssVars({ '--w': r })} />
                  </span>
                </span>
                <strong>{pct(r)}</strong>
              </div>
            ))}
          </section>
        </div>
      </>
    )
  }

  const us = () => {
    const common = H.filter((h) => h.owner === 'both')
    const weekStart = addDays(today, -6)
    let together = 0
    for (let i = 0; i < 7; i++) {
      const iso = isoDate(addDays(weekStart, i))
      if (common.length && common.every((h) => PERSONS.every((x) => didOn(hist[h.id] ?? {}, iso, x)))) together++
    }
    const best = Math.max(0, ...common.map((h) => longestStreak({ ...h, rule: 'both' }, hist[h.id] ?? {}, me, today)))
    const iso = isoDate(today)
    return (
      <div className="grid-auto hgrid">
        <section className="card csec">
          <span className="hgroup__title">
            <OwnerDotsBoth />À deux
          </span>
          <p>
            Vous avez fait les habitudes communes ensemble <strong>{together} jour{together > 1 ? 's' : ''} sur 7</strong> cette semaine. Meilleure série
            commune : <strong>{best} jours</strong>.
          </p>
        </section>
        <section className="card csec">
          <strong>Habitudes communes</strong>
          {common.map((h, i) => {
            const a = didOn(hist[h.id] ?? {}, iso, 'alex')
            const b = didOn(hist[h.id] ?? {}, iso, 'antoine')
            return (
              <div key={h.id} className={cx('row', i === 0 && 'row--first')}>
                <Sticker emoji={h.emoji} color={store.colorOf(h)} size={34} />
                <span className="row__body">
                  <span className="row__title hblock">{h.title}</span>
                  <span className="meta">{a && b ? 'Faite à deux aujourd’hui' : a || b ? 'Une personne sur deux' : 'Pas encore faite'}</span>
                </span>
                <span className="hpair">
                  {PERSONS.map((x) => (
                    <span key={x} className={cx('check hpair__c', didOn(hist[h.id] ?? {}, iso, x) && 'is-on')} data-person={x} aria-label={`${nameOf(x)} : ${didOn(hist[h.id] ?? {}, iso, x) ? 'fait' : 'pas encore'}`}>
                      {didOn(hist[h.id] ?? {}, iso, x) ? '✓' : ''}
                    </span>
                  ))}
                </span>
                <StreakPill days={currentStreak({ ...h, rule: 'both' }, hist[h.id] ?? {}, me, today)} />
              </div>
            )
          })}
        </section>
      </div>
    )
  }

  const duelView = () => {
    const { rows, score } = duel(H, hist, monthStartOf(today), today)
    const leader = score[me] > score[other] ? me : score[other] > score[me] ? other : null
    return (
      <div className="grid-auto hgrid">
        <section className="card hduel">
          <div className="hduel__side">
            <Avatar person={me} size={44} />
            <strong>{nameOf(me)}</strong>
          </div>
          <div className="hduel__score">
            <span className="person-text" data-person={me}>
              {leader === me && <span className="hduel__crown">👑</span>}
              {score[me]}
            </span>
            <span className="hduel__sep">–</span>
            <span className="person-text" data-person={other}>
              {leader === other && <span className="hduel__crown">👑</span>}
              {score[other]}
            </span>
            <span className="meta hduel__caption">manches gagnées ce mois</span>
          </div>
          <div className="hduel__side">
            <Avatar person={other} size={44} />
            <strong>{nameOf(other)}</strong>
          </div>
        </section>
        <section className="card csec">
          <strong>Face à face</strong>
          {rows.map((r) => {
            const a = r.values[me]
            const b = r.values[other]
            return (
              <div key={r.label} className="hvs">
                <div className="spread">
                  <strong className={cx('hvs__v', a < b && 'is-dim')}>{r.format(a)}</strong>
                  <span className="meta">{r.label}</span>
                  <strong className={cx('hvs__v', b < a && 'is-dim')}>{r.format(b)}</strong>
                </div>
                <div className="hvs__bar">
                  <span className="person-fill" data-person={me} style={cssVars({ '--w': a + b ? a / (a + b) : 0.5 })} />
                  <span className="person-fill" data-person={other} style={cssVars({ '--w': a + b ? b / (a + b) : 0.5 })} />
                </div>
              </div>
            )
          })}
          <p className="meta">Le duel se masque à tout moment : chacun garde ses chiffres pour lui.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="stack">
      <Segment<Period>
        options={[
          { value: 'semaine', label: 'Semaine', disabled: monthOnly },
          { value: 'mois', label: 'Mois' },
          { value: 'annee', label: 'Année', disabled: monthOnly },
        ]}
        value={effective}
        onChange={setPeriod}
        className="hseg-goals"
        label="Période"
      />
      <div className="chips noscroll">
        {(
          [
            ['me', 'Moi'],
            ['other', nameOf(other)],
            ['us', 'Nous'],
            ['duel', 'Duel'],
          ] as [Scope, string][]
        ).map(([k, l]) => (
          <Chip key={k} active={scope === k} onClick={() => setScope(k)}>
            {l}
          </Chip>
        ))}
      </div>
      {scope === 'us' ? us() : scope === 'duel' ? duelView() : effective === 'mois' ? month() : recap(effective)}
    </div>
  )
}

function OwnerDotsBoth() {
  return (
    <span className="dots">
      <span className="dot" data-person="alex" />
      <span className="dot" data-person="antoine" />
    </span>
  )
}
