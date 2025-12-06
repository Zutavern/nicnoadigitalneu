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
// Stylist Analytics Mock Data
// ============================================
export function getMockStylistAnalytics() {
  return {
    earnings: {
      total: 4250,
      change: 12.5,
      data: [
        { month: 'Jul', value: 3200 },
        { month: 'Aug', value: 3450 },
        { month: 'Sep', value: 3800 },
        { month: 'Okt', value: 4100 },
        { month: 'Nov', value: 3950 },
        { month: 'Dez', value: 4250 },
      ],
    },
    bookings: {
      total: 42,
      change: 8.3,
      data: [
        { month: 'Jul', value: 32 },
        { month: 'Aug', value: 35 },
        { month: 'Sep', value: 38 },
        { month: 'Okt', value: 40 },
        { month: 'Nov', value: 39 },
        { month: 'Dez', value: 42 },
      ],
    },
    customers: {
      total: 28,
      newCustomers: 8,
      returningCustomers: 20,
    },
    salonPerformance: [
      { name: 'Hair & Beauty Lounge', bookings: 25, earnings: 2800 },
      { name: 'Salon Elegance', bookings: 12, earnings: 1200 },
      { name: 'Style Studio', bookings: 5, earnings: 450 },
    ],
    serviceBreakdown: [
      { name: 'Damenhaarschnitt', value: 35, color: '#ec4899' },
      { name: 'Balayage', value: 25, color: '#f472b6' },
      { name: 'Herrenhaarschnitt', value: 18, color: '#fb7185' },
      { name: 'Strähnen', value: 12, color: '#fda4af' },
      { name: 'Färbung', value: 7, color: '#fecdd3' },
      { name: 'Sonstiges', value: 3, color: '#fce7f3' },
    ],
    peakHours: [
      { hour: '09:00', bookings: 3 },
      { hour: '10:00', bookings: 5 },
      { hour: '11:00', bookings: 7 },
      { hour: '12:00', bookings: 4 },
      { hour: '14:00', bookings: 6 },
      { hour: '15:00', bookings: 8 },
      { hour: '16:00', bookings: 5 },
      { hour: '17:00', bookings: 4 },
    ],
  }
}

// ============================================
// Salon Analytics Mock Data
// ============================================
export function getMockSalonAnalytics() {
  return {
    revenue: {
      total: 24680,
      change: 15.2,
      data: [
        { month: 'Jul', value: 18500 },
        { month: 'Aug', value: 19200 },
        { month: 'Sep', value: 20800 },
        { month: 'Okt', value: 22100 },
        { month: 'Nov', value: 23500 },
        { month: 'Dez', value: 24680 },
      ],
    },
    bookings: {
      total: 312,
      change: 11.8,
      data: [
        { month: 'Jul', value: 245 },
        { month: 'Aug', value: 258 },
        { month: 'Sep', value: 275 },
        { month: 'Okt', value: 289 },
        { month: 'Nov', value: 298 },
        { month: 'Dez', value: 312 },
      ],
    },
    customers: {
      total: 186,
      change: 8.5,
      newCustomers: 42,
      returningCustomers: 144,
    },
    stylistPerformance: [
      { name: 'Sarah Müller', bookings: 87, revenue: 8750, rating: 4.9 },
      { name: 'Alex Schmidt', bookings: 72, revenue: 6480, rating: 4.8 },
      { name: 'Julia Weber', bookings: 65, revenue: 5850, rating: 4.7 },
      { name: 'Max Braun', bookings: 48, revenue: 3600, rating: 4.6 },
    ],
    serviceBreakdown: [
      { name: 'Haarschnitt', value: 32, color: '#ec4899' },
      { name: 'Färbung', value: 28, color: '#8b5cf6' },
      { name: 'Styling', value: 18, color: '#06b6d4' },
      { name: 'Behandlung', value: 12, color: '#10b981' },
      { name: 'Beratung', value: 6, color: '#f59e0b' },
      { name: 'Sonstiges', value: 4, color: '#ef4444' },
    ],
    peakHours: [
      { hour: '09:00', bookings: 12 },
      { hour: '10:00', bookings: 18 },
      { hour: '11:00', bookings: 25 },
      { hour: '12:00', bookings: 15 },
      { hour: '14:00', bookings: 22 },
      { hour: '15:00', bookings: 28 },
      { hour: '16:00', bookings: 20 },
      { hour: '17:00', bookings: 14 },
    ],
  }
}

