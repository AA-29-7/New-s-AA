import type { StickerColor } from '../../../shared/ui'
import type {
  Activity,
  CatId,
  Category,
  Expense,
  HomeSectionId,
  Notebook,
  Offer,
  PackItem,
  Payer,
  PrepTrip,
  Step,
  StepLine,
  Trip,
} from '../types'

/**
 * Données de démonstration du Carnet de voyage (reprises du prototype).
 * Elles seront remplacées par les collections Firestore `trips` / `tripPhotos`.
 */
export const CATEGORIES: Category[] = [
  { id: 'transport', emoji: '✈️', color: 'mist', name: 'Transport' },
  { id: 'logement', emoji: '🛏️', color: 'lavender', name: 'Hébergement' },
  { id: 'resto', emoji: '🍝', color: 'coral', name: 'Restauration' },
  { id: 'activites', emoji: '🎟️', color: 'honey', name: 'Activités' },
  { id: 'courses', emoji: '🧺', color: 'sage', name: 'Courses' },
  { id: 'shopping', emoji: '🛍️', color: 'rose', name: 'Shopping' },
  { id: 'local', emoji: '🚇', color: 'mint', name: 'Transports sur place' },
]
export const CATEGORY = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CatId, Category>

export const PHOTO_COLORS: StickerColor[] = ['coral', 'mist', 'honey', 'mint', 'lavender', 'sage', 'rose', 'peach']

/** Voyage à venir, mis en avant sur l'accueil et dans « Sur place ». */
export const NEXT_TRIP_ID = 'lisbonne'

