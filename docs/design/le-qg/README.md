# Handoff : Le QG (coque de l'app et accueil)

## Overview
**Le QG** est une PWA privée pour deux personnes, **Alex** et **Antoine**. Ce dossier décrit la **coque de l'app** (navigation, thème par personne, états transverses), l'**accueil** et ses cartes (quête du QG, habitudes du jour, accès aux modules, fun fact), ainsi que la **personnalisation**. Les modules ont leurs propres dossiers :
- `design_handoff_habitudes` : module Habitudes
- `design_handoff_carnet_de_voyage` : module Carnet de voyage
- Journal et Bobine : non dessinés (écrans « bientôt »).

Langue : français, tutoiement. Mobile d'abord (360 à 390 px), puis bureau (1240 px).

## About the Design Files
Les fichiers de ce dossier sont des **références de design en HTML** : des prototypes qui montrent l'aspect et le comportement voulus, pas du code de production. La tâche consiste à **recréer l'interface dans l'environnement du projet cible** avec ses conventions. Si aucun environnement n'existe, choisir le plus adapté à une PWA installable et hors ligne (par exemple React + Vite + une base synchronisée entre les deux personnes).

Fichiers :
- `Le QG - Prototype.dc.html` : prototype interactif de l'accueil, des Habitudes et de la coque. À ouvrir dans un navigateur avec `support.js`. Les boutons du haut basculent mobile / ordinateur et Alex / Antoine.
- `Hub et Design System.dc.html` : planche d'exploration (canvas). Les tours **12** (quête du QG), **11** (défi du mois), **10** (personnalisation et accueil modifiable), **9** (bureau) et **7** (vue d'ensemble) sont les références validées pour ces sujets. Les tours 1 à 6 sont des pistes de style abandonnées ou intégrées à la charte.
- `CHARTE_GRAPHIQUE.md` : source de vérité du style. **Elle prime** sur le prototype en cas de doute. Ne jamais écrire de couleur, rayon ou espacement en dur : utiliser les variables CSS.

## Fidelity
**Haute fidélité** pour l'accueil, la navigation, la quête, le fun fact et les feuilles. **À dessiner** (non fait) : Journal (intérieur complet), Bobine, connexion, réglages, export, états vides et de chargement (voir charte §16). Le mode sombre n'est pas défini pour le QG.

Écarts du prototype par rapport à la charte, à corriger à l'implémentation :
- Le prototype écrit les couleurs en dur. Les remplacer par les tokens de la charte (`--color-*`, `--user-*`, `--radius-*`, `--shadow-*`).
- Le prototype appelle « Voyages » l'entrée du carnet de voyage dans la barre basse. La charte la nomme « Carnet de voyage ». Garder « Carnet de voyage » dans la barre latérale du bureau et « Voyages » sur mobile si la place manque.
- Le fun fact et le cours crypto du prototype sont des textes fixes. Voir « Données distantes ».
- Dans le prototype, la barre basse montre les 5 modules. La charte prévoit Accueil, 3 modules épinglés au choix et « Tout » : suivre la charte (§9).

## Concepts transverses

### Personne connectée et couleurs
Deux personnes, deux couleurs, pas de troisième couleur d'identité (charte §3). La personne connectée fixe `data-user="alex|antoine"` sur la racine, et les composants utilisent `--user-*` et `--other-*`, jamais `--alex-*` ou `--antoine-*`, sauf pour afficher les deux ensemble.

| | Alex | Antoine |
|---|---|---|
| Base | `#b8434f` | `#8a5a8c` |
| Teinte | `#f6e0e1` | `#efe2ef` |
| Encre | `#8f2f3a` | `#6a4270` |

### Appartenance
Point plein de la couleur de la personne = à elle. Deux points qui se chevauchent (−3 px, Alex à gauche, Antoine à droite) = commun. Cadenas = privé. Voir charte §7.

