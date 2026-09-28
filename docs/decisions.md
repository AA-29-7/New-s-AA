## 2026-09-27 — Backend : Firebase, offre Spark
- Décision : Firebase (Authentication + Firestore), offre gratuite Spark.
- Écarté : alternative Postgres envisagée (500 Mo–1 Go contre 1 Go Firestore) ;
  autres backends gratuits avec mise en pause pour inactivité.
- Raison : espace disponible, pas de keep-alive à maintenir.

## 2026-09-27 — Pas de Cloud Storage : photos dans Firestore
- Décision : pas de Cloud Storage for Firebase. Photos redimensionnées côté
  client (1280 px max, JPEG) et stockées directement dans les documents
  Firestore de la collection tripPhotos (< 1 Mo par photo).
- Écarté : Cloud Storage sur offre Blaze (carte bancaire obligatoire depuis
  le 03/02/2026, dépenses non plafonnées) ; hébergeurs d'images tiers.
- Raison : Cloud Storage n'est plus accessible sur l'offre gratuite Spark
  depuis février 2026. Volume faible attendu (< 20 photos par voyage).
- Conséquences : capacité estimée à ~3000 photos sur le 1 Go Firestore
  (à vérifier en usage réel). Les photos sont incluses dans l'export JSON.

## 2026-09-27 — Front et hébergement
- Décision : React + Vite + TypeScript. PWA (app installable) via
  vite-plugin-pwa. Hébergement sur Firebase Hosting (adresse *.web.app).
- Écarté : Next.js (fonctions serveur inutiles ici) ; GitHub Pages
  (contournements nécessaires pour le routage et le domaine d'authentification).
- Conséquences : pas de nom de domaine personnalisé pour l'instant (budget 0).

## 2026-09-27 — Clé API TMDb
- Décision : clé TMDb dans le code front, injectée via variable d'environnement
  au moment du build (.env.local, jamais commitée).
- Écarté : passage par une Cloud Function (exige l'offre payante Blaze).
- Raison : clé en lecture seule sur des données publiques de films, usage privé.

## 2026-09-27 — Structure des données Firestore
- Décision : une collection par module (habits, habitLogs, journalEntries,
  trips, tripPhotos, films, filmRatings). Chaque document porte :
  - hid : identifiant de l'espace couple
  - ownerId : uid du propriétaire, ou null si commun
  - visibility : 'private' ou 'household'
  Collection households/{hid} avec members: { uid: 'member' | 'viewer' }.
- Écarté : sous-collections par utilisateur (rendent coûteux le partage et
  la visibilité croisée entre les deux personnes).
- Conséquences : les requêtes filtrent toujours par hid + visibility (les
  règles de sécurité ne filtrent pas les listes, seulement les accès directs).
  Le rôle 'viewer' est prévu dans le schéma dès maintenant mais n'est pas
  encore activé dans les règles (accès en lecture à des tiers, à activer plus tard).
  Firestore configuré avec le cache persistant pour fonctionner hors connexion.

## 2026-09-27 — Journal : strictement privé
- Décision : les entrées du Journal ne sont jamais partagées entre les deux
  personnes, y compris a posteriori. Un journalEntry est toujours
  ownerId = auteur, visibility = 'private'.

## 2026-09-27 — Ordre de construction et méthode de travail
- Décision : Phase 0 (préparation, ce prompt) → Phase 1 (socle, en 2 branches
  parallèles : "data-layer" pour Firebase/auth/lib-data/export JSON,
  "ui-shell" pour le style commun/navigation/PWA) → Phase 2 : Carnet de
  voyage ET Habitudes en parallèle (un module par personne) → Phase 3 :
  Journal ET Bobine en parallèle.
- Deux projets Firebase distincts : un projet "dev" pour les tests, un projet
  "prod" pour les données réelles.
- Règles de travail à 2 branches : jamais de commit direct sur main ;
  récupérer main en début de session ; fusionner les branches ensemble en
  fin de session ; déploiement en production uniquement depuis main, par
  une seule personne à la fois.
- Reprise de données : import unique d'un fichier Excel existant pour le
  Carnet de voyage (sera fourni). Pour la Bobine, reprise des seuls
  identifiants IMDb d'une liste existante, enrichis ensuite via l'API TMDb
  (endpoint /find). Journal et Habitudes repartent de zéro.

## 2026-09-28 — Automatisation de session en lecture seule
- Décision : hook SessionStart en lecture seule + CLAUDE.md + skills
  /demarrer-session et /finir-session. Fusion via pull request sur GitHub.
- Écarté : création automatique de branche, fusion et déploiement
  automatiques.
- Raison : deux personnes travaillent en parallèle, une erreur
  automatique toucherait main ou les données de production.
- Conséquences : la branche est créée après confirmation, la fin de
  session est déclenchée à la main.

## 2026-09-28 — Fusion à deux étages avec revue de code obligatoire
- Décision : workflow de fusion à deux étages, branche perso → préprod
  (branche unifiée de test) → main (prod). Revue de code complète via
  /code-review, intégrée au skill /finir-session, avant toute fusion vers
  préprod et avant toute fusion préprod → main.
- Écarté : fusion directe branche perso → main ; skill de revue dédié au
  projet plutôt que réutilisation de /code-review.
- Raison : détecter les régressions et effets de bord avant qu'ils
  n'atteignent la production, sans dupliquer un outil de revue déjà
  disponible.
- Conséquences : la branche préprod reste à créer (hors de ce lot) avant
  que /finir-session puisse comparer les diffs dessus. La revue reste un
  rapport informatif : elle n'exécute ni ne bloque aucune fusion, la
  décision humaine finale se prend en pull request.