export const TRIPS: Trip[] = [
  {
    id: 'lisbonne', name: 'Lisbonne', country: 'Portugal', continent: 'Europe', start: '2026-11-26', end: '2026-11-30',
    owner: 'both', emoji: '✈️', color: 'honey', rotate: 4, memory: 'Pas encore de souvenir : le voyage n’a pas commencé.',
    total: 0, ideal: 1000, limit: 1400, photos: 0,
    pins: [['Alfama', -9.13, 38.711], ['Chiado', -9.1393, 38.7105], ['Graça', -9.1305, 38.7185], ['Belém', -9.206, 38.6975]],
    itinerary: ['Arrivée, Alfama à pied, dîner à Graça', 'Belém : tour, monastère, pastéis', 'Sintra en train, palais de Pena', 'Marché de Campo de Ourique, miradouro', 'Dernier café à Príncipe Real, vol à 19 h 05'],
  },
  {
    id: 'rome', name: 'Rome', country: 'Italie', continent: 'Europe', start: '2026-04-09', end: '2026-04-13',
    owner: 'both', emoji: '🍝', color: 'coral', rotate: -4, memory: 'La carbonara de Trastevere, à minuit, sous la pluie.',
    total: 1072, ideal: 1000, limit: 1300, photos: 14,
    pins: [['Colisée', 12.4922, 41.8902], ['Vatican', 12.4534, 41.9022], ['Trastevere', 12.4695, 41.8892], ['Borghese', 12.4923, 41.9142]],
    itinerary: ['Arrivée, Trastevere, dîner chez Enzo', "Vatican le matin, Castel Sant'Angelo", 'Colisée, Forum, apéro à Monti', 'Villa Borghese à vélo, Pigneto le soir', "Campo de' Fiori, vol de 18 h"],
  },
  {
    id: 'seville', name: 'Séville', country: 'Espagne', continent: 'Europe', start: '2025-12-04', end: '2025-12-06',
    owner: 'both', emoji: '🎄', color: 'peach', rotate: -4, memory: 'Le marché de Noël de Séville, un chocolat chaud à la main devant la cathédrale.',
    total: 1150, photos: 12,
    pins: [['Real Alcázar', -5.9904, 37.3832], ['Cathédrale', -5.993, 37.3858], ['Triana', -6.003, 37.383], ['Metropol Parasol', -5.9915, 37.3931]],
    itinerary: ['Arrivée et première balade', 'Journée visites', 'Journée libre'],
  },
  {
    id: 'cph', name: 'Copenhague', country: 'Danemark', continent: 'Europe', start: '2025-08-16', end: '2025-08-21',
    owner: 'both', emoji: '🚲', color: 'mint', rotate: 5, memory: 'Le tour du port à vélo, les cheveux au vent.',
    total: 1890, photos: 18,
    pins: [['Nyhavn', 12.5911, 55.6797], ['Tivoli', 12.5681, 55.6736], ['Christiania', 12.6082, 55.6736], ['Islands Brygge', 12.5766, 55.6637]],
    itinerary: ['Arrivée et première balade', 'Journée visites', 'Journée libre'],
  },
  {
    id: 'mrk', name: 'Marrakech', country: 'Maroc', continent: 'Afrique', start: '2025-02-14', end: '2025-02-18',
    owner: 'both', emoji: '🕌', color: 'peach', rotate: -3, memory: 'Le thé à la menthe sur la terrasse du riad.',
    total: 980, photos: 11,
    pins: [['Jemaa el-Fna', -7.989, 31.6258], ['Jardin Majorelle', -8.0033, 31.6417], ['Palais Bahia', -7.9831, 31.6213], ['Souks', -7.987, 31.63]],
    itinerary: ['Arrivée et première balade', 'Journée visites', 'Journée libre'],
  },
  {
    id: 'crozon', name: 'Crozon', country: 'France', continent: 'Europe', start: '2024-07-06', end: '2024-07-13',
    owner: 'both', emoji: '🌊', color: 'mist', rotate: 4, memory: "Le bain glacé à l'Île Vierge.",
    total: 1240, photos: 16,
    pins: [['Pen-Hir', -4.6294, 48.2362], ['Camaret', -4.5951, 48.278], ['Morgat', -4.503, 48.2257], ['Crozon', -4.489, 48.248]],
    itinerary: ['Arrivée et première balade', 'Journée visites', 'Journée libre'],
  },
  {
    id: 'londres', name: 'Londres', country: 'Royaume-Uni', continent: 'Europe', start: '2026-03-14', end: '2026-03-15',
    owner: 'alex', emoji: '☕', color: 'rose', rotate: -5, memory: 'Le scone de Borough Market.',
    total: 290, photos: 9,
    pins: [['Borough Market', -0.091, 51.5055], ['Tower Bridge', -0.0754, 51.5055], ['Soho', -0.1337, 51.5136], ['Camden', -0.1426, 51.539]],
    itinerary: ['Arrivée et première balade', 'Journée visites'],
  },
  {
    id: 'cham', name: 'Chamonix', country: 'France', continent: 'Europe', start: '2025-09-13', end: '2025-09-16',
    owner: 'antoine', emoji: '🏔️', color: 'sage', rotate: 3, memory: 'Le lever de soleil au lac Blanc.',
    total: 520, photos: 12,
    pins: [['Chamonix', 6.8694, 45.9237], ['Mer de Glace', 6.9239, 45.9327], ['Lac Blanc', 6.895, 45.9791], ['Les Houches', 6.798, 45.892]],
    itinerary: ['Arrivée et première balade', 'Journée visites', 'Journée libre'],
  },
  {
    id: 'berlin', name: 'Berlin', country: 'Allemagne', continent: 'Europe', start: '2025-06-06', end: '2025-06-08',
    owner: 'alex', emoji: '🎧', color: 'lavender', rotate: 6, memory: 'Le marché aux puces de Mauerpark avec Léa.',
    total: 410, photos: 7,
    pins: [['Mauerpark', 13.4025, 52.544], ['East Side Gallery', 13.4396, 52.505], ['Porte de Brandebourg', 13.3777, 52.5163], ['Kreuzberg', 13.403, 52.499]],
    itinerary: ['Arrivée et première balade', 'Journée visites', 'Journée libre'],
  },
]

/** Voyages communs de la frise, du plus ancien au plus récent. */
export const FRISE_IDS = ['crozon', 'mrk', 'cph', 'seville', 'rome']

const exp = (cat: CatId, label: string, amount: number, who: Payer, day: string, i: number): Expense => ({
  id: `rome-${i}`, cat, label, amount, who, day, at: i,
})
export const ROME_EXPENSES: Expense[] = [
  exp('transport', 'Vols Paris – Rome A/R', 286, 'alex', 'Jeu. 9 avril', 0),
  exp('logement', 'Appart à Trastevere · 4 nuits', 520, 'commun', 'Jeu. 9 avril', 1),
  exp('resto', 'Trattoria da Enzo', 64, 'antoine', 'Jeu. 9 avril', 2),
  exp('activites', 'Musées du Vatican', 58, 'alex', 'Ven. 10 avril', 3),
  exp('local', 'Pass métro 72 h', 36, 'antoine', 'Ven. 10 avril', 4),
  exp('courses', 'Supérette via della Scala', 23, 'antoine', 'Sam. 11 avril', 5),
  exp('shopping', 'Sandales en cuir', 85, 'alex', 'Dim. 12 avril', 6),
]

