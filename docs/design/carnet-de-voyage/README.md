# Handoff : Carnet de voyage (module du QG)

## Overview
Module « Carnet de voyage » de l'app **Le QG**, une PWA privée pour deux personnes (Alex et Antoine). Il sert à préparer, vivre et garder en mémoire les voyages : préparation en 9 étapes (avec IA), découverte d'offres (Discover), saisie rapide des dépenses sur place, partage des comptes, photos et carnet par voyage.

Langue : français, tutoiement. Mobile d'abord (390 px), puis bureau (1240 px).

## About the Design Files
Les fichiers de ce dossier sont des **références de design en HTML** : des prototypes qui montrent l'aspect et le comportement voulus. Ce n'est pas du code de production à copier. La tâche consiste à **recréer cette interface dans l'environnement du projet cible** (framework, routeur, gestion d'état, base de données) avec ses conventions. Si aucun environnement n'existe, choisir le plus adapté à une PWA (par exemple React + Vite + une base synchronisée hors ligne).

- `Carnet de voyage.dc.html` : le prototype complet. L'ouvrir dans un navigateur avec `support.js` à côté. Le bouton « ⚙ Maquette » en haut permet de basculer mobile / ordinateur, Alex / Antoine et le thème.
- `CHARTE_GRAPHIQUE.md` : source de vérité du style (tokens, composants, ton). **À respecter pour tout le style.** Ne jamais écrire une couleur, un rayon ou un espacement en dur : utiliser les variables CSS.
- Les données du prototype (voyages, offres, étapes) sont fictives et sont définies en haut du script du fichier `.dc.html` (constantes `TRIPS`, `OFFERS`, `ROME_EXP`, `PACK`, `ACTS`, `baseSteps`).

## Fidelity
**Haute fidélité.** Couleurs, typographie, rayons, ombres, espacements et animations sont finaux. Recréer à l'identique avec les tokens de la charte.

Écarts connus entre le prototype et la charte, à trancher :
- Le **mode sombre** (« cacao nuit ») est une proposition de ce prototype. La charte ne le définit pas (§16). Valeurs dans la section Design Tokens.
- Le prototype affiche des **emojis** sur les cartes d'étapes sans fond rond. La charte demande des gommettes (rond pastel + émoji). À aligner sur la charte.
- Les listes denses (dépenses, budget, documents, offres en liste) utilisent un **point de couleur** (14 px) à la place de la gommette, pour alléger.

## Navigation

### Mobile (390 × 844)
Barre basse flottante : `left/right 12`, `bottom 16`, hauteur 72, rayon 26, fond `--color-surface`, `--shadow-nav`. Dégradé de 116 px sous la barre.
Entrées, de gauche à droite : **Accueil** (🌍), **Voyages** (🧳), **Discover** (🧭, bouton central rond 60 px qui dépasse de 22 px au-dessus de la barre, bordure 4 px), **Préparer** (🗺️), **Sur place** (📍).
Actif : gommette cerclée (anneau 2 px `--color-surface` puis 4 px `--user-base`), libellé 800 en `--user-text`. L'onglet Accueil actif a un fond `--user-tint`.
Marge basse du contenu : 130 px. Barre d'état factice en haut : à ne pas reproduire.

### Bureau (1240 × 820)
Barre latérale 248 px, fond `--color-sidebar` : « Le QG », entrées du QG (Accueil, Habitudes), entrée « Carnet de voyage » avec ses 5 sous-entrées (Accueil, Nos voyages, Préparer, Discover, Sur place), puis Journal, Bobine. En bas : bascule de thème et profil (rond de la couleur de la personne, nom, état de synchronisation).
Contenu : marge 36 px à 40 px, largeur max 1000 px, grilles `repeat(auto-fit, minmax(min(100%, 380px), 1fr))`.

