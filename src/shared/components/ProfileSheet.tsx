import { Link } from 'react-router-dom'
import { logOut } from '../../lib/data'
import { PEOPLE, PERSONS, nameOf, usePerson, type Person } from '../person'
import { THEME_OPTIONS, useTheme } from '../theme'
import { Avatar, Segment, Sheet, SyncStatus } from '../ui'

/** Profil : thème de l'appareil, profil utilisé, accès aux quêtes, déconnexion. */
export function ProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { me, setMe } = usePerson()
  const { pref, setPref } = useTheme()

  return (
    <Sheet open={open} onClose={onClose} title="Mon profil">
      <div className="profile__id">
        <Avatar person={me} size={56} />
        <div>
          <div className="profile__name">{nameOf(me)}</div>
          <SyncStatus />
        </div>
      </div>

      <div className="stack stack--sm">
        <div className="eyebrow">Thème</div>
        <Segment options={THEME_OPTIONS} value={pref} onChange={setPref} label="Thème" />
        <p className="meta">« Auto » suit le réglage clair ou sombre de l'appareil.</p>
      </div>

      <div className="stack stack--sm">
        <div className="eyebrow">Profil sur cet appareil</div>
        <Segment<Person>
          options={PERSONS.map((p) => ({ value: p, label: PEOPLE[p].name }))}
          value={me}
          onChange={setMe}
          label="Profil"
        />
      </div>

      <Link to="/quetes" className="btn btn--secondary btn--block" onClick={onClose}>
        🏁 Nos quêtes
      </Link>
      <button
        type="button"
        className="btn btn--danger btn--block"
        onClick={() => {
          onClose()
          void logOut()
        }}
      >
        Se déconnecter
      </button>
    </Sheet>
  )
}
