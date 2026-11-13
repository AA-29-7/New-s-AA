# lib/data

Couche d'accès Firebase/Firestore (branche "data-layer").

- `firebase.ts` : init, cache persistant (hors connexion), émulateurs si `VITE_USE_EMULATORS=true`.
- `auth.ts` : `signIn`, `logOut`, `onUserChange`.
- `households.ts` : `getHousehold`, `roleOf`.
- `repo.ts` : `repo<T>(collection, { hid, uid })` → `list`, `subscribe`, `get`, `create`, `update`, `upsert` (id choisi, idempotent), `arrayToggle` (ajoute/retire une valeur d'un tableau sans lecture), `remove`.
- `hooks.ts` : `useCollection<T>(name, { eq })` (temps réel + `loading`) et `useRepo<T>(name)` pour les écritures. Un document en attente d'envoi porte `pending: true`.
- `session.tsx` : `usePeople()` → personne connectée (`alex` | `antoine`) d'après `households/<id>.people`, à saisir à la main dans la console.
  Les lectures filtrent toujours par `hid` + (`visibility == 'household'` ou `ownerId == uid`).
- `export.ts` : `exportAll`, `downloadJson` (export JSON, photos incluses).
- `types.ts` : `BaseDoc` (hid, ownerId, visibility) et noms de collections.

Règles d'écriture : un document avec `ownerId` n'est modifiable que par son propriétaire ; un document commun (`ownerId: null`) par les deux membres. `userPrefs` est toujours privé.

Chaque module définit son type de document (`extends BaseDoc`) et appelle
`repo<MonType>('nomCollection', scope)`. Le Journal doit créer avec
`visibility: 'private'` et `ownerId = uid`.

Config : copier `.env.example` en `.env.local` (jamais commité).
Règles de sécurité : `firestore.rules` à la racine.
