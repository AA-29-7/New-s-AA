import { useMemo } from 'react'
import { useStored } from '../lib/localStore'
import type { Person } from '../person'
import {
  chooserFor,
  monthKey,
  monthLength,
  seedQuests,
  toggleDay,
  type Challenge,
  type Quest,
  type QuestBook,
  type Review,
} from './quest'

const KEY = 'qg_quests_v1'
let seed: QuestBook | null = null
const demo = () => (seed ??= seedQuests(new Date()))

/** Quêtes du QG, gardées sur l'appareil (partagées par les deux profils). */
export function useQuests() {
  const [stored, setStored] = useStored<QuestBook | null>(KEY, null)
  const book = stored ?? demo()

  return useMemo(() => {
    const now = new Date()
    const month = monthKey(now)
    const day = now.getDate()
    const length = monthLength(month)
    const current: Quest | undefined = book[month]
    const patch = (fn: (q: Quest) => Quest) =>
      setStored((prev) => {
        const b = prev ?? demo()
        const q = b[month]
        return q ? { ...b, [month]: fn(q) } : b
      })

    return {
      book,
      month,
      day,
      length,
      isLastDay: day === length,
      current,
      chooser: current?.chooser ?? chooserFor(month),
      /** Coche ou décoche le défi du jour pour une personne. */
      toggleToday: (p: Person) => patch((q) => ({ ...q, checks: { ...q.checks, [p]: toggleDay(q.checks[p], day) } })),
      propose: (challenge: Challenge, by: Person) =>
        setStored((prev) => ({
          ...(prev ?? demo()),
          [month]: { month, challenge, chooser: by, status: 'proposed', checks: { alex: [], antoine: [] }, review: {} },
        })),
      respond: (accept: boolean) => patch((q) => ({ ...q, status: accept ? 'accepted' : 'refused' })),
      reopen: () => patch((q) => ({ ...q, status: 'proposed' })),
      review: (p: Person, r: Review | null) =>
        patch((q) => {
          const next = { ...q.review }
          if (r) next[p] = r
          else delete next[p]
          return { ...q, review: next }
        }),
    }
  }, [book, setStored])
}
