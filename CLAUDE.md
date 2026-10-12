# New AA's — règles permanentes

- Lis `docs/decisions.md` avant de commencer toute tâche.
- Jamais de commit ni de push direct sur `main`.
- Un module = un dossier dans `src/modules/` ; ne touche à aucun autre module.
- Aucun appel direct au SDK Firebase en dehors de `src/lib/data/`.
- Le Journal est strictement privé : `ownerId` = auteur, `visibility: 'private'`, jamais partagé.
- Jamais de secret, de clé ou de fichier `.env` commité.
- Ne fusionne, ne supprime de branche et ne déploie jamais sans que ce soit demandé explicitement dans le message en cours.
- Workflow de fusion à deux étages : branche perso → `preprod` (revue de code via `/finir-session`) → `main`. Jamais directement vers `main`.
- OS : Mac pour l'un des deux (à compléter pour l'autre). Scripts en Node.js (.mjs), portables quel que soit l'OS.
