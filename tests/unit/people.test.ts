import { describe, expect, it } from 'vitest'
import { cleanPeople } from '../../src/lib/data/people'

describe('cleanPeople', () => {
  it('accepte les majuscules et les espaces saisis dans la console', () => {
    expect(cleanPeople({ ' u1 ': ' Alex ', u2: 'ANTOINE' })).toEqual({ u1: 'alex', u2: 'antoine' })
  })
  it('ignore les valeurs inconnues et les formes inattendues', () => {
    expect(cleanPeople({ u1: 'bob', u2: 3, u3: null })).toEqual({})
    expect(cleanPeople(undefined)).toEqual({})
    expect(cleanPeople('alex')).toEqual({})
  })
})
