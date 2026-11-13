import { Link } from 'react-router-dom'
import type { AppModule } from '../../app/modules'
import { CRYPTO, QUOTES } from '../home/content'
import { FunFactCard } from '../home/FunFact'
import { dayIndex, longDate } from '../lib/dates'
import { nameOf, usePerson } from '../person'
import { QuestCard } from '../quest/QuestCard'
import { Avatar, Lock, Sticker, useOnline } from '../ui'
import { useShell } from './AppShell'

/** Ligne d'info sous la salutation : citation du jour (Alex) ou cours crypto (Antoine). */
function InfoLine() {
  const { me } = usePerson()
  if (me === 'alex') {
    const [text, author] = QUOTES[dayIndex() % QUOTES.length]
    return (
      <p className="home__info">
        « {text} » {author}
      </p>
    )
  }
  return (
    <p className="home__info">
      {CRYPTO.quotes.map((q) => (
        <span key={q.symbol} className="home__quote">
          {q.symbol} {q.price}{' '}
          <span className={q.up ? 'gain' : 'loss'}>
            {q.up ? '▲' : '▼'} {q.change}
          </span>
          <span aria-hidden="true"> · </span>
        </span>
      ))}
      <span className="home__quote">mis à jour {CRYPTO.updatedAt}</span>
    </p>
  )
}

function ModuleTile({ module: m }: { module: AppModule }) {
  const useSummary = m.useSummary ?? (() => m.summary)
  const summary = useSummary()
  return (
    <Link to={`/${m.id}`} className="card card--md card--click tile">
      <span className="tile__top">
        <Sticker emoji={m.emoji} color={m.color} size={40} rotate={m.rotate} />
        {m.private && <Lock />}
      </span>
      <span>
        <span className="tile__label">
          {m.label}
          {m.private ? ' · privé' : ''}
        </span>
        <span className="tile__title">{summary.title}</span>
        {summary.note && <span className="meta tile__note">{summary.note}</span>}
      </span>
    </Link>
  )
}

export function Home({ modules }: { modules: AppModule[] }) {
  const { me } = usePerson()
  const { openProfile } = useShell()
  const online = useOnline()
  const today = modules.filter((m) => m.TodayCard)
  const tiles = modules.filter((m) => !m.TodayCard)

  return (
    <div className="page home">
      <header className="page__head home__head">
        <div>
          <div className="eyebrow">{longDate()}</div>
          <h1 className="home__hello">
            Bonjour <span className="home__name">{nameOf(me)}</span>
          </h1>
        </div>
        <button type="button" className="home__profile" onClick={openProfile} aria-label="Ouvrir mon profil">
          <Avatar person={me} />
        </button>
      </header>
      <div className="page__head">
        <InfoLine />
      </div>
      {!online && (
        <p className="banner" role="status">
          Tes coches sont gardées sur le téléphone. Elles partiront au retour du réseau.
        </p>
      )}
      <div className="grid-auto">
        <div className="stack">
          <QuestCard />
          {today.map((m) => {
            const Card = m.TodayCard!
            return <Card key={m.id} />
          })}
        </div>
        <div className="stack">
          <div className="home__tiles">
            {tiles.map((m) => (
              <ModuleTile key={m.id} module={m} />
            ))}
          </div>
          <FunFactCard />
        </div>
      </div>
    </div>
  )
}
