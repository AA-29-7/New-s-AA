import { useEffect, useState } from 'react'
import { isoDate } from '../../../shared/lib/dates'
import { PERSONS, nameOf, usePerson } from '../../../shared/person'
import { Avatar, Chip, Segment, Sheet, StreakPill, Sticker, Switch, STICKER_PALETTE, cx, useToast, type StickerColor } from '../../../shared/ui'
import { EMOJIS } from '../data/demo'
import { currentStreak, didOn, longestStreak, type Habit } from '../logic'
import { useHabits } from '../store'

const DAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

/** Fiche d'une habitude. */
export function DetailSheet({ habitId, onClose }: { habitId: string | null; onClose: () => void }) {
  const { me, other } = usePerson()
  const store = useHabits()
  const h = store.habits.find((x) => x.id === habitId)
  if (!h) return <Sheet open={false} onClose={onClose}>{null}</Sheet>
  const checks = store.history[h.id] ?? {}
  const today = isoDate(store.today)
  const who = h.owner === 'both' || h.owner === me ? me : other
  const streak = currentStreak(h, checks, who, store.today)
  const record = Math.max(streak, longestStreak(h, checks, who, store.today))
  const cat = store.categoryOf(h)
  const common = h.owner === 'both'
  const both = PERSONS.every((p) => didOn(checks, today, p))
  const missing = PERSONS.find((p) => !didOn(checks, today, p))

  return (
    <Sheet open onClose={onClose}>
      <div className="spread hdetail__head">
        <span className="hdetail__id">
          <Sticker emoji={h.emoji} color={store.colorOf(h)} size={56} rotate={-6} />
          <span>
            <span className="sheet__title hdetail__title">{h.title}</span>
            <span className="meta">
              {cat ? `${cat.name} · ` : ''}
              {common ? 'Commune' : h.owner === me ? 'À moi' : `Chez ${nameOf(other)}`}
            </span>
          </span>
        </span>
        <button type="button" className="btn btn--text" onClick={onClose}>
          Fermer
        </button>
      </div>
      <div className="hstats hstats--2">
        <div className="inset">
          <div className="hstats__num">🔥 {streak} j</div>
          <div className="meta">série en cours</div>
        </div>
        <div className="inset">
          <div className="hstats__num">{record} j</div>
          <div className="meta">record</div>
        </div>
      </div>
      {common && (
        <>
          <div className="hduo">
            {PERSONS.map((p) => (
              <div key={p} className="hduo__p">
                <span className="hduo__avatar">
                  <Avatar person={p} size={56} />
                  <span className={cx('hduo__badge', didOn(checks, today, p) && 'is-done')}>{didOn(checks, today, p) ? '✓' : '…'}</span>
                </span>
                <strong>{nameOf(p)}</strong>
              </div>
            ))}
          </div>
          <p className="halert">
            ⏳{' '}
            {both
              ? 'Vous l’avez faite tous les deux aujourd’hui.'
              : `${nameOf(missing!)} ne l’a pas encore faite. ${h.rule === 'both' ? `La série de ${streak + 1} j est en jeu jusqu’à minuit.` : 'Seule sa série est en jeu.'}`}
          </p>
          <div className="eyebrow">Règle de la série</div>
          <Segment
            options={[
              { value: 'both', label: 'À deux' },
              { value: 'each', label: 'Chacun la sienne' },
            ]}
            value={h.rule}
            onChange={(rule) => store.updateHabit(h.id, { rule })}
            label="Règle de la série"
          />
          <p className="meta">
            {h.rule === 'both'
              ? 'La série continue seulement si vous l’avez faite tous les deux dans la journée. Si l’un oublie, elle repart de zéro pour les deux.'
              : `Chacun garde sa propre série. Si ${nameOf(other)} oublie, la tienne continue.`}
          </p>
        </>
      )}
      {(common || h.owner === me) && (
        <div className="spread">
          <span>
            <strong>Joker de la semaine</strong>
            <span className="meta hblock">Un oubli par semaine ne casse pas la série.</span>
          </span>
          <Switch checked={h.joker} onChange={(joker) => store.updateHabit(h.id, { joker })} label="Joker de la semaine" />
        </div>
      )}
      {h.owner === other && (
        <p className="inset">
          Habitude d'{nameOf(other)} : visible, mais seul {nameOf(other)} peut la cocher.
        </p>
      )}
    </Sheet>
  )
}

