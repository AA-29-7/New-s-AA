import type { PersonId } from '../lib/data/types'

/** Les deux personnes du QG (fichier pur : utilisable par la logique métier et les tests). */
export type Person = PersonId
/** Propriétaire d'un élément : une personne, ou les deux (commun). */
export type Owner = Person | 'both'

export const PEOPLE: Record<Person, { name: string; initial: string }> = {
  alex: { name: 'Alex', initial: 'A' },
  antoine: { name: 'Antoine', initial: 'A' },
}
export const PERSONS: Person[] = ['alex', 'antoine']

export const otherOf = (p: Person): Person => (p === 'alex' ? 'antoine' : 'alex')
export const nameOf = (p: Person) => PEOPLE[p].name
