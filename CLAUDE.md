# Le QG

Application web installable (PWA), privée, pour deux personnes : Alex et Antoine.
Le nom de l'app est **Le QG** (ancien nom de travail : « New AA's »).

Respecter CHARTE_GRAPHIQUE.md pour tout le style. Ne jamais écrire de couleur, rayon ou espacement en dur : utiliser les tokens CSS (--color-*, --radius-*, --space-*).

- Les tokens sont dans `src/shared/styles/tokens.css` (extraits de la charte, §2). En cas d'écart, la charte fait foi : mettre à jour les deux ensemble.
- Interface en français, tutoiement. Libellés fixes et ton : charte §14.
- Les composants utilisent `--user-*` / `--other-*`, pas `--alex-*` / `--antoine-*` (sauf commun et duel).
- Le Journal est strictement privé (voir `docs/decisions.md`).
- Décisions techniques : `docs/decisions.md`.
