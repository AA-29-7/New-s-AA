import { useEffect, useState } from 'react'

/**
 * Photos du Carnet gardées sur l'appareil (IndexedDB), redimensionnées à
 * 1280 px max en JPEG — même format que la future collection `tripPhotos`
 * (voir docs/decisions.md : pas de Cloud Storage, < 1 Mo par photo).
 */
const DB = 'qg_carnet_photos'
const STORE = 'photos'
const MAX_SIDE = 1280

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

const cache = new Map<string, string>()

export async function loadPhoto(id: string): Promise<string | undefined> {
  if (cache.has(id)) return cache.get(id)
  const url = await run<string | undefined>('readonly', (s) => s.get(id))
  if (url) cache.set(id, url)
  return url
}

export async function deletePhoto(id: string) {
  cache.delete(id)
  await run('readwrite', (s) => s.delete(id))
}

function resize(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image illisible'))
    }
    img.src = url
  })
}

/** Redimensionne et enregistre une image ; renvoie son identifiant. */
export async function savePhoto(file: File): Promise<string> {
  const data = await resize(file)
  const id = `p${Date.now()}${Math.random().toString(36).slice(2, 7)}`
  await run('readwrite', (s) => s.put(data, id))
  cache.set(id, data)
  return id
}

/** URL (data:) d'une photo enregistrée, chargée à la demande. */
export function usePhoto(id: string | undefined): string | undefined {
  const [url, setUrl] = useState(() => (id ? cache.get(id) : undefined))
  useEffect(() => {
    let alive = true
    setUrl(id ? cache.get(id) : undefined)
    if (id && !cache.has(id)) {
      loadPhoto(id)
        .then((u) => alive && setUrl(u))
        .catch(() => {})
    }
    return () => {
      alive = false
    }
  }, [id])
  return url
}
