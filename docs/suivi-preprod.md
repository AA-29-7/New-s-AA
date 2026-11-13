# Suivi : préprod (https://new-aa-s-preprod.web.app) affiche une page vide

## Symptôme
Sur téléphone (Chrome Android, mode sombre), la page reste vide : même l'écran de connexion n'apparaît plus. Le déploiement GitHub Actions « Déployer la préprod » est vert.

## Déjà fait
- Déploiement automatique en place (`.github/workflows/deploy-preprod.yml`) : fusion dans `preprod` → site + règles Firestore.
- Dans la console Firebase, `households/foyer.people` mis en minuscules (`alex`, `antoine`).
- Correctif fusionné dans `preprod` (PR #13) : noms acceptés avec majuscules ou espaces, page d'erreur « Oups » au lieu d'un écran vide.
- Sur téléphone : navigation privée et effacement des données du site, sans effet.

## Hypothèses restantes
1. Une variable `VITE_FIREBASE_…` vide ou fausse dans GitHub (Settings → Secrets and variables → Actions → Variables). Le build ne la vérifie pas : le déploiement reste vert, mais Firebase refuse de démarrer et la page reste blanche.
2. Erreur au démarrage avant le rendu React : la page d'erreur ne peut alors pas s'afficher.

## Prochaine étape
Sur ordinateur, ouvrir le site dans Chrome, `Cmd + Option + J`, recharger, noter la **première ligne rouge** de la console.

## Restant à décider
- Fusionner `qg/bouton-widget` (bouton « + Ajouter un widget »). Chaque fusion dans `preprod` relance un déploiement.

## Limites côté assistant
- L'accès aux Actions GitHub est bloqué depuis la session : impossible de lire les variables ou de relancer le déploiement.
- Le site n'est pas accessible depuis la session (proxy) : pas de test de la page en direct.
