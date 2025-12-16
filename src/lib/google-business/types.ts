// Google Business Profile Types

export interface BusinessProfile {
  id: string
  name: string
  address: string
  phone: string
  website: string | null
  description: string
  descriptionLength: number
  isConnected: boolean
  lastSyncedAt: Date | null
}

export interface BusinessCategory {
  primary: string
  secondary: string[]
}

export interface BusinessHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  open: string | null
  close: string | null
  isClosed: boolean
}

export interface SpecialHours {
  date: string
  open: string | null
  close: string | null
  isClosed: boolean
  description?: string
}

export interface BusinessAttribute {
  id: string
  name: string
  value: boolean
  icon?: string
}

export interface BusinessPhoto {
  id: string
  url: string
  type: 'logo' | 'cover' | 'team' | 'interior' | 'work' | 'other'
  uploadedAt: Date
  description?: string
}

export interface BusinessService {
  id: string
  name: string
  description?: string
  price?: string
  priceType: 'fixed' | 'range' | 'starting_from' | 'free'
  duration?: string
}

export interface Review {
  id: string
  author: string
  authorPhotoUrl?: string
  rating: 1 | 2 | 3 | 4 | 5
  text: string
  date: Date
  reply?: ReviewReply
  isNew: boolean
}

export interface ReviewReply {
  text: string
  date: Date
}

export interface ReviewStats {
  average: number
  total: number
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
  unanswered: number
  newCount: number
}

export interface InsightMetric {
  current: number
  previous: number
  change: number // percentage
}

export interface BusinessInsights {
  period: '7d' | '28d' | '90d'
  views: InsightMetric
  searches: InsightMetric
  websiteClicks: InsightMetric
  phoneClicks: InsightMetric
  directionRequests: InsightMetric
  bookingClicks?: InsightMetric
}

export interface BusinessPost {
  id: string
  type: 'update' | 'offer' | 'event'
  title?: string
  content: string
  imageUrl?: string
  ctaType?: 'book' | 'order' | 'learn_more' | 'call' | 'none'
  ctaUrl?: string
  startDate?: Date
  endDate?: Date
  publishedAt: Date
  views: number
  clicks: number
}

export interface ChecklistItem {
  id: string
  title: string
  description: string
  category: 'basics' | 'photos' | 'reviews' | 'posts' | 'services'
  status: 'complete' | 'warning' | 'incomplete'
  weight: number // 0-100 contribution to score
  actionUrl?: string
  actionLabel?: string
}

export interface ProfileScore {
  total: number
  breakdown: {
    basics: number
    categories: number
    hours: number
    description: number
    photos: number
    reviews: number
    posts: number
  }
}

// Connection Status
export type ConnectionStatus = 'connected' | 'not_connected' | 'expired' | 'error'

export interface GoogleBusinessConnection {
  status: ConnectionStatus
  accountEmail?: string
  locationId?: string
  locationName?: string
  connectedAt?: Date
  expiresAt?: Date
  errorMessage?: string
}

// API Response Types
export interface GoogleBusinessProfileData {
  connection: GoogleBusinessConnection
  profile: BusinessProfile | null
  categories: BusinessCategory | null
  hours: BusinessHours[]
  specialHours: SpecialHours[]
  attributes: BusinessAttribute[]
  photos: BusinessPhoto[]
  services: BusinessService[]
  reviews: Review[]
  reviewStats: ReviewStats | null
  insights: BusinessInsights | null
  posts: BusinessPost[]
  score: ProfileScore | null
  checklist: ChecklistItem[]
}

// Action Types
export interface ReplyToReviewRequest {
  reviewId: string
  text: string
}

export interface CreatePostRequest {
  type: 'update' | 'offer' | 'event'
  title?: string
  content: string
  imageUrl?: string
  ctaType?: 'book' | 'order' | 'learn_more' | 'call' | 'none'
  ctaUrl?: string
  startDate?: string
  endDate?: string
}

export interface UpdateProfileRequest {
  name?: string
  phone?: string
  website?: string
  description?: string
}

export interface UpdateHoursRequest {
  hours: BusinessHours[]
  specialHours?: SpecialHours[]
}

