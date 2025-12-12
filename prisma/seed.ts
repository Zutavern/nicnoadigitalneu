import 'dotenv/config'
import { PrismaClient, BookingStatus, RentalStatus, PaymentStatus, PaymentType, SecurityEventType, SecurityEventStatus, PlanType, ReferralStatus } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

// Use DIRECT_DATABASE_URL for direct TCP connection (not the HTTP-based prisma+postgres:// URL)
const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Helper function to generate random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper function to generate random number in range
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Helper function to pick random item from array
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function main() {
  console.log('🌱 Seeding database...')

  // Hash password for test users
  const hashedPassword = await bcrypt.hash('test123', 12)

  // ============================================
  // 1. Seed Test Users (Admin, Salon Owners, Stylists)
  // ============================================

  const testUsers = [
    // Admin
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@nicnoa.de',
      name: 'Admin Test',
      password: hashedPassword,
      role: 'ADMIN' as const,
      onboardingCompleted: true,
    },
    // Salon Owners (5)
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'salon@nicnoa.de',
      name: 'Salon Betreiber',
      password: hashedPassword,
      role: 'SALON_OWNER' as const,
      onboardingCompleted: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000010',
      email: 'salon2@nicnoa.de',
      name: 'Maria Schneider',
      password: hashedPassword,
      role: 'SALON_OWNER' as const,
      onboardingCompleted: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000011',
      email: 'salon3@nicnoa.de',
      name: 'Thomas Bauer',
      password: hashedPassword,
      role: 'SALON_OWNER' as const,
      onboardingCompleted: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000012',
      email: 'salon4@nicnoa.de',
      name: 'Elena Fischer',
      password: hashedPassword,
      role: 'SALON_OWNER' as const,
      onboardingCompleted: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000013',
      email: 'salon5@nicnoa.de',
      name: 'Andreas Weber',
      password: hashedPassword,
      role: 'SALON_OWNER' as const,
      onboardingCompleted: true,
    },
    // Stylists (10)
    {
      id: '00000000-0000-0000-0000-000000000003',
      email: 'stylist@nicnoa.de',
      name: 'Stylist Test',
      password: hashedPassword,
      role: 'STYLIST' as const,
      onboardingCompleted: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000020',
      email: 'sarah.mueller@nicnoa.de',
      name: 'Sarah Müller',
      password: hashedPassword,
      role: 'STYLIST' as const,
      onboardingCompleted: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000021',
      email: 'julia.hoffmann@nicnoa.de',
      name: 'Julia Hoffmann',
      password: hashedPassword,
      role: 'STYLIST' as const,
      onboardingCompleted: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000022',
      email: 'lisa.wagner@nicnoa.de',
      name: 'Lisa Wagner',
      password: hashedPassword,
      role: 'STYLIST' as const,
      onboardingCompleted: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000023',
      email: 'anna.koch@nicnoa.de',
      name: 'Anna Koch',
      password: hashedPassword,
      role: 'STYLIST' as const,
      onboardingCompleted: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000024',
      email: 'max.schmidt@nicnoa.de',
      name: 'Max Schmidt',
      password: hashedPassword,
      role: 'STYLIST' as const,
      onboardingCompleted: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000025',
      email: 'laura.braun@nicnoa.de',
      name: 'Laura Braun',
      password: hashedPassword,
      role: 'STYLIST' as const,
      onboardingCompleted: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000026',
      email: 'nina.meyer@nicnoa.de',
      name: 'Nina Meyer',
      password: hashedPassword,
      role: 'STYLIST' as const,
      onboardingCompleted: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000027',
      email: 'tim.schulz@nicnoa.de',
      name: 'Tim Schulz',
      password: hashedPassword,
      role: 'STYLIST' as const,
      onboardingCompleted: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000028',
      email: 'sandra.hartmann@nicnoa.de',
      name: 'Sandra Hartmann',
      password: hashedPassword,
      role: 'STYLIST' as const,
      onboardingCompleted: true,
    },
  ]

  for (const user of testUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name,
        password: user.password,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
      },
      create: user,
    })
  }
  console.log('✅ Test Users seeded (1 Admin, 5 Salon Owners, 10 Stylists)')

  // ============================================
  // 2. Seed Salons with Chairs
  // ============================================

  const salons = [
    {
      id: '30000000-0000-0000-0000-000000000001',
      ownerId: '00000000-0000-0000-0000-000000000002',
      name: 'Hair Studio Berlin Mitte',
      slug: 'hair-studio-berlin-mitte',
      description: 'Moderner Friseursalon im Herzen von Berlin mit Fokus auf Nachhaltigkeit und Qualität.',
      street: 'Friedrichstraße 123',
      city: 'Berlin',
      zipCode: '10117',
      phone: '+49 30 12345678',
      email: 'info@hairstudio-mitte.de',
      website: 'https://hairstudio-mitte.de',
      openingHours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '10:00', close: '16:00' },
        sunday: null,
      },
      amenities: ['WLAN', 'Klimaanlage', 'Getränke', 'Parkplatz', 'Barrierefrei'],
      chairCount: 4,
      salonSize: 120,
      isActive: true,
      isVerified: true,
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      ownerId: '00000000-0000-0000-0000-000000000010',
      name: 'Glamour & Style München',
      slug: 'glamour-style-muenchen',
      description: 'Exklusiver Salon für anspruchsvolle Kunden. Spezialisiert auf Colorationen und Extensions.',
      street: 'Maximilianstraße 45',
      city: 'München',
      zipCode: '80538',
      phone: '+49 89 98765432',
      email: 'kontakt@glamour-style.de',
      website: 'https://glamour-style.de',
      openingHours: {
        monday: null,
        tuesday: { open: '10:00', close: '19:00' },
        wednesday: { open: '10:00', close: '19:00' },
        thursday: { open: '10:00', close: '21:00' },
        friday: { open: '10:00', close: '19:00' },
        saturday: { open: '09:00', close: '17:00' },
        sunday: null,
      },
      amenities: ['WLAN', 'Klimaanlage', 'Champagner-Service', 'Kinderbetreuung'],
      chairCount: 6,
      salonSize: 180,
      isActive: true,
      isVerified: true,
    },
    {
      id: '30000000-0000-0000-0000-000000000003',
      ownerId: '00000000-0000-0000-0000-000000000011',
      name: 'Haarwerk Hamburg',
      slug: 'haarwerk-hamburg',
      description: 'Traditionelles Handwerk trifft moderne Trends. Seit 1995 in Hamburg.',
      street: 'Eppendorfer Baum 78',
      city: 'Hamburg',
      zipCode: '20249',
      phone: '+49 40 55667788',
      email: 'info@haarwerk-hamburg.de',
      website: null,
      openingHours: {
        monday: { open: '08:00', close: '17:00' },
        tuesday: { open: '08:00', close: '17:00' },
        wednesday: { open: '08:00', close: '17:00' },
        thursday: { open: '08:00', close: '19:00' },
        friday: { open: '08:00', close: '17:00' },
        saturday: { open: '09:00', close: '14:00' },
        sunday: null,
      },
      amenities: ['WLAN', 'Getränke', 'Zeitschriften'],
      chairCount: 3,
      salonSize: 85,
      isActive: true,
      isVerified: true,
    },
    {
      id: '30000000-0000-0000-0000-000000000004',
      ownerId: '00000000-0000-0000-0000-000000000012',
      name: 'Schnittkultur Köln',
      slug: 'schnittkultur-koeln',
      description: 'Junges Team, frische Ideen. Spezialisiert auf Herrenhaarschnitte und Barber-Services.',
      street: 'Ehrenstraße 99',
      city: 'Köln',
      zipCode: '50672',
      phone: '+49 221 33445566',
      email: 'team@schnittkultur.de',
      website: 'https://schnittkultur.de',
      openingHours: {
        monday: { open: '10:00', close: '18:00' },
        tuesday: { open: '10:00', close: '18:00' },
        wednesday: { open: '10:00', close: '18:00' },
        thursday: { open: '10:00', close: '20:00' },
        friday: { open: '10:00', close: '18:00' },
        saturday: { open: '10:00', close: '16:00' },
        sunday: null,
      },
      amenities: ['WLAN', 'Getränke', 'Gaming-Ecke', 'Musik'],
      chairCount: 5,
      salonSize: 100,
      isActive: true,
      isVerified: true,
    },
    {
      id: '30000000-0000-0000-0000-000000000005',
      ownerId: '00000000-0000-0000-0000-000000000013',
      name: 'Naturlocke Frankfurt',
      slug: 'naturlocke-frankfurt',
      description: 'Bio-Friseursalon mit 100% natürlichen Produkten. Vegan und nachhaltig.',
      street: 'Berger Straße 234',
      city: 'Frankfurt',
      zipCode: '60385',
      phone: '+49 69 77889900',
      email: 'hallo@naturlocke.de',
      website: 'https://naturlocke.de',
      openingHours: {
        monday: null,
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '10:00', close: '15:00' },
        sunday: null,
      },
      amenities: ['WLAN', 'Bio-Tee', 'Meditation-Raum', 'Barrierefrei'],
      chairCount: 4,
      salonSize: 95,
      isActive: true,
      isVerified: true,
    },
  ]

  for (const salon of salons) {
    await prisma.salon.upsert({
      where: { id: salon.id },
      update: salon,
      create: salon,
    })
  }
  console.log('✅ 5 Salons seeded')

  // ============================================
  // 3. Seed Chairs for each Salon
  // ============================================

  const chairsData: Array<{
    id: string
    salonId: string
    name: string
    description: string
    monthlyRate: number
    amenities: string[]
    isAvailable: boolean
  }> = []

  let chairCounter = 1
  for (const salon of salons) {
    for (let i = 1; i <= salon.chairCount; i++) {
      chairsData.push({
        id: `40000000-0000-0000-0000-${String(chairCounter).padStart(12, '0')}`,
        salonId: salon.id,
        name: `Platz ${i}`,
        description: i === 1 ? 'Fensterplatz mit Tageslicht' : i === salon.chairCount ? 'Ruhiger Platz im hinteren Bereich' : 'Zentral gelegen',
        monthlyRate: salon.city === 'München' ? 850 : salon.city === 'Berlin' ? 750 : 650,
        amenities: i === 1 ? ['Fenster', 'Tageslicht', 'Spiegelheizung'] : ['Spiegelheizung'],
        isAvailable: i % 3 !== 0, // Einige Plätze sind bereits vermietet
      })
      chairCounter++
    }
  }

  for (const chair of chairsData) {
    await prisma.chair.upsert({
      where: { id: chair.id },
      update: chair,
      create: chair,
    })
  }
  console.log(`✅ ${chairsData.length} Chairs seeded`)

  // ============================================
  // 4. Seed Chair Rentals
  // ============================================

  const stylistIds = testUsers.filter(u => u.role === 'STYLIST').map(u => u.id)
  const rentedChairs = chairsData.filter(c => !c.isAvailable)
  
  const rentals: Array<{
    id: string
    chairId: string
    stylistId: string
    startDate: Date
    monthlyRent: number
    status: RentalStatus
  }> = []

  rentedChairs.forEach((chair, index) => {
    if (index < stylistIds.length) {
      rentals.push({
        id: `50000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`,
        chairId: chair.id,
        stylistId: stylistIds[index],
        startDate: randomDate(new Date('2024-01-01'), new Date('2024-06-01')),
        monthlyRent: chair.monthlyRate,
        status: RentalStatus.ACTIVE,
      })
    }
  })

  for (const rental of rentals) {
    await prisma.chairRental.upsert({
      where: { id: rental.id },
      update: rental,
      create: rental,
    })
  }
  console.log(`✅ ${rentals.length} Chair Rentals seeded`)

  // ============================================
  // 5. Seed Customers
  // ============================================

  const firstNames = ['Emma', 'Mia', 'Sofia', 'Lena', 'Clara', 'Marie', 'Anna', 'Laura', 'Julia', 'Sophie', 
                      'Paul', 'Felix', 'Lukas', 'Leon', 'Jonas', 'Finn', 'Noah', 'Elias', 'Ben', 'Luis']
  const lastNames = ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann',
                     'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun']

  const customers: Array<{
    id: string
    stylistId: string
    firstName: string
    lastName: string
    email: string
    phone: string
    notes: string | null
  }> = []

  let customerCounter = 1
  for (const stylistId of stylistIds) {
    const customerCount = randomInt(5, 15) // 5-15 Kunden pro Stylist
    for (let i = 0; i < customerCount; i++) {
      const firstName = randomItem(firstNames)
      const lastName = randomItem(lastNames)
      customers.push({
        id: `60000000-0000-0000-0000-${String(customerCounter).padStart(12, '0')}`,
        stylistId,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${customerCounter}@example.de`,
        phone: `+49 ${randomInt(151, 179)} ${randomInt(1000000, 9999999)}`,
        notes: i % 5 === 0 ? 'VIP Kunde - immer Extrapflege' : null,
      })
      customerCounter++
    }
  }

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { id: customer.id },
      update: customer,
      create: customer,
    })
  }
  console.log(`✅ ${customers.length} Customers seeded`)

  // ============================================
  // 6. Seed Services (falls noch nicht vorhanden)
  // ============================================

  const serviceCategories = [
    {
      id: '10000000-0000-0000-0000-000000000001',
      name: 'Schneiden & Styling',
      slug: 'schneiden-styling',
      description: 'Haarschnitte und Styling-Services',
      icon: 'scissors',
      color: 'emerald',
      sortOrder: 1,
      services: [
        { name: 'Damenhaarschnitt', slug: 'damenhaarschnitt', description: 'Klassischer Damenhaarschnitt' },
        { name: 'Herrenhaarschnitt', slug: 'herrenhaarschnitt', description: 'Klassischer Herrenhaarschnitt' },
        { name: 'Kinderhaarschnitt', slug: 'kinderhaarschnitt', description: 'Haarschnitt für Kinder' },
        { name: 'Pony schneiden', slug: 'pony-schneiden', description: 'Pony nachschneiden' },
        { name: 'Trockenschnitt', slug: 'trockenschnitt', description: 'Schnitt am trockenen Haar' },
        { name: 'Föhnen & Styling', slug: 'foehnen-styling', description: 'Professionelles Föhnen und Stylen' },
      ]
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      name: 'Färben & Colorationen',
      slug: 'faerben-colorationen',
      description: 'Haarfarbe und Colorationstechniken',
      icon: 'palette',
      color: 'violet',
      sortOrder: 2,
      services: [
        { name: 'Balayage', slug: 'balayage', description: 'Natürliche Farbverläufe' },
        { name: 'Highlights / Strähnen', slug: 'highlights-straehnen', description: 'Aufhellende Strähnen' },
        { name: 'Lowlights', slug: 'lowlights', description: 'Dunkle Strähnen für mehr Tiefe' },
        { name: 'Komplett-Färbung', slug: 'komplett-faerbung', description: 'Vollständige Haarfärbung' },
        { name: 'Ansatz-Färbung', slug: 'ansatz-faerbung', description: 'Nachwachsende Ansätze färben' },
        { name: 'Color Correction', slug: 'color-correction', description: 'Farbkorrekturen' },
        { name: 'Blondierung', slug: 'blondierung', description: 'Professionelle Aufhellung' },
      ]
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      name: 'Pflege & Behandlungen',
      slug: 'pflege-behandlungen',
      description: 'Haarpflege und Spezialbehandlungen',
      icon: 'droplets',
      color: 'cyan',
      sortOrder: 3,
      services: [
        { name: 'Olaplex-Behandlung', slug: 'olaplex', description: 'Strukturwiederherstellung' },
        { name: 'Keratin-Behandlung', slug: 'keratin', description: 'Glättung und Pflege' },
        { name: 'Kopfhaut-Behandlung', slug: 'kopfhaut', description: 'Spezielle Kopfhautpflege' },
        { name: 'Intensiv-Kur', slug: 'intensiv-kur', description: 'Tiefenpflege für strapaziertes Haar' },
        { name: 'Haar-Spa', slug: 'haar-spa', description: 'Wellness für die Haare' },
      ]
    },
    {
      id: '10000000-0000-0000-0000-000000000004',
      name: 'Spezial-Services',
      slug: 'spezial-services',
      description: 'Besondere Dienstleistungen',
      icon: 'sparkles',
      color: 'amber',
      sortOrder: 4,
      services: [
        { name: 'Hochsteckfrisuren', slug: 'hochsteckfrisuren', description: 'Elegante Hochsteckfrisuren' },
        { name: 'Braut-Styling', slug: 'braut-styling', description: 'Styling für den großen Tag' },
        { name: 'Haar-Extensions', slug: 'haar-extensions', description: 'Haarverlängerungen' },
        { name: 'Dauerwelle', slug: 'dauerwelle', description: 'Dauerhafte Locken' },
        { name: 'Glätten (permanent)', slug: 'glaetten-permanent', description: 'Dauerhafte Glättung' },
      ]
    },
    {
      id: '10000000-0000-0000-0000-000000000005',
      name: 'Bart & Herren',
      slug: 'bart-herren',
      description: 'Services speziell für Herren',
      icon: 'scissors',
      color: 'rose',
      sortOrder: 5,
      services: [
        { name: 'Bart-Styling', slug: 'bart-styling', description: 'Professionelles Bartstyling' },
        { name: 'Bart-Trimmen', slug: 'bart-trimmen', description: 'Bart in Form bringen' },
        { name: 'Rasur', slug: 'rasur', description: 'Klassische Nassrasur' },
        { name: 'Fade / Übergang', slug: 'fade', description: 'Moderne Übergangstechniken' },
      ]
    },
  ]

  for (const category of serviceCategories) {
    const { services, ...categoryData } = category
    
    await prisma.serviceCategory.upsert({
      where: { slug: categoryData.slug },
      update: {
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.icon,
        color: categoryData.color,
        sortOrder: categoryData.sortOrder,
      },
      create: {
        id: categoryData.id,
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description,
        icon: categoryData.icon,
        color: categoryData.color,
        sortOrder: categoryData.sortOrder,
      },
    })

    const dbCategory = await prisma.serviceCategory.findUnique({
      where: { slug: categoryData.slug }
    })
    
    if (!dbCategory) continue

    for (let i = 0; i < services.length; i++) {
      const service = services[i]
      await prisma.service.upsert({
        where: { slug: service.slug },
        update: {
          name: service.name,
          description: service.description,
          sortOrder: i + 1,
          categoryId: dbCategory.id,
        },
        create: {
          categoryId: dbCategory.id,
          name: service.name,
          slug: service.slug,
          description: service.description,
          sortOrder: i + 1,
        },
      })
    }
  }
  console.log('✅ Service Categories & Services seeded (27 services)')

  // ============================================
  // 7. Seed Bookings (100+)
  // ============================================

  const allServices = await prisma.service.findMany()
  const servicePrices: { [key: string]: number } = {
    'damenhaarschnitt': 45,
    'herrenhaarschnitt': 30,
    'kinderhaarschnitt': 20,
    'pony-schneiden': 10,
    'trockenschnitt': 35,
    'foehnen-styling': 25,
    'balayage': 120,
    'highlights-straehnen': 80,
    'lowlights': 70,
    'komplett-faerbung': 65,
    'ansatz-faerbung': 45,
    'color-correction': 150,
    'blondierung': 90,
    'olaplex': 40,
    'keratin': 100,
    'kopfhaut': 30,
    'intensiv-kur': 25,
    'haar-spa': 50,
    'hochsteckfrisuren': 60,
    'braut-styling': 150,
    'haar-extensions': 200,
    'dauerwelle': 80,
    'glaetten-permanent': 120,
    'bart-styling': 25,
    'bart-trimmen': 15,
    'rasur': 20,
    'fade': 35,
  }

  const bookingTitles = [
    'Haarschnitt', 'Färbung', 'Balayage', 'Highlights', 'Styling', 'Pflege', 
    'Komplett-Paket', 'Braut-Styling', 'Bart-Service', 'Beratung'
  ]

  const bookings: Array<{
    id: string
    stylistId: string
    customerId: string | null
    salonId: string | null
    chairId: string | null
    serviceId: string | null
    serviceIds: string[]
    startTime: Date
    endTime: Date
    title: string
    totalPrice: number
    isPaid: boolean
    status: BookingStatus
  }> = []

  const now = new Date()
  const threeMonthsAgo = new Date(now)
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  const oneMonthAhead = new Date(now)
  oneMonthAhead.setMonth(oneMonthAhead.getMonth() + 1)

  for (let i = 1; i <= 150; i++) {
    const stylistId = randomItem(stylistIds)
    const stylistCustomers = customers.filter(c => c.stylistId === stylistId)
    const customer = stylistCustomers.length > 0 ? randomItem(stylistCustomers) : null
    const service = randomItem(allServices)
    const startTime = randomDate(threeMonthsAgo, oneMonthAhead)
    const duration = randomInt(30, 180) // 30 min bis 3 Stunden
    const endTime = new Date(startTime.getTime() + duration * 60000)
    const totalPrice = servicePrices[service.slug] || randomInt(25, 100)
    
    // Zufälliger Salon und Chair
    const salon = randomItem(salons)
    const salonChairs = chairsData.filter(c => c.salonId === salon.id)
    const chair = salonChairs.length > 0 ? randomItem(salonChairs) : null
    
    // Status basierend auf Zeit
    let status: BookingStatus
    if (startTime < now) {
      status = Math.random() > 0.1 ? BookingStatus.COMPLETED : BookingStatus.NO_SHOW
    } else if (startTime < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
      status = BookingStatus.CONFIRMED
    } else {
      status = Math.random() > 0.3 ? BookingStatus.CONFIRMED : BookingStatus.PENDING
    }

    bookings.push({
      id: `70000000-0000-0000-0000-${String(i).padStart(12, '0')}`,
      stylistId,
      customerId: customer?.id || null,
      salonId: salon.id,
      chairId: chair?.id || null,
      serviceId: service.id,
      serviceIds: [service.id],
      startTime,
      endTime,
      title: service.name,
      totalPrice,
      isPaid: status === BookingStatus.COMPLETED ? Math.random() > 0.2 : false,
      status,
    })
  }

  for (const booking of bookings) {
    await prisma.booking.upsert({
      where: { id: booking.id },
      update: booking,
      create: booking,
    })
  }
  console.log(`✅ ${bookings.length} Bookings seeded`)

  // ============================================
  // 8. Seed Reviews (50+)
  // ============================================

  const reviewComments = [
    'Super zufrieden! Werde definitiv wiederkommen.',
    'Tolle Beratung und perfektes Ergebnis.',
    'Sehr professionell und freundlich.',
    'Die beste Farbberatung, die ich je hatte!',
    'Endlich ein Friseur, der versteht was ich möchte.',
    'Top Qualität, faire Preise.',
    'Sehr angenehme Atmosphäre im Salon.',
    'Meine Haare waren noch nie so gesund!',
    'Schnell, sauber, perfekt!',
    'Wurde super beraten und das Ergebnis ist fantastisch.',
    'Gute Arbeit, aber etwas teuer.',
    'Nettes Team, würde ich weiterempfehlen.',
    'Sehr kreativ und individuell.',
    'Genau das was ich wollte!',
    'Professionelle Arbeit, aber lange Wartezeit.',
  ]

  const reviews: Array<{
    id: string
    salonId: string | null
    stylistId: string | null
    reviewerId: string | null
    reviewerName: string
    rating: number
    title: string
    comment: string
    isVerified: boolean
    isPublic: boolean
  }> = []

  for (let i = 1; i <= 60; i++) {
    const isSalonReview = Math.random() > 0.5
    const rating = randomInt(3, 5) // Meist positive Reviews
    const reviewer = randomItem(customers)
    
    reviews.push({
      id: `80000000-0000-0000-0000-${String(i).padStart(12, '0')}`,
      salonId: isSalonReview ? randomItem(salons).id : null,
      stylistId: !isSalonReview ? randomItem(stylistIds) : null,
      reviewerId: null,
      reviewerName: `${reviewer.firstName} ${reviewer.lastName.charAt(0)}.`,
      rating,
      title: rating === 5 ? 'Absolut empfehlenswert!' : rating === 4 ? 'Sehr gut!' : 'Zufrieden',
      comment: randomItem(reviewComments),
      isVerified: Math.random() > 0.3,
      isPublic: true,
    })
  }

  for (const review of reviews) {
    await prisma.review.upsert({
      where: { id: review.id },
      update: review,
      create: review,
    })
  }
  console.log(`✅ ${reviews.length} Reviews seeded`)

  // ============================================
  // 9. Seed Payments
  // ============================================

  const payments: Array<{
    id: string
    payerId: string
    receiverId: string | null
    rentalId: string | null
    type: PaymentType
    amount: number
    description: string
    periodStart: Date | null
    periodEnd: Date | null
    dueDate: Date | null
    paidAt: Date | null
    status: PaymentStatus
  }> = []

  // Mietzahlungen für aktive Rentals
  rentals.forEach((rental, index) => {
    const monthsData = [
      { name: 'November 2024', year: 2024, month: 11 },
      { name: 'Dezember 2024', year: 2024, month: 12 },
      { name: 'Januar 2025', year: 2025, month: 1 },
    ]
    monthsData.forEach((monthData, mIndex) => {
      const isPaid = mIndex < 2 // Letzte 2 Monate bezahlt
      payments.push({
        id: `90000000-0000-0000-0000-${String(index * 10 + mIndex + 1).padStart(12, '0')}`,
        payerId: rental.stylistId,
        receiverId: salons.find(s => s.id === chairsData.find(c => c.id === rental.chairId)?.salonId)?.ownerId || null,
        rentalId: rental.id,
        type: PaymentType.CHAIR_RENTAL,
        amount: rental.monthlyRent,
        description: `Stuhlmiete ${monthData.name}`,
        periodStart: new Date(monthData.year, monthData.month - 1, 1),
        periodEnd: new Date(monthData.year, monthData.month, 0), // Letzter Tag des Monats
        dueDate: new Date(monthData.year, monthData.month - 1, 1),
        paidAt: isPaid ? new Date(monthData.year, monthData.month - 1, randomInt(1, 5)) : null,
        status: isPaid ? PaymentStatus.PAID : PaymentStatus.PENDING,
      })
    })
  })

  for (const payment of payments) {
    await prisma.payment.upsert({
      where: { id: payment.id },
      update: payment,
      create: payment,
    })
  }
  console.log(`✅ ${payments.length} Payments seeded`)

  // ============================================
  // 10. Seed Platform Settings
  // ============================================

  await prisma.platformSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      companyName: 'NICNOA & CO.',
      supportEmail: 'support@nicnoa.de',
      supportPhone: '+49 30 12345678',
      defaultLanguage: 'de',
      timezone: 'Europe/Berlin',
      currency: 'EUR',
      trialDays: 14,
      primaryColor: '#6366f1',
      smtpHost: 'smtp.sendgrid.net',
      smtpPort: 587,
      smtpUser: 'apikey',
      smtpFrom: 'noreply@nicnoa.de',
      smtpSecure: true,
      // Demo-Modus aktivieren für Entwicklung
      useDemoMode: true,
      demoModeMessage: 'Demo-Modus aktiv - Es werden Beispieldaten angezeigt',
    },
  })
  console.log('✅ Platform Settings seeded (Demo-Modus aktiviert)')

  // ============================================
  // 10.5 Seed Email Templates
  // ============================================

  const emailTemplates = [
    // Auth
    {
      slug: 'welcome',
      name: 'Willkommen',
      description: 'Wird nach der Registrierung gesendet',
      subject: 'Willkommen bei NICNOA, {{name}}! 🎉',
      content: {
        headline: 'Willkommen bei NICNOA!',
        body: 'vielen Dank für deine Registrierung! Wir freuen uns, dich in unserer Community begrüßen zu dürfen. Entdecke jetzt alle Möglichkeiten, die NICNOA dir bietet.',
        buttonText: 'Zum Dashboard',
        footer: 'Bei Fragen stehen wir dir jederzeit zur Verfügung.',
      },
      category: 'auth',
      isSystem: true,
    },
    {
      slug: 'email-verification',
      name: 'E-Mail Bestätigung',
      description: 'Verifikationslink für neue Accounts',
      subject: 'Bitte bestätige deine E-Mail-Adresse',
      content: {
        headline: 'E-Mail bestätigen',
        body: 'um dein Konto zu aktivieren, bestätige bitte deine E-Mail-Adresse, indem du auf den Button unten klickst.',
        buttonText: 'E-Mail bestätigen',
        footer: 'Der Link ist 24 Stunden gültig.',
      },
      category: 'auth',
      isSystem: true,
    },
    {
      slug: 'password-reset',
      name: 'Passwort zurücksetzen',
      description: 'Link zum Zurücksetzen des Passworts',
      subject: 'Dein Passwort-Reset-Link',
      content: {
        headline: 'Passwort zurücksetzen',
        body: 'du hast angefordert, dein Passwort zurückzusetzen. Klicke auf den Button unten, um ein neues Passwort zu vergeben.',
        buttonText: 'Neues Passwort setzen',
        footer: 'Falls du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail.',
      },
      category: 'auth',
      isSystem: true,
    },
    {
      slug: 'magic-link',
      name: 'Magic Link Login',
      description: 'Anmelde-Link ohne Passwort',
      subject: 'Dein Magic Link für NICNOA',
      content: {
        headline: 'Anmeldung per Magic Link',
        body: 'du hast einen Login-Link angefordert. Klicke auf den Button unten, um dich ohne Passwort anzumelden.',
        buttonText: 'Jetzt anmelden',
        footer: 'Falls du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail.',
      },
      category: 'auth',
      isSystem: true,
    },
    // Onboarding
    {
      slug: 'onboarding-submitted',
      name: 'Onboarding eingereicht (Admin)',
      description: 'Benachrichtigt Admin über neuen Antrag',
      subject: 'Neuer Onboarding-Antrag von {{stylistName}}',
      content: {
        headline: 'Neuer Onboarding-Antrag',
        body: 'Ein neuer Stylist hat seinen Onboarding-Antrag eingereicht und wartet auf deine Prüfung.',
        buttonText: 'Antrag prüfen',
        footer: 'Bitte prüfe den Antrag zeitnah.',
      },
      category: 'onboarding',
      isSystem: true,
    },
    {
      slug: 'onboarding-approved',
      name: 'Onboarding genehmigt',
      description: 'Stylist wurde freigeschaltet',
      subject: 'Dein Antrag wurde genehmigt! 🎉',
      content: {
        headline: 'Herzlichen Glückwunsch!',
        body: 'großartige Neuigkeiten! Dein Onboarding-Antrag wurde genehmigt. Du kannst jetzt alle Funktionen von NICNOA nutzen und durchstarten.',
        buttonText: 'Zum Dashboard',
        footer: 'Wir freuen uns auf eine erfolgreiche Zusammenarbeit!',
      },
      category: 'onboarding',
      isSystem: true,
    },
    {
      slug: 'onboarding-rejected',
      name: 'Onboarding abgelehnt',
      description: 'Antrag muss überarbeitet werden',
      subject: 'Dein Antrag benötigt Überarbeitung',
      content: {
        headline: 'Überarbeitung erforderlich',
        body: 'leider konnten wir deinen Onboarding-Antrag noch nicht freigeben. Bitte überprüfe die folgenden Punkte und reiche deinen Antrag erneut ein.',
        buttonText: 'Antrag überarbeiten',
        footer: 'Bei Fragen kannst du uns jederzeit kontaktieren.',
      },
      category: 'onboarding',
      isSystem: true,
    },
    // Subscription
    {
      slug: 'subscription-activated',
      name: 'Abo aktiviert',
      description: 'Bestätigung der Abo-Aktivierung',
      subject: 'Dein {{planName}}-Abo ist jetzt aktiv! 🚀',
      content: {
        headline: 'Abo erfolgreich aktiviert!',
        body: 'dein {{planName}}-Abonnement ist jetzt aktiv. Du hast jetzt Zugriff auf alle Features deines Plans.',
        buttonText: 'Jetzt loslegen',
        footer: 'Vielen Dank für dein Vertrauen!',
      },
      category: 'subscription',
      isSystem: true,
    },
    {
      slug: 'subscription-renewed',
      name: 'Abo verlängert',
      description: 'Bestätigung der automatischen Verlängerung',
      subject: 'Dein Abo wurde erfolgreich verlängert',
      content: {
        headline: 'Abo verlängert',
        body: 'dein Abonnement wurde automatisch verlängert. Die nächste Abrechnung erfolgt am {{nextBillingDate}}.',
        buttonText: 'Abo verwalten',
        footer: 'Vielen Dank, dass du NICNOA nutzt!',
      },
      category: 'subscription',
      isSystem: true,
    },
    {
      slug: 'subscription-expiring',
      name: 'Abo läuft ab',
      description: 'Erinnerung vor Ablauf',
      subject: 'Dein Abo läuft bald ab ⏰',
      content: {
        headline: 'Abo-Erinnerung',
        body: 'dein Abonnement läuft am {{expirationDate}} aus. Verlängere jetzt, um weiterhin alle Funktionen nutzen zu können.',
        buttonText: 'Jetzt verlängern',
        footer: 'Wir würden dich ungern als Kunden verlieren!',
      },
      category: 'subscription',
      isSystem: true,
    },
    {
      slug: 'subscription-expired',
      name: 'Abo abgelaufen',
      description: 'Benachrichtigung nach Ablauf',
      subject: 'Dein Abo ist abgelaufen',
      content: {
        headline: 'Abo abgelaufen',
        body: 'dein Abonnement ist leider abgelaufen. Reaktiviere es jetzt, um weiterhin alle Funktionen nutzen zu können.',
        buttonText: 'Abo reaktivieren',
        footer: 'Deine Daten werden noch 30 Tage gespeichert.',
      },
      category: 'subscription',
      isSystem: true,
    },
    {
      slug: 'payment-failed',
      name: 'Zahlung fehlgeschlagen',
      description: 'Benachrichtigung über fehlgeschlagene Zahlung',
      subject: 'Zahlung fehlgeschlagen - Aktion erforderlich',
      content: {
        headline: 'Zahlung fehlgeschlagen',
        body: 'leider konnten wir die Zahlung von {{amount}} nicht verarbeiten. Bitte aktualisiere deine Zahlungsinformationen.',
        buttonText: 'Zahlung aktualisieren',
        footer: 'Um eine Unterbrechung zu vermeiden, handle bitte schnell.',
      },
      category: 'subscription',
      isSystem: true,
    },
    {
      slug: 'invoice-receipt',
      name: 'Rechnung/Quittung',
      description: 'Zahlungsbestätigung mit Rechnung',
      subject: 'Deine Rechnung #{{invoiceNumber}}',
      content: {
        headline: 'Zahlungsbestätigung',
        body: 'vielen Dank für deine Zahlung! Anbei findest du deine Rechnung.',
        buttonText: 'Rechnung herunterladen',
        footer: 'Diese E-Mail dient als Zahlungsnachweis.',
      },
      category: 'subscription',
      isSystem: true,
    },
    // Referral
    {
      slug: 'referral-invitation',
      name: 'Empfehlungs-Einladung',
      description: 'Einladung über Referral-Link',
      subject: '{{referrerName}} lädt dich zu NICNOA ein! 🎁',
      content: {
        headline: 'Du wurdest eingeladen!',
        body: '{{referrerName}} möchte, dass du Teil der NICNOA Community wirst. Als eingeladenes Mitglied erhältst du exklusive Vorteile.',
        buttonText: 'Kostenlos registrieren',
        footer: 'Diese Einladung ist 30 Tage gültig.',
      },
      category: 'referral',
      isSystem: true,
    },
    {
      slug: 'referral-success',
      name: 'Empfehlung erfolgreich',
      description: 'Belohnung für erfolgreiche Empfehlung',
      subject: 'Glückwunsch! Du hast eine Belohnung verdient! 🎉',
      content: {
        headline: 'Belohnung verdient!',
        body: '{{referredName}} hat sich dank deiner Empfehlung registriert! Als Dankeschön erhältst du: {{rewardDescription}}',
        buttonText: 'Mehr Freunde einladen',
        footer: 'Lade weitere Freunde ein und verdiene mehr!',
      },
      category: 'referral',
      isSystem: true,
    },
    // Booking
    {
      slug: 'booking-confirmation',
      name: 'Terminbestätigung',
      description: 'Bestätigung eines gebuchten Termins',
      subject: 'Dein Termin am {{bookingDate}} ist bestätigt ✅',
      content: {
        headline: 'Termin bestätigt!',
        body: 'dein Termin für {{serviceName}} bei {{stylistName}} am {{bookingDate}} um {{bookingTime}} Uhr ist bestätigt.',
        buttonText: 'Termin verwalten',
        footer: 'Bitte erscheine pünktlich zu deinem Termin.',
      },
      category: 'booking',
      isSystem: true,
    },
    {
      slug: 'booking-reminder',
      name: 'Terminerinnerung',
      description: '24h Erinnerung vor dem Termin',
      subject: 'Erinnerung: Dein Termin morgen um {{bookingTime}} Uhr',
      content: {
        headline: 'Morgen ist es soweit!',
        body: 'wir erinnern dich an deinen Termin für {{serviceName}} bei {{stylistName}} morgen um {{bookingTime}} Uhr.',
        buttonText: 'Termin ansehen',
        footer: 'Kannst du nicht kommen? Bitte sage rechtzeitig ab.',
      },
      category: 'booking',
      isSystem: true,
    },
    {
      slug: 'booking-cancelled',
      name: 'Termin storniert',
      description: 'Bestätigung einer Stornierung',
      subject: 'Dein Termin wurde storniert',
      content: {
        headline: 'Termin storniert',
        body: 'dein Termin für {{serviceName}} am {{bookingDate}} wurde storniert.',
        buttonText: 'Neuen Termin buchen',
        footer: 'Wir würden uns freuen, dich bald wieder zu sehen!',
      },
      category: 'booking',
      isSystem: true,
    },
    // System
    {
      slug: 'new-message',
      name: 'Neue Nachricht',
      description: 'Benachrichtigung über neue Nachricht',
      subject: 'Neue Nachricht von {{senderName}}',
      content: {
        headline: 'Du hast eine neue Nachricht',
        body: '{{senderName}} hat dir eine Nachricht geschickt.',
        buttonText: 'Nachricht lesen',
        footer: 'Du kannst Nachrichtenbenachrichtigungen in den Einstellungen ändern.',
      },
      category: 'system',
      isSystem: true,
    },

    // ============================================
    // NEUE TEMPLATES - Salon-Besitzer
    // ============================================
    {
      slug: 'new-rental-request',
      name: 'Neue Mietanfrage',
      description: 'Stylist möchte einen Platz mieten',
      subject: 'Neue Mietanfrage von {{stylistName}} 💺',
      content: {
        headline: 'Neue Mietanfrage',
        body: '{{stylistName}} hat Interesse an {{chairName}} in deinem Salon. Prüfe jetzt die Bewerbung.',
        buttonText: 'Anfrage prüfen',
        footer: 'Antworte zeitnah, um qualifizierte Stylisten nicht zu verlieren.',
      },
      category: 'rental',
      isSystem: true,
    },
    {
      slug: 'rental-accepted',
      name: 'Bewerbung angenommen',
      description: 'Salon-Besitzer hat Mietanfrage akzeptiert',
      subject: 'Deine Bewerbung wurde angenommen! 🎉',
      content: {
        headline: 'Willkommen im Team!',
        body: 'Großartige Neuigkeiten! {{salonName}} hat deine Bewerbung angenommen. Du kannst jetzt deinen neuen Arbeitsplatz einrichten.',
        buttonText: 'Jetzt loslegen',
        footer: 'Wir freuen uns auf eine erfolgreiche Zusammenarbeit!',
      },
      category: 'rental',
      isSystem: true,
    },
    {
      slug: 'rental-ending-soon',
      name: 'Mietvertrag endet bald',
      description: 'Erinnerung 30 Tage vor Vertragsende',
      subject: 'Dein Mietvertrag endet in {{daysRemaining}} Tagen ⏰',
      content: {
        headline: 'Vertrag läuft aus',
        body: 'Dein Mietvertrag bei {{salonName}} endet am {{endDate}}. Entscheide jetzt, ob du verlängern möchtest.',
        buttonText: 'Vertrag verlängern',
        footer: 'Verlängere rechtzeitig, um deinen Platz zu sichern.',
      },
      category: 'rental',
      isSystem: true,
    },
    {
      slug: 'payment-received',
      name: 'Mietzahlung erhalten',
      description: 'Salon-Besitzer erhält Zahlungsbestätigung',
      subject: 'Zahlung erhalten: {{amount}} von {{stylistName}} 💰',
      content: {
        headline: 'Zahlung eingegangen!',
        body: 'Die Mietzahlung von {{stylistName}} für {{chairName}} ist erfolgreich eingegangen.',
        buttonText: 'Zahlungen verwalten',
        footer: 'Alle Transaktionen findest du in deinem Dashboard.',
      },
      category: 'rental',
      isSystem: true,
    },
    {
      slug: 'new-review-salon',
      name: 'Neue Salon-Bewertung',
      description: 'Kunde hat den Salon bewertet',
      subject: 'Neue {{rating}}-Sterne Bewertung für {{salonName}} ⭐',
      content: {
        headline: 'Neue Bewertung erhalten!',
        body: '{{reviewerName}} hat eine neue Bewertung für deinen Salon hinterlassen.',
        buttonText: 'Bewertung ansehen',
        footer: 'Bewertungen helfen neuen Kunden, dich zu finden.',
      },
      category: 'review',
      isSystem: true,
    },
    {
      slug: 'chair-vacancy',
      name: 'Stuhl wieder frei',
      description: 'Mietvertrag beendet - Platz verfügbar',
      subject: '{{chairName}} ist wieder verfügbar 💺',
      content: {
        headline: 'Platz wieder frei',
        body: 'Der Mietvertrag für {{chairName}} ist beendet. Der Platz steht jetzt für neue Mieter zur Verfügung.',
        buttonText: 'Platz verwalten',
        footer: 'Aktualisiere die Platz-Informationen für neue Interessenten.',
      },
      category: 'rental',
      isSystem: true,
    },
    {
      slug: 'monthly-summary',
      name: 'Monatsbericht',
      description: 'Monatliche Zusammenfassung für Salon-Besitzer',
      subject: 'Dein Monatsbericht für {{month}} {{year}} 📊',
      content: {
        headline: 'Monatsbericht {{month}}',
        body: 'Hier ist dein Überblick über den vergangenen Monat. Analysiere deine Performance und plane voraus.',
        buttonText: 'Bericht ansehen',
        footer: 'Detaillierte Analysen findest du im Dashboard.',
      },
      category: 'report',
      isSystem: true,
    },

    // ============================================
    // NEUE TEMPLATES - Stuhlmieter
    // ============================================
    {
      slug: 'rental-application-sent',
      name: 'Bewerbung versendet',
      description: 'Bestätigung für eingereichte Bewerbung',
      subject: 'Deine Bewerbung bei {{salonName}} wurde versendet 📤',
      content: {
        headline: 'Bewerbung eingereicht!',
        body: 'Deine Bewerbung für {{chairName}} bei {{salonName}} wurde erfolgreich versendet. Der Salon-Besitzer wird benachrichtigt.',
        buttonText: 'Status verfolgen',
        footer: 'Du erhältst eine E-Mail, sobald es eine Entscheidung gibt.',
      },
      category: 'rental',
      isSystem: true,
    },
    {
      slug: 'rental-rejected',
      name: 'Bewerbung abgelehnt',
      description: 'Mietanfrage wurde abgelehnt',
      subject: 'Update zu deiner Bewerbung bei {{salonName}}',
      content: {
        headline: 'Bewerbung nicht erfolgreich',
        body: 'Leider wurde deine Bewerbung bei {{salonName}} nicht angenommen. Lass dich nicht entmutigen - es gibt viele andere tolle Salons!',
        buttonText: 'Weitere Salons entdecken',
        footer: 'Optimiere dein Profil für bessere Chancen.',
      },
      category: 'rental',
      isSystem: true,
    },
    {
      slug: 'rent-payment-due',
      name: 'Miete fällig',
      description: 'Erinnerung an anstehende Mietzahlung',
      subject: 'Mietzahlung von {{amount}} fällig am {{dueDate}} 💳',
      content: {
        headline: 'Miete fällig',
        body: 'Deine monatliche Miete für {{chairName}} ist bald fällig. Stelle sicher, dass die Zahlung rechtzeitig erfolgt.',
        buttonText: 'Jetzt bezahlen',
        footer: 'Pünktliche Zahlungen sichern deinen Platz.',
      },
      category: 'rental',
      isSystem: true,
    },
    {
      slug: 'rent-payment-overdue',
      name: 'Miete überfällig',
      description: 'Mahnung bei überfälliger Zahlung',
      subject: '⚠️ Mietzahlung überfällig - {{daysOverdue}} Tage',
      content: {
        headline: 'Zahlung überfällig',
        body: 'Deine Mietzahlung ist seit {{daysOverdue}} Tagen überfällig. Bitte begleiche den ausstehenden Betrag umgehend.',
        buttonText: 'Jetzt bezahlen',
        footer: 'Bei Zahlungsschwierigkeiten kontaktiere uns bitte.',
      },
      category: 'rental',
      isSystem: true,
    },
    {
      slug: 'new-review-stylist',
      name: 'Neue Stylist-Bewertung',
      description: 'Kunde hat den Stylisten bewertet',
      subject: 'Neue {{rating}}-Sterne Bewertung ⭐',
      content: {
        headline: 'Du wurdest bewertet!',
        body: '{{reviewerName}} hat eine neue Bewertung für dich hinterlassen. Schau dir das Feedback an!',
        buttonText: 'Bewertung ansehen',
        footer: 'Gute Bewertungen bringen mehr Kunden!',
      },
      category: 'review',
      isSystem: true,
    },
    {
      slug: 'customer-no-show',
      name: 'Kunde nicht erschienen',
      description: 'Benachrichtigung bei No-Show',
      subject: 'Kunde nicht erschienen: {{customerName}} ❌',
      content: {
        headline: 'Termin verpasst',
        body: '{{customerName}} ist nicht zum geplanten Termin für {{serviceName}} erschienen.',
        buttonText: 'Buchungen verwalten',
        footer: 'Erwäge Anzahlungen, um No-Shows zu reduzieren.',
      },
      category: 'booking',
      isSystem: true,
    },
    {
      slug: 'weekly-summary',
      name: 'Wochenbericht',
      description: 'Wöchentliche Zusammenfassung für Stylisten',
      subject: 'Dein Wochenbericht: {{weekRange}} 📅',
      content: {
        headline: 'Wochenrückblick',
        body: 'Hier ist dein Überblick über die vergangene Woche. Sieh dir deine Einnahmen und Buchungen an.',
        buttonText: 'Zum Dashboard',
        footer: 'Setze dir Ziele für die kommende Woche!',
      },
      category: 'report',
      isSystem: true,
    },

    // ============================================
    // NEUE TEMPLATES - Admin
    // ============================================
    {
      slug: 'daily-summary',
      name: 'Tagesbericht',
      description: 'Täglicher Report für Administratoren',
      subject: 'Tagesbericht {{date}}: {{totalRevenue}} Umsatz 📊',
      content: {
        headline: 'Tagesbericht',
        body: 'Hier ist dein täglicher Überblick über die Plattform-Aktivitäten.',
        buttonText: 'Dashboard öffnen',
        footer: 'Automatischer täglicher Report.',
      },
      category: 'admin',
      isSystem: true,
    },
    {
      slug: 'security-alert',
      name: 'Sicherheitswarnung',
      description: 'Benachrichtigung bei Sicherheitsvorfällen',
      subject: '🚨 Sicherheitswarnung: {{alertType}}',
      content: {
        headline: 'Sicherheitswarnung',
        body: 'Es wurde ein Sicherheitsvorfall erkannt, der deine sofortige Aufmerksamkeit erfordert.',
        buttonText: 'Details ansehen',
        footer: 'Bei kritischen Vorfällen handeln Sie sofort.',
      },
      category: 'admin',
      isSystem: true,
    },
    {
      slug: 'new-user-registered',
      name: 'Neuer Nutzer registriert',
      description: 'Benachrichtigung über neue Registrierung',
      subject: 'Neuer Nutzer: {{newUserName}} ({{userRole}}) 👤',
      content: {
        headline: 'Neue Registrierung',
        body: 'Ein neuer Nutzer hat sich auf der Plattform registriert.',
        buttonText: 'Nutzer ansehen',
        footer: 'Prüfe ggf. das Profil des neuen Nutzers.',
      },
      category: 'admin',
      isSystem: true,
    },

    // ============================================
    // NEUE TEMPLATES - Dokumente & Account
    // ============================================
    {
      slug: 'document-uploaded',
      name: 'Dokument hochgeladen',
      description: 'Stylist hat ein Dokument eingereicht',
      subject: 'Neues Dokument von {{stylistName}}: {{documentType}} 📄',
      content: {
        headline: 'Neues Dokument',
        body: '{{stylistName}} hat ein neues Dokument hochgeladen, das auf deine Prüfung wartet.',
        buttonText: 'Dokument prüfen',
        footer: 'Prüfe das Dokument zeitnah.',
      },
      category: 'onboarding',
      isSystem: true,
    },
    {
      slug: 'document-approved',
      name: 'Dokument genehmigt',
      description: 'Admin hat Dokument freigegeben',
      subject: 'Dokument genehmigt: {{documentType}} ✅',
      content: {
        headline: 'Dokument genehmigt!',
        body: 'Dein {{documentType}} wurde erfolgreich geprüft und genehmigt.',
        buttonText: 'Weiter im Onboarding',
        footer: 'Ein Schritt näher zur Freischaltung!',
      },
      category: 'onboarding',
      isSystem: true,
    },
    {
      slug: 'document-rejected',
      name: 'Dokument abgelehnt',
      description: 'Admin hat Dokument abgelehnt',
      subject: 'Dokument abgelehnt: {{documentType}} ❌',
      content: {
        headline: 'Dokument nicht akzeptiert',
        body: 'Dein {{documentType}} konnte leider nicht akzeptiert werden. Bitte lade ein neues Dokument hoch.',
        buttonText: 'Neues Dokument hochladen',
        footer: 'Achte auf die Anforderungen für das Dokument.',
      },
      category: 'onboarding',
      isSystem: true,
    },
    {
      slug: 'account-deactivated',
      name: 'Account deaktiviert',
      description: 'Benachrichtigung über Account-Deaktivierung',
      subject: 'Dein NICNOA Account wurde deaktiviert ⚠️',
      content: {
        headline: 'Account deaktiviert',
        body: 'Dein Account wurde deaktiviert. Deine Daten werden noch 30 Tage gespeichert.',
        buttonText: 'Account reaktivieren',
        footer: 'Kontaktiere uns bei Fragen.',
      },
      category: 'account',
      isSystem: true,
    },
    {
      slug: 'chair-rental-confirmation',
      name: 'Mietvertrag bestätigt',
      description: 'Bestätigung für Salon-Besitzer',
      subject: 'Mietvertrag bestätigt: {{stylistName}} mietet {{chairName}} ✅',
      content: {
        headline: 'Mietvertrag aktiv!',
        body: '{{stylistName}} hat den Mietvertrag für {{chairName}} akzeptiert. Das Mietverhältnis beginnt am {{startDate}}.',
        buttonText: 'Mietverhältnis verwalten',
        footer: 'Begrüße deinen neuen Mieter!',
      },
      category: 'rental',
      isSystem: true,
    },
    // Admin Alert Templates
    {
      slug: 'high-churn-alert',
      name: 'Hohe Abwanderungsrate',
      description: 'Warnung bei erhöhter Kündigungsrate',
      subject: '⚠️ Churn-Alert: Abwanderungsrate auf {{churnRate}} gestiegen',
      content: {
        headline: 'Erhöhte Abwanderung erkannt',
        body: 'Die Abwanderungsrate ist im Zeitraum {{period}} auf {{churnRate}} gestiegen. Dies erfordert sofortige Aufmerksamkeit.',
        buttonText: 'Analytics-Dashboard öffnen',
        footer: 'Automatischer Alert basierend auf Churn-Analyse.',
      },
      category: 'admin',
      isSystem: true,
    },
    {
      slug: 'payment-dispute',
      name: 'Zahlungsstreit',
      description: 'Benachrichtigung bei Stripe-Dispute',
      subject: '🚨 Zahlungsstreit: {{amount}} {{currency}} von {{customerName}}',
      content: {
        headline: 'Zahlungsstreit eingegangen',
        body: 'Kunde {{customerName}} hat einen Zahlungsstreit über {{amount}} eingereicht. Eine Antwort ist vor {{responseDeadline}} erforderlich.',
        buttonText: 'In Stripe öffnen',
        footer: 'Beantworte den Dispute rechtzeitig, um Verluste zu vermeiden.',
      },
      category: 'admin',
      isSystem: true,
    },

    // ============================================
    // Salon-Invitation Templates
    // ============================================
    {
      slug: 'salon-invitation',
      name: 'Salon-Einladung (registriert)',
      description: 'Einladung für registrierte Stylisten, einem Salon beizutreten',
      subject: '💼 {{inviterName}} lädt Sie zu {{salonName}} ein',
      content: {
        headline: 'Einladung zum Salon',
        body: '{{inviterName}} möchte, dass Sie als Stuhlmieter bei {{salonName}} arbeiten. Klicken Sie auf den Button, um die Einladung anzunehmen oder abzulehnen.',
        buttonText: 'Einladung ansehen',
        footer: 'Diese Einladung ist 7 Tage gültig.',
      },
      category: 'invitation',
      isSystem: true,
    },
    {
      slug: 'salon-invitation-unregistered',
      name: 'Salon-Einladung (nicht registriert)',
      description: 'Einladung für nicht-registrierte Stylisten',
      subject: '💼 Sie wurden zu {{salonName}} eingeladen!',
      content: {
        headline: 'Werden Sie Teil von {{salonName}}',
        body: '{{inviterName}} lädt Sie ein, als Stuhlmieter bei {{salonName}} zu arbeiten. Registrieren Sie sich kostenlos auf NICNOA, um die Einladung anzunehmen.',
        buttonText: 'Jetzt registrieren',
        footer: 'Nach der Registrierung können Sie die Einladung annehmen.',
      },
      category: 'invitation',
      isSystem: true,
    },
    {
      slug: 'salon-invitation-accepted',
      name: 'Einladung angenommen',
      description: 'Benachrichtigung an Salonbesitzer wenn Einladung angenommen wurde',
      subject: '🎉 {{stylistName}} hat Ihre Einladung angenommen!',
      content: {
        headline: 'Einladung angenommen!',
        body: 'Großartige Neuigkeiten! {{stylistName}} hat Ihre Einladung angenommen und ist jetzt mit {{salonName}} verbunden.',
        buttonText: 'Stylisten verwalten',
        footer: 'Heißen Sie Ihren neuen Stuhlmieter willkommen!',
      },
      category: 'invitation',
      isSystem: true,
    },
    {
      slug: 'salon-invitation-rejected',
      name: 'Einladung abgelehnt',
      description: 'Benachrichtigung an Salonbesitzer wenn Einladung abgelehnt wurde',
      subject: 'Einladung wurde abgelehnt',
      content: {
        headline: 'Einladung abgelehnt',
        body: 'Leider wurde Ihre Einladung an {{stylistEmail}} für {{salonName}} abgelehnt.',
        buttonText: 'Andere Stylisten einladen',
        footer: 'Sie können jederzeit weitere Stylisten einladen.',
      },
      category: 'invitation',
      isSystem: true,
    },
  ]

  for (const template of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { slug: template.slug },
      update: {},
      create: template,
    })
  }
  console.log(`✅ Email Templates seeded: ${emailTemplates.length}`)

  // ============================================
  // 11. Seed Security Logs
  // ============================================

  const securityEvents: Array<{ event: SecurityEventType; status: SecurityEventStatus }> = [
    { event: SecurityEventType.LOGIN, status: SecurityEventStatus.SUCCESS },
    { event: SecurityEventType.LOGIN_FAILED, status: SecurityEventStatus.FAILED },
    { event: SecurityEventType.PASSWORD_CHANGED, status: SecurityEventStatus.SUCCESS },
    { event: SecurityEventType.TWO_FACTOR_ENABLED, status: SecurityEventStatus.SUCCESS },
    { event: SecurityEventType.SUSPICIOUS_ACTIVITY, status: SecurityEventStatus.WARNING },
    { event: SecurityEventType.SESSION_TERMINATED, status: SecurityEventStatus.SUCCESS },
    { event: SecurityEventType.API_KEY_CREATED, status: SecurityEventStatus.SUCCESS },
    { event: SecurityEventType.USER_CREATED, status: SecurityEventStatus.SUCCESS },
    { event: SecurityEventType.PERMISSION_CHANGED, status: SecurityEventStatus.WARNING },
    { event: SecurityEventType.LOGOUT, status: SecurityEventStatus.SUCCESS },
  ]

  const locations = ['Berlin, DE', 'München, DE', 'Hamburg, DE', 'Köln, DE', 'Frankfurt, DE', 'Unknown']
  const devices = ['Chrome / Windows', 'Safari / macOS', 'Firefox / Linux', 'Mobile Safari / iOS', 'Chrome / Android']
  const ips = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.42', '198.51.100.17']

  const securityLogs: Array<{
    id: string
    event: SecurityEventType
    userId: string | null
    userEmail: string
    ipAddress: string | null
    location: string | null
    device: string | null
    status: SecurityEventStatus
    createdAt: Date
  }> = []

  for (let i = 1; i <= 50; i++) {
    const user = randomItem(testUsers)
    const eventData = randomItem(securityEvents)
    const daysAgo = randomInt(0, 30)
    const hoursAgo = randomInt(0, 23)
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - daysAgo)
    createdAt.setHours(createdAt.getHours() - hoursAgo)

    securityLogs.push({
      id: `a0000000-0000-0000-0000-${String(i).padStart(12, '0')}`,
      event: eventData.event,
      userId: user.id,
      userEmail: user.email,
      ipAddress: randomItem(ips),
      location: randomItem(locations),
      device: randomItem(devices),
      status: eventData.status,
      createdAt,
    })
  }

  for (const log of securityLogs) {
    await prisma.securityLog.upsert({
      where: { id: log.id },
      update: log,
      create: log,
    })
  }
  console.log(`✅ ${securityLogs.length} Security Logs seeded`)

  // ============================================
  // 12. Seed API Keys
  // ============================================

  const adminUserId = '00000000-0000-0000-0000-000000000001' // Admin user ID

  const apiKeys = [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      name: 'Production API Key',
      key: 'sk_live_nicnoa_prod_' + 'x'.repeat(32),
      keyPrefix: 'sk_live_',
      isActive: true,
      isTestMode: false,
      permissions: ['read:all', 'write:all'],
      createdById: adminUserId,
      createdAt: new Date('2024-01-15'),
      lastUsedAt: new Date(),
      usageCount: 1234,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
      name: 'Test API Key',
      key: 'sk_test_nicnoa_dev_' + 'y'.repeat(32),
      keyPrefix: 'sk_test_',
      isActive: true,
      isTestMode: true,
      permissions: ['read:all', 'write:all'],
      createdById: adminUserId,
      createdAt: new Date('2024-01-15'),
      lastUsedAt: new Date('2024-12-01'),
      usageCount: 567,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000003',
      name: 'Mobile App Integration',
      key: 'sk_live_nicnoa_mobile_' + 'z'.repeat(28),
      keyPrefix: 'sk_live_',
      isActive: true,
      isTestMode: false,
      permissions: ['read:bookings', 'write:bookings'],
      createdById: adminUserId,
      createdAt: new Date('2024-06-20'),
      lastUsedAt: new Date('2024-12-03'),
      usageCount: 890,
    },
  ]

  for (const apiKey of apiKeys) {
    await prisma.apiKey.upsert({
      where: { id: apiKey.id },
      update: apiKey,
      create: apiKey,
    })
  }
  console.log(`✅ ${apiKeys.length} API Keys seeded`)

  // ============================================
  // 13. Seed System Status
  // ============================================

  const systemStatusData = [
    {
      id: '5371436b-7dee-4e15-95cd-afc9f1101805',
      name: 'API Service',
      status: 'operational',
      description: 'REST API und Endpunkte'
    },
    {
      id: 'f7a59b13-32ee-4111-b48f-d253664ce4ac',
      name: 'Datenbank',
      status: 'operational',
      description: 'Primäre Datenbank und Replikation'
    },
    {
      id: 'a2d60579-ed6e-4d86-88ae-18ab89db527c',
      name: 'Authentifizierung',
      status: 'operational',
      description: 'Login und Benutzerverwaltung'
    },
    {
      id: '717c5d79-ed75-4f2c-b8f9-ec4de58bc711',
      name: 'Buchungssystem',
      status: 'operational',
      description: 'Terminbuchung und -verwaltung'
    },
    {
      id: 'ff6b6a70-559f-40ec-9924-12e5cda2a787',
      name: 'Zahlungsabwicklung',
      status: 'operational',
      description: 'Zahlungsverarbeitung und Abrechnungen'
    }
  ]

  for (const data of systemStatusData) {
    await prisma.systemStatus.upsert({
      where: { id: data.id },
      update: data,
      create: data
    })
  }
  console.log('✅ System Status seeded')

  // ============================================
  // 14. Seed Subscription Plans
  // ============================================

  const subscriptionPlans = [
    // Stylist Plans (Stuhlmieter)
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      name: 'Starter',
      slug: 'stylist-starter',
      description: 'Perfekt für Einsteiger und Teil-Zeit Stylisten',
      planType: PlanType.STYLIST,
      priceMonthly: 29.99,
      priceQuarterly: 80.97, // ~10% Rabatt
      priceYearly: 287.90, // ~20% Rabatt
      features: [
        'Eigenes Profil',
        'Basis-Buchungssystem',
        'Bis zu 50 Kunden',
        'E-Mail Support',
        'Grundlegende Statistiken'
      ],
      maxBookings: 100,
      maxCustomers: 50,
      isActive: true,
      isPopular: false,
      sortOrder: 1,
      trialDays: 14,
    },
    {
      id: 'c0000000-0000-0000-0000-000000000002',
      name: 'Professional',
      slug: 'stylist-professional',
      description: 'Für etablierte Stylisten mit wachsender Kundschaft',
      planType: PlanType.STYLIST,
      priceMonthly: 49.99,
      priceQuarterly: 134.97,
      priceYearly: 479.90,
      features: [
        'Alles aus Starter',
        'Unbegrenzte Kunden',
        'Erweiterte Statistiken',
        'Online-Buchungsseite',
        'SMS-Erinnerungen',
        'Kundenbewertungen',
        'Priority Support'
      ],
      maxBookings: 500,
      maxCustomers: null, // Unbegrenzt
      isActive: true,
      isPopular: true, // Hervorgehoben
      sortOrder: 2,
      trialDays: 14,
    },
    {
      id: 'c0000000-0000-0000-0000-000000000003',
      name: 'Premium',
      slug: 'stylist-premium',
      description: 'Maximale Features für Top-Stylisten',
      planType: PlanType.STYLIST,
      priceMonthly: 79.99,
      priceQuarterly: 215.97,
      priceYearly: 767.90,
      features: [
        'Alles aus Professional',
        'Unbegrenzte Buchungen',
        'Eigene Domain',
        'Marketing-Tools',
        'Automatische Social Media Posts',
        'WhatsApp Integration',
        'Persönlicher Account Manager',
        'API-Zugang'
      ],
      maxBookings: null,
      maxCustomers: null,
      isActive: true,
      isPopular: false,
      sortOrder: 3,
      trialDays: 14,
    },

    // Salon Owner Plans
    {
      id: 'c0000000-0000-0000-0000-000000000004',
      name: 'Small Business',
      slug: 'salon-small',
      description: 'Ideal für kleine Salons mit bis zu 3 Stühlen',
      planType: PlanType.SALON_OWNER,
      priceMonthly: 99.99,
      priceQuarterly: 269.97,
      priceYearly: 959.90,
      features: [
        'Bis zu 3 Stühle verwalten',
        'Stuhlmieter-Management',
        'Basis-Buchhaltung',
        'Terminkalender',
        'Kundenverwaltung',
        'E-Mail Support'
      ],
      maxChairs: 3,
      maxBookings: 500,
      maxCustomers: 500,
      isActive: true,
      isPopular: false,
      sortOrder: 1,
      trialDays: 14,
    },
    {
      id: 'c0000000-0000-0000-0000-000000000005',
      name: 'Business',
      slug: 'salon-business',
      description: 'Für wachsende Salons mit bis zu 8 Stühlen',
      planType: PlanType.SALON_OWNER,
      priceMonthly: 179.99,
      priceQuarterly: 485.97,
      priceYearly: 1727.90,
      features: [
        'Bis zu 8 Stühle verwalten',
        'Alles aus Small Business',
        'Erweiterte Buchhaltung',
        'Team-Kalender',
        'Automatische Rechnungen',
        'Priority Support',
        'Marketing-Automatisierung'
      ],
      maxChairs: 8,
      maxBookings: 2000,
      maxCustomers: 2000,
      isActive: true,
      isPopular: true,
      sortOrder: 2,
      trialDays: 14,
    },
    {
      id: 'c0000000-0000-0000-0000-000000000006',
      name: 'Enterprise',
      slug: 'salon-enterprise',
      description: 'Für große Salons und Salon-Ketten',
      planType: PlanType.SALON_OWNER,
      priceMonthly: 299.99,
      priceQuarterly: 809.97,
      priceYearly: 2879.90,
      features: [
        'Unbegrenzte Stühle',
        'Alles aus Business',
        'Multi-Location Support',
        'Erweiterte Analytics',
        'API-Zugang',
        'White-Label Option',
        'Dedizierter Account Manager',
        'Individuelle Anpassungen'
      ],
      maxChairs: null,
      maxBookings: null,
      maxCustomers: null,
      isActive: true,
      isPopular: false,
      sortOrder: 3,
      trialDays: 30, // Längere Trial für Enterprise
    },
  ]

  for (const plan of subscriptionPlans) {
    await prisma.subscriptionPlan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    })
  }
  console.log(`✅ ${subscriptionPlans.length} Subscription Plans seeded`)

  // ============================================
  // 15. Seed User Referral Profiles
  // ============================================

  // Referral-Profile für Stylisten UND Salon-Besitzer
  const referralProfiles = [
    // Stylisten
    {
      id: 'd0000000-0000-0000-0000-000000000001',
      userId: '00000000-0000-0000-0000-000000000003', // stylist@nicnoa.de
      userRole: 'STYLIST',
      referralCode: 'STYLE-TEST-1234',
      totalReferrals: 5,
      successfulReferrals: 3,
      totalEarnings: 89.97,
      pendingRewards: 1,
      totalReferredRevenue: 449.85,
      totalCommissionEarned: 44.99,
      totalClicks: 127,
      commissionRate: 10,
      isActive: true,
    },
    {
      id: 'd0000000-0000-0000-0000-000000000002',
      userId: '00000000-0000-0000-0000-000000000020', // sarah.mueller@nicnoa.de
      userRole: 'STYLIST',
      referralCode: 'STYLE-SARAH-5678',
      totalReferrals: 3,
      successfulReferrals: 2,
      totalEarnings: 59.98,
      pendingRewards: 0,
      totalReferredRevenue: 299.90,
      totalCommissionEarned: 29.99,
      totalClicks: 85,
      commissionRate: 10,
      isActive: true,
    },
    {
      id: 'd0000000-0000-0000-0000-000000000003',
      userId: '00000000-0000-0000-0000-000000000021', // alex.schmidt@nicnoa.de
      userRole: 'STYLIST',
      referralCode: 'STYLE-ALEX-9012',
      totalReferrals: 8,
      successfulReferrals: 6,
      totalEarnings: 179.94,
      pendingRewards: 2,
      totalReferredRevenue: 899.70,
      totalCommissionEarned: 89.97,
      totalClicks: 234,
      commissionRate: 10,
      isActive: true,
    },
    // Salon-Besitzer
    {
      id: 'd0000000-0000-0000-0000-000000000004',
      userId: '00000000-0000-0000-0000-000000000002', // salon@nicnoa.de
      userRole: 'SALON_OWNER',
      referralCode: 'SALON-ELITE-1234',
      totalReferrals: 12,
      successfulReferrals: 8,
      totalEarnings: 539.92,
      pendingRewards: 2,
      totalReferredRevenue: 3599.52,
      totalCommissionEarned: 539.93,
      totalClicks: 456,
      commissionRate: 15, // Höhere Provision für Salon-Besitzer
      isActive: true,
    },
    {
      id: 'd0000000-0000-0000-0000-000000000005',
      userId: '00000000-0000-0000-0000-000000000010', // salon2@nicnoa.de
      userRole: 'SALON_OWNER',
      referralCode: 'SALON-MARIA-5678',
      totalReferrals: 4,
      successfulReferrals: 3,
      totalEarnings: 269.97,
      pendingRewards: 1,
      totalReferredRevenue: 1799.70,
      totalCommissionEarned: 269.96,
      totalClicks: 189,
      commissionRate: 15,
      isActive: true,
    },
  ]

  for (const profile of referralProfiles) {
    await prisma.userReferralProfile.upsert({
      where: { id: profile.id },
      update: profile,
      create: profile,
    })
  }
  console.log(`✅ ${referralProfiles.length} Referral Profiles seeded (${referralProfiles.filter(p => p.userRole === 'STYLIST').length} Stylisten, ${referralProfiles.filter(p => p.userRole === 'SALON_OWNER').length} Salon-Besitzer)`)

  // ============================================
  // 16. Seed Referrals
  // ============================================

  const referralNow = new Date()
  const thirtyDaysFromNow = new Date(referralNow.getTime() + 30 * 24 * 60 * 60 * 1000)

  const referrals = [
    // === Von Stylisten empfohlen ===
    {
      id: 'e0000000-0000-0000-0000-000000000001',
      referrerId: '00000000-0000-0000-0000-000000000003',
      referrerEmail: 'stylist@nicnoa.de',
      referrerRole: 'STYLIST',
      referredEmail: 'new.stylist1@example.com',
      referredName: 'Anna Neumann',
      referredRole: 'STYLIST',
      code: 'REF-ANNA-2024',
      status: ReferralStatus.CONVERTED,
      invitedAt: new Date('2024-10-15'),
      registeredAt: new Date('2024-10-20'),
      convertedAt: new Date('2024-11-01'),
      rewardedAt: new Date('2024-11-05'),
      expiresAt: new Date('2024-11-15'),
      firstVisitAt: new Date('2024-10-14'),
      rewardType: 'FREE_MONTH',
      rewardValue: 29.99,
      rewardApplied: true,
      totalRevenue: 149.97,
      totalCommission: 14.997,
      commissionRate: 10,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000002',
      referrerId: '00000000-0000-0000-0000-000000000003',
      referrerEmail: 'stylist@nicnoa.de',
      referrerRole: 'STYLIST',
      referredEmail: 'pending.user@example.com',
      referredName: 'Max Wartend',
      code: 'REF-MAX-2024',
      status: ReferralStatus.PENDING,
      invitedAt: new Date('2024-12-01'),
      expiresAt: thirtyDaysFromNow,
      rewardType: 'FREE_MONTH',
      commissionRate: 10,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000003',
      referrerId: '00000000-0000-0000-0000-000000000020', // sarah.mueller
      referrerEmail: 'sarah.mueller@nicnoa.de',
      referrerRole: 'STYLIST',
      referredEmail: 'friend@example.com',
      referredName: 'Freundin Julia',
      referredId: '00000000-0000-0000-0000-000000000022', // julia.wagner
      referredRole: 'STYLIST',
      code: 'REF-FRIEND-2024',
      status: ReferralStatus.REGISTERED,
      invitedAt: new Date('2024-11-20'),
      registeredAt: new Date('2024-11-25'),
      expiresAt: new Date('2024-12-20'),
      firstVisitAt: new Date('2024-11-19'),
      rewardType: 'FREE_MONTH',
      commissionRate: 10,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000004',
      referrerId: '00000000-0000-0000-0000-000000000021', // alex.schmidt
      referrerEmail: 'alex.schmidt@nicnoa.de',
      referrerRole: 'STYLIST',
      referredEmail: 'expired.invite@example.com',
      referredName: 'Abgelaufene Einladung',
      code: 'REF-EXPIRED-2024',
      status: ReferralStatus.EXPIRED,
      invitedAt: new Date('2024-09-01'),
      expiresAt: new Date('2024-10-01'),
      commissionRate: 10,
    },
    // === Von Salon-Besitzern empfohlen ===
    {
      id: 'e0000000-0000-0000-0000-000000000005',
      referrerId: '00000000-0000-0000-0000-000000000002', // salon@nicnoa.de
      referrerEmail: 'salon@nicnoa.de',
      referrerRole: 'SALON_OWNER',
      referredEmail: 'new.salonowner@example.com',
      referredName: 'Peter Müller Salons GmbH',
      referredRole: 'SALON_OWNER',
      code: 'REF-SALON-PETER-2024',
      status: ReferralStatus.REWARDED,
      invitedAt: new Date('2024-09-15'),
      registeredAt: new Date('2024-09-20'),
      convertedAt: new Date('2024-10-01'),
      rewardedAt: new Date('2024-10-15'),
      expiresAt: new Date('2024-10-15'),
      firstVisitAt: new Date('2024-09-14'),
      utmSource: 'email',
      utmMedium: 'referral',
      utmCampaign: 'salon-partner-q4',
      rewardType: 'FREE_MONTH',
      rewardValue: 179.99, // Höherer Wert für Salon-Besitzer Plan
      rewardApplied: true,
      totalRevenue: 1799.88,
      totalCommission: 269.98,
      commissionRate: 15,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000006',
      referrerId: '00000000-0000-0000-0000-000000000002',
      referrerEmail: 'salon@nicnoa.de',
      referrerRole: 'SALON_OWNER',
      referredEmail: 'interested.salon@example.com',
      referredName: 'Beauty World Berlin',
      code: 'REF-SALON-BEAUTY-2024',
      status: ReferralStatus.REGISTERED,
      invitedAt: new Date('2024-11-25'),
      registeredAt: new Date('2024-12-01'),
      expiresAt: thirtyDaysFromNow,
      firstVisitAt: new Date('2024-11-24'),
      rewardType: 'FREE_MONTH',
      commissionRate: 15,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000007',
      referrerId: '00000000-0000-0000-0000-000000000010', // salon2@nicnoa.de - Maria Schneider
      referrerEmail: 'salon2@nicnoa.de',
      referrerRole: 'SALON_OWNER',
      referredEmail: 'stylish.salon@example.com',
      referredName: 'Stylish Cuts München',
      referredRole: 'SALON_OWNER',
      code: 'REF-SALON-MARIA-2024',
      status: ReferralStatus.CONVERTED,
      invitedAt: new Date('2024-10-05'),
      registeredAt: new Date('2024-10-10'),
      convertedAt: new Date('2024-10-20'),
      expiresAt: new Date('2024-11-05'),
      firstVisitAt: new Date('2024-10-04'),
      landingPage: '/register',
      rewardType: 'FREE_MONTH',
      rewardValue: 179.99,
      totalRevenue: 539.97,
      totalCommission: 80.996,
      commissionRate: 15,
    },
  ]

  for (const referral of referrals) {
    await prisma.referral.upsert({
      where: { id: referral.id },
      update: referral,
      create: referral,
    })
  }
  console.log(`✅ ${referrals.length} Referrals seeded`)

  // ============================================
  // 17. Seed Referral Rewards
  // ============================================

  const referralRewards = [
    {
      id: 'f0000000-0000-0000-0000-000000000001',
      userId: '00000000-0000-0000-0000-000000000003', // stylist@nicnoa.de
      referralId: 'e0000000-0000-0000-0000-000000000001',
      rewardType: 'FREE_MONTH',
      rewardValue: 29.99,
      description: '1 Monat gratis für erfolgreiche Empfehlung von Anna Neumann',
      isApplied: true,
      appliedAt: new Date('2024-11-05'),
    },
    {
      id: 'f0000000-0000-0000-0000-000000000002',
      userId: '00000000-0000-0000-0000-000000000020', // sarah.mueller
      referralId: 'e0000000-0000-0000-0000-000000000003',
      rewardType: 'FREE_MONTH',
      rewardValue: 49.99,
      description: 'Belohnung wird nach Abo-Abschluss des Empfohlenen aktiviert',
      isApplied: false,
      expiresAt: new Date('2025-02-25'), // 90 Tage nach Registrierung
    },
  ]

  for (const reward of referralRewards) {
    await prisma.referralReward.upsert({
      where: { id: reward.id },
      update: reward,
      create: reward,
    })
  }
  console.log(`✅ ${referralRewards.length} Referral Rewards seeded`)

  // ============================================
  // 14. Seed Test Conversations & Messages
  // ============================================

  const conversations = [
    // Admin <-> Salon Owner
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      type: 'DIRECT' as const,
      subject: null,
    },
    // Admin <-> Stylist
    {
      id: 'c0000000-0000-0000-0000-000000000002',
      type: 'DIRECT' as const,
      subject: null,
    },
    // Salon Owner <-> Stylist
    {
      id: 'c0000000-0000-0000-0000-000000000003',
      type: 'DIRECT' as const,
      subject: null,
    },
    // Gruppenkonversation: Salon Team
    {
      id: 'c0000000-0000-0000-0000-000000000004',
      type: 'GROUP' as const,
      subject: 'Salon Team Besprechung',
    },
  ]

  for (const conv of conversations) {
    await prisma.conversation.upsert({
      where: { id: conv.id },
      update: conv,
      create: conv,
    })
  }

  // Conversation Participants
  const participants = [
    // Konversation 1: Admin <-> Salon Owner
    { conversationId: 'c0000000-0000-0000-0000-000000000001', userId: '00000000-0000-0000-0000-000000000001', role: 'ADMIN' as const },
    { conversationId: 'c0000000-0000-0000-0000-000000000001', userId: '00000000-0000-0000-0000-000000000002', role: 'MEMBER' as const },
    // Konversation 2: Admin <-> Stylist
    { conversationId: 'c0000000-0000-0000-0000-000000000002', userId: '00000000-0000-0000-0000-000000000001', role: 'ADMIN' as const },
    { conversationId: 'c0000000-0000-0000-0000-000000000002', userId: '00000000-0000-0000-0000-000000000003', role: 'MEMBER' as const },
    // Konversation 3: Salon Owner <-> Stylist
    { conversationId: 'c0000000-0000-0000-0000-000000000003', userId: '00000000-0000-0000-0000-000000000002', role: 'ADMIN' as const },
    { conversationId: 'c0000000-0000-0000-0000-000000000003', userId: '00000000-0000-0000-0000-000000000003', role: 'MEMBER' as const },
    // Konversation 4: Gruppenkonversation
    { conversationId: 'c0000000-0000-0000-0000-000000000004', userId: '00000000-0000-0000-0000-000000000002', role: 'ADMIN' as const },
    { conversationId: 'c0000000-0000-0000-0000-000000000004', userId: '00000000-0000-0000-0000-000000000003', role: 'MEMBER' as const },
    { conversationId: 'c0000000-0000-0000-0000-000000000004', userId: '00000000-0000-0000-0000-000000000020', role: 'MEMBER' as const },
  ]

  for (const p of participants) {
    await prisma.conversationParticipant.upsert({
      where: { 
        conversationId_userId: { 
          conversationId: p.conversationId, 
          userId: p.userId 
        } 
      },
      update: p,
      create: p,
    })
  }

  // Messages
  const messages = [
    // Konversation 1: Admin <-> Salon Owner
    {
      id: 'f0000000-0000-0000-0000-000000000001',
      conversationId: 'c0000000-0000-0000-0000-000000000001',
      senderId: '00000000-0000-0000-0000-000000000001', // Admin
      content: 'Willkommen bei NICNOA! Bei Fragen zur Plattform stehe ich Ihnen gerne zur Verfügung.',
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'f0000000-0000-0000-0000-000000000002',
      conversationId: 'c0000000-0000-0000-0000-000000000001',
      senderId: '00000000-0000-0000-0000-000000000002', // Salon Owner
      content: 'Vielen Dank! Ich habe eine Frage zu den Stuhlmieten. Wie funktioniert die automatische Abrechnung?',
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'f0000000-0000-0000-0000-000000000003',
      conversationId: 'c0000000-0000-0000-0000-000000000001',
      senderId: '00000000-0000-0000-0000-000000000001', // Admin
      content: 'Die Abrechnung erfolgt automatisch am Ende jedes Monats. Sie können die Details unter Einstellungen > Abrechnung einsehen.',
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },

    // Konversation 2: Admin <-> Stylist
    {
      id: 'f0000000-0000-0000-0000-000000000004',
      conversationId: 'c0000000-0000-0000-0000-000000000002',
      senderId: '00000000-0000-0000-0000-000000000001', // Admin
      content: 'Herzlich willkommen auf der NICNOA Plattform! Ihr Onboarding wurde erfolgreich abgeschlossen.',
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'f0000000-0000-0000-0000-000000000005',
      conversationId: 'c0000000-0000-0000-0000-000000000002',
      senderId: '00000000-0000-0000-0000-000000000003', // Stylist
      content: 'Danke! Ich freue mich auf die Zusammenarbeit. Wie finde ich am besten einen passenden Salon?',
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'f0000000-0000-0000-0000-000000000006',
      conversationId: 'c0000000-0000-0000-0000-000000000002',
      senderId: '00000000-0000-0000-0000-000000000001', // Admin
      content: 'Unter "Salon finden" können Sie verfügbare Salons in Ihrer Nähe durchsuchen und Anfragen senden.',
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },

    // Konversation 3: Salon Owner <-> Stylist
    {
      id: 'f0000000-0000-0000-0000-000000000007',
      conversationId: 'c0000000-0000-0000-0000-000000000003',
      senderId: '00000000-0000-0000-0000-000000000002', // Salon Owner
      content: 'Hallo! Ich habe Ihre Bewerbung gesehen. Wann hätten Sie Zeit für ein persönliches Gespräch?',
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'f0000000-0000-0000-0000-000000000008',
      conversationId: 'c0000000-0000-0000-0000-000000000003',
      senderId: '00000000-0000-0000-0000-000000000003', // Stylist
      content: 'Guten Tag! Ich hätte am Mittwoch oder Donnerstag ab 14 Uhr Zeit. Was würde Ihnen besser passen?',
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'f0000000-0000-0000-0000-000000000009',
      conversationId: 'c0000000-0000-0000-0000-000000000003',
      senderId: '00000000-0000-0000-0000-000000000002', // Salon Owner
      content: 'Mittwoch um 15 Uhr wäre perfekt! Ich schicke Ihnen die Adresse.',
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
    {
      id: 'f0000000-0000-0000-0000-000000000010',
      conversationId: 'c0000000-0000-0000-0000-000000000003',
      senderId: '00000000-0000-0000-0000-000000000003', // Stylist
      content: 'Super, das passt mir! Bis Mittwoch dann. 👋',
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    },

    // Konversation 4: Gruppenkonversation
    {
      id: 'f0000000-0000-0000-0000-000000000011',
      conversationId: 'c0000000-0000-0000-0000-000000000004',
      senderId: '00000000-0000-0000-0000-000000000002', // Salon Owner
      content: 'Hallo Team! Kurze Info: Am Samstag ist eine Fortbildung geplant. Bitte gebt mir Bescheid, wer teilnehmen kann.',
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
    {
      id: 'f0000000-0000-0000-0000-000000000012',
      conversationId: 'c0000000-0000-0000-0000-000000000004',
      senderId: '00000000-0000-0000-0000-000000000003', // Stylist
      content: 'Ich bin dabei! Um welche Uhrzeit geht es los?',
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      id: 'f0000000-0000-0000-0000-000000000013',
      conversationId: 'c0000000-0000-0000-0000-000000000004',
      senderId: '00000000-0000-0000-0000-000000000020', // Sarah Müller
      content: 'Ich kann leider nicht, habe schon Kundentermine. 😔',
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: 'f0000000-0000-0000-0000-000000000014',
      conversationId: 'c0000000-0000-0000-0000-000000000004',
      senderId: '00000000-0000-0000-0000-000000000002', // Salon Owner
      content: 'Kein Problem Sarah! Die Fortbildung startet um 10 Uhr. Wir machen danach noch ein gemeinsames Mittagessen. 🍕',
      isSystemMessage: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  ]

  for (const msg of messages) {
    await prisma.message.upsert({
      where: { id: msg.id },
      update: msg,
      create: msg,
    })
  }
  console.log(`✅ ${conversations.length} Conversations & ${messages.length} Messages seeded`)

  // ============================================
  // Summary
  // ============================================

  console.log('\n🎉 Database seeding completed!')
  console.log('=' .repeat(50))
  console.log('📊 Summary:')
  console.log(`   👤 Users: ${testUsers.length} (1 Admin, 5 Salon Owners, 10 Stylists)`)
  console.log(`   🏢 Salons: ${salons.length}`)
  console.log(`   💺 Chairs: ${chairsData.length}`)
  console.log(`   📝 Chair Rentals: ${rentals.length}`)
  console.log(`   👥 Customers: ${customers.length}`)
  console.log(`   📅 Bookings: ${bookings.length}`)
  console.log(`   ⭐ Reviews: ${reviews.length}`)
  console.log(`   💰 Payments: ${payments.length}`)
  console.log(`   🔧 Platform Settings: 1`)
  console.log(`   📧 Email Templates: ${emailTemplates.length}`)
  console.log(`   🛡️ Security Logs: ${securityLogs.length}`)
  console.log(`   🔑 API Keys: ${apiKeys.length}`)
  console.log(`   📦 Subscription Plans: ${subscriptionPlans.length}`)
  console.log(`   🤝 Referral Profiles: ${referralProfiles.length}`)
  console.log(`   🎁 Referrals: ${referrals.length}`)
  console.log(`   💎 Referral Rewards: ${referralRewards.length}`)
  console.log(`   💬 Conversations: ${conversations.length}`)
  console.log(`   📨 Messages: ${messages.length}`)
  console.log('=' .repeat(50))
  console.log('\n🔐 Test Logins (Password: test123):')
  console.log('   Admin:   admin@nicnoa.de')
  console.log('   Salon:   salon@nicnoa.de')
  console.log('   Stylist: stylist@nicnoa.de')
  console.log('\n📋 Referral Test Codes:')
  console.log('   STYLIST-REF  (stylist@nicnoa.de)')
  console.log('   SARAH-2024   (sarah.mueller@nicnoa.de)')
  console.log('   ALEX-HAIR    (alex.schmidt@nicnoa.de)')
}

main()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })
