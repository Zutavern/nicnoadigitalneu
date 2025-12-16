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
// Salon Stats Mock Data (für Salon Dashboard)
// ============================================
export function getMockSalonStats() {
  return {
    salon: {
      id: 'demo-salon-1',
      name: 'Mein Traum-Salon',
      city: 'Berlin',
      isVerified: true,
    },
    overview: {
      totalChairs: 6,
      availableChairs: 2,
      rentedChairs: 4,
      totalRentals: 4,
      monthlyRentalIncome: 3200,
      averageRating: 4.8,
      totalReviews: 47,
      pendingRequests: 2,
    },
    chairs: [
      { id: 'c1', name: 'Stuhl 1 - Premium', description: 'Mit eigenem Waschbecken', monthlyRate: 850, isAvailable: false, isRented: true, amenities: ['Waschbecken', 'Spiegel', 'Beleuchtung'] },
      { id: 'c2', name: 'Stuhl 2 - Standard', description: 'Im Hauptbereich', monthlyRate: 650, isAvailable: false, isRented: true, amenities: ['Spiegel', 'Beleuchtung'] },
      { id: 'c3', name: 'Stuhl 3 - Standard', description: 'Nahe Eingang', monthlyRate: 650, isAvailable: false, isRented: true, amenities: ['Spiegel', 'Beleuchtung'] },
      { id: 'c4', name: 'Stuhl 4 - Comfort', description: 'Fensterplatz', monthlyRate: 750, isAvailable: false, isRented: true, amenities: ['Spiegel', 'Beleuchtung', 'Fenster'] },
      { id: 'c5', name: 'Stuhl 5 - Starter', description: 'Im Nebenraum', monthlyRate: 550, isAvailable: true, isRented: false, amenities: ['Spiegel'] },
      { id: 'c6', name: 'Stuhl 6 - Starter', description: 'Im Nebenraum', monthlyRate: 550, isAvailable: true, isRented: false, amenities: ['Spiegel'] },
    ],
    rentals: [
      { id: 'r1', chairName: 'Stuhl 1 - Premium', monthlyRent: 850, startDate: getRelativeDate(-120), stylist: { id: 'st1', name: 'Sarah Müller', email: 'sarah@example.com', image: null } },
      { id: 'r2', chairName: 'Stuhl 2 - Standard', monthlyRent: 650, startDate: getRelativeDate(-90), stylist: { id: 'st2', name: 'Alex Schmidt', email: 'alex@example.com', image: null } },
      { id: 'r3', chairName: 'Stuhl 3 - Standard', monthlyRent: 650, startDate: getRelativeDate(-60), stylist: { id: 'st3', name: 'Julia Weber', email: 'julia@example.com', image: null } },
      { id: 'r4', chairName: 'Stuhl 4 - Comfort', monthlyRent: 750, startDate: getRelativeDate(-30), stylist: { id: 'st4', name: 'Max Braun', email: 'max@example.com', image: null } },
    ],
    recentReviews: [
      { id: 'rev1', rating: 5, title: 'Top Salon!', comment: 'Super Location, faire Preise und tolles Ambiente. Meine Kunden lieben es hier!', reviewerName: 'Sarah M.', createdAt: getRelativeDate(-3) },
      { id: 'rev2', rating: 5, title: 'Perfekte Ausstattung', comment: 'Alles was man braucht ist da. Die Stuhlmiete ist fair kalkuliert.', reviewerName: 'Alex S.', createdAt: getRelativeDate(-7) },
      { id: 'rev3', rating: 4, title: 'Empfehlenswert', comment: 'Gute Lage, nettes Team. Einziger Nachteil: Parkplätze sind manchmal knapp.', reviewerName: 'Julia W.', createdAt: getRelativeDate(-14) },
    ],
    monthlyIncome: [
      { month: getMonthName(-5), income: 2800 },
      { month: getMonthName(-4), income: 2900 },
      { month: getMonthName(-3), income: 3100 },
      { month: getMonthName(-2), income: 3200 },
      { month: getMonthName(-1), income: 3200 },
      { month: getMonthName(0), income: 3200 },
    ],
  }
}

