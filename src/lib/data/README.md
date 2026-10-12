# lib/data

Couche d'accès Firebase/Firestore (branche "data-layer").

- `firebase.ts` : init, cache persistant (hors connexion), émulateurs si `VITE_USE_EMULATORS=true`.
- `auth.ts` : `signIn`, `logOut`, `onUserChange`.
- `households.ts` : `getHousehold`, `roleOf`.
- `repo.ts` : `repo<T>(collection, { hid, uid })` → `list`, `subscribe`, `get`, `create`, `update`, `remove`.
  Les lectures filtrent toujours par `hid` + (`visibility == 'household'` ou `ownerId == uid`).
- `export.ts` : `exportAll`, `downloadJson` (export JSON, photos incluses).
- `types.ts` : `BaseDoc` (hid, ownerId, visibility) et noms de collections.

Chaque module définit son type de document (`extends BaseDoc`) et appelle
`repo<MonType>('nomCollection', scope)`. Le Journal doit créer avec
`visibility: 'private'` et `ownerId = uid`.

Config : copier `.env.example` en `.env.local` (jamais commité).
Règles de sécurité : `firestore.rules` à la racine.
