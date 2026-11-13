import { createContext, useContext, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { PINNED_MODULES, type AppModule } from '../../app/modules'
import { useDataError } from '../../lib/data'
import { nameOf, usePerson } from '../person'
import { useTheme } from '../theme'
import { Avatar, Lock, Sheet, Sticker, SyncStatus, cx } from '../ui'
import { ProfileSheet } from './ProfileSheet'

interface ShellContextValue {
  openProfile: () => void
}
const ShellContext = createContext<ShellContextValue>({ openProfile: () => {} })
export const useShell = () => useContext(ShellContext)

const navClass = ({ isActive }: { isActive: boolean }) => cx('nav__item', isActive && 'is-active')

/** Coque de l'app : barre latérale (bureau) ou barre basse flottante (mobile). */
export function AppShell({ modules }: { modules: AppModule[] }) {
  const { me } = usePerson()
  const { theme, setPref } = useTheme()
  const { pathname } = useLocation()
  const [profile, setProfile] = useState(false)
  const [all, setAll] = useState(false)
  const dataError = useDataError()
  const ctx = useMemo(() => ({ openProfile: () => setProfile(true) }), [])

  const active = modules.find((m) => pathname === `/${m.id}` || pathname.startsWith(`/${m.id}/`))
  const pinned = PINNED_MODULES.map((id) => modules.find((m) => m.id === id)).filter((m): m is AppModule => !!m)
  const subnav = active?.subnav

  return (
    <ShellContext.Provider value={ctx}>
      <div className="shell">
        <aside className="sidebar">
          <Link to="/" className="sidebar__brand">
            Le QG
          </Link>
          <nav className="sidebar__nav" aria-label="Modules">
            <NavLink to="/" end className={navClass}>
              <Sticker emoji="🏡" color="surface" size={30} />
              Accueil
            </NavLink>
            {modules.map((m) => (
              <div key={m.id}>
                <NavLink to={`/${m.id}`} className={navClass}>
                  <Sticker emoji={m.emoji} color={m.color} size={30} rotate={m.rotate} />
                  <span className="nav__label">{m.label}</span>
                  {m.private && <Lock />}
                </NavLink>
                {m.subnav && active?.id === m.id && (
                  <div className="sidebar__sub">
                    {m.subnav.map((s) => (
                      <NavLink
                        key={s.to}
                        to={`/${m.id}${s.to ? `/${s.to}` : ''}`}
                        end={!s.to}
                        className={({ isActive }) => cx('nav__sub', isActive && 'is-active')}
                      >
                        <span className="emoji" aria-hidden="true">
                          {s.emoji}
                        </span>
                        {s.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="sidebar__foot">
            <button
              type="button"
              className="nav__item"
              onClick={() => setPref(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sticker emoji={theme === 'dark' ? '☀️' : '🌙'} color="surface" size={30} />
              {theme === 'dark' ? 'Thème clair' : 'Thème sombre'}
            </button>
            <button type="button" className="sidebar__profile" onClick={() => setProfile(true)}>
              <Avatar person={me} />
              <span>
                <span className="sidebar__name">{nameOf(me)}</span>
                <SyncStatus />
              </span>
            </button>
          </div>
        </aside>

        <main className="shell__main">
          {dataError && (
            <p className="banner shell__banner" role="alert">
              {dataError}
            </p>
          )}
          <Outlet />
        </main>

        <div className="bottomnav-fade" aria-hidden="true" />
        {subnav && active ? (
          <nav className="bottomnav" aria-label={active.label}>
            {subnav.map((s) => (
              <NavLink
                key={s.to}
                to={`/${active.id}${s.to ? `/${s.to}` : ''}`}
                end={!s.to}
                className={({ isActive }) =>
                  cx('bottomnav__item', s.central && 'bottomnav__item--central', !s.to && 'bottomnav__item--home', isActive && 'is-active')
                }
              >
                <Sticker emoji={s.emoji} color={s.color} size={s.central ? 52 : 30} rotate={s.rotate} />
                <span className="bottomnav__label">{s.label}</span>
              </NavLink>
            ))}
          </nav>
        ) : (
          <nav className="bottomnav" aria-label="Navigation">
            <NavLink to="/" end className={({ isActive }) => cx('bottomnav__item bottomnav__item--home', isActive && 'is-active')}>
              <Sticker emoji="🏡" color="surface" size={30} />
              <span className="bottomnav__label">Accueil</span>
            </NavLink>
            {pinned.map((m) => (
              <NavLink key={m.id} to={`/${m.id}`} className={({ isActive }) => cx('bottomnav__item', isActive && 'is-active')}>
                <Sticker emoji={m.emoji} color={m.color} size={30} rotate={m.rotate} />
                <span className="bottomnav__label">{m.navLabel ?? m.label}</span>
              </NavLink>
            ))}
            <button
              type="button"
              className={cx('bottomnav__item', active && !pinned.includes(active) && 'is-active')}
              onClick={() => setAll(true)}
            >
              <Sticker emoji="···" color="neutral" size={30} />
              <span className="bottomnav__label">Tout</span>
            </button>
          </nav>
        )}
      </div>

      <Sheet open={all} onClose={() => setAll(false)} title="Tout le QG">
        <div>
          {modules.map((m, i) => (
            <Link key={m.id} to={`/${m.id}`} className={cx('row', i === 0 && 'row--first', 'all__row')} onClick={() => setAll(false)}>
              <Sticker emoji={m.emoji} color={m.color} size={40} rotate={m.rotate} />
              <span className="row__body">
                <span className="row__title">{m.label}</span>
              </span>
              {m.private && <Lock />}
              <span aria-hidden="true">›</span>
            </Link>
          ))}
          <button
            type="button"
            className="row all__row all__row--btn"
            onClick={() => {
              setAll(false)
              setProfile(true)
            }}
          >
            <Avatar person={me} size={40} />
            <span className="row__body">
              <span className="row__title">Mon profil</span>
              <span className="meta">Thème, profil, déconnexion</span>
            </span>
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </Sheet>
      <ProfileSheet open={profile} onClose={() => setProfile(false)} />
    </ShellContext.Provider>
  )
}
