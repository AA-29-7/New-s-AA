# shared

Style commun, navigation et composants partagés entre les modules (branche "ui-shell").

- `styles/global.css` : thème (variables CSS, clair/sombre), mobile d'abord.
- `components/AppShell.tsx` : en-tête + navigation entre modules.
- `components/Home.tsx` : accueil avec une carte par module.
- `components/ModulePlaceholder.tsx` : page provisoire d'un module non livré.

Le registre des modules est dans `src/app/modules.tsx` : pour brancher un
module, remplacer son `component` par la page exportée depuis
`src/modules/<module>/`.