### Écrans (route suggérée)
| Écran | Route | Entrée |
|---|---|---|
| Accueil du carnet | `/voyage` | onglet Accueil |
| Nos voyages | `/voyage/voyages` | onglet Voyages |
| Fiche voyage | `/voyage/voyages/:id` | carte d'un voyage, frise, tuile |
| Préparer (9 étapes) | `/voyage/preparer/:tripId` | onglet Préparer |
| Étape | `/voyage/preparer/:tripId/:stepId` | carte d'étape |
| Discover | `/voyage/discover` | bouton central |
| Sur place | `/voyage/sur-place` | onglet Sur place |

Le bouton retour de la fiche voyage ramène à l'écran d'origine (Accueil, Sur place ou Nos voyages) : mémoriser la provenance.

## Screens

### 1. Accueil du carnet
**But** : voir ce qui demande une action maintenant. Les sections sous le hero sont personnalisables.

Structure (grille 1 colonne mobile, 2 colonnes bureau, `gap 16`) :
1. **En-tête** : gommette 🌍 54 px (fond `#f0d9a8`, rotation 4°), repère « MARDI 3 NOVEMBRE » (11/700 capitales 0,12 em), titre « Accueil » (30/800, −0,02 em), bouton « ✎ Personnaliser » (pill 40 px, fond `--color-surface`, `--shadow-card`). Sur mobile, au-dessus : « ‹ Le QG » et un bouton de thème.
2. **Hero « Prochain départ »** (toujours en haut, pleine largeur) : carte `--radius-lg`, barre de 5 px en haut (dégradé 50 % Alex / 50 % Antoine), repère « Prochain départ », « Lisbonne » (32/800), dates « Jeudi 26 – lundi 30 novembre », puce « Commun » (deux points). À droite, **compte à rebours** 66/800 (interlettrage −0,05 em, chiffres tabulaires) + « jours avant le départ », avec un avion ✈️ (gommette 34 px bleue `#d5dde8`) qui flotte à gauche du chiffre. En bas : barre de progression de préparation (8 px, fond `--color-track`, remplissage `--color-ink`) et « n/9 étapes validées ». Toute la carte ouvre Préparer.
3. **Sections personnalisables** (chacune une carte `--radius-lg`, padding 16/18) :
   - **À préparer ensuite** : repère, gommette 44 px de l'étape, titre 18/700, résumé en une ligne, bouton principal « Ouvrir l'étape », lien « Voir les 9 étapes ›».
   - **Notre frise** : repère + « Voyages communs ». Défilement horizontal. Chaque voyage : gommette 44 px (rotation propre), nom 13/700, date 11/700. Ligne pointillée 2 px `--color-border-strong` derrière. Le prochain voyage a un anneau 2,5 px `--user-base` qui pulse et « J-23 ». Dernier élément : rond pointillé « ? » → Discover.
   - **Destinations enregistrées** : lignes (point couleur 14 px, destination, prix 14/800, « Préparer › »), 3 maximum, lien « Voir tout › » qui ouvre Discover filtré sur « ♥ Enregistrées ». État vide : « Touche ♥ sur une offre de Discover pour la retrouver ici. » + lien Discover.
   - **Dernier souvenir** : gommette + citation du souvenir préféré du dernier voyage, lien « Ouvrir les souvenirs › ».
   - **Comptes du dernier voyage** : phrase de solde 22/800, lien « Voir les dépenses › ».
   - **Budget du prochain voyage** : total 22/800, barre avec repère « Idéal » (trait plein) et « Limite » (trait pointillé `--color-loss`).
4. **« + Ajouter une section »** : bouton pointillé, ouvre la feuille « Mon accueil ».

**Feuille « Mon accueil »** : liste des 6 sections ; chaque ligne a titre + description, flèches ↑ ↓ (zone 40 × 44) pour réordonner, bouton « Retirer » / « Ajouter » (pill 38 px). Bouton « Terminer ». Par défaut actives : À préparer ensuite, Frise, Destinations enregistrées. L'ordre et l'activation sont conservés par personne.

