import type {
  GoogleBusinessProfileData,
  BusinessProfile,
  BusinessCategory,
  BusinessHours,
  SpecialHours,
  BusinessAttribute,
  BusinessPhoto,
  BusinessService,
  Review,
  ReviewStats,
  BusinessInsights,
  BusinessPost,
  ChecklistItem,
  ProfileScore,
  GoogleBusinessConnection,
} from './types'

// ============================================
// MOCK: Verbindungsstatus
// ============================================
export const MOCK_CONNECTION_CONNECTED: GoogleBusinessConnection = {
  status: 'connected',
  accountEmail: 'salon@hairstyle-studio.de',
  locationId: 'accounts/123456789/locations/987654321',
  locationName: 'Hair & Style Studio - München',
  connectedAt: new Date('2025-10-15'),
  expiresAt: new Date('2026-10-15'),
}

export const MOCK_CONNECTION_NOT_CONNECTED: GoogleBusinessConnection = {
  status: 'not_connected',
}

// ============================================
// MOCK: Profil-Daten
// ============================================
export const MOCK_PROFILE: BusinessProfile = {
  id: '987654321',
  name: 'Hair & Style Studio',
  address: 'Hauptstraße 42, 80331 München',
  phone: '+49 89 12345678',
  website: 'https://hairstyle-studio.de',
  description: 'Ihr Experte für moderne Haarschnitte, Balayage und Extensions in München. Unser erfahrenes Team verwöhnt Sie in entspannter Atmosphäre mit den neuesten Trends und klassischen Styles.',
  descriptionLength: 195, // sollte mind. 750 sein!
  isConnected: true,
  lastSyncedAt: new Date(),
}

export const MOCK_CATEGORIES: BusinessCategory = {
  primary: 'Friseursalon',
  secondary: ['Beauty-Salon', 'Haarverlängerung'],
}

export const MOCK_HOURS: BusinessHours[] = [
  { day: 'monday', open: '09:00', close: '18:00', isClosed: false },
  { day: 'tuesday', open: '09:00', close: '18:00', isClosed: false },
  { day: 'wednesday', open: '09:00', close: '20:00', isClosed: false },
  { day: 'thursday', open: '09:00', close: '20:00', isClosed: false },
  { day: 'friday', open: '09:00', close: '18:00', isClosed: false },
  { day: 'saturday', open: '09:00', close: '14:00', isClosed: false },
  { day: 'sunday', open: null, close: null, isClosed: true },
]

export const MOCK_SPECIAL_HOURS: SpecialHours[] = [
  // Keine Feiertage eingetragen - das ist ein Problem!
]

export const MOCK_ATTRIBUTES: BusinessAttribute[] = [
  { id: 'wheelchair_accessible', name: 'Barrierefrei', value: true, icon: 'Accessibility' },
  { id: 'wifi', name: 'Kostenloses WLAN', value: true, icon: 'Wifi' },
  { id: 'appointments_required', name: 'Termin erforderlich', value: false, icon: 'Calendar' },
  { id: 'credit_cards', name: 'Kartenzahlung', value: true, icon: 'CreditCard' },
  { id: 'parking', name: 'Parkplätze', value: true, icon: 'Car' },
]

// ============================================
// MOCK: Fotos (unvollständig!)
// ============================================
export const MOCK_PHOTOS: BusinessPhoto[] = [
  {
    id: 'logo-1',
    url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    type: 'logo',
    uploadedAt: new Date('2025-06-01'),
    description: 'Salon Logo',
  },
  // KEIN COVER! Das ist ein Problem
  {
    id: 'interior-1',
    url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800',
    type: 'interior',
    uploadedAt: new Date('2025-06-15'),
    description: 'Salon Innenraum',
  },
  {
    id: 'work-1',
    url: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800',
    type: 'work',
    uploadedAt: new Date('2025-08-20'),
    description: 'Balayage Ergebnis',
  },
  {
    id: 'work-2',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
    type: 'work',
    uploadedAt: new Date('2025-09-10'),
    description: 'Hochsteckfrisur',
  },
]