// Hilfsfunktion für Monatsnamen
function getMonthName(offset: number): string {
  const date = new Date()
  date.setMonth(date.getMonth() + offset)
  return date.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })
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
    // Neue API-Struktur (für SalonRevenuePage)
    totalRevenue: 24680,
    rentalIncome: 15600,
    bookingCommission: 5200,
    previousMonthRevenue: 23500,
    growth: 8.1,
    monthlyData: [
      { month: 'Jul 2024', rental: 2400, commission: 800, total: 3200 },
      { month: 'Aug 2024', rental: 2500, commission: 850, total: 3350 },
      { month: 'Sep 2024', rental: 2650, commission: 900, total: 3550 },
      { month: 'Okt 2024', rental: 2800, commission: 950, total: 3750 },
      { month: 'Nov 2024', rental: 2950, commission: 1000, total: 3950 },
      { month: 'Dez 2024', rental: 3100, commission: 1050, total: 4150 },
    ],
    topStylists: [
      { id: 'stylist-1', name: 'Sarah Müller', revenue: 4850, bookings: 42 },
      { id: 'stylist-2', name: 'Alex Schmidt', revenue: 3920, bookings: 35 },
      { id: 'stylist-3', name: 'Julia Weber', revenue: 3450, bookings: 28 },
      { id: 'stylist-4', name: 'Max Braun', revenue: 2980, bookings: 24 },
    ],
    // Zusätzliche Daten für erweiterte Ansichten
    summary: {
      totalRevenue: 24680,
      thisMonth: 8450,
      lastMonth: 7820,
      change: 8.1,
      pendingPayments: 1250,
    },
    revenueBySource: [
      { source: 'Stuhlmieten', amount: 15600, percentage: 63.2 },
      { source: 'Produktverkauf', amount: 5200, percentage: 21.1 },
      { source: 'Zusatzleistungen', amount: 3880, percentage: 15.7 },
    ],
    rentalIncomeDetails: [
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
        customerName: 'Emma W.',
        customerImage: null,
        stylistName: 'Sarah Müller',
        rating: 5,
        comment: 'Tolles Ambiente, super freundliches Team. Mein neuer Stammsalon! Fantastischer Salon!',
        createdAt: getRelativeDate(-3),
        serviceName: 'Balayage',
      },
      {
        id: 'srv-2',
        customerName: 'Sophie M.',
        customerImage: null,
        stylistName: 'Alex Schmidt',
        rating: 4,
        comment: 'Gute Beratung und schönes Ergebnis. Nur Parkplätze sind schwer zu finden.',
        createdAt: getRelativeDate(-7),
        serviceName: 'Herrenhaarschnitt',
      },
      {
        id: 'srv-3',
        customerName: 'Laura K.',
        customerImage: null,
        stylistName: 'Julia Weber',
        rating: 5,
        comment: 'Endlich eine Friseurin, die versteht was ich will! Super zufrieden mit dem Ergebnis.',
        createdAt: getRelativeDate(-10),
        serviceName: 'Damenhaarschnitt',
      },
      {
        id: 'srv-4',
        customerName: 'Thomas B.',
        customerImage: null,
        stylistName: 'Max Braun',
        rating: 5,
        comment: 'Sehr professioneller Service, angenehme Atmosphäre. Komme gerne wieder!',
        createdAt: getRelativeDate(-14),
        serviceName: 'Bart-Styling',
      },
      {
        id: 'srv-5',
        customerName: 'Maria S.',
        customerImage: null,
        stylistName: 'Sarah Müller',
        rating: 4,
        comment: 'Schöne Ergebnisse, nur die Wartezeit war etwas lang.',
        createdAt: getRelativeDate(-21),
        serviceName: 'Färbung',
      },
    ],
    stats: {
      averageRating: 4.7,
      totalReviews: 156,
      ratingDistribution: {
        5: 112,
        4: 32,
        3: 8,
        2: 3,
        1: 1,
      } as Record<number, number>,
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
        invoiceNumber: 'INV-2024-DEC-001',
        type: 'RENT' as const,
        amount: 700,
        status: 'PAID' as const,
        issuedDate: getRelativeDate(-5),
        dueDate: getRelativeDate(-5),
        paidDate: getRelativeDate(-3),
        description: 'Stuhlmiete Dezember 2024 - Stuhl 1',
        stylist: { name: 'Sarah Müller', email: 'sarah@example.de' },
      },
      {
        id: 'sinv-2',
        invoiceNumber: 'INV-2024-DEC-002',
        type: 'RENT' as const,
        amount: 650,
        status: 'PAID' as const,
        issuedDate: getRelativeDate(-5),
        dueDate: getRelativeDate(-5),
        paidDate: getRelativeDate(-4),
        description: 'Stuhlmiete Dezember 2024 - Stuhl 2',
        stylist: { name: 'Alex Schmidt', email: 'alex@example.de' },
      },
      {
        id: 'sinv-3',
        invoiceNumber: 'INV-2024-DEC-003',
        type: 'RENT' as const,
        amount: 650,
        status: 'SENT' as const,
        issuedDate: getRelativeDate(-5),
        dueDate: getRelativeDate(10),
        paidDate: null,
        description: 'Stuhlmiete Dezember 2024 - Stuhl 3',
        stylist: { name: 'Julia Weber', email: 'julia@example.de' },
      },
      {
        id: 'sinv-4',
        invoiceNumber: 'INV-2024-DEC-004',
        type: 'RENT' as const,
        amount: 600,
        status: 'PAID' as const,
        issuedDate: getRelativeDate(-5),
        dueDate: getRelativeDate(-5),
        paidDate: getRelativeDate(-2),
        description: 'Stuhlmiete Dezember 2024 - Stuhl 4',
        stylist: { name: 'Max Braun', email: 'max@example.de' },
      },
      {
        id: 'sinv-5',
        invoiceNumber: 'INV-2024-NOV-001',
        type: 'RENT' as const,
        amount: 700,
        status: 'PAID' as const,
        issuedDate: getRelativeDate(-35),
        dueDate: getRelativeDate(-35),
        paidDate: getRelativeDate(-33),
        description: 'Stuhlmiete November 2024 - Stuhl 1',
        stylist: { name: 'Sarah Müller', email: 'sarah@example.de' },
      },
      {
        id: 'sinv-6',
        invoiceNumber: 'INV-2024-COM-001',
        type: 'COMMISSION' as const,
        amount: 245.50,
        status: 'PAID' as const,
        issuedDate: getRelativeDate(-10),
        dueDate: getRelativeDate(-5),
        paidDate: getRelativeDate(-7),
        description: 'Buchungsprovision November 2024',
        stylist: { name: 'Sarah Müller', email: 'sarah@example.de' },
      },
      {
        id: 'sinv-7',
        invoiceNumber: 'INV-2024-COM-002',
        type: 'COMMISSION' as const,
        amount: 189.00,
        status: 'OVERDUE' as const,
        issuedDate: getRelativeDate(-20),
        dueDate: getRelativeDate(-5),
        paidDate: null,
        description: 'Buchungsprovision Oktober 2024',
        stylist: { name: 'Alex Schmidt', email: 'alex@example.de' },
      },
    ],
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
    email: 'demo.stylist@nicnoa.online',
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
  // Flache Struktur wie ChairRental Interface erwartet
  return {
    id: 'rental-demo-001',
    status: 'ACTIVE',
    startDate: getRelativeDate(-90),
    endDate: getRelativeDate(275),
    monthlyRate: 650,
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
    },
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
    email: 'demo.stylist@nicnoa.online',
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
        type: 'DIRECT',
        subject: null,
        participants: [
          { 
            id: 'cp-1', 
            userId: '00000000-0000-0000-0000-000000000002',
            role: 'ADMIN',
            lastReadAt: null,
            user: { id: '00000000-0000-0000-0000-000000000002', name: 'Salon Betreiber', email: 'salon@nicnoa.online', image: null, role: 'SALON_OWNER' }
          },
          { 
            id: 'cp-2', 
            userId: '00000000-0000-0000-0000-000000000001',
            role: 'MEMBER',
            lastReadAt: null,
            user: { id: '00000000-0000-0000-0000-000000000001', name: 'Admin Test', email: 'admin@nicnoa.online', image: null, role: 'ADMIN' }
          },
        ],
        lastMessage: {
          id: 'msg-1',
          content: 'Vielen Dank für die schnelle Rückmeldung!',
          createdAt: getRelativeDate(0, 0, 30),
          isRead: false,
        },
        unreadCount: 2,
        createdAt: getRelativeDate(-5),
        updatedAt: getRelativeDate(0, 0, 30),
      },
      {
        id: 'conv-2',
        type: 'DIRECT',
        subject: null,
        participants: [
          { 
            id: 'cp-3', 
            userId: '00000000-0000-0000-0000-000000000003',
            role: 'MEMBER',
            lastReadAt: null,
            user: { id: '00000000-0000-0000-0000-000000000003', name: 'Stylist Test', email: 'stylist@nicnoa.online', image: null, role: 'STYLIST' }
          },
          { 
            id: 'cp-4', 
            userId: '00000000-0000-0000-0000-000000000001',
            role: 'ADMIN',
            lastReadAt: null,
            user: { id: '00000000-0000-0000-0000-000000000001', name: 'Admin Test', email: 'admin@nicnoa.online', image: null, role: 'ADMIN' }
          },
        ],
        lastMessage: {
          id: 'msg-2',
          content: 'Können wir den Termin auf 15 Uhr verschieben?',
          createdAt: getRelativeDate(-1, 10, 0),
          isRead: false,
        },
        unreadCount: 1,
        createdAt: getRelativeDate(-10),
        updatedAt: getRelativeDate(-1, 10, 0),
      },
      {
        id: 'conv-3',
        type: 'DIRECT',
        subject: null,
        participants: [
          { 
            id: 'cp-5', 
            userId: '00000000-0000-0000-0000-000000000002',
            role: 'ADMIN',
            lastReadAt: null,
            user: { id: '00000000-0000-0000-0000-000000000002', name: 'Salon Betreiber', email: 'salon@nicnoa.online', image: null, role: 'SALON_OWNER' }
          },
          { 
            id: 'cp-6', 
            userId: '00000000-0000-0000-0000-000000000003',
            role: 'MEMBER',
            lastReadAt: null,
            user: { id: '00000000-0000-0000-0000-000000000003', name: 'Stylist Test', email: 'stylist@nicnoa.online', image: null, role: 'STYLIST' }
          },
        ],
        lastMessage: {
          id: 'msg-3',
          content: 'Willkommen bei NICNOA! Bei Fragen stehen wir dir gerne zur Verfügung.',
          createdAt: getRelativeDate(-7),
          isRead: true,
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
        email: 'thomas@nicnoa.online',
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
  // Deutsche Städte und Straßen
  const cities = ['Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen', 'Bremen', 'Dresden', 'Hannover', 'Nürnberg', 'Duisburg']
  const streets = ['Hauptstraße', 'Bahnhofstraße', 'Schillerstraße', 'Goethestraße', 'Kirchstraße', 'Gartenstraße', 'Berliner Straße', 'Friedrichstraße', 'Mozartstraße', 'Beethovenstraße', 'Kaiserstraße', 'Marktplatz', 'Am Rathaus', 'Schulstraße', 'Rosenweg']
  const salonPrefixes = ['Hair', 'Beauty', 'Style', 'Glamour', 'Chic', 'Elegance', 'Modern', 'Classic', 'Urban', 'Trend', 'Premium', 'Luxus', 'Unique', 'Creative', 'Exclusive']
  const salonSuffixes = ['Studio', 'Lounge', 'Salon', 'Atelier', 'House', 'Lab', 'Zone', 'Space', 'Corner', 'Place']
  const firstNames = ['Maria', 'Anna', 'Julia', 'Sophie', 'Laura', 'Lisa', 'Sarah', 'Lena', 'Emma', 'Mia', 'Thomas', 'Michael', 'Daniel', 'Stefan', 'Christian', 'Andreas', 'Markus', 'Peter', 'Frank', 'Klaus']
  const lastNames = ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Koch', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Braun', 'Zimmermann', 'Hartmann']
  const subscriptionStatuses = ['active', 'active', 'active', 'active', 'trialing', 'past_due', null]
  const priceIds = ['price_starter', 'price_professional', 'price_enterprise', null]
  
  const generateSalons = () => {
    const salons = []
    for (let i = 1; i <= 100; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const city = cities[Math.floor(Math.random() * cities.length)]
      const street = streets[Math.floor(Math.random() * streets.length)]
      const prefix = salonPrefixes[Math.floor(Math.random() * salonPrefixes.length)]
      const suffix = salonSuffixes[Math.floor(Math.random() * salonSuffixes.length)]
      const onboardingCompleted = Math.random() > 0.15 // 85% completed
      const chairCount = Math.floor(Math.random() * 8) + 2 // 2-9 chairs
      const employeeCount = Math.floor(Math.random() * chairCount) + 1
      const subscriptionStatus = subscriptionStatuses[Math.floor(Math.random() * subscriptionStatuses.length)]
      const priceId = subscriptionStatus ? priceIds[Math.floor(Math.random() * (priceIds.length - 1))] : null
      
      salons.push({
        id: `salon-${i.toString().padStart(3, '0')}`,
        userId: `user-salon-${i.toString().padStart(3, '0')}`,
        salonName: `${prefix} ${suffix} ${city.substring(0, 3)}`,
        street: `${street} ${Math.floor(Math.random() * 200) + 1}`,
        city,
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: 'Deutschland',
        phone: `+49 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000000) + 1000000}`,
        website: Math.random() > 0.3 ? `https://${prefix.toLowerCase()}-${suffix.toLowerCase()}.de` : null,
        employeeCount,
        chairCount,
        salonSize: Math.floor(Math.random() * 150) + 50,
        description: `Willkommen bei ${prefix} ${suffix} - Ihr Friseur in ${city}`,
        openingHours: { mo: '09:00-18:00', di: '09:00-18:00', mi: '09:00-18:00', do: '09:00-20:00', fr: '09:00-18:00', sa: '09:00-14:00' },
        amenities: ['WLAN', 'Klimaanlage', 'Getränke'],
        images: [],
        createdAt: getRelativeDate(-Math.floor(Math.random() * 365)),
        updatedAt: getRelativeDate(-Math.floor(Math.random() * 30)),
        owner: {
          id: `user-salon-${i.toString().padStart(3, '0')}`,
          name: `${firstName} ${lastName}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${prefix.toLowerCase()}.de`,
          image: null,
          onboardingCompleted,
          subscriptionStatus,
          priceId,
        },
      })
    }
    return salons
  }
  
  const salons = generateSalons()
  const activeSalons = salons.filter(s => s.owner.onboardingCompleted).length
  const totalChairs = salons.reduce((sum, s) => sum + s.chairCount, 0)
  const totalEmployees = salons.reduce((sum, s) => sum + s.employeeCount, 0)
  
  return {
    salons,
    summary: {
      totalSalons: salons.length,
      activeSalons,
      pendingSalons: salons.length - activeSalons,
      totalChairs,
      occupiedChairs: totalEmployees,
      averageOccupancy: Math.round((totalEmployees / totalChairs) * 100 * 10) / 10,
    },
    pagination: {
      page: 1,
      limit: 20,
      total: salons.length,
      totalPages: Math.ceil(salons.length / 20),
    },
  }
}

