import { Link } from 'react-router-dom'
import type { AppModule } from '../../app/modules'

export function Home({ modules }: { modules: AppModule[] }) {
  return (
    <>
      <h1>Bonjour 👋</h1>
      <p className="muted">Que voulez-vous faire aujourd'hui ?</p>
      <div className="grid">
        {modules.map((m) => (
          <Link key={m.id} to={`/${m.id}`} className="card">
            <span className="card__icon" aria-hidden="true">{m.icon}</span>
            <span className="card__title">{m.label}</span>
          </Link>
        ))}
      </div>
    </>
  )
}
