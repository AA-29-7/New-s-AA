import { useRef, useState, type DragEvent } from 'react'
import { Sheet, Sticker, cssVars, cx, useToast } from '../../../shared/ui'
import { deletePhoto, savePhoto, usePhoto } from '../photoStore'
import { useCarnet } from '../store'
import type { Photo, Trip } from '../types'

export const MAX_PHOTOS = 20

/** Vignette : vraie photo, ou rayures pour une photo de démonstration. */
export function PhotoTile({ photo, className, onClick, children }: { photo: Photo; className?: string; onClick?: () => void; children?: React.ReactNode }) {
  const url = usePhoto(photo.color ? undefined : photo.id)
  const style = url ? { backgroundImage: `url("${url}")` } : undefined
  const cls = cx('phototile', photo.color && 'cv', className)
  return onClick ? (
    <button type="button" className={cls} data-color={photo.color} style={style} onClick={onClick} aria-label="Ouvrir la photo">
      {children}
    </button>
  ) : (
    <span className={cls} data-color={photo.color} style={style}>
      {children}
    </span>
  )
}

/** Ajoute des fichiers image au voyage, dans la limite de 20 photos. */
export function useAddPhotos(trip: Trip) {
  const carnet = useCarnet()
  const toast = useToast()
  return async (files: FileList | File[] | null): Promise<string[]> => {
    const images = Array.from(files ?? []).filter((f) => f.type.startsWith('image/'))
    if (images.length === 0) return []
    const room = MAX_PHOTOS - carnet.photosOf(trip).length
    if (room <= 0) {
      toast('20 photos max par voyage')
      return []
    }
    const ids: string[] = []
    for (const f of images.slice(0, room)) {
      try {
        ids.push(await savePhoto(f))
      } catch {
        toast('Une image n’a pas pu être lue')
      }
    }
    if (ids.length) carnet.setPhotos(trip, (p) => [...p, ...ids.map((id) => ({ id }))])
    if (images.length > room) toast('20 photos max par voyage')
    return ids
  }
}

/** Galerie d'un voyage : compteur n / 20, glisser-déposer, photo en grand. */
export function Photos({ trip }: { trip: Trip }) {
  const carnet = useCarnet()
  const add = useAddPhotos(trip)
  const input = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState<Photo | null>(null)
  const [over, setOver] = useState(false)
  const photos = carnet.photosOf(trip)

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    void add(e.dataTransfer.files)
  }
  const remove = (p: Photo) => {
    carnet.setPhotos(trip, (list) => list.filter((x) => x.id !== p.id))
    carnet.setNotebook(trip.id, (n) => ({ ...n, pages: n.pages.map((pg) => ({ ...pg, photos: pg.photos.filter((id) => id !== p.id) })) }))
    if (!p.color) void deletePhoto(p.id)
    setOpen(null)
  }

  return (
    <div
      className={cx('photos', over && 'is-over')}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
    >
      <div className="spread">
        <strong>Photos</strong>
        <span className="meta">
          {photos.length} / {MAX_PHOTOS}
        </span>
      </div>
      <div className="progress photos__bar">
        <span className="progress__fill progress__fill--ink" style={cssVars({ '--pct': photos.length / MAX_PHOTOS })} />
      </div>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { void add(e.target.files); e.target.value = '' }} />
      {photos.length === 0 ? (
        <div className="photos__empty">
          <Sticker emoji="📷" color="mist" size={56} rotate={-4} />
          <strong>Ajoutez vos premières photos</strong>
          <p className="meta">Moins de 20 par voyage. Glisse-les ici ou choisis-les dans ta galerie.</p>
          <button type="button" className="btn btn--primary btn--compact" onClick={() => input.current?.click()}>
            Choisir des photos
          </button>
        </div>
      ) : (
        <div className="photos__grid">
          {photos.map((p) => (
            <PhotoTile key={p.id} photo={p} onClick={() => setOpen(p)} />
          ))}
          {photos.length < MAX_PHOTOS ? (
            <button type="button" className="phototile phototile--add" onClick={() => input.current?.click()} aria-label="Ajouter des photos">
              +
            </button>
          ) : (
            <p className="meta photos__max">20 photos max par voyage</p>
          )}
        </div>
      )}
      <Sheet open={!!open} onClose={() => setOpen(null)} title="Photo">
        {open && <PhotoTile photo={open} className="phototile--large" />}
        <button type="button" className="btn btn--danger btn--block" onClick={() => open && remove(open)}>
          Supprimer la photo
        </button>
      </Sheet>
    </div>
  )
}
