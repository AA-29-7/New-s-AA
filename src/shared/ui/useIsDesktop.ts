import { useSyncExternalStore } from 'react'

const query = '(min-width: 900px)'

function subscribe(cb: () => void) {
  const mq = window.matchMedia(query)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

/** Bureau (barre latérale, grilles, modales) à partir de 900 px de large. */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches)
}
