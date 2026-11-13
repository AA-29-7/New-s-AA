import { createContext, createElement, useContext, useMemo, type ReactNode } from 'react'
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
function useQuestsData() {
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

type Quests = ReturnType<typeof useQuestsData>
const QuestsContext = createContext<Quests | null>(null)

/** Un seul abonnement pour toute l'app (la carte, les feuilles et la page « Nos quêtes » le partagent). */
export function QuestsProvider({ children }: { children: ReactNode }) {
  return createElement(QuestsContext.Provider, { value: useQuestsData() }, children)
}

export function useQuests(): Quests {
  const ctx = useContext(QuestsContext)
  if (!ctx) throw new Error('useQuests : à utiliser sous <QuestsProvider>')
  return ctx
}

/**
 * Démo : le défi du mois et cinq mois d'historique. Sans écrasement (createIfMissing) ;
 * le document du mois courant est écrit en dernier et sert de repère : un semis interrompu
 * est repris au lancement suivant.
 */
export const questSeeder: DemoSeeder = {
  name: 'quêtes',
  async run({ scope }: { scope: Scope }) {
    const r = repo<QuestDoc>('quests', scope)
    const book = seedQuests(new Date())
    const marker = monthKey(new Date())
    if (await r.existsOnServer(marker)) return
    const months = Object.keys(book).sort()
    for (const m of months.filter((x) => x !== marker)) await r.createIfMissing(m, { ...book[m], ownerId: null })
    await r.createIfMissing(marker, { ...book[marker], ownerId: null })
  },
}
