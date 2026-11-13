/**
 * Redimensionne une image à 1280 px max en JPEG (data URL), en baissant la qualité
 * puis la taille jusqu'à rester sous 900 000 caractères : un document Firestore
 * est limité à 1 Mo (voir docs/decisions.md : pas de Cloud Storage).
 */
const MAX_SIDE = 1280
const MAX_CHARS = 900_000

export function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      let scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height))
      for (let attempt = 0; attempt < 6; attempt++) {
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))
        canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
        for (const quality of [0.82, 0.7, 0.55]) {
          const data = canvas.toDataURL('image/jpeg', quality)
          if (data.length <= MAX_CHARS) return resolve(data)
        }
        scale *= 0.8
      }
      reject(new Error('Image trop lourde'))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image illisible'))
    }
    img.src = url
  })
}
