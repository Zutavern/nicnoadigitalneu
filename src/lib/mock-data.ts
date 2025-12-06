/**
 * Mock-Daten für den Demo-Modus
 * Wird verwendet wenn useDemoMode in PlatformSettings aktiviert ist
 * 
 * WICHTIG: Alle Daten werden als Funktionen bereitgestellt um Hydration-Fehler zu vermeiden
 */

// Helper für konsistente Datumsberechnung
function getRelativeDate(daysOffset: number, hours = 12, minutes = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

function getTodayAt(hours: number, minutes = 0): string {
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

// ============================================
// Stylist Stats Mock Data
// ============================================
export function getMockStylistStats() {
  return {
    overview: {
      totalCustomers: 47,
      totalBookings: 234,
      completedBookings: 198,
      upcomingBookings: 12,
      weeklyBookings: 18,
      monthlyRevenue: 4250.00,
      totalRevenue: 28750.00,
      averageRating: 4.8,
      totalReviews: 42,
    },
    growth: {
      bookings: 12.5,
      revenue: 8.3,
    },
    todaysBookings: [
      {
        id: 'demo-1',
        title: 'Haarschnitt & Styling',
        serviceName: 'Damenhaarschnitt',
        customerName: 'Anna Schmidt',
        startTime: getTodayAt(9, 0),
        endTime: getTodayAt(10, 0),
        price: 65,
        status: 'CONFIRMED',
      },
      {
        id: 'demo-2',
        title: 'Färbung komplett',
        serviceName: 'Balayage',
        customerName: 'Maria Weber',
        startTime: getTodayAt(11, 0),
        endTime: getTodayAt(13, 30),
        price: 180,
        status: 'CONFIRMED',
      },
      {
        id: 'demo-3',
        title: 'Herrenhaarschnitt',
        serviceName: 'Herrenhaarschnitt Classic',
        customerName: 'Thomas Müller',
        startTime: getTodayAt(14, 0),
        endTime: getTodayAt(14, 45),
        price: 35,
        status: 'PENDING',
      },
    ],
    recentBookings: [
      {
        id: 'demo-r1',
        title: 'Balayage & Schnitt',
        serviceName: 'Balayage',
        customerName: 'Lisa Hoffmann',
        price: 195,
        status: 'COMPLETED',
        startTime: getRelativeDate(-2),
      },
      {
        id: 'demo-r2',
        title: 'Brautfrisur',
        serviceName: 'Hochsteckfrisur',
        customerName: 'Julia Becker',
        price: 120,
        status: 'COMPLETED',
        startTime: getRelativeDate(-3),
      },
    ],
    popularServices: [
      { serviceId: 's1', serviceName: 'Damenhaarschnitt', bookingCount: 45, totalRevenue: 2925 },
      { serviceId: 's2', serviceName: 'Balayage', bookingCount: 28, totalRevenue: 5040 },
      { serviceId: 's3', serviceName: 'Herrenhaarschnitt', bookingCount: 32, totalRevenue: 1120 },
      { serviceId: 's4', serviceName: 'Strähnen', bookingCount: 18, totalRevenue: 1620 },
    ],
    chairRental: {
      id: 'rental-demo',
      chairName: 'Stuhl 3 - Fensterplatz',
      salonName: 'Hair & Beauty Lounge',
      salonCity: 'München',
      salonStreet: 'Maximilianstraße 42',
      monthlyRent: 650,
      startDate: '2024-01-15T00:00:00.000Z',
      pendingPayments: 0,
    },
    recentReviews: [
      {
        id: 'rev-1',
        rating: 5,
        title: 'Traumhafte Balayage!',
        comment: 'Bin super zufrieden, genau das was ich wollte!',
        reviewerName: 'Lisa H.',
        createdAt: getRelativeDate(-5),
      },
      {
        id: 'rev-2',
        rating: 5,
        title: 'Bester Friseur!',
        comment: 'Sehr professionell und nette Beratung.',
        reviewerName: 'Anna S.',
        createdAt: getRelativeDate(-8),
      },
    ],
  }
}

// Für Backwards-Compatibility
export const mockStylistStats = getMockStylistStats()

// ============================================
// Salon Stats Mock Data
// ============================================
export function getMockSalonStats() {
  return {
    overview: {
      totalStylists: 6,
      totalChairs: 8,
      occupiedChairs: 6,
      totalCustomers: 312,
      totalBookings: 1847,
      monthlyRevenue: 24680,
      totalRevenue: 186500,
      averageRating: 4.7,
      totalReviews: 156,
    },
    growth: {
      bookings: 15.2,
      revenue: 11.8,
      customers: 8.5,
    },
    recentBookings: [
      {
        id: 'sb-1',
        customerName: 'Emma Wagner',
        stylistName: 'Sarah Müller',
        serviceName: 'Färbung & Schnitt',
        startTime: getTodayAt(10, 0),
        price: 145,
        status: 'CONFIRMED',
      },
    ],
    topStylists: [
      { id: 'st-1', name: 'Sarah Müller', bookings: 87, revenue: 8750, rating: 4.9 },
      { id: 'st-2', name: 'Alex Schmidt', bookings: 72, revenue: 6480, rating: 4.8 },
      { id: 'st-3', name: 'Julia Weber', bookings: 65, revenue: 5850, rating: 4.7 },
    ],
    chairOccupancy: [
      { id: 'c1', name: 'Stuhl 1', stylist: 'Sarah Müller', status: 'OCCUPIED' },
      { id: 'c2', name: 'Stuhl 2', stylist: 'Alex Schmidt', status: 'OCCUPIED' },
      { id: 'c3', name: 'Stuhl 3', stylist: 'Julia Weber', status: 'OCCUPIED' },
      { id: 'c4', name: 'Stuhl 4', stylist: 'Max Braun', status: 'OCCUPIED' },
      { id: 'c5', name: 'Stuhl 5', stylist: null, status: 'AVAILABLE' },
      { id: 'c6', name: 'Stuhl 6', stylist: 'Lena Klein', status: 'OCCUPIED' },
    ],
  }
}

export const mockSalonStats = getMockSalonStats()

// ============================================
// Admin Stats Mock Data
// ============================================
export function getMockAdminStats() {
  return {
    overview: {
      totalUsers: 156,
      totalStylists: 98,
      totalSalonOwners: 42,
      totalSalons: 38,
      totalBookings: 2847,
      completedBookings: 2156,
      pendingOnboardings: 12,
      approvedOnboardings: 86,
      totalRevenue: 186520,
      monthlyRevenue: 24680,
    },
    growth: {
      users: 12.5,
      bookings: 8.3,
      revenue: 15.2,
    },
    recentBookings: [
      {
        id: 'demo-b1',
        title: 'Balayage & Schnitt',
        serviceName: 'Balayage',
        customerName: 'Emma Wagner',
        price: 185,
        status: 'COMPLETED',
        startTime: getRelativeDate(-1),
      },
      {
        id: 'demo-b2',
        title: 'Damenhaarschnitt',
        serviceName: 'Damenhaarschnitt',
        customerName: 'Sophie Müller',
        price: 65,
        status: 'CONFIRMED',
        startTime: getTodayAt(14, 0),
      },
      {
        id: 'demo-b3',
        title: 'Herrenhaarschnitt',
        serviceName: 'Herrenhaarschnitt Classic',
        customerName: 'Thomas Schmidt',
        price: 35,
        status: 'PENDING',
        startTime: getTodayAt(15, 30),
      },
      {
        id: 'demo-b4',
        title: 'Färbung',
        serviceName: 'Komplettfärbung',
        customerName: 'Laura Weber',
        price: 95,
        status: 'COMPLETED',
        startTime: getRelativeDate(-2),
      },
      {
        id: 'demo-b5',
        title: 'Hochsteckfrisur',
        serviceName: 'Hochsteckfrisur',
        customerName: 'Julia Becker',
        price: 120,
        status: 'COMPLETED',
        startTime: getRelativeDate(-3),
      },
    ],
    topStylists: [
      { stylistId: 'st-1', name: 'Sarah Müller', email: 'sarah@email.de', image: null, bookingCount: 87, totalRevenue: 8750 },
      { stylistId: 'st-2', name: 'Alex Schmidt', email: 'alex@email.de', image: null, bookingCount: 72, totalRevenue: 6480 },
      { stylistId: 'st-3', name: 'Julia Weber', email: 'julia@email.de', image: null, bookingCount: 65, totalRevenue: 5850 },
      { stylistId: 'st-4', name: 'Max Braun', email: 'max@email.de', image: null, bookingCount: 58, totalRevenue: 4640 },
      { stylistId: 'st-5', name: 'Lena Klein', email: 'lena@email.de', image: null, bookingCount: 52, totalRevenue: 4160 },
    ],
    recentUsers: [
      { id: 'u-1', name: 'Emma Wagner', email: 'emma@email.de', role: 'STYLIST', createdAt: getRelativeDate(-1), image: null },
      { id: 'u-2', name: 'Beauty Salon München', email: 'info@beautysalon.de', role: 'SALON_OWNER', createdAt: getRelativeDate(-2), image: null },
      { id: 'u-3', name: 'Thomas Müller', email: 'thomas@email.de', role: 'STYLIST', createdAt: getRelativeDate(-3), image: null },
      { id: 'u-4', name: 'Hair Dreams', email: 'contact@hairdreams.de', role: 'SALON_OWNER', createdAt: getRelativeDate(-4), image: null },
      { id: 'u-5', name: 'Lisa Hoffmann', email: 'lisa@email.de', role: 'STYLIST', createdAt: getRelativeDate(-5), image: null },
    ],
    bookingsByStatus: {
      PENDING: 145,
      CONFIRMED: 234,
      COMPLETED: 2156,
      CANCELLED: 187,
      NO_SHOW: 125,
    },
    onboardingsByStatus: {
      NOT_STARTED: 8,
      IN_PROGRESS: 15,
      PENDING_REVIEW: 12,
      APPROVED: 86,
      REJECTED: 3,
    },
  }
}

export const mockAdminStats = getMockAdminStats()

// ============================================
// Admin Revenue Mock Data
// ============================================
export function getMockAdminRevenue() {
  return {
    overview: {
      totalRevenue: 156780,
      monthlyRevenue: 24680,
      mrr: 18750,
      arr: 225000,
      activeSubscriptions: 127,
      trialingSubscriptions: 23,
      churnRate: 2.3,
    },
    revenueByPlan: [
      { planName: 'Stylist Basic', count: 45, mrr: 1350, percentage: 35.4 },
      { planName: 'Stylist Pro', count: 32, mrr: 1600, percentage: 25.2 },
      { planName: 'Salon Starter', count: 28, mrr: 2800, percentage: 22.0 },
      { planName: 'Salon Professional', count: 18, mrr: 3600, percentage: 14.2 },
      { planName: 'Salon Enterprise', count: 4, mrr: 2000, percentage: 3.2 },
    ],
    monthlyTrend: [
      { month: 'Jul', revenue: 18500, subscriptions: 95 },
      { month: 'Aug', revenue: 19200, subscriptions: 102 },
      { month: 'Sep', revenue: 20800, subscriptions: 110 },
      { month: 'Okt', revenue: 22100, subscriptions: 118 },
      { month: 'Nov', revenue: 23500, subscriptions: 124 },
      { month: 'Dez', revenue: 24680, subscriptions: 127 },
    ],
    recentTransactions: [
      {
        id: 'tx-1',
        customerName: 'Hair Dreams Salon',
        email: 'info@hairdreams.de',
        amount: 199.99,
        plan: 'Salon Professional',
        status: 'succeeded',
        date: getRelativeDate(0, 10, 0),
      },
      {
        id: 'tx-2',
        customerName: 'Lisa Stylist',
        email: 'lisa@email.de',
        amount: 49.99,
        plan: 'Stylist Pro',
        status: 'succeeded',
        date: getRelativeDate(0, 7, 0),
      },
      {
        id: 'tx-3',
        customerName: 'Beauty Palace',
        email: 'info@beautypalace.de',
        amount: 99.99,
        plan: 'Salon Starter',
        status: 'succeeded',
        date: getRelativeDate(-1),
      },
    ],
  }
}

export const mockAdminRevenue = getMockAdminRevenue()

// ============================================
// Admin Subscriptions Mock Data
// ============================================
export function getMockAdminSubscriptions() {
  return {
    subscriptions: [
      {
        id: 'sub-1',
        status: 'active',
        currentPeriodStart: getRelativeDate(-15),
        currentPeriodEnd: getRelativeDate(15),
        cancelAtPeriodEnd: false,
        plan: { id: 'plan-1', name: 'Salon Professional', amount: 19999, interval: 'month' },
        user: { id: 'u1', name: 'Hair Dreams Salon', email: 'info@hairdreams.de', image: null, role: 'SALON_OWNER' },
        stripeSubscriptionId: 'sub_demo_1',
      },
      {
        id: 'sub-2',
        status: 'active',
        currentPeriodStart: getRelativeDate(-20),
        currentPeriodEnd: getRelativeDate(10),
        cancelAtPeriodEnd: false,
        plan: { id: 'plan-2', name: 'Stylist Pro', amount: 4999, interval: 'month' },
        user: { id: 'u2', name: 'Sarah Müller', email: 'sarah@email.de', image: null, role: 'STYLIST' },
        stripeSubscriptionId: 'sub_demo_2',
      },
      {
        id: 'sub-3',
        status: 'trialing',
        currentPeriodStart: getRelativeDate(-5),
        currentPeriodEnd: getRelativeDate(9),
        cancelAtPeriodEnd: false,
        plan: { id: 'plan-3', name: 'Salon Starter', amount: 9999, interval: 'month' },
        user: { id: 'u3', name: 'Beauty Lounge', email: 'contact@beautylounge.de', image: null, role: 'SALON_OWNER' },
        stripeSubscriptionId: 'sub_demo_3',
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 127,
      totalPages: 7,
    },
    stats: {
      total: 127,
      active: 98,
      trialing: 23,
      pastDue: 4,
      canceled: 2,
      mrr: 18750,
      arr: 225000,
    },
    source: 'demo',
  }
}

export const mockAdminSubscriptions = getMockAdminSubscriptions()

// ============================================
// User Subscription Mock Data
// ============================================
export function getMockUserSubscription() {
  return {
    subscription: {
      status: 'active',
      currentPeriodEnd: getRelativeDate(22),
      cancelAtPeriodEnd: false,
      billingInterval: 'monthly',
    },
    currentPlan: {
      id: 'plan-stylist-pro',
      name: 'Stylist Pro',
      slug: 'stylist-pro',
      description: 'Für wachsende Stylisten',
      planType: 'STYLIST',
      priceMonthly: 49.99,
      priceQuarterly: 134.99,
      priceYearly: 499.99,
      features: ['Unbegrenzte Buchungen', 'Premium Support', 'Analytics Dashboard'],
      isPopular: true,
    },
    availablePlans: [
      {
        id: 'plan-stylist-basic',
        name: 'Stylist Basic',
        slug: 'stylist-basic',
        description: 'Ideal für Einsteiger',
        planType: 'STYLIST',
        priceMonthly: 29.99,
        priceQuarterly: 79.99,
        priceYearly: 299.99,
        features: ['50 Buchungen/Monat', 'Basis Support', 'Kalender'],
        isPopular: false,
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 'plan-stylist-pro',
        name: 'Stylist Pro',
        slug: 'stylist-pro',
        description: 'Für wachsende Stylisten',
        planType: 'STYLIST',
        priceMonthly: 49.99,
        priceQuarterly: 134.99,
        priceYearly: 499.99,
        features: ['Unbegrenzte Buchungen', 'Premium Support', 'Analytics Dashboard'],
        isPopular: true,
        isActive: true,
        sortOrder: 2,
      },
    ],
    hasActiveSubscription: true,
  }
}

export const mockUserSubscription = getMockUserSubscription()

// ============================================
// Referral Mock Data
// ============================================
export function getMockReferralData() {
  return {
    profile: {
      referralCode: 'DEMO-ABC123',
      totalReferrals: 5,
      successfulReferrals: 3,
      totalEarnings: 89.97,
      pendingRewardsCount: 1,
      pendingRewardsValue: 29.99,
    },
    referralCode: 'DEMO-ABC123',
    referralLink: 'https://app.nicnoa.de/register?ref=DEMO-ABC123',
    referrals: [
      {
        id: 'ref-1',
        referredEmail: 'anna@email.de',
        referredName: 'Anna Schmidt',
        code: 'REF-ANNA',
        status: 'CONVERTED' as const,
        invitedAt: getRelativeDate(-30),
        registeredAt: getRelativeDate(-25),
        convertedAt: getRelativeDate(-20),
        rewardType: 'FREE_MONTH',
        rewardValue: 29.99,
        rewardApplied: true,
      },
      {
        id: 'ref-2',
        referredEmail: 'max@email.de',
        referredName: 'Max Müller',
        code: 'REF-MAX',
        status: 'REGISTERED' as const,
        invitedAt: getRelativeDate(-10),
        registeredAt: getRelativeDate(-5),
        convertedAt: null,
        rewardType: 'FREE_MONTH',
        rewardValue: 29.99,
        rewardApplied: false,
      },
      {
        id: 'ref-3',
        referredEmail: 'julia@email.de',
        referredName: null,
        code: 'REF-JULIA',
        status: 'PENDING' as const,
        invitedAt: getRelativeDate(-3),
        registeredAt: null,
        convertedAt: null,
        rewardType: 'FREE_MONTH',
        rewardValue: 29.99,
        rewardApplied: false,
      },
    ],
    pendingRewards: [
      {
        id: 'reward-1',
        rewardType: 'FREE_MONTH',
        rewardValue: 29.99,
        description: '1 Monat gratis für Empfehlung von Max Müller',
        expiresAt: getRelativeDate(30),
      },
    ],
    stats: {
      totalReferrals: 5,
      pendingReferrals: 2,
      successfulReferrals: 3,
      totalEarnings: 89.97,
      pendingRewardsCount: 1,
      pendingRewardsValue: 29.99,
    },
  }
}

export const mockReferralData = getMockReferralData()

// ============================================
// Helper: Check if Demo Mode is Active
// ============================================
import { prisma } from '@/lib/prisma'

let cachedDemoMode: boolean | null = null
let cacheExpiry: number = 0
const CACHE_DURATION = 60 * 1000 // 1 minute cache

export async function isDemoModeActive(): Promise<boolean> {
  // Return cached value if still valid
  if (cachedDemoMode !== null && Date.now() < cacheExpiry) {
    return cachedDemoMode
  }

  try {
    const settings = await prisma.platformSettings.findUnique({
      where: { id: 'default' },
      select: { useDemoMode: true },
    })
    
    cachedDemoMode = settings?.useDemoMode ?? true // Default to true if not set
    cacheExpiry = Date.now() + CACHE_DURATION
    
    return cachedDemoMode
  } catch {
    // If DB error, default to demo mode
    return true
  }
}

export function clearDemoModeCache() {
  cachedDemoMode = null
  cacheExpiry = 0
}

