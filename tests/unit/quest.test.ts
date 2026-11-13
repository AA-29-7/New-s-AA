import { describe, expect, it } from 'vitest'
import {
  chooserFor,
  countOutcomes,
  monthKey,
  outcomeOf,
  questStreak,
  seedQuests,
  shiftMonth,
  toggleDay,
  type Quest,
} from '../../src/shared/quest/quest'

const quest = (patch: Partial<Quest>): Quest => ({
  month: '2026-11',
  challenge: { emoji: '📵', color: 'mist', title: 'Défi', both: true, description: '' },
  chooser: 'antoine',
  status: 'accepted',
  checks: { alex: [], antoine: [] },
  review: {},
  ...patch,
})

describe('quête du QG', () => {
  it('alterne la personne qui choisit, Antoine en novembre 2026', () => {
    expect(chooserFor('2026-11')).toBe('antoine')
    expect(chooserFor('2026-12')).toBe('alex')
    expect(chooserFor('2027-01')).toBe('antoine')
  })

  it('décale les mois en passant les années', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
    expect(monthKey(new Date(2026, 10, 13))).toBe('2026-11')
  })

  it('compte la série jusqu’à aujourd’hui, ou hier si le jour n’est pas coché', () => {
    expect(questStreak([1, 2, 3], 3)).toBe(3)
    expect(questStreak([1, 2, 3], 4)).toBe(3)
    expect(questStreak([1, 2, 3], 5)).toBe(0)
    expect(questStreak([1, 3, 4], 4)).toBe(2)
    expect(questStreak([], 1)).toBe(0)
  })

  it('coche et décoche un jour', () => {
    expect(toggleDay([1, 3], 2)).toEqual([1, 2, 3])
    expect(toggleDay([1, 2, 3], 2)).toEqual([1, 3])
  })

  it('déduit l’état d’un défi', () => {
    expect(outcomeOf(quest({}), '2026-11')).toBe('running')
    expect(outcomeOf(quest({}), '2026-12')).toBe('unreviewed')
    expect(outcomeOf(quest({ status: 'refused' }), '2026-11')).toBe('refused')
    expect(outcomeOf(quest({ status: 'proposed' }), '2026-11')).toBe('proposed')
    expect(outcomeOf(quest({ review: { alex: 'yes', antoine: 'part' } }), '2026-12')).toBe('done')
    expect(outcomeOf(quest({ review: { alex: 'part' } }), '2026-12')).toBe('partial')
    expect(outcomeOf(quest({ review: { alex: 'no', antoine: 'no' } }), '2026-12')).toBe('missed')
  })

  it('prépare des données de démonstration cohérentes', () => {
    const today = new Date(2026, 10, 13)
    const book = seedQuests(today)
    expect(Object.keys(book)).toHaveLength(6)
    const current = book['2026-11']
    expect(current.chooser).toBe('antoine')
    expect(current.checks.antoine).toContain(13)
    expect(current.checks.alex).not.toContain(13)
    expect(questStreak(current.checks.alex, 13)).toBe(12)
    expect(countOutcomes(book, '2026-11')).toEqual({ done: 3, running: 1, missed: 2 })
  })
})

describe('proposition sans réponse', () => {
  it('n’est pas présentée comme un refus', () => {
    const q = seedQuests(new Date(2026, 10, 13))['2026-11']
    expect(outcomeOf({ ...q, status: 'proposed' }, '2026-12')).toBe('unanswered')
  })
})