// ============================================
// MOCK: Services
// ============================================
export const MOCK_SERVICES: BusinessService[] = [
  {
    id: 'service-1',
    name: 'Damenhaarschnitt',
    description: 'Waschen, Schneiden, Föhnen',
    price: 'ab 45 €',
    priceType: 'starting_from',
    duration: '60 Min',
  },
  {
    id: 'service-2',
    name: 'Herrenhaarschnitt',
    description: 'Waschen, Schneiden, Styling',
    price: '28 €',
    priceType: 'fixed',
    duration: '30 Min',
  },
  {
    id: 'service-3',
    name: 'Balayage',
    description: 'Natürliche Farbverläufe',
    price: '120 - 180 €',
    priceType: 'range',
    duration: '180 Min',
  },
  {
    id: 'service-4',
    name: 'Extensions',
    description: 'Tape-In oder Bonding',
    price: 'ab 350 €',
    priceType: 'starting_from',
    duration: '240 Min',
  },
  {
    id: 'service-5',
    name: 'Hochsteckfrisur',
    description: 'Für besondere Anlässe',
    price: '65 - 95 €',
    priceType: 'range',
    duration: '60 Min',
  },
]

// ============================================
// MOCK: Reviews (mit unbeantworteten!)
// ============================================
export const MOCK_REVIEWS: Review[] = [
  {
    id: 'review-1',
    author: 'Maria S.',
    authorPhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    rating: 5,
    text: 'Absolut zufrieden! Lisa hat meine Haare perfekt gefärbt. Das Balayage sieht super natürlich aus. Werde definitiv wiederkommen!',
    date: new Date('2025-12-14'),
    isNew: true,
  },
  {
    id: 'review-2',
    author: 'Thomas K.',
    rating: 2,
    text: 'Lange Wartezeit trotz Termin. Das Ergebnis war okay, aber für den Preis hätte ich mehr erwartet. Der Service war etwas unpersönlich.',
    date: new Date('2025-12-12'),
    isNew: true,
  },
  {
    id: 'review-3',
    author: 'Sandra M.',
    authorPhotoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    rating: 5,
    text: 'Bester Salon in München! Komme seit 2 Jahren hierher und bin immer begeistert. Das Team ist super freundlich und kompetent.',
    date: new Date('2025-12-10'),
    reply: {
      text: 'Vielen Dank für dein tolles Feedback, Sandra! Es freut uns sehr, dass du so zufrieden bist. Bis bald!',
      date: new Date('2025-12-11'),
    },
    isNew: false,
  },
  {
    id: 'review-4',
    author: 'Julia R.',
    rating: 4,
    text: 'Schöner Haarschnitt, gute Beratung. Einziger Minuspunkt: etwas laut durch die Musik. Aber das Ergebnis stimmt!',
    date: new Date('2025-12-05'),
    reply: {
      text: 'Danke für dein Feedback, Julia! Wir nehmen den Hinweis zur Musik gerne auf. Freut uns, dass dir der Schnitt gefällt!',
      date: new Date('2025-12-06'),
    },
    isNew: false,
  },
  {
    id: 'review-5',
    author: 'Michael B.',
    authorPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    rating: 5,
    text: 'Top Service! Als Mann fühlt man sich hier genauso gut aufgehoben. Schneller Termin, professioneller Schnitt.',
    date: new Date('2025-12-01'),
    reply: {
      text: 'Danke Michael! Schön zu hören, dass du dich bei uns wohlgefühlt hast. Bis zum nächsten Mal!',
      date: new Date('2025-12-02'),
    },
    isNew: false,
  },
  {
    id: 'review-6',
    author: 'Anna L.',
    rating: 1,
    text: 'Leider sehr enttäuscht. Die Farbe ist komplett anders geworden als besprochen. Musste nochmal woanders hingehen.',
    date: new Date('2025-11-28'),
    isNew: false,
    // UNBEANTWORTET - kritisch!
  },
  {
    id: 'review-7',
    author: 'Peter H.',
    rating: 5,
    text: 'Klasse Laden! Die Extensions sehen mega natürlich aus. Preis-Leistung stimmt absolut.',
    date: new Date('2025-11-25'),
    reply: {
      text: 'Vielen Dank Peter! Es freut uns, dass du mit deinen Extensions happy bist!',
      date: new Date('2025-11-26'),
    },
    isNew: false,
  },
]

export const MOCK_REVIEW_STATS: ReviewStats = {
  average: 4.3,
  total: 47,
  distribution: {
    5: 28,
    4: 12,
    3: 4,
    2: 2,
    1: 1,
  },
  unanswered: 3,
  newCount: 2,
}

