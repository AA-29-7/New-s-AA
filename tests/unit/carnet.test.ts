import { describe, expect, it } from 'vitest'
import { OFFERS, ROME_EXPENSES, TRIPS, blankSteps, lisbonPrep } from '../../src/modules/carnet/data/demo'
import {
  activeFilters,
  balance,
  balanceText,
  budgetStatus,
  gaugePosition,
  generatedExpenses,
  importResponse,
  matchesFilters,
  regenerate,
  suggestedStep,
  totalOf,
  tripDays,
  tripStats,
} from '../../src/modules/carnet/logic'
import type { Expense } from '../../src/modules/carnet/types'

const e = (who: Expense['who'], amount: number): Expense => ({ id: String(Math.random()), cat: 'resto', label: '', amount, who, day: '' })
const rome = TRIPS.find((t) => t.id === 'rome')!

describe('qui doit quoi', () => {
  it('ignore l’épargne commune et partage le reste en deux', () => {
    const b = balance(ROME_EXPENSES)
    expect(b.paidByAlex).toBe(429)
    expect(b.paidByAntoine).toBe(123)
    expect(b.fromSavings).toBe(520)
    expect(balanceText(rome, ROME_EXPENSES)).toBe('Antoine doit 153 € à Alex')
  })
  it('inverse le sens quand Antoine a plus payé', () => {
    expect(balanceText(rome, [e('antoine', 100)])).toBe('Alex doit 50 € à Antoine')
  })
  it('est quitte sous 1 € d’écart, ou une fois réglé', () => {
    expect(balanceText(rome, [e('alex', 10), e('antoine', 9.5)])).toBe('Vous êtes quittes')
    expect(balanceText(rome, ROME_EXPENSES, true)).toBe('Vous êtes quittes')
  })
  it('n’a rien à partager pour un voyage perso', () => {
    expect(balanceText({ owner: 'alex' }, [e('alex', 100)])).toBe('Rien à partager')
  })
})

describe('budget', () => {
  it('situe le total par rapport à l’idéal et à la limite', () => {
    expect(budgetStatus(900, 1000, 1300).level).toBe('under')
    expect(budgetStatus(1072, 1000, 1300).label).toBe('72 € au-dessus de l’idéal')
    expect(budgetStatus(1400, 1000, 1300).level).toBe('overLimit')
  })
  it('plafonne la jauge à 115 % de la limite', () => {
    expect(gaugePosition(1150, 1000)).toBeCloseTo(1)
    expect(gaugePosition(5000, 1000)).toBe(1)
    expect(gaugePosition(575, 1000)).toBeCloseTo(0.5)
  })
  it('répartit un total connu sans perdre un euro', () => {
    const t = TRIPS.find((x) => x.id === 'cph')!
    expect(totalOf(generatedExpenses(t, 'août 2025'))).toBe(t.total)
  })
})

describe('étapes de préparation', () => {
  it('suggère la première étape non validée', () => {
    expect(suggestedStep(lisbonPrep().steps)?.id).toBe('budget')
    expect(blankSteps()).toHaveLength(9)
  })
  it('régénère seulement les lignes non gardées', () => {
    const vols = lisbonPrep().steps.find((s) => s.id === 'vols')!
    vols.proposals[0][0].locked = true
    const next = regenerate(vols)
    expect(next.proposals[0][0].v).toBe(vols.proposals[0][0].v)
    expect(next.proposals[0][1].v).toBe('Lisbonne → CDG · lun. 30 · 16 h 10 → 19 h 40')
    expect(next.proposals[0][1].alts).toContain(vols.proposals[0][1].v)
  })
  it('importe une réponse « Libellé : valeur » sans toucher aux lignes gardées', () => {
    const step = lisbonPrep().steps.find((s) => s.id === 'logement')!
    step.proposals[0][2].locked = true
    const next = importResponse(step, '- Quartier : Graça\n- Logement : Studio\n- Prix : 300 €\nNote : 4,5 / 5')
    const v = next.proposals[0].map((l) => l.v)
    expect(v).toEqual(['Graça', 'Studio', '', '4,5 / 5'])
    expect(next.status).toBe('ia')
  })
})

describe('statistiques et Discover', () => {
  it('compte les jours, pays et continents', () => {
    expect(tripDays(rome)).toBe(5)
    const past = TRIPS.filter((t) => t.owner === 'both' && t.id !== 'lisbonne')
    const s = tripStats(past, (t) => (t.id === 'rome' ? ROME_EXPENSES : generatedExpenses(t, '')))
    expect(s.trips).toBe(5)
    expect(s.continents).toBe(2)
    expect(s.total).toBe(1072 + 1150 + 1890 + 980 + 1240)
  })
  it('filtre les offres', () => {
    const porto = OFFERS.find((o) => o.id === 1)!
    expect(matchesFilters(porto, { budget: ['200 €'], per: ['Pour deux'] })).toBe(false)
    expect(matchesFilters(porto, { budget: ['200 €'], per: ['Par personne'] })).toBe(true)
    expect(matchesFilters(porto, { mode: ['Train'] })).toBe(false)
    expect(activeFilters({ per: ['Pour deux'], zone: ['France'] })).toBe(1)
  })
})
