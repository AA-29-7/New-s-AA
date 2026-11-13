import type { ComponentType } from 'react'
import { CARNET_NAV, CarnetModule, useCarnetSummary } from '../modules/carnet'
import { HabitsModule, HabitsTodayCard, useHabitsSummary } from '../modules/habitudes'
import { ComingSoon, type StickerColor } from '../shared/ui'

/** Entrée de navigation interne à un module (barre basse mobile, barre latérale bureau). */
export interface ModuleNavItem {
  /** Chemin relatif au module ('' = accueil du module). */
  to: string
  label: string
  emoji: string
  color: StickerColor
  rotate?: number
  /** Bouton central rond qui dépasse de la barre basse. */
  central?: boolean
}

export interface ModuleSummary {
  title: string
  note?: string
}

/**
 * Un module = une gommette (fond + émoji) + un nom + une carte sur l'accueil.
 * Le registre est le seul point de contact entre la coque et les modules :
 * l'accueil n'importe jamais le code d'un module directement.
 */
export interface AppModule {
  id: string
  label: string
  /** Libellé court pour la barre basse mobile. */
  navLabel?: string
  emoji: string
  color: StickerColor
  rotate: number
  /** Page du module ; remplacer l'écran « bientôt » lorsque le module est livré. */
  component: ComponentType
  /** Module privé : signalé par un cadenas (Journal). */
  private?: boolean
  /** Texte de la carte du module sur l'accueil. */
  summary: ModuleSummary
  /** Variante dynamique de `summary`, fournie par le module (hook React). */
  useSummary?: () => ModuleSummary
  /** Navigation interne du module. */
  subnav?: ModuleNavItem[]
  /** Carte du jour affichée sur l'accueil (remplace la carte du module). */
  TodayCard?: ComponentType
}

const soon = (emoji: string, color: StickerColor, title: string) => () => (
  <ComingSoon emoji={emoji} color={color} title={title} />
)

export const modules: AppModule[] = [
  {
    id: 'habitudes',
    label: 'Habitudes',
    emoji: '💪',
    color: 'sage',
    rotate: -6,
    component: HabitsModule,
    summary: { title: 'Habitudes' },
    useSummary: useHabitsSummary,
    TodayCard: HabitsTodayCard,
  },
  {
    id: 'carnet',
    label: 'Carnet de voyage',
    navLabel: 'Voyages',
    emoji: '🌍',
    color: 'honey',
    rotate: 4,
    component: CarnetModule,
    summary: { title: 'Carnet de voyage' },
    useSummary: useCarnetSummary,
    subnav: [...CARNET_NAV],
  },
  {
    id: 'journal',
    label: 'Journal',
    emoji: '🌙',
    color: 'lavender',
    rotate: -3,
    private: true,
    component: soon('🌙', 'lavender', 'Journal'),
    summary: { title: 'Pas encore écrit' },
  },
  {
    id: 'bobine',
    label: 'Bobine',
    emoji: '🎬',
    color: 'coral',
    rotate: 6,
    component: soon('🎬', 'coral', 'Bobine'),
    summary: { title: 'Lancer la roue', note: 'Bientôt' },
  },
]

/** Modules épinglés dans la barre basse mobile (les autres sont sous « Tout »). */
export const PINNED_MODULES = ['habitudes', 'carnet', 'journal']
