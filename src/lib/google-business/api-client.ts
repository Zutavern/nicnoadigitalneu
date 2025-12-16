import { googleBusinessTokenService } from './token-service'
import type {
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
  GoogleBusinessProfileData,
  GoogleBusinessConnection,
  ReplyToReviewRequest,
  CreatePostRequest,
  UpdateProfileRequest,
  UpdateHoursRequest,
} from './types'

const MY_BUSINESS_API_BASE = 'https://mybusinessbusinessinformation.googleapis.com/v1'
const MY_BUSINESS_ACCOUNTS_API = 'https://mybusinessaccountmanagement.googleapis.com/v1'
const MY_BUSINESS_REVIEWS_API = 'https://mybusiness.googleapis.com/v4'
const MY_BUSINESS_PERFORMANCE_API = 'https://businessprofileperformance.googleapis.com/v1'

interface ApiError {
  code: number
  message: string
  status: string
}

export class GoogleBusinessApiClient {
  private userId: string
  private accessToken: string | null = null
  private connectionId: string | null = null

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Initialize the client by getting valid tokens
   */
  async initialize(): Promise<boolean> {
    const result = await googleBusinessTokenService.getValidTokensForUser(this.userId)
    if (!result) {
      return false
    }
    this.accessToken = result.accessToken
    this.connectionId = result.connectionId
    return true
  }

