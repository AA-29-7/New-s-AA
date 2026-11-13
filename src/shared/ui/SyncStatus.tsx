import { useSyncExternalStore } from 'react'

function subscribe(cb: () => void) {
  window.addEventListener('online', cb)
  window.addEventListener('offline', cb)
  return () => {
    window.removeEventListener('online', cb)
    window.removeEventListener('offline', cb)
  }
}

export function useOnline(): boolean {
  return useSyncExternalStore(subscribe, () => navigator.onLine)
}

/** « Synchronisé » ou « Hors connexion » : toujours un point et un libellé. */
export function SyncStatus({ chip }: { chip?: boolean }) {
  const online = useOnline()
  return (
    <span className={chip ? 'sync sync--chip' : 'sync'} data-offline={!online}>
      {online ? 'Synchronisé' : 'Hors connexion'}
    </span>
  )
}
