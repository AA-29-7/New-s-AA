---
name: finir-session
description: Termine une session de travail sur New AA's — vérifications, revue de code si le travail est prêt pour préprod/main, commit et push de la branche courante uniquement.
disable-model-invocation: true
---

Tu exécutes le rituel de fin de session du projet New AA's. Suis ces
étapes dans l'ordre.

## 1. Garde-fou main
Si la branche courante (`git rev-parse --abbrev-ref HEAD`) est `main`,
**refuse et arrête-toi immédiatement** : rappelle qu'on ne travaille
jamais directement sur `main`.

## 2. Terminé ou point d'étape ?
Demande d'abord à l'utilisateur : le travail sur cette branche est-il
**terminé** (prêt à être proposé pour préprod) ou est-ce un **point
d'étape** (WIP, à reprendre plus tard, peut-être sur l'autre PC) ? Cette
réponse change le comportement des étapes 5 et 8 ci-dessous.

## 3. Branche cible
Détermine la branche cible de fusion : `main` si la branche courante est
`preprod`, sinon `preprod` (workflow à deux étages : branche perso →
préprod → main). Si `origin/preprod` n'existe pas encore, signale-le
simplement (pas une erreur bloquante — elle n'a peut-être pas encore été
créée).

## 4. Vérifications et changements
Cherche un `package.json` : si des scripts `build`/`lint`/`test` existent,
lance-les. S'il n'y en a pas encore (projet en Phase 0/1), dis-le
clairement plutôt que d'inventer une vérification.
Liste les fichiers changés (`git status`, `git diff --stat` par rapport à
la branche cible si elle existe, sinon par rapport au dernier commit).

## 5. Revue de code — uniquement si "terminé"
**Si l'étape 2 a répondu "terminé"** : invoque le skill `/code-review` sur
le diff entre la branche courante et la branche cible de l'étape 3.
Donne-lui en contexte, en plus des bugs classiques, ces règles du projet à
vérifier :
- cloisonnement des modules : aucun fichier d'un module dans
  `src/modules/` ne doit être touché en dehors de son propre dossier,
- aucun appel direct au SDK Firebase en dehors de `src/lib/data/`,
- confidentialité du Journal : tout `journalEntry` doit rester
  `ownerId` = auteur, `visibility: 'private'`, jamais partagé,
- aucun secret, clé ou fichier `.env` dans le diff.

Affiche le rapport avant de continuer. C'est un rapport informatif pour
éclairer la décision de l'utilisateur : il ne bloque rien automatiquement
et ne remplace pas la revue humaine faite en pull request.

**Si l'étape 2 a répondu "point d'étape"** : saute cette revue (pas
pertinente sur du travail inachevé) et dis-le explicitement dans le
récapitulatif final.

## 6. Commit et push — de la branche courante uniquement
Propose un message de commit (préfixé `WIP:` si c'est un point d'étape),
attends une confirmation explicite, puis :
```
git add ...
git commit -m "..."
git push -u origin <branche-courante>
```
**Jamais** `main`, **jamais** `preprod`, **jamais** une autre branche que
celle sur laquelle on travaille. Un point d'étape se pousse normalement,
pour ne rien perdre entre les deux PC.

## 7. Entrées docs/decisions.md à préparer
Si des décisions ont été prises pendant la session, prépare (affiche dans
le chat, prêt à copier-coller) les entrées à ajouter à
`docs/decisions.md` — date, décision, alternatives écartées, raison,
conséquences. **N'édite pas le fichier toi-même.** S'il n'y a pas eu de
décision notable (fréquent pour un point d'étape), dis-le simplement.

## 8. Rappel de pull request
**Si "terminé"** : rappelle (texte uniquement, aucune action) d'ouvrir une
pull request vers la branche cible (préprod ou main) et de la fusionner à
deux. **Si "point d'étape"** : pas de rappel de PR — confirme juste que la
branche est poussée et prête à être reprise.

## Interdictions
- Ne fusionne jamais, ne supprime jamais de branche.
- Ne pousse jamais directement vers `preprod` ou `main`.
- Ne déploie jamais.
