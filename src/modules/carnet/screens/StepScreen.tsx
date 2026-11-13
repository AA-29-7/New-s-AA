import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { nameOf, usePerson } from '../../../shared/person'
import { CheckCircle, Chip, DraftInput, DraftTextarea, ProgressBar, Segment, Sheet, Sticker, cssVars, cx, useToast } from '../../../shared/ui'
import { ADJUSTMENTS, CATEGORIES, PACK_TEMPLATES } from '../data/demo'
import { budgetTotal, claudePrompt, eur, importResponse, regenerate, stepsDone } from '../logic'
import { CatDot, Cover, useConfetti } from '../parts/bits'
import { BASE, Soon } from '../parts/common'
import { TripMap } from '../parts/TripMap'
import { useCarnet } from '../store'
import type { ActivityStatus, Payer, Step, StepId } from '../types'
import { STATUS_LABEL } from './PrepScreen'

const ACTIVITY_STATUS = ['Envie', 'Réservé', 'Fait ✓']
const search = (q: string) => `https://duckduckgo.com/?q=${encodeURIComponent(`${q} site officiel`)}`

/** Une étape de préparation : manuel ou automatique, lignes à garder, validation. */
export function StepScreen() {
  const { tripId = '', stepId = '' } = useParams()
  const { me } = usePerson()
  const carnet = useCarnet()
  const toast = useToast()
  const confetti = useConfetti()
  const [options, setOptions] = useState(false)
  const [adjust, setAdjust] = useState('')
  const [shimmer, setShimmer] = useState(0)
  const [spins, setSpins] = useState(0)
  const [stamp, setStamp] = useState(false)
  const [importing, setImporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pasted, setPasted] = useState('')
  const [packWho, setPackWho] = useState<Payer>('commun')

  const prep = carnet.state.preps[tripId]
  const step = prep?.steps.find((s) => s.id === stepId)
  if (carnet.loading) return <div className="page carnet" aria-busy="true"><div className="skeleton skeleton--row" /><div className="skeleton skeleton--row" /></div>
  if (!prep || !step) return <Navigate to={`${BASE}/preparer`} replace />

  const setStep = (fn: (s: Step) => Step) => carnet.setStep(prep.id, step.id as StepId, fn)
  const auto = step.mode === 'auto'
  const lines = step.proposals[step.selected] ?? []
  const hasAlts = lines.some((l) => !l.locked && l.alts.length > 0)
  const done = stepsDone(prep.steps)
  const pins = (carnet.tripById(prep.id) ?? carnet.nextTrip)?.pins ?? []

  const flash = () => {
    setShimmer((n) => n + 1)
    setSpins((n) => n + 1)
  }
  const regen = () => {
    flash()
    if (step.kind === 'lines' && !hasAlts) {
      toast('Génération dans l’app : Available soon… Utilise « Importer depuis Claude ».')
      return
    }
    setStep(regenerate)
    toast('Nouvelle proposition prête')
  }
  const editLine = (i: number, v: string) =>
    setStep((s) => ({
      ...s,
      filled: true,
      status: s.status === 'todo' ? 'wip' : s.status,
      proposals: s.proposals.map((p, k) => (k === s.selected ? p.map((l, j) => (j === i ? { ...l, v } : l)) : p)),
    }))
  const lockLine = (i: number) =>
    setStep((s) => ({ ...s, proposals: s.proposals.map((p, k) => (k === s.selected ? p.map((l, j) => (j === i ? { ...l, locked: !l.locked } : l)) : p)) }))
  const addLine = () =>
    setStep((s) => ({
      ...s,
      proposals: s.proposals.map((p, k) => (k === s.selected ? [...p, { k: `Ligne ${p.length + 1}`, v: '', alts: [], locked: false }] : p)),
    }))

  const validate = () => {
    const ok = step.status !== 'ok'
    setStep((s) => ({ ...s, status: ok ? 'ok' : 'wip', filled: true }))
    if (!ok) return
    setStamp(true)
    toast(`Étape validée · ${done + 1}/9`)
    if (done + 1 === 9) confetti()
  }

  const pack = prep.pack[packWho]
  const packDone = pack.filter((i) => i.done).length
  const togglePack = (i: number) => {
    const next = pack.map((it, j) => (j === i ? { ...it, done: !it.done } : it))
    carnet.setPrep(prep.id, (p) => ({ ...p, pack: { ...p.pack, [packWho]: next } }))
    if (!pack[i].done && next.every((x) => x.done)) {
      confetti()
      toast(packWho === 'commun' ? 'Sac commun bouclé !' : `Valise de ${nameOf(packWho)} bouclée !`)
    }
  }
  const addTemplate = (label: string, items: string[]) => {
    carnet.setPrep(prep.id, (p) => ({
      ...p,
      pack: { ...p.pack, [packWho]: [...p.pack[packWho], ...items.map((t) => ({ label: t, done: false, tag: label.toLowerCase() }))] },
    }))
    toast(`Modèle « ${label} » ajouté`)
  }
  const setActivity = (i: number, patch: { status?: ActivityStatus; day?: number }) =>
    carnet.setPrep(prep.id, (p) => ({ ...p, activities: p.activities.map((a, j) => (j === i ? { ...a, ...patch } : a)) }))

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(claudePrompt(prep, step, adjust))
      setCopied(true)
    } catch {
      toast('Copie impossible sur cet appareil')
    }
  }
  const doImport = () => {
    if (!pasted.trim()) {
      toast('Colle d’abord la réponse')
      return
    }
    setStep((s) => importResponse(s, pasted))
    setImporting(false)
    setPasted('')
    setCopied(false)
    flash()
    toast('Proposition importée')
  }

  return (
    <div className="page carnet step">
      <Link to={`${BASE}/preparer/${prep.id}`} className="link-btn link-btn--soft">
        ‹ Préparer · {prep.name}
      </Link>
      <header className="page__head step__head">
        <Sticker emoji={step.emoji} color={step.color} size={56} rotate={step.rotate} />
        <h1 className="sheet__title">{step.title}</h1>
        <span key={stamp ? 'stamped' : 'idle'} className={cx('stepstatus', stamp && step.status === 'ok' && 'is-stamped')} data-status={step.status}>
          {STATUS_LABEL[step.status]}
        </span>
      </header>

      <Segment
        options={[
          { value: 'manual', label: '✎ Manuel' },
          { value: 'auto', label: '✦ Automatique' },
        ]}
        value={step.mode}
        onChange={(mode) => setStep((s) => ({ ...s, mode }))}
        className="seg-narrow"
        label="Mode de remplissage"
      />

      {auto && (
        <section className="card csection ai">
          <div className="spread">
            <strong>✦ Proposition de l'IA</strong>
            <button type="button" className="link-btn" onClick={() => setOptions((o) => !o)} aria-expanded={options}>
              Options {options ? '▴' : '▾'}
            </button>
          </div>
          <button type="button" className="btn btn--secondary btn--block" onClick={regen}>
            <span className="ai__spin" style={cssVars({ '--turns': spins })}>
              ↻
            </span>
            Régénérer cette étape
          </button>
          {options && (
            <div className="stack stack--sm">
              <div className="spread">
                <span className="meta">Nombre de propositions</span>
                <Segment
                  size="sm"
                  inline
                  options={['1', '2', '3'].map((n) => ({ value: n, label: n }))}
                  value={String(step.count)}
                  onChange={(n) => setStep((s) => ({ ...s, count: Number(n), selected: Math.min(s.selected, Number(n) - 1, s.proposals.length - 1) }))}
                  label="Nombre de propositions"
                />
              </div>
              <button type="button" className="btn btn--outline btn--block" onClick={() => setImporting(true)}>
                Importer depuis Claude
              </button>
              <div className="chips chips--wrap">
                {ADJUSTMENTS.map((a) => (
                  <Chip key={a} className="chip--sunken" onClick={() => setAdjust((v) => (v ? `${v}, ${a.toLowerCase()}` : a))}>
                    {a}
                  </Chip>
                ))}
              </div>
              <div className="adjust">
                <input className="field adjust__input" placeholder="Demande un ajustement…" value={adjust} onChange={(e) => setAdjust(e.target.value)} />
                <button type="button" className="btn btn--secondary" onClick={() => toast('Génération dans l’app : Available soon… L’ajustement est repris dans « Importer depuis Claude ».')}>
                  Envoyer
                </button>
              </div>
              <p className="meta">
                <Soon>Génération via l'API Claude dans l'app</Soon>
              </p>
            </div>
          )}
        </section>
      )}

      {step.kind === 'lines' && auto && step.proposals.length > 1 && step.count > 1 && (
        <div className="chips noscroll">
          {step.proposals.slice(0, step.count).map((_, i) => (
            <Chip key={i} active={i === step.selected} onClick={() => setStep((s) => ({ ...s, selected: i }))}>
              Option {'ABC'[i]}
            </Chip>
          ))}
        </div>
      )}

      {step.kind === 'lines' && (
        <section className="card csection">
          {auto && !step.filled && <p className="muted">Rien de proposé pour l'instant. Touche « Régénérer cette étape » pour une première proposition.</p>}
          <div>
            {lines.map((l, i) => (
              <div key={`${shimmer}-${i}`} className={cx('row line', i === 0 && 'row--first', shimmer > 0 && !l.locked && 'is-shimmer')}>
                <label className="row__body">
                  <span className="line__label">{l.k}</span>
                  <DraftTextarea className="line__input" rows={1} value={l.v} placeholder="À remplir" onCommit={(v) => editLine(i, v)} />
                </label>
                {auto && (
                  <button type="button" className={cx('btn btn--mini', l.locked ? 'btn--ink' : 'btn--secondary')} aria-pressed={l.locked} onClick={() => lockLine(i)}>
                    {l.locked ? 'Gardée ✓' : 'Garder'}
                  </button>
                )}
              </div>
            ))}
          </div>
          {!auto && (
            <button type="button" className="btn btn--dashed btn--block" onClick={addLine}>
              + Ajouter une ligne
            </button>
          )}
          {step.bookable && (
            <a className="btn btn--outline btn--block" href={search(`${prep.name} ${step.title}`)} target="_blank" rel="noreferrer">
              Réserver sur le site officiel ↗
            </a>
          )}
        </section>
      )}

      {step.kind === 'budget' && step.budget && (
        <section className="card csection">
          {CATEGORIES.map((c) => (
            <div key={`${shimmer}-${c.id}`} className={cx('budgetline', shimmer > 0 && 'is-shimmer')}>
              <CatDot cat={c.id} />
              <span className="budgetline__name ellipsis">{c.name}</span>
              <span className="catline__bar">
                <span className="swatch-bg" data-color={c.color} style={cssVars({ '--w': step.budget![c.id] / (budgetTotal(step) || 1) })} />
              </span>
              <label className="budgetline__field">
                <span className="visually-hidden">Budget {c.name}</span>
                <DraftInput
                  inputMode="numeric"
                  value={String(step.budget![c.id])}
                  sanitize={(raw) => raw.replace(/\D/g, '')}
                  onCommit={(raw) => {
                    const v = parseInt(raw, 10) || 0
                    setStep((s) => ({ ...s, filled: true, status: s.status === 'todo' ? 'wip' : s.status, budget: { ...s.budget!, [c.id]: v } }))
                  }}
                />
                €
              </label>
            </div>
          ))}
          <div className="spread budgetline__total">
            <strong>Total commun</strong>
            <strong className="cbig">{eur(budgetTotal(step))}</strong>
          </div>
          <p className="meta">
            Devise sur place : euro. Pas de conversion pour ce voyage. <Soon>Convertisseur</Soon>
          </p>
        </section>
      )}

      {step.kind === 'pack' && (
        <>
          {prep.packParams.length > 0 && (
            <div className="inset">
              <div className="eyebrow">Pris en compte</div>
              <div className="chips chips--wrap pack__params">
                {prep.packParams.map((p) => (
                  <span key={p} className="tag">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
          <Segment<Payer>
            options={[
              { value: 'alex', label: 'Alex' },
              { value: 'antoine', label: 'Antoine' },
              { value: 'commun', label: 'Commun' },
            ]}
            value={packWho}
            onChange={setPackWho}
            label="Liste"
          />
          <section className="card csection">
            <div className="spread">
              <strong>{packWho === 'commun' ? 'Sac commun' : `Valise de ${nameOf(packWho)}`}</strong>
              <span className="tag">
                {packDone}/{pack.length}
              </span>
            </div>
            <ProgressBar value={pack.length ? packDone / pack.length : 0} />
            <div>
              {pack.length === 0 && <p className="muted">Liste vide. Ajoute un modèle ci-dessous.</p>}
              {pack.map((it, i) => (
                <div key={`${it.label}-${i}`} className={cx('row', i === 0 && 'row--first')}>
                  <CheckCircle checked={it.done} size={28} label={it.label} onToggle={() => togglePack(i)} />
                  <span className={cx('row__body row__title', it.done && 'row__title--done')}>{it.label}</span>
                  {it.tag && <span className="meta">{it.tag}</span>}
                </div>
              ))}
            </div>
            <div className="chips chips--wrap">
              {PACK_TEMPLATES.map((t) => (
                <Chip key={t.label} className="chip--sunken" onClick={() => addTemplate(t.label, t.items)}>
                  + {t.label}
                </Chip>
              ))}
              <Chip className="chip--dashed" onClick={() => toast(`Liste de ${packWho === 'commun' ? 'sac commun' : nameOf(packWho)} gardée comme modèle sur cet appareil`)}>
                Enregistrer comme modèle
              </Chip>
            </div>
          </section>
        </>
      )}

      {step.kind === 'acts' && (
        <>
          {pins.length > 0 && <TripMap pins={pins.map(([label, lon, lat], i) => ({ label, lon, lat, n: i + 1 }))} height={220} />}
          {prep.activities.length === 0 && <p className="muted">Aucune activité pour l'instant.</p>}
          <div className="grid-auto carnet__grid">
            {prep.activities.map((a, i) => (
              <article key={`${shimmer}-${a.name}`} className={cx('card csection act', shimmer > 0 && 'is-shimmer')}>
                <Cover color={a.color} className="act__cover">
                  <span className="act__rating">★ {a.rating}</span>
                </Cover>
                <div className="ctitle">{a.name}</div>
                <div className="meta">
                  {a.price} · {a.duration} · {a.place}
                </div>
                <div className="chips chips--wrap">
                  <button type="button" className="tag actstatus" data-status={a.status} onClick={() => setActivity(i, { status: ((a.status + 1) % 3) as ActivityStatus })}>
                    {ACTIVITY_STATUS[a.status]}
                  </button>
                  <button type="button" className="tag" onClick={() => setActivity(i, { day: (a.day + 1) % 6 })}>
                    📅 {a.day ? `Jour ${a.day}` : 'Pas placé'}
                  </button>
                </div>
                <a className="link-btn" href={search(a.name)} target="_blank" rel="noreferrer">
                  Réserver sur le site officiel ↗
                </a>
              </article>
            ))}
          </div>
        </>
      )}

      {step.status === 'ok' ? (
        <div className="spread validated">
          <strong>Étape validée ✓</strong>
          <button type="button" className="btn btn--secondary" onClick={validate}>
            Rouvrir
          </button>
        </div>
      ) : (
        <button type="button" className="btn btn--primary btn--block" onClick={validate}>
          Valider cette étape
        </button>
      )}

      <Sheet open={importing} onClose={() => setImporting(false)} title="Importer de Claude">
        <div className="stack stack--sm">
          <div className="eyebrow">1 · Copie la demande</div>
          <p className="meta">Elle contient le voyage, le budget, les lignes gardées et ton ajustement. Colle-la dans Claude.</p>
          <button type="button" className="btn btn--secondary btn--block" onClick={() => void copy()}>
            {copied ? 'Copié ✓' : 'Copier la demande'}
          </button>
        </div>
        <div className="stack stack--sm">
          <div className="eyebrow">2 · Colle la réponse</div>
          <textarea className="field" placeholder="Colle ici la réponse…" value={pasted} onChange={(e) => setPasted(e.target.value)} />
        </div>
        <button type="button" className="btn btn--primary btn--block" onClick={doImport}>
          Importer en un clic
        </button>
        <p className="meta sheet__note">Remplace les lignes non gardées de l'étape. Écrit par {nameOf(me)}.</p>
      </Sheet>
    </div>
  )
}