export const ROME_NOTEBOOK: Notebook = {
  mode: 'daily',
  pages: [
    { title: 'Arrivée à Trastevere', text: '', photos: [] },
    { title: 'Vatican', text: '', photos: [] },
    { title: 'Les 24 km', text: 'On a marché 24 km. Antoine dit que ça compte comme du sport.', author: 'alex', photos: [] },
    { title: 'Villa Borghese', text: 'Les vélos de la Villa Borghese avaient des freins… optionnels. Personne n’est tombé.', author: 'antoine', photos: [] },
    { title: 'Dernier jour', text: '', photos: [] },
  ],
}

const L = (k: string, v: string, alts: string[] = []): StepLine => ({ k, v, alts, locked: false })

type StepSeed = Omit<Step, 'proposals' | 'selected' | 'count' | 'filled' | 'status' | 'mode'>
const STEP_META: StepSeed[] = [
  { id: 'dest', emoji: '📍', color: 'honey', rotate: -4, title: 'Destination', kind: 'lines' },
  { id: 'dates', emoji: '📅', color: 'mist', rotate: 3, title: 'Dates', kind: 'lines' },
  { id: 'budget', emoji: '💶', color: 'sage', rotate: -6, title: 'Budget', kind: 'budget' },
  { id: 'vols', emoji: '✈️', color: 'mist', rotate: 5, title: 'Vols et transport', kind: 'lines', bookable: true },
  { id: 'logement', emoji: '🛏️', color: 'lavender', rotate: -3, title: 'Hébergement', kind: 'lines', bookable: true },
  { id: 'pack', emoji: '🧳', color: 'peach', rotate: 4, title: "Liste d'affaires", kind: 'pack' },
  { id: 'acts', emoji: '🎟️', color: 'honey', rotate: -5, title: 'Activités', kind: 'acts' },
  { id: 'itin', emoji: '🗺️', color: 'mint', rotate: 6, title: 'Itinéraire', kind: 'lines' },
  { id: 'docs', emoji: '📄', color: 'rose', rotate: -2, title: 'Documents', kind: 'lines' },
]
const meta = (id: Step['id']) => STEP_META.find((s) => s.id === id)!

const ZERO_BUDGET: Record<CatId, number> = { transport: 0, logement: 0, resto: 0, activites: 0, courses: 0, shopping: 0, local: 0 }

/** Les 9 étapes d'un nouveau voyage, vides. */
export function blankSteps(): Step[] {
  const lines: Partial<Record<Step['id'], string[]>> = {
    dest: ['Ville', 'Trajet', 'Météo', 'Pourquoi'],
    dates: ['Aller', 'Retour', 'Durée', 'Congés posés'],
    vols: ['Aller', 'Retour', 'Bagages', 'Prix'],
    logement: ['Quartier', 'Logement', 'Prix', 'Note'],
    itin: ['Jour 1', 'Jour 2', 'Jour 3'],
    docs: ["Pièce d'identité", 'Assurance', 'Billets', 'Réservation logement'],
  }
  return STEP_META.map((m) => ({
    ...m,
    mode: 'manual',
    status: 'todo',
    count: 1,
    selected: 0,
    filled: false,
    proposals: [(lines[m.id] ?? []).map((k) => L(k, ''))],
    ...(m.kind === 'budget' ? { budget: { ...ZERO_BUDGET } } : {}),
  }))
}

