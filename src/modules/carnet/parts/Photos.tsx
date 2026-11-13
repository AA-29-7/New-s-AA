import { useRef, useState, type DragEvent, type ReactNode } from 'react'
import { Sheet, Sticker, cssVars, cx, useToast } from '../../../shared/ui'
import { MAX_PHOTOS, useCarnet, useTripPhotos } from '../store'
import type { Photo, Trip } from '../types'

/** Vignette : vraie photo, ou rayures pour une photo de démonstration. */
export function PhotoTile({ photo, className, onClick, children }: { photo: Photo; className?: string; onClick?: () => void; children?: ReactNode }) {
  const style = photo.data ? { backgroundImage: `url("${photo.data}")` } : undefined
  const cls = cx('phototile', !photo.data && 'cv', className)
  const color = photo.data ? undefined : (photo.color ?? 'neutral')
  return onClick ? (
    <button type="button" className={cls} data-color={color} style={style} onClick={onClick} aria-label="Ouvrir la photo">
      {children}
    </button>
  ) : (
    <span className={cls} data-color={color} style={style}>
      {children}
    </span>
  )
}

/** Ajout d'images avec les messages de limite (20 photos max, image illisible). */
export function useAddPhotos(trip: Trip) {
  const gallery = useTripPhotos(trip)
  const toast = useToast()
  return async (files: FileList | File[] | null): Promise<string[]> => {
    if (gallery.photos.length >= MAX_PHOTOS && (files?.length ?? 0) > 0) {
      toast('20 photos max par voyage')
      return []
    }
    const { ids, skipped, failed, loading } = await gallery.add(files)
    if (loading) toast('Les photos se chargent, réessaie dans un instant')
    else if (skipped > 0) toast('20 photos max par voyage')
    else if (failed > 0) toast('Une image n’a pas pu être lue')
    return ids
  }
}

/** Galerie d'un voyage : compteur n / 20, glisser-déposer, photo en grand. */
export function Photos({ trip }: { trip: Trip }) {
  const carnet = useCarnet()
  const gallery = useTripPhotos(trip)
  const add = useAddPhotos(trip)
  const input = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState<Photo | null>(null)
  const [over, setOver] = useState(false)
  const photos = gallery.photos

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    void add(e.dataTransfer.files)
  }
  const remove = (p: Photo) => {
    gallery.remove(p)
    carnet.removePhotoFromPages(trip.id, p.id)
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
      {gallery.loading ? (
        <div className="photos__grid" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className="phototile skeleton" />
          ))}
        </div>
      ) : photos.length === 0 ? (
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
