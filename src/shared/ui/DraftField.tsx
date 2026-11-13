import { useDraft } from '../lib/useDraft'

interface Props {
  value: string
  onCommit: (v: string) => void
  className?: string
  placeholder?: string
  rows?: number
  inputMode?: 'text' | 'numeric' | 'decimal'
  /** Nettoyage de la saisie (ex. ne garder que les chiffres). */
  sanitize?: (v: string) => string
  'aria-label'?: string
}

/** Champ texte (une ligne) à écriture différée : voir `useDraft`. */
export function DraftInput({ value, onCommit, sanitize, ...rest }: Props) {
  const d = useDraft(value, onCommit)
  return <input {...rest} value={d.value} onChange={(e) => d.onChange(sanitize ? sanitize(e.target.value) : e.target.value)} onBlur={d.onBlur} />
}

/** Zone de texte à écriture différée : voir `useDraft`. */
export function DraftTextarea({ value, onCommit, sanitize, ...rest }: Props) {
  const d = useDraft(value, onCommit)
  return <textarea {...rest} value={d.value} onChange={(e) => d.onChange(sanitize ? sanitize(e.target.value) : e.target.value)} onBlur={d.onBlur} />
}