function lisbonSteps(): Step[] {
  return [
    {
      ...meta('dest'), mode: 'auto', status: 'ok', count: 3, selected: 0, filled: true,
      proposals: [
        [L('Ville', 'Lisbonne, Portugal'), L('Trajet', '2 h 35 de vol direct depuis Paris'), L('Météo fin novembre', '17 °C, quelques averses'), L('Pourquoi', 'Vous aimez marcher et manger dehors : collines, miradouros gratuits, pastéis.')],
        [L('Ville', 'Séville, Espagne'), L('Trajet', '2 h 15 de vol direct depuis Paris'), L('Météo fin novembre', '20 °C, ensoleillé'), L('Pourquoi', 'Il fait encore doux, tout se fait à pied, tapas le soir.')],
        [L('Ville', 'Naples, Italie'), L('Trajet', '2 h 20 de vol direct depuis Paris'), L('Météo fin novembre', '16 °C, variable'), L('Pourquoi', 'Après Rome, une Italie plus brute et la meilleure pizza.')],
      ],
    },
    {
      ...meta('dates'), mode: 'manual', status: 'ok', count: 1, selected: 0, filled: true,
      proposals: [[L('Aller', 'Jeudi 26 novembre', ['Vendredi 27 novembre']), L('Retour', 'Lundi 30 novembre', ['Mardi 1er décembre']), L('Durée', '5 j · 4 nuits'), L('Congés posés', 'Alex 2 j · Antoine 2 j')]],
    },
    {
      ...meta('budget'), mode: 'manual', status: 'wip', count: 1, selected: 0, filled: true, proposals: [[]],
      budget: { transport: 240, logement: 420, resto: 280, activites: 140, courses: 40, shopping: 40, local: 20 },
    },
    {
      ...meta('vols'), mode: 'auto', status: 'ia', count: 1, selected: 0, filled: true,
      proposals: [[
        L('Aller', 'Orly → Lisbonne · jeu. 26 · 9 h 40 → 11 h 15', ['CDG → Lisbonne · jeu. 26 · 7 h 05 → 8 h 40', 'Orly → Lisbonne · jeu. 26 · 13 h 20 → 14 h 55']),
        L('Retour', 'Lisbonne → Orly · lun. 30 · 19 h 05 → 22 h 35', ['Lisbonne → CDG · lun. 30 · 16 h 10 → 19 h 40', 'Lisbonne → Orly · lun. 30 · 21 h 30 → 0 h 55']),
        L('Bagages', 'Cabine 10 kg chacun', ['Cabine + une soute 23 kg partagée']),
        L('Prix', 'Env. 238 € pour deux · relevé le 2 nov.', ['Env. 196 € pour deux · relevé le 2 nov.', 'Env. 274 € pour deux · relevé le 2 nov.']),
      ]],
    },
    {
      ...meta('logement'), mode: 'auto', status: 'todo', count: 1, selected: 0, filled: false,
      proposals: [[
        L('Quartier', '', ['Alfama', 'Príncipe Real', 'Graça']),
        L('Logement', '', ['Appartement avec terrasse, 2 pers.', 'Chambre d’hôtes avec patio', 'Studio sous les toits']),
        L('Prix', '', ['Env. 410 € les 4 nuits', 'Env. 360 € les 4 nuits', 'Env. 470 € les 4 nuits']),
        L('Note', '', ['4,8 / 5 · 230 avis', '4,7 / 5 · 410 avis', '4,9 / 5 · 96 avis']),
      ]],
    },
    { ...meta('pack'), mode: 'auto', status: 'wip', count: 1, selected: 0, filled: true, proposals: [[]] },
    { ...meta('acts'), mode: 'auto', status: 'ia', count: 1, selected: 0, filled: true, proposals: [[]] },
    {
      ...meta('itin'), mode: 'auto', status: 'todo', count: 1, selected: 0, filled: false,
      proposals: [[
        L('Jour 1 · jeu. 26', '', ['Arrivée, Alfama à pied, dîner à Graça', 'Arrivée, Baixa et Chiado, dîner au Bairro Alto']),
        L('Jour 2 · ven. 27', '', ['Belém : tour, monastère, pastéis', 'LX Factory et bords du Tage à vélo']),
        L('Jour 3 · sam. 28', '', ['Sintra en train (40 min), palais de Pena', 'Cascais et plage de Guincho']),
        L('Jour 4 · dim. 29', '', ['Marché de Campo de Ourique, coucher de soleil au miradouro', 'Musée des azulejos, soirée fado']),
        L('Jour 5 · lun. 30', '', ['Dernier café à Príncipe Real, vol à 19 h 05', 'Feira da Ladra (si ouverte), vol à 19 h 05']),
      ]],
    },
    {
      ...meta('docs'), mode: 'manual', status: 'todo', count: 1, selected: 0, filled: true,
      proposals: [[L("Pièce d'identité", 'CNI valide · pas de visa (UE)'), L('Assurance', 'Carte bancaire · à vérifier'), L('Billets', 'À ajouter'), L('Réservation logement', 'À ajouter')]],
    },
  ]
}

const item = (label: string, done = false, tag = ''): PackItem => ({ label, done, tag })