### 2. Nos voyages
- Titre « Nos voyages », repère « Carnet de voyage ».
- Segment **Communs / Perso**. En Perso : puces Tous / Alex / Antoine (actives en fond `--color-ink`).
- **Carte de statistiques** : « En tout » + total (32/800), méta « n voyages · n pays · n continents · n j ». Segment Catégories / Pays. Catégories : barre empilée 12 px (segments séparés de 2 px) + grille de légende (point, nom, pourcentage avec espace insécable). Pays : lignes (pays, « Continent · n voyages », montant).
- Ligne « n voyages » + segment **Liste / Grille**.
- Carte liste : couverture 92 × 104+ (rayures de la couleur du voyage + gommette 44), nom 18/700, total 13/800, dates 12, souvenir préféré entre guillemets français, puce d'appartenance. Carte grille : couverture 110 px, nom, « mois année · total ».
- Les voyages en cours / à venir ne comptent pas dans les statistiques. Lisbonne (à venir) n'apparaît pas dans la liste.

### 3. Fiche voyage
- Retour « ‹ {origine} » + bouton « Partager en lecture » (marqué « Available soon… »).
- Couverture 170 px (rayures + gommette 64 px, étiquette « photo de couverture » à remplacer par la vraie photo), titre 30/800, « Pays · dates · n j », puce d'appartenance.
- Encart **Souvenir préféré** (fond `--color-surface-sunken`, gommette 💛).
- **3 sections** : Dépenses, Itinéraire, Souvenirs. Mobile : puces défilables (`--color-ink` actif). Bureau : les 3 sections sont affichées ensemble, en grille.
- Bouton flottant « + » (56 px, `--user-base`, droite 20, bas 104 sur mobile ; droite 36, bas 32 sur bureau) : ouvre la saisie de dépense.

**Dépenses**
- Total 32/800 + statut (« Sous l'idéal », « n € au-dessus de l'idéal », « Au-dessus de la limite », couleurs `--color-gain`, `--color-streak-ink`, `--color-loss`).
- **Phrase de solde** dans un encart : deux points + « Antoine doit 123 € à Alex » (14/800), ou « Vous êtes quittes ».
- Jauge 10 px avec repères Idéal et Limite (étiquettes 11/700 dessous).
- Répartition par catégorie (point, nom, barre 8 px, montant).
- Liste des dépenses (hauteur mini 60) : point couleur de la catégorie, libellé, méta (« Payé par Alex · jour » ou « Épargne commune · jour »), montant 15/800.
- **Qui a payé quoi** : deux cartes (teinte Alex / teinte Antoine) avec montants, ligne « Épargne commune : X. N'entre pas dans les remboursements. », encart de résultat, bouton « Marquer comme réglé » (principal, 52 px) → état « Vous êtes quittes » + confettis. Voyage perso : « Rien à partager ».

**Itinéraire**
- Liste jour par jour (« Jour 1 » 12/800 en `--user-text`, texte 14).
- **Carte embarquée** (OpenStreetMap via Leaflet dans le prototype, 240 px, rayon 16) avec repères numérotés (rond 16 px `--user-base`, bord blanc 2 px, chiffre 9/800) et étiquette (11/700, fond `--color-surface` à 92 %). La carte s'ajuste aux repères. Pas de bouton « Maps ».

