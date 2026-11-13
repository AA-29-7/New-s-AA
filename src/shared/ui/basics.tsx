import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import type { Owner, Person } from '../person'

/** Fonds de gommette disponibles (charte §6). */
export type StickerColor =
  | 'surface'
  | 'neutral'
  | 'sage'
  | 'honey'
  | 'coral'
  | 'lavender'
  | 'mist'
  | 'peach'
  | 'mint'
  | 'rose'

export const STICKER_PALETTE: StickerColor[] = [
  'sage',
  'honey',
  'coral',
  'lavender',
  'mist',
  'peach',
  'mint',
  'rose',
]

const vars = (v: Record<string, string | number>) => v as CSSProperties

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ')
export { cx }

/** Rond pastel portant un émoji : identifie un module, une catégorie, une habitude. */
export function Sticker({
  emoji,
  color = 'neutral',
  size = 40,
  rotate = 0,
  className,
}: {
  emoji: ReactNode
  color?: StickerColor
  size?: number
  rotate?: number
  className?: string
}) {
  return (
    <span
      className={cx('sticker', size >= 90 && 'sticker--lg', className)}
      data-color={color}
      style={vars({ '--sz': `${size}px`, '--rot': `${rotate}deg` })}
      aria-hidden="true"
    >
      {emoji}
    </span>
  )
}

/** Case ronde à cocher ; seule la case coche (la ligne ouvre la fiche). */
export function CheckCircle({
  checked,
  onToggle,
  label,
  person,
  size = 30,
  disabled,
}: {
  checked: boolean
  onToggle?: () => void
  label: string
  person?: Person
  size?: number
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className="check"
      data-person={person}
      disabled={disabled}
      style={vars({ '--sz': `${size}px` })}
      onClick={(e) => {
        e.stopPropagation()
        onToggle?.()
      }}
    >
      {checked ? '✓' : ''}
    </button>
  )
}

export function StreakPill({ days, accent, chevron }: { days: number; accent?: boolean; chevron?: boolean }) {
  return (
    <span className={cx('streak', accent && 'streak--accent')}>
      🔥 {days} j{chevron ? ' ›' : ''}
    </span>
  )
}

/** Point(s) d'appartenance : une personne, ou les deux qui se chevauchent (commun). */
export function OwnerDots({ owner, hollow }: { owner: Owner; hollow?: Partial<Record<Person, boolean>> }) {
  if (owner !== 'both') return <span className={cx('dot', hollow?.[owner] && 'dot--hollow')} data-person={owner} />
  return (
    <span className="dots">
      <span className={cx('dot', hollow?.alex && 'dot--hollow')} data-person="alex" />
      <span className={cx('dot', hollow?.antoine && 'dot--hollow')} data-person="antoine" />
    </span>
  )
}

export function Lock() {
  return <span className="lock" role="img" aria-label="Privé" />
}

export function Avatar({ person, size = 38, children }: { person: Person; size?: number; children?: ReactNode }) {
  return (
    <span className="avatar" data-person={person} style={vars({ '--sz': `${size}px` })} aria-hidden="true">
      {children ?? (person === 'alex' ? 'A' : 'A')}
    </span>
  )
}

export interface SegmentOption<T extends string> {
  value: T
  label: ReactNode
  disabled?: boolean
}

export function Segment<T extends string>({
  options,
  value,
  onChange,
  size,
  inline,
  className,
  label,
}: {
  options: SegmentOption<T>[]
  value: T
  onChange: (v: T) => void
  size?: 'sm'
  inline?: boolean
  className?: string
  label?: string
}) {
  return (
    <div className={cx('segment', size === 'sm' && 'segment--sm', inline && 'segment--inline', className)} role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="segment__item"
          aria-pressed={o.value === value}
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Chip({
  active,
  className,
  children,
  ...rest
}: { active?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cx('chip', className)} aria-pressed={active ?? undefined} {...rest}>
      {children}
    </button>
  )
}

export function ProgressBar({ value, ink, large, className }: { value: number; ink?: boolean; large?: boolean; className?: string }) {
  const pct = Math.max(0, Math.min(1, value))
  return (
    <div className={cx('progress', large && 'progress--lg', className)} role="progressbar" aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100}>
      <span className={cx('progress__fill', ink && 'progress__fill--ink')} style={vars({ '--pct': pct })} />
    </div>
  )
}

export function Ring({
  value,
  size = 46,
  person,
  children,
}: {
  value: number
  size?: number
  person?: Person
  children?: ReactNode
}) {
  const pct = Math.max(0, Math.min(1, value))
  return (
    <span className="ring" data-person={person} style={vars({ '--sz': `${size}px`, '--pct': pct })}>
      <span className="ring__hole">{children}</span>
    </span>
  )
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="switch" onClick={() => onChange(!checked)} />
  )
}

export { vars as cssVars }