const LISBON_ACTIVITIES: Activity[] = [
  { name: "Tram 28 jusqu'à Graça", price: '3 € / pers.', duration: '40 min', rating: '4,3', place: 'Martim Moniz', status: 0, day: 1, color: 'mist' },
  { name: 'Palais de Pena, Sintra', price: '20 € / pers.', duration: '3 h', rating: '4,7', place: 'Sintra', status: 1, day: 3, color: 'sage' },
  { name: 'Atelier pastéis de nata', price: '45 € / pers.', duration: '2 h', rating: '4,9', place: 'Chiado', status: 0, day: 2, color: 'peach' },
  { name: 'Coucher de soleil au miradouro da Senhora do Monte', price: 'Gratuit', duration: '1 h', rating: '4,8', place: 'Graça', status: 0, day: 4, color: 'coral' },
]

export function lisbonPrep(): PrepTrip {
  return {
    id: NEXT_TRIP_ID,
    name: 'Lisbonne',
    ideal: 1000,
    limit: 1400,
    steps: lisbonSteps(),
    pack: {
      alex: [item('Imperméable léger', true, 'météo'), item('Baskets confort', true, 'marche'), item('Maillot (au cas où)'), item('Chargeur + câble'), item('Trousse de toilette < 1 L', false, 'cabine')],
      antoine: [item('Pull chaud', true, 'soirées'), item('Chaussures de rando légères', false, 'Sintra'), item('Liseuse'), item('Trousse de toilette < 1 L', false, 'cabine')],
      commun: [item('Adaptateur ? Pas besoin (prises UE)', true), item('Parapluie pliant', false, 'météo'), item('Gourde'), item('Petite pharmacie'), item('Sac à dos du jour')],
    },
    packParams: ['Lisbonne · 17 °C, averses', '5 j', 'Bagage cabine 10 kg', 'Ville + rando à Sintra', 'Une liste par personne + une commune'],
    activities: LISBON_ACTIVITIES,
  }
}

export function blankPrep(id: string, name: string): PrepTrip {
  return {
    id,
    name,
    ideal: 1000,
    limit: 1400,
    steps: blankSteps(),
    pack: { alex: [], antoine: [], commun: [] },
    packParams: [],
    activities: [],
  }
}

export const PACK_TEMPLATES: { label: string; items: string[] }[] = [
  { label: 'Week-end ville', items: ['Plan de métro hors ligne'] },
  { label: 'Plage', items: ['Crème solaire', 'Serviette'] },
  { label: 'Rando', items: ['Frontale', 'Pansements ampoules'] },
]

export const ADJUSTMENTS = ['Moins cher', 'Plus calme', 'Plus court', 'Plus fun']