**Souvenirs**
- **Photos** : compteur « n / 20 » + barre fine. Vide : cadre pointillé, gommette 📷, « Ajoutez vos premières photos », « Moins de 20 par voyage. Glisse-les ici ou choisis-les dans ta galerie. », bouton « Choisir des photos ». Sinon galerie 3 colonnes (carrés `--radius` 12, tuile « + » pointillée tant que < 20). Glisser-déposer accepté. Toucher une photo l'ouvre en grand (feuille) avec « Supprimer la photo ». Au-delà de 20 : « 20 photos max par voyage ».
- **Carnet** : au premier passage, choix entre **Carnet libre** (pages sans date, bouton « + Page ») et **Un carnet par jour** (une page par jour du voyage). « Changer de format » permet de revenir. Ensuite segment **✎ Écrire / 📖 Livre** :
  - Écrire : puces de pages, repère « Jour n · Voyage · écrit par {personne} », champ titre (52 px), zone de texte 200 px, vignettes des photos insérées (avec ✕), bouton « 📷 Insérer une photo » (feuille : galerie du voyage + « + Nouvelle photo »).
  - Livre : une page à la fois (fond `--color-input`, rayon 6 / 18 / 18 / 6, tranche à gauche, deux ombres décalées en « pages » dessous), méta, titre 22/800, texte 15 / 1,65, photos en grille 2 colonnes, numéro « n / total ». Boutons « ‹ Précédente » / « Suivante › » ; la page pivote (rotateY ±60° → 0, 0,45 s).

### 4. Préparer
- Repère « Carnet de voyage », titre « Préparer », bouton « Partager » (Available soon…).
- Puces de voyages en préparation + « + Nouveau voyage » (pointillé). Un nouveau voyage crée un brouillon avec 9 étapes à faire.
- **Barre collante de budget** (fond `--color-ink`, texte inverse, rayon 22) : « Budget prévu » + total, jauge avec repères Idéal / Limite (couleur de remplissage : vert `#9cc27a` sous l'idéal, jaune `--color-quest-stripe` entre idéal et limite, `#e98b8b` au-dessus), anneau conique de progression « n/9 ».
- Grille de **9 cartes d'étapes** (`repeat(auto-fill, minmax(158px, 1fr))`, hauteur mini 150, rayon 22). Chaque carte : émoji 24, pastille d'état, titre 15/700, résumé 12 (2 lignes), mode (« ✦ Automatique » / « ✎ Manuel »). Les étapes se remplissent **dans n'importe quel ordre**. La première étape non validée porte « Suggérée » (11/800 `--user-text`) et un anneau 2 px `--user-base`.
- Les 9 étapes : Destination, Dates, Budget, Vols et transport, Hébergement, Liste d'affaires, Activités, Itinéraire, Documents.
- États : « À faire » (contour pointillé), « En cours » (`--color-chip`), « Proposé par l'IA » (`--color-quest-soft`), « Validé ✓ » (`--color-success`, texte blanc).

### 5. Étape
- Retour « ‹ Préparer · {voyage} », gommette 56 px, titre 24/800, pastille d'état.
- Segment **✎ Manuel / ✦ Automatique**.
- **Bloc IA** (mode automatique) : barre supérieure rayée de 5 px (quête), « ✦ Proposition de l'IA », bouton « ↻ Régénérer cette étape » (l'icône tourne de 360°) et bouton « Options ▾ ». Les **Options** (repliées) : nombre de propositions 1/2/3, « Importer depuis Claude », puces d'ajustement (Moins cher, Plus calme, Plus court, Plus fun), champ « Demande un ajustement… » + « Envoyer », mention « Génération via l'API Claude dans l'app · Available soon… ».
- Si plusieurs propositions : puces « Option A / B / C ».
- Étapes à lignes : chaque ligne (libellé 12/600, valeur modifiable 15/600) a un bouton **« Garder » / « Gardée ✓ »** qui verrouille la ligne : la régénération ne change que les lignes non gardées. Mode manuel : « + Ajouter une ligne ». Bouton « Réserver sur le site officiel ↗ » pour Vols et Hébergement.
- **Budget** : une ligne par catégorie avec barre et champ montant en €, total commun, note « Devise sur place : euro. Pas de conversion pour ce voyage. » (convertisseur : Available soon…).
- **Liste d'affaires** : encart « Pris en compte » (puces), segment Alex / Antoine / Commun, carte avec titre, pastille « n/total », barre, cases rondes 28 px (voir charte), modèles « + Week-end ville / Plage / Rando » et « Enregistrer comme modèle ». Quand une liste est entièrement cochée : confettis + toast.
- **Activités** : carte de carte (OpenStreetMap, 220 px) puis cartes d'activités (couverture 110 px, note « ★ 4,7 », prix · durée · lieu, statut cyclique Envie → Réservé → Fait ✓, jour cyclique « 📅 Jour n », « Réserver sur le site officiel ↗ »).
- Bouton bas **« Valider cette étape »** (54 px, `--user-base`) → « Étape validée ✓ · Rouvrir ». À la validation : tampon (voir animations) et toast « Étape validée · n/9 ». Confettis à 9/9.

