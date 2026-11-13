# Handoff : Habitudes (module du QG)

## Overview
Module **Habitudes** de l'app **Le QG** (PWA privée pour **Alex** et **Antoine**). Chacun suit ses habitudes, celles qui sont communes, et peut voir celles de l'autre en lecture seule. Trois onglets : **Aujourd'hui**, **Séries** (régularité, récap, duel) et **Objectifs**. Les habitudes se rangent par **catégories** communes aux deux personnes.

Le dossier `design_handoff_le_qg` décrit la coque de l'app (navigation, thème, quête du QG). Ce dossier se concentre sur le module.

Langue : français, tutoiement. Mobile d'abord (360 px), puis bureau (1240 px).

## About the Design Files
Les fichiers sont des **références de design en HTML** : des prototypes qui montrent l'aspect et le comportement voulus, pas du code de production. Recréer l'interface dans l'environnement du projet cible avec ses conventions. Si aucun environnement n'existe, choisir le plus adapté à une PWA installable et hors ligne.

- `Le QG - Prototype.dc.html` : prototype interactif complet des Habitudes (les 3 onglets, la fiche, les catégories, la création). Ouvrir avec `support.js`. Les boutons du haut basculent mobile / ordinateur et Alex / Antoine. **C'est la référence principale.**
- `Habitudes.dc.html` : planche d'exploration (canvas) : 1 = première base, 2 = gommettes et catégories, 3 = récap semaine et année, 4 = vue d'Antoine, 5 = mode duel. À consulter pour les variantes et l'écran vu par Antoine.
- `CHARTE_GRAPHIQUE.md` : source de vérité du style. **Elle prime** en cas de doute. Ne jamais écrire de couleur, rayon ou espacement en dur : utiliser les variables CSS.

## Fidelity
**Haute fidélité** : couleurs, typographie, rayons, ombres et interactions sont finaux. Le prototype écrit les couleurs en dur : les remplacer par les tokens de la charte (`--color-*`, `--user-*`, `--other-*`, `--radius-*`, `--shadow-*`).