const READING = 'Relevé le 2 nov. à 6 h'
export const OFFERS: Offer[] = [
  { id: 1, type: 'Séjour', emoji: '🍷', color: 'coral', destination: 'Porto, Portugal', dates: 'Ven. 11 – lun. 14 décembre · 3 nuits', price: 389, per: 'pour deux, vol + hôtel', reading: READING, trip: '1 h 55 en avion', weather: '14 °C, nuageux', why: '32 % sous le prix habituel de décembre pour ce vol + hôtel.', shortcuts: ['wkvisite', 'city'], zones: ['Europe'], transport: 'Avion', hours: 2, temp: 14, nights: 3, themes: ['Culture'], when: [], visa: false, coord: [-8.61, 41.15] },
  { id: 2, type: 'Train', emoji: '🍫', color: 'peach', destination: 'Bruxelles, Belgique', dates: 'Sam. 21 – dim. 22 novembre', price: 98, per: 'A/R pour deux', reading: READING, trip: '1 h 22 en train', weather: '8 °C, pluie possible', why: 'Tarif le plus bas vu depuis septembre sur ce trajet.', shortcuts: ['wkparis', 'wkvisite', 'city', 'lastmin'], zones: ['Europe'], transport: 'Train', hours: 1.5, temp: 8, nights: 1, themes: ['Culture', 'Fête'], when: ['Ce mois-ci'], visa: false, coord: [4.35, 50.85] },
  { id: 3, type: 'Idée', emoji: '🦭', color: 'mist', destination: 'Baie de Somme', dates: "N'importe quel week-end de novembre", price: null, per: 'Idée sans prix', reading: '', trip: '2 h 30 en voiture', weather: '10 °C, vent', why: 'Saison des phoques et des grandes marées.', shortcuts: ['wkparis', 'wkchill', 'nature'], zones: ['France'], transport: 'Voiture', hours: 2.5, temp: 10, nights: 2, themes: ['Nature', 'Repos'], when: ['Ce week-end', 'Ce mois-ci'], visa: false, coord: [1.55, 50.2] },
  { id: 4, type: 'Vol', emoji: '🌋', color: 'honey', destination: 'Tenerife, Espagne', dates: 'Sam. 6 – sam. 13 février · 7 nuits', price: 268, per: 'A/R pour deux', reading: READING, trip: '4 h 20 en avion', weather: '22 °C, soleil', why: 'Vol direct à moins de 135 € par personne en plein hiver.', shortcuts: ['semaine', 'soleil'], zones: ['Europe'], transport: 'Avion', hours: 4.5, temp: 22, nights: 7, themes: ['Nature', 'Repos'], when: [], visa: false, coord: [-16.25, 28.47] },
  { id: 5, type: 'Hôtel', emoji: '🌊', color: 'mint', destination: 'Étretat, Normandie', dates: 'Sam. 14 novembre · 1 nuit', price: 118, per: 'la nuit, vue mer', reading: READING, trip: '2 h 45 en voiture', weather: '11 °C, éclaircies', why: "Chambre vue mer 40 % moins chère qu'en été.", shortcuts: ['wkparis', 'wkchill', 'nature'], zones: ['France'], transport: 'Voiture', hours: 2.75, temp: 11, nights: 1, themes: ['Nature', 'Repos'], when: ['Ce week-end', 'Ce mois-ci'], visa: false, coord: [0.2, 49.7] },
  { id: 6, type: 'Activité', emoji: '🎻', color: 'lavender', destination: 'Vienne, Autriche', dates: 'Concert du jeudi 31 décembre', price: 140, per: 'pour deux', reading: READING, trip: '2 h 05 en avion', weather: '1 °C, sec', why: 'Places encore disponibles pour un concert classique du 31.', shortcuts: ['city', 'wkvisite'], zones: ['Europe'], transport: 'Avion', hours: 2, temp: 1, nights: 2, themes: ['Culture', 'Fête'], when: [], visa: false, coord: [16.37, 48.21] },
  { id: 7, type: 'Vol', emoji: '🌸', color: 'rose', destination: 'Tokyo, Japon', dates: 'Mars 2027 · dates flexibles', price: 1190, per: 'A/R pour deux', reading: READING, trip: '14 h 30 avec escale', weather: '14 °C, cerisiers fin mars', why: "Le plus bas relevé pour mars depuis le début de l'année.", shortcuts: ['long'], zones: ['Monde'], transport: 'Avion', hours: 14.5, temp: 14, nights: 10, themes: ['Culture'], when: ["N'importe quand en mars"], visa: false },
  { id: 8, type: 'Séjour', emoji: '🍕', color: 'coral', destination: 'Naples, Italie', dates: 'Jeu. 19 – dim. 22 novembre', price: 312, per: 'pour deux, vol + B&B', reading: READING, trip: '2 h 20 en avion', weather: '18 °C, soleil', why: 'Départ dans quelques jours, places restantes bradées.', shortcuts: ['lastmin', 'city', 'wkvisite'], zones: ['Europe', 'Méditerranée'], transport: 'Avion', hours: 2.5, temp: 18, nights: 3, themes: ['Culture'], when: ['Ce mois-ci'], visa: false, coord: [14.27, 40.85] },
  { id: 9, type: 'Train', emoji: '🏞️', color: 'sage', destination: 'Annecy', dates: 'Sam. 5 – dim. 6 décembre', price: 124, per: 'A/R pour deux', reading: READING, trip: '3 h 40 en train', weather: '3 °C, neige possible', why: "Prix d'avant les vacances scolaires.", shortcuts: ['nature', 'wkchill'], zones: ['France'], transport: 'Train', hours: 3.75, temp: 3, nights: 1, themes: ['Nature', 'Repos'], when: [], visa: false, coord: [6.13, 45.9] },
]