### Navigation
**Mobile** : barre basse flottante `left/right 12`, `bottom 16`, hauteur 72, rayon 26, fond `--color-surface`, `--shadow-nav`, dégradé de 116 px dessous. Entrées : Accueil 🏡, Habitudes 💪, Voyages 🌍, Journal 🌙, Bobine 🎬. Entrée active : gommette 30 px cerclée de 2 px `--user-base`, libellé 800 en `--user-ink`, fond de l'entrée en `--user-tint` pour Accueil. Libellé 10,5/600. Marge basse du contenu : 130 px. Barre d'état factice du prototype : à ne pas reproduire.
**Bureau** : barre latérale 244 px, fond `--color-sidebar`, « Le QG » 22/800, entrées de 50 px avec gommette 30 px, profil en bas (rond de la couleur de la personne 38 px, nom, point vert « Synchronisé »). Contenu : marge 36 à 40 px, grille `repeat(auto-fit, minmax(340px, 1fr))`.

Gommettes de navigation : Accueil 🏡 `#f9f2ea`, Habitudes 💪 `#d3dcc3`, Voyages 🌍 `#f0d9a8`, Journal 🌙 `#e3d9e9`, Bobine 🎬 `#ecb8b0`.

### Feuilles et modales
Voile `rgba(40,28,22,.45)` (`--color-scrim`). Mobile : feuille collée en bas, rayon 30 30 0 0, poignée 40×5 `#d8c7b4`, padding 18/18/22. Bureau : modale centrée 460 px, rayon 28. Ombre `--shadow-sheet`. « Fermer » ou « Annuler » en haut à droite (zone ≥ 44 px). Hauteur max 92 %, défilement interne.

## Screens

### 1. Accueil
**But** : voir en un coup d'œil ce qui concerne la journée.

Ordre, de haut en bas (mobile : 1 colonne ; bureau : 2 colonnes `repeat(auto-fit, minmax(340px, 1fr))`, `gap 16`) :
1. **En-tête** : repère « JEUDI 12 NOVEMBRE » (11/700 capitales, 0,12 em, `--color-ink-soft`), « Bonjour {Prénom} » (34/700, −0,01 em ; prénom en couleur de la personne), puis **ligne d'info** en 13/600, `--color-ink-soft`, sans encadré : pour Alex, la citation du jour ; pour Antoine, le cours crypto du moment.
2. **Colonne gauche**
   - **Quête du QG** (voir écran 2).
   - **Carte « Aujourd'hui »** : gommette 💪 30 px + « Aujourd'hui » 15/800 + lien « {n / total} · tout voir › » (13/800, `--user-ink`) ; 4 lignes d'habitudes maximum (voir Habitudes pour la ligne).
3. **Colonne droite**
   - **Trois cartes module** côte à côte (flex-wrap, `flex: 1 1 140px`, hauteur mini 132, rayon 22) : gommette 40 px en haut à gauche, libellé 12/700 + titre 18/700 en bas. Contenus : « Carnet de voyage · Lisbonne · dans 23 jours » ; « Journal · privé · Pas encore écrit » avec **cadenas** (tige 6×4 px, corps 10×7 px) en haut à droite ; « Bobine · Lancer la roue · 142 films ». Au survol (bureau) : translateY −2 px.
   - **Fun fact du jour** : gommette 💡 38 px (rotation −4°, fond `#f0d9a8`), repère « FUN FACT DU JOUR », texte 15/600 (interligne 1,45), ligne basse « {catégorie} » + « En savoir plus → ».

**Interactions** : toucher une carte module ouvre le module (ou un écran « bientôt »). « tout voir › » ouvre Habitudes. Cocher une ligne d'habitude : voir Habitudes.