À dessiner (non fait) : états vides (aucune habitude, aucune catégorie), chargement, erreur, modification et suppression d'une habitude, réordonner les catégories (poignée « ⋮⋮ » déjà présente mais inactive), création d'un objectif, rappel (réglage de l'heure : le prototype affiche « Chaque jour à 7 h 30 » en dur), mode sombre.

## Concepts

### Appartenance (charte §7)
Trois groupes dans la vue « Par qui », dans cet ordre :
1. **À moi** : carte pleine, « Visible par {l'autre} ». Point plein de la couleur de la personne.
2. **Communes** : carte pleine, « Chacun coche la sienne ». Deux points qui se chevauchent (−3 px).
3. **Chez {l'autre}** : carte en lecture seule (fond `rgba(249,242,234,.55)`, sans ombre), « Lecture seule », coches à 75 % d'opacité, non cliquables.

Une habitude a un propriétaire : `alex`, `antoine` ou `both`. Seul le propriétaire coche une habitude personnelle. Une habitude commune est cochée par chacun de son côté.

### Série (streak)
Nombre de jours consécutifs où l'habitude est faite. Pastille « 🔥 12 j » (fond `--color-streak-bg #f6dfc6`, texte `--color-streak-ink #8a4a12`, hauteur 24, rayon 12, 12/800, `white-space: nowrap`). La série affichée inclut la coche du jour (`s + 1` si cochée).
Règle d'une habitude commune : **« À deux »** (la série continue seulement si les deux l'ont faite dans la journée ; si l'un oublie, elle repart de zéro pour les deux) ou **« Chacun la sienne »**. **Joker hebdomadaire** : un oubli par semaine ne casse pas la série.

### Catégories
Communes aux deux personnes. Une catégorie = nom + émoji + couleur de fond (palette de 8). Toutes ses habitudes prennent le fond de la catégorie et gardent leur propre émoji. Une habitude peut avoir un fond à part (« couleur à part ») si elle n'a pas de catégorie. Catégories du prototype : Bien-être 🧘 `#d3dcc3`, Sport 🏃 `#ecb8b0`, Apprendre 📖 `#f0d9a8`, Maison 🧹 `#d5dde8`, plus « Sans catégorie » 📌 `#e0d0bf`.

## Screens

### En-tête de la page
- Repère « JEUDI 12 NOVEMBRE », titre « Habitudes » (32/800, −0,02 em).
- À droite : bouton « + Nouvelle habitude » (bureau seulement, pill 44 px, fond `--user-base`, texte blanc 14/800), phrase d'avancement (14, `--color-ink-soft`, alignée à droite, max 120 px) et **anneau conique** 46 px (piste `#e6d6c4`, progression `--user-base`, centre `#ecdfd1` avec « n / total » 11/800).
- Phrase : « Encore n à cocher » → « Plus qu'une habitude » → « Journée bouclée, bravo ».
- Sur mobile, le bouton flottant « + » (56×56, rond `--user-base`, 28 px, droite 20, bas 104, ombre `0 8px 18px rgba(60,40,30,.3)`) remplace le bouton.
- **Segment** des 3 onglets (conteneur `--color-chip`, rayon 22, padding 4 ; actif `--color-surface`, 14/800 ; hauteur 40 ; largeur max 460).

### 1. Onglet Aujourd'hui
Barre d'outils : segment **Par qui / Par thème** (rayon 18, hauteur 36) + lien « ⚙︎ Gérer les catégories » (13/700, zone ≥ 44 px).

**Par qui** : 3 cartes (À moi, Communes, Chez l'autre), `grid repeat(auto-fit, minmax(300px, 1fr))`, `gap 16`. Carte : `--color-surface`, `--shadow-card`, rayon 24, padding 14/16/4. En-tête de carte : point(s) + nom 15/800 + méta 12 à droite.

**Par thème** : puces de filtre défilables (« Tout », une par catégorie avec son émoji, « 📌 Sans catégorie » s'il y a des orphelines ; hauteur 40, rayon 20 ; active fond `--color-ink` texte inverse), puis une carte par catégorie : gommette 32 px + nom 16/800 + compteur « fait / total » (13/800) ; lignes d'habitudes dessous. Le compteur ne compte que les habitudes de la personne connectée.

**Ligne d'habitude** (hauteur mini 60 à 62, séparée par `1px solid #ecdfd2`) :
1. **Case ronde 30 px** : vide = contour 2 px `#d3c1ad` ; faite = fond et contour de la personne, « ✓ » blanc 14/800.
2. **Gommette 34 px** : fond de la catégorie, émoji de l'habitude.
3. Titre 15/600 (fait : barré, `--color-ink-soft`) et méta 12 : « À moi », « {Autre} l'a fait », « {Autre} pas encore », ou le nom du propriétaire.
4. **Pastille de série** à droite.
Seule la case coche ; toucher la ligne ouvre la fiche. Dans les cartes « Chez l'autre », la case est à 75 % d'opacité et inactive.

### 2. Onglet Séries
Deux sélecteurs :
- **Période** : Semaine / Mois / Année (segment, hauteur 38). Duel et « Nous » ne sont disponibles qu'en Mois (les autres périodes passent à 50 % d'opacité).
- **Périmètre** : Moi / {Autre} / Nous / Duel (puces 38 px ; actif fond `--color-ink`).

**Mois (Moi ou l'autre)** : 3 compteurs (série en cours « 21 j » cliquable, plus longue série « 31 j » cliquable, régularité « 78 % ce mois-ci »), carte « Streaks en cours » (4 lignes : gommette, titre, « 🔥 n j »), **calendrier** du mois : titre « Novembre 2026 » 18/800, en-têtes Lun à Dim (11/700), grille de ronds avec le numéro du jour. Quatre niveaux : rien (`#e6d6c4`), un peu (couleur de la personne mélangée à 62 % de blanc), presque (30 % de blanc), tout fait (couleur de la personne). Jour courant : anneau 2 px `#f9f2ea` puis 2,5 px de la couleur de la personne (jamais en noir). Jours à venir : contour pointillé 1,5 px `#d3c1ad`. **Légende obligatoire.** Cliquer « série en cours » ou « plus longue série » ouvre une feuille « Séries en cours » / « Plus longues séries » (5 lignes, la première avec une pastille pleine couleur de la personne).

**Récap Semaine** : carte avec anneau 92 px (pourcentage 24/800, ex. « 86 % »), repère « DU 5 AU 11 NOVEMBRE », texte d'analyse 14 ; 3 compteurs (« 3 j tout fait d'affilée », « 🔥 31 j plus longue série ›», « 🔥 21 j série en cours ›») ; **barres jour par jour** (hauteur 120, rayon 8 ; 100 % = couleur pleine, ≥ 80 % = mélange 30 % de blanc, sinon 60 %) ; carte « Les plus solides » (3 habitudes avec barre 6 px et pourcentage).
**Récap Année** : même structure, titre « Année 2026 », barres mois par mois (J à O), mois futurs en pointillés (N, D), compteur « 94 jours parfaits ».

**Nous** : carte « À deux » (« Vous avez fait les habitudes communes ensemble 5 jours sur 7 cette semaine. Meilleure série commune : 21 jours. »), carte « Habitudes communes » (gommette, titre, méta « Faite à deux aujourd'hui » / « Une personne sur deux » / « Pas encore faite », deux ronds 22 px (Alex puis Antoine), pastille de série).

**Duel** (masquable par chacun) : score en grand (couleur de la personne connectée à gauche, de l'autre à droite, 44/800, séparateur « – » `#b9a28c`, « manches gagnées ce mois »), avatars 44 px, carte « Face à face » avec 4 lignes (Régularité du mois, Jours parfaits, Plus longue série, Habitudes tenues) : valeurs 20/800 de chaque côté (le meilleur à pleine opacité, l'autre à 55 %), barre 10 px bicolore. Couronne 👑 sur le meilleur score. Formulation neutre, jamais culpabilisante (« l'a manquée »). Chez l'autre personne, l'écran est inversé (elle se voit à gauche).

### 3. Onglet Objectifs
Segment **En cours / Atteints · 3** (largeur max 360). Cartes (grille `auto-fit, minmax(300px, 1fr)`) : gommette 40 px, titre 16/700, « {Moi | Autre | Commun} · pour le {date} », valeur 22/800 « 13 / 21 km » avec pourcentage à droite 13/800, barre 10 px (piste `#e6d6c4`). Couleur = celle du propriétaire (encre `#3a2c24` pour un objectif commun). Exemples : « Courir un semi-marathon » (Antoine, 13 / 21 km), « Apprendre 200 mots de portugais » (commun, 140 / 200), « Lire 24 livres cette année » (Alex, 15 / 24). Atteints : « Lire 12 livres », « 100 jours de méditation », « Courir 10 km sans s'arrêter ». **Création d'un objectif : à dessiner.**

### 4. Fiche d'une habitude (feuille)
Ouverte en touchant une ligne. En-tête : gommette 56 px (rotation −6°), titre 22/800, méta « {Catégorie} · {Commune | À moi | Chez X} », « Fermer ». Deux encarts (fond `#efe3d4`, rayon 16) : « 🔥 n j série en cours » et « n j record ».
**Habitude commune** : deux avatars 56 px avec un badge d'état 24 px (« ✓ » vert `#5e7d33` si fait, « … » `#e0d0bf` sinon) ; encart d'alerte `#f6dfc6` texte `#6b3a0c` avec ⏳ (« {Prénom} ne l'a pas encore faite. La série de n j est en jeu jusqu'à minuit. » ou « Vous l'avez faite tous les deux aujourd'hui. ») ; repère « RÈGLE DE LA SÉRIE » + segment **À deux / Chacun la sienne** + phrase explicative ; ligne « **Joker de la semaine** » avec interrupteur (52×32, rond blanc 26, fond `--user-base` actif / `#d3c1ad` inactif).
**Habitude de l'autre** : « Habitude d'{Prénom} : visible, mais seul {Prénom} peut la cocher. »

### 5. Feuille « Nouvelle habitude »
Mobile : feuille du bas ; bureau : modale 460 px. Champs dans l'ordre :
1. Nom (56 px, rayon 16, contour 1,5 px `--user-base`, 17/600, placeholder « Nom de l'habitude »).
2. **Gommette** 56 px (rotation −6°) + pastilles de couleur 34 px (palette de 8) ; si une catégorie est choisie, les couleurs sont masquées et la note « Le fond suit la catégorie « X » » s'affiche.
3. Grille d'emojis 8 colonnes (case 40 px ; sélection fond teinte de la personne). Le prototype en propose 16.
4. Segment **À moi / Commune** (hauteur 44) + note : « Visible par {l'autre}, mais il ne la coche pas. » / « Vous la cochez chacun de votre côté. »
5. Si commune : segment **Série à deux / Chacun la sienne**.
6. **Catégorie** : puces (« Aucune », les catégories, « + Nouvelle » en pointillé).
7. **Jours** : 7 pastilles L M M J V S D (actif fond `--user-base` texte blanc ; inactif `#e0d0bf`). Par défaut lundi à vendredi.
8. **Rappel** : interrupteur « Chaque jour à 7 h 30 ».
9. « Créer l'habitude » (54 px, opacité 0,45 tant que le nom est vide).

### 6. Feuille « Catégories »
Liste (hauteur 64 par ligne) : poignée « ⋮⋮ » (réordonner, non actif), gommette 40 px, nom 16/700, « n habitude(s) ». Bouton « + Nouvelle catégorie » (54 px, pill, contour pointillé 1,5 px `#b9a28c`). **Nouvelle catégorie** : gommette 52 px, champ nom, repère « COULEUR DE LA CATÉGORIE » + 8 pastilles 40 px (sélection : anneau `#3a2c24`), grille d'emojis, bouton « Créer la catégorie ».

## Interactions & Behavior
- Cocher : la case se remplit, le titre est barré, la pastille de série passe à n+1, l'anneau d'en-tête et le compteur de carte se mettent à jour. Pas d'animation lourde ; appui `:active` à l'échelle 0,97.
- Changer de personne en haut du prototype : tout est recalculé (couleur, groupes, texte d'en-tête).
- Chaque sélecteur (onglet, période, périmètre, mode Par qui / Par thème, filtre de catégorie) est un état local, sans rechargement.
- Après création d'une habitude : retour à l'onglet Aujourd'hui, la nouvelle ligne apparaît dans son groupe.
- Respecter `prefers-reduced-motion`.
- Hors connexion : les coches restent sur l'appareil et partent au retour du réseau, avec « en attente d'envoi ». Jamais de carte vide.
- Responsive : mobile 1 colonne, bouton flottant ; bureau grilles `auto-fit`, bouton « + Nouvelle habitude » en en-tête, modales centrées de 460 px (rayon 28).

## State Management
- `habits[]` : `{id, title, emoji, categoryId | '', bg (si sans catégorie), owner: 'alex'|'antoine'|'both', streak, record, rule: 'both'|'each', joker: bool, days[7], reminder, done: {alex: bool, antoine: bool}}`. Prévoir un historique par jour (`checks[date][person]`) : le prototype n'a que l'état du jour.
- `categories[]` : `{id, name, emoji, bg}`, communes aux deux personnes.
- `goals[]` : `{id, title, emoji, bg, owner, current, target, unit, deadline, done}`.
- UI : `tab`, `mode` (who | theme), `catFilter`, `period` (semaine | mois | annee), `scope` (me | other | us | duel), `goalTab`, `detailId`, feuilles ouvertes.
- Données dérivées : séries (calculées depuis l'historique, avec règle « À deux » et joker), pourcentages, récaps, score du duel (manches gagnées sur le mois). Les valeurs du prototype (78 %, 31 j, 94 jours parfaits, etc.) sont **fictives**.
- Données synchronisées en temps réel entre les deux personnes ; privé par défaut : le Journal n'apparaît jamais ici.

## Design Tokens
Reprendre **intégralement** la section 2 de `CHARTE_GRAPHIQUE.md`. Valeurs les plus utilisées dans ces écrans :
- **Fond** `#ecdfd1` → `#e7dacb` ; surface `#f9f2ea` ; encart `#efe3d4` ; champ `#fffaf3` ; traits `#ecdfd2` / `#d3c1ad` ; piste `#e6d6c4` ; puce `#e0d0bf`.
- **Encre** `#3a2c24` / `#6f5a4a` / `#a8907a` / `#4f3f34` (texte courant secondaire).
- **Alex** `#b8434f` (teinte `#f6e0e1`, encre `#8f2f3a`). **Antoine** `#8a5a8c` (teinte `#efe2ef`, encre `#6a4270`).
- **Série** `#f6dfc6` / `#8a4a12`. **Succès** `#5e7d33`. **Alerte** `#f6dfc6` / `#6b3a0c`.
- **Typographie** : Manrope 400 à 800. Titre d'écran 32/800 (−0,02 em), titre de feuille 24/800, titre de carte 16/800, élément 15/600, corps 14, méta 12, repère 11/700 capitales 0,12 em, grand chiffre 44/800. Polices **hébergées en local** (`woff2`).
- **Rayons** 12 / 16 / 18 / 22 / 24 / 30, pill 999. **Ombres** `--shadow-card`, `--shadow-nav`, `--shadow-sheet`, `--shadow-sticker`.
- **Gommettes** : rond pastel + émoji, rotation −6° à +6°, ombre `0 2px 0 rgba(60,40,30,.14)`. Palette : `#d3dcc3`, `#f0d9a8`, `#ecb8b0`, `#e3d9e9`, `#d5dde8`, `#f6dfc6`, `#cfe0d8`, `#e8c9d4`.
- **Cibles tactiles** 44 px minimum, 52-54 px pour l'action principale.
- **Graphiques** : barres rayon 8, couleur `--user-base` pour 100 %, mélange avec blanc à 30 % puis 60 % pour les niveaux inférieurs, pointillés `--color-border-strong` pour le futur.

## Assets
- Aucune image. Gommettes en **emojis** (le rendu varie selon l'appareil : toujours un libellé à côté).
- Police : Manrope.

## Fichiers
- `Le QG - Prototype.dc.html` + `support.js` : prototype (référence principale).
- `Habitudes.dc.html` : planche d'exploration.
- `CHARTE_GRAPHIQUE.md` : charte graphique.

## Phrase à mettre dans CLAUDE.md du projet
`Respecter CHARTE_GRAPHIQUE.md pour tout le style. Ne jamais écrire de couleur, rayon ou espacement en dur : utiliser les tokens CSS (--color-*, --radius-*, --space-*). Les dossiers design_handoff_*/ contiennent les références de design (README.md = spécification).`

## Ordre de construction suggéré
1. Tokens, thème par personne, composants de base (carte, puce, segment, case, gommette, pastille de série, feuille).
2. Données : habitudes, catégories, historique des coches, calcul des séries (règle « À deux », joker).
3. Aujourd'hui : « Par qui » puis « Par thème ».
4. Fiche d'une habitude et création (+ catégories).
5. Séries : Mois et calendrier, puis récap, puis Nous, puis Duel.
6. Objectifs.
7. Hors connexion et synchronisation entre les deux personnes.
