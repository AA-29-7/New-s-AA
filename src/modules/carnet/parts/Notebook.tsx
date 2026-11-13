import { useRef, useState } from 'react'
import { nameOf, usePerson } from '../../../shared/person'
import { Chip, Segment, Sheet, Sticker, cx } from '../../../shared/ui'
import { tripDays } from '../logic'
import { useCarnet } from '../store'
import type { Notebook as NotebookState, NotebookPage, Trip } from '../types'
import { PhotoTile, useAddPhotos } from './Photos'

const blankPage = (): NotebookPage => ({ title: '', text: '', photos: [] })

/** Carnet d'un voyage : libre ou une page par jour, en écriture ou en livre. */
export function Notebook({ trip }: { trip: Trip }) {
  const { me } = usePerson()
  const carnet = useCarnet()
  const add = useAddPhotos(trip)
  const input = useRef<HTMLInputElement>(null)
  const [picking, setPicking] = useState(false)
  const [flip, setFlip] = useState<{ n: number; dir: 'next' | 'prev' }>({ n: 0, dir: 'next' })
  const nb = carnet.notebookOf(trip.id)
  const set = (fn: (n: NotebookState) => NotebookState) => carnet.setNotebook(trip.id, fn)
  const photos = carnet.photosOf(trip)

  if (!nb.mode) {
    const days = tripDays(trip)
    return (
      <div className="stack stack--sm">
        <strong>Carnet</strong>
        <p className="meta">Choisis un format. Tu pourras en changer.</p>
        <div className="nbchoice">
          <button type="button" className="inset nbchoice__item pressable" onClick={() => set((n) => ({ ...n, mode: 'free', current: 0, pages: n.pages.length ? n.pages : [blankPage()] }))}>
            <Sticker emoji="📝" color="honey" size={40} rotate={-4} />
            <strong>Carnet libre</strong>
            <span className="meta">Des pages sans date, autant que tu veux.</span>
          </button>
          <button
            type="button"
            className="inset nbchoice__item pressable"
            onClick={() =>
              set((n) => ({ ...n, mode: 'daily', current: 0, pages: Array.from({ length: days }, (_, i) => n.pages[i] ?? blankPage()) }))
            }
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
  const current = Math.min(nb.current, Math.max(nb.pages.length - 1, 0))
  const page = nb.pages[current] ?? blankPage()
  const edit = (patch: Partial<NotebookPage>) =>
    set((n) => ({ ...n, pages: n.pages.map((p, i) => (i === current ? { ...p, ...patch, author: p.author ?? me } : p)) }))
  const go = (i: number) => {
    setFlip((f) => ({ n: f.n + 1, dir: i > current ? 'next' : 'prev' }))
    set((n) => ({ ...n, current: i }))
  }
  const pagePhotos = page.photos.map((id) => photos.find((p) => p.id === id)).filter((p) => !!p)
  const meta = `${daily ? `Jour ${current + 1}` : `Page ${current + 1}`} · ${trip.name}${page.author ? ` · écrit par ${nameOf(page.author)}` : ''}`

  return (
    <div className="stack stack--sm">
      <div className="spread">
        <strong>Carnet</strong>
        <button type="button" className="link-btn link-btn--soft" onClick={() => set((n) => ({ ...n, mode: null }))}>
          Changer de format
        </button>
      </div>
      <Segment
        options={[
          { value: 'write', label: '✎ Écrire' },
          { value: 'book', label: '📖 Livre' },
        ]}
        value={nb.view}
        onChange={(view) => set((n) => ({ ...n, view }))}
        label="Affichage du carnet"
      />
      <div className="chips chips--inner noscroll">
        {nb.pages.map((p, i) => (
          <Chip key={i} active={i === current} onClick={() => go(i)}>
            {daily ? `Jour ${i + 1}` : p.title || `Page ${i + 1}`}
          </Chip>
        ))}
        {!daily && (
          <Chip className="chip--dashed" onClick={() => set((n) => ({ ...n, pages: [...n.pages, blankPage()], current: n.pages.length }))}>
            + Page
          </Chip>
        )}
      </div>

      {nb.view === 'write' ? (
        <>
          <div className="eyebrow">{meta}</div>
          <input className="field nb__title" placeholder="Titre de la page" value={page.title} onChange={(e) => edit({ title: e.target.value })} />
          <textarea className="field nb__text" placeholder="Raconte ta journée…" value={page.text} onChange={(e) => edit({ text: e.target.value })} />
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
              <h3 className="book__title">{page.title || (daily ? `Jour ${current + 1}` : 'Sans titre')}</h3>
              <p className="book__text">{page.text || 'Cette page est encore blanche.'}</p>
              {pagePhotos.length > 0 && (
                <div className="book__photos">
                  {pagePhotos.map((p) => (
                    <PhotoTile key={p.id} photo={p} />
                  ))}
                </div>
              )}
              <div className="meta book__num">
                {current + 1} / {nb.pages.length}
              </div>
            </article>
          </div>
          <div className="spread">
            <button type="button" className="btn btn--secondary" disabled={current === 0} onClick={() => go(current - 1)}>
              ‹ Précédente
            </button>
            <button type="button" className="btn btn--secondary" disabled={current >= nb.pages.length - 1} onClick={() => go(current + 1)}>
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
