# Module Habitudes

Habitudes de chacun et communes, séries, récaps, duel et objectifs.
Spécification : `docs/design/habitudes/README.md` ; planche :
`docs/design/prototypes/Habitudes.dc.html` (et le prototype du QG).

- `index.tsx` : page du module, carte « Aujourd'hui » de l'accueil, résumé.
- `screens/` : page et onglets Aujourd'hui, Séries, Objectifs.
- `parts/` : ligne d'habitude, carte de l'accueil, feuilles (fiche, création, catégories, séries).
- `logic.ts` : règles pures (séries avec règle « À deux » et joker, régularité,
  récaps, duel), testées dans `tests/unit/habitudes.test.ts`.
- `store.ts` : données Firestore (`habits`, `habitCategories`, `habitGoals`, `habitLogs`) via
  `src/lib/data/` ; `data/demo.ts` : démo (historique de coches généré), semée si `VITE_SEED_DEMO=true`.

À faire : modification et suppression d'une habitude, création d'un objectif, rappels.
