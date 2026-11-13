import { isoDate } from '../../../shared/lib/dates'
import { nameOf, usePerson } from '../../../shared/person'
import { CheckCircle, StreakPill, Sticker, cx } from '../../../shared/ui'
import { canCheck, currentStreak, didOn, type Habit } from '../logic'
import { useHabits } from '../store'

/**
 * Ligne d'habitude : seule la case coche, toucher la ligne ouvre la fiche.
 * Chez l'autre, la case est en lecture seule (75 % d'opacité).
 */
export function HabitRow({ habit: h, first, onOpen, compact }: { habit: Habit; first?: boolean; onOpen?: () => void; compact?: boolean }) {
  const { me, other } = usePerson()
  const store = useHabits()
  const mine = canCheck(h, me)
  const who = mine ? me : other
  const checks = store.history[h.id] ?? {}
  const today = isoDate(store.today)
  const done = didOn(checks, today, who)
  const meta =
    h.owner === me ? 'À moi' : h.owner === 'both' ? `${nameOf(other)} ${didOn(checks, today, other) ? 'l’a fait' : 'pas encore'}` : nameOf(other)

  return (
    <div className={cx('row hrow', first && 'row--first', compact && 'hrow--compact')} onClick={onOpen} role={onOpen ? 'button' : undefined} tabIndex={onOpen ? 0 : undefined} onKeyDown={(e) => e.target === e.currentTarget && e.key === 'Enter' && onOpen?.()}>
      <CheckCircle
        checked={done}
        size={compact ? 28 : 30}
        person={who}
        disabled={!mine}
        label={`${h.title} : ${done ? 'fait' : 'à faire'}`}
        onToggle={() => mine && store.toggle(h.id, me)}
      />
      {!compact && <Sticker emoji={h.emoji} color={store.colorOf(h)} size={34} />}
      <div className="row__body">
        <div className={cx('row__title', done && 'row__title--done')}>{h.title}</div>
        {!(h.owner === other && !compact) && <div className="meta">{meta}</div>}
      </div>
      <StreakPill days={currentStreak(h, checks, who, store.today)} />
    </div>
  )
}
