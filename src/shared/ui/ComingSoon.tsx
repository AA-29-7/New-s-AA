import { Link } from 'react-router-dom'
import { Sticker, type StickerColor } from './basics'

/** Écran d'un module pas encore dessiné. */
export function ComingSoon({ emoji, color, title }: { emoji: string; color: StickerColor; title: string }) {
  return (
    <div className="empty">
      <Sticker emoji={emoji} color={color} size={96} rotate={-6} />
      <h1 className="empty__title">{title}</h1>
      <p className="empty__text">Cet écran n'est pas encore dessiné. Il arrive dans une prochaine étape.</p>
      <Link to="/" className="btn btn--primary">
        Retour à l'accueil
      </Link>
    </div>
  )
}