// ============================================
// MOCK: Insights
// ============================================
export const MOCK_INSIGHTS: BusinessInsights = {
  period: '28d',
  views: { current: 1234, previous: 1089, change: 13.3 },
  searches: { current: 456, previous: 412, change: 10.7 },
  websiteClicks: { current: 89, previous: 76, change: 17.1 },
  phoneClicks: { current: 34, previous: 29, change: 17.2 },
  directionRequests: { current: 67, previous: 58, change: 15.5 },
  bookingClicks: { current: 23, previous: 18, change: 27.8 },
}

// ============================================
// MOCK: Posts
// ============================================
export const MOCK_POSTS: BusinessPost[] = [
  {
    id: 'post-1',
    type: 'offer',
    title: 'Winterspecial: 20% auf Balayage',
    content: 'Hol dir jetzt dein Balayage zum Sonderpreis! Nur noch bis Ende Dezember. Termin vereinbaren unter 089 12345678.',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
    ctaType: 'book',
    ctaUrl: 'https://hairstyle-studio.de/termin',
    startDate: new Date('2025-12-01'),
    endDate: new Date('2025-12-31'),
    publishedAt: new Date('2025-12-01'),
    views: 234,
    clicks: 18,
  },
]

// ============================================
// MOCK: Checkliste & Score
// ============================================
export const MOCK_CHECKLIST: ChecklistItem[] = [
  {
    id: 'check-basics',
    title: 'Grunddaten vollständig',
    description: 'Name, Adresse, Telefon und Website sind eingetragen',
    category: 'basics',
    status: 'complete',
    weight: 20,
  },
  {
    id: 'check-hours',
    title: 'Öffnungszeiten aktuell',
    description: 'Reguläre Öffnungszeiten sind gepflegt',
    category: 'basics',
    status: 'complete',
    weight: 10,
  },
  {
    id: 'check-special-hours',
    title: 'Feiertage eintragen',
    description: 'Keine Sonderöffnungszeiten für Feiertage hinterlegt',
    category: 'basics',
    status: 'warning',
    weight: 5,
    actionUrl: '/stylist/marketing/google-business/profile',
    actionLabel: 'Eintragen',
  },
  {
    id: 'check-description',
    title: 'Beschreibung optimieren',
    description: 'Nur 195 von empfohlenen 750 Zeichen genutzt',
    category: 'basics',
    status: 'warning',
    weight: 15,
    actionUrl: '/stylist/marketing/google-business/profile',
    actionLabel: 'Verbessern',
  },
  {
    id: 'check-cover',
    title: 'Titelbild hochladen',
    description: 'Kein Titelbild für dein Profil vorhanden',
    category: 'photos',
    status: 'incomplete',
    weight: 10,
    actionUrl: '/stylist/marketing/google-business/photos',
    actionLabel: 'Hochladen',
  },
  {
    id: 'check-photos',
    title: 'Mehr Fotos hinzufügen',
    description: 'Nur 4 von 10 empfohlenen Fotos hochgeladen',
    category: 'photos',
    status: 'warning',
    weight: 10,
    actionUrl: '/stylist/marketing/google-business/photos',
    actionLabel: 'Hinzufügen',
  },
  {
    id: 'check-reviews',
    title: 'Bewertungen beantworten',
    description: '3 Bewertungen warten auf eine Antwort',
    category: 'reviews',
    status: 'incomplete',
    weight: 15,
    actionUrl: '/stylist/marketing/google-business/reviews',
    actionLabel: 'Beantworten',
  },
  {
    id: 'check-critical-review',
    title: 'Kritische Bewertung!',
    description: 'Eine 1-Stern Bewertung ist unbeantwortet',
    category: 'reviews',
    status: 'incomplete',
    weight: 5,
    actionUrl: '/stylist/marketing/google-business/reviews',
    actionLabel: 'Jetzt antworten',
  },
  {
    id: 'check-posts',
    title: 'Mehr Posts veröffentlichen',
    description: 'Nur 1 Post in den letzten 30 Tagen (empfohlen: 2+)',
    category: 'posts',
    status: 'warning',
    weight: 10,
    actionUrl: '/stylist/marketing/google-business/posts',
    actionLabel: 'Post erstellen',
  },
]

export const MOCK_SCORE: ProfileScore = {
  total: 67,
  breakdown: {
    basics: 85,
    categories: 100,
    hours: 80,
    description: 40,
    photos: 50,
    reviews: 65,
    posts: 50,
  },
}

