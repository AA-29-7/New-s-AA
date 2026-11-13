// Tests de la couche data contre l'émulateur Firestore (règles de firestore.rules incluses).
// Lancer avec : npm test
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { deleteApp, initializeApp, type FirebaseApp } from 'firebase/app'
import {
  addDoc, collection, connectFirestoreEmulator, deleteDoc, doc, getDoc, getDocs,
  getFirestore, query, setDoc, where, type Firestore,
} from 'firebase/firestore'
import { makeRepo } from '../src/lib/data/repo-core'
import type { BaseDoc } from '../src/lib/data/types'

const [HOST, PORT] = (process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080').split(':')
const PROJECT = 'demo-test'
const HID = 'foyer'
const ALICE = 'alice-uid'
const BOB = 'bob-uid'
const VIEWER = 'viewer-uid'
const STRANGER = 'stranger-uid'

const apps: FirebaseApp[] = []
let n = 0

/** Client Firestore authentifié comme `uid` ; 'admin' contourne les règles (préparation des données). */
function clientAs(uid: string | 'admin' | null): Firestore {
  const app = initializeApp({ projectId: PROJECT }, `t${n++}`)
  apps.push(app)
  const db = getFirestore(app)
  const mockUserToken = uid === 'admin' ? 'owner' : uid ? { sub: uid, user_id: uid } : undefined
  connectFirestoreEmulator(db, HOST, Number(PORT), mockUserToken ? { mockUserToken } : {})
  return db
}

interface Habit extends BaseDoc { name: string }
const habitsOf = (uid: string, hid = HID) => makeRepo(clientAs(uid))<Habit>('habits', { hid, uid })

async function reset() {
  await fetch(`http://${HOST}:${PORT}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' })
  const admin = clientAs('admin')
  await setDoc(doc(admin, 'households', HID), {
    members: { [ALICE]: 'member', [BOB]: 'member', [VIEWER]: 'viewer' },
    people: { [ALICE]: 'alex', [BOB]: 'antoine' },
  })
  await setDoc(doc(admin, 'households', 'autre'), { members: { [STRANGER]: 'member' } })
}

beforeEach(reset)
afterAll(() => Promise.all(apps.map(deleteApp)))

describe('foyer', () => {
  it('un membre lit le foyer', async () => {
    await expect(getDoc(doc(clientAs(ALICE), 'households', HID))).resolves.toBeTruthy()
  })
  it.each([[VIEWER], [STRANGER], [null]])('%s ne lit pas le foyer', async (uid) => {
    await expect(getDoc(doc(clientAs(uid), 'households', HID))).rejects.toMatchObject({ code: 'permission-denied' })
  })
  it('personne ne peut écrire dans households', async () => {
    await expect(setDoc(doc(clientAs(ALICE), 'households', HID), { members: { [ALICE]: 'member' } }))
      .rejects.toMatchObject({ code: 'permission-denied' })
  })
})

describe('repo : visibilité', () => {
  it('un document partagé est vu par les deux membres', async () => {
    const id = await habitsOf(ALICE).create({ name: 'Sport', visibility: 'household' })
    const seenByBob = await habitsOf(BOB).list()
    expect(seenByBob.map((d) => d.id)).toEqual([id])
    expect(seenByBob[0]).toMatchObject({ hid: HID, ownerId: ALICE, visibility: 'household', name: 'Sport' })
  })

  it('un document privé n\'est vu que par son propriétaire', async () => {
    const id = await habitsOf(ALICE).create({ name: 'Secret', visibility: 'private' })
    expect((await habitsOf(ALICE).list()).map((d) => d.id)).toEqual([id])
    expect(await habitsOf(BOB).list()).toEqual([])
    await expect(habitsOf(BOB).get(id)).rejects.toMatchObject({ code: 'permission-denied' })
  })

  it('list fusionne partagés et privés sans doublon', async () => {
    const a = await habitsOf(ALICE).create({ name: 'A', visibility: 'household' })
    const b = await habitsOf(ALICE).create({ name: 'B', visibility: 'private' })
    await habitsOf(BOB).create({ name: 'C', visibility: 'private' })
    expect((await habitsOf(ALICE).list()).map((d) => d.id).sort()).toEqual([a, b].sort())
  })

  it('un document commun (ownerId null) est partagé', async () => {
    const id = await habitsOf(ALICE).create({ name: 'Commun', ownerId: null, visibility: 'household' })
    expect((await habitsOf(BOB).list()).map((d) => d.id)).toEqual([id])
  })

  it('subscribe notifie la liste fusionnée', async () => {
    await habitsOf(ALICE).create({ name: 'S', visibility: 'household' })
    const seen = await new Promise<string[]>((resolve) => {
      const unsub = habitsOf(BOB).subscribe((docs) => { if (docs.length) { unsub(); resolve(docs.map((d) => d.name)) } })
    })
    expect(seen).toEqual(['S'])
  })
})

describe('repo : écriture', () => {
  it('create pose hid, ownerId et visibility', async () => {
    const id = await habitsOf(ALICE).create({ name: 'X' })
    expect(await habitsOf(ALICE).get(id)).toMatchObject({ hid: HID, ownerId: ALICE, visibility: 'household' })
  })

  it('update ne modifie ni ownerId ni visibility', async () => {
    const r = habitsOf(ALICE)
    const id = await r.create({ name: 'X', visibility: 'private' })
    await r.update(id, { name: 'Y', ownerId: BOB, visibility: 'household' })
    expect(await r.get(id)).toMatchObject({ name: 'Y', ownerId: ALICE, visibility: 'private' })
  })

  it('un membre lit mais ne modifie ni ne supprime le document partagé de l\'autre', async () => {
    const id = await habitsOf(ALICE).create({ name: 'X', visibility: 'household' })
    expect((await habitsOf(BOB).get(id))?.name).toBe('X')
    await expect(habitsOf(BOB).update(id, { name: 'Z' })).rejects.toMatchObject({ code: 'permission-denied' })
    await expect(habitsOf(BOB).remove(id)).rejects.toMatchObject({ code: 'permission-denied' })
    expect((await habitsOf(ALICE).get(id))?.name).toBe('X')
  })

  it('les deux membres modifient et suppriment un document commun (ownerId null)', async () => {
    const id = await habitsOf(ALICE).create({ name: 'X', ownerId: null, visibility: 'household' })
    await habitsOf(BOB).update(id, { name: 'Z' })
    expect((await habitsOf(ALICE).get(id))?.name).toBe('Z')
    await habitsOf(BOB).remove(id)
    expect(await habitsOf(ALICE).get(id)).toBeNull()
  })

  it('on ne modifie ni ne supprime le document privé de l\'autre', async () => {
    const id = await habitsOf(ALICE).create({ name: 'X', visibility: 'private' })
    await expect(habitsOf(BOB).update(id, { name: 'Z' })).rejects.toMatchObject({ code: 'permission-denied' })
    await expect(habitsOf(BOB).remove(id)).rejects.toMatchObject({ code: 'permission-denied' })
  })

  it('on ne peut pas changer visibility ou ownerId en direct', async () => {
    const id = await habitsOf(ALICE).create({ name: 'X', visibility: 'household' })
    const ref = doc(clientAs(ALICE), 'habits', id)
    await expect(setDoc(ref, { visibility: 'private' }, { merge: true })).rejects.toMatchObject({ code: 'permission-denied' })
    await expect(setDoc(ref, { ownerId: BOB }, { merge: true })).rejects.toMatchObject({ code: 'permission-denied' })
    await expect(setDoc(ref, { hid: 'autre' }, { merge: true })).rejects.toMatchObject({ code: 'permission-denied' })
  })

  it('on ne peut pas créer au nom d\'un autre', async () => {
    await expect(addDoc(collection(clientAs(ALICE), 'habits'), { hid: HID, ownerId: BOB, visibility: 'household', name: 'X' }))
      .rejects.toMatchObject({ code: 'permission-denied' })
  })
})

describe('journal', () => {
  const entry = (uid: string, visibility: string, ownerId: string | null = uid) =>
    addDoc(collection(clientAs(uid), 'journalEntries'), { hid: HID, ownerId, visibility, text: 't' })

  it('création privée acceptée', async () => { await expect(entry(ALICE, 'private')).resolves.toBeTruthy() })
  it('création partagée refusée', async () => { await expect(entry(ALICE, 'household')).rejects.toMatchObject({ code: 'permission-denied' }) })
  it('création commune (ownerId null) refusée', async () => { await expect(entry(ALICE, 'private', null)).rejects.toMatchObject({ code: 'permission-denied' }) })
  it('l\'autre membre ne lit pas le journal', async () => {
    await entry(ALICE, 'private')
    const q = query(collection(clientAs(BOB), 'journalEntries'), where('hid', '==', HID), where('ownerId', '==', BOB))
    expect((await getDocs(q)).size).toBe(0)
    await expect(getDocs(query(collection(clientAs(BOB), 'journalEntries'), where('hid', '==', HID))))
      .rejects.toMatchObject({ code: 'permission-denied' })
  })
})

describe('isolation', () => {
  it('une liste sans filtre est refusée', async () => {
    await habitsOf(ALICE).create({ name: 'X', visibility: 'household' })
    await expect(getDocs(collection(clientAs(ALICE), 'habits'))).rejects.toMatchObject({ code: 'permission-denied' })
  })

  it('un autre foyer ne voit rien et ne peut rien écrire dans le nôtre', async () => {
    await habitsOf(ALICE).create({ name: 'X', visibility: 'household' })
    await expect(habitsOf(STRANGER, HID).list()).rejects.toMatchObject({ code: 'permission-denied' })
    await expect(habitsOf(STRANGER, HID).create({ name: 'Y' })).rejects.toMatchObject({ code: 'permission-denied' })
    expect(await habitsOf(STRANGER, 'autre').list()).toEqual([])
  })

  it('un viewer n\'a aucun accès (rôle pas encore activé)', async () => {
    await habitsOf(ALICE).create({ name: 'X', visibility: 'household' })
    await expect(habitsOf(VIEWER).list()).rejects.toMatchObject({ code: 'permission-denied' })
    await expect(habitsOf(VIEWER).create({ name: 'Y' })).rejects.toMatchObject({ code: 'permission-denied' })
  })

  it('un utilisateur non connecté n\'a aucun accès', async () => {
    await expect(getDocs(query(collection(clientAs(null), 'habits'), where('hid', '==', HID), where('visibility', '==', 'household'))))
      .rejects.toMatchObject({ code: 'permission-denied' })
    await expect(deleteDoc(doc(clientAs(null), 'habits', 'x'))).rejects.toMatchObject({ code: 'permission-denied' })
  })
})

interface Doc extends BaseDoc { checks?: string[]; label?: string; days?: number[]; m?: Record<string, string[]> }
const col = <T extends BaseDoc = Doc>(uid: string, name: Parameters<ReturnType<typeof makeRepo>>[0]) =>
  makeRepo(clientAs(uid))<T>(name, { hid: HID, uid })

describe('repo : upsert et arrayToggle', () => {
  it('upsert crée à identifiant choisi et complète sans écraser', async () => {
    const r = col(ALICE, 'habitCategories')
    await r.upsert('bien', { label: 'Bien-être', ownerId: null })
    await r.upsert('bien', { label: 'Bien-être 2', ownerId: null })
    expect(await r.get('bien')).toMatchObject({ id: 'bien', label: 'Bien-être 2', ownerId: null, hid: HID })
    expect((await col(BOB, 'habitCategories').list()).map((d) => d.id)).toEqual(['bien'])
  })

  it('arrayToggle ajoute et retire une date, sans doublon', async () => {
    const r = col(ALICE, 'habitLogs')
    await r.arrayToggle('h1_alex', 'checks', '2026-11-13', true)
    await r.arrayToggle('h1_alex', 'checks', '2026-11-13', true)
    await r.arrayToggle('h1_alex', 'checks', '2026-11-12', true)
    expect(((await r.get('h1_alex'))?.checks ?? []).sort()).toEqual(['2026-11-12', '2026-11-13'])
    await r.arrayToggle('h1_alex', 'checks', '2026-11-13', false)
    expect((await r.get('h1_alex'))?.checks).toEqual(['2026-11-12'])
    expect(await r.get('h1_alex')).toMatchObject({ ownerId: ALICE, visibility: 'household' })
  })

  it('on ne coche pas dans les coches de l\'autre', async () => {
    await col(ALICE, 'habitLogs').arrayToggle('h1_alex', 'checks', '2026-11-13', true)
    await expect(col(BOB, 'habitLogs').arrayToggle('h1_alex', 'checks', '2026-11-14', true)).rejects.toMatchObject({ code: 'permission-denied' })
    expect((await col(BOB, 'habitLogs').get('h1_alex'))?.checks).toEqual(['2026-11-13'])
  })

  it('deux personnes écrivent chacune leur champ d\'un document commun', async () => {
    await col(ALICE, 'quests').upsert('2026-11', { m: { alex: ['1', '2'] }, ownerId: null })
    await col(BOB, 'quests').upsert('2026-11', { m: { antoine: ['3'] }, ownerId: null })
    expect((await col(ALICE, 'quests').get('2026-11'))?.m).toEqual({ alex: ['1', '2'], antoine: ['3'] })
  })

  it('un membre ne crée pas dans une collection inconnue', async () => {
    await expect(setDoc(doc(clientAs(ALICE), 'nimporte', 'x'), { hid: HID, ownerId: ALICE, visibility: 'household' }))
      .rejects.toMatchObject({ code: 'permission-denied' })
  })
})

describe('collections du Carnet et préférences', () => {
  it.each(['trips', 'tripExpenses', 'tripNotes', 'tripPhotos', 'tripPreps', 'habitGoals'] as const)('%s : document commun partagé', async (name) => {
    await col(ALICE, name).create({ label: 'x', ownerId: null })
    expect(await col(BOB, name).list()).toHaveLength(1)
  })

  it('userPrefs : créé privé par la personne, invisible pour l\'autre', async () => {
    await col(ALICE, 'userPrefs').create({ label: 'x', visibility: 'private' })
    expect(await col(ALICE, 'userPrefs').list()).toHaveLength(1)
    expect(await col(BOB, 'userPrefs').list()).toEqual([])
  })

  it('userPrefs : partagé ou commun refusé', async () => {
    await expect(col(ALICE, 'userPrefs').create({ label: 'x', visibility: 'household' })).rejects.toMatchObject({ code: 'permission-denied' })
    await expect(col(ALICE, 'userPrefs').create({ label: 'x', visibility: 'private', ownerId: null })).rejects.toMatchObject({ code: 'permission-denied' })
  })
})

describe('coches et semis', () => {
  it('l\'identifiant d\'un document de coches doit se terminer par la personne qui écrit', async () => {
    await expect(col(ALICE, 'habitLogs').arrayToggle('h1_antoine', 'checks', '2026-11-13', true)).rejects.toMatchObject({ code: 'permission-denied' })
    await expect(col(ALICE, 'habitLogs').arrayToggle('h1_alex', 'checks', '2026-11-13', true)).resolves.toBeUndefined()
  })

  it('createIfMissing ne remplace jamais un document existant', async () => {
    const r = col(ALICE, 'habitCategories')
    await r.createIfMissing('bien', { label: 'Démo', ownerId: null })
    await col(BOB, 'habitCategories').update('bien', { label: 'Modifié' })
    await col(ALICE, 'habitCategories').createIfMissing('bien', { label: 'Démo', ownerId: null })
    expect((await r.get('bien'))?.label).toBe('Modifié')
  })

  it('existsOnServer reflète la présence du document', async () => {
    const r = col(ALICE, 'quests')
    expect(await r.existsOnServer('2026-11')).toBe(false)
    await r.createIfMissing('2026-11', { ownerId: null })
    expect(await r.existsOnServer('2026-11')).toBe(true)
  })
})
