import { useRef, useState } from 'react'
import { nameOf } from '../../../shared/person'
import { Chip, DraftInput, DraftTextarea, Segment, Sheet, Sticker, cx } from '../../../shared/ui'
import { tripDays } from '../logic'
import { useCarnet, useTripPhotos } from '../store'
import type { NotebookPage, Trip } from '../types'
import { PhotoTile, useAddPhotos } from './Photos'

const blankPage = (): NotebookPage => ({ title: '', text: '', photos: [] })

/** Carnet d'un voyage : libre ou une page par jour, en écriture ou en livre. */
export function Notebook({ trip }: { trip: Trip }) {
  const carnet = useCarnet()
  const gallery = useTripPhotos(trip)
  const add = useAddPhotos(trip)
  const input = useRef<HTMLInputElement>(null)
  const [picking, setPicking] = useState(false)
  const [view, setView] = useState<'write' | 'book'>('write')
  const [current, setCurrent] = useState(0)
  const [flip, setFlip] = useState<{ n: number; dir: 'next' | 'prev' }>({ n: 0, dir: 'next' })
  const nb = carnet.notebookOf(trip.id)
  const photos = gallery.photos

  if (!nb.mode) {
    const days = tripDays(trip)
    return (
      <div className="stack stack--sm">
        <strong>Carnet</strong>
        <p className="meta">Choisis un format. Tu pourras en changer.</p>
        <div className="nbchoice">
          <button
            type="button"
            className="inset nbchoice__item pressable"
            onClick={() => {
              carnet.setNotebookMode(trip.id, 'free')
              if (nb.pages.length === 0) carnet.savePage(trip.id, 0, blankPage())
              setCurrent(0)
            }}
          >
            <Sticker emoji="📝" color="honey" size={40} rotate={-4} />
            <strong>Carnet libre</strong>
            <span className="meta">Des pages sans date, autant que tu veux.</span>
          </button>
          <button
            type="button"
            className="inset nbchoice__item pressable"
            onClick={() => {
              carnet.setNotebookMode(trip.id, 'daily')
              setCurrent(0)
            }}
          >
            <Sticker emoji="📅" color="mist" size={40} rotate={4} />
            <strong>Un carnet par jour</strong>
            <span className="meta">Une page pour chacun des {days} jours.</span>
          </button>
        </div>
      </div>
    )
  }

  const daily = nb.mode === 'daily'
  // Un carnet par jour : une page par jour du voyage, créée à la première écriture.
  const pages: NotebookPage[] = daily ? Array.from({ length: tripDays(trip) }, (_, i) => nb.pages[i] ?? blankPage()) : nb.pages
  const index = Math.min(current, Math.max(pages.length - 1, 0))
  const page = pages[index] ?? blankPage()
  /** N'écrit que le champ modifié : une modification de l'autre sur un autre champ ne s'écrase pas. */
  const edit = (patch: Partial<NotebookPage>) => carnet.savePage(trip.id, index, patch, page)
  const go = (i: number) => {
    setFlip((f) => ({ n: f.n + 1, dir: i > index ? 'next' : 'prev' }))
    setCurrent(i)
  }
  const pagePhotos = page.photos.map((id) => photos.find((p) => p.id === id)).filter((p) => !!p)
  const meta = `${daily ? `Jour ${index + 1}` : `Page ${index + 1}`} · ${trip.name}${page.author ? ` · écrit par ${nameOf(page.author)}` : ''}`

  return (
    <div className="stack stack--sm">
      <div className="spread">
        <strong>Carnet</strong>
        <button type="button" className="link-btn link-btn--soft" onClick={() => carnet.setNotebookMode(trip.id, null)}>
          Changer de format
        </button>
      </div>
      <Segment
        options={[
          { value: 'write', label: '✎ Écrire' },
          { value: 'book', label: '📖 Livre' },
        ]}
        value={view}
        onChange={setView}
        label="Affichage du carnet"
      />
      <div className="chips chips--inner noscroll">
        {pages.map((p, i) => (
          <Chip key={i} active={i === index} onClick={() => go(i)}>
            {daily ? `Jour ${i + 1}` : p.title || `Page ${i + 1}`}
          </Chip>
        ))}
        {!daily && (
          <Chip
            className="chip--dashed"
            onClick={() => {
              carnet.savePage(trip.id, pages.length, blankPage())
              setCurrent(pages.length)
            }}
          >
            + Page
          </Chip>
        )}
      </div>

      {view === 'write' ? (
        <>
          <div className="eyebrow">{meta}</div>
          <DraftInput key={`t${index}`} className="field nb__title" placeholder="Titre de la page" value={page.title} onCommit={(title) => edit({ title })} />
          <DraftTextarea key={`x${index}`} className="field nb__text" placeholder="Raconte ta journée…" value={page.text} onCommit={(text) => edit({ text })} />
          {pagePhotos.length > 0 && (
            <div className="nb__thumbs">
              {pagePhotos.map((p) => (
                <PhotoTile key={p.id} photo={p}>
                  <button type="button" className="nb__remove" aria-label="Retirer la photo de la page" onClick={() => edit({ photos: page.photos.filter((id) => id !== p.id) })}>
                    ✕
                  </button>
                </PhotoTile>
              ))}
            </div>
          )}
          <button type="button" className="btn btn--secondary" onClick={() => setPicking(true)}>
            📷 Insérer une photo
          </button>
        </>
      ) : (
        <>
          <div className="book">
            <article key={flip.n} className={cx('book__page', `book__page--${flip.dir}`)}>
              <div className="eyebrow">{meta}</div>
              <h3 className="book__title">{page.title || (daily ? `Jour ${index + 1}` : 'Sans titre')}</h3>
              <p className="book__text">{page.text || 'Cette page est encore blanche.'}</p>
              {pagePhotos.length > 0 && (
                <div className="book__photos">
                  {pagePhotos.map((p) => (
                    <PhotoTile key={p.id} photo={p} />
                  ))}
                </div>
              )}
              <div className="meta book__num">
                {index + 1} / {pages.length}
              </div>
            </article>
          </div>
          <div className="spread">
            <button type="button" className="btn btn--secondary" disabled={index === 0} onClick={() => go(index - 1)}>
              ‹ Précédente
            </button>
            <button type="button" className="btn btn--secondary" disabled={index >= pages.length - 1} onClick={() => go(index + 1)}>
              Suivante ›
            </button>
          </div>
        </>
      )}

      <Sheet open={picking} onClose={() => setPicking(false)} title="Insérer une photo">
        <input
          ref={input}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const files = e.target.files
            void add(files).then((ids) => ids.length && edit({ photos: [...page.photos, ...ids] }))
            e.target.value = ''
            setPicking(false)
          }}
        />
        <div className="photos__grid photos__grid--pick">
          {photos.map((p) => (
            <PhotoTile
              key={p.id}
              photo={p}
              onClick={() => {
                if (!page.photos.includes(p.id)) edit({ photos: [...page.photos, p.id] })
                setPicking(false)
              }}
            />
          ))}
          <button type="button" className="phototile phototile--add" onClick={() => input.current?.click()} aria-label="Nouvelle photo">
            +
          </button>
        </div>
        <p className="meta">Choisis une photo du voyage, ou ajoutes-en une nouvelle.</p>
      </Sheet>
    </div>
  )
}