/** Choix d'une couleur de la palette des gommettes. */
function Swatches({ value, onChange, size = 34 }: { value: StickerColor; onChange: (c: StickerColor) => void; size?: number }) {
  return (
    <div className="swatches">
      {STICKER_PALETTE.map((c) => (
        <button
          key={c}
          type="button"
          className={cx('swatch swatch-bg', c === value && 'is-active')}
          data-color={c}
          style={{ width: size, height: size }}
          aria-label={`Couleur ${c}`}
          aria-pressed={c === value}
          onClick={() => onChange(c)}
        />
      ))}
    </div>
  )
}

function EmojiGrid({ value, onChange }: { value: string; onChange: (e: string) => void }) {
  return (
    <div className="emojigrid">
      {EMOJIS.map((e) => (
        <button key={e} type="button" className={cx('emojigrid__item emoji', e === value && 'is-active')} aria-pressed={e === value} onClick={() => onChange(e)}>
          {e}
        </button>
      ))}
    </div>
  )
}

/** Nouvelle catégorie (commune aux deux personnes). */
export function NewCategorySheet({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated?: (id: string) => void }) {
  const store = useHabits()
  const [name, setName] = useState('')
  const [color, setColor] = useState<StickerColor>('sage')
  const [emoji, setEmoji] = useState('🧘')
  const ok = name.trim().length > 0
  useEffect(() => {
    if (open) setName('')
  }, [open])

  return (
    <Sheet open={open} onClose={onClose} title="Nouvelle catégorie" closeLabel="Annuler">
      <div className="hform__id">
        <Sticker emoji={emoji} color={color} size={52} rotate={-6} />
        <input className="field" placeholder="Nom de la catégorie" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="eyebrow">Couleur de la catégorie</div>
      <Swatches value={color} onChange={setColor} size={40} />
      <EmojiGrid value={emoji} onChange={setEmoji} />
      <button
        type="button"
        className="btn btn--primary btn--block"
        aria-disabled={!ok}
        onClick={() => {
          if (!ok) return
          const id = store.addCategory({ name: name.trim(), emoji, color })
          onCreated?.(id)
          onClose()
        }}
      >
        Créer la catégorie
      </button>
    </Sheet>
  )
}