### 2. Quête du QG
Un défi par mois, proposé en tour de rôle (novembre : Antoine propose à Alex, décembre : l'inverse). Une fois accepté, il est épinglé en haut de l'accueil et en tête des Habitudes (pastille 🏁), non supprimable avant la fin du mois.

**Carte d'accueil** : fond `--color-surface`, rayon 24, padding 16, `--shadow-card`, bande supérieure de 5 px en rayures `#f0d9a8` / `#e8c36a` (14 px chaque).
- Ligne 1 : « 🏁 LA QUÊTE DU QG » (11/800, capitales, 0,08 em, `#8a4a12`) + « proposée par Antoine » / « choisie par toi » (12, `--color-ink-soft`).
- Ligne 2 (zone cliquable ≥ 48 px) : case ronde 32 px (vide : contour 2 px `--color-border-strong` ; faite : fond et contour `--user-base`, « ✓ » blanc), gommette 38 px du défi (📵 `#d5dde8`), titre 16/700 (« Pas d'écran après 22 h »), sous-titre 12 (« Jour 12 sur 30 · novembre »).
- Ligne 3 : **frise de 30 segments** (`gap 2`, hauteur 8, rayon 2) : jours passés en `--user-base`, jour courant en `--alex-tint` (ou teinte de la personne) avec contour 1,5 px si pas encore fait, jours à venir `--color-track`.
- Ligne 4 : « Alex a fait · Antoine pas encore » (12/700, avec les points de couleur) + pastille de série « 🔥 12 j » (fond `--color-streak-bg`, texte `--color-streak-ink`, hauteur 24, 12/800).

**Écrans associés** (voir `Hub et Design System.dc.html`, tours 11 et 12) :
- **Pop-up du 1er du mois** (celui qui choisit) : « Quel défi pour {l'autre} ? », cinq idées (liste de lignes 54 px avec gommette 34, sélection : fond teinte + contour 2 px), encart de détail (fond `--color-surface-sunken`, rayon 18), « Proposer à {l'autre} » (bouton principal 54 px), « 🎲 Un autre au hasard » et « ✎ Écrire le mien » (secondaires 44 px), mention « {L'autre} pourra accepter ou refuser. ».
- **Pop-up de réception** (celui qui reçoit) : gommette 96 px (rotation −6°), titre 26/800, puce « Ensemble · 30 jours », « J'accepte le défi » (principal) / « Je refuse » (texte). États de réponse : « Défi accepté », « Défi refusé » (« Antoine verra « Pas ce mois-ci » »).
- **Page « Nos quêtes »** : compteurs (réalisées, en cours, pas faites), filtres Toutes / Réalisées / Pas faites, historique par mois avec pastille d'état (« En cours », « Réussi », etc.).
- **Bilan du dernier jour du mois** : « Alors, tu as relevé le défi ? » + barre de progression + trois réponses : « Oui, défi réussi » / « En partie » / « Pas fait ». Ton neutre, jamais culpabilisant.

### 3. Fun fact
Carte d'accueil → **feuille** : gommette 52 px (rotation −4°), repère « FUN FACT · {catégorie} », texte 22/800 (interligne 1,25), 2 à 3 paragraphes 14 (interligne 1,6), « Source : … » 12, bouton « 🎲 Un autre fun fact » (principal 52 px), lien « Lire l'article complet › ». Le fun fact change chaque jour (index = jour de l'année) ; le bouton passe au suivant.

### 4. Écrans « bientôt » (Journal, Bobine, Carnet depuis l'accueil du prototype)
Gommette 96 px (rotation −6°, ombre `0 4px 0`), titre 28/800, texte « Cet écran n'est pas encore dessiné. Il arrive dans une prochaine étape. », bouton « Retour à l'accueil ». Remplacer par les vrais modules.

### 5. Personnalisation (Déco du QG, accueil modifiable)
Référence : `Hub et Design System.dc.html`, tour 10 (10a et 10b cliquables) et charte §11. Non codé dans `Le QG - Prototype.dc.html`.
- **Réglages › Déco du QG** : couleur de la personne (4 couleurs assorties à celle de l'autre + « 🎲 Surprends-moi »), fond (onglets Couleurs / Saisons / Fêtes, option « Changer tout seul selon la saison et les fêtes »). Un fond ne change que `--color-bg-top` et `--color-bg-bottom`.
- **Accueil modifiable** : bouton « ✎ Modifier », mode « tremblant », boutons « − » pour retirer, « + Ajouter », tailles Petit / Large / Bande.

## Interactions & Behavior
- **Cocher une habitude ou la quête** : la case passe en `--user-base` avec « ✓ », le titre est barré en `--color-ink-soft`, la pastille de série affiche +1, l'anneau d'avancement de la page Habitudes se met à jour. Seule la case coche ; toucher la ligne ouvre la fiche.
- **Titre de l'accueil Habitudes** : « Encore n à cocher » → « Plus qu'une habitude » → « Journée bouclée, bravo ».
- **Appui** : `:active` réduit l'échelle à 0,97-0,98. Survol (bureau) : cartes cliquables translateY −2 px.
- **Réduction de mouvement** : respecter `prefers-reduced-motion` (supprimer les translations au survol et les transitions d'échelle).
- **Hors connexion** : puce « Hors connexion » (fond `--color-ink`, texte inverse, point creux) à la place de « Synchronisé » (fond `--color-chip`, point `--color-success`). Bandeau : « Tes coches sont gardées sur le téléphone. Elles partiront au retour du réseau. » Les éléments en attente portent « en attente d'envoi ». Les contenus distants (citation, cours crypto, fun fact) affichent la dernière valeur connue avec l'heure de mise à jour : jamais de carte vide.
- **Journal** : strictement privé. Jamais visible ailleurs que dans le Journal de son auteur (ni accueil, ni duel, ni récap, ni export partagé).
- **Responsive** : mobile 1 colonne avec barre basse ; bureau avec barre latérale et grilles `auto-fit`.

## State Management
- `user` (alex | antoine), `device`, `page` (home, habits, travel, journal, reel)
- `quest` : `{alex: bool, antoine: bool}` pour le jour courant, plus l'historique mensuel, le défi du mois, qui propose, état de la réponse
- `habits[]` : voir le dossier Habitudes
- `factOffset` (index du fun fact), `factOpen`
- Réglages par personne : couleur, fond, modules épinglés, sections de l'accueil
- Synchronisation temps réel entre les deux téléphones pour les coches, la quête et le statut « a fait » de l'autre, avec file d'attente hors ligne.

## Données distantes à définir
- **Citation du jour** (Alex) : le prototype tourne sur 8 citations fixes, indexées par jour. Prévoir une source et la dernière valeur connue.
- **Cours crypto** (Antoine) : « BTC 61 240 € ▲ 2,4 % · ETH 2 310 € ▼ 1,1 % · SOL 142 € ▲ 4,8 % · mis à jour 21:05 ». Source, fréquence de mise à jour et dernière valeur connue à définir. Gain en `--color-gain`, perte en `--color-loss`.
- **Fun facts** : le prototype en contient 5 (miel, loutres, pieuvre, Vénus, tour Eiffel), avec catégorie, texte court, paragraphes détaillés, source. Source et fréquence à définir.
- **Défis mensuels** : liste de propositions à définir côté données (le prototype cite : Pas d'écran après 22 h, 8 000 pas par jour, Une photo par jour, …).

## Design Tokens
Reprendre **intégralement** la section 2 de `CHARTE_GRAPHIQUE.md` (surfaces, traits, encre, personnes, série, quête, états, espacements, rayons, ombres, typographie, cibles tactiles). Valeurs les plus utilisées dans ces écrans :

- **Fond** : dégradé `--color-bg-top #ecdfd1` → `--color-bg-bottom #e7dacb`. Surface `#f9f2ea`, encart `#efe3d4`, champ `#fffaf3`, barre latérale `#e3d4c3`. Traits `#ecdfd2` / `#d3c1ad`. Piste `#e6d6c4`. Puce `#e0d0bf`.
- **Encre** : `#3a2c24` / `#6f5a4a` / `#a8907a` / inverse `#f9f2ea`. Texte courant secondaire du prototype : `#4f3f34`.
- **Série** : fond `#f6dfc6`, texte `#8a4a12`. **Quête** : `#f0d9a8` / `#e8c36a`.
- **États** : succès `#5e7d33`, gain `#3f7a4f`, perte `#a33a3a`. Réussi (page « Nos quêtes ») : fond `#e1ead4`, texte `#46602a`.
- **Typographie** : Manrope 400 à 800. Salutation 34/700 (−0,01 em), titre d'écran 30-32/800 (−0,02 em), titre de feuille 24/800, titre de carte 18/700, élément 15/600, corps 14, méta 12/500, repère 11/700 capitales 0,12 em, libellé de barre 10,5/600 (800 actif). `text-wrap: pretty` sur les paragraphes. Polices **hébergées en local** (`woff2`, `font-display: swap`) pour le hors-ligne.
- **Rayons** : 12 / 20 / 24 / 30, pill 999 ; cadre téléphone 38 (maquette seulement).
- **Cibles tactiles** : 44 px minimum, 52-54 px pour l'action principale.
- **Gommettes** : rond pastel + émoji (≈ 46 % de la taille), rotation entre −6° et +6°, ombre `0 2px 0 rgba(60,40,30,.14)`. Tailles : 30 (barre, titre de section), 34 (ligne), 40 (carte), 48-56 (entête de fiche), 96 (état vide).
- **Palette des fonds de gommette** : `#d3dcc3`, `#f0d9a8`, `#ecb8b0`, `#e3d9e9`, `#d5dde8`, `#f6dfc6`, `#cfe0d8`, `#e8c9d4`.

## PWA et accessibilité
- `theme-color` et `background_color` : `#ecdfd1`. Mode `standalone`, orientation portrait. Icônes 192, 512 et maskable 512 : gommette 🏡 sur fond cachemire, sans nom de domaine ni marque.
- Zone de sécurité : `env(safe-area-inset-*)`.
- Focus visible au clavier : anneau 2 px `--user-base`, décalage 2 px.
- Jamais d'information par la couleur seule : toujours un point, une icône ou un libellé en plus.
- Texte courant ≥ 14 px, méta ≥ 12 px, repères ≥ 11 px en capitales. Contraste ≥ 4,5:1.
- Liens : `a` en `--user-ink`, `a:hover` en `--color-ink`.

## Assets
- Aucune image importée. Les gommettes utilisent des **emojis** (rendu variable selon l'appareil : toujours un libellé à côté).
- Police : Manrope (Google Fonts dans le prototype ; à héberger en local).

## Fichiers
- `Le QG - Prototype.dc.html` et `support.js` : prototype.
- `Hub et Design System.dc.html` : planche d'exploration (tours 7 à 12 les plus utiles).
- `CHARTE_GRAPHIQUE.md` : charte graphique.

## Phrase à mettre dans CLAUDE.md du projet
`Respecter CHARTE_GRAPHIQUE.md pour tout le style. Ne jamais écrire de couleur, rayon ou espacement en dur : utiliser les tokens CSS (--color-*, --radius-*, --space-*). Les dossiers design_handoff_*/ contiennent les références de design (README.md = spécification).`

## Ordre de construction suggéré
1. Tokens, thème par personne (`data-user`), polices locales, composants de base (carte, puce, segment, bouton, gommette, point de propriété, feuille, toast).
2. Navigation mobile et bureau, état de synchronisation.
3. Accueil : en-tête, carte « Aujourd'hui », cartes module, fun fact.
4. Quête du QG (carte, pop-ups, historique, bilan).
5. Hors connexion et données distantes avec dernière valeur connue.
6. Personnalisation (Déco du QG, accueil modifiable).
