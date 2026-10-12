import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { Household, MemberRole } from './types'

export async function getHousehold(hid: string): Promise<Household | null> {
  const snap = await getDoc(doc(db, 'households', hid))
  return snap.exists() ? (snap.data() as Household) : null
}

export function roleOf(household: Household, uid: string): MemberRole | null {
  return household.members[uid] ?? null
}
