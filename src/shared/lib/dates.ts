/** Dates locales au format ISO court (AAAA-MM-JJ), sans décalage de fuseau. */
export function isoDate(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  r.setDate(r.getDate() + n)
  return r
}

export function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.round((b - a) / 86400000)
}

export function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate()
}

/** Numéro du jour depuis l'époque, en heure locale : sert d'index « du jour ». */
export function dayIndex(d: Date = new Date()): number {
  return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000)
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** « Jeudi 12 novembre » */
export function longDate(d: Date = new Date()): string {
  return cap(d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }))
}

/** « novembre » */
export function monthName(d: Date): string {
  return d.toLocaleDateString('fr-FR', { month: 'long' })
}

/** « Novembre 2026 » */
export function monthYear(d: Date): string {
  return cap(d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }))
}

export { cap as capitalize }