export const SHORTCUTS: { id: string; label: string }[] = [
  { id: 'all', label: 'Tout' },
  { id: 'saved', label: '♥ Enregistrées' },
  { id: 'wkparis', label: 'Escapade autour de Paris' },
  { id: 'wkvisite', label: 'Week-end visite' },
  { id: 'wkchill', label: 'Week-end chill' },
  { id: 'semaine', label: 'Semaine de vacances' },
  { id: 'city', label: 'City trip en Europe' },
  { id: 'soleil', label: 'Soleil / plage' },
  { id: 'nature', label: 'Nature et rando' },
  { id: 'long', label: 'Long-courrier' },
  { id: 'lastmin', label: 'Dernière minute' },
]
/** Raccourcis visibles d'emblée ; les suivants sont derrière « Plus ». */
export const SHORTCUTS_VISIBLE = 5

export interface FilterGroup {
  id: string
  title: string
  options: string[]
  multi?: boolean
}
export const FILTER_GROUPS: FilterGroup[] = [
  { id: 'budget', title: 'Budget max', options: ['200 €', '500 €', '1 000 €', 'Sans limite'] },
  { id: 'per', title: 'Budget compté', options: ['Par personne', 'Pour deux'] },
  { id: 'zone', title: 'Zone', options: ['France', 'Europe', 'Méditerranée', 'Monde'], multi: true },
  { id: 'quand', title: 'Quand', options: ['Ce week-end', 'Ce mois-ci', "N'importe quand en mars", 'Dates précises'] },
  { id: 'duree', title: 'Durée', options: ['Week-end', '3-4 j', 'Une semaine', '10 j et plus'] },
  { id: 'theme', title: 'Thème', options: ['Culture', 'Nature', 'Fête', 'Repos'], multi: true },
  { id: 'trajet', title: 'Temps de trajet max', options: ['2 h', '4 h', '8 h', 'Peu importe'] },
  { id: 'mode', title: 'Transport', options: ['Avion', 'Train', 'Voiture'], multi: true },
  { id: 'meteo', title: 'Météo', options: ['Chaud, + 20 °C', 'Doux', 'Peu importe'] },
  { id: 'visa', title: 'Visa', options: ['Sans visa uniquement', 'Peu importe'] },
]

export const ORIGINS = ['Paris', 'Lyon', 'Bordeaux', 'Lille']

export const HOME_SECTIONS: Record<HomeSectionId, { label: string; description: string }> = {
  prep: { label: 'À préparer ensuite', description: 'L’étape suggérée du prochain voyage' },
  frise: { label: 'Notre frise', description: 'Les voyages communs en un coup d’œil' },
  saved: { label: 'Destinations enregistrées', description: 'Tes coups de cœur de Discover' },
  souv: { label: 'Dernier souvenir', description: 'Le souvenir préféré du dernier voyage' },
  solde: { label: 'Comptes du dernier voyage', description: 'Qui doit quoi' },
  budget: { label: 'Budget du prochain voyage', description: 'Prévu, idéal et limite' },
}

export const TODAY_PROGRAM: { time: string; label: string; state: 'past' | 'now' | 'next' }[] = [
  { time: '9 h 40', label: 'Vol Orly → Lisbonne', state: 'past' },
  { time: '13 h', label: 'Arrivée à l’appart, Alfama', state: 'now' },
  { time: '16 h', label: 'Balade Alfama et miradouro de Santa Luzia', state: 'next' },
  { time: '20 h 30', label: 'Dîner à Graça', state: 'next' },
]

export const DOCUMENTS: { emoji: string; color: StickerColor; label: string }[] = [
  { emoji: '✈️', color: 'mist', label: 'Billets d’avion · 2 PDF' },
  { emoji: '🛏️', color: 'lavender', label: 'Réservation logement' },
  { emoji: '🛡️', color: 'sage', label: 'Assurance voyage' },
  { emoji: '🪪', color: 'peach', label: 'Cartes d’identité' },
]

/** Ordre des 9 étapes de préparation. */
export const STEP_ORDER: Step['id'][] = ['dest', 'dates', 'budget', 'vols', 'logement', 'pack', 'acts', 'itin', 'docs']

export const DEFAULT_PREFS = {
  saved: [] as number[],
  dismissed: [] as number[],
  homeOrder: ['prep', 'frise', 'saved', 'souv', 'solde', 'budget'] as HomeSectionId[],
  homeOn: { prep: true, frise: true, saved: true } as Partial<Record<HomeSectionId, boolean>>,
  origin: 'Paris',
  lastCat: 'resto' as CatId,
  filters: { per: ['Pour deux'] } as Record<string, string[]>,
}
