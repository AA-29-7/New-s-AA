// Vérifie config, auth, foyer et règles Firestore contre le projet visé par .env.local.
// Usage : CHECK_EMAIL=... CHECK_PASSWORD=... node --env-file=.env.local scripts/check-data.mjs
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, where,
} from 'firebase/firestore'
import { getFirestore } from 'firebase/firestore'

const HID = process.env.CHECK_HID ?? 'foyer'
const { CHECK_EMAIL, CHECK_PASSWORD } = process.env
if (!CHECK_EMAIL || !CHECK_PASSWORD) {
  console.error('Définir CHECK_EMAIL et CHECK_PASSWORD (compte e-mail/mot de passe du projet).')
  process.exit(1)
}

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
})
const auth = getAuth(app)
const db = getFirestore(app)

let failed = 0
const ok = (label) => console.log(`  ✔ ${label}`)
const ko = (label, e) => { failed++; console.log(`  ✘ ${label} — ${e?.code ?? e?.message ?? e}`) }
async function expectOk(label, fn) { try { return await fn(), ok(label) } catch (e) { ko(label, e) } }
async function expectDenied(label, fn) {
  try { await fn(); ko(label, 'aurait dû être refusé') }
  catch (e) { e?.code === 'permission-denied' ? ok(label) : ko(label, e) }
}

console.log(`Projet : ${process.env.VITE_FIREBASE_PROJECT_ID} — foyer : ${HID}`)
const { user } = await signInWithEmailAndPassword(auth, CHECK_EMAIL, CHECK_PASSWORD)
console.log(`Connecté : ${user.uid}`)

const created = []
await expectOk('lecture du foyer', async () => {
  const s = await getDoc(doc(db, 'households', HID))
  if (!s.exists()) throw new Error('households/' + HID + ' introuvable')
  if (s.data().members?.[user.uid] !== 'member') throw new Error('ton UID n\'est pas membre du foyer')
})
await expectOk('création document partagé (habits)', async () => {
  const r = await addDoc(collection(db, 'habits'), { hid: HID, ownerId: user.uid, visibility: 'household', name: '__check__' })
  created.push(r)
})
await expectOk('création document privé (habits)', async () => {
  const r = await addDoc(collection(db, 'habits'), { hid: HID, ownerId: user.uid, visibility: 'private', name: '__check__' })
  created.push(r)
})
await expectOk('liste "partagés" (hid + visibility)', async () => {
  const s = await getDocs(query(collection(db, 'habits'), where('hid', '==', HID), where('visibility', '==', 'household')))
  if (!s.docs.some((d) => d.data().name === '__check__')) throw new Error('document de test absent')
})
await expectOk('liste "à moi" (hid + ownerId)', async () => {
  const s = await getDocs(query(collection(db, 'habits'), where('hid', '==', HID), where('ownerId', '==', user.uid)))
  if (s.size < 2) throw new Error('attendu 2 documents de test, trouvé ' + s.size)
})
await expectDenied('journal partagé refusé', () =>
  addDoc(collection(db, 'journalEntries'), { hid: HID, ownerId: user.uid, visibility: 'household', text: '__check__' }))
await expectDenied('écriture au nom d\'un autre refusée', () =>
  addDoc(collection(db, 'habits'), { hid: HID, ownerId: 'autre-uid', visibility: 'household', name: '__check__' }))
await expectDenied('liste sans filtre hid refusée', () => getDocs(collection(db, 'habits')))
await expectDenied('écriture dans households refusée', () =>
  addDoc(collection(db, 'households'), { members: { [user.uid]: 'member' } }))

for (const r of created) await deleteDoc(r).catch((e) => ko('nettoyage', e))
console.log(failed ? `\n${failed} vérification(s) en échec` : '\nTout est OK')
process.exit(failed ? 1 : 0)