### 6. Discover
- Titre « Discover », repère « Offres du moment », bouton « ↻ Actualiser ».
- Ligne de fraîcheur : point vert, « Mis à jour hier à 6 h », « Départ : Paris ▾ » (choix de la ville de départ : Paris, Lyon, Bordeaux, Lille).
- **Raccourcis** (puces défilables) : Tout, ♥ Enregistrées (avec compteur), Escapade autour de Paris, Week-end visite, Week-end chill, puis « Plus ▾ » (Semaine de vacances, City trip en Europe, Soleil / plage, Nature et rando, Long-courrier, Dernière minute).
- Bouton **Filtres** (contour 1,5 px, compteur « · n ») et segment **Feed / Liste / Carte**.
- Ligne d'apprentissage : « Le feed apprend de vos choix · n enregistrée(s), n écartée(s) ».
- **Feed** (cartes, `minmax(min(100%, 300px), 1fr)`) : couverture 150 px (rayures + gommette 56), badge de type (Séjour, Train, Vol, Hôtel, Activité, Idée), bouton ♥ 44 px en haut à droite, destination 18/700 + dates, prix 24/800 à droite, encart « **Pourquoi c'est intéressant :** … », ligne grise « per · trajet · météo · Relevé le … », bouton principal « Préparer ce voyage », « ✕ Écarter ». Écarter : la carte glisse à gauche (translateX −120 %, rotation −10°, 0,4 s) puis disparaît.
- **Liste** : lignes de 74 px (point, destination, type · trajet · météo, prix, ♥, ✕).
- **Carte** : carte de l'Europe avec une **pastille de prix** par offre (style Airbnb ; pastille choisie : fond `--color-ink`, texte inverse, échelle 1,12). Sous la carte : fiche de l'offre choisie (gommette, destination, dates, trajet, météo, prix, « Préparer ce voyage », ♥, ✕). Les offres hors zone (Tokyo) sont listées sous la carte. Les idées sans prix affichent leur emoji dans la pastille.
- **Feuille Filtres** : groupes Budget max, Budget compté (par personne / pour deux), Zone (multiple), Quand, Durée, Thème (multiple), Temps de trajet max, Transport (multiple), Météo, Visa. Boutons « Réinitialiser » et « Voir les offres ». Un point de filtre actif est compté (hors « Budget compté »).
- « Préparer ce voyage » crée un brouillon dans Préparer **pré-rempli** (destination, dates, budget de transport) et ouvre Préparer avec le toast « « {ville} » pré-rempli : destination, dates, budget ».
- Bouton « Voir plus » (+3 offres), état vide « Rien pour ce raccourci ».