// ============================================
// Admin Stylists Mock Data
// ============================================
export function getMockAdminStylists() {
  const firstNames = ['Sarah', 'Anna', 'Julia', 'Sophie', 'Laura', 'Lisa', 'Emma', 'Mia', 'Lena', 'Marie', 'Nina', 'Eva', 'Clara', 'Lea', 'Hanna', 'Alex', 'Max', 'David', 'Felix', 'Leon']
  const lastNames = ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Koch', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Braun', 'Zimmermann', 'Hartmann']
  const specialtiesPool = ['Herrenschnitte', 'Damenschnitte', 'Colorationen', 'Balayage', 'Highlights', 'Hochsteckfrisuren', 'Extensions', 'Barbering', 'Kinderschnitte', 'Brautstyling', 'Keratin-Behandlung', 'Dauerwelle', 'Styling', 'Afro-Hair', 'Locken-Styling']
  const certificationsPool = ['Meisterbrief', 'L\'Oréal Colorist', 'Schwarzkopf Expert', 'Wella Master', 'Davines Certified', 'Olaplex Specialist', 'Balayage Expert', 'Barbering Diploma']
  const subscriptionStatuses = ['active', 'active', 'active', 'active', 'trialing', 'past_due', null]
  const priceIds = ['price_stylist_basic', 'price_stylist_pro', null]
  
  const generateStylists = () => {
    const stylists = []
    for (let i = 1; i <= 100; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const yearsExperience = Math.floor(Math.random() * 20) + 1
      const onboardingCompleted = Math.random() > 0.12 // 88% completed
      const subscriptionStatus = subscriptionStatuses[Math.floor(Math.random() * subscriptionStatuses.length)]
      const priceId = subscriptionStatus ? priceIds[Math.floor(Math.random() * (priceIds.length - 1))] : null
      
      // Random specialties (2-5)
      const numSpecialties = Math.floor(Math.random() * 4) + 2
      const specialties = [...specialtiesPool].sort(() => Math.random() - 0.5).slice(0, numSpecialties)
      
      // Random certifications (0-3)
      const numCerts = Math.floor(Math.random() * 4)
      const certifications = [...certificationsPool].sort(() => Math.random() - 0.5).slice(0, numCerts)
      
      stylists.push({
        id: `stylist-${i.toString().padStart(3, '0')}`,
        userId: `user-stylist-${i.toString().padStart(3, '0')}`,
        yearsExperience,
        specialties,
        certifications,
        portfolio: [],
        availability: { mo: true, di: true, mi: true, do: true, fr: true, sa: Math.random() > 0.3 },
        bio: `Erfahrener Friseur mit ${yearsExperience} Jahren Berufserfahrung. Spezialisiert auf ${specialties.slice(0, 2).join(' und ')}.`,
        createdAt: getRelativeDate(-Math.floor(Math.random() * 365)),
        updatedAt: getRelativeDate(-Math.floor(Math.random() * 30)),
        user: {
          id: `user-stylist-${i.toString().padStart(3, '0')}`,
          name: `${firstName} ${lastName}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@stylist.de`,
          image: null,
          onboardingCompleted,
          registeredAt: getRelativeDate(-Math.floor(Math.random() * 400)),
          subscriptionStatus,
          priceId,
        },
      })
    }
    return stylists
  }
  
  const stylists = generateStylists()
  const activeStylists = stylists.filter(s => s.user.onboardingCompleted).length
  const avgExperience = stylists.reduce((sum, s) => sum + s.yearsExperience, 0) / stylists.length
  
  return {
    stylists,
    summary: {
      totalStylists: stylists.length,
      activeStylists,
      pendingStylists: stylists.length - activeStylists,
      averageExperience: Math.round(avgExperience * 10) / 10,
    },
    pagination: {
      page: 1,
      limit: 20,
      total: stylists.length,
      totalPages: Math.ceil(stylists.length / 20),
    },
  }
}

// ============================================
// Admin Service Categories Mock Data
// ============================================
export function getMockAdminServiceCategories() {
  const services = [
    { id: 's1', name: 'Damenhaarschnitt', categoryId: 'cat-1', slug: 'damenhaarschnitt', description: 'Professioneller Damenhaarschnitt', sortOrder: 1, isActive: true },
    { id: 's2', name: 'Herrenhaarschnitt', categoryId: 'cat-1', slug: 'herrenhaarschnitt', description: 'Klassischer Herrenhaarschnitt', sortOrder: 2, isActive: true },
    { id: 's3', name: 'Kinderhaarschnitt', categoryId: 'cat-1', slug: 'kinderhaarschnitt', description: 'Haarschnitt für Kinder', sortOrder: 3, isActive: true },
    { id: 's4', name: 'Balayage', categoryId: 'cat-2', slug: 'balayage', description: 'Natürliche Strähnen-Technik', sortOrder: 1, isActive: true },
    { id: 's5', name: 'Strähnen', categoryId: 'cat-2', slug: 'straehnen', description: 'Klassische Strähnen', sortOrder: 2, isActive: true },
    { id: 's6', name: 'Komplettfärbung', categoryId: 'cat-2', slug: 'komplettfaerbung', description: 'Vollständige Haarfärbung', sortOrder: 3, isActive: true },
    { id: 's7', name: 'Föhnen', categoryId: 'cat-3', slug: 'foehnen', description: 'Professionelles Föhnen', sortOrder: 1, isActive: true },
    { id: 's8', name: 'Glätten', categoryId: 'cat-3', slug: 'glaetten', description: 'Haarglättung', sortOrder: 2, isActive: true },
    { id: 's9', name: 'Intensivpflege', categoryId: 'cat-4', slug: 'intensivpflege', description: 'Tiefenpflege für das Haar', sortOrder: 1, isActive: true },
    { id: 's10', name: 'Hochsteckfrisur', categoryId: 'cat-5', slug: 'hochsteckfrisur', description: 'Elegante Hochsteckfrisur', sortOrder: 1, isActive: true },
  ]

  return [
    {
      id: 'cat-1',
      name: 'Schneiden',
      slug: 'schneiden',
      description: 'Alle Arten von Haarschnitten',
      icon: 'scissors',
      color: 'emerald',
      sortOrder: 1,
      isActive: true,
      services: services.filter(s => s.categoryId === 'cat-1'),
    },
    {
      id: 'cat-2',
      name: 'Färben',
      slug: 'faerben',
      description: 'Colorationen, Strähnen und Tönung',
      icon: 'palette',
      color: 'violet',
      sortOrder: 2,
      isActive: true,
      services: services.filter(s => s.categoryId === 'cat-2'),
    },
    {
      id: 'cat-3',
      name: 'Styling',
      slug: 'styling',
      description: 'Föhnen, Glätten, Locken',
      icon: 'sparkles',
      color: 'amber',
      sortOrder: 3,
      isActive: true,
      services: services.filter(s => s.categoryId === 'cat-3'),
    },
    {
      id: 'cat-4',
      name: 'Behandlung',
      slug: 'behandlung',
      description: 'Pflege, Kuren und Treatments',
      icon: 'droplets',
      color: 'cyan',
      sortOrder: 4,
      isActive: true,
      services: services.filter(s => s.categoryId === 'cat-4'),
    },
    {
      id: 'cat-5',
      name: 'Spezial',
      slug: 'spezial',
      description: 'Hochsteckfrisuren, Brautstyling, Extensions',
      icon: 'crown',
      color: 'rose',
      sortOrder: 5,
      isActive: true,
      services: services.filter(s => s.categoryId === 'cat-5'),
    },
  ]
}

