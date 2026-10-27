# Charte graphique · Le QG

Application web installable (PWA), privée, pour deux personnes : **Alex** et **Antoine**.
Ce document est la source de vérité du design. Il décrit les décisions validées, pas des pistes.

- Version : 1.0
- Langue de l'interface : français, tutoiement
- Cible : mobile d'abord (usage à une main), puis bureau
- Maquettes de référence : `Hub et Design System.dc.html`, `Habitudes.dc.html`, `Le QG - Prototype.dc.html`

> **Pour Claude Code** : ajouter dans `CLAUDE.md` la ligne
> `Respecter CHARTE_GRAPHIQUE.md pour tout le style. Ne jamais écrire de couleur, rayon ou espacement en dur : utiliser les tokens CSS (--color-*, --radius-*, --space-*).`

## Sommaire

1. [Principes](#1-principes)
2. [Tokens](#2-tokens)
3. [Couleurs et personnes](#3-couleurs-et-personnes)
4. [Typographie](#4-typographie)
5. [Espacements, rayons, ombres](#5-espacements-rayons-ombres)
6. [Gommettes](#6-gommettes)
7. [Appartenance : à moi, à l'autre, commun, privé](#7-appartenance)
8. [Composants](#8-composants)
9. [Navigation et mise en page](#9-navigation-et-mise-en-page)
10. [Modules](#10-modules)
11. [Personnalisation](#11-personnalisation)
12. [États transverses](#12-états-transverses)
13. [Accessibilité et PWA](#13-accessibilité-et-pwa)
14. [Ton et contenu](#14-ton-et-contenu)
15. [Interdits](#15-interdits)
16. [Points ouverts](#16-points-ouverts)

---

## 1. Principes

1. **Doudou, pas corporate.** Fond cachemire chaud, encre cacao (jamais de noir pur), cartes moelleuses, formes rondes.
2. **Deux personnes, deux couleurs.** Alex est grenade, Antoine est mauve. Une troisième couleur d'identité n'existe pas. Le commun combine les deux.
3. **La propriété se lit d'un coup d'œil.** Pastille de couleur = à qui est l'élément. Voir [§7](#7-appartenance).
4. **Le Journal est privé et le montre.** Jamais partagé, toujours signalé par un cadenas.
5. **Sobre.** Pas de décor ajouté, pas de dégradé agressif. La couleur vient des personnes et des gommettes.
6. **Utilisable à une main.** Zones tactiles confortables, actions principales en bas.
7. **Jamais d'écran vide ou cassé hors connexion.** Voir [§12](#12-états-transverses).

## 2. Tokens

Règle : le code n'utilise **que** des variables CSS. Toute valeur en dur est une erreur de revue.
Convention de nommage : `--{catégorie}-{rôle}[-{variante}]`, en kebab-case, sans nom de couleur dans le nom d'un token sémantique (`--color-ink`, pas `--color-brown`).

```css
:root {
  /* Surfaces */
  --color-bg-top: #ecdfd1;            /* haut du fond cachemire */
  --color-bg-bottom: #e7dacb;         /* bas du fond cachemire */
  --color-surface: #f9f2ea;           /* cartes, barre de navigation, feuilles */
  --color-surface-sunken: #efe3d4;    /* encart dans une carte */
  --color-surface-muted: rgba(249, 242, 234, 0.55); /* carte en lecture seule */
  --color-sidebar: #e3d4c3;           /* barre latérale bureau */
  --color-input: #fffaf3;             /* champ de saisie */

  /* Traits et remplissages neutres */
  --color-border: #ecdfd2;            /* séparateur de ligne */
  --color-border-strong: #d3c1ad;     /* case vide, contour de champ inactif */
  --color-track: #e6d6c4;             /* piste de barre de progression */
  --color-chip: #e0d0bf;              /* puce, segment inactif, bouton secondaire */

  /* Encre */
  --color-ink: #3a2c24;               /* texte principal */
  --color-ink-soft: #6f5a4a;          /* texte secondaire, méta */
  --color-ink-faint: #a8907a;         /* jours à venir, élément désactivé */
  --color-ink-inverse: #f9f2ea;       /* texte sur fond encre */

  /* Personnes (valeurs fixes, jamais modifiées par le thème) */
  --alex-base: #b8434f;   --alex-tint: #f6e0e1;   --alex-ink: #8f2f3a;
  --antoine-base: #8a5a8c; --antoine-tint: #efe2ef; --antoine-ink: #6a4270;

  /* Série (streak) et quête */
  --color-streak-bg: #f6dfc6;
  --color-streak-ink: #8a4a12;
  --color-quest-soft: #f0d9a8;
  --color-quest-stripe: #e8c36a;

  /* États */
  --color-success: #5e7d33;           /* « Synchronisé », rond vert */
  --color-gain: #3f7a4f;              /* ▲ */
  --color-loss: #a33a3a;              /* ▼ */

  /* Journal (espace privé, dedans) */
  --journal-bg: #e6ebf1;
  --journal-surface: #f5f7fa;
  --journal-ink: #1f2a3d;
  --journal-ink-soft: #5a6578;
  --journal-border: #d3dbe6;
  --journal-accent: #2c3d5c;

  /* Voile des feuilles et modales */
  --color-scrim: rgba(40, 28, 22, 0.45);

  /* Espacements (échelle de 4) */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px;

  /* Rayons */
  --radius-sm: 12px;   /* encart, mini-carte */
  --radius-md: 20px;   /* carte module */
  --radius-lg: 24px;   /* carte principale */
  --radius-xl: 30px;   /* feuille du bas */
  --radius-pill: 999px;
  --radius-device: 38px; /* cadre téléphone, maquette uniquement */

  /* Ombres */
  --shadow-card: 0 1px 0 rgba(90, 60, 40, 0.05), 0 10px 24px rgba(90, 60, 40, 0.08);
  --shadow-nav: 0 8px 22px rgba(60, 40, 30, 0.12);
  --shadow-sheet: 0 20px 50px rgba(40, 28, 22, 0.35);
  --shadow-sticker: 0 2px 0 rgba(60, 40, 30, 0.14);

  /* Typographie */
  --font-sans: "Manrope", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-emoji: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;

  /* Cibles tactiles */
  --tap-min: 44px;
  --tap-cta: 54px;
}

/* La personne connectée fixe --user-* ; l'autre fixe --other-*. */
[data-user="alex"] {
  --user-base: var(--alex-base);   --user-tint: var(--alex-tint);   --user-ink: var(--alex-ink);
  --other-base: var(--antoine-base); --other-tint: var(--antoine-tint); --other-ink: var(--antoine-ink);
}
[data-user="antoine"] {
  --user-base: var(--antoine-base); --user-tint: var(--antoine-tint); --user-ink: var(--antoine-ink);
  --other-base: var(--alex-base);   --other-tint: var(--alex-tint);   --other-ink: var(--alex-ink);
}

body {
  margin: 0;
  background: linear-gradient(180deg, var(--color-bg-top), var(--color-bg-bottom)) fixed;
  color: var(--color-ink);
  font-family: var(--font-sans);
}
a { color: var(--user-ink); text-decoration: none; }
a:hover { color: var(--color-ink); }
```

Les composants utilisent `--user-*` et `--other-*`, jamais `--alex-*` ou `--antoine-*` directement, sauf pour afficher les deux personnes ensemble (commun, duel).

## 3. Couleurs et personnes

| Rôle | Alex | Antoine |
|---|---|---|
| Base (boutons, coches, anneau, nom dans le titre) | `#b8434f` grenade | `#8a5a8c` mauve |
| Teinte (fond de puce, onglet actif de nav) | `#f6e0e1` | `#efe2ef` |
| Encre (texte coloré sur teinte, liens) | `#8f2f3a` | `#6a4270` |

- **Texte coloré** sur fond clair : toujours la valeur « encre », pas la base.
- **Texte sur base** (bouton plein) : blanc `#fff`.
- **Commun** : les deux bases côte à côte (deux points qui se chevauchent, ou dégradé à 50 % sur 50 % en bandeau).
- **Jour courant** : jamais en noir. Fond `--color-surface`, chiffre en `--user-ink`, anneau 2,5 px `--user-base`.
- **Carte accueil Journal** : même fond que les autres cartes (`--color-surface`). Seuls la gommette lavande et le cadenas la distinguent.
- **Cartes de saison** : le fond cachemire est le défaut ; voir [§11](#11-personnalisation).

Contrastes (indicatifs, à revalider avec un outil avant livraison) : grenade sur surface ≈ 4,8:1, blanc sur grenade ≈ 5,3:1, blanc sur mauve ≈ 5,4:1, `--color-ink-soft` sur surface ≈ 5,9:1. Le texte courant reste au-dessus de 4,5:1.

## 4. Typographie

Une seule famille : **Manrope**, graisses 400, 500, 600, 700, 800.
L'ancienne piste serif (Newsreader) est abandonnée.

| Style | Taille / graisse | Usage |
|---|---|---|
| Display | 32 / 700, interlettrage −0,01 em | « Bonjour Alex » |
| Titre d'écran | 30 / 800, −0,02 em | « Habitudes », « Séries », « Objectifs » |
| Titre de feuille | 24 / 800, −0,02 em | « Catégories », « Séries en cours » |
| Titre de carte | 18 / 700 | « Lisbonne » |
| Élément | 15 / 600 | nom d'une habitude |
| Corps | 14 / 400-500, interligne 1,45-1,5 | descriptions |
| Méta | 12 / 500 | « À moi », dates |
| Repère | 11 / 700, capitales, 0,12 em | « LUNDI 12 OCTOBRE » |
| Libellé de barre | 10,5 / 600 (800 actif) | navigation basse |
| Pastille de série | 12 / 800 | « 🔥 12 j » |

- `text-wrap: pretty` sur les paragraphes.
- Chiffres importants (pourcentages, séries, scores) : 800 avec interlettrage négatif.
- **Hébergement des polices en local** (dossier `public/fonts`, format `woff2`, `font-display: swap`) : requis pour le hors-ligne. Pas de lien vers un CDN en production.

## 5. Espacements, rayons, ombres

- Échelle de 4 px. Marge d'écran mobile : 18 px. Marge bureau : 36 px. Espace entre cartes : 10 à 16 px.
- Lignes de liste : hauteur mini 56 à 62 px, séparées par `1px solid var(--color-border)`.
- Cartes : `--radius-lg` (24) pour les blocs principaux, `--radius-md` (20) pour les cartes module, `--radius-xl` (30) pour les feuilles.
- Puces et boutons : `--radius-pill`.
- Une seule ombre pour les cartes (`--shadow-card`). Les cartes de lecture seule n'ont pas d'ombre.

## 6. Gommettes

Une gommette est un rond de couleur pastel portant un émoji. Elle identifie un module, une catégorie ou une habitude.

- Formes : rond, légère rotation (entre −6° et +6°), ombre `--shadow-sticker` (décalage vertical de 2 px, sans flou).
- Tailles : 30 (barre, titre de section), 34 (ligne de liste), 40 (carte, objectif), 48-56 (entête de fiche), 96 (éditeur).
- L'émoji fait environ 46 % de la taille du rond.
- Pas d'initiale + autocollant : la variante « émoji dans la gommette » est retenue.

| Module | Émoji | Fond | Rotation |
|---|---|---|---|
| Accueil | 🏡 | `--color-surface` | 0° |
| Habitudes | 💪 | `#d3dcc3` | −6° |
| Carnet de voyage | 🌍 | `#f0d9a8` | +4° |
| Journal | 🌙 | `#e3d9e9` | −3° |
| Bobine | 🎬 | `#ecb8b0` | +6° |
| Emplacement libre | + | contour pointillé `--color-border-strong` | 0° |

Palette de fonds disponibles pour les catégories et habitudes : `#d3dcc3`, `#f0d9a8`, `#ecb8b0`, `#e3d9e9`, `#d5dde8`, `#f6dfc6`, `#cfe0d8`, `#e8c9d4`.

**Catégories d'habitudes** : une catégorie porte sa couleur et son émoji. Toutes ses habitudes prennent le fond de la catégorie et gardent leur propre émoji. Une habitude peut avoir un fond à part (option « Couleur à part »). Les catégories sont communes aux deux personnes.

Les émojis se rendent différemment selon l'appareil. Ne jamais leur donner de sens indispensable sans libellé.

## 7. Appartenance

| Signe | Sens | Forme |
|---|---|---|
| Point plein couleur de la personne | À moi / à l'autre | 8-9 px, rond |
| Deux points qui se chevauchent (−2 à −3 px) | Commun | alex à gauche, antoine à droite |
| Cadenas | Privé, jamais partagé | tige 6×4 px, corps 10×7 px, en encre |
| Puce « Privé · toi seul » | Rappel dans l'espace Journal | fond `--journal-bg`, cadenas à gauche |

Dans les listes d'habitudes, trois groupes dans cet ordre :
1. **À moi** (carte pleine, « Visible par Antoine »)
2. **Communes** (carte pleine, « Chacun coche la sienne ») : deux points, plein si fait, creux sinon
3. **Chez l'autre** (carte en `--color-surface-muted`, « Lecture seule », coches à 75 % d'opacité, non cliquables)

## 8. Composants

### Boutons

| Type | Style |
|---|---|
| Principal | hauteur 52-54, pill, fond `--user-base`, texte blanc, 15-16 / 800 |
| Secondaire | hauteur 50-52, pill, fond `--color-chip` ou contour 1,5 px `--color-ink` |
| Texte | 14 / 700, `--color-ink-soft`, hauteur de zone ≥ 44 |
| Destructif | texte `--alex-ink`, jamais de fond rouge plein |
| Bouton flottant | 56×56, rond, `--user-base`, « + » 28, en bas à droite à 104 px du bas (mobile) |

États : `:active` réduit l'échelle à 0,97-0,98. `:hover` (bureau) élève de 2 px les cartes cliquables.

### Case à cocher d'habitude

Rond 28-30 px. Vide : contour 2 px `--color-border-strong`. Fait : fond et contour `--user-base`, « ✓ » blanc, titre barré en `--color-ink-soft`. Seule la case coche ; toucher la ligne ouvre la fiche.

### Pastille de série

Pill hauteur 24, fond `--color-streak-bg`, texte `--color-streak-ink`, 12 / 800, `white-space: nowrap`. Contenu : « 🔥 12 j ». Placée au bout de la ligne, à hauteur du titre. Sur les statistiques, une pastille cliquable porte un « › ».

### Puces et segments

- Puce de filtre : hauteur 38-40, pill. Active : fond `--color-ink`, texte `--color-ink-inverse`. Inactive : fond `--color-surface`.
- Segment : conteneur `--color-chip` (rayon 22, padding 4), segment actif en `--color-surface`, 14 / 800.
- Puce d'appartenance : hauteur 28-30, fond « teinte », texte « encre », point de couleur à gauche.

### Champs

Hauteur 56, rayon 16, fond `--color-input`, contour 1,5 px (`--user-base` actif, `--color-border-strong` inactif), texte 17 / 600. Interrupteur : 52×32, rond blanc 26, fond `--user-base` actif, `--color-border-strong` inactif.

### Cartes

- Carte de liste : `--color-surface`, `--shadow-card`, rayon 24, padding 14-16.
- Carte module (accueil) : rayon 20-22, hauteur 110-132, gommette en haut à gauche, libellé 12 / 700 + titre 16-18 / 700 en bas.
- Encart interne : `--color-surface-sunken`, rayon 12-16.
- Bandeau de quête : barre supérieure de 5 px en bandes `--color-quest-soft` / `--color-quest-stripe`.

### Feuille du bas et modale

Voile `--color-scrim`. Mobile : feuille collée en bas, rayon 30 en haut, poignée 40×5 px centrée. Bureau : modale centrée, 460 px, rayon 28. Bouton « Fermer » ou « Annuler » en haut à droite, zone ≥ 44.

### Graphiques

- Barres : rayon 8-10, couleur `--user-base` pour le meilleur niveau, teintes éclaircies (mélange avec blanc, 30 % et 60 %) pour les niveaux inférieurs, pointillés `--color-border-strong` pour le futur.
- Calendrier : ronds avec le numéro du jour, quatre niveaux (rien, un peu, presque, tout fait), légende obligatoire, jours à venir en pointillés.
- Progression : barre de 8-10 px, anneau conique pour les ratios.
- Duel : couleur de la personne connectée à gauche, de l'autre à droite, couronne 👑 sur le meilleur score.

## 9. Navigation et mise en page

### Mobile

- Barre basse flottante : `left/right 12`, `bottom 16`, hauteur 72, rayon 26, `--color-surface`, `--shadow-nav`. Dégradé de 116 px sous elle pour fondre le contenu.
- Éléments : Accueil, 3 modules épinglés, « Tout » (feuille avec tous les modules). L'utilisateur choisit ses 4 modules épinglés.
- Élément actif : gommette cerclée de 2 px `--user-base`, libellé 800 en `--user-ink`. Accueil actif : fond `--user-tint`.
- Contenu : marge basse 130 px pour ne pas passer sous la barre.
- Zone de sécurité : `env(safe-area-inset-*)`.

### Bureau

- Barre latérale 244-260 px, fond `--color-sidebar`. En haut : nom « Le QG » (22 / 800). Entrées de 50 px de haut avec gommette 30 px. En bas : réglages, puis profil (rond de la couleur de la personne, nom, état de synchronisation).
- Contenu : marge 36-52 px, grille `repeat(auto-fit, minmax(300-340px, 1fr))`.
- Largeur de référence : 1240 px.

### Extensibilité

La barre et la grille d'accueil acceptent un 5ᵉ ou 6ᵉ module sans redessin : un module = une gommette (fond + émoji) + un nom + une carte. L'emplacement libre (« Place pour un 5ᵉ module ») est en pointillés.

### Accueil

Ordre : date et salutation, ligne d'info (citation d'Alex, cours crypto d'Antoine, en petit texte sans encadré), quête du QG, habitudes du jour, cartes modules, fun fact. L'accueil se modifie via un bouton « ✎ Modifier » (mode « tremblant » façon iPhone, boutons « − » pour retirer, « + Ajouter », tailles Petit / Large / Bande).

## 10. Modules

### Habitudes (prioritaire)
Onglets : **Aujourd'hui** (bascule « Par qui » / « Par thème », filtres de catégorie, bouton « + » de création), **Séries** (sélecteur Semaine / Mois / Année × Moi / Autre / Nous / Duel), **Objectifs** (En cours / Atteints).
- Les statistiques « série en cours » et « plus longue série » ouvrent la liste des habitudes concernées.
- Fiche d'une habitude : séries, record, statuts des deux personnes pour une habitude commune, règle de série (« À deux » : si l'un oublie, la série repart de zéro pour les deux ; « Chacun la sienne »), joker hebdomadaire.
- Mode duel : score en manches, face à face, séries communes interrompues (formulation factuelle, « l'a manquée »), trophées légers. Masquable par chacun.
- **La quête du QG** : un défi par mois, proposé en tour de rôle (un mois Antoine propose à Alex, le mois suivant l'inverse). Une fois accepté, il apparaît épinglé en haut de l'accueil et en tête des habitudes (pastille 🏁), non supprimable avant la fin du mois. Pop-up de choix le 1ᵉʳ, pop-up de bilan le dernier jour (« Réussi / En partie / Pas fait »), historique « Nos quêtes ».

### Carnet de voyage *(à dessiner)*
Liste À venir / Passés, fiche voyage, budget (total commun), carnet de notes pour les voyages futurs, galerie de moins de 20 photos. Voyage commun ou personnel : mêmes signes d'appartenance.

### Journal *(à finaliser)*
Strictement privé, jamais d'entrée partagée. Carte d'accueil : même fond que les autres cartes, gommette 🌙 lavande, cadenas. **Intérieur** : fond `--journal-bg` (brume bleutée), texte `--journal-ink`, puce « Privé · toi seul » toujours visible. Sections : émotion du jour (puces), trois choses positives, récit, « Vide ton sac ». Ton calme et intime, aucune statistique visible par l'autre.

### Bobine de film *(à dessiner)*
Roue ludique, fiche film (durée, plateformes), après visionnage note + avis, notes des deux côte à côte, banque commune + perso. Gommette 🎬 `#ecb8b0`.

## 11. Personnalisation

Écran **Réglages › Déco du QG** (réservé à l'usage en ligne).

- **Couleur de la personne** : 4 couleurs assorties à celle de l'autre (grenade, corail, framboise, rouille pour Alex), un bouton « 🎲 Surprends-moi » qui propose 4 autres couleurs très différentes, un rappel de la couleur de l'autre, et un aperçu en direct. Les teintes trop proches de l'autre personne sont écartées.
- **Fond** : trois onglets **Couleurs** (cachemire par défaut, crème, grège, guimauve, sauge, brume), **Saisons** (automne 🍂, hiver ❄️, printemps 🌸, été ☀️), **Fêtes** (Noël, Halloween, Saint-Valentin, Nouvel an, anniversaire, Pâques). Option « Changer tout seul selon la saison et les fêtes ». Un fond saisonnier = dégradé doux + deux émojis décoratifs discrets dans un coin de l'accueil.
- Un fond personnalisé modifie `--color-bg-top` et `--color-bg-bottom` seulement. Les cartes restent en `--color-surface` pour garantir la lisibilité.
- Les valeurs de personnalisation sont stockées par personne et ne modifient jamais les couleurs de l'autre.

## 12. États transverses

- **Synchronisé** : puce `--color-chip`, point `--color-success`.
- **Hors connexion** : puce fond `--color-ink`, texte `--color-ink-inverse`, point creux. Bandeau d'explication : « Tes coches sont gardées sur le téléphone. Elles partiront au retour du réseau. » Les éléments en attente d'envoi portent « en attente d'envoi ».
- **Contenus distants** (citation, crypto, fun fact) : afficher la dernière valeur connue avec l'heure de mise à jour. Jamais de carte vide.
- **États vides, chargement, erreur** : à dessiner avec le même vocabulaire (gommette, phrase courte, un bouton principal). Chargement : formes grises `--color-track`, pas de roue de chargement seule.
- **Connexion** : deux profils (Alex, Antoine) choisis en grand, couleur de la personne dès l'écran de connexion. *(à dessiner)*
- **Export des données** : dans Réglages. *(à dessiner)*

## 13. Accessibilité et PWA

- Cibles tactiles ≥ 44 px, actions principales 52-54 px.
- Texte courant ≥ 14 px, méta ≥ 12 px, repères ≥ 11 px en capitales.
- Ne jamais coder une information par la couleur seule : toujours un point, une icône, un texte ou un libellé en plus (coche, « fait », cadenas).
- Focus visible au clavier (bureau) : anneau 2 px `--user-base`, décalage 2 px.
- Respecter `prefers-reduced-motion` : supprimer les translations au survol et les transitions d'échelle.
- `theme-color` : `#ecdfd1`. `background_color` du manifeste : `#ecdfd1`. Mode `standalone`, orientation portrait.
- Icônes : dossier `public/icons` (192, 512, maskable 512). L'icône reprend une gommette (rond pastel + émoji 🏡) sur fond cachemire. Pas de nom de domaine ni de marque dans les icônes.
- Aucune dépendance à un domaine ou une marque externe pour l'identité visuelle.

## 14. Ton et contenu

- Français, tutoiement, phrases courtes, factuelles et chaleureuses.
- Nom de l'app : **Le QG**. Onglet de personnalisation : **Déco du QG**. Défi mensuel : **La quête du QG**.
- Libellés fixes : « À moi », « Commun » / « Communes », « Chez Antoine », « Privé · toi seul », « Lecture seule », « Synchronisé », « Hors connexion ».
- Dates : « Lundi 12 octobre » (jour en toutes lettres, mois en toutes lettres). Durées : « 12 j ». Pourcentages : « 78 % » avec espace insécable.
- Formulation des échecs : neutre, jamais culpabilisante (« Pas ce mois-ci », « Pas fait », « l'a manquée »).
- Aucun émoji décoratif hors gommettes, 🔥 de série, 🏁 de quête, 👑 de duel, 💡 de fun fact.

## 15. Interdits

- Noir pur (`#000`) ou gris froid pour le texte et les fonds.
- Couleur en dur dans un composant. Valeur de rayon ou d'ombre hors des tokens.
- Troisième couleur d'identité. Couleur d'Alex ou d'Antoine utilisée pour autre chose que ce qui leur appartient.
- Données du Journal visibles ailleurs que dans le Journal de leur auteur (accueil, duel, récap, export partagé).
- Bordure colorée sur un seul côté d'une carte, dégradés violents, effets de verre.
- Texte moins contrasté que 4,5:1, sauf titres de grande taille.
- Écran vide ou en erreur sans état prévu hors connexion.
- Polices chargées depuis un CDN en production.

## 16. Points ouverts

- Écrans à dessiner : Carnet de voyage, Bobine, Journal (intérieur complet), connexion, réglages, export, états vides et de chargement.
- Mode sombre : non défini. Le Journal n'est pas en mode sombre ; si un mode sombre est ajouté, il s'applique à toute l'app.
- Liste des défis mensuels et des fun facts : à définir côté données (sources et fréquence de mise à jour).
- Forme finale des widgets personnalisables de l'accueil (liste complète à valider).
