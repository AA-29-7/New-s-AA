import { useEffect, useState } from 'react'
import { isoDate } from './dates'

/** Date du jour, qui change d'elle-même à minuit et au retour sur l'app. */
export function useToday(): Date {
  const [today, setToday] = useState(() => new Date())
  useEffect(() => {
    const refresh = () => setToday((d) => (isoDate(d) === isoDate(new Date()) ? d : new Date()))
    const now = new Date()
    const untilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime()
    const timer = window.setTimeout(refresh, untilMidnight + 1000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [today])
  return today
}
