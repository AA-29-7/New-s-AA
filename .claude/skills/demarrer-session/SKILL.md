---
name: demarrer-session
description: Démarre une session de travail sur New AA's — fait le point git puis prépare (avec confirmation) une branche pour un module.
disable-model-invocation: true
---

Tu exécutes le rituel de démarrage de session du projet New AA's. Suis ces
étapes dans l'ordre, sans rien faire d'autre.

## 1. État git
Lance `git fetch`, puis affiche :
- la branche courante,
- le nombre de commits de retard de la branche courante sur `origin/main`
  (`git rev-list --count HEAD..origin/main`),
- s'il y a des modifications non enregistrées (`git status --porcelain`).

Vérifie aussi que `origin/preprod` existe (`git rev-parse --verify origin/preprod`
en lecture seule). Si elle n'existe pas, arrête-toi à cette étape et
préviens l'utilisateur : la branche cible des branches perso, `preprod`,
n'a pas encore été créée.

## 2. Module et prénom
Demande sur quel module l'utilisateur travaille aujourd'hui — propose ces
choix (via AskUserQuestion) : `habitudes`, `carnet`, `journal`, `bobine`,
`data-layer`, `ui-shell`, ou autre chose en texte libre. Demande aussi son
prénom (question simple, texte libre).

## 3. Proposer la branche — avec confirmation obligatoire
Propose le nom `<module>/<prenom>-<AAAA-MM-JJ>` (date du jour). **N'exécute
rien avant confirmation explicite de l'utilisateur.**

Une fois confirmé, crée la branche à partir de la dernière version de
`origin/preprod` (branche d'intégration, cible du workflow à deux étages
— voir CLAUDE.md) :
```
git checkout -b <module>/<prenom>-<AAAA-MM-JJ> origin/preprod
```
Si la commande échoue (par exemple des modifications locales non
enregistrées qui entrent en conflit), **arrête-toi et informe
l'utilisateur** — jamais de `git stash` ni de forçage automatique.

## 4. Résumé du module depuis docs/decisions.md
Lis `docs/decisions.md` et résume en 3 lignes maximum ce qui concerne le
module choisi (décisions déjà prises qui l'impactent).

## Interdictions
- Ne fais rien d'autre que les 4 étapes ci-dessus.
- Aucun commit, aucun push.
- Ne touche à aucune branche autre que celle créée à l'étape 3.
