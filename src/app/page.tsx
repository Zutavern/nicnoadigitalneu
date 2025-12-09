import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { MainNav } from '@/components/layout/main-nav'
import { Hero } from '@/components/sections/hero'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'NICNOA&CO.online - Moderne Salon-Space Verwaltung',
  description: 'Revolutionieren Sie die Art und Weise, wie Salon-Spaces verwaltet werden. Coworking im Beauty-Bereich einfach, effizient und profitabel.',
}

// Revalidate every 5 minutes for fresh data
export const revalidate = 300

interface Testimonial {
  id: string
  name: string
  role: 'STYLIST' | 'SALON_OWNER'
  text: string
  imageUrl: string | null
  company: string | null
}

async function getTestimonials(): Promise<{
  STYLIST: Testimonial[]
  SALON_OWNER: Testimonial[]
}> {
  try {
    const [stylistTestimonials, salonOwnerTestimonials] = await Promise.all([
      prisma.testimonial.findMany({
        where: { isActive: true, role: 'STYLIST' },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          role: true,
          text: true,
          imageUrl: true,
          company: true,
        },
      }),
      prisma.testimonial.findMany({
        where: { isActive: true, role: 'SALON_OWNER' },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          role: true,
          text: true,
          imageUrl: true,
          company: true,
        },
      }),
    ])

    return {
      STYLIST: stylistTestimonials as Testimonial[],
      SALON_OWNER: salonOwnerTestimonials as Testimonial[],
    }
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return { STYLIST: [], SALON_OWNER: [] }
  }
}

export default async function Home() {
  // Daten werden auf dem Server geladen - kein Wasserfall!
  const testimonials = await getTestimonials()

  return (
    <main className="relative min-h-screen">
      <MainNav />
      <Hero />
      <TestimonialsSection testimonials={testimonials} />
      <Footer />
    </main>
  )
}
