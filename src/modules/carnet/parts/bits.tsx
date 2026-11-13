import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { capitalize, parseIso } from '../../../shared/lib/dates'
import { nameOf, type Owner } from '../../../shared/person'
import { OwnerDots, Sticker, cssVars, cx, type StickerColor } from '../../../shared/ui'
import { CATEGORY } from '../data/demo'
import { eur, gaugePosition } from '../logic'
import type { CatId, Trip } from '../types'

/** « Jeudi 9 – lundi 13 avril 2026 » */
export function formatRange(startIso: string, endIso: string): string {
  const a = parseIso(startIso)
  const b = parseIso(endIso)
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
  const day = (d: Date, withMonth: boolean) =>
    d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', ...(withMonth ? { month: 'long' } : {}) })
  return `${capitalize(day(a, !sameMonth))} – ${day(b, true)} ${b.getFullYear()}`
}

/** « avr. 2026 » */
export const shortMonth = (iso: string) => parseIso(iso).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })

/** « Ven. 13 nov. » */
export const shortDay = (d: Date = new Date()) =>
  capitalize(d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }))

export const ownerLabel = (o: Owner) => (o === 'both' ? 'Commun' : nameOf(o))

/** Puce d'appartenance : point(s) de couleur + libellé. */
export function OwnerTag({ owner }: { owner: Owner }) {
  return (
    <span className="tag">
      <OwnerDots owner={owner} />
      {ownerLabel(owner)}
    </span>
  )
}

/** Couverture rayée d'un voyage, en attendant la vraie photo. */
export function Cover({
  color,
  emoji,
  rotate = 0,
  sticker = 44,
  className,
  children,
}: {
  color: StickerColor
  emoji?: string
  rotate?: number
  sticker?: number
  className?: string
  children?: ReactNode
}) {
  return (
    <span className={cx('cv cover', className)} data-color={color}>
      {emoji && <Sticker emoji={emoji} color="surface" size={sticker} rotate={rotate} />}
      {children}
    </span>
  )
}

/** Point de couleur d'une catégorie de dépense (listes denses). */
export function CatDot({ cat }: { cat: CatId }) {
  return <span className="catdot swatch-bg" data-color={CATEGORY[cat].color} aria-hidden="true" />
}

/** Jauge de budget avec repères « Idéal » (trait plein) et « Limite » (pointillé). */
export function Gauge({
  value,
  ideal,
  limit,
  level,
  labels = true,
  inverse,
}: {
  value: number
  ideal: number
  limit: number
  level?: 'under' | 'overIdeal' | 'overLimit'
  labels?: boolean
  inverse?: boolean
}) {
  return (
    <div className={cx('gauge', inverse && 'gauge--inverse')}>
      <div className="gauge__track">
        <span className="gauge__fill" data-level={level} style={cssVars({ '--pos': gaugePosition(value, limit) })} />
        <span className="gauge__mark" style={cssVars({ '--pos': gaugePosition(ideal, limit) })} />
        <span className="gauge__mark gauge__mark--limit" style={cssVars({ '--pos': gaugePosition(limit, limit) })} />
      </div>
      {labels && (
        <div className="gauge__labels">
          <span className="gauge__key">Idéal {eur(ideal)}</span>
          <span className="gauge__key gauge__key--limit">Limite {eur(limit)}</span>
        </div>
      )}
    </div>
  )
}

export function TripSticker({ trip, size = 44 }: { trip: Trip; size?: number }) {
  return <Sticker emoji={trip.emoji} color={trip.color} size={size} rotate={trip.rotate} />
}

/* ---------- Confettis ---------- */
const ConfettiContext = createContext<() => void>(() => {})
export const useConfetti = () => useContext(ConfettiContext)

const PIECES = Array.from({ length: 22 }, (_, i) => ({
  x: (i * 41 + 7) % 100,
  w: 6 + ((i * 7) % 6),
  delay: ((i * 13) % 10) / 20,
  duration: 1 + ((i * 3) % 6) / 10,
  tone: i % 7,
}))

/** 22 confettis qui tombent pendant 1,5 s (comptes réglés, valise bouclée, 9/9). */
export function ConfettiProvider({ children }: { children: ReactNode }) {
  const [run, setRun] = useState(0)
  const [on, setOn] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const fire = useCallback(() => {
    window.clearTimeout(timer.current)
    setRun((n) => n + 1)
    setOn(true)
    timer.current = window.setTimeout(() => setOn(false), 1600)
  }, [])
  return (
    <ConfettiContext.Provider value={fire}>
      {children}
      {on && (
        <div key={run} className="confetti" aria-hidden="true">
          {PIECES.map((p, i) => (
            <span
              key={i}
              data-tone={p.tone}
              style={cssVars({ '--x': `${p.x}%`, '--w': `${p.w}px`, '--delay': `${p.delay}s`, '--dur': `${p.duration}s` })}
            />
          ))}
        </div>
      )}
    </ConfettiContext.Provider>
  )
}
