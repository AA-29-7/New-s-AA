import { NavLink, Outlet } from 'react-router-dom'
import type { AppModule } from '../../app/modules'

export function AppShell({ modules }: { modules: AppModule[] }) {
  return (
    <div className="shell">
      <header className="shell__header">
        <NavLink to="/" className="shell__brand">New AA's</NavLink>
      </header>
      <main className="shell__main">
        <Outlet />
      </main>
      <nav className="shell__nav" aria-label="Modules">
        {modules.map((m) => (
          <NavLink key={m.id} to={`/${m.id}`} className="shell__link">
            <span aria-hidden="true">{m.icon}</span>
            <span>{m.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
