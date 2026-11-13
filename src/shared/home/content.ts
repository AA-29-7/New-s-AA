/**
 * Contenus « distants » de l'accueil. Valeurs fixes pour l'instant :
 * la source et la fréquence de mise à jour restent à définir (charte §16).
 */
export const QUOTES: [text: string, author: string][] = [
  ['Ce n’est pas parce que les choses sont difficiles que nous n’osons pas, c’est parce que nous n’osons pas qu’elles sont difficiles.', 'Sénèque'],
  ['Peu importe la lenteur à laquelle tu avances, du moment que tu ne t’arrêtes pas.', 'Confucius'],
  ['Un voyage de mille lieues commence toujours par un premier pas.', 'Lao Tseu'],
  ['Nous sommes ce que nous faisons de manière répétée. L’excellence n’est donc pas un acte, mais une habitude.', 'Will Durant, d’après Aristote'],
  ['Celui qui a un pourquoi qui lui tient lieu de but peut supporter presque n’importe quel comment.', 'Nietzsche'],
  ['Au milieu de l’hiver, j’apprenais enfin qu’il y avait en moi un invincible été.', 'Albert Camus'],
  ['La vie d’un homme est ce que ses pensées en font.', 'Marc Aurèle'],
  ['Faites que votre rêve dévore votre vie afin que la vie ne dévore pas votre rêve.', 'attribué à Saint-Exupéry'],
]

export interface CryptoQuote {
  symbol: string
  price: string
  change: string
  up: boolean
}

/** Dernière valeur connue du cours crypto (maquette). */
export const CRYPTO: { quotes: CryptoQuote[]; updatedAt: string } = {
  quotes: [
    { symbol: 'BTC', price: '61 240 €', change: '2,4 %', up: true },
    { symbol: 'ETH', price: '2 310 €', change: '1,1 %', up: false },
    { symbol: 'SOL', price: '142 €', change: '4,8 %', up: true },
  ],
  updatedAt: '21:05',
}

export interface FunFact {
  emoji: string
  category: string
  text: string
  details: string[]
  source: string
}

export const FUN_FACTS: FunFact[] = [
  {
    emoji: '🍯',
    category: 'Histoire',
    text: 'Le miel ne se périme pas : des pots encore comestibles ont été retrouvés dans des tombes égyptiennes.',
    details: [
      'Le miel contient très peu d’eau et il est naturellement acide, ce qui empêche la plupart des bactéries de s’y développer.',
      'Les abeilles ajoutent aussi une enzyme qui produit en petite quantité un antiseptique, ce qui l’aide à se conserver.',
      'Il peut cristalliser avec le temps, mais il suffit de le chauffer doucement pour le rendre liquide.',
    ],
    source: 'archéologie et chimie alimentaire',
  },
  {
    emoji: '🦦',
    category: 'Biologie marine',
    text: 'Les loutres de mer se tiennent par la patte en dormant pour ne pas dériver l’une de l’autre.',
    details: [
      'Elles dorment en groupe sur l’eau, et le courant pourrait les séparer.',
      'Elles s’enroulent aussi parfois dans des algues pour rester en place pendant leur sommeil.',
      'Ce sont aussi l’un des rares mammifères à utiliser des outils : elles cassent les coquillages avec une pierre posée sur le ventre.',
    ],
    source: 'observations de biologie marine',
  },
  {
    emoji: '🐙',
    category: 'Animaux',
    text: 'Une pieuvre a trois cœurs : deux pour les branchies, un pour le reste du corps.',
    details: [
      'Les deux petits cœurs envoient le sang vers les branchies, le grand cœur le distribue dans le corps.',
      'Son sang est bleu, car il contient de l’hémocyanine, à base de cuivre, plus efficace que l’hémoglobine dans l’eau froide.',
      'Quand elle nage, le cœur principal s’arrête : c’est l’une des raisons pour lesquelles elle préfère ramper.',
    ],
    source: 'zoologie',
  },
  {
    emoji: '🪐',
    category: 'Astronomie',
    text: 'Sur Vénus, un jour dure plus longtemps qu’une année.',
    details: [
      'Vénus met environ 243 jours terrestres à tourner sur elle-même, mais seulement 225 pour faire le tour du Soleil.',
      'Elle tourne aussi dans le sens inverse de la plupart des planètes : le Soleil s’y lèverait à l’ouest.',
      'Son atmosphère très dense en fait la planète la plus chaude du système solaire, devant Mercure.',
    ],
    source: 'astronomie',
  },
  {
    emoji: '🗼',
    category: 'Paris',
    text: 'La tour Eiffel peut grandir d’une quinzaine de centimètres en été.',
    details: [
      'Le fer se dilate avec la chaleur : par temps très chaud, la structure s’allonge un peu.',
      'Les variations de température font aussi pencher légèrement le sommet, de quelques centimètres, à l’opposé du soleil.',
      'Elle est repeinte tous les sept ans environ, ce qui protège le métal.',
    ],
    source: 'physique et histoire des monuments',
  },
]
