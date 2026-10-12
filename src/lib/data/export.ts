import { COLLECTIONS, type CollectionName } from './types'
import { repo, type Scope } from './repo'

export interface ExportFile {
  version: 1
  exportedAt: string
  hid: string
  uid: string
  collections: Record<CollectionName, unknown[]>
}

/**
 * Export JSON de tout ce que l'utilisateur peut lire (documents communs + les siens),
 * photos des voyages incluses (stockées dans la collection tripPhotos).
 */
export async function exportAll(scope: Scope): Promise<ExportFile> {
  const entries = await Promise.all(
    COLLECTIONS.map(async (name) => [name, await repo(name, scope).list()] as const),
  )
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    hid: scope.hid,
    uid: scope.uid,
    collections: Object.fromEntries(entries) as ExportFile['collections'],
  }
}

export function downloadJson(data: ExportFile, filename = `new-aas-export-${data.exportedAt.slice(0, 10)}.json`) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
