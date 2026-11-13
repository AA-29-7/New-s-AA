import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * Feuille du bas (mobile) ou modale centrée de 460 px (bureau).
 * Se ferme avec le voile, le bouton en haut à droite ou la touche Échap.
 */
export function Sheet({
  open,
  onClose,
  title,
  closeLabel = 'Fermer',
  children,
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  closeLabel?: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="sheet-layer">
      <div className="sheet-scrim" onClick={onClose} />
      <div className="sheet noscroll" role="dialog" aria-modal="true">
        <span className="sheet__handle" />
        {title != null && (
          <div className="sheet__head">
            <h2 className="sheet__title">{title}</h2>
            <button type="button" className="btn btn--text" onClick={onClose}>
              {closeLabel}
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  )
}