// ============================================
// Admin Plans Mock Data
// ============================================
export function getMockAdminPlans() {
  const stylistPlans = [
    {
      id: 'plan-1',
      name: 'Starter',
      slug: 'stylist-starter',
      planType: 'STYLIST',
      description: 'Perfekt für den Einstieg in die Selbstständigkeit',
      priceMonthly: 29,
      priceQuarterly: 79,
      priceSixMonths: 149,
      priceYearly: 290,
      features: [
        'Einfacher Buchungskalender',
        'Kundenverwaltung bis 100 Kunden',
        'Automatische Terminerinnerungen',
        'Digitale Terminbestätigung per E-Mail',
        'Mobile App Zugang',
        'Basis-Umsatzübersicht',
        'E-Mail Support',
      ],
      maxChairs: null,
      maxBookings: 50,
      maxCustomers: 100,
      isActive: true,
      isPopular: false,
      sortOrder: 1,
      trialDays: 14,
      stripeProductId: 'prod_stylist_starter',
      stripePriceMonthly: 'price_stylist_starter_monthly',
      stripePriceQuarterly: 'price_stylist_starter_quarterly',
      stripePriceSixMonths: 'price_stylist_starter_six_months',
      stripePriceYearly: 'price_stylist_starter_yearly',
      createdAt: getRelativeDate(-500),
    },
    {
      id: 'plan-2',
      name: 'Professional',
      slug: 'stylist-pro',
      planType: 'STYLIST',
      description: 'Für etablierte Stylisten mit wachsendem Kundenstamm',
      priceMonthly: 49,
      priceQuarterly: 129,
      priceSixMonths: 249,
      priceYearly: 470,
      features: [
        'Unbegrenzte Buchungen & Kunden',
        'Detaillierte Auswertungen & Analytics',
        'Umsatz-Dashboard mit Trends',
        'Google Ad Manager Integration',
        'Meta Ad Manager Integration',
        'Social Media Management Tools',
        'Eigenes Business-Profil',
        'Online-Zahlungen & Rechnungen',
        'WhatsApp Business Integration',
        'Eigene Buchungsseite mit Link',
        'Prioritäts-Support',
      ],
      maxChairs: null,
      maxBookings: null,
      maxCustomers: null,
      isActive: true,
      isPopular: true,
      sortOrder: 2,
      trialDays: 14,
      stripeProductId: 'prod_stylist_pro',
      stripePriceMonthly: 'price_stylist_pro_monthly',
      stripePriceQuarterly: 'price_stylist_pro_quarterly',
      stripePriceSixMonths: 'price_stylist_pro_six_months',
      stripePriceYearly: 'price_stylist_pro_yearly',
      createdAt: getRelativeDate(-500),
    },
  ]
  
  const salonOwnerPlans = [
    {
      id: 'plan-3',
      name: 'Starter',
      slug: 'salon-starter',
      planType: 'SALON_OWNER',
      description: 'Ideal für kleine Salons mit 1-3 Stühlen',
      priceMonthly: 79,
      priceQuarterly: 209,
      priceSixMonths: 399,
      priceYearly: 790,
      features: [
        'Bis zu 3 Stuhlmieter verwalten',
        'Einfacher Buchungskalender',
        'Digitale Mietverträge',
        'Automatische Mietabrechnung',
        'Basis-Reporting & Übersichten',
        'Kundenverwaltung bis 500 Kunden',
        'Marketing Tools Grundpaket',
        'E-Mail Support',
      ],
      maxChairs: 3,
      maxBookings: 200,
      maxCustomers: 500,
      isActive: true,
      isPopular: false,
      sortOrder: 1,
      trialDays: 14,
      stripeProductId: 'prod_salon_starter',
      stripePriceMonthly: 'price_salon_starter_monthly',
      stripePriceQuarterly: 'price_salon_starter_quarterly',
      stripePriceSixMonths: 'price_salon_starter_six_months',
      stripePriceYearly: 'price_salon_starter_yearly',
      createdAt: getRelativeDate(-500),
    },
    {
      id: 'plan-4',
      name: 'Business',
      slug: 'salon-business',
      planType: 'SALON_OWNER',
      description: 'Komplettlösung für professionelle Salon-Spaces',
      priceMonthly: 149,
      priceQuarterly: 399,
      priceSixMonths: 749,
      priceYearly: 1490,
      features: [
        'Unbegrenzte Stuhlmieter',
        'Volle Belvo-Integration',
        'Komplettes ERP-System',
        'Zahlungsabwicklung inkl. SEPA',
        'Automatisierte Buchhaltung',
        'Google Ad Manager Integration',
        'Meta Ad Manager Integration',
        'Detaillierte Analytics & Reports',
        'Leistungsfähige Marketing Tools',
        'Social Media Management',
        'Business Profile & Branding',
        'Multi-Standort Support',
        'API-Zugang für Integrationen',
        'Dedizierter Account Manager',
        '24/7 Premium Support',
      ],
      maxChairs: null,
      maxBookings: null,
      maxCustomers: null,
      isActive: true,
      isPopular: true,
      sortOrder: 2,
      trialDays: 14,
      stripeProductId: 'prod_salon_business',
      stripePriceMonthly: 'price_salon_business_monthly',
      stripePriceQuarterly: 'price_salon_business_quarterly',
      stripePriceSixMonths: 'price_salon_business_six_months',
      stripePriceYearly: 'price_salon_business_yearly',
      createdAt: getRelativeDate(-500),
    },
  ]
  
  const allPlans = [...stylistPlans, ...salonOwnerPlans]
  
  return {
    plans: allPlans,
    groupedPlans: {
      SALON_OWNER: salonOwnerPlans,
      STYLIST: stylistPlans,
    },
    stats: {
      total: allPlans.length,
      active: allPlans.filter(p => p.isActive).length,
      salonOwnerPlans: salonOwnerPlans.length,
      stylistPlans: stylistPlans.length,
      withStripe: allPlans.filter(p => p.stripeProductId).length,
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
  return [
    {
      id: 'app-1',
      userId: 'user-pending-1',
      user: {
        name: 'Lena Klein',
        email: 'lena@email.de',
      },
      companyName: 'Lena Klein Haarstyling',
      taxId: 'DE123456789',
      businessStreet: 'Musterstraße 45',
      businessCity: 'Berlin',
      businessZipCode: '10245',
      onboardingStatus: 'PENDING_REVIEW',
      currentStep: 5,
      createdAt: getRelativeDate(-10),
      updatedAt: getRelativeDate(-2),
      documents: {
        masterCertificate: { url: '/docs/master-1.pdf', status: 'UPLOADED' },
        businessRegistration: { url: '/docs/business-1.pdf', status: 'UPLOADED' },
        liabilityInsurance: { url: '/docs/insurance-1.pdf', status: 'UPLOADED' },
        statusDetermination: { url: null, status: 'PENDING' },
        craftsChamber: { url: '/docs/chamber-1.pdf', status: 'UPLOADED' },
      },
      compliance: {
        ownPhone: true,
        ownAppointmentBook: true,
        ownCashRegister: true,
        ownPriceList: true,
        ownBranding: true,
      },
      selfEmploymentDeclaration: true,
      adminNotes: null,
    },
    {
      id: 'app-2',
      userId: 'user-pending-2',
      user: {
        name: 'Max Braun',
        email: 'max@email.de',
      },
      companyName: 'Braun Styling',
      taxId: 'DE987654321',
      businessStreet: 'Hauptstraße 12',
      businessCity: 'Hamburg',
      businessZipCode: '20095',
      onboardingStatus: 'PENDING_REVIEW',
      currentStep: 5,
      createdAt: getRelativeDate(-15),
      updatedAt: getRelativeDate(-5),
      documents: {
        masterCertificate: { url: '/docs/master-2.pdf', status: 'UPLOADED' },
        businessRegistration: { url: '/docs/business-2.pdf', status: 'UPLOADED' },
        liabilityInsurance: { url: '/docs/insurance-2.pdf', status: 'UPLOADED' },
        statusDetermination: { url: '/docs/status-2.pdf', status: 'UPLOADED' },
        craftsChamber: { url: '/docs/chamber-2.pdf', status: 'UPLOADED' },
      },
      compliance: {
        ownPhone: true,
        ownAppointmentBook: true,
        ownCashRegister: true,
        ownPriceList: true,
        ownBranding: true,
      },
      selfEmploymentDeclaration: true,
      adminNotes: null,
    },
    {
      id: 'app-3',
      userId: 'user-approved-1',
      user: {
        name: 'Sarah Müller',
        email: 'sarah@email.de',
      },
      companyName: 'Sarah Beauty',
      taxId: 'DE456789123',
      businessStreet: 'Schönhauser Allee 45',
      businessCity: 'Berlin',
      businessZipCode: '10437',
      onboardingStatus: 'APPROVED',
      currentStep: 5,
      createdAt: getRelativeDate(-30),
      updatedAt: getRelativeDate(-20),
      documents: {
        masterCertificate: { url: '/docs/master-3.pdf', status: 'APPROVED' },
        businessRegistration: { url: '/docs/business-3.pdf', status: 'APPROVED' },
        liabilityInsurance: { url: '/docs/insurance-3.pdf', status: 'APPROVED' },
        statusDetermination: { url: '/docs/status-3.pdf', status: 'APPROVED' },
        craftsChamber: { url: '/docs/chamber-3.pdf', status: 'APPROVED' },
      },
      compliance: {
        ownPhone: true,
        ownAppointmentBook: true,
        ownCashRegister: true,
        ownPriceList: true,
        ownBranding: true,
      },
      selfEmploymentDeclaration: true,
      adminNotes: 'Alle Unterlagen vollständig und geprüft.',
    },
  ]
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
        device: 'Desktop',
        browser: 'Chrome',
        os: 'Windows 11',
        ipAddress: '192.168.1.100',
        location: 'Berlin, DE',
        lastActiveAt: getRelativeDate(0, 0, 10),
        isActive: true,
        createdAt: getRelativeDate(-7),
        user: {
          id: 'user-1',
          name: 'Sarah Müller',
          email: 'sarah@email.de',
        },
      },
      {
        id: 'sess-2',
        userId: 'user-2',
        device: 'Desktop',
        browser: 'Safari',
        os: 'macOS',
        ipAddress: '192.168.1.101',
        location: 'Berlin, DE',
        lastActiveAt: getRelativeDate(0, 0, 30),
        isActive: true,
        createdAt: getRelativeDate(-1),
        user: {
          id: 'user-2',
          name: 'Maria Salonbesitzer',
          email: 'maria@salon.de',
        },
      },
      {
        id: 'sess-3',
        userId: 'user-3',
        device: 'Mobile',
        browser: 'Chrome Mobile',
        os: 'Android 14',
        ipAddress: '192.168.1.102',
        location: 'München, DE',
        lastActiveAt: getRelativeDate(0, 1, 0),
        isActive: true,
        createdAt: getRelativeDate(-3),
        user: {
          id: 'user-3',
          name: 'Max Stylist',
          email: 'max@stylist.de',
        },
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
  // Default content für alle Templates
  const defaultContent = (headline: string, body: string, buttonText: string = 'Jetzt ansehen', footer: string = 'Bei Fragen stehen wir dir jederzeit zur Verfügung.') => ({
    headline, body, buttonText, footer
  })

  return [
    // ============================================
    // Auth & Account (auth)
    // ============================================
    { id: 'tpl-1', slug: 'welcome', name: 'Willkommen', subject: 'Willkommen bei NICNOA, {{name}}! 🎉', description: 'Wird nach der Registrierung gesendet', category: 'auth', isActive: true, isSystem: true, content: defaultContent('Willkommen bei NICNOA!', 'Vielen Dank für deine Registrierung! Wir freuen uns, dich in unserer Community begrüßen zu dürfen.', 'Zum Dashboard'), createdAt: getRelativeDate(-90), updatedAt: getRelativeDate(-30), _count: { sentEmails: 456 } },
    { id: 'tpl-2', slug: 'email-verification', name: 'E-Mail Bestätigung', subject: 'Bitte bestätige deine E-Mail-Adresse', description: 'Verifikationslink für neue Accounts', category: 'auth', isActive: true, isSystem: true, content: defaultContent('E-Mail bestätigen', 'Um dein Konto zu aktivieren, bestätige bitte deine E-Mail-Adresse.', 'E-Mail bestätigen', 'Der Link ist 24 Stunden gültig.'), createdAt: getRelativeDate(-90), updatedAt: getRelativeDate(-60), _count: { sentEmails: 423 } },
    { id: 'tpl-3', slug: 'password-reset', name: 'Passwort zurücksetzen', subject: 'Dein Passwort-Reset-Link', description: 'Link zum Zurücksetzen des Passworts', category: 'auth', isActive: true, isSystem: true, content: defaultContent('Passwort zurücksetzen', 'Du hast angefordert, dein Passwort zurückzusetzen. Klicke auf den Button um ein neues Passwort zu vergeben.', 'Neues Passwort setzen', 'Falls du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail.'), createdAt: getRelativeDate(-90), updatedAt: getRelativeDate(-45), _count: { sentEmails: 187 } },
    { id: 'tpl-4', slug: 'password-changed', name: 'Passwort geändert', subject: 'Dein Passwort wurde geändert', description: 'Bestätigung der Passwortänderung', category: 'auth', isActive: true, isSystem: true, content: defaultContent('Passwort geändert', 'Dein Passwort wurde erfolgreich geändert. Falls du diese Änderung nicht vorgenommen hast, kontaktiere uns sofort.', 'Zum Dashboard'), createdAt: getRelativeDate(-90), updatedAt: getRelativeDate(-40), _count: { sentEmails: 134 } },
    { id: 'tpl-5', slug: 'login-new-device', name: 'Neues Gerät erkannt', subject: 'Anmeldung von neuem Gerät erkannt', description: 'Sicherheitswarnung bei unbekanntem Gerät', category: 'auth', isActive: true, isSystem: true, content: defaultContent('Neue Anmeldung erkannt', 'Wir haben eine Anmeldung von einem neuen Gerät festgestellt. Falls du das nicht warst, ändere sofort dein Passwort.', 'Aktivität prüfen', 'Deine Sicherheit ist uns wichtig.'), createdAt: getRelativeDate(-90), updatedAt: getRelativeDate(-35), _count: { sentEmails: 89 } },
    { id: 'tpl-6', slug: 'account-deactivated', name: 'Account deaktiviert', subject: 'Dein NICNOA Account wurde deaktiviert ⚠️', description: 'Benachrichtigung über Account-Deaktivierung', category: 'auth', isActive: true, isSystem: true, content: defaultContent('Account deaktiviert', 'Dein Account wurde deaktiviert. Deine Daten werden noch 30 Tage gespeichert.', 'Account reaktivieren', 'Kontaktiere uns bei Fragen.'), createdAt: getRelativeDate(-90), updatedAt: getRelativeDate(-30), _count: { sentEmails: 12 } },
    
    // ============================================
    // Onboarding (onboarding)
    // ============================================
    { id: 'tpl-7', slug: 'onboarding-submitted', name: 'Onboarding eingereicht', subject: 'Neuer Onboarding-Antrag von {{stylistName}}', description: 'Benachrichtigt Admin über neuen Antrag', category: 'onboarding', isActive: true, isSystem: true, content: defaultContent('Neuer Onboarding-Antrag', 'Ein neuer Stylist hat seinen Onboarding-Antrag eingereicht und wartet auf Prüfung.', 'Antrag prüfen', 'Bitte prüfe den Antrag zeitnah.'), createdAt: getRelativeDate(-90), updatedAt: getRelativeDate(-25), _count: { sentEmails: 78 } },
    { id: 'tpl-8', slug: 'onboarding-approved', name: 'Onboarding genehmigt', subject: 'Dein Antrag wurde genehmigt! 🎉', description: 'Stylist wurde freigeschaltet', category: 'onboarding', isActive: true, isSystem: true, content: defaultContent('Herzlichen Glückwunsch!', 'Dein Onboarding-Antrag wurde genehmigt. Du kannst jetzt alle Funktionen nutzen.', 'Zum Dashboard', 'Wir freuen uns auf eine erfolgreiche Zusammenarbeit!'), createdAt: getRelativeDate(-90), updatedAt: getRelativeDate(-20), _count: { sentEmails: 67 } },
    { id: 'tpl-9', slug: 'onboarding-rejected', name: 'Onboarding abgelehnt', subject: 'Dein Antrag benötigt Überarbeitung', description: 'Antrag muss überarbeitet werden', category: 'onboarding', isActive: true, isSystem: true, content: defaultContent('Überarbeitung erforderlich', 'Leider konnten wir deinen Antrag noch nicht freigeben. Bitte überprüfe die Punkte und reiche erneut ein.', 'Antrag überarbeiten', 'Bei Fragen kannst du uns jederzeit kontaktieren.'), createdAt: getRelativeDate(-90), updatedAt: getRelativeDate(-15), _count: { sentEmails: 23 } },
    { id: 'tpl-10', slug: 'document-uploaded', name: 'Dokument hochgeladen', subject: 'Neues Dokument von {{stylistName}}: {{documentType}} 📄', description: 'Stylist hat ein Dokument eingereicht', category: 'onboarding', isActive: true, isSystem: true, content: defaultContent('Neues Dokument', 'Ein neues Dokument wurde hochgeladen und wartet auf Prüfung.', 'Dokument prüfen', 'Prüfe das Dokument zeitnah.'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-10), _count: { sentEmails: 156 } },
    { id: 'tpl-11', slug: 'document-status', name: 'Dokument-Status', subject: 'Dokument {{status}}: {{documentType}}', description: 'Status-Update zu eingereichtem Dokument', category: 'onboarding', isActive: true, isSystem: true, content: defaultContent('Dokument-Update', 'Der Status deines Dokuments wurde aktualisiert.', 'Details ansehen', 'Bei Fragen wende dich an uns.'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-8), _count: { sentEmails: 189 } },

    // ============================================
    // Subscription & Payment (subscription)
    // ============================================
    { id: 'tpl-12', slug: 'subscription-activated', name: 'Abo aktiviert', subject: 'Dein {{planName}}-Abo ist jetzt aktiv! 🚀', description: 'Bestätigung der Abo-Aktivierung', category: 'subscription', isActive: true, isSystem: true, content: defaultContent('Abo erfolgreich aktiviert!', 'Dein Abonnement ist jetzt aktiv. Du hast Zugriff auf alle Features.', 'Jetzt loslegen', 'Vielen Dank für dein Vertrauen!'), createdAt: getRelativeDate(-90), updatedAt: getRelativeDate(-20), _count: { sentEmails: 234 } },
    { id: 'tpl-13', slug: 'subscription-renewed', name: 'Abo verlängert', subject: 'Dein Abo wurde erfolgreich verlängert', description: 'Bestätigung der automatischen Verlängerung', category: 'subscription', isActive: true, isSystem: true, content: defaultContent('Abo verlängert', 'Dein Abonnement wurde automatisch verlängert.', 'Abo verwalten', 'Vielen Dank, dass du NICNOA nutzt!'), createdAt: getRelativeDate(-90), updatedAt: getRelativeDate(-15), _count: { sentEmails: 178 } },
    { id: 'tpl-14', slug: 'subscription-expiring', name: 'Abo läuft ab', subject: 'Dein Abo läuft bald ab ⏰', description: 'Erinnerung vor Ablauf', category: 'subscription', isActive: true, isSystem: true, content: defaultContent('Abo-Erinnerung', 'Dein Abonnement läuft bald aus. Verlängere jetzt, um weiterhin alle Funktionen zu nutzen.', 'Jetzt verlängern', 'Wir würden dich ungern als Kunden verlieren!'), createdAt: getRelativeDate(-90), updatedAt: getRelativeDate(-10), _count: { sentEmails: 89 } },
    { id: 'tpl-15', slug: 'subscription-expired', name: 'Abo abgelaufen', subject: 'Dein Abo ist abgelaufen', description: 'Benachrichtigung nach Ablauf', category: 'subscription', isActive: true, isSystem: true, content: defaultContent('Abo abgelaufen', 'Dein Abonnement ist abgelaufen. Reaktiviere es jetzt, um alle Funktionen zu nutzen.', 'Abo reaktivieren', 'Deine Daten werden noch 30 Tage gespeichert.'), createdAt: getRelativeDate(-90), updatedAt: getRelativeDate(-5), _count: { sentEmails: 34 } },
    { id: 'tpl-16', slug: 'payment-failed', name: 'Zahlung fehlgeschlagen', subject: 'Zahlung fehlgeschlagen - Aktion erforderlich', description: 'Benachrichtigung über fehlgeschlagene Zahlung', category: 'subscription', isActive: true, isSystem: true, content: defaultContent('Zahlung fehlgeschlagen', 'Leider konnten wir die Zahlung nicht verarbeiten. Bitte aktualisiere deine Zahlungsinformationen.', 'Zahlung aktualisieren', 'Handle bitte schnell, um eine Unterbrechung zu vermeiden.'), createdAt: getRelativeDate(-90), updatedAt: getRelativeDate(-8), _count: { sentEmails: 45 } },
    { id: 'tpl-17', slug: 'payment-received', name: 'Zahlung erhalten', subject: 'Zahlung erhalten: {{amount}} 💰', description: 'Bestätigung eingehender Zahlung', category: 'subscription', isActive: true, isSystem: true, content: defaultContent('Zahlung eingegangen!', 'Deine Zahlung ist erfolgreich eingegangen. Vielen Dank!', 'Zahlungen verwalten', 'Alle Transaktionen findest du im Dashboard.'), createdAt: getRelativeDate(-90), updatedAt: getRelativeDate(-3), _count: { sentEmails: 567 } },
    { id: 'tpl-18', slug: 'payment-dispute', name: 'Zahlungsstreit', subject: '🚨 Zahlungsstreit: {{amount}} von {{customerName}}', description: 'Benachrichtigung bei Stripe-Dispute', category: 'subscription', isActive: true, isSystem: true, content: defaultContent('Zahlungsstreit eingegangen', 'Ein Kunde hat einen Zahlungsstreit eingereicht. Eine Antwort ist erforderlich.', 'In Stripe öffnen', 'Beantworte den Dispute rechtzeitig.'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-5), _count: { sentEmails: 3 } },
    { id: 'tpl-19', slug: 'invoice-receipt', name: 'Rechnung/Quittung', subject: 'Deine Rechnung #{{invoiceNumber}}', description: 'Zahlungsbestätigung mit Rechnung', category: 'subscription', isActive: true, isSystem: true, content: defaultContent('Zahlungsbestätigung', 'Vielen Dank für deine Zahlung! Anbei findest du deine Rechnung.', 'Rechnung herunterladen', 'Diese E-Mail dient als Zahlungsnachweis.'), createdAt: getRelativeDate(-90), updatedAt: getRelativeDate(-2), _count: { sentEmails: 456 } },

    // ============================================
    // Booking (booking)
    // ============================================
    { id: 'tpl-20', slug: 'booking-confirmation', name: 'Terminbestätigung', subject: 'Dein Termin am {{bookingDate}} ist bestätigt ✅', description: 'Bestätigung eines gebuchten Termins', category: 'booking', isActive: true, isSystem: true, content: defaultContent('Termin bestätigt!', 'Dein Termin wurde erfolgreich bestätigt.', 'Termin verwalten', 'Bitte erscheine pünktlich zu deinem Termin.'), createdAt: getRelativeDate(-90), updatedAt: getRelativeDate(-1), _count: { sentEmails: 1234 } },
    { id: 'tpl-21', slug: 'booking-reminder', name: 'Terminerinnerung', subject: 'Erinnerung: Dein Termin morgen um {{bookingTime}} Uhr', description: '24h Erinnerung vor dem Termin', category: 'booking', isActive: true, isSystem: true, content: defaultContent('Morgen ist es soweit!', 'Wir erinnern dich an deinen Termin morgen.', 'Termin ansehen', 'Kannst du nicht kommen? Bitte sage rechtzeitig ab.'), createdAt: getRelativeDate(-90), updatedAt: getRelativeDate(-1), _count: { sentEmails: 987 } },
    { id: 'tpl-22', slug: 'booking-cancelled', name: 'Termin storniert', subject: 'Dein Termin wurde storniert', description: 'Bestätigung einer Stornierung', category: 'booking', isActive: true, isSystem: true, content: defaultContent('Termin storniert', 'Dein Termin wurde storniert.', 'Neuen Termin buchen', 'Wir würden uns freuen, dich bald wieder zu sehen!'), createdAt: getRelativeDate(-90), updatedAt: getRelativeDate(-5), _count: { sentEmails: 156 } },
    { id: 'tpl-23', slug: 'booking-feedback-request', name: 'Feedback-Anfrage', subject: 'Wie war dein Termin? ⭐', description: 'Bitte um Bewertung nach dem Termin', category: 'booking', isActive: true, isSystem: true, content: defaultContent('Wie war dein Besuch?', 'Wir hoffen, du hattest einen tollen Termin! Teile deine Erfahrung mit uns.', 'Jetzt bewerten', 'Dein Feedback hilft uns, besser zu werden.'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-3), _count: { sentEmails: 678 } },
    { id: 'tpl-24', slug: 'customer-no-show', name: 'Kunde nicht erschienen', subject: 'Kunde nicht erschienen: {{customerName}} ❌', description: 'Benachrichtigung bei No-Show', category: 'booking', isActive: true, isSystem: true, content: defaultContent('Termin verpasst', 'Der Kunde ist nicht zum geplanten Termin erschienen.', 'Buchungen verwalten', 'Erwäge Anzahlungen, um No-Shows zu reduzieren.'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-7), _count: { sentEmails: 89 } },

    // ============================================
    // Rental / Stuhlmiete (rental)
    // ============================================
    { id: 'tpl-25', slug: 'new-rental-request', name: 'Neue Mietanfrage', subject: 'Neue Mietanfrage von {{stylistName}} 💺', description: 'Stylist möchte einen Platz mieten', category: 'rental', isActive: true, isSystem: true, content: defaultContent('Neue Mietanfrage', 'Ein Stylist hat Interesse an einem Platz in deinem Salon.', 'Anfrage prüfen', 'Antworte zeitnah, um qualifizierte Stylisten nicht zu verlieren.'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-10), _count: { sentEmails: 45 } },
    { id: 'tpl-26', slug: 'rental-accepted', name: 'Bewerbung angenommen', subject: 'Deine Bewerbung wurde angenommen! 🎉', description: 'Salon-Besitzer hat Mietanfrage akzeptiert', category: 'rental', isActive: true, isSystem: true, content: defaultContent('Willkommen im Team!', 'Deine Bewerbung wurde angenommen. Du kannst jetzt deinen neuen Arbeitsplatz einrichten.', 'Jetzt loslegen', 'Wir freuen uns auf eine erfolgreiche Zusammenarbeit!'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-8), _count: { sentEmails: 34 } },
    { id: 'tpl-27', slug: 'rental-rejected', name: 'Bewerbung abgelehnt', subject: 'Update zu deiner Bewerbung bei {{salonName}}', description: 'Mietanfrage wurde abgelehnt', category: 'rental', isActive: true, isSystem: true, content: defaultContent('Bewerbung nicht erfolgreich', 'Leider wurde deine Bewerbung nicht angenommen. Es gibt viele andere tolle Salons!', 'Weitere Salons entdecken', 'Optimiere dein Profil für bessere Chancen.'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-6), _count: { sentEmails: 12 } },
    { id: 'tpl-28', slug: 'rental-application-sent', name: 'Bewerbung versendet', subject: 'Deine Bewerbung bei {{salonName}} wurde versendet 📤', description: 'Bestätigung für eingereichte Bewerbung', category: 'rental', isActive: true, isSystem: true, content: defaultContent('Bewerbung eingereicht!', 'Deine Bewerbung wurde erfolgreich versendet. Der Salon-Besitzer wird benachrichtigt.', 'Status verfolgen', 'Du erhältst eine E-Mail, sobald es eine Entscheidung gibt.'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-5), _count: { sentEmails: 56 } },
    { id: 'tpl-29', slug: 'rental-ending-soon', name: 'Mietvertrag endet bald', subject: 'Dein Mietvertrag endet in {{daysRemaining}} Tagen ⏰', description: 'Erinnerung 30 Tage vor Vertragsende', category: 'rental', isActive: true, isSystem: true, content: defaultContent('Vertrag läuft aus', 'Dein Mietvertrag endet bald. Entscheide, ob du verlängern möchtest.', 'Vertrag verlängern', 'Verlängere rechtzeitig, um deinen Platz zu sichern.'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-4), _count: { sentEmails: 23 } },
    { id: 'tpl-30', slug: 'chair-rental-confirmation', name: 'Mietvertrag bestätigt', subject: 'Mietvertrag bestätigt: {{stylistName}} mietet {{chairName}} ✅', description: 'Bestätigung für Salon-Besitzer', category: 'rental', isActive: true, isSystem: true, content: defaultContent('Mietvertrag aktiv!', 'Der Mietvertrag wurde akzeptiert. Das Mietverhältnis beginnt bald.', 'Mietverhältnis verwalten', 'Begrüße deinen neuen Mieter!'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-3), _count: { sentEmails: 34 } },
    { id: 'tpl-31', slug: 'chair-vacancy', name: 'Stuhl wieder frei', subject: '{{chairName}} ist wieder verfügbar 💺', description: 'Mietvertrag beendet - Platz verfügbar', category: 'rental', isActive: true, isSystem: true, content: defaultContent('Platz wieder frei', 'Der Mietvertrag ist beendet. Der Platz steht für neue Mieter zur Verfügung.', 'Platz verwalten', 'Aktualisiere die Informationen für neue Interessenten.'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-2), _count: { sentEmails: 18 } },
    { id: 'tpl-32', slug: 'rent-payment-due', name: 'Miete fällig', subject: 'Mietzahlung von {{amount}} fällig am {{dueDate}} 💳', description: 'Erinnerung an anstehende Mietzahlung', category: 'rental', isActive: true, isSystem: true, content: defaultContent('Miete fällig', 'Deine monatliche Miete ist bald fällig. Stelle sicher, dass die Zahlung erfolgt.', 'Jetzt bezahlen', 'Pünktliche Zahlungen sichern deinen Platz.'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-1), _count: { sentEmails: 145 } },
    { id: 'tpl-33', slug: 'rent-payment-overdue', name: 'Miete überfällig', subject: '⚠️ Mietzahlung überfällig - {{daysOverdue}} Tage', description: 'Mahnung bei überfälliger Zahlung', category: 'rental', isActive: true, isSystem: true, content: defaultContent('Zahlung überfällig', 'Deine Mietzahlung ist überfällig. Bitte begleiche den Betrag umgehend.', 'Jetzt bezahlen', 'Bei Zahlungsschwierigkeiten kontaktiere uns bitte.'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-1), _count: { sentEmails: 23 } },

    // ============================================
    // Reviews (review)
    // ============================================
    { id: 'tpl-34', slug: 'new-review-salon', name: 'Neue Salon-Bewertung', subject: 'Neue {{rating}}-Sterne Bewertung für {{salonName}} ⭐', description: 'Kunde hat den Salon bewertet', category: 'review', isActive: true, isSystem: true, content: defaultContent('Neue Bewertung erhalten!', 'Ein Kunde hat eine neue Bewertung für deinen Salon hinterlassen.', 'Bewertung ansehen', 'Bewertungen helfen neuen Kunden, dich zu finden.'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-5), _count: { sentEmails: 234 } },
    { id: 'tpl-35', slug: 'new-review-stylist', name: 'Neue Stylist-Bewertung', subject: 'Neue {{rating}}-Sterne Bewertung ⭐', description: 'Kunde hat den Stylisten bewertet', category: 'review', isActive: true, isSystem: true, content: defaultContent('Du wurdest bewertet!', 'Ein Kunde hat eine neue Bewertung für dich hinterlassen.', 'Bewertung ansehen', 'Gute Bewertungen bringen mehr Kunden!'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-4), _count: { sentEmails: 345 } },

    // ============================================
    // Referral (referral)
    // ============================================
    { id: 'tpl-36', slug: 'referral-invitation', name: 'Empfehlungs-Einladung', subject: '{{referrerName}} lädt dich zu NICNOA ein! 🎁', description: 'Einladung über Referral-Link', category: 'referral', isActive: true, isSystem: true, content: defaultContent('Du wurdest eingeladen!', 'Ein Freund möchte, dass du Teil der NICNOA Community wirst. Als eingeladenes Mitglied erhältst du Vorteile.', 'Kostenlos registrieren', 'Diese Einladung ist 30 Tage gültig.'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-10), _count: { sentEmails: 123 } },
    { id: 'tpl-37', slug: 'referral-success', name: 'Empfehlung erfolgreich', subject: 'Glückwunsch! Du hast eine Belohnung verdient! 🎉', description: 'Belohnung für erfolgreiche Empfehlung', category: 'referral', isActive: true, isSystem: true, content: defaultContent('Belohnung verdient!', 'Dank deiner Empfehlung hat sich jemand registriert! Als Dankeschön erhältst du eine Belohnung.', 'Mehr Freunde einladen', 'Lade weitere Freunde ein und verdiene mehr!'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-8), _count: { sentEmails: 67 } },

    // ============================================
    // Salon Invitations (invitation)
    // ============================================
    { id: 'tpl-38', slug: 'salon-invitation', name: 'Salon-Einladung (registriert)', subject: '💼 {{inviterName}} lädt Sie zu {{salonName}} ein', description: 'Einladung für registrierte Stylisten', category: 'invitation', isActive: true, isSystem: true, content: defaultContent('Einladung zum Salon', 'Sie wurden eingeladen, als Stuhlmieter zu arbeiten. Klicken Sie auf den Button, um zu antworten.', 'Einladung ansehen', 'Diese Einladung ist 7 Tage gültig.'), createdAt: getRelativeDate(-30), updatedAt: getRelativeDate(-5), _count: { sentEmails: 45 } },
    { id: 'tpl-39', slug: 'salon-invitation-unregistered', name: 'Salon-Einladung (nicht registriert)', subject: '💼 Sie wurden zu {{salonName}} eingeladen!', description: 'Einladung für nicht-registrierte Stylisten', category: 'invitation', isActive: true, isSystem: true, content: defaultContent('Werden Sie Teil des Teams', 'Sie wurden eingeladen, als Stuhlmieter zu arbeiten. Registrieren Sie sich kostenlos, um die Einladung anzunehmen.', 'Jetzt registrieren', 'Nach der Registrierung können Sie die Einladung annehmen.'), createdAt: getRelativeDate(-30), updatedAt: getRelativeDate(-4), _count: { sentEmails: 23 } },
    { id: 'tpl-40', slug: 'salon-invitation-accepted', name: 'Einladung angenommen', subject: '🎉 {{stylistName}} hat Ihre Einladung angenommen!', description: 'Benachrichtigung wenn Einladung angenommen wurde', category: 'invitation', isActive: true, isSystem: true, content: defaultContent('Einladung angenommen!', 'Großartige Neuigkeiten! Die Einladung wurde angenommen.', 'Stylisten verwalten', 'Heißen Sie Ihren neuen Stuhlmieter willkommen!'), createdAt: getRelativeDate(-30), updatedAt: getRelativeDate(-3), _count: { sentEmails: 34 } },
    { id: 'tpl-41', slug: 'salon-invitation-rejected', name: 'Einladung abgelehnt', subject: 'Einladung wurde abgelehnt', description: 'Benachrichtigung wenn Einladung abgelehnt wurde', category: 'invitation', isActive: true, isSystem: true, content: defaultContent('Einladung abgelehnt', 'Leider wurde Ihre Einladung abgelehnt.', 'Andere Stylisten einladen', 'Sie können jederzeit weitere Stylisten einladen.'), createdAt: getRelativeDate(-30), updatedAt: getRelativeDate(-2), _count: { sentEmails: 12 } },
    { id: 'tpl-42', slug: 'stylist-left-salon', name: 'Stylist verlässt Salon', subject: '{{stylistName}} hat den Salon verlassen', description: 'Benachrichtigung wenn Stylist kündigt', category: 'invitation', isActive: true, isSystem: true, content: defaultContent('Stylist hat gekündigt', 'Ein Stylist hat den Salon verlassen. Der Platz ist wieder verfügbar.', 'Platz verwalten', 'Suchen Sie nach einem neuen Mieter.'), createdAt: getRelativeDate(-30), updatedAt: getRelativeDate(-1), _count: { sentEmails: 8 } },

    // ============================================
    // System & Messaging (system)
    // ============================================
    { id: 'tpl-43', slug: 'new-message', name: 'Neue Nachricht', subject: 'Neue Nachricht von {{senderName}}', description: 'Benachrichtigung über neue Nachricht', category: 'system', isActive: true, isSystem: true, content: defaultContent('Du hast eine neue Nachricht', 'Jemand hat dir eine Nachricht geschickt.', 'Nachricht lesen', 'Du kannst Nachrichtenbenachrichtigungen in den Einstellungen ändern.'), createdAt: getRelativeDate(-90), updatedAt: getRelativeDate(-1), _count: { sentEmails: 789 } },
    { id: 'tpl-44', slug: 'security-alert', name: 'Sicherheitswarnung', subject: '🚨 Sicherheitswarnung: {{alertType}}', description: 'Benachrichtigung bei Sicherheitsvorfällen', category: 'system', isActive: true, isSystem: true, content: defaultContent('Sicherheitswarnung', 'Es wurde ein Sicherheitsvorfall erkannt, der deine Aufmerksamkeit erfordert.', 'Details ansehen', 'Bei kritischen Vorfällen handele sofort.'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-5), _count: { sentEmails: 12 } },

    // ============================================
    // Admin Reports (admin)
    // ============================================
    { id: 'tpl-45', slug: 'daily-summary', name: 'Tagesbericht', subject: 'Tagesbericht {{date}}: {{totalRevenue}} Umsatz 📊', description: 'Täglicher Report für Administratoren', category: 'admin', isActive: true, isSystem: true, content: defaultContent('Tagesbericht', 'Hier ist dein täglicher Überblick über die Plattform-Aktivitäten.', 'Dashboard öffnen', 'Automatischer täglicher Report.'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-1), _count: { sentEmails: 90 } },
    { id: 'tpl-46', slug: 'weekly-summary', name: 'Wochenbericht', subject: 'Dein Wochenbericht: {{weekRange}} 📅', description: 'Wöchentliche Zusammenfassung', category: 'admin', isActive: true, isSystem: true, content: defaultContent('Wochenrückblick', 'Hier ist dein Überblick über die vergangene Woche.', 'Zum Dashboard', 'Setze dir Ziele für die kommende Woche!'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-1), _count: { sentEmails: 45 } },
    { id: 'tpl-47', slug: 'monthly-summary', name: 'Monatsbericht', subject: 'Dein Monatsbericht für {{month}} {{year}} 📊', description: 'Monatliche Zusammenfassung', category: 'admin', isActive: true, isSystem: true, content: defaultContent('Monatsbericht', 'Hier ist dein Überblick über den vergangenen Monat. Analysiere deine Performance.', 'Bericht ansehen', 'Detaillierte Analysen findest du im Dashboard.'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-1), _count: { sentEmails: 12 } },
    { id: 'tpl-48', slug: 'new-user-registered', name: 'Neuer Nutzer registriert', subject: 'Neuer Nutzer: {{newUserName}} ({{userRole}}) 👤', description: 'Benachrichtigung über neue Registrierung', category: 'admin', isActive: true, isSystem: true, content: defaultContent('Neue Registrierung', 'Ein neuer Nutzer hat sich auf der Plattform registriert.', 'Nutzer ansehen', 'Prüfe ggf. das Profil des neuen Nutzers.'), createdAt: getRelativeDate(-60), updatedAt: getRelativeDate(-1), _count: { sentEmails: 234 } },
    { id: 'tpl-49', slug: 'high-churn-alert', name: 'Hohe Abwanderungsrate', subject: '⚠️ Churn-Alert: Abwanderungsrate auf {{churnRate}} gestiegen', description: 'Warnung bei erhöhter Kündigungsrate', category: 'admin', isActive: true, isSystem: true, content: defaultContent('Erhöhte Abwanderung erkannt', 'Die Abwanderungsrate ist gestiegen. Dies erfordert sofortige Aufmerksamkeit.', 'Analytics-Dashboard öffnen', 'Automatischer Alert basierend auf Churn-Analyse.'), createdAt: getRelativeDate(-30), updatedAt: getRelativeDate(-5), _count: { sentEmails: 3 } },
  ]
}

export function getMockEmailBrandingSettings() {
  return {
    logoUrl: null,
    primaryColor: '#ec4899',
    companyName: 'NICNOA',
    supportEmail: 'support@nicnoa.online',
    footerText: '© 2024 NICNOA. Alle Rechte vorbehalten.',
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
      supportEmail: 'support@nicnoa.online',
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
      fromEmail: 'noreply@nicnoa.online',
      replyToEmail: 'support@nicnoa.online',
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

