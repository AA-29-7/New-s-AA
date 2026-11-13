import { useEffect, useSyncExternalStore } from 'react'
import { useStored } from './lib/localStore'

export type ThemePref = 'auto' | 'light' | 'dark'
export type Theme = 'light' | 'dark'

export const THEME_KEY = 'qg_theme'

const query = '(prefers-color-scheme: dark)'

function subscribeSystem(cb: () => void) {
  const mq = window.matchMedia(query)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

/** Thème clair / sombre, choisi par appareil (« auto » suit le système). */
export function useTheme() {
  const [pref, setPref] = useStored<ThemePref>(THEME_KEY, 'auto')
  const systemDark = useSyncExternalStore(subscribeSystem, () => window.matchMedia(query).matches)
  const theme: Theme = pref === 'auto' ? (systemDark ? 'dark' : 'light') : pref
  return { pref, theme, setPref }
}

/** Applique le thème sur <html> et accorde la couleur de la barre du navigateur. */
export function ThemeSync() {
  const { theme } = useTheme()
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    const bg = getComputedStyle(root).getPropertyValue('--color-bg-top').trim()
    if (bg) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg)
  }, [theme])
  return null
}

export const THEME_OPTIONS: { value: ThemePref; label: string }[] = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
  { value: 'auto', label: 'Auto' },
]