  /**
   * Make an authenticated API request
   */
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.accessToken) {
      throw new Error('Client not initialized. Call initialize() first.')
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        code: response.status,
        message: response.statusText,
        status: 'ERROR',
      }))
      throw new Error(`Google API Error: ${error.message}`)
    }

    return response.json()
  }

  /**
   * Get list of accounts/locations the user has access to
   */
  async getLocations(): Promise<Array<{ id: string; name: string; address: string }>> {
    interface AccountsResponse {
      accounts: Array<{ name: string; accountName: string; type: string }>
    }

    interface LocationsResponse {
      locations: Array<{
        name: string
        title: string
        storefrontAddress?: {
          addressLines?: string[]
          locality?: string
          postalCode?: string
        }
      }>
    }

    // First get accounts
    const accountsData = await this.request<AccountsResponse>(
      `${MY_BUSINESS_ACCOUNTS_API}/accounts`
    )

    const locations: Array<{ id: string; name: string; address: string }> = []

    // For each account, get locations
    for (const account of accountsData.accounts || []) {
      try {
        const locationsData = await this.request<LocationsResponse>(
          `${MY_BUSINESS_API_BASE}/${account.name}/locations?readMask=name,title,storefrontAddress`
        )

        for (const location of locationsData.locations || []) {
          const addressParts = [
            ...(location.storefrontAddress?.addressLines || []),
            location.storefrontAddress?.postalCode,
            location.storefrontAddress?.locality,
          ].filter(Boolean)

          locations.push({
            id: location.name,
            name: location.title,
            address: addressParts.join(', '),
          })
        }
      } catch (error) {
        console.error(`Error fetching locations for account ${account.name}:`, error)
      }
    }

    return locations
  }

  /**
   * Get profile data for the connected location
   */
  async getProfile(): Promise<BusinessProfile | null> {
    const { prisma } = await import('@/lib/prisma')
    
    const connection = await prisma.googleBusinessConnection.findFirst({
      where: { userId: this.userId },
    })

    if (!connection) return null

    interface LocationResponse {
      name: string
      title: string
      storefrontAddress?: {
        addressLines?: string[]
        locality?: string
        postalCode?: string
        regionCode?: string
      }
      phoneNumbers?: {
        primaryPhone?: string
      }
      websiteUri?: string
      profile?: {
        description?: string
      }
      metadata?: {
        mapsUri?: string
      }
    }

    const data = await this.request<LocationResponse>(
      `${MY_BUSINESS_API_BASE}/${connection.locationId}?readMask=name,title,storefrontAddress,phoneNumbers,websiteUri,profile,metadata`
    )

    const addressParts = [
      ...(data.storefrontAddress?.addressLines || []),
      data.storefrontAddress?.postalCode,
      data.storefrontAddress?.locality,
    ].filter(Boolean)

    return {
      id: data.name,
      name: data.title,
      address: addressParts.join(', '),
      phone: data.phoneNumbers?.primaryPhone || '',
      website: data.websiteUri || null,
      description: data.profile?.description || '',
      descriptionLength: data.profile?.description?.length || 0,
      isConnected: true,
      lastSyncedAt: connection.lastSyncedAt,
    }
  }

  /**
   * Update profile information
   */
  async updateProfile(updates: UpdateProfileRequest): Promise<void> {
    const { prisma } = await import('@/lib/prisma')
    
    const connection = await prisma.googleBusinessConnection.findFirst({
      where: { userId: this.userId },
    })

    if (!connection) throw new Error('No connection found')

    interface UpdateData {
      title?: string
      phoneNumbers?: { primaryPhone: string }
      websiteUri?: string
      profile?: { description: string }
    }

    const updateData: UpdateData = {}
    const updateMask: string[] = []

    if (updates.name) {
      updateData.title = updates.name
      updateMask.push('title')
    }
    if (updates.phone) {
      updateData.phoneNumbers = { primaryPhone: updates.phone }
      updateMask.push('phoneNumbers.primaryPhone')
    }
    if (updates.website) {
      updateData.websiteUri = updates.website
      updateMask.push('websiteUri')
    }
    if (updates.description) {
      updateData.profile = { description: updates.description }
      updateMask.push('profile.description')
    }

    await this.request(
      `${MY_BUSINESS_API_BASE}/${connection.locationId}?updateMask=${updateMask.join(',')}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      }
    )
  }

  /**
   * Get reviews for the location
   */
  async getReviews(pageSize = 50): Promise<{ reviews: Review[]; stats: ReviewStats }> {
    const { prisma } = await import('@/lib/prisma')
    
    const connection = await prisma.googleBusinessConnection.findFirst({
      where: { userId: this.userId },
    })

    if (!connection) throw new Error('No connection found')

    interface GoogleReview {
      name: string
      reviewId: string
      reviewer: {
        displayName: string
        profilePhotoUrl?: string
      }
      starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE'
      comment?: string
      createTime: string
      updateTime: string
      reviewReply?: {
        comment: string
        updateTime: string
      }
    }

    interface ReviewsResponse {
      reviews: GoogleReview[]
      averageRating: number
      totalReviewCount: number
    }

    // Convert location ID format for reviews API
    const locationPath = connection.locationId.replace('locations/', 'accounts/{accountId}/locations/')
    
    const data = await this.request<ReviewsResponse>(
      `${MY_BUSINESS_REVIEWS_API}/${connection.locationId}/reviews?pageSize=${pageSize}`
    )

    const ratingMap: Record<string, 1 | 2 | 3 | 4 | 5> = {
      ONE: 1,
      TWO: 2,
      THREE: 3,
      FOUR: 4,
      FIVE: 5,
    }

    const reviews: Review[] = (data.reviews || []).map((review) => ({
      id: review.reviewId,
      author: review.reviewer.displayName,
      authorPhotoUrl: review.reviewer.profilePhotoUrl,
      rating: ratingMap[review.starRating] || 5,
      text: review.comment || '',
      date: new Date(review.createTime),
      reply: review.reviewReply
        ? {
            text: review.reviewReply.comment,
            date: new Date(review.reviewReply.updateTime),
          }
        : undefined,
      isNew: Date.now() - new Date(review.createTime).getTime() < 7 * 24 * 60 * 60 * 1000,
    }))

    // Calculate distribution
    const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews.forEach((review) => {
      distribution[review.rating]++
    })

    const unanswered = reviews.filter((r) => !r.reply).length
    const newCount = reviews.filter((r) => r.isNew).length

    return {
      reviews,
      stats: {
        average: data.averageRating || 0,
        total: data.totalReviewCount || reviews.length,
        distribution,
        unanswered,
        newCount,
      },
    }
  }

  /**
   * Reply to a review
   */
  async replyToReview(request: ReplyToReviewRequest): Promise<void> {
    const { prisma } = await import('@/lib/prisma')
    
    const connection = await prisma.googleBusinessConnection.findFirst({
      where: { userId: this.userId },
    })

    if (!connection) throw new Error('No connection found')

    await this.request(
      `${MY_BUSINESS_REVIEWS_API}/${connection.locationId}/reviews/${request.reviewId}/reply`,
      {
        method: 'PUT',
        body: JSON.stringify({ comment: request.text }),
      }
    )
  }

  /**
   * Delete a review reply
   */
  async deleteReviewReply(reviewId: string): Promise<void> {
    const { prisma } = await import('@/lib/prisma')
    
    const connection = await prisma.googleBusinessConnection.findFirst({
      where: { userId: this.userId },
    })

    if (!connection) throw new Error('No connection found')

    await this.request(
      `${MY_BUSINESS_REVIEWS_API}/${connection.locationId}/reviews/${reviewId}/reply`,
      { method: 'DELETE' }
    )
  }

  /**
   * Get performance insights
   */
  async getInsights(
    period: '7d' | '28d' | '90d' = '28d'
  ): Promise<BusinessInsights> {
    const { prisma } = await import('@/lib/prisma')
    
    const connection = await prisma.googleBusinessConnection.findFirst({
      where: { userId: this.userId },
    })

    if (!connection) throw new Error('No connection found')

    const days = period === '7d' ? 7 : period === '28d' ? 28 : 90
    const endDate = new Date()
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    
    // Previous period for comparison
    const prevEndDate = new Date(startDate)
    const prevStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000)

    const formatDate = (d: Date) => ({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
    })

    interface MetricValue {
      metric: string
      totalValue?: { value: number }
    }

    interface InsightsResponse {
      multiDailyMetricTimeSeries: Array<{
        dailyMetricTimeSeries: {
          dailyMetric: string
          timeSeries: {
            datedValues: Array<{
              date: { year: number; month: number; day: number }
              value: number
            }>
          }
        }
      }>
    }

    const metrics = [
      'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
      'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
      'WEBSITE_CLICKS',
      'CALL_CLICKS',
      'BUSINESS_DIRECTION_REQUESTS',
      'BUSINESS_BOOKINGS',
    ]

    const fetchMetrics = async (start: Date, end: Date) => {
      const response = await this.request<InsightsResponse>(
        `${MY_BUSINESS_PERFORMANCE_API}/${connection.locationId}:fetchMultiDailyMetricsTimeSeries`,
        {
          method: 'POST',
          body: JSON.stringify({
            dailyMetrics: metrics,
            dailyRange: {
              startDate: formatDate(start),
              endDate: formatDate(end),
            },
          }),
        }
      )

      const totals: Record<string, number> = {}
      for (const series of response.multiDailyMetricTimeSeries || []) {
        const metric = series.dailyMetricTimeSeries.dailyMetric
        const values = series.dailyMetricTimeSeries.timeSeries?.datedValues || []
        totals[metric] = values.reduce((sum, v) => sum + (v.value || 0), 0)
      }
      return totals
    }

    const [current, previous] = await Promise.all([
      fetchMetrics(startDate, endDate),
      fetchMetrics(prevStartDate, prevEndDate),
    ])

    const calculateChange = (curr: number, prev: number) =>
      prev === 0 ? 0 : Math.round(((curr - prev) / prev) * 100)

    const currentViews =
      (current['BUSINESS_IMPRESSIONS_DESKTOP_MAPS'] || 0) +
      (current['BUSINESS_IMPRESSIONS_MOBILE_MAPS'] || 0)
    const previousViews =
      (previous['BUSINESS_IMPRESSIONS_DESKTOP_MAPS'] || 0) +
      (previous['BUSINESS_IMPRESSIONS_MOBILE_MAPS'] || 0)

    return {
      period,
      views: {
        current: currentViews,
        previous: previousViews,
        change: calculateChange(currentViews, previousViews),
      },
      searches: {
        current: currentViews, // Simplified - would need separate API call
        previous: previousViews,
        change: calculateChange(currentViews, previousViews),
      },
      websiteClicks: {
        current: current['WEBSITE_CLICKS'] || 0,
        previous: previous['WEBSITE_CLICKS'] || 0,
        change: calculateChange(
          current['WEBSITE_CLICKS'] || 0,
          previous['WEBSITE_CLICKS'] || 0
        ),
      },
      phoneClicks: {
        current: current['CALL_CLICKS'] || 0,
        previous: previous['CALL_CLICKS'] || 0,
        change: calculateChange(
          current['CALL_CLICKS'] || 0,
          previous['CALL_CLICKS'] || 0
        ),
      },
      directionRequests: {
        current: current['BUSINESS_DIRECTION_REQUESTS'] || 0,
        previous: previous['BUSINESS_DIRECTION_REQUESTS'] || 0,
        change: calculateChange(
          current['BUSINESS_DIRECTION_REQUESTS'] || 0,
          previous['BUSINESS_DIRECTION_REQUESTS'] || 0
        ),
      },
      bookingClicks: {
        current: current['BUSINESS_BOOKINGS'] || 0,
        previous: previous['BUSINESS_BOOKINGS'] || 0,
        change: calculateChange(
          current['BUSINESS_BOOKINGS'] || 0,
          previous['BUSINESS_BOOKINGS'] || 0
        ),
      },
    }
  }

  /**
   * Get posts (local posts) for the location
   */
  async getPosts(): Promise<BusinessPost[]> {
    const { prisma } = await import('@/lib/prisma')
    
    const connection = await prisma.googleBusinessConnection.findFirst({
      where: { userId: this.userId },
    })

    if (!connection) throw new Error('No connection found')

    interface GooglePost {
      name: string
      languageCode: string
      summary?: string
      callToAction?: {
        actionType: string
        url?: string
      }
      media?: Array<{
        mediaFormat: string
        googleUrl: string
      }>
      topicType: 'STANDARD' | 'EVENT' | 'OFFER'
      createTime: string
      updateTime: string
      searchUrl?: string
      event?: {
        title: string
        schedule: {
          startDate: { year: number; month: number; day: number }
          endDate: { year: number; month: number; day: number }
        }
      }
      offer?: {
        couponCode?: string
        redeemOnlineUrl?: string
        termsConditions?: string
      }
    }

    interface PostsResponse {
      localPosts: GooglePost[]
    }

    const data = await this.request<PostsResponse>(
      `${MY_BUSINESS_REVIEWS_API}/${connection.locationId}/localPosts`
    )

    return (data.localPosts || []).map((post) => {
      const typeMap: Record<string, 'update' | 'offer' | 'event'> = {
        STANDARD: 'update',
        EVENT: 'event',
        OFFER: 'offer',
      }

      const ctaMap: Record<string, 'book' | 'order' | 'learn_more' | 'call' | 'none'> = {
        BOOK: 'book',
        ORDER: 'order',
        LEARN_MORE: 'learn_more',
        CALL: 'call',
      }

      return {
        id: post.name.split('/').pop() || post.name,
        type: typeMap[post.topicType] || 'update',
        title: post.event?.title,
        content: post.summary || '',
        imageUrl: post.media?.[0]?.googleUrl,
        ctaType: post.callToAction?.actionType
          ? ctaMap[post.callToAction.actionType] || 'none'
          : 'none',
        ctaUrl: post.callToAction?.url,
        startDate: post.event?.schedule?.startDate
          ? new Date(
              post.event.schedule.startDate.year,
              post.event.schedule.startDate.month - 1,
              post.event.schedule.startDate.day
            )
          : undefined,
        endDate: post.event?.schedule?.endDate
          ? new Date(
              post.event.schedule.endDate.year,
              post.event.schedule.endDate.month - 1,
              post.event.schedule.endDate.day
            )
          : undefined,
        publishedAt: new Date(post.createTime),
        views: 0, // Would need separate insights call
        clicks: 0,
      }
    })
  }

  /**
   * Create a new post
   */
  async createPost(request: CreatePostRequest): Promise<string> {
    const { prisma } = await import('@/lib/prisma')
    
    const connection = await prisma.googleBusinessConnection.findFirst({
      where: { userId: this.userId },
    })

    if (!connection) throw new Error('No connection found')

    const typeMap: Record<string, string> = {
      update: 'STANDARD',
      event: 'EVENT',
      offer: 'OFFER',
    }

    const ctaMap: Record<string, string> = {
      book: 'BOOK',
      order: 'ORDER',
      learn_more: 'LEARN_MORE',
      call: 'CALL',
    }

    interface PostData {
      languageCode: string
      topicType: string
      summary: string
      callToAction?: {
        actionType: string
        url: string
      }
      media?: Array<{
        mediaFormat: string
        sourceUrl: string
      }>
      event?: {
        title: string
        schedule: {
          startDate: { year: number; month: number; day: number }
          endDate: { year: number; month: number; day: number }
        }
      }
    }

    const postData: PostData = {
      languageCode: 'de',
      topicType: typeMap[request.type] || 'STANDARD',
      summary: request.content,
    }

    if (request.ctaType && request.ctaType !== 'none' && request.ctaUrl) {
      postData.callToAction = {
        actionType: ctaMap[request.ctaType],
        url: request.ctaUrl,
      }
    }

    if (request.imageUrl) {
      postData.media = [
        {
          mediaFormat: 'PHOTO',
          sourceUrl: request.imageUrl,
        },
      ]
    }

    if (request.type === 'event' && request.title && request.startDate && request.endDate) {
      const startDate = new Date(request.startDate)
      const endDate = new Date(request.endDate)
      postData.event = {
        title: request.title,
        schedule: {
          startDate: {
            year: startDate.getFullYear(),
            month: startDate.getMonth() + 1,
            day: startDate.getDate(),
          },
          endDate: {
            year: endDate.getFullYear(),
            month: endDate.getMonth() + 1,
            day: endDate.getDate(),
          },
        },
      }
    }

    interface CreatePostResponse {
      name: string
    }

    const response = await this.request<CreatePostResponse>(
      `${MY_BUSINESS_REVIEWS_API}/${connection.locationId}/localPosts`,
      {
        method: 'POST',
        body: JSON.stringify(postData),
      }
    )

    return response.name.split('/').pop() || response.name
  }

  /**
   * Delete a post
   */
  async deletePost(postId: string): Promise<void> {
    const { prisma } = await import('@/lib/prisma')
    
    const connection = await prisma.googleBusinessConnection.findFirst({
      where: { userId: this.userId },
    })

    if (!connection) throw new Error('No connection found')

    await this.request(
      `${MY_BUSINESS_REVIEWS_API}/${connection.locationId}/localPosts/${postId}`,
      { method: 'DELETE' }
    )
  }

  /**
   * Get photos/media for the location
   */
  async getMedia(): Promise<BusinessPhoto[]> {
    const { prisma } = await import('@/lib/prisma')
    
    const connection = await prisma.googleBusinessConnection.findFirst({
      where: { userId: this.userId },
    })

    if (!connection) throw new Error('No connection found')

    interface GoogleMedia {
      name: string
      mediaFormat: string
      locationAssociation?: {
        category: string
      }
      googleUrl: string
      thumbnailUrl?: string
      createTime: string
      description?: string
    }

    interface MediaResponse {
      mediaItems: GoogleMedia[]
    }

    const data = await this.request<MediaResponse>(
      `${MY_BUSINESS_API_BASE}/${connection.locationId}/media`
    )

    const categoryMap: Record<string, BusinessPhoto['type']> = {
      COVER: 'cover',
      LOGO: 'logo',
      TEAMS: 'team',
      INTERIOR: 'interior',
      EXTERIOR: 'work',
      PRODUCT: 'work',
      AT_WORK: 'work',
      ADDITIONAL: 'other',
    }

    return (data.mediaItems || []).map((media) => ({
      id: media.name.split('/').pop() || media.name,
      url: media.googleUrl,
      type: categoryMap[media.locationAssociation?.category || 'ADDITIONAL'] || 'other',
      uploadedAt: new Date(media.createTime),
      description: media.description,
    }))
  }

  /**
   * Upload a photo
   */
  async uploadPhoto(
    url: string,
    category: 'COVER' | 'LOGO' | 'ADDITIONAL' = 'ADDITIONAL'
  ): Promise<string> {
    const { prisma } = await import('@/lib/prisma')
    
    const connection = await prisma.googleBusinessConnection.findFirst({
      where: { userId: this.userId },
    })

    if (!connection) throw new Error('No connection found')

    interface UploadResponse {
      name: string
    }

    const response = await this.request<UploadResponse>(
      `${MY_BUSINESS_API_BASE}/${connection.locationId}/media`,
      {
        method: 'POST',
        body: JSON.stringify({
          mediaFormat: 'PHOTO',
          sourceUrl: url,
          locationAssociation: {
            category,
          },
        }),
      }
    )

    return response.name.split('/').pop() || response.name
  }

  /**
   * Delete a photo
   */
  async deletePhoto(photoId: string): Promise<void> {
    const { prisma } = await import('@/lib/prisma')
    
    const connection = await prisma.googleBusinessConnection.findFirst({
      where: { userId: this.userId },
    })

    if (!connection) throw new Error('No connection found')

    await this.request(
      `${MY_BUSINESS_API_BASE}/${connection.locationId}/media/${photoId}`,
      { method: 'DELETE' }
    )
  }

  /**
   * Calculate profile score based on completeness
   */
  async calculateProfileScore(): Promise<ProfileScore> {
    const profile = await this.getProfile()
    const media = await this.getMedia()
    const { stats } = await this.getReviews(10)
    const posts = await this.getPosts()

    const breakdown = {
      basics: 0,
      categories: 20, // Assume categories are set
      hours: 15, // Assume hours are set
      description: 0,
      photos: 0,
      reviews: 0,
      posts: 0,
    }

    // Basics (name, address, phone, website) - max 20
    if (profile) {
      if (profile.name) breakdown.basics += 5
      if (profile.address) breakdown.basics += 5
      if (profile.phone) breakdown.basics += 5
      if (profile.website) breakdown.basics += 5
    }

    // Description - max 15
    if (profile?.descriptionLength) {
      if (profile.descriptionLength >= 750) breakdown.description = 15
      else if (profile.descriptionLength >= 400) breakdown.description = 10
      else if (profile.descriptionLength >= 100) breakdown.description = 5
    }

    // Photos - max 15
    if (media.length >= 10) breakdown.photos = 15
    else if (media.length >= 5) breakdown.photos = 10
    else if (media.length >= 1) breakdown.photos = 5

    // Reviews - max 10
    if (stats.average >= 4.5 && stats.total >= 10) breakdown.reviews = 10
    else if (stats.average >= 4.0 && stats.total >= 5) breakdown.reviews = 7
    else if (stats.total >= 1) breakdown.reviews = 3

    // Posts - max 5
    const recentPosts = posts.filter(
      (p) => Date.now() - p.publishedAt.getTime() < 30 * 24 * 60 * 60 * 1000
    )
    if (recentPosts.length >= 4) breakdown.posts = 5
    else if (recentPosts.length >= 2) breakdown.posts = 3
    else if (recentPosts.length >= 1) breakdown.posts = 1

    const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0)

    return { total, breakdown }
  }

  /**
   * Generate checklist items based on profile completeness
   */
  async generateChecklist(): Promise<ChecklistItem[]> {
    const profile = await this.getProfile()
    const media = await this.getMedia()
    const { stats } = await this.getReviews(10)
    const posts = await this.getPosts()

    const items: ChecklistItem[] = []

    // Basics
    items.push({
      id: 'basics-name',
      title: 'Unternehmensname',
      description: 'Dein Unternehmensname ist bei Google sichtbar',
      category: 'basics',
      status: profile?.name ? 'complete' : 'incomplete',
      weight: 5,
    })

    items.push({
      id: 'basics-phone',
      title: 'Telefonnummer',
      description: 'Kunden können dich direkt anrufen',
      category: 'basics',
      status: profile?.phone ? 'complete' : 'warning',
      weight: 5,
      actionUrl: '/stylist/marketing/google-business/profile',
      actionLabel: 'Hinzufügen',
    })

    items.push({
      id: 'basics-website',
      title: 'Website',
      description: 'Verlinke deine Website für mehr Traffic',
      category: 'basics',
      status: profile?.website ? 'complete' : 'warning',
      weight: 5,
      actionUrl: '/stylist/marketing/google-business/profile',
      actionLabel: 'Hinzufügen',
    })

    // Description
    items.push({
      id: 'basics-description',
      title: 'Unternehmensbeschreibung',
      description:
        profile && profile.descriptionLength >= 400
          ? 'Perfekt! Deine Beschreibung ist ausführlich'
          : 'Beschreibe dein Unternehmen in mindestens 400 Zeichen',
      category: 'basics',
      status:
        profile && profile.descriptionLength >= 400
          ? 'complete'
          : profile && profile.descriptionLength > 0
            ? 'warning'
            : 'incomplete',
      weight: 15,
      actionUrl: '/stylist/marketing/google-business/profile',
      actionLabel: 'Bearbeiten',
    })

    // Photos
    const photoCount = media.length
    items.push({
      id: 'photos-count',
      title: 'Fotos hochladen',
      description:
        photoCount >= 10
          ? `${photoCount} Fotos hochgeladen - Großartig!`
          : `${photoCount}/10 Fotos - Mehr Fotos = mehr Aufmerksamkeit`,
      category: 'photos',
      status: photoCount >= 10 ? 'complete' : photoCount >= 5 ? 'warning' : 'incomplete',
      weight: 15,
      actionUrl: '/stylist/marketing/google-business/photos',
      actionLabel: 'Fotos hinzufügen',
    })

    // Reviews
    items.push({
      id: 'reviews-rating',
      title: 'Bewertungen',
      description:
        stats.average >= 4.5
          ? `${stats.average.toFixed(1)} ⭐ Durchschnitt - Hervorragend!`
          : stats.total > 0
            ? `${stats.average.toFixed(1)} ⭐ Durchschnitt - Sammle mehr positive Bewertungen`
            : 'Noch keine Bewertungen - Bitte Kunden um Feedback',
      category: 'reviews',
      status: stats.average >= 4.5 ? 'complete' : stats.total > 0 ? 'warning' : 'incomplete',
      weight: 10,
      actionUrl: '/stylist/marketing/google-business/reviews',
      actionLabel: 'Bewertungen ansehen',
    })

    if (stats.unanswered > 0) {
      items.push({
        id: 'reviews-unanswered',
        title: 'Unbeantwortete Bewertungen',
        description: `${stats.unanswered} Bewertungen warten auf deine Antwort`,
        category: 'reviews',
        status: 'warning',
        weight: 5,
        actionUrl: '/stylist/marketing/google-business/reviews',
        actionLabel: 'Antworten',
      })
    }

    // Posts
    const recentPosts = posts.filter(
      (p) => Date.now() - p.publishedAt.getTime() < 30 * 24 * 60 * 60 * 1000
    )
    items.push({
      id: 'posts-recent',
      title: 'Aktuelle Beiträge',
      description:
        recentPosts.length >= 4
          ? 'Regelmäßige Beiträge halten dein Profil aktiv'
          : 'Veröffentliche mindestens 4 Beiträge pro Monat',
      category: 'posts',
      status: recentPosts.length >= 4 ? 'complete' : recentPosts.length > 0 ? 'warning' : 'incomplete',
      weight: 5,
      actionUrl: '/stylist/marketing/google-business/posts',
      actionLabel: 'Beitrag erstellen',
    })

    return items
  }
}

// Factory function to create client
export async function createGoogleBusinessClient(userId: string): Promise<GoogleBusinessApiClient | null> {
  const client = new GoogleBusinessApiClient(userId)
  const initialized = await client.initialize()
  return initialized ? client : null
}