// ============================================
// Stylist Bookings Mock Data
// ============================================
export function getMockStylistBookings() {
  return {
    bookings: [
      {
        id: 'bk-1',
        customerName: 'Anna Schmidt',
        customerEmail: 'anna@email.de',
        customerPhone: '+49 170 1234567',
        salonName: 'Hair & Beauty Lounge',
        chairName: 'Stuhl 3',
        serviceNames: ['Damenhaarschnitt', 'Föhnen'],
        startTime: getTodayAt(9, 0),
        endTime: getTodayAt(10, 0),
        totalPrice: 65,
        status: 'CONFIRMED',
        notes: null,
        createdAt: getRelativeDate(-2),
      },
      {
        id: 'bk-2',
        customerName: 'Maria Weber',
        customerEmail: 'maria@email.de',
        customerPhone: '+49 171 2345678',
        salonName: 'Hair & Beauty Lounge',
        chairName: 'Stuhl 3',
        serviceNames: ['Balayage', 'Schnitt', 'Pflege'],
        startTime: getTodayAt(11, 0),
        endTime: getTodayAt(13, 30),
        totalPrice: 195,
        status: 'CONFIRMED',
        notes: 'Kundin wünscht warme Töne',
        createdAt: getRelativeDate(-1),
      },
      {
        id: 'bk-3',
        customerName: 'Thomas Müller',
        customerEmail: 'thomas@email.de',
        customerPhone: '+49 172 3456789',
        salonName: 'Hair & Beauty Lounge',
        chairName: 'Stuhl 3',
        serviceNames: ['Herrenhaarschnitt'],
        startTime: getTodayAt(14, 0),
        endTime: getTodayAt(14, 45),
        totalPrice: 35,
        status: 'PENDING',
        notes: null,
        createdAt: getRelativeDate(0),
      },
      {
        id: 'bk-4',
        customerName: 'Lisa Hoffmann',
        customerEmail: 'lisa@email.de',
        customerPhone: '+49 173 4567890',
        salonName: 'Hair & Beauty Lounge',
        chairName: 'Stuhl 3',
        serviceNames: ['Färbung komplett'],
        startTime: getRelativeDate(1, 10, 0),
        endTime: getRelativeDate(1, 12, 0),
        totalPrice: 120,
        status: 'CONFIRMED',
        notes: null,
        createdAt: getRelativeDate(-1),
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 4,
      totalPages: 1,
    },
  }
}

// ============================================
// Salon Bookings Mock Data
// ============================================
export function getMockSalonBookings() {
  return {
    bookings: [
      {
        id: 'sb-1',
        customerName: 'Emma Wagner',
        customerEmail: 'emma@email.de',
        customerPhone: '+49 170 1111111',
        stylistName: 'Sarah Müller',
        stylistImage: null,
        chairName: 'Stuhl 1',
        serviceNames: ['Färbung', 'Schnitt'],
        startTime: getTodayAt(10, 0),
        endTime: getTodayAt(12, 0),
        totalPrice: 145,
        status: 'CONFIRMED',
        notes: null,
        createdAt: getRelativeDate(-1),
      },
      {
        id: 'sb-2',
        customerName: 'Sophie Müller',
        customerEmail: 'sophie@email.de',
        customerPhone: '+49 171 2222222',
        stylistName: 'Alex Schmidt',
        stylistImage: null,
        chairName: 'Stuhl 2',
        serviceNames: ['Damenhaarschnitt'],
        startTime: getTodayAt(11, 0),
        endTime: getTodayAt(12, 0),
        totalPrice: 55,
        status: 'CONFIRMED',
        notes: null,
        createdAt: getRelativeDate(-2),
      },
      {
        id: 'sb-3',
        customerName: 'Laura Weber',
        customerEmail: 'laura@email.de',
        customerPhone: '+49 172 3333333',
        stylistName: 'Julia Weber',
        stylistImage: null,
        chairName: 'Stuhl 3',
        serviceNames: ['Balayage', 'Pflege'],
        startTime: getTodayAt(14, 0),
        endTime: getTodayAt(16, 30),
        totalPrice: 185,
        status: 'PENDING',
        notes: 'Erste Balayage-Kundin',
        createdAt: getRelativeDate(0),
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 3,
      totalPages: 1,
    },
  }
}

// ============================================
// Stylist Earnings Mock Data
// ============================================
export function getMockStylistEarnings() {
  return {
    summary: {
      totalEarnings: 4250,
      thisMonth: 1850,
      lastMonth: 1680,
      change: 10.1,
      pendingPayouts: 320,
      nextPayout: getRelativeDate(5),
    },
    monthlyEarnings: [
      { month: 'Jul', earnings: 3200, bookings: 32 },
      { month: 'Aug', earnings: 3450, bookings: 35 },
      { month: 'Sep', earnings: 3800, bookings: 38 },
      { month: 'Okt', earnings: 4100, bookings: 40 },
      { month: 'Nov', earnings: 3950, bookings: 39 },
      { month: 'Dez', earnings: 4250, bookings: 42 },
    ],
    recentPayouts: [
      { id: 'po-1', amount: 1680, date: getRelativeDate(-30), status: 'PAID', method: 'Banküberweisung' },
      { id: 'po-2', amount: 1520, date: getRelativeDate(-60), status: 'PAID', method: 'Banküberweisung' },
      { id: 'po-3', amount: 1450, date: getRelativeDate(-90), status: 'PAID', method: 'Banküberweisung' },
    ],
    earningsByService: [
      { service: 'Damenhaarschnitt', count: 28, total: 1820 },
      { service: 'Balayage', count: 12, total: 2160 },
      { service: 'Herrenhaarschnitt', count: 18, total: 630 },
      { service: 'Strähnen', count: 8, total: 720 },
    ],
  }
}

// ============================================
// Stylist Invoices Mock Data
// ============================================
export function getMockStylistInvoices() {
  return {
    invoices: [
      {
        id: 'inv-1',
        invoiceNumber: 'INV-2024-001',
        date: getRelativeDate(-5),
        dueDate: getRelativeDate(10),
        amount: 650,
        status: 'PENDING',
        description: 'Stuhlmiete Dezember 2024',
        salonName: 'Hair & Beauty Lounge',
        pdfUrl: null,
      },
      {
        id: 'inv-2',
        invoiceNumber: 'INV-2024-002',
        date: getRelativeDate(-35),
        dueDate: getRelativeDate(-20),
        amount: 650,
        status: 'PAID',
        description: 'Stuhlmiete November 2024',
        salonName: 'Hair & Beauty Lounge',
        pdfUrl: null,
      },
      {
        id: 'inv-3',
        invoiceNumber: 'INV-2024-003',
        date: getRelativeDate(-65),
        dueDate: getRelativeDate(-50),
        amount: 650,
        status: 'PAID',
        description: 'Stuhlmiete Oktober 2024',
        salonName: 'Hair & Beauty Lounge',
        pdfUrl: null,
      },
    ],
    summary: {
      totalPending: 650,
      totalPaid: 1300,
      overdue: 0,
    },
  }
}

// ============================================
// Stylist Reviews Mock Data
// ============================================
export function getMockStylistReviews() {
  return {
    reviews: [
      {
        id: 'rv-1',
        rating: 5,
        title: 'Traumhafte Balayage!',
        comment: 'Bin super zufrieden, genau das was ich wollte! Die Farbe ist wunderschön geworden.',
        customerName: 'Lisa H.',
        serviceName: 'Balayage',
        createdAt: getRelativeDate(-5),
        response: null,
      },
      {
        id: 'rv-2',
        rating: 5,
        title: 'Bester Friseur der Stadt!',
        comment: 'Sehr professionell und nette Beratung. Komme definitiv wieder.',
        customerName: 'Anna S.',
        serviceName: 'Damenhaarschnitt',
        createdAt: getRelativeDate(-8),
        response: 'Vielen Dank für das tolle Feedback! Freue mich auf Ihren nächsten Besuch.',
      },
      {
        id: 'rv-3',
        rating: 4,
        title: 'Sehr zufrieden',
        comment: 'Tolle Arbeit, nur die Wartezeit war etwas lang.',
        customerName: 'Maria W.',
        serviceName: 'Färbung',
        createdAt: getRelativeDate(-12),
        response: null,
      },
    ],
    summary: {
      averageRating: 4.8,
      totalReviews: 42,
      ratingDistribution: {
        5: 32,
        4: 8,
        3: 2,
        2: 0,
        1: 0,
      },
    },
  }
}

// ============================================
// Salon Revenue Mock Data
// ============================================
export function getMockSalonRevenue() {
  return {
    summary: {
      totalRevenue: 24680,
      thisMonth: 8450,
      lastMonth: 7820,
      change: 8.1,
      pendingPayments: 1250,
    },
    monthlyRevenue: [
      { month: 'Jul', revenue: 18500, expenses: 12000, profit: 6500 },
      { month: 'Aug', revenue: 19200, expenses: 12500, profit: 6700 },
      { month: 'Sep', revenue: 20800, expenses: 13000, profit: 7800 },
      { month: 'Okt', revenue: 22100, expenses: 13500, profit: 8600 },
      { month: 'Nov', revenue: 23500, expenses: 14000, profit: 9500 },
      { month: 'Dez', revenue: 24680, expenses: 14500, profit: 10180 },
    ],
    revenueBySource: [
      { source: 'Stuhlmieten', amount: 15600, percentage: 63.2 },
      { source: 'Produktverkauf', amount: 5200, percentage: 21.1 },
      { source: 'Zusatzleistungen', amount: 3880, percentage: 15.7 },
    ],
    rentalIncome: [
      { stylist: 'Sarah Müller', chair: 'Stuhl 1', monthlyRent: 700, status: 'PAID' },
      { stylist: 'Alex Schmidt', chair: 'Stuhl 2', monthlyRent: 650, status: 'PAID' },
      { stylist: 'Julia Weber', chair: 'Stuhl 3', monthlyRent: 650, status: 'PENDING' },
      { stylist: 'Max Braun', chair: 'Stuhl 4', monthlyRent: 600, status: 'PAID' },
    ],
  }
}

// ============================================
// Salon Customers Mock Data
// ============================================
export function getMockSalonCustomers() {
  return {
    customers: [
      {
        id: 'cust-1',
        firstName: 'Emma',
        lastName: 'Wagner',
        email: 'emma@email.de',
        phone: '+49 170 1111111',
        totalBookings: 12,
        totalSpent: 1450,
        lastVisit: getRelativeDate(-3),
        preferredStylist: 'Sarah Müller',
        notes: 'VIP-Kundin, bevorzugt Termine am Vormittag',
      },
      {
        id: 'cust-2',
        firstName: 'Sophie',
        lastName: 'Müller',
        email: 'sophie@email.de',
        phone: '+49 171 2222222',
        totalBookings: 8,
        totalSpent: 920,
        lastVisit: getRelativeDate(-7),
        preferredStylist: 'Alex Schmidt',
        notes: null,
      },
      {
        id: 'cust-3',
        firstName: 'Laura',
        lastName: 'Weber',
        email: 'laura@email.de',
        phone: '+49 172 3333333',
        totalBookings: 5,
        totalSpent: 680,
        lastVisit: getRelativeDate(-14),
        preferredStylist: 'Julia Weber',
        notes: 'Allergisch gegen bestimmte Produkte',
      },
    ],
    summary: {
      totalCustomers: 186,
      newThisMonth: 24,
      activeCustomers: 142,
      averageSpent: 156.50,
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 186,
      totalPages: 10,
    },
  }
}

// ============================================
// Salon Stylists Mock Data
// ============================================
export function getMockSalonStylists() {
  return {
    stylists: [
      {
        id: 'st-1',
        name: 'Sarah Müller',
        email: 'sarah@email.de',
        phone: '+49 170 5555555',
        image: null,
        chairName: 'Stuhl 1',
        monthlyRent: 700,
        rentalStatus: 'ACTIVE',
        startDate: getRelativeDate(-180),
        totalBookings: 87,
        totalRevenue: 8750,
        rating: 4.9,
        specialties: ['Balayage', 'Färbung', 'Hochsteckfrisuren'],
      },
      {
        id: 'st-2',
        name: 'Alex Schmidt',
        email: 'alex@email.de',
        phone: '+49 171 6666666',
        image: null,
        chairName: 'Stuhl 2',
        monthlyRent: 650,
        rentalStatus: 'ACTIVE',
        startDate: getRelativeDate(-120),
        totalBookings: 72,
        totalRevenue: 6480,
        rating: 4.8,
        specialties: ['Herrenhaarschnitte', 'Bart-Styling'],
      },
      {
        id: 'st-3',
        name: 'Julia Weber',
        email: 'julia@email.de',
        phone: '+49 172 7777777',
        image: null,
        chairName: 'Stuhl 3',
        monthlyRent: 650,
        rentalStatus: 'ACTIVE',
        startDate: getRelativeDate(-90),
        totalBookings: 65,
        totalRevenue: 5850,
        rating: 4.7,
        specialties: ['Damenhaarschnitte', 'Styling'],
      },
    ],
    pendingRequests: [
      {
        id: 'req-1',
        name: 'Lena Klein',
        email: 'lena@email.de',
        phone: '+49 173 8888888',
        requestedChair: 'Stuhl 5',
        experience: 5,
        specialties: ['Colorationen', 'Extensions'],
        requestDate: getRelativeDate(-2),
        message: 'Ich suche einen Stuhl in Ihrem Salon für 3 Tage/Woche.',
      },
    ],
    summary: {
      totalStylists: 4,
      activeRentals: 4,
      pendingRequests: 1,
      totalMonthlyIncome: 2600,
    },
  }
}

// ============================================
// Salon Reviews Mock Data
// ============================================
export function getMockSalonReviews() {
  return {
    reviews: [
      {
        id: 'srv-1',
        rating: 5,
        title: 'Fantastischer Salon!',
        comment: 'Tolles Ambiente, super freundliches Team. Mein neuer Stammsalon!',
        customerName: 'Emma W.',
        stylistName: 'Sarah Müller',
        serviceName: 'Balayage',
        createdAt: getRelativeDate(-3),
        response: 'Herzlichen Dank! Wir freuen uns auf Ihren nächsten Besuch.',
      },
      {
        id: 'srv-2',
        rating: 4,
        title: 'Sehr professionell',
        comment: 'Gute Beratung und schönes Ergebnis. Nur Parkplätze sind schwer zu finden.',
        customerName: 'Sophie M.',
        stylistName: 'Alex Schmidt',
        serviceName: 'Herrenhaarschnitt',
        createdAt: getRelativeDate(-7),
        response: null,
      },
    ],
    summary: {
      averageRating: 4.7,
      totalReviews: 156,
      ratingDistribution: {
        5: 112,
        4: 32,
        3: 8,
        2: 3,
        1: 1,
      },
    },
  }
}

// ============================================
// Salon Invoices Mock Data
// ============================================
export function getMockSalonInvoices() {
  return {
    invoices: [
      {
        id: 'sinv-1',
        invoiceNumber: 'SALON-2024-001',
        date: getRelativeDate(-5),
        amount: 2600,
        status: 'PAID',
        type: 'Stuhlmieten',
        description: 'Mieteinnahmen Dezember 2024',
        stylists: ['Sarah Müller', 'Alex Schmidt', 'Julia Weber', 'Max Braun'],
      },
      {
        id: 'sinv-2',
        invoiceNumber: 'SALON-2024-002',
        date: getRelativeDate(-35),
        amount: 2600,
        status: 'PAID',
        type: 'Stuhlmieten',
        description: 'Mieteinnahmen November 2024',
        stylists: ['Sarah Müller', 'Alex Schmidt', 'Julia Weber', 'Max Braun'],
      },
    ],
    summary: {
      totalReceived: 5200,
      pendingPayments: 650,
      totalStylists: 4,
    },
  }
}

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

// ============================================
// Stylist Profile Mock Data
// ============================================
export function getMockStylistProfile() {
  return {
    id: 'demo-stylist-001',
    name: 'Demo Stylist',
    email: 'demo.stylist@nicnoa.de',
    image: null,
    profile: {
      bio: 'Leidenschaftliche Friseurin mit über 8 Jahren Erfahrung in allen Bereichen des Haarstylings. Spezialisiert auf Balayage, moderne Schnitte und kreative Colorationen.',
      experience: 8,
      phone: '+49 170 1234567',
      street: 'Musterstraße 123',
      city: 'Berlin',
      zipCode: '10115',
      instagramUrl: '@demo_stylist',
      tiktokUrl: '@demo_stylist',
      websiteUrl: 'https://demo-stylist.de',
      skills: [
        { name: 'Damenhaarschnitt', rating: 5 },
        { name: 'Herrenhaarschnitt', rating: 4 },
        { name: 'Balayage', rating: 5 },
        { name: 'Colorationen', rating: 5 },
        { name: 'Strähnen', rating: 4 },
        { name: 'Hochsteckfrisuren', rating: 4 },
        { name: 'Brautstyling', rating: 3 },
        { name: 'Extensions', rating: 3 },
      ],
    },
    stats: {
      totalBookings: 342,
      averageRating: 4.8,
      totalReviews: 86,
    },
  }
}

// ============================================
// Stylist Availability Mock Data
// ============================================
export function getMockStylistAvailability() {
  return {
    monday: { enabled: true, slots: [{ id: '1', start: '09:00', end: '17:00' }] },
    tuesday: { enabled: true, slots: [{ id: '2', start: '09:00', end: '17:00' }] },
    wednesday: { enabled: true, slots: [{ id: '3', start: '10:00', end: '18:00' }] },
    thursday: { enabled: true, slots: [{ id: '4', start: '09:00', end: '17:00' }] },
    friday: { enabled: true, slots: [{ id: '5', start: '09:00', end: '15:00' }] },
    saturday: { enabled: true, slots: [{ id: '6', start: '09:00', end: '13:00' }] },
    sunday: { enabled: false, slots: [] },
  }
}

// ============================================
// Stylist Workspace Mock Data
// ============================================
export function getMockStylistWorkspace() {
  return {
    rental: {
      id: 'rental-demo-001',
      startDate: getRelativeDate(-90),
      endDate: getRelativeDate(275),
      status: 'ACTIVE',
      monthlyRent: 650,
      nextPaymentDate: getRelativeDate(15),
    },
    chair: {
      id: 'chair-demo-001',
      name: 'Stuhl 3',
      description: 'Moderner Arbeitsplatz mit großem Spiegel, LED-Beleuchtung und professioneller Ausstattung.',
      equipment: ['Profi-Haartrockner', 'Styling-Tools', 'Waschbecken', 'Werkzeugwagen', 'Sterilisator'],
    },
    salon: {
      id: 'salon-demo-001',
      name: 'Hair & Beauty Lounge',
      address: 'Schönhauser Allee 123',
      city: 'Berlin',
      owner: {
        name: 'Maria Salonbesitzer',
        image: null,
      },
      openingHours: {
        monday: '09:00 - 19:00',
        tuesday: '09:00 - 19:00',
        wednesday: '09:00 - 19:00',
        thursday: '09:00 - 20:00',
        friday: '09:00 - 19:00',
        saturday: '09:00 - 16:00',
        sunday: 'Geschlossen',
      },
    },
    amenities: ['WLAN', 'Klimaanlage', 'Pausenraum', 'Küche', 'Parkplatz', 'Handtuch-Service'],
  }
}

// ============================================
// Stylist Find-Salon Mock Data
// ============================================
export function getMockFindSalon() {
  return {
    salons: [
      {
        id: 'salon-1',
        name: 'Hair & Beauty Lounge',
        description: 'Moderner Salon im Herzen von Berlin mit Top-Ausstattung und angenehmer Atmosphäre.',
        address: 'Schönhauser Allee 123',
        city: 'Berlin',
        zipCode: '10435',
        image: null,
        rating: 4.8,
        totalReviews: 156,
        owner: { name: 'Maria Salonbesitzer', image: null },
        chairs: [
          { id: 'c1', pricePerMonth: 700, isAvailable: false },
          { id: 'c2', pricePerMonth: 650, isAvailable: true },
          { id: 'c3', pricePerMonth: 650, isAvailable: false },
        ],
        amenities: ['WLAN', 'Klimaanlage', 'Parkplatz'],
      },
      {
        id: 'salon-2',
        name: 'Salon Elegance',
        description: 'Eleganter Friseursalon mit gehobener Ausstattung für anspruchsvolle Stylisten.',
        address: 'Kurfürstendamm 45',
        city: 'Berlin',
        zipCode: '10719',
        image: null,
        rating: 4.9,
        totalReviews: 89,
        owner: { name: 'Thomas Elegant', image: null },
        chairs: [
          { id: 'c4', pricePerMonth: 850, isAvailable: true },
          { id: 'c5', pricePerMonth: 850, isAvailable: true },
        ],
        amenities: ['WLAN', 'Klimaanlage', 'Pausenraum', 'Catering'],
      },
      {
        id: 'salon-3',
        name: 'Style Studio',
        description: 'Kreativer Salon für moderne Stylisten mit innovativem Konzept.',
        address: 'Friedrichstraße 89',
        city: 'Berlin',
        zipCode: '10117',
        image: null,
        rating: 4.6,
        totalReviews: 67,
        owner: { name: 'Julia Kreativ', image: null },
        chairs: [
          { id: 'c6', pricePerMonth: 550, isAvailable: true },
          { id: 'c7', pricePerMonth: 550, isAvailable: false },
        ],
        amenities: ['WLAN', 'Küche'],
      },
    ],
    cities: ['Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt'],
    total: 3,
    page: 1,
    totalPages: 1,
  }
}

// ============================================
// Stylist Settings Mock Data
// ============================================
export function getMockStylistSettings() {
  return {
    name: 'Demo Stylist',
    email: 'demo.stylist@nicnoa.de',
    phone: '+49 170 1234567',
    bio: 'Leidenschaftliche Friseurin mit über 8 Jahren Erfahrung.',
    address: 'Musterstraße 123',
    city: 'Berlin',
    zipCode: '10115',
    instagramUrl: '@demo_stylist',
    tiktokUrl: '@demo_stylist',
    websiteUrl: 'https://demo-stylist.de',
    emailNotifications: true,
    smsNotifications: false,
    bookingReminders: true,
    marketingEmails: false,
    newBookingAlert: true,
    cancellationAlert: true,
    reviewAlert: true,
  }
}

// ============================================
// Salon Settings Mock Data
// ============================================
export function getMockSalonSettings() {
  return {
    salonName: 'Hair & Beauty Lounge',
    description: 'Moderner Salon im Herzen von Berlin.',
    address: 'Schönhauser Allee 123',
    city: 'Berlin',
    zipCode: '10435',
    phone: '+49 30 12345678',
    email: 'kontakt@hairbeautylounge.de',
    website: 'https://hairbeautylounge.de',
    emailNotifications: true,
    smsNotifications: false,
    bookingReminders: true,
    marketingEmails: true,
    newBookingAlert: true,
    cancellationAlert: true,
    reviewAlert: true,
  }
}

// ============================================
// Messaging Mock Data
// ============================================
export function getMockConversations() {
  return {
    conversations: [
      {
        id: 'conv-1',
        participants: [
          { id: 'p1', name: 'Maria Salonbesitzer', image: null, role: 'SALON_OWNER' },
          { id: 'p2', name: 'Demo Stylist', image: null, role: 'STYLIST' },
        ],
        lastMessage: {
          id: 'msg-1',
          content: 'Vielen Dank für die schnelle Rückmeldung!',
          createdAt: getRelativeDate(0, 14, 30),
          senderId: 'p1',
        },
        unreadCount: 2,
        createdAt: getRelativeDate(-5),
        updatedAt: getRelativeDate(0, 14, 30),
      },
      {
        id: 'conv-2',
        participants: [
          { id: 'p3', name: 'Anna Kundin', image: null, role: 'CUSTOMER' },
          { id: 'p2', name: 'Demo Stylist', image: null, role: 'STYLIST' },
        ],
        lastMessage: {
          id: 'msg-2',
          content: 'Können wir den Termin auf 15 Uhr verschieben?',
          createdAt: getRelativeDate(-1, 10, 0),
          senderId: 'p3',
        },
        unreadCount: 1,
        createdAt: getRelativeDate(-10),
        updatedAt: getRelativeDate(-1, 10, 0),
      },
      {
        id: 'conv-3',
        participants: [
          { id: 'p4', name: 'NICNOA Support', image: null, role: 'ADMIN' },
          { id: 'p2', name: 'Demo Stylist', image: null, role: 'STYLIST' },
        ],
        lastMessage: {
          id: 'msg-3',
          content: 'Willkommen bei NICNOA! Bei Fragen stehen wir dir gerne zur Verfügung.',
          createdAt: getRelativeDate(-7),
          senderId: 'p4',
        },
        unreadCount: 0,
        createdAt: getRelativeDate(-7),
        updatedAt: getRelativeDate(-7),
      },
    ],
    total: 3,
  }
}

export function getMockMessages(conversationId: string) {
  const messages: Record<string, any[]> = {
    'conv-1': [
      { id: 'm1-1', content: 'Hallo! Ich wollte fragen, ob der Stuhl noch frei ist.', senderId: 'p2', createdAt: getRelativeDate(-5), readBy: ['p1', 'p2'] },
      { id: 'm1-2', content: 'Ja, Stuhl 2 ist noch verfügbar! Möchtest du einen Besichtigungstermin?', senderId: 'p1', createdAt: getRelativeDate(-5, 14, 0), readBy: ['p1', 'p2'] },
      { id: 'm1-3', content: 'Das wäre super! Passt es morgen um 10 Uhr?', senderId: 'p2', createdAt: getRelativeDate(-4), readBy: ['p1', 'p2'] },
      { id: 'm1-4', content: 'Perfekt, bis morgen!', senderId: 'p1', createdAt: getRelativeDate(-4, 10, 0), readBy: ['p1', 'p2'] },
      { id: 'm1-5', content: 'Vielen Dank für die schnelle Rückmeldung!', senderId: 'p1', createdAt: getRelativeDate(0, 14, 30), readBy: ['p1'] },
    ],
    'conv-2': [
      { id: 'm2-1', content: 'Hallo, ich möchte einen Termin für Balayage buchen.', senderId: 'p3', createdAt: getRelativeDate(-10), readBy: ['p2', 'p3'] },
      { id: 'm2-2', content: 'Gerne! Wie wäre es am Freitag um 14 Uhr?', senderId: 'p2', createdAt: getRelativeDate(-10, 11, 0), readBy: ['p2', 'p3'] },
      { id: 'm2-3', content: 'Das passt! Bis dann.', senderId: 'p3', createdAt: getRelativeDate(-10, 12, 0), readBy: ['p2', 'p3'] },
      { id: 'm2-4', content: 'Können wir den Termin auf 15 Uhr verschieben?', senderId: 'p3', createdAt: getRelativeDate(-1, 10, 0), readBy: ['p3'] },
    ],
    'conv-3': [
      { id: 'm3-1', content: 'Willkommen bei NICNOA! Bei Fragen stehen wir dir gerne zur Verfügung.', senderId: 'p4', createdAt: getRelativeDate(-7), readBy: ['p2', 'p4'] },
    ],
  }
  return messages[conversationId] || []
}

// ============================================
// Notifications Mock Data
// ============================================
export function getMockNotifications() {
  return {
    notifications: [
      {
        id: 'notif-1',
        type: 'BOOKING_CONFIRMED',
        title: 'Buchung bestätigt',
        message: 'Deine Buchung bei Hair & Beauty Lounge wurde bestätigt.',
        isRead: false,
        createdAt: getRelativeDate(0, 10, 0),
        link: '/stylist/bookings',
      },
      {
        id: 'notif-2',
        type: 'NEW_REVIEW',
        title: 'Neue Bewertung',
        message: 'Lisa H. hat dir eine 5-Sterne-Bewertung gegeben.',
        isRead: false,
        createdAt: getRelativeDate(-1),
        link: '/stylist/reviews',
      },
      {
        id: 'notif-3',
        type: 'PAYMENT_RECEIVED',
        title: 'Zahlung eingegangen',
        message: 'Deine Auszahlung von 1.680,00 € wurde überwiesen.',
        isRead: true,
        createdAt: getRelativeDate(-3),
        link: '/stylist/earnings',
      },
      {
        id: 'notif-4',
        type: 'RENTAL_REMINDER',
        title: 'Miete fällig',
        message: 'Deine Stuhlmiete für Dezember wird in 5 Tagen fällig.',
        isRead: true,
        createdAt: getRelativeDate(-5),
        link: '/stylist/invoices',
      },
    ],
    unreadCount: 2,
    total: 4,
  }
}

// ============================================
// Admin Users Mock Data
// ============================================
export function getMockAdminUsers() {
  return {
    users: [
      {
        id: 'user-1',
        name: 'Sarah Müller',
        email: 'sarah@email.de',
        role: 'STYLIST',
        status: 'ACTIVE',
        createdAt: getRelativeDate(-180),
        lastLogin: getRelativeDate(-1),
        image: null,
        subscriptionStatus: 'active',
      },
      {
        id: 'user-2',
        name: 'Maria Salonbesitzer',
        email: 'maria@salon.de',
        role: 'SALON_OWNER',
        status: 'ACTIVE',
        createdAt: getRelativeDate(-365),
        lastLogin: getRelativeDate(0),
        image: null,
        subscriptionStatus: 'active',
      },
      {
        id: 'user-3',
        name: 'Alex Schmidt',
        email: 'alex@email.de',
        role: 'STYLIST',
        status: 'PENDING',
        createdAt: getRelativeDate(-5),
        lastLogin: getRelativeDate(-2),
        image: null,
        subscriptionStatus: 'trialing',
      },
      {
        id: 'user-4',
        name: 'Thomas Admin',
        email: 'thomas@nicnoa.de',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: getRelativeDate(-500),
        lastLogin: getRelativeDate(0),
        image: null,
        subscriptionStatus: null,
      },
    ],
    summary: {
      totalUsers: 1247,
      activeUsers: 1089,
      newThisMonth: 87,
      stylists: 892,
      salonOwners: 312,
      admins: 5,
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 1247,
      totalPages: 63,
    },
  }
}

// ============================================
// Admin Salons Mock Data
// ============================================
export function getMockAdminSalons() {
  return {
    salons: [
      {
        id: 'salon-1',
        name: 'Hair & Beauty Lounge',
        ownerName: 'Maria Salonbesitzer',
        ownerEmail: 'maria@salon.de',
        city: 'Berlin',
        address: 'Schönhauser Allee 123',
        status: 'ACTIVE',
        totalChairs: 5,
        occupiedChairs: 4,
        monthlyRevenue: 2600,
        rating: 4.8,
        createdAt: getRelativeDate(-365),
      },
      {
        id: 'salon-2',
        name: 'Salon Elegance',
        ownerName: 'Thomas Elegant',
        ownerEmail: 'thomas@elegance.de',
        city: 'Berlin',
        address: 'Kurfürstendamm 45',
        status: 'ACTIVE',
        totalChairs: 4,
        occupiedChairs: 3,
        monthlyRevenue: 2550,
        rating: 4.9,
        createdAt: getRelativeDate(-280),
      },
      {
        id: 'salon-3',
        name: 'Style Studio',
        ownerName: 'Julia Kreativ',
        ownerEmail: 'julia@studio.de',
        city: 'Berlin',
        address: 'Friedrichstraße 89',
        status: 'PENDING',
        totalChairs: 3,
        occupiedChairs: 1,
        monthlyRevenue: 550,
        rating: 4.6,
        createdAt: getRelativeDate(-30),
      },
    ],
    summary: {
      totalSalons: 312,
      activeSalons: 285,
      pendingSalons: 18,
      totalChairs: 1456,
      occupiedChairs: 1124,
      averageOccupancy: 77.2,
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 312,
      totalPages: 16,
    },
  }
}

// ============================================
// Admin Stylists Mock Data
// ============================================
export function getMockAdminStylists() {
  return {
    stylists: [
      {
        id: 'stylist-1',
        name: 'Sarah Müller',
        email: 'sarah@email.de',
        phone: '+49 170 5555555',
        status: 'ACTIVE',
        salonName: 'Hair & Beauty Lounge',
        experience: 8,
        rating: 4.9,
        totalBookings: 342,
        monthlyEarnings: 4250,
        subscriptionStatus: 'active',
        onboardingStatus: 'APPROVED',
        createdAt: getRelativeDate(-180),
      },
      {
        id: 'stylist-2',
        name: 'Alex Schmidt',
        email: 'alex@email.de',
        phone: '+49 171 6666666',
        status: 'ACTIVE',
        salonName: 'Hair & Beauty Lounge',
        experience: 5,
        rating: 4.8,
        totalBookings: 215,
        monthlyEarnings: 3200,
        subscriptionStatus: 'active',
        onboardingStatus: 'APPROVED',
        createdAt: getRelativeDate(-120),
      },
      {
        id: 'stylist-3',
        name: 'Lena Klein',
        email: 'lena@email.de',
        phone: '+49 172 7777777',
        status: 'PENDING',
        salonName: null,
        experience: 3,
        rating: null,
        totalBookings: 0,
        monthlyEarnings: 0,
        subscriptionStatus: 'trialing',
        onboardingStatus: 'PENDING_REVIEW',
        createdAt: getRelativeDate(-5),
      },
    ],
    summary: {
      totalStylists: 892,
      activeStylists: 756,
      pendingStylists: 45,
      averageRating: 4.6,
      totalMonthlyEarnings: 285600,
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 892,
      totalPages: 45,
    },
  }
}

// ============================================
// Admin Service Categories Mock Data
// ============================================
export function getMockAdminServiceCategories() {
  return {
    categories: [
      {
        id: 'cat-1',
        name: 'Schneiden',
        description: 'Alle Arten von Haarschnitten',
        servicesCount: 8,
        isActive: true,
        createdAt: getRelativeDate(-500),
      },
      {
        id: 'cat-2',
        name: 'Färben',
        description: 'Colorationen, Strähnen und Tönung',
        servicesCount: 12,
        isActive: true,
        createdAt: getRelativeDate(-500),
      },
      {
        id: 'cat-3',
        name: 'Styling',
        description: 'Föhnen, Glätten, Locken',
        servicesCount: 6,
        isActive: true,
        createdAt: getRelativeDate(-500),
      },
      {
        id: 'cat-4',
        name: 'Behandlung',
        description: 'Pflege, Kuren und Treatments',
        servicesCount: 10,
        isActive: true,
        createdAt: getRelativeDate(-500),
      },
      {
        id: 'cat-5',
        name: 'Spezial',
        description: 'Hochsteckfrisuren, Brautstyling, Extensions',
        servicesCount: 5,
        isActive: true,
        createdAt: getRelativeDate(-500),
      },
    ],
    services: [
      { id: 's1', name: 'Damenhaarschnitt', categoryId: 'cat-1', price: 55, duration: 45, isActive: true },
      { id: 's2', name: 'Herrenhaarschnitt', categoryId: 'cat-1', price: 35, duration: 30, isActive: true },
      { id: 's3', name: 'Kinderhaarschnitt', categoryId: 'cat-1', price: 25, duration: 25, isActive: true },
      { id: 's4', name: 'Balayage', categoryId: 'cat-2', price: 180, duration: 180, isActive: true },
      { id: 's5', name: 'Strähnen', categoryId: 'cat-2', price: 90, duration: 90, isActive: true },
      { id: 's6', name: 'Komplettfärbung', categoryId: 'cat-2', price: 120, duration: 120, isActive: true },
      { id: 's7', name: 'Föhnen', categoryId: 'cat-3', price: 30, duration: 30, isActive: true },
      { id: 's8', name: 'Glätten', categoryId: 'cat-3', price: 45, duration: 45, isActive: true },
      { id: 's9', name: 'Intensivpflege', categoryId: 'cat-4', price: 35, duration: 30, isActive: true },
      { id: 's10', name: 'Hochsteckfrisur', categoryId: 'cat-5', price: 80, duration: 60, isActive: true },
    ],
  }
}

// ============================================
// Admin Plans Mock Data
// ============================================
export function getMockAdminPlans() {
  return {
    plans: [
      {
        id: 'plan-1',
        name: 'Stylist Basic',
        type: 'STYLIST',
        description: 'Für Einsteiger und Teilzeit-Stylisten',
        prices: {
          monthly: 29,
          quarterly: 79,
          yearly: 290,
        },
        features: ['Bis zu 50 Buchungen/Monat', 'Basis-Kalender', 'E-Mail-Support'],
        isActive: true,
        subscribersCount: 245,
        stripePriceId: 'price_stylist_basic',
        createdAt: getRelativeDate(-500),
      },
      {
        id: 'plan-2',
        name: 'Stylist Pro',
        type: 'STYLIST',
        description: 'Für professionelle Stylisten',
        prices: {
          monthly: 49,
          quarterly: 129,
          yearly: 470,
        },
        features: ['Unbegrenzte Buchungen', 'Erweiterte Analytics', 'Prioritäts-Support', 'Eigenes Profil'],
        isActive: true,
        subscribersCount: 512,
        stripePriceId: 'price_stylist_pro',
        createdAt: getRelativeDate(-500),
      },
      {
        id: 'plan-3',
        name: 'Salon Starter',
        type: 'SALON_OWNER',
        description: 'Für kleine Salons',
        prices: {
          monthly: 79,
          quarterly: 209,
          yearly: 790,
        },
        features: ['Bis zu 3 Stühle', 'Basis-Verwaltung', 'E-Mail-Support'],
        isActive: true,
        subscribersCount: 89,
        stripePriceId: 'price_salon_starter',
        createdAt: getRelativeDate(-500),
      },
      {
        id: 'plan-4',
        name: 'Salon Pro',
        type: 'SALON_OWNER',
        description: 'Für professionelle Salons',
        prices: {
          monthly: 149,
          quarterly: 399,
          yearly: 1490,
        },
        features: ['Unbegrenzte Stühle', 'Erweiterte Analytics', 'API-Zugang', 'Account Manager'],
        isActive: true,
        subscribersCount: 156,
        stripePriceId: 'price_salon_pro',
        createdAt: getRelativeDate(-500),
      },
    ],
    summary: {
      totalPlans: 4,
      activePlans: 4,
      totalSubscribers: 1002,
      monthlyRevenue: 48500,
    },
  }
}

// ============================================
// Admin Referrals Mock Data
// ============================================
export function getMockAdminReferrals() {
  return {
    referrals: [
      {
        id: 'ref-1',
        referrerName: 'Sarah Müller',
        referrerEmail: 'sarah@email.de',
        referrerRole: 'STYLIST',
        referredName: 'Lisa Klein',
        referredEmail: 'lisa@email.de',
        referredRole: 'STYLIST',
        status: 'CONVERTED',
        reward: { type: 'FREE_MONTH', value: 1 },
        createdAt: getRelativeDate(-30),
        convertedAt: getRelativeDate(-15),
      },
      {
        id: 'ref-2',
        referrerName: 'Maria Salonbesitzer',
        referrerEmail: 'maria@salon.de',
        referrerRole: 'SALON_OWNER',
        referredName: 'Thomas Elegant',
        referredEmail: 'thomas@elegance.de',
        referredRole: 'SALON_OWNER',
        status: 'CONVERTED',
        reward: { type: 'FREE_MONTH', value: 1 },
        createdAt: getRelativeDate(-60),
        convertedAt: getRelativeDate(-45),
      },
      {
        id: 'ref-3',
        referrerName: 'Alex Schmidt',
        referrerEmail: 'alex@email.de',
        referrerRole: 'STYLIST',
        referredName: 'Julia Weber',
        referredEmail: 'julia@email.de',
        referredRole: 'STYLIST',
        status: 'PENDING',
        reward: null,
        createdAt: getRelativeDate(-5),
        convertedAt: null,
      },
    ],
    summary: {
      totalReferrals: 342,
      convertedReferrals: 287,
      pendingReferrals: 55,
      conversionRate: 83.9,
      totalRewardsGiven: 287,
      rewardsValueTotal: 8610,
    },
    byRole: {
      stylist: { sent: 256, converted: 218, rate: 85.2 },
      salonOwner: { sent: 86, converted: 69, rate: 80.2 },
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 342,
      totalPages: 18,
    },
  }
}

// ============================================
// Admin Onboarding Applications Mock Data
// ============================================
export function getMockAdminOnboarding() {
  return {
    applications: [
      {
        id: 'app-1',
        userId: 'user-pending-1',
        userName: 'Lena Klein',
        userEmail: 'lena@email.de',
        status: 'PENDING_REVIEW',
        submittedAt: getRelativeDate(-2),
        businessData: {
          companyName: 'Lena Klein Haarstyling',
          street: 'Musterstraße 45',
          city: 'Berlin',
          zipCode: '10245',
          taxId: 'DE123456789',
        },
        documents: [
          { type: 'MASTER_CERTIFICATE', status: 'UPLOADED', uploadedAt: getRelativeDate(-2) },
          { type: 'BUSINESS_REGISTRATION', status: 'UPLOADED', uploadedAt: getRelativeDate(-2) },
          { type: 'LIABILITY_INSURANCE', status: 'UPLOADED', uploadedAt: getRelativeDate(-2) },
          { type: 'STATUS_DETERMINATION', status: 'PENDING', uploadedAt: null },
          { type: 'CRAFT_CHAMBER', status: 'UPLOADED', uploadedAt: getRelativeDate(-2) },
        ],
        selfEmploymentChecks: 8,
      },
      {
        id: 'app-2',
        userId: 'user-pending-2',
        userName: 'Max Braun',
        userEmail: 'max@email.de',
        status: 'PENDING_REVIEW',
        submittedAt: getRelativeDate(-5),
        businessData: {
          companyName: 'Braun Styling',
          street: 'Hauptstraße 12',
          city: 'Hamburg',
          zipCode: '20095',
          taxId: 'DE987654321',
        },
        documents: [
          { type: 'MASTER_CERTIFICATE', status: 'UPLOADED', uploadedAt: getRelativeDate(-5) },
          { type: 'BUSINESS_REGISTRATION', status: 'UPLOADED', uploadedAt: getRelativeDate(-5) },
          { type: 'LIABILITY_INSURANCE', status: 'UPLOADED', uploadedAt: getRelativeDate(-5) },
          { type: 'STATUS_DETERMINATION', status: 'UPLOADED', uploadedAt: getRelativeDate(-5) },
          { type: 'CRAFT_CHAMBER', status: 'UPLOADED', uploadedAt: getRelativeDate(-5) },
        ],
        selfEmploymentChecks: 8,
      },
    ],
    summary: {
      totalApplications: 45,
      pendingReview: 12,
      approved: 28,
      rejected: 5,
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 45,
      totalPages: 3,
    },
  }
}

// ============================================
// Admin Security Mock Data
// ============================================
export function getMockAdminSecurity() {
  return {
    sessions: [
      {
        id: 'sess-1',
        userId: 'user-1',
        userName: 'Sarah Müller',
        userEmail: 'sarah@email.de',
        device: 'Chrome on Windows',
        ipAddress: '192.168.1.100',
        location: 'Berlin, DE',
        lastActive: getRelativeDate(0, 10, 0),
        createdAt: getRelativeDate(-7),
      },
      {
        id: 'sess-2',
        userId: 'user-2',
        userName: 'Maria Salonbesitzer',
        userEmail: 'maria@salon.de',
        device: 'Safari on macOS',
        ipAddress: '192.168.1.101',
        location: 'Berlin, DE',
        lastActive: getRelativeDate(0, 9, 30),
        createdAt: getRelativeDate(-1),
      },
    ],
    apiKeys: [
      {
        id: 'key-1',
        name: 'Booking Integration',
        keyPrefix: 'nk_live_xxxx...abcd',
        createdAt: getRelativeDate(-90),
        lastUsed: getRelativeDate(-1),
        permissions: ['read:bookings', 'write:bookings'],
        status: 'ACTIVE',
      },
      {
        id: 'key-2',
        name: 'Analytics Export',
        keyPrefix: 'nk_live_yyyy...efgh',
        createdAt: getRelativeDate(-30),
        lastUsed: getRelativeDate(-5),
        permissions: ['read:analytics'],
        status: 'ACTIVE',
      },
    ],
    logs: [
      {
        id: 'log-1',
        event: 'LOGIN_SUCCESS',
        userId: 'user-1',
        userEmail: 'sarah@email.de',
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/120.0',
        status: 'SUCCESS',
        message: 'Erfolgreicher Login',
        createdAt: getRelativeDate(0, 10, 0),
      },
      {
        id: 'log-2',
        event: 'PASSWORD_CHANGED',
        userId: 'user-3',
        userEmail: 'alex@email.de',
        ipAddress: '192.168.1.102',
        userAgent: 'Firefox/121.0',
        status: 'SUCCESS',
        message: 'Passwort erfolgreich geändert',
        createdAt: getRelativeDate(-1),
      },
      {
        id: 'log-3',
        event: 'LOGIN_FAILED',
        userId: null,
        userEmail: 'unknown@email.de',
        ipAddress: '45.67.89.123',
        userAgent: 'Unknown',
        status: 'FAILED',
        message: 'Ungültige Anmeldedaten',
        createdAt: getRelativeDate(-2),
      },
    ],
    summary: {
      activeSessions: 156,
      activeApiKeys: 2,
      loginAttempts24h: 342,
      failedLogins24h: 12,
    },
  }
}

// ============================================
// Admin Email Templates Mock Data
// ============================================
export function getMockAdminEmailTemplates() {
  return {
    templates: [
      {
        id: 'tpl-1',
        name: 'welcome',
        subject: 'Willkommen bei NICNOA!',
        description: 'Begrüßungs-E-Mail für neue Benutzer',
        isActive: true,
        lastModified: getRelativeDate(-30),
      },
      {
        id: 'tpl-2',
        name: 'password-reset',
        subject: 'Passwort zurücksetzen',
        description: 'E-Mail zum Zurücksetzen des Passworts',
        isActive: true,
        lastModified: getRelativeDate(-60),
      },
      {
        id: 'tpl-3',
        name: 'booking-confirmation',
        subject: 'Buchungsbestätigung',
        description: 'Bestätigung für neue Buchungen',
        isActive: true,
        lastModified: getRelativeDate(-45),
      },
      {
        id: 'tpl-4',
        name: 'booking-reminder',
        subject: 'Terminerinnerung',
        description: 'Erinnerung vor anstehenden Terminen',
        isActive: true,
        lastModified: getRelativeDate(-45),
      },
      {
        id: 'tpl-5',
        name: 'subscription-activated',
        subject: 'Abonnement aktiviert',
        description: 'Bestätigung der Abo-Aktivierung',
        isActive: true,
        lastModified: getRelativeDate(-90),
      },
      {
        id: 'tpl-6',
        name: 'payment-failed',
        subject: 'Zahlungsproblem',
        description: 'Benachrichtigung bei fehlgeschlagener Zahlung',
        isActive: true,
        lastModified: getRelativeDate(-90),
      },
    ],
    brandingSettings: {
      logoUrl: null,
      primaryColor: '#ec4899',
      companyName: 'NICNOA',
      supportEmail: 'support@nicnoa.de',
      footerText: '© 2024 NICNOA. Alle Rechte vorbehalten.',
    },
  }
}

// ============================================
// Admin Settings Mock Data
// ============================================
export function getMockAdminSettings() {
  return {
    platform: {
      name: 'NICNOA',
      url: 'https://nicnoa.de',
      supportEmail: 'support@nicnoa.de',
      defaultLanguage: 'de',
      timezone: 'Europe/Berlin',
      maintenanceMode: false,
      useDemoMode: true,
      demoModeMessage: 'Demo-Modus aktiv - Daten sind simuliert',
    },
    stripe: {
      isConfigured: false,
      webhookConfigured: false,
      lastWebhookEvent: null,
    },
    email: {
      provider: 'resend',
      isConfigured: true,
      fromEmail: 'noreply@nicnoa.de',
      replyToEmail: 'support@nicnoa.de',
    },
    storage: {
      provider: 'vercel-blob',
      isConfigured: true,
      usedStorage: '1.2 GB',
      maxStorage: '10 GB',
    },
    security: {
      passwordMinLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
    },
  }
}

// ============================================
// Admin Analytics Mock Data (für API)
// ============================================
export function getMockAdminAnalytics() {
  return {
    pageViews: [
      { page: '/dashboard', views: 12450, change: 12.5 },
      { page: '/bookings', views: 8320, change: 8.3 },
      { page: '/calendar', views: 6890, change: -2.1 },
      { page: '/clients', views: 5420, change: 15.7 },
      { page: '/settings', views: 2180, change: 4.2 },
    ],
    userActivity: [
      { hour: '00', users: 120 },
      { hour: '04', users: 45 },
      { hour: '08', users: 890 },
      { hour: '12', users: 1250 },
      { hour: '16', users: 980 },
      { hour: '20', users: 650 },
    ],
    deviceStats: [
      { device: 'Desktop', percentage: 58 },
      { device: 'Mobile', percentage: 35 },
      { device: 'Tablet', percentage: 7 },
    ],
    metrics: {
      totalUsers: 1247,
      activeUsers: 892,
      averageSessionDuration: '12m 34s',
      bounceRate: 24.5,
      pageViewsTotal: 35260,
      newUsersThisMonth: 87,
    },
    growth: {
      users: [
        { month: 'Jul', value: 980 },
        { month: 'Aug', value: 1020 },
        { month: 'Sep', value: 1085 },
        { month: 'Okt', value: 1142 },
        { month: 'Nov', value: 1198 },
        { month: 'Dez', value: 1247 },
      ],
      revenue: [
        { month: 'Jul', value: 32500 },
        { month: 'Aug', value: 35800 },
        { month: 'Sep', value: 38200 },
        { month: 'Okt', value: 42100 },
        { month: 'Nov', value: 45800 },
        { month: 'Dez', value: 48500 },
      ],
    },
  }
}

// ============================================
// Salon Chairs Mock Data
// ============================================
export function getMockSalonChairs() {
  return {
    chairs: [
      {
        id: 'chair-1',
        name: 'Platz 1 - Fenster',
        description: 'Heller Arbeitsplatz mit Tageslicht am Fenster',
        dailyRate: 45,
        weeklyRate: 250,
        monthlyRate: 850,
        amenities: ['Tageslicht', 'Steckdose', 'Spiegel', 'Waschbecken in der Nähe'],
        images: [],
        isAvailable: false,
        isActive: true,
        createdAt: new Date('2024-01-15'),
        currentRental: {
          id: 'rental-1',
          stylistId: 'stylist-1',
          stylist: {
            id: 'stylist-1',
            name: 'Maria Schmidt',
            email: 'maria@example.com',
            image: null
          },
          startDate: new Date('2024-06-01'),
          endDate: null,
          monthlyRent: 850,
          status: 'ACTIVE'
        }
      },
      {
        id: 'chair-2',
        name: 'Platz 2 - Mitte',
        description: 'Zentraler Arbeitsplatz mit guter Beleuchtung',
        dailyRate: 40,
        weeklyRate: 220,
        monthlyRate: 750,
        amenities: ['LED-Beleuchtung', 'Steckdose', 'Spiegel', 'Schubladen'],
        images: [],
        isAvailable: true,
        isActive: true,
        createdAt: new Date('2024-01-15'),
        currentRental: null
      },
      {
        id: 'chair-3',
        name: 'Platz 3 - Premium',
        description: 'Großer Arbeitsplatz mit privater Ecke',
        dailyRate: 55,
        weeklyRate: 300,
        monthlyRate: 1000,
        amenities: ['Privater Bereich', 'Eigenes Waschbecken', 'Premium-Spiegel', 'Klimaanlage'],
        images: [],
        isAvailable: true,
        isActive: true,
        createdAt: new Date('2024-02-01'),
        currentRental: null
      },
      {
        id: 'chair-4',
        name: 'Platz 4 - Eingang',
        description: 'Arbeitsplatz nahe dem Empfangsbereich',
        dailyRate: 35,
        weeklyRate: 190,
        monthlyRate: 650,
        amenities: ['Steckdose', 'Spiegel', 'Kundennah'],
        images: [],
        isAvailable: false,
        isActive: true,
        createdAt: new Date('2024-03-01'),
        currentRental: {
          id: 'rental-2',
          stylistId: 'stylist-2',
          stylist: {
            id: 'stylist-2',
            name: 'Lisa Weber',
            email: 'lisa@example.com',
            image: null
          },
          startDate: new Date('2024-09-01'),
          endDate: null,
          monthlyRent: 650,
          status: 'ACTIVE'
        }
      }
    ],
    stats: {
      total: 4,
      available: 2,
      rented: 2,
      inactive: 0
    }
  }
}

// ============================================
// Salon Chair Rentals Mock Data
// ============================================
export function getMockSalonChairRentals() {
  return {
    rentals: [
      {
        id: 'rental-1',
        chairId: 'chair-1',
        chair: { id: 'chair-1', name: 'Platz 1 - Fenster', monthlyRate: 850 },
        stylistId: 'stylist-1',
        stylist: {
          id: 'stylist-1',
          name: 'Maria Schmidt',
          email: 'maria@example.com',
          image: null,
          stylistProfile: {
            phone: '+49 170 1234567',
            yearsExperience: 8,
            specialties: ['Colorationen', 'Hochsteckfrisuren']
          }
        },
        startDate: new Date('2024-06-01'),
        endDate: null,
        monthlyRent: 850,
        deposit: 1700,
        status: 'ACTIVE',
        contractUrl: null,
        notes: null,
        createdAt: new Date('2024-05-20'),
        updatedAt: new Date('2024-06-01')
      },
      {
        id: 'rental-2',
        chairId: 'chair-4',
        chair: { id: 'chair-4', name: 'Platz 4 - Eingang', monthlyRate: 650 },
        stylistId: 'stylist-2',
        stylist: {
          id: 'stylist-2',
          name: 'Lisa Weber',
          email: 'lisa@example.com',
          image: null,
          stylistProfile: {
            phone: '+49 170 2345678',
            yearsExperience: 5,
            specialties: ['Herrenschnitte', 'Bart-Styling']
          }
        },
        startDate: new Date('2024-09-01'),
        endDate: null,
        monthlyRent: 650,
        deposit: 1300,
        status: 'ACTIVE',
        contractUrl: null,
        notes: null,
        createdAt: new Date('2024-08-15'),
        updatedAt: new Date('2024-09-01')
      },
      {
        id: 'rental-3',
        chairId: 'chair-2',
        chair: { id: 'chair-2', name: 'Platz 2 - Mitte', monthlyRate: 750 },
        stylistId: 'stylist-3',
        stylist: {
          id: 'stylist-3',
          name: 'Thomas Müller',
          email: 'thomas@example.com',
          image: null,
          stylistProfile: {
            phone: '+49 170 3456789',
            yearsExperience: 3,
            specialties: ['Trendfrisuren']
          }
        },
        startDate: new Date('2024-12-01'),
        endDate: null,
        monthlyRent: 750,
        deposit: 1500,
        status: 'PENDING',
        contractUrl: null,
        notes: 'Anfrage für Platz 2, möchte gerne ab Dezember starten.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    stats: {
      pending: 1,
      active: 2,
      completed: 0,
      cancelled: 0
    }
  }
}

// ============================================
// Stylist Chair Rental Mock Data
// ============================================
export function getMockStylistChairRental() {
  return {
    activeRental: {
      id: 'rental-demo',
      chair: {
        id: 'chair-demo',
        name: 'Platz 3 - Fensterseite',
        description: 'Schöner Arbeitsplatz mit natürlichem Licht und moderner Ausstattung',
        amenities: ['Tageslicht', 'Eigenes Waschbecken', 'Steckdosen', 'Schubladen', 'LED-Spiegel'],
        images: []
      },
      salon: {
        id: 'salon-demo',
        name: 'Hairlounge München',
        address: 'Maximilianstraße 42, 80539 München',
        phone: '+49 89 123456',
        image: null,
        owner: {
          name: 'Anna Bauer',
          email: 'anna@hairlounge.de'
        }
      },
      startDate: new Date('2024-06-01'),
      endDate: null,
      monthlyRent: 850,
      deposit: 1700,
      status: 'ACTIVE',
      notes: null,
      createdAt: new Date('2024-05-20')
    },
    pendingRentals: [],
    pastRentals: [
      {
        id: 'rental-old',
        chair: {
          id: 'chair-old',
          name: 'Platz 1',
          description: 'Einfacher Arbeitsplatz',
          amenities: ['Spiegel', 'Steckdose'],
          images: []
        },
        salon: {
          id: 'salon-old',
          name: 'Friseur Schmidt',
          address: 'Hauptstraße 10, 80331 München',
          phone: '+49 89 654321',
          image: null,
          owner: {
            name: 'Klaus Schmidt',
            email: 'klaus@schmidt-friseur.de'
          }
        },
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-05-31'),
        monthlyRent: 650,
        deposit: 1300,
        status: 'COMPLETED',
        notes: 'Kündigung wegen Umzug',
        createdAt: new Date('2022-12-15')
      }
    ]
  }
}

// ============================================
// Find Salon with Chairs Mock Data (erweitert)
// ============================================
export function getMockFindSalonsWithChairs() {
  return [
    {
      id: 'salon-1',
      name: 'Hairlounge München',
      address: 'Maximilianstraße 42',
      city: 'München',
      zipCode: '80539',
      description: 'Moderner Salon im Herzen Münchens mit top Ausstattung',
      image: null,
      rating: 4.8,
      reviewCount: 127,
      amenities: ['Klimaanlage', 'WLAN', 'Parkplätze', 'Küche'],
      owner: { name: 'Anna Bauer', image: null },
      chairs: [
        {
          id: 'chair-1-1',
          name: 'Platz 1 - Fenster',
          description: 'Tageslicht, perfekt für Colorationen',
          monthlyRate: 950,
          amenities: ['Tageslicht', 'Eigenes Waschbecken'],
          isAvailable: true
        },
        {
          id: 'chair-1-2',
          name: 'Platz 2 - Premium',
          description: 'Großer Platz mit privater Ecke',
          monthlyRate: 1100,
          amenities: ['Privater Bereich', 'Klimaanlage', 'Premium-Equipment'],
          isAvailable: true
        }
      ],
      availableChairs: 2,
      minPrice: 950,
      maxPrice: 1100
    },
    {
      id: 'salon-2',
      name: 'Style Studio Berlin',
      address: 'Kurfürstendamm 123',
      city: 'Berlin',
      zipCode: '10719',
      description: 'Trendiger Salon mit internationaler Kundschaft',
      image: null,
      rating: 4.5,
      reviewCount: 89,
      amenities: ['WLAN', 'Küche', 'Dusche', 'Schließfächer'],
      owner: { name: 'Max Mustermann', image: null },
      chairs: [
        {
          id: 'chair-2-1',
          name: 'Arbeitsplatz A',
          description: 'Standard-Platz mit guter Ausstattung',
          monthlyRate: 750,
          amenities: ['Spiegel', 'Steckdosen', 'Schubladen'],
          isAvailable: true
        }
      ],
      availableChairs: 1,
      minPrice: 750,
      maxPrice: 750
    },
    {
      id: 'salon-3',
      name: 'Friseur am Park',
      address: 'Parkstraße 5',
      city: 'Hamburg',
      zipCode: '20095',
      description: 'Gemütlicher Salon mit Blick auf den Park',
      image: null,
      rating: 4.7,
      reviewCount: 64,
      amenities: ['Parkblick', 'WLAN', 'Kaffeemaschine'],
      owner: { name: 'Sophie Klein', image: null },
      chairs: [
        {
          id: 'chair-3-1',
          name: 'Platz am Fenster',
          description: 'Mit Blick auf den Park',
          monthlyRate: 680,
          amenities: ['Tageslicht', 'Parkblick'],
          isAvailable: true
        },
        {
          id: 'chair-3-2',
          name: 'Platz 2',
          description: 'Zentraler Arbeitsplatz',
          monthlyRate: 620,
          amenities: ['Spiegel', 'Schubladen'],
          isAvailable: true
        },
        {
          id: 'chair-3-3',
          name: 'Platz 3',
          description: 'Ruhiger Arbeitsplatz hinten',
          monthlyRate: 580,
          amenities: ['Ruhig', 'Schubladen'],
          isAvailable: false
        }
      ],
      availableChairs: 2,
      minPrice: 580,
      maxPrice: 680
    }
  ]
}

// ============================================
// Salon Invitations Mock Data
// ============================================
export function getMockSalonInvitations() {
  return [
    {
      id: 'inv-1',
      salonId: 'salon-demo',
      invitedById: 'owner-1',
      invitedEmail: 'maria@beispiel.de',
      invitedUserId: 'user-maria',
      invitedName: 'Maria Schmidt',
      token: 'token-abc123',
      shortCode: 'ABC12345',
      status: 'PENDING',
      expiresAt: getRelativeDate(5),
      message: 'Hallo Maria, wir haben einen schönen Fensterplatz frei!',
      emailSentAt: getRelativeDate(-2),
      viewedAt: null,
      respondedAt: null,
      createdAt: getRelativeDate(-2),
      updatedAt: getRelativeDate(-2),
      invitedUser: {
        id: 'user-maria',
        name: 'Maria Schmidt',
        email: 'maria@beispiel.de',
        image: null,
        emailVerified: true,
        onboardingCompleted: true,
      },
    },
    {
      id: 'inv-2',
      salonId: 'salon-demo',
      invitedById: 'owner-1',
      invitedEmail: 'thomas@example.com',
      invitedUserId: null,
      invitedName: null,
      token: 'token-def456',
      shortCode: 'DEF67890',
      status: 'PENDING',
      expiresAt: getRelativeDate(3),
      message: null,
      emailSentAt: getRelativeDate(-4),
      viewedAt: null,
      respondedAt: null,
      createdAt: getRelativeDate(-4),
      updatedAt: getRelativeDate(-4),
      invitedUser: null,
    },
    {
      id: 'inv-3',
      salonId: 'salon-demo',
      invitedById: 'owner-1',
      invitedEmail: 'lisa@friseur.de',
      invitedUserId: 'user-lisa',
      invitedName: 'Lisa Weber',
      token: 'token-ghi789',
      shortCode: 'GHI34567',
      status: 'ACCEPTED',
      expiresAt: getRelativeDate(-5),
      message: 'Willkommen im Team!',
      emailSentAt: getRelativeDate(-10),
      viewedAt: getRelativeDate(-9),
      respondedAt: getRelativeDate(-8),
      createdAt: getRelativeDate(-10),
      updatedAt: getRelativeDate(-8),
      invitedUser: {
        id: 'user-lisa',
        name: 'Lisa Weber',
        email: 'lisa@friseur.de',
        image: null,
        emailVerified: true,
        onboardingCompleted: true,
      },
    },
  ]
}

// ============================================
// Salon Connections Mock Data
// ============================================
export function getMockSalonConnections() {
  return [
    {
      id: 'conn-1',
      salonId: 'salon-demo',
      stylistId: 'stylist-1',
      role: 'CHAIR_RENTER',
      isActive: true,
      joinedAt: getRelativeDate(-180),
      leftAt: null,
      createdAt: getRelativeDate(-180),
      updatedAt: getRelativeDate(-1),
      stylist: {
        id: 'stylist-1',
        name: 'Maria Schmidt',
        email: 'maria@beispiel.de',
        image: null,
        emailVerified: true,
        onboardingCompleted: true,
        stylistProfile: {
          phone: '+49 151 12345678',
          bio: 'Spezialisiert auf Balayage und Colorationen',
          instagramUrl: 'https://instagram.com/maria_hair',
        },
        stylistOnboarding: {
          onboardingStatus: 'APPROVED',
        },
      },
      activeRental: {
        chairName: 'Platz 1 - Fenster',
        monthlyRent: 850,
        startDate: getRelativeDate(-180),
      },
      stats: {
        monthlyBookings: 42,
        monthlyRevenue: 3850,
        avgRating: 4.9,
      },
    },
    {
      id: 'conn-2',
      salonId: 'salon-demo',
      stylistId: 'stylist-2',
      role: 'CHAIR_RENTER',
      isActive: true,
      joinedAt: getRelativeDate(-90),
      leftAt: null,
      createdAt: getRelativeDate(-90),
      updatedAt: getRelativeDate(-5),
      stylist: {
        id: 'stylist-2',
        name: 'Lisa Weber',
        email: 'lisa@friseur.de',
        image: null,
        emailVerified: true,
        onboardingCompleted: true,
        stylistProfile: {
          phone: '+49 160 98765432',
          bio: 'Experte für Herrenhaarschnitte und Bartpflege',
          instagramUrl: null,
        },
        stylistOnboarding: {
          onboardingStatus: 'APPROVED',
        },
      },
      activeRental: {
        chairName: 'Platz 4 - Eingang',
        monthlyRent: 650,
        startDate: getRelativeDate(-90),
      },
      stats: {
        monthlyBookings: 58,
        monthlyRevenue: 2100,
        avgRating: 4.7,
      },
    },
  ]
}

// ============================================
// Stylist My Salons Mock Data
// ============================================
export function getMockStylistMySalons() {
  return [
    {
      id: 'conn-1',
      joinedAt: getRelativeDate(-180),
      role: 'CHAIR_RENTER',
      salon: {
        id: 'salon-1',
        name: 'Hairlounge München',
        slug: 'hairlounge-muenchen',
        street: 'Maximilianstraße 42',
        city: 'München',
        zipCode: '80539',
        phone: '+49 89 12345678',
        email: 'info@hairlounge-muc.de',
        images: [],
        amenities: ['WLAN', 'Klimaanlage', 'Parkplätze', 'Küche'],
        owner: {
          id: 'owner-1',
          name: 'Anna Bauer',
          image: null,
          email: 'anna@hairlounge.de',
        },
        chairs: [
          { id: 'ch-1', name: 'Platz 1', isAvailable: false },
          { id: 'ch-2', name: 'Platz 2', isAvailable: true },
          { id: 'ch-3', name: 'Platz 3', isAvailable: false },
          { id: 'ch-4', name: 'Platz 4', isAvailable: true },
        ],
        availableChairs: 2,
        totalChairs: 4,
      },
      activeRental: {
        id: 'rental-1',
        chairId: 'ch-1',
        chairName: 'Platz 1 - Fenster',
        monthlyRent: 850,
        startDate: getRelativeDate(-180),
        endDate: null,
        amenities: ['Tageslicht', 'Klimaanlage', 'Eigener Waschplatz'],
      },
      stats: {
        monthlyBookings: 42,
        upcomingBookings: 8,
      },
    },
  ]
}

// ============================================
// Stylist Invitations Mock Data
// ============================================
export function getMockStylistInvitations() {
  return [
    {
      id: 'inv-pending-1',
      shortCode: 'XYZ98765',
      status: 'PENDING',
      expiresAt: getRelativeDate(5),
      message: 'Wir haben gehört, dass du ein talentierter Colorist bist. Würdest du gerne bei uns arbeiten?',
      createdAt: getRelativeDate(-1),
      salon: {
        id: 'salon-new',
        name: 'Style Studio Berlin',
        street: 'Friedrichstraße 100',
        city: 'Berlin',
        zipCode: '10117',
        images: [],
        description: 'Modernes Studio im Herzen Berlins',
      },
      invitedBy: {
        name: 'Max Mustermann',
        image: null,
      },
    },
  ]
}

