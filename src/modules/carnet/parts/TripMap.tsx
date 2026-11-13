import { useEffect, useRef } from 'react'
import type { Map as LeafletMap } from 'leaflet'

export interface MapPin {
  lon: number
  lat: number
  /** Texte du repère : libellé d'un lieu ou prix d'une offre. */
  label: string
  /** Numéro affiché dans le rond (repères d'itinéraire). */
  n?: number
  active?: boolean
  onPick?: () => void
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

/**
 * Carte OpenStreetMap (Leaflet, chargé à la demande). Les repères sont
 * dessinés en HTML avec les classes du module : la carte s'ajuste à eux.
 */
export function TripMap({ pins, variant = 'pins', height = 240 }: { pins: MapPin[]; variant?: 'pins' | 'prices'; height?: number }) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<LeafletMap | null>(null)
  const fitted = useRef('')
  const latest = useRef(pins)
  latest.current = pins
  const signature = pins.map((p) => `${p.lon},${p.lat},${p.label},${p.active ? 1 : 0}`).join('|')
  const extent = pins.map((p) => `${p.lon},${p.lat}`).join('|')

  useEffect(() => {
    let cancelled = false
    void Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')]).then(([mod]) => {
      const L = mod.default
      if (cancelled || !el.current) return
      if (!map.current) {
        map.current = L.map(el.current, { zoomControl: false, attributionControl: true, scrollWheelZoom: false })
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '© OpenStreetMap contributors',
        }).addTo(map.current)
      }
      const m = map.current
      m.eachLayer((layer) => {
        if (layer instanceof L.Marker) m.removeLayer(layer)
      })
      latest.current.forEach((p, i) => {
        const html =
          variant === 'prices'
            ? `<span class="mappin mappin--price${p.active ? ' is-active' : ''}">${esc(p.label)}</span>`
            : `<span class="mappin"><b>${p.n ?? i + 1}</b><i>${esc(p.label)}</i></span>`
        const marker = L.marker([p.lat, p.lon], {
          icon: L.divIcon({ html, className: 'mappin-host', iconSize: [0, 0] }),
          zIndexOffset: p.active ? 1000 : 0,
          interactive: !!p.onPick,
        }).addTo(m)
        if (p.onPick) marker.on('click', () => latest.current[i]?.onPick?.())
      })
      // Cadre la carte sur les repères quand leur emprise change.
      if (fitted.current !== extent && latest.current.length > 0) {
        fitted.current = extent
        m.invalidateSize()
        m.fitBounds(L.latLngBounds(latest.current.map((p) => [p.lat, p.lon])), { padding: [36, 36], maxZoom: 14 })
      }
    })
    return () => {
      cancelled = true
    }
  }, [signature, extent, variant])

  useEffect(
    () => () => {
      map.current?.remove()
      map.current = null
      fitted.current = ''
    },
    [],
  )

  return <div ref={el} className="tripmap" style={{ height }} role="img" aria-label="Carte du voyage" />
}