// ============================================
// Komplettes Mock-Profil
// ============================================
export const MOCK_GOOGLE_BUSINESS_DATA: GoogleBusinessProfileData = {
  connection: MOCK_CONNECTION_CONNECTED,
  profile: MOCK_PROFILE,
  categories: MOCK_CATEGORIES,
  hours: MOCK_HOURS,
  specialHours: MOCK_SPECIAL_HOURS,
  attributes: MOCK_ATTRIBUTES,
  photos: MOCK_PHOTOS,
  services: MOCK_SERVICES,
  reviews: MOCK_REVIEWS,
  reviewStats: MOCK_REVIEW_STATS,
  insights: MOCK_INSIGHTS,
  posts: MOCK_POSTS,
  score: MOCK_SCORE,
  checklist: MOCK_CHECKLIST,
}

// Nicht verbundenes Profil
export const MOCK_GOOGLE_BUSINESS_NOT_CONNECTED: GoogleBusinessProfileData = {
  connection: MOCK_CONNECTION_NOT_CONNECTED,
  profile: null,
  categories: null,
  hours: [],
  specialHours: [],
  attributes: [],
  photos: [],
  services: [],
  reviews: [],
  reviewStats: null,
  insights: null,
  posts: [],
  score: null,
  checklist: [],
}

// ============================================
// AI-Antwort-Vorschläge für Reviews
// ============================================
export const AI_REPLY_SUGGESTIONS: Record<string, string> = {
  'review-1': 'Vielen Dank für deine tolle Bewertung, Maria! Es freut uns sehr, dass du mit deinem Balayage so zufrieden bist. Lisa wird sich über das Lob freuen! Wir freuen uns auf deinen nächsten Besuch.',
  'review-2': 'Vielen Dank für dein ehrliches Feedback, Thomas. Es tut uns leid zu hören, dass du warten musstest und das Erlebnis nicht deinen Erwartungen entsprochen hat. Wir nehmen deine Kritik sehr ernst und arbeiten daran, unsere Terminplanung zu verbessern. Gerne möchten wir dich zu einem erneuten Besuch einladen – melde dich bei uns und wir finden eine Lösung.',
  'review-6': 'Liebe Anna, es tut uns wirklich sehr leid, dass das Farbergebnis nicht deinen Vorstellungen entsprochen hat. Das ist natürlich nicht unser Anspruch. Wir würden das gerne wieder gutmachen und laden dich herzlich zu einer kostenlosen Korrektur ein. Bitte kontaktiere uns direkt unter 089 12345678, damit wir einen Termin vereinbaren können.',
}

// ============================================
// Helper: Score berechnen (für echte Implementierung)
// ============================================
export function calculateProfileScore(data: GoogleBusinessProfileData): number {
  if (!data.profile) return 0

  let score = 0

  // Grunddaten (20%)
  if (data.profile.name) score += 5
  if (data.profile.address) score += 5
  if (data.profile.phone) score += 5
  if (data.profile.website) score += 5

  // Kategorien (10%)
  if (data.categories?.primary) score += 5
  if (data.categories?.secondary && data.categories.secondary.length > 0) score += 5

  // Öffnungszeiten (10%)
  if (data.hours.length > 0) score += 7
  if (data.specialHours.length > 0) score += 3

  // Beschreibung (15%)
  const descLength = data.profile.descriptionLength || 0
  if (descLength >= 750) score += 15
  else if (descLength >= 500) score += 10
  else if (descLength >= 250) score += 5
  else if (descLength > 0) score += 2

  // Fotos (20%)
  const photoCount = data.photos.length
  const hasCover = data.photos.some((p) => p.type === 'cover')
  const hasLogo = data.photos.some((p) => p.type === 'logo')
  if (hasLogo) score += 5
  if (hasCover) score += 5
  score += Math.min(10, photoCount)

  // Reviews (15%)
  if (data.reviewStats) {
    if (data.reviewStats.average >= 4.5) score += 10
    else if (data.reviewStats.average >= 4.0) score += 7
    else if (data.reviewStats.average >= 3.5) score += 5
    else score += 2

    if (data.reviewStats.unanswered === 0) score += 5
    else if (data.reviewStats.unanswered <= 2) score += 2
  }

  // Posts (10%)
  const recentPosts = data.posts.filter((p) => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return p.publishedAt >= thirtyDaysAgo
  }).length
  if (recentPosts >= 4) score += 10
  else if (recentPosts >= 2) score += 7
  else if (recentPosts >= 1) score += 4

  return Math.min(100, score)
}

// ============================================
// Export Index
// ============================================
export * from './types'

