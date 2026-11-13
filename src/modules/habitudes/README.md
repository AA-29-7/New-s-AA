# Module Habitudes

Habitudes de chacun et communes, séries, récaps, duel et objectifs.
Spécification : `docs/design/habitudes/README.md` ; planche :
`docs/design/prototypes/Habitudes.dc.html` (et le prototype du QG).

- `index.tsx` : page du module, carte « Aujourd'hui » de l'accueil, résumé.
- `screens/` : page et onglets Aujourd'hui, Séries, Objectifs.
- `parts/` : ligne d'habitude, carte de l'accueil, feuilles (fiche, création, catégories, séries).
- `logic.ts` : règles pures (séries avec règle « À deux » et joker, régularité,
  récaps, duel), testées dans `tests/unit/habitudes.test.ts`.
- `store.ts` : état gardé sur l'appareil ; `data/demo.ts` : données de démonstration
  avec un historique de coches généré.

À faire : brancher `habits` / `habitLogs` (Firestore) via `src/lib/data/`,
modification et suppression d'une habitude, création d'un objectif, rappels.
