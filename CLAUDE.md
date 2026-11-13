# Le QG — règles permanentes

- Lis `docs/decisions.md` avant de commencer toute tâche.
- Jamais de commit ni de push direct sur `main`.
- Un module = un dossier dans `src/modules/` ; ne touche à aucun autre module.
- Aucun appel direct au SDK Firebase en dehors de `src/lib/data/`.
- Le Journal est strictement privé : `ownerId` = auteur, `visibility: 'private'`, jamais partagé.
- Jamais de secret, de clé ou de fichier `.env` commité.
- Ne fusionne, ne supprime de branche et ne déploie jamais sans que ce soit demandé explicitement dans le message en cours.
- Workflow de fusion à deux étages : branche perso → `preprod` (revue de code via `/finir-session`) → `main`. Jamais directement vers `main`.
- OS : Mac pour les deux. Scripts en Node.js (.mjs), portables quel que soit l'OS.
- Respecter `docs/design/CHARTE_GRAPHIQUE.md` pour tout le style. Ne jamais écrire de couleur, rayon ou espacement en dur : utiliser les tokens CSS (`--color-*`, `--radius-*`, `--space-*`, définis dans `src/shared/styles/tokens.css`). Les dossiers `docs/design/*/` contiennent les références de design (README.md = spécification).
