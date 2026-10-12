import type { ComponentType } from 'react'
import { ModulePlaceholder } from '../shared/components/ModulePlaceholder'

export interface AppModule {
  id: string
  label: string
  icon: string
  /** Page du module ; remplacer le placeholder lorsque le module est livré. */
  component: ComponentType
}

const placeholder = (label: string, phase: string) => () => (
  <ModulePlaceholder label={label} phase={phase} />
)

export const modules: AppModule[] = [
  { id: 'habitudes', label: 'Habitudes', icon: '✅', component: placeholder('Habitudes', 'Phase 2') },
  { id: 'carnet', label: 'Carnet', icon: '🧭', component: placeholder('Carnet de voyage', 'Phase 2') },
  { id: 'journal', label: 'Journal', icon: '📓', component: placeholder('Journal', 'Phase 3') },
  { id: 'bobine', label: 'Bobine', icon: '🎞️', component: placeholder('Bobine de film', 'Phase 3') },
]
