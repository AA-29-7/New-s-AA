import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sheet, Sticker, cx, useOnline, useToast } from '../../../shared/ui'
import { DOCUMENTS, TODAY_PROGRAM } from '../data/demo'
import { balanceText, eur, totalOf } from '../logic'
import { CatDot } from '../parts/bits'
import { BASE, ScreenHead } from '../parts/common'
import { ExpenseSheet } from '../parts/ExpenseSheet'
import { PhotoTile, useAddPhotos } from '../parts/Photos'
import { TripMap } from '../parts/TripMap'
import { tripDay, useCarnet, useTripPhotos } from '../store'
import type { Trip } from '../types'

/** Sur place : saisie rapide, programme du jour, documents, dépenses. */
export function OnsiteScreen() {
  const carnet = useCarnet()
  const trip = carnet.nextTrip
  if (!trip) {
    return (
      <div className="page carnet">
        <ScreenHead eyebrow="Carnet de voyage" title="Sur place" />
        <p className="muted">{carnet.loading ? 'Chargement…' : 'Aucun voyage prévu pour l’instant. Prépare-en un depuis Discover.'}</p>
        <Link to={`${BASE}/discover`} className="btn btn--primary">
          Ouvrir Discover
        </Link>
      </div>
    )
  }
  return <Onsite trip={trip} />
}

function Onsite({ trip }: { trip: Trip }) {
  const carnet = useCarnet()
  const online = useOnline()
  const toast = useToast()
  const add = useAddPhotos(trip)
  const [adding, setAdding] = useState(false)
  const [souv, setSouv] = useState(false)
  const day = tripDay(trip)
  const expenses = carnet.expensesOf(trip)
  const photos = useTripPhotos(trip).photos
  const nb = carnet.notebookOf(trip.id)
  const pageIndex = Math.max(0, (day ?? 1) - 1)
  const [note, setNote] = useState('')

  const openSouv = () => {
    setNote(nb.pages[pageIndex]?.text ?? '')
    setSouv(true)
  }
  const saveNote = () => {
    if (!nb.mode) carnet.setNotebookMode(trip.id, 'daily')
    carnet.savePage(trip.id, pageIndex, { text: note }, nb.pages[pageIndex])
    toast(online ? 'Note du jour enregistrée' : 'Note gardée · en attente d’envoi')
    setSouv(false)
  }

  return (
    <div className="page carnet">
      <ScreenHead eyebrow={`${trip.name} · Jour ${day ?? 1}`} title="Sur place" action={<span className={cx('sync sync--chip')} data-offline={!online}>{online ? 'Synchronisé' : 'Hors connexion'}</span>} />
      {!day && <p className="inset meta">Aperçu : ce mode s'active tout seul le jour du départ.</p>}
      {!online && <p className="banner">Tout reste consultable. Tes dépenses et notes partiront au retour du réseau.</p>}

      <div className="quick">
        <button type="button" className="card card--md card--click quick__tile" onClick={() => setAdding(true)}>
          <Sticker emoji="💶" color="sage" size={44} rotate={-4} />
          <strong>Dépense</strong>
        </button>
        <button type="button" className="card card--md card--click quick__tile" onClick={openSouv}>
          <Sticker emoji="📖" color="lavender" size={44} rotate={3} />
          <strong>Souvenirs</strong>
        </button>
      </div>

      <div className="grid-auto carnet__grid">
        <section className="card csection">
          <div className="eyebrow">Programme du jour</div>
          <div>
            {TODAY_PROGRAM.map((p, i) => (
              <div key={p.time} className={cx('row prog', i === 0 && 'row--first')} data-state={p.state}>
                <span className="prog__time">{p.time}</span>
                <span className="prog__dot" />
                <span className="row__body">{p.label}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="card csection">
          <div className="eyebrow">Carte du voyage</div>
          <TripMap pins={trip.pins.map(([label, lon, lat], i) => ({ label, lon, lat, n: i + 1 }))} height={220} />
        </section>
        <section className="card csection">
          <div className="spread">
            <span className="eyebrow">Réservations et documents</span>
            <strong className="okline">Hors ligne ✓</strong>
          </div>
          <div>
            {DOCUMENTS.map((d, i) => (
              <div key={d.label} className={cx('row', i === 0 && 'row--first')}>
                <Sticker emoji={d.emoji} color={d.color} size={34} />
                <span className="row__body row__title">{d.label}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="card csection">
          <div className="spread">
            <span className="eyebrow">Dépenses du voyage</span>
            <strong className="cbig">{eur(totalOf(expenses))}</strong>
          </div>
          <div className="inset">
            <strong>{balanceText(trip, expenses, trip.settled)}</strong>
          </div>
          {expenses.length === 0 ? (
            <p className="muted">Rien pour l'instant. Le bouton + ajoute une dépense en deux gestes.</p>
          ) : (
            <div>
              {[...expenses].reverse().map((e, i) => (
                <div key={e.id} className={cx('row', i === 0 && 'row--first')}>
                  <CatDot cat={e.cat} />
                  <div className="row__body">
                    <div className="row__title ellipsis">{e.label}</div>
                    <div className="meta">
                      {e.who === 'commun' ? 'Épargne commune' : `Payé par ${e.who === 'alex' ? 'Alex' : 'Antoine'}`}
                      {e.pending && !online ? ' · en attente d’envoi' : ''}
                    </div>
                  </div>
                  <strong>{eur(e.amount)}</strong>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <button type="button" className="fab" onClick={() => setAdding(true)} aria-label="Ajouter une dépense">
        +
      </button>
      <ExpenseSheet trip={trip} open={adding} onClose={() => setAdding(false)} />
      <Sheet open={souv} onClose={() => setSouv(false)} title="Souvenirs du jour">
        <textarea className="field" placeholder="Une note sur ta journée…" value={note} onChange={(e) => setNote(e.target.value)} />
        <button type="button" className="btn btn--primary btn--block" onClick={saveNote}>
          Enregistrer
        </button>
        <div className="photos__grid">
          {photos.map((p) => (
            <PhotoTile key={p.id} photo={p} />
          ))}
        </div>
        <label className="btn btn--secondary btn--block">
          📷 Ajouter des photos
          <input type="file" accept="image/*" multiple hidden onChange={(e) => { void add(e.target.files); e.target.value = '' }} />
        </label>
        <Link to={`${BASE}/voyages/${trip.id}?section=souv`} state={{ from: 'onsite' }} className="link-btn link-btn--soft" onClick={() => setSouv(false)}>
          Ouvrir dans Voyages ›
        </Link>
      </Sheet>
    </div>
  )
}