/** Liste des catégories. */
export function CategoriesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useHabits()
  const [creating, setCreating] = useState(false)
  return (
    <>
      <Sheet open={open && !creating} onClose={onClose} title="Catégories">
        <p className="meta">Communes à Alex et Antoine. La couleur de la catégorie colore toutes ses habitudes.</p>
        <div>
          {store.categories.map((c, i) => {
            const n = store.habits.filter((h) => h.categoryId === c.id).length
            return (
              <div key={c.id} className={cx('row hcat', i === 0 && 'row--first')}>
                <span className="hcat__grip" aria-hidden="true">
                  ⋮⋮
                </span>
                <Sticker emoji={c.emoji} color={c.color} size={40} />
                <span className="row__body">
                  <span className="hcat__name">{c.name}</span>
                  <span className="meta hblock">
                    {n} habitude{n > 1 ? 's' : ''}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
        <button type="button" className="btn btn--dashed btn--block hbtn-tall" onClick={() => setCreating(true)}>
          + Nouvelle catégorie
        </button>
      </Sheet>
      <NewCategorySheet open={open && creating} onClose={() => setCreating(false)} />
    </>
  )
}

/** Nouvelle habitude. */
export function CreateSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { me, other } = usePerson()
  const store = useHabits()
  const toast = useToast()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🧘')
  const [color, setColor] = useState<StickerColor>('sage')
  const [shared, setShared] = useState<'me' | 'both'>('me')
  const [rule, setRule] = useState<Habit['rule']>('both')
  const [categoryId, setCategoryId] = useState('')
  const [days, setDays] = useState([true, true, true, true, true, false, false])
  const [reminder, setReminder] = useState(true)
  const [newCat, setNewCat] = useState(false)
  const ok = name.trim().length > 0
  const cat = store.categories.find((c) => c.id === categoryId)

  useEffect(() => {
    if (!open) return
    setName('')
    setCategoryId('')
  }, [open])

  const create = () => {
    if (!ok) return
    store.addHabit({ title: name.trim(), emoji, color, categoryId, owner: shared === 'me' ? me : 'both', rule, joker: true, days, reminder })
    toast(`« ${name.trim()} » ajoutée`)
    onClose()
  }

  return (
    <>
      <Sheet open={open && !newCat} onClose={onClose} title="Nouvelle habitude" closeLabel="Annuler">
        <input className="field field--accent" placeholder="Nom de l'habitude" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="hform__id">
          <Sticker emoji={emoji} color={cat?.color ?? color} size={56} rotate={-6} />
          {cat ? <p className="meta">Le fond suit la catégorie « {cat.name} »</p> : <Swatches value={color} onChange={setColor} />}
        </div>
        <EmojiGrid value={emoji} onChange={setEmoji} />
        <Segment
          options={[
            { value: 'me', label: 'À moi' },
            { value: 'both', label: 'Commune' },
          ]}
          value={shared}
          onChange={setShared}
          label="Pour qui"
        />
        <p className="meta">{shared === 'me' ? `Visible par ${nameOf(other)}, qui ne la coche pas.` : 'Vous la cochez chacun de votre côté.'}</p>
        {shared === 'both' && (
          <Segment
            options={[
              { value: 'both', label: 'Série à deux' },
              { value: 'each', label: 'Chacun la sienne' },
            ]}
            value={rule}
            onChange={setRule}
            label="Règle de la série"
          />
        )}
        <div className="eyebrow">Catégorie</div>
        <div className="chips chips--wrap">
          <Chip className="chip--sunken" active={categoryId === ''} onClick={() => setCategoryId('')}>
            Aucune
          </Chip>
          {store.categories.map((c) => (
            <Chip key={c.id} className="chip--sunken" active={categoryId === c.id} onClick={() => setCategoryId(c.id)}>
              {c.emoji} {c.name}
            </Chip>
          ))}
          <Chip className="chip--dashed" onClick={() => setNewCat(true)}>
            + Nouvelle
          </Chip>
        </div>
        <div className="eyebrow">Jours</div>
        <div className="hdays">
          {DAY_LETTERS.map((l, i) => (
            <button
              key={i}
              type="button"
              className={cx('hdays__d', days[i] && 'is-on')}
              aria-pressed={days[i]}
              aria-label={['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][i]}
              onClick={() => setDays((d) => d.map((x, k) => (k === i ? !x : x)))}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="spread">
          <span>
            <strong>Rappel</strong>
            <span className="meta hblock">Chaque jour à 7 h 30</span>
          </span>
          <Switch checked={reminder} onChange={setReminder} label="Rappel" />
        </div>
        <button type="button" className="btn btn--primary btn--block" aria-disabled={!ok} onClick={create}>
          Créer l'habitude
        </button>
      </Sheet>
      <NewCategorySheet open={open && newCat} onClose={() => setNewCat(false)} onCreated={setCategoryId} />
    </>
  )
}

/** « Séries en cours » / « Plus longues séries ». */
export function StreakListSheet({ kind, onClose }: { kind: 'cur' | 'rec' | null; onClose: () => void }) {
  const { me } = usePerson()
  const store = useHabits()
  const rows = store.habits
    .map((h) => {
      const who = h.owner === 'both' ? me : h.owner
      const checks = store.history[h.id] ?? {}
      const n = kind === 'rec' ? longestStreak(h, checks, who, store.today) : currentStreak(h, checks, who, store.today)
      return { h, n }
    })
    .sort((a, b) => b.n - a.n)
    .slice(0, 5)
  return (
    <Sheet open={!!kind} onClose={onClose} title={kind === 'rec' ? 'Plus longues séries' : 'Séries en cours'}>
      <p className="meta">{kind === 'rec' ? 'Les records, toutes habitudes confondues.' : 'De la plus longue à la plus courte.'}</p>
      <div>
        {rows.map(({ h, n }, i) => (
          <div key={h.id} className={cx('row', i === 0 && 'row--first')}>
            <Sticker emoji={h.emoji} color={store.colorOf(h)} size={34} />
            <span className="row__body">
              <span className="row__title hblock">{h.title}</span>
              <span className="meta">{h.owner === 'both' ? 'Commune' : nameOf(h.owner)}</span>
            </span>
            <StreakPill days={n} accent={i === 0} />
          </div>
        ))}
      </div>
    </Sheet>
  )
}
