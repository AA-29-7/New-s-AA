import { db } from './firebase'
import { makeRepo } from './repo-core'

export type { Scope } from './repo-core'
export const repo = makeRepo(db)
