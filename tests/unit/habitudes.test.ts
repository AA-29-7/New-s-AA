import { describe, expect, it } from 'vitest'
import { addDays, isoDate } from '../../src/shared/lib/dates'
import { DEMO_HABITS, seedHistory } from '../../src/modules/habitudes/data/demo'
import { currentStreak, duel, headline, level, longestStreak, ratioOn, toggleCheck, type Checks, type Habit } from '../../src/modules/habitudes/logic'

const today = new Date(2026, 10, 13) // vendredi
const ALL = [true, true, true, true, true, true, true]
const h = (patch: Partial<Habit> = {}): Habit => ({
  id: 'x', title: 'X', emoji: '🧘', categoryId: '', color: 'sage', owner: 'alex', rule: 'both', joker: false, days: ALL, reminder: false, ...patch,
})
const days = (from: number, to: number, who: ('alex' | 'antoine')[] = ['alex']): Checks => {
  const c: Checks = {}
  for (let i = from; i <= to; i++) c[isoDate(addDays(today, -i))] = who
  return c
}

describe('séries', () => {
  it('compte aujourd’hui s’il est fait, sinon part d’hier', () => {
    expect(currentStreak(h(), days(0, 4), 'alex', today)).toBe(5)
    expect(currentStreak(h(), days(1, 4), 'alex', today)).toBe(4)
  })
  it('casse sur un oubli, sauf avec le joker de la semaine', () => {
    const c = { ...days(1, 2), ...days(4, 8) }
    expect(currentStreak(h(), c, 'alex', today)).toBe(2)
    expect(currentStreak(h({ joker: true }), c, 'alex', today)).toBe(7)
  })
  it('ignore les jours non prévus', () => {
    // Lundi à vendredi seulement : le week-end dernier ne casse rien.
    const weekdays = [true, true, true, true, true, false, false]
    const c = { ...days(0, 4), ...days(7, 11) }
    expect(currentStreak(h({ days: weekdays }), c, 'alex', today)).toBe(10)
  })
  it('« À deux » : une commune ne compte que si les deux l’ont faite', () => {
    const common = h({ owner: 'both', rule: 'both' })
    const c = { ...days(1, 5, ['alex', 'antoine']), ...days(0, 0, ['alex']) }
    expect(currentStreak(common, { ...c, ...days(3, 3, ['alex']) }, 'alex', today)).toBe(2)
    expect(currentStreak({ ...common, rule: 'each' }, { ...c, ...days(3, 3, ['alex']) }, 'alex', today)).toBe(6)
  })
  it('trouve la plus longue série', () => {
    expect(longestStreak(h(), { ...days(1, 3), ...days(10, 20) }, 'alex', today)).toBe(11)
  })
})

describe('jour et duel', () => {
  it('donne le niveau du calendrier', () => {
    expect([level(null), level(0), level(0.3), level(0.7), level(1)]).toEqual([0, 0, 1, 2, 3])
  })
  it('calcule la part du jour', () => {
    const habits = [h({ id: 'a' }), h({ id: 'b' }), h({ id: 'c', owner: 'antoine' })]
    expect(ratioOn(habits, { a: days(0, 0) }, 'alex', today)).toBe(0.5)
  })
  it('coche et décoche', () => {
    const c = toggleCheck({}, '2026-11-13', 'alex')
    expect(toggleCheck(toggleCheck(c, '2026-11-13', 'antoine'), '2026-11-13', 'alex')).toEqual({ '2026-11-13': ['antoine'] })
    expect(toggleCheck(c, '2026-11-13', 'alex')).toEqual({})
  })
  it('compte quatre manches au duel', () => {
    const history = seedHistory(today)
    const { rows, score } = duel(DEMO_HABITS, history, new Date(2026, 10, 1), today)
    expect(rows).toHaveLength(4)
    expect(score.alex + score.antoine).toBeLessThanOrEqual(4)
  })
  it('reprend les séries du prototype dans les données de démo', () => {
    const history = seedHistory(today)
    const med = DEMO_HABITS.find((x) => x.id === 'h1')!
    const run = DEMO_HABITS.find((x) => x.id === 'h6')!
    expect(currentStreak(med, history.h1, 'alex', today)).toBe(11)
    expect(currentStreak(run, history.h6, 'antoine', today)).toBe(14)
  })
  it('formule la phrase d’avancement', () => {
    expect([headline(3), headline(1), headline(0)]).toEqual(['Encore 3 à cocher', 'Plus qu’une habitude', 'Journée bouclée, bravo'])
  })
})
