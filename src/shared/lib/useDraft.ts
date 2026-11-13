import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Champ de saisie qui n'écrit pas à chaque frappe : la valeur affichée est locale,
 * puis envoyée après `delay` ms sans frappe, ou à la perte du focus. Évite de saturer
 * Firestore (≈ 1 écriture par seconde et par document) et garde la saisie fluide.
 */
export function useDraft(value: string, onCommit: (v: string) => void, delay = 700) {
  const [draft, setDraft] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const latest = useRef({ draft, onCommit })
  latest.current = { draft, onCommit }

  const commit = useCallback((v: string) => {
    window.clearTimeout(timer.current)
    latest.current.onCommit(v)
  }, [])

  // Une fois la valeur distante rattrapée, on rend la main à la donnée partagée.
  useEffect(() => {
    if (draft !== null && draft === value) setDraft(null)
  }, [value, draft])

  // Envoi à la fermeture de l'écran si une frappe est en attente.
  useEffect(
    () => () => {
      if (timer.current !== undefined && latest.current.draft !== null) latest.current.onCommit(latest.current.draft)
      window.clearTimeout(timer.current)
    },
    [],
  )

  return {
    value: draft ?? value,
    onChange: (v: string) => {
      setDraft(v)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => commit(v), delay)
    },
    onBlur: () => {
      if (draft !== null && draft !== value) commit(draft)
    },
  }
}
