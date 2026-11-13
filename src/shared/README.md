# shared

Style commun, coque et composants partagés entre les modules.
Référence : `docs/design/CHARTE_GRAPHIQUE.md` et `docs/design/le-qg/README.md`.

- `styles/tokens.css` : tous les tokens de la charte (couleurs, rayons,
  espacements, ombres), thème sombre `[data-theme='dark']`, couleurs de la
  personne connectée `[data-user]` → `--user-*` / `--other-*`.
- `styles/ui.css` : composants communs. `styles/shell.css` : coque, accueil, quête.
- `ui/` : Gommette (`Sticker`), case ronde, pastille de série, points
  d'appartenance, cadenas, segment, puce, feuille (`Sheet`), toast, progression.
- `person.tsx` : profil utilisé sur l'appareil (Alex / Antoine).
- `theme.tsx` : thème clair / sombre / automatique.
- `lib/localStore.ts` : état gardé sur l'appareil (en attendant Firestore).
- `quest/` : la quête du QG (règles pures, carte, pop-ups, page « Nos quêtes »).
- `components/AppShell.tsx` : barre latérale (bureau) et barre basse (mobile).
- `components/Home.tsx` : accueil.

Le registre des modules est dans `src/app/modules.tsx` : pour brancher un
module, remplacer son `component` par la page exportée depuis
`src/modules/<module>/`. Un module peut aussi fournir sa navigation interne
(`subnav`), le texte de sa carte d'accueil (`useSummary`) et une carte du jour
(`TodayCard`). La coque n'importe jamais le code d'un module directement.
