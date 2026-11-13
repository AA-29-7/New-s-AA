# Module Carnet de voyage

Préparer, vivre et garder en mémoire les voyages. Spécification :
`docs/design/carnet-de-voyage/README.md` ; prototype :
`docs/design/prototypes/Carnet de voyage.dc.html`.

- `index.tsx` : routes du module (`/carnet/*`), résumé pour l'accueil, navigation.
- `screens/` : Accueil, Nos voyages, Fiche voyage, Préparer, Étape, Discover, Sur place.
- `parts/` : feuille « Nouvelle dépense », photos, carnet, carte (Leaflet + OpenStreetMap).
- `logic.ts` : règles métier pures (qui doit quoi, budget, étapes, filtres), testées
  dans `tests/unit/carnet.test.ts`.
- `store.ts` : données Firestore (`trips`, `tripExpenses`, `tripNotes`, `tripPhotos`, `tripPreps`,
  `userPrefs` privé) via les hooks de `src/lib/data/` ; fournisseur unique `CarnetProvider`.
  `docs.ts` : types de documents et conversions pures (Firestore refuse les tableaux imbriqués).
  `imageResize.ts` : photos redimensionnées à 1280 px max en JPEG, < 1 Mo, stockées dans `tripPhotos`.
- `data/demo.ts` : données de démonstration du prototype, semées dans Firestore si `VITE_SEED_DEMO=true`.

À faire : création / modification d'un voyage, import de l'Excel, génération IA dans l'app,
partage en lecture, convertisseur.
