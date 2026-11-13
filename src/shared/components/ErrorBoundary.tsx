import { Component, type ErrorInfo, type ReactNode } from 'react'

/** Évite l'écran vide : une erreur d'affichage montre un message et un bouton pour recharger. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erreur d’affichage', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <main className="auth">
        <h1 className="auth__title">Oups</h1>
        <p className="muted">Quelque chose s'est mal passé à l'affichage. Recharge la page ; si ça continue, envoie ce message :</p>
        <code className="auth__uid">{this.state.error.message}</code>
        <button className="btn btn--primary btn--block" onClick={() => location.reload()}>
          Recharger
        </button>
      </main>
    )
  }
}
