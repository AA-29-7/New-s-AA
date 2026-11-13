# Module Carnet de voyage

Préparer, vivre et garder en mémoire les voyages. Spécification :
`docs/design/carnet-de-voyage/README.md` ; prototype :
`docs/design/prototypes/Carnet de voyage.dc.html`.

- `index.tsx` : routes du module (`/carnet/*`), résumé pour l'accueil, navigation.
- `screens/` : Accueil, Nos voyages, Fiche voyage, Préparer, Étape, Discover, Sur place.
- `parts/` : feuille « Nouvelle dépense », photos, carnet, carte (Leaflet + OpenStreetMap).
- `logic.ts` : règles métier pures (qui doit quoi, budget, étapes, filtres), testées
  dans `tests/unit/carnet.test.ts`.
- `store.ts` : état gardé sur l'appareil (localStorage) ; photos en IndexedDB
  (`photoStore.ts`, 1280 px max en JPEG).
- `data/demo.ts` : données de démonstration du prototype.

À faire : brancher les collections Firestore `trips` et `tripPhotos` via
`src/lib/data/`, génération IA dans l'app, partage en lecture, convertisseur.
