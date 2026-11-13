import { useMemo } from 'react'
import { repo, useCollection, useRepo, type BaseDoc, type Scope } from '../../lib/data'
import { useToday } from '../lib/useToday'
import type { Person } from '../people'
import type { DemoSeeder } from '../seed/DemoSeed'
import { chooserFor, monthKey, monthLength, seedQuests, type Challenge, type Quest, type QuestBook, type Review } from './quest'

/** Document `quests/AAAA-MM` : commun aux deux personnes (ownerId null). */
type QuestDoc = Quest & BaseDoc

const cleanChecks = (q: QuestDoc): Quest => ({
  month: q.month,
  challenge: q.challenge,
  chooser: q.chooser,
  status: q.status,
  checks: { alex: q.checks?.alex ?? [], antoine: q.checks?.antoine ?? [] },
  review: q.review ?? {},
})

/** Quêtes du QG, synchronisées en temps réel entre les deux téléphones. */
export function useQuests() {
  const { docs, loading } = useCollection<QuestDoc>('quests')
  const quests = useRepo<QuestDoc>('quests')
  const today = useToday()

  return useMemo(() => {
    const book: QuestBook = Object.fromEntries(docs.map((d) => [d.id, cleanChecks(d)]))
    const month = monthKey(today)
    const day = today.getDate()
    const length = monthLength(month)
    const current: Quest | undefined = book[month]
    const common = { ownerId: null } as const

    return {
      book,
      loading,
      month,
      day,
      length,
      isLastDay: day === length,
      current,
      chooser: current?.chooser ?? chooserFor(month),
      /** Coche ou décoche le défi du jour pour une personne (un champ par personne : pas de conflit). */
      toggleToday: (p: Person) => quests.arrayToggle(month, `checks.${p}`, day, !current?.checks[p].includes(day), common),
      propose: (challenge: Challenge, by: Person) =>
        quests.upsert(month, {
          month,
          challenge,
          chooser: by,
          status: 'proposed',
          checks: { alex: [], antoine: [] },
          review: { alex: null, antoine: null },
          ...common,
        }),
      respond: (accept: boolean) => quests.upsert(month, { status: accept ? 'accepted' : 'refused', ...common }),
      reopen: () => quests.upsert(month, { status: 'proposed', ...common }),
      review: (p: Person, r: Review | null) => quests.upsert(month, { review: { [p]: r }, ...common }),
    }
  }, [docs, loading, quests, today])
}

/** Démo : le défi du mois et cinq mois d'historique, seulement si Firestore est vide. */
export const questSeeder: DemoSeeder = {
  name: 'quêtes',
  async run({ scope }: { scope: Scope }) {
    const r = repo<QuestDoc>('quests', scope)
    if (!(await r.isEmptyOnServer())) return
    const book = seedQuests(new Date())
    await Promise.all(Object.values(book).map((q) => r.upsert(q.month, { ...q, ownerId: null })))
  },
}