### 7. Sur place
- Titre « Sur place », repère « {ville} · Jour 1 », puce de réseau cliquable (Synchronisé / Hors connexion).
- Note d'aperçu : le mode s'active tout seul le jour du départ.
- Hors connexion : bandeau `--color-ink` « Tout reste consultable. Tes dépenses et notes partiront au retour du réseau. » Les dépenses saisies hors ligne portent « en attente d'envoi ».
- **Tuiles rapides** (2 colonnes) : « Dépense » (💶) et « Souvenirs » (📖). « Souvenirs » ouvre une feuille avec une note du jour (zone de texte + « Enregistrer ») et les photos du voyage (vignettes + « 📷 Ajouter des photos »), puis un lien discret « Ouvrir dans Voyages › » vers la fiche voyage, section Souvenirs.
- **Programme du jour** : lignes heure / point / texte (le point de l'étape en cours pulse).
- **Carte du voyage** avec repères.
- **Réservations et documents** (« Hors ligne ✓ » en `--color-success`).
- **Dépenses du voyage** : total, **phrase de solde** (même règle que dans la fiche voyage), lignes ; état vide « Rien pour l'instant. Le bouton + ajoute une dépense en deux gestes. »
- Bouton flottant « + ».

### Feuille « Nouvelle dépense » (depuis le « + »)
Voyage cible, champ montant (84 px, 44/800, « € » 30/800, contour `--user-base`), grille de 7 catégories (rond 46 px ; sélection : échelle 1,08 + anneau 2,5 px `--user-base`), segment « Qui a payé ? » Alex / Antoine / Commun (aide : « Sort de l'épargne commune. Ne change pas qui doit quoi. » / « Alex avance : Antoine lui doit la moitié. » …), champ « Libellé (facultatif) » toujours visible (56 px), bouton « Ajouter {montant} » (54 px, opacité 0,5 tant que le montant est vide). La personne connectée est présélectionnée comme payeuse ; la dernière catégorie utilisée reste sélectionnée.

### Feuille « Importer de Claude »
Étape 1 : « Copie la demande » (bouton → « Copié ✓ »). Étape 2 : zone « Colle ici la réponse… ». Bouton « Importer en un clic » : remplace les lignes non gardées de l'étape.

## Interactions & Behavior

### Règles métier
- **Qui doit quoi** : on ne compte que les dépenses payées par Alex ou Antoine. `solde = payé_par_alex − (total_payé_par_les_deux / 2)`. Solde > 0 : « Antoine doit X à Alex » ; solde < 0 : « Alex doit X à Antoine » ; |solde| < 1 € : « Vous êtes quittes ». Les dépenses « Commun » (épargne commune) n'entrent jamais dans le calcul. Un voyage perso affiche « Rien à partager ».
- **Budget** : idéal et limite par voyage. Jauge de budget plafonnée à 115 % de la limite.
- **Photos** : 20 maximum par voyage.
- **Étape suggérée** : première étape dont le statut n'est pas « Validé ».
- **Régénération** : seules les lignes non gardées sont remplacées ; les cases cochées de la liste d'affaires sont conservées.
- Hero : le nombre de jours est calculé depuis la date de départ (le prototype fixe 23).

### Animations (avec parcimonie ; désactivées si `prefers-reduced-motion`)
| Animation | Où | Détail |
|---|---|---|
| Compte à rebours | Accueil | le chiffre défile de 0 à n, 38 ms par pas, au chargement |
| Avion qui flotte | Hero | translateY 0 → −6 px, rotation −8° ↔ 6°, 3,2 s, infini |
| Pulsation | Frise (prochain voyage), programme du jour | `box-shadow` 0 → 14 px de la couleur de la personne, 1,8 s, infini |
| Tampon « Validé » | Étape validée | scale 1,9 → 0,92 → 1, rotation −16° → 4° → 0, 0,5 s |
| Flou de régénération | Lignes IA | opacité 1 → 0,2 + flou 3 px → 1, 0,7 s |
| Rebond | ♥ enregistré, case cochée | scale 1 → 1,28 → 1, 0,35 s |
| Carte écartée | Discover | glissement à gauche + rotation −10°, 0,4 s |
| Boussole | Barre basse | rotation de 360° à chaque ouverture de Discover (0,8 s, `cubic-bezier(.3,1.5,.5,1)`) |
| Confettis | Comptes réglés, valise bouclée, étape 9/9 | 22 pièces, 1 à 1,5 s, chute de 560 px avec rotation |
| Toast | Partout | apparition 0,45 s avec léger rebond, disparaît après 2,4 s ; pastille `--color-ink`, 46 px |
| Page du livre | Carnet | rotateY ±60° → 0, 0,45 s |
| Feuille du bas | Mobile | `translateY(100%)` → 0, 0,3 s |
| Écrans | Changement d'onglet | fondu + translateY 8 px, 0,3 s |
| Appui | Cartes et boutons | `:active` scale 0,97 à 0,98 ; `:hover` bureau translateY −2 px |

### Responsive
- Mobile : 1 colonne, feuilles en bas, puces défilables pour les sections de la fiche voyage.
- Bureau : grilles 2 colonnes, les 3 sections de la fiche voyage visibles ensemble, modales centrées de 460 px (rayon 28).
- Les blocs fluides utilisent `minmax(min(100%, N px), 1fr)`.

### Mentions « Available soon… »
À conserver (décision validée) : partage en lecture, génération IA directement dans l'app, convertisseur de devises. La carte interactive est désormais réelle.

## State Management
État global (par personne, persisté et synchronisé) :
- `trips` (voyages) avec `expenses`, `photos[]`, `notebook {mode: 'free' | 'daily', pages[{title, text, photos[]}]}`
- `prepDrafts` : voyages en préparation, chacun avec 9 étapes `{id, status, mode, lines[{k, v, locked, alts[]}], proposalCount, selectedProposal}` + budget par catégorie + liste d'affaires par personne + activités `{status, day}`
- `offers` (feed Discover), `saved` (ids enregistrés), `dismissed` (ids écartés), filtres, raccourci actif, vue (feed / liste / carte), ville de départ
- `homeSections` : ordre + activation des sections de l'accueil
- `user` (alex | antoine), `theme`, `offline`

Persistance dans le prototype : localStorage (`qg_carnet_v1` : notebook, photos, enregistrés, écartés, accueil, dépenses, comptes réglés). En production : base de données partagée entre les deux personnes + file d'attente hors ligne pour les dépenses et notes.

Données à brancher :
- **Discover** : offres (vols, trains, hôtels, activités) relevées périodiquement (« Relevé le … à 6 h »), filtrées par ville de départ, avec prix, trajet, météo et une phrase « pourquoi c'est intéressant ». Fournisseur à choisir.
- **IA** : génération des propositions par étape via l'API Claude. Le prompt contient voyage, dates, budget, lignes gardées, ajustement demandé. Réponse importable via « Importer depuis Claude ».
- **Cartes** : tuiles OpenStreetMap + Leaflet dans le prototype. Un fournisseur avec clé (Mapbox, MapLibre) peut convenir. Repères ancrés aux coordonnées réelles.
- **Photos** : stockage objet (le prototype utilise des data-URLs en local).

## Design Tokens
Reprendre **intégralement** la section 2 de `CHARTE_GRAPHIQUE.md`. Valeurs utilisées dans ce module :

**Couleurs** — fond `--color-bg-top #ecdfd1` → `--color-bg-bottom #e7dacb` ; surfaces `#f9f2ea`, encart `#efe3d4`, champ `#fffaf3`, barre latérale `#e3d4c3` ; traits `#ecdfd2` / `#d3c1ad` ; piste `#e6d6c4` ; puce `#e0d0bf` ; encre `#3a2c24` / `#6f5a4a` / `#a8907a` / inverse `#f9f2ea` ; Alex `#b8434f` (teinte `#f6e0e1`, encre `#8f2f3a`) ; Antoine `#8a5a8c` (teinte `#efe2ef`, encre `#6a4270`) ; série `#f6dfc6` / `#8a4a12` ; quête `#f0d9a8` / `#e8c36a` ; succès `#5e7d33` ; gain `#3f7a4f` ; perte `#a33a3a`.

**Mode sombre « cacao nuit »** (proposition) — bg `#2b221d` → `#231b17` ; surface `#382c25` ; encart `#2e241e` ; sidebar `#1f1814` ; champ `#2e241e` ; traits `#463830` / `#6b5647` ; piste `#4a3b32` ; puce `#4a3c33` ; encre `#f4e9dd` / `#cbb6a3` / `#8c7766` / inverse `#2b221d` ; teintes personnes `#5a2b31` / `#47324b` ; textes colorés `#f0a3ab` (Alex), `#d9b3db` (Antoine) ; série `#5a3d22` / `#f6dfc6` ; succès `#6f9440` ; voile `rgba(10,6,4,.6)`.

**Espacements** — échelle de 4 ; marge mobile 18, bureau 36–40 ; écart entre cartes 10 à 16.
**Rayons** — 12, 20, 24, 30, pill 999 ; cadre téléphone 38 (maquette seulement).
**Ombres** — `--shadow-card`, `--shadow-nav`, `--shadow-sheet`, `--shadow-sticker` (voir charte).
**Typographie** — Manrope 400 à 800 : titre d'écran 30/800 (−0,02 em), grand chiffre 66/800 (−0,05 em), titre de carte 18/700, élément 15/600, corps 14, méta 12/500, repère 11/700 capitales 0,12 em, libellé de barre 10,5/600 (800 actif). Polices hébergées en local pour le hors-ligne.
**Cibles tactiles** — 44 px minimum, 52 à 54 px pour l'action principale.

**Gommettes de ce module** : Accueil 🌍 `#f0d9a8` (+4°), Voyages 🧳 `#f6dfc6` (−5°), Préparer 🗺️ `#cfe0d8` (+5°), Discover 🧭 `#d5dde8` (−3°), Sur place 📍 `#ecb8b0` (−3° à +4°). Catégories de dépenses : Transport ✈️ `#d5dde8`, Hébergement 🛏️ `#e3d9e9`, Restauration 🍝 `#ecb8b0`, Activités 🎟️ `#f0d9a8`, Courses 🧺 `#d3dcc3`, Shopping 🛍️ `#e8c9d4`, Transports sur place 🚇 `#cfe0d8`.
Couvertures de voyage : rayures `repeating-linear-gradient(135deg, {couleur} 0 14px, rgba(255,255,255,.35) 14px 16px)` sur la couleur du voyage, en attendant les vraies photos.

## Assets
- Aucune image ni icône importée. Les gommettes utilisent des emojis. Les photos de couverture sont des placeholders rayés à remplacer par les vraies photos de l'utilisateur.
- Police : Manrope (Google Fonts dans le prototype ; à héberger en local en production).
- Cartes : tuiles OpenStreetMap (© OpenStreetMap contributors), Leaflet 1.9.4.

## Fichiers
- `Carnet de voyage.dc.html` : prototype complet.
- `support.js` : script requis pour ouvrir le prototype.
- `CHARTE_GRAPHIQUE.md` : charte graphique du QG (source de vérité du style).

## Phrase à mettre dans CLAUDE.md du projet
`Respecter CHARTE_GRAPHIQUE.md pour tout le style. Ne jamais écrire de couleur, rayon ou espacement en dur : utiliser les tokens CSS (--color-*, --radius-*, --space-*). Le dossier design_handoff_carnet_de_voyage/ contient les références de design du module Carnet de voyage (README.md = spécification).`

## Ordre de construction suggéré
1. Tokens, thème et polices locales, puis composants de base (carte, puce, segment, bouton, gommette, point de propriété, feuille, toast).
2. Navigation mobile et bureau.
3. Nos voyages et fiche voyage (dépenses, qui doit quoi, saisie rapide).
4. Préparer et étapes (sans IA d'abord, puis génération via l'API Claude).
5. Discover (feed, filtres, enregistrements) puis vue carte.
6. Accueil personnalisable, Sur place et mode hors connexion.
7. Souvenirs : photos et carnet (libre / par jour / livre).
